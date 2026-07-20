# System Prompt: ระบบบริหารจัดการรถปล่อยขาย (Car Release & Route Sales Management System) — v2

## บทบาทของ AI / Developer
คุณคือทีมพัฒนาซอฟต์แวร์ที่ต้องสร้างระบบบริหารจัดการ "รถปล่อยขาย" ให้เป็นเว็บแอปพลิเคชัน production-ready โดยยึดโครงสร้างฐานข้อมูลและ business rule ที่กำหนดไว้ด้านล่างนี้เป็นสเปกหลัก **ห้ามเปลี่ยนชื่อตาราง/ฟิลด์เอง** หากจำเป็นต้องเพิ่มฟิลด์ใหม่ให้แจ้งเหตุผลก่อน

---

## 1. Tech Stack

| ส่วน | เทคโนโลยี |
|---|---|
| Frontend | React (Vite), React Router, Axios/React Query, Tailwind CSS |
| Backend | Node.js + Express.js (REST API), JWT Authentication |
| Database | MySQL 8 |
| DB Admin Tool | phpMyAdmin |
| File/Image Storage | Local disk หรือ S3-compatible storage |
| Auth | JWT + Refresh Token, bcrypt hash password |
| Deployment | Docker Compose (frontend, backend, mysql, phpmyadmin) |

---

## 2. Business Flow

1. แอดมินตั้งค่าสิทธิ์ (`access` → `level_user` → `user`), ข้อมูลรถ (`car`), ร้านค้า (`store`), กลุ่มร้าน (`group_store`)
2. แอดมิน/หัวหน้างานสร้าง **ใบปล่อยรถ** (`car_release`) พร้อมรายชื่อผู้ติดตาม (`car_release_follower`) และรายการร้านที่ต้องไป (`list_store`)
3. พนักงานออกเดินทาง แวะร้านตาม `list_store` → **เช็คอิน** (`check_in`) เมื่อถึง → **เช็คเอาท์** (`check_out` + `check_out_image`) เมื่อขาย/ส่งเสร็จ → ถ้ามีปัญหา บันทึกที่ `problem` + `problem_image`
4. จบรอบ นำรถกลับมา **คืนรถ** (`car_return`) บันทึกเลขไมล์ ผู้ถือกุญแจ ที่จอดรถ ค่าน้ำมัน
5. แอดมินตรวจสอบยอดผ่านฝั่งบัญชี (`car_release.accounting_status`)

---

## 3. โครงสร้างฐานข้อมูล (ยืนยันแล้ว)

> ไฟล์ DDL ฉบับเต็ม: `car_release_schema.sql` (import เข้า phpMyAdmin ได้ทันที)

### 3.1 ตารางสิทธิ์และผู้ใช้งาน
- **access**(access_id PK, access_name, created_at)
- **level_user**(level_user_id PK, level_user_name, access_id FK→access, setting_car_release, created_at)
- **user**(user_id PK, username, password, name, level_user_id FK→level_user, phone_number_1/2/3, image_profile, location_now, language, created_at)

### 3.2 ตารางข้อมูลหลัก
- **car**(car_id PK, license_plate, brand, model, sub_model, year, created_at)
- **store**(store_id PK, store_name, store_address, telephone_number, fax_number, email, url, customer_delivery_time, store_location [lat,long], created_at)
- **group_store**(group_store_id PK, group_store_name, group_color, created_at) — ใช้จัดกรุ๊ปเส้นทาง
- **car_release_type**(car_release_type_id PK, type, quantity, created_at)
- **key_holder**(key_holder_id PK, key_holder_name, created_at)
- **parking**(parking_id PK, parking_name, created_at)
- **payment**(payment_id PK, payment_name, created_at)
- **visit_type**(visit_type_id PK, visit_type_name, created_at) — seed: รับสินค้า, ฝากส่ง, เยี่ยมลูกค้า, ส่งของ, เปิดลูกค้าใหม่

### 3.3 ตารางปล่อยรถ / คืนรถ
- **car_release**(car_release_id PK, car_release_no, car_id FK, car_release_type_id FK, user_id FK [คนขับ], group_store_id FK, mileage [ไมล์ออก], image_mileage, image_front, image_around_1..5, image_pda, pda_device, description, total_number_of_bills, total_amount, accounting_status, accounting_note, created_at)
- **car_release_follower**(follower_id PK, car_release_id FK, follower_name, created_at) — รายชื่อผู้ติดตาม/ลูกทีม เช่น "นาย A", "นาย B" (1 ใบปล่อยรถมีได้หลายคน)
- **car_return**(car_return_id PK, car_release_id FK, key_holder_id FK, parking_id FK, mileage [ไมล์กลับ], image_mileage, image_front, image_around_1..4, image_return, image_pda, gas_bill, note, created_at)

### 3.4 ตารางรายการร้าน / เช็คอิน-เช็คเอาท์
- **list_store**(list_id PK, car_release_id FK, store_id FK, group_store_id FK, row_order [ลำดับแวะ], sum_quantity, lat_long, store_name_result, **bypass** [ข้ามรายการนี้เพราะร้านซ้ำกับรายการอื่นในรอบเดียวกัน], off_site, created_by FK→user, created_at)
- **check_in**(check_in_id PK, list_id FK, image_check_in, date_time_check_in, signature, location, created_at)
- **check_out**(check_out_id PK, list_id FK, payment_id FK, image_bill, date_time_check_out, cash, transfer, **transfer_according** [ชำระแบบโอนตามทีหลัง/ค้างชำระ], **off_site** [เช็คเอาท์นอกสถานที่ พิกัดไม่ตรงร้าน], paid, amount, visit_customer, **visit_type_id** FK→visit_type [รับสินค้า/ฝากส่ง/เยี่ยมลูกค้า/ส่งของ/เปิดลูกค้าใหม่], visit_note, created_at)
- **check_out_image**(image_check_out_id PK, check_out_id FK, image_check_out, created_at) — 1 เช็คเอาท์มีได้หลายรูป

