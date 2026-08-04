"use client";

import { useState, useTransition, type FormEvent } from "react";
import {
  previewImport,
  commitImport,
  type PreviewState,
  type CommitResult,
  type CommitRowInput,
} from "@/app/(app)/settings/import/actions";
import type { ParsedRow } from "@/lib/import/excel";
import { Badge } from "@/components/ui/Badge";

function defaultIncluded(rows: ParsedRow[]): Set<number> {
  return new Set(
    rows.filter((row) => row.errors.length === 0 && !row.isDuplicate).map((row) => row.rowNumber)
  );
}

function formatTime(row: ParsedRow): string {
  if (row.start_time || row.end_time) {
    return `${row.start_time ?? "-"}–${row.end_time ?? "-"}`;
  }
  if (row.duration_minutes != null) {
    const h = Math.floor(row.duration_minutes / 60);
    const m = row.duration_minutes % 60;
    return h > 0 ? `${h} ชม. ${m} นาที` : `${m} นาที`;
  }
  return "-";
}

export function ImportBoard() {
  const [previewState, setPreviewState] = useState<PreviewState>({});
  const [isPreviewing, startPreview] = useTransition();
  const [included, setIncluded] = useState<Set<number>>(new Set());
  const [committing, startCommit] = useTransition();
  const [result, setResult] = useState<CommitResult | null>(null);

  const rows = previewState.rows ?? [];

  function handlePreviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startPreview(async () => {
      const next = await previewImport({}, formData);
      // Initialize selection here, right after the action resolves — not
      // during render — so there is no derived-state comparison to get
      // wrong and no risk of a render-loop.
      setPreviewState(next);
      setIncluded(defaultIncluded(next.rows ?? []));
      setResult(null);
    });
  }

  function toggleRow(rowNumber: number) {
    setIncluded((prev) => {
      const next = new Set(prev);
      if (next.has(rowNumber)) next.delete(rowNumber);
      else next.add(rowNumber);
      return next;
    });
  }

  function handleImport() {
    const payload: CommitRowInput[] = rows
      .filter((row) => included.has(row.rowNumber) && row.errors.length === 0 && row.work_date)
      .map((row) => ({
        rowNumber: row.rowNumber,
        work_date: row.work_date as string,
        project_name: row.project_name,
        title: row.title,
        description: row.description,
        start_time: row.start_time,
        end_time: row.end_time,
        category: row.category,
      }));

    startCommit(async () => {
      const res = await commitImport(payload);
      setResult(res);
    });
  }

  const selectedCount = rows.filter((row) => included.has(row.rowNumber)).length;

  if (result) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-foreground">ผลการนำเข้า</h2>
          {result.error ? (
            <p className="mt-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{result.error}</p>
          ) : (
            <div className="mt-3 space-y-1 text-sm text-foreground">
              <p>
                นำเข้าสำเร็จ <span className="font-semibold text-success">{result.insertedCount}</span> รายการ
              </p>
              <p>
                สร้างโปรเจกต์ใหม่ <span className="font-semibold">{result.projectsCreated}</span> โปรเจกต์
              </p>
              {result.failedRows.length > 0 && (
                <div className="mt-3">
                  <p className="font-medium text-danger">
                    นำเข้าไม่สำเร็จ {result.failedRows.length} แถว:
                  </p>
                  <ul className="mt-1 list-inside list-disc text-muted">
                    {result.failedRows.map((f) => (
                      <li key={f.rowNumber}>
                        แถวที่ {f.rowNumber}: {f.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="/work-logs"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              ไปที่ Work Logs
            </a>
            <a
              href="/settings/import"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-background"
            >
              นำเข้าไฟล์ใหม่
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="space-y-4">
        <form
          onSubmit={handlePreviewSubmit}
          className="rounded-xl border border-dashed border-border bg-surface p-8 text-center"
        >
          <p className="text-sm font-medium text-foreground">อัปโหลดไฟล์ Excel (.xlsx)</p>
          <p className="mt-1 text-xs text-muted">
            ต้องมีคอลัมน์: วันที่, โครงการ, รายละเอียด, เวลา
          </p>
          <input
            type="file"
            name="file"
            accept=".xlsx"
            required
            className="mx-auto mt-4 block text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
          />
          {previewState.error && (
            <p className="mx-auto mt-4 max-w-md rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {previewState.error}
            </p>
          )}
          <button
            type="submit"
            disabled={isPreviewing}
            className="mt-5 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {isPreviewing ? "กำลังอ่านไฟล์..." : "แสดงตัวอย่าง"}
          </button>
        </form>
      </div>
    );
  }

  const errorCount = rows.filter((row) => row.errors.length > 0).length;
  const duplicateCount = rows.filter((row) => row.isDuplicate).length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-surface p-4 text-sm text-foreground">
        <p>
          ไฟล์ <span className="font-medium">{previewState.fileName}</span> — พบ{" "}
          <span className="font-medium">{rows.length}</span> แถว
          {previewState.skippedEmptyRows ? ` (ข้ามแถวว่าง ${previewState.skippedEmptyRows} แถว)` : ""}
        </p>
        <p className="mt-1 text-muted">
          {errorCount > 0 && <span className="text-danger">มีปัญหา {errorCount} แถว (นำเข้าไม่ได้)</span>}
          {errorCount > 0 && duplicateCount > 0 && " · "}
          {duplicateCount > 0 && <span className="text-warning">อาจซ้ำกับข้อมูลเดิม {duplicateCount} แถว</span>}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-border bg-background text-xs uppercase text-muted">
            <tr>
              <th className="px-3 py-3">
                <span className="sr-only">นำเข้า</span>
              </th>
              <th className="px-3 py-3">แถว</th>
              <th className="px-3 py-3">วันที่</th>
              <th className="px-3 py-3">โปรเจกต์</th>
              <th className="px-3 py-3">หัวข้อ / รายละเอียด</th>
              <th className="px-3 py-3">เวลา</th>
              <th className="px-3 py-3">หมวดหมู่</th>
              <th className="px-3 py-3">หมายเหตุ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => {
              const hasError = row.errors.length > 0;
              return (
                <tr key={row.rowNumber} className={hasError ? "bg-danger/5" : undefined}>
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={included.has(row.rowNumber)}
                      disabled={hasError}
                      onChange={() => toggleRow(row.rowNumber)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 disabled:opacity-40"
                    />
                  </td>
                  <td className="px-3 py-3 text-muted">{row.rowNumber}</td>
                  <td className="px-3 py-3">{row.work_date ?? "-"}</td>
                  <td className="px-3 py-3">{row.project_name ?? "ไม่ระบุ"}</td>
                  <td className="px-3 py-3 max-w-xs">
                    <p className="truncate font-medium text-foreground">{row.title}</p>
                    {row.description && (
                      <p className="truncate text-xs text-muted">{row.description}</p>
                    )}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">{formatTime(row)}</td>
                  <td className="px-3 py-3">
                    <Badge className="bg-background text-foreground">{row.category}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    {row.errors.map((e) => (
                      <p key={e} className="text-xs text-danger">
                        {e}
                      </p>
                    ))}
                    {row.isDuplicate && <p className="text-xs text-warning">อาจซ้ำกับข้อมูลเดิม</p>}
                    {row.warnings.map((w) => (
                      <p key={w} className="text-xs text-muted">
                        {w}
                      </p>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleImport}
          disabled={committing || selectedCount === 0}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {committing ? "กำลังนำเข้า..." : `นำเข้า ${selectedCount} รายการที่เลือก`}
        </button>
        <a
          href="/settings/import"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-background"
        >
          เลือกไฟล์อื่น
        </a>
      </div>
    </div>
  );
}
