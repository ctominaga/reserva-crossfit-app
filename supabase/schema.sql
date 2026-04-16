-- =====================================================================
--  Reserva CrossFit — Supabase schema
--  Execute no SQL Editor do painel Supabase.
-- =====================================================================

create extension if not exists "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  role text not null default 'athlete' check (role in ('athlete', 'coach', 'admin')),
  avatar_color text not null default '#22C55E',
  member_since date not null default current_date,
  instagram text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── PLANS ───────────────────────────────────────────────────────────
create table if not exists public.plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price_monthly numeric not null,
  features text[] not null default '{}',
  is_highlighted boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─── ATHLETE_PLANS ───────────────────────────────────────────────────
create table if not exists public.athlete_plans (
  id uuid primary key default uuid_generate_v4(),
  athlete_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  status text not null default 'active' check (status in ('active', 'inactive', 'overdue')),
  started_at date not null,
  expires_at date not null,
  created_at timestamptz not null default now()
);

-- ─── COACHES ─────────────────────────────────────────────────────────
create table if not exists public.coaches (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  specialties text[] not null default '{}',
  bio text not null default '',
  certifications text[] not null default '{}',
  active_since text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── CLASS_SESSIONS ──────────────────────────────────────────────────
create table if not exists public.class_sessions (
  id uuid primary key default uuid_generate_v4(),
  date date not null,
  time text not null,
  class_type text not null check (class_type in ('WOD', 'Weightlifting', 'Endurance', 'Open Box')),
  coach_id uuid references public.coaches(id),
  capacity integer not null default 20,
  is_cancelled boolean not null default false,
  created_at timestamptz not null default now(),
  unique(date, time)
);

-- ─── BOOKINGS ────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.class_sessions(id) on delete cascade,
  athlete_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'attended')),
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  unique(session_id, athlete_id)
);

-- ─── WODS ────────────────────────────────────────────────────────────
create table if not exists public.wods (
  id uuid primary key default uuid_generate_v4(),
  date date not null unique,
  type text not null check (type in ('AMRAP', 'For Time', 'EMOM', 'Chipper', 'Strength')),
  title text not null,
  duration_minutes integer,
  warmup text[] not null default '{}',
  movements jsonb not null default '[]'::jsonb,
  scaling_rx text not null default '',
  scaling_scaled text not null default '',
  scaling_beginner text not null default '',
  cooldown text[] not null default '{}',
  published_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── ATHLETE_RESULTS ─────────────────────────────────────────────────
create table if not exists public.athlete_results (
  id uuid primary key default uuid_generate_v4(),
  athlete_id uuid not null references public.profiles(id) on delete cascade,
  wod_id uuid not null references public.wods(id) on delete cascade,
  session_id uuid not null references public.class_sessions(id),
  level text not null check (level in ('rx', 'scaled', 'beginner')),
  result_value text not null,
  movement_results jsonb not null default '[]'::jsonb,
  notes text,
  recorded_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(athlete_id, session_id)
);

-- ─── PERSONAL_RECORDS ────────────────────────────────────────────────
create table if not exists public.personal_records (
  id uuid primary key default uuid_generate_v4(),
  athlete_id uuid not null references public.profiles(id) on delete cascade,
  movement text not null,
  value text not null,
  unit text not null,
  category text not null,
  icon text not null default '🏋️',
  achieved_at date not null,
  created_at timestamptz not null default now()
);

-- ─── POSTS ───────────────────────────────────────────────────────────
create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  image_url text,
  type text not null default 'text' check (type in ('text', 'image', 'achievement', 'announcement')),
  tags text[] not null default '{}',
  likes_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── POST_LIKES ──────────────────────────────────────────────────────
create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(post_id, user_id)
);

