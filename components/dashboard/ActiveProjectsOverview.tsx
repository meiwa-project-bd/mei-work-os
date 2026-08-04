import { Badge } from "@/components/ui/Badge";
import {
  PRIORITY_BADGE,
  PRIORITY_LABEL_TH,
  PROJECT_STATUS_BADGE,
  PROJECT_STATUS_LABEL_TH,
} from "@/lib/constants/enums";
import type { ProjectOverviewRow } from "@/features/dashboard/stats";
import { SectionCard } from "./SectionCard";
import { EmptyPanel } from "./EmptyPanel";
import { FolderIcon } from "./icons";

function Stat({
  label,
  value,
  warn = false,
}: {
  label: string;
  value: React.ReactNode;
  warn?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-0.5 text-sm font-bold ${warn ? "text-warning" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}

export function ActiveProjectsOverview({ projects }: { projects: ProjectOverviewRow[] }) {
  return (
    <SectionCard
      icon={FolderIcon}
      title="โปรเจกต์ที่กำลังเดิน"
      tone="primary"
      action={
        <a href="/projects" className="text-xs font-bold text-primary hover:underline">
          ดูทั้งหมด
        </a>
      }
    >
      {projects.length === 0 ? (
        <EmptyPanel
          title="ยังไม่มีโปรเจกต์ที่กำลังดำเนินการ"
          description='สร้างโปรเจกต์แรกได้ที่หน้า "Projects"'
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-lg border border-pink-100 bg-white/70 p-3.5 transition-colors hover:bg-pink-50/70"
            >
              <p className="truncate text-sm font-bold text-foreground">{project.name}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <Badge className={PROJECT_STATUS_BADGE[project.status]}>
                  {PROJECT_STATUS_LABEL_TH[project.status]}
                </Badge>
                <Badge className={PRIORITY_BADGE[project.priority]}>
                  {PRIORITY_LABEL_TH[project.priority]}
                </Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-pink-100 pt-3">
                <Stat label="ชั่วโมงรวม" value={project.totalHoursLabel} />
                <Stat label="งานทั้งหมด" value={project.totalLogs} />
                <Stat
                  label="รอ/ติดปัญหา"
                  value={project.waitingBlockedCount}
                  warn={project.waitingBlockedCount > 0}
                />
                <Stat label="ทำล่าสุด" value={project.lastActivityDate ?? "-"} />
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
