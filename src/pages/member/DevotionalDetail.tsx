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

  // Buscar Likes - SIMPLIFICADO
  const { data: likesData } = useQuery({
    queryKey: ["devotional-likes", id],
    queryFn: async () => {
      if (!id) return { count: 0, userLiked: false };

      // Busca count
      const { count } = await db
        .from("devotional_likes")
        .select("*", { count: "exact", head: true })
        .eq("devotional_id", id);

      let userLiked = false;
      if (user) {
        const { data } = await db
          .from("devotional_likes")
          .select("id")
          .eq("devotional_id", id)
          .eq("user_id", user.id)
          .maybeSingle();
        userLiked = !!data;
      }

      return { count: count || 0, userLiked };
    },
    enabled: !!id
  });

  // Mutation Like
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Faça login para curtir");
      if (!id) return;

      if (likesData?.userLiked) {
        await db.from("devotional_likes").delete().eq("devotional_id", id).eq("user_id", user.id);
      } else {
        await db.from("devotional_likes").insert({ devotional_id: id, user_id: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devotional-likes", id] });
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível curtir.", variant: "destructive" });
    }
  });

  // Buscar Comentários - SIMPLIFICADO
  const { data: comments } = useQuery({
    queryKey: ["devotional-comments", id],
    queryFn: async () => {
      if (!id) return [];

      const { data, error } = await db
        .from("devotional_comments")
        .select("*")
        .eq("devotional_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro comentários:", error);
        return [];
      }
      return data;
    },
    enabled: !!id
  });

  // Adicionar Comentário
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Faça login");
      if (!id) return;

      const { error } = await db
        .from("devotional_comments")
        .insert({ devotional_id: id, user_id: user.id, content });

      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["devotional-comments", id] });
      toast({ title: "Comentário enviado!" });
    },
    onError: () => {
      toast({ title: "Erro ao enviar", variant: "destructive" });
    }
  });

  // Deletar Comentário
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await db.from("devotional_comments").delete().eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devotional-comments", id] });
      toast({ title: "Comentário removido" });
    }
  });

  const handleLike = () => {
    if (!user) return toast({ title: "Faça login para curtir", variant: "destructive" });
    likeMutation.mutate();
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast({ title: "Faça login para comentar", variant: "destructive" });
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    addCommentMutation.mutate(newComment, { onSettled: () => setIsSubmitting(false) });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const getInitials = (userId: string | undefined | null) => {
    if (!userId) return "??";
    return userId.slice(0, 2).toUpperCase();
  };

  return (
    <SiteLayout>
      {isLoading && (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-card via-card to-emerald-500/5 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-700">
                  <Crown className="h-4 w-4" />
                  Pérola do Pastor
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-2 rounded-full px-4 ${likesData?.userLiked ? 'text-rose-500 bg-rose-500/10' : 'text-muted-foreground'}`}
                  onClick={handleLike}
                >
                  <Heart className={`h-5 w-5 ${likesData?.userLiked ? 'fill-current' : ''}`} />
                  <span className="font-semibold">{likesData?.count || 0}</span>
                </Button>
              </div>

              <CardTitle className="font-display text-2xl md:text-3xl mt-4">{data.title}</CardTitle>
              {data.author && <div className="text-sm text-muted-foreground mt-2">{data.author}</div>}
            </CardHeader>

            <CardContent>
              <div className="flex justify-end gap-2 mb-4">
                <Button variant="ghost" size="icon" onClick={() => setFontSize(s => Math.max(12, s - 2))}><Minus className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setFontSize(s => Math.min(28, s + 2))}><Plus className="h-4 w-4" /></Button>
              </div>

              <Separator className="mb-4" />

              {data.body && (
                <div className="rounded-xl bg-muted/30 p-6 max-h-[500px] overflow-y-auto">
                  <p className="whitespace-pre-wrap leading-relaxed" style={{ fontSize: `${fontSize}px` }}>{data.body}</p>
                </div>
              )}

              <div className="flex justify-center mt-6">
                <Button asChild variant="outline">
                  <NavLink to="/membro/devocionais">Ler Outras Pérolas</NavLink>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Comentários */}
          <Card className="border-0 shadow-lg mt-8">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Comentários ({comments?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user ? (
                <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-8">
                  <Avatar>
                    <AvatarFallback>{getInitials(user.id)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 gap-2 flex">
                    <Textarea
                      placeholder="Deixe seu comentário..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[60px]"
                    />
                    <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center p-4 bg-muted/50 rounded-lg mb-6">
                  <NavLink to="/auth" className="text-primary underline">Faça login</NavLink> para comentar.
                </div>
              )}

              <div className="space-y-4">
                {comments?.map((comment: any) => (
                  <div key={comment.id} className="flex gap-4">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{getInitials(comment.user_id)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-muted/30 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold opacity-70">Irmão(ã)</span>
                        <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                      {user?.id === comment.user_id && (
                        <button onClick={() => deleteCommentMutation.mutate(comment.id)} className="text-xs text-rose-500 mt-2 block hover:underline">
                          Excluir
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {comments?.length === 0 && <p className="text-center text-muted-foreground py-4">Nenhum comentário ainda.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </SiteLayout>
  );
}
