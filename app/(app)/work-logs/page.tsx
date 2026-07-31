import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function WorkLogsPage() {
  return (
    <>
      <PageHeader
        title="Work Logs"
        description="บันทึกงานประจำวัน ค้นหา กรอง และดูรายละเอียดย้อนหลัง"
      />
      <EmptyState
        title="ยังไม่มีบันทึกงาน"
        description="ฟีเจอร์เพิ่ม/แก้ไข/ค้นหาบันทึกงานจะมาใน Phase 2 (Core CRUD)"
      />
    </>
  );
}
