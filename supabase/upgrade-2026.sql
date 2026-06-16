-- Mentoria Hub — 2026 upgrade migration.
-- Run this in the Supabase SQL editor AFTER schema.sql. It is idempotent
-- (safe to re-run). Adds:
--   1. The "mentor" role + course ownership (author_id) + mentor RLS.
--   2. A student leaderboard function.
--   3. A telegram_logins table for "Log in with Telegram".
--   4. A public storage bucket for uploaded lesson videos.

-- ============================================================
-- 1. Roles: student | mentor | admin
-- ============================================================
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles
  add constraint profiles_role_check check (role in ('student', 'mentor', 'admin'));

-- Course ownership: the mentor/admin who created the course.
alter table courses add column if not exists author_id uuid references auth.users(id) on delete set null;

-- Helper: is the current user a mentor? (security definer → bypasses RLS, no recursion)
create or replace function is_mentor() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'mentor');
$$;

-- Mentors manage ONLY their own courses + the lessons under them.
drop policy if exists "mentor write own courses" on courses;
create policy "mentor write own courses" on courses for all
  using (is_mentor() and author_id = auth.uid())
  with check (is_mentor() and author_id = auth.uid());

drop policy if exists "mentor write own lessons" on lessons;
create policy "mentor write own lessons" on lessons for all
  using (exists (select 1 from courses c where c.id = lessons.course_id and c.author_id = auth.uid() and is_mentor()))
  with check (exists (select 1 from courses c where c.id = lessons.course_id and c.author_id = auth.uid() and is_mentor()));

-- New sign-ups may choose student or mentor (admin is assigned manually only).
create or replace function handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    case when new.raw_user_meta_data->>'role' = 'mentor' then 'mentor' else 'student' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ============================================================
-- 2. Student leaderboard
-- points = completed lessons × 10  +  certificates × 100
-- security definer so it can aggregate across all students while
-- exposing only name / grade / points (never private rows).
-- ============================================================
create or replace function get_leaderboard()
  returns table (
    user_id uuid,
    name text,
    grade int,
    completed_lessons bigint,
    certificates bigint,
    points bigint
  )
  language sql stable security definer set search_path = public as $$
  select
    p.id,
    coalesce(nullif(p.full_name, ''), 'Student') as name,
    p.grade,
    coalesce(lp.cnt, 0) as completed_lessons,
    coalesce(ct.cnt, 0) as certificates,
    coalesce(lp.cnt, 0) * 10 + coalesce(ct.cnt, 0) * 100 as points
  from profiles p
  left join (select user_id, count(*) cnt from lesson_progress where completed group by user_id) lp on lp.user_id = p.id
  left join (select user_id, count(*) cnt from certificates group by user_id) ct on ct.user_id = p.id
  where p.role = 'student'
  order by points desc, completed_lessons desc, name asc
  limit 100;
$$;
grant execute on function get_leaderboard() to anon, authenticated;

-- ============================================================
-- 3. Telegram login
-- The website (service role, via /api/auth/telegram) creates a pending
-- token; the bot (service role) fills in the Telegram identity when the
-- user opens the deep link. RLS on with NO policies → service role only.
-- ============================================================
create table if not exists telegram_logins (
  token text primary key,
  status text not null default 'pending',  -- pending | ready | consumed
  tg_user_id bigint,
  tg_username text,
  tg_name text,
  tg_photo_url text,
  chat_id bigint,
  created_at timestamptz not null default now()
);
alter table telegram_logins enable row level security;

-- ============================================================
-- 4. Lesson video storage (public bucket)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('lesson-videos', 'lesson-videos', true)
on conflict (id) do nothing;

drop policy if exists "public read lesson videos" on storage.objects;
create policy "public read lesson videos" on storage.objects for select
  using (bucket_id = 'lesson-videos');

drop policy if exists "staff upload lesson videos" on storage.objects;
create policy "staff upload lesson videos" on storage.objects for insert to authenticated
  with check (bucket_id = 'lesson-videos' and (is_admin() or is_mentor()));

drop policy if exists "staff update lesson videos" on storage.objects;
create policy "staff update lesson videos" on storage.objects for update to authenticated
  using (bucket_id = 'lesson-videos' and (is_admin() or is_mentor()));

drop policy if exists "staff delete lesson videos" on storage.objects;
create policy "staff delete lesson videos" on storage.objects for delete to authenticated
  using (bucket_id = 'lesson-videos' and (is_admin() or is_mentor()));
