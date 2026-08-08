"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, GalleryVerticalEnd, Loader2, LogOut, Shirt, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(/[@\s]+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
      {initials || "?"}
    </span>
  );
}

export function SiteHeader() {
  const { user, profile, loading, isConfigured, openAuth, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0812]/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-3 px-4 sm:px-6">
        <Link href="/app" className="flex min-w-0 items-center gap-2 font-bold">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]">
            <Shirt className="size-4" />
          </span>
          <span className="truncate text-sm text-white sm:text-base">
            TryOutfit
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          {isConfigured && !loading && user && (
            <Badge
              variant="secondary"
              className={cn(
                "gap-1.5 px-2.5 py-1 text-xs",
                (profile?.credits ?? 0) === 0 && "text-amber-400"
              )}
            >
              <Zap className="size-3.5 fill-current" />
              {profile?.credits ?? 0} Credits
            </Badge>
          )}

          {loading ? (
            <span className="flex size-9 items-center justify-center">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </span>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-full border border-border bg-card p-1 pr-2 transition-colors hover:border-primary/50"
                  aria-label="Account menu"
                >
                  <Avatar name={user.email ?? user.id} />
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="text-xs font-normal text-muted-foreground">
                    Signed in as
                  </span>
                  <span className="truncate">{user.email ?? user.id}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/closet">
                    <GalleryVerticalEnd className="size-4" />
                    My Closet
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                  <LogOut className="size-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={openAuth}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
