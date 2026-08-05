import type { ComponentType } from "react";
import type { BarItem } from "@/features/dashboard/stats";
import { SectionCard } from "./SectionCard";
import { EmptyPanel } from "./EmptyPanel";
import { TONE_CLASSES, type Tone } from "./tone";

export function BarList({
  title,
  icon,
  tone = "primary",
  items,
  formatValue,
  showPercentage = false,
  emptyLabel,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  tone?: Tone;
  items: BarItem[];
  formatValue?: (value: number) => string;
  showPercentage?: boolean;
  emptyLabel: string;
}) {
  const max = Math.max(1, ...items.map((item) => item.value));
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const barClass = TONE_CLASSES[tone].bar;

  return (
    <SectionCard icon={icon} title={title} tone={tone}>
      {items.length === 0 ? (
        <EmptyPanel title={emptyLabel} />
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div key={item.label}>
                <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
                  <span className="truncate font-semibold text-foreground">{item.label}</span>
                  <span className="shrink-0 text-muted">
                    {formatValue ? formatValue(item.value) : item.value}
                    {showPercentage && total > 0 ? ` - ${pct}%` : ""}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#050b20]/70">
                  <div
                    className={`h-2 rounded-full shadow-[0_0_14px_currentColor] ${barClass}`}
                    style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
