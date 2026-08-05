import { formatHoursDecimal } from "@/lib/utils/duration";
import type { TrackerDashboardSummary } from "@/features/tracker/queries";
import { SectionCard } from "./SectionCard";
import { ChecklistIcon, ClockIcon } from "./icons";

export function TodayEvidenceSummary({ summary }: { summary: TrackerDashboardSummary }) {
  const maxToolMinutes = Math.max(1, ...summary.topTools.map((item) => item.minutes));

  return (
    <SectionCard icon={ClockIcon} title="หลักฐานการทำงานวันนี้" tone="accent">
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-border bg-background/60 p-3">
            <p className="text-lg font-bold text-foreground">
              {formatHoursDecimal(summary.trackedMinutes)}
            </p>
            <p className="mt-1 text-[11px] font-medium text-muted">เวลาที่ track</p>
          </div>
          <div className="rounded-lg border border-border bg-background/60 p-3">
            <p className="text-lg font-bold text-foreground">
              {formatHoursDecimal(summary.activeMinutes)}
            </p>
            <p className="mt-1 text-[11px] font-medium text-muted">เวลาทำงานจริง</p>
          </div>
          <div className="rounded-lg border border-border bg-background/60 p-3">
            <p className="text-lg font-bold text-foreground">{summary.evidenceCount}</p>
            <p className="mt-1 text-[11px] font-medium text-muted">หลักฐาน</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background/50 p-3">
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <ChecklistIcon className="h-4 w-4 text-primary" />
            </span>
            <h4 className="text-xs font-bold text-foreground">เครื่องมือที่ใช้มากสุด</h4>
          </div>
          {summary.topTools.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-3 py-5 text-center text-xs text-muted">
              ยังไม่มีข้อมูลจาก local tracker วันนี้
            </p>
          ) : (
            <div className="space-y-3">
              {summary.topTools.map((item) => (
                <div key={item.tool}>
                  <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
                    <span className="truncate font-semibold text-foreground">{item.tool}</span>
                    <span className="shrink-0 text-muted">{formatHoursDecimal(item.minutes)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#050b20]/70">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                      style={{ width: `${Math.max(4, (item.minutes / maxToolMinutes) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
