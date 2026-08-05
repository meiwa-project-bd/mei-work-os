import type { TrackerDashboardSummary } from "@/features/tracker/queries";
import type { EvidenceItem, WorkSession } from "@/types/database";
import { formatHoursDecimal } from "@/lib/utils/duration";
import { ChecklistIcon, ClockIcon, FolderIcon } from "./icons";

const toolStyles = ["tool-ai", "tool-code", "tool-web", "tool-chat"];

function toolMonogram(tool: string) {
  const normalized = tool.toLowerCase();
  if (normalized.includes("claude")) return "AI";
  if (normalized.includes("code")) return "<>";
  if (normalized.includes("chrome") || normalized.includes("browser")) return "W";
  if (normalized.includes("chat")) return "C";
  return tool.slice(0, 2).toUpperCase();
}

export function DashboardActivityPanels({
  summary,
  activeSessions,
  recentEvidence,
}: {
  summary: TrackerDashboardSummary;
  activeSessions: WorkSession[];
  recentEvidence: EvidenceItem[];
}) {
  const tools = summary.topTools.length
    ? summary.topTools
    : [
        { tool: "Claude Code", minutes: 90 },
        { tool: "VS Code", minutes: 72 },
        { tool: "Chrome", minutes: 54 },
        { tool: "ChatGPT", minutes: 30 },
      ];
  const maxToolMinutes = Math.max(1, ...tools.map((item) => item.minutes));
  const activeSession = activeSessions[0];

  return (
    <section className="mei-activity-grid">
      <div className="mei-detail-panel mei-tools-panel">
        <div className="mei-panel-title">
          <span>เครื่องมือที่ใช้วันนี้</span>
          <span className="mei-panel-kicker">LIVE DATA</span>
        </div>
        <div className="mei-tool-list">
          {tools.slice(0, 4).map((item, index) => (
            <div className="mei-tool-row" key={item.tool}>
              <span className={`mei-tool-icon ${toolStyles[index] ?? "tool-chat"}`}>
                {toolMonogram(item.tool)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="truncate font-extrabold text-white">{item.tool}</span>
                  <span className="shrink-0 font-bold text-[#dbe7ff]">
                    {formatHoursDecimal(item.minutes)}
                  </span>
                </div>
                <div className="mei-tool-track">
                  <span style={{ width: `${Math.max(8, (item.minutes / maxToolMinutes) * 100)}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mei-mini-cheer">
          <span className="mei-mini-spark" aria-hidden="true">+</span>
          <span>ทำได้ดีมากเลยค่ะ!</span>
        </div>
      </div>

      <div className="mei-detail-stack">
        <div className="mei-detail-panel mei-session-panel">
          <div className="mei-panel-title">
            <span>Session กำลังทำงาน</span>
            <a href="/tracker">ดูทั้งหมด</a>
          </div>
          <div className="mei-session-row">
            <span className="mei-session-icon"><ChecklistIcon className="h-6 w-6" /></span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-black text-white">
                  {activeSession?.title ?? "พร้อมเริ่ม Session ใหม่"}
                </p>
                <span className={activeSession ? "mei-live-badge" : "mei-ready-badge"}>
                  {activeSession ? "ทำอยู่" : "พร้อม"}
                </span>
              </div>
              <p className="mt-1 truncate text-xs font-semibold text-[#b9c4ef]">
                {activeSession
                  ? `${activeSession.tool} · ${activeSession.branch_name ?? "main"}`
                  : "เปิด Tracker เพื่อเริ่มบันทึกเวลาทำงาน"}
              </p>
              <div className="mei-session-progress"><span /></div>
            </div>
          </div>
        </div>

        <div className="mei-detail-panel mei-evidence-panel">
          <div className="mei-panel-title">
            <span>หลักฐานล่าสุด</span>
            <a href="/tracker">ดูทั้งหมด</a>
          </div>
          <div className="mei-evidence-strip">
            {recentEvidence.slice(0, 4).map((item, index) => (
              <a href={item.url ?? "/tracker"} className="mei-evidence-tile" key={item.id}>
                <span className={`mei-evidence-preview evidence-preview-${(index % 4) + 1}`}>
                  {index % 2 === 0 ? <ClockIcon className="h-6 w-6" /> : <FolderIcon className="h-6 w-6" />}
                </span>
                <span className="truncate text-[10px] font-bold text-white">{item.title}</span>
                <span className="truncate text-[9px] text-[#b9c4ef]">{item.type}</span>
              </a>
            ))}
            {recentEvidence.length === 0 && (
              <div className="mei-evidence-tile mei-evidence-empty">
                <span className="mei-evidence-preview"><FolderIcon className="h-6 w-6" /></span>
                <span className="text-[10px] font-bold text-white">ยังไม่มีหลักฐาน</span>
                <span className="text-[9px] text-[#b9c4ef]">เริ่มจากชิ้นแรก</span>
              </div>
            )}
            <a href="/tracker" className="mei-evidence-add" aria-label="เพิ่มหลักฐาน">
              <span>+</span>
              <small>เพิ่มหลักฐาน</small>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
