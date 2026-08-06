const { query } = require('../src/config/db');

async function seedStoreBusinessHours() {
  console.log('🚀 เริ่มรันสคริปต์สร้างข้อมูลวันทำการร้านค้า (store_business_hours)...');
  try {
    const result = await query(`
      INSERT IGNORE INTO store_business_hours (store_id, day_of_week, is_open, open_time, close_time)
      SELECT 
        s.store_id, 
        d.day_of_week, 
        1 AS is_open, 
        '08:30' AS open_time, 
        '17:30' AS close_time
      FROM store s
      CROSS JOIN (
        SELECT 'monday' AS day_of_week UNION ALL
        SELECT 'tuesday' UNION ALL
        SELECT 'wednesday' UNION ALL
        SELECT 'thursday' UNION ALL
        SELECT 'friday' UNION ALL
        SELECT 'saturday' UNION ALL
        SELECT 'sunday'
      ) d
    `);
    console.log(`✅ รันสคริปต์สำเร็จ! เพิ่มข้อมูลวันทำการให้ร้านค้าทั้งหมดเรียบร้อยแล้ว (จำนวนแถวที่บันทึก: ${result.affectedRows || 0})`);
    process.exit(0);
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาดในการรันสคริปต์:', err.message);
    process.exit(1);
  }
}

seedStoreBusinessHours();
