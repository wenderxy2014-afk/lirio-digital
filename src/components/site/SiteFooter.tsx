export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-background">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-2">
        <div className="text-sm text-muted-foreground">
          <div className="font-display text-base text-foreground">Igreja Batista Lírio dos Vales</div>
          <p className="mt-2 max-w-prose">
            Um lugar para pertencer, crescer e servir. Substitua este texto no conteúdo oficial.
          </p>
        </div>
        <div className="text-sm text-muted-foreground md:text-right">
          <div className="font-medium text-foreground">Contato</div>
          <p className="mt-2">WhatsApp: +55 (11) 99999-9999</p>
          <p>E-mail: contato@exemplo.com</p>
        </div>
      </div>
    </footer>
  );
}
