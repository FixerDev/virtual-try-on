import { TryOnTool } from "@/components/try-on/try-on-tool";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export const metadata = {
  title: "Try-On Studio",
};

export default function AppPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-5xl flex-1">
          <TryOnTool />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
