-- Run this in the Supabase SQL editor to enable personalized Telegram reminders
-- (linking a Mentoria account to a Telegram chat). Already part of schema.sql for
-- fresh setups.

create table if not exists telegram_links (
  user_id uuid primary key references auth.users(id) on delete cascade,
  chat_id bigint unique,
  link_token text unique,
  linked boolean not null default false,
  created_at timestamptz not null default now()
);

alter table telegram_links enable row level security;

-- Website (anon) manages its own row; the bot (service role) bypasses RLS.
drop policy if exists "own telegram link" on telegram_links;
create policy "own telegram link" on telegram_links for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
