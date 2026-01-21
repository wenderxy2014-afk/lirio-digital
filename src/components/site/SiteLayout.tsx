import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { EbdBanner } from "@/components/site/EbdBanner";
import { WhatsAppFloatingChat } from "@/components/site/WhatsAppFloatingChat";
import liliesBg from "@/assets/lilies-bg.png";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background relative isolate">
      {/* Background Effect: Lilies Field */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none select-none">
        <div
          className="absolute inset-[-10%] h-[120%] w-[120%] bg-cover bg-center opacity-[0.14] dark:opacity-[0.08] animate-wind"
          style={{ backgroundImage: `url(${liliesBg})` }}
        />
        <div className="absolute inset-0 bg-background/30 backdrop-blur-[1px]" />
      </div>

      <SiteHeader />
      <EbdBanner />
      <main className="mx-auto w-full max-w-6xl px-4 py-10">{children}</main>
      <SiteFooter />

      {/* Floating chat entrypoint (public) */}
      <WhatsAppFloatingChat />
    </div>
  );
}

