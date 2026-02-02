import { useMemo, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Crown, Settings, Sparkles, Eye, EyeOff, Calendar, Palette, Layout } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Tipos de estilos disponíveis
type BannerStyle = "emerald" | "ocean" | "sunset" | "royal" | "rose" | "midnight" | "golden";
type BannerEffect = "default" | "pulse" | "glow" | "shimmer";
type FontColor = "white" | "cream" | "gold" | "light-blue";

interface BannerSettings {
    enabled: boolean;
    effect: BannerEffect;
    style: BannerStyle;
    fontColor: FontColor;
}

// Configurações de estilos
const BANNER_STYLES: Record<BannerStyle, { name: string; preview: string }> = {
    emerald: { name: "Esmeralda", preview: "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" },
    ocean: { name: "Oceano", preview: "bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500" },
    sunset: { name: "Pôr do Sol", preview: "bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500" },
    royal: { name: "Real", preview: "bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-500" },
    rose: { name: "Rosa", preview: "bg-gradient-to-r from-pink-500 via-rose-500 to-red-400" },
    midnight: { name: "Meia-Noite", preview: "bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600" },
    golden: { name: "Dourado", preview: "bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-400" },
};

const FONT_COLORS: Record<FontColor, { name: string; class: string }> = {
    white: { name: "Branco", class: "text-white" },
    cream: { name: "Creme", class: "text-amber-50" },
    gold: { name: "Dourado", class: "text-yellow-300" },
    "light-blue": { name: "Azul Claro", class: "text-sky-100" },
};

