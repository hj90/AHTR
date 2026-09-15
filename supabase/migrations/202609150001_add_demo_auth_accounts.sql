create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  practitioner_name text not null default '',
  ahpra_number text not null default '',
  discipline text not null default '',
  provider_number text not null default '',
  practice_name text not null default '',
  practice_phone text not null default '',
  practice_email text not null default '',
  practice_address text not null default '',
  practice_state text not null default 'NSW' check (practice_state in ('NSW', 'VIC', 'QLD', 'WA', 'SA')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id text not null,
  practice_state text not null check (practice_state in ('NSW', 'VIC', 'QLD', 'WA', 'SA')),
  status text not null default 'draft' check (status in ('draft', 'submitted')),
  values jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz
);

create index if not exists form_submissions_user_updated_idx on public.form_submissions (user_id, updated_at desc);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists form_submissions_set_updated_at on public.form_submissions;
create trigger form_submissions_set_updated_at before update on public.form_submissions for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.form_submissions enable row level security;
grant select, insert, update, delete on public.profiles, public.form_submissions to authenticated;
revoke all on public.profiles, public.form_submissions from anon;

drop policy if exists profiles_own_rows on public.profiles;
create policy profiles_own_rows on public.profiles for all to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists submissions_own_rows on public.form_submissions;
create policy submissions_own_rows on public.form_submissions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Retire the prototype's anonymously accessible shared row.
revoke all on public.users from anon, authenticated;
drop policy if exists users_demo_select on public.users;
drop policy if exists users_demo_insert on public.users;
drop policy if exists users_demo_update on public.users;
drop policy if exists users_demo_delete on public.users;
