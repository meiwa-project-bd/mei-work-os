import { DashboardKpiCard } from "@/components/dashboard/DashboardKpiCard";
import { AlertIcon, CheckCircleIcon, ChecklistIcon, ClockIcon } from "@/components/dashboard/icons";
import { createClient } from "@/lib/supabase/server";
import { getBangkokToday } from "@/lib/utils/date";
import { formatHoursDecimal } from "@/lib/utils/duration";
import { getTrackerPageData } from "@/features/tracker/queries";
import type { AiUsageEvent, EvidenceItem, WorkSession } from "@/types/database";

function formatDateTime(value: string | null): string {
  if (!value) return "-";

  return new Date(value).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  });
}

function formatSessionRange(session: WorkSession): string {
  return `${formatDateTime(session.started_at)} - ${
    session.ended_at ? formatDateTime(session.ended_at) : "กำลังทำอยู่"
  }`;
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: "กำลังทำ",
    paused: "พักอยู่",
    completed: "เสร็จแล้ว",
    cancelled: "ยกเลิก",
  };

  return labels[status] ?? status;
}

function SessionsTable({ sessions }: { sessions: WorkSession[] }) {
  if (sessions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-sky-50/60 p-6 text-center">
        <p className="text-sm font-bold text-foreground">ยังไม่มี session จาก local tracker</p>
        <p className="mt-1 text-xs text-muted">เปิด Windows tracker แล้วข้อมูลจะเข้ามาที่นี่เอง</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-slate-50 text-left text-xs text-muted">
          <tr>
            <th className="px-3 py-2 font-bold">งาน</th>
            <th className="px-3 py-2 font-bold">เครื่องมือ</th>
            <th className="px-3 py-2 font-bold">เวลา</th>
            <th className="px-3 py-2 font-bold">Active</th>
            <th className="px-3 py-2 font-bold">สถานะ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sessions.map((session) => (
            <tr key={session.id} className="transition-colors hover:bg-sky-50/60">
              <td className="max-w-[18rem] px-3 py-2">
                <p className="truncate font-bold text-foreground">{session.title}</p>
                <p className="truncate text-xs text-muted">
                  {session.window_title ?? session.repo_path ?? "-"}
                </p>
              </td>
              <td className="px-3 py-2 text-muted">{session.tool}</td>
              <td className="px-3 py-2 text-muted">{formatSessionRange(session)}</td>
              <td className="px-3 py-2 font-bold text-foreground">
                {formatHoursDecimal(session.active_minutes ?? session.duration_minutes ?? 0)}
              </td>
              <td className="px-3 py-2">
                <span className="rounded-lg bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                  {statusLabel(session.status)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EvidenceList({ items }: { items: EvidenceItem[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-sky-50/60 p-5 text-sm text-muted">
        ยังไม่มีหลักฐานที่บันทึกจาก tracker
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border border-border bg-white p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-foreground">{item.title}</p>
            <span className="rounded-lg bg-accent/10 px-2 py-1 text-xs font-semibold text-accent">
              {item.type}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">{formatDateTime(item.created_at)}</p>
          {item.url && (
            <a className="mt-2 block truncate text-xs font-bold text-primary" href={item.url}>
              {item.url}
            </a>
          )}
          {item.content && <p className="mt-2 line-clamp-2 text-sm text-muted">{item.content}</p>}
        </div>
      ))}
    </div>
  );
}

