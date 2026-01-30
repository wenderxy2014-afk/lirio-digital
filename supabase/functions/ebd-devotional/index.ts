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

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse request body
   const requestBody = await req.json().catch(() => ({}));
    const {
      day = todayKeySP(),
      customTheme = null,
      customBibleBook = null,
      customTone = null,
      customLength = 800,
      forceNew = false,
   } = requestBody;

    // Generate devotional (internal) - FALLBACK TO GEMINI DIRECT (Lovable Key Missing)
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || "AIzaSyAYf7RMlIr5A6g87DfZxO4c_GQ6Ub2R150";

    if (!geminiApiKey) {
      throw new Error("API Configuration Error: Missing GEMINI_API_KEY");
    }

    const systemPrompt = "Você é um redator cristão evangélico especializado em criar devocionais bíblicos e pastorais para uma igreja local. Você DEVE seguir rigorosamente o tema e tom especificados pelo usuário. Escreva em português do Brasil.";

    // Generate theme prompt
    let themePrompt = "";
    if (customTheme) {
      themePrompt = `TEMA OBRIGATÓRIO: "${customTheme}". Você DEVE criar o devocional focado especificamente neste tema.`;
      if (customBibleBook) {
        themePrompt += ` OBRIGATÓRIO: Use passagens APENAS do livro bíblico: ${customBibleBook}.`;
      }
    } else {
      // Use random theme if no custom theme provided
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
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];
      themePrompt = `O tema ou foco bíblico de hoje deve ser sobre: "${randomTheme}".`;
    }

    // Fetch past titles to avoid repetition
    const { data: pastTitles } = await admin
      .from("ebd_devotionals")
      .select("title")
      .order("day", { ascending: false })
      .limit(5);

    const excludedTitles = pastTitles?.map(t => t.title).join(", ") || "Nenhum ainda";

    const toneText = customTone || "Pastoral e encorajador";

    const userPrompt = `Crie o devocional do dia (${day}).

${themePrompt}

Tom OBRIGATÓRIO: ${toneText}. Mantenha este tom durante todo o texto.

Regras:
- Retorne APENAS JSON válido (sem markdown, sem \`\`\`).
- Campos obrigatórios: title (string), bible_reference (string), body (string).
- body: aproximadamente ${customLength} caracteres, com aplicação prática, encerrando com uma oração curta (2-3 linhas).
- O devocional deve refletir EXATAMENTE o tema especificado acima.
- Nunca mencione que foi gerado por IA.
- Títulos BLOQUEADOS (NUNCA USE): [${excludedTitles}, "A Rocha que não se Abala"].
- IMPORTANTE: Crie um título TOTALMENTE novo, poético e inspirador, diferente de qualquer um acima.`;

    // Direct call to Gemini API to bypass Lovable Gateway issues
    const aiResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: systemPrompt + "\n\n" + userPrompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      }),
    });

    if (!aiResp.ok) {
      const errorText = await aiResp.text();
      console.error("Gemini API error:", aiResp.status, errorText);
      throw new Error(`Gemini API Error: ${aiResp.statusText}`);
    }

    const aiJson = await aiResp.json();
    const content = aiJson?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("Invalid AI response from Gemini");
    }

    let parsed: { title: string; bible_reference: string; body: string };
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse JSON content:", content);
      // Try to clean markdown if model ignored instruction
      const cleaned = content.replace(/```json\n?|```/g, "").trim();
      try {
        parsed = JSON.parse(cleaned);
      } catch (e2) {
        throw new Error("AI did not return valid JSON");
      }
    }

    const title = String(parsed.title ?? "Devocional do dia").slice(0, 160);
    const bible_reference = String(parsed.bible_reference ?? "").slice(0, 160);
    const body = String(parsed.body ?? "").trim();

    if (!body || body.length < 100) {
      throw new Error("Generated devotional is too short");
    }

    // 3) Insert or Update (Upsert)
    const insertPayload = {
      day,
      title,
      bible_reference: bible_reference || null,
      body,
      model: "google/gemini-3-flash-preview",
    };

    let resultData: Devotional | null = null;
    let resultError = null;

    if (forceNew) {
      // FORCE REGENERATE: Use Upsert to overwrite existing for this day
      // This is safer than Delete + Insert and handles the UNIQUE constraint on 'day' automatically.
      const { data, error } = await admin
        .from("ebd_devotionals")
        .upsert(insertPayload, { onConflict: 'day' })
        .select("id,day,title,body,bible_reference,created_at")
        .maybeSingle();

      resultData = data;
      resultError = error;

    } else {
      // Standard Insert (Try to insert, if exists it will fail and we catch below)
      const { data, error } = await admin
        .from("ebd_devotionals")
        .insert(insertPayload)
        .select("id,day,title,body,bible_reference,created_at")
        .maybeSingle();

      resultData = data;
      resultError = error;
    }

    if (resultError) {
      // If we forced a new one and it failed, DO NOT return the old one. Report the error.
      if (forceNew) {
        console.error("Upsert failed during force_new:", resultError);
        throw resultError;
      }

      // If another request inserted first (race condition on insert), fetch and return.
      // Or if upsert failed for some reason.
      console.warn("Write error (retrying read):", resultError.message);
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
      throw resultError;
    }

    return new Response(JSON.stringify(resultData), {
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
