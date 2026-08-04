"use client";

import { Drawer } from "@/components/ui/Drawer";
import { Badge } from "@/components/ui/Badge";
import { WORK_LOG_STATUS_BADGE, WORK_LOG_STATUS_LABEL_TH } from "@/lib/constants/enums";
import type { WorkLogRow } from "./WorkLogsBoard";

function formatDuration(minutes: number | null) {
  if (minutes == null) return "-";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h} ชม. ${m} นาที`;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{value}</p>
    </div>
  );
}

export function WorkLogDetailDrawer({
  log,
  onClose,
}: {
  log: WorkLogRow | null;
  onClose: () => void;
}) {
  return (
    <Drawer open={log !== null} onClose={onClose} title="รายละเอียดบันทึกงาน">
      {log && (
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <Badge className={WORK_LOG_STATUS_BADGE[log.status]}>
                {WORK_LOG_STATUS_LABEL_TH[log.status]}
              </Badge>
              <span className="text-xs text-muted">{log.work_date}</span>
            </div>
            <h3 className="mt-2 text-lg font-semibold text-foreground">{log.title}</h3>
            <p className="text-sm text-muted">
              {log.project?.name ?? "ไม่ระบุโปรเจกต์"} · {log.category}
            </p>
          </div>

          <DetailRow label="รายละเอียด" value={log.description} />

          <div className="grid grid-cols-2 gap-4">
            <DetailRow
              label="เวลา"
              value={
                log.start_time || log.end_time
                  ? `${log.start_time?.slice(0, 5) ?? "-"} - ${log.end_time?.slice(0, 5) ?? "-"}`
                  : null
              }
            />
            <DetailRow label="ระยะเวลา" value={formatDuration(log.duration_minutes)} />
          </div>

          <DetailRow label="ผลลัพธ์" value={log.result} />
          <DetailRow label="ติดขัดเรื่องอะไร (Blocker)" value={log.blocker} />
          <DetailRow label="ขั้นตอนถัดไป (Next action)" value={log.next_action} />

          {log.evidence_url && (
            <DetailRow
              label="หลักฐาน"
              value={
                <a
                  href={log.evidence_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {log.evidence_url}
                </a>
              }
            />
          )}

          {log.tags.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">แท็ก</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {log.tags.map((tag) => (
                  <Badge key={tag} className="bg-background text-foreground">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <DetailRow
            label="แสดงในรายงานสำหรับหัวหน้า"
            value={log.boss_visible ? "ใช่" : "ไม่แสดง"}
          />
        </div>
      )}
    </Drawer>
  );
}
