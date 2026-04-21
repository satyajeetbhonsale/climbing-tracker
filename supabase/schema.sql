-- Run this in the Supabase SQL editor to create the climbs table.

create table if not exists public.climbs (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  date                date not null,
  environment         text not null check (environment in ('indoor', 'outdoor')),
  discipline          text not null check (discipline in ('toprope', 'lead', 'boulder')),
  name                text not null,
  grade               text not null check (
                        grade in ('4','5a','5b','5c','5c+','6a','6a+','6b','6b+','6c','6c+','7a')
                      ),
  is_sent             boolean not null default true,
  attempts            integer not null default 1 check (attempts >= 1),
  location            text not null default '',
  time_spent_minutes  integer check (time_spent_minutes > 0),
  notes               text
);

-- Enable Row Level Security and allow all operations for now (adjust later for auth).
alter table public.climbs enable row level security;

create policy "Allow all" on public.climbs
  for all
  using (true)
  with check (true);
