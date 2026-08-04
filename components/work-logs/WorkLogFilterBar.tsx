import type { Project } from "@/types/database";
import { WORK_CATEGORIES, WORK_LOG_STATUS_LABEL_TH, WORK_LOG_STATUSES } from "@/lib/constants/enums";
import { inputClass, labelClass } from "@/components/ui/form";

export interface WorkLogFilters {
  q: string;
  from: string;
  to: string;
  project: string;
  status: string;
  category: string;
  boss: string;
}

export function WorkLogFilterBar({
  projects,
  filters,
}: {
  projects: Pick<Project, "id" | "name">[];
  filters: WorkLogFilters;
}) {
  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <form
      method="get"
      className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm md:grid-cols-4 lg:grid-cols-7"
    >
      <div className="col-span-2 md:col-span-2 lg:col-span-2">
        <label htmlFor="q" className={labelClass}>
          ค้นหา
        </label>
        <input
          id="q"
          name="q"
          defaultValue={filters.q}
          placeholder="หัวข้อ, รายละเอียด, blocker..."
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="from" className={labelClass}>
          ตั้งแต่วันที่
        </label>
        <input id="from" name="from" type="date" defaultValue={filters.from} className={inputClass} />
      </div>
      <div>
        <label htmlFor="to" className={labelClass}>
          ถึงวันที่
        </label>
        <input id="to" name="to" type="date" defaultValue={filters.to} className={inputClass} />
      </div>
      <div>
        <label htmlFor="project" className={labelClass}>
          โปรเจกต์
        </label>
        <select id="project" name="project" defaultValue={filters.project} className={inputClass}>
          <option value="">ทั้งหมด</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="status" className={labelClass}>
          สถานะ
        </label>
        <select id="status" name="status" defaultValue={filters.status} className={inputClass}>
          <option value="">ทั้งหมด</option>
          {WORK_LOG_STATUSES.map((status) => (
            <option key={status} value={status}>
              {WORK_LOG_STATUS_LABEL_TH[status]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="category" className={labelClass}>
          หมวดหมู่
        </label>
        <select id="category" name="category" defaultValue={filters.category} className={inputClass}>
          <option value="">ทั้งหมด</option>
          {WORK_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="col-span-2 md:col-span-1">
        <label htmlFor="boss" className={labelClass}>
          Boss visible
        </label>
        <select id="boss" name="boss" defaultValue={filters.boss} className={inputClass}>
          <option value="">ทั้งหมด</option>
          <option value="true">แสดงเท่านั้น</option>
          <option value="false">ไม่แสดงเท่านั้น</option>
        </select>
      </div>

      <div className="col-span-2 flex items-end gap-2 md:col-span-4 lg:col-span-7">
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          กรอง
        </button>
        {hasActiveFilters && (
          <a
            href="/work-logs"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
          >
            ล้างตัวกรอง
          </a>
        )}
      </div>
    </form>
  );
}
