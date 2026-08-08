"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Check,
  ChevronDown,
  Gem,
  Shirt,
  Sparkles,
  Star,
  Upload,
  WandSparkles,
  Zap,
} from "lucide-react";

import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const DEMO_IMAGES = [
  "/demo/model-1.jpg",
  "/demo/model-2.jpg",
  "/demo/model-3.jpg",
  "/demo/model-4.jpg",
];

// The button text teases the *next* image in the cycle so there's always a
// reason to click. DEMO_HOOKS[i] is shown while image i is on screen.
const DEMO_HOOKS = [
  "See this in a Denim Jacket ✨",
  "Try a Formal Look 👗",
  "Preview a Weekend Blazer 🧥",
  "Back to the Vintage Fit 🔄",
];

const STEPS = [
  {
    icon: <Upload className="size-6" />,
    title: "Upload Photo",
    description: "Add a clear, front-facing photo of yourself.",
  },
  {
    icon: <Shirt className="size-6" />,
    title: "Select Garment",
    description: "Choose the outfit you want to preview on your body.",
  },
  {
    icon: <Sparkles className="size-6" />,
    title: "Generate",
    description: "AI renders the look on you in seconds — no returns needed.",
  },
];

const TIERS = [
  {
    name: "Pro Plan",
    price: "$19",
    period: "/ month",
    tagline: "100 Image Credits every month. The only plan you'll ever need.",
    features: [
      "100 image credits per month",
      "Top, bottom & full outfits",
      "Priority generation queue",
      "Unlimited My Closet history",
      "Early access to new models",
      "Priority support",
    ],
    cta: "Start Free Trial (10 Credits)",
    disclaimer:
      "Requires a valid card to prevent abuse. Cancel anytime before your 10 credits are used, and you won't be charged.",
  },
];

const FAQS = [
  {
    q: "How does the AI try-on work?",
    a: "Upload a photo of yourself and a photo of the garment you like. Our AI model maps the clothing onto your exact body shape and pose, producing a realistic preview in about 30 seconds.",
  },
  {
    q: "Are my photos private?",
    a: "Yes. Your photos are stored in a private, authenticated bucket and are only accessible to you and the AI service that generates your results. We never share or sell your photos.",
  },
  {
    q: "What are credits and how do I get them?",
    a: "Each generation costs one image credit. Start a free trial and we'll add 10 credits immediately so you can try the magic — no charge until you use them. The Pro Plan includes 100 image credits every month.",
  },
  {
    q: "How does the free trial work?",
    a: "Start the free trial and you'll get 10 credits right away. We require a valid card to prevent abuse, but you can cancel anytime before your 10 credits are used and you won't be charged.",
  },
  {
    q: "Can I cancel my Pro subscription?",
    a: "Yes. You can cancel anytime from your account settings. You keep access for the rest of the billing period you already paid for.",
  },
  {
    q: "What is the refund policy?",
    a: "Because AI generation is compute-heavy, all sales of digital credits are final and non-refundable. If you hit a technical issue, contact support and we'll help.",
  },
];

