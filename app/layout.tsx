import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { AuthModal } from "@/components/auth/auth-modal";
import { OutOfCreditsModal } from "@/components/auth/out-of-credits-modal";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
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
    default: "AI Virtual Wardrobe — Try on outfits with AI",
    template: "%s · AI Virtual Wardrobe",
  },
  description:
    "Upload a photo of yourself and an outfit to preview how the garments would look on you, powered by AI.",
  applicationName: "AI Virtual Wardrobe",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "AI Virtual Wardrobe",
    title: "AI Virtual Wardrobe — Try on outfits with AI",
    description:
      "Upload a photo of yourself and an outfit to preview how the garments would look on you, powered by AI.",
    images: [{ url: "/icon.svg", width: 512, height: 512, alt: "AI Virtual Wardrobe" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Virtual Wardrobe",
    description: "Preview how outfits look on you with AI.",
    images: ["/icon.svg"],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh bg-background font-sans text-foreground">
        <AuthProvider>
          <div className="flex min-h-dvh flex-col">
            <SiteHeader />
            <main className="flex flex-1 flex-col">{children}</main>
            <SiteFooter />
          </div>
          <AuthModal />
          <OutOfCreditsModal />
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
