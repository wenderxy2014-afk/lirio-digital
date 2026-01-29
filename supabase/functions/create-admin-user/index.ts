 // Lovable Cloud Function: create-admin-user
 // Creates a new admin user with proper role assignment
 
 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
 
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
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
 
      // Create or reuse auth user
      let createdNew = false;
      let targetUserId: string | null = null;
      let targetUserEmail: string | null = null;

      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: fullName || null,
        },
      });

      if (createError) {
        // If the email already exists, reuse that user and just assign role/profile records.
        const errAny = createError as any;
        if (errAny?.code === "email_exists") {
          const { data: listData, error: listErr } = await admin.auth.admin.listUsers({
            page: 1,
            perPage: 1000,
          });

          if (listErr) {
            console.error("Error listing users:", listErr);
            return new Response(
              JSON.stringify({ error: "Falha ao localizar o usuário existente." }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
          }

          const found = listData.users?.find((u: any) =>
            String(u.email || "").toLowerCase() === String(email).toLowerCase()
          );

          if (!found?.id) {
            return new Response(
              JSON.stringify({ error: "Usuário já existe, mas não foi possível recuperá-lo." }),
              { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
          }

          targetUserId = found.id;
          targetUserEmail = found.email || email;

          // IMPORTANT: If we're reusing an existing account, we still need to set the
          // provided temporary password; otherwise the person will never be able to log in
          // using the password shown/defined in the admin UI.
          // (Common scenario: promoting an existing member account to admin/editor.)
          const { error: updateAuthErr } = await admin.auth.admin.updateUserById(targetUserId, {
            password,
            email_confirm: true,
            user_metadata: {
              full_name: fullName || null,
            },
          });

          if (updateAuthErr) {
            console.error("Error updating existing user password:", updateAuthErr);
            return new Response(
              JSON.stringify({
                error:
                  "Usuário já existia, mas não foi possível atualizar a senha provisória. Use 'Esqueci minha senha' para definir uma nova senha.",
              }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
          }
        } else {
          console.error("Error creating user:", createError);
          return new Response(
            JSON.stringify({ error: createError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
      } else {
        if (!created.user) {
          throw new Error("Failed to create user");
        }
        createdNew = true;
        targetUserId = created.user.id;
        targetUserEmail = created.user.email ?? email;
      }

      if (!targetUserId) {
        throw new Error("Failed to resolve target user id");
      }
 
     // Insert role
      // Ensure role exists: replace any existing roles for this user (app uses 1 role per admin user)
      const { error: roleDeleteError } = await admin
        .from("user_roles")
        .delete()
        .eq("user_id", targetUserId);

      if (roleDeleteError) {
        console.error("Error clearing existing roles:", roleDeleteError);
        // Not fatal; continue to try insert
      }

      const { error: roleError } = await admin
        .from("user_roles")
        .insert({
          user_id: targetUserId,
          role: role || "editor",
        });
 
     if (roleError) {
       console.error("Error assigning role:", roleError);
        // Try to delete the created user if role assignment fails (only if we just created it)
        if (createdNew && targetUserId) {
          await admin.auth.admin.deleteUser(targetUserId);
        }
       return new Response(
         JSON.stringify({ error: "Failed to assign role: " + roleError.message }),
         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Create profile
     const { error: profileError } = await admin
       .from("profiles")
       .insert({
          user_id: targetUserId,
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
          user_id: targetUserId,
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
          user_id: targetUserId,
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
          reusedExistingUser: !createdNew,
         user: {
            id: targetUserId,
            email: targetUserEmail ?? email,
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