-- Função RPC de Emergência para consertar admin (Security Definer = Roda como Superadmin)
create or replace function public.rpc_fix_my_admin()
returns json
language plpgsql
security definer -- IMPORTANTE: Ignora RLS do usuário e usa permissão do criador
set search_path = public
as $$
declare
  current_email text;
  target_user_id uuid;
begin
  -- Pega o email do usuário que chamou a função
  current_email := auth.jwt() ->> 'email';
  target_user_id := auth.uid();

  if current_email is null then
    return json_build_object('success', false, 'error', 'Não autenticado');
  end if;

  -- 1. Inserir/Garantir na tabela user_roles
  insert into public.user_roles (user_id, role)
  values (target_user_id, 'admin')
  on conflict (user_id, role) do nothing;

  -- 2. Inserir/Garantir na tabela admin_users
  insert into public.admin_users (user_id, email, full_name, is_active)
  values (target_user_id, current_email, 'Admin Recuperado (RPC)', true)
  on conflict (user_id) do update
  set is_active = true, email = current_email;

  return json_build_object('success', true, 'message', 'Permissões restauradas com sucesso para ' || current_email);
exception when others then
  return json_build_object('success', false, 'error', SQLERRM);
end;
$$;

-- Permitir que qualquer usuário logado chame essa função (temporariamente para o fix)
grant execute on function public.rpc_fix_my_admin() to authenticated;
