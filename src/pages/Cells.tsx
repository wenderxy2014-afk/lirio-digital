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
import { Users, MapPin, Calendar, Phone, Mail, UserCheck } from "lucide-react";

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
      {/* Hero Header com Glassmorphism */}
      <header className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8 md:p-12">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur">
            <Users className="h-4 w-4" />
            Comunhão e Crescimento
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold text-foreground md:text-5xl">
            Células
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Encontre uma célula perto de você e participe de momentos de comunhão, cuidado e crescimento espiritual.
          </p>
        </div>
      </header>

      {/* Grid de Células */}
      <section className="mt-10 grid gap-6 md:grid-cols-2">
        {(cells ?? []).map((c) => (
          <Card
            key={c.id}
            className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            {/* Efeito de brilho no hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <CardHeader className="relative pb-2">
              <CardTitle className="flex items-center gap-3 font-display text-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
                  <Users className="h-5 w-5" />
                </div>
                {c.name}
              </CardTitle>
            </CardHeader>

            <CardContent className="relative text-left">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 rounded-xl bg-background/50 p-3 backdrop-blur">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">{c.address ?? "Endereço a confirmar"}</span>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-background/50 p-3 backdrop-blur">
                  <Calendar className="mt-0.5 h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">
                    {c.meeting_day ?? "Dia"} • {c.meeting_time ?? "Horário"}
                  </span>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-background/50 p-3 backdrop-blur">
                  <UserCheck className="mt-0.5 h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">
                    Líder: {c.leader_name ?? "A confirmar"}
                    {c.coleader_name ? ` • Co-líder: ${c.coleader_name}` : ""}
                  </span>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-background/50 p-3 backdrop-blur">
                  <Phone className="mt-0.5 h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">
                    {c.whatsapp ?? "-"} {c.email ? ` • ${c.email}` : ""}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Dialog open={openId === c.id} onOpenChange={(v) => setOpenId(v ? c.id : null)}>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                      size="lg"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Quero participar desta célula
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="border-0 bg-gradient-to-br from-background via-background to-primary/5 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="font-display text-xl">Quero participar da célula {c.name}</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-5 pt-4">
                      <div className="grid gap-2">
                        <Label className="text-sm font-medium">Nome</Label>
                        <Input
                          value={form.name}
                          onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                          className="border-primary/20 bg-background/50 backdrop-blur transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                          placeholder="Seu nome completo"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-sm font-medium">Telefone</Label>
                        <Input
                          value={form.phone}
                          onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                          className="border-primary/20 bg-background/50 backdrop-blur transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                          placeholder="(31) 99999-9999"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-sm font-medium">Bairro (opcional)</Label>
                        <Input
                          value={form.neighborhood}
                          onChange={(e) => setForm((s) => ({ ...s, neighborhood: e.target.value }))}
                          className="border-primary/20 bg-background/50 backdrop-blur transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                          placeholder="Onde você mora"
                        />
                      </div>

                      <Button
                        className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg transition-all duration-300 hover:shadow-xl"
                        size="lg"
                        onClick={() => void submit(c.id)}
                        disabled={sending}
                      >
                        {sending ? "Enviando…" : "Enviar interesse"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}

        {isLoading && (
          <div className="col-span-full flex items-center justify-center rounded-3xl border border-dashed bg-gradient-to-br from-background to-primary/5 p-12">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Carregando células…
            </div>
          </div>
        )}

        {!isLoading && (!cells || cells.length === 0) && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed bg-gradient-to-br from-background to-primary/5 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground">Nenhuma célula cadastrada</h3>
            <p className="mt-2 text-muted-foreground max-w-sm">
              Em breve teremos células disponíveis para você participar.
            </p>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
