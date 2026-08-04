import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkCategory, WorkLogStatus } from "@/lib/constants/enums";
import type { Project } from "@/types/database";
import { assertNoQueryError } from "@/lib/utils/query";

export interface ReportLogRow {
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
  result: string | null;
  blocker: string | null;
  next_action: string | null;
  evidence_url: string | null;
  boss_visible: boolean;
  tags: string[];
}

export interface ReportFilters {
  from: string;
  to: string;
  projectId: string;
  category: string;
  status: string;
  bossVisibleOnly: boolean;
}

const REPORT_LOG_FIELDS =
  "id, work_date, project_id, project:projects(id, name), category, title, description, start_time, end_time, duration_minutes, status, result, blocker, next_action, evidence_url, boss_visible, tags";

export async function getReportLogs(
  supabase: SupabaseClient,
  filters: ReportFilters
): Promise<ReportLogRow[]> {
  let query = supabase
    .from("work_logs")
    .select(REPORT_LOG_FIELDS)
    .is("deleted_at", null)
    .gte("work_date", filters.from)
    .lte("work_date", filters.to)
    .order("work_date", { ascending: true })
    .order("start_time", { ascending: true, nullsFirst: true });

  if (filters.projectId) query = query.eq("project_id", filters.projectId);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.bossVisibleOnly) query = query.eq("boss_visible", true);

  const { data, error } = await query;
  assertNoQueryError(error, "โหลดข้อมูลรายงานไม่สำเร็จ");
  return (data ?? []) as unknown as ReportLogRow[];
}

/** All non-deleted projects, for the report filter dropdown (not status-restricted — a
 *  boss/project report should still be reportable on a since-completed project). */
export async function getReportProjects(supabase: SupabaseClient): Promise<Pick<Project, "id" | "name">[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("id, name")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  assertNoQueryError(error, "โหลดรายชื่อโปรเจกต์ไม่สำเร็จ");
  return (data ?? []) as Pick<Project, "id" | "name">[];
}
