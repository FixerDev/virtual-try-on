"use client";

import { Zap } from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { GUMROAD_CHECKOUT_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function OutOfCreditsModal() {
  const { outOfCreditsOpen, closeOutOfCredits } = useAuth();

  return (
    <Dialog open={outOfCreditsOpen} onOpenChange={(open) => !open && closeOutOfCredits()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary sm:mx-0">
            <Zap className="size-5" />
          </div>
          <DialogTitle className="text-center sm:text-left">
            You need credits
          </DialogTitle>
          <DialogDescription className="text-center sm:text-left">
            You need at least 1 credit to generate an outfit. Purchase a credit
            pack to keep creating.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              closeOutOfCredits();
              window.open(GUMROAD_CHECKOUT_URL, "_blank", "noopener,noreferrer");
            }}
          >
            Get 100 Credits ($19)
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={closeOutOfCredits}
          >
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
