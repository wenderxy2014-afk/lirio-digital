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
            <CardTitle className="font-display">Devocional de hoje</CardTitle>
          </CardHeader>
          <CardContent className="text-left">
            {isLoading && <div className="text-sm text-muted-foreground">Carregando…</div>}

            {today && (
              <>
                <div className="font-display text-2xl">{today.title}</div>
                {today.bible_reference && (
                  <div className="mt-2 text-sm text-muted-foreground">{today.bible_reference}</div>
                )}
                <Separator className="my-4" />
                <div className="whitespace-pre-wrap text-sm text-muted-foreground">{today.body}</div>
              </>
            )}

            {!isLoading && !today && (
              <div className="text-sm text-muted-foreground">Ainda não há devocional de hoje.</div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl">Últimos devocionais</h2>
        <div className="mt-4 grid gap-3">
          {(list ?? []).map((d) => (
            <div key={d.id} className="rounded-2xl border bg-card p-4 text-left">
              <div className="text-xs text-muted-foreground">{d.day}</div>
              <div className="mt-1 font-medium">{d.title}</div>
              {d.bible_reference && <div className="mt-1 text-sm text-muted-foreground">{d.bible_reference}</div>}
            </div>
          ))}
          {(!list || list.length === 0) && (
            <div className="rounded-2xl border bg-card p-4 text-left text-sm text-muted-foreground">
              Nenhum devocional anterior ainda.
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
