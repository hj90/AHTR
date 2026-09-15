create unique index if not exists practitioners_email_unique_idx
on public.practitioners (lower(trim(email)))
where nullif(trim(email), '') is not null;
