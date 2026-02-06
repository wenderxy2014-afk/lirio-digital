import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Minus, Plus, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HistoryViewer, HistoryItem } from "./HistoryViewer";

// Tipos
type BannerStyle = "emerald" | "ocean" | "sunset" | "royal" | "rose" | "midnight" | "golden";
type BannerEffect = "default" | "pulse" | "glow" | "shimmer";
type FontColor = "white" | "cream" | "gold" | "light-blue";

// Configurações de estilos
const BANNER_STYLES: Record<BannerStyle, { gradient: string; shadow: string }> = {
    emerald: {
        gradient: "linear-gradient(90deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%)",
        shadow: "rgba(16, 185, 129, 0.4)"
    },
    ocean: {
        gradient: "linear-gradient(90deg, #3b82f6 0%, #06b6d4 50%, #14b8a6 100%)",
        shadow: "rgba(59, 130, 246, 0.4)"
    },
    sunset: {
        gradient: "linear-gradient(90deg, #f97316 0%, #f43f5e 50%, #ec4899 100%)",
        shadow: "rgba(249, 115, 22, 0.4)"
    },
    royal: {
        gradient: "linear-gradient(90deg, #9333ea 0%, #8b5cf6 50%, #6366f1 100%)",
        shadow: "rgba(147, 51, 234, 0.4)"
    },
    rose: {
        gradient: "linear-gradient(90deg, #ec4899 0%, #f43f5e 50%, #f87171 100%)",
        shadow: "rgba(236, 72, 153, 0.4)"
    },
    midnight: {
        gradient: "linear-gradient(90deg, #1e293b 0%, #334155 50%, #475569 100%)",
        shadow: "rgba(30, 41, 59, 0.4)"
    },
    golden: {
        gradient: "linear-gradient(90deg, #f59e0b 0%, #eab308 50%, #fb923c 100%)",
        shadow: "rgba(245, 158, 11, 0.4)"
    },
};

const FONT_COLORS: Record<FontColor, string> = {
    white: "#ffffff",
    cream: "#fffbeb",
    gold: "#fde047",
    "light-blue": "#e0f2fe",
};

