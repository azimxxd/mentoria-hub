# Image for the Telegram reminder bot (a long-running worker, not the web app).
FROM node:20-slim

WORKDIR /app

# Install production deps only (includes @supabase/supabase-js, which the bot needs).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Only the files the bot actually uses.
COPY scripts ./scripts
COPY lib/live-sessions.json ./lib/live-sessions.json

CMD ["node", "scripts/telegram-bot.mjs"]
