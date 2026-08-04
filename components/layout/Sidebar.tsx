"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants/enums";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/70 bg-white/72 shadow-xl shadow-pink-100/50 backdrop-blur-xl md:flex">
      <div className="px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-black text-white shadow-lg shadow-pink-300/40">
            M
          </span>
          <div>
            <span className="text-lg font-bold tracking-tight text-primary">MEI Work OS</span>
            <p className="text-xs text-muted">Lovely work tracker</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                active
                  ? "bg-primary text-primary-foreground shadow-md shadow-pink-200"
                  : "text-foreground hover:bg-white hover:text-primary hover:shadow-sm"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="m-3 rounded-lg border border-pink-100 bg-gradient-to-br from-pink-50 to-sky-50 p-3">
        <p className="text-xs font-semibold text-foreground">โหมดตั้งใจทำงาน</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          เปิด tracker ไว้ แล้วให้ระบบช่วยเก็บเวลาและหลักฐานงานให้เอง
        </p>
      </div>
    </aside>
  );
}
