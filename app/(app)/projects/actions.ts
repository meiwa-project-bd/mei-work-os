"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PROJECT_PRIORITIES, PROJECT_STATUSES } from "@/lib/constants/enums";

export interface ProjectFormState {
  error?: string;
}

function parseProjectForm(formData: FormData) {
  const status = String(formData.get("status") ?? "Active");
  const priority = String(formData.get("priority") ?? "Medium");

  return {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    status: PROJECT_STATUSES.includes(status as (typeof PROJECT_STATUSES)[number])
      ? status
      : "Active",
    priority: PROJECT_PRIORITIES.includes(priority as (typeof PROJECT_PRIORITIES)[number])
      ? priority
      : "Medium",
    owner: String(formData.get("owner") ?? "").trim() || null,
    start_date: String(formData.get("start_date") ?? ""),
    target_date: String(formData.get("target_date") ?? "").trim() || null,
  };
}

function validateProject(values: ReturnType<typeof parseProjectForm>): string | null {
  if (!values.name) return "กรุณาระบุชื่อโปรเจกต์";
  if (!values.start_date) return "กรุณาระบุวันที่เริ่มต้น";
  return null;
}

function toFriendlyError(error: { code?: string; message: string }): string {
  if (error.code === "23505") {
    return "มีโปรเจกต์ชื่อนี้อยู่แล้ว กรุณาใช้ชื่ออื่น";
  }
  return `บันทึกไม่สำเร็จ: ${error.message}`;
}

export async function createProject(
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase environment variables are not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบใหม่" };

  const values = parseProjectForm(formData);
  const validationError = validateProject(values);
  if (validationError) return { error: validationError };

  const { error } = await supabase.from("projects").insert({ ...values, user_id: user.id });
  if (error) return { error: toFriendlyError(error) };

  revalidatePath("/projects");
  return {};
}

export async function updateProject(
  id: string,
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase environment variables are not configured" };

  const values = parseProjectForm(formData);
  const validationError = validateProject(values);
  if (validationError) return { error: validationError };

  const { error } = await supabase.from("projects").update(values).eq("id", id);
  if (error) return { error: toFriendlyError(error) };

  revalidatePath("/projects");
  return {};
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  if (!supabase) return;

  await supabase.from("projects").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/projects");
}