function AiEventsList({ events }: { events: AiUsageEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-sky-50/60 p-5 text-sm text-muted">
        ยังไม่มี AI usage หรือ limit event
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <div key={event.id} className="rounded-lg border border-border bg-white p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-foreground">
              {event.tool} / {event.provider}
            </p>
            <span className="rounded-lg bg-warning/10 px-2 py-1 text-xs font-semibold text-warning">
              {event.event_type}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            {event.model_name ?? "unknown model"} - {formatDateTime(event.captured_at)}
          </p>
          {event.remaining_text && <p className="mt-2 text-sm text-muted">{event.remaining_text}</p>}
          {event.reset_at && (
            <p className="mt-1 text-xs text-muted">Reset: {formatDateTime(event.reset_at)}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default async function TrackerPage() {
  const supabase = (await createClient())!;
  const todayISO = getBangkokToday();
  const data = await getTrackerPageData(supabase, todayISO);
  const focusGoalMinutes = 240;
  const activeMinutes = data.summary.activeMinutes;
  const progress = Math.min(100, Math.round((activeMinutes / focusGoalMinutes) * 100));

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[#0a1c38] p-6 shadow-sm sm:p-8">
        <div className="grid gap-7 lg:grid-cols-[1fr_18rem] lg:items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/60">
              Evidence Vault
            </p>
            <h1 className="mt-2 max-w-3xl text-2xl font-bold leading-tight tracking-tight text-primary-foreground sm:text-3xl">
              หลักฐานงานวันนี้ พร้อมให้ตรวจแล้ว
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-primary-foreground/80">
              Tracker เก็บเวลา เครื่องมือ และ session ให้เอง เหลือแค่เปิดไว้แล้วทำงานต่อได้เลย
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
              <span className="rounded-full bg-white/12 px-3 py-1.5 text-white">
                {data.activeSessions.length} session active
              </span>
              <span className="rounded-full bg-white/12 px-3 py-1.5 text-white">
                {formatHoursDecimal(activeMinutes)} active วันนี้
              </span>
              <span className="rounded-full bg-white/12 px-3 py-1.5 text-white">
                {data.summary.evidenceCount} หลักฐานวันนี้
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-white/15 bg-white/8 p-4 text-white">
            <p className="text-xs font-medium uppercase tracking-wide text-primary-foreground/60">
              Focus progress
            </p>
            <p className="mt-2 text-3xl font-bold">{progress}%</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
              <div className="h-2 rounded-full bg-accent" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-primary-foreground/70">
              คิดจากเป้าหมายโฟกัส 4 ชั่วโมงต่อวัน
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DashboardKpiCard
          label="เวลาที่ track วันนี้"
          value={formatHoursDecimal(data.summary.trackedMinutes)}
          icon={ClockIcon}
          tone="primary"
        />
        <DashboardKpiCard
          label="เวลาทำงานจริง"
          value={formatHoursDecimal(data.summary.activeMinutes)}
          icon={CheckCircleIcon}
          tone="success"
        />
        <DashboardKpiCard
          label="เวลา idle"
          value={formatHoursDecimal(data.summary.idleMinutes)}
          icon={AlertIcon}
          tone="warning"
        />
        <DashboardKpiCard
          label="หลักฐานวันนี้"
          value={data.summary.evidenceCount}
          icon={ChecklistIcon}
          tone="accent"
        />
      </div>

      <section className="mei-card rounded-lg p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">Session ที่กำลังทำงาน</h2>
          <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            {data.activeSessions.length} active
          </span>
        </div>
        <SessionsTable sessions={data.activeSessions} />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="mei-card rounded-lg p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">Session ล่าสุด</h2>
            <span className="text-xs font-bold text-muted">{data.todaySessions.length} วันนี้</span>
          </div>
          <SessionsTable sessions={data.recentSessions} />
        </section>

        <section className="mei-card rounded-lg p-4 sm:p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">เวลาตามเครื่องมือ</h2>
          <div className="space-y-2">
            {data.summary.topTools.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-sky-50/60 p-5 text-sm text-muted">
                ยังไม่มีข้อมูลเครื่องมือวันนี้
              </p>
            ) : (
              data.summary.topTools.map((item) => {
                const width = Math.max(8, Math.min(100, (item.minutes / Math.max(1, activeMinutes)) * 100));
                return (
                  <div key={item.tool} className="rounded-lg border border-border bg-white p-3">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-bold text-foreground">{item.tool}</span>
                      <span className="text-muted">{formatHoursDecimal(item.minutes)}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-accent" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="mei-card rounded-lg p-4 sm:p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">หลักฐานล่าสุด</h2>
          <EvidenceList items={data.recentEvidence} />
        </section>

        <section className="mei-card rounded-lg p-4 sm:p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">AI usage / limit events</h2>
          <AiEventsList events={data.recentAiEvents} />
        </section>
      </div>
    </div>
  );
}
