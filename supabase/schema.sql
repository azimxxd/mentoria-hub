-- Mentoria Hub — production schema (Postgres / Supabase)
-- The deployed MVP runs on a localStorage data layer so the demo works with
-- zero setup. This schema is the production-ready backend: run it in the
-- Supabase SQL editor, set the env vars, and the same app data model is
-- ready to be wired to Supabase (auth + RLS + multi-user persistence).

-- ----- Profiles (1:1 with auth.users) -----
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  grade int check (grade between 8 and 12),
  interests text[] not null default '{}',
  subjects text[] not null default '{}',
  goals text[] not null default '{}',
  language text not null default 'en',
  role text not null default 'student' check (role in ('student','admin')),
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

-- ----- Opportunities -----
create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organizer text not null default 'Mentoria',
  category text not null,
  direction text not null,
  format text not null,
  deadline date not null,
  description text not null default '',
  requirements text not null default '',
  apply_url text not null default '',
  grade_min int not null default 8,
  grade_max int not null default 12,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- ----- Courses & lessons -----
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  level text not null default 'Beginner',
  subject text not null default 'General',
  direction text not null default 'STEM',
  emoji text not null default '📚',
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  position int not null default 0,
  title text not null,
  content text not null default '',
  video_url text default '',
  duration_min int not null default 10,
  quiz jsonb not null default '[]'
);

-- ----- Student data -----
create table if not exists saved_opportunities (
  user_id uuid not null references auth.users(id) on delete cascade,
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, opportunity_id)
);

create table if not exists enrollments (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create table if not exists lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  completed boolean not null default false,
  quiz_score int,
  completed_at timestamptz,
  primary key (user_id, lesson_id)
);

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  code text not null,
  issued_at timestamptz not null default now()
);

-- ----- Row Level Security -----
alter table profiles enable row level security;
alter table opportunities enable row level security;
alter table courses enable row level security;
alter table lessons enable row level security;
alter table saved_opportunities enable row level security;
alter table enrollments enable row level security;
alter table lesson_progress enable row level security;
alter table certificates enable row level security;

-- Public catalog: anyone authenticated can read opportunities/courses/lessons.
create policy "read opportunities" on opportunities for select using (true);
create policy "read courses" on courses for select using (true);
create policy "read lessons" on lessons for select using (true);

-- Admins (profiles.role = 'admin') can write catalog content.
create or replace function is_admin() returns boolean language sql stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create policy "admin write opportunities" on opportunities for all using (is_admin()) with check (is_admin());
create policy "admin write courses" on courses for all using (is_admin()) with check (is_admin());
create policy "admin write lessons" on lessons for all using (is_admin()) with check (is_admin());

-- Users manage their own profile and learning data.
create policy "own profile read" on profiles for select using (auth.uid() = id);
create policy "own profile write" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own saves" on saved_opportunities for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own enrollments" on enrollments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own progress" on lesson_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own certificates" on certificates for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
