import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { authSchema } from "@/lib/validation";
import { z } from "zod";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";

export default function AuthPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/membro", { replace: true });
  }, [user, navigate]);

  const submit = async () => {
    const parsed = authSchema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Confira os campos", description: parsed.error.issues[0]?.message });
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: redirectUrl },
        });
        if (error) throw error;
        toast({
          title: "Cadastro enviado",
          description: "Se necessário, verifique seu e-mail para confirmar e depois faça login.",
        });
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
        toast({ title: "Bem-vindo(a)!" });
        navigate("/membro", { replace: true });
      }
    } catch (e: any) {
      const message = (e?.message as string) ?? "Não foi possível continuar.";
      toast({ title: "Erro", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-lg">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="font-display text-2xl">
              {mode === "login" ? "Acesso Administrativo" : "Criar conta de Administrador"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-left">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                placeholder="voce@exemplo.com"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                placeholder="••••••••"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>

            <Button variant="brand" size="lg" className="w-full" onClick={() => void submit()} disabled={loading}>
              {loading ? "Aguarde…" : mode === "login" ? "Entrar" : "Cadastrar"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              {mode === "login" ? (
                <button className="brand-underline" onClick={() => setMode("signup")}>
                  Não tenho conta
                </button>
              ) : (
                <button className="brand-underline" onClick={() => setMode("login")}>
                  Já tenho conta
                </button>
              )}
              <span className="mx-2">•</span>
              <NavLink to="/" className="brand-underline">
                Voltar ao site
              </NavLink>
            </div>

            <div className="rounded-2xl bg-brand-soft p-4 text-xs text-muted-foreground">
              Dica: se quiser acelerar testes, você pode desativar a confirmação de e-mail nas configurações de autenticação.
            </div>
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}