export function PastorPearlsBanner() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [fontSize, setFontSize] = useState(16);

    // Buscar configurações do banner
    const { data: settingsData } = useQuery({
        queryKey: ["pastor-pearls-banner-settings"],
        queryFn: async () => {
            const { data } = await supabase
                .from("site_settings")
                .select("key, value")
                .in("key", [
                    "pastor_pearls_banner_enabled",
                    "pastor_pearls_banner_effect",
                    "pastor_pearls_banner_style",
                    "pastor_pearls_banner_font_color",
                ]);
            return data ?? [];
        },
        staleTime: 0,
        refetchOnWindowFocus: true,
    });

    // Parse das configurações
    const bannerEnabled = settingsData?.find(s => s.key === "pastor_pearls_banner_enabled")?.value !== "false";
    const bannerEffect: BannerEffect = (settingsData?.find(s => s.key === "pastor_pearls_banner_effect")?.value as BannerEffect) || "default";
    const bannerStyle: BannerStyle = (settingsData?.find(s => s.key === "pastor_pearls_banner_style")?.value as BannerStyle) || "emerald";
    const fontColor: FontColor = (settingsData?.find(s => s.key === "pastor_pearls_banner_font_color")?.value as FontColor) || "white";

    // Buscar a pérola mais recente publicada
    const { data: latestPearlFull } = useQuery({
        queryKey: ["latest-pastor-pearl-full"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("devotionals")
                .select("*")
                .eq("is_published", true)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (error) return null;
            return data;
        },
        staleTime: 0,
        refetchOnWindowFocus: true,
    });

    // Buscar histórico de pérolas
    const { data: historyData } = useQuery({
        queryKey: ["pastor-pearls-history"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("devotionals")
                .select("*")
                .eq("is_published", true)
                .order("created_at", { ascending: false })
                .limit(8); // Busca 8 para garantir 7 anteriores

            if (error) return [];
            return data;
        },
        staleTime: 1000 * 60 * 15, // 15 minutos
    });

    // Prepara itens de histórico
    const historyItems: HistoryItem[] = (historyData || [])
        .filter(item => item.id !== latestPearlFull?.id)
        .slice(0, 7)
        .map(item => ({
            id: item.id,
            title: item.title,
            date: item.created_at,
            content: item.body,
            subTitle: item.author || undefined
        }));

    // Não mostra o banner se estiver desativado ou não houver pérola publicada
    if (!bannerEnabled || !latestPearlFull) return null;

    // Obter estilos
    const styleConfig = BANNER_STYLES[bannerStyle];
    const textColor = FONT_COLORS[fontColor];

    // Gerar estilos baseados nas configurações
    const getStyles = (): React.CSSProperties => {
        const baseStyle: React.CSSProperties = {
            background: styleConfig.gradient,
            color: textColor,
            boxShadow: `0 10px 30px -10px ${styleConfig.shadow}`,
        };

        switch (bannerEffect) {
            case "pulse":
                return { ...baseStyle, animation: "pulse-banner 2s ease-in-out infinite" };
            case "glow":
                return { ...baseStyle, boxShadow: `0 0 30px ${styleConfig.shadow}, 0 0 60px ${styleConfig.shadow}` };
            case "shimmer":
                return { ...baseStyle, backgroundSize: "200% 100%", animation: "shimmer-banner 2s linear infinite" };
            default:
                return baseStyle;
        }
    };

    return (
        <>
            {/* CSS para animações */}
            <style>{`
        @keyframes pulse-banner {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.92; transform: scale(1.008); }
        }
        @keyframes shimmer-banner {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

            <div className="mx-auto w-full max-w-6xl px-4 pt-2">
                {/* Banner clicável */}
                <Card
                    className="group overflow-hidden border-0 transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
                    style={getStyles()}
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
                                <Crown className="h-4 w-4" />
                                <span>Pérola do Pastor</span>
                            </div>

                            <span className="shrink-0 text-sm font-semibold">
                                <span
                                    className="inline-flex items-center gap-2 rounded-xl px-3 py-1 transition-colors"
                                    style={{
                                        backgroundColor: "rgba(255,255,255,0.15)",
                                        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.3)",
                                    }}
                                >
                                    {isExpanded ? "Fechar" : "Ler agora"}
                                    <span className={`inline-block h-1.5 w-1.5 rounded-full bg-current ${isExpanded ? "" : "animate-pulse"}`} />
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
                    <Card className="overflow-hidden border-0 bg-gradient-to-br from-card via-card to-emerald-500/5 shadow-lg">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
                                    <Crown className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="font-semibold text-foreground">Pérola do Pastor</div>
                                    <div className="text-sm text-muted-foreground">
                                        {new Date(latestPearlFull.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="text-left">
                            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2">
                                {latestPearlFull.title}
                            </h2>

                            {latestPearlFull.author && (
                                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-4">
                                    {latestPearlFull.author}
                                </p>
                            )}

                            {/* Controles de Tamanho de Fonte */}
                            <div className="flex justify-end mb-4">
                                <div className="flex h-9 items-center gap-1 rounded-xl border bg-background/80 p-1.5 backdrop-blur shadow-sm">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 hover:bg-emerald-500/10"
                                        onClick={(e) => { e.stopPropagation(); setFontSize(s => Math.max(12, s - 2)); }}
                                    >
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <Type className="h-3 w-3 text-muted-foreground" />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 hover:bg-emerald-500/10"
                                        onClick={(e) => { e.stopPropagation(); setFontSize(s => Math.min(28, s + 2)); }}
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>

                            {/* Área de Texto com Scroll */}
                            {latestPearlFull.body && (
                                <div className="rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200/50 dark:border-emerald-800/30">
                                    <div className="max-h-[400px] overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-transparent">
                                        <p
                                            className="whitespace-pre-wrap text-foreground transition-[font-size] duration-300 leading-relaxed"
                                            style={{ fontSize: `${fontSize}px`, lineHeight: "1.8" }}
                                        >
                                            {latestPearlFull.body}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Botão de Histórico */}
                            {historyItems.length > 0 && (
                                <HistoryViewer
                                    title="Histórico de Pérolas"
                                    items={historyItems}
                                    triggerClassName="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
