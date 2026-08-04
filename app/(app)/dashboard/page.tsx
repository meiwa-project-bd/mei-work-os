import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardKpiCard } from "@/components/dashboard/DashboardKpiCard";
import { BarList } from "@/components/dashboard/BarList";
import { TodayWorkList } from "@/components/dashboard/TodayWorkList";
import { WaitingBlockedList } from "@/components/dashboard/WaitingBlockedList";
import { RecentDoneList } from "@/components/dashboard/RecentDoneList";
import { ActiveProjectsOverview } from "@/components/dashboard/ActiveProjectsOverview";
import { TodayEvidenceSummary } from "@/components/dashboard/TodayEvidenceSummary";
import {
  AlertIcon,
  CalendarIcon,
  ChecklistIcon,
  CheckCircleIcon,
  ClockIcon,
  FolderIcon,
} from "@/components/dashboard/icons";
import { createClient } from "@/lib/supabase/server";
import { getBangkokToday, getBangkokWeekRange } from "@/lib/utils/date";
import { formatDurationLabel } from "@/lib/utils/duration";
import {
  getActiveProjects,
  getAllLogsForStats,
  getRecentDoneLogs,
  getWaitingBlockedLogs,
  getWeekLogs,
} from "@/features/dashboard/queries";
import { getTrackerDashboardSummary } from "@/features/tracker/queries";
import {
  buildProjectOverview,
  computeCategoryBreakdown,
  computeKpis,
  computeProjectHours,
  computeStatusBreakdown,
} from "@/features/dashboard/stats";

export default async function DashboardPage() {
  const supabase = (await createClient())!;
  const todayISO = getBangkokToday();
  const { start: weekStart, end: weekEnd } = getBangkokWeekRange();

  const [
    weekLogs,
    waitingBlockedLogs,
    recentDoneLogs,
    activeProjects,
    allLogsForStats,
    trackerSummary,
  ] =
    await Promise.all([
      getWeekLogs(supabase, weekStart, weekEnd),
      getWaitingBlockedLogs(supabase),
      getRecentDoneLogs(supabase),
      getActiveProjects(supabase),
      getAllLogsForStats(supabase),
      getTrackerDashboardSummary(supabase, todayISO),
    ]);

  const todayLogs = weekLogs.filter((log) => log.work_date === todayISO);
  const activeProjectsCount = activeProjects.filter((p) => p.status === "Active").length;

  const kpis = computeKpis(weekLogs, todayISO, waitingBlockedLogs.length, activeProjectsCount);
  const categoryBreakdown = computeCategoryBreakdown(weekLogs);
  const statusBreakdown = computeStatusBreakdown(weekLogs);
  const projectHours = computeProjectHours(weekLogs);
  const projectOverview = buildProjectOverview(activeProjects, allLogsForStats);

  return (
    <div className="space-y-6">
      <DashboardHeader todayISO={todayISO} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        <DashboardKpiCard
          label="ชั่วโมงวันนี้"
          value={kpis.todayHoursLabel}
          icon={ClockIcon}
          tone="primary"
          helper="เวลาที่บันทึกวันนี้"
        />
        <DashboardKpiCard
          label="งานวันนี้"
          value={kpis.todayTasks}
          icon={ChecklistIcon}
          tone="primary"
          helper="รายการที่บันทึกวันนี้"
        />
        <DashboardKpiCard
          label="ชั่วโมงสัปดาห์นี้"
          value={kpis.weekHoursLabel}
          icon={CalendarIcon}
          tone="accent"
          helper={`${weekStart} – ${weekEnd}`}
        />
        <DashboardKpiCard
          label="งานที่เสร็จสัปดาห์นี้"
          value={kpis.doneThisWeek}
          icon={CheckCircleIcon}
          tone="success"
          helper="จากทั้งหมดในสัปดาห์นี้"
        />
        <DashboardKpiCard
          label="งานที่รอ/ติดปัญหา"
          value={kpis.waitingBlockedCount}
          icon={AlertIcon}
          tone="warning"
          helper="ต้องติดตามต่อ"
          standOut={kpis.waitingBlockedCount > 0}
        />
        <DashboardKpiCard
          label="โปรเจกต์ที่กำลังดำเนินการ"
          value={kpis.activeProjectsCount}
          icon={FolderIcon}
          tone="primary"
          helper="สถานะ Active"
        />
      </div>

      <TodayEvidenceSummary summary={trackerSummary} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TodayWorkList logs={todayLogs} />
        <WaitingBlockedList logs={waitingBlockedLogs} todayISO={todayISO} />
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-1">
          <h2 className="text-sm font-semibold text-foreground">สรุปประจำสัปดาห์นี้</h2>
          <span className="text-xs text-muted">
            {weekStart} – {weekEnd}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <BarList
            title="ชั่วโมงตามโปรเจกต์"
            icon={ClockIcon}
            tone="primary"
            items={projectHours}
            formatValue={formatDurationLabel}
            emptyLabel="ยังไม่มีข้อมูลชั่วโมงในสัปดาห์นี้"
          />
          <BarList
            title="งานตามสถานะ"
            icon={ChecklistIcon}
            tone="accent"
            items={statusBreakdown}
            showPercentage
            emptyLabel="ยังไม่มีบันทึกงานในสัปดาห์นี้"
          />
          <BarList
            title="งานตามหมวดหมู่"
            icon={CalendarIcon}
            tone="success"
            items={categoryBreakdown}
            showPercentage
            emptyLabel="ยังไม่มีบันทึกงานในสัปดาห์นี้"
          />
        </div>
      </div>

      <RecentDoneList logs={recentDoneLogs} />

      <ActiveProjectsOverview projects={projectOverview} />
    </div>
  );
}
