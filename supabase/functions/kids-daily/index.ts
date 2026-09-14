// Supabase Edge Function: kids-daily
// Generates the daily Kids package (lesson + activity + quiz) and stores it in the database.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type KidsQuizQuestion = {
  question: string;
  options: string[];
  answer_index: number;
  explanation?: string;
};

type KidsDaily = {
  id: string;
  day: string;
  title: string;
  bible_reference: string | null;
  lesson_body: string;
  activity: string;
  quiz: KidsQuizQuestion[];
  created_at: string;
};

function todayKeySP() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

function safeParseJson<T>(raw: unknown): T | null {
  if (!raw || typeof raw !== "string") return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      throw new Error("Missing backend configuration");
    }
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const day = todayKeySP();

    // 1) Read existing
    {
      const { data, error } = await admin
        .from("kids_daily_contents")
        .select("id,day,title,bible_reference,lesson_body,activity,quiz,created_at")
        .eq("day", day)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        return new Response(JSON.stringify(data satisfies KidsDaily), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 2) Generate (internal)
    const system =
      "Você é um educador cristão evangélico especializado em conteúdo infantil (7 a 10 anos). Escreva em português do Brasil, com linguagem simples, alegre, respeitosa e pastoral. Não mencione IA.";

    const user = `Crie o pacote Kids do dia (${day}).\n\nRegras IMPORTANTES:\n- Retorne APENAS JSON válido (sem markdown).\n- Estrutura:\n  {\n    \"title\": string,\n    \"bible_reference\": string,\n    \"lesson_body\": string,\n    \"activity\": string,\n    \"quiz\": [\n      { \"question\": string, \"options\": string[4], \"answer_index\": 0|1|2|3, \"explanation\": string }\n    ]\n  }\n- lesson_body: 700 a 1100 caracteres, com: (1) uma ideia principal, (2) uma aplicação prática para criança, (3) uma oração curtinha (2 linhas).\n- activity: 4 a 7 passos curtos (ex.: desenho, dramatização, desafio em casa).\n- quiz: 5 perguntas, opções bem claras, com explicação curta da resposta.\n- Evite temas pesados; foque em esperança, amor, obediência e fé.\n`;

    const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.85,
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
        return new Response(JSON.stringify({ error: "Créditos insuficientes para gerar o conteúdo Kids." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Falha ao gerar o conteúdo Kids." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const content = aiJson?.choices?.[0]?.message?.content;

    const parsed = safeParseJson<{
      title: string;
      bible_reference: string;
      lesson_body: string;
      activity: string;
      quiz: KidsQuizQuestion[];
    }>(content);

    if (!parsed) {
      console.error("AI returned non-JSON content:", content);
      throw new Error("AI did not return JSON");
    }

    const title = String(parsed.title ?? "Kids do dia").slice(0, 160);
    const bible_reference = String(parsed.bible_reference ?? "").slice(0, 160);
    const lesson_body = String(parsed.lesson_body ?? "").trim();
    const activity = String(parsed.activity ?? "").trim();
    const quiz = Array.isArray(parsed.quiz) ? parsed.quiz : [];

    if (!lesson_body || lesson_body.length < 150) throw new Error("Generated lesson is too short");
    if (!activity || activity.length < 30) throw new Error("Generated activity is too short");

    // 3) Insert (handle race)
    const insertPayload = {
      day,
      title,
      bible_reference: bible_reference || null,
      lesson_body,
      activity,
      quiz,
      model: "gpt-4o-mini",
      is_published: true,
    };

    const { data: inserted, error: insertError } = await admin
      .from("kids_daily_contents")
      .insert(insertPayload)
      .select("id,day,title,bible_reference,lesson_body,activity,quiz,created_at")
      .maybeSingle();

    if (insertError) {
      console.warn("Insert error (retrying read):", insertError.message);
      const { data: existing, error: readError } = await admin
        .from("kids_daily_contents")
        .select("id,day,title,bible_reference,lesson_body,activity,quiz,created_at")
        .eq("day", day)
        .maybeSingle();
      if (readError) throw readError;
      if (existing) {
        return new Response(JSON.stringify(existing satisfies KidsDaily), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw insertError;
    }

    return new Response(JSON.stringify(inserted), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("kids-daily error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
