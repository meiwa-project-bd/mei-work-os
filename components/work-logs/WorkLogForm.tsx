"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { Project, WorkLog } from "@/types/database";
import {
  createWorkLog,
  updateWorkLog,
  type WorkLogFormState,
} from "@/app/(app)/work-logs/actions";
import {
  QUICK_TEMPLATES,
  WORK_CATEGORIES,
  WORK_LOG_STATUS_LABEL_TH,
  WORK_LOG_STATUSES,
  type WorkCategory,
  type WorkLogStatus,
} from "@/lib/constants/enums";
import { inputClass, labelClass } from "@/components/ui/form";

const initialState: WorkLogFormState = {};

export type WorkLogFormValues = Partial<
  Pick<
    WorkLog,
    | "work_date"
    | "project_id"
    | "category"
    | "title"
    | "description"
    | "start_time"
    | "end_time"
    | "status"
    | "result"
    | "blocker"
    | "next_action"
    | "evidence_url"
    | "boss_visible"
    | "tags"
  >
>;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function toTimeInputValue(value: string | null | undefined) {
  return value ? value.slice(0, 5) : "";
}

function computeDurationLabel(start: string, end: string): string | null {
  if (!start || !end) return null;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return null;
  let minutes = eh * 60 + em - (sh * 60 + sm);
  if (minutes < 0) minutes += 24 * 60;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `ระยะเวลา: ${h} ชม. ${m} นาที`;
}

export function WorkLogForm({
  workLog,
  initialValues,
  projects,
  onDone,
}: {
  workLog?: WorkLog;
  initialValues?: WorkLogFormValues;
  projects: Pick<Project, "id" | "name">[];
  onDone: () => void;
}) {
  const source = workLog ?? initialValues;
  const action = workLog ? updateWorkLog.bind(null, workLog.id) : createWorkLog;
  const [state, formAction, pending] = useActionState(action, initialState);
  const wasPending = useRef(false);

  const [status, setStatus] = useState<WorkLogStatus>(source?.status ?? "Planned");
  const [category, setCategory] = useState<WorkCategory | "">(source?.category ?? "");
  const [title, setTitle] = useState(source?.title ?? "");
  const [startTime, setStartTime] = useState(toTimeInputValue(source?.start_time));
  const [endTime, setEndTime] = useState(toTimeInputValue(source?.end_time));

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      onDone();
    }
    wasPending.current = pending;
  }, [pending, state, onDone]);

  const isWaitingOrBlocked = status === "Waiting" || status === "Blocked";
  const durationLabel = computeDurationLabel(startTime, endTime);

  return (
    <form action={formAction} className="space-y-4">
      {!workLog && (
        <div>
          <p className={labelClass}>เทมเพลตด่วน</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TEMPLATES.map((template) => (
              <button
                key={template.label}
                type="button"
                onClick={() => {
                  setCategory(template.category);
                  setTitle(template.title);
                  setStatus(template.status);
                }}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
              >
                {template.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="work_date" className={labelClass}>
            วันที่ *
          </label>
          <input
            id="work_date"
            name="work_date"
            type="date"
            required
            defaultValue={source?.work_date ?? todayISO()}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="project_id" className={labelClass}>
            โปรเจกต์
          </label>
          <select
            id="project_id"
            name="project_id"
            defaultValue={source?.project_id ?? ""}
            className={inputClass}
          >
            <option value="">— ไม่ระบุโปรเจกต์ —</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className={labelClass}>
            หมวดหมู่ *
          </label>
          <select
            id="category"
            name="category"
            required
            value={category}
            onChange={(event) => setCategory(event.target.value as WorkCategory)}
            className={inputClass}
          >
            <option value="" disabled>
              เลือกหมวดหมู่
            </option>
            {WORK_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className={labelClass}>
            สถานะ
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            onChange={(event) => setStatus(event.target.value as WorkLogStatus)}
            className={inputClass}
          >
            {WORK_LOG_STATUSES.map((s) => (
              <option key={s} value={s}>
                {WORK_LOG_STATUS_LABEL_TH[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="title" className={labelClass}>
          หัวข้องาน *
        </label>
        <input
          id="title"
          name="title"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={inputClass}
          placeholder="เช่น ทดสอบ Normal Job Card staging"
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          รายละเอียด
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={source?.description ?? ""}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_time" className={labelClass}>
            เวลาเริ่ม
          </label>
          <input
            id="start_time"
            name="start_time"
            type="time"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="end_time" className={labelClass}>
            เวลาสิ้นสุด
          </label>
          <input
            id="end_time"
            name="end_time"
            type="time"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      {durationLabel && <p className="-mt-2 text-xs text-muted">{durationLabel}</p>}

      <div
        className={`space-y-3 rounded-lg p-3 ${
          isWaitingOrBlocked ? "border border-warning/30 bg-warning/5" : ""
        }`}
      >
        {isWaitingOrBlocked && (
          <p className="text-xs font-medium text-warning">
            สถานะนี้ควรระบุ &quot;ติดขัดเรื่องอะไร&quot; และ/หรือ &quot;ขั้นตอนถัดไป&quot;
            อย่างน้อย 1 อย่าง
          </p>
        )}
        <div>
          <label htmlFor="blocker" className={labelClass}>
            ติดขัดเรื่องอะไร (Blocker)
          </label>
          <textarea
            id="blocker"
            name="blocker"
            rows={2}
            defaultValue={source?.blocker ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="next_action" className={labelClass}>
            ขั้นตอนถัดไป (Next action)
          </label>
          <textarea
            id="next_action"
            name="next_action"
            rows={2}
            defaultValue={source?.next_action ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="result" className={labelClass}>
          ผลลัพธ์
        </label>
        <textarea
          id="result"
          name="result"
          rows={2}
          defaultValue={source?.result ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="evidence_url" className={labelClass}>
          ลิงก์หลักฐาน (Evidence URL)
        </label>
        <input
          id="evidence_url"
          name="evidence_url"
          type="url"
          defaultValue={source?.evidence_url ?? ""}
          className={inputClass}
          placeholder="https://..."
        />
      </div>

      <div>
        <label htmlFor="tags" className={labelClass}>
          แท็ก (คั่นด้วยจุลภาค)
        </label>
        <input
          id="tags"
          name="tags"
          defaultValue={source?.tags?.join(", ") ?? ""}
          className={inputClass}
          placeholder="เช่น staging, urgent"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          name="boss_visible"
          defaultChecked={source?.boss_visible ?? true}
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
        />
        แสดงในรายงานสำหรับหัวหน้า (Boss visible)
      </label>

      {state.error && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {pending ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>
    </form>
  );
}
