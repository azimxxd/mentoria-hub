# Mentoria Hub 🎓

A working MVP of an EdTech platform where students (grades 8–11) **discover educational opportunities** (olympiads, scholarships, internships, summer schools, hackathons) and **learn through structured, self-paced Mentoria courses** — personalized, multilingual, and built to scale beyond Telegram and live calls.

> Hackathon submission for **Mentoria — Working MVP Challenge**.

## ✨ Features

- **Landing page** with clear value proposition and CTAs.
- **Opportunities catalog** — 12+ seeded opportunities with search + filters (direction, category, format, grade, deadline) and save/favorite.
- **Mentoria courses** — 4 courses, each with lessons, a video placeholder, an interactive **mini-quiz**, a **progress bar**, and an auto-issued **certificate** on completion.
- **Personalized onboarding** → a real **content-based recommendation engine** (cosine similarity over a weighted profile tag-vector) powering recommended opportunities & courses.
- **Student dashboard** — saved opportunities, enrolled courses with progress, upcoming deadlines, recommendations, and certificates.
- **Admin panel** — full CRUD for opportunities and courses/lessons (incl. **cover photo upload**) + live stats and user list. New content appears instantly, **no rebuild** (the scalability story).
- **AI Assistant** (Hugging Face) — a floating chat that recommends opportunities/courses from the student profile, with a deterministic fallback when no token is set.
- **Course calendar** — monthly view of the recurring **live online lessons** for every course, with "join" links.
- **PDF certificates** — completed-course certificates download as a printable PDF (jsPDF).
- **Telegram reminder bot** — notifies subscribers ~30 min before each live lesson (`npm run bot`).
- **Roadmap builder** — plan steps across grades 9–12.
- **Trilingual UI** (English / Русский / Қазақша), **dark / light theme**, fully **responsive**.

## 🛠 Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + hand-rolled UI primitives
- **Zustand** — a dual-mode store: localStorage (zero-setup demo) **or** Supabase (real backend)
- **Supabase** (Postgres + Auth + RLS) for the real multi-user backend
- **Hugging Face Inference** (free, OpenAI-compatible) for the AI assistant
- **jsPDF** for certificate generation
- Deploy target: **Vercel**

### Data layer (dual-mode)
The store auto-detects its backend:
- **No Supabase env vars →** runs on a **localStorage** store seeded with realistic data, so the demo works **with zero setup**.
- **Supabase env vars set →** the same UI is backed by **Supabase**: real email/password auth, per-user data, and RLS. The full schema lives in [`supabase/schema.sql`](./supabase/schema.sql) + [`supabase/seed.sql`](./supabase/seed.sql).

See **[Enable the Supabase backend](#-enable-the-supabase-backend)** below.

## 🚀 Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

Optional — enable the live AI assistant (free Hugging Face):

```bash
cp .env.example .env.local
# set HF_TOKEN=hf_...   (from https://huggingface.co/settings/tokens)
```

## 🗄 Enable the Supabase backend

Turns the app from a local demo into a real multi-user backend.

1. Create a project at [supabase.com](https://supabase.com).
2. In the **SQL editor**, run [`supabase/schema.sql`](./supabase/schema.sql), then [`supabase/seed.sql`](./supabase/seed.sql).
3. **Auth → Providers → Email:** turn **off** "Confirm email" so sign-up logs in instantly.
4. **Settings → API:** copy the URL, anon key and service role key into `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
5. Create the demo users: `npm run seed:supabase`
6. Restart `npm run dev`. The app now reads/writes Supabase; sign-ups create real accounts.

> Cover photos chosen in the admin panel are stored inline (URL or data URL) in the `image` column. For production, upload to Supabase Storage and store the public URL instead.

## 🔑 Demo accounts

| Role    | Email              | Password   |
| ------- | ------------------ | ---------- |
| Student | `student@demo.com` | `demo1234` |
| Admin   | `admin@demo.com`   | `admin1234`|

Or sign up fresh to experience the onboarding → recommendations flow.

## 🧭 Demo journey (matches the brief)

1. Sign up → onboarding (grade, interests, subjects, goals) → recommendations appear.
2. Browse opportunities, filter/search, **save** a hackathon and a summer program.
3. Open *English for Academic Success*, complete a lesson + quiz → progress advances; finishing the course issues a **certificate**.
4. Dashboard shows progress + upcoming deadlines.
5. Log in as **admin** → add a new olympiad/course → it appears instantly in the public catalog.
6. Toggle **dark mode** and **EN/RU/KK**; ask the **AI assistant** for guidance.

## ☁️ Deploy (Vercel)

```bash
npm i -g vercel
vercel        # follow prompts (root dir = this folder)
vercel --prod
```
No environment variables are required for the local demo. Add `HF_TOKEN` (assistant) and the `NEXT_PUBLIC_SUPABASE_*` keys (real backend) in Vercel project settings to enable them.

## 🤖 What's AI vs. hand-built

- **Built by us:** the recommendation algorithm ([`lib/recommend.ts`](./lib/recommend.ts)), data model, all pages/components, i18n, the Supabase schema + data layer, the calendar, PDF certificates, the Telegram bot, and the assistant's fallback logic.
- **AI-assisted:** the optional live assistant uses a free Hugging Face model (default `meta-llama/Llama-3.1-8B-Instruct`) constrained to recommend only from the in-app catalog.

## 🔭 What's next

Move cover photos to Supabase Storage, add email deadline reminders, mentor upload portal, leaderboards, and real video hosting.
