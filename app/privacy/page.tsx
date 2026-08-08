import type { Metadata } from "next";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";

export const metadata: Metadata = {
  title: "Privacy Policy · TryOutfit",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-[#0a0812] text-white">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-white/50">
          TryOutfit · Last updated: February 2026
        </p>

        <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-white/70">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              1. What we collect
            </h2>
            <p>
              When you create an account we store your email address and a basic
              profile so you can track your generations and credits. When you
              use the try-on tool, we upload the two photos you provide (you and
              the garment) to our image storage so the AI model can process
              them.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              2. How uploaded photos are handled
            </h2>
            <p>
              Your photos are used only to generate your virtual try-on results.
              Both your source photos and your generated results are stored in
              your private account area under authenticated, access-controlled
              storage. We do not sell your photos, and we do not use them to
              train AI models. You may delete your account and associated photos
              at any time by contacting support.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              3. Third-party processing
            </h2>
            <p>
              We use third-party services to power the product: an AI model
              provider (fal.ai) that receives your photos solely to generate the
              try-on, and Supabase for authentication, database storage, and
              hosting. These providers process your data in accordance with
              their own privacy policies and security practices. Photos
              transmitted to the AI provider are used only for the generation you
              request and are not used by us or the provider to train models.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              4. Cookies &amp; analytics
            </h2>
            <p>
              We use essential cookies for authentication and session
              management so you can stay signed in. We also use standard,
              privacy-respecting analytics to understand how the product is used
              (page views, feature usage). These do not identify you personally
              and do not track you across other websites.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              5. Data retention &amp; deletion
            </h2>
            <p>
              We keep your account data while your account is active so you can
              revisit your looks in My Closet. You can request full deletion of
              your account, photos, and generations at any time by emailing
              support. Deletion is processed promptly.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              6. Security
            </h2>
            <p>
              All traffic is encrypted in transit with HTTPS. Photos are stored
              in private, authenticated storage buckets and are only accessible
              to you and the services that generate your results.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              7. Children&apos;s privacy
            </h2>
            <p>
              The Service is not directed to children under the age of 13. We do
              not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              8. Changes to this policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will post
              any changes on this page and update the date above. Continued use
              of the Service after changes take effect constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              9. Contact
            </h2>
            <p>
              Questions about this policy? Contact us at support@tryoutfit.online.
            </p>
          </section>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
