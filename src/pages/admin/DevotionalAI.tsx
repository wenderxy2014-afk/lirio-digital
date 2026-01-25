 import { useState } from "react";
 import { SiteLayout } from "@/components/site/SiteLayout";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { 
   Breadcrumb, 
   BreadcrumbList, 
   BreadcrumbItem, 
   BreadcrumbLink,
   BreadcrumbSeparator,
   BreadcrumbPage 
 } from "@/components/ui/breadcrumb";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Textarea } from "@/components/ui/textarea";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import { Sparkles, Wand2, Calendar } from "lucide-react";
 import { useToast } from "@/hooks/use-toast";
 import { supabase } from "@/integrations/supabase/client";
 
 export default function DevotionalAIPage() {
   const [theme, setTheme] = useState("");
   const [bibleBook, setBibleBook] = useState("");
   const [tone, setTone] = useState("pastoral");
   const [loading, setLoading] = useState(false);
   const [result, setResult] = useState<any>(null);
   const { toast } = useToast();
 
   const handleGenerate = async () => {
     if (!theme.trim()) {
       toast({
         title: "Erro",
         description: "Por favor, insira um tema para o devocional",
         variant: "destructive",
       });
       return;
     }
 
     setLoading(true);
     try {
       const { data, error } = await supabase.functions.invoke("ebd-devotional", {
         body: {
           theme: theme,
           bible_book: bibleBook || undefined,
           tone: tone,
           length: 1200,
         },
       });
 
       if (error) throw error;
 
       setResult(data);
       toast({
         title: "Sucesso!",
         description: "Devocional gerado com sucesso",
       });
     } catch (error: any) {
       console.error("Error generating devotional:", error);
       toast({
         title: "Erro",
         description: error.message || "Erro ao gerar devocional",
         variant: "destructive",
       });
     } finally {
       setLoading(false);
     }
   };
 
   const today = new Date().toLocaleDateString("pt-BR", {
     day: "2-digit",
     month: "long",
     year: "numeric",
   });
 
   return (
     <SiteLayout>
       <Breadcrumb className="mb-6">
         <BreadcrumbList>
           <BreadcrumbItem>
             <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
           </BreadcrumbItem>
           <BreadcrumbSeparator />
           <BreadcrumbItem>
             <BreadcrumbPage>Devocionais com IA</BreadcrumbPage>
           </BreadcrumbItem>
         </BreadcrumbList>
       </Breadcrumb>
 
       <header className="mb-6">
         <h1 className="font-display text-3xl flex items-center gap-2">
           <Sparkles className="h-8 w-8" />
           Geração de Devocionais com IA
         </h1>
         <p className="mt-2 text-muted-foreground flex items-center gap-2">
           <Calendar className="h-4 w-4" />
           {today}
         </p>
       </header>
 
       <div className="grid gap-6 lg:grid-cols-2">
         <div className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Wand2 className="h-5 w-5" />
                 Configurar Devocional
               </CardTitle>
               <CardDescription>
                 Personalize o tema e o tom do devocional a ser gerado
               </CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="theme">Tema do Dia *</Label>
                 <Input
                   id="theme"
                   placeholder="Ex: Esperança em tempos difíceis"
                   value={theme}
                   onChange={(e) => setTheme(e.target.value)}
                 />
               </div>
 
               <div className="space-y-2">
                 <Label htmlFor="bibleBook">Livro da Bíblia (Opcional)</Label>
                 <Input
                   id="bibleBook"
                   placeholder="Ex: Salmos, João, Provérbios..."
                   value={bibleBook}
                   onChange={(e) => setBibleBook(e.target.value)}
                 />
               </div>
 
               <div className="space-y-2">
                 <Label htmlFor="tone">Tom do Devocional</Label>
                 <Select value={tone} onValueChange={setTone}>
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="pastoral">Pastoral</SelectItem>
                     <SelectItem value="encorajador">Encorajador</SelectItem>
                     <SelectItem value="reflexivo">Reflexivo</SelectItem>
                     <SelectItem value="motivacional">Motivacional</SelectItem>
                     <SelectItem value="consolador">Consolador</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
 
               <Button
                 onClick={handleGenerate}
                 disabled={loading}
                 className="w-full"
               >
                 {loading ? (
                   <>
                     <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                     Gerando...
                   </>
                 ) : (
                   <>
                     <Wand2 className="mr-2 h-4 w-4" />
                     Gerar Devocional
                   </>
                 )}
               </Button>
             </CardContent>
           </Card>
         </div>
 
         <div>
           {result ? (
             <Card>
               <CardHeader>
                 <CardTitle>Preview do Devocional</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div>
                   <h3 className="font-display text-xl mb-2">{result.title}</h3>
                   {result.bible_reference && (
                     <p className="text-sm text-muted-foreground mb-4">
                       {result.bible_reference}
                     </p>
                   )}
                   <div className="prose prose-sm max-w-none">
                     <p className="whitespace-pre-wrap">{result.body}</p>
                   </div>
                 </div>
                 <div className="flex gap-2">
                   <Button variant="outline" className="flex-1">
                     Editar
                   </Button>
                   <Button className="flex-1">
                     Publicar
                   </Button>
                 </div>
               </CardContent>
             </Card>
           ) : (
             <Card>
               <CardContent className="py-12 text-center text-muted-foreground">
                 <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                 <p>Configure o tema e clique em "Gerar Devocional"</p>
                 <p className="text-sm mt-2">O resultado aparecerá aqui</p>
               </CardContent>
             </Card>
           )}
         </div>
       </div>
     </SiteLayout>
   );
 }