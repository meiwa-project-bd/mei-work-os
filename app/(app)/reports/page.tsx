import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReportFilterPanel, type ReportFilterValues } from "@/components/reports/ReportFilterPanel";
import { ReportPreview } from "@/components/reports/ReportPreview";
import { createClient } from "@/lib/supabase/server";
import { getBangkokToday, getBangkokWeekRange } from "@/lib/utils/date";
import { logsToCsv } from "@/lib/utils/csv";
import { getReportLogs, getReportProjects, type ReportFilters } from "@/features/reports/queries";
import { DEFAULT_REPORT_TYPE, REPORT_TYPES, generateReport, type ReportType } from "@/features/reports/generator";
import { WORK_LOG_STATUS_LABEL_TH, type WorkLogStatus } from "@/lib/constants/enums";

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function isReportType(value: string): value is ReportType {
  return REPORT_TYPES.some((t) => t.value === value);
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const hasParams = Object.keys(params).length > 0;
  const { start: weekStart, end: weekEnd } = getBangkokWeekRange();

  const typeParam = firstValue(params.type);
  const type: ReportType = isReportType(typeParam) ? typeParam : DEFAULT_REPORT_TYPE;

  const from = firstValue(params.from) || weekStart;
  const to = firstValue(params.to) || weekEnd;
  const projectId = firstValue(params.project);
  const category = firstValue(params.category);
  const status = firstValue(params.status);

  // Only default the checkbox to "on" for a fresh, never-submitted page load —
  // once the form has been submitted, an absent `boss` param means the user unchecked it.
  const bossVisibleOnly = hasParams ? firstValue(params.boss) === "true" : true;

  const filterValues: ReportFilterValues = {
    type,
    from,
    to,
    project: projectId,
    category,
    status,
    boss: bossVisibleOnly,
  };

  // Boss Summary must only ever include boss_visible = true, regardless of the checkbox.
  const reportFilters: ReportFilters = {
    from,
    to,
    projectId,
    category,
    status,
    bossVisibleOnly: type === "boss" ? true : bossVisibleOnly,
  };

  const supabase = (await createClient())!;
  const [logs, projects] = await Promise.all([
    getReportLogs(supabase, reportFilters),
    getReportProjects(supabase),
  ]);

  const todayISO = getBangkokToday();
  const reportText = generateReport(type, logs, reportFilters, todayISO);
  const reportTypeLabel = REPORT_TYPES.find((t) => t.value === type)?.label ?? type;

  const filterSummaryParts = [
    `${from} – ${to}`,
    projectId ? projects.find((p) => p.id === projectId)?.name : null,
    category || null,
    status ? (WORK_LOG_STATUS_LABEL_TH[status as WorkLogStatus] ?? status) : null,
    reportFilters.bossVisibleOnly ? "Boss visible เท่านั้น" : null,
  ].filter(Boolean);

  return (
    <>
      <PageHeader
        title="Reports"
        description="สร้างสรุปงานประจำวัน ประจำสัปดาห์ และรายงานสำหรับหัวหน้าจากข้อมูลจริง"
      />

      <div className="mb-4">
        <ReportFilterPanel projects={projects} filters={filterValues} />
      </div>

      {logs.length === 0 ? (
        <EmptyState
          title="ไม่พบข้อมูลในช่วงเวลาที่เลือก"
          description="ลองขยายช่วงวันที่ หรือปรับตัวกรองโปรเจกต์ / หมวดหมู่ / สถานะดูอีกครั้ง"
        />
      ) : (
        <ReportPreview
          text={reportText}
          csv={logsToCsv(logs)}
          reportTypeLabel={reportTypeLabel}
          filterSummary={filterSummaryParts.join(" · ")}
          filenameBase={`report-${type}-${from}_${to}`}
          highlight={type === "boss"}
        />
      )}
    </>
  );
}
