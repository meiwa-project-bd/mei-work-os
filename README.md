# MEI Work OS

**Personal Work Record** — a cloud-based system for logging daily work, tracking
projects, searching past records, and generating boss-ready reports in Thai.
Replaces a manual Excel work log (วันที่ / โครงการ / รายละเอียด / เวลา) with a
searchable, structured, reportable system.

> **Status:** Phase 1 Foundation, Phase 2 Core CRUD, Phase 2.5 Excel Import
> Lite, Phase 3 Polished Dashboard, Phase 4 Report Generator, Phase 5
> Usability Polish, and Phase 5.1 Thai Label Polish are complete.

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router) + React 19 + TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4
- [Supabase](https://supabase.com) — Postgres database, Auth, Row Level Security
- Deployable to [Vercel](https://vercel.com)

## Project structure

```
app/
  (app)/            protected routes: dashboard, work-logs, projects, reports, people, settings
    settings/import/  Excel import page (Phase 2.5)
  login/             login page + server action
proxy.ts             Next.js 16 "proxy" (formerly middleware) — session refresh + route guard
components/
  ui/                generic UI building blocks (Modal, Drawer, Badge, form styles)
  layout/             sidebar, topbar, login form
  projects/           Projects CRUD board + form
  work-logs/           Work Logs CRUD board, form, filter bar, detail drawer
  import/              Excel import upload/preview/result UI
features/            (reserved) feature-specific logic per domain, added in later phases
lib/
  supabase/           browser/server Supabase clients + config guard
  constants/           status/priority/category enums shared by UI and validation
  import/              Excel parsing, date/time/category heuristics (framework-agnostic)
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
3. Run [`database/migrations/phase6_work_tracker.sql`](database/migrations/phase6_work_tracker.sql)
   to add automatic tracker tables (`work_sessions`, `evidence_items`,
   `ai_usage_events`) and their user-scoped RLS policies.
4. Run [`database/migrations/phase6b_tracker_tokens.sql`](database/migrations/phase6b_tracker_tokens.sql)
   to add secure tracker tokens and token-authenticated tracker ingestion RPCs.

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

## Production deployment checklist

### Supabase

1. Create a Supabase project.
2. Open **SQL Editor > New query**, paste the contents of
   [`database/schema.sql`](database/schema.sql), and run it.
3. Run [`database/migrations/phase6_work_tracker.sql`](database/migrations/phase6_work_tracker.sql).
4. Run [`database/migrations/phase6b_tracker_tokens.sql`](database/migrations/phase6b_tracker_tokens.sql).
5. Create the first user from the app's `/login` page or from
   **Authentication > Users** in Supabase.
6. Optional: copy that user's UUID into [`database/seed.sql`](database/seed.sql)
   by replacing `YOUR_USER_ID_HERE`, then run the seed file in SQL Editor.

### Vercel

1. Push this repository to GitHub.
2. Import the GitHub repository into [Vercel](https://vercel.com/new).
3. Add these Environment Variables in the Vercel project settings:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-public-key
```

Only use the Supabase anon/public key. Do not add the Supabase
`service_role` key to Vercel or to this repository.

4. Deploy. Vercel runs `npm run build`, which calls `next build`.
5. After deployment, test:
   - Login
   - Projects CRUD
   - Work Logs CRUD
   - Excel Import
   - Dashboard
   - Reports

### Vercel readiness notes

- `.env.local` is ignored by `.gitignore`; keep real local values there only.
- `.env.example` contains placeholders only and is safe to commit.
- `next.config.ts` sets `experimental.serverActions.bodySizeLimit` to `5mb`
  so Excel import uploads can exceed the Next.js Server Actions default of
  `1mb`.
- The app reads only `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Excel import

Go to **Settings > นำเข้าจาก Excel**, or **Work Logs > นำเข้าจาก Excel** (`/settings/import`).

1. Upload an `.xlsx` file with columns **วันที่, โครงการ, รายละเอียด, เวลา** (any
   other columns are ignored).
2. Review the preview table — every row shows its parsed date/project/time/category
   and any warnings or errors. Rows with errors (unparseable date, missing
   description) can't be imported and are unchecked automatically. Rows that
   look like a duplicate of an existing log are flagged and unchecked by
   default, but you can tick them back on if you're sure.
3. Click **นำเข้า N รายการที่เลือก** to insert only the checked rows.

Behavior:
- Projects are matched by exact name (case-sensitive) against your existing,
  non-deleted projects; unmatched names are auto-created (`status: Active`,
  `priority: Medium`). A unique constraint on `(user_id, name)` means
  re-running an import with the same project names reuses those projects
  instead of duplicating them.
- Imported work logs default to `status: Done`, `boss_visible: true`,
  `tags: []`. `title` is auto-generated from the description (truncated at 80
  chars); `category` is auto-detected from keywords in the description (see
  `lib/import/excel.ts` for the exact rule list); `result`/`blocker`/`next_action`
  are left blank.
- The เวลา column accepts a time range (`09:00-11:00`), a bare duration
  (`1:30`, `2`, `1.5 ชม.`), or a native Excel time-of-day cell. Anything else
  is left blank with a warning, and the row still imports.
- Thai Buddhist-Era years (e.g. 2569) in the วันที่ column are auto-converted
  to Gregorian (2026).

**Known limitation — duplicate detection is soft, not guaranteed.** Phase 2.5
only flags a likely duplicate when `work_date` + `project` + `description` +
`start_time` all match an existing row exactly. It will **not** catch
duplicates with slightly different wording, and re-importing the same file
twice with rows you leave checked **will** create duplicate work logs. Review
the preview table before confirming, especially on a second import of the
same source file.

## Completed phases

- [x] Phase 1 - Foundation: Next.js + TypeScript + Tailwind + Supabase Auth,
      protected routes, database schema
- [x] Phase 2 - Core CRUD: Projects, Work Logs, soft delete, duration calc,
      filtering
- [x] Phase 2.5 - Excel Import Lite: upload, preview, auto-create projects,
      auto-category, soft duplicate warning
- [x] Phase 3 - Polished Dashboard: KPI cards, today/weekly stats, hours by
      project, waiting/blocked section
- [x] Phase 4 - Report Generator: Daily, Weekly, Project, Boss Summary,
      Detailed Log, and Blocker Report views
- [x] Phase 5 - Usability Polish: smoother daily workflows, responsive states,
      and import/report usability improvements
- [x] Phase 5.1 - Thai Label Polish: Thai display labels for user-facing status,
      priority, category, and report text
