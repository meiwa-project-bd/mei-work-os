"use client";

import { useActionState, useEffect, useRef } from "react";
import type { Project } from "@/types/database";
import { createProject, updateProject, type ProjectFormState } from "@/app/(app)/projects/actions";
import {
  PRIORITY_LABEL_TH,
  PROJECT_PRIORITIES,
  PROJECT_STATUS_LABEL_TH,
  PROJECT_STATUSES,
} from "@/lib/constants/enums";
import { inputClass, labelClass } from "@/components/ui/form";

const initialState: ProjectFormState = {};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function ProjectForm({
  project,
  onDone,
}: {
  project?: Project;
  onDone: () => void;
}) {
  const action = project ? updateProject.bind(null, project.id) : createProject;
  const [state, formAction, pending] = useActionState(action, initialState);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      onDone();
    }
    wasPending.current = pending;
  }, [pending, state, onDone]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className={labelClass}>
          ชื่อโปรเจกต์ *
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={project?.name ?? ""}
          className={inputClass}
          placeholder="เช่น WORKSHOP-OPTIMA"
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
          defaultValue={project?.description ?? ""}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className={labelClass}>
            สถานะ
          </label>
          <select
            id="status"
            name="status"
            defaultValue={project?.status ?? "Active"}
            className={inputClass}
          >
            {PROJECT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {PROJECT_STATUS_LABEL_TH[status]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="priority" className={labelClass}>
            ความสำคัญ
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue={project?.priority ?? "Medium"}
            className={inputClass}
          >
            {PROJECT_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABEL_TH[priority]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="owner" className={labelClass}>
          ผู้รับผิดชอบ
        </label>
        <input
          id="owner"
          name="owner"
          defaultValue={project?.owner ?? ""}
          className={inputClass}
          placeholder="เช่น Me"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_date" className={labelClass}>
            วันที่เริ่มต้น *
          </label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            required
            defaultValue={project?.start_date ?? todayISO()}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="target_date" className={labelClass}>
            วันที่เป้าหมาย
          </label>
          <input
            id="target_date"
            name="target_date"
            type="date"
            defaultValue={project?.target_date ?? ""}
            className={inputClass}
          />
        </div>
      </div>

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
