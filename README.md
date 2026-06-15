# Mentoria Hub 🎓

A working MVP of an EdTech platform where students (grades 8–11) **discover educational opportunities** (olympiads, scholarships, internships, summer schools, hackathons) and **learn through structured, self-paced Mentoria courses** — personalized, multilingual, and built to scale beyond Telegram and live calls.

> Hackathon submission for **Mentoria — Working MVP Challenge**.

## ✨ Features

- **Landing page** with clear value proposition and CTAs.
- **Opportunities catalog** — 12+ seeded opportunities with search + filters (direction, category, format, grade, deadline) and save/favorite.
- **Mentoria courses** — 4 courses, each with lessons, a video placeholder, an interactive **mini-quiz**, a **progress bar**, and an auto-issued **certificate** on completion.
- **Personalized onboarding** → a real **content-based recommendation engine** (cosine similarity over a weighted profile tag-vector) powering recommended opportunities & courses.
- **Student dashboard** — saved opportunities, enrolled courses with progress, upcoming deadlines, recommendations, and certificates.
- **Admin panel** — full CRUD for opportunities and courses/lessons + live stats and user list. New content appears instantly, **no rebuild** (the scalability story).
- **AI Assistant** (Claude) — a floating chat that recommends opportunities/courses from the student profile, with a deterministic fallback when no API key is set.
- **Roadmap builder** — plan steps across grades 9–12.
- **Trilingual UI** (English / Русский / Қазақша), **dark / light theme**, fully **responsive**.

## 🛠 Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + hand-rolled UI primitives
- **Zustand** (localStorage-persisted state — the brief explicitly allows local storage)
- **@anthropic-ai/sdk** for the AI assistant
- Deploy target: **Vercel**

### Data layer
The deployed demo runs on a **localStorage-backed store** seeded with realistic data, so the live link works **with zero setup** and nothing can break during judging. A production **Supabase/Postgres schema with RLS** is included in [`supabase/`](./supabase) as the real, multi-user backend path.

## 🚀 Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

Optional — enable the live Claude assistant:

```bash
cp .env.example .env.local
# set ANTHROPIC_API_KEY=sk-ant-...
```

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
No environment variables are required for the demo. Add `ANTHROPIC_API_KEY` in Vercel project settings to enable the live AI assistant.

## 🤖 What's AI vs. hand-built

- **Built by us:** the recommendation algorithm ([`lib/recommend.ts`](./lib/recommend.ts)), data model, all pages/components, i18n, the Supabase schema, and the assistant's fallback logic.
- **AI-assisted:** the optional live assistant uses Claude (`claude-haiku-4-5`) constrained to recommend only from the in-app catalog.

## 🔭 What's next

Wire the included Supabase schema for multi-user persistence, add email/Telegram deadline reminders, mentor upload portal, leaderboards, and real video hosting.
