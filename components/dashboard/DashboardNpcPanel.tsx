import Image from "next/image";
import { formatHoursDecimal } from "@/lib/utils/duration";

export function DashboardNpcPanel({
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

  return (
    <aside className="mei-npc-panel rounded-lg">
      <div className="absolute left-5 right-5 top-5 z-10">
        <div className="mei-speech-bubble rounded-lg px-4 py-3">
          <p className="text-sm font-bold leading-6">
            สวัสดีค่ะ! วันนี้พร้อมลุยงานให้สำเร็จไปด้วยกันนะคะ
          </p>
          <p className="mt-1 text-xs font-semibold text-[#8b4d8c]">
            มีอะไรให้ช่วย แจ้ง MEI ได้เลย
          </p>
        </div>
      </div>

      <div className="mei-npc-portrait">
        <div className="mei-npc-aura" aria-hidden="true" />
        <span className="mei-npc-spark npc-spark-one" aria-hidden="true">+</span>
        <span className="mei-npc-spark npc-spark-two" aria-hidden="true">+</span>
        <div className="mei-npc-idle">
          <Image
            src="/mei-npc-character.png"
            alt="MEI NPC ผู้ช่วยงาน"
            width={1024}
            height={1536}
            priority
          />
        </div>
      </div>

      <div className="mei-npc-stats">
        <div className="rounded-lg border border-[#f472d0]/45 bg-[#12133f]/88 p-4 shadow-[0_12px_28px_rgba(4,9,30,0.28)] backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xl font-black text-white">MEI</p>
              <p className="text-xs font-semibold text-[#f9a8d4]">Lv. 12</p>
            </div>
            <span className="rounded-full bg-[#f472d0]/14 px-3 py-1 text-xs font-bold text-[#fbcfe8]">
              {progressPct}% XP
            </span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full border border-white/10 bg-[#050b20]/78">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#d946ef] via-[#f9a8d4] to-[#7dd3fc]"
              style={{ width: `${Math.max(6, progressPct)}%` }}
            />
          </div>
          <p className="mt-3 text-xs font-semibold text-[#dbe7ff]">
            อีกนิดเดียวก็ถึงเป้าหมายแล้ว สู้ ๆ นะคะ
          </p>
        </div>

        <div className="rounded-lg border border-[#c397ff]/28 bg-[#0b1436]/86 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-white">ภารกิจรายวัน</p>
            <p className="text-xs font-bold text-[#b9c4ef]">{todayTasks} งาน</p>
          </div>
          <div className="mt-3 space-y-2 text-sm font-semibold text-[#e5ecff]">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
              <span>Track งานวันนี้</span>
              <span className="text-[#5eead4]">{formatHoursDecimal(trackedMinutes)}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
              <span>แนบหลักฐาน</span>
              <span className="text-[#facc15]">{evidenceCount} ชิ้น</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>รางวัลเมื่อทำครบ</span>
              <span className="text-[#f9a8d4]">+50 XP</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
