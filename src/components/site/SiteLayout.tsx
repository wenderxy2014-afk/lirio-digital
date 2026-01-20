import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { EbdBanner } from "@/components/site/EbdBanner";
import { WhatsAppFloatingChat } from "@/components/site/WhatsAppFloatingChat";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <EbdBanner />
      <main className="mx-auto w-full max-w-6xl px-4 py-10">{children}</main>
      <SiteFooter />

      {/* Floating chat entrypoint (public) */}
      <WhatsAppFloatingChat />
    </div>
  );
}

