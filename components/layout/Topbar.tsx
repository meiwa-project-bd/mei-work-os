"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(app)/actions";
import { SparkIcon } from "@/components/dashboard/icons";
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
    <header className="border-b border-[#c397ff]/20 bg-[#0b1436]/86 text-white shadow-[0_10px_28px_rgba(2,8,27,0.16)] backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{today}</p>
          <p className="truncate text-xs text-[#b9c4ef]">{userEmail}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-[#facc15]/35 bg-[#facc15]/10 px-3 py-1.5 text-xs font-bold text-[#fde68a] sm:inline-flex">
            <SparkIcon className="h-3.5 w-3.5" />
            +20% XP
          </span>
          <Link
            href="/work-logs"
            className="rounded-lg bg-gradient-to-r from-[#d946ef] to-[#f472d0] px-4 py-2 text-sm font-bold text-white shadow-[0_0_20px_rgba(244,114,208,0.25)] transition hover:brightness-110"
          >
            + บันทึกงานใหม่
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-[#c397ff]/25 bg-white/[0.05] px-3 py-2 text-sm font-semibold text-[#e5ecff] transition hover:bg-white/[0.1]"
            >
              ออกจากระบบ
            </button>
          </form>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-[#c397ff]/20 px-4 py-2 md:hidden">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                active
                  ? "bg-[#f472d0] text-white"
                  : "border border-[#c397ff]/20 bg-white/[0.06] text-[#c9d4ff]"
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
