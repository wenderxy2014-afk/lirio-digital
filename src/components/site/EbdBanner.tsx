import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEbdDevotionalToday } from "@/data/ebd";
import { BookOpen, Minus, Plus, Type } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EbdBanner() {
  const { data } = useEbdDevotionalToday();
  const [isExpanded, setIsExpanded] = useState(false);
  const [fontSize, setFontSize] = useState(16);

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

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-base md:text-lg font-bold">
              <BookOpen className="h-4 w-4" />
              <span>Devocional do dia (EBD)</span>
            </div>

            <span className="shrink-0 text-sm font-semibold">
              <span className="inline-flex items-center gap-2 rounded-xl bg-background/10 px-3 py-1 ring-1 ring-white/20 transition-colors group-hover:bg-background/20">
                {isExpanded ? "Fechar" : "Ler agora"}
                <span className={`inline-block h-1.5 w-1.5 rounded-full bg-primary-foreground ${isExpanded ? "" : "pulse"}`} />
              </span>
            </span>
          </div>
        </div>
      </Card>

      {/* Card de conteúdo que aparece/desaparece */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? "max-h-[2000px] opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
          }`}
      >
        {data && (
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

              {data.scripture && (
                <p className="text-sm text-pink-600 dark:text-pink-400 font-medium mb-4">
                  {data.scripture}
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
