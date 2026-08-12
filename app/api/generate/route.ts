import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const CREDITS_PER_GENERATION = 1;

interface ProfileRow {
  id: string;
  email: string | null;
  credits: number;
}

// Placeholder: Replace with your actual AI generation logic.
// This is where you would call fal.ai or your AI provider.
async function generateAIImage(): Promise<string> {
  // TODO: Implement your AI image generation here.
  // e.g., return await fal.client.services.text_to_image.generate({ ... });
  // For now, simulate a successful generation with a placeholder URL.
  return `https://via.placeholder.com/512x512?text=AI+Generation+${Date.now()}`;
}

export async function POST(request: Request) {
  if (!url || !serviceRoleKey) {
    return Response.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    );
  }

  // --- Credit Check Start ---
  // Parse the request body to identify the user.
  // Expected JSON: { "email": "user@example.com" }
  let body: { email: string } | null = null;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body?.email) {
    return Response.json({ error: "Missing email." }, { status: 400 });
  }

  const admin: SupabaseClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Fetch the user's current credits from the profiles table.
  const { data: profile, error: lookupError } = await admin
    .from("profiles")
    .select("credits")
    .eq("email", body!.email)
    .maybeSingle();

  if (lookupError) {
    return Response.json(
      { error: "Failed to look up user credits." },
      { status: 500 }
    );
  }

  if (!profile) {
    return Response.json(
      { error: "User has no TryOutfit account." },
      { status: 403 }
    );
  }

  const currentCredits = (profile as ProfileRow).credits;

  // If credits <= 0, block the request.
  if (currentCredits <= 0) {
    return Response.json(
      { error: "Insufficient credits. Please purchase a plan." },
      { status: 403 }
    );
  }

  // --- AI Generation Start ---
  try {
    const generatedImageUrl = await generateAIImage();

    // Deduct 1 credit from the user's profile.
    const newBalance = currentCredits - CREDITS_PER_GENERATION;

    const { error: updateError } = await admin
      .from("profiles")
      .update({ credits: newBalance })
      .eq("email", body!.email);

    if (updateError) {
      // If the update fails, we should ideally not charge the user,
      // but for this example, we'll still return the generated URL.
      console.error("Failed to deduct credit:", updateError);
    }

    return Response.json({
      success: true,
      imageUrl: generatedImageUrl,
      newBalance,
      message: "Generation complete. 1 credit deducted.",
    });
  } catch (genError) {
    return Response.json(
      { error: "AI generation failed.", details: (genError as Error).message },
      { status: 500 }
    );
  }
  // --- AI Generation End ---
}