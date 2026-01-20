import { Facebook, Instagram } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-background">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div className="text-sm text-muted-foreground">
          <div className="font-display text-base text-foreground">
            Igreja Batista Lírio dos Vales
          </div>
          <p className="mt-2 max-w-prose">
            Um lugar para pertencer, crescer e servir.
          </p>
        </div>

        <div className="text-sm text-muted-foreground">
          <div className="font-medium text-foreground">Contato</div>
          <p className="mt-2">Telefone: (31) 3496-2162</p>
          <p className="mt-1">
            Endereço: R. Rad. Caetano Silva, 90 - Céu Azul, Belo Horizonte - MG,
            31540-480
          </p>
          <p className="mt-1">
            Horário de funcionamento: Fechado · Abre às 08:00
          </p>
        </div>

        <div className="text-sm text-muted-foreground md:text-right">
          <div className="font-medium text-foreground">Redes sociais</div>
          <div className="mt-3 flex items-center gap-3 md:justify-end">
            <a
              href="https://web.facebook.com/iblvemcelulas/?locale=pt_BR&_rdc=1&_rdr#"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-md border bg-background p-2 text-foreground transition hover:bg-muted"
              aria-label="Abrir Facebook da IBLV"
              title="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://www.instagram.com/iblvbh/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-md border bg-background p-2 text-foreground transition hover:bg-muted"
              aria-label="Abrir Instagram da IBLV"
              title="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

