-- =============================================================
-- AI Virtual Wardrobe - Supabase schema
-- Run this in the Supabase SQL editor.
-- Then enable Auth providers (Email/Password + Google) in the
-- Authentication dashboard and add the Site URL + redirect URLs.
-- =============================================================

-- -------------------------------------------------------------
-- Profiles (1:1 with auth.users), starts with 10 free credits.
-- -------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  credits integer not null default 10 check (credits >= 0),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, credits)
  values (new.id, new.email, 10)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -------------------------------------------------------------
-- Generations (past try-ons shown in "My Closet")
-- -------------------------------------------------------------
create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  person_image_url text not null,
  outfit_image_url text not null,
  output_image_url text not null,
  category text not null check (category in ('top', 'bottom', 'full')),
  prompt text,
  created_at timestamptz not null default now()
);

create index if not exists generations_user_created_idx
  on public.generations (user_id, created_at desc);

-- -------------------------------------------------------------
-- Feedback (optional "Report Glitch" submissions)
-- -------------------------------------------------------------
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  message text not null,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------
-- Credit RPCs (atomic, executed server-side)
-- -------------------------------------------------------------
create or replace function public.use_credit()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated boolean;
begin
  update public.profiles
     set credits = credits - 1
   where id = auth.uid()
     and credits > 0
   returning true into updated;

  return coalesce(updated, false);
end;
$$;

create or replace function public.refund_credit()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
     set credits = credits + 1
   where id = auth.uid();
end;
$$;

-- -------------------------------------------------------------
-- Row Level Security
-- -------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.generations enable row level security;
alter table public.feedback enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- No direct update policy for credits; only the RPCs can change them.

drop policy if exists "Users read own generations" on public.generations;
create policy "Users read own generations"
  on public.generations for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users insert own generations" on public.generations;
create policy "Users insert own generations"
  on public.generations for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users insert feedback" on public.feedback;
create policy "Users insert feedback"
  on public.feedback for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users read own feedback" on public.feedback;
create policy "Users read own feedback"
  on public.feedback for select
  to authenticated
  using (auth.uid() = user_id);

-- -------------------------------------------------------------
-- Storage: vton-images bucket (public)
-- -------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('vton-images', 'vton-images', true)
on conflict (id) do nothing;

drop policy if exists "Authenticated users upload to vton-images" on storage.objects;
create policy "Authenticated users upload to vton-images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'vton-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Authenticated users update own vton-images" on storage.objects;
create policy "Authenticated users update own vton-images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'vton-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Authenticated users delete own vton-images" on storage.objects;
create policy "Authenticated users delete own vton-images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'vton-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public read for everyone (bucket is public).
drop policy if exists "Public read vton-images" on storage.objects;
create policy "Public read vton-images"
  on storage.objects for select
  to public
  using (bucket_id = 'vton-images');
