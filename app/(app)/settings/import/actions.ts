"use server";

import { revalidatePath } from "next/cache";
import { readSheet } from "read-excel-file/node";
import { createClient } from "@/lib/supabase/server";
import { parseWorkLogRows, type ParsedRow } from "@/lib/import/excel";

export interface PreviewState {
  error?: string;
  fileName?: string;
  rows?: ParsedRow[];
  skippedEmptyRows?: number;
}

export async function previewImport(
  _prevState: PreviewState,
  formData: FormData
): Promise<PreviewState> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase environment variables are not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบใหม่" };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "กรุณาเลือกไฟล์ Excel (.xlsx)" };
  }

  let sheetRows: unknown[][];
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    sheetRows = await readSheet(buffer);
  } catch {
    return { error: "ไม่สามารถอ่านไฟล์นี้ได้ กรุณาตรวจสอบว่าเป็นไฟล์ .xlsx ที่ถูกต้อง" };
  }

  const { headerError, rows, skippedEmptyRows } = parseWorkLogRows(sheetRows);
  if (headerError) return { error: headerError };

  if (rows.length > 0) {
    const [{ data: existingProjects }, { data: existingLogs }] = await Promise.all([
      supabase.from("projects").select("id, name").eq("user_id", user.id).is("deleted_at", null),
      supabase
        .from("work_logs")
        .select("work_date, project_id, description, start_time")
        .eq("user_id", user.id)
        .is("deleted_at", null),
    ]);

    const projectIdByName = new Map<string, string>(
      (existingProjects ?? []).map((p) => [p.name as string, p.id as string])
    );

    const existingKeys = new Set(
      (existingLogs ?? []).map((log) =>
        [
          log.work_date as string,
          (log.project_id as string | null) ?? "",
          ((log.description as string | null) ?? "").trim(),
          (log.start_time as string | null) ?? "",
        ].join("|")
      )
    );

    for (const row of rows) {
      const projectId = row.project_name ? projectIdByName.get(row.project_name) ?? "" : "";
      const key = [row.work_date ?? "", projectId, (row.description ?? "").trim(), row.start_time ?? ""].join(
        "|"
      );
      row.isDuplicate = existingKeys.has(key);
    }
  }

  return { fileName: file.name, rows, skippedEmptyRows };
}

export interface CommitRowInput {
  rowNumber: number;
  work_date: string;
  project_name: string | null;
  title: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  category: string;
}

export interface CommitResult {
  error?: string;
  insertedCount: number;
  projectsCreated: number;
  failedRows: { rowNumber: number; reason: string }[];
}

export async function commitImport(rowsInput: CommitRowInput[]): Promise<CommitResult> {
  const supabase = await createClient();
  if (!supabase) {
    return {
      error: "Supabase environment variables are not configured",
      insertedCount: 0,
      projectsCreated: 0,
      failedRows: [],
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "กรุณาเข้าสู่ระบบใหม่", insertedCount: 0, projectsCreated: 0, failedRows: [] };
  }

  if (rowsInput.length === 0) {
    return { insertedCount: 0, projectsCreated: 0, failedRows: [] };
  }

  const { data: existingProjects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("user_id", user.id)
    .is("deleted_at", null);

  const projectIdByName = new Map<string, string>(
    (existingProjects ?? []).map((p) => [p.name as string, p.id as string])
  );

  const namesNeeded = Array.from(
    new Set(
      rowsInput
        .map((r) => r.project_name)
        .filter((name): name is string => name != null && name !== "" && !projectIdByName.has(name))
    )
  );

  let projectsCreated = 0;
  for (const name of namesNeeded) {
    const { data: inserted, error } = await supabase
      .from("projects")
      .insert({ user_id: user.id, name, status: "Active", priority: "Medium" })
      .select("id")
      .single();

    if (!error && inserted) {
      projectIdByName.set(name, inserted.id as string);
      projectsCreated += 1;
    } else if (error?.code === "23505") {
      // Name already exists (created earlier / concurrently) — reuse it.
      const { data: found } = await supabase
        .from("projects")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", name)
        .is("deleted_at", null)
        .single();
      if (found) projectIdByName.set(name, found.id as string);
    }
  }

  let insertedCount = 0;
  const failedRows: { rowNumber: number; reason: string }[] = [];

  for (const row of rowsInput) {
    const { error } = await supabase.from("work_logs").insert({
      user_id: user.id,
      work_date: row.work_date,
      project_id: row.project_name ? projectIdByName.get(row.project_name) ?? null : null,
      category: row.category,
      title: row.title,
      description: row.description,
      start_time: row.start_time,
      end_time: row.end_time,
      status: "Done",
      boss_visible: true,
      tags: [],
    });

    if (error) {
      failedRows.push({ rowNumber: row.rowNumber, reason: error.message });
    } else {
      insertedCount += 1;
    }
  }

  if (insertedCount > 0) {
    revalidatePath("/work-logs");
    revalidatePath("/projects");
  }

  return { insertedCount, projectsCreated, failedRows };
}
