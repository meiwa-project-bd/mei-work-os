import Image from "next/image";
import { SparkIcon } from "./icons";
import { formatHoursDecimal } from "@/lib/utils/duration";

export function DashboardHeader({
  trackedMinutes,
  evidenceCount,
  todayTasks,
}: {
  trackedMinutes: number;
  evidenceCount: number;
  todayTasks: number;
}) {
  const targetMinutes = 240;
  const progressPct = Math.min(100, Math.round((trackedMinutes / targetMinutes) * 100));
  const remainingMinutes = Math.max(0, targetMinutes - trackedMinutes);

  return (
    <section className="mei-mission-panel rounded-lg">
      <div className="mei-mission-copy">
        <p className="inline-flex items-center gap-2 text-xs font-black text-[#facc15]">
          <SparkIcon className="h-4 w-4" />
          ภารกิจหลัก
        </p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <h2 className="max-w-2xl text-xl font-black text-white sm:text-2xl">
            โฟกัสงานให้ครบ 4 ชม. วันนี้!
          </h2>
          <span className="text-xl font-black text-white">{progressPct}%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full border border-[#f472d0]/50 bg-[#050b20]/72">
          <div
            className="mei-shimmer h-full rounded-full bg-gradient-to-r from-[#d946ef] via-[#f9a8d4] to-[#7dd3fc]"
            style={{ width: `${Math.max(6, progressPct)}%` }}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-semibold text-[#dbe7ff]">
          <span>{formatHoursDecimal(trackedMinutes)} tracked</span>
          <span>{todayTasks} งานวันนี้</span>
          <span>{evidenceCount} หลักฐาน</span>
          <span>
            {remainingMinutes > 0
              ? `เหลือ ${formatHoursDecimal(remainingMinutes)}`
              : "ภารกิจครบแล้ว"}
          </span>
        </div>
      </div>

      <div className="mei-mission-assistant">
        <div className="mei-mission-bubble rounded-lg">ใกล้ถึงเป้าหมายแล้ววว!</div>
        <span className="mei-mission-star star-one" aria-hidden="true">+</span>
        <span className="mei-mission-star star-two" aria-hidden="true">+</span>
        <div className="mei-chibi-idle">
          <Image src="/mei-npc-chibi-v2.png" alt="MEI กำลังให้กำลังใจ" width={320} height={480} priority />
        </div>
        <a href="/work-logs" className="mei-reward-button">
          ดูรางวัล
        </a>
      </div>
    </section>
  );
}
