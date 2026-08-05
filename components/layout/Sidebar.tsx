"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChecklistIcon,
  ClockIcon,
  FolderIcon,
  SparkIcon,
} from "@/components/dashboard/icons";
import { NAV_ITEMS } from "@/lib/constants/enums";

const NAV_ICONS = {
  "/dashboard": SparkIcon,
  "/work-logs": ChecklistIcon,
  "/projects": FolderIcon,
  "/reports": CalendarIcon,
  "/tracker": ClockIcon,
  "/people": CheckCircleIcon,
  "/settings": AlertIcon,
} as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[#c397ff]/20 bg-[#091333]/88 text-white shadow-[12px_0_32px_rgba(2,8,27,0.22)] backdrop-blur md:flex">
      <div className="px-5 py-5">
        <div className="rounded-lg border border-[#f472d0]/28 bg-white/[0.06] p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#facc15]/45 bg-[#17113e] text-lg font-black text-[#facc15] shadow-inner">
              M
            </span>
            <div className="min-w-0">
              <span className="block truncate text-lg font-bold tracking-tight">MEI Work OS</span>
              <p className="truncate text-xs text-[#b9c4ef]">Personal Work Record</p>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-[#f472d0] via-[#c084fc] to-[#7dd3fc]" />
          </div>
        </div>
      </div>

      <div className="mx-5 h-px bg-[#c397ff]/20" />

      <nav className="flex-1 space-y-1.5 px-4 py-5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = NAV_ICONS[item.href];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? "border-[#f472d0]/50 bg-gradient-to-r from-[#a855f7]/55 to-[#f472d0]/45 text-white shadow-[0_0_22px_rgba(244,114,208,0.2)]"
                  : "border-transparent text-[#c9d4ff]/82 hover:border-[#c397ff]/24 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mx-5 mb-5 rounded-lg border border-[#7dd3fc]/25 bg-[#071222]/72 p-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#5eead4] shadow-[0_0_12px_rgba(94,234,212,0.9)]" />
          <p className="text-xs font-bold text-white">MEI Assistant Online</p>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[#b9c4ef]">
          เปิด tracker ไว้ แล้ว MEI จะช่วยเก็บเวลาและหลักฐานงานให้อัตโนมัติ
        </p>
      </div>
    </aside>
  );
}
