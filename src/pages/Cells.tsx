import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCells } from "@/data/queries";
import { supabase } from "@/integrations/supabase/client";
import { cellInterestSchema } from "@/lib/validation";
import { useState } from "react";

export default function CellsPage() {
  const { data: cells, isLoading } = useCells();
  const { toast } = useToast();
  const [openId, setOpenId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", neighborhood: "" });
  const [sending, setSending] = useState(false);

  const submit = async (cellId: string) => {
    const parsed = cellInterestSchema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Confira os campos", description: parsed.error.issues[0]?.message });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from("cell_interest").insert({
        cell_id: cellId,
        name: parsed.data.name,
        phone: parsed.data.phone,
        neighborhood: parsed.data.neighborhood || null,
      });
      if (error) throw error;
      toast({ title: "Recebido!", description: "Seu interesse foi registrado. Em breve entraremos em contato." });
      setForm({ name: "", phone: "", neighborhood: "" });
      setOpenId(null);
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message ?? "Não foi possível enviar.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <SiteLayout>
      <header className="text-left">
        <h1 className="font-display text-3xl">Células</h1>
        <p className="mt-2 text-muted-foreground">Escolha uma célula e preencha o formulário para participar.</p>
      </header>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        {(cells ?? []).map((c) => (
          <Card key={c.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="font-display">{c.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-left">
              <div className="text-sm text-muted-foreground">
                <div>{c.address ?? "Endereço a confirmar"}</div>
                <div>
                  {c.meeting_day ?? "Dia"} • {c.meeting_time ?? "Horário"}
                </div>
                <div className="mt-2">
                  Líder: {c.leader_name ?? "A confirmar"}
                  {c.coleader_name ? ` • Co-líder: ${c.coleader_name}` : ""}
                </div>
                <div className="mt-2">
                  Contato: {c.whatsapp ?? "-"} {c.email ? ` • ${c.email}` : ""}
                </div>
              </div>

              <div className="mt-5">
                <Dialog open={openId === c.id} onOpenChange={(v) => setOpenId(v ? c.id : null)}>
                  <DialogTrigger asChild>
                    <Button variant="brand" size="sm">Quero participar desta célula</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-display">Quero participar</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label>Nome</Label>
                        <Input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Telefone</Label>
                        <Input value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Bairro (opcional)</Label>
                        <Input
                          value={form.neighborhood}
                          onChange={(e) => setForm((s) => ({ ...s, neighborhood: e.target.value }))}
                        />
                      </div>

                      <Button variant="brand" onClick={() => void submit(c.id)} disabled={sending}>
                        {sending ? "Enviando…" : "Enviar"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}

        {isLoading && <div className="rounded-3xl border bg-card p-6 text-left">Carregando…</div>}
        {!isLoading && (!cells || cells.length === 0) && (
          <div className="rounded-3xl border bg-card p-6 text-left text-muted-foreground">Nenhuma célula cadastrada.</div>
        )}
      </section>
    </SiteLayout>
  );
}
