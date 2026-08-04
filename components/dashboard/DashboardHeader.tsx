import { MeiMascot } from "@/components/ui/MeiMascot";
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
    <div className="mei-shine relative mb-6 overflow-hidden rounded-lg border border-white/70 bg-gradient-to-br from-pink-500 via-rose-400 to-sky-400 p-6 shadow-xl shadow-pink-200/50 sm:p-8">
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/18 to-transparent" />
      <div className="relative z-[1] flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
            {dateLabel}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            วันนี้เราจะเก็บงานให้เป็นเรื่องน่ารักขึ้น
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/88">
            Dashboard นี้รวมงาน เวลา และหลักฐานไว้ให้เห็นภาพเดียว เปิดมาแล้วรู้ทันทีว่าวันนี้ไปถึงไหนแล้ว
          </p>
          <a
            href="/work-logs"
            className="mt-5 inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-primary shadow-sm transition-colors hover:bg-white/92"
          >
            <SparkIcon className="h-4 w-4" />
            บันทึกงานใหม่
          </a>
        </div>
        <div className="hidden xl:block">
          <MeiMascot message="เริ่มจากก้าวเล็ก ๆ แล้วให้ระบบช่วยจำแทนเธอเอง" />
        </div>
      </div>
    </div>
  );
}
