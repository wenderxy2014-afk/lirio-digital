
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Calendar, History } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HistoryItem {
    id: string;
    title: string;
    date: string; // ISO string ou formatada
    content: string;
    subTitle?: string; // Para autor ou referência bíblica
}

interface HistoryViewerProps {
    title: string;
    items: HistoryItem[];
    triggerVerify?: boolean;
    triggerClassName?: string;
    triggerText?: string;
}

export function HistoryViewer({ title, items, triggerClassName, triggerText = "Ver postagens anteriores" }: HistoryViewerProps) {
    const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) setSelectedItem(null);
        }}>
            <DialogTrigger asChild>
                <Button
                    className={cn(
                        "mt-6 w-full gap-2 border-0 shadow-md transition-all hover:-translate-y-0.5",
                        triggerClassName || "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                >
                    <History className="h-4 w-4" />
                    {triggerText}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        {selectedItem && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="-ml-2 mr-1 h-8 w-8"
                                onClick={() => setSelectedItem(null)}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
                        {selectedItem ? "Voltar para lista" : title}
                    </DialogTitle>
                </DialogHeader>

                {/* Conteúdo - Renderização Condicional Simples */}
                {!selectedItem ? (
                    // Lista de Histórico
                    <ScrollArea className="h-[60vh] px-6 pb-6">
                        {items.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">Nenhuma postagem anterior encontrada.</p>
                        ) : (
                            <div className="space-y-3">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        className="p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                                    {item.title}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{new Date(item.date).toLocaleDateString("pt-BR")}</span>
                                                    {item.subTitle && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{item.subTitle}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                            {item.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                ) : (
                    // Detalhe do Item
                    <ScrollArea className="h-[60vh] px-6 pb-6">
                        <article className="prose dark:prose-invert max-w-none">
                            <div className="mb-6 pb-4 border-b">
                                <h2 className="text-2xl font-bold mb-2 text-foreground">{selectedItem.title}</h2>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(selectedItem.date).toLocaleDateString("pt-BR", {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </div>
                                    {selectedItem.subTitle && (
                                        <div className="font-medium text-primary">
                                            {selectedItem.subTitle}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="whitespace-pre-wrap leading-relaxed text-foreground/90 pb-8 text-base">
                                {selectedItem.content}
                            </div>
                        </article>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
}
