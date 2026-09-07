create table if not exists public.users (
  id uuid primary key,
  practitioner_name text not null default '',
  ahpra_number text not null default '',
  discipline text not null default '',
  provider_number text not null default '',
  practice_name text not null default '',
  practice_phone text not null default '',
  practice_email text not null default '',
  practice_address text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

alter table public.users enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.users to anon, authenticated;

drop policy if exists users_demo_select on public.users;
create policy users_demo_select
on public.users
for select
to anon, authenticated
using (id = '11111111-1111-4111-8111-111111111111');

drop policy if exists users_demo_insert on public.users;
create policy users_demo_insert
on public.users
for insert
to anon, authenticated
with check (id = '11111111-1111-4111-8111-111111111111');

drop policy if exists users_demo_update on public.users;
create policy users_demo_update
on public.users
for update
to anon, authenticated
using (id = '11111111-1111-4111-8111-111111111111')
with check (id = '11111111-1111-4111-8111-111111111111');

drop policy if exists users_demo_delete on public.users;
create policy users_demo_delete
on public.users
for delete
to anon, authenticated
using (id = '11111111-1111-4111-8111-111111111111');

insert into public.users (id)
values ('11111111-1111-4111-8111-111111111111')
on conflict (id) do nothing;
