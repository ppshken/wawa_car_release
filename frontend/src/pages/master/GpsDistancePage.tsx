import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { ConfirmModal } from "../../components/ConfirmModal";
import { PaginationControl } from "../../components/PaginationControl";
import { AnimatedDrawer } from "../../components/AnimatedDrawer";
import { MasterSubNav } from "../../components/MasterSubNav";
import {
  Navigation,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Tag,
  Ruler,
  MapPin,
  ShieldAlert,
} from "lucide-react";

interface GpsDistanceData {
  gps_distance_id: number;
  distance_code: string;
  distance_name: string;
  distance_meters: number;
  unit_name?: string;
  description?: string;
  is_active: number | boolean;
  created_at?: string;
  updated_at?: string;
}

export const GpsDistancePage: React.FC = () => {
  const { showSuccess, showError } = useToast();

  const [distances, setDistances] = useState<GpsDistanceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Pagination
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Drawer & Form
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingDistance, setEditingDistance] = useState<GpsDistanceData | null>(null);
  const [formDistanceCode, setFormDistanceCode] = useState("");
  const [formDistanceName, setFormDistanceName] = useState("");
  const [formDistanceMeters, setFormDistanceMeters] = useState<number>(300);
  const [formUnitName, setFormUnitName] = useState("เมตร");
  const [formDescription, setFormDescription] = useState("");
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Delete Modal
  const [distanceToDelete, setDistanceToDelete] = useState<GpsDistanceData | null>(null);

  const inputCls =
    "w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400";

  const renderField = (label: string, required: boolean, inputEl: React.ReactNode) => (
    <div>
      <label className="block text-slate-700 font-semibold mb-1 text-xs">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {inputEl}
    </div>
  );

  const isDistanceDirty = useMemo(() => {
    if (!editingDistance) return !!(formDistanceCode || formDistanceName || formDescription);
    return (
      formDistanceCode !== editingDistance.distance_code ||
      formDistanceName !== editingDistance.distance_name ||
      formDistanceMeters !== editingDistance.distance_meters ||
      formUnitName !== (editingDistance.unit_name || "เมตร") ||
      formDescription !== (editingDistance.description || "") ||
      formIsActive !== (editingDistance.is_active === 1 || editingDistance.is_active === true)
    );
  }, [editingDistance, formDistanceCode, formDistanceName, formDistanceMeters, formUnitName, formDescription, formIsActive]);

  const fetchDistances = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/master/gps-distance");
      if (res.data.success) {
        setDistances(res.data.distances || []);
      }
    } catch (err: any) {
      console.error("Error fetching GPS distances:", err);
      showError(err?.response?.data?.message || "ไม่สามารถดึงข้อมูลระยะห่าง GPS ได้");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    fetchDistances();
  }, [fetchDistances]);

  const filteredDistances = useMemo(() => {
    const s = search.toLowerCase().trim();
    return distances.filter(
      (d) =>
        d.distance_name.toLowerCase().includes(s) ||
        d.distance_code.toLowerCase().includes(s) ||
        (d.description || "").toLowerCase().includes(s) ||
        String(d.distance_meters).includes(s)
    );
  }, [distances, search]);

  const paginatedDistances = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDistances.slice(start, start + itemsPerPage);
  }, [filteredDistances, currentPage, itemsPerPage]);

  const handleOpenAddDistance = () => {
    setEditingDistance(null);
    setFormDistanceCode(`GPS-DIST-${Date.now().toString().slice(-4)}`);
    setFormDistanceName("");
    setFormDistanceMeters(300);
    setFormUnitName("เมตร");
    setFormDescription("");
    setFormIsActive(true);
    setIsDrawerOpen(true);
  };

  const handleOpenEditDistance = (item: GpsDistanceData) => {
    setEditingDistance(item);
    setFormDistanceCode(item.distance_code);
    setFormDistanceName(item.distance_name);
    setFormDistanceMeters(item.distance_meters);
    setFormUnitName(item.unit_name || "เมตร");
    setFormDescription(item.description || "");
    setFormIsActive(item.is_active === 1 || item.is_active === true);
    setIsDrawerOpen(true);
  };

  const handleSaveDistance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDistanceName.trim()) {
      showError("กรุณากรอกชื่อเกณฑ์ระยะห่าง GPS");
      return;
    }

    try {
      const payload = {
        distance_code: formDistanceCode.trim().toUpperCase(),
        distance_name: formDistanceName.trim(),
        distance_meters: Math.max(0, Number(formDistanceMeters) || 0),
        unit_name: formUnitName.trim() || "เมตร",
        description: formDescription.trim(),
        is_active: formIsActive ? 1 : 0,
      };

      if (editingDistance) {
        await api.put(`/master/gps-distance/${editingDistance.gps_distance_id}`, payload);
        showSuccess("อัปเดตข้อมูลระยะห่าง GPS เรียบร้อยแล้ว!");
      } else {
        await api.post("/master/gps-distance", payload);
        showSuccess("เพิ่มเกณฑ์ระยะห่าง GPS ใหม่สำเร็จ!");
      }
      setIsDrawerOpen(false);
      fetchDistances();
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกระยะห่าง GPS");
    }
  };

  const handleToggleActive = async (item: GpsDistanceData) => {
    try {
      const newStatus = !(item.is_active === 1 || item.is_active === true);
      await api.put(`/master/gps-distance/${item.gps_distance_id}`, {
        ...item,
        is_active: newStatus ? 1 : 0,
      });
      showSuccess(`สลับสถานะ "${item.distance_name}" เป็น ${newStatus ? "เปิดใช้งาน" : "ปิดใช้งาน"} เรียบร้อย`);
      fetchDistances();
    } catch (err: any) {
      showError("ไม่สามารถสลับสถานะได้");
    }
  };

  const handleConfirmDelete = async () => {
    if (!distanceToDelete) return;
    try {
      await api.delete(`/master/gps-distance/${distanceToDelete.gps_distance_id}`);
      showSuccess(`ลบเกณฑ์ระยะห่าง "${distanceToDelete.distance_name}" เรียบร้อยแล้ว`);
      fetchDistances();
    } catch (err: any) {
      showError(err?.response?.data?.message || "ไม่สามารถลบเกณฑ์ระยะห่างนี้ได้");
    } finally {
      setDistanceToDelete(null);
    }
  };

  return (
    <div className="w-full space-y-4 font-sans text-xs pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            ระยะห่าง GPS
          </h1>
          <p className="text-[11px] text-slate-500">
            บริหารจัดการเกณฑ์ระยะห่างพิกัด GPS สำหรับการเช็คอิน/เช็คเอาท์ส่งสินค้า และการเตือนพิกัดนอกสถานที่
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchDistances}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-1.5 rounded-lg font-medium flex items-center gap-1 shadow-2xs"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw
              className={`w-4 h-4 text-slate-700 ${loading ? "animate-spin" : ""}`}
            />
          </button>
          <button
            onClick={handleOpenAddDistance}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มระยะห่าง GPS</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation Bar for Master Data */}
      <MasterSubNav />

      {/* Filter / Search Bar */}
      <div className="tms-card p-3 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ค้นหาชื่อเกณฑ์, รหัส, ระยะทาง..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="tms-card overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                <th className="py-1.5 px-3 text-center w-16">ID</th>
                <th className="py-1.5 px-3">รหัสรายการ</th>
                <th className="py-1.5 px-3">ชื่อเกณฑ์ระยะห่าง GPS</th>
                <th className="py-1.5 px-3">ระยะทาง (เมตร / กม.)</th>
                <th className="py-1.5 px-3">หน่วย</th>
                <th className="py-1.5 px-3">คำอธิบาย</th>
                <th className="py-1.5 px-3 text-center">สถานะ</th>
                <th className="py-1.5 px-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-slate-500" />
                    กำลังโหลดข้อมูลระยะห่าง GPS...
                  </td>
                </tr>
              ) : paginatedDistances.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    ไม่พบข้อมูลระยะห่าง GPS ในระบบ
                  </td>
                </tr>
              ) : (
                paginatedDistances.map((item, idx) => {
                  const isActive = item.is_active === 1 || item.is_active === true;
                  const rowNum = (currentPage - 1) * itemsPerPage + idx + 1;
                  const kmVal = (item.distance_meters / 1000).toFixed(2);

                  return (
                    <tr key={item.gps_distance_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-1 px-3 text-center text-slate-400 font-mono font-bold text-[11px]">{rowNum}</td>
                      <td className="py-1 px-3">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 text-[10px]">
                          <Tag className="w-3 h-3 text-indigo-500" />
                          {item.distance_code}
                        </span>
                      </td>
                      <td className="py-1 px-3">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          {item.distance_name}
                        </div>
                      </td>
                      <td className="py-1 px-3 font-bold text-slate-900 text-[11px]">
                        {item.distance_meters.toLocaleString()} <span className="font-normal text-slate-500 text-[10px]">เมตร</span>{" "}
                        <span className="text-[10px] text-slate-400 font-mono">({kmVal} กม.)</span>
                      </td>
                      <td className="py-1 px-3 text-slate-600 font-medium text-[11px]">
                        {item.unit_name || "เมตร"}
                      </td>
                      <td className="py-1 px-3 text-slate-500 max-w-xs truncate text-[11px]" title={item.description || ""}>
                        {item.description || "-"}
                      </td>
                      <td className="py-1 px-3 text-center">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              เปิดใช้งาน
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-slate-400" />
                              ปิดใช้งาน
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-1 px-3 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEditDistance(item)}
                          className="p-0.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          title="แก้ไข"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDistanceToDelete(item)}
                          className="p-0.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="ลบ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Control */}
        {filteredDistances.length > 0 && (
          <PaginationControl
            currentPage={currentPage}
            totalItems={filteredDistances.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        )}
      </div>

      {/* Add / Edit AnimatedDrawer */}
      <AnimatedDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingDistance ? "แก้ไขข้อมูลระยะห่าง GPS" : "เพิ่มระยะห่าง GPS ใหม่"}
        formId="gps-distance-form"
        onSubmit={handleSaveDistance}
        submitLabel={editingDistance ? "บันทึกการแก้ไข" : "บันทึกเกณฑ์ระยะห่าง"}
        isDirty={isDistanceDirty}
      >
        <div className="space-y-4">
          {renderField(
            "รหัสเกณฑ์ระยะห่าง (Distance Code) *",
            true,
            <input
              type="text"
              value={formDistanceCode}
              onChange={(e) => setFormDistanceCode(e.target.value.toUpperCase())}
              placeholder="เช่น CHECKOUT_MAX, CHECKIN_RADIUS"
              className={inputCls}
              required
            />
          )}

          {renderField(
            "ชื่อเกณฑ์ระยะห่าง GPS *",
            true,
            <input
              type="text"
              value={formDistanceName}
              onChange={(e) => setFormDistanceName(e.target.value)}
              placeholder="เช่น ระยะห่างเช็คเอาท์นอกสถานที่ (Off-site Checkout)"
              className={inputCls}
              required
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            {renderField(
              "ระยะทาง (เมตร) *",
              true,
              <input
                type="number"
                min={0}
                step={1}
                value={formDistanceMeters}
                onChange={(e) => setFormDistanceMeters(Number(e.target.value))}
                placeholder="เช่น 300"
                className={inputCls}
                required
              />
            )}

            {renderField(
              "หน่วยเรียก",
              false,
              <input
                type="text"
                value={formUnitName}
                onChange={(e) => setFormUnitName(e.target.value)}
                placeholder="เมตร"
                className={inputCls}
              />
            )}
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
            <span>ระยะทางแปลงเป็นกิโลเมตร:</span>
            <span className="font-bold text-indigo-700 font-mono">
              {(formDistanceMeters / 1000).toFixed(3)} กม.
            </span>
          </div>

          {renderField(
            "คำอธิบาย / รายละเอียดเพิ่มเติม",
            false,
            <textarea
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="อธิบายวัตถุประสงค์ หรือเงื่อนไขการใช้งานของเกณฑ์ระยะห่างนี้"
              className={inputCls}
            />
          )}

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="font-semibold text-slate-800">เปิดใช้งานรายการนี้</span>
            </label>
          </div>
        </div>
      </AnimatedDrawer>

      {/* Delete Confirmation Modal */}
      {distanceToDelete && (
        <ConfirmModal
          isOpen={!!distanceToDelete}
          title="ยืนยันการลบเกณฑ์ระยะห่าง GPS"
          message={`คุณแน่ใจหรือไม่ว่าต้องการลบเกณฑ์ระยะห่าง "${distanceToDelete.distance_name}" (${distanceToDelete.distance_code})?`}
          confirmText="ลบรายการ"
          cancelText="ยกเลิก"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDistanceToDelete(null)}
        />
      )}
    </div>
  );
};

export default GpsDistancePage;
