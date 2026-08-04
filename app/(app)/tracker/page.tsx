import { DashboardKpiCard } from "@/components/dashboard/DashboardKpiCard";
import { AlertIcon, CheckCircleIcon, ChecklistIcon, ClockIcon } from "@/components/dashboard/icons";
import { MeiMascot } from "@/components/ui/MeiMascot";
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
      <div className="rounded-lg border border-dashed border-pink-200 bg-pink-50/70 p-6 text-center">
        <p className="text-sm font-semibold text-foreground">ยังไม่มี session จาก local tracker</p>
        <p className="mt-1 text-xs text-muted">เปิด Windows tracker แล้วข้อมูลจะเข้ามาที่นี่เอง</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-pink-100 bg-white/80">
      <table className="min-w-full divide-y divide-pink-100 text-sm">
        <thead className="bg-pink-50/80 text-left text-xs text-muted">
          <tr>
            <th className="px-3 py-2 font-bold">งาน</th>
            <th className="px-3 py-2 font-bold">เครื่องมือ</th>
            <th className="px-3 py-2 font-bold">เวลา</th>
            <th className="px-3 py-2 font-bold">Active</th>
            <th className="px-3 py-2 font-bold">สถานะ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-pink-100">
          {sessions.map((session) => (
            <tr key={session.id} className="transition-colors hover:bg-pink-50/55">
              <td className="max-w-[18rem] px-3 py-2">
                <p className="truncate font-semibold text-foreground">{session.title}</p>
                <p className="truncate text-xs text-muted">
                  {session.window_title ?? session.repo_path ?? "-"}
                </p>
              </td>
              <td className="px-3 py-2 text-muted">{session.tool}</td>
              <td className="px-3 py-2 text-muted">{formatSessionRange(session)}</td>
              <td className="px-3 py-2 font-semibold text-foreground">
                {formatHoursDecimal(session.active_minutes ?? session.duration_minutes ?? 0)}
              </td>
              <td className="px-3 py-2">
                <span className="rounded-lg bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
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
      <p className="rounded-lg border border-dashed border-pink-200 bg-pink-50/70 p-5 text-sm text-muted">
        ยังไม่มีหลักฐานที่บันทึกจาก tracker
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border border-pink-100 bg-white/72 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            <span className="rounded-lg bg-accent/10 px-2 py-1 text-xs font-bold text-accent">
              {item.type}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">{formatDateTime(item.created_at)}</p>
          {item.url && (
            <a className="mt-2 block truncate text-xs font-semibold text-primary" href={item.url}>
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
      <p className="rounded-lg border border-dashed border-sky-200 bg-sky-50/70 p-5 text-sm text-muted">
        ยังไม่มี AI usage หรือ limit event
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <div key={event.id} className="rounded-lg border border-sky-100 bg-white/72 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">
              {event.tool} / {event.provider}
            </p>
            <span className="rounded-lg bg-warning/10 px-2 py-1 text-xs font-bold text-warning">
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
      <section className="mei-card mei-shine relative overflow-hidden rounded-lg p-5 sm:p-7">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-success" />
        <div className="relative z-[1] grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              หลักฐานงาน
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              วันนี้ระบบช่วยเก็บเวลาทำงานให้แล้ว
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              เปิด tracker ไว้ แล้วกลับมาดูภาพรวมว่าทำอะไรไปบ้าง ใช้เครื่องมือไหน และมีหลักฐานอะไรเกิดขึ้นระหว่างวัน
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-lg bg-pink-100 px-3 py-1.5 text-primary">
                {data.activeSessions.length} session กำลังทำงาน
              </span>
              <span className="rounded-lg bg-teal-100 px-3 py-1.5 text-success">
                {formatHoursDecimal(activeMinutes)} active วันนี้
              </span>
              <span className="rounded-lg bg-sky-100 px-3 py-1.5 text-accent">
                {data.summary.evidenceCount} หลักฐานวันนี้
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-pink-100 bg-pink-50/70 p-4">
            <div>
              <div
                className="grid h-28 w-28 place-items-center rounded-full"
                style={{
                  background: `conic-gradient(var(--primary) ${progress}%, rgba(243, 215, 229, 0.9) 0)`,
                }}
              >
                <div className="grid h-20 w-20 place-items-center rounded-full bg-white shadow-inner">
                  <div className="text-center">
                    <p className="text-2xl font-black text-foreground">{progress}%</p>
                    <p className="text-[10px] font-semibold text-muted">focus</p>
                  </div>
                </div>
              </div>
            </div>
            <MeiMascot compact message="ดีมาก เก็บหลักฐานงานไว้ให้แล้วนะ" />
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
          <h2 className="text-sm font-bold text-foreground">Session ที่กำลังทำงาน</h2>
          <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
            {data.activeSessions.length} active
          </span>
        </div>
        <SessionsTable sessions={data.activeSessions} />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="mei-card rounded-lg p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-foreground">Session ล่าสุด</h2>
            <span className="text-xs font-semibold text-muted">{data.todaySessions.length} วันนี้</span>
          </div>
          <SessionsTable sessions={data.recentSessions} />
        </section>

        <section className="mei-card rounded-lg p-4 sm:p-5">
          <h2 className="mb-4 text-sm font-bold text-foreground">เวลาตามเครื่องมือ</h2>
          <div className="space-y-2">
            {data.summary.topTools.length === 0 ? (
              <p className="rounded-lg border border-dashed border-pink-200 bg-pink-50/70 p-5 text-sm text-muted">
                ยังไม่มีข้อมูลเครื่องมือวันนี้
              </p>
            ) : (
              data.summary.topTools.map((item) => {
                const width = Math.max(8, Math.min(100, (item.minutes / Math.max(1, activeMinutes)) * 100));
                return (
                  <div key={item.tool} className="rounded-lg border border-pink-100 bg-white/72 p-3">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-foreground">{item.tool}</span>
                      <span className="text-muted">{formatHoursDecimal(item.minutes)}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-pink-50">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${width}%` }} />
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
          <h2 className="mb-4 text-sm font-bold text-foreground">หลักฐานล่าสุด</h2>
          <EvidenceList items={data.recentEvidence} />
        </section>

        <section className="mei-card rounded-lg p-4 sm:p-5">
          <h2 className="mb-4 text-sm font-bold text-foreground">AI usage / limit events</h2>
          <AiEventsList events={data.recentAiEvents} />
        </section>
      </div>
    </div>
  );
}
