"use client";

import { ZoomIn, X } from "lucide-react";

interface LightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export function Lightbox({ src, alt, onClose }: LightboxProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-black/95 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Full-size result image"
    >
      <div className="flex items-center justify-between px-4 pb-2 pt-[max(env(safe-area-inset-top),1rem)]">
        <span className="flex items-center gap-1.5 text-xs text-neutral-400">
          <ZoomIn className="size-4" />
          Pinch or scroll to zoom
        </span>
        <button
          type="button"
          aria-label="Close preview"
          onClick={onClose}
          className="flex size-10 items-center justify-center rounded-full border border-neutral-700 text-white transition-colors hover:bg-neutral-800"
        >
          <X className="size-5" />
        </button>
      </div>

      <div
        className="flex flex-1 items-start justify-center overflow-auto p-4"
        onClick={(event) => event.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="h-auto w-full max-w-none rounded-lg"
        />
      </div>

      <div className="pb-[max(env(safe-area-inset-bottom),1rem)] pt-2 text-center text-xs text-neutral-500">
        Tap anywhere to close
      </div>
    </div>
  );
}
