import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Minus, Plus, Printer } from "lucide-react";
import { cn } from "@/lib/utils";

interface KidsMaterial {
    id: string;
    title: string;
    body?: string | null;
    video_url?: string | null;
    download_url?: string | null;
}

interface KidsMaterialCardProps {
    material: KidsMaterial;
}

const MAX_COLLAPSED_CHARS = 150;

export function KidsMaterialCard({ material }: KidsMaterialCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [fontScale, setFontScale] = useState(1); // 1 = 100%
    const contentRef = useRef<HTMLDivElement>(null);

    const bodyText = material.body ?? "Conteúdo a confirmar";
    const isLongText = bodyText.length > MAX_COLLAPSED_CHARS;

    // Texto truncado para exibição quando recolhido
    const displayText = isExpanded || !isLongText
        ? bodyText
        : bodyText.slice(0, MAX_COLLAPSED_CHARS) + "...";

    const handlePrint = () => {
        const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${material.title} - Igreja Batista Kids</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            line-height: 1.6;
          }
          h1 {
            color: #7c3aed;
            border-bottom: 3px solid #e9d5ff;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .content {
            font-size: 16px;
            color: #334155;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px dashed #e2e8f0;
            font-size: 12px;
            color: #94a3b8;
            text-align: center;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <h1>📖 ${material.title}</h1>
        <div class="content">${bodyText}</div>
        <div class="footer">
          Igreja Batista Lírio dos Vales - Área Kids<br>
          Impresso em ${new Date().toLocaleDateString('pt-BR')}
        </div>
      </body>
      </html>
    `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        }
    };

    const increaseFontSize = () => setFontScale(s => Math.min(1.5, s + 0.1));
    const decreaseFontSize = () => setFontScale(s => Math.max(0.8, s - 0.1));

    return (
        <Card className="overflow-hidden border-2 border-purple-100 hover:border-purple-300 transition-colors group">
            <CardHeader className="bg-purple-50 group-hover:bg-purple-100 transition-colors">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="font-display text-lg text-purple-800 break-words hyphens-auto leading-tight">
                        {material.title.length > 60 ? material.title.slice(0, 60) + "..." : material.title}
                    </CardTitle>

                    {/* Controles de fonte */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={decreaseFontSize}
                            disabled={fontScale <= 0.8}
                            className="h-6 w-6 rounded-full text-purple-600 hover:bg-purple-200"
                            title="Diminuir fonte"
                        >
                            <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-[10px] text-purple-500 font-bold w-8 text-center">
                            {Math.round(fontScale * 100)}%
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={increaseFontSize}
                            disabled={fontScale >= 1.5}
                            className="h-6 w-6 rounded-full text-purple-600 hover:bg-purple-200"
                            title="Aumentar fonte"
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="text-left p-5">
                {/* Área do texto com controle de tamanho */}
                <div
                    ref={contentRef}
                    className={cn(
                        "text-slate-600 leading-relaxed break-words hyphens-auto overflow-hidden transition-all duration-300",
                        !isExpanded && isLongText && "max-h-24"
                    )}
                    style={{ fontSize: `${fontScale}rem` }}
                >
                    <p className="whitespace-pre-wrap">{displayText}</p>
                </div>

                {/* Botão Expandir/Recolher */}
                {isLongText && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 p-0 h-auto font-medium"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp className="h-4 w-4 mr-1" />
                                Recolher texto
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-4 w-4 mr-1" />
                                Ler mais...
                            </>
                        )}
                    </Button>
                )}

                {/* Botões de ação */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {material.video_url && (
                        <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="text-xs h-8 bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300"
                        >
                            <a href={material.video_url} target="_blank" rel="noreferrer">
                                📺 Assistir vídeo
                            </a>
                        </Button>
                    )}

                    {material.download_url && (
                        <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="text-xs h-8 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:border-blue-300"
                        >
                            <a href={material.download_url} target="_blank" rel="noreferrer">
                                📥 Baixar
                            </a>
                        </Button>
                    )}

                    {/* Botão Imprimir */}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handlePrint}
                        className="text-xs h-8 bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300"
                    >
                        <Printer className="h-3.5 w-3.5 mr-1" />
                        Imprimir
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
