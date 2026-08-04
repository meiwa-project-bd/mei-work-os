import { createHash, randomBytes } from "node:crypto";

export const TRACKER_TOKEN_PREFIX = "mei_tracker_";

export function generateTrackerToken(): string {
  return `${TRACKER_TOKEN_PREFIX}${randomBytes(32).toString("base64url")}`;
}

export function hashTrackerToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function isTrackerToken(token: string): boolean {
  return token.startsWith(TRACKER_TOKEN_PREFIX);
}
