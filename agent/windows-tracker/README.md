# MEI Windows Tracker Agent

Lightweight local tracker for Phase 6A. It polls the foreground Windows app,
tracks idle time, and sends metadata-only session events to MEI Work OS.

It does not capture keystrokes, passwords, screenshots, or screen contents.

## Setup

1. In MEI Work OS, open **Settings** and create a new tracker token.
2. Copy `.env.example` to `.env`.
3. Set `TRACKER_API_URL` to your API endpoint:
   - Local: `http://localhost:3000/api/tracker/events`
   - Vercel: `https://your-app.vercel.app/api/tracker/events`
4. Set `TRACKER_TOKEN` to the token shown in Settings. It is shown only once.
5. Optionally set `TRACKER_REPO_PATH` so the agent can attach repo path and branch metadata.
6. Run:

```bash
start-tracker.cmd
```

You can also run `node tracker.js` directly from this folder.

## Notes

- Phase 6B tracker tokens are long-lived until revoked in Settings.
- MEI Work OS stores only the hashed token.
- The agent categorizes tool usage from process/window metadata only.
- `POLL_INTERVAL_SECONDS` defaults to `30`.
- `IDLE_THRESHOLD_SECONDS` defaults to `300`.
