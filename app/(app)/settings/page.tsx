import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="ตั้งค่าบัญชีและการใช้งานระบบ" />
      <EmptyState title="ยังไม่มีการตั้งค่าที่ปรับได้" description="จะเพิ่มในเฟสถัดไป" />
    </>
  );
}
