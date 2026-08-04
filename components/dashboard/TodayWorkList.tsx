import { Badge } from "@/components/ui/Badge";
import { WORK_LOG_STATUS_BADGE, WORK_LOG_STATUS_LABEL_TH } from "@/lib/constants/enums";
import { formatDurationLabel } from "@/lib/utils/duration";
import type { WeekLogRow } from "@/features/dashboard/queries";
import { SectionCard } from "./SectionCard";
import { EmptyPanel } from "./EmptyPanel";
import { ChecklistIcon } from "./icons";

export function TodayWorkList({ logs }: { logs: WeekLogRow[] }) {
  return (
    <SectionCard
      icon={ChecklistIcon}
      title="งานวันนี้"
      tone="primary"
      action={
        logs.length > 0 ? (
          <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
            {logs.length} รายการ
          </span>
        ) : undefined
      }
    >
      {logs.length === 0 ? (
        <EmptyPanel
          title="วันนี้ยังไม่มีบันทึกงาน"
          description="เริ่มจากงานเล็ก ๆ หนึ่งรายการก็พอ แล้วค่อยให้ระบบช่วยเก็บต่อ"
        />
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const timeRange =
              log.start_time || log.end_time
                ? `${log.start_time?.slice(0, 5) ?? "-"}-${log.end_time?.slice(0, 5) ?? "-"}`
                : formatDurationLabel(log.duration_minutes);
            return (
              <div
                key={log.id}
                className="rounded-lg border border-pink-100 bg-white/70 p-3 transition-colors hover:bg-pink-50/70"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{log.title}</p>
                  <Badge className={`shrink-0 ${WORK_LOG_STATUS_BADGE[log.status]}`}>
                    {WORK_LOG_STATUS_LABEL_TH[log.status]}
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
                  <span>{timeRange}</span>
                  <span>- {log.project?.name ?? "ไม่ระบุโปรเจกต์"}</span>
                  <span>- {log.category}</span>
                </div>
                {log.description && (
                  <p className="mt-1 line-clamp-1 text-xs text-muted">{log.description}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
