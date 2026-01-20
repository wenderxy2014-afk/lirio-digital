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
      <header className="flex flex-col gap-4 text-left md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl">Testemunhos</h1>
          <p className="mt-2 text-muted-foreground">Histórias de fé e transformação.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="brand">Enviar meu testemunho</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Enviar testemunho</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Título</Label>
                <Input value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Texto (opcional)</Label>
                <Textarea value={form.body} onChange={(e) => setForm((s) => ({ ...s, body: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Link do vídeo (opcional)</Label>
                <Input value={form.video_url} onChange={(e) => setForm((s) => ({ ...s, video_url: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Nome (opcional)</Label>
                <Input value={form.person_name} onChange={(e) => setForm((s) => ({ ...s, person_name: e.target.value }))} />
              </div>
              <Button variant="brand" onClick={() => void submit()} disabled={sending}>
                {sending ? "Enviando…" : "Enviar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        {(data ?? []).map((t) => (
          <Card key={t.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="font-display">{t.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-left">
              {t.person_name && <div className="text-sm font-medium">{t.person_name}</div>}
              {t.body && (
                <div className="mt-3 content-panel">
                  <p className="content-text">{t.body}</p>
                </div>
              )}
              {t.video_url && (
                <a className="mt-3 inline-block brand-underline text-sm" href={t.video_url} target="_blank" rel="noreferrer">
                  Assistir vídeo
                </a>
              )}
            </CardContent>
          </Card>
        ))}

        {!data || data.length === 0 ? (
          <div className="rounded-3xl border bg-card p-6 text-left text-muted-foreground">
            Nenhum testemunho aprovado ainda.
          </div>
        ) : null}
      </section>
    </SiteLayout>
  );
}
