/** Throws (for the nearest app/(app)/error.tsx boundary to catch) when a Supabase
 *  query fails, instead of silently treating a failed request as "no data". */
export function assertNoQueryError(error: { message: string } | null, context: string): void {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}
