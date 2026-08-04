import { WORK_CATEGORIES, type WorkCategory } from "@/lib/constants/enums";

export interface ParsedRow {
  rowNumber: number;
  raw: { date: string; project: string; description: string; time: string };
  work_date: string | null;
  project_name: string | null;
  title: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  category: WorkCategory;
  warnings: string[];
  errors: string[];
  isDuplicate: boolean;
}

export interface ParsedImportResult {
  headerError?: string;
  rows: ParsedRow[];
  skippedEmptyRows: number;
}

const REQUIRED_HEADERS = ["วันที่", "โครงการ", "รายละเอียด", "เวลา"] as const;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

// Old Thai worksheets often use the Buddhist Era (BE = CE + 543).
function normalizeYear(year: number): number {
  return year > 2400 ? year - 543 : year;
}

function isBlank(value: unknown): boolean {
  return value === null || value === undefined || String(value).trim() === "";
}

function parseDateCell(value: unknown): string | null {
  if (value instanceof Date) {
    const y = normalizeYear(value.getUTCFullYear());
    const m = pad2(value.getUTCMonth() + 1);
    const d = pad2(value.getUTCDate());
    return `${y}-${m}-${d}`;
  }
  if (typeof value === "string") {
    const text = value.trim();
    let m = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (m) return `${normalizeYear(Number(m[1]))}-${pad2(Number(m[2]))}-${pad2(Number(m[3]))}`;
    m = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) return `${normalizeYear(Number(m[3]))}-${pad2(Number(m[2]))}-${pad2(Number(m[1]))}`;
    m = text.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (m) return `${normalizeYear(Number(m[3]))}-${pad2(Number(m[2]))}-${pad2(Number(m[1]))}`;
  }
  return null;
}

interface TimeParseResult {
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  warning: string | null;
}

function parseTimeCell(value: unknown): TimeParseResult {
  const empty: TimeParseResult = {
    start_time: null,
    end_time: null,
    duration_minutes: null,
    warning: null,
  };
  if (isBlank(value)) return empty;

  // A native Excel time-of-day cell comes through as a `Date` at the 1899-12-30 epoch.
  if (value instanceof Date) {
    const totalMinutes = value.getUTCHours() * 60 + value.getUTCMinutes();
    return { start_time: null, end_time: null, duration_minutes: totalMinutes, warning: null };
  }

  if (typeof value === "number") {
    // A bare number in an hours column, e.g. 2 -> 2h, 1.5 -> 1h30m.
    return {
      start_time: null,
      end_time: null,
      duration_minutes: Math.round(value * 60),
      warning: null,
    };
  }

  const text = String(value).trim();
  if (!text) return empty;

  const rangeMatch = text.match(
    /^(\d{1,2})[:.](\d{2})\s*[-–~]\s*(\d{1,2})[:.](\d{2})$/
  );
  if (rangeMatch) {
    const [, sh, sm, eh, em] = rangeMatch;
    const start = `${pad2(Number(sh))}:${sm}`;
    const end = `${pad2(Number(eh))}:${em}`;
    let minutes = Number(eh) * 60 + Number(em) - (Number(sh) * 60 + Number(sm));
    if (minutes < 0) minutes += 24 * 60;
    return { start_time: start, end_time: end, duration_minutes: minutes, warning: null };
  }

  const durationMatch = text.match(/^(\d{1,2})[:.](\d{2})$/);
  if (durationMatch) {
    const [, h, m] = durationMatch;
    return {
      start_time: null,
      end_time: null,
      duration_minutes: Number(h) * 60 + Number(m),
      warning: null,
    };
  }

  const numMatch = text.match(/^(\d+(?:\.\d+)?)\s*(ชม\.?|ชั่วโมง|hrs?|hours?|h)?$/i);
  if (numMatch) {
    return {
      start_time: null,
      end_time: null,
      duration_minutes: Math.round(Number(numMatch[1]) * 60),
      warning: null,
    };
  }

  return { start_time: null, end_time: null, duration_minutes: null, warning: "ไม่สามารถแปลงเวลาได้" };
}

