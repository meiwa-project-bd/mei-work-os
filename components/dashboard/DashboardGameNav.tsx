import {
  AlertIcon,
  CalendarIcon,
  ChecklistIcon,
  ClockIcon,
  FolderIcon,
  SparkIcon,
} from "./icons";

const items = [
  { href: "/dashboard", label: "แดชบอร์ด", icon: SparkIcon, active: true },
  { href: "/work-logs", label: "บันทึกงาน", icon: ChecklistIcon },
  { href: "/projects", label: "โปรเจกต์", icon: FolderIcon },
  { href: "/reports", label: "รายงาน", icon: CalendarIcon },
  { href: "/tracker", label: "หลักฐานงาน", icon: ClockIcon },
  { href: "/settings", label: "ตั้งค่า", icon: AlertIcon },
];

export function DashboardGameNav() {
  return (
    <nav className="mei-game-nav rounded-lg">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.href}
            href={item.href}
            className={`mei-game-nav-item ${item.active ? "mei-game-nav-item-active" : ""}`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="truncate">{item.label}</span>
          </a>
        );
      })}
      <a href="/settings/import" className="mei-game-shop mt-auto">
        <span className="text-lg font-black">+</span>
        <span>เพิ่มหลักฐาน</span>
      </a>
    </nav>
  );
}
