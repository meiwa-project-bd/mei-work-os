-- MEI Work OS — sample seed data
--
-- Run this AFTER schema.sql AND after you have signed up at least one user
-- (Login page, or Supabase Dashboard > Authentication > Users).
--
-- 1. Copy your user's UUID from Authentication > Users in the Supabase Dashboard.
-- 2. Replace YOUR_USER_ID_HERE below with that UUID.
-- 3. Run this file in the SQL Editor.

do $$
declare
  v_user_id uuid := '7e2e1c17-8d90-47b4-891c-fba0f5296afa'; -- <-- replace with your auth.users.id
  v_proj_optima uuid;
  v_proj_billing uuid;
  v_proj_meiwork uuid;
  v_proj_itsupport uuid;
  v_proj_docs uuid;
begin
  insert into projects (user_id, name, description, status, priority, owner, start_date)
  values (v_user_id, 'WORKSHOP-OPTIMA', 'ระบบจัดการ Job Card ของ Workshop', 'Active', 'High', 'Me', current_date - interval '60 day')
  returning id into v_proj_optima;

  insert into projects (user_id, name, description, status, priority, owner, start_date)
  values (v_user_id, 'Photo for Billing', 'เครื่องมือจัดการรูปถ่ายสำหรับออกบิล', 'Active', 'Medium', 'Me', current_date - interval '45 day')
  returning id into v_proj_billing;

  insert into projects (user_id, name, description, status, priority, owner, start_date)
  values (v_user_id, 'MEI Work OS', 'ระบบบันทึกงานส่วนตัวบน cloud', 'Active', 'High', 'Me', current_date - interval '1 day')
  returning id into v_proj_meiwork;

  insert into projects (user_id, name, description, status, priority, owner, start_date)
  values (v_user_id, 'IT Support', 'งานสนับสนุนผู้ใช้งานทั่วไป', 'Active', 'Low', 'Me', current_date - interval '90 day')
  returning id into v_proj_itsupport;

  insert into projects (user_id, name, description, status, priority, owner, start_date)
  values (v_user_id, 'Documentation', 'เอกสารและ SOP ภายใน', 'Active', 'Low', 'Me', current_date - interval '90 day')
  returning id into v_proj_docs;

  insert into work_logs (
    user_id, work_date, project_id, category, title, description,
    status, blocker, next_action, boss_visible
  )
  values (
    v_user_id, current_date, v_proj_optima, 'Testing',
    'ทดสอบ Normal Job Card staging',
    'ทดสอบการเรียก Firebase callable สำหรับ Normal Job Card แต่ยังติด permission 403',
    'Waiting', 'รอผู้เกี่ยวข้องแก้ permission', 'ทดสอบใหม่หลัง permission พร้อมใช้งาน', true
  );

  insert into work_logs (
    user_id, work_date, project_id, category, title, description,
    status, result, next_action, boss_visible
  )
  values (
    v_user_id, current_date, v_proj_meiwork, 'Planning',
    'วางแผนระบบบันทึกงานส่วนตัว',
    'ออกแบบระบบบันทึกงานแบบ cloud database สำหรับค้นย้อนหลังและสรุปงานให้หัวหน้า',
    'In Progress', 'ได้โครงสร้างระบบและ database เบื้องต้น', 'เริ่มพัฒนา MVP', true
  );

  insert into work_logs (
    user_id, work_date, project_id, category, title, description,
    status, result, boss_visible
  )
  values (
    v_user_id, current_date - interval '1 day', v_proj_billing, 'Support',
    'สรุป feedback จาก user',
    'รับ feedback เรื่อง auto updater, การซ่อน folder original/output และการจัดการ font',
    'Done', 'ได้ requirement สำหรับเวอร์ชันถัดไป', true
  );
end $$;
