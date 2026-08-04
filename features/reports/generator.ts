import { formatThaiDate, daysBetween } from "@/lib/utils/date";
import { formatHoursDecimal, formatDurationLabel } from "@/lib/utils/duration";
import { WORK_LOG_STATUS_LABEL_TH } from "@/lib/constants/enums";
import type { ReportFilters, ReportLogRow } from "./queries";

export const REPORT_TYPES = [
  { value: "boss", label: "สรุปสำหรับหัวหน้า (Boss Summary)" },
  { value: "daily", label: "สรุปประจำวัน (Daily Summary)" },
  { value: "weekly", label: "สรุปประจำสัปดาห์ (Weekly Summary)" },
  { value: "project", label: "สรุปตามโปรเจกต์ (Project Summary)" },
  { value: "detailed", label: "บันทึกละเอียด (Detailed Log)" },
  { value: "blocker", label: "รายงานงานติดปัญหา (Blocker Report)" },
] as const;

export type ReportType = (typeof REPORT_TYPES)[number]["value"];

export const DEFAULT_REPORT_TYPE: ReportType = "boss";

const NO_DATA_MESSAGE = "ไม่มีบันทึกงานในช่วงเวลาที่เลือก ลองปรับตัวกรองดูอีกครั้ง";

// ---------------------------------------------------------------------------
// small pure helpers
// ---------------------------------------------------------------------------

function projectLabel(log: ReportLogRow): string {
  return log.project?.name ?? "ไม่ระบุโปรเจกต์";
}

function sumMinutes(logs: ReportLogRow[]): number {
  return logs.reduce((sum, log) => sum + (log.duration_minutes ?? 0), 0);
}

function countByStatus(logs: ReportLogRow[], status: string): number {
  return logs.filter((log) => log.status === status).length;
}

function isWaitingOrBlocked(log: ReportLogRow): boolean {
  return log.status === "Waiting" || log.status === "Blocked";
}

function groupBy<T>(items: T[], keyOf: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const bucket = groups.get(key);
    if (bucket) bucket.push(item);
    else groups.set(key, [item]);
  }
  return groups;
}

function dedupeBullets(items: (string | null | undefined)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of items) {
    const text = raw?.trim();
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(text);
  }
  return out;
}

function bulletList(items: string[], emptyText?: string): string {
  if (items.length === 0) return emptyText ?? "";
  return items.map((item) => `- ${item}`).join("\n");
}

// ---------------------------------------------------------------------------
// 1. Daily Summary — grouped by date; a single-day range naturally yields one block
// ---------------------------------------------------------------------------

export function generateDailySummary(logs: ReportLogRow[]): string {
  const byDate = groupBy(logs, (log) => log.work_date);
  const dates = Array.from(byDate.keys()).sort();

  const blocks = dates.map((date) => {
    const dayLogs = byDate.get(date)!;
    const byProject = groupBy(dayLogs, projectLabel);
    const projectNames = Array.from(byProject.keys());

    const sections = projectNames
      .map((name, i) => {
        const items = byProject.get(name)!;
        const bullets = items.map((log) => log.title);
        return `${i + 1}. ${name}\n${bulletList(bullets)}`;
      })
      .join("\n\n");

    const done = countByStatus(dayLogs, "Done");
    const inProgress = countByStatus(dayLogs, "In Progress");
    const waitingBlocked = dayLogs.filter(isWaitingOrBlocked).length;

    const nextActions = dedupeBullets(dayLogs.map((log) => log.next_action));

    const parts = [
      `สรุปงานประจำวันที่ ${formatThaiDate(date)}`,
      `วันนี้มีงานหลัก ${projectNames.length} ส่วน:`,
      "",
      sections,
      "",
      "สถานะรวม:",
      `- งานที่เสร็จ: ${done} รายการ`,
      `- งานที่กำลังดำเนินการ: ${inProgress} รายการ`,
      `- งานที่รอ/ติดปัญหา: ${waitingBlocked} รายการ`,
    ];

    if (nextActions.length > 0) {
      parts.push("", "งานถัดไป:", bulletList(nextActions));
    }

    return parts.join("\n");
  });

  return blocks.join("\n\n———\n\n");
}

// ---------------------------------------------------------------------------
// 2. Weekly Summary
// ---------------------------------------------------------------------------

