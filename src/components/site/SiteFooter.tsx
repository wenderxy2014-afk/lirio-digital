import { Facebook, Instagram, MapPin, Phone, Clock, MessageCircle } from "lucide-react";
import igrejaBg from "@/assets/igreja-bg.png";

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-background">
      {/* Brand accent */}
      <div className="h-1 w-full bg-brand" />

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

        <div className="relative mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-8 md:grid-cols-3 md:items-start">
            <div className="animate-fade-in">
              <div className="font-display text-lg text-foreground">
                Igreja Batista Lírio dos Vales
              </div>
              <p className="mt-2 max-w-prose text-sm text-muted-foreground">
                Um lugar para pertencer, crescer e servir.
              </p>

              <div className="mt-5 flex items-center gap-3">
                <a
                  href="https://web.facebook.com/iblvemcelulas/?locale=pt_BR&_rdc=1&_rdr#"
                  target="_blank"
                  rel="noreferrer"
                  className="hover-scale inline-flex items-center gap-2 rounded-full border bg-background/60 px-4 py-2 text-sm text-foreground shadow-lift backdrop-blur"
                  aria-label="Abrir Facebook da IBLV"
                  title="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                  <span>Facebook</span>
                </a>
                <a
                  href="https://www.instagram.com/iblvbh/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover-scale inline-flex items-center gap-2 rounded-full border bg-background/60 px-4 py-2 text-sm text-foreground shadow-lift backdrop-blur"
                  aria-label="Abrir Instagram da IBLV"
                  title="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                  <span>Instagram</span>
                </a>
              </div>
            </div>

            <div className="animate-fade-in text-sm text-muted-foreground [animation-delay:80ms]">
              <div className="font-medium text-foreground">Contato</div>
              <div className="mt-3 space-y-3">
                <p className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 text-primary" />
                  <span>Telefone: (31) 3496-2162</span>
                </p>

                <a
                  href="https://wa.me/5531994231888"
                  target="_blank"
                  rel="noreferrer"
                  className="hover-scale inline-flex items-start gap-3 rounded-xl border bg-background/60 px-4 py-3 text-left text-foreground shadow-lift backdrop-blur"
                  aria-label="Fale conosco pelo WhatsApp"
                  title="WhatsApp"
                >
                  <MessageCircle className="mt-0.5 h-4 w-4 text-primary" />
                  <span className="text-sm">
                    <span className="font-medium">Fale conosco</span>
                    <span className="text-muted-foreground"> — </span>
                    <span className="text-muted-foreground">31 9 9423 1888</span>
                  </span>
                </a>

                <p className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                  <span>
                    Endereço: R. Rad. Caetano Silva, 90 - Céu Azul, Belo Horizonte -
                    MG, 31540-480
                  </span>
                </p>
                <p className="flex gap-3">
                  <Clock className="mt-0.5 h-4 w-4 text-primary" />
                  <span>Horário de funcionamento: Fechado · Abre às 08:00</span>
                </p>
              </div>
            </div>

            <div className="animate-fade-in text-sm text-muted-foreground md:text-right [animation-delay:160ms]">
              <div className="font-medium text-foreground">Redes sociais</div>
              <p className="mt-2">Clique e acompanhe nossos conteúdos.</p>
              <div className="mt-4 flex items-center gap-3 md:justify-end">
                <a
                  href="https://web.facebook.com/iblvemcelulas/?locale=pt_BR&_rdc=1&_rdr#"
                  target="_blank"
                  rel="noreferrer"
                  className="hover-scale inline-flex h-11 w-11 items-center justify-center rounded-xl border bg-background/60 text-foreground shadow-lift backdrop-blur"
                  aria-label="Abrir Facebook da IBLV"
                  title="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://www.instagram.com/iblvbh/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover-scale inline-flex h-11 w-11 items-center justify-center rounded-xl border bg-background/60 text-foreground shadow-lift backdrop-blur"
                  aria-label="Abrir Instagram da IBLV"
                  title="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
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


