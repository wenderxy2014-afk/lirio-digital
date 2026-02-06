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
import { ShieldCheck, Loader2, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/iblv-logo.png";
import { getPublicOrigin } from "@/lib/publicOrigin";

interface AdminLoginDialogProps {
    children: React.ReactNode;
}

type ViewMode = "login" | "forgot-password" | "email-sent" | "setup";

export function AdminLoginDialog({ children }: AdminLoginDialogProps) {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("login");
    const [resetEmail, setResetEmail] = useState("");
    const [pastedUrl, setPastedUrl] = useState("");
    const [processingUrl, setProcessingUrl] = useState(false);
    const [checkingAdmin, setCheckingAdmin] = useState(false);
    const [setupForm, setSetupForm] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: ""
    });

    const checkAdminExists = async () => {
        setCheckingAdmin(true);
        try {
            const { data, error } = await supabase.functions.invoke("check-admin-exists");

            if (error) {
                console.error("Error checking for admin:", error);
                return;
            }

            if (!data?.adminExists) {
                // No admin exists, show setup form
                setViewMode("setup");
            }
        } catch (error) {
            console.error("Error checking for admin:", error);
        } finally {
            setCheckingAdmin(false);
        }
    };

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (setupForm.password !== setupForm.confirmPassword) {
            toast({
                title: "Erro",
                description: "As senhas não coincidem",
                variant: "destructive",
            });
            return;
        }

        if (setupForm.password.length < 6) {
            toast({
                title: "Erro",
                description: "A senha deve ter pelo menos 6 caracteres",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            // Use edge function to create admin with proper permissions
            const { data, error: createError } = await supabase.functions.invoke("create-admin-user", {
                body: {
                    email: setupForm.email,
                    password: setupForm.password,
                    fullName: setupForm.fullName,
                    role: "admin",
                },
            });

            if (createError) {
                console.error("Error creating admin:", createError);
                throw createError;
            }

            if (!data || !data.success) {
                throw new Error(data?.error || "Falha ao criar administrador");
            }

            toast({
                title: "Sucesso!",
                description: "Primeiro administrador criado com sucesso",
            });

            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: setupForm.email,
                password: setupForm.password,
            });

            if (signInError) {
                toast({
                    title: "Aviso",
                    description: "Administrador criado. Faça login para continuar.",
                });
                setViewMode("login");
                setSetupForm({ email: "", password: "", confirmPassword: "", fullName: "" });
            } else {
                setOpen(false);
                setSetupForm({ email: "", password: "", confirmPassword: "", fullName: "" });
                setViewMode("login");
                navigate("/admin");
            }
        } catch (error: any) {
            console.error("Setup error:", error);
            toast({
                title: "Erro",
                description: error.message || "Erro ao criar administrador",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
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
            const publicOrigin = getPublicOrigin();
            const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                redirectTo: `${publicOrigin}/auth/reset-password`,
            });

            if (error) throw error;

            toast({
                title: "E-mail Enviado!",
                description: "Verifique sua caixa de entrada.",
            });
            // Mudar para tela de instruções
            setViewMode("email-sent");
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

    const handlePastedUrl = async () => {
        const input = pastedUrl.trim();

        if (!input) {
            toast({
                title: "Campo vazio",
                description: "Cole a URL ou token do email no campo acima.",
                variant: "destructive",
            });
            return;
        }

        setProcessingUrl(true);
        try {
            let hash = "";
            let search = "";
            let finalUrl = input;

            // Caso 0: Link de rastreamento do email (precisa seguir redirecionamento)
            if (input.includes("email.auth.lovable.cloud") || input.includes("/c/eJy")) {
                toast({
                    title: "Processando link...",
                    description: "Seguindo redirecionamento do email...",
                });

                try {
                    // Usar allorigins.win como proxy CORS para seguir o redirecionamento
                    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(input)}`;

                    const response = await fetch(proxyUrl, {
                        method: "GET",
                    });

                    const html = await response.text();

                    // Procurar por URL de redirecionamento no HTML
                    const urlMatch = html.match(/url=["']?([^"'\s>]+)/i) ||
                        html.match(/href=["']?([^"'\s>]+lovable[^"'\s>]+)/i) ||
                        html.match(/(https:\/\/[^"'\s<>]+#[^"'\s<>]+)/i);

                    if (urlMatch && urlMatch[1]) {
                        finalUrl = urlMatch[1].replace(/&amp;/g, "&");
                        console.log("Found redirect URL:", finalUrl);
                    } else {
                        throw new Error("MANUAL_REDIRECT");
                    }
                } catch (fetchError: any) {
                    console.error("Proxy fetch failed:", fetchError);
                    // Fallback: instruir o usuário a copiar o link da barra de endereços
                    toast({
                        title: "Passo adicional necessário",
                        description: "Abra o link em uma nova aba, copie a URL da barra de endereços e cole aqui.",
                        variant: "destructive",
                    });
                    throw new Error("Este é um link de rastreamento. Por favor:\n1. Abra este link em uma nova aba\n2. Quando a página de erro aparecer, copie a URL da barra de endereços\n3. Cole essa nova URL aqui");
                }
            }

            // Agora processar a URL final
            if (finalUrl.startsWith("http")) {
                try {
                    const url = new URL(finalUrl);
                    hash = url.hash || "";
                    search = url.search || "";
                } catch {
                    // URL mal formada, tentar extrair manualmente
                    if (finalUrl.includes("#")) {
                        hash = "#" + finalUrl.split("#")[1];
                    }
                }
            }
            // Caso 2: Apenas o hash (começa com #)
            else if (finalUrl.startsWith("#")) {
                hash = finalUrl;
            }
            // Caso 3: Contém access_token= ou error= (parte do hash sem #)
            else if (finalUrl.includes("access_token=") || finalUrl.includes("error=") || finalUrl.includes("error_code=")) {
                hash = "#" + finalUrl;
            }
            // Caso 4: Token base64 puro (longo, sem espaços, caracteres alfanuméricos)
            else if (finalUrl.length > 50 && !finalUrl.includes(" ") && /^[A-Za-z0-9_\-]+$/.test(finalUrl.replace(/\s/g, ""))) {
                // Parece ser um token base64, usar como token_hash
                search = `?token_hash=${encodeURIComponent(finalUrl)}&type=recovery`;
            }
            // Caso 5: Código OTP ou token curto
            else if (finalUrl.length >= 6 && /^[A-Za-z0-9_\-]+$/.test(finalUrl)) {
                search = `?token=${encodeURIComponent(finalUrl)}&type=recovery`;
            }

            // Verificar se conseguimos extrair algo útil
            if (!hash && !search) {
                throw new Error("Não foi possível identificar o token. Tente copiar o link completo do email (clique direito → Copiar endereço do link).");
            }

            // Redirecionar para a página de reset com o token
            const resetPath = `/auth/reset-password${search}${hash}`;
            console.log("Redirecting to:", resetPath);
            setOpen(false);
            setPastedUrl("");
            navigate(resetPath);
        } catch (e: any) {
            toast({
                title: "Erro",
                description: e.message || "Não foi possível processar o token",
                variant: "destructive",
            });
        } finally {
            setProcessingUrl(false);
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
            <DialogContent className="sm:max-w-[420px] overflow-hidden">
                {/* Background Logo */}
                <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                    <img src={logo} alt="" className="w-64 h-64 grayscale" />
                </div>

                <div className="relative z-10">
                    <DialogHeader>
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 shadow-inner">
                            <img src={logo} alt="Logo IBLV" className="h-10 w-10" />
                        </div>
                        <DialogTitle className="text-center font-display text-2xl">
                            {viewMode === "login" && "Acesso Administrativo"}
                            {viewMode === "forgot-password" && "Recuperar Senha"}
                            {viewMode === "email-sent" && "Recuperar Senha"}
                            {viewMode === "setup" && "Configuração Inicial"}
                        </DialogTitle>
                        <DialogDescription className="text-center text-base">
                            {viewMode === "login" && "Entre com suas credenciais de gestão."}
                            {viewMode === "forgot-password" && "Digite seu e-mail para receber o link de recuperação."}
                            {viewMode === "email-sent" && "Siga as instruções abaixo para continuar."}
                            {viewMode === "setup" && "Crie o primeiro administrador do sistema"}
                        </DialogDescription>
                    </DialogHeader>

                    {checkingAdmin ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Verificando sistema...</p>
                        </div>
                    ) : viewMode === "login" ? (
                        <form onSubmit={submit} className="space-y-5 mt-6">
                            <div className="space-y-2">
                                <Label htmlFor="admin-email">E-mail</Label>
                                <Input
                                    id="admin-email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                                    placeholder="admin@igreja.com"
                                    required
                                    className="h-11"
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
                                    className="h-11"
                                />
                            </div>

                            <Button type="submit" size="lg" className="w-full h-12 shadow-glow-sm hover:translate-y-[-2px] transition-all duration-300" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Entrando...
                                    </>
                                ) : (
                                    "Entrar no Painel"
                                )}
                            </Button>

                            {/* Botão temporariamente desabilitado - problema de domínio bloqueado
                            <Button
                                type="button"
                                variant="link"
                                className="w-full text-sm text-muted-foreground"
                                onClick={() => setViewMode("forgot-password")}
                            >
                                Esqueci minha senha
                            </Button>
                            */}
                        </form>
                    ) : viewMode === "forgot-password" ? (
                        <form onSubmit={handleForgotPassword} className="space-y-5 mt-6">
                            <div className="space-y-2">
                                <Label htmlFor="reset-email">E-mail</Label>
                                <Input
                                    id="reset-email"
                                    type="email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    required
                                    className="h-11"
                                />
                            </div>

                            <Button type="submit" size="lg" className="w-full h-12 shadow-glow-sm hover:translate-y-[-2px] transition-all duration-300" disabled={loading}>
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
                    ) : viewMode === "email-sent" ? (
                        <div className="space-y-5 mt-6">
                            <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-center">
                                <p className="text-green-800 font-medium">✅ E-mail enviado!</p>
                                <p className="text-green-600 text-sm mt-1">Verifique sua caixa de entrada</p>
                            </div>

                            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                                <p className="text-amber-800 font-semibold text-sm mb-2">⚠️ IMPORTANTE:</p>
                                <ol className="text-amber-700 text-sm space-y-2 list-decimal list-inside">
                                    <li>No email, <strong>NÃO clique</strong> no botão</li>
                                    <li>Clique com o <strong>botão DIREITO</strong> do mouse no botão "Reset Password"</li>
                                    <li>Selecione <strong>"Copiar endereço do link"</strong></li>
                                    <li>Cole o link no campo abaixo</li>
                                </ol>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="paste-url">Cole a URL do email aqui:</Label>
                                <textarea
                                    id="paste-url"
                                    value={pastedUrl}
                                    onChange={(e) => setPastedUrl(e.target.value)}
                                    placeholder="https://...lovableproject.com/...#access_token=..."
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>

                            <Button
                                type="button"
                                size="lg"
                                className="w-full h-12 shadow-glow-sm hover:translate-y-[-2px] transition-all duration-300"
                                disabled={processingUrl || !pastedUrl.trim()}
                                onClick={handlePastedUrl}
                            >
                                {processingUrl ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    "Continuar Recuperação"
                                )}
                            </Button>

                            <Button
                                type="button"
                                variant="link"
                                className="w-full text-sm text-muted-foreground"
                                onClick={() => {
                                    setViewMode("login");
                                    setResetEmail("");
                                    setPastedUrl("");
                                }}
                            >
                                Voltar para o login
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSetup} className="space-y-5 mt-6">
                            <div className="space-y-2">
                                <Label htmlFor="setup-fullName">Nome Completo</Label>
                                <Input
                                    id="setup-fullName"
                                    type="text"
                                    value={setupForm.fullName}
                                    onChange={(e) => setSetupForm(s => ({ ...s, fullName: e.target.value }))}
                                    placeholder="Seu nome completo"
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="setup-email">E-mail</Label>
                                <Input
                                    id="setup-email"
                                    type="email"
                                    value={setupForm.email}
                                    onChange={(e) => setSetupForm(s => ({ ...s, email: e.target.value }))}
                                    placeholder="admin@igreja.com"
                                    required
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="setup-password">Senha</Label>
                                <Input
                                    id="setup-password"
                                    type="password"
                                    value={setupForm.password}
                                    onChange={(e) => setSetupForm(s => ({ ...s, password: e.target.value }))}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="setup-confirmPassword">Confirmar Senha</Label>
                                <Input
                                    id="setup-confirmPassword"
                                    type="password"
                                    value={setupForm.confirmPassword}
                                    onChange={(e) => setSetupForm(s => ({ ...s, confirmPassword: e.target.value }))}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="h-11"
                                />
                            </div>

                            <Button type="submit" size="lg" className="w-full h-12 shadow-glow-sm hover:translate-y-[-2px] transition-all duration-300" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Criando Administrador...
                                    </>
                                ) : (
                                    "Criar Primeiro Administrador"
                                )}
                            </Button>
                        </form>
                    )}

                    {viewMode !== "setup" && (
                        <p className="mt-6 text-center text-xs text-muted-foreground">
                            Acesso restrito para gestão administrativa da igreja.
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