-- ─── POST_COMMENTS ───────────────────────────────────────────────────
create table if not exists public.post_comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- ─── SCHEDULE_OVERRIDES ──────────────────────────────────────────────
create table if not exists public.schedule_overrides (
  id uuid primary key default uuid_generate_v4(),
  key text not null unique,
  slots jsonb not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- =====================================================================
--  TRIGGERS
-- =====================================================================

-- Auto-criar profile quando um user registra
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'athlete')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-atualizar updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

drop trigger if exists set_updated_at on public.wods;
create trigger set_updated_at before update on public.wods
  for each row execute procedure public.handle_updated_at();

drop trigger if exists set_updated_at on public.posts;
create trigger set_updated_at before update on public.posts
  for each row execute procedure public.handle_updated_at();

drop trigger if exists set_updated_at on public.athlete_results;
create trigger set_updated_at before update on public.athlete_results
  for each row execute procedure public.handle_updated_at();

drop trigger if exists set_updated_at on public.coaches;
create trigger set_updated_at before update on public.coaches
  for each row execute procedure public.handle_updated_at();

-- Contador de likes dos posts (mantém em sincronia)
create or replace function public.handle_post_like_change()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update public.posts set likes_count = likes_count + 1 where id = new.post_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.posts set likes_count = greatest(likes_count - 1, 0) where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql;

drop trigger if exists post_likes_counter on public.post_likes;
create trigger post_likes_counter
  after insert or delete on public.post_likes
  for each row execute procedure public.handle_post_like_change();

-- =====================================================================
--  ROW LEVEL SECURITY
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.athlete_plans enable row level security;
alter table public.coaches enable row level security;
alter table public.class_sessions enable row level security;
alter table public.bookings enable row level security;
alter table public.wods enable row level security;
alter table public.athlete_results enable row level security;
alter table public.personal_records enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;
alter table public.schedule_overrides enable row level security;

-- Função helper: é admin?
create or replace function public.is_admin()
returns boolean as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$ language sql stable security definer;

-- Função helper: é admin ou coach?
create or replace function public.is_staff()
returns boolean as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'coach'));
$$ language sql stable security definer;

-- PROFILES
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select
  using (auth.uid() = id or public.is_admin() or public.is_staff());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update
  using (auth.uid() = id or public.is_admin());

-- PLANS
drop policy if exists "plans_select" on public.plans;
create policy "plans_select" on public.plans for select using (true);

drop policy if exists "plans_admin_write" on public.plans;
create policy "plans_admin_write" on public.plans for all
  using (public.is_admin()) with check (public.is_admin());

-- ATHLETE_PLANS
drop policy if exists "athlete_plans_select" on public.athlete_plans;
create policy "athlete_plans_select" on public.athlete_plans for select
  using (athlete_id = auth.uid() or public.is_staff());

drop policy if exists "athlete_plans_admin" on public.athlete_plans;
create policy "athlete_plans_admin" on public.athlete_plans for all
  using (public.is_admin()) with check (public.is_admin());

-- COACHES
drop policy if exists "coaches_select" on public.coaches;
create policy "coaches_select" on public.coaches for select using (true);

drop policy if exists "coaches_admin_write" on public.coaches;
create policy "coaches_admin_write" on public.coaches for all
  using (public.is_admin()) with check (public.is_admin());

-- CLASS_SESSIONS
drop policy if exists "sessions_select" on public.class_sessions;
create policy "sessions_select" on public.class_sessions for select using (true);

drop policy if exists "sessions_staff_write" on public.class_sessions;
create policy "sessions_staff_write" on public.class_sessions for all
  using (public.is_staff()) with check (public.is_staff());

-- BOOKINGS
drop policy if exists "bookings_select" on public.bookings;
create policy "bookings_select" on public.bookings for select
  using (athlete_id = auth.uid() or public.is_staff());

drop policy if exists "bookings_own_insert" on public.bookings;
create policy "bookings_own_insert" on public.bookings for insert
  with check (athlete_id = auth.uid() or public.is_staff());

