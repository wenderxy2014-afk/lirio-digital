import { useState, useEffect } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/data/queries";
import { Settings, Church, Radio, Wallet, Save, MessageSquare, ArrowLeft } from "lucide-react";
import { NavLink } from "@/components/NavLink";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const { data, refetch } = useSettings();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    church_name: "",
    live_stream_url: "",
    pix_key: "",
    pix_message: "",
  });

  // Sync form with data when it loads
  useEffect(() => {
    if (data) {
      setForm({
        church_name: data.church_name ?? "Igreja Batista Lírio dos Vales",
        live_stream_url: data.live_stream_url ?? "",
        pix_key: data.pix_key ?? "SUA-CHAVE-PIX-AQUI",
        pix_message: data.pix_message ?? "",
      });
    }
  }, [data]);

  const save = async () => {
    setLoading(true);
    try {
      const rows = Object.entries(form).map(([key, value]) => ({ key, value: String(value ?? "") }));
      const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
      if (error) throw error;
      toast({ title: "Salvo", description: "Configurações atualizadas com sucesso!" });
      await refetch();
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message ?? "Não foi possível salvar.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      {/* Botão Voltar */}
      <Button asChild variant="ghost" className="mb-4 gap-2 text-muted-foreground hover:text-foreground">
        <NavLink to="/admin">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Painel
        </NavLink>
      </Button>

      {/* Hero Header com Glassmorphism */}
      <header className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8 md:p-12 mb-10">
        {/* Ícone decorativo */}
        <div className="absolute right-8 top-8 text-primary/10">
          <Settings className="h-32 w-32 md:h-40 md:w-40" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur">
            <Settings className="h-4 w-4" />
            Configurações Gerais
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold text-foreground md:text-5xl">
            Configurações
          </h1>
          <p className="mt-3 max-w-xl text-lg text-muted-foreground">
            Atualize link da transmissão, dados do Pix e informações gerais da igreja.
          </p>
        </div>
      </header>

      <section className="max-w-2xl">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 font-display text-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
                <Church className="h-5 w-5" />
              </div>
              Informações Gerais
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-6 text-left">
            {/* Nome da Igreja */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Church className="h-4 w-4 text-primary" />
                Nome da igreja
              </Label>
              <Input
                value={form.church_name}
                onChange={(e) => setForm((s) => ({ ...s, church_name: e.target.value }))}
                className="border-primary/20 bg-background/50 backdrop-blur transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Igreja Batista Lírio dos Vales"
              />
            </div>

            {/* Link Transmissão */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Radio className="h-4 w-4 text-red-500" />
                Link transmissão ao vivo
              </Label>
              <Input
                value={form.live_stream_url}
                onChange={(e) => setForm((s) => ({ ...s, live_stream_url: e.target.value }))}
                placeholder="https://youtube.com/..."
                className="border-primary/20 bg-background/50 backdrop-blur transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Chave Pix */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Wallet className="h-4 w-4 text-green-500" />
                Chave Pix
              </Label>
              <Input
                value={form.pix_key}
                onChange={(e) => setForm((s) => ({ ...s, pix_key: e.target.value }))}
                className="border-primary/20 bg-background/50 backdrop-blur transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="email@igreja.com ou CPF/CNPJ"
              />
            </div>

            {/* Mensagem Pix */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="h-4 w-4 text-primary" />
                Mensagem de agradecimento (Oferta)
              </Label>
              <Input
                value={form.pix_message}
                onChange={(e) => setForm((s) => ({ ...s, pix_message: e.target.value }))}
                className="border-primary/20 bg-background/50 backdrop-blur transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Agradecemos pela sua generosidade..."
              />
            </div>

            <Button
              onClick={() => void save()}
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg transition-all duration-300 hover:shadow-xl"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Salvando…
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </section>
    </SiteLayout>
  );
}
