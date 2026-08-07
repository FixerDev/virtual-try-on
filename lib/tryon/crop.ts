export function isAcceptedImage(file: File): boolean {
  // Mobile camera capture often yields HEIC/HEIF. The image is re-encoded to
  // JPEG via canvas, so accept any type the browser reports as an image and
  // let canvas decoding be the final gate.
  return file.type.startsWith("image/");
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read the image file."));
    reader.readAsDataURL(file);
  });
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image."));
    img.src = src;
  });
}

export interface ResizedImage {
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Downscales an image so its longest edge is at most `maxSize` (default 1024)
 * and re-encodes it as a JPEG data URL. This keeps payloads small and limits
 * megapixels billed by the model, cutting per-request API cost.
 */
export async function resizeImage(
  source: string,
  maxSize = 1024,
  quality = 0.82
): Promise<ResizedImage> {
  const img = await loadImage(source);
  const { naturalWidth: width, naturalHeight: height } = img;

  const scale = Math.min(1, maxSize / Math.max(width, height));
  const targetWidth = Math.round(width * scale);
  const targetHeight = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas is not supported in this browser.");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  return {
    dataUrl: canvas.toDataURL("image/jpeg", quality),
    width: targetWidth,
    height: targetHeight,
  };
}
