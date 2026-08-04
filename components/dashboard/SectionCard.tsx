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
  standOut?: boolean;
  children: ReactNode;
}) {
  const toneClasses = TONE_CLASSES[tone];

  return (
    <section
      className={`mei-card rounded-lg p-4 sm:p-5 ${
        standOut ? "border-warning/40 ring-2 ring-warning/10" : ""
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${toneClasses.chip}`}>
            <Icon className={`h-4 w-4 ${toneClasses.icon}`} />
          </span>
          <h3 className="truncate text-sm font-bold text-foreground">{title}</h3>
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
