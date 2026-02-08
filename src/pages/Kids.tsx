import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { KidsDailyQuiz } from "@/components/kids/KidsDailyQuiz";
import { KidsMaterialCard } from "@/components/kids/KidsMaterialCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useKids, useKidsDailyList, useKidsDailyToday } from "@/data/queries";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

import kidsBoyNew from "@/assets/kids-boy-new.png";
import kidsGroupNew from "@/assets/kids-group-new.png";

export default function KidsPage() {
  const { data: today, isLoading: isTodayLoading, error: todayError } = useKidsDailyToday();
  const { data: dailyList } = useKidsDailyList(7);
  const { data } = useKids();

  const [fontScale, setFontScale] = useState(1); // 1 = 16px (1rem) standard base

  return (
    <SiteLayout>
      <header className="relative text-left flex flex-col gap-6 md:flex-row md:items-end md:justify-between pb-8 border-b-2 border-dashed border-sky-300 mx-4 md:mx-0">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700 uppercase tracking-wider">
            <span className="animate-bounce">🎈</span> Área Infantil
          </div>
          <h1 className="font-display text-4xl text-sky-600 drop-shadow-sm md:text-5xl">Área Kids</h1>
          <p className="mt-4 text-lg text-slate-600 font-medium leading-relaxed">
            Lição do dia, atividades e joguinhos bíblicos para crianças de 7 a 10 anos.
            Aprender a palavra de Deus nunca foi tão divertido!
          </p>

          <div className="mt-6 flex items-center gap-2">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider mr-2">Tamanho da letra:</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setFontScale(s => Math.max(0.8, s - 0.1))}
              className="h-8 w-8 rounded-full border-2 border-slate-200 hover:border-sky-400 hover:text-sky-600"
              disabled={fontScale <= 0.8}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="min-w-[3rem] text-center font-bold text-slate-600">{Math.round(fontScale * 100)}%</div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setFontScale(s => Math.min(1.5, s + 0.1))}
              className="h-8 w-8 rounded-full border-2 border-slate-200 hover:border-sky-400 hover:text-sky-600"
              disabled={fontScale >= 1.5}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-end gap-2 pr-4 md:-mb-8">
          <img
            src={kidsGroupNew}
            alt="Turma Kids"
            loading="lazy"
            className="h-40 w-auto select-none sm:h-64 object-contain filter drop-shadow-xl hover:scale-105 transition-transform duration-500"
          />
          <img
            src={kidsBoyNew}
            alt="Mascote Kids"
            loading="lazy"
            className="h-48 w-auto select-none sm:h-72 object-contain filter drop-shadow-xl hover:-rotate-6 transition-transform duration-500 origin-bottom"
          />
        </div>
      </header>

      <div style={{ fontSize: `${fontScale}rem` }} className="transition-all duration-300">
        <section className="mt-12 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Card className="overflow-hidden border-2 border-sky-100 shadow-lg ring-4 ring-sky-50">
              <CardHeader className="bg-sky-50 border-b border-sky-100 pb-6">
                <CardTitle className="font-display text-2xl text-sky-700">
                  {today?.title ?? "Conteúdo Kids do dia"}
                </CardTitle>
                {today?.bible_reference && (
                  <div className="mt-2 inline-flex items-center rounded-lg bg-white px-3 py-1 text-sm font-bold text-sky-500 shadow-sm">
                    📖 {today.bible_reference}
                  </div>
                )}
              </CardHeader>
              <CardContent className="text-left p-6 md:p-8">
                {isTodayLoading && <p className="text-muted-foreground animate-pulse">Gerando o conteúdo de hoje…</p>}
                {todayError && (
                  <p className="text-red-500 font-medium">Não foi possível carregar o conteúdo de hoje agora.</p>
                )}

                {today && (
                  <>
                    <div className="content-panel rounded-2xl bg-white p-0">
                      <p className="whitespace-pre-line leading-relaxed text-slate-700">
                        {today.lesson_body}
                      </p>
                    </div>

                    <div className="mt-8 rounded-2xl bg-yellow-50 p-6 border-2 border-yellow-100 shadow-inner">
                      <h2 className="font-display text-xl text-yellow-700 mb-4 flex items-center gap-2">
                        🎨 Atividade do dia
                      </h2>
                      <p className="whitespace-pre-line text-slate-700 leading-relaxed font-medium">
                        {today.activity}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="relative mt-12 pt-8">
              {/* Decorative elements around quiz */}
              <div className="absolute -top-6 left-10 text-4xl animate-bounce delay-700">⭐</div>
              <div className="absolute top-10 -right-4 text-3xl animate-pulse">✨</div>

              <img
                src={kidsBoyNew}
                alt=""
                className="absolute -right-4 -top-20 z-10 h-40 w-auto rotate-12 select-none opacity-90 transition-transform hover:scale-110 lg:-right-10 lg:-top-24 lg:h-56 filter drop-shadow-lg"
              />
              <KidsDailyQuiz quiz={today?.quiz} />
            </div>

            <section className="mt-16 pt-8 border-t-2 border-dashed border-slate-200">
              <header className="relative flex items-end justify-between text-left mb-8">
                <div className="relative z-10">
                  <h2 className="font-display text-3xl text-purple-600">Materiais extras</h2>
                  <p className="mt-2 text-slate-500 font-medium">Vídeos e downloads para aprender mais!</p>
                </div>

                <img
                  src={kidsGroupNew}
                  alt=""
                  className="absolute right-0 top-0 h-24 w-auto select-none opacity-30 grayscale sm:relative sm:h-32 sm:opacity-100 sm:grayscale-0"
                />
              </header>

              <div className="grid gap-6 md:grid-cols-2">
                {(data ?? []).slice(0, 8).map((k) => (
                  <KidsMaterialCard key={k.id} material={k} />
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-1">
            <Card className="overflow-hidden border-2 border-slate-100 sticky top-24">
              <CardHeader className="bg-slate-50">
                <CardTitle className="font-display text-slate-700">Últimos dias</CardTitle>
              </CardHeader>
              <CardContent className="text-left p-4">
                <ul className="space-y-3">
                  {(dailyList ?? []).map((d) => (
                    <li key={d.id} className="rounded-xl border border-slate-100 bg-white p-3 hover:border-sky-200 hover:shadow-md transition-all cursor-default">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-sky-500 uppercase">
                          {d.day ? new Date(d.day).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                        </span>
                        {d.bible_reference && <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">{d.bible_reference}</span>}
                      </div>
                      <div className="mt-1 font-bold text-slate-700">{d.title}</div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </aside>
        </section>
      </div>
    </SiteLayout>
  );
}
