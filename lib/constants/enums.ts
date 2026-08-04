export const PROJECT_STATUSES = [
  "Active",
  "Waiting",
  "Completed",
  "Paused",
  "Cancelled",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;
export type ProjectPriority = (typeof PROJECT_PRIORITIES)[number];

export const WORK_LOG_STATUSES = [
  "Planned",
  "In Progress",
  "Done",
  "Waiting",
  "Blocked",
  "Cancelled",
] as const;
export type WorkLogStatus = (typeof WORK_LOG_STATUSES)[number];

export const WORK_CATEGORIES = [
  "Planning",
  "Design",
  "Coding",
  "Testing",
  "Deployment",
  "Support",
  "Meeting",
  "Documentation",
  "Research",
  "Admin",
] as const;
export type WorkCategory = (typeof WORK_CATEGORIES)[number];

export const ATTACHMENT_TYPES = [
  "screenshot",
  "github",
  "drive",
  "email",
  "line",
  "document",
  "other",
] as const;
export type AttachmentType = (typeof ATTACHMENT_TYPES)[number];

export const WORK_SESSION_STATUSES = ["active", "paused", "completed", "cancelled"] as const;
export type WorkSessionStatus = (typeof WORK_SESSION_STATUSES)[number];

export const WORK_SESSION_SOURCES = ["manual", "local_agent", "cli_wrapper"] as const;
export type WorkSessionSource = (typeof WORK_SESSION_SOURCES)[number];

export const EVIDENCE_TYPES = [
  "commit",
  "command",
  "build",
  "test",
  "screenshot",
  "file",
  "report",
  "limit_event",
  "note",
  "other",
] as const;
export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

export const AI_USAGE_PROVIDERS = ["OpenAI", "Anthropic", "Other"] as const;
export type AiUsageProvider = (typeof AI_USAGE_PROVIDERS)[number];

export const AI_USAGE_TOOLS = ["ChatGPT", "Codex", "Claude Code", "Other"] as const;
export type AiUsageTool = (typeof AI_USAGE_TOOLS)[number];

export const AI_USAGE_EVENT_TYPES = [
  "model_detected",
  "limit_warning",
  "limit_reached",
  "reset_time_detected",
  "usage_snapshot",
  "other",
] as const;
export type AiUsageEventType = (typeof AI_USAGE_EVENT_TYPES)[number];

export const AI_USAGE_SOURCES = ["cli_output", "manual", "api", "local_agent"] as const;
export type AiUsageSource = (typeof AI_USAGE_SOURCES)[number];

export const RELATIONSHIP_TYPES = [
  "waiting_for",
  "discussed_with",
  "assigned_by",
  "supported_user",
  "reviewer",
] as const;
export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

/** Tailwind class fragments for status badges, per the design spec. */
export const WORK_LOG_STATUS_BADGE: Record<WorkLogStatus, string> = {
  Done: "bg-success/10 text-success",
  "In Progress": "bg-primary/10 text-primary",
  Waiting: "bg-warning/10 text-warning",
  Blocked: "bg-danger/10 text-danger",
  Planned: "bg-accent/10 text-accent",
  Cancelled: "bg-muted/10 text-muted",
};

export const PROJECT_STATUS_BADGE: Record<ProjectStatus, string> = {
  Active: "bg-primary/10 text-primary",
  Waiting: "bg-warning/10 text-warning",
  Completed: "bg-success/10 text-success",
  Paused: "bg-muted/10 text-muted",
  Cancelled: "bg-danger/10 text-danger",
};

export const PRIORITY_BADGE: Record<ProjectPriority, string> = {
  Low: "bg-muted/10 text-muted",
  Medium: "bg-primary/10 text-primary",
  High: "bg-warning/10 text-warning",
  Critical: "bg-danger/10 text-danger",
};

/** Thai display labels for status/priority. The English values above remain the
 *  stored DB/enum values and query-filter values — these are for display only. */
export const WORK_LOG_STATUS_LABEL_TH: Record<WorkLogStatus, string> = {
  Planned: "วางแผนไว้",
  "In Progress": "กำลังดำเนินการ",
  Done: "เสร็จแล้ว",
  Waiting: "รอผู้เกี่ยวข้อง",
  Blocked: "ติดปัญหา",
  Cancelled: "ยกเลิก",
};

export const PROJECT_STATUS_LABEL_TH: Record<ProjectStatus, string> = {
  Active: "กำลังดำเนินการ",
  Waiting: "รอผู้เกี่ยวข้อง",
  Completed: "เสร็จแล้ว",
  Paused: "พักไว้",
  Cancelled: "ยกเลิก",
};

export const PRIORITY_LABEL_TH: Record<ProjectPriority, string> = {
  Low: "ต่ำ",
  Medium: "ปานกลาง",
  High: "สูง",
  Critical: "เร่งด่วนมาก",
};

export interface QuickTemplate {
  label: string;
  category: WorkCategory;
  title: string;
  status: WorkLogStatus;
}

export const QUICK_TEMPLATES: QuickTemplate[] = [
  { label: "คุยงาน / ประชุม", category: "Meeting", title: "คุยงาน / ประชุม", status: "Done" },
  { label: "แก้ระบบ", category: "Coding", title: "แก้ระบบ", status: "In Progress" },
  { label: "ทดสอบกับ user", category: "Testing", title: "ทดสอบกับ user", status: "In Progress" },
  { label: "ติดตั้งให้ user", category: "Deployment", title: "ติดตั้งให้ user", status: "Done" },
  { label: "วาง flow / เขียน spec", category: "Planning", title: "วาง flow / เขียน spec", status: "In Progress" },
  { label: "แก้ตาม feedback", category: "Support", title: "แก้ตาม feedback", status: "In Progress" },
  { label: "รอ permission / blocker", category: "Admin", title: "รอ permission / blocker", status: "Waiting" },
  { label: "Support user", category: "Support", title: "Support user", status: "In Progress" },
  { label: "Research / หาข้อมูล", category: "Research", title: "Research / หาข้อมูล", status: "In Progress" },
];

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/work-logs", label: "Work Logs" },
  { href: "/projects", label: "Projects" },
  { href: "/reports", label: "Reports" },
  { href: "/tracker", label: "หลักฐานงาน" },
  { href: "/people", label: "People" },
  { href: "/settings", label: "Settings" },
] as const;
