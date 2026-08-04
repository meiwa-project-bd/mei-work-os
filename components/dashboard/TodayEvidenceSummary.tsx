import { formatHoursDecimal } from "@/lib/utils/duration";
import type { TrackerDashboardSummary } from "@/features/tracker/queries";
import { BarList } from "./BarList";
import { SectionCard } from "./SectionCard";
import { ChecklistIcon, ClockIcon } from "./icons";

export function TodayEvidenceSummary({ summary }: { summary: TrackerDashboardSummary }) {
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
        <BarList
          title="เครื่องมือที่ใช้มากสุด"
          icon={ChecklistIcon}
          tone="primary"
          items={summary.topTools.map((item) => ({
            label: item.tool,
            value: item.minutes,
          }))}
          formatValue={formatHoursDecimal}
          emptyLabel="ยังไม่มีข้อมูลจาก local tracker วันนี้"
        />
      </div>
    </SectionCard>
  );
}
