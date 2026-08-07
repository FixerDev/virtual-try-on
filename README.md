# AI Virtual Wardrobe Try-On

A launch-ready virtual try-on web app built with Next.js 16, Tailwind CSS v4,
Shadcn UI, Supabase (auth + storage + Postgres), and fal.ai. **Mobile-first but
fully responsive** — native-app feel on phones, a clean two-column layout on
desktop.

Upload (or capture) a photo of yourself and an outfit, pick what to try on, and
generate a high-resolution preview powered by [fal.ai](https://fal.ai).

## Features

- **Accounts & credits**: Email/Password + Google OAuth via Supabase. New users
  get 10 free credits; one credit is consumed per generation (and refunded on
  failure).
- **Responsive UI**: stacked single-column flow on mobile with a sticky bottom
  "Generate Outfit" bar; uploads sit side-by-side and pills go in a row on
  desktop.
- **Camera / gallery upload**: tap the upload cards to open the native device
  picker (camera + gallery) via a plain `accept="image/*"` input.
- **Three touch-friendly options**: *Try Top*, *Try Bottom*, *Try Full Outfit*.
- **Full-screen loading overlay** ("Tailoring your outfit...") with a spinner,
  live status, and cancel.
- **Result view**: full-bleed portrait preview, tap to open a zoomable
  **lightbox**, and a sticky bottom bar with **Save to Photos** (native share
  sheet / download), **Share** (WhatsApp / copy link), and **Report Glitch**.
- **My Closet** (`/closet`): every generated look, stored per-user and
  redownloadable.
- **PWA**: installable manifest (`/manifest.webmanifest`) + icon.
- **Privacy / Terms** pages.
- **Cost optimizations**: client-side resize to ≤1024px on the longest edge
  (reduces megapixels billed), single output image.
- **Server-side proxy** — `/api/try-on` calls fal.ai via `@fal-ai/client`, so
  `FAL_KEY` never reaches the browser.

## Getting started

```bash
npm install
```

### 1. Create `.env.local`

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
FAL_KEY=your_fal_key_here
# optional: pick a different try-on endpoint
# FAL_TRYON_ENDPOINT=fal-ai/fashn/tryon/v1.6
```

`NEXT_PUBLIC_*` values come from **Supabase → Settings → API**; `FAL_KEY` from
your [fal.ai](https://fal.ai) dashboard. The app runs with these blank, but
sign-in, credits, and generation will be unavailable until you fill them in.

### 2. Provision Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor**, paste the contents of `supabase/schema.sql`, and run
   it. This creates the `profiles` / `generations` / `feedback` tables, the
   `vton-images` storage bucket with RLS, credit RPCs, and the auto-profile
   trigger.
3. Enable providers in **Authentication → Sign In / Up**: Email/Password and
   Google. For Google, create an OAuth client ID in the Google Cloud Console and
   paste the Client ID + Secret.
4. Set the **Site URL** (`http://localhost:3000` locally) and add the redirect
   URL `http://localhost:3000/**` in **Authentication → URL Configuration**.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Endpoint & cost

Default endpoint: **`fal-ai/flux-2-lora-gallery/virtual-tryon`** (~$0.02–$0.04
per generation). Prompt-based, so the anti-body-morphing prompts drive garment
application while keeping your body shape, posture, skin tone, and face intact.

Override the endpoint with an env var:

```bash
# .env.local
# fal-ai/fashn/tryon/v1.6                    (higher quality, ~$0.05)
# fal-ai/image-apps-v2/virtual-try-on        (cheapest, no prompt support)
FAL_TRYON_ENDPOINT=fal-ai/flux-2-lora-gallery/virtual-tryon
```

## API

### `POST /api/try-on`

Streams Server-Sent Events. Requires a signed-in session (otherwise `401`), and
deducts one credit via the atomic `use_credit()` RPC (returns `402` when out).

```json
{
  "personImage": "https://.../vton-images/<userId>/<uuid>-person.jpg",
  "garmentImage": "https://.../vton-images/<userId>/<uuid>-outfit.jpg",
  "category": "top | bottom | full",
  "prompt": "optional prompt (used by prompt-based endpoints)"
}
```

Events:

- `{"type":"status","status":{"phase":"queued|processing|completed","message":"..."}}`
- `{"type":"result","result":{"imageUrl":"https://..."}}`
- `{"type":"error","message":"..."}`

The output is re-uploaded to the user's storage folder and a row is written to
`generations` (for My Closet). If the generation fails, the credit is refunded
automatically.
