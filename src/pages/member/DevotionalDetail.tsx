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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/providers/AuthProvider";

export default function DevotionalDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [fontSize, setFontSize] = useState(16);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // NOTE: evitamos acoplamento aos tipos gerados do backend (que podem demorar a atualizar)
  const db = supabase as any;

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

  // Buscar Likes
  const { data: likesData } = useQuery({
    queryKey: ["devotional-likes", id],
    queryFn: async () => {
      if (!id) return { count: 0, userLiked: false };

      try {
        // Tenta buscar count (safe way)
        const { count, error: countError } = await db
          .from("devotional_likes")
          .select("*", { count: "exact", head: true })
          .eq("devotional_id", id);

        if (countError) {
          console.warn("Tabela de likes pode não existir ainda:", countError.message);
          return { count: 0, userLiked: false };
        }

        let userLiked = false;
        if (user) {
          const { data: userLike } = await db
            .from("devotional_likes")
            .select("id")
            .eq("devotional_id", id)
            .eq("user_id", user.id)
            .maybeSingle();
          userLiked = !!userLike;
        }

        return { count: count ?? 0, userLiked };
      } catch (e) {
        console.error("Erro ao buscar likes", e);
        return { count: 0, userLiked: false };
      }
    },
    enabled: !!id,
    retry: false
  });

  // Mutation Like
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Faça login para curtir");
      if (!id) return;

      if (likesData?.userLiked) {
        // Remove like
        const { error } = await db
          .from("devotional_likes")
          .delete()
          .eq("devotional_id", id)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        // Add like
        const { error } = await db
          .from("devotional_likes")
          .insert({ devotional_id: id, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devotional-likes", id] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível registrar seu like. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Buscar Comentários
  const { data: comments } = useQuery({
    queryKey: ["devotional-comments", id],
    queryFn: async () => {
      if (!id) return [];
      try {
        const { data, error } = await db
          .from("devotional_comments")
          .select(`
            id,
            content,
            created_at,
            user_id
          `)
          .eq("devotional_id", id)
          .order("created_at", { ascending: false });

        if (error) {
          console.warn("Tabela comentários erro:", error.message);
          return [];
        }

        // Buscar emails/nomes dos usuários manualmente para não depender de view complexa
        if (data && data.length > 0) {
          return data;
          // Nota: Num app real, faríamos join com profiles, ou usariamos metadata. 
          // Por enquanto, vamos mostrar iniciais baseadas no ID ou algo genérico se não tiver profile publico.
        }
        return [];
      } catch (e) {
        console.error(e);
        return [];
      }
    },
    enabled: !!id,
    retry: false
  });

  // Adicionar Comentário
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Faça login para comentar");
      if (!id) return;

      const { error } = await db
        .from("devotional_comments")
        .insert({
          devotional_id: id,
          user_id: user.id,
          content
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["devotional-comments", id] });
      toast({ title: "Comentário enviado!" });
    },
    onError: () => {
      toast({ title: "Erro ao enviar comentário", variant: "destructive" });
    }
  });

  // Deletar Comentário
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await db
        .from("devotional_comments")
        .delete()
        .eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devotional-comments", id] });
      toast({ title: "Comentário removido" });
    }
  });

  const handleLike = () => {
    if (!user) {
      toast({ title: "Faça login para curtir", variant: "destructive" });
      return;
    }
    likeMutation.mutate();
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Faça login para comentar", variant: "destructive" });
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    addCommentMutation.mutate(newComment, {
      onSettled: () => setIsSubmitting(false)
    });
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

  // Safe initials function
  const getInitials = (userId: string | undefined | null) => {
    if (!userId) return "??";
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
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-4 py-2 text-sm font-medium text-emerald-700 backdrop-blur w-fit">
                  <Crown className="h-4 w-4" />
                  Pérola do Pastor
                </div>

                {/* Like Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-2 rounded-full px-4 ${likesData?.userLiked ? 'text-rose-500 bg-rose-500/10 hover:bg-rose-500/20' : 'text-muted-foreground'}`}
                  onClick={handleLike}
                >
                  <Heart className={`h-5 w-5 ${likesData?.userLiked ? 'fill-current' : ''}`} />
                  <span className="font-semibold">{likesData?.count || 0}</span>
                </Button>
              </div>

              <CardTitle className="font-display text-2xl md:text-3xl mt-4">{data.title}</CardTitle>

              {data.author && (
                <div className="text-sm font-medium text-muted-foreground mt-2">{data.author}</div>
              )}
            </CardHeader>

            <CardContent className="text-left">
              {/* Controles de Tamanho de Fonte */}
              <div className="flex flex-wrap items-center justify-end gap-4 mb-4">
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
          <Card className="border-0 shadow-lg bg-card mt-8">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Comentários ({comments?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Form de Comentário */}
              {user ? (
                <form onSubmit={handleCommentSubmit} className="flex gap-2 mb-8">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">
                      {getInitials(user.id)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 gap-2 flex flex-col sm:flex-row">
                    <Textarea
                      placeholder="Compartilhe o que Deus falou ao seu coração..."
                      className="min-h-[80px] resize-none"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="h-10 w-10 shrink-0 self-end sm:self-auto bg-emerald-500 hover:bg-emerald-600"
                      disabled={isSubmitting || !newComment.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="bg-muted/50 rounded-xl p-4 text-center mb-8 border border-dashed">
                  <p className="text-sm text-muted-foreground">
                    <NavLink to="/auth" className="text-emerald-600 hover:underline font-medium">Faça login</NavLink> para deixar seu comentário.
                  </p>
                </div>
              )}

              {/* Lista de Comentários */}
              <div className="space-y-6">
                {comments?.map((comment: any) => (
                  <div key={comment.id} className="flex gap-4 group">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="text-xs">
                        {getInitials(comment.user_id)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground/80">
                          Irmão(ã)
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 leading-relaxed bg-muted/30 p-3 rounded-r-xl rounded-bl-xl">
                        {comment.content}
                      </p>

                      {user && user.id === comment.user_id && (
                        <button
                          onClick={() => deleteCommentMutation.mutate(comment.id)}
                          className="text-xs text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Excluir
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {comments?.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground opacity-60">
                    Seja o primeiro a comentar!
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
