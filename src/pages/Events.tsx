import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEvents, useSettings } from "@/data/queries";

export default function EventsPage() {
  const { data: settings } = useSettings();
  const { data: events, isLoading } = useEvents();

  return (
    <SiteLayout>
      <header className="text-left">
        <h1 className="font-display text-3xl">Cultos & Eventos</h1>
        <p className="mt-2 text-muted-foreground">
          Veja os próximos cultos e eventos. (Se quiser separar “cultos” de “eventos”, podemos criar uma tabela específica.)
        </p>
      </header>

      {settings?.live_stream_url && (
        <div className="mt-6 rounded-3xl border bg-brand-soft p-6 text-left shadow-lift">
          <div className="font-medium">Transmissão ao vivo</div>
          <a className="mt-1 inline-block brand-underline" href={settings.live_stream_url} target="_blank" rel="noreferrer">
            Acessar culto online
          </a>
        </div>
      )}

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        {(events ?? []).map((e) => (
          <Card key={e.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="font-display">{e.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-left">
              <div className="content-panel">
                <p className="content-text">{e.description ?? "Descrição a confirmar"}</p>
              </div>
              <div className="mt-4 text-sm">
                <div className="font-medium">Local</div>
                <div className="content-meta">{e.location ?? "A confirmar"}</div>
              </div>
            </CardContent>
          </Card>
        ))}

        {isLoading && <div className="rounded-3xl border bg-card p-6 text-left">Carregando…</div>}
        {!isLoading && (!events || events.length === 0) && (
          <div className="rounded-3xl border bg-card p-6 text-left text-muted-foreground">Nenhum evento publicado.</div>
        )}
      </section>
    </SiteLayout>
  );
}
