import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Download, Lock, Sparkles } from "lucide-react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My Closet",
};

export const dynamic = "force-dynamic";

interface Generation {
  id: string;
  category: "top" | "bottom" | "full";
  output_image_url: string;
  person_image_url: string;
  outfit_image_url: string;
  created_at: string;
}

export default async function ClosetPage() {
  const supabase = await createClient();
  if (!supabase) {
    return <NotConfigured />;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data } = await supabase
    .from("generations")
    .select(
      "id, category, output_image_url, person_image_url, outfit_image_url, created_at"
    )
    .order("created_at", { ascending: false });

  const generations = (data ?? []) as Generation[];

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
          <header className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              My Closet
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Every look you&apos;ve generated, saved to your account.
            </p>
          </header>

      {generations.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-neutral-800 py-20 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-6" />
          </span>
          <div>
            <p className="font-semibold">No looks yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Generate your first try-on to see it here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {generations.map((item) => (
            <figure
              key={item.id}
              className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900"
            >
              <div className="aspect-[3/4] w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.output_image_url}
                  alt={`Generated ${item.category} outfit`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-3">
                <span className="rounded-full bg-black/50 px-2 py-0.5 text-[11px] capitalize text-white backdrop-blur">
                  {item.category}
                </span>
                <a
                  href={item.output_image_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download this look"
                  className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
                >
                  <Download className="size-4" />
                </a>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function NotConfigured() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-3 px-4 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-neutral-800 text-muted-foreground">
        <Lock className="size-6" />
      </span>
      <p className="font-semibold">Supabase is not configured</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to
        .env.local to use this page.
      </p>
    </div>
  );
}

