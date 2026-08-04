import { PageHeader } from "@/components/ui/PageHeader";
import { ProjectsBoard } from "@/components/projects/ProjectsBoard";
import { createClient } from "@/lib/supabase/server";
import { getAllLogsForStats } from "@/features/dashboard/queries";
import { buildProjectOverview } from "@/features/dashboard/stats";
import type { Project } from "@/types/database";

export default async function ProjectsPage() {
  const supabase = (await createClient())!;

  const [{ data: projects, error }, allLogsForStats] = await Promise.all([
    supabase.from("projects").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
    getAllLogsForStats(supabase),
  ]);

  if (error) {
    throw new Error("โหลดข้อมูลโปรเจกต์ไม่สำเร็จ");
  }

  const overview = buildProjectOverview((projects ?? []) as Project[], allLogsForStats);

  return (
    <>
      <PageHeader
        title="Projects"
        description="ติดตามความคืบหน้าและชั่วโมงทำงานของแต่ละโปรเจกต์"
      />
      <ProjectsBoard projects={overview} />
    </>
  );
}
