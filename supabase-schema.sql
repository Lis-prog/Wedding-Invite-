create extension if not exists pgcrypto;

create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  invite_code text,
  guest_name text not null,
  invite_type text not null check (invite_type in ('single', 'couple', 'family')),
  partner_name text,
  children_count integer not null default 0,
  answers jsonb not null,
  accepted boolean not null,
  source text default 'link',
  user_agent text
);

alter table public.responses enable row level security;

drop policy if exists "Allow public inserts for RSVP" on public.responses;
create policy "Allow public inserts for RSVP"
on public.responses
for insert
to anon
with check (true);
