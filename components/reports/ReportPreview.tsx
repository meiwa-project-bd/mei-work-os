"use client";

import { useState } from "react";

function downloadText(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4 w-4">
      <rect x="8.25" y="8.25" width="12" height="12" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M15.75 8.25V5.25a1.5 1.5 0 0 0-1.5-1.5h-9a1.5 1.5 0 0 0-1.5 1.5v9a1.5 1.5 0 0 0 1.5 1.5h3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4 w-4">
      <path
        d="M12 3.5v11M12 14.5l-3.75-3.75M12 14.5l3.75-3.75M4.5 16v3a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ReportPreview({
  text,
  csv,
  reportTypeLabel,
  filterSummary,
  filenameBase,
  highlight = false,
}: {
  text: string;
  csv: string;
  reportTypeLabel: string;
  filterSummary: string;
  filenameBase: string;
  /** Extra emphasis for the report that matters most to a boss/manager (Boss Summary). */
  highlight?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className={`rounded-2xl border bg-surface p-4 shadow-sm sm:p-5 ${
        highlight ? "border-primary/30 ring-1 ring-primary/10" : "border-border"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">{reportTypeLabel}</h2>
            {highlight && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                สำหรับหัวหน้า
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted">{filterSummary}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 rounded-lg bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90 ${
              highlight ? "px-5 py-2.5 text-sm" : "px-4 py-2 text-sm"
            }`}
          >
            <CopyIcon />
            {copied ? "คัดลอกแล้ว ✓" : "คัดลอกรายงาน"}
          </button>
          <button
            type="button"
            onClick={() => downloadText(`${filenameBase}.txt`, text, "text/plain")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
          >
            <DownloadIcon />
            .txt
          </button>
          <button
            type="button"
            onClick={() => downloadText(`${filenameBase}.csv`, csv, "text/csv")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
          >
            <DownloadIcon />
            CSV
          </button>
        </div>
      </div>

      <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-xl bg-background p-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{text}</p>
      </div>
    </div>
  );
}
