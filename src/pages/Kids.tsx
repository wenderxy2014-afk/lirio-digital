import { SiteLayout } from "@/components/site/SiteLayout";
import { KidsDailyQuiz } from "@/components/kids/KidsDailyQuiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useKids, useKidsDailyList, useKidsDailyToday } from "@/data/queries";

import kidsBoyNew from "@/assets/kids-boy-new.png";
import kidsGroupNew from "@/assets/kids-group-new.png";

export default function KidsPage() {
  const { data: today, isLoading: isTodayLoading, error: todayError } = useKidsDailyToday();
  const { data: dailyList } = useKidsDailyList(14);
  const { data } = useKids();

  return (
    <SiteLayout>
      <header className="text-left">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="relative z-10">
            <h1 className="font-display text-3xl">Área Kids</h1>
            <p className="mt-2 text-muted-foreground">Lição do dia, atividades e joguinhos bíblicos (7–10 anos).</p>
          </div>

          <div className="flex items-end gap-2 pr-4">
            <img
              src={kidsGroupNew}
              alt="Turma Kids"
              loading="lazy"
              className="h-24 w-auto select-none sm:h-32"
            />
            <img
              src={kidsBoyNew}
              alt="Mascote Kids"
              loading="lazy"
              className="h-28 w-auto select-none sm:h-36"
            />
          </div>
        </div>
      </header>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="font-display">{today?.title ?? "Conteúdo Kids do dia"}</CardTitle>
              {today?.bible_reference && (
                <p className="mt-1 text-sm text-muted-foreground">{today.bible_reference}</p>
              )}
            </CardHeader>
            <CardContent className="text-left">
              {isTodayLoading && <p className="text-sm text-muted-foreground">Gerando o conteúdo de hoje…</p>}
              {todayError && (
                <p className="text-sm text-muted-foreground">Não foi possível carregar o conteúdo de hoje agora.</p>
              )}

              {today && (
                <>
                  <div className="content-panel">
                    <p className="content-text whitespace-pre-line">{today.lesson_body}</p>
                  </div>

                  <div className="mt-4 content-panel">
                    <h2 className="font-display text-lg">Atividade do dia</h2>
                    <p className="content-text mt-2 whitespace-pre-line">{today.activity}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="relative mt-8">
            {/* Decoração duplicada: Menino pulando perto do Quiz */}
            <img
              src={kidsBoyNew}
              alt=""
              className="absolute -right-2 -top-12 z-10 h-24 w-auto rotate-12 select-none opacity-90 transition-transform hover:scale-110 lg:-right-8 lg:-top-16 lg:h-32"
            />
            <KidsDailyQuiz quiz={today?.quiz} />
          </div>

          <section className="mt-10">
            <header className="relative flex items-end justify-between text-left">
              <div className="relative z-10">
                <h2 className="font-display text-2xl">Materiais extras</h2>
                <p className="mt-1 text-sm text-muted-foreground">Vídeos e downloads (conteúdo fixo).</p>
              </div>

              {/* Decoração duplicada: Grupo observando os materiais */}
              <img
                src={kidsGroupNew}
                alt=""
                className="absolute right-0 top-0 -z-0 h-24 w-auto -translate-y-1/2 select-none opacity-20 brightness-110 grayscale sm:relative sm:top-auto sm:h-20 sm:translate-y-0 sm:opacity-100 sm:grayscale-0 md:h-24"
              />
            </header>

            <div className="mt-4 grid gap-6 md:grid-cols-2">
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
            </div>
          </section>
        </div>

        <aside className="lg:col-span-1">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="font-display">Últimos dias</CardTitle>
            </CardHeader>
            <CardContent className="text-left">
              <ul className="space-y-3">
                {(dailyList ?? []).map((d) => (
                  <li key={d.id} className="rounded-xl border bg-background/30 p-3">
                    <div className="text-xs text-muted-foreground">{d.day}</div>
                    <div className="mt-1 font-medium">{d.title}</div>
                    {d.bible_reference && <div className="mt-1 text-sm text-muted-foreground">{d.bible_reference}</div>}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </aside>
      </section>
    </SiteLayout>
  );
}
