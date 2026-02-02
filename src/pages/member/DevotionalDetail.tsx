import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { Textarea } from "@/components/ui/textarea";
import { Crown, Minus, Plus, Type, BookOpen, ArrowRight, Heart, MessageCircle, Send, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function DevotionalDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [fontSize, setFontSize] = useState(16);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar devocional
  const { data, isLoading } = useQuery({
    queryKey: ["devotional", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("devotionals").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Buscar likes count
  const { data: likesData } = useQuery({
    queryKey: ["devotional-likes", id],
    queryFn: async () => {
      if (!id) return { count: 0, userLiked: false };

      // Contar likes
      const { count } = await supabase
        .from("devotional_likes")
        .select("*", { count: "exact", head: true })
        .eq("devotional_id", id);

      // Verificar se usuário deu like
      let userLiked = false;
      if (user) {
        const { data: userLike } = await supabase
          .from("devotional_likes")
          .select("id")
          .eq("devotional_id", id)
          .eq("user_id", user.id)
          .maybeSingle();
        userLiked = !!userLike;
      }

      return { count: count ?? 0, userLiked };
    },
    enabled: !!id,
  });

  // Buscar comentários
  const { data: comments } = useQuery({
    queryKey: ["devotional-comments", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from("devotional_comments")
        .select("*")
        .eq("devotional_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  // Mutation para like/unlike
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id) throw new Error("Faça login para curtir");

      if (likesData?.userLiked) {
        // Remove like
        const { error } = await supabase
          .from("devotional_likes")
          .delete()
          .eq("devotional_id", id)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        // Add like
        const { error } = await supabase
          .from("devotional_likes")
          .insert({ devotional_id: id, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devotional-likes", id] });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  // Mutation para adicionar comentário
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user || !id) throw new Error("Faça login para comentar");

      const { error } = await supabase
        .from("devotional_comments")
        .insert({ devotional_id: id, user_id: user.id, content });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["devotional-comments", id] });
      toast({ title: "Comentário adicionado!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  // Mutation para deletar comentário
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("devotional_comments")
        .delete()
        .eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devotional-comments", id] });
      toast({ title: "Comentário removido" });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    await addCommentMutation.mutateAsync(newComment.trim());
    setIsSubmitting(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (userId: string) => {
    return userId.slice(0, 2).toUpperCase();
  };

  return (
    <SiteLayout>
      {isLoading && (
        <div className="flex items-center justify-center rounded-3xl border border-dashed bg-gradient-to-br from-background to-emerald-500/5 p-12">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            Carregando pérola…
          </div>
        </div>
      )}

      {!isLoading && !data && (
        <div className="rounded-3xl border bg-card p-6 text-left text-muted-foreground">
          Pérola não encontrada.
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Card Principal */}
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-card via-card to-emerald-500/5 shadow-lg">
            <CardHeader className="pb-4">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-4 py-2 text-sm font-medium text-emerald-700 backdrop-blur mb-4 w-fit">
                <Crown className="h-4 w-4" />
                Pérola do Pastor
              </div>

              <CardTitle className="font-display text-2xl md:text-3xl">{data.title}</CardTitle>

              {data.author && (
                <div className="text-sm font-medium text-muted-foreground mt-2">{data.author}</div>
              )}
            </CardHeader>

            <CardContent className="text-left">
              {/* Controles de Tamanho de Fonte */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  {/* Likes */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => likeMutation.mutate()}
                    disabled={!user || likeMutation.isPending}
                    className={`gap-2 ${likesData?.userLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500"}`}
                  >
                    <Heart className={`h-5 w-5 ${likesData?.userLiked ? "fill-current" : ""}`} />
                    <span className="font-medium">{likesData?.count ?? 0}</span>
                  </Button>

                  {/* Comments count */}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageCircle className="h-5 w-5" />
                    <span className="font-medium">{comments?.length ?? 0}</span>
                  </div>
                </div>

                {/* Font size controls */}
                <div className="flex h-9 items-center gap-1 rounded-xl border bg-background/80 p-1.5 backdrop-blur shadow-sm">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-emerald-500/10"
                    onClick={() => setFontSize(s => Math.max(12, s - 2))}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Type className="h-3 w-3 text-muted-foreground" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-emerald-500/10"
                    onClick={() => setFontSize(s => Math.min(28, s + 2))}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <Separator className="mb-4" />

              {/* Área de Texto com Scroll */}
              {data.body && (
                <div className="rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200/50 dark:border-emerald-800/30 relative overflow-hidden">
                  <div className="max-h-[500px] overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-transparent">
                    <p
                      className="whitespace-pre-wrap text-foreground transition-[font-size] duration-300 leading-relaxed"
                      style={{ fontSize: `${fontSize}px`, lineHeight: "1.8" }}
                    >
                      {data.body}
                    </p>
                  </div>
                </div>
              )}

              {/* Links de Mídia */}
              <div className="flex flex-wrap gap-4 mt-6">
                {data.video_url && (
                  <a
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-500/20 transition-colors"
                    href={data.video_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Assistir vídeo
                  </a>
                )}
                {data.download_url && (
                  <a
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-500/10 px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-500/20 transition-colors"
                    href={data.download_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Baixar material
                  </a>
                )}
              </div>

              <Separator className="my-6" />

              {/* Botão Ler Outras Pérolas */}
              <div className="flex justify-center">
                <Button
                  asChild
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300"
                  size="lg"
                >
                  <NavLink to="/membro/devocionais">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Ler Outras Pérolas
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </NavLink>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Seção de Comentários */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-emerald-600" />
                Comentários ({comments?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Formulário de novo comentário */}
              {user ? (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Compartilhe sua reflexão sobre esta pérola..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || isSubmitting}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Enviando..." : "Enviar Comentário"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-muted/50 p-4 text-center text-muted-foreground">
                  <p>Faça login para deixar um comentário</p>
                  <Button asChild variant="link" className="text-emerald-600">
                    <NavLink to="/auth">Entrar</NavLink>
                  </Button>
                </div>
              )}

              <Separator />

              {/* Lista de comentários */}
              <div className="space-y-4">
                {comments && comments.length > 0 ? (
                  comments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-3 rounded-xl bg-muted/30 p-4">
                      <Avatar className="h-10 w-10 bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
                        <AvatarFallback className="bg-transparent text-xs font-bold">
                          {getInitials(comment.user_id)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.created_at)}
                          </span>
                          {user?.id === comment.user_id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteCommentMutation.mutate(comment.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <p className="mt-1 text-sm whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Seja o primeiro a comentar!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </SiteLayout>
  );
}
