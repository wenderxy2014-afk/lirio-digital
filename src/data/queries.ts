import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SettingKey = "church_name" | "live_stream_url" | "pix_key" | "pix_message";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("key,value");
      if (error) throw error;
      const map = new Map<string, string>();
      (data ?? []).forEach((r) => map.set(r.key, r.value));
      return {
        church_name: map.get("church_name") ?? "Igreja Batista Lírio dos Vales",
        live_stream_url: map.get("live_stream_url") ?? "",
        pix_key: map.get("pix_key") ?? "",
        pix_message: map.get("pix_message") ?? "",
      } as Record<SettingKey, string>;
    },
  });
}

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id,title,description,starts_at,location")
        .order("starts_at", { ascending: true })
        .limit(30);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useHomeContent(section: string) {
  return useQuery({
    queryKey: ["home_content", section],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("home_content")
        .select("content")
        .eq("section", section)
        .maybeSingle();
      if (error) throw error;
      return data?.content || null;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin_users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAdminPermissions(userId: string) {
  return useQuery({
    queryKey: ["admin_permissions", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_permissions")
        .select("*")
        .eq("user_id", userId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
}

export function useCells() {
  return useQuery({
    queryKey: ["cells"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cells")
        .select("id,name,address,meeting_day,meeting_time,leader_name,coleader_name,whatsapp,email,neighborhood")
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMissions() {
  return useQuery({
    queryKey: ["missions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("missions")
        .select("id,title,description,location,status,pix_key")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("id,name,description,leader_name,contact_whatsapp,contact_email")
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("id,title,body,video_url,person_name,happened_on,created_at")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useKids() {
  return useQuery({
    queryKey: ["kids"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kids_contents")
        .select("id,title,body,video_url,download_url,tags")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useKidsDailyToday() {
  return useQuery({
    queryKey: ["kids-daily", "today"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("kids-daily", { body: {} });
      if (error) throw error;
      return data as {
        id: string;
        day: string;
        title: string;
        bible_reference: string | null;
        lesson_body: string;
        activity: string;
        quiz: unknown;
        created_at: string;
      };
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useKidsDailyList(limit = 14) {
  return useQuery({
    queryKey: ["kids-daily", "list", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kids_daily_contents")
        .select("id,day,title,bible_reference")
        .order("day", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });
}
export function useDevotionals() {
  return useQuery({
    queryKey: ["devotionals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("devotionals")
        .select("id,title,theme,bible_book,published_on,author,tags")
        .order("published_on", { ascending: false, nullsFirst: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useStudies() {
  return useQuery({
    queryKey: ["studies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studies")
        .select("id,title,theme,bible_book,published_on,author,tags")
        .order("published_on", { ascending: false, nullsFirst: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });
}
