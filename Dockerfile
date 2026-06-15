# Image for the Telegram reminder bot (a long-running worker, not the web app).
# Node 22+ is required: @supabase/supabase-js needs a global WebSocket (absent in Node 20).
FROM node:24-slim

WORKDIR /app

# Install production deps only (includes @supabase/supabase-js, which the bot needs).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Only the files the bot actually uses.
COPY scripts ./scripts
COPY lib/live-sessions.json ./lib/live-sessions.json

CMD ["node", "scripts/telegram-bot.mjs"]
