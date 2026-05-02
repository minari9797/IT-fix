-- ============================================
-- IT-Fix: Complete Database Schema + RLS
-- Run this in your Supabase SQL Editor
-- ============================================

-- ─────────────────────────────────────────────
-- 1. PROFILES TABLE (auto-created on signup)
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  created_at timestamptz default now() not null,
  full_name text,
  email text,
  avatar_url text
);

-- Auto-create profile on new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────
-- 2. TECHNICIANS TABLE
-- ─────────────────────────────────────────────
create table if not exists public.technicians (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  name text not null,
  email text unique not null,
  specialty text not null,
  avatar_url text,
  available boolean default true not null
);

-- ─────────────────────────────────────────────
-- 3. TICKETS TABLE
-- ─────────────────────────────────────────────
create type ticket_status as enum ('pending', 'in_progress', 'resolved');
create type ticket_priority as enum ('low', 'medium', 'high');

create table if not exists public.tickets (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  title text not null,
  description text not null,
  status ticket_status default 'pending' not null,
  priority ticket_priority default 'medium' not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  technician_id uuid references public.technicians(id) on delete set null,
  image_url text,
  internal_notes text,
  resolution_summary text
);

-- Indexes for performance
create index if not exists tickets_user_id_idx on public.tickets(user_id);
create index if not exists tickets_status_idx on public.tickets(status);
create index if not exists tickets_created_at_idx on public.tickets(created_at desc);

-- ─────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.technicians enable row level security;
alter table public.tickets enable row level security;

-- PROFILES policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- TECHNICIANS policies
create policy "Anyone can view technicians"
  on public.technicians for select
  to anon, authenticated
  using (true);

create policy "Admins can manage technicians"
  on public.technicians for all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create policy "Technicians can update own availability"
  on public.technicians for update
  to authenticated
  using (email = auth.jwt() ->> 'email')
  with check (email = auth.jwt() ->> 'email');

-- TICKETS policies
create policy "Users can view own tickets or admins can view all"
  on public.tickets for select
  using (
    auth.uid() = user_id or 
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true) or
    exists (select 1 from public.technicians where email = auth.jwt() ->> 'email')
  );

create policy "Users can create own tickets"
  on public.tickets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tickets or admins can update all"
  on public.tickets for update
  using (
    auth.uid() = user_id or 
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "Technicians can update assigned tickets"
  on public.tickets for update
  using (
    exists (
      select 1 from public.technicians 
      where email = auth.jwt() ->> 'email' 
      and id = technician_id
    )
  );

create policy "Admins can delete tickets"
  on public.tickets for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- ─────────────────────────────────────────────
-- 5. STORAGE BUCKET: screenshots
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('screenshots', 'screenshots', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Authenticated users can upload screenshots"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'screenshots');

create policy "Anyone can view screenshots"
  on storage.objects for select
  using (bucket_id = 'screenshots');

create policy "Users can delete own screenshots"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'screenshots' and auth.uid()::text = (storage.foldername(name))[1]);

-- ─────────────────────────────────────────────
-- 6. SEED DATA: Sample Technicians
-- ─────────────────────────────────────────────
insert into public.technicians (name, email, specialty, available) values
  ('Alice Martin', 'alice@itfix.com', 'Network & Connectivity', true),
  ('Bob Johnson', 'bob@itfix.com', 'Hardware & Peripherals', true),
  ('Carol White', 'carol@itfix.com', 'Software & OS', false),
  ('David Brown', 'david@itfix.com', 'Cybersecurity', true),
  ('Emma Davis', 'emma@itfix.com', 'Cloud & Infrastructure', true)
on conflict (email) do nothing;
