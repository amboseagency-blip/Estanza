-- Estanza database schema
-- Safe to run multiple times (uses IF NOT EXISTS / OR REPLACE)

-- Broker profiles table
create table if not exists broker_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  whatsapp_number text,
  currency text default 'INR',
  plan text default 'free',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Properties table
create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  broker_id uuid not null references broker_profiles(id) on delete cascade,
  title text not null,
  price numeric not null default 0,
  currency text default 'INR',
  location text,
  description text,
  facilities text[] default '{}',
  images text[] default '{}',
  video_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Structured near-facility tags: [{ name, meters, color }]
alter table properties add column if not exists facility_tags jsonb default '[]'::jsonb;

-- Enable Row Level Security
alter table broker_profiles enable row level security;
alter table properties enable row level security;

-- Clear old policies if they exist, then recreate cleanly
drop policy if exists "brokers can view own profile" on broker_profiles;
drop policy if exists "brokers can insert own profile" on broker_profiles;
drop policy if exists "brokers can update own profile" on broker_profiles;
drop policy if exists "public can view broker profiles" on broker_profiles;

create policy "public can view broker profiles"
  on broker_profiles for select
  using (true);

create policy "brokers can insert own profile"
  on broker_profiles for insert
  with check (auth.uid() = user_id);

create policy "brokers can update own profile"
  on broker_profiles for update
  using (auth.uid() = user_id);

drop policy if exists "public can view properties" on properties;
drop policy if exists "brokers can insert own properties" on properties;
drop policy if exists "brokers can update own properties" on properties;
drop policy if exists "brokers can delete own properties" on properties;

create policy "public can view properties"
  on properties for select
  using (true);

create policy "brokers can insert own properties"
  on properties for insert
  with check (
    broker_id in (select id from broker_profiles where user_id = auth.uid())
  );

create policy "brokers can update own properties"
  on properties for update
  using (
    broker_id in (select id from broker_profiles where user_id = auth.uid())
  );

create policy "brokers can delete own properties"
  on properties for delete
  using (
    broker_id in (select id from broker_profiles where user_id = auth.uid())
  );

-- Storage buckets (safe to re-run)
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('property-videos', 'property-videos', true)
on conflict (id) do nothing;

drop policy if exists "public read property images" on storage.objects;
drop policy if exists "authenticated upload property images" on storage.objects;
drop policy if exists "public read property videos" on storage.objects;
drop policy if exists "authenticated upload property videos" on storage.objects;

create policy "public read property images"
  on storage.objects for select
  using (bucket_id = 'property-images');

create policy "authenticated upload property images"
  on storage.objects for insert
  with check (bucket_id = 'property-images' and auth.role() = 'authenticated');

create policy "public read property videos"
  on storage.objects for select
  using (bucket_id = 'property-videos');

create policy "authenticated upload property videos"
  on storage.objects for insert
  with check (bucket_id = 'property-videos' and auth.role() = 'authenticated');
