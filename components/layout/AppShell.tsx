"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export function AppShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard" || pathname?.startsWith("/dashboard/");

  if (isDashboard) {
    return (
      <div className="mei-dashboard-route min-h-svh w-full">
        <main className="relative min-h-svh p-3 sm:p-4 xl:p-5">{children}</main>
      </div>
    );
  }

  return (
    <div className="mei-app-shell flex min-h-svh w-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar userEmail={userEmail} />
        <main className="relative flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
