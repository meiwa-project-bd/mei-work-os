import { SparkIcon } from "./icons";
import { formatHoursDecimal } from "@/lib/utils/duration";

export function DashboardHeader({
  todayISO,
  trackedMinutes,
  evidenceCount,
  todayTasks,
}: {
  todayISO: string;
  trackedMinutes: number;
  evidenceCount: number;
  todayTasks: number;
}) {
  const dateLabel = new Date(`${todayISO}T00:00:00Z`).toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  });
  const targetMinutes = 240;
  const progressPct = Math.min(100, Math.round((trackedMinutes / targetMinutes) * 100));
  const remainingMinutes = Math.max(0, targetMinutes - trackedMinutes);

  return (
    <section className="mei-game-hero overflow-hidden rounded-lg p-4 sm:p-5 lg:p-6">
      <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#c397ff]/24 bg-[#071222]/62 px-3 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-[#f472d0]/70 bg-[#17113e]">
                <img
                  src="/mei-npc-character.png"
                  alt="MEI NPC"
                  className="h-full w-full object-cover object-[50%_12%] scale-[2.2]"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <h1 className="truncate text-xl font-black text-white sm:text-2xl">MEI</h1>
                  <span className="rounded-full border border-[#facc15]/35 bg-[#facc15]/10 px-2 py-0.5 text-xs font-bold text-[#fde68a]">
                    Lv. 12
                  </span>
                </div>
                <p className="truncate text-xs font-medium text-[#b9c4ef]">{dateLabel}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-xs font-bold text-white">
              <span className="rounded-full border border-[#facc15]/35 bg-[#facc15]/12 px-3 py-1.5">
                860 coins
              </span>
              <span className="rounded-full border border-[#7dd3fc]/35 bg-[#7dd3fc]/12 px-3 py-1.5">
                {evidenceCount} proofs
              </span>
              <span className="rounded-full border border-[#f59e0b]/35 bg-[#f59e0b]/12 px-3 py-1.5">
                5/5 energy
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-[#f472d0]/30 bg-[#111b44]/78 p-4 sm:p-5">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
              <div>
                <p className="text-xs font-bold uppercase text-[#facc15]">ภารกิจหลักวันนี้</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                  โฟกัสงานให้ครบ 4 ชม.
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#dbe7ff]">
                  MEI จะช่วยเฝ้าดูเวลา งานที่ค้าง และหลักฐาน เพื่อให้วันนี้ปิดงานได้แบบเห็นผล
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-lg border border-[#7dd3fc]/35 bg-[#7dd3fc]/12 px-4 py-2 text-lg font-black text-[#e0f7ff]">
                  {progressPct}%
                </span>
                <a
                  href="/work-logs"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#d946ef] via-[#f472d0] to-[#f59e0b] px-5 py-3 text-sm font-black text-white shadow-[0_0_28px_rgba(244,114,208,0.35)] transition hover:brightness-110"
                >
                  <SparkIcon className="h-4 w-4" />
                  ดูรางวัล
                </a>
              </div>
            </div>

            <div className="mt-5">
              <div className="h-3 overflow-hidden rounded-full border border-white/10 bg-[#050b20]/78">
                <div
                  className="mei-shimmer h-full rounded-full bg-gradient-to-r from-[#d946ef] via-[#f9a8d4] to-[#7dd3fc]"
                  style={{ width: `${Math.max(6, progressPct)}%` }}
                />
              </div>
              <div className="mt-3 grid gap-2 text-xs font-semibold text-[#b9c4ef] sm:grid-cols-3">
                <span>{formatHoursDecimal(trackedMinutes)} tracked</span>
                <span>{todayTasks} งานวันนี้</span>
                <span>
                  {remainingMinutes > 0
                    ? `เหลือ ${formatHoursDecimal(remainingMinutes)}`
                    : "ภารกิจครบแล้ว"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-[#7dd3fc]/24 bg-white/[0.06] p-3">
              <p className="text-xs font-bold text-[#b9c4ef]">Track วันนี้</p>
              <p className="mt-1 text-2xl font-black text-white">{formatHoursDecimal(trackedMinutes)}</p>
            </div>
            <div className="rounded-lg border border-[#5eead4]/24 bg-white/[0.06] p-3">
              <p className="text-xs font-bold text-[#b9c4ef]">หลักฐาน</p>
              <p className="mt-1 text-2xl font-black text-white">{evidenceCount}</p>
            </div>
            <div className="rounded-lg border border-[#facc15]/24 bg-white/[0.06] p-3">
              <p className="text-xs font-bold text-[#b9c4ef]">โบนัสวันนี้</p>
              <p className="mt-1 text-2xl font-black text-[#fde68a]">+20% XP</p>
            </div>
          </div>
      </div>
    </section>
  );
}