export function PastorPearlsAdmin() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [q, setQ] = useState("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [draft, setDraft] = useState<Record<string, any>>({});
    const [editingId, setEditingId] = useState<string | null>(null);

    // Banner settings state
    const [bannerSettings, setBannerSettings] = useState<BannerSettings>({
        enabled: true,
        effect: "default",
        style: "emerald",
        fontColor: "white",
    });
    const [savingSettings, setSavingSettings] = useState(false);

    // Load banner settings
    const { data: settingsData } = useQuery({
        queryKey: ["pastor-pearls-banner-settings"],
        queryFn: async () => {
            const { data } = await supabase
                .from("site_settings")
                .select("key, value")
                .in("key", [
                    "pastor_pearls_banner_enabled",
                    "pastor_pearls_banner_effect",
                    "pastor_pearls_banner_style",
                    "pastor_pearls_banner_font_color",
                ]);
            return data ?? [];
        },
    });

    // Parse settings on load
    useEffect(() => {
        if (settingsData && settingsData.length > 0) {
            const enabled = settingsData.find(s => s.key === "pastor_pearls_banner_enabled");
            const effect = settingsData.find(s => s.key === "pastor_pearls_banner_effect");
            const style = settingsData.find(s => s.key === "pastor_pearls_banner_style");
            const fontColor = settingsData.find(s => s.key === "pastor_pearls_banner_font_color");

            setBannerSettings({
                enabled: enabled?.value !== "false",
                effect: (effect?.value as BannerEffect) || "default",
                style: (style?.value as BannerStyle) || "emerald",
                fontColor: (fontColor?.value as FontColor) || "white",
            });
        }
    }, [settingsData]);

    // Load devotionals (limited to 7)
    const { data, refetch, isLoading } = useQuery({
        queryKey: ["admin", "devotionals"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("devotionals")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(7);
            if (error) throw error;
            return data ?? [];
        },
    });

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return data ?? [];
        return (data ?? []).filter((row: any) =>
            JSON.stringify(row).toLowerCase().includes(s)
        );
    }, [q, data]);

    const fields = ["title", "body", "theme", "bible_book", "author", "video_url", "download_url"];

    const fieldLabels: Record<string, string> = {
        title: "Título",
        body: "Conteúdo",
        theme: "Tema",
        bible_book: "Livro da Bíblia",
        author: "Autor",
        video_url: "URL do Vídeo",
        download_url: "URL de Download",
    };

    const openCreate = () => {
        setEditingId(null);
        setDraft({ is_published: true });
        setOpen(true);
    };

    const openEdit = (row: any) => {
        setEditingId(row.id);
        setDraft({ ...row });
        setOpen(true);
    };

    const save = async () => {
        setLoading(true);
        try {
            if (!draft.title?.trim()) {
                toast({ title: "Erro", description: "O título é obrigatório.", variant: "destructive" });
                setLoading(false);
                return;
            }

            const payload: {
                title: string;
                body?: string;
                theme?: string;
                bible_book?: string;
                author?: string;
                video_url?: string;
                download_url?: string;
                is_published?: boolean;
            } = {
                title: draft.title,
                body: draft.body,
                theme: draft.theme,
                bible_book: draft.bible_book,
                author: draft.author,
                video_url: draft.video_url,
                download_url: draft.download_url,
                is_published: draft.is_published ?? true,
            };

            let error;
            if (editingId) {
                const { error: updateError } = await supabase.from("devotionals").update(payload).eq("id", editingId);
                error = updateError;
            } else {
                const { error: insertError } = await supabase.from("devotionals").insert(payload);
                error = insertError;
            }

            if (error) throw error;
            toast({ title: editingId ? "Atualizado" : "Pérola criada com sucesso!" });
            setOpen(false);
            await refetch();
        } catch (e: any) {
            toast({ title: "Erro", description: e?.message ?? "Não foi possível salvar.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const del = async (id: string) => {
        if (!confirm("Excluir esta pérola?")) return;
        try {
            const { error } = await supabase.from("devotionals").delete().eq("id", id);
            if (error) throw error;
            toast({ title: "Excluído" });
            await refetch();
        } catch (e: any) {
            toast({ title: "Erro", description: e?.message ?? "Não foi possível excluir.", variant: "destructive" });
        }
    };

    const togglePublished = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase.from("devotionals").update({ is_published: !currentStatus }).eq("id", id);
            if (error) throw error;
            toast({ title: !currentStatus ? "Publicado" : "Despublicado" });
            await refetch();
            queryClient.invalidateQueries({ queryKey: ["latest-pastor-pearl"] });
        } catch (e: any) {
            toast({ title: "Erro", description: "Falha ao alterar status.", variant: "destructive" });
        }
    };

    const saveBannerSettings = async () => {
        setSavingSettings(true);
        try {
            const rows = [
                { key: "pastor_pearls_banner_enabled", value: bannerSettings.enabled.toString() },
                { key: "pastor_pearls_banner_effect", value: bannerSettings.effect },
                { key: "pastor_pearls_banner_style", value: bannerSettings.style },
                { key: "pastor_pearls_banner_font_color", value: bannerSettings.fontColor },
            ];
            const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
            if (error) throw error;
            toast({ title: "Configurações salvas!", description: "Atualize a página inicial para ver as mudanças." });

            await queryClient.invalidateQueries({ queryKey: ["pastor-pearls-banner-settings"] });
            await queryClient.invalidateQueries({ queryKey: ["latest-pastor-pearl"] });
            await queryClient.refetchQueries({ queryKey: ["pastor-pearls-banner-settings"] });
        } catch (e: any) {
            toast({ title: "Erro", description: e?.message ?? "Falha ao salvar.", variant: "destructive" });
        } finally {
            setSavingSettings(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="space-y-6">
            {/* Banner Configuration Card */}
            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-emerald-600" />
                        <CardTitle className="font-display text-lg">Configuração do Banner</CardTitle>
                    </div>
                    <CardDescription>Personalize a aparência do banner "Pérola do Pastor" na home page</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Ativar/Desativar */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="font-medium">Exibir Banner</Label>
                            <p className="text-sm text-muted-foreground">Ativar/desativar o banner na home page</p>
                        </div>
                        <Switch
                            checked={bannerSettings.enabled}
                            onCheckedChange={(checked) => setBannerSettings(s => ({ ...s, enabled: checked }))}
                        />
                    </div>

                    <Separator />

                    {/* Estilo do Banner */}
                    <div className="space-y-3">
                        <Label className="font-medium flex items-center gap-2">
                            <Layout className="h-4 w-4 text-emerald-600" />
                            Estilo do Banner
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {(Object.entries(BANNER_STYLES) as [BannerStyle, { name: string; preview: string }][]).map(([key, { name, preview }]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setBannerSettings(s => ({ ...s, style: key }))}
                                    className={`relative rounded-xl p-3 text-white text-sm font-medium transition-all ${preview} ${bannerSettings.style === key
                                            ? "ring-4 ring-offset-2 ring-emerald-500 scale-105"
                                            : "opacity-80 hover:opacity-100 hover:scale-102"
                                        }`}
                                >
                                    {name}
                                    {bannerSettings.style === key && (
                                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
                                            <span className="text-[10px]">✓</span>
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Efeito Visual */}
                    <div className="space-y-2">
                        <Label className="font-medium flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-emerald-600" />
                            Efeito Visual
                        </Label>
                        <Select
                            value={bannerSettings.effect}
                            onValueChange={(v) => setBannerSettings(s => ({ ...s, effect: v as BannerEffect }))}
                        >
                            <SelectTrigger className="w-full md:w-64">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default">Padrão - Sem efeito extra</SelectItem>
                                <SelectItem value="pulse">Pulsar - Animação suave</SelectItem>
                                <SelectItem value="glow">Brilho - Efeito luminoso</SelectItem>
                                <SelectItem value="shimmer">Cintilante - Efeito brilhante</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator />

                    {/* Cor da Fonte */}
                    <div className="space-y-3">
                        <Label className="font-medium flex items-center gap-2">
                            <Palette className="h-4 w-4 text-emerald-600" />
                            Cor do Texto
                        </Label>
                        <div className="flex flex-wrap gap-3">
                            {(Object.entries(FONT_COLORS) as [FontColor, { name: string; class: string }][]).map(([key, { name }]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setBannerSettings(s => ({ ...s, fontColor: key }))}
                                    className={`rounded-xl px-4 py-2 text-sm font-medium transition-all border-2 ${bannerSettings.fontColor === key
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                            : "border-gray-200 hover:border-gray-300 bg-white"
                                        }`}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="space-y-2">
                        <Label className="font-medium">Pré-visualização</Label>
                        <div className={`rounded-xl p-4 ${BANNER_STYLES[bannerSettings.style].preview} ${FONT_COLORS[bannerSettings.fontColor].class}`}>
                            <div className="flex items-center gap-2 text-base md:text-lg font-bold">
                                <Crown className="h-4 w-4" />
                                <span>Pérola do Pastor</span>
                            </div>
                            <div className="mt-1 text-sm md:text-base opacity-90">
                                Exemplo de título da mensagem
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={saveBannerSettings}
                        disabled={savingSettings}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                    >
                        {savingSettings ? "Salvando..." : "Salvar Configurações do Banner"}
                    </Button>
                </CardContent>
            </Card>

            {/* Pearls List Card */}
            <Card>
                <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <CardTitle className="font-display flex items-center gap-2">
                            <Crown className="h-5 w-5 text-emerald-600" />
                            Pérolas do Pastor
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Últimas 7 postagens são mantidas arquivadas
                        </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" className="md:w-72" />
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button variant="brand" onClick={openCreate}>Nova Pérola</Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="font-display">{editingId ? "Editar Pérola" : "Nova Pérola"}</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4">
                                    {fields.map((f) => (
                                        <div key={f} className="grid gap-2">
                                            <Label>{fieldLabels[f]}</Label>
                                            {f === "body" ? (
                                                <Textarea
                                                    value={draft[f] ?? ""}
                                                    onChange={(e) => setDraft((s) => ({ ...s, [f]: e.target.value }))}
                                                    className="min-h-[200px]"
                                                    placeholder="Escreva a mensagem do pastor aqui..."
                                                />
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
                    {!isLoading && filtered.length === 0 && <div className="text-sm text-muted-foreground">Nenhuma pérola cadastrada.</div>}

                    <div className="mt-4 grid gap-3">
                        {filtered.map((row: any) => (
                            <div key={row.id} className="rounded-2xl border bg-card p-4 transition-all hover:shadow-sm">
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 font-medium">
                                            {row.title ?? "(sem título)"}
                                            <span className={`inline-flex h-2 w-2 rounded-full ${row.is_published ? 'bg-green-500' : 'bg-yellow-500'}`} title={row.is_published ? "Publicado" : "Rascunho"} />
                                        </div>
                                        <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">{row.body ?? ""}</div>

                                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            <span>Publicado em: {formatDate(row.created_at)}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => openEdit(row)}>
                                            Editar
                                        </Button>
                                        <Button
                                            variant={row.is_published ? "secondary" : "default"}
                                            size="sm"
                                            onClick={() => void togglePublished(row.id, row.is_published)}
                                            className={row.is_published ? "text-muted-foreground" : "bg-green-600 hover:bg-green-700 text-white"}
                                        >
                                            {row.is_published ? (
                                                <>
                                                    <EyeOff className="mr-1 h-3 w-3" />
                                                    Ocultar
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="mr-1 h-3 w-3" />
                                                    Publicar
                                                </>
                                            )}
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => void del(row.id)}>
                                            Excluir
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-4 text-xs text-muted-foreground">
                        <strong>📌 Nota:</strong> Apenas as últimas 7 pérolas são mantidas arquivadas. Postagens mais antigas serão removidas automaticamente para manter o histórico organizado.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
