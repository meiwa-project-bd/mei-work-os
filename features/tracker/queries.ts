import type { SupabaseClient } from "@supabase/supabase-js";
import type { AiUsageEvent, EvidenceItem, WorkSession } from "@/types/database";
import { assertNoQueryError } from "@/lib/utils/query";

export interface ToolMinutes {
  tool: string;
  minutes: number;
}

export interface TrackerDashboardSummary {
  trackedMinutes: number;
  activeMinutes: number;
  idleMinutes: number;
  evidenceCount: number;
  topTools: ToolMinutes[];
}

export interface TrackerPageData {
  activeSessions: WorkSession[];
  todaySessions: WorkSession[];
  recentSessions: WorkSession[];
  recentEvidence: EvidenceItem[];
  recentAiEvents: AiUsageEvent[];
  summary: TrackerDashboardSummary;
}

function bangkokDayRange(dayISO: string): { start: string; end: string } {
  const start = new Date(`${dayISO}T00:00:00+07:00`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function sessionTrackedMinutes(session: WorkSession): number {
  return session.duration_minutes ?? session.active_minutes ?? 0;
}

function summarizeSessions(
  sessions: WorkSession[],
  evidenceCount: number,
  toolLimit = 4
): TrackerDashboardSummary {
  const minutesByTool = new Map<string, number>();
  let trackedMinutes = 0;
  let activeMinutes = 0;
  let idleMinutes = 0;

  for (const session of sessions) {
    const tracked = sessionTrackedMinutes(session);
    const active = session.active_minutes ?? Math.max(0, tracked - session.idle_minutes);

    trackedMinutes += tracked;
    activeMinutes += active;
    idleMinutes += session.idle_minutes;
    minutesByTool.set(session.tool, (minutesByTool.get(session.tool) ?? 0) + active);
  }

  const topTools = Array.from(minutesByTool.entries())
    .map(([tool, minutes]) => ({ tool, minutes }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, toolLimit);

  return {
    trackedMinutes,
    activeMinutes,
    idleMinutes,
    evidenceCount,
    topTools,
  };
}

export async function getTrackerDashboardSummary(
  supabase: SupabaseClient,
  dayISO: string
): Promise<TrackerDashboardSummary> {
  const { start, end } = bangkokDayRange(dayISO);

  const [sessionsResult, evidenceResult] = await Promise.all([
    supabase
      .from("work_sessions")
      .select("*")
      .is("deleted_at", null)
      .gte("started_at", start)
      .lt("started_at", end),
    supabase
      .from("evidence_items")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .gte("created_at", start)
      .lt("created_at", end),
  ]);

  assertNoQueryError(sessionsResult.error, "Failed to load today's tracked sessions");
  assertNoQueryError(evidenceResult.error, "Failed to load today's evidence count");

  return summarizeSessions((sessionsResult.data ?? []) as WorkSession[], evidenceResult.count ?? 0);
}

export async function getTrackerPageData(
  supabase: SupabaseClient,
  dayISO: string
): Promise<TrackerPageData> {
  const { start, end } = bangkokDayRange(dayISO);

  const [
    activeSessionsResult,
    todaySessionsResult,
    recentSessionsResult,
    recentEvidenceResult,
    recentAiEventsResult,
    evidenceCountResult,
  ] = await Promise.all([
    supabase
      .from("work_sessions")
      .select("*")
      .is("deleted_at", null)
      .in("status", ["active", "paused"])
      .order("started_at", { ascending: false }),
    supabase
      .from("work_sessions")
      .select("*")
      .is("deleted_at", null)
      .gte("started_at", start)
      .lt("started_at", end)
      .order("started_at", { ascending: false }),
    supabase
      .from("work_sessions")
      .select("*")
      .is("deleted_at", null)
      .order("started_at", { ascending: false })
      .limit(12),
    supabase
      .from("evidence_items")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("ai_usage_events")
      .select("*")
      .is("deleted_at", null)
      .order("captured_at", { ascending: false })
      .limit(10),
    supabase
      .from("evidence_items")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .gte("created_at", start)
      .lt("created_at", end),
  ]);

  assertNoQueryError(activeSessionsResult.error, "Failed to load active tracker sessions");
  assertNoQueryError(todaySessionsResult.error, "Failed to load today's tracker sessions");
  assertNoQueryError(recentSessionsResult.error, "Failed to load recent tracker sessions");
  assertNoQueryError(recentEvidenceResult.error, "Failed to load recent evidence");
  assertNoQueryError(recentAiEventsResult.error, "Failed to load AI usage events");
  assertNoQueryError(evidenceCountResult.error, "Failed to load today's evidence count");

  const todaySessions = (todaySessionsResult.data ?? []) as WorkSession[];

  return {
    activeSessions: (activeSessionsResult.data ?? []) as WorkSession[],
    todaySessions,
    recentSessions: (recentSessionsResult.data ?? []) as WorkSession[],
    recentEvidence: (recentEvidenceResult.data ?? []) as EvidenceItem[],
    recentAiEvents: (recentAiEventsResult.data ?? []) as AiUsageEvent[],
    summary: summarizeSessions(todaySessions, evidenceCountResult.count ?? 0),
  };
}
