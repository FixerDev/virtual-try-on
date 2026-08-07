import { createFalClient } from "@fal-ai/client";
import type { QueueStatus } from "@fal-ai/client";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Default endpoint. `fal-ai/flux-2-lora-gallery/virtual-tryon` runs for
 * roughly $0.02-$0.04 per generation and supports prompt-based garment
 * application. Override with FAL_TRYON_ENDPOINT in `.env.local`:
 *   - fal-ai/fashn/tryon/v1.6   (higher quality, ~$0.05)
 *   - fal-ai/image-apps-v2/virtual-try-on  (no prompt support)
 */
const DEFAULT_ENDPOINT = "fal-ai/flux-2-lora-gallery/virtual-tryon";
const TRYON_ENDPOINT = process.env.FAL_TRYON_ENDPOINT || DEFAULT_ENDPOINT;

type EndpointKind = "fashn" | "flux" | "image-apps";
const ENDPOINT_KIND: EndpointKind = TRYON_ENDPOINT.includes("fashn")
  ? "fashn"
  : TRYON_ENDPOINT.includes("flux-2-lora-gallery")
    ? "flux"
    : "image-apps";

type Category = "top" | "bottom" | "full";

interface TryOnRequestBody {
  personImage: string;
  garmentImage: string;
  category: Category;
  prompt?: string;
}

/** Source of truth for the anti-body-morphing prompts, used by prompt-based endpoints. */
const PROMPTS: Record<Category, string> = {
  top: "Apply ONLY the upper-body top garment from the outfit image. CRITICAL: Maintain exact body shape, posture, skin tone, and face of the person image.",
  bottom:
    "Apply ONLY the lower-body garment (pants/skirt) from the outfit image. CRITICAL: Maintain exact body shape, posture, skin tone, and face of the person image.",
  full: "Apply the full outfit from the garment photo. CRITICAL: Maintain exact body shape, posture, skin tone, and face of the person image.",
};

const CATEGORY_MAP: Record<Category, "tops" | "bottoms" | "one-pieces"> = {
  top: "tops",
  bottom: "bottoms",
  full: "one-pieces",
};

const encoder = new TextEncoder();

