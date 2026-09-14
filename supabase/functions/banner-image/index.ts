// Supabase Edge Function: banner-image
// Generates a wide cinematic banner using OpenAI image generation,
// uploads it to storage, and returns the public URL.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { decode as base64Decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function requireAdminOrEditor(req: Request, admin: any) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false as const, status: 401 as const, error: "Unauthorized" };
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const ANON_KEY = Deno.env.get("ANON_KEY");
  if (!SUPABASE_URL || !ANON_KEY) {
    return { ok: false as const, status: 500 as const, error: "Missing backend configuration" };
  }

  const authClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await authClient.auth.getUser(token);
  const userId = data?.user?.id;
  if (error || !userId) {
    return { ok: false as const, status: 401 as const, error: "Unauthorized" };
  }

  const { data: roles, error: rolesError } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["admin", "editor"])
    .limit(1);

  if (rolesError) {
    console.error("banner-image roles check error:", rolesError);
    return { ok: false as const, status: 500 as const, error: "Falha ao validar permissões." };
  }

  if (!roles || roles.length === 0) {
    return { ok: false as const, status: 403 as const, error: "Sem permissão." };
  }

  return { ok: true as const, userId };
}

type BannerRequest = {
  theme: string;
  artText?: string | null;
  logoUrl?: string | null;
  styleAdjustments?: string | null;
  previousPrompt?: string | null;
  mode?: "generate" | "refine";
};

function buildBannerPrompt(input: {
  theme: string;
  artText?: string | null;
  hasLogo: boolean;
  styleAdjustments?: string | null;
  previousPrompt?: string | null;
  mode: "generate" | "refine";
}) {
  const base =
    "A wide cinematic web banner (3:1 aspect ratio), [THEME], warm and inviting lighting, centered composition with plenty of negative space on the sides for text, high resolution --ar 3:1";

  if (input.mode === "refine" && input.previousPrompt) {
    const extra = input.styleAdjustments?.trim()
      ? ` Additional style adjustments: ${input.styleAdjustments.trim()}`
      : "";
    return `${input.previousPrompt}${extra}`;
  }

  let prompt = base.replace("[THEME]", input.theme.trim());

  if (input.artText?.trim()) {
    prompt += ` Include legible typography with the following text in Portuguese: "${input.artText.trim()}".`;
  }

  if (input.hasLogo) {
    prompt +=
      " CRITICAL REQUIREMENT: The user has uploaded a logo image that you MUST incorporate EXACTLY into the generated banner. " +
      "Place this EXACT logo (preserving its original design, colors, and proportions) in the bottom-right corner of the banner. " +
      "The logo must be clearly visible but not obstruct the main content. " +
      "DO NOT redesign, recreate, or reinterpret the logo - USE THE EXACT IMAGE PROVIDED as-is. " +
      "This is a branding requirement and the logo must appear exactly as provided in the input image.";
  }

  if (input.styleAdjustments?.trim()) {
    prompt += ` Additional style adjustments: ${input.styleAdjustments.trim()}`;
  }

  return prompt;
}

function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; contentType: string } {
  const match = dataUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image data URL");
  const contentType = match[1];
  const base64 = match[2];
  const bytes = base64Decode(base64);
  return { bytes, contentType };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error("Missing backend configuration");
    if (!OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Manual auth (verify_jwt=false) + role gate
    const gate = await requireAdminOrEditor(req, admin);
    if (!gate.ok) {
      return new Response(JSON.stringify({ error: gate.error }), {
        status: gate.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json().catch(() => ({}))) as Partial<BannerRequest>;
    const theme = String(body.theme ?? "").trim();
    if (!theme) {
      return new Response(JSON.stringify({ error: "Tema da imagem é obrigatório." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mode: "generate" | "refine" = body.mode === "refine" ? "refine" : "generate";
    const artText = body.artText ?? null;
    const logoUrl = body.logoUrl ?? null;
    const styleAdjustments = body.styleAdjustments ?? null;
    const previousPrompt = body.previousPrompt ?? null;

    const prompt = buildBannerPrompt({
      theme,
      artText,
      hasLogo: Boolean(logoUrl),
      styleAdjustments,
      previousPrompt,
      mode,
    });

    let aiResp: Response;
    if (logoUrl) {
      const logoResponse = await fetch(logoUrl);
      if (!logoResponse.ok) throw new Error("Não foi possível carregar o logo para edição.");

      const form = new FormData();
      form.append("model", "gpt-image-1");
      form.append("prompt", prompt);
      form.append("size", "1536x1024");
      form.append(
        "image",
        new File(
          [await logoResponse.arrayBuffer()],
          "logo.png",
          { type: logoResponse.headers.get("content-type") || "image/png" },
        ),
      );

      aiResp = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: form,
      });
    } else {
      aiResp = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt,
          size: "1536x1024",
        }),
      });
    }

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("banner-image OpenAI error:", aiResp.status, t);
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos e tente novamente." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      return new Response(JSON.stringify({ error: "Falha ao gerar a imagem com IA." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const imageBase64 = aiJson?.data?.[0]?.b64_json as string | undefined;
    if (!imageBase64) throw new Error("OpenAI did not return an image");
    const imageDataUrl = `data:image/png;base64,${imageBase64}`;

    const { bytes, contentType } = dataUrlToBytes(imageDataUrl);
    const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
    const path = `ai-banners/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await admin.storage.from("home-images").upload(path, bytes, {
      upsert: false,
      contentType,
      cacheControl: "3600",
    });
    if (uploadError) throw uploadError;

    const { data } = admin.storage.from("home-images").getPublicUrl(path);

    return new Response(JSON.stringify({ publicUrl: data.publicUrl, prompt, storagePath: path }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("banner-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
