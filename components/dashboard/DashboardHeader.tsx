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
    <div className="relative mb-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#08265d] via-[#1558b7] to-[#6b5cff] p-7 shadow-2xl shadow-blue-200/60 sm:p-9">
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(90deg,#fff_1px,transparent_1px),linear-gradient(180deg,#fff_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#ff5aa5]/22 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-40 w-96 bg-gradient-to-t from-[#65e6d3]/18 to-transparent" />

      <div className="relative z-[1] grid gap-8 xl:grid-cols-[1fr_31rem] xl:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#65e6d3]">
            {dateLabel}
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
            สวัสดีตอนเช้า วันนี้เรามาเก็บ XP งานกัน
          </h1>
          <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-blue-50/88">
            จัดงาน เวลา และหลักฐานให้อยู่ในหน้าเดียว ให้เห็นความคืบหน้าแบบชัด ๆ โดยไม่ต้องจำเองทั้งหมด
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="/work-logs"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#ff3f97] to-[#7c5cff] px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-950/20 transition-transform hover:-translate-y-0.5"
            >
              <SparkIcon className="h-4 w-4" />
              เปิด Daily Mission
            </a>
            <a
              href="/tracker"
              className="inline-flex items-center rounded-lg border border-white/22 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition-colors hover:bg-white/16"
            >
              ดูหลักฐานงาน
            </a>
          </div>
        </div>

        <div className="hidden items-center justify-end gap-5 xl:flex">
          <MeiMascot message="ลุยทีละงานก็พอ เดี๋ยวฉันช่วยเก็บหลักฐานไว้ให้" />
          <div className="rounded-[22px] border border-white/16 bg-[#142f78]/78 p-5 text-white shadow-xl backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#65e6d3]">
              Work Level
            </p>
            <div className="mt-4 flex items-center gap-4">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-[conic-gradient(#65e6d3_68%,rgba(255,255,255,.18)_0)]">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-[#1f3b8d]">
                  <span className="text-2xl font-black">1</span>
                </div>
              </div>
              <div>
                <p className="text-lg font-black">Focus Starter</p>
                <p className="mt-1 text-xs text-blue-100/80">อีกนิดก็เป็นวันทำงานที่มีหลักฐานครบ</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
