const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function seed() {
  console.log('🚀 Starting Database Initialization & Seeding...');

  // 1. Connect without database to ensure DB exists
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  const dbName = process.env.DB_NAME || 'car_release_db';
  console.log(`📌 Ensuring database "${dbName}" exists...`);
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await connection.query(`USE \`${dbName}\`;`);

  // 2. Read and run schema SQL
  const schemaPath = path.join(__dirname, '../../car_release_schema.sql');
  if (fs.existsSync(schemaPath)) {
    console.log('📄 Executing DDL Schema SQL from car_release_schema.sql...');
    const sqlScript = fs.readFileSync(schemaPath, 'utf-8');
    const statements = sqlScript
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      try {
        await connection.query(stmt);
      } catch (e) {
        if (!e.message.includes('already exists')) {
          console.warn('SQL Notice:', e.message);
        }
      }
    }
    console.log('✅ DDL Schema applied successfully!');
  } else {
    console.warn('⚠️ car_release_schema.sql not found at path:', schemaPath);
  }


  // 3. Seed Master Data
  console.log('🌱 Seeding initial master data...');

  // Seed Access
  await connection.query(`
    INSERT IGNORE INTO access (access_id, access_name) VALUES
    (1, 'System Administrator'),
    (2, 'Supervisor / Manager'),
    (3, 'Driver / Staff');
  `);

  // Seed Level User
  await connection.query(`
    INSERT IGNORE INTO level_user (level_user_id, level_user_name, access_id, setting_car_release) VALUES
    (1, 'แอดมินระบบ', 1, 1),
    (2, 'หัวหน้างานปล่อยรถ', 2, 1),
    (3, 'พนักงานขับรถ / เซลส์', 3, 0);
  `);

  // Seed Users (Pass: 123456)
  const hashedPassword = await bcrypt.hash('123456', 10);
  await connection.query(`
    INSERT IGNORE INTO user (user_id, username, password, name, level_user_id, phone_number_1, location_now) VALUES
    (1, 'admin', '${hashedPassword}', 'ผู้ดูแลระบบ (Admin)', 1, '0812345678', '13.7563,100.5018'),
    (2, 'supervisor', '${hashedPassword}', 'สมศักดิ์ หัวหน้างาน', 2, '0823456789', '13.7563,100.5018'),
    (3, 'driver1', '${hashedPassword}', 'นายสมชาย ขยันขับ (พนักงานขับรถ 1)', 3, '0834567890', '13.7563,100.5018'),
    (4, 'driver2', '${hashedPassword}', 'นายสมปอง ลุยทุกที่ (พนักงานขับรถ 2)', 3, '0845678901', '13.7563,100.5018');
  `);

  // Seed Cars
  await connection.query(`
    INSERT IGNORE INTO car (car_id, license_plate, brand, model, sub_model, year) VALUES
    (1, 'ผก-1234 กทม', 'Toyota', 'Hilux Revo', 'Smart Cab 2.4', 2022),
    (2, 'ตข-5678 นนทบุรี', 'Isuzu', 'D-Max', 'Spark 1.9', 2023),
    (3, 'ฮฮ-9999 สมุทรปราการ', 'Nissan', 'Navara', 'King Cab', 2021);
  `);

  // Seed Group Store
  await connection.query(`
    INSERT IGNORE INTO group_store (group_store_id, group_store_name, group_color) VALUES
    (1, 'โซนกรุงเทพตะวันออก (บางนา-ศรีนครินทร์)', '#3b82f6'),
    (2, 'โซนกรุงเทพเหนือ (ดอนเมือง-รังสิต)', '#10b981'),
    (3, 'โซนนนทบุรี-ปากเกร็ด', '#f59e0b');
  `);

  // Seed Stores
  await connection.query(`
    INSERT IGNORE INTO store (store_id, store_name, store_address, telephone_number, customer_delivery_time, store_location) VALUES
    (1, 'ร้านเจ๊พร พาณิชย์ (บางนา)', '123 ถนนบางนา-ตราด แขวงบางนา เขตบางนา กรุงเทพฯ', '02-111-2222', '09:00:00', '13.6682,100.6140'),
    (2, 'ร้านทวีโชค มินิมาร์ท', '456 ถนนศรีนครินทร์ แขวงหนองบอน เขตประเวศ กรุงเทพฯ', '02-333-4444', '10:30:00', '13.6925,100.6480'),
    (3, 'ร้านสว่างการค้า', '789 ถนนแจ้งวัฒนะ ตำบลปากเกร็ด อำเภอปากเกร็ด นนทบุรี', '02-555-6666', '11:00:00', '13.9080,100.5020'),
    (4, 'ร้านสมบูรณ์ ซุปเปอร์', '99/1 ถนนพหลโยธิน ตำบลคลองหนึ่ง อำเภอคลองหลวง ปทุมธานี', '02-777-8888', '14:00:00', '14.0610,100.6170'),
    (5, 'ร้านนำชัย สโตร์', '88 ถนนสุขุมวิท ตำบลสำโรงเหนือ อำเภอเมือง สมุทรปราการ', '02-999-0000', '15:30:00', '13.6480,100.5960');
  `);

  // Seed Car Release Types
  await connection.query(`
    INSERT IGNORE INTO car_release_type (car_release_type_id, type, quantity) VALUES
    (1, 'ปล่อยรถส่งสินค้าประจำวัน', 50),
    (2, 'ปล่อยรถส่งสินค้าด่วนพิเศษ', 20),
    (3, 'ปล่อยรถเยี่ยมชมลูกค้า / เปิดตลาด', 10);
  `);

  // Seed Key Holders
  await connection.query(`
    INSERT IGNORE INTO key_holder (key_holder_id, key_holder_name) VALUES
    (1, 'นายสมศักดิ์ (หัวหน้าคลัง)'),
    (2, 'นายวิชัย (รปภ. ประตูหน้า)'),
    (3, 'นางสาวรัตนา (ธุรการคลัง)');
  `);

  // Seed Parking
  await connection.query(`
    INSERT IGNORE INTO parking (parking_id, parking_name) VALUES
    (1, 'ลานจอดรถ A (ฝั่งคลังสินค้า 1)'),
    (2, 'ลานจอดรถ B (ฝั่งคลังสินค้า 2)'),
    (3, 'อาคารจอดรถชั้น 1');
  `);

  // Seed Payments
  await connection.query(`
    INSERT IGNORE INTO payment (payment_id, payment_name) VALUES
    (1, 'เงินสด (Cash)'),
    (2, 'เงินโอน (Bank Transfer)'),
    (3, 'โอนตามทีหลัง / ค้างชำระ (Credit / Transfer According)');
  `);

  // Seed Visit Types (Ensure default values)
  await connection.query(`
    INSERT IGNORE INTO visit_type (visit_type_id, visit_type_name) VALUES
    (1, 'รับสินค้า'),
    (2, 'ฝากส่ง'),
    (3, 'เยี่ยมลูกค้า'),
    (4, 'ส่งของ'),
    (5, 'เปิดลูกค้าใหม่');
  `);

  // Seed Car Releases
  await connection.query(`
    INSERT IGNORE INTO car_release (car_release_id, car_release_no, car_id, car_release_type_id, user_id, group_store_id, mileage, pda_device, description, accounting_status) VALUES
    (1, 'TMS-2026720-0005', 1, 1, 3, 1, 101741, 'PDA 5', 'วิ่งรอบเมืองประจำวัน', 'รอการตรวจสอบ'),
    (2, 'TMS-2026720-0004', 2, 1, 4, 2, 87226, 'PDA 2', 'วิ่งส่งสินค้ารอบนอก', 'รอการตรวจสอบ'),
    (3, 'TMS-2026720-0003', 3, 1, 3, 3, 187028, 'PDA 3', 'วิ่งสายเหนือ', 'รอการตรวจสอบ');
  `);

  // Seed Followers
  await connection.query(`
    INSERT IGNORE INTO car_release_follower (follower_id, car_release_id, follower_name) VALUES
    (1, 1, 'บอย'),
    (2, 2, 'กิ๊ก'),
    (3, 3, 'พัท');
  `);

  console.log('🎉 Seeding completed successfully!');

  await connection.end();
}

seed().catch(err => {
  console.error('❌ Error seeding database:', err);
  process.exit(1);
});
