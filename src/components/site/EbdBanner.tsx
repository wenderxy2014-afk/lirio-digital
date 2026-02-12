import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEbdDevotionalToday, useEbdDevotionalsList } from "@/data/ebd";
import { BookOpen, Minus, Plus, Type, History, Sparkles, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { HistoryItem } from "./HistoryViewer";

export function EbdBanner() {
  const { data, isLoading, isFetching } = useEbdDevotionalToday();
  const { data: historyData, isLoading: isLoadingHistory, isFetching: isFetchingHistory } = useEbdDevotionalsList(8); // Busca 8 para garantir 7 anteriores
  const [isExpanded, setIsExpanded] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  // Check if any data is being loaded or revalidated
  const isRefreshing = isLoading || isFetching || isLoadingHistory || isFetchingHistory;

  // Prepara itens do histórico (filtrando o atual se possível)
  const historyItems: HistoryItem[] = (historyData || [])
    .filter(item => item.id !== data?.id) // Remove o atual da lista
    .slice(0, 7) // Pega apenas os 7 últimos anteriores
    .map(item => ({
      id: item.id,
      title: item.title,
      date: item.created_at || new Date().toISOString(), // Fallback segura
      content: item.body,
      subTitle: item.bible_reference || undefined
    }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-4">
      {/* Banner clicável */}
      <Card
        className="group overflow-hidden border bg-brand text-primary-foreground shadow-glow transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="relative px-4 py-3 md:px-6">
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              backgroundImage:
                "radial-gradient(700px circle at 20% 20%, rgba(255,255,255,0.22), transparent 40%), radial-gradient(700px circle at 80% 40%, rgba(255,255,255,0.16), transparent 45%)",
            }}
          />

          <div className="relative z-10 flex flex-col gap-2">
            {/* Linha principal: Título + Destaque (desktop inline) + Botão */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm md:text-lg font-bold">
                <BookOpen className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">Devocional do dia (EBD)</span>
              </div>

              {/* Destaque com Data e Título - DESKTOP */}
              {data && !isRefreshing && (
                <div className="hidden md:flex items-center gap-3 mx-4 flex-1 justify-center">
                  <div
                    className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-bold shadow-lg"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.95)",
                      color: "#be185d",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.15), inset 0 0 0 2px rgba(219,39,119,0.3)",
                    }}
                  >
                    <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                    <span className="text-pink-700 font-bold max-w-[180px] truncate">{data.title}</span>
                    <span className="text-pink-600/60">•</span>
                    <Calendar className="h-4 w-4 text-pink-600" />
                    <span className="text-pink-700">{data.day.split("-").reverse().join("/")}</span>
                  </div>
                </div>
              )}

              <span className="shrink-0 text-sm font-semibold">
                <span className="inline-flex items-center gap-2 rounded-xl bg-background/10 px-3 py-1 ring-1 ring-white/20 transition-colors group-hover:bg-background/20">
                  {isExpanded ? "Fechar" : "Ler agora"}
                  <span className={`inline-block h-1.5 w-1.5 rounded-full bg-primary-foreground ${isExpanded ? "" : "pulse"}`} />
                </span>
              </span>
            </div>

            {/* Destaque com Data e Título - MOBILE (segunda linha) */}
            {data && !isRefreshing && (
              <div className="flex md:hidden items-center justify-center">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md w-full justify-center"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.93)",
                    color: "#be185d",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.12), inset 0 0 0 1.5px rgba(219,39,119,0.25)",
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse shrink-0" />
                  <span className="text-pink-700 font-bold truncate max-w-[45%]">{data.title}</span>
                  <span className="text-pink-600/60">•</span>
                  <Calendar className="h-3.5 w-3.5 text-pink-600 shrink-0" />
                  <span className="text-pink-700 whitespace-nowrap">{data.day.split("-").reverse().join("/")}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Card de conteúdo que aparece/desaparece */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? "max-h-[2000px] opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
          }`}
      >
        {/* Show skeleton while loading/refreshing */}
        {isRefreshing && isExpanded && (
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-card via-card to-pink-500/5 shadow-lg p-8">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="h-3 w-24 rounded bg-muted" />
                </div>
              </div>
              <div className="h-6 w-3/4 rounded bg-muted" />
              <div className="h-4 w-1/4 rounded bg-muted" />
              <div className="h-48 w-full rounded-2xl bg-muted" />
            </div>
          </Card>
        )}

        {!isRefreshing && data && (
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-card via-card to-pink-500/5 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Devocional de hoje</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="text-left">
              <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2">
                {data.title}
              </h2>

              {data.bible_reference && (
                <p className="text-sm text-pink-600 dark:text-pink-400 font-medium mb-4">
                  {data.bible_reference}
                </p>
              )}

              {/* Controles de Tamanho de Fonte */}
              <div className="flex justify-end mb-4">
                <div className="flex h-9 items-center gap-1 rounded-xl border bg-background/80 p-1.5 backdrop-blur shadow-sm">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-pink-500/10"
                    onClick={(e) => { e.stopPropagation(); setFontSize(s => Math.max(12, s - 2)); }}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Type className="h-3 w-3 text-muted-foreground" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-pink-500/10"
                    onClick={(e) => { e.stopPropagation(); setFontSize(s => Math.min(28, s + 2)); }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Área de Texto com Scroll */}
              {data.body && (
                <div className="rounded-2xl bg-gradient-to-br from-pink-50/50 to-rose-50/50 dark:from-pink-950/20 dark:to-rose-950/20 border border-pink-200/50 dark:border-pink-800/30">
                  <div className="max-h-[400px] overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-transparent">
                    <p
                      className="whitespace-pre-wrap text-foreground transition-[font-size] duration-300 leading-relaxed"
                      style={{ fontSize: `${fontSize}px`, lineHeight: "1.8" }}
                    >
                      {data.body}
                    </p>
                  </div>
                </div>
              )}

              {/* Botão de Histórico - Redireciona para página EBD */}
              {historyItems.length > 0 && (
                <NavLink to="/ebd">
                  <Button className="mt-6 w-full gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-md transition-all hover:-translate-y-0.5">
                    <History className="h-4 w-4" />
                    Ver postagens anteriores
                  </Button>
                </NavLink>
              )}

            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
