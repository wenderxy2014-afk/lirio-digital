import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
 import { supabase } from "@/integrations/supabase/client";
 import { SiteLayout } from "@/components/site/SiteLayout";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Button } from "@/components/ui/button";
 import { useToast } from "@/hooks/use-toast";
 
 export default function ResetPassword() {
   const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [loading, setLoading] = useState(false);
  const [hydratingSession, setHydratingSession] = useState(true);
   const navigate = useNavigate();
   const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;

    const hydrateSessionFromUrl = async () => {
      try {
        // 1) If session already exists, we're good.
        const { data: sessionData } = await supabase.auth.getSession();
        if (cancelled) return;
        if (sessionData.session) {
          setHydratingSession(false);
          return;
        }

        // 2) Recovery links may provide tokens in the URL hash (#access_token=...)
        const hash = window.location.hash?.startsWith("#")
          ? window.location.hash.slice(1)
          : "";
        const hashParams = new URLSearchParams(hash);
        const access_token = hashParams.get("access_token");
        const refresh_token = hashParams.get("refresh_token");

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) {
            toast({
              title: "Erro",
              description: "Link inválido ou expirado. Solicite uma nova redefinição de senha.",
              variant: "destructive",
            });
          }
          if (!cancelled) setHydratingSession(false);
          return;
        }

        // 3) Some flows use a `code` query param (PKCE). Try exchanging it for a session.
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) {
            toast({
              title: "Erro",
              description: "Link inválido ou expirado. Solicite uma nova redefinição de senha.",
              variant: "destructive",
            });
          }
          if (!cancelled) setHydratingSession(false);
          return;
        }

        // 4) No session and no tokens/code found.
        toast({
          title: "Erro",
          description: "Sessão de redefinição não encontrada. Abra novamente o link do e-mail.",
          variant: "destructive",
        });
        if (!cancelled) setHydratingSession(false);
      } catch {
        if (!cancelled) {
          setHydratingSession(false);
          toast({
            title: "Erro",
            description: "Não foi possível validar o link. Tente novamente.",
            variant: "destructive",
          });
        }
      }
    };

    hydrateSessionFromUrl();
    return () => {
      cancelled = true;
    };
  }, [toast]);
 
   const handleResetPassword = async (e: React.FormEvent) => {
     e.preventDefault();
 
     if (password !== confirmPassword) {
       toast({
         title: "Erro",
         description: "As senhas não coincidem",
         variant: "destructive",
       });
       return;
     }
 
     if (password.length < 6) {
       toast({
         title: "Erro",
         description: "A senha deve ter pelo menos 6 caracteres",
         variant: "destructive",
       });
       return;
     }
 
     setLoading(true);
 
     const { error } = await supabase.auth.updateUser({
       password: password,
     });
 
     setLoading(false);
 
     if (error) {
       toast({
         title: "Erro",
         description: error.message,
         variant: "destructive",
       });
       return;
     }
 
     toast({
       title: "Sucesso",
       description: "Senha redefinida com sucesso!",
     });
 
     setTimeout(() => {
       navigate("/auth");
     }, 2000);
   };
 
   return (
     <SiteLayout>
       <div className="container max-w-md py-12">
         <Card>
           <CardHeader>
             <CardTitle>Redefinir Senha</CardTitle>
             <CardDescription>
               Digite sua nova senha abaixo
             </CardDescription>
           </CardHeader>
           <CardContent>
             <form onSubmit={handleResetPassword} className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="password">Nova Senha</Label>
                 <Input
                   id="password"
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="••••••••"
                   required
                   minLength={6}
                 />
               </div>
 
               <div className="space-y-2">
                 <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                 <Input
                   id="confirmPassword"
                   type="password"
                   value={confirmPassword}
                   onChange={(e) => setConfirmPassword(e.target.value)}
                   placeholder="••••••••"
                   required
                   minLength={6}
                 />
               </div>
 
               <Button
                 type="submit"
                 className="w-full"
                  disabled={loading || hydratingSession}
               >
                  {hydratingSession ? "Validando link..." : loading ? "Redefinindo..." : "Redefinir Senha"}
               </Button>
             </form>
           </CardContent>
         </Card>
       </div>
     </SiteLayout>
   );
 }