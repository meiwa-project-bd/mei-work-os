import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  AI_USAGE_EVENT_TYPES,
  AI_USAGE_PROVIDERS,
  AI_USAGE_SOURCES,
  AI_USAGE_TOOLS,
  EVIDENCE_TYPES,
  WORK_SESSION_SOURCES,
  WORK_SESSION_STATUSES,
  type AiUsageEventType,
  type AiUsageProvider,
  type AiUsageSource,
  type AiUsageTool,
  type EvidenceType,
  type WorkSessionSource,
  type WorkSessionStatus,
} from "@/lib/constants/enums";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";
import { isTrackerToken } from "@/lib/tracker/tokens";

export const runtime = "nodejs";

type TrackerEventType =
  | "session_start"
  | "session_heartbeat"
  | "session_end"
  | "evidence_added"
  | "ai_usage_event";

type JsonRecord = Record<string, unknown>;

function json(status: number, body: JsonRecord) {
  return Response.json(body, { status });
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.round(value)) : null;
}

function readTimestamp(value: unknown): string | null {
  const raw = readString(value);
  if (!raw) return null;

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function readRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  const raw = readString(value);
  return raw && allowed.includes(raw as T) ? (raw as T) : fallback;
}

function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
}

function minutesBetween(startISO: string | null, endISO: string): number | null {
  if (!startISO) return null;
  const started = new Date(startISO).getTime();
  const ended = new Date(endISO).getTime();
  if (Number.isNaN(started) || Number.isNaN(ended)) return null;
  return Math.max(0, Math.round((ended - started) / 60000));
}

function trackerRpcStatus(message: string): number {
  const lower = message.toLowerCase();
  if (lower.includes("invalid tracker token")) return 401;
  if (lower.includes("not found")) return 404;
  return 400;
}

