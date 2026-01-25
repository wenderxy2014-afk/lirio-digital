import { useState, useEffect } from "react";
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
import { Sparkles, Wand2, Calendar, Trash2, Edit, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type Devotional = {
  id: string;
  day: string;
  title: string;
  body: string;
  bible_reference: string | null;
  created_at: string;
  is_published: boolean;
};

export default function DevotionalAIPage() {
  const [theme, setTheme] = useState("");
  const [bibleBook, setBibleBook] = useState("");
  const [tone, setTone] = useState("pastoral");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Devotional | null>(null);
  const [history, setHistory] = useState<Devotional[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editBibleRef, setEditBibleRef] = useState("");
  const { toast } = useToast();

  // ... (rest of the file until handleTogglePublish)

  const handleTogglePublish = async (id: string, currentStatus: boolean, isResultView = false) => {
    try {
      const { error } = await supabase
        .from("ebd_devotionals")
        .update({ is_published: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: !currentStatus ? "Devocional publicado" : "Devocional despublicado",
      });

      loadHistory();
      if (isResultView && result && result.id === id) {
        setResult({ ...result, is_published: !currentStatus });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };


  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const { data, error } = await supabase
      .from("ebd_devotionals")
      .select("*")
      .order("day", { ascending: false })
      .limit(30);

    if (error) {
      console.error("Error loading history:", error);
      return;
    }

    setHistory(data || []);
  };

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
          force_new: true, // Force generation with custom params
        },
      });

      if (error) throw error;

      setResult(data);
      loadHistory(); // Refresh history
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

  const handleEdit = (devotional: Devotional) => {
    setEditingId(devotional.id);
    setEditTitle(devotional.title);
    setEditBody(devotional.body);
    setEditBibleRef(devotional.bible_reference || "");
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      const { error } = await supabase
        .from("ebd_devotionals")
        .update({
          title: editTitle,
          body: editBody,
          bible_reference: editBibleRef || null,
        })
        .eq("id", editingId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Devocional atualizado",
      });

      setEditingId(null);
      loadHistory();
      if (result?.id === editingId) {
        setResult({ ...result, title: editTitle, body: editBody, bible_reference: editBibleRef });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("ebd_devotionals")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Devocional excluído",
      });

      setDeleteId(null);
      loadHistory();
      if (result?.id === deleteId) {
        setResult(null);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
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

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate">
            <Wand2 className="h-4 w-4 mr-2" />
            Gerar
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
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
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleEdit(result)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Button>

                      <Button
                        variant={result.is_published ? "secondary" : "default"}
                        className={`flex-1 ${result.is_published ? "text-muted-foreground" : "bg-green-600 hover:bg-green-700 text-white"}`}
                        onClick={() => handleTogglePublish(result.id, result.is_published, true)}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        {result.is_published ? "Ocultar" : "Publicar"}
                      </Button>

                      <Button
                        variant="ghost"
                        className="flex-1 text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(result.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
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
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Últimos 30 Devocionais</CardTitle>
              <CardDescription>
                Histórico de devocionais gerados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.map((dev) => (
                  <div key={dev.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{dev.title}</h4>
                          {dev.is_published && (
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Publicado</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(dev.day).toLocaleDateString("pt-BR")}
                        </p>
                        {dev.bible_reference && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {dev.bible_reference}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePublish(dev.id, dev.is_published)}
                          title={dev.is_published ? "Ocultar" : "Publicar"}
                          className={dev.is_published ? "text-muted-foreground" : "text-green-600"}
                        >
                          <Sparkles className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(dev)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(dev.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {history.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum devocional gerado ainda
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      {editingId && (
        <AlertDialog open={!!editingId} onOpenChange={() => setEditingId(null)}>
          <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>Editar Devocional</AlertDialogTitle>
              <AlertDialogDescription>
                Faça as alterações necessárias no devocional
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-ref">Referência Bíblica</Label>
                <Input
                  id="edit-ref"
                  value={editBibleRef}
                  onChange={(e) => setEditBibleRef(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-body">Conteúdo</Label>
                <Textarea
                  id="edit-body"
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  rows={12}
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleSaveEdit}>Salvar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este devocional? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SiteLayout>
  );
}