function DemoSection() {
  const { user, openAuth } = useAuth();
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  const generateNext = useCallback(() => {
    if (fading) return;
    setFading(true);
    window.setTimeout(() => {
      setIndex((i) => (i + 1) % DEMO_IMAGES.length);
      setFading(false);
    }, 200);
  }, [fading]);

  return (
    <section id="demo" className="scroll-mt-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl border border-purple-500/30 bg-white/[0.03] p-4 shadow-[0_0_50px_rgba(109,40,217,0.15)] backdrop-blur-sm sm:p-8">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            {/* Demo viewer */}
            <div className="flex flex-col items-center gap-5">
              <div className="relative w-full max-w-xs overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                <div className="aspect-[3/4] w-full bg-neutral-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={DEMO_IMAGES[index]}
                    alt="AI generated outfit preview"
                    className={cn(
                      "h-full w-full object-cover transition-opacity duration-300",
                      fading ? "opacity-0" : "opacity-100"
                    )}
                  />
                </div>
                <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
                  <Sparkles className="size-3 text-purple-300" />
                  AI Preview
                </span>
              </div>

              <button
                type="button"
                onClick={generateNext}
                disabled={fading}
                className="flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_25px_rgba(147,51,234,0.5)] transition-all hover:shadow-[0_0_35px_rgba(147,51,234,0.7)] disabled:opacity-70"
              >
                <WandSparkles className="size-4" />
                {DEMO_HOOKS[index]}
              </button>
            </div>

            {/* Primary CTA */}
            <div className="flex flex-col items-start gap-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                <Zap className="size-3.5" />
                Try it on your own photo
              </span>
              <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                See the magic on <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">you</span>
              </h3>
              <p className="text-white/60">
                The preview above is just a taste. Upload your own photo and a
                garment to generate a realistic try-on of yourself in seconds.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/app"
                  className="flex items-center justify-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_25px_rgba(147,51,234,0.5)] transition-all hover:bg-purple-500 hover:shadow-[0_0_35px_rgba(147,51,234,0.7)]"
                >
                  Start Trying On
                  <ArrowRight className="size-4" />
                </Link>
                {!user && (
                  <button
                    type="button"
                    onClick={openAuth}
                    className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white/10"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const tier = TIERS[0];
  return (
    <section id="pricing" className="scroll-mt-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            One plan. Unlimited possibilities.
          </h2>
          <p className="mt-3 text-white/60">
            No tiers to compare. Just generous credits and priority AI.
          </p>
        </div>

        <div className="mx-auto max-w-md">
          <div className="relative flex flex-col rounded-3xl border border-purple-500/40 bg-purple-500/10 p-8 shadow-[0_0_50px_rgba(109,40,217,0.25)] backdrop-blur-sm">
            <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-3 py-1 text-xs font-semibold text-white">
              <Gem className="size-3" />
              Most Popular
            </span>

            <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
            <p className="mt-1 text-sm text-white/60">{tier.tagline}</p>

            <p className="mt-6 flex items-baseline gap-1.5">
              <span className="text-5xl font-bold tracking-tight text-white">
                {tier.price}
              </span>
              <span className="text-sm text-white/50">{tier.period}</span>
            </p>
            <p className="mt-1 text-sm text-white/70">
              100 Image Credits
            </p>

            <ul className="mt-6 flex flex-col gap-3">
              {tier.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 text-sm text-white/80"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-purple-400" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/app"
              className="mt-8 rounded-full bg-purple-600 px-6 py-3.5 text-center text-sm font-semibold text-white shadow-[0_0_25px_rgba(147,51,234,0.5)] transition-all hover:bg-purple-500 hover:shadow-[0_0_35px_rgba(147,51,234,0.7)]"
            >
              {tier.cta}
            </Link>

            <p className="mt-3 text-center text-xs leading-relaxed text-white/40">
              {tier.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={faq.q}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-medium text-white">{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 text-purple-300 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                {isOpen && (
                  <p className="px-5 pb-5 text-sm leading-relaxed text-white/60">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-[#0a0812] text-white">
      <MarketingHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[650px] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.35),rgba(255,255,255,0))]"
          />
          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28">
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 text-xs font-medium text-purple-300">
              <Sparkles className="size-3.5" />
              Powered by next-gen AI try-on
            </span>

            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
              See the magic{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-300 bg-clip-text text-transparent">
                on you
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base text-white/60 sm:text-lg">
              Upload a photo of yourself and preview how hundreds of garments
              look on your exact body — in seconds.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <a
                href="#demo"
                className="flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_25px_rgba(147,51,234,0.5)] transition-all hover:bg-purple-500 hover:shadow-[0_0_35px_rgba(147,51,234,0.7)]"
              >
                <WandSparkles className="size-4" />
                See It On You
              </a>
              <Link
                href="/app"
                className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white/10"
              >
                Try It Free
              </Link>
            </div>
          </div>
        </section>

        {/* Trust banner */}
        <section className="border-y border-white/5 bg-white/[0.02]">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-6 sm:px-6">
            <span className="text-sm text-white/50">Trusted by fashion enthusiasts worldwide</span>
            <div className="flex items-center gap-1.5 text-white/40">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-current text-amber-400" />
              ))}
              <span className="ml-1 text-sm">4.9/5</span>
            </div>
            <span className="flex items-center gap-1.5 text-sm text-white/50">
              <Camera className="size-4 text-purple-300" />
              1,200+ outfits generated
            </span>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-24 py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                How it works
              </h2>
              <p className="mt-3 text-white/60">
                Three simple steps between you and your next favorite look.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <div
                  key={step.title}
                  className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-sm"
                >
                  <span className="absolute right-6 top-6 text-5xl font-bold text-white/5">
                    0{i + 1}
                  </span>
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]">
                    {step.icon}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive demo */}
        <section className="pb-20">
          <DemoSection />
        </section>

        {/* Pricing */}
        <section className="pb-20">
          <PricingSection />
        </section>

        {/* FAQ */}
        <section className="pb-24">
          <FaqSection />
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
