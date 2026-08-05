import { formatHoursDecimal } from "@/lib/utils/duration";

export function DashboardTopHud({
  todayISO,
  trackedMinutes,
  evidenceCount,
}: {
  todayISO: string;
  trackedMinutes: number;
  evidenceCount: number;
}) {
  const dateLabel = new Date(`${todayISO}T00:00:00Z`).toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Bangkok",
  });

  return (
    <header className="mei-top-hud rounded-lg">
      <div className="flex min-w-0 items-center gap-3">
        <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-[#f472d0]/70 bg-[#17113e]">
          <img
            src="/mei-npc-character.png"
            alt="MEI"
            className="h-full w-full object-cover object-[50%_11%] scale-[2.25]"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-black text-white">MEI</h1>
            <span className="rounded-full border border-[#facc15]/40 bg-[#facc15]/10 px-2 py-0.5 text-xs font-black text-[#fde68a]">
              Lv. 12
            </span>
          </div>
          <p className="truncate text-xs font-semibold text-[#b9c4ef]">{dateLabel}</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 w-28 overflow-hidden rounded-full bg-white/12">
              <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-[#d946ef] to-[#7dd3fc]" />
            </div>
            <span className="text-[11px] font-bold text-[#dbe7ff]">2,450 / 3,000 XP</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <HudPill label="860" sub="coins" tone="gold" />
        <HudPill label="35" sub="gems" tone="blue" />
        <HudPill label="5/5" sub="energy" tone="amber" />
        <HudPill label={String(evidenceCount)} sub="proofs" tone="pink" />
        <HudPill label={formatHoursDecimal(trackedMinutes)} sub="today" tone="blue" />
        <a href="/work-logs" className="mei-hud-action">
          บันทึกงาน
        </a>
      </div>
    </header>
  );
}

function HudPill({
  label,
  sub,
  tone,
}: {
  label: string;
  sub: string;
  tone: "gold" | "blue" | "amber" | "pink";
}) {
  const toneClass = {
    gold: "border-[#facc15]/35 bg-[#facc15]/10 text-[#fde68a]",
    blue: "border-[#7dd3fc]/35 bg-[#7dd3fc]/10 text-[#e0f7ff]",
    amber: "border-[#f59e0b]/35 bg-[#f59e0b]/10 text-[#fed7aa]",
    pink: "border-[#f472d0]/35 bg-[#f472d0]/10 text-[#fbcfe8]",
  }[tone];

  return (
    <span className={`inline-flex h-11 items-center gap-2 rounded-full border px-3 ${toneClass}`}>
      <span className="text-base font-black leading-none">{label}</span>
      <span className="text-[10px] font-bold uppercase opacity-80">{sub}</span>
    </span>
  );
}
