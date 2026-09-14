import { Facebook, Instagram, Phone } from "lucide-react";
import igrejaBg from "@/assets/igreja-bg.png";

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-background">
      {/* Brand accent */}
      <div className="h-1.5 w-full bg-brand" />

      <div className="relative overflow-hidden border-t">
        {/* Background image */}
        <img
          src={igrejaBg}
          alt="Fachada da Igreja Batista Lírio dos Vales"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30"
          loading="lazy"
        />
        {/* Readability overlays */}
        <div className="pointer-events-none absolute inset-0 bg-background/70" />
        <div className="pointer-events-none absolute inset-0 bg-brand-soft opacity-30" />

        <div className="relative mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-10 md:grid-cols-3 md:items-start">
            {/* Coluna 1 - Igreja */}
            <div className="animate-fade-in">
              <div className="font-display text-xl font-bold text-foreground">
                Igreja Batista Lírio dos Vales
              </div>
              <p className="mt-3 max-w-prose text-base text-muted-foreground">
                Um lugar para pertencer, crescer e servir.
              </p>
            </div>

            {/* Coluna 2 - Contato (apenas telefones) */}
            <div className="animate-fade-in [animation-delay:80ms]">
              <div className="text-lg font-bold text-foreground">Contato</div>
              <div className="mt-4">
                <a
                  href="tel:+553134962162"
                  className="flex items-center gap-4 rounded-xl bg-background/60 p-4 shadow-lift backdrop-blur transition-all hover:bg-background/80 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Telefone</div>
                    <div className="text-lg font-semibold text-foreground">(31) 3496-2162</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Coluna 3 - Redes Sociais com cores */}
            <div className="animate-fade-in md:text-right [animation-delay:160ms]">
              <div className="text-lg font-bold text-foreground">Redes Sociais</div>
              <p className="mt-2 text-base text-muted-foreground">
                Siga-nos e acompanhe nossos conteúdos!
              </p>
              <div className="mt-5 flex items-center gap-4 md:justify-end">
                {/* Facebook - Cor oficial #1877F2 */}
                <a
                  href="https://web.facebook.com/iblvemcelulas/?locale=pt_BR&_rdc=1&_rdr#"
                  target="_blank"
                  rel="noreferrer"
                  className="group relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1877F2] text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl hover:shadow-[#1877F2]/30"
                  aria-label="Abrir Facebook da IBLV"
                  title="Facebook"
                >
                  <Facebook className="h-7 w-7" />
                  <span className="absolute -bottom-6 text-xs font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    Facebook
                  </span>
                </a>

                {/* Instagram - Gradiente oficial */}
                <a
                  href="https://www.instagram.com/iblvbh/"
                  target="_blank"
                  rel="noreferrer"
                  className="group relative inline-flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl hover:shadow-pink-500/30"
                  style={{
                    background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)"
                  }}
                  aria-label="Abrir Instagram da IBLV"
                  title="Instagram"
                >
                  <Instagram className="h-7 w-7" />
                  <span className="absolute -bottom-6 text-xs font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    Instagram
                  </span>
                </a>

                {/* YouTube - Cor oficial #FF0000 */}
                <a
                  href="https://www.youtube.com/@IBLVONLINE"
                  target="_blank"
                  rel="noreferrer"
                  className="group relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF0000] text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl hover:shadow-red-500/30"
                  aria-label="Abrir YouTube da IBLV"
                  title="YouTube"
                >
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  <span className="absolute -bottom-6 text-xs font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    YouTube
                  </span>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2 border-t pt-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <span>© {new Date().getFullYear()} Igreja Batista Lírio dos Vales</span>
            <span className="md:text-right">
              Desenvolvido com amor para servir a igreja.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