drop policy if exists "bookings_own_update" on public.bookings;
create policy "bookings_own_update" on public.bookings for update
  using (athlete_id = auth.uid() or public.is_staff());

drop policy if exists "bookings_own_delete" on public.bookings;
create policy "bookings_own_delete" on public.bookings for delete
  using (athlete_id = auth.uid() or public.is_staff());

-- WODS
drop policy if exists "wods_select" on public.wods;
create policy "wods_select" on public.wods for select using (true);

drop policy if exists "wods_staff_write" on public.wods;
create policy "wods_staff_write" on public.wods for all
  using (public.is_staff()) with check (public.is_staff());

-- ATHLETE_RESULTS
drop policy if exists "results_select" on public.athlete_results;
create policy "results_select" on public.athlete_results for select
  using (athlete_id = auth.uid() or public.is_staff());

drop policy if exists "results_staff_write" on public.athlete_results;
create policy "results_staff_write" on public.athlete_results for all
  using (public.is_staff()) with check (public.is_staff());

-- PERSONAL_RECORDS
drop policy if exists "prs_select" on public.personal_records;
create policy "prs_select" on public.personal_records for select
  using (athlete_id = auth.uid() or public.is_staff());

drop policy if exists "prs_insert_own" on public.personal_records;
create policy "prs_insert_own" on public.personal_records for insert
  with check (athlete_id = auth.uid() or public.is_staff());

drop policy if exists "prs_update_own" on public.personal_records;
create policy "prs_update_own" on public.personal_records for update
  using (athlete_id = auth.uid() or public.is_staff());

drop policy if exists "prs_delete_own" on public.personal_records;
create policy "prs_delete_own" on public.personal_records for delete
  using (athlete_id = auth.uid() or public.is_staff());

-- POSTS
drop policy if exists "posts_select" on public.posts;
create policy "posts_select" on public.posts for select using (true);

drop policy if exists "posts_insert_own" on public.posts;
create policy "posts_insert_own" on public.posts for insert
  with check (author_id = auth.uid());

drop policy if exists "posts_update_own" on public.posts;
create policy "posts_update_own" on public.posts for update
  using (author_id = auth.uid() or public.is_admin());

drop policy if exists "posts_delete_own" on public.posts;
create policy "posts_delete_own" on public.posts for delete
  using (author_id = auth.uid() or public.is_admin());

-- POST_LIKES
drop policy if exists "post_likes_select" on public.post_likes;
create policy "post_likes_select" on public.post_likes for select using (true);

drop policy if exists "post_likes_insert_own" on public.post_likes;
create policy "post_likes_insert_own" on public.post_likes for insert
  with check (user_id = auth.uid());

drop policy if exists "post_likes_delete_own" on public.post_likes;
create policy "post_likes_delete_own" on public.post_likes for delete
  using (user_id = auth.uid());

-- POST_COMMENTS
drop policy if exists "post_comments_select" on public.post_comments;
create policy "post_comments_select" on public.post_comments for select using (true);

drop policy if exists "post_comments_insert_own" on public.post_comments;
create policy "post_comments_insert_own" on public.post_comments for insert
  with check (author_id = auth.uid());

drop policy if exists "post_comments_update_own" on public.post_comments;
create policy "post_comments_update_own" on public.post_comments for update
  using (author_id = auth.uid() or public.is_admin());

drop policy if exists "post_comments_delete_own" on public.post_comments;
create policy "post_comments_delete_own" on public.post_comments for delete
  using (author_id = auth.uid() or public.is_admin());

-- SCHEDULE_OVERRIDES
drop policy if exists "schedule_overrides_select" on public.schedule_overrides;
create policy "schedule_overrides_select" on public.schedule_overrides for select using (true);

drop policy if exists "schedule_overrides_staff_write" on public.schedule_overrides;
create policy "schedule_overrides_staff_write" on public.schedule_overrides for all
  using (public.is_staff()) with check (public.is_staff());
