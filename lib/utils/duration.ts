/** Compact decimal-hours label for KPI cards, e.g. "6.5 ชม." */
export function formatHoursDecimal(totalMinutes: number): string {
  return `${(totalMinutes / 60).toFixed(1)} ชม.`;
}

/** "H ชม. M นาที" label for list/detail rows. */
export function formatDurationLabel(minutes: number | null): string {
  if (minutes == null) return "-";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} นาที`;
  if (m === 0) return `${h} ชม.`;
  return `${h} ชม. ${m} นาที`;
}
