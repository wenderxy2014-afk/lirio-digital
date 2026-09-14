
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
            throw new Error("Configuração de backend ausente");
        }

        const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false },
        });

        const { email } = await req.json();

        if (!email) {
            throw new Error("Email é obrigatório");
        }

        // 1. Encontrar usuário pelo email
        // Nota: Como não existe admin.auth.getUserByEmail direto exposto facilmente no client JS padrão sem ser via listUsers filtrando
        // ou usando o service role para buscar na tabela profiles se existir relação confiável.
        // Mas a melhor forma com service role é listar usuários filtrando.
        // Porem listUsers não filtra server-side por email em todas as versões.
        // Vamos tentar buscar na tabela auth.users via RPC se existisse, mas não temos.
        // Vamos assumir que o usuário ESTÁ logado no front, e passou o email. Vamos confiar no ID passado também se possível, mas vamos buscar.

        // Workaround: Buscar na tabela public.profiles que deve ter o user_id linkado
        const { data: profiles, error: profileError } = await adminClient
            .from('profiles')
            .select('user_id')
            .eq('email', email)
            .single();

        let userId = profiles?.user_id;

        if (!userId) {
            // Fallback: tentar listar users (pode ser lento se tiver muitos, mas ok para um fix)
            // Na verdade service role pode acessar auth.users se tiver view ou via admin api
            // O supabase-js admin tem listUsers
            const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
            const foundUser = users.find(u => u.email === email);
            if (foundUser) userId = foundUser.id;
        }

        if (!userId) {
            throw new Error("Usuário não encontrado no sistema de autenticação.");
        }

        const results = [];

        // 2. Corrigir User Roles
        const { error: roleError } = await adminClient
            .from("user_roles")
            .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" }); // Correção: user_roles PK é uuid mas tem unique (user_id, role)

        // Se a unique constraint for user_id,role, o upsert funciona. Se não tiver unique, pode duplicar.
        // Vamos tentar deletar primeiro para garantir "limpeza" ou checar.
        // Mas upsert é melhor.
        if (roleError) console.error("Erro role:", roleError);
        results.push({ step: "user_roles", status: roleError ? "error" : "fixed" });

        // 3. Corrigir Admin Users
        const { error: adminError } = await adminClient
            .from("admin_users")
            .upsert({
                user_id: userId,
                email: email,
                full_name: "Admin Recuperado",
                is_active: true
            }, { onConflict: "user_id" });

        if (adminError) console.error("Erro admin_users:", adminError);
        results.push({ step: "admin_users", status: adminError ? "error" : "fixed" });

        // 4. Corrigir Permissões (opcional, dar todas)
        // ...

        return new Response(
            JSON.stringify({ success: true, userId, results }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
