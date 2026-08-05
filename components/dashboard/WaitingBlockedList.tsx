import { Badge } from "@/components/ui/Badge";
import { WORK_LOG_STATUS_BADGE, WORK_LOG_STATUS_LABEL_TH } from "@/lib/constants/enums";
import { daysBetween } from "@/lib/utils/date";
import type { WaitingBlockedRow } from "@/features/dashboard/queries";
import { SectionCard } from "./SectionCard";
import { AlertIcon, CheckCircleIcon } from "./icons";

export function WaitingBlockedList({
  logs,
  todayISO,
}: {
  logs: WaitingBlockedRow[];
  todayISO: string;
}) {
  return (
    <SectionCard
      icon={AlertIcon}
      title="งานที่รอ / ติดปัญหา"
      tone="warning"
      standOut={logs.length > 0}
      action={
        logs.length > 0 ? (
          <span className="rounded-lg bg-warning/10 px-2.5 py-1 text-xs font-bold text-warning">
            {logs.length} รายการ
          </span>
        ) : undefined
      }
    >
      {logs.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg border border-success/25 bg-success/10 px-4 py-6 text-sm font-semibold text-success">
          <CheckCircleIcon className="h-5 w-5 shrink-0" />
          ไม่มีงานที่รอหรือติดปัญหาในตอนนี้
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const age = daysBetween(log.work_date, todayISO);
            return (
              <div key={log.id} className="rounded-lg border border-warning/35 bg-warning/10 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{log.title}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                      <span>{log.project?.name ?? "ไม่ระบุโปรเจกต์"}</span>
                      <span>- {log.work_date}</span>
                      {age > 0 && <span>- {age} วันที่แล้ว</span>}
                    </div>
                  </div>
                  <Badge className={`shrink-0 ${WORK_LOG_STATUS_BADGE[log.status]}`}>
                    {WORK_LOG_STATUS_LABEL_TH[log.status]}
                  </Badge>
                </div>
                {(log.blocker || log.next_action) && (
                  <div className="mt-2 space-y-1 border-t border-warning/20 pt-2 text-xs">
                    {log.blocker && (
                      <p className="text-danger">
                        <span className="font-semibold">ติดขัด:</span> {log.blocker}
                      </p>
                    )}
                    {log.next_action && (
                      <p className="text-foreground">
                        <span className="font-semibold text-warning">ขั้นตอนถัดไป:</span>{" "}
                        {log.next_action}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
