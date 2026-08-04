import { TrackerTokenSettings } from "@/components/settings/TrackerTokenSettings";
import { PageHeader } from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/server";
import type { TrackerTokenSummary } from "@/types/database";

function UploadIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <path
        d="M12 15V4.5M12 4.5 8 8.5M12 4.5l4 4M4.5 15v3a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <path
        d="M12 3v3.5M12 17.5V21M3 12h3.5M17.5 12H21M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DocumentIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <path
        d="M7 3.75h7l4 4v12a1.5 1.5 0 0 1-1.5 1.5h-9.5A1.5 1.5 0 0 1 5.5 19.75V5.25A1.5 1.5 0 0 1 7 3.75Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 3.75v4h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LinkIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <path
        d="M9.5 14.5 14.5 9.5M8 16.5 5.879 18.62a3 3 0 1 1-4.243-4.243L3.75 12.25M16 7.5l2.121-2.121a3 3 0 1 1 4.243 4.243L20.25 11.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsCard({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: (props: { className?: string }) => React.ReactElement;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h2 className="mt-3 text-sm font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted">{description}</p>
      <div className="mt-4">{action}</div>
    </div>
  );
}

function ComingSoonBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-background px-3 py-1.5 text-xs font-medium text-muted">
      เร็วๆ นี้
    </span>
  );
}

export default async function SettingsPage() {
  const supabase = (await createClient())!;
  const { data, error } = await supabase
    .from("tracker_tokens")
    .select("id, user_id, name, created_at, last_used_at, revoked_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("โหลด tracker tokens ไม่สำเร็จ");
  }

  return (
    <>
      <PageHeader title="Settings" description="ตั้งค่าบัญชีและการใช้งานระบบ" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SettingsCard
          icon={UploadIcon}
          title="นำเข้าจาก Excel"
          description="นำเข้าบันทึกงานเก่าจากไฟล์ Excel (วันที่ / โครงการ / รายละเอียด / เวลา)"
          action={
            <a
              href="/settings/import"
              className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              นำเข้าจาก Excel
            </a>
          }
        />
        <SettingsCard
          icon={SparkleIcon}
          title="สรุปงานด้วย AI"
          description="ให้ AI ช่วยเรียบเรียงสรุปงานประจำวัน/สัปดาห์อัตโนมัติจากบันทึกของคุณ"
          action={<ComingSoonBadge />}
        />
        <SettingsCard
          icon={DocumentIcon}
          title="ส่งออก PDF"
          description="ส่งออกรายงานเป็นไฟล์ PDF พร้อมรูปแบบสำหรับนำเสนอ"
          action={<ComingSoonBadge />}
        />
        <SettingsCard
          icon={LinkIcon}
          title="เชื่อมต่อ Google Calendar / GitHub"
          description="ซิงก์งานกับปฏิทินและกิจกรรมจาก GitHub โดยอัตโนมัติ"
          action={<ComingSoonBadge />}
        />
      </div>

      <div className="mt-6">
        <TrackerTokenSettings tokens={(data ?? []) as TrackerTokenSummary[]} />
      </div>
    </>
  );
}
