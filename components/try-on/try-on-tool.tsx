"use client";

import { useCallback, useRef, useState } from "react";
import {
  Download,
  Flag,
  Loader2,
  Lock,
  Share2,
  Shirt,
  Sparkles,
  User,
  WandSparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth-context";
import { GUMROAD_CHECKOUT_URL } from "@/lib/constants";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadBox } from "@/components/try-on/image-upload-box";
import { Lightbox } from "@/components/try-on/lightbox";
import {
  fileToDataUrl,
  isAcceptedImage,
  resizeImage,
} from "@/lib/tryon/crop";
import {
  submitTryOn,
  type TryOnCategory,
  type TryOnResult,
} from "@/lib/tryon/client";

const MAX_FILE_SIZE = 15 * 1024 * 1024;

const PROMPTS: Record<TryOnCategory, string> = {
  top: "Apply ONLY the upper-body top garment from the outfit image. CRITICAL: Maintain exact body shape, posture, skin tone, and face of the person image.",
  bottom:
    "Apply ONLY the lower-body garment (pants/skirt) from the outfit image. CRITICAL: Maintain exact body shape, posture, skin tone, and face of the person image.",
  full: "Apply the full outfit from the garment photo. CRITICAL: Maintain exact body shape, posture, skin tone, and face of the person image.",
};

const MODE_OPTIONS: {
  value: TryOnCategory;
  label: string;
  hint: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "top",
    label: "Try Top",
    hint: "Shirts, jackets, sweaters",
    icon: <Shirt className="size-6" />,
  },
  {
    value: "bottom",
    label: "Try Bottom",
    hint: "Pants, skirts, shorts",
    icon: <Shirt className="size-6 rotate-180" />,
  },
  {
    value: "full",
    label: "Try Full Outfit",
    hint: "Complete look",
    icon: <Sparkles className="size-6" />,
  },
];

