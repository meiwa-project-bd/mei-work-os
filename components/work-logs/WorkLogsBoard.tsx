"use client";

import { useState, useTransition } from "react";
import type { Project, WorkLog } from "@/types/database";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { WorkLogForm, type WorkLogFormValues } from "./WorkLogForm";
import { WorkLogDetailDrawer } from "./WorkLogDetailDrawer";
import { deleteWorkLog } from "@/app/(app)/work-logs/actions";
import { WORK_LOG_STATUS_BADGE, WORK_LOG_STATUS_LABEL_TH } from "@/lib/constants/enums";

export type WorkLogRow = WorkLog & { project: { id: string; name: string } | null };

type ModalState =
  | { mode: "closed" }
  | { mode: "create"; initialValues?: WorkLogFormValues }
  | { mode: "edit"; log: WorkLogRow };

function formatDuration(minutes: number | null) {
  if (minutes == null) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} นาที`;
  if (m === 0) return `${h} ชม.`;
  return `${h} ชม. ${m} นาที`;
}

function duplicateValues(log: WorkLogRow): WorkLogFormValues {
  return {
    work_date: new Date().toISOString().slice(0, 10),
    project_id: log.project_id,
    category: log.category,
    title: log.title,
    description: log.description,
    status: "Planned",
    boss_visible: log.boss_visible,
    tags: log.tags,
  };
}

export function WorkLogsBoard({
  logs,
  projects,
}: {
  logs: WorkLogRow[];
  projects: Pick<Project, "id" | "name">[];
}) {
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [detailLog, setDetailLog] = useState<WorkLogRow | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(log: WorkLogRow) {
    if (!confirm(`ลบบันทึกงาน "${log.title}" ใช่หรือไม่?`)) return;
    startTransition(() => {
      deleteWorkLog(log.id);
    });
  }

  return (
    <div>
      <div className="mb-4 flex justify-end gap-2">
        <a
          href="/settings/import"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
        >
          นำเข้าจาก Excel
        </a>
        <button
          type="button"
          onClick={() => setModal({ mode: "create" })}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          + บันทึกงานใหม่
        </button>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          title="ยังไม่มีรายการบันทึกงาน"
          description='กด "+ บันทึกงานใหม่" หรือปรับตัวกรองด้านบน'
        />
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const duration = formatDuration(log.duration_minutes);
            const timeRange =
              log.start_time || log.end_time
                ? `${log.start_time?.slice(0, 5) ?? "-"}–${log.end_time?.slice(0, 5) ?? "-"}`
                : null;

            return (
              <div
                key={log.id}
                className="rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span>{log.work_date}</span>
                      {timeRange && <span>· {timeRange}</span>}
                      {duration && <span>· {duration}</span>}
                      <span>· {log.project?.name ?? "ไม่ระบุโปรเจกต์"}</span>
                      <span>· {log.category}</span>
                    </div>
                    <h3 className="mt-1 truncate text-base font-semibold text-foreground">
                      {log.title}
                    </h3>
                    {log.description && (
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted">{log.description}</p>
                    )}
                    {(log.status === "Waiting" || log.status === "Blocked") &&
                      log.next_action && (
                        <p className="mt-1 text-sm text-warning">
                          ขั้นตอนถัดไป: {log.next_action}
                        </p>
                      )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {log.evidence_url && (
                      <span title="มีหลักฐานแนบ" className="text-muted">
                        📎
                      </span>
                    )}
                    {!log.boss_visible && (
                      <span title="ไม่แสดงในรายงานสำหรับหัวหน้า" className="text-muted">
                        🔒
                      </span>
                    )}
                    <Badge className={WORK_LOG_STATUS_BADGE[log.status]}>
                      {WORK_LOG_STATUS_LABEL_TH[log.status]}
                    </Badge>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-3 border-t border-border pt-3 text-sm">
                  <button
                    type="button"
                    onClick={() => setDetailLog(log)}
                    className="font-medium text-foreground hover:underline"
                  >
                    ดูรายละเอียด
                  </button>
                  <button
                    type="button"
                    onClick={() => setModal({ mode: "edit", log })}
                    className="font-medium text-primary hover:underline"
                  >
                    แก้ไข
                  </button>
                  <button
                    type="button"
                    onClick={() => setModal({ mode: "create", initialValues: duplicateValues(log) })}
                    className="font-medium text-accent hover:underline"
                  >
                    ทำซ้ำ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(log)}
                    disabled={isPending}
                    className="font-medium text-danger hover:underline disabled:opacity-50"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modal.mode !== "closed"}
        onClose={() => setModal({ mode: "closed" })}
        title={modal.mode === "edit" ? "แก้ไขบันทึกงาน" : "บันทึกงานใหม่"}
      >
        {modal.mode !== "closed" && (
          <WorkLogForm
            key={modal.mode === "edit" ? modal.log.id : "new"}
            workLog={modal.mode === "edit" ? modal.log : undefined}
            initialValues={modal.mode === "create" ? modal.initialValues : undefined}
            projects={projects}
            onDone={() => setModal({ mode: "closed" })}
          />
        )}
      </Modal>

      <WorkLogDetailDrawer log={detailLog} onClose={() => setDetailLog(null)} />
    </div>
  );
}
