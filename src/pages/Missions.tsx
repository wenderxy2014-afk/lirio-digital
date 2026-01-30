import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMissions, useSettings } from "@/data/queries";
import missoesCapa from "@/assets/missoes-capa.jpg";
import { Globe, MapPin, Wallet, Heart, Target, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function MissionsPage() {
  const { data: missions } = useMissions();
  const { data: settings } = useSettings();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (key: string, id: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedId(id);
      toast({ title: "Copiado!", description: "Chave Pix copiada." });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível copiar.", variant: "destructive" });
    }
  };

  return (
    <SiteLayout>
      {/* Hero com Imagem */}
      <header className="relative overflow-hidden rounded-3xl">
        {/* Imagem de Fundo */}
        <div className="relative h-[300px] md:h-[400px]">
          <img
            src={missoesCapa}
            alt="Missões da Igreja"
            loading="lazy"
            className="h-full w-full object-cover"
          />
          {/* Overlay gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
        </div>

        {/* Conteúdo sobre a imagem */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-4 py-2 text-sm font-medium text-primary backdrop-blur-md shadow-lg">
            <Globe className="h-4 w-4" />
            Alcançando o Mundo
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold text-foreground md:text-5xl drop-shadow-sm">
            Missões
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Conheça nossos projetos missionários e saiba como você pode contribuir para levar o evangelho a todas as nações.
          </p>
        </div>
      </header>

      {/* Estatísticas Rápidas */}
      <section className="mt-8 grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { icon: Globe, label: "Países", value: "3+" },
          { icon: Heart, label: "Missionários", value: "5" },
          { icon: Target, label: "Projetos", value: String(missions?.length ?? 0) },
          { icon: Wallet, label: "Apoiadores", value: "50+" },
        ].map((stat, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-card to-primary/5 p-5 shadow-lg border-0"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="font-display text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Grid de Missões */}
      <section className="mt-10 grid gap-6 md:grid-cols-2">
        {(missions ?? []).map((m) => (
          <Card
            key={m.id}
            className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            {/* Linha decorativa */}
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary via-primary/80 to-primary/60" />

            {/* Efeito de brilho no hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <CardHeader className="relative pb-2">
              <CardTitle className="flex items-center justify-between gap-3 font-display">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
                    <Globe className="h-5 w-5" />
                  </div>
                  <span className="text-xl">{m.title}</span>
                </div>
                <Badge
                  className={`${m.status === "active"
                      ? "bg-green-500/10 text-green-600 border-green-500/30"
                      : "bg-muted text-muted-foreground"
                    } border`}
                >
                  {m.status === "active" ? "Ativo" : "Concluído"}
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="relative text-left">
              {m.description && (
                <div className="mb-4 rounded-xl bg-background/50 p-4 backdrop-blur">
                  <p className="text-muted-foreground leading-relaxed">{m.description}</p>
                </div>
              )}

              <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-3 mb-4">
                <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <div className="text-xs font-medium text-primary uppercase tracking-wide">Localização</div>
                  <span className="text-sm text-muted-foreground">{m.location ?? "A confirmar"}</span>
                </div>
              </div>

              {/* Card de Contribuição */}
              <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 ring-1 ring-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <Wallet className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Como contribuir</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded-lg bg-background/80 px-3 py-2 font-mono text-xs text-foreground">
                    {m.pix_key ?? settings?.pix_key ?? "SUA-CHAVE-PIX-AQUI"}
                  </code>
                  <Button
                    onClick={() => handleCopy(m.pix_key ?? settings?.pix_key ?? "", m.id)}
                    size="sm"
                    className={`shrink-0 transition-all duration-300 ${copiedId === m.id
                        ? "bg-green-500 text-white"
                        : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                      }`}
                  >
                    {copiedId === m.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!missions || missions.length === 0) && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed bg-gradient-to-br from-background to-primary/5 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <Globe className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground">Nenhum projeto cadastrado</h3>
            <p className="mt-2 text-muted-foreground max-w-sm">
              Em breve teremos projetos missionários para você apoiar.
            </p>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
