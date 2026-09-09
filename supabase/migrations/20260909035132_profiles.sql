-- ZOQ's Gallery — Phase 8 customer profiles
-- Requires 20260909031325_initial_schema.sql to have already run (reuses its
-- set_updated_at() trigger function — see STEP 9, no duplicate trigger logic).

-- ============================================================================
-- profiles
-- ============================================================================
-- One row per auth.users row, created automatically by the trigger below.
-- `email` is a point-in-time copy of auth.users.email taken at signup for
-- convenient server-side querying without touching the protected auth schema.
-- It is NOT kept in sync with later email changes (no such flow exists in
-- this phase), so the UI intentionally displays the live session's
-- user.email rather than profiles.email — see src/context/AuthContext.tsx
-- and the Phase 8 report for the full rationale.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  first_name text,
  last_name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
before update on profiles
for each row execute function set_updated_at();

-- ============================================================================
-- Row Level Security — each user can only read/update their own profile
-- ============================================================================
alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Deliberately no INSERT or DELETE policy for the authenticated/anon roles:
-- profile creation is handled exclusively by the trigger below (which runs
-- as the table owner via SECURITY DEFINER, bypassing RLS), and there is no
-- account-deletion flow in this phase. This is what STEP 10 asks for —
-- users can never read another profile, update another profile, or insert
-- an arbitrary profile row themselves.

-- ============================================================================
-- Auto-create a profile row when a new auth user is created
-- ============================================================================
create or replace function handle_new_user()
returns trigger
security definer
set search_path = public
as $$
declare
  v_full_name text := new.raw_user_meta_data ->> 'full_name';
  v_space_pos int := position(' ' in coalesce(new.raw_user_meta_data ->> 'full_name', ''));
begin
  insert into public.profiles (id, full_name, email, first_name, last_name)
  values (
    new.id,
    v_full_name,
    new.email,
    case when v_space_pos > 0 then split_part(v_full_name, ' ', 1) else v_full_name end,
    case when v_space_pos > 0 then substring(v_full_name from v_space_pos + 1) else null end
  );
  return new;
end;
$$ language plpgsql;

create trigger trg_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();
