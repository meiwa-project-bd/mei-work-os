import type { ComponentType } from "react";
import { TONE_CLASSES, type Tone } from "./tone";

export function DashboardKpiCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "primary",
  standOut = false,
}: {
  label: string;
  value: string | number;
  helper?: string;
  icon: ComponentType<{ className?: string }>;
  tone?: Tone;
  standOut?: boolean;
}) {
  const toneClasses = TONE_CLASSES[tone];
  const gameTone = {
    primary: "mei-kpi-blue",
    accent: "mei-kpi-pink",
    success: "mei-kpi-mint",
    warning: "mei-kpi-amber",
  }[tone];

  return (
    <div
      className={`mei-card mei-card-hover mei-kpi-card ${gameTone} relative flex h-full min-h-34 flex-col overflow-hidden rounded-lg p-4 ${
        standOut ? "border-warning/50 ring-2 ring-warning/15" : ""
      }`}
    >
      <div className="absolute right-3 top-3 h-12 w-12 rounded-full border border-white/5 bg-white/[0.03]" />
      <div
        className={`relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 ${toneClasses.chip}`}
      >
        <Icon className={`h-5 w-5 ${toneClasses.icon}`} />
      </div>
      <p className="relative mt-3 text-2xl font-black tracking-tight text-foreground">{value}</p>
      <p className="mt-0.5 text-xs font-semibold text-muted">{label}</p>
      <p className="mt-1 min-h-4 text-[11px] leading-tight text-muted/80">{helper ?? ""}</p>
    </div>
  );
}
