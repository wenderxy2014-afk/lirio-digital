import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

function todayKey() {
  // Use São Paulo timezone for "devocional do dia"
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

export type EbdDevotional = {
  id: string;
  day: string;
  title: string;
  body: string;
  bible_reference: string | null;
  created_at: string;
};

export function useEbdDevotionalToday() {
  return useQuery({
    queryKey: ["ebd", "today", todayKey()],
    queryFn: async () => {
      // 1) Try DB first (cheap)
      const { data, error } = await supabase
        .from("ebd_devotionals")
        .select("id,day,title,body,bible_reference,created_at")
        .eq("day", todayKey())
        .maybeSingle();
      if (error) throw error;

      if (data) return data as unknown as EbdDevotional;

      // 2) If missing, generate internally (user doesn't see how)
      const { data: fnData, error: fnError } = await supabase.functions.invoke("ebd-devotional", {
        body: {},
      });
      if (fnError) throw fnError;
      return fnData as EbdDevotional;
    },
  });
}

export function useEbdDevotionalsList(limit = 30) {
  return useQuery({
    queryKey: ["ebd", "list", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ebd_devotionals")
        .select("id,day,title,body,bible_reference,created_at")
        .order("day", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as unknown as Array<EbdDevotional>;
    },
  });
}
