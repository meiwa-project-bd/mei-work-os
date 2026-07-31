import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function PeoplePage() {
  return (
    <>
      <PageHeader
        title="People"
        description="ผู้ที่เกี่ยวข้องกับงาน เช่น หัวหน้า โปรแกรมเมอร์ ผู้ใช้งาน หรือผู้ขาย"
      />
      <EmptyState
        title="ยังไม่มีรายชื่อ"
        description="ฟีเจอร์เพิ่มบุคคลและเชื่อมโยงกับบันทึกงานจะมาใน Phase 2 (Core CRUD)"
      />
    </>
  );
}
