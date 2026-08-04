"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(app)/actions";
import { NAV_ITEMS } from "@/lib/constants/enums";

export function Topbar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const today = new Date().toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-10 border-b border-border/80 bg-white/86 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div className="min-w-0">
          <p className="truncate text-lg font-black text-foreground md:text-xl">{today}</p>
          <p className="truncate text-xs font-medium text-muted">พร้อมจัดระเบียบวันทำงานให้ {userEmail}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/work-logs"
            className="mei-card-hover rounded-lg bg-gradient-to-r from-[#1f6bff] to-[#e11d74] px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-200"
          >
            + บันทึกงานใหม่
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-border bg-white px-4 py-3 text-sm font-bold text-foreground transition-colors hover:bg-slate-50"
            >
              ออกจากระบบ
            </button>
          </form>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-border/70 px-4 py-2 md:hidden">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold ${
                active ? "bg-accent text-primary-foreground" : "bg-white text-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
