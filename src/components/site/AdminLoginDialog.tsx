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
import { ShieldCheck, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminLoginDialogProps {
    children: React.ReactNode;
}

export function AdminLoginDialog({ children }: AdminLoginDialogProps) {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);

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

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle className="text-center font-display text-xl">Acesso Administrativo</DialogTitle>
                    <DialogDescription className="text-center">
                        Entre com suas credenciais de gestão.
                    </DialogDescription>
                </DialogHeader>

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
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Entrar no Painel"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
