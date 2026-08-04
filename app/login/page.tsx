import { ConfigNotice } from "@/components/ui/ConfigNotice";
import { LoginForm } from "@/components/layout/LoginForm";
import { MeiMascot } from "@/components/ui/MeiMascot";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  if (!isSupabaseConfigured()) {
    return <ConfigNotice />;
  }

  return (
    <div className="mei-shell flex min-h-svh w-full items-center justify-center bg-background p-6">
      <div className="mei-card w-full max-w-md rounded-lg p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-primary">MEI Work OS</h1>
            <p className="mt-1 text-sm text-muted">เข้ามาเก็บแต้มงานของวันนี้กัน</p>
          </div>
          <MeiMascot compact message="พร้อมเริ่มแล้วนะ" />
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
