create table if not exists public.kids_rankings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  age integer not null,
  score integer not null,
  quiz_date date not null default current_date
);

alter table public.kids_rankings enable row level security;

create policy "Enable read access for all users"
on public.kids_rankings for select
using (true);

create policy "Enable insert access for all users"
on public.kids_rankings for insert
with check (true);