function isDataUrl(value: string): boolean {
  return /^data:image\/(png|jpeg|webp);base64,/.test(value);
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function buildInput(body: TryOnRequestBody): Record<string, unknown> {
  switch (ENDPOINT_KIND) {
    case "fashn":
      return {
        model_image: body.personImage,
        garment_image: body.garmentImage,
        category: CATEGORY_MAP[body.category],
        garment_photo_type: "auto",
        mode: "quality",
        num_samples: 1,
        output_format: "png",
        moderation_level: "permissive",
      };
    case "flux":
      return {
        image_urls: [body.personImage, body.garmentImage],
        prompt: body.prompt || PROMPTS[body.category],
        num_images: 1,
        output_format: "jpeg",
        acceleration: "regular",
        num_inference_steps: 30,
        enable_safety_checker: true,
      };
    default:
      return {
        person_image_url: body.personImage,
        clothing_image_url: body.garmentImage,
        preserve_pose: true,
      };
  }
}

function statusLabel(
  status: QueueStatus
): { phase: "queued" | "processing"; message: string } {
  if (status.status === "IN_QUEUE") {
    return {
      phase: "queued",
      message:
        status.queue_position > 0
          ? `In queue, position ${status.queue_position}`
          : "Queued for processing",
    };
  }
  return {
    phase: "processing",
    message: "Tailoring your outfit...",
  };
}

export async function POST(request: Request) {
  if (!process.env.FAL_KEY) {
    return Response.json(
      { error: "FAL_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  const supabase = await createClient();
  if (!supabase) {
    return Response.json(
      { error: "Supabase is not configured on the server." },
      { status: 500 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json(
      { error: "You must be signed in to generate an outfit." },
      { status: 401 }
    );
  }

  let body: TryOnRequestBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  const { personImage, garmentImage, category, prompt } = body;

  if (!personImage || !garmentImage) {
    return Response.json(
      { error: "Both a person photo and an outfit photo are required." },
      { status: 400 }
    );
  }
  if (!isHttpUrl(personImage) && !isDataUrl(personImage)) {
    return Response.json(
      { error: "personImage must be a public image URL." },
      { status: 400 }
    );
  }
  if (!isHttpUrl(garmentImage) && !isDataUrl(garmentImage)) {
    return Response.json(
      { error: "garmentImage must be a public image URL." },
      { status: 400 }
    );
  }
  if (!(category in PROMPTS)) {
    return Response.json(
      { error: "category must be one of: top, bottom, full." },
      { status: 400 }
    );
  }
  if (ENDPOINT_KIND === "flux" && !prompt) {
    return Response.json(
      { error: "A prompt is required for this endpoint." },
      { status: 400 }
    );
  }

  // Atomic credit deduction. Returns false when the user is out of credits.
  const { data: credited, error: creditError } = await supabase.rpc(
    "use_credit"
  );
  if (creditError || credited !== true) {
    return Response.json(
      { error: "You're out of credits. Add more to keep trying on outfits." },
      { status: 402 }
    );
  }

  const client = createFalClient({
    credentials: process.env.FAL_KEY,
  });

  const input = buildInput(body);

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      const send = (data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          closed = true;
        }
      };

      const finish = (error?: string) => {
        if (error) send({ type: "error", message: error });
        if (!closed) {
          try {
            controller.close();
          } catch {
            // stream may already be closed by the client
          }
        }
      };

      (async () => {
        try {
          send({
            type: "status",
            status: {
              phase: "queued",
              message: "Starting virtual try-on...",
            },
          });

          const result = await client.subscribe(TRYON_ENDPOINT, {
            input,
            logs: true,
            pollInterval: 750,
            abortSignal: request.signal,
            onQueueUpdate: (status) => {
              const { phase, message } = statusLabel(status);
              const logs =
                "logs" in status
                  ? (status.logs?.map((log) => log.message) ?? [])
                  : [];
              send({
                type: "status",
                status: {
                  phase,
                  message,
                  logs,
                  queuePosition:
                    "queue_position" in status
                      ? status.queue_position
                      : undefined,
                },
              });
            },
          });

          const images = result.data?.images ?? [];
          if (images.length === 0) {
            throw new Error("The model finished but returned no images.");
          }

          send({
            type: "status",
            status: {
              phase: "completed",
              message: "Outfit generated successfully.",
            },
          });

          const outputUrl = images[0].url;

          // Persist the output in Supabase Storage + history for "My Closet".
          let storedUrl = outputUrl;
          try {
            const response = await fetch(outputUrl);
            const blob = await response.blob();
            const path = `${user.id}/${crypto.randomUUID()}-result.jpg`;
            const { error: uploadError } = await supabase.storage
              .from("vton-images")
              .upload(path, blob, {
                contentType: blob.type || "image/jpeg",
                upsert: true,
              });
            if (!uploadError) {
              storedUrl = supabase.storage
                .from("vton-images")
                .getPublicUrl(path).data.publicUrl;
            }

            await supabase.from("generations").insert({
              user_id: user.id,
              person_image_url: personImage,
              outfit_image_url: garmentImage,
              output_image_url: storedUrl,
              category,
              prompt: prompt ?? null,
            });
          } catch {
            // Persisting is best-effort; the result still streams to the client.
          }

          send({
            type: "result",
            result: {
              imageUrl: storedUrl,
              contentType: images[0].content_type,
            },
          });
          finish();
        } catch (error) {
          // Refund the credit since the generation failed.
          try {
            await supabase.rpc("refund_credit");
          } catch {
            // ignore refund failures
          }

          const message =
            error instanceof Error
              ? error.message
              : "Unexpected server error while generating the outfit.";

          const isTimeout =
            message.toLowerCase().includes("timeout") ||
            message.toLowerCase().includes("aborted") ||
            message.toLowerCase().includes("timed out");

          finish(
            isTimeout
              ? "The request timed out. Please try again."
              : message
          );
        }
      })();
    },
    cancel() {
      // Cleaned up when the client disconnects.
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}


