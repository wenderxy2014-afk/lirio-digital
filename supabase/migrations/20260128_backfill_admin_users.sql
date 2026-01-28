-- Backfill: Popula a tabela admin_users com usuários admin/editor existentes
-- Isso garante que usuários criados antes da nova tabela de gestão apareçam na lista

INSERT INTO public.admin_users (user_id, full_name, email, is_active, created_at)
SELECT 
  p.user_id,
  COALESCE(p.full_name, 'Wender Carvalho'), -- Fallback para nome se não houver no perfil
  p.email,
  true,
  COALESCE(p.created_at, NOW())
FROM public.profiles p
JOIN public.user_roles ur ON ur.user_id = p.user_id
WHERE ur.role IN ('admin', 'editor')
AND NOT EXISTS (
  SELECT 1 FROM public.admin_users au WHERE au.user_id = p.user_id
);

-- Opcional: Garantir que Wender especificamente seja admin se ele existir em auth.users mas não em roles
-- (Isso requer permissões de superadmin que este script pode ter dependendo de onde rodar)
