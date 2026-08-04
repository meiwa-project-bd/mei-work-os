"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { WORK_CATEGORIES, WORK_LOG_STATUSES } from "@/lib/constants/enums";

export interface WorkLogFormState {
  error?: string;
}

function parseTags(raw: FormDataEntryValue | null): string[] {
  return String(raw ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseWorkLogForm(formData: FormData) {
  const status = String(formData.get("status") ?? "Planned");
  const category = String(formData.get("category") ?? "");
  const projectId = String(formData.get("project_id") ?? "").trim();

  return {
    work_date: String(formData.get("work_date") ?? ""),
    project_id: projectId || null,
    category: WORK_CATEGORIES.includes(category as (typeof WORK_CATEGORIES)[number])
      ? category
      : "",
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    start_time: String(formData.get("start_time") ?? "").trim() || null,
    end_time: String(formData.get("end_time") ?? "").trim() || null,
    status: WORK_LOG_STATUSES.includes(status as (typeof WORK_LOG_STATUSES)[number])
      ? status
      : "Planned",
    result: String(formData.get("result") ?? "").trim() || null,
    blocker: String(formData.get("blocker") ?? "").trim() || null,
    next_action: String(formData.get("next_action") ?? "").trim() || null,
    evidence_url: String(formData.get("evidence_url") ?? "").trim() || null,
    boss_visible: formData.get("boss_visible") === "on",
    tags: parseTags(formData.get("tags")),
  };
}

function validateWorkLog(values: ReturnType<typeof parseWorkLogForm>): string | null {
  if (!values.work_date) return "กรุณาระบุวันที่";
  if (!values.category) return "กรุณาเลือกหมวดหมู่";
  if (!values.title) return "กรุณาระบุหัวข้องาน";
  if (
    (values.status === "Waiting" || values.status === "Blocked") &&
    !values.blocker &&
    !values.next_action
  ) {
    return 'เมื่อสถานะเป็น Waiting หรือ Blocked กรุณาระบุ "ติดขัดเรื่องอะไร" หรือ "ขั้นตอนถัดไป" อย่างน้อย 1 อย่าง';
  }
  return null;
}

export async function createWorkLog(
  _prevState: WorkLogFormState,
  formData: FormData
): Promise<WorkLogFormState> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase environment variables are not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบใหม่" };

  const values = parseWorkLogForm(formData);
  const validationError = validateWorkLog(values);
  if (validationError) return { error: validationError };

  const { error } = await supabase.from("work_logs").insert({ ...values, user_id: user.id });
  if (error) return { error: `บันทึกไม่สำเร็จ: ${error.message}` };

  revalidatePath("/work-logs");
  return {};
}

export async function updateWorkLog(
  id: string,
  _prevState: WorkLogFormState,
  formData: FormData
): Promise<WorkLogFormState> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase environment variables are not configured" };

  const values = parseWorkLogForm(formData);
  const validationError = validateWorkLog(values);
  if (validationError) return { error: validationError };

  const { error } = await supabase.from("work_logs").update(values).eq("id", id);
  if (error) return { error: `บันทึกไม่สำเร็จ: ${error.message}` };

  revalidatePath("/work-logs");
  return {};
}

export async function deleteWorkLog(id: string) {
  const supabase = await createClient();
  if (!supabase) return;

  await supabase.from("work_logs").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/work-logs");
}
