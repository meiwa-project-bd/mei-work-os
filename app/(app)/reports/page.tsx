import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="สร้างสรุปงานประจำวัน ประจำสัปดาห์ และรายงานสำหรับหัวหน้า"
      />
      <EmptyState
        title="ยังไม่มีรายงาน"
        description="ตัวสร้างรายงาน (Daily / Weekly / Boss Summary ฯลฯ) จะมาใน Phase 4"
      />
    </>
  );
}
