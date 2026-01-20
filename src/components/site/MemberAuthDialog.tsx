import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { authSchema } from "@/lib/validation";
import { useNavigate } from "react-router-dom";

interface MemberAuthDialogProps {
  children: React.ReactNode;
}

export function MemberAuthDialog({ children }: MemberAuthDialogProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

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
        setForm({ email: "", password: "" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
        toast({ title: "Bem-vindo(a)!" });
        setOpen(false);
        setForm({ email: "", password: "" });
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {mode === "login" ? "Acesso de Membros" : "Cadastro de Membro"}
          </DialogTitle>
          <DialogDescription>
            {mode === "login"
              ? "Entre com seu e-mail e senha para acessar a área do membro."
              : "Crie sua conta para acessar conteúdo exclusivo para membros."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="member-email">E-mail</Label>
            <Input
              id="member-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              placeholder="voce@exemplo.com"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="member-password">Senha</Label>
            <Input
              id="member-password"
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
              <>
                Caso não seja membro,{" "}
                <button className="brand-underline font-medium text-foreground" onClick={() => setMode("signup")}>
                  cadastre-se aqui
                </button>
              </>
            ) : (
              <>
                Já tem cadastro?{" "}
                <button className="brand-underline font-medium text-foreground" onClick={() => setMode("login")}>
                  Faça login
                </button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
