import { formatDurationLabel } from "@/lib/utils/duration";
import type { RecentDoneRow } from "@/features/dashboard/queries";
import { SectionCard } from "./SectionCard";
import { EmptyPanel } from "./EmptyPanel";
import { CheckCircleIcon } from "./icons";

export function RecentDoneList({ logs }: { logs: RecentDoneRow[] }) {
  return (
    <SectionCard icon={CheckCircleIcon} title="งานที่เสร็จล่าสุด" tone="success">
      {logs.length === 0 ? (
        <EmptyPanel
          title="ยังไม่มีงานที่เสร็จ"
          description="งานที่ปิดเรียบร้อยแล้วจะแสดงตรงนี้ ให้เห็นความคืบหน้าแบบชื่นใจ"
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-success/25 bg-success/10 p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{log.title}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {log.project?.name ?? "ไม่ระบุโปรเจกต์"} - {log.work_date}
                </p>
              </div>
              <span className="shrink-0 text-xs font-bold text-success">
                {formatDurationLabel(log.duration_minutes)}
              </span>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
