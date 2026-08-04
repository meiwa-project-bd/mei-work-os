"use client";

import { useActionState, useState, useTransition } from "react";
import {
  createTrackerToken,
  revokeTrackerToken,
  type CreateTrackerTokenState,
} from "@/app/(app)/settings/actions";
import type { TrackerTokenSummary } from "@/types/database";
import { inputClass, labelClass } from "@/components/ui/form";

const initialState: CreateTrackerTokenState = {};

function formatDateTime(value: string | null): string {
  if (!value) return "-";

  return new Date(value).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  });
}

export function TrackerTokenSettings({ tokens }: { tokens: TrackerTokenSummary[] }) {
  const [state, formAction, pending] = useActionState(createTrackerToken, initialState);
  const [copied, setCopied] = useState(false);
  const [isRevoking, startRevoke] = useTransition();

  async function copyToken() {
    if (!state.token) return;
    await navigator.clipboard.writeText(state.token);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function handleRevoke(token: TrackerTokenSummary) {
    if (!confirm(`ยกเลิก tracker token "${token.name}" ใช่หรือไม่?`)) return;
    startRevoke(() => {
      revokeTrackerToken(token.id);
    });
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Tracker Token สำหรับ Windows Agent</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            สร้าง token สำหรับให้ agent ส่งเวลาและหลักฐานงานเข้า MEI Work OS โดยไม่ต้องคัดลอก Supabase access token ที่หมดอายุเร็ว
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          metadata only
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-background p-4 text-sm text-muted">
        <p className="font-medium text-foreground">วิธีใช้แบบย่อ</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>สร้าง token ใหม่ แล้วคัดลอกทันที เพราะระบบจะแสดงเพียงครั้งเดียว</li>
          <li>ใส่ค่า token ใน `agent/windows-tracker/.env` ช่อง `TRACKER_TOKEN`</li>
          <li>ตั้งค่า `TRACKER_API_URL` เป็น URL ของเว็บ เช่น `http://localhost:3000/api/tracker/events`</li>
          <li>รัน `start-tracker.cmd` หรือ `node tracker.js` จากโฟลเดอร์ agent</li>
        </ol>
      </div>

      <form action={formAction} className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div>
          <label htmlFor="tracker-token-name" className={labelClass}>
            ชื่อ token
          </label>
          <input
            id="tracker-token-name"
            name="name"
            className={inputClass}
            defaultValue="Windows tracker"
            placeholder="เช่น Windows tracker เครื่องที่บ้าน"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 sm:w-auto"
          >
            {pending ? "กำลังสร้าง..." : "สร้าง token"}
          </button>
        </div>
      </form>

      {state.error && (
        <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>
      )}

      {state.token && (
        <div className="mt-4 rounded-xl border border-warning/30 bg-warning/[0.04] p-4">
          <p className="text-sm font-semibold text-foreground">
            Token ใหม่: {state.name ?? "Windows tracker"}
          </p>
          <p className="mt-1 text-xs text-muted">คัดลอกตอนนี้ ระบบจะไม่แสดง token นี้อีก</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <code className="min-w-0 flex-1 break-all rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground">
              {state.token}
            </code>
            <button
              type="button"
              onClick={copyToken}
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
            >
              {copied ? "คัดลอกแล้ว" : "คัดลอก"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-border">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-background text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">ชื่อ</th>
              <th className="px-3 py-2 font-medium">สร้างเมื่อ</th>
              <th className="px-3 py-2 font-medium">ใช้ล่าสุด</th>
              <th className="px-3 py-2 font-medium">สถานะ</th>
              <th className="px-3 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {tokens.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-sm text-muted">
                  ยังไม่มี tracker token
                </td>
              </tr>
            ) : (
              tokens.map((token) => {
                const revoked = Boolean(token.revoked_at);
                return (
                  <tr key={token.id}>
                    <td className="px-3 py-2 font-medium text-foreground">{token.name}</td>
                    <td className="px-3 py-2 text-muted">{formatDateTime(token.created_at)}</td>
                    <td className="px-3 py-2 text-muted">{formatDateTime(token.last_used_at)}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          revoked ? "bg-muted/10 text-muted" : "bg-success/10 text-success"
                        }`}
                      >
                        {revoked ? "ยกเลิกแล้ว" : "ใช้งานได้"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {!revoked && (
                        <button
                          type="button"
                          onClick={() => handleRevoke(token)}
                          disabled={isRevoking}
                          className="text-sm font-medium text-danger hover:underline disabled:opacity-50"
                        >
                          ยกเลิก
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
