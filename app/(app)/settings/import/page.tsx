import { PageHeader } from "@/components/ui/PageHeader";
import { ImportBoard } from "@/components/import/ImportBoard";

export default function ImportPage() {
  return (
    <>
      <PageHeader
        title="นำเข้าจาก Excel"
        description="นำเข้าบันทึกงานเก่าจากไฟล์ Excel (วันที่ / โครงการ / รายละเอียด / เวลา)"
      />
      <ImportBoard />
    </>
  );
}
