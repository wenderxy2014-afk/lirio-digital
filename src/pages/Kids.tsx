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
              <div className="content-panel">
                <p className="content-text">{k.body ?? "Conteúdo a confirmar"}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                {k.video_url && (
                  <a className="inline-block brand-underline text-sm" href={k.video_url} target="_blank" rel="noreferrer">
                    Assistir vídeo
                  </a>
                )}
                {k.download_url && (
                  <a className="inline-block brand-underline text-sm" href={k.download_url} target="_blank" rel="noreferrer">
                    Baixar material
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </SiteLayout>
  );
}
