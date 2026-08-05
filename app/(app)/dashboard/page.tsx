import { ActiveProjectsOverview } from "@/components/dashboard/ActiveProjectsOverview";
import { BarList } from "@/components/dashboard/BarList";
import { DashboardGameNav } from "@/components/dashboard/DashboardGameNav";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardKpiCard } from "@/components/dashboard/DashboardKpiCard";
import { DashboardNpcPanel } from "@/components/dashboard/DashboardNpcPanel";
import { DashboardTopHud } from "@/components/dashboard/DashboardTopHud";
import { RecentDoneList } from "@/components/dashboard/RecentDoneList";
import { TodayEvidenceSummary } from "@/components/dashboard/TodayEvidenceSummary";
import { TodayWorkList } from "@/components/dashboard/TodayWorkList";
import { WaitingBlockedList } from "@/components/dashboard/WaitingBlockedList";
import {
  AlertIcon,
  CalendarIcon,
  ChecklistIcon,
  CheckCircleIcon,
  ClockIcon,
  FolderIcon,
} from "@/components/dashboard/icons";
import {
  getActiveProjects,
  getAllLogsForStats,
  getRecentDoneLogs,
  getWaitingBlockedLogs,
  getWeekLogs,
} from "@/features/dashboard/queries";
import {
  buildProjectOverview,
  computeCategoryBreakdown,
  computeKpis,
  computeProjectHours,
  computeStatusBreakdown,
} from "@/features/dashboard/stats";
import { getTrackerDashboardSummary } from "@/features/tracker/queries";
import { createClient } from "@/lib/supabase/server";
import { getBangkokToday, getBangkokWeekRange } from "@/lib/utils/date";
import { formatDurationLabel } from "@/lib/utils/duration";

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
  ] = await Promise.all([
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
    <div className="mei-game-dashboard mei-dashboard-board">
      <DashboardNpcPanel
        trackedMinutes={trackerSummary.trackedMinutes}
        evidenceCount={trackerSummary.evidenceCount}
        todayTasks={todayLogs.length}
      />

      <section className="mei-dashboard-workspace">
        <DashboardTopHud
          todayISO={todayISO}
          trackedMinutes={trackerSummary.trackedMinutes}
          evidenceCount={trackerSummary.evidenceCount}
        />

        <div className="mei-dashboard-content-grid">
          <DashboardGameNav />

          <div className="min-w-0 space-y-4">
            <DashboardHeader
              trackedMinutes={trackerSummary.trackedMinutes}
              evidenceCount={trackerSummary.evidenceCount}
              todayTasks={todayLogs.length}
            />

            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              <DashboardKpiCard
                label="เวลา Track วันนี้"
                value={formatDurationLabel(trackerSummary.trackedMinutes)}
                icon={ClockIcon}
                tone="primary"
                helper="จากเป้าหมาย 4 ชม."
              />
              <DashboardKpiCard
                label="เวลาทำงานจริง"
                value={formatDurationLabel(trackerSummary.activeMinutes)}
                icon={CheckCircleIcon}
                tone="success"
                helper="มีสมาธิทำงาน"
              />
              <DashboardKpiCard
                label="เวลา Idle"
                value={formatDurationLabel(trackerSummary.idleMinutes)}
                icon={AlertIcon}
                tone="warning"
                helper="เวลาที่ไม่ได้ใช้งาน"
              />
              <DashboardKpiCard
                label="หลักฐานวันนี้"
                value={trackerSummary.evidenceCount}
                icon={FolderIcon}
                tone="accent"
                helper="ชิ้น"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.95fr_1.05fr]">
              <TodayEvidenceSummary summary={trackerSummary} />
              <TodayWorkList logs={todayLogs} />
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <WaitingBlockedList logs={waitingBlockedLogs} todayISO={todayISO} />
              <RecentDoneList logs={recentDoneLogs} />
            </div>

            <div>
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-1">
                <h2 className="text-sm font-bold text-foreground">สรุปสัปดาห์นี้</h2>
                <span className="text-xs text-muted">
                  {weekStart} - {weekEnd}
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

            <ActiveProjectsOverview projects={projectOverview} />

            <div className="mei-bottom-xp rounded-lg">
              <span className="font-black text-[#dbe7ff]">เลเวลถัดไป: อีก 550 XP</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full border border-[#f472d0]/35 bg-[#050b20]/72">
                <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-[#d946ef] to-[#7dd3fc]" />
              </div>
              <span className="font-black text-[#fde68a]">โบนัสประจำวัน +20% XP</span>
              <a href="/settings" className="mei-upgrade-button">
                อัปเกรดตัวละคร
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
