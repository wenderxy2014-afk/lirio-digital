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
 import { Button } from "@/components/ui/button";
 import { Users as UsersIcon, UserPlus } from "lucide-react";
 
 export default function UsersPage() {
   return (
     <SiteLayout>
       <Breadcrumb className="mb-6">
         <BreadcrumbList>
           <BreadcrumbItem>
             <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
           </BreadcrumbItem>
           <BreadcrumbSeparator />
           <BreadcrumbItem>
             <BreadcrumbPage>Usuários e Permissões</BreadcrumbPage>
           </BreadcrumbItem>
         </BreadcrumbList>
       </Breadcrumb>
 
       <header className="flex items-center justify-between mb-6">
         <div>
           <h1 className="font-display text-3xl flex items-center gap-2">
             <UsersIcon className="h-8 w-8" />
             Usuários Administrativos
           </h1>
           <p className="mt-2 text-muted-foreground">
             Gerencie usuários e suas permissões de acesso
           </p>
         </div>
         <Button>
           <UserPlus className="mr-2 h-4 w-4" />
           Novo Usuário
         </Button>
       </header>
 
       <Card>
         <CardHeader>
           <CardTitle>Lista de Usuários</CardTitle>
         </CardHeader>
         <CardContent>
           <p className="text-sm text-muted-foreground">
             Funcionalidade de gerenciamento de usuários em desenvolvimento.
           </p>
         </CardContent>
       </Card>
     </SiteLayout>
   );
 }