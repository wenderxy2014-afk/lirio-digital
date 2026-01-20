import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/data/queries";
import { QRCodeCanvas } from "qrcode.react";

export default function OfferingsPage() {
  const { data: settings } = useSettings();
  const pixKey = settings?.pix_key ?? "SUA-CHAVE-PIX-AQUI";

  return (
    <SiteLayout>
      <header className="text-left">
        <h1 className="font-display text-3xl">Ofertas e Dízimos (Pix)</h1>
        <p className="mt-2 text-muted-foreground">Página direta para contribuir via Pix.</p>
      </header>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="font-display">Chave Pix</CardTitle>
          </CardHeader>
          <CardContent className="text-left">
            <div className="rounded-2xl bg-brand-soft p-4">
              <div className="text-xs text-muted-foreground">Copie e cole:</div>
              <div className="mt-1 break-all font-mono text-sm">{pixKey}</div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{settings?.pix_message ?? "Mensagem de transparência e gratidão."}</p>
            <div className="mt-4 rounded-2xl border bg-card p-4 text-sm text-muted-foreground">
              Estrutura pronta para integrar futuramente com soluções de doação/APIs.
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="font-display">QR Code</CardTitle>
          </CardHeader>
          <CardContent className="grid place-items-center">
            <div className="rounded-3xl bg-background p-4 shadow-lift">
              <QRCodeCanvas value={pixKey || "SUA-CHAVE-PIX-AQUI"} size={220} includeMargin />
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">Substitua a chave Pix em Configurações (admin).</p>
          </CardContent>
        </Card>
      </section>
    </SiteLayout>
  );
}
