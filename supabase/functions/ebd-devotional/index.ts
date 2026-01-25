// Lovable Cloud Function: ebd-devotional
// Generates (internally) the daily EBD devotional and stores it in the database.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Devotional = {
  id: string;
  day: string;
  title: string;
  body: string;
  bible_reference: string | null;
  created_at: string;
};

function todayKeySP() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing backend configuration");
    }
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const day = todayKeySP();

    // 0) Optional: Clean history if requested (checks url and headers)
    const isCleanRequested =
      req.url.includes("clean=") ||
      req.headers.get("x-clean-history") === "true";

    console.log(`Request URL: ${req.url}`);
    console.log(`Is Clean Requested: ${isCleanRequested}`);

    if (isCleanRequested) {
      console.log("Cleaning ALL devotionals to force re-generation...");
      const { data: count, error: deleteError } = await admin
        .from("ebd_devotionals")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000")
        .select();

      if (deleteError) throw deleteError;

      return new Response(JSON.stringify({
        message: "History cleaned successfully.",
        deletedCount: count?.length ?? 0
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1) Read existing
    {
      const { data, error } = await admin
        .from("ebd_devotionals")
        .select("id,day,title,body,bible_reference,created_at")
        .eq("day", day)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        return new Response(JSON.stringify(data satisfies Devotional), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 2) Generate devotional (internal)
    // Fetch last 5 titles to avoid repetition
    const { data: pastTitles } = await admin
      .from("ebd_devotionals")
      .select("title")
      .order("day", { ascending: false })
      .limit(5);

    const excludedTitles = pastTitles?.map(t => t.title).join(", ") || "Nenhum ainda";

    const system =
      "Você é um redator cristão evangélico e cria devocionais curtos, bíblicos e pastorais para uma igreja local. Escreva em português do Brasil.";

    // 3) Check for manually provided theme in request body
    let requestedTheme = null;
    try {
      if (req.method === "POST") {
        const body = await req.clone().json().catch(() => ({}));
        if (body?.theme) requestedTheme = body.theme;
      }
    } catch (e) {
      // ignore
    }

    const themes = [
      "Salmos: Louvor e Adoração",
      "Provérbios: Sabedoria para o dia a dia",
      "Evangelhos: Ensinamentos de Jesus",
      "Cartas de Paulo: Vida Cristã e Graça",
      "Antigo Testamento: Históricas de Fé (Gênesis, Êxodo, Josué, etc)",
      "Profetas: Esperança e Consolo",
      "Novo Testamento: Cartas Gerais (Tiago, Pedro, João)",
      "Esperança e Encorajamento em tempos difíceis",
      "Família e Relacionamentos à luz da Bíblia",
      "Fé e Oração na prática"
    ];

    // Use requested theme OR random theme
    const activeTheme = requestedTheme || themes[Math.floor(Math.random() * themes.length)];
    const strictInstruction = requestedTheme
      ? `ATENÇÃO: Você deve seguir RIGOROSAMENTE o tema solicitado: "${requestedTheme}". Não desvie do assunto.`
      : `Contexto: O tema ou foco bíblico de hoje deve ser sobre: "${activeTheme}".`;

    const user = `Crie o devocional do dia (${day}).\n\n${strictInstruction}\n\nRegras:\n- Retorne APENAS JSON válido (sem markdown).\n- Campos: title (string), bible_reference (string), body (string).\n- body: 900 a 1400 caracteres, com aplicação prática, encerrando com uma oração curta (2-3 linhas).\n- Evite mencionar que foi gerado por IA.\n- Títulos BLOQUEADOS (NUNCA USE): [${excludedTitles}, "A Rocha que não se Abala"].\n- IMPORTANTE: Crie um título TOTALMENTE novo, poético e inspirador, diferente de qualquer um acima.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.9,
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, t);

      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit. Tente novamente em instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes para gerar o devocional." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Falha ao gerar o devocional." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const content = aiJson?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("Invalid AI response");
    }

    let parsed: { title: string; bible_reference: string; body: string };
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("AI returned non-JSON content:", content);
      throw new Error("AI did not return JSON");
    }

    const title = String(parsed.title ?? "Devocional do dia").slice(0, 160);
    const bible_reference = String(parsed.bible_reference ?? "").slice(0, 160);
    const body = String(parsed.body ?? "").trim();

    if (!body || body.length < 100) {
      throw new Error("Generated devotional is too short");
    }

    // 3) Insert (handle race)
    const insertPayload = {
      day,
      title,
      bible_reference: bible_reference || null,
      body,
      model: "google/gemini-3-flash-preview",
    };

    const { data: inserted, error: insertError } = await admin
      .from("ebd_devotionals")
      .insert(insertPayload)
      .select("id,day,title,body,bible_reference,created_at")
      .maybeSingle();

    if (insertError) {
      // If another request inserted first, fetch and return.
      console.warn("Insert error (retrying read):", insertError.message);
      const { data: existing, error: readError } = await admin
        .from("ebd_devotionals")
        .select("id,day,title,body,bible_reference,created_at")
        .eq("day", day)
        .maybeSingle();
      if (readError) throw readError;
      if (existing) {
        return new Response(JSON.stringify(existing satisfies Devotional), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw insertError;
    }

    return new Response(JSON.stringify(inserted), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ebd-devotional error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
