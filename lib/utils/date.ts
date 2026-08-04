const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000; // UTC+7, Thailand has no DST

/** "Now" shifted so its UTC getters read as Bangkok wall-clock time. */
function bangkokNow(): Date {
  return new Date(Date.now() + BANGKOK_OFFSET_MS);
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Today's date (YYYY-MM-DD) in the Asia/Bangkok timezone. */
export function getBangkokToday(): string {
  return toISODate(bangkokNow());
}

/** Monday–Sunday range (inclusive, YYYY-MM-DD) containing today in Asia/Bangkok. */
export function getBangkokWeekRange(): { start: string; end: string } {
  const now = bangkokNow();
  const day = now.getUTCDay(); // 0 = Sunday .. 6 = Saturday, in Bangkok terms
  const diffToMonday = day === 0 ? 6 : day - 1;

  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - diffToMonday);

  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  return { start: toISODate(monday), end: toISODate(sunday) };
}

/** Whole days between two YYYY-MM-DD dates (positive when `from` is in the past). */
export function daysBetween(fromISO: string, toISO: string): number {
  const from = new Date(`${fromISO}T00:00:00Z`).getTime();
  const to = new Date(`${toISO}T00:00:00Z`).getTime();
  return Math.round((to - from) / (24 * 60 * 60 * 1000));
}

/** "30 กรกฎาคม 2569" — Thai day/month/Buddhist-year, for report headings. */
export function formatThaiDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  });
}
