import {
  QUICK_TEMPLATES,
  WORK_CATEGORIES,
  WORK_LOG_STATUSES,
  WORK_LOG_STATUS_LABEL_TH,
  type WorkCategory,
  type WorkLogStatus,
} from "@/lib/constants/enums";

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
  /** Only populated when parsed from the "full" export format; the Lite format
   *  always defaults these at commit time (status Done, no blocker/next/result). */
  status?: WorkLogStatus;
  blocker?: string | null;
  next_action?: string | null;
  result?: string | null;
  warnings: string[];
  errors: string[];
  isDuplicate: boolean;
}

export interface ParsedImportResult {
  headerError?: string;
  rows: ParsedRow[];
  skippedEmptyRows: number;
}

// "Lite" format: the original 4-column Excel export (วันที่ / โครงการ / รายละเอียด / เวลา).
const LITE_HEADERS = ["วันที่", "โครงการ", "รายละเอียด", "เวลา"] as const;

// "Full" format: matches MEI Work OS's own Work Log form fields — produced when
// exporting real data, or when reformatting notes to match the app's own labels.
type RichField =
  | "work_date"
  | "project"
  | "category"
  | "status"
  | "title"
  | "description"
  | "start_time"
  | "end_time"
  | "blocker"
  | "next_action"
  | "result";

const RICH_HEADER_MAP: Record<string, RichField> = {
  วันที่: "work_date",
  โครงการ: "project",
  โปรเจกต์: "project",
  หมวดหมู่: "category",
  สถานะ: "status",
  หัวข้องาน: "title",
  รายละเอียด: "description",
  เวลาเริ่ม: "start_time",
  เวลาสิ้นสุด: "end_time",
  "ติดขัดเรื่องอะไร (Blocker)": "blocker",
  Blocker: "blocker",
  "ขั้นตอนถัดไป (Next action)": "next_action",
  "Next action": "next_action",
  ผลลัพธ์: "result",
};

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

/** A single clock-time cell (e.g. "เวลาเริ่ม" / "เวลาสิ้นสุด"), as opposed to a
 *  combined range/duration cell. */
function parseClockCell(value: unknown): { time: string | null; warning: string | null } {
  if (isBlank(value)) return { time: null, warning: null };

  if (value instanceof Date) {
    return { time: `${pad2(value.getUTCHours())}:${pad2(value.getUTCMinutes())}`, warning: null };
  }

  const text = String(value).trim();
  const m = text.match(/^(\d{1,2})[:.](\d{2})$/);
  if (m) return { time: `${pad2(Number(m[1]))}:${m[2]}`, warning: null };

  return { time: null, warning: "ไม่สามารถแปลงเวลาได้" };
}

