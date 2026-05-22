-- CITS CRM Schema
-- Run this in Supabase SQL Editor

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  title text,
  company text,
  company_website text,
  company_summary text,
  linkedin_url text unique,
  email text,
  phone text,
  location text default 'Qatar',
  industry text,
  status text default 'Untouched'
    check (status in ('Untouched', 'Called', 'Follow-up', 'Meeting Booked', 'Not Interested', 'Dead')),
  scraped_at timestamptz default now(),
  enriched_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade not null,
  note text not null,
  created_at timestamptz default now()
);

create table if not exists meetings (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade not null,
  google_event_id text,
  google_event_link text,
  meeting_time timestamptz,
  duration_minutes int default 30,
  notes text,
  booked_at timestamptz default now()
);

create table if not exists calendar_tokens (
  id uuid primary key default gen_random_uuid(),
  access_token text,
  refresh_token text,
  expiry_date bigint,
  updated_at timestamptz default now()
);

-- Auto-update updated_at on leads
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at
  before update on leads
  for each row execute function update_updated_at();

-- Disable RLS (internal tool — service role only)
alter table leads disable row level security;
alter table lead_notes disable row level security;
alter table meetings disable row level security;
alter table calendar_tokens disable row level security;

-- Indexes
create index if not exists leads_status_idx on leads(status);
create index if not exists leads_created_at_idx on leads(created_at desc);
create index if not exists lead_notes_lead_id_idx on lead_notes(lead_id);
create index if not exists meetings_lead_id_idx on meetings(lead_id);
