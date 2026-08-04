"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants/enums";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-[#081f4d] text-white md:flex">
      <div className="px-6 py-6">
        <span className="text-lg font-bold tracking-tight">MEI Work OS</span>
        <p className="text-xs text-blue-200/70">Personal Work Record</p>
      </div>

      <div className="mx-5 h-px bg-white/10" />

      <nav className="flex-1 space-y-1 px-4 py-6">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-accent text-white"
                  : "text-blue-100/80 hover:bg-white/8 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-5 mb-5 rounded-lg border border-white/10 bg-white/5 p-3">
        <p className="text-xs leading-relaxed text-blue-100/75">
          เปิด tracker ไว้ ระบบจะเก็บเวลาและหลักฐานงานให้อัตโนมัติ
        </p>
      </div>
    </aside>
  );
}
