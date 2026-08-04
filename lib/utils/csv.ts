import type { ReportLogRow } from "@/features/reports/queries";

function csvCell(value: string | number | null | undefined): string {
  const text = value == null ? "" : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

const CSV_HEADERS = [
  "Date",
  "Project",
  "Category",
  "Title",
  "Description",
  "Start time",
  "End time",
  "Duration (min)",
  "Status",
  "Result",
  "Blocker",
  "Next action",
  "Evidence URL",
  "Boss visible",
  "Tags",
];

export function logsToCsv(logs: ReportLogRow[]): string {
  const rows = logs.map((log) =>
    [
      log.work_date,
      log.project?.name ?? "",
      log.category,
      log.title,
      log.description ?? "",
      log.start_time?.slice(0, 5) ?? "",
      log.end_time?.slice(0, 5) ?? "",
      log.duration_minutes ?? "",
      log.status,
      log.result ?? "",
      log.blocker ?? "",
      log.next_action ?? "",
      log.evidence_url ?? "",
      log.boss_visible ? "true" : "false",
      log.tags.join("; "),
    ]
      .map(csvCell)
      .join(",")
  );

  return [CSV_HEADERS.join(","), ...rows].join("\r\n");
}