export function generateWeeklySummary(logs: ReportLogRow[], filters: ReportFilters): string {
  const totalMinutes = sumMinutes(logs);

  const byProject = groupBy(logs, projectLabel);
  const projectLines = Array.from(byProject.entries())
    .map(([name, items]) => ({ name, minutes: sumMinutes(items), count: items.length }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 8)
    .map((p) => `${p.name}: ${formatHoursDecimal(p.minutes)} (${p.count} งาน)`);

  const doneLogs = logs.filter((log) => log.status === "Done");
  const doneLines = doneLogs.map(
    (log) => `${log.title} (${projectLabel(log)}, ${log.work_date})`
  );

  const waitingBlockedLogs = logs.filter(isWaitingOrBlocked);
  const waitingBlockedLines = waitingBlockedLogs.map((log) => {
    const reason = log.blocker || log.next_action || "รอดำเนินการ";
    return `${log.title} — ${reason} (${projectLabel(log)}, ${log.work_date})`;
  });

  const nextActions = dedupeBullets(logs.map((log) => log.next_action));

  const parts = [
    `สรุปงานประจำสัปดาห์ ${filters.from} – ${filters.to}`,
    "",
    `ชั่วโมงทำงานรวม: ${formatHoursDecimal(totalMinutes)}`,
    "",
    "โปรเจกต์หลัก:",
    bulletList(projectLines, "- ไม่มีข้อมูล"),
    "",
    `งานที่เสร็จ (${doneLogs.length} รายการ):`,
    bulletList(doneLines, "- ไม่มี"),
    "",
    `งานที่รอ/ติดปัญหา (${waitingBlockedLogs.length} รายการ):`,
    bulletList(waitingBlockedLines, "- ไม่มี"),
  ];

  if (nextActions.length > 0) {
    parts.push("", "งานถัดไป:", bulletList(nextActions));
  }

  return parts.join("\n");
}

// ---------------------------------------------------------------------------
// 3. Project Summary — grouped by project (all projects present in the filtered set)
// ---------------------------------------------------------------------------

export function generateProjectSummary(logs: ReportLogRow[]): string {
  const byProject = groupBy(logs, projectLabel);
  const names = Array.from(byProject.keys()).sort((a, b) => a.localeCompare(b, "th"));

  const blocks = names.map((name) => {
    const items = byProject.get(name)!;
    const totalMinutes = sumMinutes(items);
    const done = countByStatus(items, "Done");
    const waitingBlocked = items.filter(isWaitingOrBlocked).length;
    const lastDate = items.reduce((latest, log) => (log.work_date > latest ? log.work_date : latest), items[0].work_date);

    const progressBullets = items
      .filter((log) => log.status === "Done")
      .sort((a, b) => (a.work_date < b.work_date ? 1 : -1))
      .slice(0, 5)
      .map((log) => `${log.result || log.title} (${log.work_date})`);

    const nextActions = dedupeBullets(items.map((log) => log.next_action));

    const parts = [
      `โปรเจกต์: ${name}`,
      "",
      `งานทั้งหมด: ${items.length} รายการ`,
      `ชั่วโมงรวม: ${formatHoursDecimal(totalMinutes)}`,
      `เสร็จแล้ว: ${done} รายการ`,
      `รอ/ติดปัญหา: ${waitingBlocked} รายการ`,
      `ทำล่าสุด: ${formatThaiDate(lastDate)}`,
      "",
      "ความคืบหน้า:",
      bulletList(progressBullets, "- ยังไม่มีงานที่เสร็จ"),
    ];

    if (nextActions.length > 0) {
      parts.push("", "งานถัดไป:", bulletList(nextActions));
    }

    return parts.join("\n");
  });

  return blocks.join("\n\n———\n\n");
}

// ---------------------------------------------------------------------------
// 4. Boss Summary — boss_visible is force-filtered here regardless of caller
// ---------------------------------------------------------------------------

export function generateBossSummary(logs: ReportLogRow[], filters: ReportFilters): string {
  const visible = logs.filter((log) => log.boss_visible);

  if (visible.length === 0) {
    return "ไม่มีข้อมูลงานที่แสดงต่อหัวหน้าในช่วงเวลาที่เลือก (boss_visible)";
  }

  const byProject = groupBy(visible, projectLabel);
  const names = Array.from(byProject.keys());

  const groupText = names.slice(0, 4).join(", ");

  const sections = names
    .map((name, i) => {
      const items = byProject.get(name)!;
      const outcomeBullets = items
        .filter((log) => log.status === "Done" || log.status === "In Progress")
        .slice(0, 3)
        .map((log) => log.result || log.title);

      const blockerBullets = items
        .filter((log) => isWaitingOrBlocked(log) && log.blocker)
        .map((log) => `ติดขัด: ${log.blocker}`);

      const bullets = dedupeBullets([...outcomeBullets, ...blockerBullets]);
      return `${i + 1}. ${name}\n${bulletList(bullets, "- อยู่ระหว่างดำเนินการ")}`;
    })
    .join("\n\n");

  const done = countByStatus(visible, "Done");
  const inProgress = countByStatus(visible, "In Progress");
  const waitingBlocked = visible.filter(isWaitingOrBlocked).length;

  const followUps = visible.filter(isWaitingOrBlocked).map((log) => {
    const reason = [log.blocker, log.next_action ? `ขั้นตอนถัดไป: ${log.next_action}` : null]
      .filter(Boolean)
      .join(" — ");
    return `${log.title} (${projectLabel(log)})${reason ? ` — ${reason}` : ""}`;
  });

  const parts = [
    `สรุปงานช่วงวันที่ ${formatThaiDate(filters.from)} - ${formatThaiDate(filters.to)}`,
    "",
    `ในช่วงนี้มีงานหลักเกี่ยวกับ ${groupText} โดยแบ่งเป็น ${names.length} กลุ่มหลัก:`,
    "",
    sections,
    "",
    "สถานะปัจจุบัน:",
    `- งานที่เสร็จแล้ว: ${done} รายการ`,
    `- งานที่กำลังดำเนินการ: ${inProgress} รายการ`,
    `- งานที่รอ/ติดปัญหา: ${waitingBlocked} รายการ`,
  ];

  if (followUps.length > 0) {
    parts.push("", "ประเด็นที่ต้องติดตาม:", bulletList(followUps));
  }

  return parts.join("\n");
}

// ---------------------------------------------------------------------------
// 5. Detailed Log — audit-trail style, one entry per row
// ---------------------------------------------------------------------------

export function generateDetailedLog(logs: ReportLogRow[]): string {
  return logs
    .map((log) => {
      const timeLabel =
        log.start_time || log.end_time
          ? `${log.start_time?.slice(0, 5) ?? "-"}–${log.end_time?.slice(0, 5) ?? "-"}`
          : formatDurationLabel(log.duration_minutes);

      const lines = [
        `${log.work_date} ${timeLabel} | ${projectLabel(log)} | ${log.category} | ${WORK_LOG_STATUS_LABEL_TH[log.status]}`,
        log.title,
      ];
      if (log.description) lines.push(log.description);
      if (log.result) lines.push(`Result: ${log.result}`);
      if (log.next_action) lines.push(`Next action: ${log.next_action}`);
      if (log.evidence_url) lines.push(`Evidence: ${log.evidence_url}`);

      return lines.join("\n");
    })
    .join("\n\n");
}

// ---------------------------------------------------------------------------
// 6. Blocker Report — Waiting / Blocked only
// ---------------------------------------------------------------------------

export function generateBlockerReport(
  logs: ReportLogRow[],
  filters: ReportFilters,
  todayISO: string
): string {
  const blockers = logs.filter(isWaitingOrBlocked);
  const header = `รายงานงานที่ติดปัญหา / รอดำเนินการ ช่วงวันที่ ${filters.from} – ${filters.to}`;

  if (blockers.length === 0) {
    return `${header}\n\nไม่มีงานที่ติดปัญหาหรือรอดำเนินการในช่วงเวลาที่เลือก`;
  }

  const entries = blockers.map((log, i) => {
    const age = daysBetween(log.work_date, todayISO);
    return [
      `${i + 1}. ${formatThaiDate(log.work_date)} | ${projectLabel(log)} | ${log.title}`,
      `   สถานะ: ${WORK_LOG_STATUS_LABEL_TH[log.status]}`,
      `   ติดขัด: ${log.blocker || "-"}`,
      `   ขั้นตอนถัดไป: ${log.next_action || "-"}`,
      `   ค้างมาแล้ว: ${age >= 0 ? age : 0} วัน`,
    ].join("\n");
  });

  return [header, "", entries.join("\n\n")].join("\n");
}

// ---------------------------------------------------------------------------
// dispatcher
// ---------------------------------------------------------------------------

export function generateReport(
  type: ReportType,
  logs: ReportLogRow[],
  filters: ReportFilters,
  todayISO: string
): string {
  if (logs.length === 0) return NO_DATA_MESSAGE;

  switch (type) {
    case "daily":
      return generateDailySummary(logs);
    case "weekly":
      return generateWeeklySummary(logs, filters);
    case "project":
      return generateProjectSummary(logs);
    case "boss":
      return generateBossSummary(logs, filters);
    case "detailed":
      return generateDetailedLog(logs);
    case "blocker":
      return generateBlockerReport(logs, filters, todayISO);
    default:
      return NO_DATA_MESSAGE;
  }
}
