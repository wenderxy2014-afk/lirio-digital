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
      // DEBUG: Mostra no console do navegador o que está sendo enviado
      console.log("=== AI BANNER GENERATOR DEBUG ===");
      console.log("Payload being sent to Edge Function:");
      console.log("- theme:", payload.theme);
      console.log("- artText:", payload.artText || "(empty)");
      console.log("- logoUrl:", payload.logoUrl ? `PROVIDED (${payload.logoUrl.substring(0, 80)}...)` : "NOT PROVIDED");
      console.log("- styleAdjustments:", payload.styleAdjustments || "(empty)");
      console.log("- mode:", payload.mode || "generate");
      console.log("Full payload:", JSON.stringify(payload, null, 2));

      const { data, error } = await supabase.functions.invoke("banner-image", {
        body: payload,
      });

      console.log("Edge Function response:");
      console.log("- error:", error);
      console.log("- data:", data);
      console.log("- prompt returned:", data?.prompt);

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
