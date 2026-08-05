import Image from "next/image";
import { BoltIcon, ChestIcon, CoinIcon, GearIcon, GemIcon, MailIcon } from "./icons";

export function DashboardTopHud({
  todayISO,
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
      <div className="mei-hud-profile">
        <div className="mei-hud-avatar">
          <Image src="/mei-npc-chibi-v2.png" alt="MEI" width={88} height={132} priority />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-black text-white">MEI</h1>
            <span className="mei-level-chip">Lv. 12</span>
          </div>
          <p className="truncate text-[11px] font-semibold text-[#b9c4ef]">{dateLabel}</p>
          <div className="mei-hud-xp">
            <span><i /></span>
            <b>2,450 / 3,000 XP</b>
          </div>
        </div>
      </div>

      <div className="mei-hud-resources">
        <HudPill icon={CoinIcon} label="860" tone="gold" />
        <HudPill icon={GemIcon} label="35" tone="blue" />
        <HudPill icon={BoltIcon} label="5/5" sub="เต็มแล้ว" tone="amber" />
        <HudIconButton href="/tracker" label={`หลักฐาน ${evidenceCount} ชิ้น`} icon={ChestIcon} tone="gold" />
        <HudIconButton href="/work-logs" label="บันทึกงาน" icon={MailIcon} tone="cream" />
        <HudIconButton href="/settings" label="ตั้งค่า" icon={GearIcon} tone="cream" />
      </div>
    </header>
  );
}

function HudPill({
  icon: Icon,
  label,
  sub,
  tone,
}: {
  icon: typeof CoinIcon;
  label: string;
  sub?: string;
  tone: "gold" | "blue" | "amber";
}) {
  return (
    <span className={`mei-hud-pill hud-${tone}`}>
      <Icon className="h-5 w-5" />
      <strong>{label}</strong>
      {sub && <small>{sub}</small>}
      <i aria-hidden="true">+</i>
    </span>
  );
}

function HudIconButton({
  href,
  label,
  icon: Icon,
  tone,
}: {
  href: string;
  label: string;
  icon: typeof ChestIcon;
  tone: "gold" | "cream";
}) {
  return (
    <a href={href} className={`mei-hud-icon-button hud-icon-${tone}`} aria-label={label} title={label}>
      <Icon className="h-7 w-7" />
    </a>
  );
}
