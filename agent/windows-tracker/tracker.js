import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.join(__dirname, ".env");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const [key, ...valueParts] = trimmed.split("=");
    if (!process.env[key]) {
      process.env[key] = valueParts.join("=").replace(/^"|"$/g, "");
    }
  }
}

loadEnvFile(ENV_PATH);

const legacyApiBaseUrl = (process.env.MEI_API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const trackerApiUrl = process.env.TRACKER_API_URL || `${legacyApiBaseUrl}/api/tracker/events`;
const authToken = process.env.TRACKER_TOKEN || process.env.MEI_TRACKER_AUTH_TOKEN || "";
const configuredRepoPath = process.env.TRACKER_REPO_PATH || process.env.MEI_REPO_PATH || "";
const pollSeconds = Number(process.env.POLL_INTERVAL_SECONDS || process.env.MEI_POLL_SECONDS || 30);
const idleThresholdSeconds = Number(
  process.env.IDLE_THRESHOLD_SECONDS || process.env.MEI_IDLE_THRESHOLD_SECONDS || 300
);

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function formatResponseBody(bodyText) {
  return bodyText.length > 1200 ? `${bodyText.slice(0, 1200)}...` : bodyText;
}

if (!authToken) {
  console.error("Missing TRACKER_TOKEN. Copy .env.example to .env and add a tracker token from Settings.");
  process.exit(1);
}

const foregroundScript = String.raw`
Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Text;

public static class MeiWin32 {
  [DllImport("user32.dll")]
  public static extern IntPtr GetForegroundWindow();

  [DllImport("user32.dll", CharSet = CharSet.Unicode)]
  public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);

  [DllImport("user32.dll")]
  public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);

  [StructLayout(LayoutKind.Sequential)]
  public struct LASTINPUTINFO {
    public uint cbSize;
    public uint dwTime;
  }

  [DllImport("user32.dll")]
  public static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);
}
"@

$handle = [MeiWin32]::GetForegroundWindow()
$titleBuilder = New-Object System.Text.StringBuilder 512
[void][MeiWin32]::GetWindowText($handle, $titleBuilder, $titleBuilder.Capacity)
$processId = 0
[void][MeiWin32]::GetWindowThreadProcessId($handle, [ref]$processId)
$process = Get-Process -Id $processId -ErrorAction SilentlyContinue

$lastInput = New-Object MeiWin32+LASTINPUTINFO
$lastInput.cbSize = [System.Runtime.InteropServices.Marshal]::SizeOf($lastInput)
[void][MeiWin32]::GetLastInputInfo([ref]$lastInput)
$idleMs = [Environment]::TickCount - $lastInput.dwTime
if ($idleMs -lt 0) { $idleMs = 0 }

[pscustomobject]@{
  process_name = if ($process) { $process.ProcessName } else { $null }
  process_path = if ($process) { $process.Path } else { $null }
  window_title = $titleBuilder.ToString()
  idle_seconds = [math]::Round($idleMs / 1000)
} | ConvertTo-Json -Compress
`;

function runPowerShell(script) {
  return new Promise((resolve, reject) => {
    execFile(
      "powershell.exe",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script],
      { windowsHide: true, timeout: 15000 },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message));
          return;
        }
        resolve(stdout.trim());
      }
    );
  });
}

async function getForegroundSnapshot() {
  const output = await runPowerShell(foregroundScript);
  return JSON.parse(output);
}

function runGit(args, cwd) {
  return new Promise((resolve) => {
    if (!cwd) {
      resolve("");
      return;
    }

    execFile("git", args, { cwd, windowsHide: true, timeout: 5000 }, (_error, stdout) => {
      resolve(stdout.trim());
    });
  });
}

function normalizeProcessName(value) {
  return String(value || "").toLowerCase();
}

function isBrowser(processName) {
  return ["chrome", "msedge", "firefox", "brave", "opera"].includes(processName);
}

function categorizeTool(snapshot) {
  const processName = normalizeProcessName(snapshot.process_name);
  const title = String(snapshot.window_title || "").toLowerCase();

  if (processName === "code") return "VS Code";
  if (["windowsterminal", "cmd", "powershell", "pwsh"].includes(processName) && title.includes("codex")) {
    return "Codex";
  }
  if (["windowsterminal", "cmd", "powershell", "pwsh"].includes(processName) && title.includes("claude")) {
    return "Claude Code";
  }
  if (isBrowser(processName) && title.includes("chatgpt")) return "ChatGPT";
  if (isBrowser(processName) && /(github|supabase|vercel)/i.test(title)) return "Browser";

  return snapshot.process_name || "Other";
}

