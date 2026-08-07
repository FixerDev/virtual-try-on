"use client";

import { useId, useRef, useState } from "react";
import { Camera, Check, RefreshCcw, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface ImageUploadBoxProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string | null;
  onImageSelect: (file: File) => void;
  onRemove: () => void;
  className?: string;
}

export function ImageUploadBox({
  title,
  description,
  icon,
  image,
  onImageSelect,
  onRemove,
  className,
}: ImageUploadBoxProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (file) onImageSelect(file);
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          handleFile(event.dataTransfer.files?.[0]);
        }}
        className={cn(
          "relative block aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-2xl border bg-neutral-900 transition-colors",
          dragOver
            ? "border-primary"
            : "border-neutral-800 hover:border-neutral-700"
        )}
      >
        {image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute right-2 top-2 flex gap-2">
              <button
                type="button"
                aria-label="Replace image"
                className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-neutral-900/80 text-white backdrop-blur transition-colors hover:bg-neutral-700"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                <RefreshCcw className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Remove image"
                className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-neutral-900/80 text-white backdrop-blur transition-colors hover:bg-red-600"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onRemove();
                }}
              >
                <Trash2 className="size-4" />
              </button>
            </div>

            <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">
              <Check className="size-3" />
              Ready
            </span>
          </>
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center gap-3 px-4 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-neutral-800 text-white">
              {icon}
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-white">{title}</span>
              <span className="text-xs text-neutral-400">{description}</span>
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-neutral-500">
              <Camera className="size-3.5" />
              Tap to use camera or gallery
            </span>
          </span>
        )}
      </label>
    </div>
  );
}
