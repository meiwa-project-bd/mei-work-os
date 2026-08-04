import type { Project } from "@/types/database";
import { formatHoursDecimal } from "@/lib/utils/duration";
import { WORK_LOG_STATUS_LABEL_TH, type WorkLogStatus } from "@/lib/constants/enums";
import type { StatsLogRow, WeekLogRow } from "./queries";

export interface DashboardKpis {
  todayHoursLabel: string;
  todayTasks: number;
  weekHoursLabel: string;
  doneThisWeek: number;
  waitingBlockedCount: number;
  activeProjectsCount: number;
}

export function computeKpis(
  weekLogs: WeekLogRow[],
  todayISO: string,
  waitingBlockedCount: number,
  activeProjectsCount: number
): DashboardKpis {
  const todayLogs = weekLogs.filter((log) => log.work_date === todayISO);
  const todayMinutes = todayLogs.reduce((sum, log) => sum + (log.duration_minutes ?? 0), 0);
  const weekMinutes = weekLogs.reduce((sum, log) => sum + (log.duration_minutes ?? 0), 0);
  const doneThisWeek = weekLogs.filter((log) => log.status === "Done").length;

  return {
    todayHoursLabel: formatHoursDecimal(todayMinutes),
    todayTasks: todayLogs.length,
    weekHoursLabel: formatHoursDecimal(weekMinutes),
    doneThisWeek,
    waitingBlockedCount,
    activeProjectsCount,
  };
}

export interface BarItem {
  label: string;
  value: number;
}

function groupCount<T>(items: T[], keyOf: (item: T) => string): BarItem[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = keyOf(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function computeCategoryBreakdown(weekLogs: WeekLogRow[]): BarItem[] {
  return groupCount(weekLogs, (log) => log.category);
}

export function computeStatusBreakdown(weekLogs: WeekLogRow[]): BarItem[] {
  return groupCount(weekLogs, (log) => log.status).map((item) => ({
    ...item,
    label: WORK_LOG_STATUS_LABEL_TH[item.label as WorkLogStatus] ?? item.label,
  }));
}

export function computeProjectHours(weekLogs: WeekLogRow[], limit = 8): BarItem[] {
  const minutesByProject = new Map<string, number>();
  for (const log of weekLogs) {
    const label = log.project?.name ?? "ไม่ระบุโปรเจกต์";
    minutesByProject.set(label, (minutesByProject.get(label) ?? 0) + (log.duration_minutes ?? 0));
  }
  return Array.from(minutesByProject.entries())
    .map(([label, minutes]) => ({ label, value: minutes }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export interface ProjectOverviewRow extends Project {
  totalLogs: number;
  totalHoursLabel: string;
  waitingBlockedCount: number;
  lastActivityDate: string | null;
}

export function buildProjectOverview(
  projects: Project[],
  allLogs: StatsLogRow[]
): ProjectOverviewRow[] {
  return projects.map((project) => {
    const projectLogs = allLogs.filter((log) => log.project_id === project.id);
    const totalMinutes = projectLogs.reduce((sum, log) => sum + (log.duration_minutes ?? 0), 0);
    const waitingBlockedCount = projectLogs.filter(
      (log) => log.status === "Waiting" || log.status === "Blocked"
    ).length;
    const lastActivityDate = projectLogs.reduce<string | null>(
      (latest, log) => (latest === null || log.work_date > latest ? log.work_date : latest),
      null
    );

    return {
      ...project,
      totalLogs: projectLogs.length,
      totalHoursLabel: formatHoursDecimal(totalMinutes),
      waitingBlockedCount,
      lastActivityDate,
    };
  });
}
