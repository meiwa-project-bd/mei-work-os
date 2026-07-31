import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="Projects"
        description="ติดตามความคืบหน้าและชั่วโมงทำงานของแต่ละโปรเจกต์"
      />
      <EmptyState
        title="ยังไม่มีโปรเจกต์"
        description="ฟีเจอร์เพิ่ม/แก้ไขโปรเจกต์และดูรายละเอียดจะมาใน Phase 2 (Core CRUD)"
      />
    </>
  );
}
