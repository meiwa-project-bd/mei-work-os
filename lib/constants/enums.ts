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

export const QUICK_TEMPLATES = [
  "คุยงาน / ประชุม",
  "แก้ระบบ",
  "ทดสอบกับ user",
  "ติดตั้งให้ user",
  "วาง flow / เขียน spec",
  "แก้ตาม feedback",
  "รอ permission / blocker",
  "Support user",
  "Research / หาข้อมูล",
] as const;

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/work-logs", label: "Work Logs" },
  { href: "/projects", label: "Projects" },
  { href: "/reports", label: "Reports" },
  { href: "/people", label: "People" },
  { href: "/settings", label: "Settings" },
] as const;
