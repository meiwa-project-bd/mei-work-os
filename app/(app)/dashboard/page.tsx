import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="ภาพรวมงานวันนี้ สัปดาห์นี้ และโปรเจกต์ที่กำลังดำเนินการ"
      />
      <EmptyState
        title="ยังไม่มีข้อมูลสรุป"
        description="เมื่อเริ่มบันทึกงาน ระบบจะแสดงชั่วโมงทำงาน สถานะงาน และกราฟสรุปที่นี่ (Phase 3)"
      />
    </>
  );
}
