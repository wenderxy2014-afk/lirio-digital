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

  const openCreate = () => {
    setDraft({});
    if (table === "events") setDraft({ starts_at: new Date().toISOString() });
    if (table === "missions") setDraft({ status: "active" });
    if (table === "testimonials") setDraft({ status: "pending" });
    setOpen(true);
  };

  const save = async () => {
    setLoading(true);
    try {
      const payload = { ...draft };
      if (table === "events" && payload.starts_at && typeof payload.starts_at === "string") {
        // keep ISO
      }
      const { error } = await supabase.from(table).insert(payload as any);
      if (error) throw error;
      toast({ title: "Criado" });
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

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <CardTitle className="font-display">{table}</CardTitle>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" className="md:w-72" />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="brand" onClick={openCreate}>Novo</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Novo registro</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                {fields.map((f) => (
                  <div key={f} className="grid gap-2">
                    <Label>{f}</Label>
                    {f === "body" || f === "description" ? (
                      <Textarea value={draft[f] ?? ""} onChange={(e) => setDraft((s) => ({ ...s, [f]: e.target.value }))} />
                    ) : f === "status" && table === "missions" ? (
                      <Select value={draft[f] ?? "active"} onValueChange={(v) => setDraft((s) => ({ ...s, [f]: v }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">active</SelectItem>
                          <SelectItem value="completed">completed</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : f === "status" && table === "testimonials" ? (
                      <Select value={draft[f] ?? "pending"} onValueChange={(v) => setDraft((s) => ({ ...s, [f]: v }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">pending</SelectItem>
                          <SelectItem value="approved">approved</SelectItem>
                          <SelectItem value="rejected">rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input value={draft[f] ?? ""} onChange={(e) => setDraft((s) => ({ ...s, [f]: e.target.value }))} />
                    )}
                  </div>
                ))}
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
            <div key={row.id} className="rounded-2xl border bg-card p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="font-medium">
                    {row.title ?? row.name ?? "(sem título)"}
                  </div>
                  <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">{row.description ?? row.body ?? row.location ?? ""}</div>
                  {table === "testimonials" && (
                    <div className="mt-2 text-xs text-muted-foreground">status: {row.status}</div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {table === "testimonials" && row.status === "pending" ? (
                    <>
                      <Button variant="soft" size="sm" onClick={() => void moderate(row.id, "approved")}>Aprovar</Button>
                      <Button variant="outline" size="sm" onClick={() => void moderate(row.id, "rejected")}>Reprovar</Button>
                    </>
                  ) : null}
                  <Button variant="outline" size="sm" onClick={() => void del(row.id)}>Excluir</Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-brand-soft p-4 text-xs text-muted-foreground">
          Esta é a v1 do admin: criação e exclusão rápidas. Na próxima iteração, adicionamos editar e formulários completos por entidade.
        </div>
      </CardContent>
    </Card>
  );
}
