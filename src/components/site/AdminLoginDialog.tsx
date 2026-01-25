import { useState, useEffect } from "react";
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
import { ShieldCheck, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminLoginDialogProps {
    children: React.ReactNode;
}

type ViewMode = "login" | "forgot-password";

export function AdminLoginDialog({ children }: AdminLoginDialogProps) {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("login");
    const [resetEmail, setResetEmail] = useState("");
    const [checkingAdmin, setCheckingAdmin] = useState(false);

    const checkAdminExists = async () => {
        setCheckingAdmin(true);
        try {
            const { data, error } = await supabase.functions.invoke("check-admin-exists");

            if (error) {
                console.error("Error checking for admin:", error);
                return;
            }

            if (!data?.adminExists) {
                // No admin exists, redirect to setup
                console.log("No admin found, redirecting to setup...");
                toast({
                    title: "Configuração Inicial",
                    description: "Nenhum administrador encontrado. Redirecionando para configuração...",
                });
                // Close dialog and navigate after a short delay
                setTimeout(() => {
                    setOpen(false);
                    navigate("/admin/setup");
                }, 1500);
            }
        } catch (error) {
            console.error("Error checking for admin:", error);
        } finally {
            setCheckingAdmin(false);
        }
    };

    // Check if admin exists when dialog opens
    useEffect(() => {
        if (open) {
            checkAdminExists();
        }
    }, [open]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: form.email,
                password: form.password,
            });

            if (error) throw error;

            // Check if user has admin/editor role
            const { data: roles } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", data.user.id);

            const isAdmin = roles?.some(r => ["admin", "editor"].includes(r.role));

            if (isAdmin) {
                toast({ title: "Bem-vindo, Administrador!", description: "Acesso autorizado." });
                setOpen(false);
                setForm({ email: "", password: "" });
                setViewMode("login");
                navigate("/admin");
            } else {
                toast({
                    title: "Acesso Restrito",
                    description: "Este login é exclusivo para administração.",
                    variant: "destructive"
                });
                await supabase.auth.signOut();
            }

        } catch (e: any) {
            toast({ title: "Erro de Acesso", description: e.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });

            if (error) throw error;

            toast({
                title: "E-mail Enviado!",
                description: "Verifique sua caixa de entrada para redefinir a senha.",
            });
            setResetEmail("");
            setViewMode("login");
        } catch (e: any) {
            toast({
                title: "Erro",
                description: e.message || "Não foi possível enviar o e-mail",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            // Reset to login view when closing
            setTimeout(() => setViewMode("login"), 200);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle className="text-center font-display text-xl">
                        {viewMode === "login" ? "Acesso Administrativo" : "Recuperar Senha"}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {viewMode === "login" 
                            ? "Entre com suas credenciais de gestão."
                            : "Digite seu e-mail para receber o link de recuperação."
                        }
                    </DialogDescription>
                </DialogHeader>

                {checkingAdmin ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Verificando sistema...</p>
                    </div>
                ) : viewMode === "login" ? (
                    <form onSubmit={submit} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="admin-email">E-mail</Label>
                        <Input
                            id="admin-email"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                            placeholder="admin@igreja.com"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="admin-password">Senha</Label>
                        <Input
                            id="admin-password"
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                "Entrar no Painel"
                            )}
                    </Button>

                        <Button
                            type="button"
                            variant="link"
                            className="w-full text-sm text-muted-foreground"
                            onClick={() => setViewMode("forgot-password")}
                        >
                            Esqueci minha senha
                        </Button>
                </form>
                ) : (
                    <form onSubmit={handleForgotPassword} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="reset-email">E-mail</Label>
                            <Input
                                id="reset-email"
                                type="email"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                placeholder="seu@email.com"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                "Enviar Link de Recuperação"
                            )}
                        </Button>

                        <Button
                            type="button"
                            variant="link"
                            className="w-full text-sm text-muted-foreground"
                            onClick={() => setViewMode("login")}
                        >
                            Voltar para o login
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
