import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DevotionalDetailPage() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["devotional", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("devotionals").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  return (
    <SiteLayout>
      {isLoading && <div className="rounded-3xl border bg-card p-6 text-left">Carregando…</div>}
      {!isLoading && !data && (
        <div className="rounded-3xl border bg-card p-6 text-left text-muted-foreground">Devocional não encontrado.</div>
      )}
      {data && (
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="font-display text-2xl">{data.title}</CardTitle>
          </CardHeader>
          <CardContent className="text-left">
            {data.author && <div className="text-sm font-medium">{data.author}</div>}
            {data.body && (
              <div className="mt-4 content-panel">
                <p className="whitespace-pre-wrap content-text">{data.body}</p>
              </div>
            )}
            {data.video_url && (
              <a className="mt-4 inline-block brand-underline text-sm" href={data.video_url} target="_blank" rel="noreferrer">
                Assistir vídeo
              </a>
            )}
            {data.download_url && (
              <a className="mt-4 ml-4 inline-block brand-underline text-sm" href={data.download_url} target="_blank" rel="noreferrer">
                Baixar material
              </a>
            )}
          </CardContent>
        </Card>
      )}
    </SiteLayout>
  );
}
