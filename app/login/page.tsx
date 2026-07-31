import { ConfigNotice } from "@/components/ui/ConfigNotice";
import { LoginForm } from "@/components/layout/LoginForm";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  if (!isSupabaseConfigured()) {
    return <ConfigNotice />;
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight text-primary">MEI Work OS</h1>
          <p className="mt-1 text-sm text-muted">Personal Work Record</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
