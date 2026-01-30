import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEvents, useSettings } from "@/data/queries";
import { Calendar, MapPin, Clock, ExternalLink, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EventsPage() {
  const { data: settings } = useSettings();
  const { data: events, isLoading } = useEvents();

  return (
    <SiteLayout>
      {/* Hero Header com Glassmorphism */}
      <header className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8 md:p-12">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur">
            <Calendar className="h-4 w-4" />
            Agenda da Igreja
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold text-foreground md:text-5xl">
            Cultos & Eventos
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Confira nossa programação e participe dos momentos especiais da nossa comunidade.
          </p>
        </div>
      </header>

      {/* Card de Transmissão ao Vivo */}
      {settings?.live_stream_url && (
        <div className="mt-8">
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-r from-red-500/10 via-background to-red-500/5 shadow-lg">
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-red-500 to-red-600" />
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
              <div className="flex items-center gap-4">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg">
                  <Radio className="h-6 w-6" />
                  <span className="absolute -right-1 -top-1 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                  </span>
                </div>
                <div>
                  <div className="font-display text-lg font-semibold text-foreground">Transmissão ao Vivo</div>
                  <p className="text-sm text-muted-foreground">Assista nossos cultos online</p>
                </div>
              </div>
              <Button
                asChild
                className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
              >
                <a href={settings.live_stream_url} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Acessar culto online
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grid de Eventos */}
      <section className="mt-10 grid gap-6 md:grid-cols-2">
        {(events ?? []).map((e) => (
          <Card
            key={e.id}
            className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            {/* Linha decorativa no topo */}
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-primary via-primary/80 to-primary/60" />

            {/* Efeito de brilho no hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <CardHeader className="relative pb-2">
              <CardTitle className="flex items-center gap-3 font-display text-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
                  <Calendar className="h-5 w-5" />
                </div>
                {e.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="relative text-left">
              {e.description && (
                <div className="mb-4 rounded-xl bg-background/50 p-4 backdrop-blur">
                  <p className="text-muted-foreground leading-relaxed">{e.description}</p>
                </div>
              )}

              <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-3">
                <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <div className="text-xs font-medium text-primary uppercase tracking-wide">Local</div>
                  <span className="text-sm text-muted-foreground">{e.location ?? "A confirmar"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {isLoading && (
          <div className="col-span-full flex items-center justify-center rounded-3xl border border-dashed bg-gradient-to-br from-background to-primary/5 p-12">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Carregando eventos…
            </div>
          </div>
        )}

        {!isLoading && (!events || events.length === 0) && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed bg-gradient-to-br from-background to-primary/5 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground">Nenhum evento publicado</h3>
            <p className="mt-2 text-muted-foreground max-w-sm">
              Em breve teremos novidades na nossa agenda!
            </p>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