function computeDurationMinutes(start: string | null, end: string | null): number | null {
  if (!start || !end) return null;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let minutes = eh * 60 + em - (sh * 60 + sm);
  if (minutes < 0) minutes += 24 * 60;
  return minutes;
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

// Quick-template labels (e.g. "แก้ระบบ") sometimes get exported as the
// "หมวดหมู่" cell verbatim. Resolve those to their real category first.
const TEMPLATE_LABEL_TO_CATEGORY: Record<string, WorkCategory> = Object.fromEntries(
  QUICK_TEMPLATES.map((t) => [t.label, t.category])
);

function resolveCategory(categoryRaw: unknown, title: string, description: string): WorkCategory {
  if (!isBlank(categoryRaw)) {
    const text = String(categoryRaw).trim();
    if (WORK_CATEGORIES.includes(text as WorkCategory)) return text as WorkCategory;
    if (TEMPLATE_LABEL_TO_CATEGORY[text]) return TEMPLATE_LABEL_TO_CATEGORY[text];
    return detectCategory(`${text} ${title} ${description}`);
  }
  return detectCategory(`${title} ${description}`);
}

// Reverse of WORK_LOG_STATUS_LABEL_TH, so a "สถานะ" cell using our own Thai
// display labels (e.g. "เสร็จแล้ว") maps back to the stored English value.
// Common natural-language variants are layered on top so a near-miss wording
// (e.g. "ติดขัด" instead of our exact label "ติดปัญหา") doesn't silently get
// lost as "Done" — that would erase real blocker information.
const STATUS_LABEL_TO_ENUM: Record<string, WorkLogStatus> = {
  ...Object.fromEntries(WORK_LOG_STATUSES.map((s) => [WORK_LOG_STATUS_LABEL_TH[s], s])),
  ติดขัด: "Blocked",
  เสร็จ: "Done",
  กำลังทำ: "In Progress",
  รอ: "Waiting",
  ยกเลิกแล้ว: "Cancelled",
};

function resolveStatus(raw: unknown): { status: WorkLogStatus; warning: string | null } {
  if (isBlank(raw)) return { status: "Done", warning: null };
  const text = String(raw).trim();
  if (WORK_LOG_STATUSES.includes(text as WorkLogStatus)) {
    return { status: text as WorkLogStatus, warning: null };
  }
  const mapped = STATUS_LABEL_TO_ENUM[text];
  if (mapped) return { status: mapped, warning: null };
  return { status: "Done", warning: `ไม่รู้จักสถานะ "${text}" ใช้ค่าเริ่มต้น "เสร็จแล้ว" แทน` };
}

function generateTitle(description: string, workDate: string | null): string {
  const trimmed = description.trim();
  if (!trimmed) return `บันทึกงานวันที่ ${workDate ?? ""}`.trim();
  return trimmed.length <= 80 ? trimmed : `${trimmed.slice(0, 80).trim()}…`;
}

function findLiteHeaderIndexes(headerRow: unknown[]): Record<string, number> | null {
  const normalized = headerRow.map((cell) => String(cell ?? "").trim());
  const indexes: Partial<Record<(typeof LITE_HEADERS)[number], number>> = {};
  for (const header of LITE_HEADERS) {
    const idx = normalized.indexOf(header);
    if (idx === -1) return null;
    indexes[header] = idx;
  }
  return indexes as Record<string, number>;
}

function parseLiteRows(headerRow: unknown[], dataRows: unknown[][]): ParsedImportResult {
  const indexes = findLiteHeaderIndexes(headerRow)!;

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

function parseRichRows(headerRow: unknown[], dataRows: unknown[][]): ParsedImportResult {
  const normalized = headerRow.map((cell) => String(cell ?? "").trim());
  const colIndex: Partial<Record<RichField, number>> = {};
  normalized.forEach((header, i) => {
    const field = RICH_HEADER_MAP[header];
    if (field && colIndex[field] === undefined) colIndex[field] = i;
  });

  const cellFor = (cells: unknown[], field: RichField): unknown => {
    const idx = colIndex[field];
    return idx === undefined ? undefined : cells[idx];
  };

  const rows: ParsedRow[] = [];
  let skippedEmptyRows = 0;

  dataRows.forEach((cells, i) => {
    const rowNumber = i + 2;

    const dateRaw = cellFor(cells, "work_date");
    const projectRaw = cellFor(cells, "project");
    const categoryRaw = cellFor(cells, "category");
    const statusRaw = cellFor(cells, "status");
    const titleRaw = cellFor(cells, "title");
    const descRaw = cellFor(cells, "description");
    const startRaw = cellFor(cells, "start_time");
    const endRaw = cellFor(cells, "end_time");
    const blockerRaw = cellFor(cells, "blocker");
    const nextActionRaw = cellFor(cells, "next_action");
    const resultRaw = cellFor(cells, "result");

    if ([dateRaw, projectRaw, titleRaw, descRaw].every(isBlank)) {
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
    const titleFromCell = isBlank(titleRaw) ? "" : String(titleRaw).trim();
    if (!titleFromCell && !description) errors.push("ไม่มีหัวข้องานหรือรายละเอียด");
    const title = titleFromCell || generateTitle(description ?? "", work_date);

    const startResult = parseClockCell(startRaw);
    const endResult = parseClockCell(endRaw);
    if (startResult.warning) warnings.push(`เวลาเริ่ม: ${startResult.warning}`);
    if (endResult.warning) warnings.push(`เวลาสิ้นสุด: ${endResult.warning}`);

    const category = resolveCategory(categoryRaw, title, description ?? "");
    const { status, warning: statusWarning } = resolveStatus(statusRaw);
    if (statusWarning) warnings.push(statusWarning);

    rows.push({
      rowNumber,
      raw: {
        date: dateRaw == null ? "" : String(dateRaw),
        project: projectRaw == null ? "" : String(projectRaw),
        description: descRaw == null ? "" : String(descRaw),
        time: "",
      },
      work_date,
      project_name,
      title,
      description,
      start_time: startResult.time,
      end_time: endResult.time,
      duration_minutes: computeDurationMinutes(startResult.time, endResult.time),
      category,
      status,
      blocker: isBlank(blockerRaw) ? null : String(blockerRaw).trim(),
      next_action: isBlank(nextActionRaw) ? null : String(nextActionRaw).trim(),
      result: isBlank(resultRaw) ? null : String(resultRaw).trim(),
      warnings,
      errors,
      isDuplicate: false,
    });
  });

  return { rows, skippedEmptyRows };
}

export function parseWorkLogRows(sheetRows: unknown[][]): ParsedImportResult {
  if (sheetRows.length === 0) {
    return { headerError: "ไฟล์นี้ไม่มีข้อมูล", rows: [], skippedEmptyRows: 0 };
  }

  const [headerRow, ...dataRows] = sheetRows;
  const normalized = headerRow.map((cell) => String(cell ?? "").trim());

  if (LITE_HEADERS.every((h) => normalized.includes(h))) {
    return parseLiteRows(headerRow, dataRows);
  }

  // "Full" format: needs at minimum a date column plus something to title the
  // row from (either an explicit title column or a description column).
  const hasDate = normalized.includes("วันที่");
  const hasTitleOrDescription = normalized.includes("หัวข้องาน") || normalized.includes("รายละเอียด");
  if (hasDate && hasTitleOrDescription) {
    return parseRichRows(headerRow, dataRows);
  }

  return {
    headerError:
      'ไม่พบคอลัมน์ที่ต้องการ กรุณาใช้หัวตาราง "วันที่, โครงการ, รายละเอียด, เวลา" หรือไฟล์ export แบบเต็มที่มีอย่างน้อย "วันที่" และ "หัวข้องาน"/"รายละเอียด"',
    rows: [],
    skippedEmptyRows: 0,
  };
}
