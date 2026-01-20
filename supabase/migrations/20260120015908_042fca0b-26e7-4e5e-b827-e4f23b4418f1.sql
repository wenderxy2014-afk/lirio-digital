-- Allow users to read their own roles (needed for client-side route guarding)
drop policy if exists "Users can view own roles" on public.user_roles;
create policy "Users can view own roles"
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id);
