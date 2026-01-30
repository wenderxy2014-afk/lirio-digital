import { useRef, useEffect, useState } from "react";

export interface TickerConfig {
    text: string;
    enabled: boolean;
    speed: number;
    fontSize: string;
    textColor: string;
    backgroundColor: string;
    gradientFrom?: string;
    gradientTo?: string;
    useGradient: boolean;
    fontFamily: string;
    isBold: boolean;
    isUppercase: boolean;
    isItalic: boolean;
    effect: "scroll" | "pulse" | "static";
    style: "integrated" | "boxed"; // Novo: integrado ao fundo ou com caixa
}

export const defaultTickerConfig: TickerConfig = {
    text: "Bem Vindo (a) ao seu espaço aqui na igreja Lirio dos Vales de Belo Horizonte uma igreja que se importa!!!",
    enabled: true,
    speed: 5,
    fontSize: "text-4xl md:text-6xl lg:text-7xl",
    textColor: "#1a1a1a",
    backgroundColor: "transparent",
    gradientFrom: "transparent",
    gradientTo: "transparent",
    useGradient: false,
    fontFamily: "font-ticker",
    isBold: true,
    isUppercase: true,
    isItalic: true,
    effect: "scroll",
    style: "integrated",
};

export function Ticker({ config }: { config: TickerConfig }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);
    const [animationDuration, setAnimationDuration] = useState("30s");

    useEffect(() => {
        if (textRef.current && containerRef.current) {
            const textWidth = textRef.current.offsetWidth;
            const containerWidth = containerRef.current.offsetWidth;
            const totalDistance = textWidth + containerWidth;

            const baseDuration = config.speed || 5;
            // Velocidade ultra-rápida: menor número = mais rápido
            const calculatedDuration = Math.max(3, (totalDistance / 300) * (baseDuration / 5));

            setAnimationDuration(`${calculatedDuration}s`);
        }
    }, [config.text, config.fontSize, config.fontFamily, config.speed]);

    if (!config.enabled) return null;

    const fontClass = config.fontFamily || "font-display";
    const sizeClass = config.fontSize || "text-4xl md:text-6xl";
    const boldClass = config.isBold ? "font-black" : "font-bold";
    const uppercaseClass = config.isUppercase ? "uppercase tracking-tight" : "";
    const italicClass = config.isItalic ? "italic" : "";
    const safeColor = config.textColor || "#1a1a1a";

    // Estilo integrado (como Lagoinha) - sem bordas, fundo transparente ou com gradiente sutil
    const isIntegrated = config.style === "integrated";

    // Background style
    const bgStyle = isIntegrated
        ? config.useGradient
            ? {
                background: `linear-gradient(180deg, ${config.gradientFrom || "#d4a853"} 0%, ${config.gradientTo || "#c9a043"} 100%)`,
            }
            : { backgroundColor: config.backgroundColor || "transparent" }
        : config.useGradient
            ? {
                background: `linear-gradient(135deg, ${config.gradientFrom || "#FFD54F"} 0%, ${config.gradientTo || "#FF9800"} 100%)`,
            }
            : { backgroundColor: config.backgroundColor || "#FFC107" };

    // Text component with proper styling
    const TextContent = ({ isRef = false }: { isRef?: boolean }) => (
        <span
            ref={isRef ? textRef : undefined}
            className={`${fontClass} ${sizeClass} ${boldClass} ${uppercaseClass} ${italicClass} inline-block whitespace-nowrap select-none`}
            style={{
                color: safeColor,
                textShadow: isIntegrated ? "none" : "1px 1px 2px rgba(0,0,0,0.1)",
                letterSpacing: "-0.02em",
            }}
        >
            {config.text}
        </span>
    );

    // Separator between text repetitions
    const Separator = () => (
        <span className="mx-12 md:mx-20 inline-block" aria-hidden="true">
            <span className="inline-block w-3 h-3 md:w-4 md:h-4" />
        </span>
    );

    return (
        <div
            ref={containerRef}
            className={`relative w-full overflow-hidden ${isIntegrated ? "" : "shadow-lg rounded-2xl"}`}
            style={bgStyle}
        >
            <div className={`flex items-center overflow-hidden ${isIntegrated ? "py-6 md:py-10 lg:py-14" : "min-h-[56px] md:min-h-[64px] py-3"}`}>
                {config.effect === "scroll" ? (
                    <div
                        className="ticker-scroll whitespace-nowrap flex items-center"
                        style={{
                            animationDuration,
                            animationTimingFunction: "linear",
                            animationIterationCount: "infinite",
                        }}
                    >
                        {/* Multiple instances for seamless infinite scroll */}
                        <TextContent isRef={true} />
                        <Separator />
                        <TextContent />
                        <Separator />
                        <TextContent />
                        <Separator />
                        <TextContent />
                        <Separator />
                    </div>
                ) : config.effect === "pulse" ? (
                    <div className="w-full text-center px-4">
                        <span
                            className={`${fontClass} ${sizeClass} ${boldClass} ${uppercaseClass} ${italicClass} inline-block ticker-pulse`}
                            style={{ color: safeColor }}
                        >
                            {config.text}
                        </span>
                    </div>
                ) : (
                    <div className="w-full text-center px-4">
                        <span
                            className={`${fontClass} ${sizeClass} ${boldClass} ${uppercaseClass} ${italicClass} inline-block`}
                            style={{ color: safeColor }}
                        >
                            {config.text}
                        </span>
                    </div>
                )}
            </div>

            {/* CSS Animations */}
            <style>{`
        @keyframes ticker-scroll-animation {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-25%);
          }
        }
        
        @keyframes ticker-pulse-animation {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.01);
          }
        }
        
        .ticker-scroll {
          animation-name: ticker-scroll-animation;
        }
        
        .ticker-pulse {
          animation: ticker-pulse-animation 2.5s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
