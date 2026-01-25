import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useEbdDevotionalToday, useEbdDevotionalsList } from "@/data/ebd";
import { useState } from "react";
import { Minus, Plus, Type, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useAuth, hasAnyRole } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function EbdPage() {
  const { data: today, isLoading } = useEbdDevotionalToday();
  const { data: listData } = useEbdDevotionalsList(10);
  const { roles } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [cleaning, setCleaning] = useState(false);

  const canManage = hasAnyRole(roles, ["admin"]);

  // Filter out today's devotional from the list to avoid duplication
  const pastList = listData?.filter((d) => d.id !== today?.id).slice(0, 7);

  const handleCleanHistory = async () => {
    if (!confirm("Deseja realmente apagar todo o histórico antigo e manter apenas o de hoje?")) return;

    setCleaning(true);
    try {
      const { data, error } = await supabase.functions.invoke("ebd-devotional?clean=true");

      if (error) throw error;

      toast({ title: "Histórico limpo!", description: "Os devocionais antigos foram removidos." });
      queryClient.invalidateQueries({ queryKey: ["ebd"] });
    } catch (e: any) {
      toast({ title: "Erro ao limpar", description: e.message, variant: "destructive" });
    } finally {
      setCleaning(false);
    }
  };

  return (
    <SiteLayout>
      <header className="flex flex-wrap items-end justify-between gap-4 text-left">
        <div>
          <h1 className="font-display text-3xl">Ebd</h1>
          <p className="mt-2 text-muted-foreground">
            Estudos e devocionais diários. Todo dia um novo devocional é preparado automaticamente.
          </p>
        </div>

        {canManage && (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10"
            onClick={handleCleanHistory}
            disabled={cleaning}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {cleaning ? "Limpando..." : "Limpar Histórico Antigo"}
          </Button>
        )}
      </header>

      <section className="mt-8 space-y-6">
        {isLoading && <div className="text-sm text-muted-foreground">Carregando…</div>}

        {/* Destaque de Hoje */}
        {today && (
          <DevotionalCard
            devotional={today}
            defaultExpanded={true}
            label="Devocional de hoje"
          />
        )}

        {!isLoading && !today && (
          <Card className="p-6">
            <div className="text-sm text-muted-foreground">Ainda não há devocional de hoje.</div>
          </Card>
        )}

        {/* Lista de Anteriores */}
        {pastList && pastList.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 font-display text-2xl">Últimos 7 dias</h2>
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
  label
}: {
  devotional: { id: string; day: string; title: string; body: string; bible_reference?: string | null };
  defaultExpanded?: boolean;
  label?: string;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [fontSize, setFontSize] = useState(16);
  const formattedDate = devotional.day.split("-").reverse().join("/");

  return (
    <Card className="overflow-hidden transition-all duration-300">
      <CardHeader className="cursor-pointer select-none pb-2" onClick={() => setExpanded(!expanded)}>
        <CardTitle className="flex items-center justify-between font-display">
          <div className="flex items-center gap-2">
            <span>{label || devotional.title}</span>
            {!label && <span className="text-sm font-normal text-muted-foreground hidden sm:inline-block">- {formattedDate}</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal text-muted-foreground sm:hidden">{formattedDate}</span>
            {label && <span className="text-sm font-normal text-muted-foreground hidden sm:inline-block">{formattedDate}</span>}
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      {expanded && (
        <CardContent className="text-left animate-in slide-in-from-top-2 duration-200">
          {label && (
            <div className="mb-4">
              {/* Se tem label (Hoje), mostra titulo aqui dentro pois o titulo do card foi usado pelo Label */}
              <div className="font-display text-2xl">{devotional.title}</div>
              {devotional.bible_reference && <div className="mt-2 content-meta">{devotional.bible_reference}</div>}
            </div>
          )}

          {!label && devotional.bible_reference && (
            <div className="mb-4 content-meta">{devotional.bible_reference}</div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
            <div className="flex h-8 items-center gap-1 rounded-lg border bg-background/50 p-1 backdrop-blur">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setFontSize(s => Math.max(14, s - 2)); }}>
                <Minus className="h-3 w-3" />
              </Button>
              <Type className="h-3 w-3 text-muted-foreground" />
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setFontSize(s => Math.min(26, s + 2)); }}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <Separator className="mb-4" />

          {/* content-panel agora tem padding 0 e o scroll + padding estão dentro */}
          <div className="content-panel p-0 relative isolate">
            <div className="max-h-[500px] overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              <div
                className="whitespace-pre-wrap content-text transition-[font-size] duration-300"
                style={{ fontSize: `${fontSize}px`, lineHeight: '1.7' }}
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
