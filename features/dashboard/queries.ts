import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkCategory, WorkLogStatus } from "@/lib/constants/enums";
import type { Project } from "@/types/database";
import { assertNoQueryError } from "@/lib/utils/query";

export interface WeekLogRow {
  id: string;
  work_date: string;
  project_id: string | null;
  project: { id: string; name: string } | null;
  category: WorkCategory;
  title: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  status: WorkLogStatus;
}

export interface WaitingBlockedRow {
  id: string;
  work_date: string;
  project: { id: string; name: string } | null;
  title: string;
  status: WorkLogStatus;
  blocker: string | null;
  next_action: string | null;
}

export interface RecentDoneRow {
  id: string;
  work_date: string;
  project: { id: string; name: string } | null;
  title: string;
  duration_minutes: number | null;
}

export interface StatsLogRow {
  project_id: string | null;
  status: WorkLogStatus;
  duration_minutes: number | null;
  work_date: string;
}

const WORK_LOG_FIELDS =
  "id, work_date, project_id, project:projects(id, name), category, title, description, start_time, end_time, duration_minutes, status";

export async function getWeekLogs(
  supabase: SupabaseClient,
  weekStart: string,
  weekEnd: string
): Promise<WeekLogRow[]> {
  const { data, error } = await supabase
    .from("work_logs")
    .select(WORK_LOG_FIELDS)
    .is("deleted_at", null)
    .gte("work_date", weekStart)
    .lte("work_date", weekEnd)
    .order("work_date", { ascending: false });

  assertNoQueryError(error, "โหลดบันทึกงานประจำสัปดาห์ไม่สำเร็จ");
  return (data ?? []) as unknown as WeekLogRow[];
}

export async function getWaitingBlockedLogs(supabase: SupabaseClient): Promise<WaitingBlockedRow[]> {
  const { data, error } = await supabase
    .from("work_logs")
    .select("id, work_date, project:projects(id, name), title, status, blocker, next_action")
    .is("deleted_at", null)
    .in("status", ["Waiting", "Blocked"])
    .order("work_date", { ascending: true });

  assertNoQueryError(error, "โหลดงานที่รอ/ติดปัญหาไม่สำเร็จ");
  return (data ?? []) as unknown as WaitingBlockedRow[];
}

export async function getRecentDoneLogs(
  supabase: SupabaseClient,
  limit = 8
): Promise<RecentDoneRow[]> {
  const { data, error } = await supabase
    .from("work_logs")
    .select("id, work_date, project:projects(id, name), title, duration_minutes")
    .is("deleted_at", null)
    .eq("status", "Done")
    .order("work_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  assertNoQueryError(error, "โหลดงานที่เสร็จล่าสุดไม่สำเร็จ");
  return (data ?? []) as unknown as RecentDoneRow[];
}

export async function getActiveProjects(supabase: SupabaseClient): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .is("deleted_at", null)
    .in("status", ["Active", "Waiting"])
    .order("name", { ascending: true });

  assertNoQueryError(error, "โหลดโปรเจกต์ที่กำลังดำเนินการไม่สำเร็จ");
  return (data ?? []) as Project[];
}

/** Lightweight, all-time, non-deleted log data used to aggregate per-project stats. */
export async function getAllLogsForStats(supabase: SupabaseClient): Promise<StatsLogRow[]> {
  const { data, error } = await supabase
    .from("work_logs")
    .select("project_id, status, duration_minutes, work_date")
    .is("deleted_at", null);

  assertNoQueryError(error, "โหลดข้อมูลสถิติไม่สำเร็จ");
  return (data ?? []) as StatsLogRow[];
}
