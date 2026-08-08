import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-white/10 bg-[#0a0812] py-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 px-4 text-xs text-white/50 sm:flex-row sm:px-6">
        <p>© {new Date().getFullYear()} TryOutfit.online</p>
        <nav className="flex items-center gap-4">
          <Link href="/privacy" className="transition-colors hover:text-white">
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-white">
            Terms of Service
          </Link>
          <Link href="/refund" className="transition-colors hover:text-white">
            Refund Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
