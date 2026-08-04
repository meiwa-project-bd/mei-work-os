import type { Project } from "@/types/database";
import { WORK_CATEGORIES, WORK_LOG_STATUS_LABEL_TH, WORK_LOG_STATUSES } from "@/lib/constants/enums";
import { REPORT_TYPES, type ReportType } from "@/features/reports/generator";
import { inputClass, labelClass } from "@/components/ui/form";

export interface ReportFilterValues {
  type: ReportType;
  from: string;
  to: string;
  project: string;
  category: string;
  status: string;
  boss: boolean;
}

export function ReportFilterPanel({
  projects,
  filters,
}: {
  projects: Pick<Project, "id" | "name">[];
  filters: ReportFilterValues;
}) {
  return (
    <form
      method="get"
      className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5"
    >
      <div>
        <label htmlFor="type" className="mb-1 block text-sm font-semibold text-foreground">
          ประเภทรายงาน
        </label>
        <select
          id="type"
          name="type"
          defaultValue={filters.type}
          className={`${inputClass} bg-background text-base font-medium`}
        >
          {REPORT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
          ตัวกรองเพิ่มเติม
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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
        </div>

        <label className="mt-3 flex w-fit items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="boss"
            value="true"
            defaultChecked={filters.boss}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
          />
          Boss visible เท่านั้น
        </label>
        <p className="mt-2 text-xs text-muted">
          หมายเหตุ: สรุปสำหรับหัวหน้า (Boss Summary) จะกรองเฉพาะงานที่ boss_visible = true เสมอ
          ไม่ว่าจะติ๊กตัวเลือกนี้หรือไม่
        </p>
      </div>

      <div className="mt-4">
        <button
          type="submit"
          className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          สร้างรายงาน
        </button>
      </div>
    </form>
  );
}
