-- =========================================================
-- Car Release System - Database Schema (MySQL 8)
-- Reconstructed from user-provided field list
-- ใช้ import ผ่าน phpMyAdmin ได้ทันที
-- จุดที่ไม่แน่ใจ mapping 100% จะมีคอมเมนต์ -- ?? กำกับไว้
-- =========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------
-- 1. access : สิทธิ์การใช้งาน
-- ---------------------------------------------------------
CREATE TABLE access (
  access_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  access_name   VARCHAR(100) NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 2. level_user : ระดับ/บทบาทผู้ใช้งาน
-- ---------------------------------------------------------
CREATE TABLE level_user (
  level_user_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  level_user_name      VARCHAR(100) NOT NULL,
  access_id             INT UNSIGNED,
  setting_car_release   TINYINT(1) DEFAULT 0 COMMENT 'สิทธิ์ตั้งค่า/ปล่อยรถ',
  menu_permissions      TEXT COMMENT 'JSON เก็บสิทธิ์การเข้าถึงเมนูต่างๆ',
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (access_id) REFERENCES access(access_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 3. user : ผู้ใช้งานระบบ
-- ---------------------------------------------------------
CREATE TABLE user (
  user_id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username        VARCHAR(100) NOT NULL UNIQUE,
  password        VARCHAR(255) NOT NULL,
  name            VARCHAR(255) NOT NULL,
  level_user_id   INT UNSIGNED,
  phone_number_1  VARCHAR(20),
  phone_number_2  VARCHAR(20),
  phone_number_3  VARCHAR(20),
  image_profile   VARCHAR(500),
  location_now    VARCHAR(255) COMMENT 'lat,long ปัจจุบัน',
  language        VARCHAR(10) DEFAULT 'th',
  user_status     VARCHAR(20) DEFAULT 'active' COMMENT 'active=ใช้งานอยู่, inactive=ปิดการใช้งาน',
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (level_user_id) REFERENCES level_user(level_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 4. car : ข้อมูลรถ
-- ---------------------------------------------------------
CREATE TABLE car (
  car_id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  license_plate  VARCHAR(50) NOT NULL,
  brand          VARCHAR(100),
  model          VARCHAR(100),
  sub_model      VARCHAR(100),
  year           YEAR,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 5. store : ข้อมูลร้านค้า
-- ---------------------------------------------------------
CREATE TABLE store (
  store_id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  store_name              VARCHAR(255) NOT NULL,
  store_address           VARCHAR(500),
  telephone_number        VARCHAR(20),
  fax_number               VARCHAR(20),
  email                    VARCHAR(255),
  url                      VARCHAR(255),
  customer_delivery_time   TIME COMMENT 'เวลาที่ลูกค้าสะดวกรับของ',
  store_location            VARCHAR(255) COMMENT 'lat,long ของร้าน',
  created_at                DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 6. group_store : กลุ่ม/โซนร้านค้า (ใช้จัดกรุ๊ปเส้นทาง)
-- ---------------------------------------------------------
CREATE TABLE group_store (
  group_store_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  group_store_name   VARCHAR(255) NOT NULL,
  group_color        VARCHAR(20) COMMENT 'สีสำหรับแสดงบนแผนที่',
  created_at         DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 7. car_release_type : ประเภทการปล่อยรถ
-- ---------------------------------------------------------
CREATE TABLE car_release_type (
  car_release_type_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  type                 VARCHAR(100) NOT NULL,
  quantity             INT DEFAULT 0,
  created_at           DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 8. key_holder : ผู้ถือกุญแจรถ
-- ---------------------------------------------------------
CREATE TABLE key_holder (
  key_holder_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  key_holder_name   VARCHAR(255) NOT NULL,
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 9. parking : จุดจอดรถ
-- ---------------------------------------------------------
CREATE TABLE parking (
  parking_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  parking_name   VARCHAR(255) NOT NULL,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 10. payment : ประเภทการชำระเงิน
-- ---------------------------------------------------------
CREATE TABLE payment (
  payment_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  payment_name   VARCHAR(100) NOT NULL,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 11. car_release : ใบปล่อยรถ (หัวรายการ)
-- ---------------------------------------------------------
CREATE TABLE car_release (
  car_release_id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  car_release_no          VARCHAR(50) NOT NULL COMMENT 'เลขที่ใบปล่อยรถ',
  car_id                  INT UNSIGNED NOT NULL,
  car_release_type_id     INT UNSIGNED,
  user_id                 INT UNSIGNED NOT NULL COMMENT 'พนักงานขับรถ',
  group_store_id          INT UNSIGNED COMMENT 'กรุ๊ปเส้นทางที่ปล่อยรถไปวิ่ง',
  mileage                 INT COMMENT 'เลขไมล์ตอนออก',
  image_mileage           VARCHAR(500),
  image_front             VARCHAR(500),
  image_around_1          VARCHAR(500),
  image_around_2          VARCHAR(500),
  image_around_3          VARCHAR(500),
  image_around_4          VARCHAR(500),
  image_around_5          VARCHAR(500),
  image_pda               VARCHAR(500) COMMENT 'รูปเครื่อง PDA',
  pda_device               VARCHAR(100) COMMENT 'รหัส/หมายเลขเครื่อง PDA',
  description               TEXT,
  total_number_of_bills    INT DEFAULT 0,
  total_amount              DECIMAL(12,2) DEFAULT 0,
  accounting_status         VARCHAR(50) COMMENT 'สถานะตรวจสอบบัญชี',
  accounting_note            TEXT,
  created_at                 DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (car_id) REFERENCES car(car_id),
  FOREIGN KEY (car_release_type_id) REFERENCES car_release_type(car_release_type_id),
  FOREIGN KEY (user_id) REFERENCES user(user_id),
  FOREIGN KEY (group_store_id) REFERENCES group_store(group_store_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 11.1 car_release_follower : รายชื่อผู้ติดตามในใบปล่อยรถ
--       (car_release.followers เดิมเป็น list เช่น ['นาย A','นาย B']
--        จึงแยกเป็นตาราง 1-to-many แทนการเก็บเป็น array ในคอลัมน์เดียว)
-- ---------------------------------------------------------
CREATE TABLE car_release_follower (
  follower_id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  car_release_id   INT UNSIGNED NOT NULL,
  follower_name    VARCHAR(255) NOT NULL,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (car_release_id) REFERENCES car_release(car_release_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 12. car_return : ใบคืนรถ
-- ---------------------------------------------------------
CREATE TABLE car_return (
  car_return_id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  car_release_id  INT UNSIGNED NOT NULL,
  key_holder_id   INT UNSIGNED,
  parking_id      INT UNSIGNED,
  mileage         INT COMMENT 'เลขไมล์ตอนกลับ',
  image_mileage   VARCHAR(500),
  image_front     VARCHAR(500),
  image_around_1  VARCHAR(500),
  image_around_2  VARCHAR(500),
  image_around_3  VARCHAR(500),
  image_around_4  VARCHAR(500),
  image_return    VARCHAR(500) COMMENT 'รูปตอนคืนรถโดยรวม',
  image_pda       VARCHAR(500),
  gas_bill        DECIMAL(10,2) COMMENT 'ค่าน้ำมัน',
  note            TEXT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (car_release_id) REFERENCES car_release(car_release_id),
  FOREIGN KEY (key_holder_id) REFERENCES key_holder(key_holder_id),
  FOREIGN KEY (parking_id) REFERENCES parking(parking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 13. list_store : รายการร้านค้าในรอบปล่อยรถ (route/checklist)
-- ---------------------------------------------------------
CREATE TABLE list_store (
  list_id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  store_id            INT UNSIGNED NOT NULL,
  group_store_id      INT UNSIGNED,
  row_order           INT DEFAULT 0 COMMENT 'ลำดับการแวะร้าน',
  sum_quantity        INT DEFAULT 0 COMMENT 'จำนวนสินค้ารวมสำหรับร้านนี้',
  lat_long            VARCHAR(100) COMMENT 'พิกัด ณ จุดที่วางแผน',
  store_name_result   VARCHAR(255) COMMENT 'ชื่อร้าน ณ เวลาบันทึกผล (snapshot)',
  bypass              TINYINT(1) DEFAULT 0 COMMENT 'ข้ามรายการนี้ (เป็นร้านซ้ำ/store เดียวกันกับรายการอื่นในรอบเดียวกัน)',
  off_site            TINYINT(1) DEFAULT 0 COMMENT 'นอกพื้นที่ที่กำหนดหรือไม่ -- ??',
  created_by          INT UNSIGNED,
  created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (car_release_id) REFERENCES car_release(car_release_id),
  FOREIGN KEY (store_id) REFERENCES store(store_id),
  FOREIGN KEY (group_store_id) REFERENCES group_store(group_store_id),
  FOREIGN KEY (created_by) REFERENCES user(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 14. check_in : เช็คอินที่ร้าน
-- ---------------------------------------------------------
CREATE TABLE check_in (
  check_in_id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  list_id            INT UNSIGNED NOT NULL,
  image_check_in     VARCHAR(500),
  date_time_check_in DATETIME,
  signature          VARCHAR(500) COMMENT 'ลายเซ็นผู้รับของ (path รูป/base64)',
  location           VARCHAR(100) COMMENT 'lat,long ตอนเช็คอินจริง',
  created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (list_id) REFERENCES list_store(list_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 14.1 visit_type : ประเภทการแวะร้าน/ลูกค้า
-- ---------------------------------------------------------
CREATE TABLE visit_type (
  visit_type_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  visit_type_name    VARCHAR(100) NOT NULL,
  created_at          DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO visit_type (visit_type_name) VALUES
  ('รับสินค้า'),
  ('ฝากส่ง'),
  ('เยี่ยมลูกค้า'),
  ('ส่งของ'),
  ('เปิดลูกค้าใหม่');

-- ---------------------------------------------------------
-- 15. check_out : เช็คเอาท์ที่ร้าน (รับเงิน/ปิดรายการ)
-- ---------------------------------------------------------
CREATE TABLE check_out (
  check_out_id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  list_id              INT UNSIGNED NOT NULL,
  payment_id           INT UNSIGNED COMMENT 'ประเภทการชำระ',
  image_bill           VARCHAR(500),
  date_time_check_out  DATETIME,
  cash                 DECIMAL(12,2) DEFAULT 0 COMMENT 'จำนวนเงินสด',
  transfer             DECIMAL(12,2) DEFAULT 0 COMMENT 'จำนวนเงินโอน',
  transfer_according   TINYINT(1) DEFAULT 0 COMMENT 'ชำระแบบโอนตามทีหลัง (ค้างชำระ/เครดิต)',
  off_site             TINYINT(1) DEFAULT 0 COMMENT 'เช็คเอาท์นอกสถานที่ (พิกัด/สถานที่ไม่ตรงกับร้าน)',
  paid                 TINYINT(1) DEFAULT 0 COMMENT 'ชำระครบแล้วหรือไม่',
  amount               DECIMAL(12,2) DEFAULT 0 COMMENT 'ยอดรวมทั้งหมด',
  visit_customer       TINYINT(1) DEFAULT 0 COMMENT 'ได้พบลูกค้าหรือไม่',
  visit_type_id        INT UNSIGNED COMMENT 'ประเภทการแวะ: รับสินค้า/ฝากส่ง/เยี่ยมลูกค้า/ส่งของ/เปิดลูกค้าใหม่',
  visit_note           TEXT COMMENT 'หมายเหตุเพิ่มเติมของการแวะ/ฝากของ',
  created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (list_id) REFERENCES list_store(list_id),
  FOREIGN KEY (payment_id) REFERENCES payment(payment_id),
  FOREIGN KEY (visit_type_id) REFERENCES visit_type(visit_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 16. check_out_image : รูปภาพประกอบการเช็คเอาท์ (หลายรูปต่อ 1 check_out)
-- ---------------------------------------------------------
CREATE TABLE check_out_image (
  image_check_out_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  check_out_id        INT UNSIGNED NOT NULL,
  image_check_out     VARCHAR(500) NOT NULL,
  created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (check_out_id) REFERENCES check_out(check_out_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 17. problem : รายการปัญหา/รายการปรับปรุงบิลต่อร้าน
-- ---------------------------------------------------------
CREATE TABLE problem (
  problem_id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  list_id              INT UNSIGNED NOT NULL,
  problem_name         VARCHAR(255),
  normal_bill          TINYINT(1) DEFAULT 0 COMMENT 'บิลปกติ',
  normal_bill_note     TEXT,
  edit_bill            TINYINT(1) DEFAULT 0 COMMENT 'มีการแก้บิล',
  edit_bill_note       TEXT,
  product_swap         TINYINT(1) DEFAULT 0 COMMENT 'มีการเปลี่ยนสินค้า',
  product_swap_note    TEXT,
  out_of_stock         TINYINT(1) DEFAULT 0 COMMENT 'สินค้าขาดสต็อก',
  out_of_stock_note    TEXT,
  overstock            TINYINT(1) DEFAULT 0 COMMENT 'สินค้าเกิน',
  overstock_note       TEXT,
  created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (list_id) REFERENCES list_store(list_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 18. problem_image : รูปภาพประกอบปัญหา (หลายรูปต่อ 1 problem)
-- ---------------------------------------------------------
CREATE TABLE problem_image (
  image_problem_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  problem_id        INT UNSIGNED NOT NULL,
  problem_image     VARCHAR(500) NOT NULL,
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (problem_id) REFERENCES problem(problem_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
