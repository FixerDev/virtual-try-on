import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: February 2026</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground/90">
        <section>
          <h2 className="mb-2 text-lg font-semibold">1. Acceptance of terms</h2>
          <p>
            By creating an account or using AI Virtual Wardrobe (&quot;the
            Service&quot;), you agree to these Terms. If you do not agree, please
            do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">2. Eligibility &amp; accounts</h2>
          <p>
            You must be at least 13 years old to use the Service. You are
            responsible for maintaining the security of your account credentials
            and for all activity under your account.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">3. Your content</h2>
          <p>
            You retain ownership of the photos you upload. By uploading a photo,
            you grant us a limited license to process and store it solely for the
            purpose of providing the Service to you. You confirm that you have
            the right to upload any photo you submit, including photos of other
            people.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">4. Acceptable use</h2>
          <p>
            You agree not to upload photos that are unlawful, harassing, or
            sexually explicit, or that depict minors inappropriately. We may
            refuse to process or remove content that violates these Terms.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">5. Credits</h2>
          <p>
            New accounts receive a starting balance of credits, each of which
            funds one generation. Credits are consumed when a generation is
            processed and are non-refundable unless the generation fails, in
            which case the credit is returned automatically.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">6. Disclaimers</h2>
          <p>
            The Service is provided &quot;as is&quot; without warranties of any
            kind. Results are AI-generated approximations and may not reflect how
            a garment actually fits. We are not liable for decisions you make
            based on generated results.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">7. Changes &amp; termination</h2>
          <p>
            We may update these Terms from time to time. Continued use of the
            Service after changes take effect constitutes acceptance. We may
            suspend or terminate accounts that violate these Terms.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">8. Contact</h2>
          <p>
            Questions about these Terms? Contact us at
            support@example.com.
          </p>
        </section>
      </div>
    </div>
  );
}
