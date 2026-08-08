import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { AuthModal } from "@/components/auth/auth-modal";
import { OutOfCreditsModal } from "@/components/auth/out-of-credits-modal";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TryOutfit — Try on outfits with AI",
    template: "%s · TryOutfit",
  },
  description:
    "Upload a photo of yourself and an outfit to preview how the garments would look on you, powered by AI.",
  applicationName: "TryOutfit",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "TryOutfit",
    title: "TryOutfit — Try on outfits with AI",
    description:
      "Upload a photo of yourself and an outfit to preview how the garments would look on you, powered by AI.",
    images: [{ url: "/icon.svg", width: 512, height: 512, alt: "TryOutfit" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TryOutfit",
    description: "Preview how outfits look on you with AI.",
    images: ["/icon.svg"],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0812",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh bg-[#0a0812] text-white">
        <AuthProvider>
          {children}
          <AuthModal />
          <OutOfCreditsModal />
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
