import type { ComponentType, ReactNode } from "react";
import { TONE_CLASSES, type Tone } from "./tone";

export function SectionCard({
  icon: Icon,
  title,
  tone = "primary",
  action,
  standOut = false,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  tone?: Tone;
  action?: ReactNode;
  /** Elevated visual treatment for sections that need to catch the eye (e.g. Waiting/Blocked). */
  standOut?: boolean;
  children: ReactNode;
}) {
  const toneClasses = TONE_CLASSES[tone];

  return (
    <section
      className={`rounded-2xl border bg-surface p-4 shadow-sm sm:p-5 ${
        standOut ? "border-warning/30 ring-1 ring-warning/10" : "border-border"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${toneClasses.chip}`}
          >
            <Icon className={`h-4 w-4 ${toneClasses.icon}`} />
          </span>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
