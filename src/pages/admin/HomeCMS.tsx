 import { SiteLayout } from "@/components/site/SiteLayout";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { 
   Breadcrumb, 
   BreadcrumbList, 
   BreadcrumbItem, 
   BreadcrumbLink,
   BreadcrumbSeparator,
   BreadcrumbPage 
 } from "@/components/ui/breadcrumb";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { Layout, Image, Type, MousePointerClick } from "lucide-react";
 
 export default function HomeCMSPage() {
   return (
     <SiteLayout>
       <Breadcrumb className="mb-6">
         <BreadcrumbList>
           <BreadcrumbItem>
             <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
           </BreadcrumbItem>
           <BreadcrumbSeparator />
           <BreadcrumbItem>
             <BreadcrumbPage>Editor da Home Page</BreadcrumbPage>
           </BreadcrumbItem>
         </BreadcrumbList>
       </Breadcrumb>
 
       <header className="mb-6">
         <h1 className="font-display text-3xl flex items-center gap-2">
           <Layout className="h-8 w-8" />
           Editor da Home Page
         </h1>
         <p className="mt-2 text-muted-foreground">
           Personalize textos, imagens e banners da página inicial
         </p>
       </header>
 
       <Tabs defaultValue="hero" className="space-y-6">
         <TabsList className="grid w-full grid-cols-4">
           <TabsTrigger value="hero">
             <Type className="h-4 w-4 mr-2" />
             Hero
           </TabsTrigger>
           <TabsTrigger value="buttons">
             <MousePointerClick className="h-4 w-4 mr-2" />
             Botões
           </TabsTrigger>
           <TabsTrigger value="carousel">
             <Image className="h-4 w-4 mr-2" />
             Carrossel
           </TabsTrigger>
           <TabsTrigger value="texts">
             <Type className="h-4 w-4 mr-2" />
             Textos
           </TabsTrigger>
         </TabsList>
 
         <TabsContent value="hero">
           <Card>
             <CardHeader>
               <CardTitle>Seção Hero (Principal)</CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-sm text-muted-foreground">
                 Editor da seção hero em desenvolvimento.
               </p>
             </CardContent>
           </Card>
         </TabsContent>
 
         <TabsContent value="buttons">
           <Card>
             <CardHeader>
               <CardTitle>Botões de Ação</CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-sm text-muted-foreground">
                 Editor de botões em desenvolvimento.
               </p>
             </CardContent>
           </Card>
         </TabsContent>
 
         <TabsContent value="carousel">
           <Card>
             <CardHeader>
               <CardTitle>Carrossel de Banners</CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-sm text-muted-foreground">
                 Editor de carrossel em desenvolvimento.
               </p>
             </CardContent>
           </Card>
         </TabsContent>
 
         <TabsContent value="texts">
           <Card>
             <CardHeader>
               <CardTitle>Textos Gerais</CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-sm text-muted-foreground">
                 Editor de textos em desenvolvimento.
               </p>
             </CardContent>
           </Card>
         </TabsContent>
       </Tabs>
     </SiteLayout>
   );
 }