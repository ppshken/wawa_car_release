-- =========================================================
-- User Management Module - Migration Script
-- สร้างตาราง permission, role_permission และเพิ่ม field ใน access
-- รันบน phpMyAdmin หรือ MySQL CLI ได้ทันที
-- =========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------
-- 1. เพิ่ม description ให้ access table (ถ้ายังไม่มี)
-- ---------------------------------------------------------
ALTER TABLE access
  ADD COLUMN IF NOT EXISTS description TEXT AFTER access_name;

-- ---------------------------------------------------------
-- 2. permission : สิทธิ์ที่สามารถกำหนดให้ Role ได้
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS permission (
  permission_id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  permission_key   VARCHAR(100) NOT NULL UNIQUE COMMENT 'เช่น car_release.add, users.delete',
  permission_name  VARCHAR(255) NOT NULL COMMENT 'ชื่อแสดงผล เช่น เพิ่มใบปล่อยรถ',
  menu_group       VARCHAR(100) COMMENT 'กลุ่มเมนู เช่น car_release, users, stores',
  action_type      VARCHAR(50) COMMENT 'ประเภท: view, add, edit, delete',
  description      TEXT,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 3. role_permission : ผูก Role กับ Permission (many-to-many)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS role_permission (
  role_permission_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  level_user_id       INT UNSIGNED NOT NULL,
  permission_id       INT UNSIGNED NOT NULL,
  created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_role_perm (level_user_id, permission_id),
  FOREIGN KEY (level_user_id) REFERENCES level_user(level_user_id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permission(permission_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 4. Seed Default Permissions
-- ---------------------------------------------------------
INSERT IGNORE INTO permission (permission_key, permission_name, menu_group, action_type, description) VALUES
-- Dashboard
('dashboard.view', 'ดูภาพรวมระบบ', 'dashboard', 'view', 'เข้าถึงหน้า Dashboard'),

-- Car Release (ใบปล่อยรถ)
('car_release.view', 'ดูรายการใบปล่อยรถ', 'car_release', 'view', 'ดูรายการและรายละเอียดใบปล่อยรถ'),
('car_release.add', 'สร้างใบปล่อยรถ', 'car_release', 'add', 'สร้างใบปล่อยรถใหม่'),
('car_release.edit', 'แก้ไขใบปล่อยรถ', 'car_release', 'edit', 'แก้ไขข้อมูลใบปล่อยรถ'),
('car_release.delete', 'ลบใบปล่อยรถ', 'car_release', 'delete', 'ลบใบปล่อยรถออกจากระบบ'),

-- Driver (ประตูรถ & เช็คอิน)
('driver.view', 'เช็คอิน/เช็คเอาท์', 'driver', 'view', 'บันทึกเช็คอิน/เช็คเอาท์ที่ร้านค้า'),
('driver.add', 'เพิ่มรายการเช็คอิน', 'driver', 'add', 'เพิ่มรายการเช็คอินใหม่'),
('driver.edit', 'แก้ไขรายการเช็คอิน', 'driver', 'edit', 'แก้ไขข้อมูลเช็คอิน'),

-- Return (คืนกุญแจ)
('return.view', 'บันทึกคืนกุญแจ', 'return', 'view', 'เข้าถึงหน้าบันทึกคืนกุญแจ'),
('return.add', 'เพิ่มรายการคืนกุญแจ', 'return', 'add', 'บันทึกการคืนกุญแจใหม่'),

-- Stores (ร้านค้า)
('stores.view', 'ดูข้อมูลร้านค้า', 'stores', 'view', 'ดูรายชื่อร้านค้าทั้งหมด'),
('stores.add', 'เพิ่มร้านค้า', 'stores', 'add', 'เพิ่มร้านค้าใหม่'),
('stores.edit', 'แก้ไขร้านค้า', 'stores', 'edit', 'แก้ไขข้อมูลร้านค้า'),
('stores.delete', 'ลบร้านค้า', 'stores', 'delete', 'ลบร้านค้าออกจากระบบ'),

-- Reports (รายงาน)
('reports.view', 'ดูรายงาน', 'reports', 'view', 'เข้าถึงหน้ารายงานและบัญชี'),

-- Users (จัดการผู้ใช้งาน)
('users.view', 'ดูรายชื่อผู้ใช้งาน', 'users', 'view', 'ดูรายชื่อผู้ใช้งานทั้งหมด'),
('users.add', 'เพิ่มผู้ใช้งาน', 'users', 'add', 'สร้างบัญชีผู้ใช้งานใหม่'),
('users.edit', 'แก้ไขผู้ใช้งาน', 'users', 'edit', 'แก้ไขข้อมูลผู้ใช้งาน'),
('users.delete', 'ลบผู้ใช้งาน', 'users', 'delete', 'ลบบัญชีผู้ใช้งาน');

SET FOREIGN_KEY_CHECKS = 1;
