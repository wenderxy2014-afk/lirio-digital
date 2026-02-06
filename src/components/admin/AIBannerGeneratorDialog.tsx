import { useEffect, useMemo, useState } from "react";
import { Loader2, Sparkles, RefreshCcw } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useToast } from "@/hooks/use-toast";
import { useAIBannerGenerator } from "@/hooks/useAIBannerGenerator";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: (publicUrl: string) => void;
  defaultTheme?: string;
};

export function AIBannerGeneratorDialog({ open, onOpenChange, onGenerated, defaultTheme }: Props) {
  const { toast } = useToast();
  const gen = useAIBannerGenerator();

  const [theme, setTheme] = useState("");
  const [artText, setArtText] = useState("");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [styleAdjustments, setStyleAdjustments] = useState("");
  const [lastPrompt, setLastPrompt] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    setTheme((t) => t || defaultTheme || "");
  }, [open, defaultTheme]);

  const canGenerate = useMemo(() => theme.trim().length > 0, [theme]);

  const handleGenerate = async (mode: "generate" | "refine") => {
    try {
      const result = await gen.mutateAsync({
        mode,
        theme: theme.trim(),
        artText: artText.trim() || undefined,
        logoUrl: logoUrl.trim() || undefined,
        styleAdjustments: styleAdjustments.trim() || undefined,
        previousPrompt: lastPrompt || undefined,
      });

      setLastPrompt(result.prompt);
      onGenerated(result.publicUrl);
      toast({ title: "Imagem gerada!", description: "Banner salvo e aplicado ao slide." });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Não foi possível gerar a imagem";
      toast({ title: "Erro na geração", description: message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !gen.isPending && onOpenChange(v)}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Gerar imagem com IA
          </DialogTitle>
          <DialogDescription>
            Gere um banner panorâmico no padrão cinematográfico (3:1) e aplique diretamente ao slide.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 overflow-y-auto pr-1 flex-1 min-h-0">
          <div className="space-y-2">
            <Label>Tema da imagem</Label>
            <Input value={theme} onChange={(e) => setTheme(e.target.value)} placeholder='Ex.: "Culto da Família"' />
          </div>

          <div className="space-y-2">
            <Label>Texto da arte (frase)</Label>
            <Textarea
              value={artText}
              onChange={(e) => setArtText(e.target.value)}
              placeholder='Ex.: "Culto da Família"'
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Logo (opcional)</Label>
            <ImageUploader
              currentImageUrl={logoUrl || undefined}
              onUploadComplete={(url) => setLogoUrl(url)}
              folder="ai-logos"
              maxSizeMB={2}
              aspectClassName="aspect-[16/5]"
            />
            <p className="text-xs text-muted-foreground">
              Se enviada, a IA tentará posicionar uma logo pequena no canto inferior direito.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Ajustes no estilo (opcional)</Label>
            <Textarea
              value={styleAdjustments}
              onChange={(e) => setStyleAdjustments(e.target.value)}
              placeholder='Ex.: "deixar o fundo mais escuro", "texto branco"'
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={gen.isPending}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleGenerate("refine")}
            disabled={gen.isPending || !canGenerate || !lastPrompt}
          >
            {gen.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Refazer
          </Button>
          <Button type="button" variant="brand" onClick={() => handleGenerate("generate")} disabled={gen.isPending || !canGenerate}>
            {gen.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Gerar imagem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
