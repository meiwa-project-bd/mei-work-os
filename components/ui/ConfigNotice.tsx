export function ConfigNotice() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning/10 text-warning">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-foreground">
          Supabase environment variables are not configured
        </h1>
        <p className="mt-2 text-sm text-muted">
          ยังไม่ได้ตั้งค่า Supabase — กรุณาสร้างโปรเจกต์ Supabase แล้วใส่ค่า{" "}
          <code className="rounded bg-background px-1 py-0.5 text-xs">
            NEXT_PUBLIC_SUPABASE_URL
          </code>{" "}
          และ{" "}
          <code className="rounded bg-background px-1 py-0.5 text-xs">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>{" "}
          ในไฟล์ <code className="rounded bg-background px-1 py-0.5 text-xs">.env.local</code>{" "}
          จากนั้นรีสตาร์ทเซิร์ฟเวอร์
        </p>
        <p className="mt-4 text-xs text-muted">
          ดูขั้นตอนเต็มได้ใน README.md ของโปรเจกต์
        </p>
      </div>
    </div>
  );
}