function compactTitle(snapshot, tool) {
  const title = String(snapshot.window_title || "").trim();
  if (title) return title.slice(0, 180);
  return `${tool} session`;
}

async function sendEvent(payload) {
  let response;
  try {
    response = await fetch(trackerApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    const cause = error && typeof error === "object" && "cause" in error ? error.cause : null;
    const code = cause && typeof cause === "object" && "code" in cause ? ` ${(cause.code)}` : "";
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `API network error${code}: ${detail}. Check that MEI Work OS is running and TRACKER_API_URL is correct (${trackerApiUrl}).`
    );
  }

  const bodyText = await response.text();
  let data = {};
  if (bodyText) {
    try {
      data = JSON.parse(bodyText);
    } catch {
      data = {};
    }
  }

  if (!response.ok || !isPlainObject(data) || data.ok !== true) {
    const message = isPlainObject(data) && typeof data.error === "string"
      ? data.error
      : formatResponseBody(bodyText) || "empty response body";
    throw new Error(`API error ${response.status}: ${message}`);
  }

  return data;
}

function requireSessionId(result) {
  const sessionId = isPlainObject(result) && typeof result.work_session_id === "string"
    ? result.work_session_id.trim()
    : "";

  if (!sessionId) {
    throw new Error(`API error: session_start did not return work_session_id (${JSON.stringify(result)})`);
  }

  return sessionId;
}

function sessionSignature(snapshot, tool) {
  return [
    tool,
    snapshot.process_name || "",
    configuredRepoPath || "",
  ].join("|");
}

let currentSession = null;

async function startSession(snapshot, tool, branchName) {
  const startedAt = new Date().toISOString();
  const result = await sendEvent({
    event_type: "session_start",
    title: compactTitle(snapshot, tool),
    tool,
    app_name: snapshot.process_name || null,
    window_title: snapshot.window_title || null,
    repo_path: configuredRepoPath || null,
    branch_name: branchName || null,
    started_at: startedAt,
    source: "local_agent",
    status: "active",
  });

  const sessionId = requireSessionId(result);
  currentSession = {
    id: sessionId,
    signature: sessionSignature(snapshot, tool),
    startedAt,
    idleSeconds: 0,
    activeSeconds: 0,
  };

  console.log(`Started ${tool}: ${currentSession.id}`);
}

async function heartbeat(snapshot, tool, branchName, isIdle) {
  if (!currentSession?.id) return;

  if (isIdle) {
    currentSession.idleSeconds += pollSeconds;
  } else {
    currentSession.activeSeconds += pollSeconds;
  }

  await sendEvent({
    event_type: "session_heartbeat",
    work_session_id: currentSession.id,
    app_name: snapshot.process_name || null,
    window_title: snapshot.window_title || null,
    repo_path: configuredRepoPath || null,
    branch_name: branchName || null,
    status: isIdle ? "paused" : "active",
    idle_minutes: Math.round(currentSession.idleSeconds / 60),
    active_minutes: Math.round(currentSession.activeSeconds / 60),
    duration_minutes: Math.round((currentSession.idleSeconds + currentSession.activeSeconds) / 60),
  });
}

async function endSession(status = "completed") {
  if (!currentSession?.id) return;

  const sessionId = currentSession.id;
  await sendEvent({
    event_type: "session_end",
    work_session_id: sessionId,
    ended_at: new Date().toISOString(),
    status,
    idle_minutes: Math.round(currentSession.idleSeconds / 60),
    active_minutes: Math.round(currentSession.activeSeconds / 60),
    duration_minutes: Math.round((currentSession.idleSeconds + currentSession.activeSeconds) / 60),
  });

  console.log(`Ended session: ${sessionId}`);
  currentSession = null;
}

async function tick() {
  const snapshot = await getForegroundSnapshot();
  const tool = categorizeTool(snapshot);
  const branchName = configuredRepoPath ? await runGit(["branch", "--show-current"], configuredRepoPath) : "";
  const signature = sessionSignature(snapshot, tool);
  const isIdle = Number(snapshot.idle_seconds || 0) >= idleThresholdSeconds;

  if (!currentSession) {
    await startSession(snapshot, tool, branchName);
  } else if (currentSession.signature !== signature) {
    await endSession("completed");
    await startSession(snapshot, tool, branchName);
  }

  await heartbeat(snapshot, tool, branchName, isIdle);
}

async function main() {
  console.log(`MEI tracker polling every ${pollSeconds}s. API: ${trackerApiUrl}`);

  process.on("SIGINT", async () => {
    try {
      await endSession("completed");
    } finally {
      process.exit(0);
    }
  });

  while (true) {
    try {
      await tick();
    } catch (error) {
      console.error(`[tracker] ${error.message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, pollSeconds * 1000));
  }
}

main();
