import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useEbdDevotionalToday, useEbdDevotionalsList } from "@/data/ebd";
import { useState } from "react";
import { Minus, Plus, Type, ChevronDown, ChevronUp, Trash2, BookOpen, Calendar, Sparkles } from "lucide-react";
import { useAuth, hasAnyRole } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";


export default function EbdPage() {
  const { data: today, isLoading, isFetching } = useEbdDevotionalToday();
  const { data: listData, isLoading: isLoadingList, isFetching: isFetchingList } = useEbdDevotionalsList(10);

  // Check if any data is being loaded or revalidated
  const isRefreshing = isLoading || isFetching || isLoadingList || isFetchingList;
  const { roles, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [cleaning, setCleaning] = useState(false);

  const canManage = hasAnyRole(roles, ["admin", "editor"]);

  // Filter logic...
  const pastList = listData?.reduce((acc: any[], current) => {
    // ... filtering logic ...
    const isToday = current.id === today?.id;
    const isDuplicate = acc.some(item => item.title === current.title);
    const isSameAsToday = today?.title === current.title;
    const isRepetitive = current.title.includes("A Rocha que não se Abala");
    const isDraft = current.title.toUpperCase().includes("[RASCUNHO]");

    if (!isToday && !isDuplicate && !isSameAsToday && !isRepetitive && !isDraft) {
      acc.push(current);
    }
    return acc;
  }, []).slice(0, 7);



  const handleCleanHistory = async () => {
    // ... existing handler ...
    if (!user) {
      toast({
        title: "Acesso Negado",
        description: "Você precisa estar logado como administrador para realizar esta ação.",
        variant: "destructive"
      });
      return;
    }

    if (!confirm("Isso apagará TODO o histórico do banco de dados para recomeçar do zero. Continuar?")) return;

    setCleaning(true);
    try {
      const { data, error } = await supabase
        .from("ebd_devotionals")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000")
        .select();

      if (error) throw error;

      const count = data?.length ?? 0;
      toast({
        title: "Limpeza Completa!",
        description: `Removidos ${count} registros. O sistema vai gerar um guia novo em instantes.`
      });

      await queryClient.invalidateQueries({ queryKey: ["ebd"] });
    } catch (e: any) {
      console.error("Erro ao limpar:", e);
      toast({
        title: "Erro",
        description: e.message,
        variant: "destructive"
      });
    } finally {
      setCleaning(false);
    }
  };

  return (
    <SiteLayout>
      {/* ... Header ... */}
      <header className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8 md:p-12">
        {/* ... Header Content ... */}
        <div className="absolute right-8 top-8 text-primary/10">
          <BookOpen className="h-32 w-32 md:h-40 md:w-40" />
        </div>

        <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur">
              <BookOpen className="h-4 w-4" />
              Escola Bíblica Dominical
            </div>
            <h1 className="mt-4 font-display text-4xl font-bold text-foreground md:text-5xl">
              EBD
            </h1>
            <p className="mt-3 max-w-xl text-lg text-muted-foreground">
              Estudos e devocionais diários para fortalecer sua caminhada com Deus.
            </p>
          </div>

          {canManage && (
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/50 text-destructive hover:bg-destructive hover:text-white transition-all"
              onClick={handleCleanHistory}
              disabled={cleaning || isLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {cleaning ? "Limpando..." : "ADMIN: LIMPAR TUDO"}
            </Button>
          )}
        </div>
      </header>

      <section className="mt-10 space-y-8">
        {isRefreshing && (
          <div className="flex items-center justify-center rounded-3xl border border-dashed bg-gradient-to-br from-background to-primary/5 p-12">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Carregando devocional…
            </div>
          </div>
        )}

        {/* Destaque de Hoje */}
        {!isRefreshing && today && !today.title.toUpperCase().includes("[RASCUNHO]") && (
          <DevotionalCard
            devotional={today}
            defaultExpanded={true}
            label="Devocional de hoje"
            isHighlighted={true}
          />
        )}

        {!isRefreshing && (!today || today.title.toUpperCase().includes("[RASCUNHO]")) && (
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-card to-primary/5 p-8 shadow-lg text-center">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground">Ainda não há devocional de hoje. Volte em breve!</p>
            </div>
          </Card>
        )}

        {/* Lista de Anteriores */}
        {!isRefreshing && pastList && pastList.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">Últimos 7 dias</h2>
            </div>
            <div className="flex flex-col gap-4">
              {pastList.map((devotional) => (
                <DevotionalCard
                  key={devotional.id}
                  devotional={devotional}
                  defaultExpanded={false}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

function DevotionalCard({
  devotional,
  defaultExpanded = false,
  label,
  isHighlighted = false
}: {
  devotional: { id: string; day: string; title: string; body: string; bible_reference?: string | null };
  defaultExpanded?: boolean;
  label?: string;
  isHighlighted?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [fontSize, setFontSize] = useState(16);
  const formattedDate = devotional.day.split("-").reverse().join("/");

  return (
    <Card className={`group relative overflow-hidden border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${isHighlighted
      ? "bg-gradient-to-br from-primary/10 via-card to-primary/5 ring-2 ring-primary/20"
      : "bg-gradient-to-br from-card via-card to-primary/5"
      }`}>
      {/* Linha decorativa */}
      {isHighlighted && (
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary via-primary/80 to-primary/60" />
      )}

      <CardHeader
        className="cursor-pointer select-none pb-2 transition-colors hover:bg-primary/5"
        onClick={() => setExpanded(!expanded)}
      >
        <CardTitle className="flex items-center justify-between font-display">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-lg ${isHighlighted
              ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
              : "bg-primary/10 text-primary"
              }`}>
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg">{label || devotional.title}</span>
              {label && (
                <div className="text-sm font-normal text-muted-foreground">{formattedDate}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!label && (
              <span className="text-sm font-normal text-muted-foreground">{formattedDate}</span>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 hover:bg-primary/10">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      {expanded && (
        <CardContent className="text-left animate-in slide-in-from-top-2 duration-200">
          {label && (
            <div className="mb-4 rounded-xl bg-background/50 p-4 backdrop-blur">
              <div className="font-display text-2xl font-bold text-foreground">{devotional.title}</div>
              {devotional.bible_reference && (
                <div className="mt-2 text-sm font-medium text-primary">{devotional.bible_reference}</div>
              )}
            </div>
          )}

          {!label && devotional.bible_reference && (
            <div className="mb-4 inline-flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <BookOpen className="h-4 w-4" />
              {devotional.bible_reference}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
            <div className="flex h-9 items-center gap-1 rounded-xl border bg-background/80 p-1.5 backdrop-blur shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-primary/10"
                onClick={(e) => { e.stopPropagation(); setFontSize(s => Math.max(14, s - 2)); }}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Type className="h-3 w-3 text-muted-foreground" />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-primary/10"
                onClick={(e) => { e.stopPropagation(); setFontSize(s => Math.min(26, s + 2)); }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <Separator className="mb-4" />

          <div className="rounded-2xl bg-background/50 p-0 backdrop-blur relative overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              <div
                className="whitespace-pre-wrap text-muted-foreground transition-[font-size] duration-300 leading-relaxed"
                style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
              >
                {devotional.body}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
