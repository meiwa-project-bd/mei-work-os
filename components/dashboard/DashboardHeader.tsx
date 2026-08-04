import { SparkIcon } from "./icons";

export function DashboardHeader({ todayISO }: { todayISO: string }) {
  const dateLabel = new Date(`${todayISO}T00:00:00Z`).toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  });

  return (
    <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[#16305a] p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/60">
            {dateLabel}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
            MEI Work OS Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-primary-foreground/80">
            ภาพรวมงานวันนี้ งานที่รอ และสถานะโปรเจกต์
          </p>
        </div>
        <a
          href="/work-logs"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-white/90"
        >
          <SparkIcon className="h-4 w-4" />
          บันทึกงานใหม่
        </a>
      </div>
    </div>
  );
}
