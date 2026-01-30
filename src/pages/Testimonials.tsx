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
import { Plus, ChevronDown, ChevronUp, Heart, Quote, ExternalLink, Sparkles, MessageSquareHeart } from "lucide-react";

function TestimonialItem({ data: t }: { data: any }) {
  const [expanded, setExpanded] = useState(false);
  const [textSize, setTextSize] = useState(100);

  const handleZoomIn = () => setTextSize((s) => Math.min(s + 10, 150));
  const handleZoomOut = () => setTextSize((s) => Math.max(s - 10, 80));

  const MAX_LENGTH = 380;
  const isLongText = t.body && t.body.length > MAX_LENGTH;
  const displayText = !expanded && isLongText ? t.body.slice(0, MAX_LENGTH) + "..." : t.body;

  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Aspas decorativas */}
      <div className="absolute -right-4 -top-4 text-primary/10">
        <Quote className="h-24 w-24" />
      </div>

      {/* Efeito de brilho no hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <CardHeader className="relative flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1 flex-1">
          <CardTitle className="font-display text-xl leading-tight text-foreground">{t.title}</CardTitle>
          {t.person_name && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-3 w-3" />
              </div>
              {t.person_name}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-background/80 p-1 backdrop-blur shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-primary/10"
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
            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-primary/10"
            title="Aumentar fonte"
            disabled={textSize >= 150}
          >
            <span className="text-sm font-bold">A+</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative text-left space-y-4 pt-4">
        {t.body && (
          <div className="relative">
            <div className="rounded-xl bg-background/50 p-4 backdrop-blur">
              <div
                style={{ fontSize: `${textSize}%`, lineHeight: '1.7' }}
                className="text-muted-foreground transition-[font-size] duration-300"
              >
                <p className="whitespace-pre-wrap">{displayText}</p>
              </div>
            </div>

            {isLongText && (
              <Button
                variant="ghost"
                onClick={() => setExpanded(!expanded)}
                className="mt-3 h-auto p-0 font-medium text-primary hover:text-primary/80 hover:bg-transparent flex items-center gap-1"
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
          <a
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500/10 to-red-500/5 px-4 py-3 text-sm font-medium text-red-600 transition-all hover:from-red-500/20 hover:to-red-500/10"
            href={t.video_url}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink className="h-4 w-4" />
            Assistir vídeo do testemunho
          </a>
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
      {/* Hero Header com Glassmorphism */}
      <header className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8 md:p-12 mb-10">

        {/* Aspas decorativas grandes */}
        <div className="absolute right-8 top-8 text-primary/10">
          <Quote className="h-32 w-32 md:h-48 md:w-48" />
        </div>

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur">
              <MessageSquareHeart className="h-4 w-4" />
              Histórias de Fé
            </div>
            <h1 className="mt-4 font-display text-4xl font-bold text-foreground md:text-5xl">
              Testemunhos
            </h1>
            <p className="mt-3 max-w-xl text-lg text-muted-foreground">
              Histórias reais de fé, transformação e milagres que glorificam a Deus.
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
              >
                <Plus className="w-5 h-5 mr-2" />
                Compartilhar meu testemunho
              </Button>
            </DialogTrigger>
            <DialogContent className="border-0 bg-gradient-to-br from-background via-background to-primary/5 shadow-2xl sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="font-display text-xl flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Enviar meu testemunho
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-5 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title" className="text-sm font-medium">Título do testemunho</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Como Deus restaurou minha família"
                    value={form.title}
                    onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                    className="border-primary/20 bg-background/50 backdrop-blur transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="body" className="text-sm font-medium">Sua história (opcional)</Label>
                  <Textarea
                    id="body"
                    placeholder="Conte os detalhes do que Deus fez..."
                    className="min-h-[150px] resize-y border-primary/20 bg-background/50 backdrop-blur transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={form.body}
                    onChange={(e) => setForm((s) => ({ ...s, body: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="video" className="text-sm font-medium">Link do vídeo (YouTube/Vimeo) (opcional)</Label>
                  <Input
                    id="video"
                    placeholder="https://..."
                    value={form.video_url}
                    onChange={(e) => setForm((s) => ({ ...s, video_url: e.target.value }))}
                    className="border-primary/20 bg-background/50 backdrop-blur transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-sm font-medium">Seu Nome (opcional)</Label>
                  <Input
                    id="name"
                    placeholder="Como gostaria de ser identificado"
                    value={form.person_name}
                    onChange={(e) => setForm((s) => ({ ...s, person_name: e.target.value }))}
                    className="border-primary/20 bg-background/50 backdrop-blur transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <Button
                  onClick={() => void submit()}
                  disabled={sending}
                  className="w-full mt-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg transition-all duration-300 hover:shadow-xl"
                  size="lg"
                >
                  {sending ? "Enviando..." : "Enviar Testemunho"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Grid de Testemunhos */}
      <div className="grid gap-6 md:grid-cols-2 pb-12">
        {(data ?? []).map((t) => (
          <TestimonialItem key={t.id} data={t} />
        ))}
      </div>

      {(!data || data.length === 0) && (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed bg-gradient-to-br from-background to-primary/5">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium text-foreground">Nenhum testemunho ainda</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Seja o primeiro a compartilhar como Deus tem agido em sua vida.
          </p>
        </div>
      )}
    </SiteLayout>
  );
}