interface UploadedImage {
  preview: string;
  send: string;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, base64] = dataUrl.split(",");
  const mime = meta.match(/^data:(.*?);/)?.[1] ?? "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export function TryOnTool() {
  const {
    user,
    profile,
    isConfigured,
    openAuth,
    refreshProfile,
  } = useAuth();

  const [person, setPerson] = useState<UploadedImage | null>(null);
  const [outfit, setOutfit] = useState<UploadedImage | null>(null);
  const [mode, setMode] = useState<TryOnCategory>("top");

  const [view, setView] = useState<"setup" | "result">("setup");
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [result, setResult] = useState<TryOnResult | null>(null);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportMessage, setReportMessage] = useState("");

  const abortRef = useRef<AbortController | null>(null);

  const handleImage = useCallback(
    async (kind: "person" | "outfit", file: File) => {
      if (!isAcceptedImage(file)) {
        toast.error("Unsupported file type", {
          description: "Please upload a PNG, JPG, or WEBP image.",
        });
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File too large", {
          description: "Please upload an image smaller than 15 MB.",
        });
        return;
      }

      try {
        const preview = await fileToDataUrl(file);
        // Resize to max 1024px on the longest edge to save on megapixel cost.
        const { dataUrl: send } = await resizeImage(preview, 1024, 0.92);

        const uploaded: UploadedImage = { preview, send };
        if (kind === "person") setPerson(uploaded);
        else setOutfit(uploaded);

        setView("setup");
        setResult(null);
      } catch {
        toast.error("Could not read the image", {
          description: "The file could not be loaded. Please try another image.",
        });
      }
    },
    []
  );

  const uploadToStorage = useCallback(
    async (userId: string, name: string, dataUrl: string): Promise<string> => {
      if (!supabase) throw new Error("Supabase is not configured.");
      const path = `${userId}/${crypto.randomUUID()}-${name}.jpg`;
      const { error } = await supabase.storage
        .from("vton-images")
        .upload(path, dataUrlToBlob(dataUrl), {
          contentType: "image/jpeg",
          upsert: true,
        });
      if (error) {
        throw new Error(error.message || "Could not upload the image.");
      }
      return supabase.storage.from("vton-images").getPublicUrl(path).data
        .publicUrl;
    },
    []
  );

  const handleGenerate = useCallback(async () => {
    if (!person || !outfit) return;

    if (!isConfigured) {
      toast.error("Supabase is not configured", {
        description:
          "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
      });
      return;
    }
    if (!user) {
      openAuth();
      return;
    }
    if (!profile || profile.credits <= 0) {
      toast.info(
        "You need credits to generate an outfit. Redirecting to checkout..."
      );
      window.open(GUMROAD_CHECKOUT_URL, "_blank", "noopener,noreferrer");
      return;
    }

    const abortController = new AbortController();
    abortRef.current = abortController;

    setResult(null);
    setStatusMessage("Tailoring your outfit...");
    setBusy(true);

    toast.loading("Generating your look...", { id: "try-on-progress" });

    try {
      // Upload both source images to Supabase Storage for permanent URLs.
      const [personUrl, outfitUrl] = await Promise.all([
        uploadToStorage(user.id, "person", person.send),
        uploadToStorage(user.id, "outfit", outfit.send),
      ]);

      const result = await submitTryOn(
        {
          personImage: personUrl,
          garmentImage: outfitUrl,
          category: mode,
          prompt: PROMPTS[mode],
        },
        ({ message }) => setStatusMessage(message),
        abortController.signal
      );

      setResult(result);
      setView("result");
      setBusy(false);
      void refreshProfile();
      toast.success("Your outfit is ready", { id: "try-on-progress" });
    } catch (error) {
      const isAbort =
        error instanceof DOMException && error.name === "AbortError";
      const isOutOfCredits =
        error instanceof Error &&
        error.message.toLowerCase().includes("out of credits");

      setBusy(false);
      if (isAbort) {
        toast.info("Request cancelled", { id: "try-on-progress" });
      } else if (isOutOfCredits) {
        toast.info("Redirecting to checkout...", {
          id: "try-on-progress",
        });
        window.open(GUMROAD_CHECKOUT_URL, "_blank", "noopener,noreferrer");
      } else {
        toast.error("Try-on failed", {
          id: "try-on-progress",
          description:
            error instanceof Error ? error.message : "Something went wrong.",
        });
      }
    } finally {
      abortRef.current = null;
    }
  }, [
    isConfigured,
    user,
    profile,
    person,
    outfit,
    mode,
    uploadToStorage,
    openAuth,
    refreshProfile,
  ]);

  const handleCancel = () => {
    abortRef.current?.abort();
  };

  const handleReset = () => {
    setPerson(null);
    setOutfit(null);
    setResult(null);
    setView("setup");
    setStatusMessage("");
    setLightboxOpen(false);
  };

  const fetchBlob = useCallback(async (url: string): Promise<Blob> => {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Could not download the image.");
    return response.blob();
  }, []);

  const downloadBlob = useCallback((blob: Blob, filename: string) => {
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
  }, []);

  const handleSaveToPhotos = useCallback(async () => {
    if (!result) return;
    try {
      const blob = await fetchBlob(result.imageUrl);
      const file = new File([blob], "virtual-try-on.jpg", {
        type: blob.type || "image/jpeg",
      });

      const canShare =
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] });

      if (canShare) {
        await navigator.share({ files: [file] });
      } else {
        downloadBlob(blob, "virtual-try-on.jpg");
        toast.success("Image downloaded.");
      }
    } catch {
      const anchor = document.createElement("a");
      anchor.href = result.imageUrl;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.download = "virtual-try-on.jpg";
      anchor.click();
    }
  }, [result, fetchBlob, downloadBlob]);

  const handleShare = useCallback(async () => {
    if (!result) return;
    const text = "Check out my AI virtual try-on outfit!";

    if (navigator.share) {
      try {
        const blob = await fetchBlob(result.imageUrl);
        const file = new File([blob], "virtual-try-on.jpg", {
          type: blob.type || "image/jpeg",
        });
        await navigator.share({
          title: "AI Virtual Wardrobe",
          text,
          url: result.imageUrl,
          ...(typeof navigator.canShare === "function" &&
          navigator.canShare({ files: [file] })
            ? { files: [file] }
            : {}),
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    setShareOpen(true);
  }, [result, fetchBlob]);

  const shareToWhatsApp = useCallback(() => {
    if (!result) return;
    const text = `Check out my AI virtual try-on outfit! ${result.imageUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    setShareOpen(false);
  }, [result]);

  const copyLink = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.imageUrl);
      toast.success("Link copied. Paste it into Instagram or any chat.");
    } catch {
      toast.error("Could not copy the link.");
    }
    setShareOpen(false);
  }, [result]);

  const handleReport = useCallback(async () => {
    if (!reportMessage.trim()) {
      toast.error("Please describe the glitch.");
      return;
    }
    try {
      if (supabase && user) {
        await supabase.from("feedback").insert({
          user_id: user.id,
          message: reportMessage.trim(),
        });
      }
      toast.success("Thanks! Our team will look into it.");
    } catch {
      toast.error("Could not submit your report.");
    }
    setReportMessage("");
    setReportOpen(false);
  }, [reportMessage, user]);

  const canGenerate = Boolean(person && outfit) && !busy;

  if (view === "result" && result) {
    return (
      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-between px-4 pb-3 pt-[max(env(safe-area-inset-top),1.25rem)] sm:px-6">
          <Button variant="ghost" className="gap-2" onClick={handleReset}>
            <X className="size-4" />
            New Look
          </Button>
          <span className="text-xs font-medium text-muted-foreground">
            Your result
          </span>
        </header>

        <main className="flex flex-1 flex-col items-center gap-3 px-2 sm:px-6">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="relative block w-full max-w-md overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 text-left"
            aria-label="Open full-size preview"
          >
            <div className="aspect-[3/4] w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.imageUrl}
                alt="Your virtual try-on result"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[11px] text-white backdrop-blur">
              <Sparkles className="size-3" />
              Tap to expand
            </span>
          </button>
        </main>

        <footer className="sticky bottom-0 border-t border-neutral-800 bg-background/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-md flex-col gap-2 px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3 sm:max-w-5xl sm:flex-row sm:items-center">
            <Button
              size="lg"
              className="h-14 w-full gap-2 text-base sm:flex-1"
              onClick={handleSaveToPhotos}
            >
              <Download className="size-5" />
              Save to Photos
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="h-14 w-full gap-2 text-base sm:flex-1"
              onClick={handleShare}
            >
              <Share2 className="size-5" />
              Share
            </Button>
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Flag className="size-3.5" />
              Report Glitch
            </button>
          </div>
        </footer>

        {lightboxOpen && (
          <Lightbox
            src={result.imageUrl}
            alt="Full-size virtual try-on result"
            onClose={() => setLightboxOpen(false)}
          />
        )}

        <ShareSheet
          open={shareOpen}
          onOpenChange={setShareOpen}
          onWhatsApp={shareToWhatsApp}
          onCopy={copyLink}
        />

        <Dialog open={reportOpen} onOpenChange={setReportOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Report a glitch</DialogTitle>
              <DialogDescription>
                Tell us what went wrong with this result.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={reportMessage}
              onChange={(event) => setReportMessage(event.target.value)}
              placeholder="e.g. the garment looks distorted on the left sleeve..."
              rows={4}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setReportOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleReport}>Submit Report</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex flex-col gap-1 px-4 pb-4 pt-[max(env(safe-area-inset-top),1.25rem)] sm:px-6 sm:pt-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Try on outfits with AI
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Take a photo of yourself and an outfit to preview a new look.
        </p>
      </header>

      <main className="flex flex-1 flex-col gap-12 px-4 pb-32 sm:px-6">
        <section>
          <SectionHeader step="1" title="Upload your photos" />
          <div className="grid gap-4 md:grid-cols-2">
            <ImageUploadBox
              title="Add your photo"
              description="A clear, front-facing photo"
              icon={<User className="size-6" />}
              image={person?.preview ?? null}
              onImageSelect={(file) => handleImage("person", file)}
              onRemove={() => setPerson(null)}
            />
            <ImageUploadBox
              title="Add the outfit"
              description="The garment you want to try on"
              icon={<Shirt className="size-6" />}
              image={outfit?.preview ?? null}
              onImageSelect={(file) => handleImage("outfit", file)}
              onRemove={() => setOutfit(null)}
            />
          </div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
            <Lock className="size-3" />
            🔒 Your face & body photos are encrypted and private.
          </p>
        </section>

        <section>
          <SectionHeader step="2" title="What would you like to try?" />
          <div className="flex flex-col gap-3 md:grid md:grid-cols-3">
            {MODE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMode(option.value)}
                aria-pressed={mode === option.value}
                className={cn(
                  "flex items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-colors",
                  mode === option.value
                    ? "border-primary bg-primary text-primary-foreground shadow-lg"
                    : "border-neutral-800 bg-card text-foreground active:bg-muted"
                )}
              >
                <span
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-full",
                    mode === option.value
                      ? "bg-primary-foreground/20"
                      : "bg-neutral-800"
                  )}
                >
                  {option.icon}
                </span>
                <span className="flex flex-col">
                  <span className="text-base font-semibold">{option.label}</span>
                  <span
                    className={cn(
                      "text-xs",
                      mode === option.value
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground"
                    )}
                  >
                    {option.hint}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-800 bg-background/90 backdrop-blur">
        <div className="mx-auto w-full max-w-5xl px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 sm:px-6">
          <Button
            size="lg"
            className="h-14 w-full gap-2 text-base"
            disabled={!canGenerate}
            onClick={handleGenerate}
          >
            {busy ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <WandSparkles className="size-5" />
            )}
            Generate Outfit
          </Button>
          {!canGenerate && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Add a photo of you and the outfit to continue
            </p>
          )}
        </div>
      </footer>

      {busy && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background/95 px-8 backdrop-blur-sm">
          <div className="relative">
            <Loader2 className="size-16 animate-spin text-primary" />
            <Sparkles className="absolute inset-0 m-auto size-6 text-primary" />
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <p className="text-lg font-semibold">Tailoring your outfit...</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              {statusMessage}
            </p>
          </div>
          <Button
            variant="ghost"
            size="lg"
            className="gap-2 text-muted-foreground"
            onClick={handleCancel}
          >
            <X className="size-4" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ step, title }: { step: string; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
        {step}
      </span>
      <h2 className="text-base font-bold">{title}</h2>
    </div>
  );
}

function ShareSheet({
  open,
  onOpenChange,
  onWhatsApp,
  onCopy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWhatsApp: () => void;
  onCopy: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Share your look</DialogTitle>
          <DialogDescription>
            Share the result with friends.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Button size="lg" variant="outline" className="w-full" onClick={onWhatsApp}>
            <span className="font-semibold text-emerald-400">WhatsApp</span>
          </Button>
          <Button size="lg" variant="outline" className="w-full" onClick={onCopy}>
            Copy link (Instagram & others)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
