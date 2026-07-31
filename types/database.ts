import type {
  AttachmentType,
  ProjectPriority,
  ProjectStatus,
  RelationshipType,
  WorkCategory,
  WorkLogStatus,
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
