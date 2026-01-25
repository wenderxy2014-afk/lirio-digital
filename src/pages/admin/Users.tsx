 import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { 
   Breadcrumb, 
   BreadcrumbList, 
   BreadcrumbItem, 
   BreadcrumbLink,
   BreadcrumbSeparator,
   BreadcrumbPage 
 } from "@/components/ui/breadcrumb";
 import { Button } from "@/components/ui/button";
import { Users as UsersIcon, UserPlus, Loader2, Mail, Shield, CheckCircle2, XCircle, Pencil, Trash2 } from "lucide-react";
import { useAdminUsers } from "@/data/queries";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
 
 export default function UsersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: adminUsers, isLoading } = useAdminUsers();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    email: "",
    fullName: "",
    password: "",
    role: "editor" as "admin" | "editor",
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-admin-user", {
        body: {
          email: newUserForm.email,
          password: newUserForm.password,
          fullName: newUserForm.fullName,
          role: newUserForm.role,
          sendEmail: true,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Falha ao criar usuário");

      toast({
        title: "Usuário criado!",
        description: "Um e-mail de definição de senha foi enviado",
      });

      setCreateDialogOpen(false);
      setNewUserForm({ email: "", fullName: "", password: "", role: "editor" });
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
    } catch (error: any) {
      toast({
        title: "Erro ao criar usuário",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

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
          <Button onClick={() => setCreateDialogOpen(true)}>
           <UserPlus className="mr-2 h-4 w-4" />
           Novo Usuário
         </Button>
       </header>
 
       <Card>
         <CardHeader>
            <CardTitle>Usuários Administrativos</CardTitle>
            <CardDescription>
              {adminUsers?.length || 0} usuário(s) cadastrado(s)
            </CardDescription>
         </CardHeader>
         <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : adminUsers && adminUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.full_name || "Sem nome"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.is_active ? (
                          <Badge variant="default" className="flex w-fit items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex w-fit items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Inativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at!).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Nenhum usuário cadastrado ainda
                </p>
              </div>
            )}
         </CardContent>
       </Card>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
              <DialogDescription>
                Adicione um novo administrador ou editor ao sistema
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-full-name">Nome Completo</Label>
                <Input
                  id="new-full-name"
                  value={newUserForm.fullName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                  placeholder="João Silva"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-email">E-mail</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="joao@igreja.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Senha Temporária</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  O usuário receberá um e-mail para redefinir a senha
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-role">Função</Label>
                <Select
                  value={newUserForm.role}
                  onValueChange={(value) => setNewUserForm({ ...newUserForm, role: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Administrador (acesso total)
                      </div>
                    </SelectItem>
                    <SelectItem value="editor">
                      <div className="flex items-center gap-2">
                        <Pencil className="h-4 w-4" />
                        Editor (permissões limitadas)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  disabled={creating}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Criar Usuário
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
     </SiteLayout>
   );
 }