import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useKids } from "@/data/queries";

export default function KidsPage() {
  const { data } = useKids();

  return (
    <SiteLayout>
      <header className="text-left">
        <h1 className="font-display text-3xl">Área Kids</h1>
        <p className="mt-2 text-muted-foreground">Lições, vídeos e atividades para as crianças.</p>
      </header>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        {(data ?? []).map((k) => (
          <Card key={k.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="font-display">{k.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-left">
              <p className="text-sm text-muted-foreground">{k.body ?? "Conteúdo a confirmar"}</p>
              {k.video_url && (
                <a className="mt-3 inline-block brand-underline text-sm" href={k.video_url} target="_blank" rel="noreferrer">
                  Assistir vídeo
                </a>
              )}
              {k.download_url && (
                <a className="mt-3 ml-4 inline-block brand-underline text-sm" href={k.download_url} target="_blank" rel="noreferrer">
                  Baixar material
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </section>
    </SiteLayout>
  );
}
