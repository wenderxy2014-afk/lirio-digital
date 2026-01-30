import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/data/queries";
import { QRCodeCanvas } from "qrcode.react";
import { Wallet, QrCode, Copy, Check, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function OfferingsPage() {
  const { data: settings } = useSettings();
  const pixKey = settings?.pix_key ?? "SUA-CHAVE-PIX-AQUI";
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      toast({ title: "Copiado!", description: "Chave Pix copiada para a área de transferência." });
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível copiar.", variant: "destructive" });
    }
  };

  return (
    <SiteLayout>
      {/* Hero Header com Glassmorphism */}
      <header className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8 md:p-12">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur">
            <Heart className="h-4 w-4" />
            Contribua com a Igreja
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold text-foreground md:text-5xl">
            Ofertas e Dízimos
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Sua contribuição sustenta o ministério e permite que alcancemos mais vidas para Cristo.
          </p>
        </div>
      </header>

      {/* Grid Principal */}
      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Card da Chave Pix */}
        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg">
          {/* Linha decorativa */}
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary via-primary/80 to-primary/60" />

          <CardHeader className="relative pb-2">
            <CardTitle className="flex items-center gap-3 font-display text-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
                <Wallet className="h-5 w-5" />
              </div>
              Chave Pix
            </CardTitle>
          </CardHeader>

          <CardContent className="relative text-left">
            {/* Caixa com a chave */}
            <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-5 backdrop-blur">
              <div className="text-xs font-medium text-primary uppercase tracking-wide mb-2">Copie e cole no seu banco:</div>
              <div className="flex items-center gap-3">
                <code className="flex-1 break-all rounded-xl bg-background/80 px-4 py-3 font-mono text-sm text-foreground shadow-inner">
                  {pixKey}
                </code>
                <Button
                  onClick={handleCopy}
                  size="icon"
                  className={`h-12 w-12 shrink-0 rounded-xl shadow-lg transition-all duration-300 ${copied
                    ? "bg-green-500 text-white"
                    : "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground hover:scale-105"
                    }`}
                >
                  {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            {/* Mensagem de transparência */}
            <div className="mt-5 rounded-xl bg-background/50 p-4 backdrop-blur">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {settings?.pix_message ?? "Agradecemos por sua generosidade. Cada oferta é usada com transparência para glorificar a Deus e abençoar vidas."}
              </p>
            </div>

            {/* Versículo */}
            <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
              <p className="text-sm italic text-muted-foreground">
                "Cada um dê conforme determinou em seu coração, não com pesar ou por obrigação, pois Deus ama quem dá com alegria."
              </p>
              <p className="mt-2 text-xs font-medium text-primary">2 Coríntios 9:7</p>
            </div>
          </CardContent>
        </Card>

        {/* Card do QR Code */}
        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg">
          <CardHeader className="relative pb-2">
            <CardTitle className="flex items-center gap-3 font-display text-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
                <QrCode className="h-5 w-5" />
              </div>
              QR Code Pix
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col items-center justify-center">
            {/* Container do QR Code com efeito glassmorphism */}
            <div className="relative rounded-3xl bg-gradient-to-br from-background via-background to-primary/5 p-6 shadow-xl ring-1 ring-border/50">
              {/* Decoração de cantos */}
              <div className="absolute -left-2 -top-2 h-6 w-6 rounded-br-2xl border-b-2 border-r-2 border-primary" />
              <div className="absolute -right-2 -top-2 h-6 w-6 rounded-bl-2xl border-b-2 border-l-2 border-primary" />
              <div className="absolute -bottom-2 -left-2 h-6 w-6 rounded-tr-2xl border-r-2 border-t-2 border-primary" />
              <div className="absolute -bottom-2 -right-2 h-6 w-6 rounded-tl-2xl border-l-2 border-t-2 border-primary" />

              <div className="rounded-2xl bg-white p-4">
                <QRCodeCanvas value={pixKey || "SUA-CHAVE-PIX-AQUI"} size={200} includeMargin />
              </div>
            </div>

            <p className="mt-5 text-center text-sm text-muted-foreground max-w-xs">
              Escaneie o código com o app do seu banco para fazer uma transferência Pix instantânea.
            </p>

            {/* Botão de ajuda */}
            <div className="mt-5 rounded-xl bg-primary/5 px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">
                Dúvidas? Entre em contato pelo WhatsApp da igreja.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </SiteLayout>
  );
}
