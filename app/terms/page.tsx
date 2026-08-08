import type { Metadata } from "next";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";

export const metadata: Metadata = {
  title: "Terms of Service · TryOutfit",
};

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-[#0a0812] text-white">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-white/50">
          TryOutfit.online · Last updated: February 2026
        </p>

        <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-white/70">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              1. Acceptance of terms
            </h2>
            <p>
              By creating an account or using TryOutfit.online (&quot;the
              Service&quot;), you agree to these Terms of Service. If you do not
              agree, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              2. Eligibility
            </h2>
            <p>
              You must be at least 13 years old to use the Service. You are
              responsible for maintaining the security of your account
              credentials and for all activity that occurs under your account.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              3. Your content
            </h2>
            <p>
              You retain ownership of the photos you upload. By uploading a
              photo, you grant us a limited license to process and store it
              solely for the purpose of providing the Service to you. You
              confirm that you own or have the right to upload any photo you
              submit, including photos of other people.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              4. Acceptable use
            </h2>
            <p>
              You agree not to upload photos that are unlawful, harassing, or
              sexually explicit, or that depict minors inappropriately. We may
              refuse to process or remove content that violates these Terms and
              may suspend accounts that repeatedly violate them.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              5. Credits &amp; payments
            </h2>
            <p>
              New accounts receive a starting balance of credits, each funding
              one generation. Credits are consumed when a generation is
              processed and are non-refundable unless the generation fails, in
              which case the credit is returned automatically. Paid subscriptions
              renew until cancelled. You may cancel at any time; access continues
              until the end of the current billing period.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              6. Disclaimers
            </h2>
            <p>
              The Service is provided &quot;as is&quot; without warranties of any
              kind. Results are AI-generated approximations and may not reflect
              how a garment actually fits. We are not liable for decisions you
              make based on generated results.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              7. Limitation of liability
            </h2>
            <p>
              To the maximum extent permitted by law, TryOutfit.online shall not
              be liable for any indirect, incidental, special, consequential, or
              punitive damages arising out of or related to your use of the
              Service.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              8. Changes &amp; termination
            </h2>
            <p>
              We may update these Terms from time to time. Continued use of the
              Service after changes take effect constitutes acceptance. We may
              suspend or terminate accounts that violate these Terms.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              9. Contact
            </h2>
            <p>
              Questions about these Terms? Contact us at
              support@tryoutfit.online.
            </p>
          </section>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
