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

  return (
    <div
      className={`mei-card mei-card-hover flex h-full flex-col rounded-lg p-4 ${
        standOut ? "border-warning/40 bg-warning/[0.05]" : ""
      }`}
    >
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${toneClasses.chip}`}>
        <Icon className={`h-5 w-5 ${toneClasses.icon}`} />
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="mt-0.5 text-xs font-semibold text-muted">{label}</p>
      <p className="mt-1 min-h-4 text-[11px] leading-tight text-muted/80">{helper ?? ""}</p>
    </div>
  );
}
