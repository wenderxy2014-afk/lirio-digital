 import { useState, useEffect } from "react";
 import { useNavigate } from "react-router-dom";
 import { supabase } from "@/integrations/supabase/client";
 import { SiteLayout } from "@/components/site/SiteLayout";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Button } from "@/components/ui/button";
 import { useToast } from "@/hooks/use-toast";
 import { Loader2 } from "lucide-react";
 
 export default function AdminSetup() {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [fullName, setFullName] = useState("");
   const [loading, setLoading] = useState(false);
   const [checking, setChecking] = useState(true);
   const navigate = useNavigate();
   const { toast } = useToast();
 
   useEffect(() => {
     checkAdminExists();
   }, []);
 
   const checkAdminExists = async () => {
     try {
       const { data, error } = await supabase.functions.invoke("check-admin-exists");
 
       if (error) throw error;
 
       if (data?.adminExists) {
         // Admin already exists, redirect to auth
         navigate("/auth", { replace: true });
       }
     } catch (error) {
       console.error("Error checking for admin:", error);
       toast({
         title: "Erro",
         description: "Não foi possível verificar o sistema",
         variant: "destructive",
       });
     } finally {
       setChecking(false);
     }
   };
 
   const handleSetup = async (e: React.FormEvent) => {
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
 
     try {
       // Create the first admin user
       const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
         email,
         password,
         options: {
           data: {
             full_name: fullName,
           },
         },
       });
 
       if (signUpError) throw signUpError;
       if (!signUpData.user) throw new Error("Falha ao criar usuário");
 
       // Insert admin role using service role (via edge function)
       const { error: roleError } = await supabase.functions.invoke("create-admin-user", {
         body: {
           email,
           password,
           fullName,
           role: "admin",
           sendEmail: false,
         },
       });
 
       if (roleError) {
         console.warn("Error via edge function, trying direct insert:", roleError);
         
         // Fallback: try direct insert (may fail due to RLS)
         const { error: directRoleError } = await supabase
           .from("user_roles")
           .insert({
             user_id: signUpData.user.id,
             role: "admin",
           });
 
         if (directRoleError) {
           console.error("Failed to assign admin role:", directRoleError);
         }
       }
 
       toast({
         title: "Sucesso!",
         description: "Primeiro administrador criado com sucesso",
       });
 
       // Sign in automatically
       const { error: signInError } = await supabase.auth.signInWithPassword({
         email,
         password,
       });
 
       if (signInError) {
         toast({
           title: "Aviso",
           description: "Administrador criado. Faça login para continuar.",
         });
         navigate("/auth");
       } else {
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
 
   if (checking) {
     return (
       <SiteLayout>
         <div className="container max-w-md py-12 flex items-center justify-center">
           <Loader2 className="h-8 w-8 animate-spin" />
         </div>
       </SiteLayout>
     );
   }
 
   return (
     <SiteLayout>
       <div className="container max-w-md py-12">
         <Card>
           <CardHeader>
             <CardTitle>Configuração Inicial</CardTitle>
             <CardDescription>
               Crie o primeiro administrador do sistema
             </CardDescription>
           </CardHeader>
           <CardContent>
             <form onSubmit={handleSetup} className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="fullName">Nome Completo</Label>
                 <Input
                   id="fullName"
                   type="text"
                   value={fullName}
                   onChange={(e) => setFullName(e.target.value)}
                   placeholder="Seu nome completo"
                 />
               </div>
 
               <div className="space-y-2">
                 <Label htmlFor="email">E-mail *</Label>
                 <Input
                   id="email"
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="seu@email.com"
                   required
                 />
               </div>
 
               <div className="space-y-2">
                 <Label htmlFor="password">Senha *</Label>
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
                 <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
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
                 {loading ? (
                   <>
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     Criando...
                   </>
                 ) : (
                   "Criar Administrador"
                 )}
               </Button>
             </form>
           </CardContent>
         </Card>
       </div>
     </SiteLayout>
   );
 }