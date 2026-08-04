"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants/enums";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-[#081f4d] text-white shadow-2xl shadow-slate-900/20 md:flex">
      <div className="px-6 py-6">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-[#2f7bff] to-[#e11d74] text-base font-black shadow-lg shadow-blue-950/40">
            MEI
          </span>
          <div>
            <span className="text-xl font-black tracking-tight">MEI Work OS</span>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-200/75">
              Level up workday
            </p>
          </div>
        </div>
      </div>

      <div className="mx-5 h-px bg-white/12" />

      <nav className="flex-1 space-y-2 px-4 py-6">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-lg px-4 py-3 text-sm font-bold transition-all ${
                active
                  ? "bg-gradient-to-r from-[#1f6bff] to-[#6b5cff] text-white shadow-lg shadow-blue-950/30"
                  : "text-blue-100/82 hover:bg-white/9 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-5 mb-5 rounded-lg border border-white/10 bg-white/8 p-4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#65e6d3]">
          Focus Mode
        </p>
        <p className="mt-2 text-xs leading-relaxed text-blue-100/82">
          เปิด tracker ไว้ แล้วให้ระบบเก็บเวลาและหลักฐานงานให้แบบอัตโนมัติ
        </p>
      </div>
    </aside>
  );
}
