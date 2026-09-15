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

create table if not exists public.clinics (
  id uuid primary key default gen_random_uuid(),
  practice_name text not null default '',
  practice_email text not null default '',
  practice_phone text not null default '',
  fax text not null default '',
  suburb text not null default '',
  state text not null default 'NSW',
  postcode text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.practitioners (
  id uuid primary key,
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  name text not null default '',
  ahpra_number text not null default '',
  discipline text not null default '',
  sira_approval_number text not null default '',
  email text not null default '',
  preferred_contact_time text not null default '',
  signature text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.practitioners
alter column id drop default;

drop policy if exists clinics_demo_select on public.clinics;
drop policy if exists clinics_demo_insert on public.clinics;
drop policy if exists clinics_demo_update on public.clinics;
drop policy if exists clinics_demo_delete on public.clinics;
drop policy if exists practitioners_demo_select on public.practitioners;
drop policy if exists practitioners_demo_insert on public.practitioners;
drop policy if exists practitioners_demo_update on public.practitioners;
drop policy if exists practitioners_demo_delete on public.practitioners;

alter table public.practitioners
drop constraint if exists practitioners_user_id_fkey;

drop index if exists public.clinics_user_id_idx;
drop index if exists public.practitioners_user_id_idx;
drop index if exists public.practitioners_user_id_unique_idx;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'practitioners'
      and column_name = 'user_id'
  ) then
    execute $sql$
      delete from public.practitioners stale
      using public.practitioners keeper
      where stale.id <> stale.user_id
        and stale.user_id is not null
        and keeper.id = stale.user_id
    $sql$;

    execute $sql$
      update public.practitioners
      set id = user_id
      where user_id is not null
        and id <> user_id
    $sql$;

    execute 'alter table public.practitioners drop column user_id';
  end if;
end;
$$;

alter table public.clinics
drop column if exists user_id;

create index if not exists practitioners_clinic_id_idx on public.practitioners(clinic_id);

drop trigger if exists clinics_set_updated_at on public.clinics;
create trigger clinics_set_updated_at
before update on public.clinics
for each row
execute function public.set_updated_at();

drop trigger if exists practitioners_set_updated_at on public.practitioners;
create trigger practitioners_set_updated_at
before update on public.practitioners
for each row
execute function public.set_updated_at();

alter table public.clinics enable row level security;
alter table public.practitioners enable row level security;

grant select, insert, update, delete on table public.clinics to anon, authenticated;
grant select, insert, update, delete on table public.practitioners to anon, authenticated;

create policy clinics_demo_select
on public.clinics
for select
to authenticated
using (
  exists (
    select 1
    from public.practitioners
    where practitioners.clinic_id = clinics.id
      and practitioners.id = auth.uid()
  )
);

create policy clinics_demo_insert
on public.clinics
for insert
to authenticated
with check (auth.uid() is not null);

create policy clinics_demo_update
on public.clinics
for update
to authenticated
using (
  exists (
    select 1
    from public.practitioners
    where practitioners.clinic_id = clinics.id
      and practitioners.id = auth.uid()
  )
)
with check (auth.uid() is not null);

create policy clinics_demo_delete
on public.clinics
for delete
to authenticated
using (
  exists (
    select 1
    from public.practitioners
    where practitioners.clinic_id = clinics.id
      and practitioners.id = auth.uid()
  )
);

create policy practitioners_demo_select
on public.practitioners
for select
to authenticated
using (id = auth.uid());

create policy practitioners_demo_insert
on public.practitioners
for insert
to authenticated
with check (id = auth.uid());

create policy practitioners_demo_update
on public.practitioners
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy practitioners_demo_delete
on public.practitioners
for delete
to authenticated
using (id = auth.uid());

insert into public.clinics (
  id,
  state
)
values (
  '22222222-2222-4222-8222-222222222222',
  'NSW'
)
on conflict (id) do nothing;

insert into public.practitioners (
  id,
  clinic_id
)
select
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222'
where not exists (
  select 1
  from public.practitioners
  where id = '11111111-1111-4111-8111-111111111111'
);

do $$
begin
  if to_regclass('public.users') is not null then
    insert into public.clinics (
      id,
      practice_name,
      practice_email,
      practice_phone,
      state
    )
    select
      '22222222-2222-4222-8222-222222222222',
      coalesce(to_jsonb(users)->>'practice_name', ''),
      coalesce(to_jsonb(users)->>'practice_email', ''),
      coalesce(to_jsonb(users)->>'practice_phone', ''),
      coalesce(nullif(to_jsonb(users)->>'practice_state', ''), 'NSW')
    from public.users
    where users.id = '11111111-1111-4111-8111-111111111111'
    on conflict (id) do update set
      practice_name = coalesce(nullif(public.clinics.practice_name, ''), excluded.practice_name),
      practice_email = coalesce(nullif(public.clinics.practice_email, ''), excluded.practice_email),
      practice_phone = coalesce(nullif(public.clinics.practice_phone, ''), excluded.practice_phone),
      state = coalesce(nullif(public.clinics.state, ''), excluded.state);

    insert into public.practitioners (
      id,
      clinic_id,
      name,
      ahpra_number,
      discipline,
      sira_approval_number,
      email,
      signature
    )
    select
      users.id,
      '22222222-2222-4222-8222-222222222222',
      coalesce(to_jsonb(users)->>'practitioner_name', ''),
      coalesce(to_jsonb(users)->>'ahpra_number', ''),
      coalesce(to_jsonb(users)->>'discipline', ''),
      coalesce(to_jsonb(users)->>'provider_number', ''),
      coalesce(to_jsonb(users)->>'practice_email', ''),
      coalesce(to_jsonb(users)->>'practitioner_name', '')
    from public.users
    where users.id = '11111111-1111-4111-8111-111111111111'
    on conflict (id) do update set
      clinic_id = excluded.clinic_id,
      name = coalesce(nullif(public.practitioners.name, ''), excluded.name),
      ahpra_number = coalesce(nullif(public.practitioners.ahpra_number, ''), excluded.ahpra_number),
      discipline = coalesce(nullif(public.practitioners.discipline, ''), excluded.discipline),
      sira_approval_number = coalesce(nullif(public.practitioners.sira_approval_number, ''), excluded.sira_approval_number),
      email = coalesce(nullif(public.practitioners.email, ''), excluded.email),
      signature = coalesce(nullif(public.practitioners.signature, ''), excluded.signature);
  end if;
end;
$$;

drop table if exists public.users cascade;
