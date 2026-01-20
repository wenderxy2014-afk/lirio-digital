drop policy if exists "Anyone can submit cell interest" on public.cell_interest;

create policy "Anyone can submit cell interest"
on public.cell_interest
for insert
to anon, authenticated
with check (
  name is not null and btrim(name) <> '' and char_length(name) <= 120
  and phone is not null and btrim(phone) <> '' and char_length(phone) <= 40
  and (neighborhood is null or char_length(neighborhood) <= 120)
);
