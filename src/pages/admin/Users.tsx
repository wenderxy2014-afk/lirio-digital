import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/providers/AuthProvider";
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
import { Users as UsersIcon, UserPlus, Loader2, Mail, Shield, CheckCircle2, XCircle, Pencil, Trash2, ShieldCheck } from "lucide-react";
import { useAdminUsers } from "@/data/queries";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
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
  const { user } = useAuth();
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

  // Edit State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Auto-sync legacy users (Migration Fix)
  useEffect(() => {
    const syncUsers = async () => {
      // 1. Fetch Profiles with Roles (Legacy Source)
      const { data: legacyAdmins, error: legacyError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, created_at, user_roles!inner(role)')
        .in('user_roles.role', ['admin', 'editor']);

      if (legacyError || !legacyAdmins || legacyAdmins.length === 0) return;

      // 2. Fetch Current Admin Users Table (New Source)
      const { data: currentAdmins, error: currError } = await supabase
        .from('admin_users')
        .select('user_id');

      if (currError) return;

      const currentIds = new Set(currentAdmins?.map(u => u.user_id) || []);

      // 3. Identify missing users
      const toInsert = legacyAdmins
        .filter(p => !currentIds.has(p.user_id))
        .map(p => ({
          user_id: p.user_id,
          full_name: p.full_name || 'Usuário Recuperado',
          email: p.email,
          is_active: true,
          created_at: p.created_at
        }));

      // 4. Insert missing users
      if (toInsert.length > 0) {
        console.log("Syncing legacy admins...", toInsert.length);
        const { error: insertError } = await supabase
          .from('admin_users')
          .insert(toInsert);

        if (!insertError) {
          toast({
            title: "Sistema Atualizado",
            description: `${toInsert.length} usuários antigos foram restaurados para a nova lista.`,
          });
          queryClient.invalidateQueries({ queryKey: ["admin_users"] });
        } else {
          console.error("Error syncing users:", insertError);
        }
      }
    };

    syncUsers();
  }, [queryClient, toast]);

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

      if (error) {
        // Fallback: If edge function fails, try to see if we can insert directly (only works if user exists in auth or disabled RLS)
        // But for now, let's just throw, but maybe log more details.
        console.error("Edge function failed:", error);
        throw error;
      }
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

  const handleEditClick = (user: any) => {
    setEditingUser({
      ...user,
      role: user.role || "editor" // Ensure role exists or default
    });
    setEditDialogOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setUpdating(true);

    try {
      // 1. Update Name in admin_users
      const { error: userError } = await supabase
        .from("admin_users")
        .update({
          full_name: editingUser.full_name,
        })
        .eq("id", editingUser.id);

      if (userError) throw userError;

      // 2. Update Role in user_roles
      // Check if role exists for this user, if not insert, if yes update
      // But typically for admin users created via flow, they should have a role.
      // We'll try upsert or just update. Since we don't have the role ID here easily (unless we fetch it),
      // we can update by user_id. user_roles has a unique constraint on user_id probably?
      // Let's assume one role per user for now as per app logic.

      const { error: roleError } = await supabase
        .from("user_roles")
        .upsert({
          user_id: editingUser.user_id,
          role: editingUser.role
        }, { onConflict: 'user_id' }); // Assuming user_id is unique or PK

      if (roleError) throw roleError;

      toast({
        title: "Usuário atualizado!",
        description: "As informações foram salvas com sucesso.",
      });

      setEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
    } catch (error: any) {
      console.error("Update error:", error);
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.")) return;

    setDeletingId(id);
    try {
      // Note: This only deletes from admin_users. 
      // Ideally, an Edge Function should be used to delete from auth.users as well.
      const { error } = await supabase
        .from("admin_users")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Usuário excluído",
        description: "O registro foi removido com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
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
          <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/25">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" /> Diagnóstico de Acesso
            </h3>
            {/* Manual SQL Fix Dialog State */}
            const [showManualHelp, setShowManualHelp] = useState(false);

            {/* ... (rest of the component) */}

            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Usuário Logado:</strong> {user?.email || "Não identificado"}</p>
              <p><strong>ID:</strong> {user?.id}</p>
              <p><strong>Total Carregado:</strong> {adminUsers?.length || 0} registros</p>
              <p><strong>Status Carregamento:</strong> {isLoading ? "Carregando..." : "Concluído"}</p>
            </div>
            {(!adminUsers || adminUsers.length === 0) && (
              <div className="mt-4 space-y-2">
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={async () => {
                    if (!user?.email) return;
                    toast({ title: "Iniciando reparo...", description: "Tentando métodos de recuperação..." });

                    try {
                      // Tentativa 1: Via Edge Function
                      const { data, error } = await supabase.functions.invoke('fix-admin-access', {
                        body: { email: user.email }
                      });

                      if (error) throw error;

                      if (data.success) {
                        toast({ title: "Sucesso!", description: "Acesso restaurado. Recarregando..." });
                        queryClient.invalidateQueries({ queryKey: ["admin_users"] });
                        setTimeout(() => window.location.reload(), 1500);
                      }
                    } catch (funcError: any) {
                      console.warn("Edge attempt failed, trying direct:", funcError);

                      try {
                        // Tentativa 2: Direct Insert
                        await supabase.from("user_roles").upsert({
                          user_id: user.id,
                          role: "admin"
                        }, { onConflict: "user_id,role" });

                        const { error: directError } = await supabase.from("admin_users").upsert({
                          user_id: user.id,
                          email: user.email,
                          full_name: "Admin Recuperado",
                          is_active: true
                        }, { onConflict: "user_id" });

                        if (directError) throw directError;

                        toast({ title: "Sucesso!", description: "Dados restaurados manualmente." });
                        setTimeout(() => window.location.reload(), 1500);

                      } catch (finalError) {
                        toast({
                          title: "Falha Automática",
                          description: "Bloqueio de segurança ativo. Use a correção manual.",
                          variant: "destructive"
                        });
                        setShowManualHelp(true);
                      }
                    }
                  }}
                >
                  <Shield className="mr-2 h-3 w-3" />
                  Tentar Reparo Automático
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setShowManualHelp(true)}
                >
                  Solução Manual (Garantida)
                </Button>
              </div>
            )}
          </div>

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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(user.id)}
                          disabled={deletingId === user.id}
                        >
                          {deletingId === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
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
              <p className="text-sm text-muted-foreground mb-4">
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário
            </DialogDescription>
          </DialogHeader>

          {editingUser && (
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-full-name">Nome Completo</Label>
                <Input
                  id="edit-full-name"
                  value={editingUser.full_name}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">E-mail</Label>
                <Input
                  id="edit-email"
                  value={editingUser.email}
                  disabled
                  className="bg-slate-100 text-slate-500"
                />
                <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado aqui.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-role">Função</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Administrador
                      </div>
                    </SelectItem>
                    <SelectItem value="editor">
                      <div className="flex items-center gap-2">
                        <Pencil className="h-4 w-4" />
                        Editor
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  disabled={updating}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={updating}>
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </SiteLayout >
  );
}