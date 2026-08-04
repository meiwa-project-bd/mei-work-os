import type {
  AttachmentType,
  AiUsageEventType,
  AiUsageProvider,
  AiUsageSource,
  AiUsageTool,
  EvidenceType,
  ProjectPriority,
  ProjectStatus,
  RelationshipType,
  WorkCategory,
  WorkLogStatus,
  WorkSessionSource,
  WorkSessionStatus,
} from "@/lib/constants/enums";

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  owner: string | null;
  start_date: string;
  target_date: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface WorkLog {
  id: string;
  user_id: string;
  work_date: string;
  project_id: string | null;
  category: WorkCategory;
  title: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  status: WorkLogStatus;
  result: string | null;
  blocker: string | null;
  next_action: string | null;
  evidence_url: string | null;
  boss_visible: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Person {
  id: string;
  user_id: string;
  name: string;
  role: string | null;
  company_section: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface WorkLogPerson {
  id: string;
  work_log_id: string;
  person_id: string;
  relationship_type: RelationshipType | null;
}

export interface Attachment {
  id: string;
  user_id: string;
  work_log_id: string;
  type: AttachmentType;
  title: string;
  url: string;
  note: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface WorkSession {
  id: string;
  user_id: string;
  project_id: string | null;
  work_log_id: string | null;
  title: string;
  tool: string;
  app_name: string | null;
  window_title: string | null;
  repo_path: string | null;
  branch_name: string | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  idle_minutes: number;
  active_minutes: number | null;
  status: WorkSessionStatus;
  source: WorkSessionSource;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface EvidenceItem {
  id: string;
  user_id: string;
  work_session_id: string | null;
  work_log_id: string | null;
  type: EvidenceType;
  title: string;
  url: string | null;
  content: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AiUsageEvent {
  id: string;
  user_id: string;
  work_session_id: string | null;
  provider: AiUsageProvider;
  tool: AiUsageTool;
  model_name: string | null;
  event_type: AiUsageEventType;
  detected_text: string | null;
  reset_at: string | null;
  remaining_text: string | null;
  source: AiUsageSource;
  captured_at: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface TrackerToken {
  id: string;
  user_id: string;
  token_hash: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

export type TrackerTokenSummary = Omit<TrackerToken, "token_hash">;
