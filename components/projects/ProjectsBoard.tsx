"use client";

import { useState, useTransition } from "react";
import type { Project } from "@/types/database";
import type { ProjectOverviewRow } from "@/features/dashboard/stats";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProjectForm } from "./ProjectForm";
import { deleteProject } from "@/app/(app)/projects/actions";
import {
  PRIORITY_BADGE,
  PRIORITY_LABEL_TH,
  PROJECT_STATUS_BADGE,
  PROJECT_STATUS_LABEL_TH,
} from "@/lib/constants/enums";

type ModalState = { mode: "closed" } | { mode: "create" } | { mode: "edit"; project: Project };

function Stat({
  label,
  value,
  warn = false,
}: {
  label: string;
  value: React.ReactNode;
  warn?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-0.5 text-sm font-semibold ${warn ? "text-warning" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}

export function ProjectsBoard({ projects }: { projects: ProjectOverviewRow[] }) {
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [isPending, startTransition] = useTransition();

  function handleDelete(project: Project) {
    if (!confirm(`ลบโปรเจกต์ "${project.name}" ใช่หรือไม่?`)) return;
    startTransition(() => {
      deleteProject(project.id);
    });
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setModal({ mode: "create" })}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          + โปรเจกต์ใหม่
        </button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="ยังไม่มีโปรเจกต์"
          description='กด "+ โปรเจกต์ใหม่" เพื่อเริ่มต้นบันทึกโปรเจกต์แรกของคุณ'
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-2xl border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="truncate text-base font-semibold text-foreground">{project.name}</p>
              {project.description && (
                <p className="mt-0.5 line-clamp-2 text-xs text-muted">{project.description}</p>
              )}

              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge className={PROJECT_STATUS_BADGE[project.status]}>
                  {PROJECT_STATUS_LABEL_TH[project.status]}
                </Badge>
                <Badge className={PRIORITY_BADGE[project.priority]}>
                  {PRIORITY_LABEL_TH[project.priority]}
                </Badge>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3">
                <Stat label="ชั่วโมงรวม" value={project.totalHoursLabel} />
                <Stat label="งานทั้งหมด" value={project.totalLogs} />
                <Stat
                  label="รอ/ติดปัญหา"
                  value={project.waitingBlockedCount}
                  warn={project.waitingBlockedCount > 0}
                />
                <Stat label="ทำล่าสุด" value={project.lastActivityDate ?? "-"} />
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs text-muted">ผู้รับผิดชอบ: {project.owner || "-"}</span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModal({ mode: "edit", project })}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    แก้ไข
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(project)}
                    disabled={isPending}
                    className="text-sm font-medium text-danger hover:underline disabled:opacity-50"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modal.mode !== "closed"}
        onClose={() => setModal({ mode: "closed" })}
        title={modal.mode === "edit" ? "แก้ไขโปรเจกต์" : "โปรเจกต์ใหม่"}
      >
        {modal.mode !== "closed" && (
          <ProjectForm
            key={modal.mode === "edit" ? modal.project.id : "new"}
            project={modal.mode === "edit" ? modal.project : undefined}
            onDone={() => setModal({ mode: "closed" })}
          />
        )}
      </Modal>
    </div>
  );
}
