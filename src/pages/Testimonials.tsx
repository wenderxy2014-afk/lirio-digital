import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTestimonials } from "@/data/queries";
import { supabase } from "@/integrations/supabase/client";
import { testimonialSchema } from "@/lib/validation";
import { useState } from "react";
import { Minus, Plus, ChevronDown, ChevronUp } from "lucide-react";

function TestimonialItem({ data: t }: { data: any }) {
  const [expanded, setExpanded] = useState(false);
  const [textSize, setTextSize] = useState(100);

  const handleZoomIn = () => setTextSize((s) => Math.min(s + 10, 150));
  const handleZoomOut = () => setTextSize((s) => Math.max(s - 10, 80));

  const MAX_LENGTH = 380;
  const isLongText = t.body && t.body.length > MAX_LENGTH;
  const displayText = !expanded && isLongText ? t.body.slice(0, MAX_LENGTH) + "..." : t.body;

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="font-display text-xl leading-tight">{t.title}</CardTitle>
          {t.person_name && <div className="text-sm font-medium text-muted-foreground">{t.person_name}</div>}
        </div>
        <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            title="Diminuir fonte"
            disabled={textSize <= 80}
          >
            <span className="text-xs font-bold">A-</span>
          </Button>
          <span className="text-xs font-mono text-muted-foreground w-8 text-center select-none">
            {textSize}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            title="Aumentar fonte"
            disabled={textSize >= 150}
          >
            <span className="text-sm font-bold">A+</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="text-left space-y-4 pt-4">
        {t.body && (
          <div className="relative">
            <div
              style={{ fontSize: `${textSize}%`, lineHeight: '1.6' }}
              className="text-muted-foreground transition-[font-size] duration-300"
            >
              <p className="whitespace-pre-wrap">{displayText}</p>
            </div>

            {isLongText && (
              <Button
                variant="ghost"
                onClick={() => setExpanded(!expanded)}
                className="mt-2 h-auto p-0 font-medium text-primary hover:text-primary/80 hover:bg-transparent flex items-center gap-1"
              >
                {expanded ? (
                  <>Ler menos <ChevronUp className="h-4 w-4" /></>
                ) : (
                  <>Ler mais <ChevronDown className="h-4 w-4" /></>
                )}
              </Button>
            )}
          </div>
        )}

        {t.video_url && (
          <div className="pt-2 border-t">
            <a
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              href={t.video_url}
              target="_blank"
              rel="noreferrer"
            >
              <span>Assistir vídeo do testemunho</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TestimonialsPage() {
  const { data } = useTestimonials();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", video_url: "", person_name: "" });

  const submit = async () => {
    const parsed = testimonialSchema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Confira os campos", description: parsed.error.issues[0]?.message });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from("testimonials").insert({
        title: parsed.data.title,
        body: parsed.data.body || null,
        video_url: parsed.data.video_url || null,
        person_name: parsed.data.person_name || null,
        status: "pending",
      });
      if (error) throw error;
      toast({ title: "Enviado!", description: "Seu testemunho foi enviado para aprovação." });
      setForm({ title: "", body: "", video_url: "", person_name: "" });
      setOpen(false);
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message ?? "Não foi possível enviar.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <SiteLayout>
      <header className="flex flex-col gap-4 text-left md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground">Testemunhos</h1>
          <p className="mt-2 text-lg text-muted-foreground">Histórias reais de fé e transformação.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="brand" size="lg" className="shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Compartilhar meu testemunho
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Enviar meu testemunho</DialogTitle>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-base">Título do testemunho</Label>
                <Input
                  id="title"
                  placeholder="Ex: Como Deus restaurou minha família"
                  value={form.title}
                  onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="body" className="text-base">Sua história (opcional)</Label>
                <Textarea
                  id="body"
                  placeholder="Conte os detalhes do que Deus fez..."
                  className="min-h-[150px] resize-y"
                  value={form.body}
                  onChange={(e) => setForm((s) => ({ ...s, body: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="video" className="text-base">Link do vídeo (YouTube/Vimeo) (opcional)</Label>
                <Input
                  id="video"
                  placeholder="https://..."
                  value={form.video_url}
                  onChange={(e) => setForm((s) => ({ ...s, video_url: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-base">Seu Nome (opcional)</Label>
                <Input
                  id="name"
                  placeholder="Como gostaria de ser identificado"
                  value={form.person_name}
                  onChange={(e) => setForm((s) => ({ ...s, person_name: e.target.value }))}
                />
              </div>
              <Button variant="brand" onClick={() => void submit()} disabled={sending} className="w-full mt-2">
                {sending ? "Enviando..." : "Enviar Testemunho"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 pb-12">
        {(data ?? []).map((t) => (
          <TestimonialItem key={t.id} data={t} />
        ))}
      </div>

      {(!data || data.length === 0) && (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed bg-muted/30">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <span className="text-2xl">✨</span>
          </div>
          <h3 className="text-lg font-medium text-foreground">Nenhum testemunho ainda</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            Seja o primeiro a compartilhar como Deus tem agido em sua vida.
          </p>
        </div>
      )}
    </SiteLayout>
  );
}