function readRpcId(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function handleTrackerTokenEvent(
  token: string,
  payload: JsonRecord,
  eventType: TrackerEventType,
  capturedAt: string,
  sessionId: string | null
) {
  const supabase = createSupabaseClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  if (eventType === "session_start") {
    const { data, error } = await supabase.rpc("tracker_rpc_session_start", {
      p_token: token,
      p_project_id: readString(payload.project_id),
      p_work_log_id: readString(payload.work_log_id),
      p_title: readString(payload.title) ?? readString(payload.window_title) ?? "Tracked work session",
      p_tool: readString(payload.tool) ?? "Other",
      p_app_name: readString(payload.app_name),
      p_window_title: readString(payload.window_title),
      p_repo_path: readString(payload.repo_path),
      p_branch_name: readString(payload.branch_name),
      p_started_at: readTimestamp(payload.started_at) ?? capturedAt,
      p_idle_minutes: readNumber(payload.idle_minutes) ?? 0,
      p_active_minutes: readNumber(payload.active_minutes),
      p_duration_minutes: readNumber(payload.duration_minutes),
      p_status: pick<WorkSessionStatus>(payload.status, WORK_SESSION_STATUSES, "active"),
      p_source: pick<WorkSessionSource>(payload.source, WORK_SESSION_SOURCES, "local_agent"),
      p_notes: readString(payload.notes),
    });

    if (error) return json(trackerRpcStatus(error.message), { error: error.message });

    const workSessionId = readRpcId(data);
    if (!workSessionId) {
      return json(500, { error: "Tracker API did not receive a session id from Supabase" });
    }

    return json(201, { ok: true, work_session_id: workSessionId });
  }

  if (eventType === "session_heartbeat") {
    if (!sessionId) return json(400, { error: "work_session_id is required" });

    const { data, error } = await supabase.rpc("tracker_rpc_session_heartbeat", {
      p_token: token,
      p_work_session_id: sessionId,
      p_app_name: readString(payload.app_name),
      p_window_title: readString(payload.window_title),
      p_repo_path: readString(payload.repo_path),
      p_branch_name: readString(payload.branch_name),
      p_status: pick<WorkSessionStatus>(payload.status, WORK_SESSION_STATUSES, "active"),
      p_idle_minutes: readNumber(payload.idle_minutes),
      p_active_minutes: readNumber(payload.active_minutes),
      p_duration_minutes: readNumber(payload.duration_minutes),
      p_notes: readString(payload.notes),
    });

    if (error) return json(trackerRpcStatus(error.message), { error: error.message });
    return json(200, { ok: true, work_session_id: readRpcId(data) ?? sessionId });
  }

  if (eventType === "session_end") {
    if (!sessionId) return json(400, { error: "work_session_id is required" });

    const { data, error } = await supabase.rpc("tracker_rpc_session_end", {
      p_token: token,
      p_work_session_id: sessionId,
      p_ended_at: readTimestamp(payload.ended_at) ?? capturedAt,
      p_duration_minutes: readNumber(payload.duration_minutes),
      p_idle_minutes: readNumber(payload.idle_minutes) ?? 0,
      p_active_minutes: readNumber(payload.active_minutes),
      p_status: pick<WorkSessionStatus>(payload.status, WORK_SESSION_STATUSES, "completed"),
      p_notes: readString(payload.notes),
    });

    if (error) return json(trackerRpcStatus(error.message), { error: error.message });
    return json(200, { ok: true, work_session_id: readRpcId(data) ?? sessionId });
  }

  if (eventType === "evidence_added") {
    const { data, error } = await supabase.rpc("tracker_rpc_evidence_added", {
      p_token: token,
      p_work_session_id: sessionId,
      p_work_log_id: readString(payload.work_log_id),
      p_type: pick<EvidenceType>(payload.evidence_type ?? payload.type_name, EVIDENCE_TYPES, "other"),
      p_title: readString(payload.title) ?? "Tracker evidence",
      p_url: readString(payload.url),
      p_content: readString(payload.content),
      p_metadata: readRecord(payload.metadata),
      p_created_at: capturedAt,
    });

    if (error) return json(trackerRpcStatus(error.message), { error: error.message });
    return json(201, { ok: true, evidence_item_id: readRpcId(data) ?? "" });
  }

  const { data, error } = await supabase.rpc("tracker_rpc_ai_usage_event", {
    p_token: token,
    p_work_session_id: sessionId,
    p_provider: pick<AiUsageProvider>(payload.provider, AI_USAGE_PROVIDERS, "Other"),
    p_tool: pick<AiUsageTool>(payload.tool, AI_USAGE_TOOLS, "Other"),
    p_model_name: readString(payload.model_name),
    p_event_type: pick<AiUsageEventType>(
      payload.ai_event_type ?? payload.usage_event_type,
      AI_USAGE_EVENT_TYPES,
      "other"
    ),
    p_detected_text: readString(payload.detected_text),
    p_reset_at: readTimestamp(payload.reset_at),
    p_remaining_text: readString(payload.remaining_text),
    p_source: pick<AiUsageSource>(payload.source, AI_USAGE_SOURCES, "local_agent"),
    p_captured_at: capturedAt,
  });

  if (error) return json(trackerRpcStatus(error.message), { error: error.message });
  return json(201, { ok: true, ai_usage_event_id: readRpcId(data) ?? "" });
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return json(503, { error: "Supabase is not configured" });
  }

  const token = bearerToken(request);
  if (!token) {
    return json(401, { error: "Missing bearer token" });
  }

  let payload: JsonRecord;
  try {
    payload = (await request.json()) as JsonRecord;
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  const eventType = pick<TrackerEventType>(
    payload.event_type ?? payload.type,
    ["session_start", "session_heartbeat", "session_end", "evidence_added", "ai_usage_event"],
    "session_heartbeat"
  );

  const nowISO = new Date().toISOString();
  const capturedAt = readTimestamp(payload.captured_at) ?? nowISO;
  const sessionId = readString(payload.work_session_id) ?? readString(payload.session_id);

  if (isTrackerToken(token)) {
    return handleTrackerTokenEvent(token, payload, eventType, capturedAt, sessionId);
  }

  const supabase = createSupabaseClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return json(401, { error: "Invalid Supabase user token" });
  }

  if (eventType === "session_start") {
    const startedAt = readTimestamp(payload.started_at) ?? capturedAt;
    const source = pick<WorkSessionSource>(payload.source, WORK_SESSION_SOURCES, "local_agent");
    const status = pick<WorkSessionStatus>(payload.status, WORK_SESSION_STATUSES, "active");

    const { data, error } = await supabase
      .from("work_sessions")
      .insert({
        user_id: user.id,
        project_id: readString(payload.project_id),
        work_log_id: readString(payload.work_log_id),
        title: readString(payload.title) ?? readString(payload.window_title) ?? "Tracked work session",
        tool: readString(payload.tool) ?? "Other",
        app_name: readString(payload.app_name),
        window_title: readString(payload.window_title),
        repo_path: readString(payload.repo_path),
        branch_name: readString(payload.branch_name),
        started_at: startedAt,
        idle_minutes: readNumber(payload.idle_minutes) ?? 0,
        active_minutes: readNumber(payload.active_minutes),
        duration_minutes: readNumber(payload.duration_minutes),
        status,
        source,
        notes: readString(payload.notes),
      })
      .select("id")
      .single();

    if (error) return json(400, { error: error.message });
    return json(201, { ok: true, work_session_id: data.id });
  }

  if (eventType === "session_heartbeat") {
    if (!sessionId) return json(400, { error: "work_session_id is required" });

    const status = pick<WorkSessionStatus>(payload.status, WORK_SESSION_STATUSES, "active");
    const updatePayload: JsonRecord = {
      status,
      app_name: readString(payload.app_name),
      window_title: readString(payload.window_title),
      repo_path: readString(payload.repo_path),
      branch_name: readString(payload.branch_name),
      idle_minutes: readNumber(payload.idle_minutes),
      active_minutes: readNumber(payload.active_minutes),
      duration_minutes: readNumber(payload.duration_minutes),
      notes: readString(payload.notes),
    };

    for (const key of Object.keys(updatePayload)) {
      if (updatePayload[key] === null) delete updatePayload[key];
    }

    const { error } = await supabase
      .from("work_sessions")
      .update(updatePayload)
      .eq("id", sessionId)
      .eq("user_id", user.id);

    if (error) return json(400, { error: error.message });
    return json(200, { ok: true, work_session_id: sessionId });
  }

  if (eventType === "session_end") {
    if (!sessionId) return json(400, { error: "work_session_id is required" });

    const { data: existing, error: loadError } = await supabase
      .from("work_sessions")
      .select("started_at")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (loadError) return json(400, { error: loadError.message });

    const endedAt = readTimestamp(payload.ended_at) ?? capturedAt;
    const durationMinutes =
      readNumber(payload.duration_minutes) ??
      minutesBetween(readString((existing as { started_at?: unknown } | null)?.started_at), endedAt);

    const { error } = await supabase
      .from("work_sessions")
      .update({
        ended_at: endedAt,
        duration_minutes: durationMinutes,
        idle_minutes: readNumber(payload.idle_minutes) ?? 0,
        active_minutes: readNumber(payload.active_minutes) ?? durationMinutes,
        status: pick<WorkSessionStatus>(payload.status, WORK_SESSION_STATUSES, "completed"),
        notes: readString(payload.notes),
      })
      .eq("id", sessionId)
      .eq("user_id", user.id);

    if (error) return json(400, { error: error.message });
    return json(200, { ok: true, work_session_id: sessionId });
  }

  if (eventType === "evidence_added") {
    const { data, error } = await supabase
      .from("evidence_items")
      .insert({
        user_id: user.id,
        work_session_id: sessionId,
        work_log_id: readString(payload.work_log_id),
        type: pick<EvidenceType>(payload.evidence_type ?? payload.type_name, EVIDENCE_TYPES, "other"),
        title: readString(payload.title) ?? "Tracker evidence",
        url: readString(payload.url),
        content: readString(payload.content),
        metadata: readRecord(payload.metadata),
        created_at: capturedAt,
      })
      .select("id")
      .single();

    if (error) return json(400, { error: error.message });
    return json(201, { ok: true, evidence_item_id: data.id });
  }

  const { data, error } = await supabase
    .from("ai_usage_events")
    .insert({
      user_id: user.id,
      work_session_id: sessionId,
      provider: pick<AiUsageProvider>(payload.provider, AI_USAGE_PROVIDERS, "Other"),
      tool: pick<AiUsageTool>(payload.tool, AI_USAGE_TOOLS, "Other"),
      model_name: readString(payload.model_name),
      event_type: pick<AiUsageEventType>(payload.ai_event_type ?? payload.usage_event_type, AI_USAGE_EVENT_TYPES, "other"),
      detected_text: readString(payload.detected_text),
      reset_at: readTimestamp(payload.reset_at),
      remaining_text: readString(payload.remaining_text),
      source: pick<AiUsageSource>(payload.source, AI_USAGE_SOURCES, "local_agent"),
      captured_at: capturedAt,
    })
    .select("id")
    .single();

  if (error) return json(400, { error: error.message });
  return json(201, { ok: true, ai_usage_event_id: data.id });
}
