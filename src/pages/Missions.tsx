import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMissions, useSettings } from "@/data/queries";

export default function MissionsPage() {
  const { data: missions } = useMissions();
  const { data: settings } = useSettings();

  return (
    <SiteLayout>
      <header className="text-left">
        <h1 className="font-display text-3xl">Missões</h1>
        <p className="mt-2 text-muted-foreground">Projetos missionários e como contribuir.</p>
      </header>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        {(missions ?? []).map((m) => (
          <Card key={m.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3 font-display">
                <span>{m.title}</span>
                <Badge variant="secondary">{m.status === "active" ? "Ativo" : "Concluído"}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-left">
              <div className="content-panel">
                <p className="content-text">{m.description ?? "Descrição a confirmar"}</p>
              </div>

              <div className="mt-4 text-sm">
                <div className="font-medium">Localização</div>
                <div className="content-meta">{m.location ?? "A confirmar"}</div>
              </div>

              <div className="mt-4 rounded-2xl bg-brand-soft p-4 ring-1 ring-border/60">
                <div className="text-sm font-medium">Como contribuir</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Pix do projeto: <span className="font-mono">{m.pix_key ?? settings?.pix_key ?? "SUA-CHAVE-PIX-AQUI"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </SiteLayout>
  );
}
