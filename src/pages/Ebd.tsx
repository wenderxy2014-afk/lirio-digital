import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEbdDevotionalToday, useEbdDevotionalsList } from "@/data/ebd";

export default function EbdPage() {
  const { data: today, isLoading } = useEbdDevotionalToday();
  const { data: list } = useEbdDevotionalsList(30);

  return (
    <SiteLayout>
      <header className="text-left">
        <h1 className="font-display text-3xl">EBD</h1>
        <p className="mt-2 text-muted-foreground">
          Estudos e devocionais diários. Todo dia um novo devocional é preparado automaticamente.
        </p>
      </header>

      <section className="mt-8">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center justify-between font-display">
              <span>Devocional de hoje</span>
              {today && (
                <span className="text-sm font-normal text-muted-foreground">
                  {today.day.split("-").reverse().join("/")}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-left">
            {isLoading && <div className="text-sm text-muted-foreground">Carregando…</div>}

            {today && (
              <>
                <div className="font-display text-2xl">{today.title}</div>
                {today.bible_reference && <div className="mt-2 content-meta">{today.bible_reference}</div>}
                <Separator className="my-4" />
                <div className="content-panel">
                  <div className="whitespace-pre-wrap content-text">{today.body}</div>
                </div>
              </>
            )}

            {!isLoading && !today && <div className="text-sm text-muted-foreground">Ainda não há devocional de hoje.</div>}
          </CardContent>
        </Card>
      </section>
    </SiteLayout>
  );
}
