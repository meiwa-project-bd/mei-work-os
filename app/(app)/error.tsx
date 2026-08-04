"use client";

export default function AppError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
      <p className="text-sm font-medium text-foreground">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
      <p className="mt-1 max-w-sm text-sm text-muted">กรุณาลองใหม่อีกครั้ง</p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        ลองใหม่อีกครั้ง
      </button>
    </div>
  );
}
