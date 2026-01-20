import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/data/queries";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const { data, refetch } = useSettings();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    church_name: data?.church_name ?? "Igreja Batista Lírio dos Vales",
    live_stream_url: data?.live_stream_url ?? "",
    pix_key: data?.pix_key ?? "SUA-CHAVE-PIX-AQUI",
    pix_message: data?.pix_message ?? "",
  });

  const save = async () => {
    setLoading(true);
    try {
      const rows = Object.entries(form).map(([key, value]) => ({ key, value: String(value ?? "") }));
      const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
      if (error) throw error;
      toast({ title: "Salvo" });
      await refetch();
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message ?? "Não foi possível salvar.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <header className="text-left">
        <h1 className="font-display text-3xl">Configurações</h1>
        <p className="mt-2 text-muted-foreground">Atualize link da transmissão e dados do Pix.</p>
      </header>

      <section className="mt-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Geral</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-left">
            <div className="grid gap-2">
              <Label>Nome da igreja</Label>
              <Input value={form.church_name} onChange={(e) => setForm((s) => ({ ...s, church_name: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Link transmissão ao vivo</Label>
              <Input
                value={form.live_stream_url}
                onChange={(e) => setForm((s) => ({ ...s, live_stream_url: e.target.value }))}
                placeholder="https://youtube.com/..."
              />
            </div>
            <div className="grid gap-2">
              <Label>Chave Pix</Label>
              <Input value={form.pix_key} onChange={(e) => setForm((s) => ({ ...s, pix_key: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Mensagem</Label>
              <Input value={form.pix_message} onChange={(e) => setForm((s) => ({ ...s, pix_message: e.target.value }))} />
            </div>

            <Button variant="brand" onClick={() => void save()} disabled={loading}>
              {loading ? "Salvando…" : "Salvar"}
            </Button>
          </CardContent>
        </Card>
      </section>
    </SiteLayout>
  );
}
