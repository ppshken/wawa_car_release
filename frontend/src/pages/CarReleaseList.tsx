import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { CarRelease } from "../types";
import { QuickActionModal } from "../components/QuickActionModal";
import {
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  Trash2,
  X,
  Key,
  Camera,
  ShieldCheck,
  Wallet,
  FileText,
  PackageCheck,
  RotateCcw,
  Coins,
  Truck,
  Search,
  Eye,
  ChevronRight,
  RefreshCw,
  Box,
  Calendar,
  User,
  CheckSquare,
  Users,
  Check,
} from "lucide-react";

const sampleReleasesFull = [
  {
    car_release_id: 1,
    car_release_no: "TMS-2026720-0005",
    car_img:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=100&q=80",
    license_plate: "ผผ4108 [18]",
    brand_model: "Isuzu D-Max",
    is_returned: false,
    completedStores: 1,
    totalStores: 1,
    allowance: "-",
    allowance_paid: "-",
    accounting_status: "รอ...",
    mileage: 101741,
    driver_avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
    driver_name: "บอย",
    driver_phone: "0812345678",
    follower_name: "บอย",
    controlled_type: "-",
    cart_count: 0,
    pallet_count: 0,
    dateGroup: "20/7/2026",
    dateCount: 5,
    issuer: "พี",
    pda_device: "PDA 5",
  },
  {
    car_release_id: 2,
    car_release_no: "TMS-2026720-0004",
    car_img:
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=100&q=80",
    license_plate: "ผก 359[33]",
    brand_model: "Hino 300",
    is_returned: false,
    completedStores: 1,
    totalStores: 1,
    allowance: "-",
    allowance_paid: "-",
    accounting_status: "รอ...",
    mileage: 87226,
    driver_avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    driver_name: "โม",
    driver_phone: "0898765432",
    follower_name: "กิ๊ก",
    controlled_type: "-",
    cart_count: 0,
    pallet_count: 0,
    dateGroup: "20/7/2026",
    dateCount: 5,
    issuer: "พี",
    pda_device: "PDA 2",
  },
  {
    car_release_id: 3,
    car_release_no: "TMS-2026720-0003",
    car_img:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=100&q=80",
    license_plate: "ผม 3279 [16]",
    brand_model: "Toyota Hilux",
    is_returned: false,
    completedStores: 26,
    totalStores: 32,
    allowance: "-",
    allowance_paid: "-",
    accounting_status: "รอ...",
    mileage: 187028,
    driver_avatar:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&q=80",
    driver_name: "ช่างเล็ก",
    driver_phone: "0632982269",
    follower_name: "พัท",
    controlled_type: "กระบะ",
    cart_count: 2,
    pallet_count: 1,
    dateGroup: "20/7/2026",
    dateCount: 5,
    issuer: "พี",
    pda_device: "PDA 3",
  },
  {
    car_release_id: 4,
    car_release_no: "TMS-2026720-0002",
    car_img:
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=100&q=80",
    license_plate: "ผม152[27]",
    brand_model: "Isuzu D-Max",
    is_returned: false,
    completedStores: 28,
    totalStores: 31,
    allowance: "-",
    allowance_paid: "-",
    accounting_status: "รอ...",
    mileage: 118034,
    driver_avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    driver_name: "เด็ม",
    driver_phone: "0861112233",
    follower_name: "เก่ง",
    controlled_type: "กระบะ",
    cart_count: 1,
    pallet_count: 2,
    dateGroup: "20/7/2026",
    dateCount: 5,
    issuer: "พี",
    pda_device: "PDA 1",
  },
  {
    car_release_id: 5,
    car_release_no: "TMS-2026720-0001",
    car_img:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=100&q=80",
    license_plate: "ผม153[26]",
    brand_model: "Toyota Hilux",
    is_returned: false,
    completedStores: 21,
    totalStores: 35,
    allowance: "-",
    allowance_paid: "-",
    accounting_status: "รอ...",
    mileage: 141462,
    driver_avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    driver_name: "พัท",
    driver_phone: "0854445566",
    follower_name: "ใหม่",
    controlled_type: "กระบะ",
    cart_count: 3,
    pallet_count: 1,
    dateGroup: "20/7/2026",
    dateCount: 5,
    issuer: "แอดมิน",
    pda_device: "PDA 4",
  },
];

