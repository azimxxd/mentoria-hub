-- Run this in the Supabase SQL editor IF you already ran schema.sql before the
-- Telegram bot's subscriber table was added. (It's also part of schema.sql now,
-- so a fresh setup doesn't need this file.)

create table if not exists telegram_subscribers (
  chat_id bigint primary key,
  created_at timestamptz not null default now()
);

-- RLS on with no policies → only the service role (the bot) can read/write it.
alter table telegram_subscribers enable row level security;
