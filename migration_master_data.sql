-- =========================================================
-- MIGRATION SCRIPT: MASTER DATA MODULE (ข้อมูลมาสเตอร์ 6 หมวดหมู่)
-- =========================================================

-- 1. STORES (ร้านค้า)
CREATE TABLE IF NOT EXISTS `stores` (
  `store_id` INT AUTO_INCREMENT PRIMARY KEY,
  `store_code` VARCHAR(50) NULL,
  `store_name` VARCHAR(255) NOT NULL,
  `store_address` TEXT NULL,
  `telephone_number` VARCHAR(50) NULL,
  `store_location` VARCHAR(255) NULL,
  `status` VARCHAR(20) DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. KEY STORAGE (ที่ฝากกุญแจ)
CREATE TABLE IF NOT EXISTS `key_storage` (
  `key_storage_id` INT AUTO_INCREMENT PRIMARY KEY,
  `storage_code` VARCHAR(50) NOT NULL,
  `storage_name` VARCHAR(255) NOT NULL,
  `location_description` TEXT NULL,
  `status` VARCHAR(20) DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. PDA DEVICE (เครื่อง PDA)
CREATE TABLE IF NOT EXISTS `pda_device` (
  `pda_id` INT AUTO_INCREMENT PRIMARY KEY,
  `device_code` VARCHAR(50) NOT NULL,
  `device_name` VARCHAR(255) NOT NULL,
  `serial_number` VARCHAR(100) NULL,
  `assigned_user` VARCHAR(255) NULL,
  `status` VARCHAR(20) DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. PAYMENT METHOD (การชำระเงิน)
CREATE TABLE IF NOT EXISTS `payment_method` (
  `payment_id` INT AUTO_INCREMENT PRIMARY KEY,
  `payment_code` VARCHAR(50) NOT NULL,
  `payment_name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `status` VARCHAR(20) DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. VEHICLE (รถ)
CREATE TABLE IF NOT EXISTS `vehicle` (
  `vehicle_id` INT AUTO_INCREMENT PRIMARY KEY,
  `license_plate` VARCHAR(50) NOT NULL,
  `province` VARCHAR(100) DEFAULT 'กรุงเทพมหานคร',
  `vehicle_type` VARCHAR(100) DEFAULT 'กระบะตู้เย็น',
  `brand` VARCHAR(100) NULL,
  `model` VARCHAR(100) NULL,
  `status` VARCHAR(20) DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. PARKING SPACE (ที่จอด)
CREATE TABLE IF NOT EXISTS `parking_space` (
  `parking_id` INT AUTO_INCREMENT PRIMARY KEY,
  `parking_code` VARCHAR(50) NOT NULL,
  `zone_name` VARCHAR(100) NOT NULL,
  `space_number` VARCHAR(50) NOT NULL,
  `description` TEXT NULL,
  `status` VARCHAR(20) DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================================
-- SEED DATA (ข้อมูลเริ่มต้นสำหรับทดสอบ)
-- =========================================================

-- Seed Key Storage
INSERT IGNORE INTO `key_storage` (`key_storage_id`, `storage_code`, `storage_name`, `location_description`, `status`) VALUES
(1, 'KEY-BOX-A1', 'ตู้ฝากกุญแจ A1 (ป้อมรปภ. ประตู 1)', 'ตู้เซฟป้อมรปภ. ทางเข้าหลัก', 'active'),
(2, 'KEY-BOX-B2', 'ตู้ฝากกุญแจ B2 (ห้องส่งสินค้า)', 'ห้องพักคนขับรถ อาคารคลัง 2', 'active'),
(3, 'KEY-BOX-C1', 'ตู้ฝากกุญแจ C1 (แท่นจ่ายคีย์การ์ด)', 'บริเวณเคาน์เตอร์เช็คอิน', 'active');

-- Seed PDA Devices
INSERT IGNORE INTO `pda_device` (`pda_id`, `device_code`, `device_name`, `serial_number`, `assigned_user`, `status`) VALUES
(1, 'PDA-001', 'Zebra TC26 #01', 'SN-ZB2026001', 'นาย สมชาย ขยันขับ', 'active'),
(2, 'PDA-002', 'Zebra TC26 #02', 'SN-ZB2026002', 'นาย วินัย ซื่อสัตย์', 'active'),
(3, 'PDA-003', 'Honeywell EDA51 #01', 'SN-HW2026003', 'นาย ประเสริฐ นำโชค', 'active');

-- Seed Payment Methods
INSERT IGNORE INTO `payment_method` (`payment_id`, `payment_code`, `payment_name`, `description`, `status`) VALUES
(1, 'PAY-CASH', 'เงินสด (Cash)', 'ชำระด้วยเงินสด ณ จุดส่งสินค้า', 'active'),
(2, 'PAY-TRANSFER', 'โอนเงิน / PromptPay', 'ชำระผ่านการสแกน QR Code / บัญชีธนาคาร', 'active'),
(3, 'PAY-CREDIT-30', 'เครดิต 30 วัน (Credit 30 Days)', 'วางบิลชำระเงินตามรอบเครดิตเทอม 30 วัน', 'active'),
(4, 'PAY-CHEQUE', 'เช็คสั่งจ่าย (Cheque)', 'รับเช็คสั่งจ่ายล่วงหน้า', 'active');

-- Seed Vehicles
INSERT IGNORE INTO `vehicle` (`vehicle_id`, `license_plate`, `province`, `vehicle_type`, `brand`, `model`, `status`) VALUES
(1, '1กข-8888', 'กรุงเทพมหานคร', 'กระบะตู้เย็น 4 ล้อ', 'Toyota', 'Hilux Revo', 'active'),
(2, '2กฮ-9999', 'กรุงเทพมหานคร', 'รถบรรทุกตู้เย็น 6 ล้อ', 'Isuzu', 'NPR 150', 'active'),
(3, '3ขค-1234', 'สมุทรปราการ', 'กระบะตู้เย็น 4 ล้อ', 'Isuzu', 'D-Max', 'active');

-- Seed Parking Spaces
INSERT IGNORE INTO `parking_space` (`parking_id`, `parking_code`, `zone_name`, `space_number`, `description`, `status`) VALUES
(1, 'PK-A-01', 'โซน A (คลังเย็นหลัก)', 'A-01', 'ช่องจอดรถเทียบแท่นโหลดสินค้า ช่อง 1', 'active'),
(2, 'PK-A-02', 'โซน A (คลังเย็นหลัก)', 'A-02', 'ช่องจอดรถเทียบแท่นโหลดสินค้า ช่อง 2', 'active'),
(3, 'PK-B-01', 'โซน B (ลานพักรถ)', 'B-01', 'ลานจอดพักรอเรียกคิว ประตู 2', 'active');