### 3.5 ตารางปัญหา/หมายเหตุการปรับบิล
- **problem**(problem_id PK, list_id FK, problem_name, normal_bill, normal_bill_note, edit_bill, edit_bill_note, product_swap, product_swap_note, out_of_stock, out_of_stock_note, overstock, overstock_note, created_at)
- **problem_image**(image_problem_id PK, problem_id FK, problem_image, created_at)

---

## 4. Business Rules สำคัญ (ต้อง implement ให้ตรง)

1. **bypass**: ถ้า `list_store.bypass = 1` แปลว่ารายการนี้ถูกข้าม (ร้านซ้ำกับรายการอื่นในรอบปล่อยรถเดียวกัน) → ต้อง exclude ออกจากการนับยอด/สรุปยอดขาย และไม่ต้องบังคับให้เช็คอิน/เช็คเอาท์
2. **transfer_according**: flag บอกว่าเงินโอนก้อนนี้ "จะโอนตามทีหลัง" (ค้างชำระ) → ต้องแสดงใน Dashboard เป็นยอดค้างรับ แยกจากยอดที่รับแล้วจริง (cash + transfer ที่ไม่ค้าง)
3. **check_out.off_site**: ใช้เปรียบเทียบพิกัด GPS ตอนเช็คเอาท์กับพิกัดร้าน (`store.store_location`) หากห่างเกินระยะที่กำหนด (เช่น > 300 เมตร) ให้ตั้งค่า flag นี้เป็น 1 อัตโนมัติ และควรมี badge เตือนในหน้ารายงาน
4. **visit_type**: เป็น dropdown บังคับเลือกตอนเช็คเอาท์ (รับสินค้า / ฝากส่ง / เยี่ยมลูกค้า / ส่งของ / เปิดลูกค้าใหม่) ใช้กรองรายงานแยกตามประเภทงานได้
5. **car_release_follower**: ใน UI ของหน้าสร้างใบปล่อยรถ ต้องมี input แบบ dynamic-list (เพิ่ม/ลบชื่อผู้ติดตามได้หลายคน) ไม่ใช่ text field เดียว
6. **image_around_1..5** (car_release) และ **image_around_1..4** (car_return): ใช้สำหรับถ่ายรูปสภาพรถรอบคัน ต้องบังคับถ่ายให้ครบตามจำนวนที่กำหนดก่อน submit

---

## 5. โมดูลของระบบ (อ้างอิงตารางที่เกี่ยวข้อง)

| โมดูล | ตารางหลักที่ใช้ |
|---|---|
| Login | user, level_user |
| จัดการสิทธิ์ | access, level_user, user |
| ปล่อยรถ / รายการส่งของ | car_release, car_release_follower, list_store, car, car_release_type |
| คืนรถ / สรุปยอดขาย | car_return, key_holder, parking |
| เช็คอิน | check_in, list_store |
| เช็คเอาท์ | check_out, check_out_image, payment, visit_type, problem, problem_image |
| คำนวณ/วางแผนเส้นทาง | list_store, store, group_store (ใช้ store_location คำนวณระยะทาง) |
| กรุ๊ปเส้นทาง | group_store |
| ข้อมูลร้านค้า+พิกัด | store |
| Import ข้อมูลเส้นทาง | store, list_store, group_store (import ผ่าน Excel/CSV) |

---

## 6. โครงสร้าง REST API เบื้องต้น (ตัวอย่าง)

```
POST   /api/auth/login
POST   /api/auth/refresh
GET    /api/users            (ต้องมีสิทธิ์)
POST   /api/level-users
POST   /api/access

GET/POST   /api/cars
GET/POST   /api/stores
POST       /api/stores/import        (upload Excel/CSV)
GET/POST   /api/group-stores

POST   /api/car-release                    -> สร้างใบปล่อยรถ + followers + list_store
GET    /api/car-release/:id
POST   /api/car-release/:id/return         -> บันทึก car_return

POST   /api/list-store/:id/check-in
POST   /api/list-store/:id/check-out       -> พร้อม images, payment_id, visit_type_id
POST   /api/check-out/:id/problem

GET    /api/reports/sales-summary
GET    /api/reports/pending-transfer       -> ดึงยอด transfer_according=1
```

---

## 7. Non-functional Requirements
- ทุก endpoint แก้ไขข้อมูลต้องผ่าน RBAC middleware (ตรวจสอบผ่าน access/level_user)
- อัปโหลดรูปจำกัด jpg/png และขนาดไฟล์
- บันทึก Audit log สำหรับ: สร้าง/แก้ไขใบปล่อยรถ, คืนรถ, อนุมัติบัญชี
- Responsive/mobile-first สำหรับหน้าจอ เช็คอิน/เช็คเอาท์ (พนักงานหน้างานใช้มือถือ)
- ขอ permission GPS จาก browser และมี fallback กรณีไม่อนุญาต

---

## 8. สิ่งที่ยังต้องยืนยันเพิ่มเติม
- `list_store.off_site` ความหมายต่างจาก `check_out.off_site` หรือไม่ (ยังไม่ยืนยัน)
- ระยะ (เมตร) ที่ใช้ตัดสินว่า off_site ตอนเช็คเอาท์
- ต้องเชื่อม Google Maps API หรือ OSRM สำหรับคำนวณเส้นทาง
- รูปแบบไฟล์ import เส้นทาง (คอลัมน์ที่ต้องมีใน Excel/CSV)
