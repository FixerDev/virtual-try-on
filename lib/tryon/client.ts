export type TryOnCategory = "top" | "bottom" | "full";

export interface TryOnPayload {
  personImage: string;
  garmentImage: string;
  category: TryOnCategory;
  prompt: string;
}

export interface TryOnStatusUpdate {
  phase: "queued" | "processing" | "completed";
  message: string;
  queuePosition?: number;
  logs?: string[];
}

export interface TryOnResult {
  imageUrl: string;
  contentType?: string;
}

type StreamEvent =
  | { type: "status"; status: TryOnStatusUpdate }
  | { type: "result"; result: TryOnResult }
  | { type: "error"; message: string };

export class TryOnError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TryOnError";
  }
}

function parseSseEvent(buffer: string): StreamEvent | null {
  const lines = buffer.split("\n");
  const dataLines = lines
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim());

  if (dataLines.length === 0) return null;

  const payload = dataLines.join("\n");
  try {
    return JSON.parse(payload) as StreamEvent;
  } catch {
    return null;
  }
}

/**
 * Submits a try-on request to the `/api/try-on` proxy route and parses the
 * Server-Sent Events stream, invoking `onStatus` for every progress update.
 * Resolves with the generated image URL once the job completes.
 */
export async function submitTryOn(
  payload: TryOnPayload,
  onStatus: (status: TryOnStatusUpdate) => void,
  signal?: AbortSignal
): Promise<TryOnResult> {
  const response = await fetch("/api/try-on", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok || !response.body) {
    let message = `Request failed with status ${response.status}.`;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new TryOnError(message);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let receivedResult: TryOnResult | null = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let boundary: number;
      while ((boundary = buffer.indexOf("\n\n")) !== -1) {
        const chunk = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);

        const event = parseSseEvent(chunk);
        if (!event) continue;

        if (event.type === "status") {
          onStatus(event.status);
        } else if (event.type === "result") {
          receivedResult = event.result;
        } else if (event.type === "error") {
          throw new TryOnError(event.message);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (!receivedResult) {
    throw new TryOnError("The request ended without producing a result.");
  }

  return receivedResult;
}
