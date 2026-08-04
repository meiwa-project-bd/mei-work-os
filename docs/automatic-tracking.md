# Automatic Tracking Architecture

MEI Work OS needs automatic local tracking because a web-only app cannot
reliably know how long the user is using Claude Code, Codex, VS Code, ChatGPT,
browser tools, terminals, or Git clients.

Phase 6 keeps the web app as Next.js + Supabase and adds a local Windows
tracker agent that sends metadata-only events to the app.

## Privacy boundary

The local tracker must not:

- scrape ChatGPT or Claude websites
- store provider account passwords
- use Supabase `service_role` keys
- capture keystrokes
- capture screenshots or screen content by default

The Phase 6A agent records only:

- foreground app/process name
- foreground window title
- configured repo path, when available
- current branch, when available
- timestamps
- active, idle, and total minutes
- tool category

## Data model

`database/migrations/phase6_work_tracker.sql` adds:

- `work_sessions` for tracked work blocks
- `evidence_items` for commits, commands, builds, tests, notes, reports, and
  future screenshots/files
- `ai_usage_events` for visible model/limit/reset events when they are surfaced
  by a CLI wrapper, API, or manual entry

All tables have RLS enabled and are scoped to `auth.uid()`.

## Ingestion API

`POST /api/tracker/events` accepts:

- `session_start`
- `session_heartbeat`
- `session_end`
- `evidence_added`
- `ai_usage_event`

The API accepts either a normal Supabase user access token or a long-lived
MEI tracker token created in Settings:

```http
Authorization: Bearer <Supabase user access token>
Authorization: Bearer <mei_tracker_...>
```

Supabase user access tokens use the anon key plus the user's bearer token, so
inserts and updates pass through user-scoped RLS.

Tracker tokens are stored only as SHA-256 hashes in `tracker_tokens`. The API
passes the plaintext token to scoped Supabase RPC functions; Postgres hashes it,
checks that it is not revoked, updates `last_used_at`, and writes the tracker
event for that token's user. The local agent never receives a service key.

## Windows tracker

The Windows tracker lives in `agent/windows-tracker/`.

It:

- polls every 30 seconds by default
- detects the foreground process and window title through local Win32 APIs
- detects idle time through `GetLastInputInfo`
- categorizes tools from process/window metadata
- sends session start, heartbeat, and end events

Required `.env` values:

```bash
TRACKER_API_URL=http://localhost:3000/api/tracker/events
TRACKER_TOKEN=mei_tracker_...
POLL_INTERVAL_SECONDS=30
```

Tool categories:

- `Code.exe` -> `VS Code`
- `WindowsTerminal.exe`, `cmd.exe`, `powershell.exe`, or `pwsh.exe` with title
  containing `codex` -> `Codex`
- terminal title containing `claude` -> `Claude Code`
- browser title containing `ChatGPT` -> `ChatGPT`
- browser title containing `GitHub`, `Supabase`, or `Vercel` -> `Browser`

## Future CLI wrappers

Do not implement these until Phase 6B/6C.

### `mei-codex`

Planned behavior:

1. Start a `work_sessions` row with source `cli_wrapper`.
2. Launch the real `codex` command with all user arguments.
3. Stream stdout/stderr unchanged to the terminal.
4. Detect visible model, usage, limit, and reset messages from CLI output.
5. Insert `ai_usage_events` for detected limit/model events.
6. Capture git branch, commits created during the session, build/test commands,
   and exit status as `evidence_items`.
7. End the session when the child process exits.

### `mei-claude`

Planned behavior:

1. Start a `work_sessions` row with source `cli_wrapper`.
2. Launch the real Claude Code command with all user arguments.
3. Stream stdout/stderr unchanged to the terminal.
4. Detect visible model, usage, limit, and reset messages from CLI output.
5. Insert `ai_usage_events` for detected limit/model events.
6. Capture git branch, commits created during the session, build/test commands,
   and exit status as `evidence_items`.
7. End the session when the child process exits.

The wrappers should never scrape provider websites or store provider passwords.
