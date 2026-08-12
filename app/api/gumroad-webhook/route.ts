import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const CREDITS_PER_PURCHASE = 100;

interface ProfileRow {
  id: string;
  email: string | null;
  credits: number;
}

/**
 * Gumroad webhook handler (https://gumroad.com/webhooks).
 *
 * Gumroad sends `application/x-www-form-urlencoded` webhooks. On a "sale"
 * event with `refunded` !== "true", we credit the buyer's TryOutfit account
 * with CREDITS_PER_PURCHASE credits.
 *
 * Configure this endpoint as the webhook URL in your Gumroad product
 * settings. Verify authenticity with a signature check in production.
 */
export async function POST(request: Request) {
  if (!url || !serviceRoleKey) {
    return Response.json(
      { error: "Gumroad webhook is not configured." },
      { status: 500 }
    );
  }

  const admin: SupabaseClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data." }, { status: 400 });
  }

  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const refunded = (formData.get("refunded") as string | null)?.toLowerCase();

  if (!email) {
    return Response.json({ error: "Missing email." }, { status: 400 });
  }

  // Refunds must not credit (or re-credit) the buyer.
  if (refunded === "true") {
    return Response.json({ ok: true, credited: false });
  }

  const { data: profile, error: lookupError } = await admin
    .from("profiles")
    .select("id, email, credits")
    .eq("email", email)
    .maybeSingle();

  if (lookupError) {
    return Response.json(
      { error: "Failed to look up user." },
      { status: 500 }
    );
  }

  if (!profile) {
    return Response.json(
      { error: "No TryOutfit account matches this email." },
      { status: 404 }
    );
  }

  const row = profile as ProfileRow;
  const newBalance = (row.credits ?? 0) + CREDITS_PER_PURCHASE;

  const { error: updateError } = await admin
    .from("profiles")
    .update({ credits: newBalance })
    .eq("email", email);

  if (updateError) {
    return Response.json(
      { error: "Failed to update credits." },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, credited: true, newBalance });
}