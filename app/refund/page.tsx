import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";

export const metadata: Metadata = {
  title: "Refund Policy · TryOutfit",
};

export default function RefundPage() {
  return (
    <div className="min-h-dvh bg-[#0a0812] text-white">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Refund Policy
        </h1>
        <p className="mt-2 text-sm text-white/50">
          TryOutfit · Last updated: February 2026
        </p>

        <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-white/70">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              All sales of digital credits are final
            </h2>
            <p>
              AI try-on generation is compute-heavy: every generation consumes
              significant model and GPU resources that are billed to us the
              moment you use a credit. Because of this, all sales of digital
              credits are <strong className="text-white">final and non-refundable</strong>.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              When a refund may be provided
            </h2>
            <p>
              While we do not offer refunds for used credits, we will help in
              these cases:
            </p>
            <ul className="mt-3 flex list-inside list-disc flex-col gap-2">
              <li>
                <strong className="text-white">Technical failures:</strong> if a
                generation fails due to a bug on our end and the credit was not
                automatically refunded, we will restore it.
              </li>
              <li>
                <strong className="text-white">Duplicate charges:</strong> if you
                were charged twice for the same purchase, we will refund the
                duplicate.
              </li>
              <li>
                <strong className="text-white">Unused credits on a cancelled
                subscription:</strong> if you cancel a paid plan, any credits
                you purchased remain usable; we do not expire them at
                cancellation.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              How to contact support
            </h2>
            <p>
              If you are experiencing a technical issue with a generation or a
              payment, please reach out before requesting a refund. Include your
              account email and, if possible, the time of the transaction.
            </p>
            <a
              href="mailto:support@tryoutfit.online"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10"
            >
              <Mail className="size-4" />
              support@tryoutfit.online
            </a>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              Processing time
            </h2>
            <p>
              Approved refunds are issued to the original payment method within
              5–10 business days. Your bank or card provider may take additional
              time to reflect the credit.
            </p>
          </section>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
