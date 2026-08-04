"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateTrackerToken, hashTrackerToken } from "@/lib/tracker/tokens";

export interface CreateTrackerTokenState {
  error?: string;
  token?: string;
  name?: string;
}

export async function createTrackerToken(
  _prevState: CreateTrackerTokenState,
  formData: FormData
): Promise<CreateTrackerTokenState> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase environment variables are not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบใหม่" };

  const name = String(formData.get("name") ?? "").trim() || "Windows tracker";
  const token = generateTrackerToken();
  const tokenHash = hashTrackerToken(token);

  const { error } = await supabase.from("tracker_tokens").insert({
    user_id: user.id,
    name,
    token_hash: tokenHash,
  });

  if (error) {
    return { error: `สร้าง token ไม่สำเร็จ: ${error.message}` };
  }

  revalidatePath("/settings");
  return { token, name };
}

export async function revokeTrackerToken(id: string) {
  const supabase = await createClient();
  if (!supabase) return;

  await supabase
    .from("tracker_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .is("revoked_at", null);

  revalidatePath("/settings");
}
