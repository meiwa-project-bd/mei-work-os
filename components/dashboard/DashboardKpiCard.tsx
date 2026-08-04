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
  /** Elevated treatment for a KPI that needs attention (e.g. an open Waiting/Blocked count). */
  standOut?: boolean;
}) {
  const toneClasses = TONE_CLASSES[tone];

  return (
    <div
      className={`flex h-full flex-col rounded-2xl border p-4 shadow-sm transition-shadow hover:shadow-md ${
        standOut ? "border-warning/30 bg-warning/[0.03]" : "border-border bg-surface"
      }`}
    >
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${toneClasses.chip}`}>
        <Icon className={`h-5 w-5 ${toneClasses.icon}`} />
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-[11px] leading-tight text-muted/80">{helper ?? " "}</p>
    </div>
  );
}
