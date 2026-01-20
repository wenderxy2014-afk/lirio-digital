-- Core helpers
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Roles
create type public.app_role as enum ('admin','editor','member');

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

create or replace function public.has_any_role(_user_id uuid, _roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = any(_roles)
  )
$$;

-- Profiles (member info)
create table if not exists public.profiles (
  user_id uuid primary key,
  full_name text,
  email text,
  phone text,
  ministry text,
  cell_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- Settings (live stream link, pix key, etc.)
create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create trigger set_site_settings_updated_at
before update on public.site_settings
for each row execute function public.update_updated_at_column();

-- Content tables
create type public.mission_status as enum ('active','completed');
create type public.moderation_status as enum ('pending','approved','rejected');

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  cover_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_events_updated_at
before update on public.events
for each row execute function public.update_updated_at_column();

alter table public.events enable row level security;

create table if not exists public.cells (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  meeting_day text,
  meeting_time text,
  leader_name text,
  coleader_name text,
  whatsapp text,
  email text,
  neighborhood text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_cells_updated_at
before update on public.cells
for each row execute function public.update_updated_at_column();

alter table public.cells enable row level security;

create table if not exists public.cell_interest (
  id uuid primary key default gen_random_uuid(),
  cell_id uuid references public.cells(id) on delete set null,
  name text not null,
  phone text not null,
  neighborhood text,
  created_at timestamptz not null default now()
);

alter table public.cell_interest enable row level security;

create table if not exists public.devotionals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  theme text,
  bible_book text,
  published_on date,
  author text,
  video_url text,
  download_url text,
  tags text[] not null default '{}',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_devotionals_updated_at
before update on public.devotionals
for each row execute function public.update_updated_at_column();

alter table public.devotionals enable row level security;

create table if not exists public.studies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  theme text,
  bible_book text,
  published_on date,
  author text,
  video_url text,
  download_url text,
  tags text[] not null default '{}',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_studies_updated_at
before update on public.studies
for each row execute function public.update_updated_at_column();

alter table public.studies enable row level security;

create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  status public.mission_status not null default 'active',
  pix_key text,
  cover_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_missions_updated_at
before update on public.missions
for each row execute function public.update_updated_at_column();

alter table public.missions enable row level security;

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  leader_name text,
  contact_whatsapp text,
  contact_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_departments_updated_at
before update on public.departments
for each row execute function public.update_updated_at_column();

alter table public.departments enable row level security;

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  video_url text,
  person_name text,
  happened_on date,
  status public.moderation_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_testimonials_updated_at
before update on public.testimonials
for each row execute function public.update_updated_at_column();

alter table public.testimonials enable row level security;

create table if not exists public.kids_contents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  video_url text,
  download_url text,
  tags text[] not null default '{}',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_kids_contents_updated_at
before update on public.kids_contents
for each row execute function public.update_updated_at_column();

alter table public.kids_contents enable row level security;

-- RLS policies
-- user_roles: only admins can manage/select
create policy "Admins can manage roles"
on public.user_roles
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- profiles: owner can select/update/insert; admins can select all
create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);

create policy "Admins can view all profiles"
on public.profiles
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Users can upsert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- site_settings: public read; only admin/editor write
create policy "Public can read settings"
on public.site_settings
for select
to anon, authenticated
using (true);

create policy "Admin/editor can write settings"
on public.site_settings
for all
to authenticated
using (public.has_any_role(auth.uid(), array['admin','editor']::public.app_role[]))
with check (public.has_any_role(auth.uid(), array['admin','editor']::public.app_role[]));

-- events: public read published; admin/editor write
create policy "Public can read published events"
on public.events
for select
to anon, authenticated
using (is_published = true);

create policy "Admin/editor can manage events"
on public.events
for all
to authenticated
using (public.has_any_role(auth.uid(), array['admin','editor']::public.app_role[]))
with check (public.has_any_role(auth.uid(), array['admin','editor']::public.app_role[]));

-- cells: public read; admin/editor write
create policy "Public can read cells"
on public.cells
for select
to anon, authenticated
using (true);

create policy "Admin/editor can manage cells"
on public.cells
for all
to authenticated
using (public.has_any_role(auth.uid(), array['admin','editor']::public.app_role[]))
with check (public.has_any_role(auth.uid(), array['admin','editor']::public.app_role[]));

-- cell_interest: anyone can submit; admin/editor read
create policy "Anyone can submit cell interest"
on public.cell_interest
for insert
to anon, authenticated
with check (true);

create policy "Admin/editor can read cell interest"
on public.cell_interest
for select
to authenticated
using (public.has_any_role(auth.uid(), array['admin','editor']::public.app_role[]));

create policy "Admin/editor can manage cell interest"
on public.cell_interest
for delete
to authenticated
using (public.has_any_role(auth.uid(), array['admin','editor']::public.app_role[]));

-- devotionals: public read published; admin/editor write
create policy "Public can read published devotionals"
on public.devotionals
for select
to anon, authenticated
using (is_published = true);

create policy "Admin/editor can manage devotionals"
on public.devotionals
for all
to authenticated
using (public.has_any_role(auth.uid(), array['admin','editor']::public.app_role[]))
with check (public.has_any_role(auth.uid(), array['admin','editor']::public.app_role[]));

-- studies: public read published; admin/editor write
create policy "Public can read published studies"
on public.studies
for select
to anon, authenticated
using (is_published = true);

create policy "Admin/editor can manage studies"
on public.studies
for all
to authenticated
using (public.has_any_role(auth.uid(), array['admin','editor']::public.app_role[]))
with check (public.has_any_role(auth.uid(), array['admin','editor']::public.app_role[]));

-- missions: public read published; admin/editor write
create policy "Public can read published missions"
on public.missions
for select
to anon, authenticated
using (is_published = true);

create policy "Admin/editor can manage missions"
on public.missions
for all
to authenticated
using (public.has_any_role(auth.uid(), array['admin','editor']::public.app_role[]))
with check (public.has_any_role(auth.uid(), array['admin','editor']::public.app_role[]));

-- departments: public read; admin/editor write
create policy "Public can read departments"
on public.departments
for select
to anon, authenticated
using (true);

create policy "Admin/editor can manage departments"
on public.departments
for all
to authenticated
using (public.has_any_role(auth.uid(), array['admin','editor']::public.app_role[]))
with check (public.has_any_role(auth.uid(), array['admin','editor']::public.app_role[]));

-- testimonials: public read approved; anyone can submit (pending); admin/editor moderate
create policy "Public can read approved testimonials"
on public.testimonials
for select
to anon, authenticated
using (status = 'approved');

create policy "Anyone can submit testimonial"
on public.testimonials
for insert
to anon, authenticated
with check (status = 'pending');

create policy "Admin/editor can manage testimonials"
on public.testimonials
for all
to authenticated
using (public.has_any_role(auth.uid(), array['admin','editor']::public.app_role[]))
with check (public.has_any_role(auth.uid(), array['admin','editor']::public.app_role[]));

-- kids_contents: public read published; admin/editor write
create policy "Public can read published kids content"
on public.kids_contents
for select
to anon, authenticated
using (is_published = true);

create policy "Admin/editor can manage kids content"
on public.kids_contents
for all
to authenticated
using (public.has_any_role(auth.uid(), array['admin','editor']::public.app_role[]))
with check (public.has_any_role(auth.uid(), array['admin','editor']::public.app_role[]));
