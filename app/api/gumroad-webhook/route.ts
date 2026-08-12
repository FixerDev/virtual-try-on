import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GUMROAD_SELLER_ID = process.env.GUMROAD_SELLER_ID;

const CREDITS_PER_PURCHASE = 100;

interface ProfileRow {
  id: string;
  email: string | null;
  credits: number;
}

export async function POST(request: Request) {
  if (!url || !serviceRoleKey) {
    return Response.json(
      { error: "Gumroad webhook is not configured." },
      { status: 500 }
    );
  }

  // --- NEW: Seller ID validation ---
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data." }, { status: 400 });
  }

  const sellerId = formData.get("seller_id") as string | null;
  // Strict comparison against the env var
  if (sellerId !== GUMROAD_SELLER_ID) {
    return Response.json(
      { error: "Unauthorized seller." },
      { status: 401 }
    );
  }
  // --------------------------------

  let formDataBody: FormData;
  try {
    formDataBody = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data." }, { status: 400 });
  }

  const email = (formDataBody.get("email") as string | null)?.trim().toLowerCase();
  const refunded = (formDataBody.get("refunded") as string | null)?.toLowerCase();

  if (!email) {
    return Response.json({ error: "Missing email." }, { status: 400 });
  }

  // Refunds must not credit (or re-credit) the buyer.
  if (refunded === "true") {
    return Response.json({ ok: true, credited: false });
  }

  const admin: SupabaseClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

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