const CATEGORY_RULES: { keywords: string[]; category: WorkCategory }[] = [
  { keywords: ["test", "ทดลอง", "ทดสอบ"], category: "Testing" },
  { keywords: ["deploy", "install", "ติดตั้ง"], category: "Deployment" },
  { keywords: ["ui", "design", "ออกแบบ", "mockup"], category: "Design" },
  { keywords: ["prompt", "เอกสาร", "sop", "คู่มือ"], category: "Documentation" },
  { keywords: ["คุย", "ประชุม", "อัปเดต", "sync"], category: "Meeting" },
  { keywords: ["code", "source code", "แก้โค้ด", "coding"], category: "Coding" },
  { keywords: ["support", "ช่วย user", "แก้ปัญหา"], category: "Support" },
  { keywords: ["flow", "spec", "วางแผน"], category: "Planning" },
  { keywords: ["research", "หาข้อมูล", "วิเคราะห์"], category: "Research" },
];

export function detectCategory(text: string): WorkCategory {
  const lower = text.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((keyword) => lower.includes(keyword.toLowerCase()))) {
      return rule.category;
    }
  }
  const fallback: WorkCategory = "Admin";
  return WORK_CATEGORIES.includes(fallback) ? fallback : WORK_CATEGORIES[0];
}

function generateTitle(description: string, workDate: string | null): string {
  const trimmed = description.trim();
  if (!trimmed) return `บันทึกงานวันที่ ${workDate ?? ""}`.trim();
  return trimmed.length <= 80 ? trimmed : `${trimmed.slice(0, 80).trim()}…`;
}

function findHeaderIndexes(headerRow: unknown[]): Record<string, number> | null {
  const normalized = headerRow.map((cell) => String(cell ?? "").trim());
  const indexes: Partial<Record<(typeof REQUIRED_HEADERS)[number], number>> = {};
  for (const header of REQUIRED_HEADERS) {
    const idx = normalized.indexOf(header);
    if (idx === -1) return null;
    indexes[header] = idx;
  }
  return indexes as Record<string, number>;
}

export function parseWorkLogRows(sheetRows: unknown[][]): ParsedImportResult {
  if (sheetRows.length === 0) {
    return { headerError: "ไฟล์นี้ไม่มีข้อมูล", rows: [], skippedEmptyRows: 0 };
  }

  const [headerRow, ...dataRows] = sheetRows;
  const indexes = findHeaderIndexes(headerRow);
  if (!indexes) {
    return {
      headerError:
        "ไม่พบคอลัมน์ที่ต้องการ (วันที่, โครงการ, รายละเอียด, เวลา) กรุณาตรวจสอบหัวตารางในไฟล์",
      rows: [],
      skippedEmptyRows: 0,
    };
  }

  const rows: ParsedRow[] = [];
  let skippedEmptyRows = 0;

  dataRows.forEach((cells, i) => {
    const rowNumber = i + 2; // header is row 1
    const dateRaw = cells[indexes["วันที่"]];
    const projectRaw = cells[indexes["โครงการ"]];
    const descRaw = cells[indexes["รายละเอียด"]];
    const timeRaw = cells[indexes["เวลา"]];

    if (isBlank(dateRaw) && isBlank(projectRaw) && isBlank(descRaw) && isBlank(timeRaw)) {
      skippedEmptyRows += 1;
      return;
    }

    const warnings: string[] = [];
    const errors: string[] = [];

    const work_date = parseDateCell(dateRaw);
    if (!work_date) errors.push("วันที่ไม่ถูกต้องหรือแปลงไม่ได้");

    const project_name = isBlank(projectRaw) ? null : String(projectRaw).trim();
    if (!project_name) warnings.push("ไม่ระบุโปรเจกต์");

    const description = isBlank(descRaw) ? null : String(descRaw).trim();
    if (!description) errors.push("ไม่มีรายละเอียด");

    const time = parseTimeCell(timeRaw);
    if (time.warning) warnings.push(time.warning);

    rows.push({
      rowNumber,
      raw: {
        date: dateRaw == null ? "" : String(dateRaw),
        project: projectRaw == null ? "" : String(projectRaw),
        description: descRaw == null ? "" : String(descRaw),
        time: timeRaw == null ? "" : String(timeRaw),
      },
      work_date,
      project_name,
      title: generateTitle(description ?? "", work_date),
      description,
      start_time: time.start_time,
      end_time: time.end_time,
      duration_minutes: time.duration_minutes,
      category: detectCategory(description ?? ""),
      warnings,
      errors,
      isDuplicate: false,
    });
  });

  return { rows, skippedEmptyRows };
}
