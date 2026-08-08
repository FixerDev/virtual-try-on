import Link from "next/link";
import { Shirt } from "lucide-react";

const LEGAL_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Refund Policy", href: "/refund" },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0812]">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 text-white">
              <Shirt className="size-4" />
            </span>
            <span className="text-base font-bold tracking-tight text-white">
              TryOutfit.online
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-white/60 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="mt-8 text-center text-xs text-white/40 sm:text-left">
          © 2026 TryOutfit.online. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
