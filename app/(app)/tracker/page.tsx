import { DashboardKpiCard } from "@/components/dashboard/DashboardKpiCard";
import { AlertIcon, CheckCircleIcon, ChecklistIcon, ClockIcon } from "@/components/dashboard/icons";
import { PageHeader } from "@/components/ui/PageHeader";
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
  return `${formatDateTime(session.started_at)} - ${session.ended_at ? formatDateTime(session.ended_at) : "now"}`;
}

function SessionsTable({ sessions }: { sessions: WorkSession[] }) {
  if (sessions.length === 0) {
    return <p className="text-sm text-muted">ยังไม่มี session จาก local tracker</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-background text-left text-xs uppercase text-muted">
          <tr>
            <th className="px-3 py-2 font-medium">งาน</th>
            <th className="px-3 py-2 font-medium">เครื่องมือ</th>
            <th className="px-3 py-2 font-medium">เวลา</th>
            <th className="px-3 py-2 font-medium">Active</th>
            <th className="px-3 py-2 font-medium">สถานะ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {sessions.map((session) => (
            <tr key={session.id}>
              <td className="max-w-[18rem] px-3 py-2">
                <p className="truncate font-medium text-foreground">{session.title}</p>
                <p className="truncate text-xs text-muted">{session.window_title ?? session.repo_path ?? "-"}</p>
              </td>
              <td className="px-3 py-2 text-muted">{session.tool}</td>
              <td className="px-3 py-2 text-muted">{formatSessionRange(session)}</td>
              <td className="px-3 py-2 text-muted">
                {formatHoursDecimal(session.active_minutes ?? session.duration_minutes ?? 0)}
              </td>
              <td className="px-3 py-2">
                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  {session.status}
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
    return <p className="text-sm text-muted">ยังไม่มีหลักฐานที่บันทึกจาก tracker</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-border bg-background p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">{item.title}</p>
            <span className="rounded-full bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
              {item.type}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">{formatDateTime(item.created_at)}</p>
          {item.url && (
            <a className="mt-2 block truncate text-xs font-medium text-primary" href={item.url}>
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
    return <p className="text-sm text-muted">ยังไม่มี AI usage หรือ limit event</p>;
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <div key={event.id} className="rounded-xl border border-border bg-background p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">
              {event.tool} / {event.provider}
            </p>
            <span className="rounded-full bg-warning/10 px-2 py-1 text-xs font-medium text-warning">
              {event.event_type}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            {event.model_name ?? "unknown model"} · {formatDateTime(event.captured_at)}
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="หลักฐานงาน"
        description="เวลาใช้งานจริงจาก local tracker, session, evidence, และ AI limit event"
      />

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

      <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">Session ที่กำลังทำงาน</h2>
          <span className="text-xs text-muted">{data.activeSessions.length} active</span>
        </div>
        <SessionsTable sessions={data.activeSessions} />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">Session ล่าสุด</h2>
            <span className="text-xs text-muted">{data.todaySessions.length} วันนี้</span>
          </div>
          <SessionsTable sessions={data.recentSessions} />
        </section>

        <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">เวลาตามเครื่องมือ</h2>
          <div className="space-y-2">
            {data.summary.topTools.length === 0 ? (
              <p className="text-sm text-muted">ยังไม่มีข้อมูลเครื่องมือวันนี้</p>
            ) : (
              data.summary.topTools.map((item) => (
                <div key={item.tool} className="rounded-xl border border-border bg-background p-3">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-foreground">{item.tool}</span>
                    <span className="text-muted">{formatHoursDecimal(item.minutes)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">หลักฐานล่าสุด</h2>
          <EvidenceList items={data.recentEvidence} />
        </section>

        <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">AI usage / limit events</h2>
          <AiEventsList events={data.recentAiEvents} />
        </section>
      </div>
    </div>
  );
}
