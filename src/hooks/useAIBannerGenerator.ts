import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AIBannerPayload = {
  theme: string;
  artText?: string;
  logoUrl?: string;
  styleAdjustments?: string;
  previousPrompt?: string;
  mode?: "generate" | "refine";
};

export type AIBannerResult = {
  publicUrl: string;
  prompt: string;
  storagePath: string;
};

export function useAIBannerGenerator() {
  return useMutation({
    mutationFn: async (payload: AIBannerPayload): Promise<AIBannerResult> => {
      const { data, error } = await supabase.functions.invoke("banner-image", {
        body: payload,
      });

      if (error) {
        // The SDK sometimes wraps HTTP errors into a generic object.
        const message = (error as any)?.message || "Falha ao gerar imagem";
        throw new Error(message);
      }

      if (!data?.publicUrl) throw new Error("Resposta inválida do gerador de imagem");
      return data as AIBannerResult;
    },
  });
}
