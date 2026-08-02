-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 31, 2026 at 01:02 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `car_release_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `access`
--

CREATE TABLE `access` (
  `access_id` int(10) UNSIGNED NOT NULL,
  `access_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `access`
--

INSERT INTO `access` (`access_id`, `access_name`, `description`, `created_at`) VALUES
(1, 'System Administrator', NULL, '2026-07-20 15:12:13'),
(2, 'Admin', NULL, '2026-07-20 15:12:13'),
(3, 'Driver', NULL, '2026-07-20 15:12:13');

-- --------------------------------------------------------

--
-- Table structure for table `accounting_status`
--

CREATE TABLE `accounting_status` (
  `status_id` int(11) NOT NULL,
  `status_code` varchar(50) DEFAULT NULL,
  `status_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` varchar(20) DEFAULT 'active',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `accounting_status`
--

INSERT INTO `accounting_status` (`status_id`, `status_code`, `status_name`, `description`, `status`, `created_at`) VALUES
(1, 'ACC-WAIT', 'รอ...', 'รอดำเนินการ', 'active', '2026-07-23 10:28:11'),
(2, 'ACC_SAVEAC', 'บันทึกบัญชีแล้ว', 'ทำการบันทึกบัญชีแล้วเรียบร้อย', 'active', '2026-07-23 10:28:11'),
(3, 'ACC_PROCESS', 'กำลังดำเนินการ', 'อยู่ระหว่างดำเนินการตรวจสอบ', 'active', '2026-07-23 10:28:11'),
(4, 'ACC_DONE', 'เคลียร์เงินแล้ว', 'รายการเคลียร์แล้วเรียบร้อย', 'active', '2026-07-23 10:28:11'),
(5, 'ACC_PROBLEM', 'ติดปัญหา', 'รายการติดปัญหา', 'active', '2026-07-23 10:28:11');

-- --------------------------------------------------------

--
-- Table structure for table `api_keys`
--

CREATE TABLE `api_keys` (
  `id` int(11) NOT NULL,
  `key_name` varchar(100) NOT NULL,
  `key_service` varchar(100) NOT NULL,
  `key_value` text NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `api_keys`
--

INSERT INTO `api_keys` (`id`, `key_name`, `key_service`, `key_value`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'OPTIMOROUTE_API_KEY', 'OptimoRoute', '430a4eb0ac4140d1a1498ddfbd7197fcPP64S5MVDFM', 'API Key สำหรับเชื่อมต่อกับ OptimoRoute API ในการจัดวางเส้นทางเดินรถและนำเข้าข้อมูล', 1, '2026-07-31 12:20:01', '2026-07-31 12:20:01'),
(2, 'GPS_API_TOKEN', 'GPS IAM', '13dade62-5bd6-4082-b0ce-36757dec0d47', 'Bearer Token สำหรับเรียกใช้ GPS IAM API ติดตามพิกัดตำแหน่งรถจัดส่งสินค้า', 1, '2026-07-31 12:20:01', '2026-07-31 12:20:01'),
(3, 'GPS_API_URL', 'GPS IAM', 'https://api.gpsiam.app/devices', 'Endpoint URL หลักสำหรับเรียกดูอุปกรณ์ GPS รถยนต์ทั้งหมดในระบบ', 1, '2026-07-31 12:20:01', '2026-07-31 12:20:01');

-- --------------------------------------------------------

--
-- Table structure for table `audit_log`
--

CREATE TABLE `audit_log` (
  `log_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `target_type` varchar(50) NOT NULL,
  `target_id` varchar(100) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_log`
--

INSERT INTO `audit_log` (`log_id`, `user_id`, `username`, `user_name`, `action`, `target_type`, `target_id`, `details`, `ip_address`, `created_at`) VALUES
(1, 1, 'admin', 'ผู้ดูแลระบบ (Admin)', 'DELETE_CAR_RELEASE', 'car_release', '19', '{\"car_release_id\":\"19\"}', '::1', '2026-07-30 11:25:11'),
(2, 1, 'admin', 'ผู้ดูแลระบบ (Admin)', 'DELETE_CAR_RELEASE', 'car_release', '20', '{\"car_release_id\":\"20\"}', '::1', '2026-07-30 11:25:12'),
(3, 1, 'admin', 'ผู้ดูแลระบบ (Admin)', 'CREATE_CAR_RELEASE', 'car_release', '21', '{\"releaseNo\":\"TMS-2026730-0001\",\"car_id\":\"A1810313-660D-4A1A-A37C-F1BBD350FDB7\",\"user_id\":11,\"mileage\":25000,\"followersCount\":2}', '::1', '2026-07-30 11:26:41'),
(4, 1, 'admin', 'ผู้ดูแลระบบ (Admin)', 'CREATE_CAR_RELEASE', 'car_release', '22', '{\"releaseNo\":\"TMS-2026730-0002\",\"car_id\":\"8654808D-557B-46DD-9AC4-5BA5514041D6\",\"user_id\":12,\"mileage\":0,\"followersCount\":1}', '::1', '2026-07-30 11:39:13'),
(5, 1, 'admin', 'ผู้ดูแลระบบ (Admin)', 'UPDATE_CAR_RELEASE', 'car_release', '22', '{\"car_id\":\"8654808D-557B-46DD-9AC4-5BA5514041D6\",\"user_id\":12,\"mileage\":120000,\"accounting_status\":1}', '::1', '2026-07-30 11:39:34'),
(6, 1, 'admin', 'ผู้ดูแลระบบ (Admin)', 'CREATE_CAR_RELEASE', 'car_release', '23', '{\"releaseNo\":\"TMS-2026730-0003\",\"car_id\":\"BA55C959-C493-4899-B8F7-BB291D20C11F\",\"user_id\":6,\"mileage\":280000,\"followersCount\":1}', '::1', '2026-07-30 11:52:31'),
(7, 1, 'admin', 'ผู้ดูแลระบบ (Admin)', 'CREATE_CAR_RELEASE', 'car_release', '24', '{\"releaseNo\":\"TMS-2026730-0004\",\"car_id\":\"B918C15B-83A7-4E9E-B181-78E357D10AE0\",\"user_id\":12,\"mileage\":0,\"followersCount\":0}', '::1', '2026-07-30 11:52:54'),
(8, 1, 'admin', 'ผู้ดูแลระบบ (Admin)', 'CREATE_CAR_RELEASE', 'car_release', '25', '{\"releaseNo\":\"TMS-2026730-0005\",\"car_id\":\"A9609BCC-1C9A-44A4-9C6E-3D6C8109C7EC\",\"user_id\":12,\"mileage\":0,\"followersCount\":0}', '::1', '2026-07-30 11:52:59'),
(9, 1, 'admin', 'ผู้ดูแลระบบ (Admin)', 'CREATE_CAR_RELEASE', 'car_release', '26', '{\"releaseNo\":\"TMS-2026730-0006\",\"car_id\":\"BA55C959-C493-4899-B8F7-BB291D20C11F\",\"user_id\":12,\"mileage\":0,\"followersCount\":0}', '::1', '2026-07-30 11:59:40'),
(10, 1, 'admin', 'ผู้ดูแลระบบ (Admin)', 'DELETE_CAR_RELEASE', 'car_release', '26', '{\"car_release_id\":\"26\"}', '::1', '2026-07-30 11:59:57'),
(11, 1, 'admin', 'ผู้ดูแลระบบ (Admin)', 'DELETE_CAR_RELEASE', 'car_release', '21', '{\"car_release_id\":\"21\"}', '::1', '2026-07-30 12:03:25'),
(12, 1, 'admin', 'ผู้ดูแลระบบ (Admin)', 'DELETE_CAR_RELEASE', 'car_release', '22', '{\"car_release_id\":\"22\"}', '::1', '2026-07-30 12:03:27'),
(13, 1, 'admin', 'ผู้ดูแลระบบ (Admin)', 'DELETE_CAR_RELEASE', 'car_release', '23', '{\"car_release_id\":\"23\"}', '::1', '2026-07-30 12:03:29'),
(14, 1, 'admin', 'ผู้ดูแลระบบ (Admin)', 'DELETE_CAR_RELEASE', 'car_release', '24', '{\"car_release_id\":\"24\"}', '::1', '2026-07-30 12:03:32'),
(15, 1, 'admin', 'ผู้ดูแลระบบ (Admin)', 'DELETE_CAR_RELEASE', 'car_release', '25', '{\"car_release_id\":\"25\"}', '::1', '2026-07-30 12:03:34'),
(16, 1, 'admin', 'ผู้ดูแลระบบ (Admin)', 'CREATE_CAR_RELEASE', 'car_release', '27', '{\"releaseNo\":\"TMS-2026730-0001\",\"car_id\":\"8654808D-557B-46DD-9AC4-5BA5514041D6\",\"user_id\":12,\"mileage\":0,\"followersCount\":2}', '::1', '2026-07-30 12:05:31'),
(17, 1, 'admin', 'ผู้ดูแลระบบ (Admin)', 'UPDATE_CAR_RELEASE', 'car_release', '27', '{\"car_id\":\"8654808D-557B-46DD-9AC4-5BA5514041D6\",\"user_id\":12,\"mileage\":0,\"accounting_status\":1}', '::1', '2026-07-30 12:07:57'),
(18, 1, 'admin', 'ผู้ดูแลระบบ (Admin)', 'CREATE_CAR_RELEASE', 'car_release', '1', '{\"releaseNo\":\"TMS-2026731-0001\",\"car_id\":\"BA55C959-C493-4899-B8F7-BB291D20C11F\",\"user_id\":12,\"mileage\":0,\"followersCount\":1}', '::1', '2026-07-31 11:36:57'),
(19, 1, 'admin', 'ผู้ดูแลระบบ (Admin)', 'DELETE_CAR_RELEASE', 'car_release', '1', '{\"car_release_id\":\"1\"}', '::1', '2026-07-31 11:48:40'),
(20, 1, 'admin', 'ผู้ดูแลระบบ (Admin)', 'CREATE_CAR_RELEASE', 'car_release', '2', '{\"releaseNo\":\"TMS-2026731-0001\",\"car_id\":\"B918C15B-83A7-4E9E-B181-78E357D10AE0\",\"user_id\":12,\"mileage\":0,\"followersCount\":1}', '::1', '2026-07-31 11:52:31'),
(21, 1, 'admin', 'ผู้ดูแลระบบ (Admin)', 'DELETE_CAR_RELEASE', 'car_release', '2', '{\"car_release_id\":\"2\"}', '::1', '2026-07-31 13:26:04'),
(22, 1, 'admin', 'ผู้ดูแลระบบ (Admin)', 'CREATE_CAR_RELEASE', 'car_release', '3', '{\"releaseNo\":\"TMS-2026731-0001\",\"car_id\":\"B7BEA9BB-79BA-4B77-BC85-BCF71B34747D\",\"user_id\":12,\"mileage\":249999,\"followersCount\":1}', '::ffff:127.0.0.1', '2026-07-31 16:42:55'),
(23, 1, 'admin', 'ผู้ดูแลระบบ (Admin)', 'DELETE_CAR_RELEASE', 'car_release', '3', '{\"car_release_id\":\"3\"}', '::1', '2026-07-31 16:48:41'),
(24, 1, 'admin', 'ผู้ดูแลระบบ (Admin)', 'CREATE_CAR_RELEASE', 'car_release', '4', '{\"releaseNo\":\"TMS-2026731-0001\",\"car_id\":\"56F2B993-D77D-45F2-9699-B8F80B631D21\",\"user_id\":20,\"mileage\":25000,\"followersCount\":1}', '::1', '2026-07-31 17:52:45'),
(25, 1, 'admin', 'ผู้ดูแลระบบ (Admin)', 'CREATE_CAR_RELEASE', 'car_release', '5', '{\"releaseNo\":\"TMS-2026731-0002\",\"car_id\":\"6AA6A18E-CA40-4AEE-B1DA-EF5B29F06ADE\",\"user_id\":18,\"mileage\":2399978,\"followersCount\":0}', '::1', '2026-07-31 17:54:14'),
(26, 1, 'admin', 'ผู้ดูแลระบบ (Admin)', 'CREATE_CAR_RELEASE', 'car_release', '6', '{\"releaseNo\":\"TMS-2026731-0003\",\"car_id\":\"7975AFB1-FAD0-4FF3-95D2-2C2F742E1E0C\",\"user_id\":17,\"mileage\":125000,\"followersCount\":0}', '::1', '2026-07-31 17:55:05');

-- --------------------------------------------------------

--
-- Table structure for table `car`
--

CREATE TABLE `car` (
  `car_id` varchar(100) NOT NULL,
  `ID` varchar(20) DEFAULT NULL,
  `license_plate` varchar(50) NOT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `sub_model` varchar(100) DEFAULT NULL,
  `year` year(4) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `car_image` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `car`
--

INSERT INTO `car` (`car_id`, `ID`, `license_plate`, `brand`, `model`, `sub_model`, `year`, `quantity`, `created_at`, `car_image`) VALUES
('281AB033-F649-404F-98C7-6CAC178639CF', '103924', 'ผบ153[26]', 'TOYOTA', 'HILUX VIGO', 'VIGO DOUBLE CAB 2.5 E', '2015', 240, '2026-07-23 17:45:19', '/uploads/vehicles/img-1785090632222-737575500.jpg'),
('30BC5F89-A597-4D38-8D3A-4A109F060A3E', '', 'ซาเล้ง ขาว', 'HONDA', 'BR-V', '1.5 SV', '2017', 20, '2026-07-23 17:45:19', '/uploads/vehicles/img-1785090620824-340537132.jpg'),
('3193B379-ECDA-4B56-835D-71CE8E8F99D9', '', 'ผจ5131[23]', 'MITSUBISHI', 'TRITON', 'DOUBLE CAB 2.4 GLS PLUS', '2014', 100, '2026-07-23 17:45:19', '/uploads/vehicles/img-1785090612500-340226635.jpg'),
('31D6E73A-5746-4CA7-9FEB-2EFFEF814801', '', '2ขฒ7070', 'BYD', 'ATTO 3', 'EXTENDED RANG EWAGON CBU EV FWD 1 SP REDUTION', '2023', 100, '2026-07-23 17:45:19', '/uploads/vehicles/img-1785090604738-512186026.jpg'),
('40DFD98F-5F15-44D5-ABA9-6146A76CB6FF', '', '1ขผ1616', 'TOYOTA', 'ALPHARD', '3.5 VIP', '2019', 100, '2026-07-23 17:45:19', '/uploads/vehicles/img-1785090598150-43709113.jpg'),
('56F2B993-D77D-45F2-9699-B8F80B631D21', '103957', 'ผธ4108 [18]', 'TOYOTA', 'ALPHARD', '3.5', '2016', 200, '2026-07-23 17:45:19', '/uploads/vehicles/img-1785090468616-537606253.jpg'),
('5DC35337-8370-49C3-8402-1A471A3F0BF2', '103955', 'ผน 3279 [16]', 'TOYOTA', 'COMMUTER', 'HIGH ROOF 2.5', '2013', 220, '2026-07-23 17:45:19', '/uploads/vehicles/img-1785090588504-260864846.jpg'),
('6AA6A18E-CA40-4AEE-B1DA-EF5B29F06ADE', '103959', 'ผบ 4772 [46]', 'TOYOTA', 'HILUX VIGO', 'VIGO DOUBLE CAB 2.5 G', '2015', 210, '2026-07-23 17:45:19', '/uploads/vehicles/img-1785090582072-832680508.jpg'),
('7975AFB1-FAD0-4FF3-95D2-2C2F742E1E0C', '103961', 'ผธ 4253 [19]', 'TOYOTA', 'ALPHARD', '2.5 HV', '2017', 220, '2026-07-23 17:45:19', '/uploads/vehicles/img-1785090572947-472163762.jpg'),
('80C0F86E-4FCB-4A63-BA15-5BAE389EC326', '', 'ขก 5389', 'MAZDA', 'CX-5', '2 SP', '2018', 100, '2026-07-23 17:45:19', '/uploads/vehicles/img-1785090562384-949648913.jpg'),
('8654808D-557B-46DD-9AC4-5BA5514041D6', '', 'ผก 359[33]', 'MAZDA', 'BT-50', 'DOUBLE CAB 2.5 HI-RACER', '2012', 50, '2026-07-23 17:45:19', '/uploads/vehicles/img-1785090554651-238587546.jpg'),
('8B50A0D7-782D-49A3-8F64-EC12DB83E086', '', 'บห 4780[21]', 'NISSAN', 'FRONTIER', 'SINGLE CAB 2.5 AE', '2007', 100, '2026-07-23 17:45:19', '/uploads/vehicles/img-1785090546752-713042541.jpg'),
('A1810313-660D-4A1A-A37C-F1BBD350FDB7', '', 'ผค 9282[22]', 'MITSUBISHI', 'TRITON', 'DOUBLE CAB 2.4 GLS PLUS', '2014', 100, '2026-07-23 17:45:19', '/uploads/vehicles/img-1785090531316-925893998.jpg'),
('A9609BCC-1C9A-44A4-9C6E-3D6C8109C7EC', '103956', 'ผบ 3875[38]', 'TOYOTA', 'HILUX REVO', 'REVO DOUBLE CAB 2.4 PRERUNNER E', '2016', 100, '2026-07-23 17:45:19', '/uploads/vehicles/img-1785090522045-30467416.jpg'),
('B4D007CE-1DF9-469C-8FFD-607B5F976BE4', '', 'ผบ 439 [31]', 'ISUZU', 'D-MAX', 'CAB4 2.5 Z', '2014', 100, '2026-07-23 17:45:19', '/uploads/vehicles/img-1785090511163-149150218.jpg'),
('B7BEA9BB-79BA-4B77-BC85-BCF71B34747D', '103963', '84-6565 [41]', 'ISUZU', 'ELF', 'SPARK 3 NLR LITE', '2020', 330, '2026-07-23 17:45:19', '/uploads/vehicles/img-1785090502939-92460226.jpg'),
('B918C15B-83A7-4E9E-B181-78E357D10AE0', '103958', 'ผบ 3876 [37]', 'TOYOTA', 'HILUX VIGO', 'VIGO DOUBLE CAB 2.5 E', '2015', 215, '2026-07-23 17:45:19', '/uploads/vehicles/img-1785090496338-515903237.jpg'),
('BA55C959-C493-4899-B8F7-BB291D20C11F', '103954', 'ผบ152[27]', 'TOYOTA', 'HILUX VIGO', 'VIGO DOUBLE CAB 2.5 E', '2014', 240, '2026-07-23 17:45:19', '/uploads/vehicles/img-1785090482567-45393647.jpg'),
('C4720370-2A9D-4E60-BC61-2A332CF91136', '', '9 กน 32', 'MERCEDES BENZ', 'A200', '1.3 PROGRESSIVE', '2022', 100, '2026-07-23 17:45:19', '/uploads/vehicles/img-1785090407559-1620078.jpg'),
('F62D5367-F4EF-48D1-8CFC-B0934833E620', '103922', '84-7538[34]', 'ISUZU', 'ELF', 'SPARK 3 NLR LITE', '2020', 100, '2026-07-23 17:45:19', '/uploads/vehicles/img-1785090395117-593608264.jpg'),
('FC1FB87D-4F87-4C9B-B1AD-DF6A8921B4DF', '', '84-6566 อด[36]', 'ISUZU', 'ELF', 'SPARK 3 NLR LITE', '2021', 2000, '2026-07-23 17:45:19', '/uploads/vehicles/img-1785090360514-642114916.jpg'),
('FF98B8F7-B468-4831-B4E6-252C76E24227', '103923', '84-2566[28]', 'ISUZU', 'ELF', 'SPARK 3 NLR LITE', '2020', 2000, '2026-07-23 17:45:19', '/uploads/vehicles/img-1785090294161-764021255.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `car_release`
--

CREATE TABLE `car_release` (
  `car_release_id` int(10) UNSIGNED NOT NULL,
  `car_release_no` varchar(50) NOT NULL COMMENT 'เลขที่ใบปล่อยรถ',
  `car_id` varchar(100) NOT NULL,
  `car_release_type_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL COMMENT 'พนักงานขับรถ',
  `group_store_id` int(10) UNSIGNED DEFAULT NULL COMMENT 'กรุ๊ปเส้นทางที่ปล่อยรถไปวิ่ง',
  `mileage` int(11) DEFAULT NULL COMMENT 'เลขไมล์ตอนออก',
  `image_mileage` varchar(500) DEFAULT NULL,
  `image_front` varchar(500) DEFAULT NULL,
  `image_around_1` varchar(500) DEFAULT NULL,
  `image_around_2` varchar(500) DEFAULT NULL,
  `image_around_3` varchar(500) DEFAULT NULL,
  `image_around_4` varchar(500) DEFAULT NULL,
  `image_around_5` varchar(500) DEFAULT NULL,
  `image_pda` varchar(500) DEFAULT NULL COMMENT 'รูปเครื่อง PDA',
  `pda_device` int(11) UNSIGNED DEFAULT NULL COMMENT 'รหัส/หมายเลขเครื่อง PDA',
  `description` text DEFAULT NULL,
  `total_number_of_bills` int(11) DEFAULT 0,
  `total_amount` decimal(12,2) DEFAULT 0.00,
  `accounting_status` int(11) DEFAULT NULL COMMENT 'สถานะตรวจสอบบัญชี',
  `accounting_note` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `car_release`
--

INSERT INTO `car_release` (`car_release_id`, `car_release_no`, `car_id`, `car_release_type_id`, `user_id`, `group_store_id`, `mileage`, `image_mileage`, `image_front`, `image_around_1`, `image_around_2`, `image_around_3`, `image_around_4`, `image_around_5`, `image_pda`, `pda_device`, `description`, `total_number_of_bills`, `total_amount`, `accounting_status`, `accounting_note`, `created_at`) VALUES
(4, 'TMS-2026731-0001', '56F2B993-D77D-45F2-9699-B8F80B631D21', 1, 20, 12, 25000, '/uploads/car_release/TMS-2026731-0001/img-1785495165436-6065990.jpg', '/uploads/car_release/TMS-2026731-0001/img-1785495165449-541204779.jpg', '/uploads/car_release/TMS-2026731-0001/img-1785495165459-629011412.jpg', '/uploads/car_release/TMS-2026731-0001/img-1785495165469-572550741.jpg', '/uploads/car_release/TMS-2026731-0001/img-1785495165477-119228384.jpg', '/uploads/car_release/TMS-2026731-0001/img-1785495165485-55869163.jpg', '/uploads/car_release/TMS-2026731-0001/img-1785495165494-930241823.jpg', '/uploads/car_release/TMS-2026731-0001/img-1785495165505-121991634.jpg', 3, 'ปล่อยรถ ทะเบียน ผธ4108 [18] คนขับ แม็ก', 0, 0.00, 1, NULL, '2026-07-31 17:52:45'),
(5, 'TMS-2026731-0002', '6AA6A18E-CA40-4AEE-B1DA-EF5B29F06ADE', 1, 18, 14, 2399978, '/uploads/car_release/TMS-2026731-0002/img-1785495254592-331598955.jpg', '/uploads/car_release/TMS-2026731-0002/img-1785495254605-641852252.jpg', '/uploads/car_release/TMS-2026731-0002/img-1785495254614-448504032.jpg', '/uploads/car_release/TMS-2026731-0002/img-1785495254624-758549223.jpg', '/uploads/car_release/TMS-2026731-0002/img-1785495254633-83928781.jpg', '/uploads/car_release/TMS-2026731-0002/img-1785495254642-875000383.jpg', '/uploads/car_release/TMS-2026731-0002/img-1785495254651-441029730.jpg', '/uploads/car_release/TMS-2026731-0002/img-1785495254661-397983546.jpg', 2, 'ปล่อยรถ ทะเบียน ผบ 4772 [46] คนขับ เน็ต', 0, 0.00, 1, NULL, '2026-07-31 17:54:14'),
(6, 'TMS-2026731-0003', '7975AFB1-FAD0-4FF3-95D2-2C2F742E1E0C', 1, 17, 15, 125000, '/uploads/car_release/TMS-2026731-0003/img-1785495305093-673700896.jpg', '/uploads/car_release/TMS-2026731-0003/img-1785495305106-716300308.jpg', '/uploads/car_release/TMS-2026731-0003/img-1785495305118-313399946.jpg', '/uploads/car_release/TMS-2026731-0003/img-1785495305130-73207731.jpg', '/uploads/car_release/TMS-2026731-0003/img-1785495305139-575709679.jpg', '/uploads/car_release/TMS-2026731-0003/img-1785495305147-83420584.jpg', '/uploads/car_release/TMS-2026731-0003/img-1785495305155-850580737.jpg', '/uploads/car_release/TMS-2026731-0003/img-1785495305165-673371598.jpg', 4, 'ปล่อยรถ ทะเบียน ผธ 4253 [19] คนขับ เก๋ง', 0, 0.00, 1, NULL, '2026-07-31 17:55:05');

-- --------------------------------------------------------

--
-- Table structure for table `car_release_chat`
--

CREATE TABLE `car_release_chat` (
  `chat_id` int(10) UNSIGNED NOT NULL,
  `car_release_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `sender_name` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `car_release_chat`
--

INSERT INTO `car_release_chat` (`chat_id`, `car_release_id`, `user_id`, `sender_name`, `message`, `image_url`, `created_at`) VALUES
(1, 19, 1, 'ผู้ดูแลระบบ (Admin)', 'พร้อมไหม', NULL, '2026-07-30 11:15:36'),
(2, 19, 1, 'ผู้ดูแลระบบ (Admin)', 'ว่ายังไงครับ', NULL, '2026-07-30 11:15:41'),
(3, 6, 1, 'ผู้ดูแลระบบ (Admin)', 'ติดตามรถครับ รถเป็นยังไงบ้างครับ', NULL, '2026-07-31 17:56:07');

-- --------------------------------------------------------

--
-- Table structure for table `car_release_follower`
--

CREATE TABLE `car_release_follower` (
  `follower_id` int(10) UNSIGNED NOT NULL,
  `car_release_id` int(10) UNSIGNED NOT NULL,
  `follower_name` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `car_release_follower`
--

INSERT INTO `car_release_follower` (`follower_id`, `car_release_id`, `follower_name`, `created_at`) VALUES
(29, 4, 'บอย', '2026-07-31 17:52:45');

-- --------------------------------------------------------

--
-- Table structure for table `car_release_type`
--

CREATE TABLE `car_release_type` (
  `car_release_type_id` int(10) UNSIGNED NOT NULL,
  `type` varchar(100) NOT NULL,
  `quantity` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `car_release_type`
--

INSERT INTO `car_release_type` (`car_release_type_id`, `type`, `quantity`, `created_at`) VALUES
(1, 'ส่งของ', 50, '2026-07-20 15:12:14'),
(2, 'รับสินค้า', 20, '2026-07-20 15:12:14'),
(3, 'ฝากส่ง', 10, '2026-07-20 15:12:14'),
(4, 'เยี่ยมลูกค้า', 0, '2026-07-31 16:30:36'),
(5, 'เปิดลูกค้าใหม่', 0, '2026-07-31 16:30:42');

-- --------------------------------------------------------

--
-- Table structure for table `car_return`
--

CREATE TABLE `car_return` (
  `car_return_id` int(10) UNSIGNED NOT NULL,
  `car_release_id` int(10) UNSIGNED NOT NULL,
  `key_holder_id` int(10) UNSIGNED DEFAULT NULL,
  `parking_id` int(10) UNSIGNED DEFAULT NULL,
  `mileage` int(11) DEFAULT NULL COMMENT 'เลขไมล์ตอนกลับ',
  `image_mileage` varchar(500) DEFAULT NULL,
  `image_front` varchar(500) DEFAULT NULL,
  `image_around_1` varchar(500) DEFAULT NULL,
  `image_around_2` varchar(500) DEFAULT NULL,
  `image_around_3` varchar(500) DEFAULT NULL,
  `image_around_4` varchar(500) DEFAULT NULL,
  `image_return` varchar(500) DEFAULT NULL COMMENT 'รูปตอนคืนรถโดยรวม',
  `image_pda` varchar(500) DEFAULT NULL,
  `gas_bill` decimal(10,2) DEFAULT NULL COMMENT 'ค่าน้ำมัน',
  `note` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `check_in`
--

CREATE TABLE `check_in` (
  `check_in_id` int(10) UNSIGNED NOT NULL,
  `list_id` int(10) UNSIGNED NOT NULL,
  `image_check_in` varchar(500) DEFAULT NULL,
  `date_time_check_in` datetime DEFAULT NULL,
  `signature` varchar(500) DEFAULT NULL COMMENT 'ลายเซ็นผู้รับของ (path รูป/base64)',
  `location` varchar(100) DEFAULT NULL COMMENT 'lat,long ตอนเช็คอินจริง',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `check_out`
--

CREATE TABLE `check_out` (
  `check_out_id` int(10) UNSIGNED NOT NULL,
  `list_id` int(10) UNSIGNED NOT NULL,
  `payment_id` int(10) UNSIGNED DEFAULT NULL COMMENT 'ประเภทการชำระ',
  `image_bill` varchar(500) DEFAULT NULL,
  `date_time_check_out` datetime DEFAULT NULL,
  `cash` decimal(12,2) DEFAULT 0.00 COMMENT 'จำนวนเงินสด',
  `transfer` decimal(12,2) DEFAULT 0.00 COMMENT 'จำนวนเงินโอน',
  `transfer_according` tinyint(1) DEFAULT 0 COMMENT 'ชำระแบบโอนตามทีหลัง (ค้างชำระ/เครดิต)',
  `off_site` tinyint(1) DEFAULT 0 COMMENT 'เช็คเอาท์นอกสถานที่ (พิกัด/สถานที่ไม่ตรงกับร้าน)',
  `paid` tinyint(1) DEFAULT 0 COMMENT 'ชำระครบแล้วหรือไม่',
  `amount` decimal(12,2) DEFAULT 0.00 COMMENT 'ยอดรวมทั้งหมด',
  `visit_customer` tinyint(1) DEFAULT 0 COMMENT 'ได้พบลูกค้าหรือไม่',
  `visit_type_id` int(10) UNSIGNED DEFAULT NULL COMMENT 'ประเภทการแวะ: รับสินค้า/ฝากส่ง/เยี่ยมลูกค้า/ส่งของ/เปิดลูกค้าใหม่',
  `visit_note` text DEFAULT NULL COMMENT 'หมายเหตุเพิ่มเติมของการแวะ/ฝากของ',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `check_out_image`
--

CREATE TABLE `check_out_image` (
  `image_check_out_id` int(10) UNSIGNED NOT NULL,
  `check_out_id` int(10) UNSIGNED NOT NULL,
  `image_check_out` varchar(500) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `delivery_settings`
--

CREATE TABLE `delivery_settings` (
  `id` int(11) NOT NULL,
  `service_time_per_stop` int(11) DEFAULT 10,
  `priority_strategy` varchar(50) DEFAULT 'fastest_time',
  `depot_start_time` varchar(10) DEFAULT '08:00',
  `buffer_time_per_route` int(11) DEFAULT 15,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `delivery_settings`
--

INSERT INTO `delivery_settings` (`id`, `service_time_per_stop`, `priority_strategy`, `depot_start_time`, `buffer_time_per_route`, `updated_at`) VALUES
(1, 5, 'fastest_time', '10:30', 15, '2026-07-31 17:26:51');

-- --------------------------------------------------------

--
-- Table structure for table `group_store`
--

CREATE TABLE `group_store` (
  `group_store_id` int(10) UNSIGNED NOT NULL,
  `group_store_name` varchar(255) NOT NULL,
  `car_id` varchar(100) DEFAULT NULL,
  `group_color` varchar(20) DEFAULT NULL COMMENT 'สีสำหรับแสดงบนแผนที่',
  `date` date DEFAULT NULL,
  `status` tinyint(1) DEFAULT 0 COMMENT '0=ยังไม่ปล่อยรถ/1=ปล่อยรถแล้ว',
  `load1` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `group_store`
--

INSERT INTO `group_store` (`group_store_id`, `group_store_name`, `car_id`, `group_color`, `date`, `status`, `load1`, `created_at`) VALUES
(12, 'Auto-Route001', '56F2B993-D77D-45F2-9699-B8F80B631D21', '#3b82f6', '2026-07-31', 1, 200, '2026-07-31 17:26:51'),
(13, 'Auto-Route002', '5DC35337-8370-49C3-8402-1A471A3F0BF2', '#10b981', '2026-07-31', 0, 12, '2026-07-31 17:26:51'),
(14, 'Auto-Route003', '6AA6A18E-CA40-4AEE-B1DA-EF5B29F06ADE', '#f59e0b', '2026-07-31', 1, 88, '2026-07-31 17:26:51'),
(15, 'Auto-Route004', '7975AFB1-FAD0-4FF3-95D2-2C2F742E1E0C', '#ef4444', '2026-07-31', 1, 213, '2026-07-31 17:26:51');

-- --------------------------------------------------------

--
-- Table structure for table `key_holder`
--

CREATE TABLE `key_holder` (
  `key_holder_id` int(10) UNSIGNED NOT NULL,
  `key_holder_name` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `key_holder`
--

INSERT INTO `key_holder` (`key_holder_id`, `key_holder_name`, `created_at`) VALUES
(1, 'ฝากยาม', '2026-07-20 15:12:14'),
(2, 'ติดรถ', '2026-07-20 15:12:14'),
(3, 'ตระกร้า บริษัท', '2026-07-20 15:12:14');

-- --------------------------------------------------------

--
-- Table structure for table `level_user`
--

CREATE TABLE `level_user` (
  `level_user_id` int(10) UNSIGNED NOT NULL,
  `level_user_name` varchar(100) NOT NULL,
  `access_id` int(10) UNSIGNED DEFAULT NULL,
  `setting_car_release` tinyint(1) DEFAULT 0 COMMENT 'สิทธิ์ตั้งค่า/ปล่อยรถ',
  `created_at` datetime DEFAULT current_timestamp(),
  `menu_permissions` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `level_user`
--

INSERT INTO `level_user` (`level_user_id`, `level_user_name`, `access_id`, `setting_car_release`, `created_at`, `menu_permissions`) VALUES
(1, 'แอดมินระบบ', 1, 1, '2026-07-20 15:12:13', '{\"dashboard\":true,\"releases\":true,\"route\":true,\"import_optimo\":true,\"reports\":true,\"users\":true,\"user_levels\":true,\"permissions\":true,\"user_access\":true,\"stores\":true,\"keys\":true,\"pda\":true,\"payments\":true,\"vehicles\":true,\"parking\":true,\"accounting_status\":true,\"position_product\":true,\"release_types\":true}'),
(2, 'แอดมิน', 2, 1, '2026-07-20 15:12:13', '{\"dashboard\":true,\"releases\":true,\"route\":true,\"import_optimo\":true,\"reports\":true,\"stores\":true,\"keys\":true,\"pda\":true,\"payments\":true,\"vehicles\":true,\"parking\":true,\"accounting_status\":true,\"position_product\":true,\"release_types\":true}'),
(3, 'พนักงานขับรถ', 3, 0, '2026-07-20 15:12:13', '{\"dashboard\":true,\"releases\":true,\"route\":true}');

-- --------------------------------------------------------

--
-- Table structure for table `list_store`
--

CREATE TABLE `list_store` (
  `list_id` int(10) UNSIGNED NOT NULL,
  `store_id` varchar(10) NOT NULL,
  `group_store_id` int(10) UNSIGNED DEFAULT NULL,
  `row_order` int(11) DEFAULT 0 COMMENT 'ลำดับการแวะร้าน',
  `sum_quantity` int(11) DEFAULT 0 COMMENT 'จำนวนสินค้ารวมสำหรับร้านนี้',
  `lat_long` varchar(100) DEFAULT NULL COMMENT 'พิกัด ณ จุดที่วางแผน',
  `store_name_result` varchar(255) DEFAULT NULL COMMENT 'ชื่อร้าน ณ เวลาบันทึกผล (snapshot)',
  `position_product_id` int(11) DEFAULT NULL COMMENT 'ตำแหน่งวางสินค้า',
  `position_production_order` int(11) DEFAULT NULL,
  `bypass` tinyint(1) DEFAULT 0 COMMENT 'ข้ามรายการนี้ (เป็นร้านซ้ำ/store เดียวกันกับรายการอื่นในรอบเดียวกัน)',
  `off_site` tinyint(1) DEFAULT 0 COMMENT 'นอกพื้นที่ที่กำหนดหรือไม่ -- ??',
  `created_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `data_store_no` varchar(100) DEFAULT NULL,
  `status` enum('in_progress','completed','problem','unassigned') DEFAULT NULL,
  `scheduled_time` time DEFAULT NULL,
  `start_service_time` datetime DEFAULT NULL,
  `end_service_time` datetime DEFAULT NULL,
  `priority` varchar(20) DEFAULT 'medium',
  `pod_image` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `list_store`
--

INSERT INTO `list_store` (`list_id`, `store_id`, `group_store_id`, `row_order`, `sum_quantity`, `lat_long`, `store_name_result`, `position_product_id`, `position_production_order`, `bypass`, `off_site`, `created_by`, `created_at`, `data_store_no`, `status`, `scheduled_time`, `start_service_time`, `end_service_time`, `priority`, `pod_image`) VALUES
(433, 'OR-00515', 15, 60, 3, '17.135584, 102.944292', 'ยอยุ้ย กวดวิชา', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'ฝากส่ง', 'in_progress', '19:53:00', NULL, NULL, 'medium', NULL),
(434, 'AR00210', 15, 56, 3, '17.057607,102.923154', 'โฟนแอนเฟรม (1)', 2, 2, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070722', 'in_progress', '19:06:00', NULL, NULL, 'medium', NULL),
(435, 'AR00210', 15, 55, 4, '17.057607,102.923154', 'โฟนแอนเฟรม (1)', 3, 4, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070719', 'in_progress', '19:01:00', NULL, NULL, 'medium', NULL),
(436, 'AR00203', 15, 51, 5, '17.050438, 102.925268', 'นิตยา สาย2 (1)', 4, 8, 0, 0, 1, '2026-07-31 08:00:00', 'SOWL-26070309', 'in_progress', '18:37:00', NULL, NULL, 'medium', NULL),
(437, 'ARI00009', 15, 52, 3, '17.057351, 102.919907', 'ไข่ย่างห้วยเกิ้ง', 5, 7, 0, 0, 1, '2026-07-31 08:00:00', 'SOWL-26070306', 'in_progress', '18:44:00', NULL, NULL, 'medium', NULL),
(438, 'AR00552', 15, 44, 3, '17.063710, 102.896979', 'แม่จันทร์ บ้านหัวขัว(1)', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070712', 'in_progress', '17:42:00', NULL, NULL, 'medium', NULL),
(439, 'AR00525', 15, 40, 3, '17.08472,102.855989', 'ร้านเต็มศิริ นาฝาย (1)', 2, 2, 0, 0, 1, '2026-07-31 08:00:00', 'SOWL-26070303', 'in_progress', '17:00:00', NULL, NULL, 'medium', NULL),
(440, 'OR-00550', 15, 39, 4, '17.086099, 102.855968', 'ทูวเจ', 3, 4, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072041', 'in_progress', '16:54:00', NULL, NULL, 'medium', NULL),
(441, 'OR-00343', 15, 38, 5, '17.086241, 102.855979', 'โบสบาย (ยุ่งบายทะเก่า) (1)', 4, 8, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070705', 'in_progress', '16:48:00', NULL, NULL, 'medium', NULL),
(442, 'OR-100003', 15, 37, 3, '17.087573, 102.854592', 'นาฝาย ซุปเปอร์', 5, 7, 0, 0, 1, '2026-07-31 08:00:00', 'SO-26070007', 'in_progress', '16:42:00', NULL, NULL, 'medium', NULL),
(443, 'AR00440', 15, 43, 3, '17.068855,102.886939', 'แม่ไล บุ่งหมากลาน ม.4 (1)', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072063', 'in_progress', '17:34:00', NULL, NULL, 'medium', NULL),
(444, 'AR00440', 15, 42, 3, '17.068855,102.886939', 'แม่ไล บุ่งหมากลาน ม.4 (1)', 2, 2, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070724', 'in_progress', '17:29:00', NULL, NULL, 'medium', NULL),
(445, 'OR-2962', 12, 10, 4, '16.852949, 103.049370', 'เจเจออยแอนด์มินิมาร์ทบ.สนามชัย(กระนวน)', 3, 4, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26071965', 'in_progress', '12:42:00', NULL, NULL, 'medium', NULL),
(446, 'OR-3715', 12, 13, 5, '16.792617,103.176369', 'นางภารดี ตรุสคาท(แม่จู่)บ้านนามูล(กระนวน)', 4, 8, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072067', 'in_progress', '13:29:00', NULL, NULL, 'medium', NULL),
(447, 'OR-7434', 12, 11, 3, '16.863231, 103.086651', 'สมบูรณ์การค้า บ.โคกล่าม(กระนวน)', 5, 7, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072054', 'in_progress', '12:57:00', NULL, NULL, 'medium', NULL),
(448, 'OR-3454', 12, 12, 3, '16.866791, 103.108149', 'คุณเก๋ มินิมาร์ทบ.โนนสมบูรณ์(กระนวน)', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072061', 'in_progress', '13:08:00', NULL, NULL, 'medium', NULL),
(449, 'OR-01759', 12, 43, 3, '16.911120, 103.175262', 'ชมพู่ มินิมาร์ท', 2, 2, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072020', 'in_progress', '18:44:00', NULL, NULL, 'medium', NULL),
(450, 'OR-4144', 12, 36, 4, '16.94524,103.196563', 'วิภารัตน์ บ้านโนนมะค่า', 3, 4, 0, 0, 1, '2026-07-31 08:00:00', 'SOWL-26070315', 'in_progress', '17:40:00', NULL, NULL, 'medium', NULL),
(451, 'OR-3173', 12, 33, 5, '17.009529,103.212184', 'ร้านฌอกะเฌอ มินิมาร์ท', 4, 8, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072000', 'in_progress', '17:05:00', NULL, NULL, 'medium', NULL),
(452, 'OR-00151', 12, 32, 3, '17.026390, 103.237979', 'นางรังสิต น้อยนิล (ว.มินิมาร์ท ศรีธาตุ) (3)', 5, 7, 0, 0, 1, '2026-07-31 08:00:00', 'SOWL-26070311', 'in_progress', '16:52:00', NULL, NULL, 'medium', NULL),
(453, 'OR-00151', 12, 31, 3, '17.026390, 103.237979', 'นางรังสิต น้อยนิล (ว.มินิมาร์ท ศรีธาตุ) (3)', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072052', 'in_progress', '16:47:00', NULL, NULL, 'medium', NULL),
(454, 'AR9900174', 12, 30, 3, '17.073451, 103.249043', 'ร้านเจียมจิตเฟอร์นิเจอร์ (3)', 2, 2, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072028', 'in_progress', '16:34:00', NULL, NULL, 'medium', NULL),
(455, 'AR9900174', 12, 29, 4, '17.073451, 103.249043', 'ร้านเจียมจิตเฟอร์นิเจอร์ (3)', 3, 4, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070720', 'in_progress', '16:29:00', NULL, NULL, 'medium', NULL),
(456, 'AR9900174', 12, 28, 5, '17.073451, 103.249043', 'ร้านเจียมจิตเฟอร์นิเจอร์ (3)', 4, 8, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070716', 'in_progress', '16:24:00', NULL, NULL, 'medium', NULL),
(457, 'AR9900174', 12, 27, 3, '17.073451, 103.249043', 'ร้านเจียมจิตเฟอร์นิเจอร์ (3)', 5, 7, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072029', 'in_progress', '16:19:00', NULL, NULL, 'medium', NULL),
(458, 'OR-00434', 12, 23, 3, '17.072537, 103.355509', 'ร้านรักษาผลการค้า (ต.ตี้)', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072035', 'in_progress', '15:38:00', NULL, NULL, 'medium', NULL),
(459, 'AR9900216', 12, 52, 3, '17.075834,103.186978', 'ร้านสุวรรณี บ้านโคกใหญ่ (3)', 2, 2, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070717', 'in_progress', '20:22:00', NULL, NULL, 'medium', NULL),
(460, 'JK-00354', 12, 54, 4, '17.087509,103.167612', 'อาภาพร ภูพาลัย', 3, 4, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072022', 'in_progress', '20:38:00', NULL, NULL, 'medium', NULL),
(461, 'JK-00354', 12, 55, 5, '17.087509,103.167612', 'อาภาพร ภูพาลัย', 4, 8, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070707', 'in_progress', '20:43:00', NULL, NULL, 'medium', NULL),
(462, 'OR-00380', 14, 23, 3, '17.1702,103.067', 'โกดังเงิน (ร้านโชคสมหวัง สมคำ) (3)', 5, 7, 0, 0, 1, '2026-07-31 08:00:00', 'SOJ-26070082', 'in_progress', '15:21:00', NULL, NULL, 'medium', NULL),
(463, 'AR00076', 14, 22, 3, '17.1748,103.07', 'พี่เดือน (3)', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072014', 'in_progress', '15:15:00', NULL, NULL, 'medium', NULL),
(464, 'OR-01755', 14, 21, 3, '17.17421, 103.072027', 'ศรีปัญญา ประสงค์สุข (คันธมาทน์ เก่า)', 2, 2, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072032', 'in_progress', '15:09:00', NULL, NULL, 'medium', NULL),
(465, 'OR-00198', 14, 20, 4, '17.16371,103.085946', 'สหกรณ์บ้านเหล่ากกเค็ง (3)', 3, 4, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072031', 'in_progress', '14:59:00', NULL, NULL, 'medium', NULL),
(466, 'OR-00614', 14, 19, 5, '17.209800, 103.144032', 'นางลำไพ ลาไป (ร้านแม่ลำไพ อ.กู่แก้ว)', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072016', 'in_progress', '14:42:00', NULL, NULL, 'medium', NULL),
(467, 'OR-3508', 14, 14, 3, '17.238323, 103.121116', 'บีพี ไทยนิยม บ้านพังงู', 2, 2, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072033', 'in_progress', '13:16:00', NULL, NULL, 'medium', NULL),
(468, 'OR-01464', 14, 15, 3, '17.274351,103.199812', 'สุกัญญา หนองหลักไชยวาน', 3, 4, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072037', 'in_progress', '13:35:00', NULL, NULL, 'medium', NULL),
(469, 'OR-00919', 14, 16, 3, '17.264979, 103.198011', 'จ.ซุปเปอร์', 4, 8, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070702', 'in_progress', '13:43:00', NULL, NULL, 'medium', NULL),
(470, 'AR9900074', 12, 24, 4, '17.086685, 103.249221', 'ร้านวันวาน (นายไวยากรณ์ อาจเอี่ยม) (3)', 5, 7, 0, 0, 1, '2026-07-31 08:00:00', 'SOJ-26070081', 'in_progress', '16:00:00', NULL, NULL, 'medium', NULL),
(471, 'OR-00177', 12, 26, 5, '17.086111, 103.249361', 'ถูกดี ราชาการค้า (3)', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072076', 'in_progress', '16:11:00', NULL, NULL, 'medium', NULL),
(472, 'OR-00177', 12, 25, 3, '17.086111, 103.249361', 'ถูกดี ราชาการค้า (3)', 2, 2, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072068', 'in_progress', '16:06:00', NULL, NULL, 'medium', NULL),
(473, 'AR9900216', 12, 53, 3, '17.075834,103.186978', 'ร้านสุวรรณี บ้านโคกใหญ่ (3)', 3, 4, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070708', 'in_progress', '20:27:00', NULL, NULL, 'medium', NULL),
(474, 'OR-00469', 12, 47, 3, '17.013651, 103.115968', 'ร้านสุรีย์พร (3)', 4, 8, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070709', 'in_progress', '19:27:00', NULL, NULL, 'medium', NULL),
(475, 'AR9900014', 12, 46, 4, '17.001763, 103.115875', 'นางสาววรรณวิสา หอมอ้ม (เจ้จูโคกข่า)', 5, 7, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070730', 'in_progress', '19:19:00', NULL, NULL, 'medium', NULL),
(476, 'JK-00254', 12, 50, 5, '17.038438,103.114439', 'พรพิมการค้า', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072069', 'in_progress', '19:56:00', NULL, NULL, 'medium', NULL),
(477, 'JK-00254', 12, 49, 3, '17.038438,103.114439', 'พรพิมการค้า', 2, 2, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072075', 'in_progress', '19:51:00', NULL, NULL, 'medium', NULL),
(478, 'OR-00420', 12, 48, 3, '17.024515,103.091018', 'นางนวลศรี คำวิเศษ (3)', 3, 4, 0, 0, 1, '2026-07-31 08:00:00', 'SOWL-26070305', 'in_progress', '19:39:00', NULL, NULL, 'medium', NULL),
(479, 'AR00409', 15, 9, 3, '17.020498, 102.950290', 'แม่ลี หนองเหี้ย (1)', 4, 8, 0, 0, 1, '2026-07-31 08:00:00', 'SOWL-26070313', 'in_progress', '12:07:00', NULL, NULL, 'medium', NULL),
(480, 'JK-00209', 15, 8, 4, '17.040821, 102.961833', 'นางราตรี ปัญญาใส [ล้านหลานเอิ้น]', 5, 7, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26071998', 'in_progress', '11:56:00', NULL, NULL, 'medium', NULL),
(481, 'JK-00209', 15, 7, 3, '17.040821, 102.961833', 'นางราตรี ปัญญาใส [ล้านหลานเอิ้น]', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072010', 'in_progress', '11:51:00', NULL, NULL, 'medium', NULL),
(482, 'JK-00209', 15, 6, 3, '17.040821, 102.961833', 'นางราตรี ปัญญาใส [ล้านหลานเอิ้น]', 2, 2, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072059', 'in_progress', '11:46:00', NULL, NULL, 'medium', NULL),
(483, 'AR9900032', 15, 5, 4, '17.041394, 102.961979', 'แม่ประไพ กุดจิก (1)', 3, 4, 0, 0, 1, '2026-07-31 08:00:00', 'SOWL-26070312', 'in_progress', '11:40:00', NULL, NULL, 'medium', NULL),
(484, 'OR-00475', 15, 57, 5, '17.069431, 102.954000', 'นางสาวอรณี พิมวาปี (ร้าน 69 เจริญทรัพย์) (1)', 4, 8, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072072', 'in_progress', '19:19:00', NULL, NULL, 'medium', NULL),
(485, 'OR-01742', 15, 1, 3, '17.094487, 102.976150', 'ร้านน้องไอด้า(น.ส.อ้อยทิพย์ อินทร์อุดม)', 5, 7, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072030', 'in_progress', '10:54:00', NULL, NULL, 'medium', NULL),
(486, 'OR-00933', 15, 58, 3, '17.09572,102.94179', 'นายอัศวิน สิงห์สาย', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072021', 'in_progress', '19:32:00', NULL, NULL, 'medium', NULL),
(487, 'OR-00933', 15, 59, 3, '17.09572,102.94179', 'นายอัศวิน สิงห์สาย', 2, 2, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072045', 'in_progress', '19:37:00', NULL, NULL, 'medium', NULL),
(488, 'AR00311', 15, 53, 4, '17.057792, 102.919989', 'สุภาพรพาณิชย์ (3)', 3, 4, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070714', 'in_progress', '18:50:00', NULL, NULL, 'medium', NULL),
(489, 'AR00311', 15, 54, 5, '17.057792, 102.919989', 'สุภาพรพาณิชย์ (3)', 4, 8, 0, 0, 1, '2026-07-31 08:00:00', 'SOWL-26070304', 'in_progress', '18:55:00', NULL, NULL, 'medium', NULL),
(490, 'AR00196', 15, 47, 3, '17.044435, 102.930979', 'ร้านสุกานดา (1)', 5, 7, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070695', 'in_progress', '18:14:00', NULL, NULL, 'medium', NULL),
(491, 'AR00196', 15, 48, 3, '17.044435, 102.930979', 'ร้านสุกานดา (1)', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26071951', 'in_progress', '18:19:00', NULL, NULL, 'medium', NULL),
(492, 'AR00207', 15, 49, 3, '17.048427, 102.926713', 'พี่สำลี (1)', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072017', 'in_progress', '18:26:00', NULL, NULL, 'medium', NULL),
(493, 'AR00203', 15, 50, 4, '17.050438, 102.925268', 'นิตยา สาย2 (1)', 2, 2, 0, 0, 1, '2026-07-31 08:00:00', 'SOWL-26070310', 'in_progress', '18:32:00', NULL, NULL, 'medium', NULL),
(494, 'AR9900042', 15, 46, 5, '17.028790, 102.906946', 'แม่พลอย เกิ้งน้อย (1)', 3, 4, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072060', 'in_progress', '18:02:00', NULL, NULL, 'medium', NULL),
(495, 'AR9900042', 15, 45, 3, '17.028790, 102.906946', 'แม่พลอย เกิ้งน้อย (1)', 4, 8, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070723', 'in_progress', '17:57:00', NULL, NULL, 'medium', NULL),
(496, 'OR-01577', 15, 12, 3, '16.993594, 102.892831', 'บริษัท เอ็น ที โฮม มาร์ท จำกัด', 5, 7, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072048', 'in_progress', '12:42:00', NULL, NULL, 'medium', NULL),
(497, 'OR-01577', 15, 13, 3, '16.993594, 102.892831', 'บริษัท เอ็น ที โฮม มาร์ท จำกัด', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072023', 'in_progress', '12:47:00', NULL, NULL, 'medium', NULL),
(498, 'OR-99998', 13, 1, 4, '17.110084, 103.019494', 'ร้าน นพเก้าพาณิชย์ (ตลาดล่าง)', 2, 2, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072058', 'in_progress', '18:23:00', NULL, NULL, 'medium', NULL),
(499, 'OR-99997', 13, 2, 5, '17.158139, 103.061889', 'น.ส. รำไพร ฤทธิมาน [ แม่ไพร ]', 3, 4, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072055', 'in_progress', '18:28:00', NULL, NULL, 'medium', NULL),
(500, 'OR-9196', 13, 3, 3, '17.279318, 102.981635', 'โซโม่ฮาดแวร์ บ้านหนองลุมพุก', 4, 8, 0, 0, 1, '2026-07-31 08:00:00', 'SOWL-26070314', 'in_progress', '18:33:00', NULL, NULL, 'medium', NULL),
(501, 'OR-00222', 15, 14, 3, '16.986562, 102.826021', 'ร้านธงชัยการค้า', 5, 7, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072051', 'in_progress', '13:03:00', NULL, NULL, 'medium', NULL),
(502, 'AR00088', 15, 11, 3, '16.969544, 102.956560', 'สัมฤทธิ์ มิตรภาพ(ยายปราณี) (2)', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070701', 'in_progress', '12:26:00', NULL, NULL, 'medium', NULL),
(503, 'OR-00312', 15, 10, 4, '16.971271, 102.961267', 'ร้าน ปิยะพงค์ (2)', 2, 2, 0, 0, 1, '2026-07-31 08:00:00', 'SOWL-26070308', 'in_progress', '12:20:00', NULL, NULL, 'medium', NULL),
(504, 'OR-2657', 12, 9, 3, '16.946936, 103.016023', 'ชนะกิจ บะยาว', 3, 4, 0, 0, 1, '2026-07-31 08:00:00', 'SOWL-26070302', 'in_progress', '12:20:00', NULL, NULL, 'medium', NULL),
(505, 'OR-00101', 12, 8, 3, '16.949931, 103.022903', 'ร้านการ์ตูนโฟโต้ (ร้านการ์ตูน บ.บะยาว เก่า) (2)', 4, 8, 0, 0, 1, '2026-07-31 08:00:00', 'SOJ-26070086', 'in_progress', '12:13:00', NULL, NULL, 'medium', NULL),
(506, 'OR-00101', 12, 7, 4, '16.949931, 103.022903', 'ร้านการ์ตูนโฟโต้ (ร้านการ์ตูน บ.บะยาว เก่า) (2)', 5, 7, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072070', 'in_progress', '12:08:00', NULL, NULL, 'medium', NULL),
(507, 'JK-00104', 12, 5, 5, '16.949552, 103.024110', 'พรสวรรค์(วิทรูการค้า)', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072046', 'in_progress', '11:56:00', NULL, NULL, 'medium', NULL),
(508, 'OR-01453', 12, 6, 3, '16.949115, 103.023889', 'มินิ ณินิว', 2, 2, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072064', 'in_progress', '12:02:00', NULL, NULL, 'medium', NULL),
(509, 'AR00107', 12, 4, 3, '16.951021, 103.025979', 'นางรจนา นาถมทอง(พี่รส) (2)', 3, 4, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070706', 'in_progress', '11:50:00', NULL, NULL, 'medium', NULL),
(510, 'OR-00165', 12, 3, 3, '16.955641, 103.054936', 'นางเบ้า จันทพงษ์ (2)', 4, 8, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072038', 'in_progress', '11:38:00', NULL, NULL, 'medium', NULL),
(511, 'OR-00155', 12, 2, 4, '16.963895, 103.077064', 'ร้าน ดีดีการค้า (2)', 5, 7, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072011', 'in_progress', '11:27:00', NULL, NULL, 'medium', NULL),
(512, 'AR00237', 12, 1, 5, '16.996172, 103.053000', 'ธงฟ้า ศรีสว่าง (2)', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'SOJ-26070085', 'in_progress', '11:11:00', NULL, NULL, 'medium', NULL),
(513, 'AR00095', 15, 3, 3, '17.045913, 103.029968', 'ตาโกเมศ ท่าสัง (2)', 2, 2, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072027', 'in_progress', '11:18:00', NULL, NULL, 'medium', NULL),
(514, 'OR-00228', 15, 4, 3, '17.045942, 103.028674', 'มัชเรศน์ (น้องเฟริสเก่า) (2)', 3, 4, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072026', 'in_progress', '11:24:00', NULL, NULL, 'medium', NULL),
(515, 'AR00177', 15, 2, 3, '17.059551,103.015573', 'นางสาวคนา จิตธรรมมา (ร้านจิตธรรมา)(2)', 4, 8, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070715', 'in_progress', '11:08:00', NULL, NULL, 'medium', NULL),
(516, 'AR00205', 14, 25, 4, '17.103972, 103.010968', 'สมคิด ศรีสมพาน (พี่ษา) (1)', 5, 7, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070710', 'in_progress', '15:45:00', NULL, NULL, 'medium', NULL),
(517, 'AR00205', 14, 24, 5, '17.103972, 103.010968', 'สมคิด ศรีสมพาน (พี่ษา) (1)', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072025', 'in_progress', '15:40:00', NULL, NULL, 'medium', NULL),
(518, 'OR-00109', 14, 1, 3, '17.190549,102.93514', 'น้อง บี', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26071994', 'in_progress', '10:57:00', NULL, NULL, 'medium', NULL),
(519, 'AR00511', 14, 2, 3, '17.215956, 102.937968', 'ร้านไพบูลย์มินิมาร์ท', 2, 2, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072056', 'in_progress', '11:09:00', NULL, NULL, 'medium', NULL),
(520, 'AR9900161', 14, 3, 3, '17.228481, 102.942584', 'สมบูรณ์ บริการ (5)', 3, 4, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072001', 'in_progress', '11:18:00', NULL, NULL, 'medium', NULL),
(521, 'OR-01630', 14, 10, 4, '17.267531, 103.000979', 'บริษัท เฟิสท์มาร์ท กรุ๊ป จำกัด (สำนักงานใหญ่)', 4, 8, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072009', 'in_progress', '12:19:00', NULL, NULL, 'medium', NULL),
(522, 'OR-01630', 14, 9, 5, '17.267531, 103.000979', 'บริษัท เฟิสท์มาร์ท กรุ๊ป จำกัด (สำนักงานใหญ่)', 5, 7, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072018', 'in_progress', '12:14:00', NULL, NULL, 'medium', NULL),
(523, 'AR00158', 14, 8, 3, '17.265270, 103.004925', 'แม่ไพร ดอนม่วง (5)', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072081', 'in_progress', '12:08:00', NULL, NULL, 'medium', NULL),
(524, 'OR-5349', 14, 12, 3, '17.264930, 103.047812', 'น้องออร่า บ้านหนองเม็กน้อย', 2, 2, 0, 0, 1, '2026-07-31 08:00:00', 'SOJ-26070084', 'in_progress', '12:50:00', NULL, NULL, 'medium', NULL),
(525, 'OR-8073', 14, 11, 3, '17.319388, 103.050241', 'โบว์พาณิชย์ บ้านดงบาก', 3, 4, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072073', 'in_progress', '12:36:00', NULL, NULL, 'medium', NULL),
(526, 'OR-3220', 14, 13, 4, '17.253747, 103.093803', 'แก้มกัน บ้านพังซ่อน', 4, 8, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070731', 'in_progress', '13:03:00', NULL, NULL, 'medium', NULL),
(527, 'OR-01232', 14, 7, 3, '17.211242, 102.995751', 'มาดามหมูสด', 5, 7, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072049', 'in_progress', '11:54:00', NULL, NULL, 'medium', NULL),
(528, 'OR-01232', 14, 6, 3, '17.211242, 102.995751', 'มาดามหมูสด', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072034', 'in_progress', '11:49:00', NULL, NULL, 'medium', NULL),
(529, 'OR-01232', 14, 5, 4, '17.211242, 102.995751', 'มาดามหมูสด', 2, 2, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072003', 'in_progress', '11:44:00', NULL, NULL, 'medium', NULL),
(530, 'OR-00588', 14, 4, 5, '17.209032, 102.961925', 'ฐิติรัตน์การค้า บ.โคกกลาง (2)', 3, 4, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070711', 'in_progress', '11:30:00', NULL, NULL, 'medium', NULL),
(531, 'OR-00592', 15, 61, 3, '17.169241,102.929166', 'ร้านแม่ตุ่น บ้านสี่แจ', 4, 8, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072050', 'in_progress', '20:08:00', NULL, NULL, 'medium', NULL),
(532, 'AR00185', 15, 32, 3, '17.146961, 102.850097', 'นายชัยวัฒน์ เจิมปรุ (พ่อสง่า) (1)', 5, 7, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26071997', 'in_progress', '15:53:00', NULL, NULL, 'medium', NULL),
(533, 'JK-00217', 15, 33, 3, '17.143707,102.849633', 'ร้านรจนาซุปเปอร์มาร์ท [นาย ยงยุธ น้อยชนะ]', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'SOWL-26070307', 'in_progress', '15:59:00', NULL, NULL, 'medium', NULL),
(534, 'AR00125', 15, 31, 4, '17.157551,102.831002', 'พี่หน่อย บ้านดง (1)', 2, 2, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072015', 'in_progress', '15:42:00', NULL, NULL, 'medium', NULL),
(535, 'OR-00687', 15, 30, 5, '17.175452, 102.802413', 'พี่แอน บ้านสามเหลี่ยม', 3, 4, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070726', 'in_progress', '15:28:00', NULL, NULL, 'medium', NULL),
(536, 'AR00055', 15, 29, 3, '17.176665,102.771809', 'กองทุนหมู่บ้านทับกุง หมู่ที่1 (1)', 4, 8, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072007', 'in_progress', '15:15:00', NULL, NULL, 'medium', NULL),
(537, 'AR00139', 15, 28, 3, '17.171558, 102.767979', 'นางสาวพจนา จำปาวัตตะ (สมหมายการค้า) (1)', 5, 7, 0, 0, 1, '2026-07-31 08:00:00', 'SOJ-26070083', 'in_progress', '15:08:00', NULL, NULL, 'medium', NULL),
(538, 'AR00139', 15, 27, 3, '17.171558, 102.767979', 'นางสาวพจนา จำปาวัตตะ (สมหมายการค้า) (1)', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072012', 'in_progress', '15:03:00', NULL, NULL, 'medium', NULL),
(539, 'AR9900137', 15, 26, 4, '17.170220, 102.771925', 'แม่ติ๋ม ทับกุง (1)', 2, 2, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070703', 'in_progress', '14:57:00', NULL, NULL, 'medium', NULL),
(540, 'AR00005', 15, 34, 5, '17.12069,102.822', 'โอพาณิช(1)', 3, 4, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072019', 'in_progress', '16:13:00', NULL, NULL, 'medium', NULL),
(541, 'ARI00004', 15, 35, 3, '17.118813, 102.820693', 'โอ-กุ้ง แสงสว่าง (1)', 4, 8, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072053', 'in_progress', '16:19:00', NULL, NULL, 'medium', NULL),
(542, 'OR-00903', 15, 36, 3, '17.117543, 102.822062', 'สุพัตตรา วรศิริ [ลีโอพลัสตรา]', 5, 7, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072040', 'in_progress', '16:25:00', NULL, NULL, 'medium', NULL),
(543, 'OR-01313', 15, 25, 3, '17.138831,102.786287', 'นิตยา ถามีมาก', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072024', 'in_progress', '14:43:00', NULL, NULL, 'medium', NULL),
(544, 'AR9900020', 15, 24, 4, '17.128788, 102.783087', 'ร้านค้าชุมชนบ้านท่าสี (1)', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072044', 'in_progress', '14:35:00', NULL, NULL, 'medium', NULL),
(545, 'OR-99992', 15, 23, 5, '17.109072,102.774917', 'น้อง มะปราง', 2, 2, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072057', 'in_progress', '14:24:00', NULL, NULL, 'medium', NULL),
(546, 'JK-00136', 15, 22, 3, '17.109199, 102.774670', 'ร้านบอลลูน', 3, 4, 0, 0, 1, '2026-07-31 08:00:00', 'ฝากส่ง', 'in_progress', '14:18:00', NULL, NULL, 'medium', NULL),
(547, 'JK-00355', 15, 21, 3, '17.107483, 102.772170', 'น.ส. ธวัลรัตน์ บิลจรัญ', 4, 8, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072042', 'in_progress', '14:12:00', NULL, NULL, 'medium', NULL),
(548, 'AR00395', 15, 20, 3, '17.061731, 102.786957', 'กุหลาบการค้า (1)', 5, 7, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070704', 'in_progress', '13:59:00', NULL, NULL, 'medium', NULL),
(549, 'OR-01040', 15, 19, 4, '17.058719,102.786587', 'นางผกามาศ จันทร์ดี', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072013', 'in_progress', '13:53:00', NULL, NULL, 'medium', NULL),
(550, 'OR-00281', 15, 15, 3, '17.021431,102.798688', 'กองทุนหมู่บ้านหนองกุงทอง (1)', 2, 2, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072036', 'in_progress', '13:20:00', NULL, NULL, 'medium', NULL),
(551, 'AR9900162', 15, 16, 3, '17.035138,102.80881', 'กองทุนบ้านโนนจำปา', 3, 4, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072066', 'in_progress', '13:29:00', NULL, NULL, 'medium', NULL),
(552, 'AR9900162', 15, 17, 4, '17.035138,102.80881', 'กองทุนบ้านโนนจำปา', 4, 8, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072005', 'in_progress', '13:34:00', NULL, NULL, 'medium', NULL),
(553, 'OR-00589', 15, 18, 5, '17.035921, 102.808989', 'ร้าน เจอามาเก็ต', 5, 7, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070713', 'in_progress', '13:40:00', NULL, NULL, 'medium', NULL),
(554, 'OR-00080', 15, 41, 3, '17.045621, 102.843000', 'นางขนิษฐา พรมเลิศ (ร้านขนิษฐา)', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26071996', 'in_progress', '17:16:00', NULL, NULL, 'medium', NULL),
(555, 'AR00060', 14, 18, 3, '17.169577, 103.160686', 'จันทร์เพ็ญ', 2, 2, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072074', 'in_progress', '14:25:00', NULL, NULL, 'medium', NULL),
(556, 'OR-01538', 14, 17, 3, '17.159978, 103.244181', 'ยุทธชัย สินธ์สิริวัตร', 3, 4, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072071', 'in_progress', '14:07:00', NULL, NULL, 'medium', NULL),
(557, 'AR00044', 12, 51, 4, '17.051821, 103.136011', 'ร้านละมัย (พี่นิด ศรีธาตุ)(3)', 4, 8, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070725', 'in_progress', '20:08:00', NULL, NULL, 'medium', NULL),
(558, 'AR00174', 12, 35, 5, '16.980759, 103.186126', 'น.ส.มะณีกรร ชินวิ (ร้านวันดี ซุปเปอร์) (3)', 5, 7, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072082', 'in_progress', '17:25:00', NULL, NULL, 'medium', NULL),
(559, 'AR00174', 12, 34, 3, '16.980759, 103.186126', 'น.ส.มะณีกรร ชินวิ (ร้านวันดี ซุปเปอร์) (3)', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'SOWL-26070316', 'in_progress', '17:20:00', NULL, NULL, 'medium', NULL),
(560, 'OR-00325', 12, 45, 3, '16.912137, 103.173288', 'เจ้นารี บ.กุงเก่า (4)', 2, 2, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072004', 'in_progress', '18:56:00', NULL, NULL, 'medium', NULL),
(561, 'OR-01542', 12, 44, 3, '16.911097, 103.173680', 'ร้านเพื่อนเกษตร (กรุงเก่า)', 3, 4, 0, 0, 1, '2026-07-31 08:00:00', 'SO-26070008-01', 'in_progress', '18:50:00', NULL, NULL, 'medium', NULL),
(562, 'OR-01805', 12, 22, 4, '16.816237, 103.370407', 'ร้านเจ้ไล', 4, 8, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26071999', 'in_progress', '14:50:00', NULL, NULL, 'medium', NULL),
(563, 'OR-00816', 12, 21, 5, '16.811966, 103.284962', 'ร้านวิไล เต็มไทยสงค์', 5, 7, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070718', 'in_progress', '14:31:00', NULL, NULL, 'medium', NULL),
(564, 'OR-00816', 12, 20, 3, '16.811966, 103.284962', 'ร้านวิไล เต็มไทยสงค์', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070728', 'in_progress', '14:26:00', NULL, NULL, 'medium', NULL),
(565, 'OR-00816', 12, 19, 3, '16.811966, 103.284962', 'ร้านวิไล เต็มไทยสงค์', 2, 2, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070727', 'in_progress', '14:21:00', NULL, NULL, 'medium', NULL),
(566, 'OR-00362', 12, 18, 3, '16.81218, 103.284968', 'ร้านวิชัยบริการ บ.ภูฮัง(4)', 3, 4, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070721', 'in_progress', '14:15:00', NULL, NULL, 'medium', NULL),
(567, 'OR-00362', 12, 17, 4, '16.81218, 103.284968', 'ร้านวิชัยบริการ บ.ภูฮัง(4)', 4, 8, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070732', 'in_progress', '14:10:00', NULL, NULL, 'medium', NULL),
(568, 'OR-00240', 12, 16, 5, '16.823411,103.277898', 'โชคสัมฤทธิ์การค้า(4)', 5, 7, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070729', 'in_progress', '14:02:00', NULL, NULL, 'medium', NULL),
(569, 'OR-00240', 12, 15, 3, '16.823411,103.277898', 'โชคสัมฤทธิ์การค้า(4)', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072065', 'in_progress', '13:57:00', NULL, NULL, 'medium', NULL),
(570, 'OR-01323', 12, 14, 3, '16.824698, 103.278375', 'ยุภาการค้า', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072002', 'in_progress', '13:51:00', NULL, NULL, 'medium', NULL),
(571, 'OR-1299', 12, 42, 3, '16.905827, 103.239174', 'แม่โสภา เกิ้งท่าคันโท', 2, 2, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072039', 'in_progress', '18:29:00', NULL, NULL, 'medium', NULL),
(572, 'OR-1299', 12, 41, 4, '16.905827, 103.239174', 'แม่โสภา เกิ้งท่าคันโท', 3, 4, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072047', 'in_progress', '18:24:00', NULL, NULL, 'medium', NULL),
(573, 'OR-1299', 12, 40, 3, '16.905827, 103.239174', 'แม่โสภา เกิ้งท่าคันโท', 4, 8, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072008', 'in_progress', '18:19:00', NULL, NULL, 'medium', NULL),
(574, 'AR00172', 12, 39, 3, '16.936813, 103.241032', 'เจ้อร(4)', 5, 7, 0, 0, 1, '2026-07-31 08:00:00', 'SOW-26070742', 'in_progress', '18:06:00', NULL, NULL, 'medium', NULL),
(575, 'AR00172', 12, 38, 3, '16.936813, 103.241032', 'เจ้อร(4)', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072006', 'in_progress', '18:01:00', NULL, NULL, 'medium', NULL),
(576, 'AR00165', 12, 37, 4, '16.938662, 103.232054', 'ห้างหุ้นส่วนจำกัด บุญพาณิชย์ 2564 (4)', 1, 1, 0, 0, 1, '2026-07-31 08:00:00', 'POSW-26072043', 'in_progress', '17:54:00', NULL, NULL, 'medium', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `list_store_load`
--

CREATE TABLE `list_store_load` (
  `id` int(11) NOT NULL,
  `list_id` int(11) UNSIGNED NOT NULL,
  `loading_type_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `list_store_load`
--

INSERT INTO `list_store_load` (`id`, `list_id`, `loading_type_id`, `quantity`, `created_at`) VALUES
(1036, 433, 1, 1, '2026-07-31 17:25:45'),
(1037, 433, 2, 2, '2026-07-31 17:25:45'),
(1038, 434, 2, 2, '2026-07-31 17:25:45'),
(1039, 434, 3, 1, '2026-07-31 17:25:45'),
(1040, 435, 2, 2, '2026-07-31 17:25:45'),
(1041, 435, 3, 2, '2026-07-31 17:25:45'),
(1042, 436, 2, 2, '2026-07-31 17:25:45'),
(1043, 436, 3, 3, '2026-07-31 17:25:45'),
(1044, 437, 3, 3, '2026-07-31 17:25:45'),
(1045, 438, 1, 1, '2026-07-31 17:25:45'),
(1046, 438, 2, 2, '2026-07-31 17:25:45'),
(1047, 439, 2, 2, '2026-07-31 17:25:45'),
(1048, 439, 3, 1, '2026-07-31 17:25:45'),
(1049, 440, 2, 2, '2026-07-31 17:25:45'),
(1050, 440, 3, 2, '2026-07-31 17:25:45'),
(1051, 441, 2, 2, '2026-07-31 17:25:45'),
(1052, 441, 3, 3, '2026-07-31 17:25:45'),
(1053, 442, 3, 3, '2026-07-31 17:25:45'),
(1054, 443, 1, 1, '2026-07-31 17:25:45'),
(1055, 443, 2, 2, '2026-07-31 17:25:45'),
(1056, 444, 2, 2, '2026-07-31 17:25:45'),
(1057, 444, 3, 1, '2026-07-31 17:25:45'),
(1058, 445, 2, 2, '2026-07-31 17:25:45'),
(1059, 445, 3, 2, '2026-07-31 17:25:45'),
(1060, 446, 2, 2, '2026-07-31 17:25:45'),
(1061, 446, 3, 3, '2026-07-31 17:25:45'),
(1062, 447, 3, 3, '2026-07-31 17:25:45'),
(1063, 448, 1, 1, '2026-07-31 17:25:45'),
(1064, 448, 2, 2, '2026-07-31 17:25:45'),
(1065, 449, 2, 2, '2026-07-31 17:25:45'),
(1066, 449, 3, 1, '2026-07-31 17:25:45'),
(1067, 450, 2, 2, '2026-07-31 17:25:45'),
(1068, 450, 3, 2, '2026-07-31 17:25:45'),
(1069, 451, 2, 2, '2026-07-31 17:25:45'),
(1070, 451, 3, 3, '2026-07-31 17:25:45'),
(1071, 452, 3, 3, '2026-07-31 17:25:45'),
(1072, 453, 1, 1, '2026-07-31 17:25:45'),
(1073, 453, 2, 2, '2026-07-31 17:25:45'),
(1074, 454, 2, 2, '2026-07-31 17:25:45'),
(1075, 454, 3, 1, '2026-07-31 17:25:45'),
(1076, 455, 2, 2, '2026-07-31 17:25:45'),
(1077, 455, 3, 2, '2026-07-31 17:25:45'),
(1078, 456, 2, 2, '2026-07-31 17:25:45'),
(1079, 456, 3, 3, '2026-07-31 17:25:45'),
(1080, 457, 3, 3, '2026-07-31 17:25:45'),
(1081, 458, 1, 1, '2026-07-31 17:25:45'),
(1082, 458, 2, 2, '2026-07-31 17:25:45'),
(1083, 459, 2, 2, '2026-07-31 17:25:45'),
(1084, 459, 3, 1, '2026-07-31 17:25:45'),
(1085, 460, 2, 2, '2026-07-31 17:25:45'),
(1086, 460, 3, 2, '2026-07-31 17:25:45'),
(1087, 461, 2, 2, '2026-07-31 17:25:45'),
(1088, 461, 3, 3, '2026-07-31 17:25:45'),
(1089, 462, 3, 3, '2026-07-31 17:25:45'),
(1090, 463, 1, 1, '2026-07-31 17:25:45'),
(1091, 463, 2, 2, '2026-07-31 17:25:45'),
(1092, 464, 2, 2, '2026-07-31 17:25:45'),
(1093, 464, 3, 1, '2026-07-31 17:25:45'),
(1094, 465, 2, 2, '2026-07-31 17:25:45'),
(1095, 465, 3, 2, '2026-07-31 17:25:45'),
(1096, 466, 2, 2, '2026-07-31 17:25:45'),
(1097, 466, 3, 3, '2026-07-31 17:25:45'),
(1098, 467, 3, 3, '2026-07-31 17:25:45'),
(1099, 468, 1, 1, '2026-07-31 17:25:45'),
(1100, 468, 2, 2, '2026-07-31 17:25:45'),
(1101, 469, 2, 2, '2026-07-31 17:25:45'),
(1102, 469, 3, 1, '2026-07-31 17:25:45'),
(1103, 470, 2, 2, '2026-07-31 17:25:45'),
(1104, 470, 3, 2, '2026-07-31 17:25:45'),
(1105, 471, 2, 2, '2026-07-31 17:25:45'),
(1106, 471, 3, 3, '2026-07-31 17:25:45'),
(1107, 472, 3, 3, '2026-07-31 17:25:45'),
(1108, 473, 1, 1, '2026-07-31 17:25:45'),
(1109, 473, 2, 2, '2026-07-31 17:25:45'),
(1110, 474, 2, 2, '2026-07-31 17:25:45'),
(1111, 474, 3, 1, '2026-07-31 17:25:45'),
(1112, 475, 2, 2, '2026-07-31 17:25:45'),
(1113, 475, 3, 2, '2026-07-31 17:25:45'),
(1114, 476, 2, 2, '2026-07-31 17:25:45'),
(1115, 476, 3, 3, '2026-07-31 17:25:45'),
(1116, 477, 3, 3, '2026-07-31 17:25:45'),
(1117, 478, 1, 1, '2026-07-31 17:25:45'),
(1118, 478, 2, 2, '2026-07-31 17:25:45'),
(1119, 479, 2, 2, '2026-07-31 17:25:45'),
(1120, 479, 3, 1, '2026-07-31 17:25:45'),
(1121, 480, 2, 2, '2026-07-31 17:25:45'),
(1122, 480, 3, 2, '2026-07-31 17:25:45'),
(1123, 481, 1, 1, '2026-07-31 17:25:45'),
(1124, 481, 2, 2, '2026-07-31 17:25:45'),
(1125, 482, 2, 2, '2026-07-31 17:25:45'),
(1126, 482, 3, 1, '2026-07-31 17:25:45'),
(1127, 483, 2, 2, '2026-07-31 17:25:45'),
(1128, 483, 3, 2, '2026-07-31 17:25:45'),
(1129, 484, 2, 2, '2026-07-31 17:25:45'),
(1130, 484, 3, 3, '2026-07-31 17:25:45'),
(1131, 485, 3, 3, '2026-07-31 17:25:45'),
(1132, 486, 1, 1, '2026-07-31 17:25:45'),
(1133, 486, 2, 2, '2026-07-31 17:25:45'),
(1134, 487, 2, 2, '2026-07-31 17:25:45'),
(1135, 487, 3, 1, '2026-07-31 17:25:45'),
(1136, 488, 2, 2, '2026-07-31 17:25:45'),
(1137, 488, 3, 2, '2026-07-31 17:25:45'),
(1138, 489, 2, 2, '2026-07-31 17:25:45'),
(1139, 489, 3, 3, '2026-07-31 17:25:45'),
(1140, 490, 3, 3, '2026-07-31 17:25:45'),
(1141, 491, 1, 1, '2026-07-31 17:25:45'),
(1142, 491, 2, 2, '2026-07-31 17:25:45'),
(1143, 492, 2, 2, '2026-07-31 17:25:45'),
(1144, 492, 3, 1, '2026-07-31 17:25:45'),
(1145, 493, 2, 2, '2026-07-31 17:25:45'),
(1146, 493, 3, 2, '2026-07-31 17:25:45'),
(1147, 494, 2, 2, '2026-07-31 17:25:45'),
(1148, 494, 3, 3, '2026-07-31 17:25:45'),
(1149, 495, 3, 3, '2026-07-31 17:25:46'),
(1150, 496, 1, 1, '2026-07-31 17:25:46'),
(1151, 496, 2, 2, '2026-07-31 17:25:46'),
(1152, 497, 2, 2, '2026-07-31 17:25:46'),
(1153, 497, 3, 1, '2026-07-31 17:25:46'),
(1154, 498, 2, 2, '2026-07-31 17:25:46'),
(1155, 498, 3, 2, '2026-07-31 17:25:46'),
(1156, 499, 2, 2, '2026-07-31 17:25:46'),
(1157, 499, 3, 3, '2026-07-31 17:25:46'),
(1158, 500, 3, 3, '2026-07-31 17:25:46'),
(1159, 501, 1, 1, '2026-07-31 17:25:46'),
(1160, 501, 2, 2, '2026-07-31 17:25:46'),
(1161, 502, 2, 2, '2026-07-31 17:25:46'),
(1162, 502, 3, 1, '2026-07-31 17:25:46'),
(1163, 503, 2, 2, '2026-07-31 17:25:46'),
(1164, 503, 3, 2, '2026-07-31 17:25:46'),
(1165, 504, 1, 1, '2026-07-31 17:25:46'),
(1166, 504, 2, 2, '2026-07-31 17:25:46'),
(1167, 505, 2, 2, '2026-07-31 17:25:46'),
(1168, 505, 3, 1, '2026-07-31 17:25:46'),
(1169, 506, 2, 2, '2026-07-31 17:25:46'),
(1170, 506, 3, 2, '2026-07-31 17:25:46'),
(1171, 507, 2, 2, '2026-07-31 17:25:46'),
(1172, 507, 3, 3, '2026-07-31 17:25:46'),
(1173, 508, 3, 3, '2026-07-31 17:25:46'),
(1174, 509, 1, 1, '2026-07-31 17:25:46'),
(1175, 509, 2, 2, '2026-07-31 17:25:46'),
(1176, 510, 2, 2, '2026-07-31 17:25:46'),
(1177, 510, 3, 1, '2026-07-31 17:25:46'),
(1178, 511, 2, 2, '2026-07-31 17:25:46'),
(1179, 511, 3, 2, '2026-07-31 17:25:46'),
(1180, 512, 2, 2, '2026-07-31 17:25:46'),
(1181, 512, 3, 3, '2026-07-31 17:25:46'),
(1182, 513, 3, 3, '2026-07-31 17:25:46'),
(1183, 514, 1, 1, '2026-07-31 17:25:46'),
(1184, 514, 2, 2, '2026-07-31 17:25:46'),
(1185, 515, 2, 2, '2026-07-31 17:25:46'),
(1186, 515, 3, 1, '2026-07-31 17:25:46'),
(1187, 516, 2, 2, '2026-07-31 17:25:46'),
(1188, 516, 3, 2, '2026-07-31 17:25:46'),
(1189, 517, 2, 2, '2026-07-31 17:25:46'),
(1190, 517, 3, 3, '2026-07-31 17:25:46'),
(1191, 518, 3, 3, '2026-07-31 17:25:46'),
(1192, 519, 1, 1, '2026-07-31 17:25:46'),
(1193, 519, 2, 2, '2026-07-31 17:25:46'),
(1194, 520, 2, 2, '2026-07-31 17:25:46'),
(1195, 520, 3, 1, '2026-07-31 17:25:46'),
(1196, 521, 2, 2, '2026-07-31 17:25:46'),
(1197, 521, 3, 2, '2026-07-31 17:25:46'),
(1198, 522, 2, 2, '2026-07-31 17:25:46'),
(1199, 522, 3, 3, '2026-07-31 17:25:46'),
(1200, 523, 3, 3, '2026-07-31 17:25:46'),
(1201, 524, 1, 1, '2026-07-31 17:25:46'),
(1202, 524, 2, 2, '2026-07-31 17:25:46'),
(1203, 525, 2, 2, '2026-07-31 17:25:46'),
(1204, 525, 3, 1, '2026-07-31 17:25:46'),
(1205, 526, 2, 2, '2026-07-31 17:25:46'),
(1206, 526, 3, 2, '2026-07-31 17:25:46'),
(1207, 527, 1, 1, '2026-07-31 17:25:46'),
(1208, 527, 2, 2, '2026-07-31 17:25:46'),
(1209, 528, 2, 2, '2026-07-31 17:25:46'),
(1210, 528, 3, 1, '2026-07-31 17:25:46'),
(1211, 529, 2, 2, '2026-07-31 17:25:46'),
(1212, 529, 3, 2, '2026-07-31 17:25:46'),
(1213, 530, 2, 2, '2026-07-31 17:25:46'),
(1214, 530, 3, 3, '2026-07-31 17:25:46'),
(1215, 531, 3, 3, '2026-07-31 17:25:46'),
(1216, 532, 1, 1, '2026-07-31 17:25:46'),
(1217, 532, 2, 2, '2026-07-31 17:25:46'),
(1218, 533, 2, 2, '2026-07-31 17:25:46'),
(1219, 533, 3, 1, '2026-07-31 17:25:46'),
(1220, 534, 2, 2, '2026-07-31 17:25:46'),
(1221, 534, 3, 2, '2026-07-31 17:25:46'),
(1222, 535, 2, 2, '2026-07-31 17:25:46'),
(1223, 535, 3, 3, '2026-07-31 17:25:46'),
(1224, 536, 3, 3, '2026-07-31 17:25:46'),
(1225, 537, 1, 1, '2026-07-31 17:25:46'),
(1226, 537, 2, 2, '2026-07-31 17:25:46'),
(1227, 538, 2, 2, '2026-07-31 17:25:46'),
(1228, 538, 3, 1, '2026-07-31 17:25:46'),
(1229, 539, 2, 2, '2026-07-31 17:25:46'),
(1230, 539, 3, 2, '2026-07-31 17:25:46'),
(1231, 540, 2, 2, '2026-07-31 17:25:46'),
(1232, 540, 3, 3, '2026-07-31 17:25:46'),
(1233, 541, 3, 3, '2026-07-31 17:25:46'),
(1234, 542, 1, 1, '2026-07-31 17:25:46'),
(1235, 542, 2, 2, '2026-07-31 17:25:46'),
(1236, 543, 2, 2, '2026-07-31 17:25:46'),
(1237, 543, 3, 1, '2026-07-31 17:25:46'),
(1238, 544, 2, 2, '2026-07-31 17:25:46'),
(1239, 544, 3, 2, '2026-07-31 17:25:46'),
(1240, 545, 2, 2, '2026-07-31 17:25:46'),
(1241, 545, 3, 3, '2026-07-31 17:25:46'),
(1242, 546, 3, 3, '2026-07-31 17:25:46'),
(1243, 547, 1, 1, '2026-07-31 17:25:46'),
(1244, 547, 2, 2, '2026-07-31 17:25:46'),
(1245, 548, 2, 2, '2026-07-31 17:25:46'),
(1246, 548, 3, 1, '2026-07-31 17:25:46'),
(1247, 549, 2, 2, '2026-07-31 17:25:46'),
(1248, 549, 3, 2, '2026-07-31 17:25:46'),
(1249, 550, 1, 1, '2026-07-31 17:25:46'),
(1250, 550, 2, 2, '2026-07-31 17:25:46'),
(1251, 551, 2, 2, '2026-07-31 17:25:46'),
(1252, 551, 3, 1, '2026-07-31 17:25:46'),
(1253, 552, 2, 2, '2026-07-31 17:25:46'),
(1254, 552, 3, 2, '2026-07-31 17:25:46'),
(1255, 553, 2, 2, '2026-07-31 17:25:46'),
(1256, 553, 3, 3, '2026-07-31 17:25:46'),
(1257, 554, 3, 3, '2026-07-31 17:25:46'),
(1258, 555, 1, 1, '2026-07-31 17:25:46'),
(1259, 555, 2, 2, '2026-07-31 17:25:46'),
(1260, 556, 2, 2, '2026-07-31 17:25:46'),
(1261, 556, 3, 1, '2026-07-31 17:25:46'),
(1262, 557, 2, 2, '2026-07-31 17:25:46'),
(1263, 557, 3, 2, '2026-07-31 17:25:46'),
(1264, 558, 2, 2, '2026-07-31 17:25:46'),
(1265, 558, 3, 3, '2026-07-31 17:25:46'),
(1266, 559, 3, 3, '2026-07-31 17:25:46'),
(1267, 560, 1, 1, '2026-07-31 17:25:46'),
(1268, 560, 2, 2, '2026-07-31 17:25:46'),
(1269, 561, 2, 2, '2026-07-31 17:25:46'),
(1270, 561, 3, 1, '2026-07-31 17:25:46'),
(1271, 562, 2, 2, '2026-07-31 17:25:46'),
(1272, 562, 3, 2, '2026-07-31 17:25:46'),
(1273, 563, 2, 2, '2026-07-31 17:25:46'),
(1274, 563, 3, 3, '2026-07-31 17:25:46'),
(1275, 564, 3, 3, '2026-07-31 17:25:46'),
(1276, 565, 1, 1, '2026-07-31 17:25:46'),
(1277, 565, 2, 2, '2026-07-31 17:25:46'),
(1278, 566, 2, 2, '2026-07-31 17:25:46'),
(1279, 566, 3, 1, '2026-07-31 17:25:46'),
(1280, 567, 2, 2, '2026-07-31 17:25:46'),
(1281, 567, 3, 2, '2026-07-31 17:25:46'),
(1282, 568, 2, 2, '2026-07-31 17:25:46'),
(1283, 568, 3, 3, '2026-07-31 17:25:46'),
(1284, 569, 3, 3, '2026-07-31 17:25:46'),
(1285, 570, 1, 1, '2026-07-31 17:25:46'),
(1286, 570, 2, 2, '2026-07-31 17:25:46'),
(1287, 571, 2, 2, '2026-07-31 17:25:46'),
(1288, 571, 3, 1, '2026-07-31 17:25:46'),
(1289, 572, 2, 2, '2026-07-31 17:25:46'),
(1290, 572, 3, 2, '2026-07-31 17:25:46'),
(1291, 573, 3, 3, '2026-07-31 17:25:46'),
(1292, 574, 1, 1, '2026-07-31 17:25:46'),
(1293, 574, 2, 2, '2026-07-31 17:25:46'),
(1294, 575, 2, 2, '2026-07-31 17:25:46'),
(1295, 575, 3, 1, '2026-07-31 17:25:46'),
(1296, 576, 2, 2, '2026-07-31 17:25:46'),
(1297, 576, 3, 2, '2026-07-31 17:25:46');

-- --------------------------------------------------------

--
-- Table structure for table `loading_type`
--

CREATE TABLE `loading_type` (
  `loading_type_id` int(11) NOT NULL,
  `type_code` varchar(50) NOT NULL,
  `type_name` varchar(100) NOT NULL,
  `unit_name` varchar(50) DEFAULT 'ชิ้น',
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `loading_type`
--

INSERT INTO `loading_type` (`loading_type_id`, `type_code`, `type_name`, `unit_name`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'CRATE', 'ลัง', 'ลัง', 'ลังสินค้ามาตรฐานสำหรับจัดส่ง', 1, '2026-07-31 12:28:05', '2026-07-31 12:28:05'),
(2, 'BASKET', 'กระบะ', 'ใบ', 'กระบะพลาสติกสำหรับสินค้าสด/แช่เย็น', 1, '2026-07-31 12:28:05', '2026-07-31 12:28:05'),
(3, 'PALLET', 'พาเลท', 'พาเลท', 'แท่นวางสินค้าขนาดใหญ่/สินค้าหนัก', 1, '2026-07-31 12:28:05', '2026-07-31 12:28:05'),
(4, 'BOX', 'กล่อง', 'กล่อง', 'กล่องพัสดุกระดาษลูกฟูกทั่วไป', 1, '2026-07-31 12:28:05', '2026-07-31 17:36:54'),
(5, 'STEEL_CAGE', 'กรงเหล็ก', 'กรง', 'กรงเหล็ก', 1, '2026-07-31 12:31:17', '2026-07-31 17:36:54');

-- --------------------------------------------------------

--
-- Table structure for table `gps_distance`
--

CREATE TABLE `gps_distance` (
  `gps_distance_id` int(11) NOT NULL AUTO_INCREMENT,
  `distance_code` varchar(50) NOT NULL,
  `distance_name` varchar(100) NOT NULL,
  `distance_meters` int(11) NOT NULL DEFAULT 300,
  `unit_name` varchar(20) DEFAULT 'เมตร',
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`gps_distance_id`),
  UNIQUE KEY `distance_code` (`distance_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `gps_distance`
--

INSERT INTO `gps_distance` (`gps_distance_id`, `distance_code`, `distance_name`, `distance_meters`, `unit_name`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'CHECKOUT_MAX', 'ระยะห่างเช็คเอาท์นอกสถานที่ (Off-site Checkout)', 300, 'เมตร', 'ระยะทางสูงสุดระหว่างตำแหน่งเช็คเอาท์กับพิกัดร้านค้า หากเกินถือว่านอกสถานที่', 1, '2026-08-02 11:50:00', '2026-08-02 11:50:00'),
(2, 'CHECKIN_RADIUS', 'รัศมีเช็คอินร้านค้า (Store Check-in Radius)', 100, 'เมตร', 'ระยะห่างที่ยอมรับได้สำหรับแจ้งเตือนเข้าถึงบริเวณร้านค้า', 1, '2026-08-02 11:50:00', '2026-08-02 11:50:00'),
(3, 'ALERT_RADIUS', 'รัศมีแจ้งเตือนใกล้ถึงจุดหมาย (Destination Alert)', 500, 'เมตร', 'รัศมีตรวจจับตำแหน่ง GPS ก่อนเข้าถึงจุดส่งสินค้า', 1, '2026-08-02 11:50:00', '2026-08-02 11:50:00');

-- --------------------------------------------------------

--
-- Table structure for table `menu_car_release`
--

CREATE TABLE `menu_car_release` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `menu_name` varchar(255) NOT NULL,
  `action_key` varchar(100) NOT NULL,
  `icon` varchar(100) DEFAULT 'FileText',
  `access` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`access`)),
  `status` varchar(20) DEFAULT 'active',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `action_key` (`action_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `menu_car_release`
--

INSERT INTO `menu_car_release` (`id`, `menu_name`, `action_key`, `icon`, `access`, `status`, `created_at`, `updated_at`) VALUES
(1, 'รีเซ็ตกุญแจ', 'reset_key', 'Key', '{\"1\":true,\"2\":true,\"3\":true,\"4\":true}', 'active', '2026-08-02 14:40:00', '2026-08-02 14:40:00'),
(2, 'รูปให้ของ', 'cargo_photo', 'Camera', '{\"1\":true,\"2\":true,\"3\":true,\"4\":true}', 'active', '2026-08-02 14:40:00', '2026-08-02 14:40:00'),
(3, 'สถานะบัญชี', 'accounting', 'ShieldCheck', '{\"1\":true,\"2\":true,\"3\":true,\"4\":true}', 'active', '2026-08-02 14:40:00', '2026-08-02 14:40:00'),
(4, 'เพิ่มร้านค้า', 'add_store', 'Plus', '{\"1\":true,\"2\":true,\"3\":true,\"4\":true}', 'active', '2026-08-02 14:40:00', '2026-08-02 14:40:00'),
(5, 'ติดตาม', 'followup', 'Truck', '{\"1\":true,\"2\":true,\"3\":true,\"4\":true}', 'active', '2026-08-02 14:40:00', '2026-08-02 14:40:00'),
(6, 'ฝากเงิน', 'deposit', 'Wallet', '{\"1\":true,\"2\":true,\"3\":true,\"4\":true}', 'active', '2026-08-02 14:40:00', '2026-08-02 14:40:00'),
(7, 'เอกสารคืนของ', 'return_docs', 'FileText', '{\"1\":true,\"2\":true,\"3\":true,\"4\":true}', 'active', '2026-08-02 14:40:00', '2026-08-02 14:40:00'),
(8, 'สินค้าควบคุม', 'controlled_items', 'PackageCheck', '{\"1\":true,\"2\":true,\"3\":true,\"4\":true}', 'active', '2026-08-02 14:40:00', '2026-08-02 14:40:00'),
(9, 'คืนรถ', 'car_return', 'RotateCcw', '{\"1\":true,\"2\":true,\"3\":true,\"4\":true}', 'active', '2026-08-02 14:40:00', '2026-08-02 14:40:00'),
(10, 'เบี้ยเลี้ยง', 'allowance', 'Coins', '{\"1\":true,\"2\":true,\"3\":true,\"4\":true}', 'active', '2026-08-02 14:40:00', '2026-08-02 14:40:00');

-- --------------------------------------------------------

--
-- Table structure for table `parking`
--

CREATE TABLE `parking` (
  `parking_id` int(10) UNSIGNED NOT NULL,
  `parking_name` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `parking`
--

INSERT INTO `parking` (`parking_id`, `parking_name`, `created_at`) VALUES
(1, 'โกดังสุมิตร', '2026-07-20 15:12:14'),
(2, 'ถนน หน้าบริษัท', '2026-07-20 15:12:14'),
(3, ' ลานจอดรถ บริษัท', '2026-07-20 15:12:14'),
(4, ' ลานจอด 3แยกอนามัย', '2026-07-23 10:12:40'),
(5, 'อู่ซ่อมรถ', '2026-07-23 10:13:02');

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `payment_id` int(10) UNSIGNED NOT NULL,
  `payment_name` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment`
--

INSERT INTO `payment` (`payment_id`, `payment_name`, `created_at`) VALUES
(1, 'เงินสด (Cash)', '2026-07-20 15:12:14'),
(2, 'เงินโอน (Bank Transfer)', '2026-07-20 15:12:14'),
(3, 'ค้างชำระ (Credit)', '2026-07-20 15:12:14');

-- --------------------------------------------------------

--
-- Table structure for table `pda_device`
--

CREATE TABLE `pda_device` (
  `pda_id` int(11) UNSIGNED NOT NULL,
  `device_code` varchar(50) NOT NULL,
  `device_name` varchar(255) NOT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `assigned_user` varchar(255) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'active',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pda_device`
--

INSERT INTO `pda_device` (`pda_id`, `device_code`, `device_name`, `serial_number`, `assigned_user`, `status`, `created_at`) VALUES
(1, 'PDA-781', 'PDA-1', NULL, 'ผู้ดูแลระบบ (Admin)', 'active', '2026-07-23 10:19:28'),
(2, 'PDA-932', 'PDA-2', NULL, 'ผู้ดูแลระบบ (Admin)', 'active', '2026-07-23 10:20:12'),
(3, 'PDA-668', 'PAD-3', NULL, 'ผู้ดูแลระบบ (Admin)', 'active', '2026-07-23 10:20:41'),
(4, 'PDA-366', 'PDA-4', NULL, 'ผู้ดูแลระบบ (Admin)', 'active', '2026-07-23 10:21:11'),
(5, 'PDA-076', 'PDA-5', NULL, 'ผู้ดูแลระบบ (Admin)', 'active', '2026-07-23 10:21:18'),
(6, 'PDA-853', 'PDA-6', NULL, 'ผู้ดูแลระบบ (Admin)', 'active', '2026-07-23 10:21:27'),
(7, 'PDA-332', 'PDA-7', NULL, 'ผู้ดูแลระบบ (Admin)', 'active', '2026-07-23 10:21:36'),
(8, 'PDA-348', 'PDA-8', NULL, 'ผู้ดูแลระบบ (Admin)', 'active', '2026-07-23 10:21:43'),
(9, 'PDA-252', 'PDA-9', NULL, 'ผู้ดูแลระบบ (Admin)', 'active', '2026-07-23 10:21:49'),
(10, 'PDA-885', 'PDA-10', NULL, 'ผู้ดูแลระบบ (Admin)', 'active', '2026-07-23 10:21:57');

-- --------------------------------------------------------

--
-- Table structure for table `permission`
--

CREATE TABLE `permission` (
  `permission_id` int(10) UNSIGNED NOT NULL,
  `permission_key` varchar(100) NOT NULL COMMENT 'เช่น car_release.add, users.delete',
  `permission_name` varchar(255) NOT NULL COMMENT 'ชื่อแสดงผล เช่น เพิ่มใบปล่อยรถ',
  `menu_group` varchar(100) DEFAULT NULL COMMENT 'กลุ่มเมนู เช่น car_release, users, stores',
  `action_type` varchar(50) DEFAULT NULL COMMENT 'ประเภท: view, add, edit, delete',
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permission`
--

INSERT INTO `permission` (`permission_id`, `permission_key`, `permission_name`, `menu_group`, `action_type`, `description`, `created_at`) VALUES
(21, 'dashboard', 'หน้าแดชบอร์ด', 'เมนูหลัก', 'view', 'การเข้าถึงหน้าแดชบอร์ดสรุปผล', '2026-07-30 09:57:19'),
(22, 'releases', 'รายการใบปล่อยรถ', 'เมนูหลัก', 'view', 'การเข้าถึงหน้ารายการใบปล่อยรถ', '2026-07-30 09:57:19'),
(23, 'route', 'จัดรถ & เส้นทาง', 'เมนูหลัก', 'view', 'การเข้าถึงหน้าแผนที่จัดรถและเส้นทาง', '2026-07-30 09:57:19'),
(24, 'import_optimo', 'นำเข้า OptimoRoute', 'เมนูหลัก', 'view', 'การเข้าถึงหน้านำเข้าข้อมูลเส้นทาง', '2026-07-30 09:57:19'),
(25, 'reports', 'รายงานระบบ & Audit Log', 'เมนูหลัก', 'view', 'การเข้าถึงหน้ารายงานระบบและประวัติกิจกรรม', '2026-07-30 09:57:19'),
(26, 'users', 'จัดการผู้ใช้งาน', 'จัดการผู้ใช้งาน', 'view', 'การเข้าถึงหน้าบริหารจัดการผู้ใช้งาน', '2026-07-30 09:57:19'),
(27, 'user_levels', 'จัดการระดับผู้ใช้งาน', 'จัดการผู้ใช้งาน', 'view', 'การเข้าถึงหน้าบริหารจัดการบทบาท/ระดับผู้ใช้', '2026-07-30 09:57:19'),
(28, 'permissions', 'จัดการสิทธิ์ระบบ (Matrix)', 'จัดการผู้ใช้งาน', 'view', 'การเข้าถึงหน้ากำหนดสิทธิ์ระบบรายเมนู', '2026-07-30 09:57:19'),
(29, 'user_access', 'จัดการกลุ่มการเข้าถึง', 'จัดการผู้ใช้งาน', 'view', 'การเข้าถึงหน้าจัดการกลุ่มสิทธิ์ Access', '2026-07-30 09:57:19'),
(30, 'stores', 'ข้อมูลร้านค้า', 'ข้อมูลมาสเตอร์', 'view', 'การเข้าถึงหน้าข้อมูลร้านค้า', '2026-07-30 09:57:19'),
(31, 'keys', 'ข้อมูลที่ฝากกุญแจ', 'ข้อมูลมาสเตอร์', 'view', 'การเข้าถึงหน้าข้อมูลที่ฝากกุญแจ', '2026-07-30 09:57:19'),
(32, 'pda', 'ข้อมูลเครื่อง PDA', 'ข้อมูลมาสเตอร์', 'view', 'การเข้าถึงหน้าข้อมูลเครื่อง PDA', '2026-07-30 09:57:19'),
(33, 'payments', 'ข้อมูลช่องทางชำระเงิน', 'ข้อมูลมาสเตอร์', 'view', 'การเข้าถึงหน้าประเภทการชำระเงิน', '2026-07-30 09:57:19'),
(34, 'vehicles', 'ข้อมูลรถ', 'ข้อมูลมาสเตอร์', 'view', 'การเข้าถึงหน้าข้อมูลรถ', '2026-07-30 09:57:19'),
(35, 'parking', 'ข้อมูลที่จอดรถ', 'ข้อมูลมาสเตอร์', 'view', 'การเข้าถึงหน้าข้อมูลที่จอดรถ', '2026-07-30 09:57:19'),
(36, 'accounting_status', 'สถานะทางบัญชี', 'ข้อมูลมาสเตอร์', 'view', 'การเข้าถึงหน้าสถานะตรวจสอบทางบัญชี', '2026-07-30 09:57:19'),
(37, 'position_product', 'ตำแหน่งวางสินค้า', 'ข้อมูลมาสเตอร์', 'view', 'การเข้าถึงหน้าตำแหน่งวางสินค้า', '2026-07-30 09:57:19'),
(38, 'release_types', 'ประเภทการปล่อยรถ', 'ข้อมูลมาสเตอร์', 'view', 'การเข้าถึงหน้าจัดการประเภทการปล่อยรถ', '2026-07-30 09:57:19');

-- --------------------------------------------------------

--
-- Table structure for table `position_product`
--

CREATE TABLE `position_product` (
  `position_product_id` int(11) NOT NULL,
  `position_product_name` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `position_product`
--

INSERT INTO `position_product` (`position_product_id`, `position_product_name`, `created_at`) VALUES
(1, 'E', '2026-07-27 03:02:08'),
(2, 'A', '2026-07-27 03:02:08'),
(3, 'R', '2026-07-27 03:02:08'),
(4, 'B', '2026-07-27 03:02:08'),
(5, 'C', '2026-07-27 03:02:08');

-- --------------------------------------------------------

--
-- Table structure for table `problem`
--

CREATE TABLE `problem` (
  `problem_id` int(10) UNSIGNED NOT NULL,
  `list_id` int(10) UNSIGNED NOT NULL,
  `problem_name` varchar(255) DEFAULT NULL,
  `normal_bill` tinyint(1) DEFAULT 0 COMMENT 'บิลปกติ',
  `normal_bill_note` text DEFAULT NULL,
  `edit_bill` tinyint(1) DEFAULT 0 COMMENT 'มีการแก้บิล',
  `edit_bill_note` text DEFAULT NULL,
  `product_swap` tinyint(1) DEFAULT 0 COMMENT 'มีการเปลี่ยนสินค้า',
  `product_swap_note` text DEFAULT NULL,
  `out_of_stock` tinyint(1) DEFAULT 0 COMMENT 'สินค้าขาดสต็อก',
  `out_of_stock_note` text DEFAULT NULL,
  `overstock` tinyint(1) DEFAULT 0 COMMENT 'สินค้าเกิน',
  `overstock_note` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `problem_image`
--

CREATE TABLE `problem_image` (
  `image_problem_id` int(10) UNSIGNED NOT NULL,
  `problem_id` int(10) UNSIGNED NOT NULL,
  `problem_image` varchar(500) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role_permission`
--

CREATE TABLE `role_permission` (
  `role_permission_id` int(10) UNSIGNED NOT NULL,
  `level_user_id` int(10) UNSIGNED NOT NULL,
  `permission_id` int(10) UNSIGNED NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role_permission`
--

INSERT INTO `role_permission` (`role_permission_id`, `level_user_id`, `permission_id`, `created_at`) VALUES
(39, 1, 36, '2026-07-30 09:57:19'),
(44, 1, 21, '2026-07-30 09:57:19'),
(49, 1, 24, '2026-07-30 09:57:19'),
(50, 1, 31, '2026-07-30 09:57:19'),
(51, 1, 35, '2026-07-30 09:57:19'),
(52, 1, 33, '2026-07-30 09:57:19'),
(53, 1, 32, '2026-07-30 09:57:19'),
(54, 1, 28, '2026-07-30 09:57:19'),
(55, 1, 37, '2026-07-30 09:57:19'),
(56, 1, 22, '2026-07-30 09:57:19'),
(57, 1, 38, '2026-07-30 09:57:19'),
(58, 1, 25, '2026-07-30 09:57:19'),
(62, 1, 23, '2026-07-30 09:57:19'),
(64, 1, 30, '2026-07-30 09:57:19'),
(69, 1, 26, '2026-07-30 09:57:19'),
(74, 1, 29, '2026-07-30 09:57:19'),
(75, 1, 27, '2026-07-30 09:57:19'),
(76, 1, 34, '2026-07-30 09:57:19'),
(77, 2, 36, '2026-07-30 09:57:19'),
(78, 2, 21, '2026-07-30 09:57:19'),
(79, 2, 24, '2026-07-30 09:57:19'),
(80, 2, 31, '2026-07-30 09:57:19'),
(81, 2, 35, '2026-07-30 09:57:19'),
(82, 2, 33, '2026-07-30 09:57:19'),
(83, 2, 32, '2026-07-30 09:57:19'),
(84, 2, 37, '2026-07-30 09:57:19'),
(85, 2, 22, '2026-07-30 09:57:19'),
(86, 2, 38, '2026-07-30 09:57:19'),
(87, 2, 25, '2026-07-30 09:57:19'),
(88, 2, 23, '2026-07-30 09:57:19'),
(89, 2, 30, '2026-07-30 09:57:19'),
(90, 2, 34, '2026-07-30 09:57:19'),
(91, 3, 21, '2026-07-30 09:57:19'),
(92, 3, 22, '2026-07-30 09:57:19'),
(251, 3, 23, '2026-07-30 10:54:37');

-- --------------------------------------------------------

--
-- Table structure for table `store`
--

CREATE TABLE `store` (
  `store_id` varchar(10) NOT NULL,
  `store_name` varchar(255) NOT NULL,
  `store_address` varchar(500) DEFAULT NULL,
  `telephone_number` varchar(20) DEFAULT NULL,
  `fax_number` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `customer_delivery_time` time DEFAULT NULL COMMENT 'เวลาที่ลูกค้าสะดวกรับของ',
  `store_location` varchar(255) DEFAULT NULL COMMENT 'lat,long ของร้าน',
  `created_at` datetime DEFAULT current_timestamp(),
  `open_time` varchar(10) DEFAULT '08:00',
  `close_time` varchar(10) DEFAULT '17:00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `store`
--

INSERT INTO `store` (`store_id`, `store_name`, `store_address`, `telephone_number`, `fax_number`, `email`, `url`, `customer_delivery_time`, `store_location`, `created_at`, `open_time`, `close_time`) VALUES
('09A54CA7-3', 'ครูวันชัยรวยทรัพย์', '78 หมู่ที่ 6 บ้านนาทัน ต.ท่าลี่ อ.กุมภวาปี จ.อุดรธานี 41370', '959384526', NULL, NULL, NULL, NULL, '16.930960, 103.088975', '2026-07-23 11:48:49', '08:00', '17:00'),
('183BE268-8', 'ต้อมการค้า', NULL, NULL, NULL, NULL, NULL, NULL, '17.127827, 102.965684', '2026-07-23 11:48:49', '08:00', '17:00'),
('1A572E2F-2', 'รับเอง สหกรณ์บ้านดอนกลาง', NULL, NULL, NULL, NULL, NULL, NULL, '17.128280, 102.965219', '2026-07-23 11:48:49', '08:00', '17:00'),
('1EB1CB29-D', 'หน้าร้านรับเอง จันทร์เพ็ญ', NULL, NULL, NULL, NULL, NULL, NULL, '17.128307, 102.965125', '2026-07-23 11:48:49', '08:00', '17:00'),
('1FFEA0DE-B', 'วรรณภรครัวฝรั่ง', '326/2 หมูที่ 1 บ้านโคกผักหวาน ต.ห้วยเกิ้ง อ.กุมภวาปี จ.อุดรธานี 41370', '627235894', NULL, NULL, NULL, NULL, '17.060368, 102.922104', '2026-07-23 11:48:49', '08:00', '17:00'),
('20AA6966-9', 'ร้าน ซันโย', '222 หมู่ 11 ต.คอนสาย อ.กู่แก้ว จ.อุดรธานี', '064-552-0465', NULL, NULL, 'https://maps.app.goo.gl/gbGBbEL88kbcLsZ49', NULL, '17.205378, 103.101568', '2026-07-23 11:48:49', '08:00', '17:00'),
('2F3C2D8D-E', 'เกศกนก', '95 หมู่ 6 ต.สีออ อ.กุมภวาปี จ.อุดรธานี 41110', '927097109', NULL, NULL, 'https://maps.app.goo.gl/FXZ4SHLup7xSSWVp9', NULL, '17.029153, 103.029720', '2026-07-23 11:48:49', '08:00', '17:00'),
('32E0B32B-0', 'ร้าน ฉลามวาฬมินิมาท', 'บ้านเลขที่ 224 หมู่8 ตำบลดงมูล อ.หนองกุงศรี จ.ท่าคันโท', '0880350678 / 0989537', NULL, NULL, 'https://maps.app.goo.gl/STFSMrin3tSY97p46', NULL, '16.810791, 103.285744', '2026-07-23 11:48:49', '08:00', '17:00'),
('3A43D1DA-0', 'จิตธรรมมา รับเอง', NULL, NULL, NULL, NULL, NULL, NULL, '17.128276, 102.965164', '2026-07-23 11:48:49', '08:00', '17:00'),
('3B456468-C', 'โปร รร.ห้วยเกิ้ง รับเอง', NULL, NULL, NULL, NULL, NULL, NULL, '17.128303, 102.965125', '2026-07-23 11:48:49', '08:00', '17:00'),
('42DFDC8E-E', 'ทวีสิน รับเอง', NULL, NULL, NULL, NULL, NULL, NULL, '17.128301, 102.965138', '2026-07-23 11:48:49', '08:00', '17:00'),
('448EAD86-E', 'ศีวิไล พาณิชย์', '244 ม.15 ต.พันดอน', NULL, NULL, NULL, NULL, NULL, '17.120231, 102.955798', '2026-07-23 11:48:49', '08:00', '17:00'),
('4A2FB03F-0', 'โดนัท', NULL, '829896874', NULL, NULL, 'https://www.google.com/maps/place/17%C2%B006\'49.0%22N+103%C2%B000\'41.1%22E/@17.1137002,103.0106672,20z/data=!4m4!3m3!8m2!3d17.1136054!4d103.0114177?entry=ttu&g_ep=EgoyMDI1MDYyMy4yIKXMDSoASAFQAw%3D%3D', NULL, '17.113604, 103.011412', '2026-07-23 11:48:50', '08:00', '17:00'),
('4C5936B1-2', 'ร้านแม่คำแปลง รับเอง', NULL, NULL, NULL, NULL, NULL, NULL, '17.128303, 102.965114', '2026-07-23 11:48:49', '08:00', '17:00'),
('501FC9F9-8', 'หน้าร้าน รับเอง ราคาโปร', '244', NULL, NULL, NULL, NULL, NULL, '17.128330, 102.964979', '2026-07-23 11:48:49', '08:00', '17:00'),
('65B5A97A-B', 'อนงค์ หนองบัว รับเอง', NULL, NULL, NULL, NULL, NULL, NULL, '17.128312, 102.965187', '2026-07-23 11:48:49', '08:00', '17:00'),
('6DD95F99-4', 'พงษ์พรรณ์ รับเอง', NULL, NULL, NULL, NULL, NULL, NULL, '17.128313, 102.965133', '2026-07-23 11:48:49', '08:00', '17:00'),
('6EF4152A-4', 'เด่น การค้า รับเองหน้าร้าน', '244 ม.15 ต.พันดอน', NULL, NULL, NULL, NULL, NULL, '17.128333, 102.964954', '2026-07-23 11:48:49', '08:00', '17:00'),
('8FEB2FBB-7', 'หน้าร้าน รับเองโปร', NULL, NULL, NULL, NULL, NULL, NULL, '17.128312, 102.965187', '2026-07-23 11:48:49', '08:00', '17:00'),
('990B63CB-A', 'ร้าน ก. เรือนไทย', '67 หมู่ 6 ตำบลผาสุข อำเภอกุมภวาปี จ.อุดร', '913348109', NULL, NULL, 'https://maps.app.goo.gl/Q7ZQbzsHrt376GQR7', NULL, '17.190849, 102.935746', '2026-07-23 11:48:49', '08:00', '17:00'),
('9AD5C6B8-0', 'น้องสามโนนสะอาด', '244 ม.15 ต.พันดอน อ.กุมภวาปี', NULL, NULL, NULL, NULL, NULL, '17.128340, 102.964985', '2026-07-23 11:48:49', '08:00', '17:00'),
('9CCFACC3-0', 'สำนักงานสาธารณะสุขอำเภอกุมภวาปี', 'กุมภวาปี', '3258523445554', NULL, NULL, 'https://maps.app.goo.gl/JB3CiVgPEry3z5Rk8', NULL, '17.113729, 103.018349', '2026-07-23 11:48:49', '08:00', '17:00'),
('9CF49B19-4', 'รับเอง วราวุธ', NULL, NULL, NULL, NULL, NULL, NULL, '17.128299, 102.965133', '2026-07-23 11:48:49', '08:00', '17:00'),
('9F247CD4-B', 'เอ็นทีมาร์ท', '308 หมู่ 9 ต.ทมนางาม อ.โนนสะอาด จ.อุดรธานี 41240', '6306989360639080000', NULL, NULL, NULL, NULL, '16.915176, 102.943957', '2026-07-23 11:48:49', '08:00', '17:00'),
('A0272D1C-5', 'คุณ วรินทร์ลตา', '244 ม.15 ต.พันดอน', NULL, NULL, NULL, NULL, NULL, '17.128359, 102.964965', '2026-07-23 11:48:49', '08:00', '17:00'),
('ABB133FC-9', 'ส.ศักดิ์ดา', '234 หมู่ 7 บ้านนาเหล่า ต.หนองกุงศรี อ.โนนสะอาด จ.อุดรธานี 41240', '916917244', NULL, NULL, NULL, NULL, '17.059688, 102.787237', '2026-07-23 11:48:49', '08:00', '17:00'),
('AC465317-3', 'ร้านพี่ไทด์', '94 หมู่ 13 บ.หนองลุมพุก ต.นาม่วง อ.ประจักษ์ จ.อุดร', '091-0618613', NULL, NULL, 'https://maps.app.goo.gl/e6DdJ7FTTHz8QGVm6', NULL, '17.278859, 102.979016', '2026-07-23 11:48:49', '08:00', '17:00'),
('AR 9900060', 'นาย อนุสรณ์ บุตรอินทร์ (บ้านไทพี่น้อง)', '130 หมู่6 ตำบลนายูง อำเภอศรีธาตุ จังหวัดอุดรธานี 41230', '850765147', NULL, NULL, NULL, NULL, '16.981786, 103.269836', '2026-07-23 11:48:49', '08:00', '17:00'),
('AR-00387', 'โคกข่า ม.8 รับเอง', NULL, NULL, NULL, NULL, NULL, NULL, '17.128252, 102.965106', '2026-07-23 11:48:49', '08:00', '17:00'),
('AR00001', 'เงินสด-ปลีก ส่งให้', NULL, NULL, NULL, NULL, NULL, NULL, '17.128252, 102.965106', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00003', 'หน้าร้าน รับเอง ราคาโปร', NULL, NULL, 'ทุกเวลา', NULL, NULL, NULL, '17.128695, 102.964675', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00005', 'โอพาณิช(1)', NULL, '0885139353/แอพ+ไลน์', 'สะดวกรับของไม่เกิน 1', NULL, 'https://goo.gl/maps/ZfQBSf4VXGsB8zFB6', NULL, '17.12069,102.822', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00006', 'หน้าร้าน-เงินสด [ปลีกหน้าร้าน]', NULL, NULL, NULL, NULL, NULL, NULL, '17.128348, 102.964946', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00007', 'หน้าร้าน [ขาย ส่ง]', NULL, NULL, NULL, NULL, NULL, NULL, '17.106515, 102.939891', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00008', 'บ้านชา', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00009', 'ร้านพรเจริญการค้า (พี่ตู่) (1)', '24 ม.6 ต.แสงสว่าง ต.หนองแสง จ.อุดรธานี', '883503120', 'ไม่เกิน 17.00 น', NULL, 'https://goo.gl/maps/7Lpiwxs1yNPf2KiMA', NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00011', 'เจ้ดาว', NULL, '909579356', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00012', 'นาเมือง (3) (งดโทร/ไม่สั่งชั่วคราว)', NULL, '0901759019/088571579', NULL, NULL, 'https://goo.gl/maps/zhb7zjEeopzEhfPZ7', NULL, '16.973221, 103.208989', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00013', 'ร้าน ใจดี20 นายยงศิลป์ นารี(1)หน้าร้าน', '94-95 หมู่1 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '0986689539/ไลน์', NULL, NULL, 'https://goo.gl/maps/JuEG3AeMe9qU2VbEA', NULL, '17.110067, 103.014906', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00014', 'ห้างหุ้นส่วนจำกัด ทองปัญญา (สำนักงานใหญ่)', '555 หมู่ที่4 ตำบลพันดอน อำเภอกุมภวาปี จังหวัดอุดรธานี 41370', '061-3962266/089-4193', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00019', 'พี่มัทขายน้ำ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00020', 'พรดี', NULL, '849113116', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00021', 'ดนุพล อุต้น (ร้านทรัพย์สมบูรณ์) (3)', '338หมู่ 6 บ้านยางหล่อ ตำบลแชแล อำเภอกุมภวาปี จังหวัดอุดรธานี', '947577861', 'ไม่เกิน 19.00น.', NULL, 'https://goo.gl/maps/SzepLj1Lv8M6f21z7', NULL, '17.147461, 103.039021', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00022', 'วัดจอมศรี', NULL, '815462151', NULL, NULL, 'https://goo.gl/maps/uAAC7AcgcbNmhybM6', NULL, '17.142187, 102.965142', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00026', 'ส.เจริญพาณิชย์ (พี่แดน สายนอกเก่า)', 'เลขที่ 99 ม.8 ต.ท่าลี่ อ.กุมภวาปี จ.อุดรธานี', '0862397793/095537653', 'ไม่เกิน 17.00น.', NULL, 'https://goo.gl/maps/EN47iDC189JtqdTSA', NULL, '16.923681, 103.053077', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00027', 'บุญดิ เภสัช (1)', '87 ม.5 ต.แสงสว่าง อ.หนองแสง จ.อุดรธานี 41340', '0849107044/061467122', 'ไม่เกิน18.00น.', NULL, 'https://goo.gl/maps/RSuzdhbVDynk9DDE7', NULL, '17.138656, 102.789011', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00029', 'น้องอาจารย์สมควร', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00030', 'เฮียเฒ่า', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00032', 'อ.ดา', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00033', 'ตังตัง(3)', NULL, '0991494179/086816697', NULL, NULL, 'https://goo.gl/maps/22we4Y9LTGdPJLXy6', NULL, '16.973697, 103.221916', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00034', 'หจก.สุวรรณเรืองบริการ', '182 หมู่ 11 ต.จำปี อ.ศรีธาตุ จ.อุดรธานี', '966914939', NULL, NULL, 'https://goo.gl/maps/wdEuUsJRY3P8ShFZ8', NULL, '16.958728, 103.164199', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00035', 'พี่ไก่กุ๊กกุ๊ก (1)', NULL, '847714937', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/HnfnQQD7zHTe2C337', NULL, '17.138823, 102.789160', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00037', 'วงษ์พาณิชย์ สาขากุมภวาปี', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00039', 'หจก.หลินปิง', NULL, '660519990', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00041', 'ประจวบ (1)', NULL, '0805654815/แอพ+ไลน์', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/kce3aQEBnuLu55T76', NULL, '17.1431,102.851', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00042', 'ไอรีส', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00043', 'น้ำพอง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00044', 'ร้านละมัย (พี่นิด ศรีธาตุ)(3)', NULL, '870424548', 'ไม่เกิน 19.00น', NULL, 'https://goo.gl/maps/qeM4cWXSQuyFGeqX7', NULL, '17.051821, 103.136011', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00045', 'ป.วัฒนะ', NULL, '883002492', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00047', 'แม่พร เหล่าหมากบ้า(3)', NULL, '816010043', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/MuFEMCGS8VmW6ywDA', NULL, '17.159661, 103.059011', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00048', 'นายบวร ไชยสิทธิ์ (บวรพานิช) (1)', 'เลขที่ 6 ม.5 บ.นาเหล่า ต.หนองกุงศรี อ.โนนสะอาด จ.อุดรธานี 41240', '0857544552/แอพ+ไลน์', 'ไม่เกิน 20.00น.', NULL, 'https://goo.gl/maps/RFDdutFLVU16z5ix5', NULL, '17.060593,102.787189', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00049', 'เฮียนพดล (ตลาดเมืองเก่า)', NULL, '0819752357/089840143', NULL, NULL, 'https://goo.gl/maps/FFYBRMzdPTbwNNuN8', NULL, '17.129692, 102.967440', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00050', '[เอส ที การค้า] นาง รัตนา วังสีรัง (2)', '243 ม.6 ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี 41240', '892591925', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/kgSJNze4WnV9qgTt8', NULL, '16.969651, 102.915968', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00051', 'นิยม (สุภารัตน์ ธรรมจิตร์)(3)', '51 ม.12 บ.ศรีนคร ต.ศรีธาตุ อ.ศรีธาตุ จ.อุดรธานี 41230', '0897109754/099032561', '16.00-17.00น.', NULL, 'https://goo.gl/maps/22we4Y9LTGdPJLXy6', NULL, '16.973666, 103.221948', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00052', 'พี่เอ๋ บ้านกงพาน', NULL, '900879023', NULL, NULL, 'https://goo.gl/maps/MvhMzZfhb34Sbw3M6', NULL, '17.130432, 102.967588', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00053', 'ม.เกษตร', 'หน้าโรงงานน้ำตาลเกษตรผล', '899441018', NULL, NULL, 'https://maps.app.goo.gl/o2eCccQ1jHHPt4V7A', NULL, '17.073956, 102.928599', '2026-07-23 11:48:50', '08:00', '17:00'),
('AR00054', 'ธวัชชัย น้อยชนะ', '52 หมู่ที่ 1 ต.หนองแสง อ.หนองแสง จ.อุดระานี 41340 ต.หนองแสง อ.หนองแสง จ.อุดรธานี 41340', '868581512', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00055', 'กองทุนหมู่บ้านทับกุง หมู่ที่1 (1)', 'กองทุนหมู่บ้านทับกุง หมูุ่ที่1 ตำบลทับกุง อำเภอหนองแสง จังหวัดอุดรธานี', '0871779065//แอพ+ไลน์', NULL, NULL, 'https://goo.gl/maps/ihkhp2p9U2TgamB99', NULL, '17.176665,102.771809', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00056', 'ลูกค้าส่งทั่วไป', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00057', 'วิบูลย์ บุญยะศาสตร์', '581/16 ม.5 ต.พยอม อ.วังน้อย จ.พระนครศรีอยุธยา 13170', '0898459952/099396518', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00059', 'แม่อัมพร ศรีวิเศษ', 'บ้านหนองแวง ม.6 ต.ผาสุก อ.กุมภวาปี จ.อุดรธานี', '852428145', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00060', 'จันทร์เพ็ญ', NULL, '887381047', NULL, NULL, 'https://goo.gl/maps/NT15DpdcAr5RDMvh6', NULL, '17.169577, 103.160686', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00061', 'พ่อสุภาพ', 'บ้านสงเปลือย', '845778235', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00062', 'บจก. อุดรเอ็มอาร์ที 2019 (สำนักงานใหญ่)', '354/1 หมู่ที่ 1 ซอยบ้านหนองบัว ตำบลหมากแข้ง อำเภอ เมืองอุดรธานี จ.อุดรธานี 41000', '866322345', NULL, NULL, NULL, NULL, '17.370348, 102.811781', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00063', 'อาทิวราภรณ์ (4)', '266 ม.8 ต.กุงเก่า อ.ท่าคันโท จ.กาฬสินธุ์', '934439622', 'ไม่เกิน 16.00', NULL, 'https://goo.gl/maps/jp8fQhzzCNMoqC8B7', NULL, '16.908572, 103.167032', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00065', 'สาครพานิชย์ (2)', '90/1 หมู่3 บ.ทมป่าข่า ต.ทมงาม อ.โนนสะอาด จ.อุดรธานี', '833399211', NULL, NULL, 'https://goo.gl/maps/Gc9G3hGSKN5E1muz7', NULL, '16.909793, 103.004011', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00067', '9***', NULL, '849113116', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00068', 'บริษัท ชัยอุดมสิน โปรดิวส์ จำกัด (สาขาที่ 0001)', '5/7 ม.11 ต.กุดน้อย อ.สีคิ้ว จ.นครราชสีมา 30140', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00069', 'ต๋อยปาท่องโก๋ (ตลาดเมืองเก่า)', NULL, '804032433', NULL, NULL, NULL, NULL, '17.128405, 102.964599', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00070', 'สมบัติการค้า', 'เลขที่ 80 หมู่ 9 บ้านตะเคียนทอง ต.บ้านโปร่ง อ.ศรีธาตุ จ.อุดรธานี', '930922837', NULL, NULL, 'https://goo.gl/maps/ovL4SFw9E9XCdfYX9', NULL, '17.020041, 103.128054', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00071', 'ห่อเงิน (3)', '154 หมู่1 ต.เวียงคำ อ.กุมภวาปี จ.อุดรธานี', '636232445', 'ไม่เกิน18.00น.', NULL, 'https://goo.gl/maps/AJx3o9GbqKL7eqWv7', NULL, '17.116098, 103.032021', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00074', 'ขายสินค้า-บริการ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00075', 'ทดสอบ 1', NULL, '910502532', NULL, NULL, 'https://goo.gl/maps/eKFYdzQyD68wZhrg6', NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00076', 'พี่เดือน (3)', 'บ้านหนองแวง', '934344192', 'ไม่เกิน 17.00น.', NULL, 'https://goo.gl/maps/wkeJHcbv2unbFjkc6', NULL, '17.1748,103.07', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00077', 'ไทยเจริญ (3)', '101 ถ.พระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กทม.', '0880276531/080419908', 'ไม่เกิน19.00น.', NULL, 'https://goo.gl/maps/MvdWirnBXDDvzAAx7', NULL, '16.973721, 103.220989', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00078', 'ท่ายม (1)', NULL, '908542814', 'ไม่เกิน 18.00 น.', NULL, 'https://goo.gl/maps/gffeLVY7o46W6Cxc8', NULL, '17.139190, 102.785011', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00079', 'แม่เนตร บ.กุดขอนแก่น(4)', '10 ม.9 ต.กุงเก่า อ.ท่าคันโท จ.กาฬสินธุ์', '813921892', NULL, NULL, 'https://maps.app.goo.gl/Lb5uTYFMDa7d5V516', NULL, '16.950012, 103.173865', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00080', 'ทรัพย์มงคล (5)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00082', 'หนูเตียม ศรีโมง (หนูเตียมพานิชย์)', '83 หมู่ที่8 ตำบลโพธิ์ศรีสำราญ อำเภอโนนสะอาด จังหวัดอุดรธานี', '0915844533/ไลน์', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/7tSRA362Gdp963LSA', NULL, '16.948334, 102.852054', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00083', 'ต๋อง', NULL, '981023980', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00085', 'ยายคำป่น (5)', NULL, '621019572', NULL, NULL, 'https://goo.gl/maps/JSnHoZrLhRFeAsH1A', NULL, '17.164890, 102.933000', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00086', 'ยายติ๋งปากหวาน', 'บ้านนาดี', '0934745419/084513682', 'ไม่เกิน 20.00น.', NULL, 'https://goo.gl/maps/auhde79MYUZbZhBZ9', NULL, '17.070500, 102.856600', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00087', 'วัดบูรพาบ้านท่าลี่ ศรีสุข', NULL, NULL, NULL, NULL, 'https://goo.gl/maps/fXbuJRtNd83FVNdB7', NULL, '16.977358, 103.080060', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00088', 'สัมฤทธิ์ มิตรภาพ(ยายปราณี) (2)', '166 หมู่ 13 ต.บุ่งแก้ว อ.โนนสะอาด จ.อุดรธานี ต.บุ่งแก้ว อ.โนนสะอาด จ.อุดรธานี 41240', '0927069298/080199950', 'ไม่เกิน 19.00น.', NULL, 'https://goo.gl/maps/JQj6UWqZXFHi6R49A', NULL, '16.969544, 102.956560', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00089', 'น.ส.อารี บุญญวัฒน์วณิชย์ / ร้าน 148 (1)', 'เลขที่ 148 หมู่ 2 ต.นาดี อ.หนองแสง จ.อุดรธานี', '0985853847/ไลน์สั่งเ', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/frnaThj7wkBysuHMA', NULL, '17.080819,102.861126', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00091', 'แม่นาง หนองแวง (2)', NULL, '941719180', 'ไม่เกิน 19.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00094', 'ตาประดิษ ท่าสัง (2)', NULL, '886471569', 'ไม่เกิน 19.00น.', NULL, 'https://maps.app.goo.gl/vU3c3UonBFTzvhVv6', NULL, '17.04585,103.029', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00095', 'ตาโกเมศ ท่าสัง (2)', NULL, '651021227', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/gnmCKUfwGFdHu7oP8', NULL, '17.045913, 103.029968', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00096', 'แม่บัวผัน หนองแดง (2)', 'บ้านหนองแดง ต.สีออ', '0847924933/081872729', 'ไม่เกิน 16.00น.', NULL, 'https://goo.gl/maps/Fkn99rgbWnL6Ms7o8', NULL, '17.028990, 103.027893', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00097', 'พี่เอี้ยง หนองกวาง (2)', NULL, '816873747', 'ไม่เกิน 20.00น.', NULL, 'https://goo.gl/maps/3rsy3PgibNwLPZ6F7', NULL, '17.007841, 103.049000', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00101', 'กิลาภรณ์ คำพันธ์/แม่พร กุดยาง (2)', '18 หมู่ 12 ต.ท่าลี่ อ.กุมภวาปี จ.อุดรธานี', '0811863959/093508577', 'ไม่เกิน 18.00', NULL, 'https://goo.gl/maps/DL58BZWWeh5FXS6D9', NULL, '16.95591,103.04452', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00102', 'ร้านมานา (ราชพฤกษ์เก่า) (2)', '206 7หมู่2 ต.ท่าลี่ อ.กุมภวาปี จ.อุดรธานี 41110', '834645382', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/iiGgTDBRZGKkeXfF8', NULL, '16.954697, 103.042348', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00104', 'พี่หนิง กุดยาง [เจ้หนิงไก่สด]', '165 ม.2 บ.กุดยาง ต.ท่าลี อ.กุมภวาปี จ.อุดรธานี 41110', '833521839', 'ไม่เกิน 20.00น.', NULL, 'https://goo.gl/maps/WfN96DC5o8ZFyeuMA', NULL, '16.952877, 103.041106', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00105', 'พันปี โนนสำราญ (1)', NULL, '860250401', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/W2cMb1rpUyKXZZzB7', NULL, '17.041941, 102.925011', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00107', 'นางรจนา นาถมทอง(พี่รส) (2)', '53 หมู่ที่8 ตำบลบุ่งแก้ว อำเภอโนนสะอาด จังหวัดอุดรธานี', '982097535', 'ไม่เกิน 20.00น.', NULL, 'https://goo.gl/maps/5XeUWAWCcf2G8Ubd7', NULL, '16.951021, 103.025979', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00108', 'พ่อสมบูรณ์ บ้านโนนสำราญ (2)', NULL, '810610377', 'ไม่เกิน 20.00น.', NULL, 'https://goo.gl/maps/jQRW8qHrB4zu1d259', NULL, '16.970490, 102.975011', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00109', 'แม่แสง บ.โพธิ์สง่า', '22 หมู่ 12 บ้านโพธิ์สง่า', '981107280', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00110', 'ส.เจริญ โนนสวรรค์ (2)', NULL, '0878546740/082931604', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/jjDxUjgtg6ZjTtir8', NULL, '16.922731, 103.053000', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00111', 'พรทิพย์ ทัพโยธา/ยายจ่อย เหล่าหมากจันทร์ (2)', '163 หมู่ 3 บ้านเหล่าหมากจันทร์ ต.ท่าลี่ อ.กุมภวาปี จ.อุดรธานี', '983089424', 'ไม่เกิน 19.00', NULL, 'https://goo.gl/maps/mTF8UD85MP2RN6oBA', NULL, '16.922488, 103.039778', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00112', 'แม่หนอม นาเพ็ญ', NULL, '934191567', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00113', 'ไมลี่คาเฟ่ สายวิ่ง จันทร์-ศุกร์', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00114', 'ไมลี่ชาบู สายวิ่ง จันทร์-ศุกร์', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00115', 'แม่ลำพร ท่าลี่ สายวิ่ง จันทร์-ศุกร์ (2)', NULL, '984101341', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00117', 'แม่วา บ้านผือ (1)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00118', 'พ่อสมจิตร ทับกุง (1)', NULL, '821073175', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/nS56RaMDU1ioi6j39', NULL, '17.174080, 102.774740', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00120', 'พี่มี ทับกุง (1)', NULL, '895774415', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/9wE2uoVdMZ5pD3Rt7', NULL, '17.168661, 102.775979', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00121', 'ร้านค้าชุมชนประชารัฐโนนดินแดง (1)', NULL, '0828234339/062520355', 'ไม่เกิน 18.00', NULL, 'https://goo.gl/maps/FXu7RBhAbM27wC1c8', NULL, '17.139183, 102.848030', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00122', 'ร้านณิชมน ใจสามารถ [แม่หวาน หนองแสง]', '135 ม.1 ต.หนองแสง อ.หนองแสง จ.อุดรธานี 41340', '885161788', NULL, NULL, 'https://goo.gl/maps/qYwpUj7Agp9rVtoj8', NULL, '17.146111, 102.851936', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00123', 'โรงสีม้าขาว', 'เลขที่ 133 หมู่ 17 ต.เวียงคำ อ.กุมภวาปี อุดรธานี 41110', '981024378', NULL, NULL, 'https://maps.app.goo.gl/EoprfpSgPHtFbCWi8', NULL, '17.117908, 103.046048', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00124', 'แม่อ๋อย โคกสว่าง (1)', '147 หมู่ 5 บ้านโคกสว่าง ต.หนองแสง อ.หนองแสง 41340', '635904497', 'ไม่เกิน19.00น.', NULL, 'https://goo.gl/maps/jRP93myrUbBHxsc96', NULL, '17.188957, 102.843198', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00125', 'พี่หน่อย บ้านดง (1)', NULL, '953503057', 'ไม่เกิน 19.00น.', NULL, 'https://maps.app.goo.gl/8HoXboU7XGQpbCz69', NULL, '17.157551,102.831002', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00126', 'พี่ตุ๋ย บ้านดง (1)', NULL, '0621547925/ไลน์', 'ไม่เกิน 19.00น.', NULL, 'https://goo.gl/maps/dC7juZ9oTz7V3eT2A', NULL, '17.160851, 102.827043', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00128', 'ร้านแสงประเสริฐ/ทับกุง (1)', '88 ต.ทับกุง อ.หนองแสง จ.อุดรธานี', '0655818892/081391042', 'ไม่เกิน18.00น.', NULL, 'https://goo.gl/maps/dkg4rYxsoySTGv3y5', NULL, '17.170800, 102.769989', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00130', 'แม่เครือ ทับกุง หมู่ 1 (1)', NULL, '934157533', 'ไม่เกิน 15.00น', NULL, 'https://goo.gl/maps/y8H1Xws5QA3hDKdc9', NULL, '17.174851, 102.770000', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00131', 'บุญยง ทับกุง สายวิ่ง พุธ-อาทิตย์ ปิดกิจการ', NULL, '880642835', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00132', 'แม่สมร คำหว้าทอง (1)', NULL, '652572514', 'ไม่เกิน 19.00น.', NULL, 'https://goo.gl/maps/h23GrjcmDHwuXJ5n7', NULL, '17.15622,102.787925', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00133', 'แม่เที่ยง ท่ายม [เปลี่ยนเจ้าใหม่]', NULL, '861709323', NULL, NULL, 'https://goo.gl/maps/PJJzePwzJAP6oGJd9', NULL, '17.139946, 102.786990', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00136', 'พี่ละมัย ท่าสี (1)', NULL, '833528563', 'ไม่เกิน 18.00 น', NULL, 'https://goo.gl/maps/VKWcY4USpqfnzraG6', NULL, '17.128610, 102.781989', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00137', 'พ่อใส ดงน้อย (1)', NULL, '0628900588/หน้าร้าน', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00138', 'นางแอ๊ด เตรียมตัว (แม่แอด แสงทอง) (1)', '22 หมู่ที่6 ตำบลหนองแสง อำเภอหนองแสง จังหวัดอุดรธานี', '612934769', 'ไม่เกิน 18.00น', NULL, 'https://goo.gl/maps/SoBuXBNPRkgS5CNn6', NULL, '17.146602, 102.850043', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00139', 'นางสาวพจนา จำปาวัตตะ (สมหมายการค้า) (1)', '376 หมู่ 3 ต.ทับกุง อ.หนองแสง จ.อุดรธานี 41340 41340', '985979209', 'ไม่เกิน 20.00น', 'yingangel1111@gmail.com', 'https://goo.gl/maps/8A3ZVn2QtfuR4W3P8', NULL, '17.171558, 102.767979', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00140', 'แม่ตุ๊ก ม.ดินแดง', NULL, '819547773', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00141', 'เฟริส แอนด์ เกรซ', NULL, '850475198', 'บ่าย3-บ่าย4', NULL, 'https://goo.gl/maps/8SBty3mE3KiZ4t1h9', NULL, '17.173554, 102.803349', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00142', 'นางอนงค์ ถินทะสิทธิ์/หนองบัว (1)', '46 ม.9 อ.หนองแสง จ.อุดรธานี', '610975318', 'ไม่เกิน 19.00น.', NULL, 'https://goo.gl/maps/XMiZsWyf1gSd6YZu6', NULL, '17.105141, 102.884000', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00143', 'ร้านอุไรลักษ์ บ้านดงเรือง (5)', 'บ.ดงเรือง', '872182045', 'ไม่เกิน 19.00น.', NULL, 'https://goo.gl/maps/Y4gk7wsxobQVHWB77', NULL, '17.165320, 102.960936', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00145', 'พี่บุปผา โพนทอง (5)', NULL, '811858065', 'ไม่เกิน 18.00 น', NULL, 'https://goo.gl/maps/Mpg8tMSYt4FaorYGA', NULL, '17.240487, 103.064823', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00146', 'ตลาดเพชรโพนทอง', NULL, '956715331', NULL, NULL, 'https://goo.gl/maps/6ugJ3w5GSuLkAZcJ8', NULL, '17.241551, 103.068032', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00147', 'นายฉัตรพร สีเหลือง (สองบุญ) (5)', '32 หมู่ที่5 ตำบลอุ่มจาน อำเภอประจักษ์ศิลปาคม จังหวัดอุดรธานี', '615097819', 'ไม่เกิน16.00น.', NULL, 'https://goo.gl/maps/dtqgVnQWLSs79Atk8', NULL, '17.240351, 103.066968', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00148', 'พี่น้ำฝน บ.โคกน้อย', '20 ม.14 บ.โคกน้อย ต.จำปี อ.ศรีธาตุ', '982105824', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00149', 'ประชารัฐ น้ำเที่ยง (5)', NULL, '981277977', 'ไม่เกิน 20.00น.', NULL, 'https://goo.gl/maps/goYU5EzdQTS1fQVw6', NULL, '17.261331, 103.035968', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00150', 'แม่พรไพร สวนม่อน (5)', NULL, '879516269', 'ไม่เกิน19.00น.', NULL, 'https://goo.gl/maps/83tj1AZMBDPAYw9FA', NULL, '17.232851, 103.025043', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00153', 'แม่นาง บ้านหมากบ้า (5)', 'บ้านหมากบ้า', '924500416', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/noJD8nCXveF8Lf7h6', NULL, '17.198831, 102.976957', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00154', 'พ่อสุบิน โคกกลาง (5)', 'บ้านโคกกลาง ต.นาม่วง อ.ประจักษ์', '0913644478//06497917', 'ไม่เกิน 17.00น', NULL, 'https://goo.gl/maps/9EJK1aph5oyxLZtq6', NULL, '17.206710, 102.962968', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00155', 'แม่ทองหนุน โนนสา (5)', NULL, '612321394', 'ไม่เกิน 20.00น.', NULL, 'https://goo.gl/maps/rgWmSNvLhz5WbTAU6', NULL, '17.216057, 102.992989', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00156', 'แม่รัตน์ นาม่วง (5)', NULL, '652560433', 'ไม่เกิน18.00น.', NULL, 'https://goo.gl/maps/ajBtTcQQyQcWdadN8', NULL, '17.237792, 103.010043', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00157', 'หจก. มนุชศรา ค้าส่ง (5)', '106 หมู่3 ตำบลนาม่วง อำเภอประจักษ์ศิลปาคม จังหวัดอุดรธานี 41110', '819542363', 'ไม่เกิน 19.00น', NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00158', 'แม่ไพร ดอนม่วง (5)', NULL, '872309812', 'ไม่เกิน 20.00น.', NULL, 'https://goo.gl/maps/QGrjLKophzfbrkiy5', NULL, '17.265270, 103.004925', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00159', 'แม่เพ็ญ โนนสะแหวง (5)', NULL, '616321049', 'ไม่เกิน 18.00 น.', NULL, 'https://goo.gl/maps/o52JJdwpfFaJBD5V7', NULL, '17.253002, 102.980979', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00160', 'แม่แอด บ้านหนองแก (5)', 'บ้านหนองแก', '621127341', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/9aKrSVY3TjmH9eBd6', NULL, '17.208382, 102.956054', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00161', 'สนามชนไก่ หนองกวาง', NULL, '933753305', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00162', 'นางอำพร เหง้าพรหมมินทร์', NULL, '899407201', NULL, NULL, 'https://maps.app.goo.gl/St2CQVW9yFbZZLodA', NULL, '17.179403, 102.900090', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00164', 'โชคสนั่น (2)', NULL, '821122769', 'ไม่เกิน 20.00น.', NULL, 'https://goo.gl/maps/C6HzFfVdYgm6P5RF9', NULL, '16.962741, 103.074946', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00165', 'ห้างหุ้นส่วนจำกัด บุญพาณิชย์ 2564 (4)', '202 ถ.บางนา-ตราด แขวงบางนา เขตบางนา กทม.', '832425079', NULL, NULL, 'https://goo.gl/maps/vJ7hcZDeqDtDi4Ab6', NULL, '16.938662, 103.232054', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00166', 'ยายเสาร์ร้านเหลือง (5)', 'สะอาดนามูล', '981186274', NULL, NULL, 'https://goo.gl/maps/wFraip1v453gQHRr5', NULL, '17.229723, 102.936674', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00167', 'ตานง', 'สงเปลือย', '833602028', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00168', 'วังชัยพานิชย์ ไม่รู้จัก', 'ห้วยเกิ้ง', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00170', 'พี่ไก่กุมภวาปีจ้า (1)', NULL, '644913795', 'ไม่เกิน17.00น.', NULL, NULL, NULL, '17.110127, 103.013119', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00171', 'แม่ใบ (1)', 'หมู่ 8 บ้านดงเมือง อ.กุมภวาปี', '897121545', 'ไม่เกิน19.00น.', NULL, 'https://goo.gl/maps/wG2fLnRFKrKsh2JL9', NULL, '17.113172, 103.011531', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00172', 'เจ้อร(4)', NULL, '0857460530/ไลน์', 'ไม่เกิน18.00น.', NULL, 'https://goo.gl/maps/kAnMPAVZ1cWqnE9F6', NULL, '16.936813, 103.241032', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00173', 'หจก.ชัยพร ท่าคันโท', '56 ม.8 ต.ท่าคันโท อ.ท่าคันโท จ.กาฬสินธุ์ 46190', '892778721', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/yfuerhrJCaiDk8nR8', NULL, '16.938504, 103.231093', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00174', 'น.ส.มะณีกรร ชินวิ (ร้านวันดี ซุปเปอร์) (3)', '76 ม.13 ต.จำปี อ.ศรีธาตุ จ.อุดรธานี 41230', '098-9269289 / ไลน์', 'ไม่เกิน18.00น.', NULL, 'https://goo.gl/maps/ZGpCTmT3MbG98pWz5', NULL, '16.980759, 103.186126', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00175', 'ทองล้วนการค้า (2)', '31 หมู่ 7 บ้านคำร่อง ตำบลท่าลี่ อำเภอกุมภวาปี จังหวัดอุดรธานี', '0973043411/096318252', NULL, NULL, 'https://goo.gl/maps/itt5bffmPxrgWv6z9', NULL, '16.930356, 103.031968', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00176', 'พี่อวย', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00177', 'นางสาวคนา จิตธรรมมา (ร้านจิตธรรมา)(2)', '254 ม.3 ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี 41110', '895743550', NULL, NULL, 'https://goo.gl/maps/HCR56VTsgzY6sde69', NULL, '17.059551,103.015573', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00178', 'โจโจ้โดนัท', 'ซอยประปา', '878585457', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00179', 'มอสมินิมาร์ท (5)', 'หมู่ที่ 12 บ้านทุ่งสว่าง ต.พังงู อ.หนองหาน จ.อุดรธานี 41130', '969747370', 'ไม่เกิน 19.00 น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00180', 'โอ๋นาม่อง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00183', 'ป๋าสง่า ขอนแก่น', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00184', 'แสงสิริ (1)', '', '945318995', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/t92ahjvonuEetMdQ8', NULL, '17.168479,102.775064', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00185', 'นายชัยวัฒน์ เจิมปรุ (พ่อสง่า) (1)', '85 หมู่ที่6 ตำบลหนองแสง อำเภอหนองแสง จังหวัดอุดรธานี 41340', '821042368', 'ไม่เกิน 20.00น.', NULL, 'https://goo.gl/maps/mhnAJSQSt9YewdWA6', NULL, '17.146961, 102.850097', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00186', 'นางสาวประภัสสร หล้าชน (ศรีปะโคการเกษตร) (1)', '282 ม.4 บ.ทับไฮ ต.แสงสว่าง อ.หนองแสง จ.อุดรธานี', '833354692', 'รับสินค้า15.30-16.00', NULL, 'https://goo.gl/maps/DnRzo6Kjwq4ZmZPu9', NULL, '17.110051, 102.778000', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00187', 'พี่โก้', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00189', 'พี่จอย', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00190', 'พี่ดาวโนนสะอาด', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00191', 'น้องไอซ์ (1)', NULL, '819645660', 'ไม่เกิน18.00น.', NULL, 'https://maps.app.goo.gl/nQBfpgU6XBuyJwTJA', NULL, '17.070843, 102.855173', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00194', 'บ้านพี่จอส', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00195', 'พี่หนุ่ย', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00196', 'ร้านสุกานดา (1)', NULL, '042110590/0831450618', 'ไม่เกิน 19.00น.', NULL, 'https://goo.gl/maps/h6PoCQLGetbDN8zo8', NULL, '17.044435, 102.930979', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00197', 'ครัวนาเทิง', NULL, '930142555', NULL, NULL, 'https://goo.gl/maps/7T927Xo3KMeiaMjq6', NULL, '17.126894, 102.963576', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00199', 'อ่อนอุบลการค้า (พี่แจ็คกุมภวาปี) (1)', NULL, '0805511905/080808746', 'ไม่เกิน 17.00น.', NULL, 'https://goo.gl/maps/pmz6krkMV9WaSnQ66', NULL, '17.103731, 103.010903', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00200', 'ร้าน โฟร์เอ็กซ์ โคกผักหวาน', 'เลขที่ 194/7 บ.โนนรังสี ต.ห้วยเกิ้ง อ.กุมภวาปี จ.อุดรธานี 41110', '883039729', NULL, NULL, 'https://goo.gl/maps/Ms79guiQ1o3brNzP6', NULL, '17.056770, 102.920616', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00201', 'เจ้สุวรรณา ห้วยเกิ้ง (1)', NULL, '981501868', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/3PoaYY5Rgph7zNT57', NULL, '17.041925, 102.928989', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00202', 'เจ้กิมเฮียง (1)', NULL, '913338395', 'ไม่เกิน 19.00น.', NULL, 'https://maps.app.goo.gl/e9yfngmbJGZwWHuW6', NULL, '17.042064, 102.929043', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00203', 'นิตยา สาย2 (1)', NULL, '932528760', 'ไม่เกิน 19.00น.', NULL, 'https://maps.app.goo.gl/nidQkirGC4nw6yCaA', NULL, '17.050438, 102.925268', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00205', 'สมคิด ศรีสมพาน (พี่ษา) (1)', '304 ม.3 อ.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี', '653579240', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/A9NViTTJUAeuzxJP8', NULL, '17.103972, 103.010968', '2026-07-23 11:48:47', '08:00', '17:00'),
('AR00207', 'พี่สำลี (1)', NULL, '0892737247/062278321', 'ไม่เกิน 18.00น.', NULL, 'https://maps.app.goo.gl/RBhaAX1863nxRpJM9', NULL, '17.048427, 102.926713', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00208', 'MILY', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00209', 'กิมเฮง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00210', 'โฟนแอนเฟรม (1)', NULL, '940251826', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/D3geGWn1bqTtRcuy7', NULL, '17.057607,102.923154', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00211', 'ร้านคมสัน โนนสะอาด [คมสันค้าส่ง]', '417 หมู่1 ต.ทมนางาม อ.โนนสะอาด จ.อุดรธานี', '959327475', NULL, NULL, 'https://goo.gl/maps/W8pRBX8A8mg2zW3cA', NULL, '16.890854, 102.929117', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00212', 'รุ่งนิรันด์', NULL, NULL, NULL, NULL, 'https://goo.gl/maps/UvaFK1CHPp5u7NaJ6', NULL, '17.135467, 102.963003', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00214', 'ประชารัฐหมู่10 อุ่มจาน', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00215', 'พี่บุญช่วย', '863115761', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00216', 'น้องสมาท (1)', NULL, '0896705226/ไลน์', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00217', 'ป้าวาด (5)', NULL, '897158953', 'ไม่เกิน 18.00น.', NULL, 'https://maps.app.goo.gl/K9dfZh85Vj2Z523e6', NULL, '17.200846, 102.941055', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00218', 'ศาลเจ้าปู่ ย่า', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00219', 'พี่วุฒิ โคกผักหวาน', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00220', 'พี่ลักกี้ สาย2 (1)', NULL, '918646895', 'ไม่เกิน 18.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00222', 'พ่อทูล บ้านกงพาน', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00223', 'แม่น้ำเที่ยง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00224', 'เฮียจอน[ห้ามเติมจัด]', NULL, '821116388', NULL, NULL, 'https://maps.app.goo.gl/wSUA59kD5P6K38ys6', NULL, '17.072456, 102.851390', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00226', 'พี่มิว', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00227', 'น้องเบียร์ (3)', '50 หมู่ที่ 10 บ้านเสาเล้า ต.โพธิ์ศรีสำราญ อ.โนนสะอาด จ.อุดรธานี 41240', '883118410', NULL, NULL, 'https://goo.gl/maps/q8cw3o2TW9MBwZrn7', NULL, '16.950651, 102.847968', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00229', 'เพื่อนเกษตร', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00230', 'ยายนาง ทางพาด', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00231', 'เฮียโต้งอุดร', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00232', 'ชัยพิมพ์ (1)', NULL, '0810579377/ไลน์', 'ไม่เกิน 19.00', NULL, 'https://goo.gl/maps/JcXL8tNsEkPt1PBd9', NULL, '17.059141, 102.787000', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00234', 'บ่อนไก่ดงเรือง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00235', 'ตาเรียง บ.ดอนแคน', 'เลขที่ 128 ม.12 บ้านดอนแคน', '992602160', NULL, NULL, 'https://goo.gl/maps/KkC4KVWfDPYBarLK9', NULL, '17.146847, 102.964875', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00236', 'พี่อี้ด ท่าคันโท (4)', NULL, '805489617', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/aoqCgeznsCfAhKq16', NULL, '16.939630, 103.216043', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00237', 'ธงฟ้า ศรีสว่าง (2)', NULL, '986319893', 'ไม่เกิน 17.00น.', NULL, 'https://goo.gl/maps/Kvbj3NQiE2FA4CrU8', NULL, '16.996172, 103.053000', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00238', 'ตาไหม', 'ห้วยกองสี 0817995491', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00239', 'เพ็ญสิริพาณิชย์ [ว่าที่ ร.ต.หญิงสิริวรรณ อุทัยคู] (3)', '81 ม.5 บ้านโนนสูง ต.จำปี อ.ศรีธาตุ จ.อุดรธานี 41230', '899892026', 'ไม่เกิน19.00น.', NULL, 'https://goo.gl/maps/C3PbBxu6pvBUMTtE7', NULL, '16.986762, 103.170000', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00240', 'ยายแว', NULL, '810596197', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00241', 'น.ส.กนกวรรณ พันธ์หอม (ร้านบิ๊กเต้) (2)', '2 หมู่ 6 ต.ตาดทอง อ.ศรีธาตุ จ.อุดรธานี 41230', '902983536', 'ไม่เกิน 16.00น.', NULL, 'https://goo.gl/maps/WEtYsswCbkkL5h6T7', NULL, '17.030441, 103.069000', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00242', 'ทะเบียน 7209', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00243', 'บุหรี่รถวิ่ง', 'SMS แดง5 เขียว5 วันเดอแดง3 เขียว2 กรองทิพย์2 LM ล แดง5 เขียว3', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00244', 'ช่อธิชาพาณิชย์', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00245', 'สินเจริญพานิช', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00246', 'ตาพิทักษ์', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00249', 'เฮียดงเมือง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00250', 'ท่าลี่', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00251', 'ลูกหนี้', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00252', 'ยายน้อย โคกสว่าง', NULL, '953282281', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00253', 'ประชารัฐคำหว้าทองหมู่9 (1)', NULL, '949863642', 'ไม่เกิน 19.00น.', NULL, 'https://goo.gl/maps/QsCZ9aEMMZgMNJm76', NULL, '17.156200, 102.786925', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00254', 'หจก.พรมนารายณ์ขายถูก [สำนักงานใหญ่]', 'หมูบ้านดงเมือง เลขที่ 199 ม.2 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '896185155', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00255', 'พี่ยุ้ย', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00256', 'ลินดาพร', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00257', 'ชุมชนบ้านดอนแคน', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00258', 'ไคฮวดจั่น', NULL, '815455996', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00259', 'ร้าน สุกัญญา บ.อุ่มจาน', '86 ม.14 บ.อุ่มจาน ต.อุ่ทจาน อ.ประจักษ์ศิลาคม จ.อุดรธานี 41110', '983528151', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00260', 'ติงนอย ศรีธาตุ (3)', NULL, '0851259706/085984858', NULL, NULL, '(16.9766830, 103.2190740)', NULL, '16.976516, 103.218961', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00261', 'ยุวดี (1)', NULL, '933902651', NULL, NULL, 'https://goo.gl/maps/4KrobTv81YM4bKn6A', NULL, '17.073851, 102.924021', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00262', 'ตาคร', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00263', 'กู่แก้วซุปเปอร์สโตร์', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00264', 'ชาโต้ ช้อป', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00265', 'ลำดวน', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00272', 'แม่รุ่ง', NULL, '635868026', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00273', 'ยายธา บ้านนาดี', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00274', 'น้องแก้ม บ้านแสงสว่าง', 'บ้านแสงสว่าง อ.หนองแสง', '614960855', NULL, NULL, 'https://goo.gl/maps/auTH9fPVbkgFc3Y67', NULL, '17.123807, 102.823957', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00275', 'ชันโย', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00276', 'ตาเตี้ย', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00277', 'แม่บุญเพง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00278', 'ปริญญาต้นกล้วย', '81 ม.1 บ.โนนรังษี ต.ห้วยเกิ้ง อ.กุมภวาปี', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00279', 'ร้าน ป.วสินธุ์การค้า (ว่าที่ ร.ต.ทวีสินธุ์ หอมสมบัติ) (3)', '4 หมู่3 ต.หัวนาคำ อ.ศรีธาตุ จ.อุดรธานี 41230', '0954464244/081999545', 'ไม่เกิน 20.00น.', NULL, 'https://goo.gl/maps/H3V2ubEUMXatvQCb6', NULL, '17.081507, 103.284000', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00280', 'หน้าร้าน(3)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00281', 'น้องแพท', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00282', 'แม่อ่อนสา', NULL, '917266188', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00284', 'บังอร', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00285', 'ร้านจูน', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00286', 'พี่อ้อเฟรสยู', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00288', 'สหการโรงงานน้ำตาลกุมภวาปี', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00289', 'ตาแก้ว', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00290', 'มาลัย การค้า', '66 ม.6 บ.ผือ ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370 โทร.098-6622356', NULL, NULL, NULL, 'https://maps.app.goo.gl/1dA7wjoSvW1vELZD7', NULL, '17.131288, 102.915337', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00291', 'สหการอุ่มจาน หมู่8', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00292', 'ร้านยอดพาณิชย์ (โรงเรียนโนนสะอาดเก่า) (1)', NULL, '847937395', NULL, NULL, 'https://goo.gl/maps/6EB3GdvPw7deq7QA8', NULL, '17.071200, 102.855903', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00293', 'อ.บ.ต. ขวัญรัก', '062-9698214 อยู่ใกล้ร้านต้นคุณ', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00294', 'ตาใจ บ้านโนนจำปา', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00295', 'นางบุญเสริม สารพันธ์ (ตุ๋ยการค้า)(1)', '145/1 ม.8 ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี 41110', '819753287', 'ไม่เกิน 19.00น.', NULL, 'https://goo.gl/maps/ENwntu7YaEdGSBtY9', NULL, '17.070120, 102.954989', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00296', 'ตะวันชา (1)', NULL, '0800100584/092698827', 'ไม่เกิน 17.30น.', NULL, 'https://goo.gl/maps/tNU2MFjaVKMKydSt9', NULL, '17.110031, 103.013955', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00297', 'สหกรณ์โนนทอง', NULL, '930646083', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00298', 'ตาอ้วน (5)', 'ติดโรงน้ำ เส้นเดียวกับอุไรลักษ์', '822817587', NULL, NULL, 'https://goo.gl/maps/9YHv3aEHbEqQFbrcA', NULL, '17.165546, 102.959914', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00299', 'ร้านทรวงสุดา', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00300', 'จันทร์ญาพานิชย์', 'อ.สร้างคอม', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00301', 'เที่ยงโภชนา (1)', NULL, '935488094', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/GRpze93YUqGRJ1sZ9', NULL, '17.049451, 102.925968', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00302', 'ขายหน้าร้านปีใหม่2562', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00303', 'เอเชีย มินิมาท', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00304', 'ทิพวรรณ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00305', 'ร้านรินทอง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00306', 'เพ็ญธิชา พานิชย์', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00308', 'เจ้ด่วน ดวน ด่วน ด้วน ด๊วน ด๋วน', NULL, '935576964', NULL, NULL, 'https://maps.app.goo.gl/KjW5crZQGrZF3bSb6', NULL, '17.070961, 102.856442', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00309', 'ประชารัฐ ศรีธาตุ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00310', 'น.ส.อนงค์ ภูนิโรจน์ (พี่จุ๋มจิ๋ม) (2)', '115 หมู่6 ต.ตาดทอง อ.ศรีธาตุ จ.อุดรธานี 41230', '950509803', 'ไม่เกิน 20.00น', NULL, 'https://goo.gl/maps/oUqhGJwapgxU6ZFX9', NULL, '17.028224, 103.062573', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00311', 'สุภาพรพาณิชย์ (3)', NULL, '0652795659/ไลน์', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/j4ziUbDQsWUX1y3S8', NULL, '17.057792, 102.919989', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00312', 'ป๋าคาราบาว (5)', NULL, '0857433387/แอพ+ไลน์', 'ไม่เกิน 19.00น', NULL, 'https://goo.gl/maps/njLggcXcNwVzHjga8', NULL, '17.177651, 102.943989', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00314', 'แม่ทอง บ้านหมากบ้า (5)', NULL, '994645968', NULL, NULL, 'https://goo.gl/maps/pg2D4DcoC4S9TVCj6', NULL, '17.201141, 102.972021', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00315', 'สหกร ม.8 อุ่มจาน', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00316', 'TH-715 ค่าใช้จ่ายพระคุณกุดยาง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00317', 'เกษตรนิยม 2018 (5)', 'ประจักษ์', '0890018632/ไลน์', 'ไม่เกิน 17.00น', NULL, 'https://goo.gl/maps/CXs8Qn4uvmqj9X12A', NULL, '17.262061, 103.007957', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00319', 'ธนาคารออมสิน สาขากุมภวาปี', '93 หมู่9 ต. กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00320', 'แม่พร อุ่มจาน', NULL, '655084859', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00321', 'ประชารัฐทับกุง หมู่3', NULL, '933733526', 'ไม่เกิน18.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00322', '717 โนนสะอาด', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00323', 'ศรีธาตุ ประชารัฐ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00324', 'พ่อดิษ ท่าสี', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00325', 'พ่อแหลม ท่าสี', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00327', 'น้องก้อง ทับไฮ(1)', 'สามแยกต้นมะขามใหญ่', '614547131', NULL, NULL, 'https://goo.gl/maps/yXgXBpJxEMF4AwvC7', NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00328', 'พี่หมี', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00329', 'น้าแสง บ้านบุ่งหมากลาน (1)', NULL, '924390096', 'ไม่เกิน 16.30น.', NULL, 'https://goo.gl/maps/2hHo74eApC8qJch58', NULL, '17.066792, 102.889403', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00330', 'แม่จัน ทับไฮ (1)', NULL, '951723350', 'ไม่เกิน 15.00น', NULL, 'https://goo.gl/maps/m33XAbQyvTyGw1359', NULL, '17.109982, 102.778011', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00331', 'พี่จอย ทับไฮ (1)', NULL, '879387728', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00332', 'แม่สี ท่าสี (1)', NULL, '886048748', 'ไม่เกิน 20.00น.', NULL, 'https://goo.gl/maps/c6825P4xLeBKcjiC6', NULL, '17.130661, 102.783032', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00333', 'นภาภรณ์', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00334', 'แม่อ่อน ท่าคันโท (4)', NULL, '801694360', 'ไม่เกิน 18.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00335', 'ผ.อ. คลัง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00');
INSERT INTO `store` (`store_id`, `store_name`, `store_address`, `telephone_number`, `fax_number`, `email`, `url`, `customer_delivery_time`, `store_location`, `created_at`, `open_time`, `close_time`) VALUES
('AR00336', 'พี่หนา', NULL, '859244557', NULL, NULL, 'https://goo.gl/maps/uAAC7AcgcbNmhybM6', NULL, '17.142187, 102.965142', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00337', 'วัดโพธิ์ศรีสว่าง( 0856451935)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00338', 'สหการบ้านดอนคง (5)', NULL, NULL, 'ไม่เกิน 19.00น', NULL, NULL, NULL, '17.409638, 102.803046', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00339', 'รัศมี พาณิชย์', '194 ม.7 ต.นางิ้ว อ.เขาสวนกวาง จ.ขอนแก่น', '812060836', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00340', 'วัดลำดวน (092-8922643 พระครูสุจิตร)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00341', 'คุณจักรพรรดิ ไชยสาส์น', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00343', 'นางรัศมี กุระกนก (รัศมีการค้า)', '145 ม.5 ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00344', 'วัดบ้านกงพาน', NULL, '621958823', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00346', 'ชาววัง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00347', 'ยายพงษ์ น้ำฆ้อง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00348', 'แม่อำพัน (1)', NULL, '808532760', 'ไม่เกิน 19.00น.', NULL, 'https://goo.gl/maps/94HnFFnCp5ZmwPtP9', NULL, '17.037562, 102.859946', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00350', 'ไพสุดา ประสานโชค', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00351', 'ร้าน ประชารัฐชุมชนบ้านไทรงาม ม.6', '209 ม.6 บ้านไร่ ต.ตาดทอง อ.ศรีธาตุ จ.อุดรฯ 41230', '942926995', NULL, NULL, 'https://goo.gl/maps/oqirPoWogwFHFQ3w6', NULL, '17.212248, 103.009512', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00352', 'วัดโพธิ์', NULL, '817392257', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00353', 'แม่กรกมล สงเปลือย(5)', NULL, '9948918250892340000', NULL, NULL, '17.19000397768163, 102.93494089653421', NULL, '17.190004, 102.934941', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00354', 'รักษ์คณา พาณิชย์', '251 หมู่ 7 บ.นาเหล่า ต.หนองกุงศรี อ.โนนสะอาด จ.อุดรธานี 41240', '923123928', 'สะดวกรับสินได้ไม่เกิ', NULL, 'https://goo.gl/maps/cJmVEZofh475kqDf7', NULL, '17.055830, 102.785996', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00355', 'คูสวัสดิ์', NULL, '887353500', NULL, NULL, 'https://goo.gl/maps/6izHzfYA7MEmBNWm6', NULL, '17.130423, 102.964856', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00356', 'นาตยา ศรีวงษา', 'ตูมใต้', '986399775', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00357', 'ห้างหุ้นส่วนจำกัดแจ่วฮ้อนบ้านสวนโนนสะอาด (2)', '31 หมู่2 ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี 41240 ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี 41240', '042392107/0897153860', 'สะดวกรับสินค้าไม่เกิ', NULL, 'https://goo.gl/maps/HfCgnMJaVV2YajRW7', NULL, '16.981822, 102.893316', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00358', 'แม่กอง นาเหล่า (1)', NULL, '968590956', 'ไม่เกิน 19.00น', NULL, 'https://goo.gl/maps/wCwMmh3iYGeoZwwb8', NULL, '17.057082, 102.786000', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00359', 'สหกรป่าเปลือย', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00360', 'แม่เยาว์', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00361', 'แม่สายจันทร์ ห้วยยาง (1)', NULL, '0810506795/สั่งเอง', 'ไม่เกิน 18.00น', NULL, 'https://goo.gl/maps/1q3oxg7WarFMVZbR6', NULL, '17.046062, 102.841021', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00362', 'Return', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00364', 'ร้านนภัสสรพาณิชย์', '77 ม.10 บ้านวังน้ำทิพย์ ต.โนนสมบูรณ์ อ.เขาสวนกวาง จ.ขอนแก่น 40280', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00365', 'บ.อุดรเปเปอร์ รีไซเคิล จำกัด', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00366', 'น้องทิว', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00367', 'พี่แอ๋น บ้านหมากบ้า', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00368', 'น้องปลื้มบ้านน้ำเที่ยง', NULL, '653167876', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00369', 'แม่ประนม อ.หนองแสง', NULL, '933392347', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00370', 'ออปออ คลาสสิก [พี่กี้]', '127 บ้านนาดี ต ผาสุก อ.กุมภวาปี จ อุดรธานี 43170', '810220621', 'ไม่เกิน19.00น.', NULL, 'https://goo.gl/maps/NHpt1FngNW26opJr9', NULL, '17.199613, 102.929979', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00371', 'ร้านแม่วิไล', '42 ม.2 บ.โนนสะอาด ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี', '655361993', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00372', 'ประณีพานิชย์ (แม่ตุ๋ย บ้านนาเหล่า) (1)', '165 บ.นาเหล่า ต.หนองกุงศรี อ.โนนสะอาด จ.อุดรธานี 41240', '935203110', 'ไม่เกิน 16.00น', NULL, 'https://goo.gl/maps/r1kCZLkNptxsuhSk9', NULL, '17.061772, 102.787043', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00373', 'พี่โอ๋ ทับกุง', NULL, '611367786', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00374', 'แม่บล บุ่งหมากลาน', NULL, '651104152', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00376', 'เฮียสมชายน้ำพอง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00377', 'แม่วันเพ็ญ', 'บ้านดงสามสิบ', '642420911', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00378', 'แม่แพงศรี', 'บ้านดงสามสิบ', '883129546', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00379', 'พรพรรณ', 'บ้านสี่แจ', '966849001', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00380', 'พี่เนตร', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00381', 'พ่อทองพูน ขันคำหมื่น', 'บ้านสี่แจ', '935485491', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00382', 'ยายแป๋ว', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00383', 'แม่หอม ทับกุง (1)', NULL, '610895793', 'ไม่เกิน 19.00น.', NULL, 'https://goo.gl/maps/ZPR76Hpi5FQV1u4A9', NULL, '17.168572, 102.776000', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00384', 'วัฒนชัย', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00385', 'ยายน้อย บ้านหนองหญ้า', '095-5639063', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00386', 'นาง อฤทชรา ลือคำหาญ', '118 ม.10 43170', '9342574180811830000', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00387', 'ร้านค้าชุมชนโคกข่า ม.8(3)', 'ม.8 ต.บ้านโปร่ง อ.ศรีธาตุ จ.อุดรธานี 41230', '828393195', NULL, NULL, NULL, NULL, '17.000085, 103.112628', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00388', 'นายอุทัย โยลา', NULL, '8524987410641140000', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00389', 'ร้าน นวลสวาทการค้า (2)', '28 หมู่3 ต. ทมนางาม อ.โนนสะอาด จ. อุดรธานี ต.ทมนางาม อ.โนนสะอาด จ.อุดรธานี 41240', '833323659', NULL, NULL, 'https://goo.gl/maps/aWceVTjHxusMRB1H6', NULL, '16.909303, 103.001989', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00390', 'แม่ตุ่น บ้านไผ่ (1)', NULL, '801782005', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/Q8dHHiFzFe6xWrzh9', NULL, '17.107972, 102.978021', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00391', 'สวัสดี กู่แก้ว', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00392', 'ห้างหุ้นส่วนจำกัด ศรีธาตุสโตร์ บลูแฟลก (สำนักงานใหญ่)(3)', 'เลขที่ 171 หมู่ 8 ตำบลศรีธาตุ อำเภอศรีธาตุ จังหวัดอุดรธานี 41230', '0895768484​/09567056', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/jQTxuojXB6B7LuJu6', NULL, '16.974738, 103.221058', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00393', 'บ้านหมอโม', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00394', 'แม่บาน ม.3 บ้านกุดขนวน', NULL, '800507448', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00395', 'กุหลาบการค้า (1)', 'เลขที่11 หมู่11 ต.หนองกุงศรี อ.โนนสะอาด จ.อุดรธานี', '0810918943/ไลน์', 'ไม่เกิน 19.00น.', NULL, 'https://goo.gl/maps/NcH7AZ7bq429kSjv5', NULL, '17.061731, 102.786957', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00396', 'น้องปาร์ม โคกใหญ่โนนม่วง(3)', '182หมู่6 ต.จำปี อ.ศรีธาตุ .อุดรธานี 41230', '988141272', NULL, NULL, 'https://goo.gl/maps/VPSW7ZzS3dLsrVpQ8', NULL, '17.072113, 103.187011', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00397', 'แม่อุบล ข้าง สุภาพร (1)', NULL, '0931853295/093049385', 'ไม่เกิน 19.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00398', 'พงษ์พานิชย์ เมืองปัง (5)', NULL, '650467083', 'ไม่เกิน16.00น', NULL, 'https://goo.gl/maps/USjPrxACe7TfQxhM9', NULL, '17.222141, 103.078968', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00399', 'น้องแบงค์', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00400', 'แม่ลำดวนสุจินดา', 'บ้านตูมกลาง 111 หมู่2 ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี', '833404714', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00401', 'วิทยาลัยเทคโนโลยีอีสานเหนือ2 กุมภวาปี (1)', '128 หมู่ 5 ตำบลตูมใต้ อำเภอกุมภวาปี จังหวัดอุดรธานี 41110', NULL, NULL, NULL, 'https://maps.app.goo.gl/ihHvNiV3HaFdQdHX8', NULL, '17.086053, 102.934528', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00403', 'แม่ เฉลี่ยว ท่าลี', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00404', 'แม่เฉลี่ยว', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00405', 'โรงงานเกษตรผล', NULL, '856598572', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00406', 'วัดบ้านหมากบ้า', NULL, '817392980', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00407', 'บริษัท เล้งเส็ง จำกัด สำนักงานใหญ่', '1865/9 ถ.รัฐพัฒนา ต.ธาตุเชิงชุม อ.เมือง จ.สกลนคร 47000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00408', 'แม่ถาวร โนนสะอาด (2)', NULL, '611144655', 'ไม่เกิน19.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00409', 'แม่ลี หนองเหี้ย (1)', NULL, '0800056890/081259370', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/S9H2K9ULvCvC5vAUA', NULL, '17.020498, 102.950290', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00410', 'วัชระค้าส่ง ท่าลี่ (2)', NULL, '0935478918/082664177', 'ไม่เกิน 19.00น.', NULL, 'https://goo.gl/maps/vFxKnCkKzEwEWSrC7', NULL, '16.962931, 103.073989', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00412', 'นางอภิศร เฮงสัจจะกุล (ร้านตาตุ่ยการเกษตร) (1)', '288 หมู่ที่4 ตำบลแสงสว่าง อำเภอหนองแสง จังหวัดอุดรธานี', '0816346632/ไลน์', 'ไม่เกิน 18.00น', NULL, 'https://maps.app.goo.gl/w41LmEh6HvxviG1S9', NULL, '17.10271,102.77571', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00413', 'แม่บุญ บ้านกุดขอนแก่น', NULL, '643033205', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00414', 'แม่บุญเพ็ง กุดขอนแก่น', NULL, '643033205', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00416', 'อึ่ง ดอนแก้ว', '96 หมู่15 บ้านดอนแก้ว ต.กุมภวาปี อ.กุมภวาปี', '894515069', NULL, NULL, NULL, NULL, '17.133389, 103.017821', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00417', 'แม่บัวทอง บ้านหมากบ้า', NULL, '859251756', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00418', 'แม่กอง บ้านหนองหญ้า (1)', NULL, '610717742', 'ไม่เกิน 19.00น.', NULL, 'https://goo.gl/maps/2W3ex8CjwJvkgW2WA', NULL, '17.033290, 102.873914', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00419', 'สนธิพันธตระกูลพาณิชย์ (พ่อสน เก่า (1)', '26ม.9ต.ทับกุงอ.หนองแสงจ.อุดรธานี', '872263597', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/uovDupNMqz2WUBfFA', NULL, '17.154667, 102.788989', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00420', 'นางสาวณัฐธิดา กิติราช (ร้านณัฐธิดาการค้า) (3)', '280 หมู่ที่ 4 ตำบลแชแล อำเภอกุมภวาปี จังหวัดอุดรธานี', '987138160', 'ไม่เกิน18.00น.', NULL, 'https://maps.app.goo.gl/5dGZN2RLrL83ueqU9', NULL, '17.1741,103.080093', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00421', 'ลำใย นิคม', '234 ม.6 ต.ตูมใต้ อ.กมภวาปี จ.อุดรธานี', '847915818', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00422', 'อุดรการเกษตร', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00423', 'ชาบู ตรงข้าม โลตัส', NULL, '866309933', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00424', 'พี่กุ้ง (1)', NULL, '0810721442/ไลน์', 'ไม่เกิน 18.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00425', 'แม่หน่อย บ้านสงเปลือย (5)', NULL, '913599480', 'ไม่เกิน18.00น.', NULL, 'https://goo.gl/maps/vgsjnAgYtWYKmHAcA', NULL, '17.183526, 102.901957', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00427', 'พี่หมีปะโค(ญาติเขียว)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00428', 'แม่สายพิน ดงเมือง หมู่ 8 (1)', NULL, '849556360', 'ไม่เกิน 16.00น.', NULL, 'https://goo.gl/maps/htK77iytqw6itUdB8', NULL, '17.113833, 103.011445', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00429', 'นเรศ สอนกลาง', 'โพสง่า', '656688309', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00430', 'ประชารัฐ โคกหนองแวง ม.5 (3)', 'รหัสกองหนุน 41090605 หมู่5 ตำบลนายูง อำเภอศรีธาตุ จังหวัดอุดรธานี 41230', '0820415899/081662309', 'ไม่เกิน 17.00น', NULL, 'https://goo.gl/maps/9s5gQkCQpFbyM3X36', NULL, '16.967241, 103.267968', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00431', 'แม่พะยอม', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00432', 'แม่นาง บ้านสามเหลี่ยม', NULL, '842191953', NULL, NULL, 'https://goo.gl/maps/2sLoWRq5jKdvYAtB8', NULL, '17.172087, 102.800936', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00433', 'มะลิวัลย์โนนสะอาด', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00434', 'ทอแสงกระนวน', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00435', 'โรงเรียนบ้านปะโค', 'ต.ปะโค อ.กุมภวาปี จ.อุดรธานี', '806301092', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00436', 'แม่วิลัย', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00437', 'น้องสาม โนนสะอาด', NULL, '856363655', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00438', 'แม่แหลม บ้าน บุ่งหมากลาน', NULL, '617080495', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00439', 'อู่ซ่อมรถสัญญาการช่าง', NULL, '958043487', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00440', 'แม่ไล บุ่งหมากลาน ม.4 (1)', NULL, '981215749', NULL, NULL, 'https://goo.gl/maps/SS9e3NkPwnyAmHEm9', NULL, '17.068855,102.886939', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00441', 'ร้านพี่นาย C P T (1)', '36 ม.2 ต.ปะโค อ.กุมภวาปี จ.อุดรธานี', '886097694', 'ไม่เกิน 19.00น.', NULL, 'https://goo.gl/maps/2YcD9UTE2eSRRCyq9', NULL, '17.018810, 102.890013', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00442', 'สหการค้า', NULL, '817087876', NULL, NULL, 'https://goo.gl/maps/TBAqbeNRXPMzQpf96', NULL, '17.130614, 102.965265', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00443', 'พี่อ้อ (นัด)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00444', 'ร้านค้าชุมชนบ้านโนนทอง หมู่ 3', 'ต.หนองกุงศรี อ.โนนสะอาด จ.อุดรธานี 41240', '925715825', NULL, NULL, 'https://goo.gl/maps/J6jcr8fqLX6sCFQB9', NULL, '17.039092, 102.771435', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00445', 'หจก.เครือเกษตรท่าลี่ (2)', '137 หมู่บ้านท่าลี่ หมู่ที่ 4 ตำบลท่าลี่ อ.กุมภวาปี จ.อุดรธานี', '933966664', 'ไม่เกิน 19.00น.', NULL, 'https://maps.app.goo.gl/CHWDeEkUPK69jhZj9', NULL, '16.961856, 103.068965', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00446', 'แม่บาน เสริมสวย ภูฟ้า เลิกขาย', NULL, '815458633', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00447', 'บ้านปะโค', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00448', 'พี่ปัดเซลเอส-26', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00449', 'เฮียแอดขอนแก่น', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00450', 'อาจารย์ เกรียงศักดิ์ พิมรินทร์', NULL, '819540567', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00451', 'พี่เปีย (5)', 'ดอนคง', '878545789', 'ไม่เกิน 19.00น', NULL, 'https://goo.gl/maps/k3BacpLDwvxF5HNRA', NULL, '17.219131, 103.073000', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00452', 'บริษัท กว่างซี คอนสตรัคชั่น เอ็นจิเนียริ่งกรุ๊ป ยีอาน(ประเทศไทย) จำกัด สำนักงานใหญ่(1)', 'เลขที่ 538 อาคารแกรนด์ ชั้น5 ถนนรัชดาภิเษก แขวงสามเสนนอก เขตห้วยขวาง กทม. 10310', '025415391/ไลน์', '25415392', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00453', 'บริษัท ฉาง หยิง ค้าไม้ จำกัด[สำนักงานใหญ่]', '1 ม.4 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00454', 'บริษัท น้ำตาลเกษตรผล จำกัด(สาขาที่ 1)', 'เลขที่9 หมู่9 ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '042398480/093-281908', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00455', 'หลังดับเพลิงรร.กุมภวา', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00456', 'ร้านค้าชุมชน บ.โคกกลางน้อย', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00457', 'นางย้อย อาจพรม (แม่ย้อย บะยาว) (2)', '232 ม.8 บ.บะยาว ต.บุ่งแก้ว อ.โนนสะอาด จ.อุดรธานี 41240', '862410042', 'ไม่เกิน 19.00น.', NULL, 'https://maps.app.goo.gl/SuiKAFFRzfBGvUH29', NULL, '16.947852, 103.020954', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00458', 'ชลดา', '205 หมู่ 12 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '832873310', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00459', 'ได้รับเงินจากคณะกรรมการหมู่บ้าน บ้านนาดี ม.1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00460', 'ได้รับเงินจากคณะกรรมการหมู่บ้าน บ้านดงเรือง ม.2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00461', 'ได้รับเงินจากคณะกรรมการหมู่บ้าน บ้านสี่แจ ม.3', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00462', 'ได้รับเงินจากคณะกรรมการหมู่บ้าน บ้านสร้างบง ม.4', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00463', 'ได้รับเงินจากคณะกรรมการหมู่บ้าน บ้านสี่แจ ม.5', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00464', 'ได้รับเงินจากคณะกรรมการหมู่บ้าน บ้านหนองแวง ม.6', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00465', 'ได้รับเงินจากคณะกรรมการหมู่บ้าน บ้านหนองแวง ม.7', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00466', 'ได้รับเงินจากคณะกรรมการหมู่บ้าน บ้านดงเรือง ม.8', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00467', 'ร้าน ส.เจริญรุ่ง สี่แยกขาวัว (5)', NULL, '817390598', 'ไม่เกิน16.00น.', NULL, 'https://goo.gl/maps/AB1gV6dg2cudoQNq6', NULL, '17.254341, 103.116989', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00468', 'ได้รับเงินจากคระกรรมการหมู่บ้าน โนนผาสุก หมู่ 9', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00469', 'ได้รับเงินจากคณะกรรมการหมู่บ้าน สี่แจ หมู่ 10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00470', 'โรงเรียนบ้านผักตบประชานุกูล', '158 ม. 10 บ้านผักตบ ต.ผักตบ อ. หนองหาน จ.อุดรธานี 41130', '42149067', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00472', 'ร.ร.บ้านเชียงแหว', 'หมู่ 1 ต.เชียงแหว อ. กุมภวาปี จ. อุดรธานี', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00473', 'ปรารถนา ศรีทอง (โคกสง่ามาร์เก็ต)', '197 ม.5 ต.หัวยสามพาด อ.ประจักษ์ จ. อุดรธานี 41110', '0862319830(ห้ามโทรเด', NULL, NULL, 'https://maps.app.goo.gl/DQng89Qi6kqeuDMW8', NULL, '17.230376, 102.947120', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00474', 'บริษัท สไตรค์ ฟอร์ส จำกัด (สำนักงานใหญ่)', 'เลขที่18 ซ.กรุงเทพกรีฑา 33 แยก 1 แขวงทับช้าง เขตสพานสูง กรุงเทพฯ 10250', '23683133', '23683461', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00475', 'บริษัท ขุนพลปิโตรเลี่ยม จำกัด', '194/1 ม.3 ตำบลตูมใต้ อำเภอกุมภวาปี จังหวัดอุดรธานี 41110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00476', 'ชิมช้อปใช้', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00477', 'นางอำนวย งามศิริสมสกุล (สกุลไทย) (2)', '191 หมู่ 2 ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี 41240', '801786363', NULL, NULL, 'https://goo.gl/maps/SLHExUgQJDapkdWZA', NULL, '16.968321, 102.893882', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00478', 'ชนิดา ศรีพันดอน', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00479', 'แม่พันธ์ สี่แยก นาแบก', NULL, '982454595', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00480', 'พี่อ้อ นาเหล่า', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00481', 'แม่อื๋อ บ้านโพธิ์สง่า (1)', NULL, '917912097', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/W9rbS8NzDhcwbEY57', NULL, '17.0951,103.001834', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00482', 'พี่เอ๋ ตรงข้าม วัดโพธิ์สง่า (1)', '211 หมุ่ 14 บ้านโพสง่า ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '610974056', NULL, NULL, 'https://maps.app.goo.gl/8UVNNdfift3yUnkP7', NULL, '17.097090, 103.006254', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00483', 'ร้านตรีภูมิการค้า (1)', '263 หมู่ 1 ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี 41110', '909626965', 'ปิดร้านทุกวันอาทิตย์', NULL, 'https://goo.gl/maps/suKaMoTk9BbGvN8x7', NULL, '17.044997, 102.961000', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00484', 'นายจักรพรรดิ ไชยสาส์น', '111 ม. 1 ต. พันดอน อ. กุมภวาปี จ. อุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00485', 'น้องพอต โนนสะอาด', NULL, '0959511017/098320178', 'รับสินค้าหน้าร้าน 15', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00486', 'บริษัท วิวัตน์กสิกิจ จำกัด', '21/32 ซ.ศาลาธรรมสพน์ 14 แขวงศาลาธรรมสพน์ เขตทวีวัฒนา กรุงเทพฯ 10170', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00487', 'โรงเรียนบ้านสี่แจ', 'หมู่3 ตำบล ผาสุก อำเภอ กุมภวาปี จังหวัด อุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00488', 'รุ่งนภาบ้านปะโค', NULL, '648508748', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00489', 'ยายพาด', NULL, '872183705', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00490', 'นาง วาระนีย์ สมบูรณ์', '298 หมู่ที่ 12 ตำบล หัวนาคำ อำเภอ ศรีธาตุ จังหวัดอุดรธานี', '807598434', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00491', 'แม่สุภาพ หนองโก', NULL, '878671917', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00492', 'หจก.ไพสิฐปิโตรเลียม', '183 หมู่ 5 ตำบลตูมใต้ อำเภอกุมภวาปี จังหวัดอุดรธานี 41110', '885643044', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00493', 'โรงงานน้ำตาลเกษตรผล', 'เลขที่9 หมู่9 ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370 สาขาที่ 1 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '800122679', NULL, NULL, 'https://maps.app.goo.gl/WS2u9tgEoDyV5ber7', NULL, '17.049074, 102.922145', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00494', 'วิทยาลัยเทคนิคกาญจนาภิเษกอุดรธานี', '7 ถ.อุดร-ขอนแก่น ต.หนองไผ่ อ.เมือง จ. อุดรธานี 41330', '42295547', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00495', 'พ่อสม สุนทอง อุ่มจาน(5)', NULL, '0807538577/หน้าร้าน', NULL, NULL, NULL, NULL, '17.233079, 103.047295', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00496', 'บริษัท สไตรค์ ฟอร์ส จำกัด (สำนักงานใหญ่) เลขที่ 18 ซ. กรุงเทพกรีฑา 33 แยก 1 แขวงทับช้าง เขตสะพานสูง กรุงเทพฯ 10250', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00498', 'พ่อทองใบ บะยาว (2)', NULL, '899407108', 'ไม่เกิน 19.00 น', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00499', 'ศรีธาตุแกส(เฮียโต้ง2)', NULL, '833603114', 'รับสินค้าเองหน้าร้าน', NULL, NULL, NULL, '17.128800, 102.964675', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00500', 'บริษัท ตั้งฮั่วไถ่ (1999) จำกัด', '203-203/1-3 ถ.ประจักษ์ศิลปาคม ต.หมากแข้ง อ.เมือง จ.อุดรธานี 41000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00501', 'พี่ปลา บ้านท่าลี่', '103 ม.14 ต.ท่าลี่ อ.กุมภวาปี จ.อุดรธานี', '929499388', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00502', 'ร้านภาเจริญ', '339 ม.2 บ้านโนนสะอาด ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี 41240', '42392011', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00503', 'ร้านอันจัง บ้านนาแบก', NULL, '826047028', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00504', 'พี่น้อง บ้านไซยงาม', NULL, '924456962', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00505', 'นางสาวฉวีวรรณ์ เวอร์บิค (ตะวันเงิน) (1)', '110 หมู่ที่6 ตำบลแสงสว่าง อำเภอหนองแสง จังหวัดอุดรธานี', '0922501526/ไลน์', 'ไม่เกิน 20.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00506', 'พี่จุ๊บแจง', 'ข้างโรงงานน้ำตาลห้วยเกิ้ง', '933243614', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00508', 'เมืองปัง หมู่3', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00509', 'ร้านทรัพย์ธานี', '225 ม.15 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00510', 'เจ้นิว ศรีธาตุ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00511', 'ร้านไพบูลย์มินิมาร์ท', 'อ.ประจักษ์ศิลปาคม', '898787866', 'ไม่เกิน 19.00 น', NULL, 'https://goo.gl/maps/JiEauxiWhgPXfysU6', NULL, '17.215956, 102.937968', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00512', 'นับตัง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00513', 'กอบกิจ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00514', 'แม่สาย ทับกุง (1)', NULL, '611436824', 'ไม่เกิน 16.00', NULL, 'https://maps.app.goo.gl/5Typ4ygMM8H8Sftd7', NULL, '17.173904, 102.769404', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00515', 'แม่ม้วย บะยาว (2)', 'บ้านบะยาว', '847952368', 'ไม่เกิน 19.00น.', NULL, 'https://goo.gl/maps/B29JLDyn7buox1DJ8', NULL, '16.947341, 103.016989', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00516', 'ปอกอล์ฟ ปลีก/ส่ง', '482/14 หมู่ที่ 2 ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี', '852354849', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00517', 'บจก. เอื้อปัญญาทรานสปอร์ต (2004)', '407 ม.4 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, '17.131374, 102.944006', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00518', 'พี่นก บ.หนองโก', NULL, '0930601889/แอพ+ไลน์', 'ไม่เกิน 20.00น.', NULL, 'https://goo.gl/maps/3zQgb5FNZEk83map7', NULL, '16.949859, 103.000000', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00519', 'พ่อ ศุภชัย บ้านสงเปลือย', NULL, '894188655', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00520', 'ศุภเสก การค้า', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00522', 'รร.กุมภวาปีพิทยาสรรค์', '292 ม.19 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00523', 'พี่เก๋ โนนสะอาด ยกเลิกใช้พี่เก๋ สีออ', NULL, '614458571', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00524', 'ครูอุ๋ย วิทยาลัยการอาชีพ กุมวาปี', NULL, '981028547', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00525', 'ร้านเต็มศิริ นาฝาย (1)', '85 ม.2 ต.นาดี อ.หนองแสง จ.อุดรธานี 41340', '862395590', 'ไม่เกิน 19.30น.', NULL, 'https://goo.gl/maps/zkXytvdZ64L5sYr48', NULL, '17.08472,102.855989', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00526', 'บริษัท เชาวน์ดี อีสาน จำกัด', '261 หมู่ 8 ตำบล เวียงคำ อำเภอ กุมภวาปี จังหวัด อุดรธานี 41110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00527', 'ถุงทองการค้า(โรงแป้ง)(3)', NULL, '934744820', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00528', 'ไก่ย่างผาสุก', NULL, '857597295', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00529', 'บริษัท ขุนพลพาณิชย์ (2018) จำกัด', '237/4 ม.11 ต.คำม่วง อ.เขาสวนกวาง จ.ขอนแก่น 40280', '610307143', NULL, NULL, 'https://goo.gl/maps/PyyKoNagXmwqTAcr9', NULL, '16.847545, 102.855482', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00530', 'บริษัท โค้วน่ำเซ้ง ออโต้ลีส จำกัด', '449 หมู่4 ต.พันดอน อ. กุมภวาปี จ. อุดรธานี 41110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00531', 'แม่แว๋ว', NULL, '943081115', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00532', 'ร้านพี่น้อย ทับกุง (1)', '', '819746968', 'ไม่เกิน 15.00น', NULL, 'https://goo.gl/maps/UgUF9BbfGiCCbnru6', NULL, '17.168043,102.775', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00533', 'บริษัท ดีเคเอสเอช [ประเทศไทย] จำกัด', '2535 ถ.สุขุมวิท แขวงบางจาก เขตพระโขนง กทม 10260', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00534', 'พี่น้ำ ท่ายม', NULL, '653147034', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00535', 'ร้านนานา ดงเรือง', NULL, '857597295', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00536', 'หจก.เฮียบหงวนมิลเลอร์ สาขาที่ 00008', '11 หมู่ 14 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '42331999', '042-331212', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00537', 'โรงเรียนบ้านหนองแสง', 'ต.หนองแสง อ.หนองแสง จ. อุดรธานี 41340', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00538', 'พ่อทูล โนนจำปา-นาเหล่า', 'บ้านโนนจำปา น่าเหล่า 098-657-2976', '986572976', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00539', 'อบต.โพธิ์ศรีสำราญ', 'ม.3 ต.โพธิ์ศรีสำราญ อ.โนนสะอาด จ.อุดรธานี 41240', '42133033', '089-5698991', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00540', 'แม่เสถียร เนตรภักดี', 'บ้านโนนสิมมา', '896208953', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00541', 'วัดโพธิ์สีสว่าง บ้านตูมใต้', NULL, '856451935', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00542', 'ร้านโฟกัส มินิมาร์ท (3)', '232 หมู่ 5 ต.ศรีธาตุ', '968810180', 'ไม่เกิน 19.00น', NULL, 'https://goo.gl/maps/X5N1XXi1iXKqVWAZ6', NULL, '17.017368, 103.212892', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00543', 'อ้อ หนองกวาง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00544', 'นุ ท่าลี่ (2)', NULL, '828704329', 'ไม่เกิน 19.00น', NULL, 'https://maps.app.goo.gl/2629YKRdhMeHXQ9S6', NULL, '16.963981, 103.079750', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00545', 'บริษัท แฟลช เอ็กซ์เพรส จำกัด (สำนักงานใหญ่)', '184/233 และ 18/235 อาคารฟอรั่ม ทาวเวอร์ ชั้่น 34 และ 36 ถนนรัชดาภิเษก แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร 10310', '02-168-2700', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00546', 'บริษัท สไตรค์ ฟอร์ส จำกัด (สำนักงานใหญ่ )', 'เลขที่ 18 ซอย กรุงเทพกรีฑา 33 แยก 1 แขวงทับช้าง อ.เขตสะพานสูง จ.กรุงเทพมหานคร', '23683133', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00547', 'บริษัท เมืองไทยแคปปิตอล จำกัด (มหาชน)', '332/1 ถ.จรัญสนิทวงศ์ แขวงบางพลัด เขตบางพลัด กรุงเทพมหานคร 10700 ต.บางอ้อ อ.เขตบางพลัด จ.กรุงเทพมหานคร', '028801033/024838888', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00548', 'หจก.ดีเอ็นเอ ออกาไนเซอร์ กรุ๊ป', '106 หมู่5 ตำบลจำปาโมง อำเภอบ้านผือ จังหวัดอุดรธานี 41160', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00549', 'หจก.ส.วิวัฒน์การสุรา', '396 ม.13 ถ.แชแล ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00550', 'บริษัท โตโยต้า ชิณณ์ นนท์ อุดรธานี จำกัด', '999 ถ.เลี่ยงเมืองหนองคาย-สกลนคร ต.หมากแข้ง อ.เมืองอุดรธานี จ.อุดรธานี', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00551', 'ท็อป', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00552', 'แม่จันทร์ บ้านหัวขัว(1)', NULL, '984320889', 'ไม่เกิน17.00น.', NULL, 'https://goo.gl/maps/o8gwBf6BkqQzq1or9', NULL, '17.063710, 102.896979', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00553', 'เฮียจ่อยคอกไก่', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00554', 'สหการ บ้านโนนเขวา ท่าลี่ (2)', 'บ้านเลขที่ 341 ม.8 ต.สีออ อ.กุมภวาปี จ.อุดรธานี', '986644767', NULL, NULL, 'https://maps.app.goo.gl/npkKhgspfyrDejea6', NULL, '16.997347, 103.025656', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00555', 'การไฟฟ้าฝ่ายผลิตแห่งประเทศไทย 110/50หมู่ 17 ถ.มิตรภาพ ต.ในเมือง อ.เมือง จ.ขอนก่อน', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00556', 'แม่ไข่ อุ่มจาน (ร้านลูก) (5)', NULL, '826065406', 'ไม่เกิน 20.00น', NULL, 'https://goo.gl/maps/sLaUn3HG1sNnSo43A', NULL, '17.234431, 103.042968', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00557', 'วรรณ ห้วยเกิ้ง', NULL, '922501526', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00558', 'บริษัท ป้อมพลัง จำกัด สำนักงานใหญ่', '6 ม.15 ต.ศิลา อ.เมืองขอนแก่น จ.ขอนแก่น 40000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00559', 'วัดจินดาราษฎร์บำรุง[ห้วยเกิ้ง]', '123/1 ต.ห้วยเกิ้ง อ.กุมภวาปี', '0942826339 พี่ต้อม', NULL, NULL, NULL, NULL, '16.990334, 102.894625', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00560', 'วัดโพธิ์ชัย(พระใหญ่)', NULL, '982282253', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00561', 'เพแซ่บเวอร์ บุ่งหมากลาน', NULL, '617055185', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00562', 'สาวิกาค้าขาย (2)', '72 หมู่8 ต.ทมนางาม อ.โนนสะอาด จ.อุดรธานี', '860812236', NULL, NULL, 'https://goo.gl/maps/yHbMPY3hYybVJFZt8', NULL, '16.911884, 102.999936', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00563', 'จ่าพัฒน์ โนนสววค์', NULL, '982373766', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00564', 'พี่ปุ๊กคนสวย', NULL, '808184621', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00565', 'สำนักงานประกันสังคมจังหวัดอุดรธานี', 'สาขากุมภวาปี 253/5-6 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR00566', 'นาย ศุภกิจ เมฆสุวรรณ 223/91 หมู่ที่ 7 ต. คลองสวนพลู อ.พระนครศรีอยุธยา จ.พระนครศรีอยุธยา 13000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900001', 'หจก. อุดรอาชากรุ๊ป', '99/9 ม.6 ซ.บ้านเดื่อ ต.หมากแข้ง อ.เมือง จ.อุดรธานี 41000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900002', 'บริษัท ศักดิ์สยามลิสซิ่ง จำกัด (มหาชน) สาขาที่ 301 312/8-9 ม.4 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900003', 'บริษัท ศักดิ์สยามลิสซิ่ง จำกัด (มหาชน) สาขาที่ 301', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900004', 'บริษัท ศักดิ์สยามลิสซิ่ง จำกัด (มหาชน) สาขาที่ 301 312/8-9 ม.4 ต.พันดอน อ.กุมภวาปี จ.อุดธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900005', 'ธ.ก.ส.สาขาพันดอน 60 หมู่ 15 ถ.กุมภวาปี-ศรีธาตุ อ.กุมภวาปี จ.อุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900006', 'ธ.ก.ส.สาขากุมภวาปี', '31 ม.9 ถ.แชแล ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี', '42202729', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900007', 'การประปาส่วนภูมิภาค สาขา กุมภวาปี สาขาที่ 00138 [ยกเลิกใช้]', '777 หมู่ที่ 15 ถนนพิศาลสารกิจ ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900008', 'การประปาส่วนภูมิภาค สาขากุมภวาปี สาขาที่ 00138', '777 หมู่ที่ 15 ถนนพิศาลสารกิจ ตำบลพันดอน อำเภอกุมภวาปี จังหวัดอุดรธานี ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900010', 'วัดทุ่งสว่างวณาราม พันดอน', NULL, '905708139', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900011', 'ยา เมืองปัง(ร้านก๋วยเตี๋ยว)', NULL, '811292739', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900014', 'นางสาววรรณวิสา หอมอ้ม (เจ้จูโคกข่า)', '113 หมู่ที่8 ตำบลบ้านโปร่ง อำเภอศรีธาตุ จังหวัดอุดรธานี', '093-4352651/061-6684', NULL, NULL, 'https://maps.app.goo.gl/8xQzRNDd79f1wG347', NULL, '17.001763, 103.115875', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900015', 'วัดเกียรติไพรบูลย์ พันดอน หมู่ 4 บ้านวาปี ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', NULL, '972138197', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900016', 'เอส พี ช้อป ศรีธาตุ', NULL, '981679927', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900017', 'บริษัท ปิโตรเลียมไทย คอร์ปอเรชั่น จำกัด สาขา กุมภวาปี 6 39 ม3 ต ผาสุก อ กุมภวาปี จ อุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900018', 'แม่ทิพย์', '065-6274911', '656274911', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900020', 'ร้านค้าชุมชนบ้านท่าสี (1)', NULL, '0830353548/แอพ+ไลน์', 'ปิดทุกวันที่ 25 ของท', NULL, 'https://goo.gl/maps/hNzTw7UGPPnfgpSE7', NULL, '17.128788, 102.783087', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900021', 'น้องโบว์พานิชย์ (1)', 'บ้านบุ่งหมากลาน', '862242548', 'ไม่เกิน18.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900024', 'สหกร ออมทรัพย์ โพนทอง หมู่12', NULL, '611598580', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900025', 'เบบี้เฟิสท์ มาร์ท (5)', '182 หมู่ 3 บ.ดอนม่วง ต.นาม่วง อ.ประจักษ์ศิลปาคม จ.อุดาธานี 41110', '872203412', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/tCDU18FjR8boX48NA', NULL, '17.267510, 103.000968', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900026', 'นายปฏิภาน ทาแก้ว', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900027', 'อุดมศักดิ์ บ้านกุดจิก', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900028', 'แม่เกด บุ่งหมากลาน', NULL, '871215883', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900030', 'เกรียงศักดิ์ ศรีธาตุ(3)', NULL, '0864815342/ไลน์', 'ไม่เกิน 18.00น', NULL, 'https://goo.gl/maps/akKHdWWWXqTyrauf6', NULL, '16.976231, 103.216021', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900031', 'บริษัท เอ็มจี มอเตอร์ อุดรธานี จำกัด', '909 หมู่4 ต.บ้านจั่น อ.เมืองอุดรธานี จ.อุดรธานี 41000', '42292755', '042-292266', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900032', 'แม่ประไพ กุดจิก (1)', NULL, '967716909', 'ไม่เกิน20.00น.', NULL, 'https://goo.gl/maps/KKw1uCw3tdqUgYWz6', NULL, '17.041394, 102.961979', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900033', 'น้ำ หนองโก', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900034', 'แม่นาง ก๋วยเตี๋ยวนาเหล่า(1)', NULL, '929503318', NULL, NULL, 'https://goo.gl/maps/WDhN5dNtA5jDxWdf8', NULL, '17.057831, 102.786021', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900035', 'วารินทร์ จิตรชุ่ม (วารินทร์ บ้านไผ่)(1)', NULL, '950085644', 'สะดวกไม่เกิน 16.00', NULL, 'https://goo.gl/maps/Pj9cGBwiYzXiebWf8', NULL, '17.109105, 102.977657', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900036', 'โบ้', NULL, '910483734', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900037', 'แม่ประคอง กุดจิก (1)', NULL, '925849635', 'ไม่เกิน18.00น.', NULL, 'https://goo.gl/maps/hu2oqSeC8JBwjoPG9', NULL, '17.042962, 102.962000', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900038', 'นายนิสิต จันทร์พินิจ [ร้านต้นคูณ โคกสว่าง]', '84 หมู่ที่ 2 ตำบลหนองแสง อำเภอหนองแสง จังหวัดอุดรธานี', '610731560', 'ไม่เกิน 19.00น.', NULL, 'https://goo.gl/maps/X6JdAQkMPVtEgLeQ7', NULL, '17.187977, 102.842088', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900039', 'ทองรัก โนนสะอาด', NULL, '611123852', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900040', 'ห้างหุ้นส่วนจำกัด อาชา เวิลด์', '272/11 ซ.ทองคำเจริญ ถ.อดุลยเดช ต.หมากแข้ง อ.เมืองอุดรธานี จ.อุดรธานี 41000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900041', 'บริษัท ทีโอที จำกัด (มหาชน) สาขาที่ 00149 เลขที่ 21/68 ถ.วัฒนานุวงศ์ ต.หมากแข้ง อ.เมือง จ.อุดรธานี 41000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900042', 'แม่พลอย เกิ้งน้อย (1)', NULL, '986367913', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/kUHNSoW5Fk7BtGw9A', NULL, '17.028790, 102.906946', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900043', 'สุกัญญา แสนโภชน์ (ร้านภูชิต มินิมาร์ท) (5)', '44/12 บ้าน.โพนทอง ต.อุ่มจาน อ.กิ่งประจักษ์ศิลปาคม จ.อุดรธานี', '956577164', 'ไม่เกิน 19.00น.', NULL, 'https://goo.gl/maps/iQUyfvdHKV3yrPFGA', NULL, '17.240561, 103.065000', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900044', 'ห้างหุ้นส่วนจำกัด บลูเฮ้าส์ แพ็กเกจจิ้ง สำนักงานใหญ่ 229หมู่ที่16 ตำบลพันดอน อำเภอกุมภวาปี จังหวัดอุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900045', 'เรือนไทย รีสอร์ท บ้านท่ายม(1)', NULL, '805644282', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900046', 'แม่บังอร บ้านห้วยเกิ้ง', NULL, '840285970', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900047', 'ต๋อม เมืองปัง', NULL, '846645961', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900048', 'โรงเรียนบ้านดงน้อย', '75 ม.2 บ.ดงน้อย ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900049', 'บริษัท ราชสีมา พี.ดี.ซี จำกัด [สาขาที่ 00002]', '308/2 ม.4 ต.บ้านจั่น อ.เมืองอุดรธานี จ.อุดรธานี 41000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900050', 'ร้านน้ำแข็ง หนองแสง ในตลาด', NULL, '819746968', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900051', 'บริษัท อุดรเกษมสินทรัพย์ จำกัด', '487/5-10 ม.1 ถ.นิตโย ต.หมากแข้ง อ.เมือง จ.อุดรธานี 41000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900054', 'ช.อาชา (5)', NULL, '639708439', NULL, NULL, 'https://goo.gl/maps/kptodoce8cGj35RT6', NULL, '17.220420, 103.076946', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900055', 'น้ำหนึ่ง มินิมาร์ท', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900056', 'น.ส.มาลี พิมพานันท์ (ร้านมาลี)(1)', '26/3 ม.3 ต. กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '0810600749/ไลน์', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900057', 'บริษัท รักบ้านเกิด อินเตอร์เทรดดิ้ง จำกัด อ.เมืองอุดรธานี จ.อุดรธานี 41000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900058', 'น้องภูมิ', NULL, '945653457', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900059', 'ร้านนพเก้า (ป๋าต๋อสวนลิง)', NULL, '858533628', 'สะดวกรับสินค้าไม่เกิ', NULL, 'https://maps.app.goo.gl/o9zxAF8SNkdY3WF56', NULL, '17.110986, 103.017450', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900061', 'สหการ สีออ (2)', NULL, '936804139', 'ไม่เกิน 17.00น.', NULL, 'https://goo.gl/maps/5CsVXChaPF7HYWDi6', NULL, '16.999551, 103.053', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900062', 'ฟองเบียร์(4)', 'หมู่1 ต.กุดจิก อ.ท่าคันโท จ.กาฬสินธุ์ 46190', '863951970', NULL, NULL, 'https://maps.app.goo.gl/6ZA55HPmfxercDCx7', NULL, '16.944996, 103.180057', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900063', 'ร้านธารทวีทรัพย์ (3)', '59 ม.13 ต.จำปี อ.ศรีธาตุ จ.อุดรธานี', '0878550341/ไลน์', NULL, NULL, 'https://goo.gl/maps/rKFtodJUgC4aEr8d8', NULL, '16.983351, 103.181957', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900064', 'บจก. ก.เกียรติ ชัยพัฒนาขนส่ง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900065', 'แม่น้อย แสงทอง', NULL, '864980576', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900066', 'บริษัท ขอนแก่นพานิชย์ จำกัด (สำนักงานใหญ่)', '789 หมู่12 ต.พระลับ อ.เมืองขอนแก่น จ.ขอนแก่น 40000', '439151234', '043-915123-4', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900067', 'เจ้เจี้ยบ นาฝาย (1)', NULL, '0635741987/085453772', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/wzegBUoDoLm4qFUP8', NULL, '17.083377, 102.858000', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900068', 'แม่พัด ข้างยายปราณี', NULL, '807218049', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900069', 'ร้านบ่อทอง (พี่เก๋ บ้านสีออ) (2)', 'บ้านโคกสว่าง ต.สีออ อ.กุมภวาปี ค่ะ', '653364381', 'ไม่เกิน 17.00น', NULL, 'https://goo.gl/maps/kWED8b3W3uUjaFvT9', NULL, '16.995910, 103.051011', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900070', 'ร้านสุกัญญา สร้างบง (5)', NULL, '880608471', NULL, NULL, 'https://goo.gl/maps/ts7LZ85nikyDhRUP6', NULL, '17.200851, 102.943011', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900071', 'ศิริทรัพย์', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900072', 'ห้างหุ้นส่วนจำกัด บลูเฮ้าส์ แพ็กเกจจิ้ง สำนักงานใหญ๋ 229 หมู่ 16 ตำบลพันดอน อำเภอกุมภวาปี จังหวัดอุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900073', 'ร้าน ผ่องศรี (5)', NULL, '823037790', NULL, NULL, 'https://goo.gl/maps/4BLQvk7egZZjvVQP7', NULL, '17.278820, 102.979979', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900074', 'ร้านวันวาน (นายไวยากรณ์ อาจเอี่ยม) (3)', '299 หมู่ 12 บ้านกุงเจริญ ต.หัวนาคำ อ.ศรีธาตุ จ.อุดรธานี 41230', '0800780893/แอพ+ไลน์', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/pE2PPmCFbipsn3sz7', NULL, '17.086685, 103.249221', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900075', 'ป๋าถนอม', NULL, '982453599', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900076', 'ร้าน ต.ทรัพย์ทวี บ้านสีออ (2)', NULL, '972062134', 'ไม่เกิน 17.00น.', NULL, 'https://goo.gl/maps/W3P1jLK9uK3q6JHh6', NULL, '16.998162, 103.052989', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900077', 'วิทยาลัยการอาชีพกุมภวาปี (1)', '301 ม.1 ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '817399824', NULL, NULL, 'https://maps.app.goo.gl/s215X3MGSmHGSDtn9', NULL, '17.116951, 102.943015', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900078', 'ศรีเจริญชุปเปอร์', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900079', 'พี่เจี้ยบคาราบาว', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900080', 'ร้านปลาท่องโก๋เมืองใหม่', NULL, '979785108', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900081', 'บริษัท บี.เค.อาร์ มาร์เก็ตติ้ง จำกัด(สำนักงานใหญ่)', '343 ม.11 บ้านหนองลีหู ต.สามพร้าว อ.เมือง จ.อุดรธานี 41000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900082', 'นิคม โพธิรุกข์ บ้านบุ่งหมากลาน', NULL, '0985874745/085760414', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900083', 'บริษัท ธันย์ แอนด์ ธี ทรานสปอร์ต จำกัด (สำนักงานใหญ่)', 'ที่อยู่ 25/4 หมู่7 ตำบลคลองข่อย อำเภอปากเกร็ด จังหวัดนนทบุรี 11120', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900084', 'อุษา เลฟเพิด (ฟองแฟ้บ)', '239 หมู่ที่ 12 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '910635888', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900085', 'บริษัท คูโบต้า อุดรธานี จำกัด', '299 ม.5 ต. หมากแข้ง อ. เมือง จ.อุดรธานี 41000', '885499559', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900086', 'นางสาวณภัทรธินันท์ นาสูงชน (โรงสีบ้านหนองบัว)(1)', '69 หมู่4 ตำบลนาดี อำเภอหนองแสง จังหวัดอุดรธานี 41340', '969038878', 'ไม่เกิน 20.00น.', NULL, 'https://goo.gl/maps/5csgsL2UaoQPB3mx8', NULL, '17.109851, 102.878011', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900087', 'เจ้สาว', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900088', 'ตลาดกลางทุ่ง', NULL, '652622569', NULL, NULL, 'https://goo.gl/maps/aasLhmgERyqToFCk6', NULL, '17.118905, 102.986305', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900089', 'บริษัท เซลลูโลซิก ไบโอแมส เทคโนโลยี จำกัด (สาขา 00001) เลขที่ 73/6 หมู่ 11 ถนนโพนทอง ตำบลกุมภวาปี อำเภอกุมภวาปี จังหวัดอุดรธานี 41110', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900090', 'แก้ม [โกแพรว]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900091', 'ร้านซุปเปอร์บิ๊ก (นายวานิช อุปมะ)(3)', '201 หมู่ 3 ต.ศรีธาตุ อ.ศรีธาตุ จ.อุดรธานี 41230', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00');
INSERT INTO `store` (`store_id`, `store_name`, `store_address`, `telephone_number`, `fax_number`, `email`, `url`, `customer_delivery_time`, `store_location`, `created_at`, `open_time`, `close_time`) VALUES
('AR9900092', 'กัญญานาตย์ วิเศษโวหาร (ร้านมา ช็อป) (2)', 'ที่อยู่ 161 หมู่ 13 ต.บุงแก้ว อ.โนนสะอาด จ.อุดรธานี 41240', '868882761//098276816', 'ไม่เกิน 19.00', NULL, 'https://goo.gl/maps/BqNwtbRxWp2FLprU6', NULL, '16.969631, 102.957021', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900093', 'โรงเรียนสีออศิลปศาสตร์ (2)', NULL, NULL, NULL, NULL, 'https://goo.gl/maps/7k1N1johznZGbJrh6', NULL, '16.960208, 103.053066', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900094', 'ร.ร อนุบาลกุมภวาปี', '215 ม.15 ตำบลพันดอน อำเภอกุมภวาปี จังหวัดอุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900095', 'บริษัท ลีนา โฮเทล แอนด์ รีสอร์ท จำกัด (สำนักงานใหญ่)', '320 หมู่3 ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', NULL, NULL, NULL, 'https://goo.gl/maps/CJRRKmg5MXLjtq6F8', NULL, '17.052416, 102.917247', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900096', 'สหการ หนองอุดม (2)', NULL, NULL, 'ไม่เกิน17.00', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900097', 'ซ้อฮอน', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900098', 'รุ่งโรจน์', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900099', 'มยุรฉัตร อุตโรกุล', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900100', 'ดวงดาว เจริญทรัพย์ (4)', NULL, '934789919', 'ไม่เกิน 19.00น', NULL, 'https://goo.gl/maps/15NBsWDiFdfeFYwC8', NULL, '17.171231, 102.768936', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900101', 'โรงเรียนบ้านวาปี', 'หมู่4 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900102', 'Lก.ฮ', 'อ.กุมภวาปี', '8126255550812620000', NULL, NULL, 'https://goo.gl/maps/61hyuvh4G7NSsrkU7', NULL, '17.112904, 103.010096', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900103', 'พี่แก่น', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900104', 'หจก.วรรธนัย', NULL, '637375885', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900105', 'ร้านสุวรรณเจริญ (2)', 'เลขที่ 52 หมู่ 4 บ้านหนองกวาง ต.สีออ อ.กุมภวาปี จ.อุดรธานี 41110', '924350355', 'ไม่เกิน 18.00น', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900106', 'ขุนเดช (ติดร้าน ซี.เค.เจริญยนต์ ยามาฮ่า ตรงข้ามโรงเรียนบ้านดงเมือง)', '4 หมู่9 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '878700001', NULL, NULL, 'https://www.google.com/maps/dir/%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%A9%E0%B8%B1%E0%B8%97+%E0%B8%A7%E0%B8%B2%E0%B8%A7%E0%B8%B22559+%E0%B8%88%E0%B8%B3%E0%', NULL, '17.111034, 103.016188', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900107', 'รีสอร์ท แป้งหอม', NULL, '850006551', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900108', 'ครูอ๊อด (3)', '185 บ.ดอนแคน หมู่ที่ 12 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '813692215', NULL, NULL, 'https://goo.gl/maps/gdwAyAAR3NbYwAhZ9', NULL, '17.147151, 102.966989', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900109', 'แม่ดารา เหล่าหมากบ้า(3)', NULL, '0868533803//09299828', NULL, NULL, 'https://goo.gl/maps/Jpkwcd1myzL5GRx17', NULL, '17.160425, 103.057989', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900110', 'ร้าน จุฬา บ.ดอนเงิน', '210 ม.10 ต.แชแล อ.กุมภวาปี จ.อุดรธานี', '922923712', NULL, NULL, 'https://goo.gl/maps/NAA46Lc5yYvUoQxr6', NULL, '17.155566, 103.072020', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900111', 'โรงเรียนบ้านกุดขนวน', 'ต.บุ่งแก้ว อ.โนนสะอาด จ.อุดรธานี 41240', '0854592159​ครูธัญกมล', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900112', 'บริษัท ท็อปเวิลด์ (2014) จำกัด (สำนักงานใหญ่)', '85/10 ถ.ทหาร ต.หมากแข้ง อ.เมืองอุดรธานี จ.อุดรธานี 41000 084/4166', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900113', 'นานาพาณิชย์', 'อ.กุมภวาปี จ.อุดรธานี', '897112883', NULL, NULL, 'https://goo.gl/maps/qY8rP3tci9S2tixEA', NULL, '17.107419, 103.015506', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900114', 'บริษัท พี.เอส.บี. จำกัด [สำนักงานใหญ่]', '87/9 , 85 ถนนเสรีไทย แขวงคลองกุ่ม เขตบึงกุ่ม กรุงเทพฯ 10240 จ.กรุงเทพมหานคร 10240', '20138888', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900115', 'ห้างหุ้นส่วนจำกัด พันดอน 2018 สำนักงานใหญ่', '114 หมู่ 15 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900116', 'น้ำฝน โนนสำราญ (1)', NULL, '651049906', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/L1vF1rtBicUBncLf9', NULL, '17.042661, 102.922011', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900117', 'มรกต กันลา', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900118', 'รุจิรา การค้า (ยายตุ๋ย นาฝาย)', 'เลขที่ 168 หมู่ 11 ต.นาดี อ.หนองแสง จ.อุดรธานี 41340', '0849151346/หน้าร้าน', 'ไม่เกิน 19.30น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900119', 'รร.บ้านหนองศรีเจริญ-หนองผึ้ง', 'ม.14 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '902214016', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900120', 'แม่ยุ๋ย นาม่วง (5)', 'บ้านนาม่วง ตำบลนาม่วง อำเภอประจักษ์ จังหวัดอุดรธานี', '991341266', NULL, NULL, 'https://goo.gl/maps/Fg2LfW7nxxY8rLSS7', NULL, '17.239199, 103.009213', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900121', 'แม่ดำ บ้านปะโค', NULL, '895290521', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900123', 'ร้านหม่องแซ่บ (3)', NULL, '924693829', 'ไม่เกิน18.00น.', NULL, 'https://goo.gl/maps/xXtPSnzuyf2AH7oAA', NULL, '17.071582, 103.186000', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900124', 'ยายหนาน', NULL, '801748815', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900125', 'โรงเรียนบ้านวาปี', 'หมู่ 4 ตำบลพันดอน อำเภอกุมภวาปี จังหวัดอุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900126', 'โรงเรียนบ้านเสาเล้าผักชีศรีสวัสดิ์', '168 หมู่ 5 ตำบลโพธฺิ์ศรีสำราญ อำเภอ โนนสะอาด จังหวัด อุดรธานี 41240', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900128', 'อินนา คาเฟอิน', NULL, NULL, NULL, NULL, 'https://goo.gl/maps/VpSBrwDLDngzuTfh9', NULL, '17.126472, 102.973297', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900129', 'เจ้เล้ง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900130', 'ร้านแดงน้อย บ้านตาด ศรีธาตุ', NULL, '0983645993/098916451', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900131', 'ประภาศิริพานิชย์', 'ถนนมิตรภาพ บ้านเหมือดแอ ต.ปะโค อ.กุมภวาปี', '653369665', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900132', 'ยายก้อม ก๋วยเตี๋ยว', 'บ้านดอนแคน', '883339770', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900134', 'โรงเรียนห้วยเกิ้งพิทยาคาร', '58 หมู่8 ตำบล ห้วยเกิ้ง อำเภอ กุมภวาปี จังหวัด อุดรธานี', NULL, NULL, NULL, 'https://goo.gl/maps/DgmaDQLRZEd24Jtd7', NULL, '17.048832, 102.922576', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900135', 'แม่เกด โนนเชียงค้ำ', NULL, '838724287', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900136', 'ร้าน ช.ริท (แม่ครูเล็ก)', NULL, '979645524', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900137', 'แม่ติ๋ม ทับกุง (1)', NULL, '639533287', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/uscP6qCZ9qnamSbAA', NULL, '17.170220, 102.771925', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900138', 'ร้านแตงโม (1)', NULL, '0956647714/ไลน์', 'ไม่เกิน 20.00', NULL, 'https://maps.app.goo.gl/vKcqxU6cZcrw8Vzz7', NULL, '17.110069, 103.015012', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900139', 'แม่รุ่งฤดี โนนรังสี', NULL, '0949433756/090441956', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900140', '99 ตั้งเจริญ', 'บ้านศรีสุข หมู่10 ต.ท่าลี่', '934603880', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900141', 'บริษัท รุ่งเรืองอินเตอร์สว่างแดนดิน จำกัด (สำนักงานใหญ่) 505 หมู่ 11 ต. สว่างแดนดิน อ. สว่างแดนดิน จ. สกลนคร 47110', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900142', 'ร้านไทยเพียรการค้า(แม่อ้อย) (5)', NULL, '833274899', 'ไม่เกิน 16.00 น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900143', 'สมชายก่อนเข้าไพบูลย์', NULL, '0833558489/หน้าร้าน', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900144', 'โรงพยาบาลกุมภวาปี (1)', '97 ม.7 ถ.จิตรประสงค์ ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '0621783429/ไลน์', 'ไม่เกิน17.00น.', NULL, 'https://goo.gl/maps/r7n9GKHJ91bJLT9H8', NULL, '17.104952, 103.021112', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900145', 'ML..Shop', NULL, '810600749', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900146', 'นางเหรียญ ศรีชาทุม (เหรียญชัย) (1)', '25 หมู่3 บ้านท่าสี ต.แสงสว่าง อ.หนองแสง 41340', '623213459', 'สะดวกรับสินค้าไม่เกิ', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900147', 'สหการณ์ บ้านเหล่าหมากจันทร์', NULL, '872259728', NULL, NULL, '16.922110, 103.040625', NULL, '16.922110, 103.040625', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900148', 'หยก บ้านโปร่ง (3)', NULL, '654373104', 'ไม่เกิน 17.00น', NULL, 'https://goo.gl/maps/9Kd5v1v778fv6HRt5', NULL, '17.008872, 103.115989', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900149', 'กองทุนหมู่บ้านหนองแซง หมู่7 (4)', 'ท่าคันโท', NULL, 'ทุกเวลา', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900150', 'ยายนง', NULL, '804752555', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900151', 'สหการ ท่าไฮ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900152', 'บริษัท ยูโรสปอร์ตแอนด์มิตรภาพกรุ๊ป จำกัด (สำนักงานใหญ่)', '23 หมู่1 ตำบลโนนสะอาด อำเภอโนนสะอาด จังหวัดอุดรธานี 41240', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900153', 'โรงเรียนทวิพัฒน์ (1)', NULL, '0856395783/095981013', NULL, NULL, 'https://goo.gl/maps/t3bTovxuL8Hzvfwr6', NULL, '17.109641, 103.032000', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900154', 'เดอะแมสเซนเจอร์', NULL, '931157604', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900155', 'บริษัท ปิโตเลียมไทยคอร์ปอเรชั่น จำกัด (สาขาที่ 00438) สาขากุมภวาปี 4 (440) 129 ม.1 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900156', 'ยายทองศรี หนองลุมพุ', NULL, '880354967', 'ไม่เกิน 20.00น.', NULL, 'https://goo.gl/maps/evQE19kAzDkpy83r7', NULL, '17.278716, 102.981400', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900158', 'ป๋าสมนึก', '244 ม.15 ต.พันดอน อ.กุมภวาปี', '836815284', NULL, NULL, NULL, NULL, '17.128481, 102.964713', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900159', 'พี่วาสเบียช้าง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900160', 'ระเบียงนพรัตน์', NULL, NULL, NULL, NULL, 'https://goo.gl/maps/56GY8KiC5w2YDJ3J9', NULL, '17.122867, 102.978667', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900161', 'สมบูรณ์ บริการ (5)', 'ตำบล ห้วยสามพาด อำเภอ ประจักษ์ศิลปาคม อุดรธานี 41110', '844283726', 'ไม่เกิน 20.00น.', NULL, 'https://maps.app.goo.gl/qFa3z11gENmEtDDq5', NULL, '17.228481, 102.942584', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900162', 'กองทุนบ้านโนนจำปา', '89 ม.2 ต.หนองกรุงศรี อ.โนนสะอาด จ.อุดรธานี 41240', '815254982', 'ไม่เกิน18.00น.', NULL, 'https://goo.gl/maps/gUXncQzBHvB7Etcn7', NULL, '17.035138,102.80881', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900163', 'แม่บุญถม (1)', 'ถนน รังษี ตำบล ห้วยเกิ้ง อำเภอกุมภวาปี อุดรธานี 41110', '0894209227/ไลน์', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/MD7pqbkxF6v2TUW38', NULL, '17.055192, 102.921043', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900165', 'ลุงเอ', NULL, '862260445', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900166', 'พี่นก บ้านนาฝาย', NULL, '928391755', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900169', 'บริษัท เมเจอร์ฟาร์ คอร์ปอเรชั่น จำกัด', '130 ซอยบรมราชชนนี 39 ถนนบรมราชชนนี แขวงตลิ่นชัน เขตตลิ่นชัน กรุงเทพฯ 10170', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900170', 'นางเบญจพร ภูบุตร', '63 หมู่ 13 ต. ห้วยสามพาด อ. ประจักษ์ศิลปาคม จ.อุดรธานี 41110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900171', 'ห้างหุ้นส่วนจำกัด ดาราออโต้คาร์', '216 หมู่ 3 ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900172', 'น.ส.วรุณกาญจน์ เลิศรุจีศยานนท์', '254 หมู่ 4 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900173', 'นางฉันทนา อ้วนแพง', '58 หมู่19 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900174', 'ร้านเจียมจิตเฟอร์นิเจอร์ (3)', '320 หมู่ที่ 12 บ้านกุงเจริญ ต.หัวนาคำ อ.ศรีธาตุ จ.อุดรธานี 41230', '0981381087/086452108', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/1wj7Fk8fdpNibiTi7', NULL, '17.073451, 103.249043', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900175', 'ปั้มโชคชัย บ้านเหมือดแอ (1)', NULL, '848311918', 'ไม่เกิน 18.00น', NULL, 'https://maps.app.goo.gl/LNrNDMsHXz4fSd4A6', NULL, '17.060920, 102.908624', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900176', 'ร้านมิตรภาพ ธุรกิจค้าปลีก-ส่ง', NULL, '42110215', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900177', 'บริษัท ยูโร สปอร์ต แอนด์ มิตรภาพ กรุ๊ป จำกัด (สำนักงานใหญ่)', '23 หมู่ที่1 ถ.มิตรภาพอุดรฯ-ขอนแก่น ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี รหัส 41240 41240', '42110215', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900178', 'นายปิยะณัฐ เย้ยกระโทก', '25 หมู่ที่ 5 ต.ผาสุก อ.กุมภวาปี จ.อุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900179', 'กองทุนหนองไผ่ล้อม (2)', '273 หมู่8 ต.ทมนางงาม อ.โนนสะอาด จ.อุดาธานี 41240', '0819745091/ไลน์', NULL, NULL, 'https://goo.gl/maps/MPuSTwY4p71Dkmv7A', NULL, '16.913231, 102.998979', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900180', 'นาย อัครเดช แสนยากรณ์', '441/8 หมู่ที่ 2 ต.หนองกระทุ่ม อ. เมืองนครราชสีมา จ.นครราชสีมา 30000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900181', 'นางชวน อุทะกัง', '319 หมู่ที่ 6 ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี 41110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900182', 'วิโรจน์ ศรีดาวาศ์ บ้านโปร่ง', NULL, '871506829', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900184', 'แม่เย็น-นาดีสร้างบง', NULL, '640848720', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900185', 'เสียงทอง วังสามหมอ', NULL, '0885375099**ปิดร้านช', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900186', 'พี่อ้อย', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900187', 'นายทิชากร ทิพนัส (ออมอันการค้า)(3)', '136 หมู่ที่1 ตำบลบ้านโปร่ง อำเภอศรีธาตุ จังหวัดอุดรธานี 41230', '0803299595/แอพ+ไลน์', NULL, NULL, 'https://goo.gl/maps/hX1BwJyfFKH6vL969', NULL, '17.011526,103.112946', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900188', 'ไอติม โนนสะอาด', NULL, '845097749', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900189', 'ยายอ้วน บ.ดอนคง', '75 หมู่ 2 บ้านดอนคง ต.อุ่มจาน อ.ประจักษ์ศิลปาคม จ.อุดรธานี 41110', '924645481', NULL, NULL, 'https://goo.gl/maps/vTVK89Tv1UPZUob58', NULL, '17.218961, 103.072979', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900190', 'จิรวัตร', NULL, '862281723', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900191', 'ไผ่สีทอง บ้านนาเพ็ญ', NULL, '849019913', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900192', 'ทรัพย์รุ่งเรือง [ครูนาง]', '199 หมู่ที่ 1 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '985852218', 'สะดวกรับไม่เกิน 18.0', NULL, 'https://goo.gl/maps/wViDwYFvCnuJ8ojA8', NULL, '17.144021, 102.971593', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900193', 'แทนไท บ้านกุงเก่า', NULL, '994604042', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900194', 'พี่ดาวบ้านนาดี', NULL, '621293307', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900196', 'ร้านสำราญ โนนสะอาด', NULL, '610748140', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900197', 'แม่อ๋อย บ้านตูมเหนือ', NULL, '642087670', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900198', 'น้องมาเล บ้านกงพาน', NULL, '863755292', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900199', 'ชยางกูรการค้าบ้านนาดี', NULL, '906161982', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900200', 'แม่นางทางพาด/รถเร่', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900201', 'แม่สมร บ้านหนองโก (2)', NULL, '0988424405/ไลน์', NULL, NULL, 'https://maps.app.goo.gl/DgU8brG3QBj1vH5s9', NULL, '16.948657, 102.998807', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900202', 'คุณหญิงท่าคันโท (4)', NULL, '611103304', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900203', 'พินทอง บ้านโนนต้อง (5)', 'เลขที่116 หมู่8 ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี', '813208094', NULL, NULL, 'https://maps.app.goo.gl/h8fbffVY2G5zQoYT7', NULL, '17.250878, 102.824725', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900204', 'ครูบุญลือ', '36 หมู่7 บ้านนาเหล่า ต.หนองกุงศรี อ.โนนสะอาด จ.อุดรธานี 41240', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900205', 'พี่ต่าง', NULL, '847515146', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900206', 'แม่ราตรี บ้านเหล่ากกโพธุ์ (3)', NULL, '872176095', 'ไม่เกิน18.00น.', NULL, 'https://goo.gl/maps/PgfhL7qVyb1VUu8X7', NULL, '17.166461, 103.095989', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900207', 'น้องก้อย ห้วยเกิ้ง', NULL, '984948648', 'รับเอง 17.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900208', 'ป้าวาดทางพาด', 'ซอย.โรงแรมเสริมสิริรีสอร์ท', '610675935', NULL, NULL, 'https://maps.app.goo.gl/rt93J1qRMh72bEqC6', NULL, '17.132222, 102.944712', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900209', 'ปลาร้านัวระเบิด', 'บ้านดงเรือง ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900210', 'แม่คำแต่ง บ้านหนองประเสริฐ', NULL, '862310517', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900211', 'พี&พี มินิมาร์ท', NULL, '955875997', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900212', 'ละมัย บ้านสีแจ', NULL, '866397492', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900213', 'แม่ติ๋มบ้านแสงสว่าง', NULL, '808035069', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900214', 'แสนสง่าการค้า (5)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900215', 'นางรัศมี สาทิพย์จันทร์', '64 หมู่ที่3 ต.ผาสุก อ.กุมภวาปี จ.อุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900216', 'ร้านสุวรรณี บ้านโคกใหญ่ (3)', NULL, '0958914682/064295945', 'ไม่เกิน17.00น.', NULL, 'https://goo.gl/maps/rGWpVHCKkc5923Mh7', NULL, '17.075834,103.186978', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900217', 'ตาหมื่น นาดีสร้างบง (2)', NULL, '0640848720/081915788', 'ไม่เกิน 16.00 น', NULL, 'https://goo.gl/maps/ndQi37gywHVEvWmB9', NULL, '17.200464, 102.933179', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900218', 'เสถียรซื้อปลาร้าไมล์', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900219', 'บริษัท หน้าม่าน จำกัด (สำนักงานใหญ่)', '22/69 หมู่ที่ 9 ตำบลบางตลาด อำเภอปากเกร็ด จังหวัดนนทบุรี 11120', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900220', 'ยายเต่า โนนสะอาด', NULL, '980964248', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900221', 'แม่บุญเกิด ท่าลี่ (2)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900222', 'แม่ปิ๊ก บ้านเดียม (5)', NULL, '856451890', 'ไม่เกิน 18.00 น.', NULL, 'https://goo.gl/maps/Vx7joPQDWhErjBTc9', NULL, '17.216805, 103.032985', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900224', 'พีพี หน้าโรงเรียนสงเปลือย (5)', NULL, '655054480', NULL, NULL, 'https://maps.app.goo.gl/uzyXsgoQE8SkvvRQ6', NULL, '17.185237, 102.907905', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900225', 'ตาอี๊ด กงพาน', NULL, '883143676', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900227', 'ร้านนภาพร โรงแป้ง(3)', NULL, '0936620203/ไลน์สั่งเ', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900228', 'ครูคอม โคกหนองแวง(3)', NULL, '0855637574/ไลน์/ไม่ไ', NULL, NULL, 'https://goo.gl/maps/N9c6aGkZ1EtHzatZ8', NULL, '16.965831, 103.262979', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900229', 'ต้นลำปาวทริป', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900230', 'หจก.เอ็นจิเนียริ่ง เซลแอนด์เซอร์วิส (สำนักงานใหญ่)', '189 ม.2 ต.นาดี อ.หนองแสง จ.อุดรธานี 41340', '925285586', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900231', 'นาย สุภาพ อุทะกัง', '102 หมู่ที่ 6 ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี 41110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900232', 'นางพะเยาว์ ห่อลี', '245 ม.6 ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี', '818746224', NULL, NULL, 'https://maps.app.goo.gl/k82y9DMs9Va5a15K9', NULL, '17.079426, 102.933936', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900233', 'แม่ลี บ้านดอนแคน', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900234', 'พี่เป้', NULL, '801938712', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900235', 'นาง พัชนี เศษคึมบง 178 หมู่ที่ 8 ต.เวียงคำ อ. กุมภวาปี จ.อุดรธานี 41110', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900236', 'นาง พลูศรี จันโทพลัง', '5 หมู่12 ต.กุมภวาปี จ.อุดรธานี 41110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900237', 'นาง ละมัย วิจิตรจันทร์', '170 หมู่ที่ 2 ต.ห้วยเกิ้ง อ.กุมภวาปี จ.อุดรธานี 41110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900238', 'ห้างหุ้นส่วนจำกัด สมพรพานิช อุดร (สำนักงานใหญ่)', '79/16 หมู่ที่1 ตำบลหมากแข้ง อำเภอเมืองอุดรธานี จังหวัดอุดรธานี 41000', '841154333', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900239', 'โรงเรียนบ้านนกขะบา', 'หมู่4 ต.เชียงเหว อ.กุมภวาปี จ.อุดรธานี 41110', NULL, NULL, NULL, 'https://goo.gl/maps/LuAeemVRBS7DFzYU6', NULL, '17.226048, 103.011957', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900240', 'นางเพ็ญพร แก้วกาหลง', '79 หมู่ที่ 9 ต. บ้านโปร่ง อ.ศรีธาตุ จ.อุดรธานี 41230', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900241', 'บริษัท มัลติเฟส คอนเนค จำกัด (สำนักงานใหญ่)', 'เลขที่ 44/18 ซอยลาดพร้าว 15 แยก11 ถนนลาดพร้าว แขวงจอมพล เขตจตุจักร กรุงเทพฯ 10900', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900242', 'นาง สุปราณี ถนอมเทวศิริกุล', '135 หมู่ที่ 5 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900243', '99 รุ่งเรือง บ้านโคกผักหวาน (1)', NULL, '634305569', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/KuanXmUKm5ThFcC47', NULL, '17.059221, 102.923011', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900244', 'คลังเจริญ หนองแซง(4)', NULL, '0910519267/097228382', NULL, NULL, 'https://goo.gl/maps/n8WRY61F5ZxYYHRSA', NULL, '16.857531, 103.267011', '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900245', 'โรงเรียนบ้านโนนเชียงค้ำ', 'หมู่2 ต.ทับกุง อ.หนองแสง จ.อุดรธานี 41340', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900246', 'คุณเพ็ญสิริ ชูมา', '214 หมู่4 ต.พันดอน อ.กุมภวาปี จ.อุดารธานี 41370', '833600495', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900247', 'โรงเรียนหนองแสงวิทยาศึกษา', '161 ม.7 ต. ทับกุง อ.หนองแสง จ.อุดรธานี 41340', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900248', 'เมืองงามแสนสิริ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900249', 'ช สนั่น', NULL, '625927705', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('AR9900250', 'น.ส. พูลสินธ์ กองเกิด', '183 หมู่ที่ 1 ต.หนองแสง อ.หนองแสง จ.อุดรธานี 41340', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('ARI-00001', 'นาย ภูริพันธ์ ชูมา 29 หมู่ที่ 4 ต. พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('ARI00001', 'บริษัท สหพัฒนพิบูล จำกัด [มหาชน] สำนักงานใหญ่', '2156 ถ.เพชรบุรีตัดใหม่ แขวงบางกะปิ เขตห้วยขวาง กทม 10310', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('ARI00002', 'บริษัท วาไรตี้ ฟู้ดส์ อินเตอร์เนชั่นแนล จำกัด (สำนักงานใหญ่)', '44/4 หมู่ 10 ตำบลบางโทรัด อำเภอเมืองสมุทรสาคร จังหวัดสมุทรสาคร 74000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('ARI00003', 'โรงเรียนบ้านหมากบ้า (2)', NULL, '862401177', NULL, NULL, 'https://goo.gl/maps/o767bdk9gD2HCgSJ9', NULL, '17.200520, 102.970968', '2026-07-23 11:48:48', '08:00', '17:00'),
('ARI00004', 'โอ-กุ้ง แสงสว่าง (1)', NULL, '0614799194/ไลน์', 'ไม่เกิน 19.00น.', NULL, 'https://goo.gl/maps/RCb7NJTsoDyGr28RA', NULL, '17.118813, 102.820693', '2026-07-23 11:48:48', '08:00', '17:00'),
('ARI00005', 'ครัวหลบมุม ดอนแคน', NULL, '635785899', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('ARI00006', 'คุณอ้อม [นุชรี คำสิม]', '10 หมู่ 8 บ้านอุ่มจาน ตำบลอุ่มจาน อำเภอประจักษ์ศิลปาคม จังหวัดอุดรธานี 41110', '826953619', NULL, NULL, 'https://goo.gl/maps/YnzJKx7cez8kgQuG8', NULL, '17.234466, 103.040039', '2026-07-23 11:48:48', '08:00', '17:00'),
('ARI00007', 'บริษัท ไอ ซี พี ลัดดา จำกัด (สำนักงานใหญ่)', '42 อาคาร ไอ ซี พี ชั้น 5 ถนนสุรวงศ์ แขวงสี่พระยา เขตบางรัก กรุงเทพมหานคร 10500', '20299888', '0-2029-9886-7', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('ARI00008', 'นางสาวปรียาภรณ์ เหง้าพรหมมินทร์ 11หมู่ที่ 16 ตำบลเสอเพลอ อำเภอกุมภวาปี จังหวัดอุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('ARI00009', 'ไข่ย่างห้วยเกิ้ง', NULL, '968298494', NULL, NULL, 'https://www.google.com/maps/place/2316,+Tambon+Pa+Kho,+Amphoe+Kumphawapi,+Chang+Wat+Udon+Thani+41370/@17.0573355,102.9174291,17z/data=!3m1!4b1!4m6!3m5!1s0x312305f484e38c03:0xe02fe0e2caa9dc16!8m2!3d17.0573304!4d102.920004!16s%2Fg%2F1hm58b_sg?entry=ttu&g_ep', NULL, '17.057351, 102.919907', '2026-07-23 11:48:48', '08:00', '17:00'),
('ARI00010', 'หมูหยอง-น้องชิน', NULL, '986533013', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('ARI00011', 'วัยรุ่นสร้างตัว', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('ARI00012', 'เจ้มวน', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('ARI00013', 'สี่แยกปากหวาน พยัคฆภูมิพิสัย', NULL, '922989978', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('ARI00014', 'หจก. อุดรโอฬาร [1997]', '130/3-5 ถนน นเรศวร ต.หมากแข้ง อ.เมือง จ.อุดรธานี', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('ARI00015', 'ลานนั่งชิว', NULL, '890336482', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('ARI00016', 'ก.ท.บ. หมู่3', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('ARI00017', 'ร้านก๋วยเตี๋ยวหมู หน้า รร สงเปลือย', NULL, '951845579', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('ARI00018', 'บริษัท เดอเบล จำกัด สาขาที่ 0006 [สาขาอุดรธานี]', '216/7 ม.7 ซอยบ้านโนนยาง ต.หมากแข้ง อ.เมืองอุดรธานี จ.อุดรธานี 41000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('ARI00019', 'หนาร้าน-เงินสด POS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('ARI00020', 'มาลัย', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('ARI00021', 'บริษัท เต็มธนะ บิซิเนส จำกัด (เฮียเต่า)', '98 หมู่บ้านจอมพลพัฒนา หมู่ที่10 ต.คำม่วง อ.เขาสวนกวาง จ.ขอนแก่น 40280', NULL, NULL, NULL, 'https://goo.gl/maps/YpBXmyywMmkKp6KX9', NULL, '16.855520, 102.859961', '2026-07-23 11:48:48', '08:00', '17:00'),
('ARI00022', 'ร้านเจริญทรัพย์อนันต์ (2)', 'เลขที่ 96​ หมู่ที่ 3​ บ.หัวฝาย ตำบลโนนสะอาด​ อำเภอโนนสะอาด​ จังหวัดอุดรธานี​ 41240', '913837863', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('B07F1685-5', 'รร.ห้วยเกิ้ง รับเอง', NULL, NULL, NULL, NULL, NULL, NULL, '17.128303, 102.965125', '2026-07-23 11:48:49', '08:00', '17:00'),
('C799A8B5-1', 'ร้านแม่จ๋อย/แม่นี ไปใช้ในงานบวร', NULL, '093-3977698', '093-4611519', NULL, NULL, NULL, '16.969216, 103.102669', '2026-07-23 11:48:49', '08:00', '17:00'),
('D6B18AC2-8', 'คุณวรรณภา บ.นาฝาย', NULL, NULL, NULL, NULL, NULL, NULL, '17.080703, 102.859576', '2026-07-23 11:48:49', '08:00', '17:00'),
('DF81E1FF-B', 'ป๋าสมนึก', '244/15 ม.15 ต.พันดอน', '123456798', NULL, NULL, NULL, NULL, '17.128530, 102.964766', '2026-07-23 11:48:49', '08:00', '17:00'),
('E29D6075-D', 'ร้านแม่นางบ.โนนสำราญ', NULL, '933390926', NULL, NULL, 'https://maps.app.goo.gl/Kdyj2ngFWVmkv3yk6?g_st=ac', NULL, '17.124557, 102.960333', '2026-07-23 11:48:49', '08:00', '17:00'),
('E3514383-9', 'วิเศษพูลทรัพย์ รับเอง', NULL, NULL, NULL, NULL, NULL, NULL, '17.128302, 102.965136', '2026-07-23 11:48:49', '08:00', '17:00'),
('F5D40190-0', 'เงินสด รับเอง', NULL, NULL, NULL, NULL, NULL, NULL, '17.128312, 102.965187', '2026-07-23 11:48:49', '08:00', '17:00'),
('FBF6BAE0-A', 'ทรัพย์ศิริพานิช รับเอง', NULL, NULL, NULL, NULL, NULL, NULL, '17.128312, 102.965187', '2026-07-23 11:48:49', '08:00', '17:00'),
('JK-00002', 'บริษัท แลคตาซอย จำกัด', '3532 ถนน สุขุมวิท แขวงบางนาใต้ เขตบางนา กทม 10260', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00004', 'โรงเรียนบ้านโคกสว่าง', 'หมู่ 2 บ้านโคกสว่าง ต.หนองแสง อ.หนองแสง จ.อุดรธานี 41340', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00005', 'สำนักงานปลัดกระทรวงอุตสาหกรรม ถนนพระรามที่6 แขวงทุ่งพญาไท เขตราชเทวี กทม. 10400', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00006', 'บริษัท ไวท์ไลน์ แอดทิเวชันจำกัด (สำนักงานใหญ่)', '208 อาคาร 208 วายเลสโร้ด ยูนิต 507ชั้น 5 ถนน วิทยุ แขวงลุมพินี เขตปทุมวัน กรุงเทพมหานคร 10330', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00007', 'แพรตะวันขอนแก่น', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00008', 'บจก.เฮียบหงวนอีซูซุเซลส์', '444/4 ม.4 ต.บ้านจั่น อ.เมือง จ.อุดรธานี 41000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00009', 'โดนัท บ้านแสงสว่าง', 'บ้านแสงสว่าง', '807418513', NULL, NULL, 'https://goo.gl/maps/7dXKJRDnrNeQ9vdq7', NULL, '17.116777, 102.822925', '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00010', 'สลักจิต', '14 หมู่ 3 ต.บ้านโปร่ง อ.ศรีธาตุ จ.อุดรธานี 41230', '935064746', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00011', 'นาง กันยารัตน์ ศรีรัตน์', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00012', 'บริษัท ยูนิคมอลล์ จำกัด', '742 ม.20 ต.สว่างแดนดิน อ.สว่างแดนดิน จ.สกลนคร 47110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00013', 'บริษัท ร่วมเจริญพัฒนา จำกัด (สำนักงานใหญ่) 99, 25/18-20 หมู่ที่ 4 ตำบลบางตลาด อำเภอปากเกร็ด จังหวัดนนทบุรี 11120', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00014', 'ซือง้วน', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00015', 'เทศบาลตำบลกุมภวาปี', '210 หมู่ 4 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00016', 'เขตห้ามล่าสัตว์ป่าหนองหานกุมภวาปี', 'บ.โนนสา ม.12 ต.นาม่วง อ.ประจักษ์ศิลปาคม จ.อุดรธานี 41110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00017', 'โรงพยาบาลห้วยเกิ้ง', '5 หมู่ 4 ต.ห้วยเกิ้ง อ.กุมภวาปี จ.อุดรธานี 41110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00018', 'เจริญผล ท่าอุเทน', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00019', 'OISHI TRADING .,LTD', '36th FL., CW Tower,90 Ratchadaphisek Rd., huai Khwang Bangkok 10310', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00020', 'นายบุญเชิญ กาฬพันธ์', 'บ.กุดดอกคำ 69 หมู่ที่ 4 ต.โพธิ์ศรีสำราญ อ.โนนสะอาด จ.อุดรธานี 41240', '0935407442/092929765', NULL, NULL, 'https://goo.gl/maps/7Mfxz6XborEizxUM9', NULL, '16.978021, 102.831989', '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00021', 'บริษัท ปิโตรเลียมไทยคอร์ปอเรชัน จำกัด 120หมู่ที่ 14 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370 เลขที่สาขา 00469', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00023', 'บริษัท พีแอนด์เอ็น อุดมพร จำกัด (สำนักงานใหญ่) (3)', '110 ม.4 ต.บางอ้อ อ.บ้านนา จ.นครนายก 26110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00024', 'หจก. สหสินเทรดดิ้ง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00025', 'โชคดีการค้า(1)', 'เลขที่ 97 ม.7 หมู่บ้านแสงสว่าง ต.แสงสว่าง อ.หนองแสง จ.อุดรธานี 41340', '890216546', NULL, NULL, 'https://goo.gl/maps/xfm9kVgAUa9op3827', NULL, '17.121561, 102.824000', '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00026', 'บริษัท เอส พี เจ มาร์เก็ตติ้ง จำกัด', '998 ม.1 ต.บ้านเลื่อม อ.เมืองอุดรธานี จ.อุดรธานี 41000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00027', 'พี่เสมอุดร', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00030', 'โรงเรียนบ้านหนองศรีเจริญ-หนองผึ้ง', '206 หมู่ 14 บ้านหนองศรีเจริญ ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '902214016', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00031', 'นางปาริชาติ ไชยวรรณ', '170/243 หมู่บ้าน ภัสสร 26 ซ. 17 ต.บางคูวัด อ.เมืองปทุมธานี จ.ปทุมธานี 12000', '830570282', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00032', 'บริษัท รุ่งเรืองอินเตอร์ (2008) จำกัด', '111 หมู่. 10 ต.หนองหาน อ.หนองหาน จ.อุดรธานี 41130', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00034', 'นาย สุรชัย สารีพันดอน', '138 หมู่ที่12 ต.เชียงแหว อ.กุมภวาปี จ.อุดรธานี 41110', '898422959', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00035', 'อ.การค้า อุดร', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00036', 'วาสนา บ้านโนนสมบูรณ์', NULL, '946704618', NULL, NULL, 'https://maps.app.goo.gl/Fs1MXM8WdXsR49qT8', NULL, '17.252443, 102.923429', '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00037', 'พี่อ๊อด เหล้าขาว', NULL, '819260665', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00038', 'บริษัท ครีเอตุส คอร์โปเรชั่น จำกัด สาขาที่ 00003', '2534/107-109 ถนนราษฎร์อุทิศ 1 ต.บางโคล่ อ.เขตบางคอแหลม จ.กรุงเทพมหานคร 10120', '22952951', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00039', 'บริษัท มั่งมี อีคอมเมร์ซ จำกัด', '428 ซอย สุขุมวิท 63 แขวงคลองตันเหนือ เขตวัฒนา กทม 10110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00040', '84-0943 [24] เล็ก', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00041', '84-2566[28]ใหญ่', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00042', '84-6565 [41]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00043', '84-6566 อด[36]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00044', 'ฒล 5216[31]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00045', 'บห 4780[21]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00046', 'ผก 359[33]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00047', 'ผก 4806[32]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00048', 'ผค 9282[22]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00049', 'ผจ5131[23]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00050', 'ผธ 4108 [18]เล็ก', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00051', 'ผธ 4253[19]ใหญ่', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00052', 'ผน 3279[16]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00053', 'ผน 3280[15]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00054', 'ผบ 152[27]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00055', 'ผบ 153[26]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00056', 'ผบ 3875[38]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00057', 'ผบ 3876[37]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00058', 'ผบ 4772 [46]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00059', 'สามล้อใหญ่17', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00060', 'โรงเรียนบ้านเซียบ', '232 หมู่ 9 ต.เชียงแหว อ.กุมภวาปี จ.อุดรธานี 41110', '611128867', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00061', 'บริษัท อุดรธนานนท์ จำกัด', '388 ม.5 บ้านท่าตูม ต.หมูหม่น อ.เมืองอุดรธานี จ.อุดรธานี 41000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00062', 'โรงเรียนบ้านโคกสว่าง', 'หมู่ 2 บ้านโคกสว่าง ตำบลหนองแสง อำเภอหนองแสง จังหวัดอุดรธานี ต.หนองแสง อ.หนองแสง จ.อุดรธานี 41340', '985418825', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00063', 'บริษัท อัลลายด์เทค (ประเทศไทย ) จำกัด(สำนักงานใหญ่)', '21/27 ซอยนวมินทร์ 133 แขวงนวลจันทร์ เขตบึงกุ่ม กรุงเทพมหานคร 10230 อ.เขตบึงกุ่ม จ.กรุงเทพมหานคร 10230', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00064', 'THE SIAM COMMERCIAL BANK PLC.', '9 Ratchadapisek RD., jatujak, Bangkok 10900', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00065', 'บริษัท ไทยน้ำทิพย์ คอมเมอร์เชียล จำกัด', '214 อาคารไทยน้ำทิพย์ ชั้น9 ม.5 ถนนวิภาวดีรังสิต แขวงทุ่งสองห้อง เขตหลักสี่ กทม 10210', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00066', 'ห้างหุ้นส่วนจำกัด ไทสกล มาร์เก็ตติ้ง', '642/1 ถนนรัฐบำรุง ตำบลธาตุเชิงชุม อำเภอเมือง จังหวัดสกลนคร 47000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00067', 'น.ส. อิศรา ครองปัญญา', '170 ม.6 ต.แชแล อ.กุมภวาปี จ.อุดรธานี', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00068', 'ทดสอบ 2', NULL, '910502532', NULL, NULL, 'https://goo.gl/maps/ftnMTqfYeZnt8vx67', NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00069', 'ทดสอบ 3', NULL, '910502532', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00070', 'ทดสอบ 4', NULL, '910502532', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00071', 'ทดสอบ 5', NULL, '910502532', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00072', 'ทดสอบ 6', NULL, '910502532', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00073', 'ทดสอบ 7', NULL, '910502532', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00074', 'ทดสอบ 8', NULL, '910502532', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00075', 'ธนาคาร ไทยพาณิชย์ จำกัด [มหาชน]', 'เลขที่ 9 ถนนรัชดาภิเษก แขวงจตุจักร เขตจตุจักร กทม 10900', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00076', 'สำเพ็ง เฮียปาร์ค', NULL, '910502532', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00077', 'เฮียปอ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00078', 'อาม่า - อากง', NULL, NULL, NULL, NULL, NULL, NULL, '17.131998, 102.959979', '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00079', 'ร้านวาวา - เบิกใช้ในร้าน', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00080', 'บริษัท สิริโปร จำกัด สาขาที่ 00002', '229/2 ม.4 ต.บ้านจั่น อ.เมืองอุดรธานี จ.อุดรธานี 41000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00081', 'ลลิตา', 'จ.อุดรธานี', '902518522', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00082', 'สุนทรี เป้าปัดสี', '120 ม.6 บ.ห้วยกองสี ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี 41110 จ.อุดรธานี', '809023526', NULL, NULL, 'https://maps.app.goo.gl/Nypk4mB2ZgQofKvp8', NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00083', 'สาวิตรี เสมอหน้า', '158 หมู่ที่ 3 ต.ปะโค อ.กุมภวาปี จ.อุดรธานี', '625588162', NULL, NULL, 'https://goo.gl/maps/JHJHaN5GPPVvZTJB6', NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00084', 'บริษัท วันทูเทรดดิ้ง จำกัด [สำนักงานใหญ่]', '58/3 ม.6 ถนน พระประโทน-บ้านแพ้ว ตำบลตลาดจินดา อ.สามพราน จ.นครปฐม 73110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00085', 'แม่ยิ่ง ส้มตำ', 'เลขที่ 10 หมู่4 บ้านห้วยเกิ้ง ต.ห้วยเกิ้ง อ.กุมภวาปี จ.อุดรธานี 41110', '843674836', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.045783,102.929531', NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00086', 'บริษัท เอ็ม.ยี.แลนด์ จำกัด', 'เลขที่ 25 ซ.สุขุมวิท1 ถ.สุขุมวิท แขวงคลองเตยเหนือ เขตวัฒนา กทม 10110 เลขประจำตัวผู้เสียภาษีอากร ต.คลองเตยเหนือ อ.เขตวัฒนา จ.กรุงเทพมหานคร 10110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00087', 'บมจ.ธนาคารกรุงไทย สำนักงานใหญ่', 'เลขที่ 35 ถนนสุขุมวิท แขวงคลองเตยเหนือ เขตวัฒนา กทม. 10110', '21111111', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00088', 'บริษัท ช็อปจีนิกซ์ จำกัด', 'เลขที่ 49 ถนนสุคนธสวัสดิ์ แขวงลาดพร้าว เขตลาดพร้าว กรุงเทพมหานคร 10230', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00089', 'กานรุ้ง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JK-00097', 'ร้านค้าโรงเรียนบ้านดอนเงิน', 'หมู่ที่ 10 บ.ดอนเงิน ตำบลพันดอน อำเภอกุมภวาปี จังหวัดอุดรธานี', '957193874', NULL, NULL, 'https://maps.app.goo.gl/txRwnbYpKg5trfGD9', NULL, '17.140118, 103.036250', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00098', 'ศูนย์ส่งเสริมอุตสาหกรรมอ้อยและน้ำตาลทรายภาคที่ 4', '126 ม.3 บ้านเหมือนแอ่ ต.ปะโค อ.กุมภวาปี จ.อุดรธานี  (ก่อนถึงเทศบาล ตำบลปะโค 1 กม.)', '854640051', NULL, NULL, 'https://maps.app.goo.gl/vPBEP3GhzWVfkTpi6', NULL, '17.058150, 102.916414', '2026-07-23 11:48:49', '08:00', '17:00'),
('JK-00102', 'รพ.สต.บ้านโพนทอง', '120 หมู่ 6 ต.อุ่มจาน อ.ประจักษ์ศิลปาคม จ.อุดรธานี', NULL, NULL, NULL, 'https://maps.app.goo.gl/s1naAy1uvaqq4rop6', NULL, '17.237387, 103.067787', '2026-07-23 11:48:49', '08:00', '17:00'),
('JK-00104', 'พรสวรรค์(วิทรูการค้า)', 'ร้านประพันธ์ค้าแก๊ส 245 หมู่ 1 ต.โพธิ์ศรีสำราญ อ.โนนสะอาด จ.อุดรธานี 41240', '610293048', '610293048', NULL, 'https://maps.app.goo.gl/ofviwrnF6TuLQF5u8', NULL, '16.949552, 103.024110', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00105', 'ร้าน เฟื้องฟ้า', NULL, '957045094', NULL, NULL, 'https://maps.app.goo.gl/kFvaFvavqJay43EG6', NULL, '17.011829, 102.839775', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00106', 'วิเวียน', '229/6 ต.เวียงคำ อ.กุมภวาปี จ.อุดรธานี', '996594871', NULL, NULL, 'https://maps.app.goo.gl/9ZLTCb8mrHjrTGAW9', NULL, '17.105020, 103.076535', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00110', 'ร้าน แม่ตุ่ม ห้วยเกิ้ง', NULL, '653570155', NULL, NULL, 'https://maps.app.goo.gl/dCtY7ck6YkJjgMxP6', NULL, '17.044734, 102.929287', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00111', 'ร้าน หญิงการค้า', '181 หมู่ 6 บ้านยางหล่อ ต.แชแล อ.กุมภวาปี จ.อุดรธานี', '822413605', NULL, NULL, 'https://maps.app.goo.gl/zvmf8KYToSuxYYU47', NULL, '17.148487, 103.039313', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00112', 'สีบัวไล', 'เลขที่ 35/7 ต.ผาสุก อ.กุมภวาปี จ.อุดรธานี 41370', '924078694', NULL, NULL, 'https://maps.app.goo.gl/pDC7DG53X5Y9y41R8', NULL, '17.192605, 102.943542', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00113', 'ร้าน. P.top หินฮาว', '240 ม.6. ต.เวียงคำ อ.กุมภวาปี จ.อุดรธานี 41110', NULL, NULL, NULL, 'https://maps.app.goo.gl/o7vXsR8K8yEwfaxy7', NULL, '17.105279, 103.077912', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00115', 'เจ้เก๋ แสงสว่าง', '78 53/7บ้านแสงสว่าง ต.แสงสว่าง อ.หนองแสง จ.อุดรธานี 41340', '828730769', NULL, NULL, 'https://maps.app.goo.gl/ct4fESyeuMBkmvMU9', NULL, '17.121418, 102.819029', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00116', 'ร้านเจ้าขา', '54 ม.5 ต.ปะโค อ.กุมภวาปี จ้า.อุดรธานี', '802184815', NULL, NULL, 'https://maps.app.goo.gl/3DwCeCupBzW9NcEXA', NULL, '17.064841, 102.896597', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00119', 'โรงเรียนบ้านสามเหลี่ยม', '198 ม.4 บ.สามเหลี่ยม ต.ทับกุง อ.หนองแสง จ.อุดรธานี', '649391199', NULL, NULL, 'https://maps.app.goo.gl/BUt52JFEA1vmg2Dr9', NULL, '17.145983, 102.850046', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00130', 'ผันปังปิ้ง', '188/4 ต.ปะโค อ.กุมภวาปี จ.อุดรธานี', '835346826', NULL, NULL, 'https://maps.app.goo.gl/o5oMhQXqTBqU9eeh9', NULL, '17.068994, 102.886304', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00133', 'พาขวัญพาณิชย์ 3', '333 หมู่ 1 ต.ทับกุง อ.หนองแสง จ.อุดรธานี', '871779065', NULL, NULL, 'https://maps.app.goo.gl/DkuSFfb7nE8pthVr7', NULL, '17.176551,102.771684', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00136', 'ร้านบอลลูน', NULL, '821368499', '821368499', NULL, 'https://www.google.com/maps/place/17%C2%B006\'32.7%22N+102%C2%B046\'29.2%22E/@17.1091123,102.7746593,1039m/data=!3m1!1e3!4m4!3m3!8m2!3d17.109069!4d102.774775?entry=ttu&g_ep=EgoyMDI1MTAwMS4wIKXMDSoASAFQAw%3D%3D', NULL, '17.109199, 102.774670', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00142', 'ร้านโอ๊ตดี้', '18 หมู่ที่ 3 บ.โนนดินแดง ตำบลหนองแสง อำเภอหนองแสง จังหวัดอุดรธานี', '918614386', NULL, NULL, 'https://maps.app.goo.gl/Xfa1xCEBCKDv9gUp7', NULL, '17.138299, 102.847066', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00143', 'ร้าน แม่นุช บ.หนองอุดม', NULL, '930843765', NULL, NULL, 'https://www.google.com/maps/place/17%C2%B007\'00.7%22N+102%C2%B057\'55.0%22E/@17.1168446,102.9651408,65m/data=!3m1!1e3!4m4!3m3!8m2!3d17.116856!4d102.965269?entry=ttu&g_ep=EgoyMDI1MTEwMi4wIKXMDSoASAFQAw%3D%3D', NULL, '17.116874, 102.965275', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00144', 'หจก.อ.เจริญการไฟฟ้า', '190 ม.9 บ้านเลิงถ่อน ต.หนองหญ้าไซ อ.วังสามหมอ จ.อุดรธานี', '951689396', NULL, NULL, 'https://maps.app.goo.gl/ChuNUjBvXcsTBj8j6', NULL, '16.962393, 103.334040', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00148', 'ยักษ์เขียว', '245/3 ตูมใต้', NULL, NULL, NULL, 'https://maps.app.goo.gl/quKBXQYKaVCxYQgXA', NULL, '17.118950, 102.986684', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00149', 'ร้านซอนไก่สด', 'ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '924145887', NULL, NULL, 'https://maps.app.goo.gl/hPDtsXYqwieUgVci6', NULL, '17.130801, 102.948236', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00152', 'ร้านสมบัติ', '40 หมู่ที่ 10 ตำบลเสอเพลอ อำเภอกุมภวาปี จังหวัดอุดรธานี', '880560229', NULL, NULL, 'https://maps.app.goo.gl/X6YivJtkxpw8m7BeA', NULL, '17.215192, 102.865200', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00153', 'ส.สุราการค้า', NULL, '830807303', '830807303', NULL, 'https://www.google.com/maps/place/17%C2%B008\'40.9%22N+102%C2%B055\'57.6%22E/@17.1447013,102.9326781,65m/data=!3m1!1e3!4m4!3m3!8m2!3d17.1446944!4d102.9326667?entry=ttu&g_ep=EgoyMDI1MTAwMS4wIKXMDSoASAFQAw%3D%3D', NULL, '17.144705, 102.932667', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00156', 'ร้าน BM&ใยไหม', '12 หมู่ที่ 3 บ.โนนทอง ตำบลหนองกุงศรี อำเภอโนนสะอาด จังหวัดอุดรธานี', NULL, NULL, NULL, 'https://maps.app.goo.gl/ipXCQtXRyr6Pn2BA7', NULL, '17.038221, 102.771458', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00157', 'วัดป่าเหวไฮ', 'หัวนาคำ อำเภอศรีธาตุ อุดรธานี', NULL, NULL, NULL, 'https://maps.app.goo.gl/U8s8qxNdg4np42t6A', NULL, '17.113480, 103.356637', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00158', 'วัดป่าโนนม่วง-โคกใหญ่', 'ต.ศรีธาตุ อ.ศรีธาตุ จ.อุดรธานี', NULL, NULL, NULL, 'https://maps.app.goo.gl/6k8bZo4dWsQdhctg9', NULL, '17.061943, 103.198141', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00159', 'ปิยะรัตน์ ปิระกัง [ บ้านงาน เติ้ล ] (บ้านทนายความ )', 'หนองแสง อำเภอหนองแสง จังหวัดอุดรธานี', '648921406', NULL, NULL, 'https://maps.app.goo.gl/F5W8fxyYCpWB2SJL8', NULL, '17.142330, 102.849490', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00161', 'ร้านก๋วยเตี๋ยวแม่ติ๋ม', '18 หมู่ที่ 8 ตำบลผาสุก อำเภอกุมภวาปี จังหวัดอุดรธานี', '989430481', NULL, NULL, 'https://maps.app.goo.gl/BB2mb9KQ8GDLnFo4A', NULL, '17.165150, 102.961006', '2026-07-23 11:48:50', '08:00', '17:00');
INSERT INTO `store` (`store_id`, `store_name`, `store_address`, `telephone_number`, `fax_number`, `email`, `url`, `customer_delivery_time`, `store_location`, `created_at`, `open_time`, `close_time`) VALUES
('JK-00163', 'แม่ประนอม', 'บ้านโปร่ง อำเภอศรีธาตุ จังหวัดอุกรธานี', '902428691', NULL, NULL, 'https://maps.app.goo.gl/19BNuLoGXQy8QR1w6', NULL, '17.016695, 103.130759', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00167', 'TN ปิโตรเลียม', 'บ้านเลขที่ 176 หมู่2 บ้านนาฝาย ตำบลนาดี อำเภอหนองแสง จังหวัดอุดรธานี 41340', '935595331', NULL, NULL, 'https://maps.app.goo.gl/fYdG51cRhpBtKyh39', NULL, '17.078039, 102.863809', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00169', 'ร้าน เพชร บ้านบะยาว', '300 ม.8 บ.บะยาว ต.บุ่งแก้ว อ.โนนสะอาด จ.อุดรธานี', '843241083', NULL, NULL, 'https://maps.app.goo.gl/CE1qBWkYq7mxUKzE6', NULL, '16.947317, 103.019295', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00170', 'แม่อุทัย', 'เวียงคำ อำเภอกุมภวาปี จังหวัดอุดรธานี', '842902592', NULL, NULL, 'https://maps.app.goo.gl/5xGTGDEmLxFmutiLA', NULL, '17.098440, 103.131968', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00172', 'คุณหนึ่งฤทัย', 'ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '089-9443676', NULL, NULL, 'https://maps.app.goo.gl/LMBSZx4Yo7Ujk5f5A', NULL, '17.133500, 102.968217', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00173', 'ม.เจริญการค้า', '231 หมู่ที่ 3 ตำบลตูมใต้ อำเภอกุมภวาปี จังหวัดอุดรธานี', '898062928', NULL, NULL, 'https://maps.app.goo.gl/xFBhQtgC9fGJM7Rq6', NULL, '17.096948, 102.987880', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00174', 'ไฝวิเศษศิลป์', NULL, '927425931', NULL, NULL, 'https://maps.app.goo.gl/RC1HUPVcqVZC96pB9', NULL, '17.127619, 102.944307', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00175', 'จิตราอาหารตามสั่ง', 'สี่แยกบ้านท่ายม', '928353947', NULL, NULL, 'https://maps.app.goo.gl/Ex46Nsyu4iuL8jf39', NULL, '17.139373, 102.787093', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00180', 'ร้าน ธนะเจริญ', '245/15 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '637343535', NULL, NULL, 'https://maps.app.goo.gl/ypHoGXeSDCFryMec9', NULL, '17.130542, 102.967914', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00185', 'อ้อยมินิมาร์ท', '37 หมู่ที่ 10 ตำบลตาดทอง อำเภอศรีธาตุ จังหวัดอุดรธานี', '843734198', NULL, NULL, 'https://maps.app.goo.gl/y8KEjA1GxCDqG6Tg9', NULL, '17.052345, 103.133157', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00186', 'ร้านชำกันเอง', '60/3 ต.สีออ อ.กุมภวาปี จ.อุดรธานี', '652461278', NULL, NULL, 'https://maps.app.goo.gl/KF12KNhfcxyT7L8k9', NULL, '16.998344,103.053132', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00188', 'ร้าน อาซ้อเล็กชาบู', '41/1 ม.3 ถนนชมช่วย ต.กุมภวาปี อ.กุมภวาปี อุดร 41110', '908961624', NULL, NULL, 'https://maps.app.goo.gl/n3TtE4KL94ALxxW38', NULL, '17.102028, 103.011356', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00190', 'ร้าน บ้านส้ม', '103 หมู่ที่ 10 บ.ดอนเงิน ตำบลแชแล อำเภอกุมภวาปี จังหวัดอุดรธานี', '819687327', '819687327', NULL, 'https://maps.app.goo.gl/kKwEdYoXg97sg1Cz9', NULL, '17.135996, 103.035601', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00191', 'ประพันธ์ค้าแก๊ส', '245 บ้านโพธิ์ศรีสำราญ ต.โพธิ์ศรีสำราญ อ.โนนสะอาด จ.อุดรธานี 41240', '635895798', NULL, NULL, 'https://maps.app.goo.gl/TmbDn33j9cAMVcdm6', NULL, '16.978829, 102.852327', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00194', 'ร้าน ป้าแมว', 'โนนสะอาด อ.โนนสะอาด จ.อุดรธานี', '934192543', NULL, NULL, 'https://maps.app.goo.gl/82Gks8vu2HQ8mDyf7', NULL, '16.968084, 102.886708', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00195', 'แม่สุพัตรา', '25 หมู่ที่ 1 ตำบลนาดี อำเภอหนองแสง จังหวัดอุดรธานี', '639164860', NULL, NULL, 'https://maps.app.goo.gl/f7uek7UvQtzGQpEa6', NULL, '17.086388, 102.855358', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00197', 'ร้าน พรรุ่งเรือง', NULL, '833387201', NULL, NULL, 'https://maps.app.goo.gl/GPCdNAqjuYHHTTUN6', NULL, '17.091835, 103.045941', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00200', 'ป้าแจ๋ว ป้าจุ๋ม บ้านงาน', NULL, '843753889', NULL, NULL, 'https://maps.app.goo.gl/aHXFPEHLhCSaPLSd6', NULL, '17.180135, 102.999664', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00204', 'ร้าน มาชิลล์ ห้วยเกิ้ง', 'ป้าค้อ อ.กุมภวาปี จ.อุดรธานี', '613823202', NULL, NULL, 'https://maps.app.goo.gl/fYegoqgB3z8xmhvN7', NULL, '17.060270, 102.921994', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00208', 'ก๊อต (บ้านงาน)', 'บ้านสงเปลือย ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี', '940179076', NULL, NULL, 'https://maps.app.goo.gl/LyhMPAD7ccyhhsR37', NULL, '17.182817, 102.903039', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00209', 'นางราตรี ปัญญาใส [ล้านหลานเอิ้น]', '269 หมู่ที่ 1 บ.กุดจิก ตำบลหนองหว้า อำเภอกุมภวาปี จังหวัดอุดรธานี', '(095) 895-2307', NULL, NULL, 'https://www.google.com/maps/place/17%C2%B002\'26.9%22N+102%C2%B057\'42.6%22E/@17.04081,102.961836,1039m/data=!3m2!1e3!4b1!4m4!3m3!8m2!3d17.04081!4d102.961836?entry=ttu&g_ep=EgoyMDI1MTEzMC4wIKXMDSoASAFQAw%3D%3D', NULL, '17.040821, 102.961833', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00211', 'เจ๊เยาว์การค้า', '227 หมู่ที่ 9 ตำบลอุ่มจาน อำเภอประจักษ์ศิลปาคม จังหวัดอุดรธานี', '895431395', NULL, NULL, 'https://maps.app.goo.gl/ndJyJRuBhnq14vrz5', NULL, '17.260723, 103.032575', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00216', 'ครูโบ้ จักรพรรดิ ศิริวารินทร์', 'หนองหว้า อำเภอกุมภวาปี จังหวัดอุดรธานี', '833621254', NULL, NULL, 'https://maps.app.goo.gl/tJ5itVeySAgLJVPSA', NULL, '17.058203, 103.018134', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00217', 'ร้านรจนาซุปเปอร์มาร์ท [นาย ยงยุธ น้อยชนะ]', '254 ม.1 บ.หนองแสง ต.หนองแสง อ.หนองแสง จ.อุดรธานี', '910919955', '910919955', NULL, 'https://maps.app.goo.gl/Nn1cFyhPmQnJd8NDA', NULL, '17.143707,102.849633', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00218', 'ปังปอนด์', 'เวียงคำ อ.กุมภวาปี จ.อุดรธานี', NULL, NULL, NULL, 'https://maps.app.goo.gl/X5vwiXuvwZAJvbYC7', NULL, '17.097636, 103.034358', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00221', 'ปั้มน้ำมัน ทีเอ็น.ปิโตรเลียม', '176 ม.2 ต.นาดี อ.หนองแสง จ.อุดรธานี 41340', '095-7287401', NULL, NULL, 'https://maps.app.goo.gl/DAVU1LU1yHa7VDco9', NULL, '17.077888, 102.863859', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00223', 'คาเก่อันยอง การค้า', '69 หมู่ที่ 13 ตำบลปะโค อำเภอกุมภวาปี จังหวัดอุดรธานี', '935361667', NULL, NULL, 'https://maps.app.goo.gl/SDRL8Bp6EkK2ThzZ7', NULL, '17.020711, 102.891405', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00225', 'แพรวนภา บำรุงภักดี', '152 หมู่ที่ 4 ตำบลนาม่วง อำเภอประจักษ์ศิลปาคม จังหวัดอุดรธานี', '981359849', NULL, NULL, 'https://maps.app.goo.gl/A38DMpcMBQLemi8r5', NULL, '17.215137, 102.994418', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00226', 'คุณแม่ขัน', '240/7 บ้านเหล่าหมากบ้า ตำบลเเชเเล อำเภอกุมภวาปี จังหวัดอุดรธานี', '644795024', '644795024', NULL, 'https://maps.app.goo.gl/psasp6Y36Ki7QQP36', NULL, '17.159725, 103.063702', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00231', 'ร้านค้าเจ้หมี', 'บ้านเลขที่231หมู่10 บ้านคำเจริญ ต.พันดอน', '848968794', NULL, NULL, 'https://maps.app.goo.gl/QBVuHDHxGv2Qfwu46', NULL, '17.127944,102.88968', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00235', 'สนธยา', '102 ม.17 ต.จำปี อ.ศรีธาตุ จ.อุดรธานี', '931066853', NULL, NULL, 'https://maps.app.goo.gl/RFyxP1jPYeAeis4d6', NULL, '17.102211, 103.200654', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00237', 'จินตปาตรี(แนน)', NULL, '885356318', '884399836', NULL, 'https://maps.app.goo.gl/VLiEGmva4tGFwmf46', NULL, '17.109390, 102.776020', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00238', 'นาย หนูแดง ภูกันดาน', '36 หมู่ที่ 3 ตำบลนาดี อำเภอหนองแสง จังหวัดอุดรธานี', '811844219', NULL, NULL, 'https://maps.app.goo.gl/bvezNWVNSxdkBAmY9', NULL, '17.046137, 102.828750', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00246', 'เจ้สาว นาตาล', NULL, NULL, '951099250', NULL, 'https://maps.app.goo.gl/DFyVonCqoV8fzLHV7', NULL, '16.939691, 103.249534', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00248', 'สันติพร โฮลเซล แอนด์ ดิสทริบิวชั่น จำกัด', '295 .4 ต.บ้านเลื่อม อ.เมือง จ.อุดรธานี 41000', '646937626', NULL, NULL, 'https://maps.app.goo.gl/L7cEswkJWmN2pbDd9', NULL, '17.400711, 102.764364', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00250', 'นาง วารุณี ดายดัสกร', '41 หมู่ที่ 5 ตำบลหัวนาคำ อำเภอศรีธาตุ จังหวัดอุดรธานี', '878566375', NULL, NULL, 'https://maps.app.goo.gl/NiD8KJ6faS3P8U1cA', NULL, '17.087826, 103.318957', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00251', 'ร้านสินค้า20 นาเหล่า', 'ตำบล หนองกุงศรี อำเภอโนนสะอาด อุดรธานี 41240', '909314889', NULL, NULL, 'https://maps.app.goo.gl/pANvxFDCERDSLinM9', NULL, '17.059447, 102.786781', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00254', 'พรพิมการค้า', '31 หมู่ที่ 1 ตำบลบ้านโปร่ง อำเภอศรีธาตุ จังหวัดอุดรธานี', '960396597', '-', NULL, 'https://maps.app.goo.gl/o4nxwBuCgBSDqPvd9', NULL, '17.038438,103.114439', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00260', 'ครูมะ โลตัสกุมภวาปี', '69 หมู่ที่ 3 ตำบลหนองกุงศรี อำเภอโนนสะอาด จังหวัดอุดรธานี', '983417745', NULL, NULL, 'https://maps.app.goo.gl/jc8omGuM39E84xr56', NULL, '17.111323, 103.005853', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00261', 'แฟนต้า', '272 หมู่ที่3 ต.ผาสุก อ.กุมภวาปี จ.อุดรธานี', '878545844', NULL, NULL, 'https://maps.app.goo.gl/Z4M1nnPC91phrTu4A', NULL, '17.161737, 102.937969', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00266', 'วัดป่าเวฬุธรรม', '163 หมู่ที่ 19 ตำบลพันดอน อำเภอกุมภวาปี จังหวัดอุดรธานี', '859044933', NULL, NULL, 'https://maps.app.goo.gl/NShNjgsH4jCroRSw9', NULL, '17.127621, 102.918917', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00268', 'บริษัท เฟิสท์มาร์ท กรุ๊ป จำกัด สาขา 1', 'เลขที่ 258 หมู่ที่ 12 ต.ห้วยสามพาด อ.ประจักษ์ศิลปาคม จ.อุดรธานี', '898347754', NULL, NULL, 'https://maps.app.goo.gl/83iRR5vbMHhFE9pX9', NULL, '17.250304, 102.920224', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00269', 'นายฟลุ๊คการค้า', '22 หมู่ที่ 8 บ.โนนยอ ตำบลหนองหว้า อำเภอกุมภวาปี จังหวัดอุดรธานี', '934279946', '934279946', NULL, 'https://maps.app.goo.gl/HHpZgvByQWnuEdP87', NULL, '17.026257, 102.952849', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00270', 'วัดป่าบ้านโนนยอ ม่วงหวาน ห้วยเกิ้ง', '443 ตำบล หนองหว้า อำเภอกุมภวาปี อุดรธานี 41110', '819540128', '819540128', NULL, 'https://maps.app.goo.gl/6GhcXf2DRbKQj4rN8', NULL, '17.030364, 102.937836', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00271', 'แพรวพรรณ [บ้านงาน]', NULL, NULL, NULL, NULL, 'https://maps.app.goo.gl/KSaE7e58azoPBaUd6', NULL, '17.137863, 102.966083', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00273', 'วิบูลย์การค้า', 'บ้านโคกสว่าง ตำบลบะยาว อำเภอวังสามหมอ จังหวัดอุดรธานี', '849468890', '923100741', NULL, 'https://maps.app.goo.gl/pQpBXAv6SgwbWmbZ7', NULL, '17.072268, 103.352261', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00274', 'ธันศิริ ฉายศรี', '144/7 บ้านหนองแวงใต้ ต.ผาสุก อ.กุมภวาปี จ.อุดรธานี 41370', '947085972', NULL, NULL, 'https://maps.app.goo.gl/goEsC85kAiVgirNZ8', NULL, '17.192391, 102.941829', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00275', 'วัดใหม่สงเปลือย', 'เสอเพลอ อ.กุมภวาปี จ.อุุดรธานี', '807316388', NULL, NULL, 'https://maps.app.goo.gl/Ay66C5i6vjkizCeT7', NULL, '17.177056, 102.904349', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00276', 'น.ส. รัตนาวดี ชินรัตน์', NULL, NULL, NULL, NULL, 'https://maps.app.goo.gl/Uvhd86fFxfppCSiH9', NULL, '17.038120, 102.859980', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00277', 'วัดป่าจันทน์ศีลคุณาราม', 'บ้านเหล่าหมากจันทน์ ต.ท่าลี่ อ.กุมภวาปี จ.อุดรธานี', '819540128', NULL, NULL, 'https://maps.app.goo.gl/kYapLcTDr7e2WGhAA', NULL, '16.926098, 103.048010', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00278', 'คุณไอซ์', '117/13 บ้านแถววัดโนนน้ำย้อย บ้านโนนน้ำย้อย ต.แชแล', '819854431', NULL, NULL, 'https://maps.app.goo.gl/UHavzjkZESnudcbU8', NULL, '17.154010, 103.047150', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00279', 'ร้านแม่หนุ่ย คอนสาย', 'บ้านคอนสาย อำเภอกู่แก้ว อุดรธานี', '624705184', '624705184', NULL, 'https://maps.app.goo.gl/8dEQn4vpQvtdTZWT9', NULL, '17.202603, 103.114629', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00283', 'ปราณีคาร์แคร์', '150 ม.12 บ.ดอนเงิน ต.แชแล อ.กุมภวาปี จ.อุดรธานี 41110', '928055091', NULL, NULL, 'https://maps.app.goo.gl/Tdab9YubNXMh2XrS6', NULL, '17.122036, 103.032002', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00284', 'วัดนรวาสคงคา', 'บ้านเหล่าหมากบ้า ต.แชแล อำเภอกุมภวาปี จ.อุดรธานี', '903489774', '903489774', NULL, 'https://maps.app.goo.gl/1yk9PNBPrAVjoLzN8', NULL, '17.160381, 103.056459', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00286', 'ชาญณรงค์ ศรีภักดีสวัสดิ์ (ต้าร์)', 'เลขที่ 5 ม.14 ต.ท่าลี่ อ.กุมภวาปี จ.อุดรธานี 41110', '936629050', NULL, NULL, 'https://maps.app.goo.gl/vYevB3rbveL4PUTZA', NULL, '16.962842, 103.077337', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00287', 'ใต้ร่มจามจุรีย์', 'อ.กุมภวาปี จ. อุดรธานี', NULL, '891406594', NULL, 'https://maps.app.goo.gl/KoRkf2hXXxbCZycn8', NULL, '17.027317, 103.030611', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00288', 'นิตยา อุตโรกุล', '96 หมู่ที่ 11 บ้านดงแคน ถนนดงแคน 3 ต.พันดอน อ.กุมภวาปี. จ.อุดรธานี', '661509193', NULL, NULL, 'https://maps.app.goo.gl/XVCQkWArrCP31XyCA', NULL, '17.111637, 102.948914', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00289', 'วัดโพธิ์สว่างโศกคูณ', 'ห้วยเกิ้ง อำเภอกุมภวาปี จ.อุดรธานี', '862252025', NULL, NULL, 'https://maps.app.goo.gl/u1Xp3HZ6SysToE8M7', NULL, '17.043784, 102.946239', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00293', 'ร้าน อิลส์รดา มาร์เก็ต', '132 ม.3 ต.โพธิ์ศรีสำราญ อ.โนนสะอาด จ.อุดร 41249', '940672903', NULL, NULL, 'https://maps.app.goo.gl/kToEn8bJ416HHxmS8', NULL, '16.983068, 102.826208', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00294', 'วัดจินดาราษฎบำรุง', 'ห้วยเกิ้ง อำเภอกุมภวาปี อ.อุดรธานี', '093-6649287', '093-6649287', NULL, 'https://maps.app.goo.gl/fdKxzw6bpAeqY9xV8', NULL, '17.051284, 102.924826', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00296', 'ภารภี จันทร์มหา(ร้านตาไข่)', '259/2 ม.1 ถนนชวลิต ต.กุมภวาปี อ.กุมภวาปีจ.อุดรฯ 41110', '959392888', NULL, NULL, 'https://maps.app.goo.gl/a7QkqBzRUTLdU4tc9', NULL, '17.111011, 103.012404', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00297', 'ร้าน คำแคนบาร์', '110 ม.9 บ.โปร่ง ต.บ้านโปร่ง อ.ศรีธาตุ จ.อุดรธานี', '968255924', '968255924', NULL, 'https://maps.app.goo.gl/sbfUe79TyYaHrZYK7', NULL, '17.016893, 103.130722', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00298', 'วัดทุ่งสว่าง บ้านโนนมะข่า', 'บ้านโนนมะข่า อ.กุมภวาปี จ.อุดรธานี', '979438782', NULL, NULL, 'https://maps.app.goo.gl/XCvpKzQWkGnJE1yP8', NULL, '17.058653, 103.018696', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00301', 'นาย ชัยยศ ชลัมพุช', '53 หมู่ 6 บ้านผือ ต.พันดอน', '811152975', NULL, NULL, 'https://maps.app.goo.gl/nJdDJegaRb5i1Saw9', NULL, '17.135811, 102.914600', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00304', 'วัดศิริชัย บ.โคกสี', 'บ.โคกศรี ต.นาดี อ.หนองแสง จ.อุดรธานี', NULL, NULL, NULL, 'https://maps.app.goo.gl/Qd1d9y87fcmTZ8u28', NULL, '17.048042, 102.831793', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00305', 'น.ส. รุ่งฝน วงศ์ชมภู', '113 หมู่ที่ 3 ตำบลทมนางาม อำเภอโนนสะอาด จังหวัดอุดรธานี', '096-262-0368', NULL, NULL, 'https://maps.app.goo.gl/ti3M76344rxXLQFG8', NULL, '16.910330, 103.001142', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00306', 'น.ส. นิภาดา บ้านแสน [พี่อ้อม]', '105 หมู่ที่ 3 บ.โคกสี ตำบลนาดี อำเภอหนองแสง จังหวัดอุดรธานี', '883625196', NULL, NULL, 'https://maps.app.goo.gl/sT4xKGkrTKqx2Joh7', NULL, '17.047920, 102.830561', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00307', 'ส.พยัคฆ์', '337/3 มิตรภาพ ต.ปะโค อ.กุมภวาปี จ.อุดรธานี', '924321342', NULL, NULL, 'https://maps.app.goo.gl/WNeWSUHu5Ku9p1RP9', NULL, '17.055257, 102.918797', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00308', 'ร้านอาหารตามสั่งแม่รจนา', 'บ้านเลขที่ 19 ม.7 บ้านนาเหล่า ตำบล หนองกุงศรี อำเภอโนนสะอาด จังหวัด อุดรธานี', '807871702', NULL, NULL, 'https://maps.app.goo.gl/nmvM5McEMGFAafRQ6', NULL, '17.059498, 102.786712', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00309', 'กุมภวาปีกลการ (คุณแก้ว)', 'พันดอน อ.กุมภวาปี จ.อุดรธานี', '982312414', '804626468', NULL, 'https://maps.app.goo.gl/qpew3fXUNXakjq7M6', NULL, '17.132909, 102.945353', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00321', 'ร้าน ของชำยายบล', '15 หมู่ที่ 4 บ.บุงหมากลาน ตำบลปะโค อำเภอกุมภวาปี จังหวัดอุดรธานี', '830240095', NULL, NULL, 'https://maps.app.goo.gl/4kN7kXgL3as6wLbh6', NULL, '17.068803, 102.887011', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00326', 'นาย ปิยะพงษ์ สันโดด', '2 หมู่ที่ 6 ตำบลหนองแสง อำเภอหนองแสง จังหวัดอุดรธานี', '621813560', NULL, NULL, 'https://maps.app.goo.gl/uxsBNU3T9ACHdr3U9', NULL, '17.146044, 102.850782', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00329', 'ร้านเต็งหนึ่ง พาณิชย์', 'เลขที่347 ม1 บ้านนาตาล ต.นาตาล อ.ท่าคันโท จ.กาฬสินธุ์ 46190', '882228244', NULL, NULL, 'https://maps.app.goo.gl/ue2y74eTBLD1QpQo8', NULL, '16.932435, 103.242718', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00332', 'ร้านขวัญใจของชำ', 'บ้านคำหว้าทอง ม.7 ต.ทับกุง อ.หนองแสง จ.อุดรธานี', '852312734', NULL, NULL, 'https://www.google.com/maps/place/17%C2%B010\'11.5%22N+102%C2%B047\'06.8%22E/@17.1698289,102.7854249,3a,51.5y,150.15h,78.03t/data=!3m7!1e1!3m5!1sa4OollE-oeNbdceCq_3kog!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_', NULL, '17.169864, 102.785220', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00334', 'แม่เตี้ย', '144 หมู่ 3 ต.ห้วยสามพาด อ.ประจักษ์ศิลปาคม จ.อุดรธานี', '905966550', '905966550', NULL, NULL, NULL, '17.243416,102.926318', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00335', 'ร้าน Double T บิงซู&เบียร์วุ้น', '247/8 ห้วยเกิ้ง อำเภอกุมภวาปี จังหวัดอุดรธานี', '088-3105096', NULL, NULL, 'https://www.google.com/maps/place/Double+T+%E0%B8%9A%E0%B8%B4%E0%B8%87%E0%B8%8B%E0%B8%B9%26%E0%B9%80%E0%B8%9A%E0%B8%B5%E0%B8%A2%E0%B8%A3%E0%B9%8C%E0%B8%A7%E0%B8%B8%E0%B9%89%E0%B8%99/@17.0447367,102.9291094,130m/data=!3m1!1e3!4m6!3m5!1s0x312305ecd6b506a3:0', NULL, '17.044723, 102.929060', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00339', 'ร้านน้ำดื่ม ศูนย์อาหาร ปตท', 'ขาเข้าโนนสะอาด (มุ่งหน้าไปขอนแก่น) เลขที่ 269 หมู่ 13 บ้านดงน้อย ต.ปะโค อ.กุมภาวาปี จ.อุดรธานี', '842291486', NULL, NULL, 'https://maps.app.goo.gl/283fPVeufFvW1gNC6', NULL, '17.002670, 102.895018', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00350', 'วัดหลวงพ่อถาวร', 'บ้านบุ่งหมากลาน', '957940729', NULL, NULL, 'https://maps.app.goo.gl/SJXSniMuxcjSqoEQ8', NULL, '17.073775, 102.874599', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00353', 'นาย พงษ์พังธ์ แก้วศิลา', '456/1 ต.นาตาล ท่าคันโท จ. กาฬสินธุ์ (สำนักงานเทศบาลตำบลท่าคันโท)', '972538399', NULL, NULL, 'https://maps.app.goo.gl/9MUkiv5rMxjTF5hP6', NULL, '16.937632, 103.242763', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00354', 'อาภาพร ภูพาลัย', '94 ม.3 บ.คำปากัง ต.ตาดทอง อ.ศรีธาตุ จ.อุดรธานี 41230', '661409181', NULL, NULL, NULL, NULL, '17.087509,103.167612', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00355', 'น.ส. ธวัลรัตน์ บิลจรัญ', '53 ม.4 บ.ทับไฮ ตำบลแสงสว่าง อำเภอหนองแสง จังหวัดอุดรธานี', '985190243', NULL, NULL, 'https://maps.app.goo.gl/RuMJc66eXy4cHqcf7', NULL, '17.107483, 102.772170', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00356', 'พ่อทุย', '110 หมู่ 10 ต.หัวนาคำ อ.ศรีธาตุ', '811182289', NULL, NULL, 'https://maps.app.goo.gl/RP1v8sPhyXvi28oP7', NULL, '17.090068, 103.357544', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00360', 'บริษัท เทพมงคลสตีลจำกัด', '111 หมู่14 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '837939978', NULL, NULL, 'https://maps.app.goo.gl/LrXWZGXtu99L1MfA7', NULL, '17.119069, 102.986374', '2026-07-23 11:48:50', '08:00', '17:00'),
('JK-00363', 'ร้านยง [น.ส. สุริยง เข็มทอง]', '303 หมู่ที่ บ.กุดยาง ตำบลท่าลี่ อำเภอกุมภวาปี จังหวัดอุดรธานี', '981627748', NULL, NULL, 'https://maps.app.goo.gl/TfzUAjD9yoNPWxq5A', NULL, '16.954029,103.041329', '2026-07-23 11:48:50', '08:00', '17:00'),
('JR-000001', '34 / 12ล้อ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JR-000002', '84-0943 [24]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JR-000003', '84-2566 [28]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JR-000004', '84-6565 [41]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JR-000005', '84-6566 อด [36]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JR-000006', 'ฒล 5216 [31]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JR-000007', 'บห 4780 [21]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JR-000008', 'ผค 9282 [22]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JR-000009', 'ผจ 5131[23]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JR-000010', 'ผธ 5131 [23]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JR-000011', 'ผธ 4253 [19]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JR-000012', 'ผธ 4108 [18]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JR-000013', 'ผน 3279 [16]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JR-000014', 'ผน 3280 [15]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JR-000015', 'ผบ 152 [27]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JR-000016', 'ผบ 153 [26]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JR-000017', 'ผบ 3875 [38]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JR-000018', 'ผบ 3876 [37]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('JR-000019', 'ผบ 4772[46]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('LE-00001', 'นก', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('LE-00002', 'หน่อย', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('LE-00003', 'อาคาร ราชพัสดุ หลังที่ 2 ร้านอาหาร', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('LE-00004', 'อาคารราชพัสดุ อิงฟ้าโฟน', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00001', 'โรงเรียนบ้านกุดจิก', 'ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี 41110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00002', 'กองทุนบ้านดงแสนสุข ม.8', NULL, '651126821', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00003', 'น้องการ์ตูน', NULL, '641452565', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00005', 'บริษัท อิสาน พรีเมี่ยม สตาร์ช จำกัด (สำนักงานใหญ่) 237 หมู่6 ต.กุดจิก อ.ท่าคนโท จ.กาฬสินธุ์ 46190', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00006', 'ท.รุ่งเรือง ข้างเจ้พา', NULL, '611536166', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00007', 'นางบัวบาน ทองสุมาตร(2)', 'ร้าน ป.ซุปเปอร์สโตร์ เลขที่ 121 หมู่ 5 ต.ตาดทอง อ.ศรีธาตุ จ.อุดรธานี 41230', '800811790', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00008', 'ริมราง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00009', 'แม่ไข่ อุ่มจาน (ร้านแม่) (5)', 'ร้านค้าชุมชนหมู่8(ข้างสระหนองพิณ)บ้านอุ่มจาน ต.อุ่มจาน อ.ประจักษ์ศิลปาคม', '826065406', NULL, NULL, 'https://goo.gl/maps/SeLsFo7Mt1vi1EwJA', NULL, '17.234051, 103.039979', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00010', 'ร้านค้าสวัสดิการโรงพยาบาลกุมภวาปี', NULL, '943104688', 'ไม่เกิน17.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00011', 'ร้านพัฒนะ', NULL, NULL, NULL, NULL, NULL, NULL, '17.297566, 102.778112', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00012', 'ร้านน้องแฟรงค์', NULL, '872164148', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00013', 'เรือนชุดไทย', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00014', 'อุ๋ย คอลเกต', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00015', 'พิมชนุช การค้า', '129 หมู่ที่13 ตำบลแชแล อำเภอกุมภวาปี จังหวัดอุดรธานี 41110', '0872733577/ไลน์', 'ไม่เกิน18.00น', NULL, 'https://goo.gl/maps/wWmtHtt5Y2gX5Jmv7', NULL, '17.153482,103.045968', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00016', 'อุทัยการค้า', 'ทางเข้าบ้านไผ่', '934212429', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00017', 'บริษัท ถูกป.เจริญพาณิชย์ จำกัด', '134 หมู่11 ต.หนองโก อ.กระนวน จ.ขอนแก่น 40170 ต.หนองโก อ.กระนวน จ.ขอนแก่น 40170', NULL, NULL, NULL, 'https://goo.gl/maps/33DN4PJgqJKSNF2W9', NULL, '16.717488, 103.086231', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00018', 'ร้านทัศนีย์ คำกุง (3)', 'คำกุง', '630862789', 'ไม่เกิน19.00น.', NULL, 'https://goo.gl/maps/CMUMj26thPhgMz947', NULL, '17.087351, 103.249000', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00019', 'นาง ศิวาพร บุริกา', '58 หมู่8 ต.หัวนาคำ อ.ศรีธาตุ จ.อุดรธานี 41230', '925620427', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00021', 'เซฟมอร์', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00022', 'ร้านน้ำฝน', 'อ.อุบลรัตน์', '934154451', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00023', 'นายศักรินทร์ พันธ์รอด (2)', 'เลขที่ 103 ม.6 บ.โนนสำราญ ต.บุ่งแก้ว อ.โนนสะอาด จ.อุดรธานี 41240', '0849136158/064030991', 'ไม่เกิน 20.00น.', NULL, 'https://goo.gl/maps/h9UXmu76z1VtwL6P6', NULL, '16.971451, 102.976021', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00024', 'คุณมัญชุสา ปรางทองเนรมิต (1)', '129 หมู่8 ท่ายม ต.แสงสว่าง อ.หนองแสง จ.อุดรธานี 41340', '0616935366/ไลน์', 'ไม่เกิน18.00น.', NULL, 'https://goo.gl/maps/f7RZB5HxX6T5cPXF6', NULL, '17.138800, 102.790021', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00025', 'สหการบ้านหนองอุดม หมู่7 (2)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00026', 'ดีจริง', 'วังสามหมอ', NULL, NULL, NULL, NULL, NULL, '16.949518, 103.438296', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00028', 'เจ้เก๋', 'อ.สว่างแดนดิน จ.สกลนคร', '896196888', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00029', 'ร้านพรมารวย (5)+(อย่าโทรถ้าไม่อยากถูกด่า)', 'ข้างเซเวน อ. ประจักษ์', '0819374824/ไลน์', 'ไม่เกิน18.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00030', 'ห้างหุ้นส่วนจำกัด ต้นแพร ซูเปอร์สโตร์', '472 หมู่ที่ 1 ต.ยางตลาด อ.ยางตลาด จ.กาฬสินธุ์ 46120', '885715997', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00031', '[อำนวย]หจก.ปิยวัฒน์สกุล', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00032', 'พรสุดา', NULL, '825832353', NULL, NULL, 'https://maps.app.goo.gl/TeL6nYgdEkCEEtsH8', NULL, '17.130445, 102.889715', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00033', 'วีระยนต์การค้า', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00034', 'พี่แม็ก ท่าคันโท (4)', NULL, NULL, 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/uMv8do2eHkyhFsws7', NULL, '16.939893, 103.215043', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00035', 'แพรว หนองนกเขียน', 'อำเภอศรีธาตุ', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00036', 'ห้างหุ้นส่วนจำกัด บิ๊กต้อย2018', 'ต.นาเหล่า อ.นาวัง จ.หนองบัวลำภู 39170 ต.นาเหล่า อ.นาวัง จ.หนองบัวลำภู 39170', '894229246', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00037', 'สมพงษ์ เภสัช สำนักงานใหญ่', '34 หมู่ที่ 4 ต.เขื่อนอุบลรัตน์ อ.อุบลรัตน์ จ.ขอนแก่น 40250 ต.เขื่อนอุบลรัตน์ อ.อุบลรัตน์ จ.ขอนแก่น 40250', '43446033', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00039', 'บิ๊กมินิมาร์ท (นุศิลป์ วัชโรสินธุ์)(3)', '124/1 หมู่ที่ 1 ต.ศรีธาตุ อ.ศรีธาตุ จ.อุดรธานี 41230 ต.ศรีธาตุ อ.ศรีธาตุ จ.อุดรธานี 41230', '815446261', NULL, NULL, 'https://goo.gl/maps/tCJ91pSUU1EniTww8', NULL, '16.974671, 103.215415', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00040', 'นัทเขาสวนกวาง', NULL, '855659424', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00041', 'นางสาวชนาภา พรมพินิจ ประเสริฐ การค้า สำนักงานใหญ่', '24 ตำบล ท่ากกแดง อำเภอ เซกา จังหวัด บึงกาฬ 38150', '934363836', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00042', 'ห้างหุ้นส่วนจำกัด หนุ่มกะเหรี่ยง สำนักงานใหญ่', '136 หมู่ที่ 5 ตำบลดงบัง อำเภอบึงโขงโหลง จังหวัดบึงกาฬ 38220', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00043', 'เอิร์ท ยำ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00044', 'อนันต์ บุตรกระธรรม', NULL, '871256936', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00045', 'หนึ่งการเกษตร (3)', 'บ้านตาด ศรีธาตุ', '969846061', NULL, NULL, 'https://goo.gl/maps/rVDQHotHPezTxmCy6', NULL, '17.05096,103.13814', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00046', 'เจ้หน่อย บ้านหนองหลวงสว่างแดนดิน', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00047', 'หจก. กวงฮง (สำนักงานใหญ่)', '601 หมู่ 2 ต.เจริญศิลป์ อ.เจริญศิลป์ จ.สกลนคร 47290', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00048', 'นางสาวสุภัคชญา ศรีวิชยางกูร(5)', 'เลขที่ 100 หมู่ที่ 2 บ.แม่นนท์ ต.หนองไผ่ อ.เมืองอุดรธานี จ.อุดรธานี 41330', '914997995', 'ไม่เกิน20.00น.', NULL, 'https://goo.gl/maps/Js7bro5HsQKGvJZi7', NULL, '17.242581, 102.898324', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00049', 'บริษัท ฟ้า ใหม่ อุ่น ซูเปอร์สโตร์ จำกัด(3)', '75 หมู่ที่ 8 ต.ศรีธาตุ อ.ศรีธาตุ จ.อุดรธานี 41230', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00050', 'จิระสุข', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00051', 'ร้านปี๊ดเจริญการค้า', '87/7 ต.หนองหิน อ.หนองกรุงศรี จ.กาฬสินธุ์ 46220', '981466751', NULL, NULL, 'https://goo.gl/maps/pdAmamZQvyPk3adm9', NULL, '16.807531, 103.371021', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00052', 'หจก.ทรัพย์ภูพาน (สำนักงานใหญ่)', '125 หมู่7 ต.บ้านดง อ.อุบลรัตน์ จ.ขอนแก่น 40250', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00054', 'ร้านศรีธาตุพลาสติก (นายโสพัส อุปมะ)(3)', '110 ม.10 บ้านคำศรี ต.ศรีธาตุ อ.ศรีธาตุ จ.อุดรธานี 41230', '894189167', NULL, NULL, 'https://goo.gl/maps/g1bNAmiA6gu2nzZr6', NULL, '16.974862, 103.211979', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00055', 'นส.สำเนียง สารีคาร (4)', 'เลขที่ 109 หมู่ 4 บ้านหนองแซง ต.นาตาล อ.ท่าคันโท จ.กาฬสินธุ์ 46190', '0876382584/ไลน์สั่งเ', 'ไม่เกิน19.00น.', NULL, 'https://goo.gl/maps/htfQARm7VmwAV8CX7', NULL, '16.864541, 103.267032', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00056', 'นาง บุญนาค พระตลับ (ซุปเปอร์แตน)', 'หมู่4 ต.บุ่งคล้า อ.บุ้งคล้า จ.บึงกาฬ 38000', '872338205', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00057', 'ผานกเค้า', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00058', 'เพียงงามพาณิช', 'โนนสูง', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00059', 'ยายแดง หนองนาคำ (5)', '79 หมู่ 14 บ้านหนองนาคำ ต.เสอเพลอ อ.กุมภวาปีจ. อุดรธานี', '0910526514/หน้าร้าน', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00060', 'จุฬาท่าบ่อ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00061', 'หจก.ตั้งเจริญซุปเปอร์มาร์ท', '108 หมู่ 6 ต.คำปอ อ.วาริชภูมิ สกลนคร 47150', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00062', 'ร้านจีตั้น', '134 หมู่ 1 ต.โพนสูง อ.ไชยวาน จ.อุดรธานี', '655834484', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00063', 'หจก.ถูกดี เจริญภัณฑ์ 54', '316 ม.2 ต.บุ่งคล้า อ.บุ่งคล้า จ.บึงกาฬ 38000', '844651117', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00064', 'นายสุวรรณ์ แวงคำ (2.3)', '182 หมู่10 ตำบลบ้านโปร่ง อำเภอศรีธาตุ จังหวัดอุดรธานี 41230', '981424743', '17.00-18.00น.', NULL, 'https://goo.gl/maps/KGQ1rPHpt34g7ruK7', NULL, '16.969216, 103.102669', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00065', 'ทิพวาณี โนนทะขาม', '184 หมู่13 ต.โคกกลาง อ.โนนสะอาด จ.อุดรธานี 41240', '615746927', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00066', 'เชวง ท่าคันโท (4)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00067', 'ครัวนายเอ๋ บ.สะอาดนามูล หมู่10 (5)', NULL, '0871256936 *ปิดกิจกา', NULL, NULL, 'https://goo.gl/maps/NPiE8cBq2QPWUMjs9', NULL, '17.229951, 102.935054', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00068', 'ครัวอิเจ้', 'บ้า', '972268462', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00072', 'วัดศรีนคราราม ดงเมือง', NULL, '857614663', NULL, NULL, 'https://goo.gl/maps/cQwAmsGheTcnnqe3A', NULL, '17.116665, 103.016560', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00073', 'ร้านวัชราภรพาณิชย์(3)', '75 หมู่3 บ.หนองไผ่ ต.หนองหญ้าไซ อ.วังสามหมอ จ.อุดรธานี', '614988393', NULL, NULL, 'https://goo.gl/maps/skzizBp3g8kR9V6CA', NULL, '16.946190, 103.377979', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00074', 'ปูน้อย', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00075', 'คุณพิศนา คำตา (สำนักงานใหญ่)', '5 ม.11 ตำบลชัยพร อำเภอเมืองบึงกาฬ จังหวัดบึงกาฬ 38000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00076', 'ต.ทรัพย์ธนกาญจน์ (1)', 'ท่ายม', '862328159', 'ไม่เกิน 20.00น.', NULL, 'https://goo.gl/maps/cVm4wPUX6W2mDgWRA', NULL, '17.140184, 102.787401', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00077', 'ร้านตั้งมีทรัพย์ (1)', 'ม.1 ถ.ชมชวน ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี', '826393949', NULL, NULL, 'https://goo.gl/maps/1hTkn14NHD25cA6VA', NULL, '17.113213, 103.011531', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00078', 'ถนอมทรัพย์ วังสามหมอ(3)', NULL, '621656477', NULL, NULL, 'https://goo.gl/maps/BbeYTsAjoRCShM6aA', NULL, '16.949456, 103.441957', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00079', 'บริษัท บิ๊ก ป ซูเปอร์มาร์ท จำกัด', '248 ม.1 ถ.แซแล ต.กุมภวาปี จ.อุดรธานี 41110', '853862888', NULL, NULL, 'https://maps.app.goo.gl/LECZUPSNYdQ21Sfb9', NULL, '17.113699, 103.002658', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00080', 'นางขนิษฐา พรมเลิศ (ร้านขนิษฐา)', '96 หมู่ที่5 ตำบลนาดี อำเภอหนองแสง จังหวัดอุดรธานี 41340', '0644052998/ไลน์', 'ไม่เกิน 20.00น.', NULL, 'https://goo.gl/maps/h9arRQPurGS1vwi26', NULL, '17.045621, 102.843000', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00081', 'แม่พร ศรีธาตุ(3)', NULL, '0862245537/หน้าร้าน', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00082', 'อดุลย์ ยะไชยศรี', '85/3 ม.13 บ.โพนงาม ต.นาม่อง อ.กุดบาก จ.สกลนคร 47180', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00083', 'ร้านยรรยงค์', '107 หมู่2 ต.นาดี อ.หนองแสง จ.อุดรธานี', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00084', 'ส.สกุลชัย (3)', '36 หมู่10 ต.บ้านโปร่ง อ.ศรีธาตุ จ.อุดรธานี 41230', '0817497383/ไลน์', 'ไม่เกิน 16.00', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00085', 'นางสาวนริศรา ตางจงราช(ไอดีการค้า)', 'เลขที่126 หมู่7 บ้านหนองอุดม ตำบลสีออ อำเภอกุมภวาปี จังหวัดอุดรธานี 41110', '908560414', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00086', 'บริษัทไวท์ไลน์แอคทิเวชัน จำกัด (สำนักงานใหญ่)', '208 อาคาร 208 วายเลสโร้ด ยูนิต 507ชั้น 5 ถนน วิทยุ แขวงลุมพินี เขตปทุมวัน กรุงเทพมหานคร 10330', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00087', 'โฟกัส แอนด์ มีนา (1)', 'บ้านโคกสว่าง ตำบลหนองแสง อำเภอหนองแสง จังหวัดอุดรธานี', '0825232212/096741496', 'ไม่เกิน 17.00น', NULL, 'https://goo.gl/maps/hZVSe26YErFWGqcY9', NULL, '17.189505, 102.842979', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00088', 'พชิรา ไชยคำมี (พ่อโย่ง)', NULL, '650893797', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00089', 'อนุชา มินิมาร์ท(5)', 'หมู่ 1 ตำบล ปะโค อำเภอกุมภวาปี อุดรธานี 41370', '918657604', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00090', 'มังกรทอง', '316 ม.5 บ้านสีแจ ต.ผาสุก อ.กุมภวาปี 41370', '879805711', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00091', 'กรรณิกา พานิชย์', NULL, '879213036', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00092', 'สุภาวรรณ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00093', 'ส.เสถียรศักดิ์ของฝาก', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00096', 'ร้านวรวิทย์ (4.1)', 'บ้านหนองกวาง', '656456112', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00097', 'วัดสระแก้ว', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00098', 'บริษัท เวลาอินเตอร์เทรด จำกัด(สำนักงานใหญ่)', '237/1 ถ.อุดร-กุดจับ หมู่4 ต.บ้านเลื่อม อ.เมือง จ.อุดณธานี 41000', '801965663', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00099', 'ร้านธนพงษ์การค้า(1)', 'บ.แสงสว่าง', '0917280305/ไลน์', NULL, NULL, 'https://goo.gl/maps/N5YeUWqSjkSrimx49', NULL, '17.123541, 102.819968', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00100', 'บริษัท ตั้งงี่สุนซูเปอร์สโตร์ จำกัด', '119-121-123 ถ.โพศรี อ.เมือง จ.อุดรธานี 41000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00101', 'ร้านการ์ตูนโฟโต้ (ร้านการ์ตูน บ.บะยาว เก่า) (2)', '174 ม.8 บ้านบะยาว ต.บุ่งแก้ว อ.โนนสะอาด จ.อุดรธานี 41240', '933717824', 'ไม่เกิน 20.00น.', NULL, 'https://goo.gl/maps/n3GaTVey3AXHBDVC9', NULL, '16.949931, 103.022903', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00102', 'แม่นาง เชียงแหว (5)', NULL, '0901951032(เลิกขาย)', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00103', 'ร้านมะลิการค้า บ้านสี่แจ', NULL, '634479956', NULL, NULL, 'https://goo.gl/maps/yG2BdXk7Kyxo2Pru6', NULL, '17.164753, 102.933241', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00104', 'บริษัท ฑีฆเจริญค้าน้ำมัน จำกัด', '299 หมู่1 ตำบลกุมภวาปี อำเภอกุมภวาปี จังหวัดอุดรธานี 41110', '42111734', NULL, NULL, 'https://goo.gl/maps/u7dG7P21kSXAjLwJA', NULL, '17.119234, 102.989004', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00105', 'ครูประคอง ท่าคันโท (4)', NULL, '0817298117/065312083', 'ไม่เกิน 18.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00107', 'กิตติศักดิ์', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00108', 'พ่อเปี๊ยก บ้านปะโค', NULL, '981157572', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00109', 'น้อง บี', NULL, '930932629', NULL, NULL, 'https://maps.app.goo.gl/8DiXcGQDFRKWimaMA', NULL, '17.190549,102.93514', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00110', 'แม่ลี นาฝาย (1)', NULL, '612085183', 'ไม่เกิน 19.00น.', NULL, 'https://goo.gl/maps/9xbbjGt1FDeiTcPg8', NULL, '17.084010, 102.858032', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00111', 'เปรี้ยว หน้าวัดบ้านสีออ (2)', 'หน้าวัดบ้านสีออ', '808268561', NULL, NULL, 'https://goo.gl/maps/uN23ThN321mA76jt6', NULL, '16.999720, 103.054428', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00112', 'ร้านปทิตตา ซุปเปอร์', '245ม.4 บ้านสร้างบง ต.ผาสุก อ.กุมภวาปี จ.อุดรธานี 41370', '934342375', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00113', 'ร้านเทพสุวรรณ', NULL, '956182579', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00114', 'ร้านบารมี (เอมอร) (2)', 'บ้านเลขที่ 206 บ.บุ่งแก้ว ต.บุ่งแก้ว อ.โนนสะอาด จ.อุดรธานี', '0645258851/084392238', 'ไม่เกิน 20:00', NULL, 'https://goo.gl/maps/UjWo9LFk5DK1W7YU8', NULL, '16.971272, 102.955011', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00115', 'ติ๊ดการค้า', 'อ.วาริชภูมิ จ.สกลนคร', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00116', 'ห้างหุ้นส่วนจำกัด ถูก ซุปเปอร์มาร์เก็ต (บ้านม่วง)', '180 ตำบลม่วง อำเภอบ้านม่วง จังหวัดสกลนคร 47140', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00117', 'บริษัท บางกอก ไลฟ์ สไตล์ จำกัด', 'หมู่บ้านศรีนคร เลขที่88 หมู่ที่12 ตำบลศรีธาตุ อำเภอศรีธาตุ จังหวัดอุดรธานี 41230', '817211600', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00118', 'อึ้งเจริญพาณิชย์', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00119', 'คูณเงินพาณิชย์ บ้านคำหว้าทอง ม.9 (6.2)', NULL, '935180449', 'ไม่เกิน18.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00120', 'ร้านยายแอ็ด-ตาสุข', NULL, '910635888', NULL, NULL, 'https://goo.gl/maps/M4MHYyteXU2VatQ18', NULL, '17.146115, 102.967284', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00121', 'ล้านฟาร์มนัว หน้าเทศบาลห้วยเกิ้ง', NULL, '624946336', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00123', 'พิศมัย นาฝาย(ร้านเดิม แม่บุญมี)', NULL, '887431977', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/KYMNiALaBfKiBcYM8', NULL, '17.085479, 102.857032', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00124', 'พี่นิด กุมภวาปี', NULL, '612528564', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00125', 'แม่สร้อย โคกสว่าง (1)', NULL, '0829256966 (ลูกค้าไป', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/ACHP1jxy4NXECKxk7', NULL, '17.190279, 102.844979', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00126', 'ส.พัฒนา', NULL, '0831479999//08764466', NULL, NULL, NULL, NULL, '17.130248, 102.964987', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00127', 'วัดป่าปิยธรรม ปะโค (1)', NULL, '954857567', NULL, NULL, 'https://goo.gl/maps/iL7NQ6G6zBuNo9rRA', NULL, '17.097067, 102.928957', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00128', 'ณกมล', NULL, '822324632', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00129', 'เอกลักษ์ (3)', 'บ.ห้วยแสง', '0825892206/080326974', NULL, NULL, 'https://goo.gl/maps/BZ5L4V5sKCn59yt78', NULL, '17.011962, 102.840011', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00130', 'ธนาคารกรุงเทพ จำกัด (มหาชน)', '358 หมู่9 ถนน แชแล ต.แชแล อ.กุมภวาปี จ.อุดรธานี 41110', '42334926', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00131', 'บริษัท ชาภูเขา จำกัด (สำนักงานใหญ่)', '102 ม.15 ถ.พิศาลสารกิจ ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '0830510505/061551050', NULL, NULL, 'https://goo.gl/maps/3WfegjCGibPnQRoK8', NULL, '17.133884, 102.968431', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00132', 'แม่นกน้อย อุไรพร', NULL, '616291182', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00133', 'ยายไหม กุมภวาปี ตรงข้ามร้านพี่นานมสด (1)', '74 ม.13 ถ.ยิ้มประสิทธิ์ ต.กุมภวาปี อ.กุมภวาปี', '0818761144/081321321', 'ไม่เกิน 18.00น', NULL, 'https://goo.gl/maps/ETDseDVACFzMq27Z7', NULL, '17.109541, 103.014989', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00134', 'ที่ทำการปกครองอำเภอหนองแสง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00135', 'คันธมาทน์ 2', '346 ม.8 ต.บัวตูม อ.โซ่พิสัย จ.บึงกาฬ 38170', '0970638696/แอพ/ลูกค้', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/HezmxGaqhSWnfeBJ6', NULL, '17.174872, 103.070054', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00136', 'ร้านณัฐธิญาพาณิชย์ (9546)', '227 หมู่ที่5 ตำบลนาทัน อำเภอคำม่วง จังหวัดกาฬสิธุ์ 46180', '0933191619/093748964', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00138', 'ร้านโชคศิริทรัพย์ สว่างแดนดิน', 'อำเภอสว่างแดนดิน จังหวัดสกลนคร', '967915845', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00139', 'ยอดยิ่ง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00140', 'นางสาวมยุรี มุงเคน (สุขสว่าง ช็อป) (3)', '65 หมู่12 บ้านโนนสวรรค์ ตำบลจำปี อำเภอศรีธาตุ จังหวัดอุดรธานี', '0896205808/แอพ+ไลน์', 'ไม่เกิน 15.00น', NULL, 'https://goo.gl/maps/XydqWNkzWtV1T1MBA', NULL, '16.987441, 103.154979', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00141', 'ร้านแม่แก้ว ตูมใต้ (5.2)', '157 หมู่3ต.ตูมใต้ อ.กุมภวาปี จังหวัดอุดรธานี 41110', '857575937', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00142', 'แม่คำปุ่น ตูมกลาง (1)', NULL, '0926831411/หน้าร้าน', 'ไม่เกิน 18.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00143', 'แม่ระเบียบ ตูมกลาง ม.2', NULL, '981096920', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/7ULYGXH4XZEjAnJE9', NULL, '17.098367, 102.980032', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00144', 'แม่โส ตูมเหนือน้อย โนนน้ำเที่ยง (1)', NULL, '904564539', 'ไม่เกิน 20.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00145', 'ร้านปิยะรัตน์ ท่าม่วงน้อย', 'บ้นท่าม่วงน้อย 7 ม.12 ต.เวียงคำ อ.กุมภวาปี จ.อุดรธานี 4110', '993964253', NULL, NULL, 'https://goo.gl/maps/qo6zfvApNiuaXt339', NULL, '17.075679, 103.037011', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00146', 'พี่จ๊อบ บ้านหนองหว้า (5.2)', NULL, '984527985', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00147', 'แม่ดารา บ้านห้วยบง (2)', NULL, '0810567415/หน้าร้าน', 'ไม่เกิน 18.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00148', 'พ่อจันทรา เหล่ากกโพธิ์ (3)', NULL, '0986965847/หน้าร้าน', 'ไม่เกิน 19.00 น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00149', 'แม่นวลศรี ศาลากลางบ้านดอนเงิน (2.1)', NULL, '880701334', 'ไม่เกิน 19.00 น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00150', 'ปราโมทย์ บ้านจีต กู่แก้ว', NULL, '833562027', 'สะดวกรับไม่เกิน 19.0', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00151', 'นางรังสิต น้อยนิล (ว.มินิมาร์ท ศรีธาตุ) (3)', '29 หมู่ 15 ตำบลหัวนาคำ อำเภอศรีธาตุ จังหวัดอุดรธานี 41230', '881945787', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/CLv5pASyPLEdU3kh8', NULL, '17.026390, 103.237979', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00152', 'ร้านแม่สังวาล บ.คำปากั้ง (3) **งดโทร สั่งแล้วคืน**', 'ศรีธาตุ', '810529103', 'ไม่เกิน20.00น', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00153', 'สหการบ้านหนองกวาง (2)', NULL, '0931193785 แม่แม้ง', 'ไม่เกิน 15.00น', NULL, 'https://goo.gl/maps/dwNXwfBG6HCGCKzi7', NULL, '17.007662, 103.048979', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00154', 'ทาลี่พาณิชย์', NULL, '833863937', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00155', 'ร้าน ดีดีการค้า (2)', NULL, '929816637', 'ไม่เกิน 19.00น.', NULL, 'https://maps.app.goo.gl/4t1kVamiiNFJjj9S8', NULL, '16.963895, 103.077064', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00156', 'ร้านเรืองมณี (แม่หมอก) (2)', 'บ.ท่าลี่', '925380896', 'ไม่เกิน 20.00น.', NULL, 'https://goo.gl/maps/UGQpsWYJ3BVKE3f87', NULL, '16.964310, 103.073968', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00157', 'สหการบ้านโคกน้อย', NULL, '961204363', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00158', 'น้องทับทิม', NULL, '613533873', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00159', 'แม่ทองทิพย์', 'บ.ท่าไฮ', '878601024', 'ไม่เกิน 19.00 น', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00160', 'ร้านโอ๊ย ไข่ ชา [ตรงข้ามร้านนีน่า & อะตอม]', 'บ.คำกุง ต.หัวนาคำ อ.ศรีธาตุ', '934680243', NULL, NULL, 'https://goo.gl/maps/Se6hQqKfjUidJzCY9', NULL, '17.082341, 103.248903', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00161', 'อลงกรณ์ (1)', 'บ.คำกุง ต.หัวนาคำ อ.ศรีธาตุ', '953351770', 'ไม่เกิน 20.00น.', NULL, 'https://goo.gl/maps/UMrmGHAyxeScChM18', NULL, '17.087251, 103.249011', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00162', 'สมคิด สิทธิโชติ (2.2)', 'บ.คำกุง ต.หัวนาคำ อ.ศรีธาตุ', '610342208', 'ไม่เกิน18.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00164', 'กิติรุ่งเรือง บ.คำปากั้ง (3)', NULL, '0934786887/หน้าร้าน', 'ไม่เกิน 20.00น', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00165', 'นางเบ้า จันทพงษ์ (2)', '16 หมู่ที่ 11 ตำบล ท่าลี่ อำเภอกุมภวาปี จังหวัดอุดรธานี 41110', '832651424', 'ไม่เกิน 20.00น.', NULL, 'https://goo.gl/maps/8aMVECmmXeHahaQM7', NULL, '16.955641, 103.054936', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00167', 'กองทุนสวัสดิการหนองกุงศรี ม.1 (6.2)', NULL, '927731609', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00168', 'แม่สุ โพธิ์ชัย (แม่หวี) ม.3 (6.2)', 'บ.โพธิ์ชัย ม.3', '958822836', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00169', 'สหการ บ.กุดดอกคำ (6.2)', NULL, '937629169', 'สะดวกรับของไม่เกิน 1', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00170', 'เจ้เปีย บุ่งหมากลาน (1)', NULL, '934188455', NULL, NULL, 'https://goo.gl/maps/77byqTbgTGVX9Jts9', NULL, '17.068852, 102.888989', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00171', 'น.ส.อรทัย ภูครองหิน (โอ-หน่อย) (1)', '187 ม.11 ต.หนองกุงศรี อ.โนนสะอาด จ.อุดรธานี', '848213929', 'ไม่เกิน 20.30น.', NULL, 'https://goo.gl/maps/MfT4bQqfVgFgEvLG8', NULL, '17.063842, 102.786989', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00172', 'แม่ปราณี คาร์แคร์ บ.ดอนเงิน (ยกเลิก)', NULL, '612150096', 'ไม่เกิน18.00น.', NULL, 'https://goo.gl/maps/udwnnQuDWTQs3stN6', NULL, '17.122251, 103.032000', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00173', 'แม่สมบัติ บ.ดอนเงิน (2.1)', NULL, '862358695', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00174', 'พี่เกด บ้านผือ (6.1)', NULL, '986622356', 'ไม่เกิน18.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00175', 'บัวผัน บ้านตาดทอง', 'บ้านตาด ต.ตาดทอง อ.ศรีธาตุ', '801881520', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00176', 'แม่คำแป๋ง หนองประเสริฐ (1)', NULL, '0862310517/หน้าร้าน', 'ไม่เกิน18.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00');
INSERT INTO `store` (`store_id`, `store_name`, `store_address`, `telephone_number`, `fax_number`, `email`, `url`, `customer_delivery_time`, `store_location`, `created_at`, `open_time`, `close_time`) VALUES
('OR-00177', 'ถูกดี ราชาการค้า (3)', '123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กทม.', '819745178', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/1GkFDxLdxQEBwH868', NULL, '17.086111, 103.249361', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00178', 'ตาเพชร บ.ผือ (1)', NULL, '0852193252/หน้าร้าน', 'ไม่เกิน18.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00179', 'แม่นาง บ้านผือ (1)', NULL, '981126475', 'ไม่เกิน 19.00น', NULL, 'https://goo.gl/maps/25Lz3e23CAC7EjEdA', NULL, '17.131141, 102.916000', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00180', 'นส.สุภัทรา ศิลา', '39 หมู่ 1 ตำบลแชแล อ.กุมภวาปี จ.อุดรธานี 41110', '813352008', NULL, NULL, 'https://maps.app.goo.gl/RiYrma6SdiiNMrxu5', NULL, '17.180069, 103.067402', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00181', 'พี่บุ๋ม บ.คำเจริญ (1)', NULL, '0887484737/097228382', 'ไม่เกิน18.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00182', 'แม่ชู บ.สามเหลี่ยม (1)', NULL, '611564432', 'ไม่เกิน 19.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00183', 'พี่ณรงค์ บ.สามเหลี่ยม (1)', NULL, '810597787', 'ไม่เกิน18.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00184', 'พี่ลำปาง บ.หนองประเสริฐ (1)', NULL, '825923578', 'ไม่เกิน18.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00186', 'พี่นุช บ.วังหน้าผา (5)', NULL, '954947998', 'ไม่เกิน 18.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00188', 'ร้านทองทิพ บ.ทองอิน (5)', NULL, '860623314', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00189', 'นางสาวพชรกมล พนะราบ (ร้านเพชรทองอินทร์เกษตรรุ่งเรือง) (5)', '93 หมู่13 ตำบลเสอเพลอ อำเภอกุมภวาปี จังหวัดอุดรธานี', '828954461', 'ไม่เกิน18.00น.', NULL, 'https://goo.gl/maps/R2bQ4TjqcSTgXr7A7', NULL, '17.242282, 102.843069', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00190', 'นายณัฐวุฒิ ชัยลี (ปอยการเกษตร) (5)', '29 หมู่ที่5 หมู่บ้านทองอินทร์ ตำบลเสอเพลอ อำเภอกุมภวาปี จังหวัดอุดรธานี', '856628708', 'ไม่เกิน 16.00', NULL, 'https://goo.gl/maps/opdaUKvHgHtMcMNTA', NULL, '17.240515, 102.843849', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00191', 'ร้านนารี บ.สวนมอญ (5)', 'บ้านสวนมอญ ต.เชียงแหว', '860761298', 'ไม่เกิน 19.00น', NULL, 'https://goo.gl/maps/5xgKdJJaDWse2NEu9', NULL, '17.230920, 102.852843', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00192', 'เจ้เตย ศรีธาตุแก๊ส ตรงข้ามL.ก.ฮ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00193', 'แม่แป บ้านห้วยบง', '32 หมู่ 2 บ้านห้วยบง ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี', '986641475', NULL, NULL, 'https://maps.app.goo.gl/Ed6F42T5rBvVuyGK9', NULL, '17.021241, 103.003547', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00194', 'ร้านใบเฟิร์นพานิชย์ (1)', 'ตำบล เวียงคำ อำเภอกุมภวาปี อุดรธานี 41110', '0648833475/หน้าร้าน', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00195', 'นางสุวีร์นุช หาญฟ้าเลื่อน (ร้านบุญชูทรัพย์)', '41 หมู่ 3 ตำบลหนองไผ่ อำเภอเมือง จังหวัดอุดรธานี 41330', '611386766', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00196', 'พี่รุ่ง บ.หนองนาคำ (5)', '41 ม.14 บ.หนองนาคำ ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี 41370', '986985655', 'ไม่เกิน18.00น.', NULL, 'https://goo.gl/maps/sK1dcp8ucdeX7hj27', NULL, '17.190302, 102.930989', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00198', 'สหกรณ์บ้านเหล่ากกเค็ง (3)', 'บ้านเหล่ากกเค็ง', '930066633', 'ไม่เกิน20.00น.', NULL, 'https://goo.gl/maps/vFrRZ9ED6Lg5MVYf6', NULL, '17.16371,103.085946', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00199', 'ร้านกิจอุดม (1)', 'เลขที่ 324 ม.11 บ.ทับกุง ต.ทับกุง อ.หนองแสง จ.อุดรธานี 41340.', '0834502835/ไลน์', 'ไม่เกิน18.00น.', NULL, 'https://goo.gl/maps/95m24SzjBFSp7Qvt6', NULL, '17.169302, 102.778244', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00200', 'สั่งเองหน้าร้าน', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00201', 'แม่ไพ โนนจำปา (1)', 'ปากทางเข้าวัดป่าปิยะธรรม', '0661051412/หน้าร้าน', 'ไม่เกิน 18.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00202', 'นุ่มนิ่ม บ้านดงน้อย (3)', NULL, '945466051', NULL, NULL, 'https://goo.gl/maps/ZDPqJrYarphg3zmw5', NULL, '17.018262, 102.897936', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00203', 'พ่อคำผาย บ้านโพนทอง', '65 หมู่6 ต.อุ่มจาน อ.ประจักษ์ จ.อุดรธานี', '615372952', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00204', 'ร้านโชคทรัพย์วัสดุก่อสร้าง (1)', '125 หมู่1 ต.แสงสว่าง อ.หนองแสง จ.อุดรธานี 41340', '979391904', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00205', 'ไตรภพเจริญการค้า', NULL, '982974340', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00206', 'มหาไชย', NULL, '899448832', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00207', 'ร้าน ก.ไก่ กิจเจริญพานิชย์(1)', NULL, '0643510260/ไลน์', 'สะดวกรับถึง 19.00น.', NULL, 'https://goo.gl/maps/fsDnc29C75PQYXti6', NULL, '17.171331, 102.769043', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00208', 'ร้านค้าชุมชนบ้านโคกข่า หมู่5 (3)', '11 หมู่ที่5 หมู่บ้านโคกข่า ตำบลบ้านโปร่ง อำเภอศรีธาตุ จังหวัดอุดรธานี 41230', '840162582', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=16.997522,103.117529', NULL, '16.997773, 103.117486', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00209', 'บัวหยก', NULL, '935579315', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00210', 'ร้านอันดาซาลอนแอนบิวตี้(2)', '10 หมู่ที่10 หมู่บ้านศรีสุข ตำบลท่าลี่ อำเภอกุมภวาปี จังหวัดอุดรธานี 41110', '910599275', 'ไม่เกิน19.00น.', NULL, 'https://goo.gl/maps/nYNRuAevG3GUeW5c6', NULL, '16.961710, 103.076021', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00211', 'วันนา หล้าสา (5)', '116 หมู่ที่19 บ้านสงเปลือย ตำบลเสอเพลอ อำเภอกุมภวาปี จังหวัดอุดรธานี', '986793883', 'ไม่เกิน 19.00', NULL, 'https://goo.gl/maps/Xi883Sjf2Msyu1vw6', NULL, '17.181800, 102.898043', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00212', 'แม่กาน บ้านเสอเพลอ (5)', NULL, '0879551661*ลูกค้าไปก', 'ไม่เกิน 18.00 น.', NULL, 'https://maps.app.goo.gl/8S6G8sqXq4ZWP1Pa8', NULL, '17.201916, 102.882000', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00213', 'ร้าน​ศักดิ์ชัย บ้านเหล่ากล้วย (5)', '161 ​ม.3​ บ้านเหล่ากล้วย​ ต.เสอเพลอ​ อ.กุมภวาปี​ 41370', '0938091388/099712262', 'ไม่เกิน 18.00น', NULL, 'https://goo.gl/maps/ChUJM2SAux8mcTxW7', NULL, '17.220440, 102.862930', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00214', 'ออมทรัพย์ บ้านโพนทอง (5)', NULL, '0653263375(พี่แอ๋ว)', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00215', 'ร้านมาโฮมหมูกะทะ กุมภวาปี (1)', NULL, '0956647387/ไลน์', NULL, NULL, 'https://goo.gl/maps/ig1RmERyy98KfN897', NULL, '17.111619, 103.009936', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00216', 'ฝอยลมห่มรัก รีสอร์ท', 'บ.ทับกุง', '849218603', 'ไม่เกิน 16.00น.', NULL, 'https://goo.gl/maps/MC9HbVeewdJUW7Mg9', NULL, '17.172682, 102.757811', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00217', 'โรงเรียนอนุบาลกุมภวาปี', '215 หมู่15 ตำบลพันดอน อำเภอกุมภวาปี จังหวัดอุดรธานี', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00218', 'ร้านภูฟ้า ทับกุง', NULL, '895719749', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00219', 'ร้านแม่น้อย โนนสะอาด (2)', '12 หมู่ 2 บ้านกระเบื้อง ต.บุ่งแก้ว อ.โนนสะอาด จ.อุดรธานี', '0984803541/หน้าร้าน', 'ไม่เกิน16.00น.', NULL, 'https://maps.app.goo.gl/qJiGZ13vAG3k17Tk7', NULL, '16.994386, 103.012625', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00220', 'ร้านเตปัญคาเฟ่ (1)', '45 หมู่ 6 ต.ห้วยเกิ้ง อ.กุมภวาปี', '0880552428/แอพ', NULL, NULL, 'https://goo.gl/maps/TLDmz92Ae6pJhhzy7', NULL, '17.045722, 102.915149', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00222', 'ร้านธงชัยการค้า', '113 หมู่3 บ.โพธิ์ชัย ต.โพธิ์ศรีสำราญ อ.โนนสะอาด จ.อุดรธานี 41240', '0610616280/089843745', 'ไม่เกิน 17.00น.', NULL, 'https://goo.gl/maps/JUhhRFaKDu6XNnXP6', NULL, '16.986562, 102.826021', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00223', 'ร้าน ส.โพนทองจักสาน(5)', '4 หมู่ 12 บ.โพนทอง ต. อุ่มจาน อ.ประจักษ์ศิลปาคม จ.อุดรธานี', '965341493', 'ไม่เกิน18.00น.', NULL, 'https://goo.gl/maps/NrZx7L68H6wmVh6a8', NULL, '17.240546, 103.065011', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00224', 'นางกันยารัตน์ ศรีรัตน์ (ดอกกระถินฟ้าพาณิชย์)', '172 หมู่ที่2 ตำบลคำตากล้า อำเภอคำตากล้า จังหวัดสกลนคร', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00225', 'ร้าน ช.ชฎา (5)', '181 หมู่ที่12 ตำบลเชียงแหว อำเภอกุมภวาปี จังหวัดอุดรธานี 41110', '817990317', 'ไม่เกิน 18.00น', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00226', 'บริษัท ที เค ซุปเปอร์สโตร์ จำกัด', 'เลขที่ 789/5 ม.7 ต.หมูม่น อ.เมือง จ.อุดรธานี 41000', '932894294', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00227', 'คุณอภิชดา สุวรรณพรม (ร้านน้องเปยย์การค้า)', '265 หมู่ที่1 ตำบลโคกกว้าง อำเภอบุ่งคล้า จังหวัดบึงกาฬ 38000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00228', 'มัชเรศน์ (น้องเฟริสเก่า) (2)', 'เลขที่ 90 หมู่ที่ 5 บ้านท่าสัง ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี 41110', '973066154', 'ไม่เกิน 19.00 น.', NULL, 'https://maps.app.goo.gl/2J185bZqo6TbmYDU7', NULL, '17.045942, 103.028674', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00229', 'ร้านสมชาย คำค้อ 3(3)', NULL, '982096593', NULL, NULL, 'https://goo.gl/maps/kV1ttBcjKZqfPM8P9', NULL, '17.134935, 103.318011', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00230', 'ร้าน ป.เจริญทรัพย์ (3)', '136 หมู่ 13 ต.แชแล อ.กุมภวาปี จ.อุดรธานี 41110', '927843167', 'ไม่เกิน16.00น.', NULL, 'https://maps.app.goo.gl/MnXTrTEiaZriHwLB7', NULL, '17.153806, 103.046350', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00232', 'แม่จันทร์เพ็ญ', '215/7 บ้านเหล่าหมากบ้า ต. แชแล', '811293958', NULL, NULL, 'https://maps.app.goo.gl/wNZ1xW2fRLWp2mtc6', NULL, '17.159991, 103.057709', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00233', 'ร้านถูกดี​ซูปเปอร์​ โดย นางสุชาดา อุปมะ (สำนักงานใหญ่ 00000) (3)', '150 หมู่ที่ 5 ตำบลบ้านจีต อำเภอกู่แก้ว จังหวัดอุดรธานี 41130', '0924233867//09487955', NULL, NULL, 'https://goo.gl/maps/y9wmgrVaHG8bAqqp8', NULL, '17.183792, 103.160040', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00234', 'จ๋อมมินิมาร์ท ไชยวาน (3)', 'บ้านหนองหลัก อ.ไชยวาน', '829605866', 'ไม่เกิน 19.00น.', NULL, 'https://goo.gl/maps/F9YzpWT5qjGDSXRu6', NULL, '17.24709,103.20687', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00236', 'โรงเรียนบ้านตูม', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00237', 'โรงเรียนบ้านตูม', 'หมู่ที่2 ตำบลตูมใต้ อำเภอกุมภวาปี จังหวัดอุดรธานี', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00238', 'แม่หนูพร บ.หนองหลัก (3)', 'อ.ไชยวาน', '857482724', 'ไม่เกิน 18.00น', NULL, 'https://goo.gl/maps/4WctJrLVepDU2WZb8', NULL, '17.245161, 103.205032', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00239', 'หจก.อิทธิศักดิ์ เจริญทรัพย์ (สำนักงานใหญ่)', '93/1 ม.10 ต.แวงน่าง อ.เมืองมหาสารคาม จ.มหาสารคาม 44000', '043777919/0637523888', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00240', 'โชคสัมฤทธิ์การค้า(4)', '211 หมู่8 ตำบลหนองหิน อำเภอหนองกุงศรี จังหวัดกาฬสินธุิ์ 46190', '0877741005/082369338', 'ไม่เกิน 19.00น', NULL, NULL, NULL, '16.823411,103.277898', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00242', 'ร้านป้าตื๋อ บ้านหนองแข้ (4)', 'ต.ดงมูล อ.หนองกุงศรี จ.กาฬสินธุิ์ 46220', '0809707015/สั่งเอง', 'ไม่เกิน19.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00243', 'ธ.ธิติศักดิ์ เมืองเก่า', NULL, '887353500', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00244', 'นางนิภา เกษแก้ว', '24 ม.15 ต.เวียงคำ อ.กุมภวาปี จ.อุดรธานี', '872161815', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00245', 'พี่ดวงใจ บ้านยางหล่อ (2.1)', NULL, '933380710', 'ไม่เกิน 18.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00247', 'ห้างหุ้นส่วนจำกัด ป.ซูเปอร์สโตร์', '555 หมู่ที่4 ตำบลวานรนิวาส อำเภอวานรนิวาส จังหวัดสกลนคร 47120', '823284888', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00248', 'ห้างหุ้นส่วนจำกัด วันวิสาข์ เทรดดิ้ง', '81 หมู่ที่13 ตำบลบ้านแพง อำเภอบ้านแพง จังหวัดนครพนม 48140', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00249', 'ท่าลี่พาณิชย์ (2)', 'ใกล้ศาลากลางบ้าน กับตลาดท่าลี่', '833863937', 'ไม่เกิน 20.00น', NULL, 'https://maps.app.goo.gl/xrvqCGwAV9YQ9TZ4A', NULL, '16.962908, 103.075568', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00250', 'แม่สมนึก บ้านดอนแคน', 'หมู่ 12 บ้านดอนแคน ตรงข้ามบ้านกำนันสมชาญ', '0954265033/087937081', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00251', 'โลมา ซุปเปอร์ บ้านตาด-คำแคน(3)', '140 ต.ตาดทอง อ.ศรีธาตุ จ.อุดรธานี', '0809426906/หน้าร้าน', 'ไม่เกิน18.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00252', 'ร้านเจียมภูไท (3)', 'ก่อนถึงร้านป.วสินธุ์ อยู่ตรงข้ามกับโรงเรียน', '885184353', 'ไม่เกิน 20.00น.', NULL, 'https://goo.gl/maps/99hr2evC5J6L6Uhc9', NULL, '17.080810, 103.281979', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00253', 'เกตุการค้า', 'บ.โนนสมบูรณ์ โนนสูง', '819746866', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00254', 'วัดโพธิ์นิมิตร ห้วยเกิ้ง', 'ทางไปโรงบาลห้วยเกิ้ง', '894222728', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00255', 'ตั้งขายดี', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00256', 'ต้าขอนแก่น', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00257', 'ร้านบีม-ครีม (นางจารุณี ตอโย)', '37 หมู่ที่9 ตำบลตูมใต้ อำเภอกุมภวาปี จังหวัดอุดรธานี', '801692007', NULL, NULL, 'https://goo.gl/maps/xAQ5JPZSRmJDjP47A', NULL, '17.069800, 102.958000', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00258', 'ร้านริมปาว (2)', '197 ม.5 บ. ท่าสัง ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี 41110', '625705395', NULL, NULL, 'https://goo.gl/maps/DgB2UPyuR5Gz41Ph7', NULL, '17.046679, 103.032000', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00259', 'ป๋อมแป๋ม การค้า(1)', 'หนองแสง', '0642013024/หน้าร้าน', 'สะดวกรับสินค้าไม่เกิ', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00260', 'ร้านพ่อยุทธนา', 'บ้านเซียงแหว', '801858594', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00261', 'ออฟฟิศ​คนจีน', NULL, '942721095', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00262', 'พ่อลอง บ้านเหล่ากล้วย (5)', NULL, '823766689', NULL, NULL, 'https://goo.gl/maps/eLyNCjFeJSmEAWHd8', NULL, '17.220751, 102.862957', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00263', 'ร้านฉลอง บ.โคกกลาง (5)', NULL, '864792281', 'ไม่เกิน17.00น.', NULL, 'https://maps.app.goo.gl/zhHx8L1McZQeMMzD9', NULL, '17.207261, 102.963989', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00264', 'วิรัตน์ ศรีปะโค (1)', '182 ม.3 บ.เหมือดแอ่ ต.ปะโค อ.กุมภวาปี จ.อุดรธานี', '0999346488/ไลน์', 'ไม่เกิน18.00น.', NULL, 'https://maps.app.goo.gl/WRMWNrNcngFScaMe9', NULL, '17.062905, 102.902596', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00265', 'กุหลาบการค้า บ.โคกสี [ฟลุ๊คการค้าเก่า]', '182 ม.3 บ.โคกสี ต.นาดี อ.หนองแสง จ.อุดรธานี 41340', '0843914672(ปิดร้าน)', 'ไม่เกิน18.00น.', NULL, 'https://goo.gl/maps/QDYvgAdyaR7TZxtW8', NULL, '17.047246, 102.830968', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00266', 'ย.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00267', 'ร้าน มินิช็อป (5.1)', 'ปะโค', '879816399', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00268', 'ทวีคูณ บ.ปะโค (ร้านบรรทม)', 'บ้านปะโค', '0624029554/088961832', NULL, NULL, 'https://goo.gl/maps/qfvcN14PsRbfwBoJ6', NULL, '17.105161, 102.941989', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00269', 'นางสาวสมฤดี วิบูลกุล (สมฤดีการค้า)', '39 หมู่ที่5 บ้านนาเรียง ตำบลตาดทอง อำเภอศรีธาตุ จังหวัดอุดรธานี 41230', '871489668', NULL, NULL, 'https://maps.app.goo.gl/ZD6TxyUsToakYJ9Z8', NULL, '17.031744, 103.071215', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00270', 'ร้าน ส.เจริญการค้า', '226 หมู่บ้านศรีนคร ถนนศรีธาตุ-วังสามหมอ ต.ศรีธาตุ อ.ศรีธาตุ จ.อุดรธานี 41230', '0818712970/ไลน์', NULL, NULL, 'https://goo.gl/maps/Q5RDomS8HpD81AfYA', NULL, '16.973636, 103.228006', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00271', 'นุ้ย ห้วยเกิ้ง (1)', NULL, '832055107', 'ไม่เกิน 16.00น.', NULL, 'https://goo.gl/maps/1ZMCXHBvPV2na2Zw7', NULL, '17.042482, 102.927000', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00272', 'แม่แพง (5.1)', 'บ.ดงน้อย', '989983866', 'ปิดร้าน 18.30 น.', NULL, 'https://goo.gl/maps/F1FAM5nXsuDHgysm9', NULL, '17.017900, 102.891957', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00273', 'นภัทรพาณิชย์ บ.ทับล้อ (5.1)', 'บ.ทับล้อต.ปะโค', '895088305', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00274', 'บัวมงคล', '372หมู่3บ.เหมือดแอด ต.ปะโค อ.กุมภวาปี จ.อุดรธานี', '867828261', 'ไม่เกิน18.00น.', NULL, 'https://goo.gl/maps/uqdghf9qF9wm1RXx8', NULL, '17.063648, 102.900515', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00275', 'คุณพัชรี', 'หน้าตึกอุบัติเหตุ รพ.โนนสะอาด', '817173131', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00276', 'ยุวรี สงวนนาม (คำเมย) (3)', 'บ.คำเมย', '915844465', 'ไม่เกิน 19.00น', NULL, 'https://goo.gl/maps/vJNGVPX3CbifWM4Y7', NULL, '17.082368, 103.284179', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00277', 'ร้านซุปเปอร์บิ๊ก สาขาท่าคันโท (4)', '330 หมู่ 1 ต.นาตาล อ.ท่าคันโท จ.กาฬสินธุ์ 46190', '821580967', '16.00-17.00น.', NULL, 'https://goo.gl/maps/z8abZKsqZZd8imqK9', NULL, '16.936990, 103.240968', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00278', 'พ่อโย่ง', NULL, '650893797', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00279', 'ใหญ่การค้า บ.ดงน้อย (1)', NULL, '986575516', 'ไม่เกิน 19.00น.', NULL, 'https://goo.gl/maps/suaGW4t2auqPgnMZ8', NULL, '17.020589, 102.890979', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00280', 'นัวระเบิด', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00281', 'กองทุนหมู่บ้านหนองกุงทอง (1)', '28 ม.8 ต.หนองกุงศรี อ.โนนสะอาด จ.อุดรธานี 41240', '955768749', NULL, NULL, 'https://goo.gl/maps/fzHfaNBuat67xYFu9', NULL, '17.021431,102.798688', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00282', 'ส.บัวพา มินิมาร์ท บ.หินฮาว(3)', NULL, '0844629625/ไลน์', 'ไม่เกิน 19.00น', NULL, 'https://goo.gl/maps/SSGfvJgVU8yD8C778', NULL, '17.104431, 103.079054', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00283', 'แม่สมบูรณ์ คำไผ่', NULL, '982411767', NULL, NULL, 'https://maps.app.goo.gl/TUgcKVxsr3ym7cu79?g_st=ic', NULL, '17.102985, 103.131208', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00284', 'แชมป์มินิมาร์ท บ.โคกใหญ่', 'เลขที่ 88 หมู่ 6 ต.กุงเก่า อ.ท่าคันโท จ.กาฬสินธุ์ 46190', '935461566', 'ไม่เกิน20.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00285', 'พิมพ์ใจ บ.โนนน้ำย้อย (3)', 'ตำบล แชแล อำเภอกุมภวาปี อุดรธานี 41110', '844208557', 'ไม่เกิน 18.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00286', 'ปวเรศวร์ ปราบมาลัย (ร่วมมิตรการค้า) (1)', '269 ม.1 บ.กุดจิก ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี 41110', '0624356359/082016264', 'รับสินค้าเองหน้าร้าน', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00287', 'วงเดือนการค้า บ้านโนนเห็น(3)', NULL, '930834939', 'ไม่เกิน 19.00น', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00288', 'บีมบีม', '127 หมู่ 1 บ้านนาฝาย ต.นาดี อ.หนองแสง จ.อุดรธานี', '887557919', NULL, NULL, 'https://goo.gl/maps/w3PSX4HMRWuv4nJu6', NULL, '17.086867, 102.853010', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00289', 'พี่โดโด้ ตลาดศรีธาตุ', NULL, '879355824', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00290', 'ร้านน้องอั่งเปา บ.นาฝาย', NULL, '973323029', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00291', 'ร้าน ต้นทอง บ.โนนเห็น(3)', NULL, '896017695', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00292', 'แม่จู บ.โนนสวรรค์(3)', NULL, '847924571', 'ไม่เกิน18.00น.', NULL, 'https://goo.gl/maps/bg6G4MELkgYJZ1XY7', NULL, '16.987610, 103.156000', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00293', 'คอนโดการค้า', 'บ้านเลขที่ 6 ม.2 บ.เสอเพลอ ต.เสอเพลอ อ.กุมภวาปี', '985345899', 'ไม่เกิน 19.00น', NULL, 'https://goo.gl/maps/GaV1JTNomkjVqwUr8', NULL, '17.203002, 102.881011', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00294', 'พันยา ภายไทยสงค์((แม่พัน บ.นาดี)', '171 หมู่ที่8 ตำบลนาดี อำเภอหนองแสง จังหวัดอุดรธานี 41340', '862251675', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.07132611683051,102.85659827291965', NULL, '17.071567, 102.856598', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00295', 'แม่ลำดวน บ้านเดี่ยว (1.1)', '50 ม.3 บ้านเดี่ยว ต.เสอเพลอ อ.กุมภวาปี 41370', '985985538', NULL, NULL, 'https://goo.gl/maps/j4VLF8zcpk5VHXit8', NULL, '17.222160, 102.861783', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00296', 'แม่ประยงค์ (1)', NULL, '807509817', 'ไม่เกิน 19.00น.', NULL, 'https://goo.gl/maps/iU4Kz9LmYMifNwG77', NULL, '17.087567, 102.855021', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00297', 'น้องเติ้ล แสงสว่าง (6.4)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00298', 'แม่เขียว นาเหล่า (6.2)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00299', 'แม่สำลี บ้านหนองโก (2)', NULL, '833999488', 'ไม่เกิน 19.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00300', 'พ่อลือชัย อินทร์เรืองศรี', '72 ม.2 บ.กระเบื้อง ต.บุ่งแก้ว อ.โนนสะอาด จ.อุดรธานี 41240', '811845270', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00301', 'พี่ป้อม บ.นางาม ต.ตาดทอง', NULL, '999275818', 'ไม่เกิน20.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00302', 'บ้านเหลืองศิลาการค้า (1)', '181 หมู่ที่2 ตำบลห้วยเกิ้ง อำเภอกุมภวาปี จังหวัดอุดรธานี', '884367662', 'ไม่เกิน 19.00น.', NULL, 'https://goo.gl/maps/9rixS4gDphYAfxdC9', NULL, '17.045941, 102.945957', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00303', 'ปริญทองพืชผล (ร้านนุ้ย ท่าคันโทเก่า) (4)', '155 หมู่ 3 ต.กุดจิก อ.ท่าคันโท จ.กาฬสินธุ์', '0848879905/083085389', 'ไม่เกิน 20.00น', NULL, 'https://maps.app.goo.gl/ZHjoZQ1ekp8pP4637', NULL, '16.931547,103.109428', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00305', 'ขวัญข้าว ซุปเปอร์ถูก (4)', '47 ม.9 บ้านโนนศรีสวัสดิ์ ต.ดงมูล อ.หนองกรุงศรี จ.กาฬสินธุ์ 46220', NULL, 'ไม่เกิน18.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00306', 'ร้าน บ้านน้อง (ป้าหนู หนองแสง)', NULL, '610342938', 'ไม่เกิน 22.00น.', NULL, 'https://goo.gl/maps/REX4EH5FYDGkwK6e7', NULL, '17.169620, 102.778946', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00308', 'แม่สอน บ้านเหล่าเชียงสม (2.1)', NULL, '614360429', 'ไม่เกิน 18.00น', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00309', 'ร้าน ตามสั่งกินอิ่ม บ้านดอนเงิน', '178 ม.12  บ้านดอนเงิน  ต.แชแนล อ.กุมภวาปี จ.อุดรธานี 41110', '810539949', NULL, NULL, NULL, NULL, '17.132232, 103.037611', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00311', 'ลำไพการค้า', '25 หมู่ที่3 บ้านโพธิ์ชัย ตำบลโพธิ์ศรีสำราญ อำเภอโนนสะอาด จังหวัดอุดรธานี', '885729460', NULL, NULL, 'https://maps.app.goo.gl/WU9Ao5ycxuPWhMfh6', NULL, '16.985294, 102.826196', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00312', 'ร้าน ปิยะพงค์ (2)', '367หมู่ 1 ต.บุ่งแก้ว อ.โนนสะอาด จ.อุดรธานี', '980870279', 'ไม่เกิน19.00น.', NULL, 'https://goo.gl/maps/H67jy1VqLrieWwWv5', NULL, '16.971271, 102.961267', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00313', 'พี่แจ็ค บ.โนนน้ำย้อย (3)', NULL, '934617511', 'ไม่เกิน 17.00น', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00314', 'แม่บี้ บ้านโนนเห็น', NULL, '981872028', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00315', 'สุพัฒน์การค้า บ.หนองแวงใหญ่', NULL, '883129659', 'ไม่เกิน 19.00 น', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00316', 'ร้าน วิสาหกิจชุมชน สะดวกซื้อ บ.โคกสว่าง ต.สีออ(2)', NULL, '801524942', '080-1524942', NULL, 'https://goo.gl/maps/JrY5NPMi3yPtH7ar7', NULL, '16.995572, 103.048064', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00317', 'ร้าน น้องเนย บ้านปอ', NULL, '621057809', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00318', 'ร้าน สุขใจ (4)', 'ต.กุดจิก อ.ท่าคันโท 46190', '933260642', 'ไม่เกิน18.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00319', 'ปิ่นคอฟฟี่ชา', 'บ.ผือ', '834905952', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00320', 'น้องยูโร การค้า (นายวีระพงษ์ กันหาลา) (1)', '272 ม.6 บ.ห้วยกองสี ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี 41110', '882657640', NULL, NULL, 'https://goo.gl/maps/Wxgmv939AozS5aQc6', NULL, '17.076244, 102.934290', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00321', 'ลินดาค้าเจริญทรัพย์', '338 ม.3 บ.เหมือดแอ่ ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '842792675', NULL, NULL, 'https://goo.gl/maps/MBscKeHGC2pgip646', NULL, '17.062341, 102.906000', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00322', 'ทับทิมทองการเกษตร (ร้านทับทิมทอง)', 'เลขที่ 71 หมู่ 8 ต.นาดี อ.หนองแสง จ.อุดรธานี 41340', '933537015', 'ไม่เกิน 18.00น', NULL, 'https://maps.app.goo.gl/5n6MSydnvzA62Ays5', NULL, '17.072759, 102.856810', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00323', 'ร้าน ป้อมศรี หมู่.8 กุมภวาปี (1)', NULL, '0810599054/ไลน์', 'สะดวกรับช่วงเช้าก่อน', NULL, 'https://goo.gl/maps/7mnKAaw6QHzNq1jS9', NULL, '17.116294, 103.014840', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00324', 'แพรวไพลิน', NULL, '933736424', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00325', 'เจ้นารี บ.กุงเก่า (4)', NULL, '0849341301// 0872971', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/aoqCgeznsCfAhKq16', NULL, '16.912137, 103.173288', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00326', 'พี่แอน บ.เชียงแหว', 'อยู่หน้าวัดนอก', '935154063', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00327', 'ร้านคุณเน็ต ท่าคันโท (4)', NULL, '945023117', 'ไม่เกิน 19.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00328', 'ร้านตอง1 บ้านโพธิ์สง่า (1)', NULL, '0877713889/หน้าร้าน', 'ไม่เกิน 18.00น', NULL, 'https://goo.gl/maps/VLnP6eLPSR4KcDtv5', NULL, '17.097841, 103.006444', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00329', 'นาย เด่งทรางชาย ประเสิฐสุข [ ร้านเด่นการค้า ]', '84 ม.4 บ.บุ่งหมากลาน ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '936178390', NULL, NULL, 'httphttps://maps.app.goo.gl/2TdGLPgYgSWdesPP8', NULL, '17.069133, 102.887880', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00331', 'หสม.กองทุนพัฒนา หมู่6', 'หมู่ที่6 ตำบลหนองกุงศรี อำเภอโนนสะอาด จังหวัดอุดรธานี', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00332', 'ร้านแม่ระเบียบ ห้วยเกิ้ง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00333', 'ร้านชัยณรงค์ อ.ไชยวาน', 'อ.ไชยวาน จ.อุดรธานี', NULL, NULL, NULL, 'https://goo.gl/maps/DeHJVXXi2AdTh9jt9', NULL, '17.294158, 103.223879', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00335', 'ร้านอี้เหวิน เมืองใหม่-กุมภวาปี', NULL, '810721442', NULL, NULL, 'https://goo.gl/maps/sDUJq9aBK9suDsba8', NULL, '17.111347, 103.013334', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00336', 'โชคประสิทธิ์', 'บ้าน คำไผ่ บ้านเลขที่ 116 หมู่ 7 ต.เวียงคำ อ.กุมภวาปี จ.อุดรธานี', '833289031', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00337', 'ป.ศรีสงคราม', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00338', 'ส.อำนวย 99', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00339', 'ห้างหุ้นส่วนจำกัด บีเอส 888 (สำนักงานใหญ่) ยกเลิกใช้', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00340', 'นางสาวสุภาพร ขันทมณี (ป.ซุปเปอร์สโตร์)', '334 หมู่ที่7 ตำบลศรีสงคราม อำเภอศรีสงคราม จังหวัดนครพนม 48150', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00341', 'แม่สิน บ.กุดขอนแก่น(4)', NULL, '872147979', 'ปิดร้าน 1 ทุ่ม', NULL, 'https://goo.gl/maps/dLDzeoxayWnhaYtEA', NULL, '16.943200, 103.187000', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00342', 'น้องอคิณ', '177 หมู่ที่2 บ้านดอนค้อ ตำบลนาม่วง อำเภอประจักษ์ จังหวัดอุดรธานี', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00343', 'โบสบาย (ยุ่งบายทะเก่า) (1)', 'บ้านนาฝาย อ.หนองแสง', '810554009', 'ร้านปิด2ทุ่ม', NULL, 'https://goo.gl/maps/RpDKV64BoPC1i2WQ8', NULL, '17.086241, 102.855979', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00344', 'ร้าน วารุณี', NULL, '956090102', 'รับเองหน้าร้าน 12.00', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00345', 'ญาตาวี การเกษตร', NULL, '981312046', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00346', 'อารายา', NULL, '834630904', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00347', 'แม่รุน สร้างแก้ว', NULL, '640589288', 'ไม่เกิน 18.00น', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00348', 'วนิดา', NULL, '879545154', NULL, NULL, NULL, NULL, '17.109705, 103.015504', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00349', 'คูณทรัพย์', '122/7 ต.พังงู อ.หนองหาน', '652650250', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00350', 'คูณทรัพย์', 'บ.เรืองชัย อ.หนองหาน', '836296215', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00351', 'ร้าน สนองการค้า บ้านคำบอน', 'หน้าศาลากลางบ้านคำบอน อ.หนองแสง', '621577453', 'ไม่เกิน20.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00352', 'ร้านภูถูกแสง (4)', 'บ.โนนศรีสวัสดิ์ ต.ดงมูล อ.หนองกุงศรี จ.กาฬสินธุ์', '0832836017/ไลน์สั่งเ', 'ไม่เกิน 19.00น.', NULL, 'https://goo.gl/maps/kC2Q9QxWuEV4pnfB9', NULL, '16.780749, 103.353957', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00353', 'ไอดี บ.ดงมูล', 'หนองกุงศรี จ.กาฬสินธุ์', '821044353', 'ไม่เกิน 17.00น', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00354', 'สมจิตรการค้า', '162 ม.6 ต.บ้านโปร่ง อ.ศรีธาตุ', '080-0604119', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00355', 'ร้าน จ.กิจรุ่งเรือง(2)', '7 ม.1 ต.สีออ อ.กุมภวาปี จ.อุดรธานี 41110', '0908430106/065019844', 'ไม่เกิน18.00น.', NULL, 'https://goo.gl/maps/8iS9R7tLywt3HfYu7', NULL, '16.999603, 103.053011', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00356', 'แม่แดง พ่อพล บ.คำล่อง คุ้มวัดจอมทอง', 'บ้านคำล่อง ต.ท่าลี่', '826958997', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00357', 'พี่หนิง วังสามหมอ', NULL, '850111028', 'ไม่เกิน18.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00358', 'แม่สมควร อดทน', '11/13 บ.บุ่งแก้ว', '615574280', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00360', 'ร้านยายไก่ (ร้านขายข้าวมันไก่)(1)', 'ร้านอยู่แถวร้านพี่สำลี อยู่ตรงข้าวตู้ ATM', '0624946336/หน้าร้าน', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00361', 'ร้านเยาวลักษณ์', NULL, '934529608', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00362', 'ร้านวิชัยบริการ บ.ภูฮัง(4)', NULL, '0960147990 / ไลน์', 'ไม่เกิน17.00น.', NULL, 'https://goo.gl/maps/MbD882TijqVDLyVU8', NULL, '16.81218, 103.284968', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00363', 'ร้านธรรมบำบัด', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00364', 'ร้านค้า อิ่มใจ(3)', '114 ม.2 ต.วังสามหมอ อ.วังสามหมอ จ.อุดรธานี 41280', '963273783', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00365', 'ร้าน ใหม่ บ.เกิ้ง', 'หนองกุงศรี จ.กาฬสินธุ์', '855263714', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00366', 'นายอดุลย์ แสงวงษ์ (โทนริมทุ่ง)', '235 ม.3 ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี', '807769899', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00367', 'บริษัท ซี.เอส.เค. เบเวอร์เรจ (2011) จำกัด', '88/8 หมู่ที่ 10 ต.เมืองเก่า อ.เมือง จ.ขอนแก่น 40000', '883406888', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00368', 'แม่เรียง', '36 ม.4 บ.ทมนางาม ต.ทมนางาม อ.โนนสะอาด', '933799795', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00369', 'แฮปปี้โฮม (วัสดุก่อสร้าง)', 'เยื้องปั้ม พีที นาแบก', '859258122', 'ไม่เกิน 18.00 น.', NULL, 'https://goo.gl/maps/MjZPHi8pFhGpphJN7', NULL, '17.117630, 103.028054', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00370', 'อาภาพร [ให้พี่สาวขายแทน]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00371', 'มาร์คสโตร์ บ้านตูมใต้ (1)', NULL, '0626196196/ไลน์สั่งเ', 'ไม่เกิน 15.00น.', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00372', 'ร้าน ต้นหลิว', 'บ้านเชียงกรม ต.นาม่วง อ.ประจักษ์ศิลปาคม จ.อุดรธานี', '812604052', 'ไม่เกิน 18.00น.', NULL, NULL, NULL, '17.285611, 102.961067', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00373', 'พี่เอส อุดร', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00374', 'พี่เล้งกระนวน', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00375', 'หจก.ขวัญใจการเกษตร(สำนักงานใหญ่)', '27 ม.17 ต.เวียงคำ อ.กุมภวาปี จ.อุดรธานี 41110', '951865246', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00376', 'ครูน้อย บ.เกิ้ง', NULL, '855263714', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00377', 'ร้านพันดอน', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00378', 'ร้านอาหารตำนานเพลง', '292 ม.15 ถ.พิศาลสารกิจ ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '820501215', NULL, NULL, 'https://goo.gl/maps/pbRKtyQZB5Rdj4S88', NULL, '17.139357, 102.957660', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00379', 'ร้านแม่อำพร บ.เชียงแหว', 'อยู่ข้างตลาดสด บ.เชียวแหว', '801858594', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00380', 'โกดังเงิน (ร้านโชคสมหวัง สมคำ) (3)', 'บ้านเลขที่ 235 ม.5 ต.แชแล อ.กุมภวาปี จ.อุดรธานี 41110', '832359638', NULL, NULL, 'https://goo.gl/maps/V71rBGP9epbe8ytB7', NULL, '17.1702,103.067', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00381', 'ร้านอ๋อมแอ๋ม', '115 หมู่5 บ้านโคกสว่าง ต.หนองแสง อ.หนองแสง จ.อุดรธานี', '612560986', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00382', 'ตัว อ.อ้วน', '173/1 บ.ดงน้อย ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '959313047', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00383', 'ร้านพี่เอ๋ บ.โนนยอ (1)', 'บ.โนนยอ ต.บลหนองหว้า อ.กุมภวาปี จังหวัดอุดรธานี', '832823329', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00384', 'ร้านปอป้อ ศรีธาตุ (3)', NULL, '641690900', NULL, NULL, 'https://goo.gl/maps/TBwCu1Z8RdMzNEhh8', NULL, '16.974172, 103.216044', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00385', 'น้องขิม ไชยวาน', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00386', 'แม่ทองสุข (1)', 'บ้าน เกิ้งน้อย', '860742706', NULL, NULL, 'https://goo.gl/maps/EPJbp7pbnbFF21ys5', NULL, '17.030150, 102.908021', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00387', 'ร้านค้าประชารัฐบ้านหัวฝาย', '351 ม.3 ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี', '917493272', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00389', 'ท่าลี่ซุปเปอร์ถูก(2)', '71 ม.4 บ.ท่าลี่ ต.ท่าลี่ อ.กุมภวาปี จ.อุดรธานี 41110', '0941173057/หน้าร้าน', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00391', 'ร้านประคองการช่าง (นางปราณี ถอ่งตะคุ ห้อง309 A )', 'โรงแรม เค.พี', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00392', 'พีชแอนพีร์ มินิมาร์ท(3)', '157/10 บ.คำแคน ต.ดอนสาย อ.กู่แก้ว จ.อุดรธานี 41130', '644929799', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00393', 'ร้านแม่สลัด บ้านเชียงแหว(5)', NULL, '856345747', NULL, NULL, 'https://goo.gl/maps/einQ1fhCViQK2dmu6', NULL, '17.179482, 103.001979', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00394', 'ร้านทองย้อย แสนสัมฤทธิ์ (4)', 'เลขที่ 6/3 หมู่ 6 บ.โนนสำราญ ต.ท่าคันโท จ.กาฬสินธุ์ 46190', '963957131', NULL, NULL, 'https://goo.gl/maps/9UbgmikXYa8BQLA86', NULL, '16.939682, 103.216021', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00395', 'โชคชัยเฟอร์นิเจอร์', NULL, '624356916', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00396', 'แม่นวลจันทร์ ตรงข้ามกับร้านอ้อยใจ (4)', 'บ.นาเหล่า', '933703879', NULL, NULL, 'https://goo.gl/maps/GeD8MyWbvo1WQsGD8', NULL, '17.055908, 102.786011', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00397', 'ครัวบ้านสวน (ตรงข้ามร้านไพบูลย์มินิมาร์ท)(5)', '171 หมู่1 บ.ห้วยสามพาด ต.ห้วยสามพาด อ.ประจักษ์ จ.อุดรธานี', '630383114', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00398', 'อุทุมพร', 'บ.โคกสว่าง อ.หนองแสง', '933606347', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00399', 'วรรณภา', '93 ม.7 บ.ค้อน้อย ต.ทมนางาม อ.โนนสะอาด จ.อุดรธานี', '970765560', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00400', 'ร้านค้าพ่อใหญ่จ่าจิตตร', '179 ม.4 บ.ตูมเหนือ ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี 41110', '0953726414/แอพ', NULL, NULL, 'https://goo.gl/maps/MV87PBnEkeFxNQKV7', NULL, '17.093269, 102.976989', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00401', 'บริษัท แสงทรัพย์ โลจิสติคส์ จำกัด', '45 ม.5 ต.แกใหญ่ อ.เมืองสุรินทร์ จ.สุรินทร์ 32000', '44558801', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00402', 'กระต่ายไก่สด', 'บ.นาดี ต.ผาสุข', '847625794', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00403', 'นางสาวสีหา กาญจะนะสอน (ร้านเฮียทองผักสด) (4)', '380/1 ตำบลนาตาล อำเภอท่าคันโท จังหวัดกาฬสินธุ์ 46190', '945231735', NULL, NULL, 'https://goo.gl/maps/n5EnSr4sS6dW4wJk9', NULL, '16.937564, 103.240611', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00405', 'ร้าน หนึ่ง&นัส', '13/8 บ.โนนเขวา ต.สีออ อ.กุมภวาปี จ.อุดรธานี 41110', '832571374', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00406', 'ร้อยแก้ว อำศรีนวล', '125/10 บ.โนนศรีสมพร ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี', '614686477', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00407', 'เอ็มเอ็มช็อป (2)', 'หมู่บ้านท่าลี่ ตำบลท่าลี่ อำเภอกุมภวาปี จังหวัดอุดรธานี', '832651424', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00408', 'ร้านสรอรรถ ท่าสี', 'ปั้มน้ำมัน ก่อนถึงร้านแม่สี ท่าสี', '883243606', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00410', 'ร้านกรณ์ชวัลอุปกรณ์การยาง', '230 หมู่ที่4 ตำบลทับกุง อำเภอหนองแสง จังหวัดอุดรธานี', '858213564', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00411', 'ร้านอยู่เย็น', 'ที่อยู่ 138 หมู่ 3 บ้านปะโค ต.ปะโค อ.กุมภวาปี จ.อุดรธานี', '934304095', NULL, NULL, 'https://maps.app.goo.gl/csQykJR8RniWHCbw6', NULL, '17.057766, 102.920000', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00412', 'ร้านค้าชุมชนบ้านจีต', '23 ม.2 บ้านจีต ต.จีต อ.กู่แก้ว จ.อุดรธานี', '928519932', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00413', 'ร้าน อาร์พี', 'เลขที่ 274 ม.3 บ.ดอนม่วง ต.นาม่วง อ.ประจักษ์ศิลปาคม จ.อุดรธานี', '927199779', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00414', 'โซนัว ครัวคันนา', '136 ม.8 ต.โนนสมบูรณ์ อ.เขาสวนกวาง จ.ขอนแก่น 40280', '0661094553 (ลูกค้ามา', NULL, NULL, 'https://maps.app.goo.gl/6RvBGYjcdbMZ5toL6', NULL, '17.023211, 102.739009', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00415', 'ป.ถูก ซูเปอร์สโตร์ 7898', 'บ้านเลขที่ 15 หมูุ่10 ต.ทุ่งคลอง อ.คำม่วง จ.กาฬสินธุ์ 46180', '094-2924299', NULL, NULL, 'https://goo.gl/maps/Sr6gRKhjJ2kFr4p19', NULL, '16.928244, 103.636101', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00416', 'ร้านบัวแดงคาเฟ่ บ้านเดียม', 'ร้านตั้งอยู่ที่ท่าเรือ จุดที่คนรอลงเรือ', '0883099181/083339452', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00417', 'กิจเจริญการค้า(2)', '103 ม.1ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี', '660728448', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00418', 'บริษัท ซีบีเอ็น ปิโตรเลี่ยม จำกัด', '89/16 หมู่ 5 ซอยบ้านดงอุดม ตำบลหมากแข้ง อำเภอเมือง จังหวัดอุดรธานี 41000', '934108998', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00419', 'ร้าน ป.ศิริการค้า(3)', 'ที่อยู่ 289 หมู่ 4 บ้านเหล่าใหญ่ ต.แชแล อ.กุมภาปี จ.อุดรธานี', '0878525114/ไลน์', NULL, NULL, 'https://goo.gl/maps/rkK3u9Cm6cfZ1qHf8', NULL, '17.175131, 103.080957', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00420', 'นางนวลศรี คำวิเศษ (3)', '57 บ.ป่าหวาย ม.4 ต.ตาลทอง อ.ศรีธาตุ จ.อุดรธานี 41230', '625213352', NULL, NULL, 'https://maps.app.goo.gl/E6qPuEbNxskMDhzt8', NULL, '17.024515,103.091018', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00421', 'ร้านอาร์พี นาม่วง', NULL, '927199779', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00422', 'ร้านแอมฟาพาณิชย์ [ปภาวริน สกุลวงธานี]', '85 หมู่ 1 ต.แสงสว่าง อ.หนองแสง จ.อุดรธานี 41340', '805708182', NULL, NULL, 'https://goo.gl/maps/bpFUTC84P8qkymuKA', NULL, '17.122146, 102.825532', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00423', 'ร้านเกษรการค้า(3)', '164 หมู่ที่ 7 บ.กุดดอกคำ ต.ตาดทอง อ.ศรีธาตุ จ.อุดรธานี 41230', '090-9122288', NULL, NULL, 'https://maps.app.goo.gl/pnVzQYUej1DJm9p96', NULL, '17.029137, 103.060024', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00424', 'ห้างหุ้นส่วนจำกัด ข.ไข่ มินิมาร์ท', '625 หมู่7 ถ.นิกรสำราญ ต.หนองโก อ.กระนวน จ.ขอนแก่น 40170', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00425', 'ห้างหุ้นส่วน บุญกอง กรุ๊ป จำกัด', '323/2 บ.เหมือดแอ๋ ม.3 ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '0953710482/094429511', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00426', 'สุนิสา หนองโก', NULL, '9617962', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00429', 'ร้านสุนทรี ตูมใต้', 'ทางไป อบต. ตูมใต้ (ทางทุ่งนา)', '890034267', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00430', 'อุ๊ วังสะพุง', NULL, '649677502', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00431', 'หมูแป๊ะสีออ', 'ติดถนนหลัก ก่อนเข้า บ้านสีออ', '650891756', NULL, NULL, 'https://maps.app.goo.gl/iCKVJxXVpQAxvtBs9', NULL, '17.010466, 103.052482', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00432', 'ตี้', 'อยู่ใกล้ รร.พันดอนวิทยาสหกรณ์', '610321625', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00433', 'โรงเรียนบ้านกงพาน', '105 หมู่ 8 บ้านกงพาน ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '655896971', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00434', 'ร้านรักษาผลการค้า (ต.ตี้)', '789 ถ.ลาดพร้าว แขวงจอมพล เขตจตุจักร กทม.', '0826123869/ไลน์', NULL, NULL, 'https://goo.gl/maps/eAuJQkmaSmELPGJf8', NULL, '17.072537, 103.355509', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00435', 'ร้านบูมบูม ทวีทรัพย์ (นส.นุชจรีย์ พละแสน)', '124 ม.5 ต.หนองแสง อ.หนองแสง จ.อุดรธานี 41340', '989271099', NULL, NULL, 'https://goo.gl/maps/6fMkgTh1JtCFNGfZ7', NULL, '17.187990, 102.841698', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00436', 'น.ส.จารุวรรณ แสนแก้ว(2)', 'เลขที่43 ม.1 ต.สีออ อ.กุมภวาปี จ.อุดรธานี 41110', '930864026', NULL, NULL, 'https://maps.app.goo.gl/Pc9yT45QKAcQv6zK6', NULL, '16.998087,103.05338', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00437', 'พี่หนุ่ม', NULL, '984950171', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00438', 'คุณเพ็ญแข (1)', 'กุมภวาปี', '894190125', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00439', 'บริษัท ศรีมั่งมี จำกัด(1)', 'เลขที่ 99 หมู่ 1 ตำบลหนองแสง อำเภอหนองแสง จังหวัดอุดรธานี 41340', '0647437229/ไลน์', NULL, NULL, 'https://maps.app.goo.gl/i7wmEhWXpRRzTj8c7', NULL, '17.140590, 102.857195', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00440', 'ร้านบ้านสวน(3)', 'ตำบลบ้านโปร่ง อำเภออำเภอศรีธาตุ จังหวัดอุดรธานี', '934352651', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00442', 'ร้านแม่นิจ ท่าเรือบ้านเดียม', 'ท่าเรือบ้านเดียม (บัวแดงคอฟฟี่)', '0833394520 *ปิดชั่วค', NULL, NULL, 'https://goo.gl/maps/Y4opD6pJQgZSrNeZ8', NULL, '17.212761, 103.034021', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00443', 'โรงเรียนบ้านหมากบ้าเลาโคกกลาง', 'หมู่ 3 ต.เชียงแหว อ.กุมภวาปี จ.อุดรธานี 41110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00444', 'วาสิตา มินิมาร์ท(2)', 'เลขที่ 71 ม.3 หมู่บ้านท่าม่วง ต.เวียงคำ อ.กุมภวาปี จ.อุดรธานี 41110', '803373834', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00445', 'สมร การค้า(2)', 'เลขที่ 121 หมู่ 10 หมู่บ้านศรีสุข ต.ท่าลี่ อ.กุมภวาปี จ. อุดรธานี 41110', '981503698', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00446', 'พี่องุ่นโค้ก', NULL, '0887389688/088890438', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00447', 'นางสาวนิ่มนวล เหลืองอร่าม', '144/7 ต.ตาดทอง อ. ศรีธาตุ จ. อุดรธานี ต.ตาดทอง อ.ศรีธาตุ จ.อุดรธานี 41230', '930098243', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00448', 'นส.นงลักษณ์ อินทร์อ่อน(4)', '248 บ้านหนองแข้ ต.ดงมูล อำเภอหนองกรุงศรี จ.กาฬสินธุ์', '0909653320/ไลน์', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00449', 'บริษัท ตั้งธนสิน จำกัด ( สำนักงานใหญ่ )', 'เลขที่ 36 ถนนรังสิต-ปทุมธานี ต.ประชาธิปัตย์ อ.ธัญบุรี จ.ปทุมธานี 12130', '295813559', '02-958-1360', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00450', 'ก๋วยเตี๋ยวนิวสตาร์ (สี่แยกหมอจักรวาล) (1)', NULL, '0924944698/ไลน์', NULL, NULL, 'https://goo.gl/maps/YFGPSuvSm15TxxA5A', NULL, '17.108599, 103.015875', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00451', 'ตระกูลชัย ออโตพลัส (เมืองเก่า)', NULL, '616971321', NULL, NULL, 'https://goo.gl/maps/FzABuhGr2L9CgCaq7', NULL, '17.130482, 102.960230', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00452', 'แม่น้อย ปะโค', '99 หมู่ 1 บ้านปะโค อ.กุมภวาปี จ.อุดรธานี', '943826382', NULL, NULL, 'https://goo.gl/maps/EGzfBDgAWpnnYMWM8', NULL, '17.108345, 102.941789', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00453', 'สหกรณ์โรงเรียนบ้านเหล่าหมากจันทร์(2)', 'โรงเรียนเหล่าหมากจันทร์คำล่องประชานุกูล ต.ท่าลี่ อ.กุมภวาปี จ.อุดรธานี', '801796240', NULL, NULL, 'https://goo.gl/maps/hCdri9ncYZigziXy9', NULL, '16.922210, 103.040979', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00454', 'มหาวิทยาลัยราชภัฏอุดรธานี', '64 ถนนทหาร ต.หมากแข้ง อ.เมืองอุดรธานี จ.อุดรธานี 41000', NULL, NULL, NULL, 'https://goo.gl/maps/E8Aqxy2pStGD3vaV8', NULL, '17.397671, 102.794308', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00455', 'นส.วราภรณ์ ชาญนรา (บ้านเชียงแหว)', '73 หมู่ 11 ต.เชียงแหว อ.กุมภวาปี จ.อุดรธานี', '962870839', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00456', 'บริษัท น้ำตาลกุมภวาปี จำกัด (สาขาที่ 00001)', 'เลขที่ 73 หมู่ที่ 11 ถนนโพนทอง ตำบลกุมภวาปี อำเภอกุมภวาปี จังหวัดอุดรธานี 41110', '982309274', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00457', 'ห้างหุ้นส่วนจำกัด ถูก ซูเปอร์สโตร9999', 'เลขที่ 285 หมู่ 3 ตำบลบ้านผือ อำเภอบ้านผือ จังหวัดอุดรธานี 41160', '626639535', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00458', 'จ่าพร', 'บ้านโนนมะข่า', '0807373159จ่าพร', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00459', 'บริษัท เงินติดล้อ จำกัด ( มหาชน ) สำนักงานใหญ่', '428 อาคารอารีย์ ฮิลล์ ชั้น 9-15 ถนนพหลโยธิน ต.สามเสนใน อ.เขตพญาไท จ.กรุงเทพมหานคร 10400', '27921888', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00460', 'แม่บุญคอง ปะโค', '125 ม.16 บ้านปะโค ต.ปะโค อ.กุมภวาปี จ.อุดรธานี', '653261751', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00461', 'บริษัท ดีเคพี เอ็นจิเนียริ่ง ( 2556 ) จำกัด', '137/10 หมู่ 21 ถ.นิมิตใหม่ ต.ลำลูกกา อ.ลำลูกกา จ.ปทุมธานี 12150', '29930686', '02-993-0409', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00462', 'ร้านกรณ์ชวัลอุปกรณ์การยางพารา', '123 หมู่ 4 ต.ทับกุง อ.หนองแสง จ.อุดรธานี', '858213564', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00463', 'กู่แก้วเครื่องเขียน', '490 หมู่7 ต.บ้านจีต อ.กู่แก้ว จ.อุดรธานี', '959798089', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00464', 'พ่อสุภาพ บ้านปอ', '259 ม.6 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี', '621592714', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00465', 'เก๋กู๊ดช้อป', 'เลขที่167 ม.6 บ.ห้วยกองสี ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี 41110', '628565426', NULL, NULL, 'https://goo.gl/maps/bkuVyZeFSPLgACmd6', NULL, '17.077492, 102.933395', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00466', 'หจก.จิตไพศาล ซุุปเปอร์สโตร์ 999', 'เลขที่ 193 หมู่ 7 ต.พรเจริญ อ.พรเจริญ จ.บึงกาฬ 38180', '910641735', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00467', 'แม่สมร บ้านท่าม่วง', 'บ้านท่าม่วง ตำบลเวียงคำ', '924233856', NULL, NULL, 'https://maps.app.goo.gl/TJTjckuEGMRFx7HC9', NULL, '17.076107, 103.027880', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00468', 'ตาน้อย บ้านป่ากุง', 'ต.ห้วยเกิ้ง อ.กุมภวาปี จ.อุดรธานี', '872330845', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00');
INSERT INTO `store` (`store_id`, `store_name`, `store_address`, `telephone_number`, `fax_number`, `email`, `url`, `customer_delivery_time`, `store_location`, `created_at`, `open_time`, `close_time`) VALUES
('OR-00469', 'ร้านสุรีย์พร (3)', 'เลขที่ 41 หมู่ 1 ต.บ้านโปร่ง อ.ศรีธาตุ จ.อุดรธานี', '807429350', NULL, NULL, 'https://goo.gl/maps/anUpRB7vXcPWgo5AA', NULL, '17.013651, 103.115968', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00470', 'โอรส สวรรค์', '240 ม.6 ต.เวียงคำ อ.กุมภวาปี จ.อุดรธานี', '649185059', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00471', 'เอสพี หมูสด-ไก่สด', '192/2 หมู่ที่ 2 ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี 41240', '811810745', NULL, NULL, 'https://goo.gl/maps/VMbbQiyR1UhaxM3t6', NULL, '16.976478, 102.894861', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00472', 'น้องออโต้ บ.เมืองปัง(5)', 'เลขที่ 146 หมู่ 3 บ้านเมืองปัง ต.อุ่มจาน อ.ประจักศิลปาคม จ.อุดรธานี', '858619273', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00473', 'แม่นก บ้านเมืองพรึก (นางกองกาญจน์ พันพินิจ)', 'เลขที่ 61 หมู่ที่ 3 ต.แชแล อ.กุมภวาปี จ.อุดรธานี', '887405441', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00474', 'แม่อั๋น บ้านดอนสวรรค์ (นางยมนา ลาภชน)', 'เลขที่ 55 หมู่ 7 บ้านดอนสวรรค์ ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี', '870469418', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00475', 'นางสาวอรณี พิมวาปี (ร้าน 69 เจริญทรัพย์) (1)', '69/8 บ.โนนสิมมา ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี 41110', '0849028027แอพ+ไลน์', NULL, NULL, 'https://goo.gl/maps/XH6izCbUrswugXYt7', NULL, '17.069431, 102.954000', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00476', 'ร้านโพศรี', 'บ้านหัวฝาย ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี', '810532016', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00477', 'ร้านแม่อิ๋ง บ้านพันดอน', '154 หมู่ 7 บ้านพันดอน ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '8723332020', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00478', 'โรงเรียนบ้านเหล่าแชแลหนองแวง', '97 หมู่ 1 ต.แชแล อ.กุมภวาปี จ.อุดรธานี', '807474848', NULL, NULL, 'https://goo.gl/maps/Z5Q81us9eJNVDTtn9', NULL, '17.176025, 103.073488', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00479', 'ร้านไทย พิน การค้า', '62/3 บ.หมากบ้า ต.เชียงแแหว อ.กุมภวาปี จ.อุดรธานี', '971497659', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00480', 'บริษัท จัดหางาน เจพีเอ โกลบอล จำกัด ( สำนักงานใหญ่ )', 'เลขที่287 อาคารลิเบอร์ตี้สแควร์ ชั้นที่ 10 ห้องเลขที่ 1004B ถนนสีลม ต.สีลม อ.เขตบางรัก จ.กรุงเทพมหานคร 10500', '20204134', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00481', 'รำไพ สุขรมย์ (ศรีธาตุ)', NULL, '855968845', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00482', 'ร้านจูเนียร์ มาร์เก็ต', 'เลขที่ 178 หมู่ 10 บ้านหนองบัวเงิน ต.หนองไผ่ อ.เมือง จ.อุดรธานี 41330', '817992127', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00484', 'เจแอนด์บี บ.หนองหว้า (1)', '32 หมู่ 7 บ.หนองหว้า ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี', '820415682', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00485', 'ร้านเดอะซันหมูกะทะ บ้านหนองกวาง', '53 หมู่ 4 บ้านหนองกวาง ต.สีออ อ.กุมภวาปี จ.อุดรธานี', '823246551', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00486', 'พิทักษ์ การค้า', '194 ม.11 บ.ดงแคน ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '651120081', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00487', 'ร้านรุ่ง มินิมาร์ท(3)', '125 ม.3 ต.หัวนาคำ อ.ศรีธาตุ จ.อุดรธานี 41230', '639014367', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00488', 'ร้านพิกุล บ.เหมือดแอ (นส.กุล โคตรวงศ์)', 'เลขที่ 7 หมู่ 3 บ้านเหมือดแอ ต.ปะโค อ.กุมภวาปี จ.อุดรธานี', '811579389', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00489', 'ร้านตาแดง พาณิชย์', '49 ม.3 บ.กุดขนวน ต.บุ่งแก้ว อ.โนนสะอาด 41240', '628910110', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00491', 'โรงเรียนบ้านนาฝาย', '223 หมู่2 ต.นาดี อ.หนองแสง จ.อุดรธานี 41340', '801997331', NULL, NULL, 'https://maps.app.goo.gl/yYLfqXVBTcFJj4LG7', NULL, '17.080584,102.859592', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-00492', 'สุปราณีการค้า (2)', '169 ม.9 ต.ท่าลี่ อ.กุมภวาปี จ.อุดรธานี', '886021435', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00495', 'บริษัท เคแพค อินเตอร์เทรด จำกัด', '156 หมู่ที่ 5 ถ. มิตรภาพ ต.สำราญ อ.เมืองขอนแก่น จ.ขอนแก่น 40000', '43393666', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00496', 'หจก เอิ้อปัญญา', '179 หมู่ 4 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00498', 'ยกเลิก', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00499', 'เอื้องฟ้า พาณิชย์', '162 ม.1 บ.แสงสว่าง ต.แสงสว่าง อ.หนองแสง จ.อุดรธานี 41340', '981433138', NULL, NULL, 'https://maps.app.goo.gl/Y7W9csnn7PWHBwJUA', NULL, '17.116531, 102.826936', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00500', 'ร้านทวีคูณ บ้านกู่แก้ว', '459 หมู่ 7 บ.กู่แก้ว ต.บ้านจีต อ.กู่แก้ว อ.กู่แก้ว จ.อุดรธานี 41130', '850106643', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00501', 'นายก้องกาศ ชินเกษร (บ้านม่วงสีสมพร)', '39 หมู่ 9 บ้านม่วงสีสมพร ต.โพธิ์ศรีสำราญ อ.โนนสะอาด จ.อุดรธานี 41240', '806391191', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00502', 'ร้านแม่เล็ก บ้านหินลาด', '25 ม.9 ต.โคกกลาง อ.โนนสะอาด จ.อุดรธานี', '0652943089//06124209', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00503', 'ร้านกุ่งกิ้ง (นิภา เกษแก้ว) โปงคอม', 'เลขที่ 24 หมู่ 15 ต.เวียงคำ', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00504', 'นวลจันทร์ (แม่นุช) ต.หนองกุงศรี', 'เลขที่ 15 ม.10 ต.หนองกุงศรี อ.โนนสะอาด จ.อุดรธานี', '989628665', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00505', 'ร้านแชมป์การค้า (4)', 'เลขที่ 88 หมู่ 6 ต.กุงเก่า อ.ท่าคันโท จ.กาฬสินธุ์ 46190', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00506', 'ร้านตุ๊กตา ตลาดสดกุมภวาปี', NULL, '801840616', NULL, NULL, 'https://goo.gl/maps/NjTKGagQNj7aa9Jn8', NULL, '17.11081, 103.015', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00507', 'วาสนา กนกกาญจนานนท์ บ้านโคกสี', '229 ม.3 บ้านโคกสี ต.นาดี อ.หนองแสง จ.อุดรธานี', '649468319', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00508', 'ร้านป็อปอาย (1)', '91 ม.8 ต.ห้วยเกิ้ง อ.กุมภวาปี', '979351380', NULL, NULL, 'https://goo.gl/maps/Awjo6bwcRG2sF3Lt9', NULL, '17.048522, 102.922952', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00509', 'พ่อสมยศ บ้านดงน้อย', 'ต.ปะโค อ.กุมภวาปี จ.อุดรธานี', '849561137', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00510', 'ฉัตรชัยการค้า (4) ทคท', '183 หมู่ 6 บ้านโคกกลาง ต.ดงมูล อ.หนองกุงศรี จ.กาฬสินธุ์', '0895435898/065252388', NULL, NULL, 'https://goo.gl/maps/NgqioyCWHyUQPMCw5', NULL, '16.786749, 103.295660', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00511', 'พี่แก้ว บ้านทับกุง (1)', '356 ม.11 บ้านทับกุง ต.ทับกุง อ.หนองแสง จ.อุดรธานี 41340 (หลังวัดรัตนศรีบุญเรืองบ้านทับกุงม.11)', '644568827', NULL, NULL, 'https://maps.app.goo.gl/VPuZWDG2teRPHxhz5', NULL, '17.170702, 102.771718', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00512', 'อุบลพาณิชย์ บ้านศรีสวัส', '47 หมู่ 8 บ้านศรีสวัส ต.โพธิ์ศรีสำราญ อ.โนนสะอาด จ.อุดรธานี', '821044410', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00513', 'นายเทิดศักดิ์ โพธิ์สิม', '410 หมู่ที่ 1 ต.ทมนางาม อ.โนนสะอาด จ.อุดรธานี 41240', '870604931', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00514', 'คุณนภา/วัดป่าปิยธรรม', 'วัดป่าปิยธรรม', '945361625', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00515', 'ยอยุ้ย กวดวิชา', '329 บ้านพันดอน ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '9914556290655250000', NULL, NULL, 'https://maps.app.goo.gl/NmjCGEnjckfKzmdWA?g_st=il', NULL, '17.135584, 102.944292', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00516', 'ติ๊งหนุ่ย บ้านสงเปลือย', '319 หมู่ 1 บ้านสงเปลือย ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี', '804936108', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00517', 'ขนมดอกจอก(แม่ตุ๋ย)', 'บ้านเชียงแหว', '0930052819//08623348', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00518', 'พี่ต่าย บ้านดอนแคน', NULL, '658846879', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00519', 'แม่สายสมรหมูสด', 'บ.โคกสว่าง ต.สีออ อ.กุมภวาปี จ.อุดรธานี', '0635890485/098221711', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00520', 'เกรียงไกรพาณิชย์', 'บ้านเชียงแหว', '821174149', NULL, NULL, 'https://maps.app.goo.gl/Y5W1PNuLkQYpTWQHA', NULL, '17.170551, 102.982453', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00521', 'ขนมไข่หงส์ พันล้าน ดงเมือง', '418/2 ม.7 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '0647942776/ไลน์', NULL, NULL, 'https://goo.gl/maps/pCWgzQCDGp8oBd8r6', NULL, '17.106882, 103.020000', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00522', 'ออ.ติ้น(ร้านเที่ยง สาขา 2 เก่า)', '50 หมู่ 14 ต.ปะโค อ.กุมภวาปี จ.อุดรธานี', '935488094', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00523', 'ศิริกาญจน์ ชินวงศ์', 'ทะเลบัวแดง', '615566561', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00524', 'แม่อุไรวรรณ', '88/9 บ.บุ่งแก้ว ต.บุ่งแก้ว อ.โนนสะอาด จ.อุดรธานี 41240', '821139458', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00525', 'แม่สมหมาย โนนสิมมา', NULL, '962023541', NULL, NULL, NULL, NULL, '17.070612,102.953703', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00526', 'ร้านน้องเปรี้ยว', 'โรงอาหารลานอ้อย โรงงานน้ำตาลเกษตร', '855908138', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00527', 'บริษัท ธนัทกร อินเตอร์เนชั่นแนล จำกัด', '294/8 ถ.เลียบมอเตอร์เวย์-ร่มเกล้า แขวงคลองสามประเวศ เขตลาดกระบัง กรุงเทพมหานคร 10520', '922735956', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00528', 'ร้านไอเดีย 88 บ้านเมืองงาม แสนสิริ', 'เลขที่ 252/89 บ้านเมืองงาม แสนสิริ (ตรงข้ามปั๊ม PT ใกล้โลตัสใหญ่)', '0639302491/095670108', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00529', 'วราวุธ มิสาโท', NULL, '986271508', NULL, NULL, 'https://maps.app.goo.gl/4T13ZENCr5H2Ynjp6', NULL, '17.070312, 102.887073', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00530', 'ศุภรัตน์การค้า', '501 ม.10 ถ.ยิ้มประสิทธิ์ ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี', '0862234847/ไลน์', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00531', 'ทอมมินิมาร์ท', 'บ.ตูมใต้', '981803369', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00532', 'โรงเรียนบ้านโพธิ์ชัยดอกคำ', 'ม.3 ต.โพธิ์ศรีสำราญ อ.โนนสะอาด จ.อุดรธานี 41240', '982126256', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00533', 'ร้านพีจี นาม่วง (5)', NULL, '0843335356/ไลน์', NULL, NULL, 'https://goo.gl/maps/gnZwoLfNT11gJLpg7', NULL, '17.212631, 102.993979', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00534', 'ฟาร์มฮัก บ.สงเปลือย', 'เลขที่ 337 ม.1 บ้านสงเปลือย อ.กุมภวาปี จ.อุดรธานี', '611309408', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00535', 'รัตดาวรรณพาณิชย์', 'ยูเทิร์นห้วยเกิ้ง', '621506319', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00536', 'ลักขณาการค้า', '134 ม.3 บ.โคกสี ต.นาดี อ.หนองแสง จ.อุดรธานี 41340', '821252699', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00537', 'แม่ลำดวน บ.ห้วยก้องสี', 'เลขที่ 156 หมู่ 6 ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี 41110', '807574316', NULL, NULL, 'https://goo.gl/maps/JcfapbtPeD6GtFwr6', NULL, '17.077250, 102.928980', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00538', 'ก๋วยเตี๋ยวอ้อม(5)', 'บ.โพนทอง ต.อุ่มจาน อ.ประจักษ์ศิลปาคม', '825724522', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00539', 'น้องข้าวปั้น', 'บ.หนองบ่อ 20/1 ม.6 ถ.ไก่เถื่อน-ทุ่งแร่ ต.หมูหม่น อ.เมือง จ.อุดรธานี 41000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00540', 'อั่งเปา อ.ศรีธาตุ (3)', 'เลขที่ 80 ม.1 ต.เวียงคำ บ้านนาแบก อ.กุมภวาปลี จ.อุดรธานี 41110', '986576988', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00541', 'อริสา อาหารสด', 'เลขที่ 206 หมู่ 7 บ้านพันดอน ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '990301318', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00542', 'ร้าน จ.เจริญ ใกล้ลานรับซื้ออ้อยซื้อมัน (2)', 'เลขที่ 20 หมู่ 8 บ้านโนนยอ ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี', '806064735', NULL, NULL, 'https://goo.gl/maps/5USCgbszsofc329A6', NULL, '17.027562, 102.951968', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00543', 'นส.กนกทิพย์ บ้านกุดขอนแก่น', 'เลขที่ 69 ม.9 บ้านกุดขอนแก่น ต.กุงเก่า อ.ท่าคันโท จ.กาฬสินธุ์', '611454100', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00544', 'มงคลน้ำดื่ม บ.ท่าลี่', 'ใกล้ลาดตลาดนัดท่าลี่', '931194528', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00545', 'เจ้น้อย ใกล้กับร้านสุวรรณา', 'ห้วยเกิ้ง', '894200866', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00546', 'แม่เกวริน บ.อุ่มจาน', 'เลขที่ 117/8 ต.อุ่มจาน อ.ประจักษ์ จ.อุดรธานี 41110', '925680719', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00547', 'พี่ดอนลีโอ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00548', 'ร้านรวยคัก บ.หนองม่วง', 'เลขที่ 281 ม.12 บ้านหนองม่วง ต.โคกกลาง อ.โนนสะอาด', '819280698', NULL, NULL, 'https://goo.gl/maps/3FSRGyHcBkHhKhgq9', NULL, '16.943262, 102.941021', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00549', 'ร้าน อนัญญา พานิชย์', '44 ม.11 ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี 41370', '0932780878/ไลน์', NULL, NULL, 'https://maps.app.goo.gl/3GHdfHgYbfoqBLiV6', NULL, '17.254573, 102.817129', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00550', 'ทูวเจ', '17 ม.2 บ.นาฝาย ต.นาดี อ.หนองแสง จ.อุดรธานี 41340', '899441276', NULL, NULL, 'https://goo.gl/maps/8kmsmpb4pgYFLPc4A', NULL, '17.086099, 102.855968', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00551', 'ร้านค้าแม่คอยหนองนกเขียน', '91 ม.1 บ.หนองนกเขียน ต.หนองนกเขียน อ.ศรีธาตุ จ.อุดรธานี 41230', '807433447', NULL, NULL, 'https://goo.gl/maps/m7YiCPdQmZMh1ags9', NULL, '17.005931, 103.285979', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00553', 'ร้านอดุลย์ การค้า', 'เลขที่ 31 หมู่ 6 ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี', '903728050', NULL, NULL, 'https://goo.gl/maps/b1bho55Xt9zm7UVN8', NULL, '16.970910, 102.874957', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00554', 'คุณพอใจแอนด์เซอร์วิส', NULL, '942621888', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00555', 'แม่สงวน บ.ทมนางาม', '150หมู่1 บ.ทมนางาม ต.ทมนางาม อ.โนนสะอาด จ.อุดรธานี 41240', '952603791', NULL, NULL, 'https://goo.gl/maps/p1tndjL56HKhjVq29', NULL, '16.892662, 102.941979', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00556', 'ส.สุชาติ การค้า', '84 ม.5 บ.วังแข้ ต.โนนทองอินทร์ อ.กู่แก้ว จ.อุดรธานี 41130', '970404185', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00557', 'ร้านศิริพรการค้า', '85 ม.16 บ.น้ำฆ้อง ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00558', 'ขวัญข้าวพาณิชย์', NULL, '886695524', NULL, NULL, 'https://goo.gl/maps/WsEwSCVT8EYgNWV76', NULL, '17.277687, 102.985997', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00559', 'คุณวิ (ประตูสีฟ้า ข้าง 7-11 เมืองเก่า)', NULL, '0949139563/081862567', NULL, NULL, 'https://goo.gl/maps/REGBgPaXmVqBSdHb6', NULL, '17.134318, 102.965003', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00560', 'ส่งวัดจันโทประสิทธิ์ อ.ศรีธาตุ ในนามผู้สั่ง คุณเอกภาพ​ ธันวารชร', 'วัดจันโทประสิทธิ์วนาราม​ อ.ศรีธาตุ อำเภอ จ.อุดรธานี 41230', '949879526', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00561', 'กาญจนา บ.ดงสามสิบ', 'บ้านดงสามสิบ ต.เสอเพลอ', '614045994', NULL, NULL, 'https://goo.gl/maps/74nZ486EBdxNAEUd7', NULL, '17.187367, 102.911460', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00562', 'แม่หนึ่ง บ.คำค้อ', 'ต.หัวนาคำ อ.ศรีธาตุ', '989706482', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00564', 'ร้านน้องมีน (พ่อลือชัย ใจสามารถ)', 'เลขที่ 106 บ้านโนนสิมมา ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี', '987530413', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00565', 'ศรีขาว พาณิชย์ (3)', '17/11 บ้านโพธิ์งาม ต.บ้านโปร่ง อ.ศรีธาตุ', '822049101', NULL, NULL, NULL, NULL, '17.013224, 103.118641', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00566', 'นางสุพรรนี บ.นกขะบา', 'ต.เชียงเหว อ.กุมภวาปี จ.อุดรธานี', '818287769', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00567', 'ห้างหุ้นส่วนจำกัด ณัฐฐ์ชุดา การค้า', 'เลขที่ 113/7 ม.7 ต.แม่ปะ ต.แม่สอด จ.ตาก', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00568', 'สามกอมินิมาร์ท', '216/10 ต.เชียงแหว อ.กุมภวาปี จ.อุดรธานี 41110', '0639827245/ไลน์', NULL, NULL, 'https://goo.gl/maps/mYeFb6v5vvCzPANKA', NULL, '17.216531, 103.031979', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00569', 'รุ่งรัตน์การค้า บ.ศรีสว่าง', 'เลขที่ 107 ม.3 ต.สีออ อ.กุมภวาปี จ.อุดรธานี', '848685830', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00570', 'ร้านประสพโชค', 'ต.ศรีธาตุ อ.ศรีธาตุ จ.อุดรธานี 41230', '803553779', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00571', 'เกวลิน บ.ดอนค้อ', 'เลขที่ 167 ม.2 ต.นาม่วง อ.ประจักษ์ จ.อุดรธานี', '841033675', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00572', 'ร้าน ช่างบอย', '285 ม.4 บ.ทับไฮ ต.แสงสว่าง อ.หนองแสง จ.อุดรธานี 41340', '611438463', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00573', 'พี่ปู กงพาน (ปลัด วันไชย)', 'เทศบาลพันดอน', '929498791', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00574', 'หจก.โชค มาร์เก็ตติ้ง (สำนักงานใหญ่)', '265/5 หมู่4 ถนนอุดร-กุดจับ ตำบลบ้านเลื่อม อำเภอเมืองอุดรธานี จังหวัดอุดรธานี 41000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00575', 'พี่ส้ม บ.โนนสำราญ', 'บ้านโนนสำราญ ต.บุ่งแก้ว อ.โนนสะอาด', '0654038503/093391093', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00576', 'นางสังวร ราชโคตร', '102 ม.12 บ.โนนสำราญ ต.บุ่งแก้ว อ.โนนสะอาด จ.อุดรธานี 41240', '933910939', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00577', 'เอ็น ดี2', '68 ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี 41110', '879975957', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.020079035042514,102.94786913627452', NULL, '17.020609, 102.947784', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00578', 'ร้าน ห้วยจันทรา (3)', '258 ม.4 ต.ห้วยเกิ้ง อ.กุมภวาปี จ.อุดรธานี 41110', '817684947', NULL, NULL, 'https://maps.app.goo.gl/b2xKCoyKydw7MkWo6', NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00579', 'ยายทองนาค', NULL, '929794091', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00580', 'บริษัท ทรัพย์อุดม จำกัด', '219 หมู่ 9 ถนนอุดมสามัคคี ตำบลพันดอน อำเภอกุมภวาปี จังหวัดอุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00581', 'แม่กาญ โนนสะอาด', 'บ้านม่วงดง', '0614788182/063105580', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00582', 'พรทิพย์ ดีสร้อย (แม่นางน้อย)', NULL, '811305288', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00583', 'บริษัท ยูโร สปอร์ต แอนด์ มิตรภาพ กรุ๊ป จำกัด', '23 หมู่ที่1 ถ.มิตรภาพอุดร-ขอนแก่น ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี 41240', '42110215', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00584', 'ร้าน อุไร บ.โนนสา', '270 ม.4 บ.โนนสา ต.นาม่วง อุประจักษ์ จ.อุดรธนรี 41110', '983168175', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00585', 'สามสาว', NULL, '980510645', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00586', 'ร้านก้านทอง อ.ท่าคันโท', '188 หมู่1 บ.ท่าคันโท ต.ท่าคันโท อ.ท่าคันโท จ.กาฬสินธุ์ 46190', '825212707', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00587', 'ร้านผึ้ง บ.โคกกลางน้อย', '91 ม.7 บ.โคกกลางน้อย ต.นาดี อ.หนองแสง จ.อุดรธานี 41340', '956193369', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00588', 'ฐิติรัตน์การค้า บ.โคกกลาง (2)', '29 ม.5 บ้านโคกกลาง ต.นาม่วง อ.ประจักษ์ จ.อุดรธานี', '0610313776/ไลน์', NULL, NULL, 'https://maps.app.goo.gl/xBa8pKnxgNVnFHAS9', NULL, '17.209032, 102.961925', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00589', 'ร้าน เจอามาเก็ต', '41 ม.2 ต.หนองกุงศรี อ.โนนสะอาด จ.อุดรธานี 41240', '811718180', NULL, NULL, 'https://goo.gl/maps/QYAQB7B7nFCwjn627', NULL, '17.035921, 102.808989', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00590', 'บริษัท ไฮ-เกียร์ จำกัด', '288/4 ถนนเอกชัย แขวงคลองบางพราน เขตบางบอน กทม.10150', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00591', 'ตาเถียร บ.หนองนกเขียน', '74 ม.1 ต.หนองนกเขียน อ.ศรีธาตุ จ.อุดรธานี', '931768459', NULL, NULL, 'https://goo.gl/maps/8sk2rfPhABcpFU1g8', NULL, '17.007641, 103.287021', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00592', 'ร้านแม่ตุ่น บ้านสี่แจ', NULL, '952790407', NULL, NULL, 'https://maps.app.goo.gl/Ny8uKVYa5CKAyQ14A', NULL, '17.169241,102.929166', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00593', 'กองทุนหมู่บ้านโนนทองคำเจริญ', '76/3 บ.โนนทองคำเจริญ ม.3 ต.หนองกุงศรี อ.โนนสะอาด จ.อุดรธานี 41240', '0983417781/098923807', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00594', 'ร้านค้าสุภาภรณ์รุงเรืองการค้า', '93 ม.8 บ.หนองกุง ต.บงเหนือ อ.สว่างแดนดิน จ.สกลนคร 47110', '985819120', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00596', 'เอ็มเคช๊อป', '71 ม.4 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '829171396', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00597', 'ร้านแม่นาง บ.นางาม', 'เลขที่ 15 ม.11 ต.ตาดทอง อ.ศรีธาตุ จ.อุดรธานี', '812618452', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00598', 'บริษัท พี ที แอนด์ จี จำกัด', '99 /9-10 ม.12 ต.ศรีธาตุ อ.ศรีธาตุ จ.อุดรธานี 41230', '982706096', NULL, NULL, 'https://goo.gl/maps/ZGpCTmT3MbG98pWz5', NULL, '16.984445, 103.185398', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00599', 'จุราพาณิชย์ (ตรงข้ามศาลเจ้าปู่-ย่า เมืองใหม่)', '416/19 ม.9 ถนนจิตประสงค์ ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี', '807381538', NULL, NULL, 'https://goo.gl/maps/PSxjRRzAsbkFqagU8', NULL, '17.112106, 103.019383', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00600', 'เอสเคมินิมิมาร์ท บ.โพธิ์งาม', 'เลขที่ 95/11 บ้านโพธิ์งาน ต.บ้านโปร่ง อ.ศรีธาตุ จ.อุดรธานี', '615817029', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00601', 'ร้านชัชวีร์ (3)', '123 หมู่ 4 ต.หนองกุงทับม้า อ.วังสามหมอ จ.อุดรธานี', '0909975453/064617939', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00602', 'สมพร การค้า', '36 ม.1 ต.เวียงคำ อ.กุมภวาปี จ.อุดรธานี 41110', '984258956', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00603', 'จักรพรรณ ศรีหาเศษ', '326 หมู่ที่5 ต.เรณู อ.เรณูนคร จ.นครพนม 48170 ต.เรณูนคร อ.เรณูนคร จ.นครพนม 48170', '632474947', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00604', 'ดาริกาพาณิชย์', 'ร้านก๋วยเตี๋ยวไก่มะระ บ้านโนนสำราญ', '653636513', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00605', 'บริษัท ส.ล.แลนด์ จำกัด (สาขาที่ 00001)', '122 ม.6 ต.นครสวรรค์ตก อ.เมืองนครสวรรค์ จ.นครสวรรค์ 60000', '568831401', '056-883142', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00606', 'อรนงค์ บ.ป่ากุง', '117/3 บ.ป่ากุง ต.ห้วยเกิ้ง อ.กุมภวาปี จ.อุดรธานี', '931596485', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00607', 'ร้าน บี้', '133 ม.10 บ.เดียม ต.เชียงแหว อ.กุมภวาปี จ.อุดรธานี', '910527769', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00608', 'เจ้น้อย สว่าง', NULL, '885601711', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00609', 'เซลเอฟเอฟ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00610', 'ร้าน ร้านร่ำรวย', '76ม.10 ต.โพธิ์ศรีสำราญ อ.โนนสะอาด จ.อุดรธานี 41240', '810545718', NULL, NULL, 'https://goo.gl/maps/TBspcmzPKH9RVe1g7', NULL, '16.949479, 102.848007', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00611', 'อัมพร พละกุล', '135 ม.13 บ.อุ่มจาน ต.อุ่มจาน อ.ประจักษ์ศิปาคม จ.อุดรธานี 41110', '828418856', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00612', 'โรงเรียนโนนสะอาดพิทยาสรรค์', '422 หมู่ 1 ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี 41240', '616256160', NULL, NULL, 'https://www.google.com/maps/place/Non+Sa-At+Pittayasan+School/@16.9676685,102.8808868,1040m/data=!3m1!1e3!4m6!3m5!1s0x3123014c6859383f:0xaf40267dfb2ba416!8m2!3d16.9676685!4d102.8808975!16s%2Fg%2F1hf2_p6w7!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDUwNi4wIKXMDSoASA', NULL, '16.967858, 102.880876', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00613', 'โรงเรียนเสอเพลอพิทยาคม', 'เลขที่ 1 หมู่ 9 ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี 41370', '930546554', NULL, NULL, 'https://maps.app.goo.gl/wjpjGfbpfgcGEn8e9', NULL, '17.193521, 102.893100', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00614', 'นางลำไพ ลาไป (ร้านแม่ลำไพ อ.กู่แก้ว)', '67 หมู่ 3 บ้านค้อคำ ต.ค้อใหญ่ อ.กู่แก้ว จ.อุดรธานี 41130', '994705559', NULL, NULL, 'https://goo.gl/maps/jejerpxDMfEevMJM8', NULL, '17.209800, 103.144032', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00615', 'ณัฐชนิตา', '248 หมู่ 17 บ้านนาแบก ต.เวียงคำ อ.กุมภวาปี จ.อุดรธานี', '0876634659/ไลน์', NULL, NULL, 'https://goo.gl/maps/KQR9V8V1Dnyyffsx8', NULL, '17.105016, 103.033891', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00616', 'คริสต์จักร์นาเรียง', '37/11 ต.ตาดทอง อ.ศรีธาตุ จ.อุดรธานี', '649980211', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00617', 'สุธีร์ ศรีหล่มสัก', '202 ม.14 บ.หนองศรีเจริญ ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '0868562828/098989325', NULL, NULL, 'https://maps.app.goo.gl/SYyyNnJFrkeixs718', NULL, '17.142841, 102.940011', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00618', 'สหกรณ์โรงเรียนบ้านโคกสว่าง', 'โรงเรียนบ้านโคกสว่าง อำเภอหนองแสง จังหวัดอุดรธานี', 'ครูมุกดา 0891364888', 'สะดวกรับสินค้า วันจั', NULL, 'https://goo.gl/maps/67ifVYnpAJJserTBA', NULL, '17.184441, 102.842957', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00620', 'บริษัท ขอนแก่นค้าส่ง จำกัด', 'ที่อยู่ 88/8 ม.10 ต.เมืองเก่า อ.เมือง จ.ขอนแก่น 40000', '0610248333/061030433', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00621', 'บีม สงคราม', 'บ.เสาเล้า อ.โนนสะอาด', '0982256638/ไลน์สั่งเ', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00622', 'จันทราวดี มหาพรม', '365 หมู่ 15 ตำบลพันดอน อำเภอกุมภวาปี จังหวัดอุดรธานี 41370 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '857561433', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00623', 'ร้าน แม่ประยูร ว่าความดี', '79 หมู่ 4 บ้านวาปี อ.กุมภวาปี ต.กุมภวาปี จ.อุดรธานี', '0937212816/หน้าร้าน', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00624', 'ห้างหุ้นส่วนจำกัด บี เอส 2015 อินเตอร์เนชั่นนอล (สำนักงานใหญ่)', '418 ม.12 ต.แม่กาษา อ.แม่สอด จ.ตาก 63110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00625', 'นุ่มนิ่ม ดงพัฒนา', 'บ.ดงพัฒนา ต.คำเลาะ อ.ไชยวาน', '0808264213/หน้าร้าน', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00626', 'บริษัท เอส เค บี โฮเซล จำกัด', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00627', 'บริษัท ถูกจัง ซุปเปอร์สโตร์ จำกัด(สำนักงานใหญ่)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00628', 'แม่สมบัติ ติดอนามัยบ้านโพนทอง', 'เลขที่ 65 บ.โพนทอง ม.6 อ.ประจักษ์ศิลปาคม จ.อุดรธานี', '879454415', NULL, NULL, 'https://goo.gl/maps/XaEHK9cfsYj7HHrY8', NULL, '17.249719, 103.069640', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00629', 'โรงแรมเคพี', NULL, '857444867', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00630', 'พรทวี ดอนขม', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00631', 'บริษัท เติ้นหยง จำกัด', '63 ม.8 ต.พังโคน อ.พังโคน จ.สกลนคร 47160', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00632', 'บุญเริง', '63/7 แสงสว่าง อ.หนองแสง', '828680063', NULL, NULL, 'https://goo.gl/maps/QtCktC1fcA7Poih49', NULL, '17.124372, 102.824957', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00633', 'อรัญญา พารวย', '40/3 บ้านตูมใต้ ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี 41110', '0982671946/088738924', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00634', 'ร้านอาหารตามสั่ง ข้าง อบต.โคกกลาง', '286 ม.1 ต.โคกกลาง อ.โนนสะอาด จ.อุดรธานี', '637343760', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00635', 'ห้างหุ้นส่วนจำกัด ขอนแก่นไทยยืนยง(2001)', '276 หมู่13 ตำบลพระลับ อำเภอเมือง จ.ขอนแก่น 40000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00636', 'ร้านสร้อยเพชร การค้า', 'เลขที่ 35 หมู่ 1 ตำบลแชแล อ.กุมภวาปี จ.อุดรธานี 41110', '897138160', NULL, NULL, 'https://goo.gl/maps/SeSTYTAZznBgyYDy8', NULL, '17.180031, 103.065989', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00637', 'เจ๊แหม่ม หนองคาย', NULL, '831419553', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00638', 'สบายช็อป บ.โคกกลาง', 'เลขที่ 56 หมู่ 13 ต.โคกกลาง อ.โนนสะอาด จ.อุดรธานี 41240', '926835705', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00639', 'โรงเรียนชุมชนบ้านบุ่งแก้ว', 'ม.9 บ. บุ่งแก้ว ต. บุ่งแก้ว อ.โนนสะอาด', '917476620', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=16.968737,102.946993', NULL, '16.968988, 102.947004', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00640', 'แปะ มาร์ค', NULL, NULL, NULL, NULL, NULL, NULL, '17.129927, 102.965007', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00641', 'ภูเขียวการเกษตร', NULL, '981062627', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00642', 'ร้านอ๊อฟออย', '216 ม.2 บ.กุดอีเฒ่า ต.หัวนาคำ อ.ศรีธาตุ จ.อุดรธานี 41230', '0895747895/แอพ+ไลน์', NULL, NULL, 'https://goo.gl/maps/zP3p9dYh6APZ7V757', NULL, '17.030141, 103.227000', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00643', 'ร้าน แอบแซ่บ ชาบูกิลล์', '465 ม.10 ต.กุมภวาปี จ.อุดรธานี 41110 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '819778994', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00644', 'อุดมทรัพย์ บ.ป่าขาม', 'ต.บ้านตาด อ.เมือง จ.อุดรธานี', '955515299', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00645', 'ธนทรัพย์การค้า', '124 ม. ต.ห้วยสามพาด อ.ประจักษ์ศิลปาคม จ.อุดรธานี 41110', '807816120', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00646', 'พี่บอล', NULL, '973234656', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00647', 'ร้าน จิราภรณ์การค้า', '159 หมู่ 6 บ้านโสกรัง ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี 41240', '0954268029/หน้าร้าน', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00648', 'สุรดา', '137 หมู่9 ต.เสอเผลอ อ.กุมภวาปี จ.อุดรธานี 41370', '943929989', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00649', 'โรงเรียนบ้านโคกสี วังแสง', 'หมู่ 10 ต.นาม่วง อ.ประจักษ์ศิลปาคม จ.อุดรธานี 41110', '934106910', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00650', 'บิวตี้ ค็อฟฟี่', '155 ม.8 ต.ห้วยเกิ้ง อ.กุมภวาปี จ.อุดรธานี 41110', '968699787', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00651', 'โรงเรียนมหาไถ่ศึกษา กว.', NULL, '0917742807คุณณี', NULL, NULL, 'https://goo.gl/maps/LtqQ4ti5qeqWqmTaA', NULL, '17.109165, 103.017020', '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00652', 'แม่กานจนี แก้วใส', '189 ม.12 บ.ม่วงดง ต.โคกกลาง อ.โนนสะอาด จ.อุดรธานี', '0614788182/หน้าร้าน', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00653', 'บริษัท ซิมเปิล แคช ( อุดรธานี ) จำกัด', 'เลขที่ 354/2 หมู่ 11 ตำบล เพ็ญ อำเภอ เพ็ญ จังหวัด อุดรธานี 41150', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00654', 'ร้าน หงษ์เหิร', '266 ม.17 ต.เวียงคำ อ.กุมภวาปี จ.อุดรธานี', '991542529', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00655', 'นางกรรณิกา นามภูมี', '63 หมู่ที่ 12 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '810591855', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00656', 'ป๊อปอาย บ.เชียงแหว', '1 ม.2 บ.เชียงแหว ต.เชียงแหว อ.กุมภวาปี จ.อุดรธานี', '958536766', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00657', 'บริษัท สยามร่วมมิตร จำกัด (สำนักงานใหญ่)', 'เลขที่6/1 ถนนประมวล แขวงสีลม เขตบางรัก กรุงเทพฯ 10500', '22360330', '0-2236-7113', NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00658', 'ไทยฟุดส์', '299 หมู่ 3 ต.แชแล อ.กุมภวาปี จ.อุดรธานี', '0857553688/หน้าร้าน', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:48', '08:00', '17:00'),
('OR-00659', 'คุ้มทรัพย์สโตร์', '140 ม.13 ต.แชแล อ.กุมภวาปี จ.อุดรธานี 41110', '986379599', NULL, NULL, 'https://goo.gl/maps/dswsuMwWSzPmzvEYA', NULL, '17.152959, 103.044979', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00660', 'หจก.รวมเกษตรอุดรธานี', '333 หมู่ 2 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '885613933', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00661', 'ร้านภักดี เจริญทรัพย์', 'เลขที่ 46 ม.2 บ.โสกคูณ ต.ห้วยเกิ้ง อ.กุมภวาปี จ.อุดรธานี 41110', '0885329879/หน้าร้าน', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00662', 'บริษัท เอส เค บี โฮลเซล จำกัด (สำนักงานใหญ่)', '52/40-42 ถนนปทุมสามโคก ต.บางปรอก อ.เมือง จ.ปทุมธานี 12000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00663', 'บริษัท อุดรแสงเจริญ(2001)จำกัด(สนง.ใหญ่)', '251-251/1-2 ถนนประจักษ์ ตำบลหมากแข้ง อำเภอเมือง จังหวัดอุดรธานี 41000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00664', 'บริษัท ปิโตรเลี่ยมไทยคอร์ปอเรชั่น จำกัด ( สาขาที่ 00469 )', '120 หมู่ 14 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '811346169', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00665', 'โรงเรียนบ้านแสงสว่าง', 'หมู่ 7 ต.แสงสว่าง อ.หนองแสง จ.อุดรธานี 41340 ต.แสงสว่าง อ.หนองแสง จ.อุดรธานี 41340', '846830079', NULL, NULL, 'https://goo.gl/maps/W4mKkViN8L1vZDFX9', NULL, '17.125910, 102.822011', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00666', 'ร้าน อุดรรุ่งโรจน์ ตรงข้ามธนาคารกรุงศรี เมืองใหม่', '290-291 ม9 ต กุมภวาปี อ กุมภวาปี จอุดรธานี', '859258122', NULL, NULL, 'https://maps.app.goo.gl/FCzddEcPoCZdXZUc7', NULL, '17.110264, 103.016063', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00667', 'โรงเรียนบ้านตูม', 'หมู่ 2 ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี 41110', '643193434', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00668', 'กอเก้าเจริญทรัพย์', '206 หมู่ 1 บ้านสีออ ต.สีออ อ.กุมภวาปี จ.อุดรธานี', '871130089', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00669', 'โรงเรียนบ้านท่ายม', 'หมู่ 5 ต.แสงสว่าง อ.หนองแสง จ.อุดรธานี 41340', '908935467', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00670', 'พ่อบุญทัน บ.คำกุง', 'เลขที่ 131 ม.4 บ้านคำกุง ต.หัวนาคำ อ.ศรีธาตุ จ.อุดรธานี 41230', '857395264', NULL, NULL, 'https://maps.app.goo.gl/5BP9VK6WxLFTzP2DA', NULL, '17.086967, 103.252269', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00672', 'น.ส. รจนา เพียรเสมอ', '125 หมู่ที่ 4 ต.โนนสมบูรณ์ อ.เขาสวนกวาง จ.ขอนแก่น 40280', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00674', 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านบุ่งหมากลาน', 'หมู่ 17 ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41730', '812603184', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00675', 'กฤตเจริญรุ่งเรือง บ.ม่วงเฒ่า', 'เลขที่ 234 ม.4 บ.ม่วงเฒ่า ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี 41240', '0639254152/ไลน์', NULL, NULL, 'https://goo.gl/maps/8NZ1WPF99HhKNS7w5', NULL, '16.988861, 102.910605', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00676', 'พ่อสมชาย บ้านเมืองปัง (5)', '22 ม.11 ต.อุ่มจาน อ.ประจักษ์ศิลปาคม จ.อุดรธานี 41110', '979859916', NULL, NULL, 'https://goo.gl/maps/7h1zVDGTZeNptzpj9', NULL, '17.221800, 103.079989', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00677', 'โรงเรียนบ้านซำป่ารัง', NULL, '893952656', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00678', 'ทรัพย์สมบูรณ์ พาณิชย์ (ร้านใหม่ นุ้ย ท่าคันโท)', '', '823019515', NULL, NULL, 'https://maps.app.goo.gl/PLkULNWQUiDzZqBVA', NULL, '16.9401,103.213686', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00679', 'ร้านอาหารอีสาน', '74 ม.5 บ.ป่าก้าว ต.โพนสูง อ.ไชยวาน จ.อุดรธานี 41290', '985590067', NULL, NULL, 'https://maps.app.goo.gl/GUBfCygH5rx2N2NdA', NULL, '17.161339, 103.241280', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00680', 'ร้าน แก้วเจริญ', '16 ม.2 บ.โคกสว่าง อ.หนองแสง จ.อุดรธานี', '955078154', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00681', 'น้องใบเฟิร์นช้อป', '93 ม.7 บ.คำล่อง ต.ท่าลี่ อ.กุมภวาปี จ.อุดรธานี 41110', '653044415', NULL, NULL, 'https://maps.app.goo.gl/ioudH1uXJvKZRkAx6', NULL, '16.932553, 103.032375', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00682', 'มีตังค์ มินิมาร์ท', 'เลขที่ 175 บ้านดอนค้อ ต.นาม่วง อ.ประจักษ์', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00683', 'บริษัท แอลเอสดิสทริบิวเตอร์ จำกัด (สำนักงานใหญ่)', '275/19 ม.13 ถ.บ้านหนองมันปลา ต.ธาตุเชิงชุม อ.เมือง จ.สกลนคร 47000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00684', 'บริษัท เหลียงเซ้ง ดิสทริบิวเตอร์ จำกัด (สำนักงานใหญ่)', '72/11-12 หมู่ที่ 7 ต.หนองรี อ.เมืองชลบุรี จ.ชลบุรี', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00685', 'แต๋น ตลาดเช้า', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00686', 'ร้าน แม่ยา บ้านเดียม', '30 ม.10 ต.เชียงแหว อ.กุมภวาปี จ.อุดรธานี 41110', '959050451', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00687', 'พี่แอน บ้านสามเหลี่ยม', '28 ม.4 บ้านสามเหลี่ยม ต.ทับกุง อ.หนองแสง จ.อุดรธานี', '934812926', NULL, NULL, 'https://goo.gl/maps/84UKicjGcsa1Gphw9', NULL, '17.175452, 102.802413', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00688', 'ครูหนุ่ย (เยื้องเซฟพลัส เมืองใหม่)', '75/2 หมู่ที่ 13 ถ.ยิ้มประสิทธิ์ ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี', '834190064', NULL, NULL, 'https://goo.gl/maps/KyNY4e3Tgfv5wsbR9', NULL, '17.109369, 103.015000', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00689', 'แก๊งค์พรีเมี่ยมปิ้งย่างเกาหลี', '196/1 ม.1 ต.กุมภวาปี จ.อุดรธานี', '823088998', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00690', 'แม่เอื้อง บ.เชียงแหว', 'บ.เชียงแหว', '885197895', NULL, NULL, 'https://goo.gl/maps/6w4fdTATJ4cmngE76', NULL, '17.178478, 102.999789', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00691', 'โรงเรียนบ้านเมืองปัง', 'หมู่ 1 บ้านดอนกลาง ต.อุ่มจาน อ.ประจักษ์ศิลปาคม จ.อุดรธานี 41110', '872340810', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00692', 'ร้านเอ็มพาณิชย์', '229 ม.11 บ.หนองแซง อ.ท่าคันโท จ.กาฬสินธุ์', '0946657024/061032639', NULL, NULL, 'https://goo.gl/maps/zkp4tsJihkXBwbyN8', NULL, '16.863007, 103.265819', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00693', 'แม่สมจิตร บ้านปะโค', '52 หมู่ 15 บ้านปะโค ต.ปะโค อ.กุมภวาปี จ.อุดรธานี', '821023071', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00694', 'สำราญทรัพย์ การค้า', '', '835346826', NULL, NULL, 'https://maps.app.goo.gl/o5oMhQXqTBqU9eeh9', NULL, '16.931679,103.031709', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00695', 'โรงเรียนบ้านโพนทอง', '205 หมู่ 5 ต.อุ่มจาน อ.ประจักษ์ศิลปาคม จ.อุดรธานี 41110', '933283963', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00696', 'โรงเรียนพรหมนิมิตศักษา', '133 ม.5 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '891753549', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00697', 'ร้านสุพรรณี บ.เหมือดแอ', 'บ้านเหมือดแอ ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '986566844', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00698', 'ร้านกาญจนา บ.นางาม', 'เลขที่ 73 หมู่ 6 บ้านนางาม ต.นาดี อ.หนองแสง จ.อุดรธานี', '622819408', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00699', 'ปรีชยาคาร์แคร์ แอน มินิมาร์ท', '351 ม.7 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '0878291537/098931346', NULL, NULL, 'https://maps.app.goo.gl/CWcpyxU7SnnhXxBL6', NULL, '17.156407, 102.975710', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00700', 'น้องน็อต บ.ท่าม่วง', 'เลขที่ 58 หมู่ 3 ต.เวียงคำ อ.กุมภวาปี จ.อุดรธานี', '903486995', NULL, NULL, 'https://goo.gl/maps/JD123dygStEXqfi56', NULL, '17.075451,103.03', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00701', 'ร้านพรพระคุณ', '91 ม.1 บ.นาฝาย ต.นาดี อ.หนองแสง จ.อุดรธานี 41340', '979803211', NULL, NULL, 'https://goo.gl/maps/siiYA8wEf32pSxTb9', NULL, '17.087631, 102.853000', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00702', 'อัจฉราภรณ์ การค้า', '183 ม.1 บ.ทับกุง ต.ทับกุง อ.หนองแสง จ.อุดรธานี 41340', '895139393', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00703', 'เจ้นี อาหารตามสั่ง', '252/55 ม.1 บ้านเมืองงามแสนสิริ', '632609340', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00704', 'ร้านรุ่งเจริญทรัพย์', '185 หมู่ 19 บ้านสงเปลือย ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี 41370', '967684227', NULL, NULL, NULL, NULL, '17.190969, 102.885372', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00705', 'ร้านสุวิทย์การค้า', '121 หมู่ 3 บ้านโคกศรี ต.นาดี อ.หนองแสง จ.อุดรธานี 41340', '935197822', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00706', 'ร้านพรพอเพียง', 'เลขที่ 13 หมู่ 10 บ้านหนองเหี้ย ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี', '936814959', NULL, NULL, 'https://goo.gl/maps/12DnvCFztrJQEt1z6', NULL, '17.020080, 102.948946', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00707', 'ร้านตุ๋ย โนนสะอาด', '130 หมู่ 12 ต.บุ่งแก้ว อ.โนนสะอาด จ.อุดรธานี', '957733800', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00708', 'ยายน้องมีตังค์ ใกล้ ร้านโอ-หน่อย บ้านหลังสีเขียวมีรูปไก่หน้าบ้าน', '308 หมู่ 11 บ้านนาเหล่า อ.โนนสะอาด ต.หนองกุงศรี', '984683194', NULL, NULL, 'https://maps.app.goo.gl/rFQg6jxqkBgJxhFc9', NULL, '17.063832, 102.786989', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00709', 'ร้าน ปกาศิต', 'เลขที่ 64 ม.3 บ.กุดขนวน ต.บุ่งแก้ว อ.โนนสะอาด จ.อุดรธานี 41240', '934710102', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00710', 'ร้านกองทุนบ้านป่าไม้ ม.9', 'บ.ป่าไม้ ต.หนองกุงศรี จ.อุดรธานี', '650640056', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00711', 'ร้าน ชานมไข่มุก', 'บ.กุดจิก ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี', '0610910171(พี่หลินปิ', NULL, NULL, 'https://goo.gl/maps/G6tB27zoJBLck3727', NULL, '17.037321, 102.963936', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00712', 'ร้านพรชัย', NULL, NULL, NULL, NULL, 'https://maps.app.goo.gl/NBZWrithZBektPf97', NULL, '17.021063, 103.001755', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00713', 'ร้านช้อนทอง', '121 หมู่ 8 ต.วังสามหมอ อ.วังสามหมอ จ.อุดรธานี 41280', '955942989', NULL, NULL, 'https://goo.gl/maps/gUCofdS4iP9s2Nd88', NULL, '16.980820, 103.433675', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00714', 'ปลาวาฬมินิมาร์ท', 'เลขที่ 276 ม.6 บ้านหนองแซง ต.นาตาล อ.ท่าคันโท จ.กาฬสินธุ์', '982732161', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00715', 'ร้าน ศิรินภา ทับธานี', '67 ม.7 ต.ตาลทอง อ.ศรีธาตุ จ.อุดรธานี 41230', '857395300', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00716', 'ทนงเจริญทรัพย์', 'สหการ โรงเรียน บ้านเมืองปัง ต.อุ่มจาน อ. ประจักษ์ จ.อุดรธานี', '870427949', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00717', 'ร้าน กองทุนหมู่8', '16 ม.8 บ.หนองกุงทอง ต.หนองกุงสรี อ.โนนสะอาด จ.อุดรธานี', '957095909', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00718', 'ร้าน เต็กปิงรุ่งเรืองการค้า', '85 ม.9 บ.สงเปลือย ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี', '984950171', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.18064897062728,102.90045473724604', NULL, '17.180941, 102.900508', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00719', 'ร้าน เจนจิรา พรมใจ', '56 ม.11 ต.แม่กุ อ.แม่สอด จ.ตาก 63110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00720', 'ร้าน แม่เสถียน เหล่านุกูล', 'ข้างโรงงานน้ำตาลเกษตรผล', '883175474', NULL, NULL, 'https://goo.gl/maps/RnbGpF5pEkXwSkw96', NULL, '17.076835, 102.927158', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00721', 'ร้าน Mg cha', '56 หมู่ 2 บ.แสงสว่าง ต.แสงสว่าง อ.หนองแสง จ.อุดรธานี 41340', '983318146', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00722', 'ร้านแม่หมี', '274 หมู่ที่ 2 บ้านเชียงแหว ต.เชียงแหว อ.กุมภวาปี จ.อุดรธานี 41110', '959310493', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00723', 'เวียงชัย ตลาดสดกุมภวาปี เมืองใหม่', 'ตลาดสดกุมภวาปี โซน 2 ตลาดเช้า ร้านขายส่ง', '990675591', NULL, NULL, 'https://goo.gl/maps/ZJXLjosJisvVyucV6', NULL, '17.110794, 103.014882', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00724', 'ร้านพู่กัน-มีคุณ', 'เลขที่ 186 ม.4 บ้านโนนสา ต.นาม่วง อ.ประจักษ์ จ.อุดรธานี', '884239194', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00725', 'กฤษณาการค้า', 'บ้านดอนค้อ ต.นาม่วง อ.ประจักษ์ จ.อุดรธานี', '933920609', NULL, NULL, 'https://goo.gl/maps/9J9ByHU6scRRfHaj7', NULL, '17.253920, 103.009064', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00726', 'ร้านคุณแอน วิรัญดา', '32/8 บ.นาฮี ต.นายูง อ.ศรีธาตุ จ.อุดรธานี 41230', '641249048', NULL, NULL, 'https://maps.app.goo.gl/5sD9rzPzmye6xC799', NULL, '16.986768, 103.262055', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00727', 'ธนพรรุ่งเรืองทรัพย์', 'เลขที่ 139 หมู่ 13 บ้านอุ่มจาน ต.อุ่มจาน อ.ประจักษ์ จ.อุดรธานี', '652942767', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00728', 'โรงเรียนบ้านสงเปลือยดงสามสิบ', 'หมุ่1 ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี 41370', '807401779', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00729', 'โรงเรียนนานกชุมวิทยาดม', 'ตำบลบะยาว อำเภอวังสามหมอ จังหวัดอุดรธานี 41280', '806265924', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00730', 'โรงเรียนบ้านม่วงคอนสาย', 'หมู่3 ต.คอนสาย อ.กู่แก้ว จ.อุดรธานี 41130', '821346369', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00731', 'ร้านนมเขา ดงเมือง (ตรงข้าม L ก ฮ.)', 'เลขที่ 12 ม.1 ถ.เชาวลิต ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี', '0866437415/062140071', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00732', 'Miss Khin Moe Win', 'No.17, Padommar Street , Sanchaung Tsp , Yangon .', '959892951096', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00733', 'วีรณดา ลภัสพุฒิธาดา', '16/1 ม.9 ต.แม่ตืน อ.ลี้ จ.ลำพูน 51110', '983649495', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00734', 'บริษัท โอตานิ เรเดียล จำกัด', '96 ม.3 ถ.ริมคลองบ้านไร่ ต.บางแก้ว อ.นครชัยศรี จ.นครปฐม 73120', '343242447', '343229445', NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00735', 'โชติรส ไอเลร์ทเซ่น', '87 หมู่ 4 บ้านป่าหวาย ต.ตาดทอง อ.ศรีธาตุ จ.อุดรธานี 41230', '934727467', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00736', 'ก๋วยเตี๋ยวไก่ บ้านหนองแวง ม.6', 'บ้านหนองแวง ม.6 หน้าโรงเรียนบ้านหนองแวง', '994852109', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00737', 'ครูปุ๊กกี้', 'บ้านเลขที่ 139 หมู่ 1 ถนนแชแล เมืองใหม่', '866300710', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00738', 'แม่กิมเฮียง น้ำฆ้อง', '33/1 ม.16 บ.น้ำฆ้อง ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00739', 'ห้างหุ้นส่วนจำกัด มุลาอิ (สำนักงานใหญ่)', '418 ม.12 ต.แม่กาษา อ.แม่สอด จ.ตาก 63110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00740', 'แม่ร้อย บ้านวังสามหมอ', '131 ม.6 บ้านวังสามหมอ ต.บะยาว อ.วังสามหมอ จ.อุดรธานี', '982052800', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00741', 'ร้าน ราตรี พาณิชย์', '87 ม.4 ต.โนนสมบูรณ์ อ.เขาสวนกวาง จ.ขอนแก่น 40280', '933823526', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00742', 'ร้าน ลลิตา สาลีกุล', '142 ม.10 บ.อุ่มจาน ต.อุ่นจาน อ.ประจักษ์ศิลปคม จ.อุดรธานี 41110', '985586047', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00743', 'มหาวิทยาลัยราชภัฎอุดรธานี', '64 ถ.ทหาร ต.หมากแข้ง อ.เมือง จ.อุดรธานี 41000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00744', 'ร้านเจ้แมว(เวศMT)', '142 หมู่ 7 บ้านแสงสว่าง ต.แสงสว่าง อ.หนองแสง จ.อุดรธานี 41340', '837873688', NULL, NULL, 'https://goo.gl/maps/KpKz3qjAFjR9Riw76', NULL, '17.123200, 102.823445', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00745', 'ร้าน ขนมจีน หนองแวงใหญ่', 'บ้านหนองแวงใหญ่ บ้านเดียวกันกับพี่เดือน', '973099765', NULL, NULL, 'https://goo.gl/maps/UxiEup6KjzXTWSXi9', NULL, '17.174972, 103.069903', '2026-07-23 11:48:49', '08:00', '17:00');
INSERT INTO `store` (`store_id`, `store_name`, `store_address`, `telephone_number`, `fax_number`, `email`, `url`, `customer_delivery_time`, `store_location`, `created_at`, `open_time`, `close_time`) VALUES
('OR-00746', 'ศูนย์สาธิตการตลาดบ้านโคกสว่าง', 'ม.2 ต.สีออ อ.กุมภวาปี จ.อุดรธานี 41110', '807955579', NULL, NULL, 'https://goo.gl/maps/gAEdqrbz4vuW8Mvd9', NULL, '16.995685,103.050345', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00747', 'นายพจนาท นัตธิลม (ร้าน พีทูเอ เซฟมาร์)', '99 /9-10 ม.12 ต.ศรีธาตุ อ.ศรีธาตุ จ.อุดรธานี 41230', '982706096', NULL, NULL, NULL, NULL, '16.980945, 103.186090', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00748', 'เปงฮะเฮง', NULL, '895751855', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00749', 'นาย รณชัย เชิญชม', '599/23 ม.10 ต.บ้านจั่น อ.เมืองอุดรธานี จ.อุดรธานี', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00750', 'ร้านลุงหนุ่ม หน้าโรงเรียนมหาไถ่ กว.', 'หน้าโรงเรียนมหาไถ่ กว. อ.กุมภวาปี จ.อุดรธานี', '834175032', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00751', 'ปลายนา มินิมาร์ท', 'เลขที่ 125 ม.4 บ้านโนนเจริญ ต.โนนสมบูรณ์ อ.เขาสวนกวาง จ.ขอนแก่น', '8004698156', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00752', 'วราภรณ์ จันทะโพธิ์', '4 ม.18 บ.ท่าหนองเทา ต.เวียงคำ อ.กุมภวาปี 41110', '630462464', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00753', 'อ.เจริญพาณิชย์', 'เลขที่ 127/1 ม.4 ต.เชียงแหว อ.กุมภวาปี จ.อุดรธานี 41110', '872270105', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00754', 'ร้านธีระทรัพย์', '293 ม.3 บ.นานกชุม ต.บะยาว อ.วังสามหมอ จ.อุดรธานี', '802719039', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00755', 'ร้านทนงค์การค้า บ.เมืองปัง', NULL, '870427949', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00756', 'บจก. คูทวีกรุ๊ป[1994]', '88/2 ม.8 ต.หมูม่น อ.เมือง จ.อุดรธานี 41000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00757', 'คุณเปิ้ล', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00758', 'ร้าน เฮงอิหลี', 'บ้านวาปี เลขที่ 310 หมู่ที่ 4 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '812522534', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00759', 'ร้าน วุฒิชัย', '77 ม.9 ต.เสอเพอ', '928382918', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00760', 'ร้านปรายฟ้า', '51 ม.2 บ.ดงเรือง ต.ผาสุก อ.กุมภวาปี จ.อุดรธานี 41370', '898624198', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00761', 'นิยมการค้า', '3 ม.10 บ.นาดี ต.นาดี อ.หนองแสง จ.อุดรธานี 41340', '990153537', NULL, NULL, 'https://goo.gl/maps/btKc1ENBjFQDmYST7', NULL, '17.070661, 102.854011', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00762', 'ร้าน ยายจันทร์', '223 ม.5 บ.สี่แจ ต.ผาสุก อ.กุมภวาปี จ.อุดรธานี 41370', '886381367', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00763', 'คุณหยก บ้านเดียม', NULL, '847235412', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00764', 'หจก. ธีรภัทร์ อินเตอร์เทรดดิ้ง 2014', '119/11 หมู่ 5 ต.ทรายขาว อ.สอยดาว จ.จันทบุรี 22180', '949789265', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00765', 'ร้าน ข้าวปั้นกะข้าวกล้อง', '31 ม.15 ต.เวียงคำ อ.กุมภวาปี จ.อุดรธานี 41110', '862349014', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00766', 'บริษัท สมยงคาเซ็นเตอร์ จำกัด', '242/4 ม.4 ต.ขามใหญ่ อ.เมือง จ.อุบลราชธานี 34000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00767', 'ร้านจำปา', '113 หมู่ที่ 4 ต.ท่าลี่ อ.กุมภวาปี จ.อุดรธานี 41110', '987868549', NULL, NULL, 'https://goo.gl/maps/Jz1YPjwL5eWBYx2Q6', NULL, '16.962236, 103.075982', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00768', 'ร้านปาริชาติ บ.เหล่าหมากจันทร์', '56 บ.เหล่าหมากจันทร์ ต.ท่าลี่ อ.กุมภวาปี', '826894225', NULL, NULL, 'https://goo.gl/maps/ikK3DWPRoUzwSmru5', NULL, '16.923313, 103.040957', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00769', 'โรงเรียนอนุบาลอุ่นใจ', '159 หมู่ 7 โรงเรียนอนุบาลอุ่นใจ ต.ทับกุง อ.หนองแสง จ.อุดรธานี', '648644252', NULL, NULL, 'https://goo.gl/maps/z7RRoHf1MgukZV9R7', NULL, '17.183993, 102.788825', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00770', 'ห้างหุ้นส่วนจำกัด ทรัพย์ศรีวรรณ (สำนักงานใหญ่)', '387/1 ม.4 ต.บ้านหว้า อ.เมืองขอนแก่น จ.ขอนแก่น 40000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00771', 'ร้านรุจพานิชย์', '89 หมู่ 10 บ้านหนองบัวทอง ต.หนองไผ่ อ.เมือง จ.อุดรธานี 41330', '847915254', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00772', 'พี่ผึ้ง บ.ป่าอ้อย', 'บ้านป่าอ้อย หมู่ 5 ต.บะยาว อ.วังสามหมอ จ.อุดรธานี', '621483532', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00773', 'บริษัท เสริมสุข จำกัด (มหาชน) สาขาที่ 00026', '503,605 ถ.อุดร-ขอนแก่น ต.บ้านจั่น อ.เมืองอุดรธานี จ.อุดรธานี 41000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00774', 'ร้านอรพินท์ บ้านทับไฮ', '24 หมู่ 4 ต.แสงสว่าง อ.หนองแสง จ.อุดรธานี', '933619275', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00775', 'ร้านกุ๊กไก่', '23 หมู่ 12 บ. โนนสำราญ ต. บุ่งแก้ว อ. โนนสะอาด จ.อุดรธานี 41240', '813571633', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00776', 'ยายอุ๊', '56หมู่8 บ้านเลา ต.เชียงแหว อ.กุมภวาปี จ. อุดรธานี 41110 41110', '632249608', NULL, NULL, 'https://goo.gl/maps/KT35rCc7wH1i7SXCA', NULL, '17.186648, 102.975036', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00777', 'พี่นพ บ้านแสงสว่าง', '208 หมู่ 2 ต.แสงสว่าง อ.หนองแสง จ.อุดรธานี', '967097447', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00778', 'คุณณัฐกมล ตึงทอง', '60 หมู่ 7 บ.นาเหล่า ต.หนองกุงศรี อ.โนนสะอาด จ.อุดรธานี 41240', '861073937', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00779', 'หจก.สมเด็จง่วนเชียง', '175 หมู่5 ตำบลสมเด็จ อำเภอสมเด็จ จังหวัดกาฬสินธุ์ ต.สมเด็จ อ.สมเด็จ จ.กาฬสินธุ์ 46150', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00780', 'ร้านร่มเย็น', '134 ม.10 บ.คำสี ต.ศรีธาตุ อ.ศรีธาตุ จ.อุดรธานี 41230', '0804133235/087946855', 'หยุดวันอาทิตย์', NULL, 'https://goo.gl/maps/tbqTkxYgcdz8Wu5D9', NULL, '16.976199, 103.212092', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00781', 'สหการณ์ หมู่ 12', '138 หมู่ 12 บ้านนาตาล ต.นาตาล อ.ท่าคันโท จ.กาฬสินธุ์ 46190', '936311339', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00782', 'ร้านหมึกทอง บ.หนองแซง', '25 ม.13 บ.หนองแซง ต.นาตาล อ.ท่าคันโท จ.กาฬสินธุ์', '648600896', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00783', 'นายประสาท โพธิเศษ', '41หมู่ 9 บ้านนาหนองทุ่ม ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '935877910', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00784', 'ร้านพยุดา ช็อป', '76 หมู่ 1 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '982832136', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00785', 'ร้านภูไท [วิภาดา แก้วอินทร์]', 'บ้านนายูง ต.นายุง อ.ศรีธาตุ จ.อุดรธานี', '636313646', NULL, NULL, 'https://maps.app.goo.gl/Vw7kxFnJM3x2SUJf8', NULL, '16.979951,103.264662', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00786', 'ร้านเฮือนเตี๋ยวกะเพรา', '89/1 ม.3 ต.ปะโค อ.กุมภวาปี จ. อุดรธานี 41370', '624171795', NULL, NULL, 'https://goo.gl/maps/WtNsfhYPVRn3QRxM9', NULL, '17.057717, 102.919582', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00787', 'พจน์ไข่สด-ขนมสด', '428/14 อาคารพาณิชย์เทศบาลโนนสะอาด ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี 41240', '998258188', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00788', 'ร้านชาไทย บ้านหนองผึ้ง', '125 หมู่ 3 บ้านหนองผึ้ง ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '631621309', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00789', 'ร้านน้องด้าย อีสานพาแซ่บ', '68 หมู่ 4 ต.ผาสุข อ.กุมภวาปี จ.อุดรธานี', '821096077', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00790', 'ร้านนำโชค มงคลพาณิชย์', '145 ม.6 บ้านแสงสว่าง ต.แสงสว่าง อ.หนองแสง จ.อุดรธานี', '807952096', NULL, NULL, 'https://goo.gl/maps/S221KPzz1tCi2MZm8', NULL, '17.120394, 102.818979', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00791', 'ยายเรียน บ.ทับกุง', '153 ม.1 บ้านทับกุง อ.หนองแสง จ.อุดรธานี', '910576453', NULL, NULL, 'https://maps.app.goo.gl/FoBCUPKvJo9Fe14L8', NULL, '17.174147, 102.771190', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00792', 'ร้านศรีธร บ้านโนนมะข่า', NULL, '925151438', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00793', 'ร้าน สมรการค้า บ.ทับกุง **รับเองเท่านั้น**', '49 หมู่ 1 ต.ทับกุง อ.หนองแสง จ.อุดรธานี', '611189514', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00794', 'ครูจิ๊บ', 'อ.สามชัย จ.กาฬสินธุ์', '981588919', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00795', 'ร้านก๋วยเตี๋ยวกลางทุ่ง', 'ก่อนถึง อบต.เวียงคำ', '852838979', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00796', 'ร้านแม่กำไล ท่าคันโท ตรงข้ามกับ ร้านบุญพานิช', 'อยู่ใกล้กับ บ้านผู้ใหญ่บ้าน ม.8', '878402373', NULL, NULL, 'https://goo.gl/maps/dZkE5tM1zjzXiaEu9', NULL, '16.950862, 103.235520', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00797', 'ร้านวงเดือน บ.พันดอน', 'เลขที่ 8 ม.7 บ.พันดอน อ.กุมภวาปี', '859517035', NULL, NULL, 'https://maps.app.goo.gl/HPnQP26BDG8v9hTN9', NULL, '17.147443, 102.971219', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00798', 'สหกรณ์โรงเรียนบ้านกุดขนวน', 'ต.บุ่งแก้ว อ.โนนสะอาด จ.อุดรธานี 41240', '647565889', 'รร.เลิก 4 โมงครึ่ง', NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00799', 'ร้านมายา อาหารตามสั่ง ห้วยเกิ้ง', 'มุมระฆังรีสอร์ท ทางเลี้ยวเข้าโรงพยาบาล', '868535884', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00800', 'ร้าน กมลวรรณ', '289 ม.1 บ.สงเปลือย ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี 41370', '987561796', NULL, NULL, NULL, NULL, '17.128377, 102.964968', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00801', 'สหกรณ์ โรงเรียนบ้านปะโค', 'บ้านปะโค', '918675832', NULL, NULL, 'https://goo.gl/maps/KiiKHqkRZDDPU1Jp6', NULL, '17.111510, 102.948467', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00802', 'พี่ีบัวหยก', NULL, '935579315', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00803', 'โรงเรียนเทศบาลตำบลโนนสะอาด', 'ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี 41240', '942912059', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00804', 'แก้ไขราคา-ชื่อสินค้า', 'ทดสอบระบบ', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00805', 'บริษัท ส.ล.แลนด์ จำกัด [สาขาที่ 00002]', '76/28 ม.10 ต.วัดไทรย์ อ.เมืองนครสวรรค์ จ.นครสวรรค์ 60000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00806', 'ป.พาณิชย์การค้า', '189 ม.6 บ.ปอ ต.กุมภวาปี จ.อุดรธานี 41110', '901920508', NULL, NULL, 'https://goo.gl/maps/bq2fUxmiXto9PNXc8', NULL, '17.074754, 103.015115', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00807', 'คุณชูศักดิ์ โถแพ', '289/1-2 ต.บึงกาฬ อ.เมือง จ.บึงกาฬ', '918271010', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00808', 'ร้านคุณยาย', 'บ้านนาแบกน้อย 50 หมู่ที่ 17 ตำบลเวียงคำ อำเภอกุมภวาปี จังหวัดอุดรธานี 41110.', '953090369', NULL, NULL, 'https://goo.gl/maps/6FwckLQr6P4QHk8VA', NULL, '17.106835, 103.033340', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00809', 'ร้านข้าวแกงปัตตานี', '260 ม.17 ต.เวียงคำ อ.กุมภวาปี 41110', '803951642', NULL, NULL, 'https://goo.gl/maps/oyLNbvo1HYLj1fzW8', NULL, '17.110978, 103.025179', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00810', 'B & E', '88/3 หมู่ 1 ถ.แชแล ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี', '0626166642/081612642', NULL, NULL, 'https://goo.gl/maps/wyX4xUhjxMfMwho29', NULL, '17.110698, 103.007719', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00811', 'ร้านมะลิแดง มินิมาร์ท', '466/1 ม.7 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '862421712', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00812', 'เบญจรัตน์พาณิชย์', '274 ม.13 บ.ดงน้อย ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '656978596', NULL, NULL, 'https://goo.gl/maps/61swXQ225e6WNwWa7', NULL, '17.016810, 102.889979', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00813', 'ขายส่ง พิเศษ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00814', 'กรกนก การค้า', '28หมู่ 1 ต.ห้วยสามพาด อ.ประจักษ์ศิลปาคม จ .อุดรธานี 41110', '801867670', NULL, NULL, 'https://goo.gl/maps/VZ9h3qYMDazPRtxR9', NULL, '17.214031, 102.939032', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00815', 'ร้าน ป๋านิตย์เจริญทรัพย์', '179 ม.1 ถ.มิตรภาพ ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี 41240', '650578999', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00816', 'ร้านวิไล เต็มไทยสงค์', NULL, '986484334', NULL, NULL, 'https://goo.gl/maps/EcfvPaJ5jUGfCVXR9', NULL, '16.811966, 103.284962', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00817', 'ร้าน คุณเล้ง', 'ติดกับร้านโกดัง 44', '831455162', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00818', 'ร้าน แม่นุช (นางชดาพร ธรรมเจริญ)', '235 ม.3 ต.คอนสาย อ.กู่แก้ว จ.อุดรธานี 41130', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00819', 'โรงเรียนกมลาลักษณ์', NULL, '956705945', NULL, NULL, 'https://goo.gl/maps/KPda7E4sVTCoft6S9', NULL, '16.993329, 103.217794', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00820', 'คุณชัยยง แก้วเกิดมี', 'บ้านเหมือดแอ่', '896217999', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00821', 'สมหวังรีสอร์ท บ.ห้วยกองสี', 'บ้านห้วยกองสี', '899257317', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00822', 'ร้านสุกัลยา ชัยเกตุ', '255 หมู่ 4 บ้านบุ่งหมากลาน ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '0950046763/ไลน์', NULL, NULL, 'https://goo.gl/maps/nB6zBamGFCAJQ4CF6', NULL, '17.067617, 102.887005', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00823', 'ดอนเงิน พาณิชย์', '212​ หมู่10​ บ.ดอนเงิน​ ต.แชแล​ อ.กุมภวาปี​ จ.อุดรธานี​ 41110', '0874922908/ไลน์', NULL, NULL, 'https://maps.app.goo.gl/U7yLgBDcZdDuXtfA6', NULL, '17.135741, 103.035305', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00824', 'ร้านแม่นารีเก่า', '201 หมู่14 บ้านหนองศรีเจริญ ต.พันดอน อ.กุมภวาปี จ.อุดรธานี (ร้านแม่นารีเก่า)', '659942283', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00825', 'ร้านค้าสี่แยกหนองนกเขียน', '94หมู่6บ้านราษฏร์พัฒนา ต.หนองนกเขียน อ.ศรีธาตุ จ.อุดรธานี', '989238106', NULL, NULL, 'https://goo.gl/maps/oY3w1uvk2e8B5axx9', NULL, '17.005715, 103.287117', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00826', 'นายสิทธิศักดิ์ เขียวเนียม (โด่งดัง) (1)', '145 หมู่ที่ 7 ต.โพธิ์ศรีสำราญ อ.โนนสะอาด จ.อุดรธานี', '810168225', 'ไม่เกิน 18.00น.', NULL, 'https://goo.gl/maps/qdBayz7JntdBJ6fR9', NULL, '17.013851, 102.837979', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00827', 'ร้านสามใบเถา', '56 หมู่ 7 ถ.โพนทอง ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี', '880070517', NULL, NULL, 'https://maps.app.goo.gl/CF96WxB1g9TjdPNh9', NULL, '17.107983, 103.020158', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00828', 'ภูรภัทร มินิมาร์ท', '280 ม.4 บ้านโนนสา อ.ประจักษ์ศิลปาคม จ.อุดรธานี 41110', '650739529', NULL, NULL, 'https://goo.gl/maps/bMHuSvWzrPcoP7eb7', NULL, '17.215351, 102.994979', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00829', 'ร้านมาเฮง ในตลาดสดเทศบาลวังสามหมอ', 'ในตลาดสดเทศบาลวังสามหมอ ถนนวาริช-วังสามหมอ', '630461741', NULL, NULL, 'https://goo.gl/maps/4gHtAT7XJeJdmzWA7', NULL, '16.981914, 103.424829', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00830', 'ร้านสมสุข', '163/4 ม.4 ต.บ้านเลื่อม อ.เมือง จ.อุดรธานี', '834099192', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00831', 'ร้าน น้องแก้มใส', '47 ม.3 ต.นาดี อ.หนองแสง จ.อุดรธานี', '627533404', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00832', 'ร้านแม่คำบง โรงงานน้ำตาลเกษตรผล', 'ในโรงงานน้ำตาลเกษตรผล', '960878697', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00833', 'ร้าน เกิ้งพาณิชย์', '318/2 หมู่ที่ 3 บ้านเหมือดแอ ต. ปะโค อ. กุมภวาปี จ.อุดรธานี 41370', '0844094646/095480256', NULL, NULL, 'https://goo.gl/maps/JYYn1K5NB3BjHogk8', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00834', 'แม่ใหม่ บ.เหล่าหมากบ้า', 'บ้านเหล่าหมากบ้า ต.แชแล อ.กุมภวาปี ศาลากลางบ้านเลี้ยวขวา บ้านอยู่หลังที่ 2 ซ้ายมือ', '933413196', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00835', 'แม่คำมวล บ้านดงสำราญชัย', '3 หมู่ 7 บ้านดงสำราญชัย ต.หนองแสง อ.หนองแสง จ.อุดรธานี', '985496229', NULL, NULL, 'https://goo.gl/maps/z19FbyEwaruG1GZ3A', NULL, '17.157361, 102.832011', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00836', 'บริษัท อวยชัยแทรคเตอร์ อุดรธานี จำกัด', '334 ม. 4ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '804160010', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00837', 'เบ็นสัน กาแฟโบราณ', '65 ม.1 บ้านนาดี ต.ผาสุก อ.กุมภวาปี จ.อุดรธานี', '918188808', NULL, NULL, 'https://goo.gl/maps/X6qBTiv8xP4aLfaC9', NULL, '17.200707, 102.932687', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00838', 'น้ำทิพย์ ดวงประสิทธิ์', '182 ม.5 ต.หัวนาคำ อ.ศรีธาตุ จ.อุดรธานี', '652709097', NULL, NULL, 'https://goo.gl/maps/gtKAvteXK24LsTFz9', NULL, '17.089880, 103.319265', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00839', 'สุภาพรพาณิชย์ บ.ดงง่าม-นางาม', '65 ม.2 บ้านดงง่าม ต.คำโคกสูง อ.วังสามหมอ จ.อุดรธานี 41280', '890075966', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00840', 'ห้างหุ้นส่วนจำกัด ธนาอิมพอร์ต เอ็กซ์พอร์ต', 'เลขที่ 158 หมู่บ้านดูเดื่อ หมู่ที่ 6 ต.แจระแม อ.เมือง จ.อุบลราชธานี 34000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00841', 'ร้าน แม่รมณ์ดี', '11 ม.3 บ.เหล่ากล้วย ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี 41370', '930594787', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00842', 'ร้านแม่นงเยาว์', '45 ม.9 บ้านตะเคียงทอง ถ.ศรีธาตุ-กุมภวาปี ต.บ้านโปร่ง อ.ศรีธาตุ 41230', '861051139', NULL, NULL, 'https://goo.gl/maps/Z4MyEraQbgYpJfWG9', NULL, '17.020518, 103.128014', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00843', 'ร้านวิภา บ.สี่แจ', '168 ม.10 มบ.สี่แจ ต.ผาสุก อ.กุมภวาปี 41370', '653485093', NULL, NULL, 'https://goo.gl/maps/nfQ4VA9hgBTyy8bW8', NULL, '17.165092, 102.933278', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00844', 'ร้านไอดี บ้านสี่แจ', '46 ม.10 มบ.สีแจ ต.ผาสุก อ.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41370', '918240278', NULL, NULL, 'https://goo.gl/maps/CJNUU5Fu7aRqssdT9', NULL, '17.166215, 102.932319', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00845', 'ร้านเกลียวทอง กันทับทิม', '143 ม.12 มบ.ดงสามสิบ ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี 41370', '958467622', NULL, NULL, 'https://goo.gl/maps/nwWnWRegViyHwCCn6', NULL, '17.187728, 102.913620', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00846', 'คิระ มินิมาร์ท(5)', '83​ หมู่​ 8 ​บ้านดงเรือง', '896181415', NULL, NULL, 'https://goo.gl/maps/s9FUzA1SUYuyDLFZ6', NULL, '17.189023, 102.953343', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00847', 'ร้าน นั่งกินคาเฟ่', '815 ม.15 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '849383785', NULL, NULL, 'https://goo.gl/maps/8LCV2b4KnQSRbTJ17', NULL, '17.123940, 102.975032', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00848', 'รุ่งเรืองการค้า', '321 หมู่ 11 บ้านนาเหล่า ต.หนองกุงศรี อ.โนนสะอาด จ.อุดรธานี', '813209406', NULL, NULL, 'https://goo.gl/maps/bCnSabRRnSZbPw8v6', NULL, '17.058640, 102.786734', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00849', 'ตอง-กล้วย เบเกอรี่คาเฟ่', '282/1 ม.10 บ้านดงเมือง ถ.แชแล ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '813202654', NULL, NULL, 'https://goo.gl/maps/eStVgx2wPmj58V7n8', NULL, '17.110185, 103.016686', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00850', 'บริษัท น้ำตาลเกษตรผล จำกัด [สำนักงานใหญ่]', 'เลขที่ 90/44-45 อาคารสาธรธานี 1 ชั้น16 ถ.สาทรเหนือ แขวงสีลม เขตบางรัก กรุงเทพมหานคร 10500', NULL, NULL, NULL, 'https://goo.gl/maps/tSkEgNqKsqx9NgpKA', NULL, '17.081494, 102.927869', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00851', 'ร้าน กุลิสรา', '48 ม.6 บ.หนองพุก ต.นาม่วง อ.ประจักษ์ อ.อุดร 41110', '959099879', NULL, NULL, 'https://goo.gl/maps/KQKKzLhMR12rCMKk7', NULL, '17.278602, 102.981565', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00852', 'ร้าน​ วิรัตร์การค้า', '5หมู่7 บ.หนองหญ้าม้า​ต.นาม่วง​ อ.ประจักฯ จ.อุดรฯ 41110', '833830402', NULL, NULL, 'https://goo.gl/maps/HeueyMazkHzaLrw86', NULL, '17.271420, 102.981979', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00853', 'แม่นกแก้ว บ.หนองหญ้าม้า', '76 ม.7 หมู่บ้านหนองหญ้าม้า ต.นาม่วง อ.ประจักษ์ จ.อุดรธานี 41110', '636818273', NULL, NULL, 'https://goo.gl/maps/nsiqYxoN4CXtu28m9', NULL, '17.271418, 102.983107', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00854', 'ร้าน เจ้เจี๊ยบมินิซุปเปอร์', '53 ม.1 มบ.เชียงแหว ต.เชียงแหว อ.กุมภวาปี จ.อุดรธานี 41110', '630311412', NULL, NULL, 'https://goo.gl/maps/2AiRneed1SRkKGBR9', NULL, '17.172446, 102.998194', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00855', 'ร้าน รวม ป.พาณิชย์', '139 ม.8 หมู่บ้านเชียงกรม ต.นาม่วง อ.ประจักษ์ จ.อุดรธานี 41110', '858548069', NULL, NULL, 'https://goo.gl/maps/4Wmc3G1YM7kow9WK9', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00856', 'แม่บัวลัย เจริญรุ่งเรือง', '136 ม.14 หมู่บ้านเชียงกรม ต.นาม่วง อ.ประจักษ์ จ.อุดรธานี 41110', '883269649', NULL, NULL, 'https://goo.gl/maps/Y86JbQcAoASVg4fq6', NULL, '17.287534,102.957733', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00857', 'ร้าน กูเกิล มาร์เก็ต', '144 ม.14 มบ.เชียงกรม ต.นาม่วง อ.ประจักษ์ จ.อุดรธานี 41110', '955274389', NULL, NULL, 'https://goo.gl/maps/3KzgBott3CLQJDx49', NULL, '17.286700, 102.956989', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00858', 'สุขสกาว คาเฟ่', '181 ม.14 มบ.เชียงกรม ต.นาม่วง อ.ประจักษ์ จ.อุดรธานี 41110', '870285061', NULL, NULL, 'https://goo.gl/maps/BUUfzi1EGZyg8NHU6', NULL, '17.280925, 102.952660', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00859', 'ร้านเจริญถาวร', '226 ม.12 มบ.โนนสมบูรณ์ ต.ห้วยสำพาน อ.ประจักษ์ จ.อุดรธานี', '0843562662/ไลน์', NULL, NULL, 'https://goo.gl/maps/wKEyg8XhMXuGWNou9', NULL, '17.268549, 102.935165', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00860', 'ห้างหุ้นส่วนจำกัด ก.การค้า 2555 [สำนักงานใหญ่]', '186 ม.4 ต.ดอนเตย อ.นาทม จ.นครพนม', '872208085', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00861', 'ร้าน ก้อยฟ้าว', '410/6 ม.4 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '910526514', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00862', 'ศตวรรษ การค้า', '5 ม.1 บ.โนนสะอาด ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี 41240', '946767246', NULL, NULL, 'https://maps.app.goo.gl/sm82Y4uYPYdE5qFUA', NULL, '16.969760, 102.891188', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00863', 'ร้าน พงษ์พัฒน์การค้า', '59 ม.5 ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี', '933963391', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00864', 'โกดัง 222 ค้าส่ง', '222 ม.11 (บ.ดงไร่) ต.นาข่า อ.เมือง จ.อุดรธานี', '0815351433/086992203', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00865', 'ร้านตาสิม มินิมาร์ท', '110 หมู่ 6 บ้านห้วยแสง ต.โพธิ์ศรีสำราญ อ.โนนสะอาด จ.อุดรธานี', '42331216', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00866', 'ดาหวัน บุญผง', '78/9 บ.ม่วงศรีสมพร ต.โพธิ์ศรีสำราญ อ.โนนสะอาด จ.อุดรธานี 41240', '935296755', NULL, NULL, 'https://maps.app.goo.gl/NYYedjG1rVo2tYBx7', NULL, '16.982008, 102.851550', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00867', 'หจก.อุดรแสงอุทัย [สำนักงานใหญ่]', '123/20 ซ.หนองบัว1 ถ.นิตโย ต.หมากแข้ง อ.เมืองอุดรธานี 41000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00868', 'ปลาวาฬจิ้มจุ่ม', 'ร้านอยู่ตรง วีทีแหนมเนืองสาขากุมภวาปี ตรงข้ามแอลกอฮอล์', '807684223', NULL, NULL, 'https://goo.gl/maps/Eo6h76fKeZTVGpH39', NULL, '17.107057, 103.010204', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00869', 'ใบเตย น้ำตาล ไอศครีม กะทิสด', '103 ม.10 ต.อุ่มจาน อ.ประจักษ์ฯ จ.อุดรธานี', '861382544', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00870', 'สหกรณ์โรงเรียนบ้านท่าเปลือย(บุญเกื้ออุปถัมภ์)', 'ในโรงเรียนบ้านท่าเปลือย', '887132164', NULL, NULL, 'https://goo.gl/maps/RT91qhgdffx7nvtn8', NULL, '17.103061, 103.022404', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00871', 'แม่มณฑา ภาโนมัย บ.หนองเหี้ย', '23/10 บ.หนองเหี้ย ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี', '858494686', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00872', 'มั่นคงการค้า บ.โนนมะข่า', '142 หมู่ 11 บ.โนนมะข่า ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี', '953478487', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00873', 'แม่แหม่ม เพ็ญจันทร์ บ.นาฝาย', '107 บ้านนาฝาย หมู่ 2 ต.นาดี อ.หนองแสง', '899810434', NULL, NULL, 'https://goo.gl/maps/SKs9SEzqB1FB3eMx9', NULL, '17.083731,102.856989', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00874', 'ไทเฮา', NULL, '821258185', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00875', 'หอพักการ์เด้นวิว', '245 ม.6 ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี', '806954046', NULL, NULL, 'https://goo.gl/maps/SQuWdr3xdexrauwA6', NULL, '17.079391, 102.933950', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00876', 'ร้าน พ่อนิคม จุลม่วง', '154 ม.7 บ.หนองหว้า ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี', '829638713', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00877', 'เอี๊ยบย่งเชียง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00878', 'ร้านวีรศักดิ์', '56หมู่4 ต.บุ่งแก้ว อ.โนนสะอาด จ.อุดรธารี', '883187060', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00879', 'ร้าน สวนมะลิ', 'ดงเมือง หมู่ 8 ซอยชมช่วย 4 ทางลงพวงแก้วอพาร์ทเม้นท์ ต.กุมภวาปี อ.กุมภวาปี', '819756248', NULL, NULL, 'https://goo.gl/maps/hQeEoq3ZBVZJBQo69', NULL, '17.125039, 103.010788', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00880', 'คุณศศิธร อยู่ใกล้ร้านโอพานิชย์ บ้านแสงสว่าง', '61 หมู่7 บ้านแสงสว่าง ตำบลแสงสว่าง อำเภอหนองแสง จังหวัดอุดรธานี 41340', '999569757', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00881', 'โรงเรียนบ้านดงเมือง(ดงเมืองวิทยา)', '505 ถ.อุ่มจาน หมู่ 9 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', NULL, NULL, NULL, 'https://goo.gl/maps/htjS2sEc7gKLZdSq8', NULL, '17.112854, 103.015482', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00882', 'ร้านชนาการ บ้านโนนจำปา', '88 หมู่ 2 บ้านโนนจำปา ต.หนองกุงศรี อ.โนนสะอาด จ.อุดรธานี', '611184735', NULL, NULL, 'https://goo.gl/maps/AvRzDE76MLac8RMMA', NULL, '17.033900, 102.808167', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00883', 'ร้านดำริ', '129 ม.2 หมู่บ้านดงน้อย ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '973074735', NULL, NULL, 'https://goo.gl/maps/Dv88XUNqANRMQ9pL6', NULL, '17.019619, 102.889446', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00884', 'ร้าน หลักกอ พาณิชย์', '155 ม.13 หมู่บ้านดงน้อย ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '872185030', NULL, NULL, 'https://goo.gl/maps/QAwBuSJFVpEfL1Hu8', NULL, '17.018878, 102.892644', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00885', 'ร้านรีเทิร์น', '434 ม.4 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '630059920', NULL, NULL, 'https://goo.gl/maps/38zhccejM4MmQRqH6', NULL, '17.121953, 102.943685', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00886', 'ร้านณัฐพร การค้า', NULL, '856629053', NULL, NULL, 'https://goo.gl/maps/cu44Ee6yfEP3qczJ8', NULL, '16.995162, 103.048724', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00887', 'ร้านต้นคูณ บ.โนนสะอาด', '59 ม.2 บ้านโนนสะอาด ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี', '844282608', NULL, NULL, 'https://goo.gl/maps/eGLYKBJzXE3L9B4y6', NULL, '16.973354, 102.896849', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00888', 'ร้านคุณภัทร', '215 หมู่ 5 บ้านโคกสว่าง ต.หนองแสง อ.หนองแสง จ.อุดรธานี 41340', '859623115', NULL, NULL, 'https://goo.gl/maps/LrnVJ9N4WY8CkMUd9', NULL, '17.190021, 102.845377', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00889', 'ร้านน้ำปั่นแม่เก็ต', '77ม.5 บ.โนนจำปา ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี', '886697492', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00890', 'ร้าน รุ่งเรืองพาณิชย์', '461 หมู่2 บ.ดงเมือง ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '886178431', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00891', 'ร้าน เหล้าขาล', '114หมู่2 บ้านโนนสะอาด ตำบลโนนสะอาด อำเภอกุมภวาปี จังหวัดอุดรธานี 41240', '937275720', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00892', 'ทรัพย์แม่เงินการค้า [พี่จันทร์ โนนทอง]', NULL, '0622833565/097924017', NULL, NULL, 'https://goo.gl/maps/REjzdBCsrfjZKvwv5', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00893', 'ร้านยายเขียว', 'บ้านเสาเล้า อ.โนนสะอาด', '0654517640/062479141', NULL, NULL, 'https://goo.gl/maps/LmGSrHBox8Awtz8U7', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00894', 'ร้านตาหนูยายเหน่', '157/10บ.ศรีสุข ต.ท่าลี่ อ.กุมภวาปี จ.อุดรธานี', '657017738', NULL, NULL, 'https://goo.gl/maps/5sPj84Ly9Qkns8VA8', NULL, '16.956378, 103.078812', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00895', 'ร้าน ถุงทอง', '209 หมู่ที่ 1 บ้านไผ่ ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี 41110', '633158989', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00896', 'อินชอนเนื้อย่าง', '459/2​ ต.โนนสะอาด ​อ.โนนสะอาด​ จ.อุดรธานี​ 41240', '821905188', NULL, NULL, 'https://goo.gl/maps/QumCP7WeguKPzBYS7', NULL, '16.972872, 102.896600', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00897', 'ร้านค้ายายแซ่บ', 'บ้านกระเบื้องโนนทิง ต.บุ่งแก้ว อ.โนนสะอาด จ.อุดรธานี 41240', '934140433', NULL, NULL, 'https://goo.gl/maps/DLDovQ5hMRWpCJww5', NULL, '16.996882, 103.012593', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00898', 'โรงเรียนกุมภวาปีพิทยาสรรค์', '292หมู่ 19 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', NULL, NULL, NULL, 'https://goo.gl/maps/HS3RnqpZbsEGSrcn9', NULL, '17.137466, 102.902877', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00899', 'แม่เชิดชู', 'บ.แสงอรุณ ต.โพธิ์ศรีสําราญ อ.โนนสะอาด', '879474426', NULL, NULL, 'https://goo.gl/maps/FvxG4dScEcZtb3a59', NULL, '17.012951, 102.836021', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00900', 'ร้านเบาะฟิชชิ่ง โนนสะอาด', '679 หมู่ 1 ถนนมิตรภาพอุดร-ขอนแก่น บ้านโนนสะอาด ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี', '833530813', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00901', 'ร้านค้าประชารัฐบ้านท่าไฮ', '180 ม.11 บ.ท่าไฮ ต.จำปี อ.ศรีธาตุ จ.อุดรธานี 41230', '819317522', NULL, NULL, 'https://goo.gl/maps/2FNyWP7QYmAdd1yj7', NULL, '16.956437, 103.173844', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00902', 'ร้าน คุณยายเนื้อย่าง', '119 ม.13 บ.ดงเมือง ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '989165863', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00903', 'สุพัตตรา วรศิริ [ลีโอพลัสตรา]', '295 หมู่ 2 บ้านแสงสว่าง ต.แสงสว่าง อ.หนองแสง จ.อุดรธานี', '618795397', NULL, NULL, 'https://goo.gl/maps/dZBCX695XWWr6RRP8', NULL, '17.117543, 102.822062', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00904', 'ร้าน บีมคิว', '91 ม.5 บ้านโคกกลาง ต.นาม่วง อ.ประจักษ์ศิลปาคม จ. อุดรธานี', '963515974', NULL, NULL, 'https://goo.gl/maps/3k3V8MYvb6ZqMYwH9', NULL, '17.207364, 102.965693', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00905', 'รุ่งเรืองการค้า บ้านดอนกลาง', '121 ม.1 บ้านดอนกลาง ต.อุ่มจาน อ.ประจักษ์ศิลปาคม จ.อุดรธานี', '624139248', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00906', 'แม่ทองตัด', 'บ้านหนองกวาง ตำบลสีออ', '933832124', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00907', 'ร้านแม่น้อง บ้านดงเรือง', '64 ม.2 ต.ผาสุข อ.กุมภวาปี จ.อุดรธานี 41370', '808817043', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00908', 'นายศิริพงษ์ ศรีพรมษา', '779/160 หมู่ที่ 4 ต.ปลวกแดง อ.ปลวกแดง จ.ระยอง', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00909', 'โรงเรียนบ้านห้วยเกิ้งวัฒนเสรีราษฏร์บำรุง', '88 หมู่ที่ 5 ต.ห้วยเกิ้ง อ.กุมภวาปี จ.อุดรธานี 41110', NULL, NULL, NULL, 'https://goo.gl/maps/3TowK8yEA7wHSX937', NULL, '17.051983, 102.930013', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00910', 'ห้างหุ้นส่วน เอ็นจิเนียริ่ง เซลแอนเซอร์วิส จำกัด (สำนักงานใหญ่)', '189 ม.2 ต.นาดี อ.หนองแสง จ.อุดรธานี 41340', '42115100', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00911', 'หจก.คีบเปอร์เทม โลจิสติกส์', '380/16 หมู่1 ถ.เทพารักษ์ ต.บางเสาธง อ.บางเสาธง จ.สมุทรปราการ 10570', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00912', 'ห้างหุ้นส่วนจำกัด ธนทรัพย์ 88', '69 หมู่ 1 ต.ห้วยสามพาด อ.ประจักษ์ศิลปาคม จ.อุดรธานี 41110', '898787866', NULL, NULL, 'https://goo.gl/maps/fmJMfjcWGnMY8N3i6', NULL, '17.215951, 102.937957', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00913', 'นาง สาคร กองแสน', '144 ม.9 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '847904847', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00914', 'แม่พี่นิด', NULL, '927469029', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00915', 'ร้านมุมแซ่บ', 'เลขที่ 54 ม.3 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี', '802619649', NULL, NULL, 'https://goo.gl/maps/Lvyz8PDBxNsBsMAp7', NULL, '17.100662, 103.011079', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00916', 'บุษบา ชาไข่มุก', 'เลขที่ 43 หมู่ 12 บ.ดอนเงินใต้ ต.แชแล อ.กุมภวาปี จ.อุดรธานี', '928706797', NULL, NULL, 'https://goo.gl/maps/okh4jUxi2QPhSQ778', NULL, '17.133869, 103.034818', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00917', 'แม่ประยูร บ้านโนนสำราญ', '316 ม.1 บ้านโนนสำราญ ต.ห้วยเกิ้ง อ.กุมภวาปี จ.อุดรธานี', '861219152', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00918', 'ศิริการค้า (แม่แพง ร้านลูกสาวคุ้มโนน)', '273 ม.13 (คุ้มโนน) บ้านดงน้อย ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '989983866', 'ปิดร้าน 18.30 น.', NULL, 'https://goo.gl/maps/3tKZqqEU9vd2CqNS9', NULL, '17.018342, 102.895968', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00919', 'จ.ซุปเปอร์', '277 หมู่ที่3 ตำบลหนองหลัก อำเภอไชยวาน จังหวัดอุดรธานี', '840538296', NULL, NULL, 'https://goo.gl/maps/LMJSEx8mbC8U7CvA6', NULL, '17.264979, 103.198011', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00920', 'ร้านกรกฎ บ้านหนองแดง', '42 ม.6 บ้านหนองแดง ต.สีออ อ.กุมภวาปี จ.อุดรธานี 41110', '639324194', NULL, NULL, 'https://goo.gl/maps/m1us7jRm11Hr1mSB9', NULL, '17.027925,103.029844', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00921', 'นางวนิดา ทิพยอาสน์', '385 หมู่ที่ 1 ต.พรเจริญ อ.พรเจริญ จ.บึงกาฬ', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00922', 'น้องแมว บ้านป่าหวาย', '156 ม.4 บ้านป่าหวาย ต.ตาดทอง อ.ศรีธาตุ จ.อุดรธานี 41230', '828438620', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00923', 'ร้าน คอเดียวกัน', 'ต.ตาดทอง อ.ศรีธาตุ', '610947683', NULL, NULL, 'https://goo.gl/maps/s91DjK8PjdTSfdDa9', NULL, '17.041079, 103.112979', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00924', 'ร้าน TM มินิช็อป', 'เลขที่ 191 ม.14 ต.นาทัน อ.คำม่วง จ.กาฬสินธุ์ 46180', '861579946', NULL, NULL, 'https://goo.gl/maps/pNhKqKagEoc5T46x8', NULL, '16.978664, 103.652810', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00925', 'ครูสุพรรณ (ร้านใจดี 20 บ้านโนนทิง)', 'บ้านโนนทิง', '819640126', NULL, NULL, 'https://goo.gl/maps/w9ZiU7ww8EFbidUU9', NULL, '16.996683, 103.012766', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00926', 'สหกรณ์ โรงเรียนบ้านเชียงกรม', '75 ม.8 บ้านเชียงกรม ต.นาม่วง อ.ประจักษ์ จ.อุดรธานี', '886956670', NULL, NULL, 'https://goo.gl/maps/zfRgW8ZkB6GbvG859', NULL, '17.289391, 102.960224', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00927', 'ร้านมีตังค์', '6ม.11ต.พันดอน อ.พันดอน จ.อุดรธานี', '878643587', NULL, NULL, 'https://maps.app.goo.gl/fjXomvSA7oijHvnE7', NULL, '17.121251, 102.953519', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00928', 'โรงเรียนชุมชนวัดป่าทรงธรรม', 'โรงเรียนชุมชนวัดป่าทรงธรรม บ้านพันดอน อ.กุมภวาปี จังหวัดอุดรธานี 41370', '850128687', NULL, NULL, 'https://goo.gl/maps/jDiv9wDYx5Y7h1DJ6', NULL, '17.154159, 102.969976', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00930', 'ส.ก้าวเจริญยิ่ง', '64 ม.1 ต.ตูมใต้ อ.กุมภวาปี', '0941099299/หน้าร้าน', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00931', 'ร้าน 261 คาเฟ่', '261 ม.11 บ้านท่าเปือย ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '646105644', NULL, NULL, 'https://goo.gl/maps/8kS5GJtF9yDBwBgA7', NULL, '17.090297, 103.029186', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00932', 'ห้างหุ้นส่วนจำกัด โรงงานป้าย ตาเล็ก ดีไซน์', '234 ม.4 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '873733083', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00933', 'นายอัศวิน สิงห์สาย', NULL, '813041968', '813041968', NULL, 'https://maps.app.goo.gl/6UDkjPSewmQt4nnh9', NULL, '17.09572,102.94179', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00934', 'ร้านแก้วตาพานิชย์', 'ที่อยู่ 152 ม.1 บ้านกุดจิก ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี 41110', '092-7445444', NULL, NULL, 'https://goo.gl/maps/LnkpP4CQ4p2kFrsx5', NULL, '17.044849, 102.961205', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00935', 'ไอเดียป้ายอิงค์เจ็ท', '299 ม.4 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '086-4557506', NULL, NULL, 'https://goo.gl/maps/1WmJdPEVNdBvnvap8', NULL, '17.140765, 102.947232', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00936', 'ร้านทองสุข บ้านโนนสะอาด', '279 ม.1 บ้านโนนสะอาด ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี 41110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00937', 'นางสาว สาธิลดา โยธาวงศ์', '276/347 ถ.พระราม9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพ 10310', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00938', 'เอ็ม น้ำเต้าหู้อุดร', NULL, '987684300', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00939', 'หอมหวน คาเฟ่', NULL, '061-5129237', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00940', 'แม่บรรจง บ้านนาหนองทุ่ม', '9809 ม.9 บ้านนาหนองทุ่ม อ.กุมภวาปี จ.อุดรธานี', '842034891', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00941', 'ตามสั่งพี่กล้วย บ้านเชียงแหว', '248 ม.2 บ้านเชียงแหว ต.เชียงแหว อ.กุมภวาปี จ.อุดรธานี', '973193760', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00942', 'นางสาว นันท์นภัส จันทราช', '11 ม.7 ต.ห้วยสามพาด อ.ประจักษ์ศิลปาคม จ.อุดรธานี 41110', '084-7951885', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00943', 'นาย อนันต์ จันทะรี', '419 ม.4 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '086-2191462', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00944', 'นาย ประภาส ภูดล', '211/187 ม.2 ต.แม่เหียะ อ.เมือง จ.เชียงใหม่ 50100', '085-2800900', NULL, NULL, 'https://goo.gl/maps/59dvWR8b4gcJrR696', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00945', 'ร้านแม่แมวการค้า', '137 หมู่ที่ 8 ต.เวียงคำ อกุมภวาปี จ.อุดรธานี 41110', '829070225', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00946', 'ร้าน ยายฉลอง', '9 หมู่ 10 บ้านคำเลา ตำบล เวียงคำ อำเภอ กุมภวาปี จังหวัด อุดรธานี 41110', '654097482', NULL, NULL, 'https://goo.gl/maps/gUEyNmmBDXeQbs3RA', NULL, '17.073392, 103.105184', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00947', 'ร้าน ทิพย์ทวีคูณ', '102/1 ม.15 บ้านน้ำคล้อง ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '093-3620035', NULL, NULL, NULL, NULL, '17.130017, 102.968087', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00948', 'น.ส.นาฎศิลป์ บุตรสาระ', '213/1 หมู่ที่ 12 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '936515339', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00949', 'ร้านอิ่มอร่อยดี บ้านแสงสว่าง', '87 ม.1 บ้านแสงสว่าง อ.หนองแสง จ.อุดรธานี', '927470893', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00950', 'จิบแฟแลปาว', '270 ม.11 บ้านท่าเปลือย ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี', '923165386', NULL, NULL, 'https://goo.gl/maps/xe94K5tEwaPTAzpz6', NULL, '17.086205, 103.027142', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00951', 'ร้าน ชิปป์ สไมล์ สาขา บ้านนาเหล่า', '7 ม.5 บ้าน นาเหล่า ต.หนองกุงศรี อ.โนนสะอาด จ.อุดรธานี 41240', '647193123', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00952', 'พัชรินทร์', '326 หมู่3 ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '0638263619/ไลน์', NULL, NULL, 'https://goo.gl/maps/JErQzqRC8PBYcHcv5', NULL, '17.063683, 102.921777', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00953', 'ร้าน แม่จันทร์เพ็ง เลิศศิริ', '156 ม.2 บ.พันดอน ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '087-0912632', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00954', 'คุณ รัศมี โชติกา พาดี คุณนิยม ทันอ่อน คุณเสถียร ทองภู', 'วัดป่าจุฬาพร หมู่ 6 บ้านแสงสว่าง อ.หนองแสง จ. อุดรธานี', '954621088', NULL, NULL, 'https://goo.gl/maps/fFzYduRX3u3YdTHs7', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00955', 'ห้างหุ้นส่วนจำกัด เปียคล้ายยานยนต์', '104 หมู่ 2 ต.ท่าคันโท อ.ท่าคันโท จ.กาฬสินธุ์ 46190', '874311999', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00956', 'นายผดุง', '201 ม.8 บ.ดงเรือง ต.ผาสุข อ.กุมภวาปี จ.อุดรธานี 41370', '083-2829113', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00957', 'นาง ชุติมณฑน์ ชูลเซ', '106 ม.4 ต.นาม่วง อ.ประจักษ์ศิลปาคม จ.อุดรธานี', '909297850', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00958', 'ร้าน ประกาศิต', '126 ม.12 บ้านดอนแคน ต.พันดอน อ. กุมภวาปี จ.อุดรธานี 41370', '658846879', NULL, NULL, 'https://maps.app.goo.gl/BbUN9SAfiUbnSHRi9', NULL, '17.146399, 102.967961', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00959', 'ร้านตุ๊กตาคนกันเอง', NULL, '892791067', NULL, NULL, 'https://goo.gl/maps/kHpdQGhY64TTuAK39', NULL, '16.940467, 103.215741', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00960', 'ร้าน บี แอนด์ พี', '299 ม.1 ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี', '833616742', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00961', 'ร้านไก่ย่างแม่ไพร', '278 หมู่ 6 บ้านห้วยกองสี ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี 41110', '090 886 8187', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00962', 'ป.เจริญ บ้านดงเมือง', '89 ม.2 ถ.นายูง บ้านดงเมือง ต.กุมภวาปี จ.อุดรธานี 41110', '956626340', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00963', 'ร้านระยองการค้า', '16 ม.3 บ้านสี่แจน้อย ต.ผาสุข อ.กุมภวาปี จ.อุดรธานี', '0901837245/081469190', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00964', 'นภารุ่งเรืองการค้า', 'บ้านโนนจำปา', '623606769', NULL, NULL, 'https://goo.gl/maps/yjPPa8W47Zd9atPs5', NULL, '17.035353, 102.808851', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00965', 'ร้านสุรภา โคตรศรีกุล', '173/9 บ้านสงเปลือย ต.เสอเพลอ อ.กุมภวาปี', '869034631', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00966', 'ร้านซูโม่ ฮาร์ดแวร์', '262 ม.6 บ้านหนองลุมพุก ต.นาม่วง อ.ประจักษ์ศิลปาคม จ.อุดรธานี', '623593749', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00967', 'ร้าน ริน พลาสติก', '8/1 ม.2 ต.หวังสามหมอ อ.วังสามหมอ จ.อุดรธานี 41280', '801592189', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00968', 'สหกรณ์บ้านป่าไม้', 'ต.หนองกุงศรี อ.โนนสะอาด จ.อุดรธานี', '933592142', NULL, NULL, 'https://goo.gl/maps/L51UHXda2g117YW69', NULL, '17.050033, 102.745368', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00969', 'คุณ สุกัญญา', '120 ม. 2 ต.ห้วยเกิ้ง อ.กุมภวาปี จ.อุดรธานี 41110', '802494172', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00970', 'น.ส.ฟารีดะห์ เลาะวาโย', '37/8 หมู่ที่5 ต.จะแหน อ.สะบ้าย้อย จ.สงขลา 90210', '936716054', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00971', 'ณ กุมภวา​ คาเฟ่', '491/3 ม.10 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '986158865', NULL, NULL, 'https://goo.gl/maps/2ADUKex21xJj1NGG9', NULL, '17.106330, 103.019091', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00972', 'ร้าน Buy me cafe', '222 ถ.แชแล ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '0823119955/ไลน์', NULL, NULL, 'https://goo.gl/maps/4swtwTFao9NVBkzV9', NULL, '17.114292, 103.015572', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00973', 'ร้าน น้ำหนึ่งพาณิชย์', 'บ.โนนอำนวย ม.9 ต.นาตาล อ.ท่าคันโท จ.กาฬสินธุ์ 46190', '876445455', NULL, NULL, 'https://goo.gl/maps/jVw3u784rYKivuPDA', NULL, '16.823148, 103.278426', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00974', 'โรงเรียนบ้านนาดี-สร้างบง', '5 ม.4 ต.ผาสุก อ.กุมภวาปี จ.อุดรธานี 41340', '843932257', 'อยู่รับ 9.00-15.00 น', NULL, 'https://goo.gl/maps/pL1eWnryyatzC13M7', NULL, '17.205757, 102.942967', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00975', 'บีลีฟ Believe', '257/1 ถนนกุมภวาปี-ศรีธาตุ ข้างสถานีวิทยุ', '656425552', NULL, NULL, 'https://goo.gl/maps/2G8QNUfMNdvwL3Cc6', NULL, '17.112613, 103.004490', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00976', 'ร้านแววศรีการค้า', '170 หมู่ 13 บ้านดงน้อย ต.ปะโค อ.กุมภวาปี จ.อุดรธานี', '998170991', NULL, NULL, 'https://www.google.com/maps/place/17%C2%B001\'05.8%22N+102%C2%B053\'54.8%22E/@17.0181123,102.8985111,21z/data=!4m4!3m3!8m2!3d17.0182802!4d102.8985513?en', NULL, '17.018293, 102.898558', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00977', 'ร้าน อาคะเนย์ สรวงศิริ', '308 ม.3 บ้าน เมืองพรึก ต.เเชแล อ.กุมภวาปี จ.อุดรธานี 41110', '872261148', NULL, NULL, 'https://goo.gl/maps/yV6ZprMbQvN7RqSS7', NULL, '17.183837, 103.084478', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00978', 'นางสาว ยุวรรณา บุตรหิน', '52 ม.16 บ.ปะโค ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '085-6476406', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00979', 'นาย ธีรพงษ์ ชะงานกลาง', '87 ม.6 ต.ลำมูล อ.โนนสูง จ.นครราชสีมา', '084-0816717', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00980', 'โรงเรียนบ้านทองอินทร์สวนมอญ', 'ม.5 ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี', '956591925', NULL, NULL, 'https://goo.gl/maps/95aBHHdSXehmEgAP9', NULL, '17.239261, 102.844989', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00981', 'ร้านขายน้ำแม่ละมัย', '91หมู่ ที่5 บ.สี่แจ ต.ผาสุก อ.กุมภวาปี จ.อุดรธานี41370', '928169829', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00982', 'นางสาว กนกพรรัตน์ โพธิ์ชัยยา', '384 ม.4 บ.วาปี ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '081-2600561', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00983', 'ร้านส่องศรี บ้านน้ำฆ้อง', '163 บ้านน้ำฆ้อง ต.พันดอน อ.กุมภวาปี จ.อุกรธานี', '917213634', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00984', 'นางสาวเยาวรัตน์ ผ่านสำแดง', '97 ม.1 ต.แชแล อ.กุมภวาปี จ.อุดรธานี', '080-7474848', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00985', 'แม่ตุ้ม อยู่หน้าโรงเรียนบ้านโคกสว่าง', 'บ้านโคกสว่าง', '829785697', NULL, NULL, 'https://goo.gl/maps/dNnvMYnjMPo2MwC26', NULL, '17.192692, 102.842329', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00986', 'พี่ทิว โนนสะอาด', NULL, '846863919', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00987', 'ร้านหมูทองการค้า', '254 หมู่ 4 ต.ผาสุก อ.กุมภวาปี จ.อุดรธานี 41370', '831417498', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00988', 'จ.เจริญทรัพย์', '212 ม.7 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '862242097', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00989', 'ผศ.พ.ต.หญิง นภาเพ็ญ จันทขัมมา', 'มหาวิทยาลัยสุโขทัยธรรมมาธิราช 9/9 หมู่ 9', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00990', 'สกุลทอง', '161/1 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '988604386', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00991', 'ร้าน 789 เจริญการค้า', 'เลขที่ 63 ม.2 ต.น้ำเที่ยง อ.คำชะอี จ.มุกดาหาร 49110', '629563282', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00992', 'โรงเรียนบ้านสวนหม่อน', '180 ม.6 ต.เชียงแหว อ.กุมภวาปี จ.อุดรธานี', '872595173', NULL, NULL, 'https://goo.gl/maps/RzJvHZupXyDewhRR9', NULL, '17.249063, 103.024321', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00993', 'ร้านปังปัง [โดม]', '374 บ้านท่าลี่ อ.กุมภวาปี ต.ท่าลี่ จ.อุดรธานี 41110', '983710102', NULL, NULL, 'https://goo.gl/maps/XTcYE6QEo4QedkCN6', NULL, '16.962490, 103.072000', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00994', 'ร้านตั้งทรัพย์อนันต์', '391/3 หมู่ 2 ถ.ยิ้มประสิทธิ์ ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี', '868545804', NULL, NULL, 'https://goo.gl/maps/QWRN9BhzdyibnhTe9', NULL, '17.109539, 103.015235', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00995', 'เจ้ นี', '45 ม. 7 บ้านเชียงแหว ต.เชียงแหว อ.กุมภวาปี จ.อุดรธานี', '933685443', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00996', 'ร้าน ประภัสสร', '156 ม.4 ต.บ้านฝาง อ.กระนวน จ. ขอนแก่น 40170', '645821594', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00997', 'ร้านจีออโต้ซี๊ด', '85 ม.8 บ้านโนนวัฒนา ต.ห้วยเกิ้ง อ.กุมภวาปี จ.อุดรธานี', '832916329', NULL, NULL, 'https://goo.gl/maps/Ekmu718LuqhEPjCZ7', NULL, '17.049353, 102.926196', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00998', 'นาย เอี่ยมเส็ง เวียนศิริ', '99/21 ม.4 ต.บึงยี่โถ อ.ธัญบุรี จ.ปทุมธานี 12130', '091-0095352', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-00999', 'จำปา การค้า', 'บ้านโนนเห็น 32 หมู่8 ต.เวียงคำ อ.กุมภวาปลี จ.อุดรธานี', '822581105', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01000', 'นพรดารุ่งเรืองทรัพย์', '31 ม.8 บ้านเชียงกรม ต.นาม่วง อ.ประจักษ์ศิลปาคม จ.อุดรธานี 41110', '872341883', NULL, NULL, 'https://goo.gl/maps/DijLrWnTdZeLbGK28', NULL, '17.287404, 102.960025', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01002', 'แม่แดง บ้านเชียงแหว', '89 ม.2 บ.เชียงแหว ต.เชียงแหว อ.กุมภวาปี จ.อุดรธานี', '811368668', NULL, NULL, 'https://goo.gl/maps/v7ty7P3s2pynuRjD8', NULL, '17.181364, 103.001603', '2026-07-23 11:48:49', '08:00', '17:00');
INSERT INTO `store` (`store_id`, `store_name`, `store_address`, `telephone_number`, `fax_number`, `email`, `url`, `customer_delivery_time`, `store_location`, `created_at`, `open_time`, `close_time`) VALUES
('OR-01003', 'เชียงแหว เจริญพาณิชย์', '147/11 บ้านเชียงแหว ตำบลเชียงแหว อำเภอกุมภวาปี จังหวัดอุดรธานี', '800069031', NULL, NULL, 'https://goo.gl/maps/V4bGtHtKhPvR3LBB6', NULL, '17.180884, 102.998306', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01004', 'ยายโต่น', 'บ้านดอนแคน หมู่12 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '834041852', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01005', 'นส.ปาริชาติ พิณแย่ง', '567/23 ถ.อ่อนนุช แขวงอ่อนนุช เขตสวนหลวง จ.กรุงเทพมหานคร 10250', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01006', 'ร้านสมศักดิ์', '44 ม.6 บ้านแสงทอง ต.หนองแสง อ.หนองแสง จ.อุดรธานี 41340', '879193501', NULL, NULL, 'https://goo.gl/maps/o8pePEfYYg8adabE8', NULL, '17.147058, 102.850963', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01007', 'ร้าน มาลองสเต็ก', '232 ม.4 ต.ทับกุง อ.หนองแสง จ.อุดรธานี 41340', '943641253', NULL, NULL, 'https://goo.gl/maps/Yp12cEqpVd3X6J4L7', NULL, '17.171438, 102.810206', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01008', 'โรงเรียนอนุบาลโนนสะอาด', 'ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี 41240', '8107509455', NULL, NULL, 'https://goo.gl/maps/Ccobptj6qBELjVnJ9', NULL, '16.978985, 102.898100', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01009', 'เฮียโอ้', NULL, '806587717', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01010', 'เจ้เหมียว', '3 ม.9 ต.ทับกุง อ.หนองแสง จ.อุดรธานี 41340', '627471778', NULL, NULL, 'https://goo.gl/maps/Wazui1iZVpuEuQ8R7', NULL, '17.157223, 102.785100', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01011', 'นางอรไพลิน อุสาพรหม', '23/1 หมู่12 ต.ศรีสุทโธ อ.บ้านดุง จ.อุดรธานี', '657404646', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01012', 'ร้าน พี่อุ้ม', '173 หมู่6 ต.หนองกุงศรี อ.โนนสะอาด จ.อุดรธานี', '087-2189382', NULL, NULL, 'https://goo.gl/maps/gwcBAnAEReQni54E7', NULL, '17.016582, 102.802032', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01013', 'กองทุนหนองกุงศรีหมู่ 6', 'บ้านหนองกุงศรี', '0884581541/หน้าร้าน', NULL, NULL, 'https://goo.gl/maps/6xV4wcDpVWCBkvP58', NULL, '17.016372, 102.803032', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01014', 'แม่บุญเถิง บ.บุ่งแก้ว', '261 ม.13 บ.บุ่งแก้ว ต.บุ่งแก้ว อ.โนนสะอาด จ.อุดรธานี', '061-0429937', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01015', 'ร้าน แม่นาง บ.สามเหลี่ยม', '106 ม.4 บ้านสามเหลี่ยม ต.ทับกุง อ.หนองแสง จ.อุดรฯ 41340', '842191953', NULL, NULL, 'https://goo.gl/maps/NvHeikxqbEDNaom2A', NULL, '17.172020, 102.801000', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01016', 'ร้านเหมยมินิมาร์ท', '197 หมู่3 บ้านโพธิ์ชัย ตำบลโพธิ์ศรีสำราญ อำเภอโนนสะอาด จังหวัดอุดรธานี', '934363304', NULL, NULL, 'https://goo.gl/maps/t8LvLn8Ta6SvteXu7', NULL, '16.982531, 102.826000', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01017', 'ร้านน้องเท่', '32/5 บ.เสาเล้า ต.โพธิ์ศรีสำราญ อ.โนนสะอาด จ.อุดรธานี', '061-3323478', NULL, NULL, 'https://goo.gl/maps/fHoBmB2VZnVN7Qpt6', NULL, '16.951031, 102.845968', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01018', 'ร้าน แม่ปอ บ.โคกศรี', '34 ม3 บ้านโคกศรี ต.นาดี อ.หนองแสง จ.อุดรธานี', '875183027', NULL, NULL, 'https://goo.gl/maps/CuQKrkBuP9g96sXV6', NULL, '17.046831, 102.828000', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01019', 'ร้านกองทุนบ้านโนนทอง ม.3', 'ม.3 ต.หนองกุงศรี', NULL, NULL, NULL, 'https://goo.gl/maps/k7oWt9uHSWCNjKx2A', NULL, '17.039072, 102.771054', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01020', 'กองทุนบ้านโนนคำเจริญ หมู่4', 'บ้านโนนคำเจริญ หมู่4 ตำบลหนองกุงศรี', NULL, NULL, NULL, 'https://goo.gl/maps/mK2iBK7h7ENTUHwL6', NULL, '17.041582, 102.770989', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01021', 'ร้านทรัพย์เจเจ', '200 ม.3 บ้านโคกศรี ต.นาดี อ.หนองแสง จ.อุดรธานี 41340', '903515339', NULL, NULL, 'https://goo.gl/maps/B1Tbdyy3XrCNd27o8', NULL, '17.047359, 102.830271', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01022', 'พี่อุบลรัตน์ ท่าคันโท', '96 ม.8 บ้านท่าคันโท ต.ท่าคันโท จ.กาฬสินธุ์', '811887394', NULL, NULL, 'https://goo.gl/maps/2yi7phrUgJCVyBDG9', NULL, '16.936579, 103.232059', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01023', 'ร้าน น้าจ่อย', '97 ม.3 ต.นาม่วง อ.ประจัก จ.อุดรธานี', '982085505', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01024', 'ร้าน ณะโม', 'โรงแป้งเชาน์ดีอีสาน 261 ม.8 ต.เวียงคำ อ.กุมภวาปี จ.อุดรธานี', '085-6324868', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01025', 'ไพวรรณการค้า', '5 ม.6 ต.บุ่งแก้ว อ.โนนสะอาด จ.อุดรธานี 41240', '890148582', NULL, NULL, 'https://goo.gl/maps/uNo7VmiYsJjpiMZ18', NULL, '16.970611, 102.976942', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01026', 'บริษัท กรณ์เกล้า มาร์เก็ตติ้ง จำกัด', '16/7 ถนน สงเปลือย ต.กาฬสิน อ.เมือง จ.กาฬสินธุ์ 46000', '081-6708691', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01027', 'โรงเรียนกุมภวาปี', '164 ม.3 ถ.นายูง อ.กุมภวาปี จ.อุดรธานี', '981015265', NULL, NULL, 'https://goo.gl/maps/ecjKWWQCyq6vfv359', NULL, '17.103930, 103.009247', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01028', 'แม่แก้ว บ.บะยาว', '268 ม.8 บ.บะยาว ต.บุ่งแก้ว อ.โนนสะอาด จ.อุดรธานี 41240', '656384414', NULL, NULL, 'https://goo.gl/maps/xaahdhYfiYWcLDEb9', NULL, '16.948259, 103.021894', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01029', 'น.ส.บริบูรณ์ ฝ่ายแก้ว', 'เลขที่ 62 ม.4 ต.ทมนางาม อ.โนนสะอาด จ.อุดรธานี', '826704566', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01030', 'ร้านภูมิพัตร บ.กุดยาง', '44 ม.2 บ้านกุดยาง ต.ท่าลี อ.กุมภวาปี 41110', '0828243734/ไลน์', NULL, NULL, 'https://goo.gl/maps/TUTxY8gEycy7wUWZ6', NULL, '16.955556, 103.042229', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01031', 'น้องกีต้าร์ มินิมาร์ท', '181 ม.14 บ้านหนองศรีเจริญ ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '836452728', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01032', 'โรงเรียนพันดอนวิทยา', NULL, '830399497', NULL, NULL, 'https://goo.gl/maps/MDdMcPzKPTcBWwuL7', NULL, '17.153775, 102.964928', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01033', 'หจก พีเค เจริญทรัพย์2021', '125/21ม.3 ต.หนองบัว อ.เมือง จ.อุดรธานี 41000', '984046443', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01034', 'ร้านมะม่วงน้ำปลาหวาน', 'บ้านเลขที่ 60/75 บ.ศิลา ต.ศิลา อ.เมือง จ.ขอนแก่น 40000', '864526689', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01035', 'ร้านสุภัสสร บ้านป่ากุง', '77 ม.3 บ้านป่ากุง ต.ห้วยเกิ้ง อ.กุมภวาปี จ.อุดรธานี', '823131387', NULL, NULL, 'https://goo.gl/maps/Z1Yj1qp2hgRy9mVx5', NULL, '17.040804, 102.916552', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01036', 'ร้านจิมยงค์', '60 ม.4 บ.ดินแดน ต.ค้อใหญ่ อ.กู่เเก้ว จ.อุดรธานี 41130', '985082542', NULL, NULL, 'https://goo.gl/maps/cS45BRaPBgp1byNt7', NULL, '17.210381, 103.141372', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01037', 'ร้าน ยุทธนาพานิชย์', '40 ม.3 บ.ค้อคำ ต.ค้อใหญ่ อ.กู่แก้ว จ.อุดรธานี 41130', '630825976', NULL, NULL, 'https://goo.gl/maps/U6A9f5jB5H6YzMXXA', NULL, '17.209345, 103.145277', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01038', 'หจก.พรมเจริญทรัพย์2556', '232 ม.16 บ.น้ำฆ้อง ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '088-0539624', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01039', 'ร้านปิยวัฒน์ วัฒธน', '16 ม.3 ต.หนองช้าง อ.สามชัย จ.กาฬสินธุ์', '846305337', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01040', 'นางผกามาศ จันทร์ดี', '227 หมู่ 7 บ้านนาเหล่า ต.หนองกุงศรี อ.โนนสะอาด จ.อุดรธานี 41240', '955867035', NULL, NULL, 'https://goo.gl/maps/9esiPcSnvF1hbVqw8', NULL, '17.058719,102.786587', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01041', 'ร้าน สุขประกอบ', '58 ม.6 ต.หนองกุงศรี อ.โนนสะอาด จ.อุดรธานี', '093-4346534', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01042', 'กองทุนหมู่บ้านคำหว้าทองน้อย ม.9', '4 หมู่ 9 ต.ทับกุง อ.หนองแสง จ.อุดรธานี 41340', '960039200', NULL, NULL, 'https://goo.gl/maps/SxhMuesoEK4E7eYu6', NULL, '17.155810, 102.787367', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01043', 'แม่น้อย บ้านเหล่าหมากบ้า', '5 ม.7 บ้านเหล่าหมากบ้า ต.แชแล อ.กุมภวาปี จ.อุดรธานี 41110', '896772509', NULL, NULL, 'https://goo.gl/maps/RZW9mrJZvHNGfcTQ6', NULL, '17.159874, 103.057689', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01044', 'น้องปันปัน', '149 ม.2 บ้านห้วยบง ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี', '883028327', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01045', 'ร้านรัดดาฟิล์ม', '150 หมู่ 1 บ้านหนองแสง ต.หนองแสง อ.หนองแสง จ.อุดรธานี', '981820366', NULL, NULL, 'https://goo.gl/maps/LgAhXLU336fhUTCj9', NULL, '17.142191, 102.849306', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01046', 'ร้านของแม่', '94 ม.3 ต.ห้วยพิชัย อ.ปากชม จ.เลย 42150', '646246695', NULL, NULL, 'https://goo.gl/maps/Z4CDrWGCPPE9ECYx6', NULL, '17.128864, 102.964721', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01047', 'แม่วิไล บ้านหนองเหี้ย', '64 ม.10 บ้านหนองเหี้ย ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี', '621576621', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01048', 'แม่มะลิวรรณ บ้านนาแบก', '132 ม.17 บ้านนาแบก ต.เวียงคำ อ.กุมภวาปี จ.อุดรธานี', '934206887', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01049', 'ลุงฟ้า', '57 ม.9 ต.โคกกลาง อ.โนนสะอาด จ.อุดรธานี', '810529862', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01050', 'ร้าน ปลื้มใจ', '210 ม.9 ต.อุ่มจาน อ.ประจักษ์ศิลปาคม จ.อุดรธานี 41110', '954281088', NULL, NULL, 'https://maps.app.goo.gl/cdvk9bqkvrczKXKD8', NULL, '17.260391, 103.035514', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01051', 'ร้าน ลิลลี่ 20 บาท', '5758 หมู่ 4 บ้านวาปี ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '961744829', 'เปิด 10โมง ถึง 1 ทุ่', NULL, 'https://goo.gl/maps/d2dVThMqbotUMSxp8', NULL, '17.128927, 102.944280', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01052', 'ร้านน้ำต้นคูน ตรงข้ามอินชอนเนื้อย่าง', '213 ม.2 ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี', '627756349', NULL, NULL, 'https://goo.gl/maps/xvyCxzFdhVBuVpyh9', NULL, '16.972794, 102.896641', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01053', 'ร้านพงษ์พรรณ์', NULL, '957027463', NULL, NULL, 'https://maps.app.goo.gl/ptL9efwntcwHCU6JA', NULL, '16.967756, 103.096667', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01054', 'พอใจการเกษตร', '151 ม.5 บ้านโคกสว่าง ต.หนองแสง อ.หนองแสง จ.อุดรธานี 41430', '963171079', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01055', 'ร้านหมู่บ้าน หนองอึ่ง', '94 หมู่ 6 บ หนองอึ่ง ต นายูง อ ศรีธาตุ จ อุดรธานี', '651030041', NULL, NULL, 'https://goo.gl/maps/5vpQG5G2E4H8vdg49', NULL, '16.981705, 103.270312', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01056', 'แม่ออง บ้านเสาเล้า', '194 ม.10 บ้านเสาเล้า ต.โพธิ์ศรีสำราญ อ.โนนสะอาด จ.อุดรธานี', '963184224', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01057', 'ร้านสุขทวีมินิมาร์ท', '53 หมู่ 6 บ้านดงมะไฟ ต.หนองหว้า อ.กุมภวาปี อุดรธานี', '0942754488/099019488', NULL, NULL, 'https://goo.gl/maps/bBeJeTyRi6spWaps7', NULL, '17.033534, 102.998767', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01058', 'ร้านธนะชัยการค้า', '304 ม.3 ต.บะยาว อ.วังสามหมอ บ้านนานกชุม จ.อุดรทานี 41280', '652905817', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01059', 'ร้านค้า ประชารัฐบ้านนาแก', 'ม.2 ซ.บ้านนาแก ต.บะยาว อ.วังสามหมอ จ.อุดรธานี 41280', '835101939', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01060', 'ร้านบ้านเพื่อน ณ หนองแสง', '256 หมู่ 11 บ้านทับกุง ต.ทับกุง อ.หนองแสง จ.อุดรธานี 41340', '089-8635368', 'ปิดร้านทุกวันอาทิตย์', NULL, 'https://goo.gl/maps/KAhyP4jPWZS4j14Q9', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01061', 'วิลัยวรรณ คำเบ้าเมือง', '196 ม.2 บ.นาฝาย ต.นาดี อ.หนองแสง จ.อุดรธานี 41340', '084-4756790', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01062', 'แม่บัว พ่อประสพ สุระเสน', '7 หมู่ 2 บ้าน ดอนดง ต.อุ่มจาน อ.ประจักษ์ จ.อุดรธานี', '853259680', NULL, NULL, 'https://goo.gl/maps/w6aFyLGeDCLzk2DF6', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01063', 'ร้าน นายคมเขต', '3 หมู่ 10 บ้านคำเจริญ ต.พันดอน อ.กุมภวาปี', '956829925', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01064', 'โนบิชา สาขาพันดอน', '44 ม.16 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '638319070', NULL, NULL, 'https://goo.gl/maps/93k7XrQFtkuMapxb6', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01065', 'น.ส.ธันยธรณ์ ยางธิสาร', '80 ม.3 ต.ปะโค อ.กุมภวาปี จ.อุดรธานี', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01066', 'นางพิชญากร สีหาโคตร', NULL, '0929059166/ไลน์', NULL, NULL, 'https://goo.gl/maps/BGQxg8k4QiX7dTVv5', NULL, '16.963685, 103.077323', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01067', 'หจก.แสงรวินท์', '72 ม.12 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01068', 'นางสาวพนิดา สอนสกุล', 'เลขที่ 56 ม.3 บ้านนาฮี ต.นายูง อ.ศรีธาตุ จ.อุดรธานี 41230', '801645341', NULL, NULL, 'https://goo.gl/maps/2bSmcjkBNemWbwXJ9', NULL, '16.985700, 103.262085', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01069', 'ร้าน ปิยวัฒน์', '16 ม.3 ต.หนองช้าง อ.สามชัย จ.กาฬสินธุ์ 46180', '846305337', NULL, NULL, 'https://goo.gl/maps/Gf1ZVScejjEx6zVW8', NULL, '16.861783, 103.576868', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01070', 'ร้านกาแฟเสือป่าคอฟฟี่', '324 ม.7 บ้านเหล่าหมากบ้า ต.แชแล อ.กุมภวาปี จ.อุดรธานี 41110', '983391724', NULL, NULL, 'https://goo.gl/maps/TZN2vg5rSoHr9ZVNA', NULL, '17.156056, 103.071498', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01071', 'แม่หงส์ ห้วยกองสี', '211 ม.6 บ.ห้วยกองสี อ.กุมภวาปี จ.อุดรธานี', '080-7616212', NULL, NULL, 'https://maps.app.goo.gl/pT8E3umi8jYSjL886', NULL, '17.084151, 102.932300', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01072', 'ร้านคำพอง บ้านท่าหนองเทา', '128 ม.2 บ้านท่าหนองเทา ต.เวียงคำ อ.กุมภวาปี จ.อุดรธานี', '808140486', NULL, NULL, 'https://maps.app.goo.gl/pHnbdzAp9TMjQEus6', NULL, '17.095304, 103.034473', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01073', 'พยอม', '271 ม.6 บ้านยางหล่อ ต.แชแล อ.กุมภวาปี จ.อุดรธานี 41110', '927716993', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.14637071797214,103.04339616372333', NULL, '17.146411, 103.043384', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01074', 'วัดสว่างโยมาลัย บ้านท่าเปลือย', 'เลขที่ 172 ม.11 บ้านท่าเปลือย ถ.ริมปาว ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี', '652727805', NULL, NULL, 'https://goo.gl/maps/AS2Q7vMwWHzhiN687', NULL, '17.135573, 103.025052', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01075', 'นายสิทธิรัตน์ พิพิธหิรัญการ', '158/6 ถ.อุดร-สกล ต.หนองบัว อ.เมืองจ.อุดรธานี 41000', '625748953', NULL, NULL, 'https://goo.gl/maps/FxfTPFtuVgdzzFYh8', NULL, '17.368376, 102.860713', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01076', 'ร้าน อีซี่ มาร์ท', '12/2 บ้านนาฝาย ต.นาดี อ.หนองแสง จ.อุดรธานี', '624011997', NULL, NULL, 'https://maps.app.goo.gl/pB8Xz9cGJnBiJZc17', NULL, '17.083910, 102.857940', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01077', 'บริษัท หยกกิ่งเพชรการค้า จำกัด', '202 ม.3 ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '805729441', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01078', 'แม่พิศมัย บ้านนาหนองทม', '245 ม.9 บ้านนาหนองทม ต.พันดอน อ.กุมภวาปี', '810479861', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01079', 'ร้าน แบมแบม', '202 ม.8 ต.บุ่งแก้ว อ.โนนสะอาด จ. อุดรธานี 41240', '0935474166/แอพ+ไลน์', NULL, NULL, 'https://goo.gl/maps/1XB1d8kP9kfcREMm9', NULL, '16.951940, 103.026662', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01080', 'เจ้แดง ติดร้านตุ๊กตาตลาดสด กว.', NULL, '850116478', NULL, NULL, 'https://maps.app.goo.gl/LemUfEZAs2Fe6RKA6', NULL, '17.110873, 103.014948', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01081', 'แม่แก้ว บ้านโนนสวรรค์', '61 ม.7 บ้านโนนสวรรค์ ต.เสอเพอ อ.กุมภวาปี จ.อุดรธานี', '801939402', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01082', 'แม่ทองหนุน บ้านเซียบ', '156 ม.9 บ้านเซียบ ต.เชียงแหว อ.กุมภวาปี จ.อุดรธานี', '929502471', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01083', 'นางบัวรอน รินทะรักษ์', '166 ม.8 บ้านนาดี ต.นาดี อ.หนองแสง จ.อุดรธานี', '632675829', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01084', 'อาจุมม่า คาเฟ่', '18 หมู่ 4 ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '839801315', NULL, NULL, 'https://maps.app.goo.gl/erS5dZ3V7eai1yq2A', NULL, '17.067284, 102.887559', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01085', 'แม่เพชรรัตน์ บ้านโนนสำราญ', '96 ม.6 บ้านโนนสำราญ ต.ท่าคันโท อ.ท่าคันโท จ.กาฬสินธุ์', '868583096', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01086', 'พ่อกว้าง บ้านตูมกลาง', '189 ม.2 บ้านตูมกลาง ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี', '983585536', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01087', 'แม่ทอง บ้านห้วยกองสี', '41 ม.6 ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี', '902737276', NULL, NULL, 'https://goo.gl/maps/sZrnL6KtCJpwgDtb7', NULL, '17.077453, 102.936996', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01088', 'เจ๊หมิงพาณิชย์', 'เลขที่ 187 ม.12 บ้านดอนเงิน ต.แชแล อ.กุมภวาปี จ.อุดรธานี', '0816010149/087644331', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01089', 'บ้านตู้เซ่เว่นหน้าบ้าน', NULL, '922456246', NULL, NULL, 'https://goo.gl/maps/dBAKftHc66DEQWnw5', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01090', 'ร้านทีแอล', 'หลังโรงพักกุมภวาปี', '610391782', NULL, NULL, 'https://goo.gl/maps/RnykJn5mqAmugsYg7', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01091', 'ร้าน 407', 'ร้าน 407 บ้านวาปี ม.4 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '972138197', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01092', 'ร้านฤทัย พาณิชย์', '117 หมู่1 บ้านค้อใหญ่ ต.ค้อใหญ่ อ.กู่แก้ว', '992311447', NULL, NULL, 'https://goo.gl/maps/XDcNPmtj9cAsuGMU7', NULL, '17.211050, 103.147190', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01093', 'ศรีบุญรอง', NULL, '828364780', NULL, NULL, 'https://goo.gl/maps/WGvyBzKh8GzBCKNq6', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01094', 'ร้านมาดี', '238 หมู่ 11 บ.ทางพาด ต.คำม่วง อ.เขาสวนกวาง จ.ขอนแก่น 40280', '813919549', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01095', 'วัดป่าสุขใจ(กุมภวาปี)', 'บ้านสงเปลือย ต.เสอเพลอ อ.กุมภวาปี', '959201164', NULL, NULL, 'https://goo.gl/maps/ge9SzDCFmLTNzcMM8', NULL, '17.189240, 102.896505', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01096', 'แม่สมพร บ้านดงแคน', 'เลขที่ 19 ม.11 บ้านดงแคน ต.พันดอน อ.กุมภวาปี', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01097', 'บริษัท นวโลหะไทย จำกัด สำนักงานใหญ่', '1 หมู่ 9 ต.บ้านครัว อ.บ้านหมอ จ.สระบุรี 18270', '36288300', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01098', 'จารุณี', '63 ม.8 บ.กงพาน ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '081-0610584', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01099', 'ร้านขายของเฮือนน้อย', '14 ม 8 บ้านกงพาน ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '840020102', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.118671,102.968457', NULL, '17.118902, 102.968414', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01100', 'ร้าน เอื้อการค้า', '203 หมู่ 11 ตำบล ตาดทอง อำเภอ ศรีธาตุ จังหวัด อุดรธานี', '952818815', NULL, NULL, 'https://goo.gl/maps/Mgzw7EvxyFWVdkVh6', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01101', 'ร้าน สวัสดี', '305 ม.4 บ.บุ่งหมากลาน ต.ปะโค อ.กุมภวาปี จ.อุดรธานี', '063-6327157', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01102', 'นาง ดวงใจ เพ็งคำ', '26 ม.3 บ.นานกชุม ต.บะยาว อ.วังสามหมอ จ.อุดรธานี', '092-6530205', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01103', 'ร้าน ก๋วยเตี๋ยวพิราบรัตน์', '1 หมู่ 6 บ.สวนมอญ ต.เชียงเเหว', '649407443', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01104', 'สหกรณ์หมู่บ้านเหล่าใหญ่', 'ม.4 บ้านเหล่าใหญ่ ต.แชแล อ.กุมภวาปี จ.อุดรธานี 41110', '090-4884518', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01105', 'ร้าน ใบบุญสังฆภัณฑ์', '271 ม.1 บ.นาม่วง ต.นาม่วง อ.ประจัก จ.อุดรธานี', '093-5044235', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01106', 'ร้าน แม่ยา บ.เชียงแหว', '162 ม.11 บ.เชียงแหว ต.เชียงแหว อ.กุมภวาปี จ.อุดรธานี', '065-5873997', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01107', 'ร้านแชมป์ & แอมป์ มินิมาร์ท', '316 หมู่ 2 บ้านกุดยาง ต.ท่าลี่ อ.กุมภวาปี จ.อุดรธานี', '0615896435/แอพ', NULL, NULL, 'https://goo.gl/maps/mveKmFehzU6X5HFv5', NULL, '16.953372, 103.042674', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01108', 'ณัฐฐิญา คำม่วง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01109', 'ร้าน เบียโบ', '188/2 บ.ดงเรือง ต.ผาสุก อ.กุมภวาปี จ.อุดรธานี 41370', '832731517', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01111', 'ร้านเฮียฟลุ๊ค', '56/1 ม.3 บ้านสี่แจ ต.ผาสุข อ.กุมภวาปี จ.อุดรธานี', '956708884', NULL, NULL, 'https://goo.gl/maps/2tFpnmVQDNPMC9q19', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01112', 'ร้านมีพันธ์', 'เลขที่ 23 ม.9 บ.เทพอำนวย ต.โนนสมบูรณ์ อ.เขาสวนกวาง จ.ขอนแก่น', '083-2899998', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01113', 'ภาโนมัยการค้า', '205 หมู่ 10 ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี', '951852498', NULL, NULL, 'https://goo.gl/maps/K5UWgbBym8nJ3MLk7', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01114', 'ร้าน ตามสั่งยายพรรณี', '21 ม.9 บ.โนนผาสุข ต.ผาสุข อ.กุมภวาปี จ.อุดรธานี', '0935573934 หลังเมษาจ', NULL, NULL, 'https://goo.gl/maps/guEMqRTuGA5NJwhq6', NULL, '17.176978, 102.943643', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01115', 'ห้างหุ้นส่วนจำกัด ยอดยิ่ง โฮลเซล (ไทยแลนด์)', '409/4,409/5 หมู่ที่7 ซอยศรีอผดุง2 ถนนสิทธิประศาสตร์ ตำบลศรีสุทโธ อำเภอบ้านดุง จังหวัดอุดรธานี 41190', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01116', 'ร้าน แม่นงค์การค้า', '146 ม.1 บ.นาฝาย ต.นาดี อ.หนองแสง จ.อุดรธานี 41340', '063-5824047', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01117', 'บ้านฝน ยายเบียบ', '691 หมู่ 15 ต.พันดอน อ.กุมภวาปี ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '817338820', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01118', 'ร้านมุทิตา บ้านเลา', '21 ม.8 บ้านเลา ต.เชียงแหว อ.กุมภวาปี จ.อุดรธานี', '872389633', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01119', 'เจ้กาน โรงงานน้ำตาลเกษตรผล', 'ในโรงงานน้ำตาลเกษตรผล ต.ปะโค', '862300910', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01120', 'หนองหานซุปเปอร์', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01121', 'ฐิติกาญจน์ โพธิ์ศรีทา', '96 ม.15 ต.พันดอน กุมภวาปี ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '889416162', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01122', 'น้องเอ๋ย ชานมไข่มุก', '15 หมู่ 11 บ.โพธิ์งาม ต.บ้านโปร่ง อ.ศรีธาตุ จ.อุดรธานี', '624485916', NULL, NULL, 'https://goo.gl/maps/o1evzJDFMaG7PAiK7', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01123', 'บริษัท สยามนิสสันเมืองหนองบัวลำภู จำกัด', '339-340 หมู่ 10 ถ.อุดร-เลย ต.ลำภู อ.เมือง จ.หนองบัวลำภู 39000', '042-36101689', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01124', 'นางธมลวรรณ พุทธอินทรา', '336 หมู่ 8 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01126', 'แม่ปรารถนา บ้านโพนทอง', '56 ม.6 บ้านโพนทอง ต.อุ่มจาน อ.ประจักษ์ศิลปาคม', '800055683', NULL, NULL, 'https://goo.gl/maps/8TxjdR875VmNoKKaA', NULL, '17.238181, 103.066639', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01127', 'ร้าน แม่แดง บ.คำแคน', '104 ม.10 บ.คำแคน ต.คอนสาย อ.กู่แก้ว จ.อุดรธานี', '064-1324153', NULL, NULL, 'https://maps.app.goo.gl/dnuW7qXDgn5mjvhNA', NULL, '17.122885, 103.133379', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01128', 'ร้าน แม่อ้อย บ.เหล่าใหญ่', '92 ม.4 บ.เหล่าใหญ่ ต.แชแล อ.กุมภวาปี จ.อุดรธานี', '851487388', NULL, NULL, 'https://goo.gl/maps/rsj5mHePRJXs1D8v5', NULL, '17.175997, 103.080344', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01129', 'คุณ​วรรณ​ภา​ บ.นาฝาย', '8/11​ บ้านนา​ฝาย​ ต.​นาดี อ.​หนอง​แสง​ จ.​อุดรธานี', '986604833', NULL, NULL, 'https://goo.gl/maps/GebrhY5aKxTRzC7e8', NULL, '17.088524, 102.854711', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01130', 'หนึ่งฤทัย ฤทธิมนตรี', '212 ม.5 บ.หนองแวงใหญ่ ต.แชแล อ.กุมภวาปี จ.อุดรธานี', '064-1571814', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01131', 'โรงเรียนบ้านห้วยกองสี', 'บ้านห้วยกองสี', '931019908', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01132', 'บริษัท บุญรอคบริวเวอรี่ จำกัด', '999 ถนนสามเสน แขวงถนนนครไชยศรี เขตดุสิต กรุงเทพมหานคร 10300', '084-7899105', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01133', 'พี่อ๋อม บ้านโคกหนองแวง', '145 ม.9 บ้านโคกหนองแวง ต.นายูง อ.ศรีธาตุ จ.อุดรธานี', '918692296', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01134', '456 หมูกระทะ', 'ต.บ้านจีด อ.กู่แก้ว จ.อุดรธานี 41130', '933392756', NULL, NULL, 'https://goo.gl/maps/YVnuhuJT7aBdfxGb7', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01135', 'ประชารัฐโนนสวรรค์ ม.10', 'หมู่ 10 ต.หนองกุงศรี อ.โนนสะอาด จ.อุดรธานี', '934148738', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01136', 'พี่นิดหน่อย บ้านนาฮี', '174 ม.8 บ้านนาฮี ต.นายูง อ.ศรีธาตุ', '973096644', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01137', 'พีแอนด์เอ็น บ้านนาแบกน้อย', '204 ม.17 ต.เวียงคำ อ.กุมภวาปี จ.อุดรธานี', '810538706', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01138', 'ร้าน ธนกร ศรีธาตุ', '124 ม.2 บ.ป่าเลา ต.ศรีธาตุ อ.ศรีธาตุ จ.อุดรธานี', '099-0212990', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01139', 'แม่เข็ม บ้านทับไฮ', '224 ต.แสงสว่าง อ.หนองแสง จ.อุดรธานี', '984350759', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01140', 'บริษัท ไจแอนท์ วิลโลว์ จำกัด (สำนักงานใหญ่)', '222 ม.15 ถ.พิศาลสารกิจ ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '086-4651011', NULL, NULL, 'https://goo.gl/maps/FzABuhGr2L9CgCaq7', NULL, '17.130245, 102.960236', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01141', 'สุวรรณี เกิดเคน', 'บ้านแสงสว่าง จ.อุดรธานี', '856833209', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01142', 'เฮียกู้', NULL, '815929755', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01143', 'ครัวสามพี่น้อง ทางพาด', '222 ม.4 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '630699208', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01144', 'จิราภรณ์', '336 ม.12 อ.ศรีธาตุ', '982770446', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01145', 'น้องแก้ม บ้านโคกใหญ่', '163 ม.16 บ.โคกใหญ่ ต.จำปี อ.ศรีธาตุ จ.อุดธานี', '0973212499 / 0825942', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01146', 'เทศบาลกงพาน พันดอน', NULL, '817546316', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01147', 'สหกรบ้านหนองกุง ม.1', 'ต.หนองกุงศรี อ.โนนสะอาด', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01148', 'ร้านกัปตัน กะตังค์ พาณิชย์', '91 ม.5 ต.กุดโดน อ.ห้วยเม็ก จ.กาฬสินธุ์ 46170', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01149', 'บูม สุพพัตรา บ.แสงสว่าง', '129 ม.1 บ้านแสงสว่าง', '952905106', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.12145,102.825266', NULL, '17.121691, 102.825255', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01150', 'บิ๊กบอยเรสเตอรองท์', '162 หมู่3 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธาณี 41110', '0614576894/085644536', NULL, NULL, 'https://goo.gl/maps/16HALe81TMYHJpSr9', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01151', 'ร้านท็อป', '385ม.2ต.ยางอู้มอ.ท่าคันโทจ.กาฬสินธุ์', '643150652', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01152', 'มิตรภาพพาณิช', '180 หมู่ 2 บ้านทมป่าข่า ตำบลทมนางาม อำเภอโนนสะอาด จังหวัดอุดรธานี', '0622366917/แอพ+ไลน์', NULL, NULL, 'https://goo.gl/maps/qArQ1Dwp9oNrTpbLA', NULL, '16.909079, 103.004214', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01153', 'ร้านยายผักกาด', '40 หมู่ 5 บ้านไร่ ต.โคกกลาง อ.โนนสะอาด จ,อุดรธานี 41240', '868438257', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01154', 'ขายออนไลน์ติ๊กต๊อก', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01155', 'นิลสดี ศรีอุปลัด', '82 ม.8 ต.นาดี จ.อุดรธานี', '621592676', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01156', 'ร้าน อ.เจริญพานิชย์', '28 ม.2 บ้านแสงสว่าง ต.แสงสว่าง อ.หนองแสง จ.อุดรธานี 41340', '627787447', NULL, NULL, 'https://maps.app.goo.gl/mL49rmWznsAxhGJFA', NULL, '17.119059,102.820003', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01157', 'หจก.สยามซูแปอร์สโตร์ (2018) สำนักงานใหญ่', '80 ม.2 ต.หนองแวง อ.บ้านผือ จ.อุดรธานี 41160', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01158', 'ร้านแม่แต๋ว', '137/10 บ.วังแสน ต.นาม่วง อ.ประจัก จ.อุดรธานี 41110', '800705631', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01159', 'ห้างหุ้นส่วนจำกัด มุลาอิ (สำนักงานใหญ่)', '418 ม.12 ต.แม่กาษา อ.แม่สอด จ.ตาก 63100', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01160', 'ร้าน ขวัญ 20 บาท', '284 หมู่ 1 บ้านนาม่วง ต.นาม่วง อ.ประจักษ์ จ.อุดรธานี 41110', '095-8715847', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01161', 'เมตตา พาณิชย์', '141 หมู่ 5 ต.อุ้มจาน อ.ประจักษ์ศิลปาคม จ.อุดรธานี 41110', '638782459', NULL, NULL, 'https://goo.gl/maps/jRsYHCutoSh8ym7QA', NULL, '17.237732, 103.068788', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01162', 'เจ้อ๋อย', '103 หมู่ 1 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '895423115', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.111002,103.014315', NULL, '17.111222, 103.014358', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01163', 'ยายบัน โรงเรียนอุ่มจาน', NULL, '862303632', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01164', 'แสงอุทัย การเกษตร', '249 หมู่. ต.โพธิ์ศรีสำราญ อ.โนนสะอาด จ.อุดรธานี 41240', '843927275', NULL, NULL, 'https://maps.app.goo.gl/Ko9ta9qHM1xLSa3i8', NULL, '16.982125, 102.826515', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01165', 'เตี๋ยว เตี๋ยว ตำ ตำ', '38 หมู่2 บ.เหล่าเชียงสม ต.แชแล อ.กุมภวาปี จ.อุดรธานี 41110', '916867463', NULL, NULL, 'https://goo.gl/maps/NPAVtYQuFtCkRECY9', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01166', 'พ่อสิน บ้านหนองหญ้ารังกา', '197 ม.7 ต.ปะโค อ.กุมภวาปี จ.อุดรธานี', '935387975', NULL, NULL, 'https://maps.app.goo.gl/HTKZ7atuy51ur6tc7', NULL, '17.033174, 102.877689', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01167', 'สุมาลี ข้าวมันไก่', '199/2 หมู่1 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '838723193', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01168', 'บิ๊กบอส', '251 หมู่1 บ.นาแบก ต.เวียงคำ อ.กุมภวา จ.อุดรธานี 41110', '899962926', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01169', 'ติงลี่', '115 หมู่ที่ 5 ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี 41110', '092-2548961', NULL, NULL, 'https://goo.gl/maps/uCmqhUBaHSByZT6v6', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01170', 'ผึ้งแซ่บ', '46 หมู่ 6 ต.ห้วยเกิ้ง อ.กุมภวาปี จ.อุดรธานี', '834184983', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01171', 'พี่เก่ง ปตท.', NULL, '627080535', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01172', 'อมร ธงฟ้า', '27 ม.6 ต.โพธิ์ศรีสำราญ อ.โนนสะอาด จ.อุดรธานี', '955490952', NULL, NULL, 'https://goo.gl/maps/EiEkA1xRjWSqYqoy5', NULL, '17.013726, 102.838146', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01173', 'ฟูฟอง บ.โนนมะข่า', '142 ม.3 ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี', '958846895', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01174', 'นาง ประไพร เพียชิน', '41 ม.11 ต.นาม่วง อ.ประจักษ์ศิลปาคม จ.อุดรธานี', '065-3754808', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01175', 'โรงพยาบาลส่งเสริมสุขภาพตำบลสงเปลือย', '153 ม.9 ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01176', 'สมจิตต์ กลมเกลียว', '162 ม.5 ต.ห้วยสามพาด อ.ประจักษ์ศิลปาคม จ.อุดรธานี', '093-0793487', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01177', 'ร้านแม่บังอร บ้านโคกสว่าง', '221 หมู่ 5 บ้านโคกสว่าง ต.หนองแสง อ.หนองแสง จ.อุดรธานี 41340', '954632111', NULL, NULL, 'https://maps.app.goo.gl/dy2t1VdTBbWgdVen6', NULL, '17.190076, 102.843968', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01178', 'สหการบ้านโคกสะอาด', 'ต.หนองหญ้าไซ อ.วังสามหมอ จ.อุดรธานี', '985321502', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01179', 'เทศบาลตำบลพันดอน', '789 ม.15 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01180', 'บุญเฮง บ.ดอนสวรรค์', '134 ม.7 ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี', '957178036', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01181', 'นภาพร พาณิชย์', '38 หมู่ 14 บ.ท่าลี่ ต.ท่าลี่ อ.กุมภวาปี จ.อุดรธานี', '933972759', NULL, NULL, 'https://maps.app.goo.gl/c756hXXgriqoDSxS9', NULL, '16.964086, 103.075949', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01182', 'ห้างหุ้นส่วนจำกัด วรรณประสาทพาณิชย์ [ สำนักงานใหญ่ ]', '233 ม.9 ต.น้ำพอง อ.น้ำพอง จ.ขอนแก่น 40140', '062-6356919', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01183', 'ร้านแม่น้อย', '29 หมู่7 บ้านคำไผ่ ตำบลเวียงคำ อำเภอกุมภวาปี จ.อุดรธานี 41110', '967699578', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01184', 'นาง มณีจันทร์ พีระวัธน์กุล', '117 ม.12 ต.ห้วยสามพาด อ.ประจักษ์ศิลปาคม จ.อุดรธานี', '082-1258038', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01185', 'ร้านนิด(ข้างLกฮ.)', NULL, '933359213', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01186', 'ร้านแม่คา', '30/3 บ.หนองบัวเงิน ต.หนองไผ่ อ.เมือง จ.อุดรธานี 41330', '621295319', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01187', 'ร้านกองทุนหมู่บ้านหนองเม็ก', 'บ้านหนองเม็ก ตำบลอุ่มจาน อำเภอประจักษ์ศิลปาคม จังหวัดอุดรธานี 41110', '659602280', NULL, NULL, 'https://goo.gl/maps/Y19n1JEgGn4fNxsZ7', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01188', 'โชคดีมินิมาร์ท บ้านภูฮัง หมู่ 8', '117 บ้านภูฮัง หมู่ 8 ต.ดงมูล อ.หนองกุงศรี จ.กาฬสินธุ์ 46220', '942718959', NULL, NULL, 'https://goo.gl/maps/6WPXUVkaHWRCibFk9', NULL, '16.811101,103.28581', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01189', 'บริษัท ศรีสวัสดิ์ พาวเวอร์ 2014 จำกัด [ สำนักงานใหญ่ ]', '99/392 อาคารศรีสวัสดิ์ ชั้น3,4,6 ถนนแจ้งวัฒนะ แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพฯ 10210', '657162547', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01190', 'ร้าน มัฆนา เทพสกุล', '219 หมู่ที่ 5 บ้านโนนจำปา ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี 41100', '089-9094077', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01191', 'น้องฟลุ๊ค', 'บ้านหนองโก เลขที่ 10 หมู่7 ต.บุ่งแก้ว อ.โนนสะอาด จ.อุดรธานี', '612960363', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01193', 'ห้างหุ้นส่วนจำกัดเป้งพานิชย์', '608 หมู่ 2 ต.เจริญศิลป์ อ.เจริญศิลป์ จ.สกลนคร', '982298411', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01194', 'ร้านตั้งขายดี [นางรัตนา บุญบุตตะ]', '59 ม.16 บ.ปะโค ต.ปะโค อ.กุมภวาปี จ.อุดรธานี', '081-1764678', NULL, NULL, 'https://maps.app.goo.gl/FGUnLfLSb2jvgfSq7', NULL, '17.101662, 102.939305', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01195', 'บริษัท เอก-ชัย ดีสทริบิวชั่น ชิสเทม จำกัด', 'เลขที่ 239 ม.15 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '626057925', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01196', 'ลอง มา แวร์', '703 ม.2 ต.วังสามหมอ อ.วังสามหมอ จ.อุดรธานี', '952294365', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01197', 'นาง แพงพันธ์', 'เลขที่ 121 บ้าน ดอนเงิน ม.10 ต.แชแล อ.กุมภวาปี จ.อุดรธานี', '849072522', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01198', 'นาย ปัทวุฒิ สุระเสนา', 'บ้าน พันดอน เลขที่ 11 ต.พันดอน อ.ศรีธาตุ จ.อุดรธานี', '957167990', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01199', 'สหกรณ์โรงเรียนมัธยมน้ำตาลอนุสรณ์', NULL, '942857222', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01200', 'สหกรณ์โรงเรียนห้วยแสงอรุณวิทยา', 'หมู่ที่ 7 ต.โพธิ์ศรีสำราญ อ.โนนสะอาด จ.อุดรธานี 41240', NULL, NULL, NULL, 'https://goo.gl/maps/PyMBZrhSHy7KBS9w6', NULL, '17.011464, 102.834305', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01201', 'เกรียงไกรพาณิชย์ วังสามหมอ', 'โรงเรียนอนุบาลวังสามหมอ ต.วังสามหมอ อ.วังสามหมอ จ.อุดรธานี', '942930181', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01202', 'ร้านยุพิน', '52/1 หมู่ 3 บ้านโนนทองคำเจริญ ต.หนองกุงศรี อ.โนนสะอาด จ.อุดรธานี 41240', '857512164', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01203', 'ร้านยายสาว', '257 ม.6 ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี 41370', '621501794', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01204', 'ร้านพี่โจ้', '28 ม.8 บ.ท่ายม ต.แสงสว่าง อ.หนองแสง จ.อุดรธานี 41340', '823970470', NULL, NULL, 'https://goo.gl/maps/pyaEG7SMS3eHxejr6', NULL, '17.141864, 102.786895', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01205', 'ร้านเกริกพลพาณิชย์ [นายเกริกพล ไชยดี ]', '189 หมู่ 6 บ.โนนม่วงโคกใหญ่ ต.จำปี อ.ศรีธาตุ จ.อุดรธานี 41230', '903317746', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01206', 'เปากับปาย', '136 บ้านป่าปอแดง ต.จำปี อ.ศรีธาตุ จ.อุดรธานี', '872373679', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01207', 'คลังสมบัติ', '158 หมู่8 บ้านศรีสวัส ต.โพธิ์ศรีสำราญ อ.โนนสะอาด จ.อุดรธานี', '878595643', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01208', 'ร้านนัดพบ', '429 บ้านวาปี หมู่4 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '610499858', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01209', 'สุดยอดลาบเป็ด', '91 หมู่.9 ต.บ้านโปร่ง อ.ศรีธาตุ จ.อุดรธานี 41230', '882353399', NULL, NULL, 'https://goo.gl/maps/ATHqE2Jvb2cQs9im7', NULL, '17.026434, 103.122930', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01210', 'พี่อุ้ม บ.ปะโค', '44 ม.15 ต.ปะโค อ.กุมภวาปี จ.อุดรธานี', '945042978', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01211', 'แม่ใจ ประเสร็ฐสังข์', '76 ม.9 บ.เซียบ ต.เชียงแหว อ.กุมภวาปี จ.อุดรธานี 41110', '084-3300904', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01212', 'บริษัท ปิโตรเลียมไทย คอร์ปอเรชั่น จำกัด', '90 อาคาร ซี ดับเบิ้ล ยู ทาวเวอร์ เอ ชั้นที่ 33 ถ.รัชดาภิเษก แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร 10310', '21683377', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01213', 'แพทตี้แพน การค้า', '82 ม.1 ต.ห้วยสามพาด อ.ประจักษ์ จ.อุดรธานี', '656342500', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01214', 'ห้างหุ้นส่วนจำกัด ชัยกิจเจริญ อิมพอร์ท เอ็กพอร์ท สำนักงานใหญ่', 'เลขที่ 684 ม.2 ต.แม่ตาว อ.แม่สอด จ.ตาก 63110', '954533989', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01215', 'เทพนิมิตร', '75 หมู่ 8 ต.หนองหวา อ.กุมภวาปี จ.อุดรธานี [ใกล้โรงงานไก่ วัดป่าบ้านโนยอ]', '939784989', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01216', 'ร้านเพ็ญนภา', '216 หมู่10 ต.พังโง อ.หนองหาน จ.อุดรธานี 41130', '821251530', NULL, NULL, 'https://maps.app.goo.gl/3nhRYesJznAH8pEM8', NULL, '17.287683, 103.118508', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01217', 'สามแสง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01218', 'น้องฟ้า ชาลี', '292 บ้านเพียปู่ ต.ไชยวาน อ.ไชยวาน จ.อุดรธานี', '845195942', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01219', 'โรงเรียนหนองแดงวิทโยดม', '119 ม.7 ต.สีออ อ.กุมภวาปี จ.อุดรธานี 41110', '632561533', NULL, NULL, 'https://maps.app.goo.gl/XUD1uR6e9UXwKkgi8', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01220', 'ร้านธีระวัฒน์', '181 ม.4 บ้านหนองแซง ต.นาตาล อ.ท่าคันโท จ.กาฬสินธุ์ 46190', '831457731', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01221', 'เนย นริน', 'หนองวัวซอ 8 ม.11 ต.กุดหมากไฟ อ.หนองวัวซอ จ.อุดรธานี', '980382807', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01222', 'นาย สาภิรมย์ สกุลวา', '195 หมู่ 1 ต.โนนสมบูรณ์ อ.เขาสวนกวาง จ.ขอนแก่น 40280', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01223', 'ร้าน พีรวัส หมูสด', '181 ม.4 บ้านหนองแซง ต.นาตาล อ.ท่าคันโท จ.กาฬสินธุ์ 46190', '809200682', NULL, NULL, 'https://maps.app.goo.gl/wx1gbtP6WB6H7iTR9', NULL, '16.863135, 103.267396', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01224', 'นาย ลือชัย สันประเภท [ ครัวคุณชุ ]', '117 ม.2 ต.อุ่นจาน อ.ประจักษ์ศิลปาคม จ.อุดรธานี', '943345524', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01225', 'พี่อาย โกดัง', 'บ้านคำเจริญ ต.พันดอน อ.กุมภวปี จ.อุดรธานี', '981638183', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01226', 'บริษัท มุกดาเอ็กซ์เพรส จำกัด', '2/30,2/33 ถนนบัวคูณ ต.แม่สอด อ.แม่สอด จ.ตาก 63110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01227', 'แม่ออ บ้านดอนแก้ว', '90 ม.5 บ้านดอนแก้ว อ.กุมภวาปี จ.อุดรธานี', '813699373', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01228', 'นาย ภิญโญ บัวเผื่อน', '145 หมู่ 10 ต.อุ่มจาน อ.ประจักษ์ศิลปาคม จ.อุดรธานี', '817088491', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01229', 'น.ส.กชพร ศรีวิเศษ', '130 หมู่ที่ 10 ต.นาม่วง อ.ประจักษ์ศิลปาคม จ.อุดรธานี 41110', '962266642', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01230', 'พีพี บ้านผือ', 'บ้านผืออุดร', '619274443', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01231', 'วุดดี้ มินิมาร์ท', '276 หมู่ที่ 9 ต.เชียงแหว อ.กุมภวาปี จ.อุดรธานี', '934787928', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01232', 'มาดามหมูสด', NULL, '619297887', NULL, NULL, 'https://maps.app.goo.gl/FuDxDYVdRp7MsApY7', NULL, '17.211242, 102.995751', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01233', 'ร้านแสงประทีป', '12 ม.15 บ.หัวขัว ต.เมืองเพีย อ.กุดจับ จ.อุดรธานี 41250', '829798586', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01234', 'พนักงานอาทป่วง', NULL, '098-6642482', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01236', 'บมจ ธนาคารกรุงไทย สำนักงาน เขตอุดรธานี', 'เลขที่ 199/12 ถ.อุดรดุษฎี ต.หมากแข้ง อ.เมือง จ.อุดรธานี 41000', '042211622-3', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01237', 'ร้านลัดดา', '32 หมู่ 1 บ.กุดจิก ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี 41110', '0801815283/ไลน์', NULL, NULL, 'https://maps.app.goo.gl/egBppxdQjXPuMgWS8', NULL, '17.039454, 102.964840', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01238', 'ร้านประดิษฐ์ บ.หนองหว้า(บ้านกุดจิก)', '51 หมู่1 บ้านกุดจิก ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี 41110', '613348988', NULL, NULL, 'https://maps.app.goo.gl/Tv5F6aQUQE8yu1DD9', NULL, '17.039313, 102.964676', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01239', 'ร้านพอใจ', '58 หมู่ 2 ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี', '833450515', NULL, NULL, 'https://maps.app.goo.gl/2iU1zvFHHFxNyDgc9', NULL, '17.020880, 102.999535', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01240', 'ร้านศรีอักษรการค้า', '426 ม.1 ต.คำครั่ง อ.เดชอุดม จ.อุบลราชธานี 34160', '825511604', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01241', 'ร้านพงษ์พันธ์พาณิชย์ [นายพงษ์พันธ์ แก้วศิลา]', '31 หมู่ที่ 9 ต.ท่าคันโท อ.ท่าคันโท จ.กาฬสินธ์ 46190', '630373186', NULL, NULL, 'https://maps.app.goo.gl/2Nm7TpTN6k84gsts9', NULL, '16.937554, 103.243240', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01242', 'บริษัท น้ำตาลเกษตรผล จำกัด สาขาที่ 1', 'เลขที่ 9 ม.9 ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370 41370', '42398053', NULL, NULL, 'https://maps.app.goo.gl/LkACfNPGsiFRr4kTA', NULL, '17.073353, 102.926641', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01243', 'ราชาข้าว ท่าคันโท', '375 ม.1 ต.นาตาล อ.ท่าคันโท จ.กาฬสินธุ์', '990246583', NULL, NULL, 'https://maps.app.goo.gl/wcsnZnHVNUh8DBuLA', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01244', 'มากินนี่ (อภิสิทธิ์ สรวงศิริ)', '59 หมู่ที่ 15 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '972570537', NULL, NULL, 'https://maps.app.goo.gl/WSj4RB3i6acDcckk7', NULL, '17.109461, 103.015327', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01245', 'ช.พาณิชย์', '465/467 ม.15 บ้านพันดอน', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01246', 'เฮียจิ๊บ', 'บ้านเลขที่ 95 หมู่ที่ 5 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '824968845', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01247', 'ดากอน', '23 หมู่ที่ 2 ต.โนนสมบูรณ์ อ.เขาสวนกวาง จ.ขอนแก่น', '833354569', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01248', 'ฮอดเฮียนค้าส่งทั่วไทย โดย น.ส. จุฑามาศ ชารี', '409/5 หมู่ 7 ต.ศรีสุทโธ อ.บ้านดุง อุดรธานี 41190', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01249', 'กาแฟน้องซัมซุง', 'บ.ห้วยกองสี ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี', '854549260', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01250', 'นาง สุธาวัลย์ อุตโรกุล', '213 หมู่ที่ 5 ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี 41110', '862330583', NULL, 'OR-01250@wawa.com', NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01251', 'บริษัท ที เอ็น วาล์ว แอนด์ เซอร์วิส จำกัด', '64/9 ถ.เทอดไทยมุสลิม ต.มาบตาพุด อ.เมือง จ.ระยอง 21150', '038-692326', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01252', 'นางสาว ยุวธิดา ศรีหร่าย', 'บ้านเลขที่ 47 หมู่ที่ 19 ตำบล พันดอน อำเภอ กุมภวาปี จังหวัด อุดรธานี 41370', '984588787', NULL, NULL, NULL, NULL, '17.130502, 102.924014', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01253', 'แม่สมจิต บ้านนาดี', '194 ม.10 ต.นาดี อ. หนองแสง จ.อุดรธานี 41370', '981898545', NULL, NULL, NULL, NULL, '17.071098, 102.853248', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01254', 'ร้านแม่ อุไรวรรณ หัตถปราณีต', '702 ม15 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '098-2356199', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01255', 'หจก. จิรพร 2023', 'เลขที่ 95 หมู่ที่ 7 ต.แม่ใส อ.เมืองพะเยา จ.พะเยา 56000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01257', 'เนรมิต ดีสิน', '84 หมู่ 6 ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '890620779', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01258', 'กองทุนหมู่บ้านโนนทอง หมู่ 3', 'บ้านโนนทอง ต.หนองกรุงศรี อ.โนนสะอาด จ.อุดรธานี 41240', '933231716', NULL, NULL, 'https://maps.app.goo.gl/ssvXwjKm7gz4Ujd59', NULL, '17.038922, 102.771458', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01259', 'บริษัท พาราเมาท์ อินเตอร์เทรด จำกัด (สำนักงานใหญ่)', '175/1 ซ.ศูนย์การค้าแฮปปี้แลนด์ 1 ถ.แฮปปี้แลนด์สาย 1 แขวงคลองจั่น เขตบางกะปิ กรุงเทพฯ 10240', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01260', 'ร้านเจริญภักดี', '196 ม.9 ต.สีวิเชียร อ.น้ำยืน จ.อุบลราชธานี 34260 34260', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01261', 'คุณ ชิดชะไม คำอินทร์', '115/51 หมู่บ้านเพ็ชรมณี ซอย 3 หมู่4 ต.ป่าแดด อ.เมือง จ.เชียงใหม่ 50100', '091-0788010', NULL, 'Arisrumpung@gmail.com', NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01262', 'ร้านลัคกี้การเกษตร', '287ม.12บ.หนองม่วงต.โคกกลางอ.โนนสะอาดจ.อุดรธานี', '660656996', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01263', 'ศรีสุขสโตร์', '114 ม.9 บ้านศรีสุข ซ.เทศบาล 3 ต.ศรีธาตุ อ.ศรีธาตุ จ.อุดรธานี 41230', '0851082888/083638828', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01264', 'ร้าน กัปตัน ช้อป', '185 ม.1 บ.โพธิ์ศรีสำราญ ต.โพธิ์ศรีสำราญ อ.โนนสะอาด จ.อุดรธานี', '082-8877481', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01265', 'เมียนมา', '198 หมู่ 5 ต.แสงสว่าง อ.หนองแสง จ.อุดรธานี', '634534042', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01266', 'ร้าน สุภาพร นามบุตร', '166 ม.3 ต.แสงสว่าง อ.หนองแสง.จ.อุดรธานี 41340', '926616827', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01267', 'บริษัท เค.ซี.เมททอลชีท จำกัด(มหาชน) สาขาอุดรธานี สาขาที่ 00004', '55 หมู่ 11 ต.หนองไผ่ อ.เมือง จ.อุดรธานี 41330', '085-6814068', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01268', 'ร้านส้มตำอาหารตามสั่ง', '248 หมู่ที่ 17 ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '916884487', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01269', 'หจก.เอื้อปัญญา', '179ม.4 ถ.มิตรภาพ ต.พันดอน อ.กุมภวาปี จ. อุดรธานี', '864589078', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.131185,102.944405', NULL, '17.131467,102.944384', '2026-07-23 11:48:49', '08:00', '17:00');
INSERT INTO `store` (`store_id`, `store_name`, `store_address`, `telephone_number`, `fax_number`, `email`, `url`, `customer_delivery_time`, `store_location`, `created_at`, `open_time`, `close_time`) VALUES
('OR-01270', 'อภิวัตน์ กาลวิบูลย์', '88 หมู่ที่ 7 ต. หนองแสง อ.หนองแสง จ.อุดรธานี 41340', '652697148', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01271', 'สยามเบ็ดเตล็ด', '45 หมู่ที่ 9 บ้านสงเปลือย ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี 41370', '899409418', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.180618,102.900624', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01272', 'ร้าน แม่อ่อนจันทร์', '55 ม.9 บ.เหล่าสีเสียด ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี', '923196470', NULL, NULL, '17.068266, 102.960386', NULL, '17.068266, 102.960386', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01273', 'ร้านเจ้านาย', '190/12บ้านดงสามสิบ ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี', '936294399', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01274', 'นาย ภูวดล นามมา', '74 หมู่ที่ 2 ต.นาคำ อ.บ้านดุง จ.อุดรธานี 41190', '062-4427191', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01275', 'น.ส. กรรณิกา โทพา', '59 ม.1 ต.โนนสะอาด อ.โนนสะอาด จ.อุดร', '930949488', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01276', 'แม่อี๊ด ข้าวแต๋นบ้านดอนแคน', '245 หมู่ 12 บ้านดอนแคน ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '933215710', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01277', 'พิศมัย นารี', '183 หมู่2 บ.กระเบื้อง ต.บุ้งแก้ว อ.โนนสะอาด จ. อุดรธานี จ.อุดรธานี', '985057717', NULL, NULL, 'https://maps.app.goo.gl/rhMTQ8yBaigNtHyq7', NULL, '16.994521, 103.013032', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01278', '95 เฮือนเชียงแหว', '1207 ซ.เพชรเกษม 63 แขวงหลักสอง เขตบางแค จ.กรุงเทพมหานคร', '818340364', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01279', 'บริษัท เดมาร์ เคมีคอล เวิร์ค จำกัด', '94-95 ซอยบรมราชชนนี 39 ถนนบรมราชชนนี แขวงตลิ่งชัน เขตตลิ่งชัน กรุงเทพ 10170', '951931259', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01280', 'นางสาว รวงทอง พรหมสิทธิ์', '1 หมู่ 1 ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี 41370', '956703181', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01281', 'ร้านแม่แอ๋ว', '53 ม.17 บ.บุงหมากลาน ต.ประโค อ.กุมภวาปี จ.อุดรธานี 41370', '935968201', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01282', 'สุภาวดี เกียรติ์พงษ์ลาภ', '187/7ม.2 ต.นาดี อำเภอเมือง จ. อุดร 41000', '910605235', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01283', 'ป.เจริญพาณิชย์', '306 หมู่ที่ 2 ต.ทุ่งใหญ่ อ.ทุ่งฝน จ.อุดรธานี', '854566428', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01284', 'โรงพยาบาลกุมภวาปี [พี่อ้อม]', NULL, '894191402', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01285', 'แม่วาสนา เหล่าเชียงสม', 'บ้านเหล่าเชียงสม ต.แชแล อ.กุมภวาปี จ.อุดรธานี 41110', '647081812', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01286', 'น้องโฟกัส', '127 หมู่ 10 บ้านเสาเล้า ต.โพธิ์ศรีสำราญ อ.โนนสะอาด จ.อุดรธานี 41240', '981103639', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01287', 'นายณัฎฐพัชร์ ปกป้อง', '80 หมู่ 4 ต.โคกพุทรา อ.โพธิ์ทอง จ.อ่างทอง 14120', '815163939', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01288', 'บริษัท ไทยวัธนาเมทัลชีท จำกัด', '48/6 ม.3 ต.กลางแดด อ.เมือง จ.นครสวรรค์', '081-8885567', NULL, '0818885567ok@gmail.com', NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01289', 'บริษัท เซ้าท์อีสต์เอเชี่ยนแพคเกจจิ่งแอนด์แคนนิ่ง จำกัด [สาขา00001]', 'เลขที่ 233 หมู่4 นิคมอุตสาหกรรมบางปู ถนนสุขุมวิท ต.แพรกษา อ.เมือง จ.สมุทรปราการ 10280', '02-3240617-22', '02-3240626', NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01290', 'วราวุฒิ จิณะไชย', '212 หมู่ 7 ถนน พลดำริษ์ ต.ไผ่หูช้าง อ.บางเลน จ. นครปฐม 73130 โทร. 086-9522151', NULL, NULL, 'b_bomlover@hotmail.com', NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01291', 'บริษัท โรงพยาบาลสัตว์พาราไดซ์ จำกัด', '189 ซอยหมู่บ้านเสรีวิลล่า แยก2 แขวงหนองบอน เขตประเวศ กรุงเทพมหานคร 10250 โทร 0803966396', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01292', 'ร้านค้าน้องแจมมี่', 'เลขที่ 65 หมู่ 7 หมู่บ้านโนนสวรรค์ ซอย 4 ตำบลเสอเพลอ อำเภอกุมภวาปี จังหวัดอุดรธานี 41370', '983329804', NULL, NULL, 'https://maps.app.goo.gl/NDM6fuxh4W6Bvtyf7', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01293', 'โรงเรียนบ้านพันดอน', 'บ้านพันดอน ม.1 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '994515987', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01295', 'ร้าน ณ ภัทรวัสดุภัณฑ์', '352 ม.3 บ.บ้านหน่องไผ่พรเจริญ ต.หน่องหญ่าไช อ.วังสามหมอ จ.อุดรธานี 41280 41280', '614988393', NULL, NULL, 'https://maps.app.goo.gl/y2m66QTVuk9SXsWEA', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01296', 'ร้านยายกรานต์', '130 หมู่ที่13 ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '971360665', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01297', 'ห้างหุ้นส่วนจำกัด เฮง ดี ชัวร์ [สำนักงานใหญ่]', '39 ม.10 ต.ดอนดู่ อ.หนองสองห้อง จ.ขอนแก่น 40190', '989956589', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01298', 'บุญสิริ', 'เลขที่ 139 หมู่ 7 บ้านแสงสว่าง ต.แสงสว่าง อ.หนองแสง จ.อุดรธานี', '956544485', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01299', 'ชนากานต์ บุตรฉิม', '274 หมู่ที่ 1 ต.โคกกลาง อ.โนนสะอาด จ.อุดรธานี 41370', '994655462', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01300', 'จริงใจ', '232 หมู่15 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '966644695', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01301', 'โชคฟาร์มการเกษตร', '96 หมู่ที่6 ต.จำปี อ.ศรีธาตุ จ.อุดรธานี 41230', '910618619', NULL, NULL, 'https://maps.app.goo.gl/wniK2tLJBsLes3oPA', NULL, '17.071132, 103.185708', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01302', 'โรงเรียนแชแลพิทยานุสรณ์', 'ต.แชแล อ.กุมภวาปี จ.อุดรธานี 41110', '986141694', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.155783,103.071625', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01303', 'ร้านจิดาภา', '250 หมู่15 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '890066562', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01304', 'ศิริพัฒน์พานิชย์', '90 หมู่ 6 ต.จำปี อ.ศรีธาตุ จ.อุดรธานี 41230', '929462389', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01305', 'มุก มุก', '177 หมู่8 บ้านนาฮี ต.นายูง อ.ศรีธาตุ จ.อุดรธานี 41230', '929131340', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01306', 'ร้าน นิตยา', '18 หมู่ที่ 11 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '633675801', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01307', 'ร้านคุณแม่', '439 หมู่ที่1 ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธารี 41240', '846709030', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01308', 'เอสพี มาร์ท', '591 หมู่ 1 ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี 41240', '091-8659854', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=16.968780990385962,102.88459315896034', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01309', 'ร้าน ซุปเปอร์ดี', '54 หมู่ 2 บ้านดอนค้อ ต.นาม่วง อ.ประจักษ์ศิลปาคม จ.อุดรธานี 41110', '933867382', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01310', 'อินทร์อุดม', '67 หมู่ที่ 6 บ้านนางาม ต.นาดี อ.หนองแสง จ.อุดรธานี 41340', '988941894', NULL, NULL, 'https://maps.app.goo.gl/gA7hHs4T1eeWiCGY7', NULL, '17.087339, 102.857925', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01311', 'แม่อ้อย ริมหนอง', '51/1 หมู่ที่ 12 บ้านดอนแคน ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '829657485', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01312', 'ร้านจันทร์เพ็ญ รูปสม (รุ่งเจริญหนองเม็ก)', '20 หมู่13 ต.หนองเม็ก อ.หนองหาน จ.อุดรธานี 41130', '42356325', NULL, NULL, 'https://maps.app.goo.gl/evphZNof52XnJLrB9', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01313', 'นิตยา ถามีมาก', '224 ม.5 บ.ท่ายม ต.แสงสว่าง อ.หนองแสง จ.อุดรธานี 41340', '807276676', NULL, NULL, 'https://maps.app.goo.gl/jypgtpGj1XYyEckh8', NULL, '17.138831,102.786287', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01314', 'รดารัตน์พาณิชย์', '125 หมู่ที่ 1 ต.นาม่วง อ.ประจักษ์ศิลปาคม จ.อุดรธานี 41110', '929710195', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01315', 'โรงเรียนเขื่อนเจ้าพระยา', 'ม.4 ต.บางหลวง อ.สรรพยา จ.ชัยนาท 17150', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01316', 'ร้านใบหยกซาว์ด', '11 หมู่ 8 ต.ศรีธาตุ อ.ศรีธาต จ.อุดรธานี 41230', '914181831', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01317', 'โรงเรียนบ้านโนนเห็นวังชัย', 'ม.8 ต.เวียงคำ อ.กุมภวาปี จ.อุดรธานี', '813690148', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01318', 'บริษัท กรกต จำกัด', '31 หมู่ที่1 ตำบลหนองบัวศาลา อำเภอเมืองนครราชสีมา จังหวัดนครราชสีมา 30000', '09-2909-5559', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01319', 'สมพานการค้า', '22 หมู่ 10 บ้านวังแสง ต.นาม่วง อ.ประจักษ์ศิลปาคม จ.อุดรธานี', '817792712', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01320', 'ร้านไอเดียบ่อโอ', '271 ถ.เกษตรสมบรูณ์ ต.เมืองกาฬสินธุ์ อ.เมือง จ.กาฬสินธุ์ 46000', '650955492', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01321', 'ร้านไอเอ็น [ น.ส กชกร ชูติธร ]', '219 ม.5 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '883441969', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01322', 'ร้าน กันเอง', 'ทางรถไฟ', '649267978', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01323', 'ยุภาการค้า', NULL, '0845904710(ย้ายร้านใ', NULL, NULL, 'https://maps.app.goo.gl/nwatEph17xubV9Gr5?g_st=ic', NULL, '16.824698, 103.278375', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01324', 'ร้าน ธนทรัพย์ ซาลาเปาเจ้แพรว', NULL, NULL, NULL, NULL, 'https://maps.app.goo.gl/emMc7VBSyXzaqgoM9', NULL, '17.130239, 102.965005', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01325', 'ร้าน แม่น้อยน้ำหวาน', '247 ม.13 ต.ปะโค อ.กุมภวาปี จ.อุดรธานี', '836650163', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01326', 'อาฉีของชำ', '32 หมู่ 5 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '807502900', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01327', 'นาดีพิซซ่าเดลิเวอร์รี่', '28 หมู่ 1 บ้านนาดี ต.ผาสุก อ.กุมภวาปี จ.อุดรธานี 0812649516', '812649516', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.200871,102.934168', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01328', 'บริษัท สากลโทรทัศน์แอนด์เซอร์วิส จำกัด (สำนักงานใหญ่)', '1/78 ถนนศรีมาลา ตำบลในเมือง อำเภอเมืองพิจิตร จังหวัดพิจิตร', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01329', 'บริษัทตรังภูทอง คอนกรีต จำกัด สาขา 00001', '59/5 หมู่ 2 ตำบล นาเมืองเพชร อำเภอ สิเกา จังหวัด ตรัง 92000', '090-444-6887', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01330', 'นางสาว ชนัญญา หาญณรงค์', '55/515 ม.15 ต.บึงบอน อ.หนองเสือ จ.ปทุมธานี 12170', '982530270', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01331', 'โรงเรียนบ้านกุดจิก', 'หมู่ 1 ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี 41110', '645266325', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01332', 'ร้านลุงหนุ่ม', '484/1 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี่ 41370', '637290033', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01333', 'สหกรณ์โรงเรียนบ้านบุ่งหมากลาน', '106 หมู่ 4 ต.ปะโค อ.กมภวาปี จ.อุดรธานี 41370', '989053340', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01334', 'ร้านน้ำมนต์ มินิมาร์ท', '272 หมู่6 ต.เวียงคำ อ.กุมภวาปี จ.อุดรธานี 41110', '633051236', NULL, NULL, 'https://maps.app.goo.gl/yydMMFGTuaeLreqK9?g_st=ic', NULL, '17.103325, 103.079288', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01335', 'ยายปุ้ย', '100/4 ต.นาดี อ.หนองแสง จ.อุดรธานี', '822576023', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01336', 'ยายนวลอาหารตามสั่ง', '109 หมู่ 14 บ้านหนองศรีเจริญ ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '939389887', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01337', 'บริษัท ไทยอกริฟุ๊ด', '155/1 ม.1 ถ.เทพารักษ์ ต.บางเสาธง อ.บางเสาธง จ.สมุทรปราการ 10540', '620905740', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01338', 'โชคสวัสดิ์', '64 หมู่ 3 ต.ศรีธาตุ อ.ศรีธาตุ จ.อุดรธานี 41230', '847954328', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01339', 'รัตนา', '340 หมู่12 บ.โพสง่า ต.กุมภวาปี อ.กุมภวาปี 41110', '991479549', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01340', 'ร้านแม่น้อย', '125 หมู่2 ต.หัวนาคำ อ.ศรีธาตุ จ.อุดรธานี 41230', '954541259', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01341', 'นายทิวากร จันทะบุตร', '86/6 หมู่ 11 ร้าน นิวบิว ทุกอย่าง 20 บาท ถนนเทศบาลลำลูกกา 3 ตำบล ลำลูกกา อำเภอลำลูกกา จังหวัดปทุมธานี 12150', '087-7436960', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01342', 'กัณตะวันสโตร์', '6 หมู่ 13 บ้านโคกกลาง ต.โคกกลาง อ.โนนสะอาด อุดรธานี 41240', '973127154', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01343', 'นาย ศุกฤษ เมฆสุวรรณ', '223/91 ม.7 ต.คลองสวนพลู อ.พระนครศรีอยุธยา จ.พระนครศรีอยุธยา', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01344', 'พี่เหน่ง', 'บ้านกุดยาง', '871613082', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01345', 'แพรวาคาเฟ่', '29 หมู่8 ต.หนองกุงศรี อ.โนนสะอาด จ.อุดรธานี 41240', '842291486', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01346', 'นางสาวศิริรัตน์ มาศสุข', '528 ม.2 ต.บางปูใหม่ อ.เมือง จังหวัดสมุทรปราการ 10280', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01347', 'หจก.ชิภัทรชาญา', '167/1หมู่2 ต.ดงสุวรรณ อ.ดอกคำใต้ จ.พะเยา 56120', '943494111', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01348', 'น.ส.พาณี อนันตริยเวช', '430 หมู่ที่ 7 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01349', 'ท่าม่วงเวียงคำ', '16 หมู่ 7 ต.แชแล อ.กุมภวาปี', '895749880', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01350', 'แม่หนึ่ง หัวขัว', NULL, '656872779', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01351', 'แม่เหลียน', '39/9 ต.เชียงแหว อ.กุมภวาปี จ.อุดรธานี', '862234060', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01352', 'สุธรรมา สายจำปา', '90/154 หมู่ 4 ต.ศาลากลาง อ.บางกรวย จ.นนทบุรี 11130', '840569655', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01353', 'น้ำพั้นช์ เจริญรุ่งเรืองทรัพย์', '258 หมู่ 9 ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี 41240', '637517437', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=16.967697,102.918952', NULL, '16.967948, 102.918941', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01354', 'นางสาว จิราวรรณ อนุสิทธิ์', '10/2 หมู่ 10 ต.โพรงอากาศ อ.บางน้ำเปรี้ยว จ.ฉะเชิงเทรา 24000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01355', 'นางสาว สายพิน มิลภา', '127 หมู่ 2 บ้านโนนค้อ ต.หนองแก้ว อ.หัวตะพาน จ.อำนาจเจริญ 37240', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01356', 'มณทิชา พรรณอรรถ', '39 หมู่ 5 ต.เกาะเกิด อ.บางปะอิน จ.อยุธยา 13160', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01357', 'นางสาว อัญชนีย์ วงศ์วาน', '26 หมู่ที่3 ตำบลหนองโก อำเภอบรบือ จังหวัดมหาสารคาม 44130', '879506307', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01358', 'โรงเรียนบ้านหัวขัวเหมือดแอ่', '154 หมู่5 บ้านหัวขัว ตำบลปะโค อำเภอกุมภวาปี จังหวัดอุดรธานี 41370', '952817391', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01359', 'บริษัท ไทยชิคก์เค่นท์มีทโพรเซสซิ่ง จำกัด', '74 ม.8 ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี', '982499899', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01360', 'อาทิตย์การค้า', '79 หมู่10 ตำบลอุ่มจาน อ.ประจัก จ.อุดรธานี 41110', '826860780', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.231868,103.045146', NULL, '17.232068, 103.045114', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01361', 'บริษัท เอส เอส วาไรตี้ออฟกู้ดส์ จำกัด', '96 ม.7 ต.บ่อรัง อ. วิเชียรบุรี จ.เพชรบูรณ์ 67130', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01362', 'น.ส. สุภาพร นามรักษา', '40 หมู่14 ต.หนองโก อ.กระนวน จ.ขอนแก่น 40170', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01363', 'อภิศักดิ์ บัณฑิต (หนึ่งคาราบาว)', '126 หมู่13 ต.โคกกลาง อ.โนนสะอาด จ.อุดรธานี 41240', '883101388', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01364', 'ร้านแม่แต๋ว', '12 หมู่ที่ 17 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '934830825', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01365', 'น.ส. พลูศรี เหง้าพรหมมินทร์', '72 ม.19 ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี', '895708429', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01366', 'คิม คิม หมูกระทะ', '234/6 หมู่15 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '812809875', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01367', 'โชดประสิท', '125/1 ต.ทมนางาม อ.โนนสะอาด จ.อุดรธานี', '643155783', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01368', 'ตาเหว่', '234/4 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '862208658', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01369', 'การ์เด้นเฮ้ารีสอร์ต', '149 หมู่14 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '801905409', NULL, NULL, 'https://www.google.com/maps/@17.0975233,103.0098312,3a,75y,44.29h,76.45t/data=!3m6!1e1!3m4!1sz1mXp94Ukw1LW9C2zXWhhA!2e0!7i16384!8i8192?entry=ttu', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01370', 'ร้านนงเยาว์พานิช', '292 หมู่9 บ้านปะโค ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '857448198', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01371', 'น.ส.อริญรดา แคว้นครฉิม', '51 ม.6 บ้านหนองไผ่ล้อม ต.นาหนองทุ่ม อ.แก้งคร้อม จ.ชัยภูมิ 36150', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01372', 'พี่นะ สินไทย', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01373', 'ร้านแม่ออง(นางนวลออง)', '116 หมู่ที่ 8 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '860040381', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.12172,102.966292', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01374', '13 เมษา แจ่วฮ้อน', '216 หมู่3 ต.กุมภวา อ.กุมภวา จ.อุดรธานี 41110', '981197533', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01375', 'นส ภัควลัญชญ์ ติมุลา', '55 ม.3 ต.ดินดำ อ.จังหาร จ.ร้อยเอ็ด 45000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01376', 'นายประสงค์ วิภาทิน', 'ที่อยู่ 46หมู่9 ตำบลคอกชช้าง อำเภอสระใคร จังหวัดหนองคาย 43100', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01377', 'นายธาวิน ทุ่งเกรียงไกร', '999/34 หมู่บ้านเดอะทาวน์ ซอยเพิ่มสิน 20 แยก 6 แขวงคลองถนน เขตสายไหม กรุงเทพ 10220', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01378', 'ป.รุ่งเรืองพาณิชย์', '376 หมู่ที่ 8 หมู่บ้าน คำค้อ ตำบล หัวนาคำ อำเภอ ศรีธาตุ จังหวัดอุดรธานี 41230', '619303389', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01379', 'แม่บัวคำ', '17 หมู่ที่ 11 ต.นาม่วง อ.ประจักษ์ศิลปาคม จ.อุดรธานี', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01380', 'นางสาว กมลวิภา ใบบัว', '68/692 หมู่.1 ตำบลหันตรา อำเภอพระนครศรีอยุธยา จังหวัด พระนครศรีอยุธยา', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01381', 'ร้าน999 เกษตรภัณฑ์', '3 หมู่ 12 ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '615939300', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.06876,102.888595', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01382', 'น.ส.ปุณรดา คำแสงดี', '166 ม.8 ต.ห้วยขะยุง อ.วารินชำราบ จ.อุบลราชธานี', '945653369', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01383', 'นางจันที ดีสะเกษ', '32 หมู่ที่ 1 ต.ผาสุก อ.วังสามหมอ จ.อุดรธานี 41280', '931137947', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01384', 'ร้าน อ้อแอ้', '59 ม.4 ต.โนนทองอินทร์ อ.กู่แก้ว จ.อุดรธานี', '892913225', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01385', 'นาง นิศรา จำแนกนิตย์', '99/93 หมู่ที่ 4 ตำบลอุทัย อำเภออุทัย จังหวัดพระนครศรีอยุธยา', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01386', 'ลองชง(น.ส.ธนัชชา วงศ์สาสนธิ์)', '280 หมู่ที่ 1 ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '981436838', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01387', 'น.ส.วนิดา พงษ์พัว', '24ม.11 ต.บ้านกลาง อ.สอง จ.แพร่ 54120 โทร0647955142', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01388', 'น.ส.ชนัญญา หาญณรงค์', '55/515 ม.5 ต.บึงบอน อ.หนองเสือ จ.ปทุมธานี 12170', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01389', 'บัวสวัสดิ์การค้า', NULL, '083-3573026', NULL, NULL, 'https://maps.app.goo.gl/JrnsaCPx9Vx25XAM9', NULL, '17.157564, 103.159376', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01390', 'สุรางค์ ประจงกิจ', '501ถนนพระดวงหทัยนิรมล ตำบลตลาด อำเภอพระประแดง จังหวัดสมุทรปราการ 10130', ':0890769741', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01391', 'วิภาวีร์ ป้อมทอง', '99/264 หมู่ 1 ตำบลคลองสี่ อำเภอคลองหลวง จังหวัดปทุมธานี 12120', '632616992', NULL, 'wiphawee1017@gmail.com', NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01392', 'มาโนช จักสาน', '183/1733 ถ.สรงประภา แขวงสีกัน เขตดอนเมือง 10210', '898245511', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01393', 'นายทรรศ. จั่นประดิษฐ์', '216 ซ.เชิดวุฒากาศ19 ถ.เชิดวุฒากาศ แขวงสีกัน. เขตดอนเมือง กรุงเทพฯ 10210.', '0.0622921045', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01394', '. ชื่อ: นางเจริญพร ศรีศุภร', '557 หมู่3 ต.แชะ อ.ครบุรี จ.นครราชสีมา 30250', NULL, NULL, '. E-mail: littlefernana@gmail.com', NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01395', 'ห้างหุ้นส่วนจำกัด วันเดอร์ครีเอชั่น', '64/8 ถ.แจ่มนุสรณ์ ต.หมากแข้ง อ.เมือง จ.อุดรธานี 41000', '894990140', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01396', 'เจ้ปู กาฬสินธิ์', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01397', 'นางสาว ญมาพรรณ วันไว', 'ที่อยุ่ 61 ม.7 ต.บ้านขอ อ.เมืองปาน จ.ลำปาง', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01398', 'วาสนา จุลเจิมศักดิ์', '36 หมู่ 4 ต. แควอ้อม อ.อัมพวา จ.สมุทรสงคราม 75110', '861746365', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01399', 'นาย คำใบ ลูกแก้ว', 'นาคนิวาส 48 แยก 11 แขวงเขตลาดพร้าวกรุงเทพฯ 10230', NULL, NULL, 'khabilukkaew5@gmail.com', NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01400', 'กนกพร การค้า', '15/2 ต.โพธิ์ศรีสำราญ อ.โนนสะอาด จ.อุดรธานี 41240', '0621290544(ไม่ต้องโท', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=16.953390397941977,102.83115208282041', NULL, '16.953611, 102.831098', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01401', 'นางสาวชญาทิภา นิระภัฎสกุล', 'ที่อยู่ : 268/1 หมู่1 ตำบลท่าข้าม อำเภออรัญประเทศ จังหวัดสระแก้ว 27120', '061-5988978', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01402', 'บริษัท เอก-ชัย ดีสทริบิวชั่น ซิสเทม จำกัด', 'เลขที่ 188 หมู่ที่1 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '042-202060', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01403', 'ทองอวน การค้า', '28/8 ต.นาม่วง อ.ประจักษ์ศิลปาคม จ.อุดรธานี 41110', '611295065', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01404', 'น.ส.เบญจมาศ ชูมา', '29 หมู่ที่ 4 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '905929294', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01405', 'บริษัท มหาชัยก๊อปปี้ จำกัด', '927/8 ถนนเอกชัย ตำบลมหาชัย อำเภอเมืองสมุทรสาคร จังหวัดสมุทรคร 74000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01406', 'นส. ชวิศา สิงคีพงศ์', '14 ซ.โชคชัย4 ซอย56 แยก21 ถ.โชคชัย4 แขวง ลาดพร้าว กทม เขตลาดพร้าว จังหวัดกรุงเทพมหานคร 10230', '639245153', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01407', 'แม่สอน บ้านนาดี', '119 ม.10ต.นาดี อ.หนองแสงจ.อุดรธานี', '983655501', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01408', 'ร้านแม่เตี้ย บ้านผือ', '21 หมู่19 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '853331925', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01409', 'พ่อสัญชาติ มุทธขอนแก่น', '3 หมู่ที่ 9 ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี 41370', '966340793', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01410', 'ชมภูนุช วรรณโนมัย', '3 หมู่6 ต หนองอีบุตร อ.ห้วยผึ้ง จ.กาฬสินธุ์ 46240', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01411', 'เอ็นทีมาร์ท', '308 หมู่ 9 ต.ทมนางาม อ.โนนสะอาด จ.อุดรธานี 41240', '6306989360639080000', NULL, NULL, 'https://www.google.com/maps/place/16%C2%B053\'23.6%22N+102%C2%B056\'32.2%22E/@16.8898013,102.9421684,77m/data=!3m1!1e3!4m4!3m3!8m2!3d16.8898799!4d102.9422788?entry=ttu&g_ep=EgoyMDI2MDUwNi4wIKXMDSoASAFQAw%3D%3D', NULL, '16.889935, 102.942262', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01412', 'บริษัท คอนกรีต พรีซิชั่น ยูนิค จำกัด', '22 ม.11 ถ.อุดร-สามพร้าว ต.สามพร้าว อ.เมือง จ.อุดรธานี 41000', '042-349171', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01413', 'ฐปนนนท์ สืบมา', '46 หมูที่ 1 ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '817495045', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01414', 'บริษัท แพลน ดี มีเดีย จำกัด (สำนักงานใหญ่)', '1599/254 ซ.เพชรเกษม 63 แขวงหลักสอง เขตบางแค กรุงเทพมหานคร 10160', '087-9895984', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01415', 'จูนเจการค้า', '189/1 หมู่ที่ 1 ถนนแซแล ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '611072540', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01416', 'เจ๊แดงตลาดสดกุมภวาปี', NULL, '850116478', NULL, NULL, NULL, NULL, '17.128330, 102.964942', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01417', 'คุณอรทัย ทองจุ้ย', '20/1 หมู่ 6 ต.ด่านทับตะโก อ.จอมบึง จ.ราชบุรี 70150', '925684445', NULL, 'oratai.tho@mahidol.edu', NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01418', 'นาง ศรีสกุล ศรีนาค', 'ที่อยู่ 37 ม.8 ต.ตะโก อ.ห้วยแถลง จ.นครราชสีมา 30240', '084-8276889', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01419', 'ปาริฉัตร', '90 หมู่ 8 บ้านอุ่มจาน ต.อุ่มจาน อ.ประจักษ์ศิลปาคม จ.อุดรธานี 41110', '621691258', NULL, NULL, 'https://maps.app.goo.gl/zj46WZwuwrByqkHb9', NULL, '17.235653, 103.041385', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01420', 'สวนอาหารบ้านสวนศรีเมือง', '274 หมู่ 8 ถนนอุ่มจาน ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '934744554', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01421', 'แม่กาญจนา บ.ปะโค', '61/16 บ.ปะโค ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '610290548', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01422', 'ร้านพันธิตรา', '20 หมู่3 ต.โพธิ์ศรีสำราญ อ.โนนสะอาด จ.อุดรธานี 41240', '065-6497328', NULL, NULL, 'https://goo.gl/maps/mc2MhHGgKX9wwj1T6', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01423', 'โรงเรียนบ้านห้วยสามพาดหนองแกสหราษฎร์พัฒนา', 'หมู่ 1 บ้านห้วยสามพาด ตำบลห้วยสามพาด อำเภอประจักษ์ศิลปาคม จังหวัดอุดรธานี 41110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01424', 'บ้านแทนการค้า', '27 หมู่ 2 บ้านเสอเพลอ ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี 41370', '650930108', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.202529,102.882549', NULL, '17.202770, 102.882570', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01425', '1 บริษัท เอ็ม.ยี.แลนด์ จำกัด', 'เลขทีื 25 ซ.สุขุมวิท 1 ถ.สุขุมวิท แขวงคลองเตยเหนือ เขตวัฒนา กทม. 10110', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01426', 'แม่อ้อย หนองแสง', '81/3 ต.หนองแสง อ.หนองแสง 41340', '927739054', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.137915,102.847761', NULL, '17.138156, 102.847729', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01427', 'ร้านธนพลเภสัช', '185/2-3 ม.9 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '061-4218555', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01428', 'บาร์จ่าเจษ', '230/7 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '994650456', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.1496673,102.9741982', NULL, '17.149826, 102.974220', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01429', 'ไข่มุกการค้า', '68 หมู่5 บ้านโคกสง่า ต.ห้วยสามพาด อ.ประจักษ์ศิลปาคม จ.อุดรธานี 41110', '807526746', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01430', 'บริษัท ปูนซิเมนต์ไทย (แก่งคอย) จำกัด [สำนักงานใหญ่]', '31/4 ม.3 ต.บ้านป่า อ.แก่งคอย จ.สระบุรี 18110', '972287581', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01431', 'จุฑารัตน์ คำเสมอ', '90 หมู่ 12 บ้านบุ่งหมากลาน ต.ปะโค อ.กุมภวาปี จ.อุดรธานี', '611631663', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01432', 'ร้านเอ็ม.เอ็ม.', 'บ้านดอนแคน 238 หมู่ 12 บ้านดอนแคน ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '080-1944526', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01433', 'ดวงใจ บัวระพา', '122 หมู่ 1 ต.แสงสว่าง อ.หนองแสง จ.อุดรธานี 41370', '808058620', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01434', 'สุทธิดา พันละเกตุ', '211 หมูที่ 9 ต. สระใคร อ.สระใคร จ.หนองคาย 43100', '614936290', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01435', 'โสเจ๊ง', '161 หมู่ที่ 7 ต.นางิ้ว อ.เขาสวนกวาง จ.ขอนแก่น', '807515456', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01436', 'น.ส.ภาวนา พรวาปี', '219 หมู่ที่ 4 ต.นาม่วง อ.ประจักษ์ศิลปาคม จ.อุดรธานี', '0631355831 (ปิดร้านอ', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01437', 'ห้างหุ้นส่วนจำกัด อ.เจริญซุปเปอร์สโตร์', 'เลขที่ 190 หมู่ที่ 12 ต.วังสามหมอ อ.วังสามหมอ จ.อุดรธานี 41280', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01438', 'พี่เน็ต กุมภวาปี', '145/3 ถนน ชวลิต หมู่1 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '800081664', NULL, NULL, 'https://maps.app.goo.gl/AmYMqzt3uXuaSs6w6', NULL, '17.111129, 103.013796', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01439', 'ส้มตำยำลำเพลิน', '239 หมู่ที่ 13 ต.โคกกลาง อ.โนนสะอาด จ.อุดรธานี 41240', '956625116', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01440', 'สงวนบุญ', 'ตลาดสดกุมภวาปีเมืองใหม่ (อยู่ในตลาด) ร้านขายของชำ', '982731887', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01441', 'ปีใหม่ มินิมาร์ท', '17 หมู่8 บ้านโนนยอ ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี 41110', '621275993', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01442', 'บริษัท แพลน ดี มีเดีย จำกัด (สำนักงานใหญ่)', '1599/254 ซ.เพชรเกษม 63 แขวงหลักสอง เขตบางแค กรุงเทพมหานคร 10160', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01443', 'บริษัท ปิโตรเลียมไทยคอร์ปอเรชั่น จำกัด [สำนักงานใหญ่]', '90 อาคารซีดับเบิ้ลยู ทาวเวอร์เอ ชั้น 33 ถนนรัชดาภิเษก แขวงห้วยขวาง เขตห้วยขวาง กรุงเทมหานคร 10310', '021-683377', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01444', 'บริษัท เคเอส พิโก จำกัด', '150 หมู่ 1 ต.เมืองเพีย อ.กุดจับ จ.อุดรธานี 41250', '42111718', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01445', 'บริษัท กาแฟพันธุ์ไทย จำกัด [สำนักงานใหญ่]', '90 อาคารซีดับเบิ้ลยู ทาวเวอร์ เอ ชั้นที่ 33 ถนนรัชดาภิเษก แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร 10310', '21683388', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01446', 'มิลค์ คาเฟ่', 'บ้านนาแบก หมู่1 ตำบล เวียงคำ อำเภอกุมภวาปี จังหวัด อุดรธานี 41110', '986159105', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.11110098754567,103.03220392214416', NULL, '17.111250, 103.032236', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01447', 'โชว์ดาว', '95-96 หมู่9 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '084-3922539', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.110276409257022,103.0179525911808', NULL, '17.110569, 103.017953', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01448', 'ร้านกรแก้ว บ้านวาปี', '46 ม.4 บ้านวาปี ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '813695939', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01449', 'ร้านมะม่วงน้ำปลาหวาน แยกหลักขาวพันดอน', NULL, '610291091', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01450', 'แสงไทย', '281ถ.สาลีรัฐวิภาค สามเสนใน พญาไท ก.ท.ม 10400', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01451', 'ร้านกาแฟ คอฟฟี่เชี่ยล', '100/2 บ้าน.แม่นนท์ ต.หนองไผ่ อ.เมืองอุดรธานี 41330', '862248692', NULL, NULL, 'https://www.google.com/maps/place/17%C2%B014\'30.9%22N+102%C2%B053\'54.1%22E/@17.24191,102.898364,17z/data=!3m1!4b1!4m4!3m3!8m2!3d17.24191!4d102.898364?', NULL, '17.242076, 102.898329', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01452', 'ร้อยตำรวจเอกชัยโรจน์ ธีระวรรณวัชร์', 'สภอ.กุมภวาปี', '933641519', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01453', 'มินิ ณินิว', '48 หมู่ 8 บ้านปะยาว ต.บุ่งแก้ว อ.โนนสะอาด จ.อุดรธานี 41240', '625833541', NULL, NULL, 'https://maps.app.goo.gl/8QbcZJRrb6zqEt7e6', NULL, '16.949115, 103.023889', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01454', 'ร้านภาคิน', '267 หมู่ 10 บ้านเสาเล้า ต.โพธิ์ศรีสำราญ อ.โนนสะอาด จ.อุดรธานี 41240', '910611345', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01455', 'บริษัท เอส.ที.เจ พร็อพเพอร์ตี้ ดีเวลลอปเม้นท์', 'ที่อยู่ 508/1 ซอยสุขุมวิท55 (ทองหล่อ) คลองตันเหนือ วัฒนา กรุงเทพฯ', '02-059-0519,20', NULL, 'Pm-jmr@plus.co.th', NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01456', 'ฮ่มแซวค่าเฟ่', NULL, '832300333', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01457', 'หจก.รวยทรัพย์ เวิลด์ไวด์', '190 ม.2 ต.สร้างแป้น อ.เพ็ญ จ.อุดรธานี 41150', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01458', 'พี่หมวย', NULL, '953282840', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01459', 'พี่ เก๋ ท่าลี่', '193/10 ต.ท่าลี่ อ.กุมภวาปี จ.อุดรธานี 41110', '648649632', NULL, NULL, 'https://maps.app.goo.gl/Zdro1XuuH53dSaKr6', NULL, '16.962812, 103.076549', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01460', 'โรงเรียนคำเมยวิทยาคม', 'หมู่ 17 บ.ชัยเจริญ ต.หัวนาคำ อ.ศรีธาตุ จ.อุดรธานี 41230', '828539975', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01461', 'กรรธิรา การค้า', 'ที่อยู่ 94 ม.6 ต.แม่ตืน อ.ลี้ จ.ลำพูน 51110', '964969006', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01462', 'หจก.ลิตา อาร์ตแฮร์', '25/11 หมู่5 ถนนข้าวหลาม ต.บ้านปึก อ.เมืองชล จ.ชลบุรี20130', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01463', 'นายธีรเดช ฤทธิยุง', '24 หมู่ที่ 4 ต.ห้วยเกิ้ง อ.กุมภวาปี จ.อุดรธานี 41110', '836799988', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01464', 'สุกัญญา หนองหลักไชยวาน', '377 หมู่ 7 ต.หนองหลัก อ.ไชยวาน จ.อุดรธานี', '0997879767/092698944', NULL, NULL, 'https://maps.app.goo.gl/ww2c1LxGrAV51j3N6', NULL, '17.274351,103.199812', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01465', 'ร้านพีเค ปะโค', '54 หมู่ที่ 15 ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '989464980', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01466', 'เจ้หมวย ล๊อตเตอรลี่', '285 หมู่ 10 ถนนแชแล ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '819540128', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.110096,103.017167', NULL, '17.110347, 103.017167', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01467', 'Kim\'s cafe (คิม คาเฟ่)', '37 ถ.จิตประสงค์ อ.กุมภวาปี จ.อุดรธานี 41110', '891410303', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.105563,103.019128', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01468', 'หมุ่ยปัง', '74 หมู่ 1 ต.เชียงแหว อ.กุมภวาปี จ.อุดรธานี 41370', '983866581', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01469', 'แม่โสภา บ.ห้วยบง', '135 หมู่2 ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี 41110', '898418141', NULL, NULL, 'https://maps.app.goo.gl/zo1e9DKWXt6yXDxi9', NULL, '17.022554, 102.995573', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01470', 'ฉัตรชัยการค้า', '137 หมูที่ 2 ต.นาม่วง อ.ประจักษ์ศิลปาคม จ.อุดรธานี 41110 (นาย อาคม บำรุงภักดี)', '658580837', NULL, NULL, '7235+9X5 ตำบล นาม่วง อำเภอ ประจักษ์ศิลปาคม อุดรธานี', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01471', 'ชวนชำ การค้า', NULL, '643087878', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.02735806542468,102.97314360737799', NULL, '17.027305, 102.97314', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01472', 'วีระศักดิ์ การค้า', '163 หมู่20 บ.พันดอน ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '880279622', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01473', 'อ.รุ่งเจริญ', '119 ม.4 ต.หว้ยสามพาด อ.ประจักษ์ศิลป์ปาคม จ.อุดรธานี 41110', '918679991', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01474', 'สำนักงานสาธารณสุขอำเภอกุมภวาปี', '3 หมู่ 3, ถนนตูมใต้, ตำบลกุมภวาปี อำเภอกุมภวาปี จังหวัดอุดรธานี, 41110', '973063257', NULL, NULL, 'https://maps.app.goo.gl/9uE3Mq5Q7rMasUPP6', NULL, '17.100268, 103.011011', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01475', 'สมปรารถนาคาเฟ่', '436/4 บ.วาปี อ.กุมภวาปี จ.อุดรธานี 41370', '913674443', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01476', 'ครัวส้มจีน', '219 บ้านไผ่ หมู่ 1 ตำบลตูมใต้ อำเภอ กุมภวาปี จังหวัดอุดรธานี', '967286294', NULL, NULL, 'https://www.google.com/maps/@17.1219104,102.9795291,3a,75y,143.96h,102.25t/data=!3m7!1e1!3m5!1s8iC5Wy4NhPwW5UD9kVQkyQ!2e0!6shttps:%2F%2Fstreetviewpixe', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01477', 'นิพนธ์การค้า', '95 หมู่ที่ 3 ต.นาดี อ.หนองแสง จ.อุดรธานี 41340', '635741599', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01478', 'บุษยา รีสอร์ท', 'เลขที่ 211 หมู่ 4 ต.ตาดทอง อ.ศรีธาตุ จ.อุดรธานี 41230', '892777252', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.033533923925585,103.11972666531803', NULL, '17.033642, 103.119684', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01479', 'จำเนียร พนานนท์', '135 หมู่ 12 ต.เชียงแหว อ.กุมภวาปี จ.อุดรธานี 41370', '878578581', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01480', 'นะราจัน', '129/3 ต.นาดี อ.หนองแสง จ.อุดรธานี', '854245935', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01481', 'นวพล ศรีทอง', '127 หมู่ 13 ต.แชแล อ.กุมภวาปี จ.อุดราธานี', '878618618', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01482', 'วัดป่าประชานิมิตร', 'บ้านเชียงกลม อ.กุมภวาปี จ.อุดรธานี', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01483', '99 ไก่ทอด', '130 หมู่ที่ 12 ต.ปะโค อ.กุมภวาปี 41370', '838918058', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01484', 'ร้าน ภูรินทร์วัสดุก่อสร้าง', '18 ม.4 บ.โนนขี้เหล็ก ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี 41370', '653729617', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01485', 'เกรช - มีนา', '235/4 นาม่วง ต.นาม่วง อ.ประจักษ์ศิลปาคม จ.อุดรธานี 41110', '988417594', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01486', 'ทวีทรัพย์ สังคม', '180/11 ต.ห้วยสามพาด อ.ประจักศิลป์คม', '828988918', NULL, NULL, NULL, NULL, '17.251413, 102.930814', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01487', 'สำราญการค้า', '150 หมู่ 11 บ้านโพธิ์งาม ต.บ้านโป่ง อ.ศรีธาตุ จ.อุดรธานี', '816415182', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01488', 'มงคล อาหารจานเดียว', '69/1 หมู่1 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '610210127', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01489', 'นายสามารถ ชารี (samart99shop)', '199 หมู่ 9 ตำบลบ้านจันทน์ อำเภอบ้านดุง จังหวัดอุดรธานี 41190 ต.บ้านจันทน์ อ.บ้านดุง จ.อุดรธานี 41190', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01490', 'ห้างหุ้นส่วนจำกัด ยุทธนา วาย แอนด์ เอ็น', '329/13-14 หมู่ 4 ถนนมิตรภาพ ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '936515339', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01491', 'กิ่งแก้ว', '20หมู่2 ต.ห้วยเกิ้ง อ.กุมภวาปี จ.อุดรธานี', '846836098', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01492', 'กรรธิรา สุภาพิน', '94 ม.6 ต.แม่ตืน อ.ลี้ จ.ลำพูน 51110 ต.แม่ตืน อ.ลี้ จ.ลำพูน 51110', '964969006', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01493', 'แม่วงเดือน', '21 หมู่ 15 บ้านดอนแก้ว ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '872248317', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01494', 'แม่น้อย ท่าลี่', 'เลขที่ 3 หมู่ 4 ต.ท่าลี่ อ.กุมภวาปี จ.อุดรธานี 41110', '623486749', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01495', 'เจ้แดง นาทัน', 'เลขที่ 33 หมู่ 6 ต.ท่าลี่ อ.กุมภวาปี จ.อุดรธานี 41110', '803989447', NULL, NULL, NULL, NULL, '16.926102, 103.044256', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01496', 'ทวีชัยพาณิชย์', '226 หมู่ 5 บ.นาเหล่า ต.หนองกรุงศรี อ.โนนสะอาด จ.อุดรธานี 41240', '828023120', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.062867507307654,102.78754144906998', NULL, '17.062996, 102.787531', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01497', 'ร้านหลังวัด (อาหารตามสั่ง)', '130 หมู่ 12 บ้านบุ่งหมากลาน ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '914551429', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01498', 'เกศรินทร์ แชสัน', '112 หมู่ 13 ต.ห้วยสามพาด อ.ประจักษ์ศิลปาคม จ.อุดรธานี 41110', '929538337', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01499', 'หจก. ซี.เอส.เกษตรภัณฑ์', '544/5 หมู่ 2 ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี 41240', '933213129', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=16.966331976005804,102.89297409134264', NULL, '16.966429, 102.893006', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01500', 'ร้าน ครัวแม่ชิต', '57 ม.9 บ.นาหนองทุ่ม ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '811875144', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01501', 'ร้านชลธิชา', '13/3 หมู่5 ตำบลห้วยน้ำขาว อำเภอคลองท่อม จังหวัดกระบี่ 81120', '095-7928668', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01502', 'สำมะปิ', '555/1 หมู่ 15 ต.พันดอน อ.กุภวาปี จ.อุดรธานี 41370', '098 - 6525478', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01503', 'ตกหลุมรัก', '258 ม.3 ต.หนองไผ่ อ.เมือง จ.อุดรธานี', '858164505', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01504', 'มะลิจันทร์ แซ่เล็ก', '762 หมู่ 15 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '093-0240348', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01505', 'ประคองรุ่งเรือง', '132 หมู่ที่ 2 บ้านโคกสว่าง ต.หนองแสง อ.หนองแสง จ.อุดรธานี 41340', '817427690', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01506', 'วัดบูรพา ท่าลี่ ยกเลิก', 'บ้านท่าลี่ อ.กุมภวาปี จ.อุดรธานี 41110', '800355017', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01507', 'พี่โก้ ซุปเปอร์', '63/1 ต.คำสร้างเที่ยง อ.สามชัย จ.กาฬสินธ์ 46180', '099-4727520', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01508', 'พนักงาน ไผ่', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01509', 'หจก.เจ ที บี อีเลคทริค ซัพพลาย', '99/294 ม.6 ต.คลองหนึ่ง อ.คลองหลวง จ.ปทุมธานี 12120', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01510', 'ร้านค้า 5 แยกต้นมะขามใหญ่', '15/3 หมู่ที่ 3 ต.บุ่งแก้ว อ.โนนสะอาด จ.อุดรธานี 41240', '846757261', NULL, NULL, 'https://maps.app.goo.gl/SD2US7dvtRC93btj6?g_st=com.google.maps.preview.copy', NULL, '16.984016,103.006787', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01511', 'น.ส.สะอาด วรบุตร', 'โรงพยาบาลกุมภวาปี ตึกฉุกเฉิน', '951692468', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01512', 'น้องมัดหมี่', '43 หมู่5 บ้านเสาเล้าผักชีศรีสวัสดิ์ ต.โพธิ์ศรีสำราญ อ.โนนสะอาด จ.อุดรธานี 41240', '918756792', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01513', 'ร้าน บานานา (Banana)', '312/5 ม.4 ต.พันดอน อ.กุมภวาปี จ อุดรธานี', '862352122', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.130943,102.947437', NULL, '17.131235, 102.947373', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01514', 'พี่อร บ้านท่าลี่ หมู่4', '16 หมู่4 ต.ท่าลี่ อ.กุมภวาปี จ.อุดรธานี 41110', '0821461610-093421400', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01515', 'สหกรณ์โรงเรียนอนุบาลหนองแสง', 'หมู่ 9 ต.ทับกุง อ.หนองแสง จ.อุดรธานี 41340', '862378294', NULL, NULL, 'https://maps.app.goo.gl/P4jpKdUBMYi8U8Z17', NULL, '17.162255, 102.782125', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01517', 'สุภาพร นามสา', '56 หมู่ 11 บ้านเมืองปัง ต.อุ่มจาน อ.ประจักษ์ศิลปาคม จ.อุดรธานี 41110', '963534656', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01518', 'บริษัท พี.เค.เอ็ม.ที[2002] จำกัด', '108 ม.5 ถ.อุดร-สามพร้าว ต.สามพร้าว อ.เมือง จ.อุดรธานี 41000', '835995516', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01519', 'ร้านอารมณ์ดี', 'บ้านบุ่งหมากลาน ตำบล ปะโค อำเภอกุมภวาปี อุดรธานี', '878584743', NULL, NULL, 'https://maps.app.goo.gl/2QXYvJ62hS8i7R1q9', NULL, '17.046960, 102.837169', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01520', 'กันเองสะดวกซัก', '25 หมู่ 2 ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี 41240', NULL, NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=16.973749,102.893056', NULL, '16.973836, 102.893045', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01521', 'บริษัท บุญจันทร์ ดี เอ็น เอส จำกัด', '234 ม.2 ต.วังสามหมอ อ.วังสามหมอ จ.อุดรธานี 41280', '989647891', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01522', 'ทองเลื่อน บ.ยางหล่อ', 'ที่อยู่ 58 หมู่ 6 ต.แชแล อ.กุมภวาปี จ.อุดรธานี 41110', '614413802', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01523', 'มินิมาร์ท รร.กุมภวาปี', '164 หมู่ 3 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '625564201', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.101464506579784,103.00891354680061', NULL, '17.101613, 103.008935', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01524', 'ส้ม บ้านกงพาน', NULL, '803035672', NULL, NULL, 'https://maps.app.goo.gl/9P246FTuMUgn963s9?g_st=ic', NULL, '17.126573, 102.965280', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01525', 'นิภารัตน์', '43 หมู่ 6 บ้านแสงสว่าง ต.แสงสว่าง อ.หนองแสง จ.อุดรธานี 41340', '954409848', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01526', 'บริษัท บางกอก ไลฟ์ สไตล์ จำกัด', '269 หมู่13 ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '817211600', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01527', 'เบญญาภา ขวานอก', '223 หมู่ที่ 8 บ้านซำเจริญ ต.บ้านจีต อ.กู่แก้ว จ.อุดรธานี 41130', '943646996', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01528', 'หจก.สรรสิริ ค้าส่ง (สำนักงานใหญ่)', '215 หมู่ 10 ต.พังขว้าง อ.เมือง จ.สกลนคร 47000', '042711123/0839646565', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01530', 'อาเฮ็ง', '77 หมู่ที่ 2 ต.กุงเก่า อ.ท่าคันโท จ.กาฬสินธุ์', '629284519', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01531', 'พรมณี จันทะโคตร', 'เลขที่ 61 หมู่ 12 ต.ห้วยสามพาด อ.ประจักษ์ศิลปาคม จ.อุดรธานี 41110', '806696764', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01532', 'บริษัท แอล พี เอ็ม ดีเวลลอปเม้นท์ จำกัด (สำนักงานใหญ่)', '556 ม.1 ต.ทรายมูล อ.สว่างแดนดิน จ.สกลนคร 47110', '862044680', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01533', 'น้องฟีฟ่า ปลาทะเล', '227 หมู่ที่ 2 ต.นาม่วง อ.ประจักษ์ศิลปาคม จ.อุดรธานี 41110', '623786773', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01534', 'วิชิตรา', 'เลขที่ 10 หมู่ 9 ต.ผาสุก อ.กุมภวาปี จ.อุดรธานี 41370', '979526325', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01535', 'สกุลชัย', '85 หมู่ที่ 1 บ้านป่าเปื่อย ต.โนนสมบูรณ์ อ.เขาสวนกวาง จ.ขอนแก่น 40280', '062-3317853', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01536', 'แม่โบว์', '68 หมู่ 14 บ.หนองศรีเจริญ ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '917564297', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00');
INSERT INTO `store` (`store_id`, `store_name`, `store_address`, `telephone_number`, `fax_number`, `email`, `url`, `customer_delivery_time`, `store_location`, `created_at`, `open_time`, `close_time`) VALUES
('OR-01537', 'บารมีครู', '52 หมู่ที่ 8 ต.หนองหว้า อ.กุมภวาปี จ.อุดรธานี 41110', '941802528', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01538', 'ยุทธชัย สินธ์สิริวัตร', '150/8 บ้านป่าก้าว ต.โพนสูง อ.ไชยวาน จ.อุดรธานี 41290', '654565457', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.15981928540953,103.24422374367714', NULL, '17.159978, 103.244181', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01539', 'บริษัท เทพทิพย์ ซุปเปอร์สโตร์ จำกัด', '159 ม.14 ต.ท่าลี่ อ.กุมภวาปี.จ.อุดรธานี 41110', '804198248', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01540', 'หจก.เจ ที บี อีเลคทริค ซัพพลาย(สนญ)', '99/294 ม.6 ต.คลองหนึ่ง อ.คลองหลวง จ.ปทุมธานี 12120', '02-9029073//08512275', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01541', 'ร้านจันทัย ค้าส่ง', '78 หมู่ที่ 5 บ้านสีแจ ต.ผาสุก อ.กุมภวาปี จ.อุดรธานี 41370', '656266160', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01542', 'ร้านเพื่อนเกษตร (กรุงเก่า)', '176 บ้านกรุงเก่า หมู่ 8 ต.กรุงเก่า อ.ท่าคันโท จ.กาฬสินธุ 46190', '877710789', NULL, NULL, 'https://maps.app.goo.gl/AiTeHAVoJB3RrKTv6?g_st=il', NULL, '16.911097, 103.173680', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01543', 'ต้นข้าว มินิมาร์ท', 'เลขที่ 25 หมู่12บ.บะยาว ต.บะยาว อ.วังสามหมอ จ.อุดรธานี 41280', '656887794', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01544', 'ร้านบุญมั่งมี', 'เลขที่ 247 ม.5 บ้านทองอินทร์ ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี 4137', '940743689', NULL, NULL, 'https://maps.app.goo.gl/ptggnwe5NfxP4JRe7', NULL, '17.241404, 102.844596', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01545', 'ร้านแม่แว้ เหล่าใหญ่', '24 หมู่ 4 บ้านเหล่าใหญ่ ต.แชแล อ.กุมภวาปี จ.อุดรธานี', '810619824', NULL, NULL, 'https://maps.app.goo.gl/PtotbGHe1e3SKH8Y6', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01546', 'กอบัว', '155 หมู่ 4 บ้านโนนเจริญ ตำบลโนนสมบรูณ์ อำเภอเขาสวนกวาง จังหวัดขอนแก่น (หมู่บ้านจะออกมาทางบ้านหนองกรุงศรี ระหว่างมาบ้านโนนทองคำเจริญ อำเภอโนนสะอาด)', '800986836', NULL, NULL, 'https://www.google.co.th/maps/@17.0096581,102.7606828,3a,75y,18.86h,89.75t/data=!3m6!1e1!3m4!1s0mJQVJLS3DkqSZ1v6d8pIg!2e0!7i16384!8i8192?coh=205409&en', NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01547', 'สหกรณ์โรงเรียนบ้านกุดยาง', 'บ้านกุดยาง หมู่ 12 ต.ท่าลี่ อ.กุมภวาปี จ.อุดรธานี 41110', '8622243056', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01548', 'นาง ทองใบ ศรีพันดอน', NULL, '870110771', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01549', 'ลักษมีการค้า', '215 หมู่ 8 บ้านดงเรือง ต.ผาสุก อ.กุมภวาปี จ.อุดรธานี 41370', '854524251', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01550', 'แม่น้อย กุมภวาปี', '142/1 หมู่ 1 บ้านดงเมือง ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '633319980', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=17.110119,103.009202', NULL, '17.110257, 103.009191', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01551', 'แม่เพียรทอง บ.ดงแคน', '82 หมู่ 11 บ้านดงแคน ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '956622164', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01552', 'โรงเรียนบ้านคำเจริญ', 'ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '810522413', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01553', 'โบว์ การค้า', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01554', 'โซยู หมูกะทะ', '16 หมู่ 4 บ้านท่าลี่ ต.ท่าลี่ อ.กุมภวาปี จ.อุดรธานี 41110', '985748934', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=16.960632354640364,103.07502153517352', NULL, '16.963457, 103.072503', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01555', 'น้องน้ำมนต์', '170 ม.8 บ.นาดี ต.นาดี อ.หนองแสง จ.อุดรธานี 41340', '621367259', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01556', 'มินิ อาร์เตอร์', '15 หมู่12 ต.พังงู อ.หนองหาน จ.อุดรธานี 41130', '927802012', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01557', 'นาง แจ่มจันทร์ พันแสน', '222/1 ม.12 บ.โพนทอง ต.อุ่มจาน อ.ประจักษ์ศิลปาคม จ.อุดรธานี', '081-0595392', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01558', 'สองวงมาร์เก็ต', '251 หมู่ที่ 3 บ้านซ่ำปาหัน ต.บ้านจีต อ.กู่แก้ว จ.อุดรธานี 41130', '659205818', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01559', 'ทองสุขพาณิชย์', 'เลขที่ 161/1 หมู่ที่ 8 ต.โคกเครือ อ.หนองกุงศรี จ.กาฬสินธุ์ 46220', '899158922', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=16.737732,103.296481', NULL, '16.737819, 103.296502', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01560', 'น้องฟองดูว์', '75 หมู่ที่ 12 บ้านโนนสำราญ ต.บุ่งแก้ว อ.โนนสะอาด จ.อุดรธานี 41240', '832214116', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01561', 'ร้าน สามพี่น้อง', '146 หมู่ที่ 9 ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี 41370', '640086292', NULL, NULL, NULL, NULL, '17.178043, 102.899409', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01562', 'บิ๊กแบร์', '354/1 ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี 41240 ร้านบิ๊กแบร์ สีน้ำตาลดำทรงคาเฟ่ค่ะ', '889713276', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=16.95100289579836,102.88181645180939', NULL, '16.951162, 102.881870', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01563', 'ธนภรณ์ ชาจันโท', '167/2 บ้านท่าลี่ ตำบลท่าลี่ อำเภอกุมภวาปี จังหวัดอุดรธานี 41110', '979577764', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=16.956342763250586,103.0771500958276', NULL, '16.956481, 103.077107', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01564', 'ร้านค้าสหกรณ์ชุมชนบ้านม่วงเฒ่า', '225 ม.4 บ้านม่วงเฒ่า ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี 41240', '863262303', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01565', 'ปูนา ช็อป', '12/1 หมู่ 13 ต.กุมภวาปี อ.กุมภาวาปี จ.อุดรธานี 4110', '869398255', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01566', 'นาย พินิจ อนันตกำเนิด', '31 หมู่ 3 ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี 41110', '870471140', NULL, NULL, NULL, NULL, '17.096639, 102.985773', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01567', 'ร้านแสงเดือน', '160 หมู่ที่ 10 บ้านเดี่ยม ต.เชียงแหว อ.กุมภวาปี จ.อุดรธานี 41370', '625411429', NULL, NULL, NULL, NULL, '17.216238, 103.033272', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01568', 'บัญชิตา กองกรม', '186 บ้านห้วยแสง หมู่ที่6 ต.โพธิ์ศรีสำราญ อ.โนนสะอาด จ.อุดรธานี', '981489824', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01570', 'โรงเรียนคำเมยวิทยาคม(1)', 'บ้านชัยเจริญ หมู่ 17 ต.หัวนาคำ อ.ศรีธาตุ จ.อุดรธานี 41230', '982950292', NULL, NULL, 'https://maps.app.goo.gl/Z3UTxXhXRGg1rx228', NULL, '17.080504, 103.282438', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01571', 'แมว มั่งมี', '169หมู่ที่14 ต.ท่าลี่ อ.กุมภวาปี จ.อุดรธานี 41110', '099-351-7117', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01572', 'มยุรา ภูหัดสวน', '13 หมู่ที่3 ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี 41240', '630298269', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01573', 'มยุรา ภูหัดสวน', '13 หมู่ที่3 ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี 41240', '630298269', NULL, NULL, NULL, NULL, NULL, '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01577', 'บริษัท เอ็น ที โฮม มาร์ท จำกัด', '618 ม.1 ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี 41240', '932690209', NULL, NULL, NULL, NULL, '16.993594, 102.892831', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01585', 'สมบูรณ์การค้า', '99 หมู่ที่ 12 บ้านนาตาล ต.นาตาล อ.ท่าคันโท จ.กาฬสินธุ์ 46190', '845107918', NULL, NULL, 'https://maps.app.goo.gl/iRKT7bfNd9aZvDiQA', NULL, '16.939773, 103.250043', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01589', 'ร้าน มั่งมีสุขสันต์', '78 หมู่ที่ 6 บ้านนาทัน ต.ท่าลี่ อ.กุมภวาปี จ.อุดรธานี 41370', '959384526', NULL, NULL, 'https://maps.app.goo.gl/KqE9tschzyfmq5hR7', NULL, '16.930219, 103.088974', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-01590', 'นลินการค้า', '198 หมุ่3 ต.โพธิ์ศรีสำราญ อ.โนนสะอาด จ. อุดรธานี 41240', '653392939', NULL, NULL, NULL, NULL, '16.984620, 102.825206', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01592', 'สุวรรณ์ สมพงษ์', NULL, '857572359', NULL, NULL, 'https://maps.app.goo.gl/CgyQW4UJ1DULX9fXA', NULL, '17.177220, 103.069498', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01597', 'มารวยซุปเปอร์', '103 หมู่ 1 บ้านโนนสะอาด ต.โนนสะอาด อ.โนนสะอาด จ.อุดรธานี 41240', '832325535', NULL, NULL, NULL, NULL, '16.968886, 102.892174', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01604', 'กอก สโลว์บาร์', '222 หมู่ 6 บ.กอก ต.ศรีธาตุ อ.ศรีธาตุ จ.อุดรธานี 41230', '858530696', NULL, NULL, NULL, NULL, '16.986199,103.228259', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01605', 'ร้านทรัพย์ศิริพาณิชย์', '153 หมู่10 ตำบลนาดี อำเภอหนองแสง จังหวัดอุดรธานี 41340', '639687945', NULL, NULL, 'https://maps.app.goo.gl/C4gKRmPeRWbYiknC9', NULL, '17.072051, 102.853915', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01610', 'ร้านดอนเสือเหลือง', '363 หมู่7 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '862254535', NULL, NULL, NULL, NULL, '17.157670, 102.977439', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01613', 'นิคมการค้า', '230 หมู่ 9 ต.วังสามหมอ อ.วังสามหมอ จ.อุดรธานี 41280', '064-0686864', NULL, NULL, 'https://maps.app.goo.gl/yATn52YcbLxk3tL27', NULL, '16.956332, 103.434894', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-01615', 'น้องน้ำพั้นซ์ มินิมาร์ท', '203 หมู่11 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '909691315', NULL, NULL, 'https://maps.app.goo.gl/jWTsdgr4ZN1xijE38', NULL, '17.098170, 103.028665', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-01617', 'พี่อภิญญา', '154 ม.1 ต.จำปี อ.ศรีธาตุ จ.อุดรธานี 41230', '836653766', NULL, NULL, NULL, NULL, '16.955672, 103.169248', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01623', 'สหกรณ์บ้านสี่แจ', 'โรงเรียนบ้านสี่แจ', '951805410', NULL, NULL, NULL, NULL, '17.164405, 102.933308', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01630', 'บริษัท เฟิสท์มาร์ท กรุ๊ป จำกัด (สำนักงานใหญ่)', NULL, '087-2203412', NULL, NULL, NULL, NULL, '17.267531, 103.000979', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01633', 'แม่รัตน์ สงเปลือย', '311 หมู่ 1 บ้านสงเปลือย ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี 41370', '889312976', NULL, NULL, 'https://maps.app.goo.gl/ENQo6zFDNiZLCh1z7', NULL, '17.181403, 102.900272', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01637', 'ยุรี นกเทศน้อย', '180หมู่2 บ้านทมป่าข่า ต.ทมนางาม อ.โนนสะอาด จ.อุดรธานี', '636725240', '636725240', NULL, 'https://goo.gl/maps/qArQ1Dwp9oNrTpbLA', NULL, '16.908892, 103.004209', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-01651', 'ร้านหญิง', '205 หมู่ 1 บ้านนาตาล ต.นาตาล อ.ท่าคันโท จ.กาฬสินธิ์ 46190', '969792645', '969792645', NULL, 'https://maps.app.goo.gl/2dw4pnGQya8Wykt78', NULL, '16.938242, 103.226377', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-01660', 'ร้าน เจริญรุ่งเรืองทรัพย์', '126 ม.2 บ้านเชียงแหว ตำบลเชียงแหว อำเภอกุมภวาปี จังหวัดอุดรธานี 41110', '855108697', NULL, NULL, NULL, NULL, '17.181128, 103.000822', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01673', 'หลงส่าว', 'หมู่ 1 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110', '872299199', NULL, NULL, 'https://maps.app.goo.gl/MJRBAeP8AJ96FhAM7', NULL, '17.110877, 103.011350', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01680', 'พาขวัญพาณิชย์', '241 ม.6  ต.แสงสว่าง อ.หนองแสง  จ.อุดรธานี 41340', '871779065', NULL, NULL, NULL, NULL, '17.121804, 102.819173', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01692', 'เธียรรุ่งภาณิชย์', '103 หมู่ที่ 4 ต.ศรีธาตุ อ.ศรีธาตุ จ.อุดรธานี', '804219421', NULL, NULL, 'https://maps.app.goo.gl/gRSDCdNcxBY7uLTo8', NULL, '16.975909, 103.198974', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01697', 'นาย อ๊อด เพ็งพิศ', '70 หมู่ 6 บ้าน กุงเก่า ต.กุงเก่า อ.ท่าคันโท จ.กาฬสินธุ์', '801902314', NULL, NULL, NULL, NULL, '16.913602, 103.174679', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01701', 'แพรวนภา สายสิงห์', '166 หมู่ 11 ต.จำปี อ.ศรีธาตุ', '801472930', NULL, NULL, 'https://maps.app.goo.gl/ddQ6i3ZkWCtj1tUr5', NULL, '16.973978, 103.220206', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01703', 'ร้าน สาม ป.พาณิชย์ (ปามเก่า)', '46 ม.11 ต.บ้านโปร่ง อ.ศรีธาตุ จ.อุดรธานี', '0655836201ช/06161556', NULL, NULL, 'https://maps.app.goo.gl/cXjvbakZ8r4diCkg9', NULL, '17.012699, 103.117701', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01706', 'ร้าน แม่น้อย', '60 หมู่2 บ้านเชียงแหว ต.เชียงแหว อ.กุมภวาปี จ.อุดรธานี', '894567325', NULL, NULL, 'https://maps.app.goo.gl/DmUMnzPxoMzR2bNv6', NULL, '17.179249, 103.001939', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01710', 'อรพรรณ', '21 หมู่ 1 บ้าน นาฝาย ต.นาดี อ.หนองแสง จ.อุดรธานี', '847935193', NULL, NULL, 'https://maps.app.goo.gl/LqVnvJem72YLJYbGA', NULL, '17.088021, 102.853693', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01711', 'ร้านวิเศษพูลทรัพย์', '32 หมู่ 9 บ้านหนองบัวทอง ต.นาดี อ.หนองแสง จ.อุดรธานี 41340', '997060709', NULL, NULL, NULL, NULL, '17.105085, 102.882737', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01712', 'ก๋วยเตี๋ยวตอแหล', '7 หมู่ 15 บ้านปะโค ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '0981043061/063018281', NULL, NULL, 'https://maps.app.goo.gl/C4hU6Q3PZHWK6itA8', NULL, '17.105595, 102.941173', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01713', 'ร้าน ถูกดี คุณรุษณี (รุ่งเรืองการค้า เก่า)', '64 หมู่ 7 ต.หนองกุงศรี อ.โนนสะอาด จ.อุดรธานี', '081-3209406', NULL, NULL, 'https://goo.gl/maps/bCnSabRRnSZbPw8v6', NULL, '17.058424, 102.786729', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01716', 'ร้านคุณยายช้อป', '509/2 หมู่ 15 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '847563299', NULL, NULL, 'https://maps.app.goo.gl/L4akaqRuF6jkdLzt6', NULL, '17.127127, 102.965412', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01722', 'น้อง ลดา', '108 บ้านดงเมือง ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี', '812810912', NULL, NULL, 'https://maps.app.goo.gl/5uiVV63CRBMEA7ww6', NULL, '17.102495, 103.019102', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01726', 'จ.เจริญพาณิชย์', '11หมู่5บ้านท่ายม ต.แสงสว่าง อ.หนองแสง จ.อุดรธานี', '903376691', NULL, NULL, 'https://maps.app.goo.gl/sKsqM8dyfcUdVxaZ8', NULL, '17.138021, 102.786708', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-01729', 'ร้าน ตะวัน', '47 หมู่ 5 บ้านโคกข่า 5 ต.บ้านโปร่ง อ.ศรีธาตุ จ.อุดรธานี 41230', '926836076', NULL, NULL, 'https://maps.app.goo.gl/EojLoVefdMNRfmty5', NULL, '16.997491, 103.117690', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01730', 'ฟู้ฟู้ ช้อป', '515 หมู่ 9 บ้านโคกหนองแวง ต.นายูง อ.ศรีธาตุ จ.อุดรธานี 41230', '895729182', NULL, NULL, 'https://maps.app.goo.gl/3nyHcCF5KXG4JtEK9', NULL, '16.967444,103.265979', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01739', 'ร้านไม้หอม', '48 หมู่ที่ 6 บ้านห้วยกองสี ต.ตูมใต้  อ.กุมภวาปี จ.อุดรธานี 41110', '926673881', NULL, NULL, 'https://maps.app.goo.gl/QToAHaAkoA4HeMsg8', NULL, '17.078423, 102.933241', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01742', 'ร้านน้องไอด้า(น.ส.อ้อยทิพย์ อินทร์อุดม)', '142หมู่4 บ้านตูมเหนือ ต.ตูมใต้ อ.กุมภวาปี จ อุดรธานี 41110', '908107468', NULL, NULL, 'https://maps.app.goo.gl/dPPtph4h2kXXi1B6A', NULL, '17.094487, 102.976150', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01745', 'ชุมชนบ้านทุ่งสว่าง', 'ต.พังงู อ.หนองหาน จ.อุดรธานี', '979806482', NULL, NULL, 'https://maps.app.goo.gl/64JAxsU1jbJL8iT67', NULL, '17.252499, 103.091275', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01746', 'ศูนย์สาธิต พังงู', 'บ้านพังงู ต.พังงู อ.หนองหาร จ.อุดรธานี', '945760646', NULL, NULL, 'https://maps.app.goo.gl/dRknvjwpCWbeUqft7', NULL, '17.238281, 103.119130', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01747', 'ร้าน พ่อไหม', 'บ้านดอนแคน ต.ค้อใหญ่ อ.กู่แก้ว จ.อุดรธานี', '856438192', NULL, NULL, 'https://maps.app.goo.gl/Wf9HCvtujThgZa9QA', NULL, '17.211133, 103.139563', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01748', 'ร้านธงฟ้าชุมชนบ้านดอนแคน', 'บ้านดอนแคน ต.ค้อใหญ่ อ.กู่แก้ว จ.อุดรธานี', '801795259', NULL, NULL, 'https://maps.app.goo.gl/p6cuj7PyWnXfYUc37', NULL, '17.211094, 103.139666', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01749', 'ส.ห.ก.บ้านค้อคำ', 'บ้านค้อคำ ต.ค้อใหญ่ อ.กู่แก้ว จ.อุดรธานี', '988526419', NULL, NULL, 'https://maps.app.goo.gl/MXrNBSyeU6RZU79c8', NULL, '17.209569, 103.145353', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01752', 'KUMYAI BURGER', '292 หมู่ที่8 ต.กุมภวาปี อ.กุมภวาปี จ.อุดรธานี 41110  (ฐิติรัตน์ เพลส(หลังสีส้ม)', '929698199', NULL, NULL, 'https://maps.app.goo.gl/fymA98dh69BQHd7Z8', NULL, '17.113833, 103.011445', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01753', 'เฮียเต่า เต็มธนะ (ส่งคูสวัสดิ์)', 'หมู่ที่ 15 บ้านน้ำฆ้อง ต.พันดอน อ.กุมภวาปี จ.อุดรธานี 41370', '956615544', NULL, NULL, NULL, NULL, '17.130521, 102.961932', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01754', 'น.ส.มยุรี ดวงดี', '67 ม.11 ต.พันดอน อ.กุมภวาปี จ.อุดรธานี', '891851524', NULL, NULL, 'https://maps.app.goo.gl/y7TVJuj5ymtdWtpH8', NULL, '17.111629, 102.948753', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-01755', 'ศรีปัญญา ประสงค์สุข (คันธมาทน์ เก่า)', NULL, '613823896', NULL, NULL, 'https://maps.app.goo.gl/kJAL8yhJvgV8FgJp9', NULL, '17.17421, 103.072027', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01756', 'ร้าน น้องนาย', '9 หมู่5 บ้านโคกข่า ต.บ้านโปร่ง อ.ศรีธาตุ จ.อุดรธานี 41230', '083-2252356', NULL, NULL, 'https://maps.app.goo.gl/EojLoVefdMNRfmty5', NULL, '16.997491, 103.117690', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01759', 'ชมพู่ มินิมาร์ท', '113หมู่8 บ้านกุงเก่า ต.กุงเก่า อ.ท่าคันโท จ.กาฬสินธุ์', '836198754', NULL, NULL, '16.911113852560877, 103.17512455647618', NULL, '16.911120, 103.175262', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-01766', 'ร้าน อิงฟ้า มินิมาร์ท', '108 หมู่ 5 บ้านโคกข่า 5 ต.บ้านโปร่ง อ.ศรีธาตุ จ.อุดรธานี 41230', '935427708', NULL, NULL, 'https://maps.app.goo.gl/DmmxCvzTZDEkJr5r7', NULL, '16.997921,103.116781', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01768', 'ใบหม่อน อาหารสด', '78 หมู่ที่2 ต.หนองกุงศรี อ.โนนสะอาด จ.อุดรธานี 41240', '841794272', NULL, NULL, 'https://maps.app.goo.gl/av6LLmA3JySnjQ9v9', NULL, '17.035312, 102.808885', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01771', 'นริศรา', '11 หมู่ที่ 5 บ้านโคกข่า ตำบลบ้านโปร่ง อำเภอศรีธาตุ จังหวัดอุดรธานี', '958163634', NULL, NULL, 'https://www.google.com/maps/search/?api=1&query=16.99774093515788,103.11717667218275', NULL, '16.997485,103.117556', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01773', 'วัด ห้วยกองสี', '222 หมู่6 ต.ตูมใต้ อ.กุมภวาปี จ.อุดรธานี 41110', '902869962', NULL, NULL, 'https://maps.app.goo.gl/LRJSnYt3CvAfEiqd8', NULL, '17.075726, 102.935027', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01774', 'ออร์แกน มินิมาร์ท', '67 หมู่ 4 บ้าน กุดดอกคำ ต.โพติ์ศรีสำราญ อ.โนนสะอาด จ.อุดรธานี 41240', '957582992', NULL, NULL, 'https://maps.app.goo.gl/W9mGQuyDDF21Rhis7', NULL, '16.979110, 102.838739', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01775', 'ร้านไทยกิจยางการยาง', 'ที่อยู่ 14/9 บ้านตะเคียนทอง ตำบล บ้านโปร่ง อ.ศรีธาตุ', '806811192', NULL, NULL, 'https://maps.app.goo.gl/W9QNTuZePYdHSNwB6', NULL, '17.020465, 103.127959', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01776', 'ร้ายก๋วยเตี๋ยวแม่ยัง', 'บ้านเลขที่13 หมู่1 ตำบลสีออ อำเภอกุมภวาปี จ.อุดรธานี', '639706808', NULL, NULL, 'https://maps.app.goo.gl/EtXBUBYz6Ridomu5A', NULL, '17.004188, 103.050870', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01777', 'ร้านอุดมศรี', 'บ้านเลขที่ 46 หมู่ 13 ตำบลท่าลี่ อำเภอกุมภวาปี จ.อุดรธานี', '971804960', NULL, NULL, 'https://maps.app.goo.gl/9PZWwMpWMogPR3HG7', NULL, '16.970436, 103.065725', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01778', 'ร้าน พ่อทวี', 'บ้านเลขที่ 49 หมู่ 13 ตำบลท่าลี่ อำเภอกุมภวาปี จ.อุดรธานี', '930720350', NULL, NULL, 'https://maps.app.goo.gl/W7RPFPjkAQMMawMcA', NULL, '16.970554, 103.067019', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01779', 'ร้าน แม่ละไม', 'บ้านเลขที่ 83 หมู่ 13 บ้านนาเพ็ญ ตำบลท่าลี่ อำเภอกุมภวาปี จ.อุดรธานี', '856883733', NULL, NULL, 'https://maps.app.goo.gl/MkpHMamcbgJCawpQ9', NULL, '16.970534, 103.067726', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01780', 'ร้าน แก่นนคร', '111 ม10 ต.ศรีธาตุ อ.ศรีธาตุ จ.อุดรธานี', '946324579', NULL, NULL, 'https://maps.app.goo.gl/MzbobXKNqxeZLVe39', NULL, '16.974788, 103.212368', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01781', 'ร้านทรัพย์ศิริการค้า', '19 ม.11 ต.จำปี อ.ศรีธาตุ จ.อุดรธานี', '828503930', NULL, NULL, 'https://maps.app.goo.gl/Gea9XdiasMHpgWYU6', NULL, '16.957172, 103.174628', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01784', 'ร้านพ่อบุญสา', '323 ม.7 ต.แชแล อ.กุมภวาปี จ.อุดรธานี', '083-523-0686', NULL, NULL, 'https://maps.app.goo.gl/mM6PFM6tVX3SE5Ei7', NULL, '17.160148, 103.061795', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01785', 'ร้าน พรยุภาพานิชย์', '29 หมู่​3 บ้านม่วง ​ต.คอนสาย ​อ.กู่แก้ว จ.อุดรธานี', '934438245', NULL, NULL, 'https://maps.app.goo.gl/1Fn41dAqxU9LrEdo8', NULL, '17.198008, 103.113656', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01786', 'ร้าน เฟิร์ส มาร์ท', '89 หมู่ 14 ต.คอนสาย อ.กู่แก้ว จ.อุดรธานี', '061-2428293', NULL, NULL, 'https://maps.app.goo.gl/y48FiwWySCCmsMc9A', NULL, '17.202414, 103.113672', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01787', 'นรินทร์ การค้า', '123 หมู่ 14 บ้านม่วง ต.คอนสาย อ.กู่แก้ว จังหวัดอุดรธานี', '062-996-0025', NULL, NULL, 'https://maps.app.goo.gl/93A3QWiXdUD1aheU7', NULL, '17.204734, 103.106522', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01788', 'จรัส การช่าง', '253 หมู่ 15 บ้านคอนสาย ต.คอนสาย อ.กู่แก้ว จ.อุดรธานี', '614012868', NULL, NULL, 'https://maps.app.goo.gl/cTtJE4cGCVwrK15h6', NULL, '17.205005, 103.102537', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01789', 'ร้านแม่เดือนเพ็ญ', '116 หมู่ 4 บ้านคอนสาย ต.คอนสาย อ.กู่แก้ว จ.อุดรธานี', '081-873-2251', NULL, NULL, 'https://maps.app.goo.gl/QPKYFkp2zSS8NQH37', NULL, '17.206349, 103.098636', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01791', 'สหการ บ้านม่วงสวรรค์', 'ม.15 ต.พังงู อ.หนองหาน จ.อุดรธานี', '080-824-4857', NULL, NULL, 'https://maps.app.goo.gl/msEoHRtkndmfUxRD8', NULL, '17.253549, 103.091860', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01794', 'ร้านสุภาพร', '51 ม.16 บ.สงเปลือย ต.เสอเพลอ อ.กุมภวาปี', '963713557', NULL, NULL, 'https://maps.app.goo.gl/hRFxyPbXhLjHTENq5', NULL, '17.180443, 102.903388', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01795', 'หนองแดงพาณิชย์', '126 หมู่ที่ 6 บ้านหนองแดง ต.สีออ อ.กุมภวาปี จ.อุดรธานี 41110', '885269218', NULL, NULL, 'https://maps.app.goo.gl/STB2h1BXWNovMc8C6', NULL, '17.027636, 103.029602', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01797', 'ร้าน มาราธอนมินิมาร์ท', 'บ้านเลขที่138 หมู่4 ต.ค่อใหญ่ อ.กู่แก้ว บ้านดอนแคน', '810555663', NULL, NULL, 'https://maps.app.goo.gl/8iS2Kn9r26YyXqnC6', NULL, '17.210602, 103.138073', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01798', 'ร้าน ยุทธนาพาณิชย์', '47ม.3บ้านค่อคำ ต.ค้อใหญ่ อ.กู่แก้ว', '647533897', NULL, NULL, 'https://maps.app.goo.gl/nX8gSpsQt8zSD2ZP7', NULL, '17.209488, 103.145295', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01799', 'ร้าน คุณออย', '21 ม.5 บ.โคกกลาง ต.หัวนาคำ อ.ศรีธาตุ จ.อุดรธานี', '802709171', NULL, NULL, 'https://maps.app.goo.gl/PXQ6cYMFk2AKMaSt9', NULL, '17.088981, 103.318906', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01800', 'ร้านศุภชัยการค้า', 'เลขที่134 บ้านเหล่าสวนกล้วย ต.โนนทองอิน อ.กู่แก้ว จ.อุดรธานี', '833498959', NULL, NULL, 'https://maps.app.goo.gl/jK1YaMQzxS242QKPA', NULL, '17.204931, 103.182457', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01803', 'ปนัดดา', 'บ้านพักโรงงานน้ำตาลเกษตรผล ห้อง193/290[ซอยสุดท้ายฝั่งขวามือ] ม.9ต.ปะโค อ.กุมภวาปี', '654732453', NULL, NULL, 'https://maps.app.goo.gl/XTSGZwiLEw7RAJ1QA', NULL, '17.079265, 102.919532', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01804', 'ร้าน พรีมพั้นช์', '129หมู่3 บ้านคำเมย ต.หัวนาคำ อ.ศรีธาตุ จ.อุดรธานี 41230', '937413658', NULL, NULL, 'https://maps.app.goo.gl/jV6rEuw44pBYBcce6', NULL, '17.082487, 103.283757', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01805', 'ร้านเจ้ไล', '120 ม6 ต.หนองหิน อ.หนองกุงศรี จ.กาฬสิน 46220', '894527190', NULL, NULL, 'https://maps.app.goo.gl/KrJSndxsAS3owiDe7', NULL, '16.816237, 103.370407', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01807', 'ร้าน ว.เจริญ', '154 หมู่3 ต.หนองหลัก อ.ไชยวาน', '927752621', NULL, NULL, 'https://maps.app.goo.gl/LtPNcqw8MHvFHCLL6', NULL, '17.262516, 103.197511', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01809', 'ร้านต้นหลัก', '191 ม.6 ต.บ้านจีต อ.กู่แก้ว จ.อุดรธานี', '832423412', NULL, NULL, 'https://maps.app.goo.gl/UQEytRUEFDLXzzcNA', NULL, '17.188569, 103.161253', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01810', 'ร้าน เพชรการค้า', 'เลขที่33 หมู่3 ต.เสอเพลอ อ. กุมภวาปี จ.อุดรธานี', '935454063', NULL, NULL, 'https://maps.app.goo.gl/JP8nEqGPvtUnyiJx7', NULL, '17.222607, 102.860861', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01811', 'ร้านแก้มหอมมินิมาร์ท', 'เลขที่69 หมู่6 ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี', '902959997', NULL, NULL, 'https://maps.app.goo.gl/ZCAQ3nY5JKrPnapYA', NULL, '17.233464, 102.850129', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01812', 'ร้าน ส.รุ่งเรือง', '45หมู่6 บ้านห้วยแสง ต.โพธิ์ศรีสำราญ อ.โนนสะอาดจ.อุดรธานี 41240', '828997270', NULL, NULL, 'https://maps.app.goo.gl/4de6MTwvdCRsB8A36', NULL, '17.012447, 102.839273', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01813', 'ร้านตาน้อย', '59 ม.12 บ.โนนสวรรค ต.จำปี อ.ศรีธาตุ จ.อุดรธานี 41230', '990306030', NULL, NULL, 'https://maps.app.goo.gl/N4kCWoW55AAxwc4A7', NULL, '16.987422, 103.155537', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01814', 'ครัวเอมอร', '116 ม.7 บ้านกุดน้ำใส ต.ศรีธาตุ อ.ศรีธาตุ จ.อุดรธานี 41230', '0902692423 / 0854430', NULL, NULL, 'https://maps.app.goo.gl/6DdkZ7RQCP4gpQCh8', NULL, '16.971878, 103.232647', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01815', 'ร้านถูกใจใกล้บ้าน', '16/6 บ้านกรอก ต.ศรีธาตุ อ.ศรีธาตุ จ.อุดรธานี 41230', '9697888661', NULL, NULL, 'https://maps.app.goo.gl/Mc3PEKxMam2AYHN57', NULL, '16.989871, 103.229984', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01816', 'ร้านกิวนิวมินิมาร์ท', '184 ม.4 ต.โพนสูง อ.ไชยวาน จ.อุดรธานี 41290', '660761058', NULL, NULL, 'https://maps.app.goo.gl/eEZ7LceHwncX5243A', NULL, '17.160752, 103.245408', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01817', 'ร้าน เจริญวัฒนา', 'เลขที่181 หมู่1 ต.ศรีธาตุ อ.ศรีธาตุ จ.อุดรธานี 41230', '868582818', NULL, NULL, 'https://maps.app.goo.gl/rob6NnBkzhzowamw9', NULL, '16.973792, 103.215981', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01818', 'ร้านอ่อนจันทร์ ศรีธาตุ', 'เลขที่246 หมู่1 ต.ศรีธาตุ อ.ศรีธาตุ จ.อุดรธานี 41230', '898623902', NULL, NULL, 'https://maps.app.goo.gl/Abbqy9FBUnWzzotY9', NULL, '16.973616, 103.215996', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01819', 'ร้านประถมพานิช', 'เลขที่104 หมู่1 ต.ศรีธาตุ อ.ศรีธาตุ จ.อุดรธานี 41230', '850071096', NULL, NULL, 'https://maps.app.goo.gl/6gDoeMbf9e38mpjF6', NULL, '16.972721, 103.216073', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01820', 'คุณลูกหยี', '34 หมู่ที่15 บ้านโป่งคอม ตำบลเวียงคำ อำเภอกุมภาปี จังหวัด อุดรธานี 41110', '0624589894/085119899', NULL, NULL, 'https://maps.app.goo.gl/J17hcJZKYC4ryxNPA', NULL, '17.081824, 103.149646', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01823', 'นาย พิพัฒน์พงษ์ ศรีปัญญา', '114 ม.3 ต.อุ่มจาน อ.ประจักษ์ศิลปาคม จ.อุดรธานี 41110', '972378075', NULL, NULL, 'https://maps.app.goo.gl/La4X9PZ3nA6fhT5j9', NULL, '17.219874, 103.075569', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01831', 'น.ส. วันเพ็ง แพงวาปี [ ร้านยายเพ็ง ]', NULL, NULL, NULL, NULL, 'https://maps.app.goo.gl/F2RsPZUUga1fbbNc9', NULL, '16.975245, 103.197422', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-01837', 'ร้านแม่น้อย อุ่มจาน', 'เลขที่24 หมู่8 ต.อุ่มจาน อประจักศิลปาคม', '934672934', NULL, NULL, 'https://maps.app.goo.gl/bPiv1LuFr6X8ywtr5', NULL, '17.235544, 103.039981', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01838', 'ร้านดุดดาว', 'เลขที่182 หมู่8 ต.อุ่มจาน อ.ประจักศิลปาคม', '806142030', NULL, NULL, 'https://maps.app.goo.gl/yannXw1CTXV1oWNf9', NULL, '17.232808, 103.040869', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01839', 'ร้านค้าหมู่บ้าน บ้านทุ่งสว่าง', 'เลขที่196 หมู่12 ต.พังงู อ.หนองหาน จ.อุดรธานี 41130', '650156942', NULL, NULL, 'https://maps.app.goo.gl/kFnwmBswybejtyY66', NULL, '17.252369, 103.091309', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01840', 'ร้านบุญดี', 'เลขที่46 หมู่3 ต.พังงู อ.หนองหาน จ.อุดรธานี 41130', '805257536', NULL, NULL, 'https://maps.app.goo.gl/a3fCxUXPzpcE4TTB8', NULL, '17.245609, 103.132717', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01841', 'สหการหนองหญ้ารังกา', 'เลขที่166 หมู่9 ต.พังงู อ.หนองหาน', '949326606', NULL, NULL, 'https://maps.app.goo.gl/rGsVkhCr45miFbTk8', NULL, '17.244132, 103.154645', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01842', 'ร้านบ้านเฮา', 'เลขที่219 หมู่9 ต.พังงู อ.หนองหาน จ.อุดรธานี 41130', '621597947', NULL, NULL, 'https://maps.app.goo.gl/JGZxnKRyAswAeyTLA', NULL, '17.241392, 103.155926', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01843', 'อยู่นี่เด้อคาเฟ่ ตำเลย ณ โนนสะอาด', 'บ้านเลขที่ 621 หมู่1 ถนนมิตรภาพ ตำบลโนนสะอาด อำเภอโนนสะอาด จังหวัดอุดรธานี 41240', '098-134-5273', NULL, NULL, 'https://maps.app.goo.gl/nhwaGNiJ8ZhAjv3U8', NULL, '16.978759, 102.892585', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01846', 'พี่ นาง', '81/351 หมู่ที่16 แขวงกระทุ่มราย เขตหนองจอก กรุงทพมหานคร', '063-3932478', NULL, NULL, 'https://maps.app.goo.gl/2uKxpbvQ92bQ3yGPA', NULL, '17.195082, 102.882629', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01851', 'ร้าน ธ.เจริญพานิช', '81 หมู่ 5 ตำบลจำปี อำเภอศรีธาตุจังหวัดอุดรธานี', '626740498', NULL, NULL, 'https://maps.app.goo.gl/dNUZYucQD5ixvQvs8', NULL, '16.986485, 103.170223', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-01853', 'ร้านมะขามหวาน บ้านเหล่ากกเค็ง', 'บ้านเหล่ากกเค็ง ต.แชแล อ.กุมภวาปี จ.อุดรธานี', '656428175', NULL, NULL, 'https://maps.app.goo.gl/5WATXKGxXaeL1ZWG6', NULL, '17.162629, 103.086386', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01860', 'น.ส. ชุติกาญจน์ สันโดด [ร้าน ตากับยาย ]', '8 หมู่ที่ 4 ตำบลเสาเล้า อำเภอหนองกุงศรี จังหวัดกาฬสินธุ์', '934804744', NULL, NULL, 'https://maps.app.goo.gl/2nGLvbXS1krSridu7', NULL, '16.634394, 103.400425', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01864', 'ร้าน fonfashop', '130 หมู่ 1 บ้านแสงสว่าง ต.แสงสว่าง อ.หนองแสง จ.อุดรธานี 41340', '953369285', NULL, NULL, 'https://maps.app.goo.gl/hWPJPKM66HjC1qnW9', NULL, '17.120385, 102.826611', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01870', 'ร้านไก่จ๋า ชาพยอม', 'ใต้สะพานลอยบ้านปะโค หมู่ 1 ตำบลปะโค อำเภอ กุมภวาปี ตังหวัดอุดรธานี', '872194271', NULL, NULL, 'https://maps.app.goo.gl/Foi8XmVdVa7hnk876', NULL, '17.106406, 102.941722', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01872', 'นุ่มนิ่ม บ.เหล่ากล้วย', '82 ม.3 บ.เหล่ากล้วย ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี 41370', '909091699', NULL, NULL, 'https://maps.app.goo.gl/c94sfxpLq5AZpoAP7', NULL, '17.223557, 102.859860', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01881', 'ร้านอรุณทรัพย์', '270หมู่11ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี 41370', '614181595', NULL, NULL, 'https://maps.app.goo.gl/tMP8urm6gpPDyey39', NULL, '17.255224, 102.815083', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01882', 'แม่ทำนอง', '129 หมู่ 18 บ้าน วังหน้าผา ตำบล เสอเพลอ อ.กุมภวาปี จ.อุดรธานี 41370', '996198957', NULL, NULL, 'https://maps.app.goo.gl/Sryz9XrCzCtezk3q8', NULL, '17.253943, 102.817406', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01883', 'ร้านเด่นเจริญ', '27หมู่15 ต.เสอเพลอ อ.กุมภวาปี จ.อุดรธานี 41370', '985479997', NULL, NULL, 'https://maps.app.goo.gl/NTGhAK2nwU53b8V98', NULL, '17.252189, 102.821117', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01885', 'นาง สุกัญญา กำจัดภัย [ ร้าน มีตังค์ ]', NULL, '959036985', NULL, NULL, 'https://maps.app.goo.gl/pMG1xwbFascjiAJ87', NULL, '17.016388, 103.130588', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01891', 'พี่แม้ว บ.ปะโค', '46 หมู่ที่ 16 บ้านปะโค ต.ปะโค อ.กุมภวาปี จ.อุดรธานี 41370', '958431276', NULL, NULL, 'https://maps.app.goo.gl/3ycDwWSdhBgKB2yNA', NULL, '17.105145, 102.945354', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01892', 'สหการชุมชน บ้านเหล่าใหญ่', '126 หมู่ที่4 บ้านเหล่าใหญ่ ต.แชแล อ.กุมภวาปี จ.อุดรธานี', '860823167', NULL, NULL, 'https://maps.app.goo.gl/X1GpUGTqUctncYZQ7', NULL, '17.176183, 103.079371', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-01895', 'อัญมณี แถมสมดี', NULL, '642420603', NULL, NULL, 'https://maps.app.goo.gl/ejPFWzurwFtHMSXj9', NULL, '17.165120, 102.955554', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-100000', 'ร้านทรัพย์ทวี', '94ม.3ต.ปะโคอ.กุมภวาปี', '833410769', NULL, NULL, 'https://maps.app.goo.gl/qMfb8URinKjvXBHV8', NULL, '17.062861, 102.902801', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-100002', 'ปริษา', '261 ม.13บ้านบุ่งแก้ว ต.บุ่งแก้ว อ.โนนสะอาด จ.อุดรธานี', '991874249', NULL, NULL, 'https://maps.app.goo.gl/FiDwjT4RtpALx71Q9', NULL, '16.969197, 102.960548', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-100003', 'นาฝาย ซุปเปอร์', NULL, '855797095', NULL, NULL, NULL, NULL, '17.087573, 102.854592', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-1058', 'ร้านหน่อยพาณิชย์ บ้านคำไผ่', NULL, '822059074', NULL, NULL, 'https://maps.app.goo.gl/KcfK8wFTWyAWz2EQA?g_st=ic', NULL, '17.099185, 103.131597', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-1200', 'แม่ยศ บ้านทมนางาม', NULL, '987313390', NULL, NULL, 'https://maps.app.goo.gl/yHitCVFBtn33URuu6', NULL, '16.892127, 102.941017', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-1256', 'ร้านแม่บานเย็น', 'บ้านหนองแวงใต้ ต.ผาสุก อ.กุมภวาปี', '621929854', NULL, NULL, 'https://maps.app.goo.gl/PKSKx8gynsDhS5eA7', NULL, '17.192327, 102.942028', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-1299', 'แม่โสภา เกิ้งท่าคันโท', NULL, '944988917', NULL, NULL, 'https://maps.app.goo.gl/Qv9nggVmxJf2ankMA', NULL, '16.905827, 103.239174', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-1410', 'จันทร์เพ็ญ(แม่แฮ่น)', NULL, '811293958', NULL, NULL, 'https://maps.app.goo.gl/kFSpywwPXugoXNoY9', NULL, '17.159187, 103.058750', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-1414', 'ฐิติรัตน์ บ้านหนองไผ่(ร้านมั่งมี)', NULL, '895057278', NULL, NULL, 'http://www.17.319751', NULL, '17.319751, 103.086348', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-1437', 'ร้านแม่พิมพา บ.โนนผาสุก', '', '986932155', NULL, NULL, 'https://maps.app.goo.gl/dsNY7BKNtGRBBdbN7', NULL, '17.176106,102.942322', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-1506', 'สหการหมู่14บ้านม่วง', NULL, '887476781', NULL, NULL, 'https://maps.app.goo.gl/P6mhtFaKtmAU1EFu5', NULL, '17.205220, 103.109682', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-1524', 'เจริญยนต์พาณิช', NULL, '801858045', NULL, NULL, 'https://maps.app.goo.gl/hf69H8zBRAQ4TP2f6', NULL, '17.181849, 103.177164', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-15436', 'ทดสอบ', '36 18', '949282179', '-', NULL, NULL, NULL, '13.724731, 100.769962', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-1583', 'สหการบ้านหนองเม็กน้อย', '11 หมู่ 4 ต.อุ่มจาน หนองเม็กน้อย', '918639193', NULL, NULL, 'https://maps.app.goo.gl/xGV9goajnQozc6By7?g_st=ipc', NULL, '17.265633, 103.051815', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-1645', 'ยายสาย บ้านหิวฮาว', NULL, '927458298', NULL, NULL, 'https://maps.app.goo.gl/M2zEw44prYCD9DmRA?g_st=ic', NULL, '17.102124, 103.080907', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-1691', 'โชคดี มินิมาร์ท บ้านหนองกวาง', '157หมู่4 บ.หนองกวาง ต.สีออ อ.กุมภวาปี จ.อุดรธานี', '958321164', NULL, NULL, NULL, NULL, '17.010252, 103.047657', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-1714', 'เจ้ณี บุ่งหมากลาน', NULL, '611059707', NULL, NULL, 'https://maps.app.goo.gl/Zry2QvPiUAjP3Ms3A', NULL, '17.070077, 102.886013', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-1719', 'น้องบูม นาแบกม.17', NULL, '893759115', NULL, NULL, 'https://maps.app.goo.gl/EjtRf278XkUe88vC8', NULL, '17.106383, 103.033430', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-1779', 'มณีรัตน์ บ้านดูนสาด(กระนวน)', '234หมู่10 บ้านดูนสาด ต.ดูนสาด อ.กระนวน', '897098781', NULL, NULL, 'https://maps.app.goo.gl/s9RZhihQoZ6aH5Tn8?g_st=ic', NULL, '16.795785, 103.165266', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-1786', 'พ่อจานศรี บ้านหนองบัวแดง', NULL, '849579956', NULL, NULL, 'https://maps.app.goo.gl/vmpTTzYSHFHGTALd9', NULL, '17.314836, 103.118718', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-1793', 'แม่พร บ้านโคกสว่าง', NULL, '611537471', NULL, NULL, 'https://maps.app.goo.gl/KuamTtA3poGtW3rq8', NULL, '17.073534, 103.355004', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-1820', 'ลำภูพาณิชย์ บ้านโคกศรีสำราญ', NULL, '924498068', NULL, NULL, 'https://maps.app.goo.gl/sLrhJMuoS4pDQg1d8', NULL, '17.250472, 102.825927', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-2032', 'มั่งมี โคกสว่าง(กระนวน)', 'ศาลากลางบ้านโคกสว่าง ต.ห้วยยางอ.กระนวน', '801019570', NULL, NULL, 'https://maps.app.goo.gl/Eb29xdgjJXbyf82r8?g_st=ic', NULL, '16.829141,103.075811', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-2141', 'พูนทรัพย์พานิช', NULL, '923173085', NULL, NULL, 'https://maps.app.goo.gl/iA7DRGBdsEAJ4tDT7', NULL, '17.300490, 103.196701', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-2200', 'แม่นาง บ้านคอนสาย', NULL, '621246517', NULL, NULL, 'https://maps.app.goo.gl/kii7CcykZpsbBfEJ8', NULL, '17.207416, 103.098270', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-2217', 'แม่รฐา หนองบง', NULL, '972348536', NULL, NULL, 'https://maps.app.goo.gl/sH4jVz1DWrd4XeM67', NULL, '17.171460, 103.128451', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-2289', 'ร้านบิ๊กตาม บ้านม่วง', NULL, '982211342', NULL, NULL, 'https://maps.app.goo.gl/q744feefGAjEwZV68', NULL, '17.204263, 103.107299', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-2390', 'ร้านจริญา', '', NULL, NULL, NULL, NULL, NULL, '17.075854,103.015312', '2026-07-24 10:53:16', '08:00', '17:00'),
('OR-2409', 'พ่อเกลียว บ้านดูนสาด6(กระนวน)', '150หมู่6บ.ดูนสาด ต.ดูนสาด อ.กระนวน', '968903638', NULL, NULL, NULL, NULL, '16.792562, 103.162337', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-2475', 'ร้านพิทักษ์ บุญนาค', NULL, '832357198', NULL, NULL, 'https://maps.app.goo.gl/ZfmDCjZfYStVsUjCA', NULL, '17.102212, 103.080899', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-2480', 'น้องนามินิมาร์ท บ้านดูนสาด(กระนวน)', '65หมู่3 บ้านดูนสาด ต.ดูนสาด อ.กระนวน', '649607046', NULL, NULL, 'https://maps.app.goo.gl/69RbNAci9jb1p8TR9?g_st=ic', NULL, '16.797886, 103.155279', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-2528', 'ร้านจ๋า สะดวกซื้อ บ.ห้วยยาง', NULL, '862402939', NULL, NULL, 'https://maps.app.goo.gl/N6YqEfVEMswGJhKEA', NULL, '17.046160, 102.840020', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-2657', 'ชนะกิจ บะยาว', '254หมู่8 ต.บุ่งแก้ว อ.โนนสะอาด จ.อุดรธานี', '837566948', NULL, NULL, NULL, NULL, '16.946936, 103.016023', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-2672', 'ประกาศิต บ้านกุดขนวน', NULL, '982273874', NULL, NULL, 'https://maps.app.goo.gl/VDPKiKpAMAGGmb3J6', NULL, '16.985479, 103.006087', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-2807', 'บัวจันทร์ บ้านลานเต', NULL, '990151576', NULL, NULL, '(17.2544513, 103.0441494)', NULL, '17.254385, 103.044212', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-2962', 'เจเจออยแอนด์มินิมาร์ทบ.สนามชัย(กระนวน)', '295หมู่1บ.สนามชัย ต.หัวนาคำ อ. กระนวน', '806020799', NULL, NULL, 'https://maps.app.goo.gl/5JaECAuubxPgYaTR9?g_st=ic', NULL, '16.852949, 103.049370', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-3070', 'ร้านแม่ บ้านผือ', NULL, '626076399', NULL, NULL, 'https://maps.app.goo.gl/opHdwUneJ5v5dQfS9', NULL, '17.131208, 102.915566', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-3163', 'ร้านคอฟฟี่เบิร์ด บ.โนนผาสุก', NULL, '968257659', NULL, NULL, 'https://maps.app.goo.gl/vWtN8zQnr2D7M35M6?g_st=ic', NULL, '17.175753, 102.941370', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-3173', 'ร้านฌอกะเฌอ มินิมาร์ท', '525หมู่5 บ้านห้วยวังปลา', '625252505', NULL, NULL, 'https://maps.app.goo.gl/JhRSLGUXTYKSrkNM7', NULL, '17.009529,103.212184', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-3177', 'ทองขาวการค้า บ้านดูนสาด(กระนวน)', '198หมู่2บ.ดูนสาด ต.ดูนสาด อ.กระนวน', '612782084', NULL, NULL, NULL, NULL, '16.792994, 103.158961', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-3220', 'แก้มกัน บ้านพังซ่อน', NULL, '865309417', NULL, NULL, 'https://maps.app.goo.gl/UHPERHG4seRQU88E8', NULL, '17.253747, 103.093803', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-3234', 'โอจา ชานมไข่มุก', NULL, '802834442', NULL, NULL, 'https://maps.app.goo.gl/3gXmNGUx8W551Pju5?g_st=ac', NULL, '17.129945, 102.964942', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-3260', 'เอแอนด์โอคอฟฟี่ บ.ห้วยเกิ้ง', NULL, '847699870', NULL, NULL, 'https://maps.app.goo.gl/wiURW8DaYPdypsCk6?g_st=ac', NULL, '17.042489, 102.926607', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-3285', 'บอยทดสอบ5', '23หมู่4ต.ศรีธาตุ', '12341234', '12341234', NULL, NULL, NULL, '17.128536, 102.964650', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-3286', 'สหกรบ้านม่วง', NULL, '807379095', NULL, NULL, 'https://maps.app.goo.gl/LNjxwkG6FdZM5QEAA', NULL, '17.266644, 103.147964', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-3454', 'คุณเก๋ มินิมาร์ทบ.โนนสมบูรณ์(กระนวน)', '1หมู่6บ.โนนสมบูรณ์ ต.ห้วยยาง อ.กระนวน', '810561239', NULL, NULL, 'https://maps.app.goo.gl/VzYupXiVc76MRJAK9?g_st=ic', NULL, '16.866791, 103.108149', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-3456', 'แม่บรรเลง บ้านนามูล7(กระนวน)', '199หมู่7บ.นามูล ต.ดูนสาด อ.กระนวน', '633078668', NULL, NULL, NULL, NULL, '16.791659, 103.175841', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-3496', 'ร้านค้า OR-3496', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-31 15:11:57', '08:00', '17:00'),
('OR-3508', 'บีพี ไทยนิยม บ้านพังงู', '107หมู่11 ต.พังงู อ.หนองหาน', '823930421', NULL, NULL, 'https://maps.app.goo.gl/jegrBMioTWibhnd79', NULL, '17.238323, 103.121116', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-3549', 'สหการชุมชนบ้านขาวัว', NULL, '963756093', NULL, NULL, '(17.2541173, 103.1086421)', NULL, '17.254034, 103.108763', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-3566', 'บุญหลาย', '70หมู่10 บ้านหนองแวง', '92903832', NULL, NULL, 'https://maps.app.goo.gl/y1WadWGVrpwoX6mt9', NULL, '17.302332, 103.199823', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-3618', 'บีบีคอฟฟี่ บ.นาฝาย', NULL, '832865146', NULL, NULL, 'https://maps.app.goo.gl/2A5VatypuAQjSn9k7?g_st=ac', NULL, '17.087751, 102.853986', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-3715', 'นางภารดี ตรุสคาท(แม่จู่)บ้านนามูล(กระนวน)', '559หมู่ที่4บ.นามูล ต.ดูนสาด อ.กระนวน', '619078101', NULL, NULL, NULL, NULL, '16.792617,103.176369', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-3729', 'ร้านน้องนิวเยียร์ บ้านราชสมบูรณ์', NULL, '930192184', NULL, NULL, 'https://maps.app.goo.gl/tLfhumq5LvEzubfF6', NULL, '16.922674, 103.063074', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-3836', 'บอยทดสอบ4', '45หมู่8ต.ผาสุก', '25402540', '25402540', NULL, NULL, NULL, '17.128579, 102.964412', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-3860', 'ทีเจ บ้านจอมบึง(กระนวน)', '179หมู่8บ.จอมบึง ต. หัวนาคำ อ.กระนวน', '843260281', NULL, NULL, 'https://maps.app.goo.gl/dgKHDUzYvsGNmc7C9?g_st=ic', NULL, '16.840208, 103.046154', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-3924', 'แม่นิภา บ้านพรหมลิขิต', '456 ถ.สีลม แขวงสุริยวงศ์ เขตบางรัก กทม.', '847854460', NULL, NULL, 'https://maps.app.goo.gl/JAzXZ4pGAbwiKQQt9', NULL, '17.082075, 103.287449', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-3956', 'สหการไพจาน', NULL, '-', NULL, NULL, 'https://maps.app.goo.gl/mMLo8Cw65TbMuGJG9', NULL, '17.211451, 103.116223', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-4095', 'พี่น้อย โนนศรีสวัสดิ์', NULL, '887281237', NULL, NULL, 'https://maps.app.goo.gl/3TgbiWQWoQunaopC7', NULL, '16.781330, 103.353833', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-4115', 'นลินการค้า บ้านม่วง', NULL, '629960025', NULL, NULL, 'https://maps.app.goo.gl/KpeQNqqm5xRd4LiB8', NULL, '17.204453, 103.106574', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-4128', 'วันเพ็ญ บ้านสะอดานามูล', NULL, '913676905', NULL, NULL, 'https://maps.app.goo.gl/J9oGwEczFqpeHQdDA', NULL, '17.231377, 102.934486', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-4144', 'วิภารัตน์ บ้านโนนมะค่า', '18หมู่3บ.โนนมะค่า ต.กรุงเก่า อ.ท่าคันโท', '821479749', NULL, NULL, NULL, NULL, '16.94524,103.196563', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-4173', 'พี่อ้อย บ้านคำตานา(กระนวน)', '48หมู่6บ.คำตานา ต.หัวนาคำอ.กระนวน', '656824778', NULL, NULL, 'https://maps.app.goo.gl/dr9Wcvj7TK3vcP399?g_st=ic', NULL, '16.814271, 103.018433', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-4245', 'ยายต่วน โนนสมบูรณ์ไชยวาน', 'บ้านโนนสมบูรณ์ ต.โนนสูง อ.ไชยวาน', '649180295', NULL, NULL, 'https://maps.app.goo.gl/fNq6efNuiJyg7s1L7', NULL, '17.15904,103.267252', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-4294', 'ดาราพาณิชย์ บ้านพังงู', '126หมู่ ต.พังงู อ.หนอง', '943071313', NULL, NULL, 'https://maps.app.goo.gl/jhKbnY9qFEweskAFA', NULL, '17.238165, 103.116874', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-4329', 'ร้านแม่ใหม่ เกิ้งท่าคันโท', NULL, '910070557', NULL, NULL, 'https://maps.app.goo.gl/QcPrqbuhSBuaWahU9', NULL, '16.905249, 103.240272', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-4369', 'ตะวันชานมไข่มุก บ.ปะโค', NULL, '927909261', NULL, NULL, 'https://maps.app.goo.gl/RB5Tjphv9PEwyvs6A?g_st=ac', NULL, '17.057501, 102.920065', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-4387', 'ชนาทิศ บ้านห้วยยาง(กระนวน)', '41หมู่1บ.ห้วยยงต.ห้วยยางอ.กระนวน', '994340126', '994340126', NULL, 'https://maps.app.goo.gl/eJJDqnr3ALEZzZhu8?g_st=ic', NULL, '16.858006, 103.075023', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-4410', 'เป้พาณิชย์ โนนจำปา', NULL, '954527203', NULL, NULL, 'https://maps.app.goo.gl/JNDRwEq2MMsNsks56', NULL, '17.211724, 103.152487', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-4596', 'แม่ไหม บ้านโนนทิง', NULL, '992527914', NULL, NULL, 'https://maps.app.goo.gl/ZwWfZRudjWzuqVrU6', NULL, '16.996479, 103.014786', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-4618', 'ตึ๋งไก่สด2บ้านหนองนาคำ', '110หมู่14บ้านหนองนาคำ', '979607684', NULL, NULL, '(17.1902057, 102.9312716)', NULL, '17.190099,102.931271', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-4632', 'ร้านตั้งขายดี [นางรัตนา บุญบุตตะ]', '269 ม.5 บ.หนองบัวแดง ต.หนองไผ่ อ.หนองหาน จ.อุดรธานี', '811171983', NULL, NULL, 'https://maps.app.goo.gl/XmW6Q8Rgy3rKvq5x8', NULL, '17.315417, 103.114906', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-4646', 'แม่จ้า บ้านป่าก้าว', NULL, '872348251', NULL, NULL, 'https://maps.app.goo.gl/yERmMWPsWk8aJ7Lo9', NULL, '17.161282, 103.242774', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-4663', 'ร้านยูโร บ้านหัวหนองยาง', NULL, '819657967', NULL, NULL, 'https://maps.app.goo.gl/YbFGGqF4MydYHZXF7', NULL, '17.262702, 103.181461', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-4680', 'แม่ทูล บ้านหัวนาคำ(กระนวน)', '146หมู่9 บ.หัวนาคำ ต.หัวนาคำ อ.กระนวน', '872317624', NULL, NULL, 'https://maps.app.goo.gl/BBTfnBNkJA9wtare9?g_st=ic', NULL, '16.844346, 103.042916', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-4760', 'ชมพูน้ำดื่ม นาแบกหมู่17', NULL, '818735091', NULL, NULL, 'https://maps.app.goo.gl/1Y9TgVuKBhEJoaUp9', NULL, '17.105225, 103.031916', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-4807', 'พีแอนพีซุปเปอร์ บ้านหนองตะใกล้', NULL, '990157378', NULL, NULL, 'https://maps.app.goo.gl/dDVVpMX8MmxmVA1j7', NULL, '17.345146, 103.151974', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-4823', 'แม่ระเบียบ บ้านหนองกอบง', NULL, '636233017', NULL, NULL, '(17.3288693, 102.9867166)', NULL, '17.328908, 102.986757', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-4919', 'น้องไอติม เกิ้งท่าคันโท', NULL, '910070557', NULL, NULL, 'https://maps.app.goo.gl/UBNNiQWodcAAUAza8', NULL, '16.905321, 103.240305', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-4998', 'ออดี้ บ้านคำเจริญ(กระนวน)', '95หมู่10 บ.คำเจริญต.หัวนาคำอ.ระนวน', '954911711', NULL, NULL, 'https://maps.app.goo.gl/fe9Mq5F5tn1ycXFv8', NULL, '16.800273, 103.093475', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-5073', 'แม่อังคณา ตะวันบ้านสี่แจ', NULL, '986185415', NULL, NULL, 'https://maps.app.goo.gl/LyVuAKRNwjLmvWYZ6', NULL, '17.164659, 102.934522', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-5155', 'นอ มินิมาร์ท', NULL, '935179553', NULL, NULL, '(17.2845023, 103.0532518)', NULL, '17.284498, 103.053284', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-5166', 'จ.เจริญการค้า', NULL, NULL, NULL, NULL, NULL, NULL, '16.923544,103.040333', '2026-07-24 10:53:16', '08:00', '17:00'),
('OR-5185', 'แม่ก้าน เกิ้งท่าคันโท', NULL, '927940097', NULL, NULL, 'https://maps.app.goo.gl/odbuZrYiNzGiJ3C39', NULL, '16.908351, 103.233904', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-5216', 'แม่ละมุน บ้านม่วงศรีสมพร', 'ตำบล โพธิ์ศรีสำราญ อำเภอโนนสะอาด อุดรธานี 41240', '828452884', NULL, NULL, 'https://maps.app.goo.gl/zLJkHeACdZzPe6xDA', NULL, '16.982424, 102.851909', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-5262', 'สุรสิทธิ์ บ้านคำเจริญ(กระนวน)', '279หมู่10บ.คำเจริญต.หัวนาคำอ.กระนวน', '985470770', NULL, NULL, 'https://maps.app.goo.gl/eYy6T8UNwBuyQ1VV6?g_st=ic', NULL, '16.797474, 103.092150', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-5288', 'นำเฮง บ้านสามเหลี่ยม', '41หมู่4 บ.สามเหลี่ยม ต.ทับกุง อ.หนองแสง จ.อุดรธานี', '810597787', NULL, NULL, 'https://maps.app.goo.gl/74gEeCTmVf3ULNRo6', NULL, '17.174248, 102.802588', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-5308', 'เกตุชญา บ้านหิวฮาว', NULL, '644793854', NULL, NULL, 'https://maps.app.goo.gl/asqX9pqYeZcgtB7P7?g_st=ic', NULL, '17.103424, 103.079242', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-5349', 'น้องออร่า บ้านหนองเม็กน้อย', '49หมู่4 บ.หนองเม็กน้อย', '985867560', NULL, NULL, 'https://maps.app.goo.gl/Gnhh8JaKhGfTZb1NA', NULL, '17.264930, 103.047812', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-5406', 'แม่น้อย บ้านโนนมะค่า', NULL, '935487720', NULL, NULL, 'https://maps.app.goo.gl/PV9uUEznVpyn1H4j8', NULL, '16.945652, 103.196756', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-5409', 'แม่ติ๋ว บ้านนามูล(กระนวน)', '434หมู่7บ.นามูล ต.ดูนสาด อ.กระนวน', '948564749', NULL, NULL, 'https://maps.app.goo.gl/A8Jf2Ez1XwZayEyBA?g_st=ic', NULL, '16.792818, 103.172557', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-5444', 'จิระ มินิมาร์ท บ้านคำเมย', NULL, '812961090', NULL, NULL, 'https://maps.app.goo.gl/adjdxRBsZBhV3fVA8', NULL, '17.082802, 103.288593', '2026-07-23 11:48:50', '08:00', '17:00');
INSERT INTO `store` (`store_id`, `store_name`, `store_address`, `telephone_number`, `fax_number`, `email`, `url`, `customer_delivery_time`, `store_location`, `created_at`, `open_time`, `close_time`) VALUES
('OR-5474', 'แบมการค้า บ้านหนองนกเขียน', NULL, '623093263', NULL, NULL, 'https://maps.app.goo.gl/8Y1NqPGWn1dApU3b6', NULL, '17.007553, 103.289373', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-5512', 'อรลดาพาณิชย์ บ้านโคกถาวร(น้าปาน)', NULL, '879448499', NULL, NULL, 'https://maps.app.goo.gl/msLUVJaLrRvkMoka7', NULL, '17.288458, 103.124557', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-5573', '545เฮงเฮงการค้า โนนจำปา', NULL, '832526246', NULL, NULL, 'https://maps.app.goo.gl/Y7BVdUrLuSGGQqA38', NULL, '17.211302, 103.150735', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-5611', 'จันทิมา บ้านนาโป่ง(กระนวน)', '79หมู่7บ.นาโป่งอ.กระนวน(ติดศาลากลางหมู่บ้าน)', '943717149', NULL, NULL, 'https://maps.app.goo.gl/1d28wN2rJEVFRWjm7?g_st=ic', NULL, '16.827185, 103.061606', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-5632', 'แม่สมจิต บ้านม่วง', NULL, '930988387', NULL, NULL, 'https://maps.app.goo.gl/S53ZvfvSgXdLHXiCA', NULL, '17.204564, 103.105438', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-5652', 'วาวา', '244', '21147931', NULL, NULL, '(17.1284520, 102.9647962)', NULL, '17.128435, 102.964768', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-5884', 'แม่ยู บ้านหนองผึ้ง', NULL, '906130987', NULL, NULL, 'https://maps.app.goo.gl/bUSfohH3RvQDEieA6', NULL, '17.151651, 102.942209', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-6199', 'พรทิพย์ บ้านเรืองชัย', NULL, '934123987', NULL, NULL, 'https://maps.app.goo.gl/ex249rZ5tmYRnVQH8', NULL, '17.283744, 103.088180', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-6218', 'อินเตอร์ การค้า', '31หมู่16 บ้านหนองแวงอ.ไชวาน จ.อุดรธานี', '826503141', NULL, NULL, NULL, NULL, '17.30205,103.195052', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-6358', 'ร้านบุญช่วย กุมภวาปี(ข้างร้านอาหารตามสั่ง)', NULL, '830202370', NULL, NULL, 'https://maps.app.goo.gl/C23ZyBZro5tbh5h49', NULL, '17.103815, 103.010543', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-6359', 'พรพรรณช็อป บ้านนามูล(กระนวน)', '73หมู่7บ.นามูล ต.ดูนสาด อ.กระนวน', '979416346', NULL, NULL, 'https://maps.app.goo.gl/37zzjgevzUBzDzC58?g_st=ic', NULL, '16.793007,103.172577', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-6413', 'ดีดีทวีทรัพย์ บ้านหัวนาคำ(กระนวน)', '167หมู่2บ.หัวนาคำ ต.หัวนาคำ อ.กระนวน', '995304279', NULL, NULL, 'https://maps.app.goo.gl/GEFqoGhAje77VkEG6?g_st=ic', NULL, '16.845144, 103.046294', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-6415', 'ร้านแม่นาง บ้านคำแคน', NULL, '834651865', NULL, NULL, 'https://maps.app.goo.gl/9EDRp917ME4ZNPmf7', NULL, '17.123461, 103.134385', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-6442', 'บอยทดสอบ5', '66หมู่2ต.โนนสูง', '45454545', '45454545', NULL, NULL, NULL, '17.128514, 102.964625', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-6464', 'มากินคาเฟ่ บ้านสี่แจ', NULL, '611633894', NULL, NULL, 'https://maps.app.goo.gl/rUAvYHjJbuvwbaJq8?g_st=ic', NULL, '17.166384, 102.930460', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-6643', 'พ่อกอง บ้านมอดินแดง', NULL, '621482550', NULL, NULL, 'https://maps.app.goo.gl/82kgyqhznqmsN82p7', NULL, '17.221101, 102.778746', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-6651', 'ทรัพย์อุดม บ้านม่วงหวาน', NULL, '818717683', NULL, NULL, 'https://maps.app.goo.gl/MZv24TLHThiL9yFfA', NULL, '17.021192, 102.930815', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-6684', 'ร้านค้าชุมชนบ้านดูนเลา', NULL, '645836562', NULL, NULL, 'https://maps.app.goo.gl/tWfMJfPCpP5wivacA', NULL, '17.09958, 103.2035', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-6711', 'ร้านบุญเกิด บ.โคกล่าม', NULL, '616659361', NULL, NULL, 'https://maps.app.goo.gl/L5VRD8KcM5taRocL9', NULL, '16.990340, 102.977543', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-6823', 'ร้านอิทธิกรการค้า บ้านกุงเก่า', NULL, '645640349', NULL, NULL, 'https://maps.app.goo.gl/zNyQ6QnNwnfBdR169', NULL, '16.912313, 103.175083', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-6890', 'แม่นวล บ้านวังแข้', NULL, '981379529', NULL, NULL, 'https://maps.app.goo.gl/qBpgr1xpYJrArftp7', NULL, '17.128517, 103.231370', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-6891', 'นีน่าคอฟฟี่ กุมภวาปี', NULL, NULL, NULL, NULL, 'https://maps.app.goo.gl/EJjQVo9tNWE3n8nA7?g_st=ac', NULL, '17.103959, 103.017191', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-6988', 'เดือนการเกษตร บ้านพังซ่อน', NULL, '834639578', NULL, NULL, 'https://maps.app.goo.gl/SoyRRCViJiV7yrYi8', NULL, '17.253742, 103.094411', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-7186', 'แม่ต้อย บ้านกุดขอนแก่น', NULL, '957062029', NULL, NULL, 'https://maps.app.goo.gl/TUEmFwBHUhevhGGKA', NULL, '16.939159, 103.180994', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-7331', 'แม่ทองอวน บ้านเชียงกรม', NULL, '611295065', NULL, NULL, 'https://maps.app.goo.gl/n7EHwbyQ99qD3GaN7', NULL, '17.285522, 102.960807', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-7434', 'สมบูรณ์การค้า บ.โคกล่าม(กระนวน)', '137หมู่5บ.โคกล่าม ต.ห้วยยาง อ.กระนวน', '862212986', NULL, NULL, 'https://maps.app.goo.gl/mrQkHGGi3kgZ3JS19?g_st=ic', NULL, '16.863231, 103.086651', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-7446', 'พูนทรัพย์การค้า(น้องเฟย์)', NULL, '623235771', NULL, NULL, 'https://maps.app.goo.gl/LhVbqv4e3rvRHUb66', NULL, '16.956320, 103.171466', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-7462', 'นิลนาย ซุปเปอร์', '65 หมู่4 ต.พังงู อ.หนองหาน จ.อุดรธานี', '987967793', '987967793', NULL, 'https://maps.app.goo.gl/SD1e4aTqCVD9X7NYA', NULL, '17.256287, 103.133314', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-7467', 'ร้านค้าชุมชนบ้านวังแข้', NULL, '958175266', NULL, NULL, 'https://maps.app.goo.gl/2ePk8DNfpEkTHLqv6', NULL, '17.127552, 103.230390', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-7519', 'ร้านโชคชัย บ้านคอนสาย', NULL, '833618153', NULL, NULL, 'https://maps.app.goo.gl/yehRqQenZaXfsMX49', NULL, '17.203290, 103.098721', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-7527', 'น้องภูมิ บ้านหนองแซง', NULL, '924709598', NULL, NULL, 'https://maps.app.goo.gl/fUtxtLd5XiPJXeTt7', NULL, '16.864968, 103.261181', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-7628', 'แม่สำ บ้านกุดขอนแก่น', NULL, '982267446', NULL, NULL, 'https://maps.app.goo.gl/XtCSXYPP9CEgQomJ7', NULL, '16.943811, 103.181584', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-7683', 'เถ้าแก่เนส บ้านผักตบ', 'ตำบล ผักตบ อำเภอหนองหาน อุดรธานี 41130', '654572595', NULL, NULL, 'https://maps.app.goo.gl/TmzXS1fXxDsCRkMo8', NULL, '17.317432, 103.024118', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-7743', 'แม่หน่อย บ้านโคกใหญ่(น้ำพอง)', '221หมู่9บโคกใหญ่ ต.บัวเงิน อ.น้ำพอง จ.ขอนแก่น', '801773996', NULL, NULL, 'https://maps.app.goo.gl/e3uxvXZiuQiZECGJ6?g_st=ic', NULL, '16.802444, 103.006528', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-7836', 'ชุมชนบ้านโคกใหญ่ หมู่9', 'ร้านค้าชุมชนบ้านโคกใหญ่ หมู่ 9 บ.โคกใหญ่ ต.บัวเงิน อ. น้ำพอง จ.ขอนแก่น', '848934244', NULL, NULL, 'https://maps.app.goo.gl/XFpXJMTJYa1UQABL8?g_st=ic', NULL, '16.802403, 103.006518', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-7877', 'ปุ้มปุ้ย บ้านหนองแวงใหญ่', '205 หมู่5', '612105640', NULL, NULL, 'https://maps.app.goo.gl/NMorWZ5j9Tc1VMgK8?g_st=ic', NULL, '17.172412, 103.069543', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-7890', 'แม่หอม บ้านท่ายม', NULL, '990165515', NULL, NULL, 'https://maps.app.goo.gl/4zQfMhmWmoWj5N7v6', NULL, '17.139434, 102.786282', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-8025', 'แม่หนู บ้านท่าไฮ', NULL, '927629177', NULL, NULL, 'https://maps.app.goo.gl/dVmmCe5ucLC4iCRY9', NULL, '16.957369, 103.171787', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-8073', 'โบว์พาณิชย์ บ้านดงบาก', NULL, '899379246', NULL, NULL, 'https://maps.app.goo.gl/yhHXbjrbAvHx1C5A6', NULL, '17.319388, 103.050241', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-8123', 'ธนากรพาณิชย์ หนองช้างคาว', NULL, '654153413', NULL, NULL, 'https://maps.app.goo.gl/fG1kAWFVvMqu1NSPA', NULL, '17.170285, 103.122208', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-8162', 'ศิระการค้า', NULL, '924368418', NULL, NULL, 'https://maps.app.goo.gl/EAT4WA7gK4Rh84iG7', NULL, '17.301977, 103.195081', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-8200', 'ร้านบุญยัง บ้านลานเต', 'รับเองเท่านั้น/ห้ามจัดส่ง', '844651909', NULL, NULL, 'https://maps.app.goo.gl/egu5HL6QZTot3Azb8', NULL, '17.255301, 103.043513', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-8238', 'เลิฟ เพรย์ ช๊อป บ. บะยาว', '188หมู่8บ.บะยาว ต.บุ่งแก้ว อ. โนนสะอาด', '924870700', NULL, NULL, NULL, NULL, '16.948338, 103.022983', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-8257', 'น้องแก้ม บ้านนามูล(กระนวน)', '471หมู่7 บ.นามูล ต.ดูนสาด อ.กระนวน', '922921573', NULL, NULL, 'https://maps.app.goo.gl/bgcDS1Q9oE6yw67Z9?g_st=ic', NULL, '16.791709,103.175101', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-8297', 'ศิริกัญญา บ้านกุดขอนแก่น', NULL, '986022296', NULL, NULL, 'https://maps.app.goo.gl/6cVqUsQ46Cg8oUQq7', NULL, '16.945396, 103.178294', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-8392', 'ร้านลักขณา บ.โคกสี', NULL, '638549403', NULL, NULL, 'https://maps.app.goo.gl/Tusw7aGDihvpTh2j6', NULL, '17.046983, 102.830398', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-8404', 'ร้านค้า OR-8404', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-31 15:11:57', '08:00', '17:00'),
('OR-8745', 'แม่จ่อย บ้านคำม่วง', NULL, '935657203', NULL, NULL, 'https://maps.app.goo.gl/pCQwGfBBTTnxKUHJ7', NULL, '17.188931, 103.258984', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-8777', 'ร้านพงษ์เจริญ บ้านเรืองชัย', NULL, '986158825', NULL, NULL, 'https://maps.app.goo.gl/yi8wi9qfvxEkdPWTA', NULL, '17.283615, 103.090785', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-8804', 'ธีระพงษ์พาณิชย์ บ.เพ็กคำบากหายโศก', NULL, '935070110', NULL, NULL, 'https://g.co/kgs/rE1wACS', NULL, '17.297851, 103.044191', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-8818', 'แม่ลำไพ บ้านคำไผ่', NULL, '857579985', NULL, NULL, 'https://maps.app.goo.gl/EkLFkkVnP85MXyeu9', NULL, '17.101348, 103.131324', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-8819', 'เบิร์ด มินิมาร์ท', 'ตำบล ไชยวาน อำเภอ ไชยวาน อุดรธานี', '924368418', NULL, NULL, NULL, NULL, '17.302332, 103.201161', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-8847', 'บอยทดสอบ3', '36หมู่8ต.เชียงแหว', '25400609', '25400609', NULL, NULL, NULL, '17.128555, 102.964483', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-8923', 'สานฝัน', '248หมู่5บ้านห้วยวังปลา', '659103410', NULL, NULL, 'https://maps.app.goo.gl/dEV45fgdfi9oCMcP6', NULL, '17.007929, 103.211700', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-8978', 'น้องแทนคุณ บ้านผักตบ', NULL, '934192636', NULL, NULL, 'https://maps.app.goo.gl/ofiASbFGh8pbGrds9', NULL, '17.316586, 103.024452', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-9077', 'ร้านแม่นาง บ.โนนสำราญ', NULL, '933390926', NULL, NULL, 'https://maps.app.goo.gl/vyhfFzetygoZCWBf8', NULL, '16.970989, 102.976743', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-9152', 'เจ้กวาง บ้านหัวนาคำ(กระนวน)', '186หมู่2บ.หัวนาคำ ต.หัวนาคำอ.กระนวน', '839519799', NULL, NULL, 'https://maps.app.goo.gl/fgA4eDEZnvcatdr16?g_st=ic', NULL, '16.845715, 103.044888', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-9196', 'โซโม่ฮาดแวร์ บ้านหนองลุมพุก', NULL, '623593749', NULL, NULL, 'https://maps.app.goo.gl/ZWQdbbbDCzh2unwH9', NULL, '17.279318, 102.981635', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-9235', 'แม่โฮม บ้านบุ่งแก้ว', NULL, '909115570', NULL, NULL, 'https://maps.app.goo.gl/y5Zq1gmPzUDeLNC59', NULL, '16.970568, 102.950601', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-9290', 'จ.จาน บ้านดูนสาด(กระนวน)', '17หมู่6บ.ดูนสาด ต.ดูนสาด อ.กระนวน', '934424398', NULL, NULL, 'https://maps.app.goo.gl/ytg8p4ob6sRX6nAK7?g_st=ic', NULL, '16.791680, 103.164985', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-9355', 'แป๋มเนื้อสด', '188 หมู่1 ต.ท่าคันโท', '836186597', NULL, NULL, 'W6QJ+CVF, Tha Khantho, Tha Khantho District, Kalasin 46190', NULL, '16.938628, 103.234163', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-9487', 'แม่เสาร์ บ้านนาดีหมู่10', NULL, '637180080', NULL, NULL, 'https://maps.app.goo.gl/ehGLbjWHsZXif9rb9', NULL, '17.069843, 102.853616', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-9570', 'อาภาพร บ้านคอนสาย', NULL, '932951488', NULL, NULL, 'https://maps.app.goo.gl/g9iffVyPA89TsWMNA', NULL, '17.206079, 103.098789', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-9654', 'มาริษา บ้านดูนสาด10(กระนวน)', '102หมู่10บ.ดูนสาดต.ดูนสาดอ.กระนวน', '611814667', NULL, NULL, NULL, NULL, '16.794675, 103.163714', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-9691', 'พ่อเหลา', NULL, '934562620', NULL, NULL, 'https://maps.app.goo.gl/362bBCZDytU9ySUS9', NULL, '17.211982, 103.115079', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-9730', 'สหการโคกถาวร', NULL, '808047273', NULL, NULL, 'https://maps.app.goo.gl/n5KiqGACbx5siZRP7', NULL, '17.288360, 103.124005', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-9760', 'ทองเจน บ้านตาดทอง', NULL, '899424158', NULL, NULL, 'https://maps.app.goo.gl/mMnYakoKMWWeQprs5', NULL, '17.050254,103.140501', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-9761', 'บอยทดสอบ3', '144หมู8ต.เวียงคำ', '622903608', '622903608', NULL, NULL, NULL, '17.128582, 102.964778', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-9926', 'แม่ตุ๋ม บ้านหนองไผ่', NULL, '962247239', NULL, NULL, 'https://maps.app.goo.gl/N7tHsQcWLEkxRpfe7', NULL, '17.319273, 103.084062', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-9942', 'ปรีดาภรณ์ บ้านคำเจริญ(กระนวน)', '200หมู่10บ.คำเจริญ ต.หัวนาคำ อ.กระนวน', '981758218', NULL, NULL, 'https://maps.app.goo.gl/Aib2qtb8uvCfQ7nF8?g_st=ic', NULL, '16.797434, 103.092224', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR-9995', 'แม่นุ้ย บ้านหิวฮาว', NULL, '971014601', NULL, NULL, 'https://maps.app.goo.gl/BEKC3GQzEmtienN46?g_st=icttp', NULL, '17.104944, 103.077733', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-9996', 'แม่หวาน บ้านปาก้าว', NULL, '924900436', NULL, NULL, '(17.1611878, 103.2395966)', NULL, '17.161241, 103.239598', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-99986', 'ร้าน วีระพงษ์พานิช', 'หมู่ 3 ต.อุ่มจาน อ.ประจักษ์ จ.อุดรธานี 41110', '808360556', NULL, NULL, 'https://maps.app.goo.gl/TtmB8vQZaGajZphL8', NULL, '17.222082, 103.081478', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-99987', 'ยายจันทร์ทรี', '95 ม.11 บ.ดงแคน ต.พันดอน อ.กุมภวาปี จ.อุดรธานี (เข้าซอย 14 เข้าซอยเล็ก แล้วเลี้ยวซ้าย สุดซอย ประตูเขียว', '805688666', NULL, NULL, 'https://maps.app.goo.gl/pdk6SVm38djqBLXs5', NULL, '17.112400, 102.949991', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-99992', 'น้อง มะปราง', '210 หมู่ที่ 9 บ้านทับไฮ ตำบลแสงสว่าง อำเภอหนองแสง จังหวัดอุดรธานี', '936669684', NULL, NULL, 'https://maps.app.goo.gl/5se552QVpe6cg66c7', NULL, '17.109072,102.774917', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-99994', 'ร้าน แม่หนู', '251 หมู่ 10 บ้านนาดี ต.นาดี อ.หนองแสง จ.อุดรธานี', '883750185', NULL, NULL, 'https://maps.app.goo.gl/TBJ7q3Gvg2JUC78r5', NULL, '17.072244, 102.851660', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-99997', 'น.ส. รำไพร ฤทธิมาน [ แม่ไพร ]', '53 หมู่ที่ 7 ตำบลแชแล อำเภอกุมภวาปี จังหวัดอุดรธานี', '804198535', NULL, NULL, 'https://maps.app.goo.gl/iko5dSSXXEM4ugzD6', NULL, '17.158139, 103.061889', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-99998', 'ร้าน นพเก้าพาณิชย์ (ตลาดล่าง)', '127-128 ม.7 ต.กุมภวาปี อ.กุมภวาปี จ.อดรธานี 41110', '901558711', NULL, NULL, 'https://maps.app.goo.gl/kGsjeFVfW5Gruxji7', NULL, '17.110084, 103.019494', '2026-07-23 11:48:49', '08:00', '17:00'),
('OR-99999', 'โรงเรียนทับกุงประชานุกูล', 'ตำบลทับกุง อำเภอหนองแสง จังหวัดอุดรธานี 41340', '981019141', NULL, NULL, 'https://maps.app.goo.gl/5oARgshkcb8EHMyU6', NULL, '17.172386, 102.770031', '2026-07-23 11:48:50', '08:00', '17:00'),
('OR00810', 'B&D', NULL, NULL, NULL, NULL, NULL, NULL, '17.128252, 102.965106', '2026-07-23 11:48:49', '08:00', '17:00');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` int(10) UNSIGNED NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `level_user_id` int(10) UNSIGNED DEFAULT NULL,
  `user_image` varchar(255) DEFAULT NULL,
  `phone_number_1` varchar(20) DEFAULT NULL,
  `phone_number_2` varchar(20) DEFAULT NULL,
  `phone_number_3` varchar(20) DEFAULT NULL,
  `user_status` enum('active','inactive') DEFAULT 'active',
  `location_now` varchar(255) DEFAULT NULL COMMENT 'lat,long ปัจจุบัน',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `username`, `password`, `name`, `level_user_id`, `user_image`, `phone_number_1`, `phone_number_2`, `phone_number_3`, `user_status`, `location_now`, `created_at`) VALUES
(1, 'admin', '$2a$10$GPXTTPRuOfRzmG7mIYQOfufXpc4ejRyX1QRnq80GFOLBHvatXqJ8G', 'ผู้ดูแลระบบ (Admin)', 1, '/uploads/user/img-1785090320152-206089984.jpg', '0812345678', NULL, NULL, 'active', '13.7563,100.5018', '2026-07-20 15:12:14'),
(13, '016', '$2a$10$PIdc1SGDmuk/OYDwz7cKdeFmRnKJM3vaQthnz5XC5pPuc0RYhIQN6', 'ไผ่', 2, '/uploads/user/img-1785493755746-32127428.jpg', '083-270-0252', NULL, NULL, 'active', NULL, '2026-07-31 17:29:15'),
(14, '135', '$2a$10$09qBX6MfilNMWhFxl.I6XOjGPj1v/RrVDzrvxphWN6fQFk0jq1Yge', 'ดรีม', 2, '/uploads/user/img-1785493812341-427195931.jpg', '063-297-0506', NULL, NULL, 'active', NULL, '2026-07-31 17:30:12'),
(15, '516', '$2a$10$8ZDCf7INDwE3KI89nYeWu..ciUjvJ14oB6o3UT58Ut/CmGADVudHO', 'โม', 2, '/uploads/user/img-1785493999025-611481545.jpg', '092-762-9177', NULL, NULL, 'active', NULL, '2026-07-31 17:33:19'),
(16, '007', '$2a$10$NmXHt.WN9iU7RIg8eSJdzuPUQEdjPQwtDCsQ4dLHrPufZIt.jMLCW', 'เอ็ม', 3, '/uploads/user/img-1785494104263-931013837.jpg', '094-915-5863', NULL, NULL, 'active', NULL, '2026-07-31 17:34:30'),
(17, '416', '$2a$10$NxNlIzrqoSm6EK4fePTU/Olae/NiXlnSS0xd9wg8LkjX6nIlqdpzG', 'เก๋ง', 3, '/uploads/user/img-1785494984675-754164351.jpg', '080-254-3917', NULL, NULL, 'active', NULL, '2026-07-31 17:49:44'),
(18, '449', '$2a$10$BZ6gaK6cpJFCIyxEUVtIb.0sVW3481UhCP1Nd7109KxBi5m0B751m', 'เน็ต', 3, '/uploads/user/img-1785495008992-822957372.jpg', '080-008-1664', NULL, NULL, 'active', NULL, '2026-07-31 17:50:09'),
(19, '453', '$2a$10$4CKSTgaYSVJ4wDfjqXUYCuLKpnv315Hk7C3EsTHgSE4r0d9cAi5zm', 'บอย', 3, '/uploads/user/img-1785495032307-6996759.jpg', '064-997-5407', NULL, NULL, 'active', NULL, '2026-07-31 17:50:32'),
(20, '457', '$2a$10$A/F6n5b13MInNQDtsfWF9OhjChKoRv2KvGVjKIvnSn.iC8Xj1ARAy', 'แม็ก', 3, '/uploads/user/img-1785495057577-214575636.jpg', '092-345-7170', NULL, NULL, 'active', NULL, '2026-07-31 17:50:57');

-- --------------------------------------------------------

--
-- Table structure for table `visit_type`
--

CREATE TABLE `visit_type` (
  `visit_type_id` int(10) UNSIGNED NOT NULL,
  `visit_type_name` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `visit_type`
--

INSERT INTO `visit_type` (`visit_type_id`, `visit_type_name`, `created_at`) VALUES
(1, 'รับสินค้า', '2026-07-20 15:12:13'),
(2, 'ฝากส่ง', '2026-07-20 15:12:13'),
(3, 'เยี่ยมลูกค้า', '2026-07-20 15:12:13'),
(4, 'ส่งของ', '2026-07-20 15:12:13'),
(5, 'เปิดลูกค้าใหม่', '2026-07-20 15:12:13'),
(6, 'รับสินค้า', '2026-07-20 16:07:07'),
(7, 'ฝากส่ง', '2026-07-20 16:07:07'),
(8, 'เยี่ยมลูกค้า', '2026-07-20 16:07:07'),
(9, 'ส่งของ', '2026-07-20 16:07:07'),
(10, 'เปิดลูกค้าใหม่', '2026-07-20 16:07:07'),
(11, 'รับสินค้า', '2026-07-20 16:07:27'),
(12, 'ฝากส่ง', '2026-07-20 16:07:27'),
(13, 'เยี่ยมลูกค้า', '2026-07-20 16:07:27'),
(14, 'ส่งของ', '2026-07-20 16:07:27'),
(15, 'เปิดลูกค้าใหม่', '2026-07-20 16:07:27');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `access`
--
ALTER TABLE `access`
  ADD PRIMARY KEY (`access_id`);

--
-- Indexes for table `accounting_status`
--
ALTER TABLE `accounting_status`
  ADD PRIMARY KEY (`status_id`);

--
-- Indexes for table `api_keys`
--
ALTER TABLE `api_keys`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `key_name` (`key_name`);

--
-- Indexes for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`log_id`);

--
-- Indexes for table `car`
--
ALTER TABLE `car`
  ADD PRIMARY KEY (`car_id`);

--
-- Indexes for table `car_release`
--
ALTER TABLE `car_release`
  ADD PRIMARY KEY (`car_release_id`),
  ADD KEY `car_id` (`car_id`),
  ADD KEY `car_release_ibfk_3` (`user_id`),
  ADD KEY `car_release_ibfk_2` (`car_release_type_id`),
  ADD KEY `car_release_ibfk_4` (`group_store_id`),
  ADD KEY `car_release_ibfk_6` (`accounting_status`),
  ADD KEY `car_release_ibfk_7` (`pda_device`);

--
-- Indexes for table `car_release_chat`
--
ALTER TABLE `car_release_chat`
  ADD PRIMARY KEY (`chat_id`),
  ADD KEY `car_release_id` (`car_release_id`);

--
-- Indexes for table `car_release_follower`
--
ALTER TABLE `car_release_follower`
  ADD PRIMARY KEY (`follower_id`),
  ADD KEY `car_release_follower_ibfk_1` (`car_release_id`);

--
-- Indexes for table `car_release_type`
--
ALTER TABLE `car_release_type`
  ADD PRIMARY KEY (`car_release_type_id`);

--
-- Indexes for table `car_return`
--
ALTER TABLE `car_return`
  ADD PRIMARY KEY (`car_return_id`),
  ADD KEY `car_release_id` (`car_release_id`),
  ADD KEY `key_holder_id` (`key_holder_id`),
  ADD KEY `parking_id` (`parking_id`);

--
-- Indexes for table `check_in`
--
ALTER TABLE `check_in`
  ADD PRIMARY KEY (`check_in_id`),
  ADD KEY `list_id` (`list_id`);

--
-- Indexes for table `check_out`
--
ALTER TABLE `check_out`
  ADD PRIMARY KEY (`check_out_id`),
  ADD KEY `list_id` (`list_id`),
  ADD KEY `payment_id` (`payment_id`),
  ADD KEY `visit_type_id` (`visit_type_id`);

--
-- Indexes for table `check_out_image`
--
ALTER TABLE `check_out_image`
  ADD PRIMARY KEY (`image_check_out_id`),
  ADD KEY `check_out_id` (`check_out_id`);

--
-- Indexes for table `delivery_settings`
--
ALTER TABLE `delivery_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `group_store`
--
ALTER TABLE `group_store`
  ADD PRIMARY KEY (`group_store_id`),
  ADD KEY `fk_car` (`car_id`);

--
-- Indexes for table `key_holder`
--
ALTER TABLE `key_holder`
  ADD PRIMARY KEY (`key_holder_id`);

--
-- Indexes for table `level_user`
--
ALTER TABLE `level_user`
  ADD PRIMARY KEY (`level_user_id`),
  ADD KEY `access_id` (`access_id`);

--
-- Indexes for table `list_store`
--
ALTER TABLE `list_store`
  ADD PRIMARY KEY (`list_id`),
  ADD KEY `list_store_ibfk_3` (`group_store_id`),
  ADD KEY `list_store_ibfk_4` (`created_by`),
  ADD KEY `list_store_ibfk_5` (`store_id`),
  ADD KEY `list_store_ibfk_6` (`position_product_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `list_store_load`
--
ALTER TABLE `list_store_load`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_list_store` (`list_id`);

--
-- Indexes for table `loading_type`
--
ALTER TABLE `loading_type`
  ADD PRIMARY KEY (`loading_type_id`),
  ADD UNIQUE KEY `type_code` (`type_code`);

--
-- Indexes for table `parking`
--
ALTER TABLE `parking`
  ADD PRIMARY KEY (`parking_id`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`payment_id`);

--
-- Indexes for table `pda_device`
--
ALTER TABLE `pda_device`
  ADD PRIMARY KEY (`pda_id`);

--
-- Indexes for table `permission`
--
ALTER TABLE `permission`
  ADD PRIMARY KEY (`permission_id`),
  ADD UNIQUE KEY `permission_key` (`permission_key`);

--
-- Indexes for table `position_product`
--
ALTER TABLE `position_product`
  ADD PRIMARY KEY (`position_product_id`);

--
-- Indexes for table `problem`
--
ALTER TABLE `problem`
  ADD PRIMARY KEY (`problem_id`),
  ADD KEY `list_id` (`list_id`);

--
-- Indexes for table `problem_image`
--
ALTER TABLE `problem_image`
  ADD PRIMARY KEY (`image_problem_id`),
  ADD KEY `problem_id` (`problem_id`);

--
-- Indexes for table `role_permission`
--
ALTER TABLE `role_permission`
  ADD PRIMARY KEY (`role_permission_id`),
  ADD UNIQUE KEY `unique_role_perm` (`level_user_id`,`permission_id`),
  ADD KEY `permission_id` (`permission_id`);

--
-- Indexes for table `store`
--
ALTER TABLE `store`
  ADD PRIMARY KEY (`store_id`),
  ADD KEY `idx_store_id` (`store_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `level_user_id` (`level_user_id`);

--
-- Indexes for table `visit_type`
--
ALTER TABLE `visit_type`
  ADD PRIMARY KEY (`visit_type_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `access`
--
ALTER TABLE `access`
  MODIFY `access_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `accounting_status`
--
ALTER TABLE `accounting_status`
  MODIFY `status_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `api_keys`
--
ALTER TABLE `api_keys`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `audit_log`
--
ALTER TABLE `audit_log`
  MODIFY `log_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `car_release`
--
ALTER TABLE `car_release`
  MODIFY `car_release_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `car_release_chat`
--
ALTER TABLE `car_release_chat`
  MODIFY `chat_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `car_release_follower`
--
ALTER TABLE `car_release_follower`
  MODIFY `follower_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `car_release_type`
--
ALTER TABLE `car_release_type`
  MODIFY `car_release_type_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `car_return`
--
ALTER TABLE `car_return`
  MODIFY `car_return_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `check_in`
--
ALTER TABLE `check_in`
  MODIFY `check_in_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `check_out`
--
ALTER TABLE `check_out`
  MODIFY `check_out_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `check_out_image`
--
ALTER TABLE `check_out_image`
  MODIFY `image_check_out_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `delivery_settings`
--
ALTER TABLE `delivery_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `group_store`
--
ALTER TABLE `group_store`
  MODIFY `group_store_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `key_holder`
--
ALTER TABLE `key_holder`
  MODIFY `key_holder_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `level_user`
--
ALTER TABLE `level_user`
  MODIFY `level_user_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `list_store`
--
ALTER TABLE `list_store`
  MODIFY `list_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=577;

--
-- AUTO_INCREMENT for table `list_store_load`
--
ALTER TABLE `list_store_load`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1298;

--
-- AUTO_INCREMENT for table `loading_type`
--
ALTER TABLE `loading_type`
  MODIFY `loading_type_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `parking`
--
ALTER TABLE `parking`
  MODIFY `parking_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `payment_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `pda_device`
--
ALTER TABLE `pda_device`
  MODIFY `pda_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `permission`
--
ALTER TABLE `permission`
  MODIFY `permission_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `position_product`
--
ALTER TABLE `position_product`
  MODIFY `position_product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `problem`
--
ALTER TABLE `problem`
  MODIFY `problem_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `problem_image`
--
ALTER TABLE `problem_image`
  MODIFY `image_problem_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `role_permission`
--
ALTER TABLE `role_permission`
  MODIFY `role_permission_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2604;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `visit_type`
--
ALTER TABLE `visit_type`
  MODIFY `visit_type_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `car_release`
--
ALTER TABLE `car_release`
  ADD CONSTRAINT `car_release_ibfk_2` FOREIGN KEY (`car_release_type_id`) REFERENCES `car_release_type` (`car_release_type_id`) ON DELETE NO ACTION,
  ADD CONSTRAINT `car_release_ibfk_4` FOREIGN KEY (`group_store_id`) REFERENCES `group_store` (`group_store_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `car_release_ibfk_5` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE NO ACTION,
  ADD CONSTRAINT `car_release_ibfk_6` FOREIGN KEY (`accounting_status`) REFERENCES `accounting_status` (`status_id`) ON DELETE NO ACTION,
  ADD CONSTRAINT `car_release_ibfk_7` FOREIGN KEY (`pda_device`) REFERENCES `pda_device` (`pda_id`) ON DELETE NO ACTION;

--
-- Constraints for table `car_release_follower`
--
ALTER TABLE `car_release_follower`
  ADD CONSTRAINT `car_release_follower_ibfk_1` FOREIGN KEY (`car_release_id`) REFERENCES `car_release` (`car_release_id`) ON DELETE CASCADE;

--
-- Constraints for table `car_return`
--
ALTER TABLE `car_return`
  ADD CONSTRAINT `car_return_ibfk_1` FOREIGN KEY (`car_release_id`) REFERENCES `car_release` (`car_release_id`),
  ADD CONSTRAINT `car_return_ibfk_2` FOREIGN KEY (`key_holder_id`) REFERENCES `key_holder` (`key_holder_id`),
  ADD CONSTRAINT `car_return_ibfk_3` FOREIGN KEY (`parking_id`) REFERENCES `parking` (`parking_id`);

--
-- Constraints for table `check_in`
--
ALTER TABLE `check_in`
  ADD CONSTRAINT `check_in_ibfk_1` FOREIGN KEY (`list_id`) REFERENCES `list_store` (`list_id`);

--
-- Constraints for table `check_out`
--
ALTER TABLE `check_out`
  ADD CONSTRAINT `check_out_ibfk_1` FOREIGN KEY (`list_id`) REFERENCES `list_store` (`list_id`),
  ADD CONSTRAINT `check_out_ibfk_2` FOREIGN KEY (`payment_id`) REFERENCES `payment` (`payment_id`),
  ADD CONSTRAINT `check_out_ibfk_3` FOREIGN KEY (`visit_type_id`) REFERENCES `visit_type` (`visit_type_id`);

--
-- Constraints for table `check_out_image`
--
ALTER TABLE `check_out_image`
  ADD CONSTRAINT `check_out_image_ibfk_1` FOREIGN KEY (`check_out_id`) REFERENCES `check_out` (`check_out_id`);

--
-- Constraints for table `group_store`
--
ALTER TABLE `group_store`
  ADD CONSTRAINT `fk_car` FOREIGN KEY (`car_id`) REFERENCES `car` (`car_id`);

--
-- Constraints for table `level_user`
--
ALTER TABLE `level_user`
  ADD CONSTRAINT `level_user_ibfk_1` FOREIGN KEY (`access_id`) REFERENCES `access` (`access_id`);

--
-- Constraints for table `list_store`
--
ALTER TABLE `list_store`
  ADD CONSTRAINT `list_store_ibfk_3` FOREIGN KEY (`group_store_id`) REFERENCES `group_store` (`group_store_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `list_store_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE NO ACTION,
  ADD CONSTRAINT `list_store_ibfk_5` FOREIGN KEY (`store_id`) REFERENCES `store` (`store_id`) ON DELETE NO ACTION,
  ADD CONSTRAINT `list_store_ibfk_6` FOREIGN KEY (`position_product_id`) REFERENCES `position_product` (`position_product_id`) ON DELETE NO ACTION;

--
-- Constraints for table `list_store_load`
--
ALTER TABLE `list_store_load`
  ADD CONSTRAINT `fk_list_store` FOREIGN KEY (`list_id`) REFERENCES `list_store` (`list_id`) ON DELETE CASCADE;

--
-- Constraints for table `problem`
--
ALTER TABLE `problem`
  ADD CONSTRAINT `problem_ibfk_1` FOREIGN KEY (`list_id`) REFERENCES `list_store` (`list_id`);

--
-- Constraints for table `problem_image`
--
ALTER TABLE `problem_image`
  ADD CONSTRAINT `problem_image_ibfk_1` FOREIGN KEY (`problem_id`) REFERENCES `problem` (`problem_id`);

--
-- Constraints for table `role_permission`
--
ALTER TABLE `role_permission`
  ADD CONSTRAINT `role_permission_ibfk_1` FOREIGN KEY (`level_user_id`) REFERENCES `level_user` (`level_user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permission_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permission` (`permission_id`) ON DELETE CASCADE;

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`level_user_id`) REFERENCES `level_user` (`level_user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
