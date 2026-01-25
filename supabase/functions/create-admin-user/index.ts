 // Lovable Cloud Function: create-admin-user
 // Creates a new admin user with proper role assignment
 
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
 
     const { email, password, fullName, role, permissions, sendEmail } = await req.json();
 
     if (!email || !password) {
       return new Response(
         JSON.stringify({ error: "Email and password are required" }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Create auth user
     const { data: user, error: createError } = await admin.auth.admin.createUser({
       email,
       password,
       email_confirm: true, // Auto-confirm email
       user_metadata: {
         full_name: fullName || null,
       },
     });
 
     if (createError) {
       console.error("Error creating user:", createError);
       return new Response(
         JSON.stringify({ error: createError.message }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     if (!user.user) {
       throw new Error("Failed to create user");
     }
 
     // Insert role
     const { error: roleError } = await admin
       .from("user_roles")
       .insert({
         user_id: user.user.id,
         role: role || "editor",
       });
 
     if (roleError) {
       console.error("Error assigning role:", roleError);
       // Try to delete the created user if role assignment fails
       await admin.auth.admin.deleteUser(user.user.id);
       return new Response(
         JSON.stringify({ error: "Failed to assign role: " + roleError.message }),
         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Create profile
     const { error: profileError } = await admin
       .from("profiles")
       .insert({
         user_id: user.user.id,
         email,
         full_name: fullName || null,
       });
 
     if (profileError) {
       console.warn("Error creating profile:", profileError);
       // Not fatal, continue
     }
 
     // Insert admin_users record
     const { error: adminUserError } = await admin
       .from("admin_users")
       .insert({
         user_id: user.user.id,
         email,
         full_name: fullName || null,
         is_active: true,
       });
 
     if (adminUserError) {
       console.warn("Error creating admin_users record:", adminUserError);
     }
 
     // If editor and permissions provided, insert permissions
     if (role === "editor" && permissions && Array.isArray(permissions)) {
       const permissionRecords = permissions.map((perm: any) => ({
         user_id: user.user.id,
         module: perm.module,
         can_read: perm.can_read ?? true,
         can_write: perm.can_write ?? false,
         can_delete: perm.can_delete ?? false,
       }));
 
       const { error: permError } = await admin
         .from("admin_permissions")
         .insert(permissionRecords);
 
       if (permError) {
         console.error("Error inserting permissions:", permError);
       }
     }
 
     // Send password reset email if requested
     if (sendEmail) {
       const { error: resetError } = await admin.auth.resetPasswordForEmail(email, {
         redirectTo: `${req.headers.get("origin")}/auth/reset-password`,
       });
 
       if (resetError) {
         console.warn("Error sending reset email:", resetError);
       }
     }
 
     return new Response(
       JSON.stringify({
         success: true,
         user: {
           id: user.user.id,
           email: user.user.email,
         },
       }),
       { headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   } catch (e) {
     console.error("create-admin-user error:", e);
     return new Response(
       JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
       { 
         status: 500,
         headers: { ...corsHeaders, "Content-Type": "application/json" }
       }
     );
   }
 });