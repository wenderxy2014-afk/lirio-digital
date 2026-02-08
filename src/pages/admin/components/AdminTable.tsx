import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUploader } from "@/components/admin/FileUploader";

type TableName =
  | "events"
  | "cells"
  | "devotionals"
  | "studies"
  | "missions"
  | "departments"
  | "kids_contents"
  | "testimonials";

export function AdminTable({ table }: { table: TableName }) {
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<Record<string, any>>({});

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin", table],
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return data ?? [];
    return (data ?? []).filter((row: any) => JSON.stringify(row).toLowerCase().includes(s));
  }, [q, data]);

  const fields = useMemo(() => {
    switch (table) {
      case "events":
        return ["title", "description", "starts_at", "location"];
      case "cells":
        return ["name", "address", "meeting_day", "meeting_time", "leader_name", "coleader_name", "whatsapp", "email", "neighborhood"];
      case "devotionals":
      case "studies":
        return ["title", "body", "theme", "bible_book", "author", "video_url", "download_url"];
      case "missions":
        return ["title", "description", "location", "status", "pix_key"];
      case "departments":
        return ["name", "description", "leader_name", "contact_whatsapp", "contact_email"];
      case "kids_contents":
        return ["title", "body", "video_url", "download_url"];
      case "testimonials":
        return ["title", "body", "video_url", "person_name", "status"];
      default:
        return [];
    }
  }, [table]);

  // Mapeamento de nomes de campos para português
  const fieldLabels: Record<string, string> = {
    title: "Título",
    description: "Descrição",
    starts_at: "Data/Hora de Início",
    location: "Local",
    name: "Nome",
    address: "Endereço",
    meeting_day: "Dia do Encontro",
    meeting_time: "Horário",
    leader_name: "Nome do Líder",
    coleader_name: "Nome do Colíder",
    whatsapp: "WhatsApp",
    email: "E-mail",
    neighborhood: "Bairro",
    body: "Conteúdo",
    theme: "Tema",
    bible_book: "Livro da Bíblia",
    author: "Autor",
    video_url: "URL do Vídeo",
    download_url: "URL de Download",
    status: "Status",
    pix_key: "Chave Pix",
    contact_whatsapp: "WhatsApp de Contato",
    contact_email: "E-mail de Contato",
    person_name: "Nome da Pessoa",
  };

  // Mapeamento de tabelas para português
  const tableLabels: Record<string, string> = {
    events: "Eventos",
    cells: "Células",
    devotionals: "Pérolas do Pastor",
    studies: "Estudos",
    missions: "Missões",
    departments: "Departamentos",
    kids_contents: "Conteúdo Kids",
    testimonials: "Testemunhos",
  };

  const getFieldLabel = (field: string) => fieldLabels[field] || field.replace("_", " ");

  // Tradução de status para português
  const statusLabels: Record<string, string> = {
    pending: "Pendente",
    approved: "Aprovado",
    rejected: "Rejeitado",
    active: "Ativo",
    completed: "Concluído",
  };

  const getStatusLabel = (status: string) => statusLabels[status] || status;

  const [editingId, setEditingId] = useState<string | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setDraft({});
    if (table === "events") setDraft({ starts_at: new Date().toISOString() });
    if (table === "missions") setDraft({ status: "active" });
    if (table === "testimonials") setDraft({ status: "pending" });
    // Default published to true for supported tables
    if (["events", "devotionals", "studies", "missions", "kids_contents"].includes(table)) {
      setDraft(d => ({ ...d, is_published: true }));
    }
    setOpen(true);
  };

  const openEdit = (row: any) => {
    setEditingId(row.id);
    setDraft({ ...row }); // populate draft with existing data
    setOpen(true);
  };

  const save = async () => {
    setLoading(true);
    try {
      const payload = { ...draft };
      // cleanup internal fields or joins if any
      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;

      let error;
      if (editingId) {
        const { error: updateError } = await supabase.from(table).update(payload).eq("id", editingId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from(table).insert(payload as any);
        error = insertError;
      }

      if (error) throw error;
      toast({ title: editingId ? "Atualizado" : "Criado com sucesso" });
      setOpen(false);
      await refetch();
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message ?? "Não foi possível salvar.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Excluir este registro?")) return;
    try {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Excluído" });
      await refetch();
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message ?? "Não foi possível excluir.", variant: "destructive" });
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from(table).update({ is_published: !currentStatus }).eq("id", id);
      if (error) throw error;
      toast({ title: !currentStatus ? "Publicado" : "Despublicado" });
      await refetch();
    } catch (e: any) {
      toast({ title: "Erro", description: "Falha ao alterar status.", variant: "destructive" });
    }
  };

  const moderate = async (id: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase.from("testimonials").update({ status }).eq("id", id);
      if (error) throw error;
      toast({ title: "Atualizado" });
      await refetch();
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message ?? "Falha ao atualizar.", variant: "destructive" });
    }
  };

  // Check if table supports is_published
  const supportPublish = ["events", "devotionals", "studies", "missions", "kids_contents"].includes(table);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <CardTitle className="font-display">{tableLabels[table] || table}</CardTitle>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" className="md:w-72" />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="brand" onClick={openCreate}>Novo</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display">{editingId ? "Editar registro" : "Novo registro"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                {fields.map((f) => (
                  <div key={f} className="grid gap-2">
                    <Label>{getFieldLabel(f)}</Label>
                    {f === "body" || f === "description" ? (
                      <Textarea
                        value={draft[f] ?? ""}
                        onChange={(e) => setDraft((s) => ({ ...s, [f]: e.target.value }))}
                        className="min-h-[150px]"
                      />
                    ) : f === "download_url" && table === "kids_contents" ? (
                      <FileUploader
                        currentFileUrl={draft[f] ?? ""}
                        onUploadComplete={(url) => setDraft((s) => ({ ...s, [f]: url }))}
                        folder="kids-materials"
                        label="Material para Download (PDF, imagens para colorir)"
                        accept=".pdf,.png,.jpg,.jpeg,.webp"
                      />
                    ) : f === "status" && table === "missions" ? (
                      <Select value={draft[f] ?? "active"} onValueChange={(v) => setDraft((s) => ({ ...s, [f]: v }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : f === "status" && table === "testimonials" ? (
                      <Select value={draft[f] ?? "pending"} onValueChange={(v) => setDraft((s) => ({ ...s, [f]: v }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="approved">Aprovado</SelectItem>
                          <SelectItem value="rejected">Rejeitado</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input value={draft[f] ?? ""} onChange={(e) => setDraft((s) => ({ ...s, [f]: e.target.value }))} />
                    )}
                  </div>
                ))}

                {/* Checkbox for is_published in modal? implicit */}

                <Button variant="brand" onClick={() => void save()} disabled={loading}>
                  {loading ? "Salvando…" : "Salvar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="text-left">
        {isLoading && <div className="text-sm text-muted-foreground">Carregando…</div>}
        {!isLoading && filtered.length === 0 && <div className="text-sm text-muted-foreground">Sem registros.</div>}

        <div className="mt-4 grid gap-3">
          {filtered.slice(0, 50).map((row: any) => (
            <div key={row.id} className="rounded-2xl border bg-card p-4 transition-all hover:shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 font-medium">
                    {row.title ?? row.name ?? "(sem título)"}
                    {supportPublish && (
                      <span className={`inline-flex h-2 w-2 rounded-full ${row.is_published ? 'bg-green-500' : 'bg-yellow-500'}`} title={row.is_published ? "Publicado" : "Rascunho"} />
                    )}
                  </div>
                  <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">{row.description ?? row.body ?? row.location ?? ""}</div>
                  {table === "testimonials" && (
                    <div className="mt-2 text-xs text-muted-foreground">Status: {getStatusLabel(row.status)}</div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {table === "testimonials" && row.status === "pending" ? (
                    <>
                      <Button variant="soft" size="sm" onClick={() => void moderate(row.id, "approved")}>Aprovar</Button>
                      <Button variant="outline" size="sm" onClick={() => void moderate(row.id, "rejected")}>Reprovar</Button>
                    </>
                  ) : null}

                  {/* Edit Button */}
                  <Button variant="outline" size="sm" onClick={() => openEdit(row)}>
                    Editar
                  </Button>

                  {/* Publish Button (Toggle) */}
                  {supportPublish && (
                    <Button
                      variant={row.is_published ? "secondary" : "default"}
                      size="sm"
                      onClick={() => void togglePublished(row.id, row.is_published)}
                      className={row.is_published ? "text-muted-foreground" : "bg-green-600 hover:bg-green-700 text-white"}
                    >
                      {row.is_published ? "Ocultar" : "Publicar"}
                    </Button>
                  )}

                  {/* Delete Button */}
                  <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => void del(row.id)}>
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-brand-soft p-4 text-xs text-muted-foreground">
          Gerencie o conteúdo do site. Use o botão "Novo" para criar registros e os botões de ação para editar ou remover.
        </div>
      </CardContent>
    </Card>
  );
}
