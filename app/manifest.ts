import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TryOutfit",
    short_name: "TryOutfit",
    description: "Preview how outfits look on you with AI-powered virtual try-on.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0812",
    theme_color: "#0a0812",
    orientation: "portrait",
    categories: ["fashion", "shopping", "photo"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
