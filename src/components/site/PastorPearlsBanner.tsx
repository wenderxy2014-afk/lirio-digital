import { Card } from "@/components/ui/card";
import { NavLink } from "@/components/NavLink";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Crown } from "lucide-react";

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
    const { data: latestPearl } = useQuery({
        queryKey: ["latest-pastor-pearl"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("devotionals")
                .select("id, title, created_at")
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

    // Não mostra o banner se estiver desativado ou não houver pérola publicada
    if (!bannerEnabled || !latestPearl) return null;

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

        // Adicionar efeitos
        switch (bannerEffect) {
            case "pulse":
                return {
                    ...baseStyle,
                    animation: "pulse-banner 2s ease-in-out infinite",
                };
            case "glow":
                return {
                    ...baseStyle,
                    boxShadow: `0 0 30px ${styleConfig.shadow}, 0 0 60px ${styleConfig.shadow}`,
                };
            case "shimmer":
                return {
                    ...baseStyle,
                    backgroundSize: "200% 100%",
                    animation: "shimmer-banner 2s linear infinite",
                };
            default:
                return baseStyle;
        }
    };

    return (
        <>
            {/* CSS para animações */}
            <style>{`
        @keyframes pulse-banner {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.92;
            transform: scale(1.008);
          }
        }
        
        @keyframes shimmer-banner {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>

            <div className="mx-auto w-full max-w-6xl px-4 pt-2">
                <Card
                    className="group overflow-hidden border-0 transition-all duration-300 hover:-translate-y-0.5"
                    style={getStyles()}
                >
                    <NavLink
                        to={`/membro/devocionais/${latestPearl.id}`}
                        className="relative flex items-center justify-between gap-4 px-4 py-3 text-left md:px-6"
                    >
                        <div
                            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                            style={{
                                backgroundImage:
                                    "radial-gradient(700px circle at 20% 20%, rgba(255,255,255,0.22), transparent 40%), radial-gradient(700px circle at 80% 40%, rgba(255,255,255,0.16), transparent 45%)",
                            }}
                        />

                        <div className="relative z-10 min-w-0">
                            <div className="flex items-center gap-2 text-base md:text-lg font-bold">
                                <Crown className="h-4 w-4" />
                                <span>Pérola do Pastor</span>
                            </div>
                            <div className="mt-1 line-clamp-1 font-display text-sm md:text-base opacity-90">
                                {latestPearl.title}
                            </div>
                        </div>

                        <span className="relative z-10 shrink-0 text-sm font-semibold">
                            <span
                                className="inline-flex items-center gap-2 rounded-xl px-3 py-1 transition-colors"
                                style={{
                                    backgroundColor: "rgba(255,255,255,0.15)",
                                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.3)",
                                }}
                            >
                                Ler agora
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                            </span>
                        </span>
                    </NavLink>
                </Card>
            </div>
        </>
    );
}
