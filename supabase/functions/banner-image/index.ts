// Lovable Cloud Function: banner-image
// Generates a wide cinematic banner (3:1) using Lovable AI image generation,
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
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { ok: false as const, status: 500 as const, error: "Missing backend configuration" };
  }

  const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
      " IMPORTANT: The user has provided a logo image. You MUST incorporate this EXACT logo into the banner. Place the logo prominently in the bottom-right corner of the banner, maintaining its original colors and proportions. The logo should be clearly visible but not obstruct the main content. Do NOT create a new logo - use the provided logo image exactly as given.";
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
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing backend configuration");
    if (!LOVABLE_API_KEY) throw new Error("Missing LOVABLE_API_KEY");

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

    console.log("=== BANNER-IMAGE DEBUG ===");
    console.log("Theme:", theme);
    console.log("ArtText:", artText);
    console.log("LogoUrl received:", logoUrl ? `YES (${logoUrl.substring(0, 100)}...)` : "NO");
    console.log("StyleAdjustments:", styleAdjustments);
    console.log("Mode:", mode);
    console.log("Full prompt:", prompt);

    const userContent: any[] = [{ type: "text", text: prompt }];
    if (logoUrl) {
      console.log("Adding logo to AI request as image_url");
      userContent.push({ type: "image_url", image_url: { url: logoUrl } });
    } else {
      console.log("No logo provided, skipping image_url");
    }

    console.log("UserContent structure:", JSON.stringify(userContent.map(c => c.type)));

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [{ role: "user", content: userContent }],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("banner-image ai gateway error:", aiResp.status, t);
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
    const imageDataUrl = aiJson?.choices?.[0]?.message?.images?.[0]?.image_url?.url as string | undefined;
    if (!imageDataUrl) throw new Error("AI did not return an image");

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
