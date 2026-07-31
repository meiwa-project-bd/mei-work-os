"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants/enums";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="px-6 py-5">
        <span className="text-lg font-bold tracking-tight text-primary">MEI Work OS</span>
        <p className="text-xs text-muted">Personal Work Record</p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-background"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