export const CarReleaseList: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [releases, setReleases] =
    useState<typeof sampleReleasesFull>(sampleReleasesFull);
  const [selectedRelease, setSelectedRelease] = useState<
    (typeof sampleReleasesFull)[0] | null
  >(null);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [modalAction, setModalAction] = useState<string | null>(null);

  // New Release Form State
  const [newPlate, setNewPlate] = useState<string>("ผผ 4108 [18]");
  const [newDriver, setNewDriver] = useState<string>("ช่างเล็ก");
  const [newFollower, setNewFollower] = useState<string>("บอย");
  const [newMileage, setNewMileage] = useState<number>(118050);
  const [newPda, setNewPda] = useState<string>("PDA-1");
  const [newControlledType, setNewControlledType] = useState<string>("กระบะ");

  useEffect(() => {
    fetchReleases();
  }, []);

  const fetchReleases = async () => {
    try {
      const res = await api.get("/car-release");
      if (
        res.data.success &&
        res.data.releases &&
        res.data.releases.length > 0
      ) {
        const formatted = res.data.releases.map((r: any) => ({
          car_release_id: r.car_release_id,
          car_release_no: r.car_release_no,
          car_img:
            "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=100&q=80",
          license_plate: r.license_plate || "-",
          brand_model: `${r.brand || ""} ${r.model || ""}`,
          is_returned: r.is_returned || false,
          completedStores: r.completed_stores || 0,
          totalStores: r.total_stores || 0,
          allowance: "-",
          allowance_paid: "-",
          accounting_status: r.accounting_status || "รอ...",
          mileage: r.mileage || 0,
          driver_avatar:
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
          driver_name: r.driver_name || "ไม่ระบุ",
          driver_phone: r.driver_phone || "-",
          follower_name:
            r.followers && r.followers.length > 0
              ? r.followers[0].follower_name
              : "-",
          controlled_type: "กระบะ",
          cart_count: 0,
          pallet_count: 0,
          dateGroup: new Date(r.created_at || Date.now()).toLocaleDateString(
            "th-TH",
          ),
          dateCount: 5,
          issuer: "พี",
          pda_device: r.pda_device || "-",
        }));
        setReleases(formatted);
      }
    } catch (err) {
      // Keep sampleReleasesFull
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        car_id: 1,
        car_release_type_id: 1,
        user_id: 3,
        group_store_id: 1,
        mileage: newMileage,
        pda_device: newPda,
        description: `ปล่อยรถ ทะเบียน ${newPlate} คนขับ ${newDriver}`,
        followers: [newFollower],
        stores: [
          { store_id: 1, sum_quantity: 10, row_order: 1, bypass: false },
        ],
      };

      const res = await api.post("/car-release", payload);
      if (res.data.success) {
        showSuccess(
          `ออกใบปล่อยรถบันทึกเข้า MySQL สำเร็จ! (เลขที่: ${res.data.car_release_no})`,
        );
        fetchReleases();
      } else {
        showError(res.data.message || "ไม่สามารถบันทึกข้อมูลได้");
      }
    } catch (err: any) {
      // Local state fallback if offline
      const newId = releases.length + 1;
      const newReleaseNo = `TMS-2026720-000${newId}`;
      const newObj = {
        car_release_id: newId,
        car_release_no: newReleaseNo,
        car_img:
          "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=100&q=80",
        license_plate: newPlate,
        brand_model: "Isuzu D-Max",
        is_returned: false,
        completedStores: 0,
        totalStores: 25,
        allowance: "-",
        allowance_paid: "-",
        accounting_status: "รอ...",
        mileage: newMileage,
        driver_avatar:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
        driver_name: newDriver,
        driver_phone: "0632982269",
        follower_name: newFollower,
        controlled_type: newControlledType,
        cart_count: 1,
        pallet_count: 1,
        dateGroup: "20/7/2026",
        dateCount: 6,
        issuer: "พี",
        pda_device: newPda,
      };

      setReleases([newObj, ...releases]);
      showSuccess(`สร้างใบปล่อยรถใหม่สำเร็จ! (${newReleaseNo})`);
    } finally {
      setIsCreateOpen(false);
    }
  };

  const filteredReleases = releases.filter(
    (r) =>
      r.car_release_no.toLowerCase().includes(search.toLowerCase()) ||
      r.license_plate.toLowerCase().includes(search.toLowerCase()) ||
      r.driver_name.toLowerCase().includes(search.toLowerCase()) ||
      r.follower_name.toLowerCase().includes(search.toLowerCase()),
  );

  const groupedReleases = filteredReleases.reduce(
    (acc, rel) => {
      const key = rel.dateGroup || "20/7/2026";
      if (!acc[key]) acc[key] = [];
      acc[key].push(rel);
      return acc;
    },
    {} as Record<string, typeof releases>,
  );

  return (
    <div className="w-full space-y-4 font-sans text-xs pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            ปล่อยรถ
          </h1>
          <p className="text-[11px] text-slate-500">
            ตารางรายการปล่อยรถประจำวันแบบกระชับ (Compact Table View)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* + Button opens Right Create Form Drawer */}
          <button
            onClick={() => {
              setSelectedRelease(null);
              setIsCreateOpen(true);
            }}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-1.5 rounded-lg font-medium flex items-center justify-center shadow-2xs"
            title="สร้างใบปล่อยรถใหม่"
          >
            <Plus className="w-4 h-4 text-slate-800" />
          </button>

          <button
            onClick={() => {
              setSelectedRelease(null);
              setIsCreateOpen(true);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>มอนิเตอร์รถ</span>
          </button>

          <button className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
            <Filter className="w-4 h-4" />
          </button>

          <button className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
            <CheckSquare className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="tms-card p-3 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative flex-1 w-full max-w-lg">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาเลขใบปล่อยรถ, ทะเบียน, ชื่อคนขับ, ผู้ติดตาม..."
            className="w-full bg-slate-50 border border-slate-200/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
          />
        </div>

        <div className="flex items-center gap-3 text-slate-500 text-xs">
          <span>
            รวมทั้งหมด{" "}
            <strong className="text-slate-900 font-semibold">
              {filteredReleases.length}
            </strong>{" "}
            รายการ
          </span>
        </div>
      </div>

      {/* 100% FULL-WIDTH COMPACT REFERENCE TABLE */}
      <div className="tms-card overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                <th className="py-2.5 px-3">รหัสปล่อยรถ</th>
                <th className="py-2.5 px-3">เลือกรถ</th>
                <th className="py-2.5 px-3">สถานะรถ</th>
                <th className="py-2.5 px-3">ความคืบหน้า</th>
                <th className="py-2.5 px-3 text-center">เบี้ยเลี้ยง</th>
                <th className="py-2.5 px-3 text-center">จ่ายเบี้ยเลี้ยง</th>
                <th className="py-2.5 px-3">สถานะทางบัญชี</th>
                <th className="py-2.5 px-3 text-right">เลขไมล์</th>
                <th className="py-2.5 px-3">ผู้ใช้งาน</th>
                <th className="py-2.5 px-3">จำนวนผู้ติดตาม</th>
                <th className="py-2.5 px-3">ประเภทสินค้าควบคุม</th>
                <th className="py-2.5 px-3 text-center">จำนวนรถเข็น</th>
                <th className="py-2.5 px-3 text-center">จำนวนพาเลท</th>
                <th className="py-2.5 px-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
              {Object.entries(groupedReleases).map(([dateStr, items]) => (
                <React.Fragment key={dateStr}>
                  {/* Date Header Row */}
                  <tr className="bg-slate-50 border-y border-slate-200/80">
                    <td
                      colSpan={14}
                      className="py-1.5 px-3 font-bold text-[11px] text-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{dateStr}</span>
                        <span className="bg-slate-200 text-slate-800 text-[10px] px-1.5 py-0.2 rounded-md font-semibold">
                          {items.length}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Release Rows */}
                  {items.map((rel) => {
                    const isSelected =
                      selectedRelease?.car_release_id === rel.car_release_id;
                    return (
                      <tr
                        key={rel.car_release_id}
                        onClick={() => {
                          setIsCreateOpen(false);
                          setSelectedRelease(rel);
                        }}
                        className={`hover:bg-slate-100/80 cursor-pointer transition-colors ${
                          isSelected ? "bg-slate-100 font-semibold" : ""
                        }`}
                      >
                        {/* รหัสปล่อยรถ */}
                        <td className="py-2 px-3 font-bold text-slate-900">
                          {rel.car_release_no}
                        </td>

                        {/* เลือกรถ */}
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={rel.car_img}
                              alt="car"
                              className="w-7 h-7 rounded-md object-cover border border-slate-200 shrink-0"
                            />
                            <span className="font-semibold text-slate-800 text-[11px]">
                              {rel.license_plate}
                            </span>
                          </div>
                        </td>

                        {/* สถานะรถ */}
                        <td className="py-2 px-3">
                          {rel.is_returned ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                              <CheckCircle2 className="w-3 h-3" /> คืนรถแล้ว
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200/60">
                              <XCircle className="w-3 h-3 text-red-600" />{" "}
                              ยังไม่คืนรถ
                            </span>
                          )}
                        </td>

                        {/* ความคืบหน้า */}
                        <td className="py-2 px-3 font-medium">
                          {rel.completedStores === rel.totalStores ? (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              ✓ ({rel.completedStores}/{rel.totalStores})
                            </span>
                          ) : (
                            <span className="text-slate-800 font-semibold flex items-center gap-1">
                              <Truck className="w-3 h-3 text-slate-500" /> (
                              {rel.completedStores}/{rel.totalStores})
                            </span>
                          )}
                        </td>

                        {/* เบี้ยเลี้ยง */}
                        <td className="py-2 px-3 text-center text-slate-500">
                          {rel.allowance}
                        </td>

                        {/* จ่ายเบี้ยเลี้ยง */}
                        <td className="py-2 px-3 text-center text-slate-500">
                          {rel.allowance_paid}
                        </td>

                        {/* สถานะทางบัญชี */}
                        <td className="py-2 px-3 text-slate-600 font-medium">
                          {rel.accounting_status}
                        </td>

                        {/* เลขไมล์ */}
                        <td className="py-2 px-3 text-right font-bold text-slate-900">
                          {rel.mileage.toLocaleString()}
                        </td>

                        {/* ผู้ใช้งาน */}
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1.5">
                            <img
                              src={rel.driver_avatar}
                              alt="driver"
                              className="w-5 h-5 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <span className="font-semibold text-slate-900">
                              {rel.driver_name}
                            </span>
                          </div>
                        </td>

                        {/* จำนวนผู้ติดตาม */}
                        <td className="py-2 px-3 text-slate-700">
                          {rel.follower_name}
                        </td>

                        {/* ประเภทสินค้าควบคุม */}
                        <td className="py-2 px-3">
                          {rel.controlled_type !== "-" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              <Box className="w-3 h-3 text-slate-600" />
                              {rel.controlled_type}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* จำนวนรถเข็น */}
                        <td className="py-2 px-3 text-center text-slate-600">
                          {rel.cart_count}
                        </td>

                        {/* จำนวนพาเลท */}
                        <td className="py-2 px-3 text-center text-slate-600">
                          {rel.pallet_count}
                        </td>

                        {/* จัดการ */}
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsCreateOpen(false);
                              setSelectedRelease(rel);
                            }}
                            className="bg-white border border-slate-200 hover:bg-slate-900 hover:text-white text-slate-700 text-[10px] font-medium px-2.5 py-1 rounded-lg transition-all shadow-2xs inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>ดูข้อมูล</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT SLIDE-OVER CREATE RELEASE FORM DRAWER */}
      {isCreateOpen && (
        <div className="fixed left-0 right-0 bottom-0 w-screen h-screen z-[99999] bg-slate-900/40 backdrop-blur-sm flex justify-end overflow-hidden">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-3.5 px-4 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  title="ปิดหน้าต่าง"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                  สร้างรายการปล่อยรถใหม่
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  form="create-release-form"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-1.5 rounded-lg text-xs transition-colors shadow-2xs"
                >
                  บันทึกสร้างใบปล่อยรถ
                </button>
              </div>
            </div>

            {/* Form Content */}
            <form
              id="create-release-form"
              onSubmit={handleCreateSubmit}
              className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-xs"
            >
              <div className="space-y-3 bg-white p-4  rounded-lg">
                <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">
                  1. ข้อมูลรถและคนขับ
                </h4>

                <div className="space-y-2.5">
                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">
                      เลือกรถ / ทะเบียน *
                    </label>
                    <select
                      value={newPlate}
                      onChange={(e) => setNewPlate(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400"
                    >
                      <option value="ผผ 4108 [18]">
                        ผผ 4108 [18] (Isuzu D-Max)
                      </option>
                      <option value="ผก 359[33]">ผก 359[33] (Hino 300)</option>
                      <option value="ผม 3279 [16]">
                        ผม 3279 [16] (Toyota Hilux)
                      </option>
                      <option value="ผม152[27]">ผม152[27] (Isuzu D-Max)</option>
                      <option value="ผม153[26]">
                        ผม153[26] (Toyota Hilux)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">
                      พนักงานขับรถ *
                    </label>
                    <select
                      value={newDriver}
                      onChange={(e) => setNewDriver(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400"
                    >
                      <option value="ช่างเล็ก">ช่างเล็ก (0632982269)</option>
                      <option value="บอย">บอย (0812345678)</option>
                      <option value="โม">โม (0898765432)</option>
                      <option value="เด็ม">เด็ม (0861112233)</option>
                      <option value="พัท">พัท (0854445566)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">
                      ผู้ติดตาม
                    </label>
                    <input
                      type="text"
                      value={newFollower}
                      onChange={(e) => setNewFollower(e.target.value)}
                      placeholder="ระบุชื่อผู้ติดตาม (เช่น บอย, พัท)"
                      className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-700 font-semibold block mb-1">
                        เลขไมล์ออก (กม.)
                      </label>
                      <input
                        type="number"
                        value={newMileage}
                        onChange={(e) => setNewMileage(Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 font-semibold block mb-1">
                        อุปกรณ์ PDA
                      </label>
                      <select
                        value={newPda}
                        onChange={(e) => setNewPda(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400"
                      >
                        <option value="PDA-1">PDA-1</option>
                        <option value="PDA-2">PDA-2</option>
                        <option value="PDA-3">PDA-3</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">
                      ประเภทสินค้าควบคุม
                    </label>
                    <select
                      value={newControlledType}
                      onChange={(e) => setNewControlledType(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400"
                    >
                      <option value="กระบะ">กระบะ</option>
                      <option value="ตู้แห้ง">ตู้แห้ง</option>
                      <option value="สินค้าทั่วไป">สินค้าทั่วไป</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Photos Section */}
              <div className="space-y-2 bg-white p-4 rounded-lg">
                <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">
                  2. ถ่ายรูปสภาพรถรอบคัน (ภาพตัวอย่าง)
                </h4>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="border border-slate-200 rounded-lg p-3 text-center bg-slate-50 cursor-pointer hover:bg-slate-100">
                    <Camera className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <span className="text-[11px] font-medium text-slate-600 block">
                      รูปถ่ายเลขไมล์
                    </span>
                  </div>
                  <div className="border border-slate-200 rounded-lg p-3 text-center bg-slate-50 cursor-pointer hover:bg-slate-100">
                    <Camera className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <span className="text-[11px] font-medium text-slate-600 block">
                      รูปถ่ายหน้ารถ
                    </span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RIGHT SLIDE-OVER DETAIL INSPECTOR DRAWER */}
      {selectedRelease && (
        <div className="fixed left-0 right-0 bottom-0 w-screen h-screen z-[99999] bg-slate-900/40 backdrop-blur-sm flex justify-end overflow-hidden">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div>
                <span className="font-bold text-slate-900 text-base">
                  {selectedRelease.car_release_no}
                </span>
                <span className="ml-2 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded-lg">
                  {selectedRelease.license_plate}
                </span>
              </div>

              <button
                onClick={() => setSelectedRelease(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar text-xs">
              {/* 10 QUICK ACTION BUTTONS */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  การดำเนินการด่วน
                </div>
                <div className="grid grid-cols-5 gap-2">
                  <button
                    onClick={() => setModalAction("reset_key")}
                    className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <Key className="w-4 h-4 text-slate-700 mb-1" />
                    <span className="text-[10px] font-medium text-slate-700">
                      รีเซ็ตกุญแจ
                    </span>
                  </button>

                  <button
                    onClick={() => setModalAction("cargo_photo")}
                    className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <Camera className="w-4 h-4 text-slate-700 mb-1" />
                    <span className="text-[10px] font-medium text-slate-700">
                      รูปให้ของ
                    </span>
                  </button>

                  <button
                    onClick={() => setModalAction("accounting")}
                    className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-700 mb-1" />
                    <span className="text-[10px] font-medium text-slate-700">
                      สถานะบัญชี
                    </span>
                  </button>

                  <button
                    onClick={() => setModalAction("add_store")}
                    className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-slate-700 mb-1" />
                    <span className="text-[10px] font-medium text-slate-700">
                      เพิ่มร้านค้า
                    </span>
                  </button>

                  <button
                    onClick={() => setModalAction("followup")}
                    className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <Truck className="w-4 h-4 text-slate-700 mb-1" />
                    <span className="text-[10px] font-medium text-slate-700">
                      ติดตาม
                    </span>
                  </button>

                  <button
                    onClick={() => setModalAction("deposit")}
                    className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <Wallet className="w-4 h-4 text-slate-700 mb-1" />
                    <span className="text-[10px] font-medium text-slate-700">
                      ฝากเงิน
                    </span>
                  </button>

                  <button
                    onClick={() => setModalAction("return_docs")}
                    className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-slate-700 mb-1" />
                    <span className="text-[10px] font-medium text-slate-700">
                      เอกสารคืนของ
                    </span>
                  </button>

                  <button
                    onClick={() => setModalAction("controlled_items")}
                    className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <PackageCheck className="w-4 h-4 text-slate-700 mb-1" />
                    <span className="text-[10px] font-medium text-slate-700">
                      สินค้าควบคุม
                    </span>
                  </button>

                  <button
                    onClick={() => setModalAction("return_car")}
                    className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-700 mb-1" />
                    <span className="text-[10px] font-medium text-slate-700">
                      คืนรถ
                    </span>
                  </button>

                  <button
                    onClick={() => setModalAction("allowance")}
                    className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <Coins className="w-4 h-4 text-slate-700 mb-1" />
                    <span className="text-[10px] font-medium text-slate-700">
                      เบี้ยเลี้ยง
                    </span>
                  </button>
                </div>
              </div>

              {/* Metadata Details */}
              <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
                <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">
                  รายละเอียดใบปล่อยรถ
                </h4>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">
                      รหัสปล่อยรถ
                    </span>
                    <span className="font-bold text-slate-900">
                      {selectedRelease.car_release_no}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">
                      ทะเบียนรถ
                    </span>
                    <span className="font-bold text-slate-900">
                      {selectedRelease.license_plate}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">
                      พนักงานขับรถ
                    </span>
                    <span className="font-semibold text-slate-900">
                      {selectedRelease.driver_name}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">
                      เบอร์โทรศัพท์
                    </span>
                    <span className="font-medium text-slate-800">
                      {selectedRelease.driver_phone}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">
                      ผู้ติดตาม
                    </span>
                    <span className="font-medium text-slate-800">
                      {selectedRelease.follower_name}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">
                      เลขไมล์ออก
                    </span>
                    <span className="font-bold text-slate-900">
                      {selectedRelease.mileage?.toLocaleString()} กม.
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">
                      เครื่อง PDA
                    </span>
                    <span className="font-medium text-slate-800">
                      {selectedRelease.pda_device}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">
                      ผู้ปล่อยรถ
                    </span>
                    <span className="font-medium text-slate-800">
                      {selectedRelease.issuer}
                    </span>
                  </div>
                </div>
              </div>

              {/* Photos */}
              <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-2">
                <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">
                  รูปภาพการปล่อยรถ
                </h4>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-100 aspect-video relative group">
                    <img
                      src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&q=80"
                      alt="Mileage photo"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                      เลขไมล์
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-100 aspect-video relative group">
                    <img
                      src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&q=80"
                      alt="Vehicle front photo"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                      หน้ารถ
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex justify-between items-center">
              <button
                onClick={() => setSelectedRelease(null)}
                className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium px-4 py-2 rounded-lg text-xs transition-colors"
              >
                ปิดหน้าต่าง
              </button>

              <Link
                to={`/releases/${selectedRelease.car_release_id}`}
                className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2 rounded-lg text-xs transition-colors inline-flex items-center gap-1.5"
              >
                <span>ไปยังหน้ารายละเอียดเต็ม</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <QuickActionModal
        isOpen={!!modalAction}
        actionType={modalAction}
        releaseNo={selectedRelease?.car_release_no || "TMS-2026720-0005"}
        onClose={() => setModalAction(null)}
      />
    </div>
  );
};
