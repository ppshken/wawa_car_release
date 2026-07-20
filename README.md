# 🚚 WAWA Car Release Management System v2

ระบบบริหารจัดการรถปล่อยขาย & สายวิ่งส่งสินค้า — Full-Stack Web Application

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

---

## 📋 สารบัญ

- [ภาพรวมระบบ](#-ภาพรวมระบบ)
- [Tech Stack](#-tech-stack)
- [โครงสร้างโปรเจกต์](#-โครงสร้างโปรเจกต์)
- [วิธีติดตั้งและรัน](#-วิธีติดตั้งและรัน)
  - [วิธีที่ 1: Docker Compose (แนะนำ)](#วิธีที่-1-docker-compose-แนะนำ)
  - [วิธีที่ 2: รันแบบ Manual (ไม่ใช้ Docker)](#วิธีที่-2-รันแบบ-manual-ไม่ใช้-docker)
- [บัญชีทดสอบ](#-บัญชีทดสอบ)
- [ฟีเจอร์หลัก](#-ฟีเจอร์หลัก)
- [API Endpoints](#-api-endpoints)
- [Environment Variables](#-environment-variables)

---

## 🎯 ภาพรวมระบบ

ระบบจัดการรถปล่อยขายแบบครบวงจร สำหรับบริหารจัดการการปล่อยรถส่งสินค้า ติดตามสถานะ จัดการคนขับ ร้านค้า เบี้ยเลี้ยง และสถานะทางบัญชี โดยมีระบบสิทธิ์การเข้าถึงตามบทบาท (RBAC)

---

## 🛠 Tech Stack

| ส่วน | เทคโนโลยี |
|------|-----------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS 3 + Noto Sans Thai + Inter |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Maps** | React Leaflet |
| **Backend** | Node.js + Express 4 |
| **Database** | MySQL 8.0 |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **File Upload** | Multer |
| **Container** | Docker + Docker Compose |

---

## 📁 โครงสร้างโปรเจกต์

```
Wawa_car_release/
├── docker-compose.yml          # Docker Compose config (MySQL, Backend, Frontend, phpMyAdmin)
├── car_release_schema.sql      # Database schema + seed data
├── .gitignore
│
├── backend/                    # Node.js + Express API
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js               # Entry point (port 5000)
│   └── src/
│       ├── config/
│       │   └── db.js           # MySQL connection pool
│       ├── middleware/
│       │   ├── auth.js         # JWT authentication middleware
│       │   └── upload.js       # Multer file upload config
│       ├── routes/
│       │   ├── auth.routes.js          # Login, Users, Levels CRUD
│       │   ├── carRelease.routes.js    # Car release CRUD
│       │   ├── listStore.routes.js     # Store list
│       │   ├── master.routes.js        # Master data (cars, drivers)
│       │   └── report.routes.js        # Reports
│       └── seed.js             # Database seeder script
│
└── frontend/                   # React + Vite SPA
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts          # Vite config (port 3000, API proxy → 5000)
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── index.html
    └── src/
        ├── main.tsx            # Entry point
        ├── App.tsx             # Routes & Layout
        ├── index.css           # Global styles + Tailwind
        ├── components/
        │   ├── Navbar.tsx              # Top navigation bar
        │   ├── Sidebar.tsx             # Collapsible sidebar navigation
        │   ├── ConfirmModal.tsx        # Delete confirmation dialog
        │   ├── QuickActionModal.tsx     # Quick action buttons modal
        │   ├── MultiImageUpload.tsx    # Multi-image upload component
        │   └── SignaturePad.tsx        # Digital signature pad
        ├── context/
        │   ├── AuthContext.tsx         # Authentication state (JWT + localStorage)
        │   ├── SidebarContext.tsx      # Sidebar collapse/expand state
        │   └── ToastContext.tsx        # Toast/Snackbar notifications
        ├── pages/
        │   ├── Login.tsx              # Login page
        │   ├── Dashboard.tsx          # Dashboard with charts
        │   ├── CarReleaseList.tsx      # Car release list + create drawer
        │   ├── CarReleaseDetail.tsx    # Release detail page
        │   ├── CreateCarRelease.tsx    # Full create form with image upload
        │   ├── DriverCheckInOut.tsx    # Driver gate check-in/out
        │   ├── CarReturnPage.tsx       # Car return with key management
        │   ├── Users.tsx              # User management + RBAC permission matrix
        │   ├── Stores.tsx             # Store management
        │   └── Reports.tsx            # Accounting status reports
        ├── services/
        │   └── api.ts                 # Axios instance (baseURL: /api)
        └── types/
            └── index.ts               # TypeScript interfaces
```

---

## 🚀 วิธีติดตั้งและรัน

### ข้อกำหนดเบื้องต้น (Prerequisites)

- **Git** — สำหรับ clone repository
- **Node.js** v18+ — สำหรับรัน frontend/backend
- **Docker & Docker Compose** — สำหรับวิธีที่ 1
- **MySQL 8.0** — สำหรับวิธีที่ 2 (ถ้าไม่ใช้ Docker)

---

### วิธีที่ 1: Docker Compose (แนะนำ)

วิธีนี้จะรัน **MySQL + phpMyAdmin + Backend + Frontend** ทั้งหมดในคำสั่งเดียว

```bash
# 1. Clone repository
git clone https://github.com/ppshken/wawa_car_release.git
cd wawa_car_release

# 2. รัน Docker Compose
docker-compose up --build -d

# 3. รอ MySQL พร้อม (~30 วินาที) แล้วเปิดเบราว์เซอร์
```

#### 🌐 URL หลังรัน Docker

| Service | URL | หมายเหตุ |
|---------|-----|----------|
| **Frontend** | http://localhost:3000 | หน้าเว็บหลัก |
| **Backend API** | http://localhost:5000/api | REST API |
| **phpMyAdmin** | http://localhost:8080 | จัดการ MySQL (user: `root` / pass: `rootpassword`) |

#### หยุดระบบ

```bash
docker-compose down        # หยุด containers (เก็บข้อมูล)
docker-compose down -v     # หยุด + ลบข้อมูล MySQL ทั้งหมด
```

---

### วิธีที่ 2: รันแบบ Manual (ไม่ใช้ Docker)

เหมาะสำหรับ dev mode หรือเครื่องที่มี XAMPP/MySQL อยู่แล้ว

#### ขั้นตอนที่ 1: เตรียม MySQL Database

```bash
# เข้า MySQL แล้วรัน schema
mysql -u root -p < car_release_schema.sql
```

หรือ import ไฟล์ `car_release_schema.sql` ผ่าน **phpMyAdmin** ของ XAMPP ก็ได้ โดย:
1. เปิด phpMyAdmin → http://localhost/phpmyadmin
2. สร้าง database ชื่อ `car_release_db` (Collation: `utf8mb4_general_ci`)
3. เลือก database → แท็บ Import → เลือกไฟล์ `car_release_schema.sql` → Go

#### ขั้นตอนที่ 2: รัน Backend

```bash
cd backend

# ติดตั้ง dependencies
npm install

# สร้างไฟล์ .env (ปรับค่าตาม MySQL ของคุณ)
# ดูหัวข้อ Environment Variables ด้านล่าง

# รัน seed data (ข้อมูลเริ่มต้น + admin user)
npm run seed

# รัน dev server (port 5000)
npm run dev
```

#### ขั้นตอนที่ 3: รัน Frontend

```bash
cd frontend

# ติดตั้ง dependencies
npm install

# รัน dev server (port 3000)
npm run dev
```

#### 🌐 URL หลังรัน Manual

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:5000/api |

> **หมายเหตุ:** Vite dev server มี proxy config อยู่แล้ว — request ที่ไปที่ `/api/*` จะถูก proxy ไปยัง `http://localhost:5000` อัตโนมัติ

---

## 👤 บัญชีทดสอบ

หลังรัน seed data หรือ Docker จะมีบัญชีเหล่านี้พร้อมใช้:

| Username | Password | บทบาท | สิทธิ์ |
|----------|----------|-------|-------|
| `admin` | `123456` | 👑 ผู้ดูแลระบบ (Admin) | เข้าถึงทุกเมนู |
| `supervisor` | `123456` | 👔 หัวหน้างาน (Supervisor) | จัดการใบปล่อยรถ, คนขับ, ร้านค้า |
| `driver1` | `123456` | 🚚 พนักงานขับรถ (Driver) | เช็คอิน/เอาท์, คืนกุญแจ |

---

## ✨ ฟีเจอร์หลัก

### 📊 Dashboard
- สรุปภาพรวมจำนวนใบปล่อยรถ, รถที่ยังไม่คืน, จำนวนร้านค้า
- กราฟแสดงสถิติรายวัน

### 🚗 จัดการใบปล่อยรถ
- สร้าง/แก้ไข/ลบ ใบปล่อยรถ
- บันทึกรูปภาพรถ (หลายรูป)
- ติดตามสถานะร้านค้าที่จัดส่ง
- Quick Actions: รีเซ็ตกุญแจ, สถานะบัญชี, คืนรถ, เบี้ยเลี้ยง

### 👥 จัดการผู้ใช้งาน & สิทธิ์ (RBAC)
- CRUD ผู้ใช้งาน (เพิ่ม/แก้ไข/ลบ/ปิดการใช้งาน)
- จัดการระดับ/บทบาท (Level)
- **ตารางกำหนดสิทธิ์เมนูตามบทบาท** — เปิด/ปิดเมนูแต่ละรายการต่อบทบาท
- Sidebar แสดงเมนูตามสิทธิ์อัตโนมัติ

### 🔐 ระบบ Authentication
- Login ด้วย Username/Password
- JWT Token + localStorage (persist session)
- ป้องกัน route ที่ไม่มีสิทธิ์

### 📱 Responsive Design
- Sidebar ย่อ/ขยายได้ (toggle) + จำค่าใน localStorage
- Mobile: hamburger menu + slide-in drawer
- รองรับทุกขนาดหน้าจอ

---

## 📡 API Endpoints

### Authentication & Users
```
POST   /api/auth/login              # Login
GET    /api/auth/users               # ดึงรายชื่อผู้ใช้ทั้งหมด
POST   /api/auth/users               # สร้างผู้ใช้ใหม่
PUT    /api/auth/users/:id           # แก้ไขผู้ใช้
DELETE /api/auth/users/:id           # ลบผู้ใช้
GET    /api/auth/level-users         # ดึงระดับผู้ใช้ทั้งหมด
PUT    /api/auth/level-users/:id     # แก้ไขสิทธิ์ระดับผู้ใช้
```

### Car Release
```
GET    /api/car-release              # ดึงรายการใบปล่อยรถ
POST   /api/car-release              # สร้างใบปล่อยรถ
GET    /api/car-release/:id          # ดึงรายละเอียดใบปล่อยรถ
PUT    /api/car-release/:id          # แก้ไขใบปล่อยรถ
```

### Master Data
```
GET    /api/master/cars              # ดึงข้อมูลรถ
GET    /api/master/drivers           # ดึงข้อมูลคนขับ
GET    /api/list-store               # ดึงรายชื่อร้านค้า
```

---

## ⚙️ Environment Variables

สร้างไฟล์ `backend/.env` สำหรับรันแบบ Manual:

```env
# Server
PORT=5000

# MySQL Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=                    # ใส่ password MySQL ของคุณ (XAMPP ปกติเป็นค่าว่าง)
DB_NAME=car_release_db

# JWT
JWT_SECRET=wawa_car_release_secret_key_2026_jwt
```

> **สำหรับ Docker:** ค่าเหล่านี้ถูกกำหนดไว้ใน `docker-compose.yml` อยู่แล้ว ไม่ต้องสร้างไฟล์ `.env`

---

## 📝 หมายเหตุเพิ่มเติม

- **XAMPP Users:** ถ้าใช้ XAMPP อยู่แล้ว ให้ clone ไปไว้ใน `C:\xampp\htdocs\` แล้วเปิด MySQL จาก XAMPP Control Panel ก่อนรัน backend
- **Port ชนกัน:** ถ้า port 3306 ถูกใช้อยู่ (เช่น XAMPP MySQL) ให้ปิด MySQL ของ XAMPP ก่อน หรือเปลี่ยน port ใน `docker-compose.yml`
- **Build Production:** สำหรับ deploy production ให้รัน `cd frontend && npm run build` จะได้โฟลเดอร์ `dist/`

---

## 📜 License

Private Project — Internal Use Only
