"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Shirt, X } from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "How it Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
];

export function MarketingHeader() {
  const { user, openAuth } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0812]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]">
            <Shirt className="size-4" />
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            TryOutfit
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Link
              href="/app"
              className="rounded-full bg-purple-600 px-5 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(147,51,234,0.5)] transition-all hover:bg-purple-500"
            >
              Open App
            </Link>
          ) : (
            <button
              type="button"
              onClick={openAuth}
              className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-white/10"
            >
              Login
            </button>
          )}

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex size-9 items-center justify-center rounded-full border border-white/10 text-white md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-white/10 px-4 py-3 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-lg px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <Link
              href="/app"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-lg bg-purple-600 px-3 py-2 text-center text-sm font-medium text-white"
            >
              Open App
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openAuth();
              }}
              className="mt-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-center text-sm font-medium text-white"
            >
              Login
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
