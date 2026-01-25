 // Lovable Cloud Function: check-admin-exists
 // Verifies if there is at least one admin user in the system
 
 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
 };
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
     const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 
     if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
       throw new Error("Missing backend configuration");
     }
 
     const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
       auth: { persistSession: false },
     });
 
     // Check if any admin exists
     const { data, error } = await admin
       .from("user_roles")
       .select("id")
       .eq("role", "admin")
       .limit(1)
       .maybeSingle();
 
     if (error) {
       console.error("Error checking for admins:", error);
       throw error;
     }
 
     const adminExists = data !== null;
 
     return new Response(
       JSON.stringify({ adminExists }),
       { headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   } catch (e) {
     console.error("check-admin-exists error:", e);
     return new Response(
       JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
       { 
         status: 500,
         headers: { ...corsHeaders, "Content-Type": "application/json" }
       }
     );
   }
 });