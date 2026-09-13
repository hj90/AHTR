alter table public.users
drop constraint if exists users_practice_state_check;

alter table public.users
add constraint users_practice_state_check
check (practice_state in ('NSW', 'VIC', 'QLD', 'WA'));
