 import { useState } from "react";
 import { useNavigate, useSearchParams } from "react-router-dom";
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
   const navigate = useNavigate();
   const { toast } = useToast();
   const [searchParams] = useSearchParams();
 
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
                 disabled={loading}
               >
                 {loading ? "Redefinindo..." : "Redefinir Senha"}
               </Button>
             </form>
           </CardContent>
         </Card>
       </div>
     </SiteLayout>
   );
 }