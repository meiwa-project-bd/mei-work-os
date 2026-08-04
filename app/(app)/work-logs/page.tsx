import { PageHeader } from "@/components/ui/PageHeader";
import { WorkLogFilterBar } from "@/components/work-logs/WorkLogFilterBar";
import { WorkLogsBoard, type WorkLogRow } from "@/components/work-logs/WorkLogsBoard";
import { createClient } from "@/lib/supabase/server";
import { assertNoQueryError } from "@/lib/utils/query";
import type { Project } from "@/types/database";

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

// Escapes characters that are meaningful to PostgREST's ilike/or filter syntax
// so a search term containing them (%, comma, quotes) can't break the query.
function escapeFilterValue(term: string) {
  return term.replace(/[%\\]/g, "\\$&").replace(/"/g, '\\"');
}

export default async function WorkLogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = {
    q: firstValue(params.q).trim(),
    from: firstValue(params.from),
    to: firstValue(params.to),
    project: firstValue(params.project),
    status: firstValue(params.status),
    category: firstValue(params.category),
    boss: firstValue(params.boss),
  };

  const supabase = (await createClient())!;

  let query = supabase
    .from("work_logs")
    .select("*, project:projects(id, name)")
    .is("deleted_at", null)
    .order("work_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.q) {
    const term = escapeFilterValue(filters.q);
    query = query.or(
      `title.ilike."%${term}%",description.ilike."%${term}%",result.ilike."%${term}%",blocker.ilike."%${term}%",next_action.ilike."%${term}%"`
    );
  }
  if (filters.from) query = query.gte("work_date", filters.from);
  if (filters.to) query = query.lte("work_date", filters.to);
  if (filters.project) query = query.eq("project_id", filters.project);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.boss === "true") query = query.eq("boss_visible", true);
  if (filters.boss === "false") query = query.eq("boss_visible", false);

  const [{ data: logs, error: logsError }, { data: projects, error: projectsError }] = await Promise.all([
    query,
    supabase.from("projects").select("id, name").is("deleted_at", null).order("name"),
  ]);

  assertNoQueryError(logsError, "โหลดบันทึกงานไม่สำเร็จ");
  assertNoQueryError(projectsError, "โหลดรายชื่อโปรเจกต์ไม่สำเร็จ");

  return (
    <>
      <PageHeader
        title="Work Logs"
        description="บันทึกงานประจำวัน ค้นหา กรอง และดูรายละเอียดย้อนหลัง"
      />
      <div className="mb-4">
        <WorkLogFilterBar projects={(projects ?? []) as Pick<Project, "id" | "name">[]} filters={filters} />
      </div>
      <WorkLogsBoard
        logs={(logs ?? []) as WorkLogRow[]}
        projects={(projects ?? []) as Pick<Project, "id" | "name">[]}
      />
    </>
  );
}
