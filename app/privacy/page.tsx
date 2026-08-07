import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: February 2026</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground/90">
        <section>
          <h2 className="mb-2 text-lg font-semibold">1. What we collect</h2>
          <p>
            When you sign in we store your email address and a basic profile so
            you can keep track of your generations and credits. When you use the
            try-on tool, we upload your two source photos (you and the outfit)
            to our image storage so the AI model can process them.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">2. How photos are used</h2>
          <p>
            Your photos are used only to generate your virtual try-on results.
            Both your source photos and your generated results are stored in
            your private account area. We do not sell your photos, and we do not
            use them to train AI models.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">3. Third-party services</h2>
          <p>
            We use a third-party AI model provider (fal.ai) to generate your
            results. Your photos are transmitted to that provider solely for the
            purpose of generating your try-on, and the results are returned to
            us. We also use Supabase for authentication, data storage, and
            hosting. Each provider has its own privacy policy that governs its
            handling of your data.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">4. Retention &amp; deletion</h2>
          <p>
            We keep your photos and generated looks as long as your account
            exists so you can revisit them in &quot;My Closet&quot;. You may
            delete your account and associated data at any time by contacting
            us, after which your photos, generations, and profile are removed.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">5. Security</h2>
          <p>
            Photos are stored in a private, authenticated storage bucket and are
            only accessible to you and to the services that generate your
            results. We use HTTPS encryption for all traffic.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">6. Contact</h2>
          <p>
            Questions about this policy? Contact us at
            privacy@example.com and we&apos;ll respond promptly.
          </p>
        </section>
      </div>
    </div>
  );
}
