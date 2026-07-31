# MEI Work OS

**Personal Work Record** — a cloud-based system for logging daily work, tracking
projects, searching past records, and generating boss-ready reports in Thai.
Replaces a manual Excel work log (วันที่ / โครงการ / รายละเอียด / เวลา) with a
searchable, structured, reportable system.

> **Status:** Phase 1 (Foundation) complete. Auth, layout shell, and database
> schema are in place; Work Log / Project / Report CRUD lands in later phases.

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router) + React 19 + TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4
- [Supabase](https://supabase.com) — Postgres database, Auth, Row Level Security
- Deployable to [Vercel](https://vercel.com)

## Project structure

```
app/
  (app)/            protected routes: dashboard, work-logs, projects, reports, people, settings
  login/             login page + server action
proxy.ts             Next.js 16 "proxy" (formerly middleware) — session refresh + route guard
components/
  ui/                generic UI building blocks
  layout/             sidebar, topbar, login form
features/            (reserved) feature-specific logic per domain, added in later phases
lib/
  supabase/           browser/server Supabase clients + config guard
  constants/           status/priority/category enums shared by UI and validation
types/                 TypeScript types matching the database schema
database/
  schema.sql           full Postgres schema + RLS policies
  seed.sql              sample seed data
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the project dashboard, open **Project Settings > API**.
3. Copy the **Project URL** and the **anon / public** key.

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values from step 2:

```bash
cp .env.example .env.local
```

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Without these variables, the app still builds and runs — pages show a
"Supabase environment variables are not configured" message instead of
crashing.

### 4. Run the database schema

1. In the Supabase Dashboard, open **SQL Editor > New query**.
2. Paste the contents of [`database/schema.sql`](database/schema.sql) and run it.
   This creates all tables (`projects`, `work_logs`, `people`, `work_log_people`,
   `attachments`), indexes, the duration-calculation trigger, and Row Level
   Security policies scoping every table to `auth.uid()`.

### 5. Create your user and (optionally) load sample data

1. Run `npm run dev` and sign up via the `/login` page (or invite yourself
   from **Authentication > Users** in the Supabase Dashboard).
2. Copy your new user's UUID from **Authentication > Users**.
3. Open [`database/seed.sql`](database/seed.sql), replace `YOUR_USER_ID_HERE`
   with that UUID, and run it in the SQL Editor to load sample projects and
   work logs.

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

1. Push this repository to GitHub.
2. Import it into [Vercel](https://vercel.com/new).
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as
   Environment Variables in the Vercel project settings.
4. Deploy. Vercel builds with `next build` automatically.

## Excel import (upcoming — Phase 5)

The Reports/Import flow will accept an Excel file with columns วันที่ /
โครงการ / รายละเอียด / เวลา, auto-create missing projects, auto-detect a
category from keywords, and show a preview before committing rows.

## Roadmap

- [x] Phase 1 — Foundation: Next.js + TypeScript + Tailwind + Supabase Auth,
      protected routes, database schema
- [ ] Phase 2 — Core CRUD: Projects, Work Logs, soft delete, duration calc,
      filtering
- [ ] Phase 3 — Dashboard: KPI cards, today/weekly stats, hours by project,
      waiting/blocked section
- [ ] Phase 4 — Reports: Daily/Weekly/Project/Boss Summary, Detailed Log,
      Blocker Report, copy/PDF/Excel export
- [ ] Phase 5 — Excel Import: upload, preview, auto-map, auto-category
- [ ] Phase 6 — UI Polish: dashboard visuals, quick templates, detail drawer,
      responsive + empty/loading states

Future upgrades under consideration: AI-generated summaries, GitHub
integration, Google Calendar integration, reminders/automation.
