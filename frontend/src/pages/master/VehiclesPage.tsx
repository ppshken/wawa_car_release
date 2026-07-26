import React, { useEffect, useState, useMemo, useCallback } from "react";
import api, { getImageUrl } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { ConfirmModal } from "../../components/ConfirmModal";
import { PaginationControl } from "../../components/PaginationControl";
import { AnimatedDrawer } from "../../components/AnimatedDrawer";
import { MasterSubNav } from "../../components/MasterSubNav";
import {
  Truck,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Filter,
  Camera,
  X,
  ImageIcon,
} from "lucide-react";

interface CarData {
  car_id: string | number;
  car_code?: string;
  license_plate: string;
  brand?: string;
  model?: string;
  sub_model?: string;
  year?: number | string;
  quantity?: number;
  car_image?: string;
  is_assigned_today?: boolean;
}

const generateUUID = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().toUpperCase();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
    .replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    })
    .toUpperCase();
};

export const VehiclesPage: React.FC = () => {
  const { showSuccess, showError } = useToast();

  const [vehicles, setVehicles] = useState<CarData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Date & Status Filters
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "assigned">("all");

  // Search & Pagination
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Drawer & Form
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<CarData | null>(null);
  const [formCarId, setFormCarId] = useState("");
  const [formCarCode, setFormCarCode] = useState("");
  const [formLicensePlate, setFormLicensePlate] = useState("");
  const [formBrand, setFormBrand] = useState("");
  const [formModel, setFormModel] = useState("");
  const [formSubModel, setFormSubModel] = useState("");
  const [formYear, setFormYear] = useState("");
  const [formQuantity, setFormQuantity] = useState<number>(100);
  const [formCarImage, setFormCarImage] = useState<string>("");

  // Delete Modal
  const [vehicleToDelete, setVehicleToDelete] = useState<CarData | null>(null);

  const inputCls =
    "w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormCarImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderField = (label: string, required: boolean, inputEl: React.ReactNode) => (
    <div>
      <label className="block text-slate-700 font-semibold mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {inputEl}
    </div>
  );

  const isVehicleDirty = useMemo(() => {
    if (!editingVehicle) return !!(formLicensePlate || formBrand || formModel || formCarImage);
    return (
      formLicensePlate !== editingVehicle.license_plate ||
      formBrand !== (editingVehicle.brand || "") ||
      formModel !== (editingVehicle.model || "") ||
      formSubModel !== (editingVehicle.sub_model || "") ||
      formQuantity !== (editingVehicle.quantity ?? 100) ||
      formCarImage !== (editingVehicle.car_image || "")
    );
  }, [editingVehicle, formLicensePlate, formBrand, formModel, formSubModel, formQuantity, formCarImage]);

  const fetchVehicles = useCallback(async (dateStr?: string) => {
    setLoading(true);
    try {
      const targetDate = dateStr || selectedDate;
      const res = await api.get(`/master/vehicles?date=${targetDate}`);
      if (res.data.success) setVehicles(res.data.vehicles || []);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, selectedDate]);

  useEffect(() => {
    fetchVehicles(selectedDate);
  }, [selectedDate]);

  const availableCount = useMemo(() => {
    return vehicles.filter((v) => !v.is_assigned_today).length;
  }, [vehicles]);

  const assignedCount = useMemo(() => {
    return vehicles.filter((v) => !!v.is_assigned_today).length;
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    const s = search.toLowerCase();
    return vehicles.filter((v) => {
      const matchesSearch =
        v.license_plate.toLowerCase().includes(s) ||
        (v.brand || "").toLowerCase().includes(s) ||
        (v.model || "").toLowerCase().includes(s) ||
        (v.car_code || "").toLowerCase().includes(s) ||
        String(v.car_id).toLowerCase().includes(s);

      if (!matchesSearch) return false;

      if (statusFilter === "available") return !v.is_assigned_today;
      if (statusFilter === "assigned") return !!v.is_assigned_today;
      return true;
    });
  }, [vehicles, search, statusFilter]);

  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(start, start + itemsPerPage);
  }, [filteredVehicles, currentPage, itemsPerPage]);

  const handleOpenAddVehicle = () => {
    setEditingVehicle(null);
    setFormCarId(generateUUID());
    setFormCarCode("");
    setFormLicensePlate("");
    setFormBrand("");
    setFormModel("");
    setFormSubModel("");
    setFormYear("");
    setFormQuantity(100);
    setFormCarImage("");
    setIsDrawerOpen(true);
  };

  const handleOpenEditVehicle = (v: CarData) => {
    setEditingVehicle(v);
    setFormCarId(String(v.car_id));
    setFormCarCode(v.car_code || "");
    setFormLicensePlate(v.license_plate);
    setFormBrand(v.brand || "");
    setFormModel(v.model || "");
    setFormSubModel(v.sub_model || "");
    setFormYear(v.year ? String(v.year) : "");
    setFormQuantity(v.quantity ?? 100);
    setFormCarImage(v.car_image || "");
    setIsDrawerOpen(true);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLicensePlate) {
      showError("กรุณากรอกทะเบียนรถ");
      return;
    }
    if (!formCarImage) {
      showError("กรุณาอัปโหลดรูปรถ (จำเป็นต้องใส่รูปรถ)");
      return;
    }

    try {
      const payload = {
        car_id: formCarId,
        car_code: formCarCode,
        license_plate: formLicensePlate,
        brand: formBrand,
        model: formModel,
        sub_model: formSubModel,
        year: formYear ? Number(formYear) : null,
        quantity: Number(formQuantity) || 100,
        car_image: formCarImage,
      };

      if (editingVehicle) {
        await api.put(`/master/vehicles/${editingVehicle.car_id}`, payload);
        showSuccess("อัปเดตข้อมูลรถเรียบร้อยแล้ว!");
      } else {
        await api.post("/master/vehicles", payload);
        showSuccess("เพิ่มข้อมูลรถใหม่สำเร็จ!");
      }
      setIsDrawerOpen(false);
      fetchVehicles();
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลรถ");
    }
  };

  const handleConfirmDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    try {
      await api.delete(`/master/vehicles/${vehicleToDelete.car_id}`);
      showSuccess(`ลบข้อมูลรถทะเบียน "${vehicleToDelete.license_plate}" เรียบร้อยแล้ว`);
      fetchVehicles();
    } catch (err: any) {
      showError(err?.response?.data?.message || "ไม่สามารถลบข้อมูลรถคันนี้ได้");
    } finally {
      setVehicleToDelete(null);
    }
  };

  return (
    <div className="w-full space-y-4 font-sans text-xs pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-slate-800" />
            จัดการข้อมูลรถ (Vehicle Management)
          </h1>
          <p className="text-[11px] text-slate-500">
            บริหารจัดการทะเบียนรถ ยี่ห้อ รุ่น ความจุสินค้า และสถานะพร้อมใช้งานของรถขนส่ง
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchVehicles()}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-1.5 rounded-lg font-medium flex items-center gap-1 shadow-2xs"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 text-slate-700 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleOpenAddVehicle}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> <span>เพิ่มข้อมูลรถ</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation */}
      <MasterSubNav />

      {/* Search & Filter Bar */}
      <div className="tms-card p-3 flex flex-col md:flex-row justify-between items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาทะเบียนรถ, ยี่ห้อ, รุ่น, ID..."
            className="w-full bg-slate-50 border border-slate-200/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
          />
        </div>

        {/* Date Filter & Status Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
          {/* Date Picker Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1 text-xs shrink-0">
            <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="font-semibold text-slate-700">วันที่จัดรถ:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1 text-xs shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="font-semibold text-slate-700">สถานะ:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">ทั้งหมด ({vehicles.length})</option>
              <option value="available">🟢 ว่าง / พร้อมใช้งาน ({availableCount})</option>
              <option value="assigned">🟠 ไม่ว่าง / จัดสายแล้ว ({assignedCount})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="tms-card overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                <th className="py-2.5 px-4 text-center w-16">รูปรถ</th>
                <th className="py-2.5 px-4 text-center w-36">ID (car_id / Code)</th>
                <th className="py-2.5 px-4">ทะเบียนรถ</th>
                <th className="py-2.5 px-4">ยี่ห้อ (Brand)</th>
                <th className="py-2.5 px-4">รุ่น (Model)</th>
                <th className="py-2.5 px-4">รุ่นย่อย / ปีรถ</th>
                <th className="py-2.5 px-4 text-right">ความจุสินค้า (ลัง)</th>
                <th className="py-2.5 px-4 text-center">สถานะการใช้รถ</th>
                <th className="py-2.5 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
              {paginatedVehicles.map((v) => (
                <tr key={v.car_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-3 text-center">
                    {v.car_image ? (
                      <div className="w-12 h-10 rounded border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center mx-auto shadow-2xs">
                        <img src={getImageUrl(v.car_image)} alt={v.license_plate} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-10 rounded border border-dashed border-rose-300 bg-rose-50 text-rose-500 flex flex-col items-center justify-center text-[9px] font-bold mx-auto">
                        <Camera className="w-3.5 h-3.5" />
                        <span>ไม่มีรูป *</span>
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono">
                    <div className="text-[10px] font-bold text-blue-700 truncate max-w-[140px]" title={String(v.car_id)}>
                      {v.car_id}
                    </div>
                    {v.car_code && (
                      <div className="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded inline-block">
                        {v.car_code}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">{v.license_plate}</span>
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">{v.brand || "-"}</td>
                  <td className="py-2.5 px-4 text-slate-600">{v.model || "-"}</td>
                  <td className="py-2.5 px-4 text-slate-600">
                    {v.sub_model ? `${v.sub_model} ${v.year ? `(${v.year})` : ""}` : (v.year ? `ปี ${v.year}` : "-")}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-amber-800 font-mono">
                    {v.quantity ?? 100} ลัง
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {v.is_assigned_today ? (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200"
                        title={`ถูกจัดสายรถแล้ว ณ วันที่ ${selectedDate}`}
                      >
                        <AlertCircle className="w-3 h-3 text-amber-600" /> ไม่ว่าง (จัดสายแล้ว)
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                        title={`ว่าง พร้อมใช้งาน ณ วันที่ ${selectedDate}`}
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ว่าง (พร้อมใช้งาน)
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right space-x-1">
                    <button onClick={() => handleOpenEditVehicle(v)} className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100" title="แก้ไข">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setVehicleToDelete(v)} className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50" title="ลบ">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredVehicles.length === 0 && (
                <tr><td colSpan={9} className="py-8 text-center text-slate-400">ยังไม่มีข้อมูลรถ</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <PaginationControl
          currentPage={currentPage}
          totalItems={filteredVehicles.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Vehicle Drawer */}
      <AnimatedDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingVehicle ? "แก้ไขข้อมูลรถ" : "เพิ่มข้อมูลรถใหม่"}
        formId="vehicle-form"
        onSubmit={handleSaveVehicle}
        submitLabel={editingVehicle ? "บันทึกการแก้ไข" : "บันทึกข้อมูลรถ"}
        isDirty={isVehicleDirty}
      >
        {/* รูปรถยนต์ (Required) */}
        <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <label className="block text-slate-800 font-bold text-xs flex items-center justify-between">
            <span>รูปรถยนต์ <span className="text-rose-500">* (จำเป็นต้องอัปโหลด)</span></span>
            {formCarImage && (
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                ✓ มีรูปรถแล้ว
              </span>
            )}
          </label>
          {formCarImage ? (
            <div className="relative rounded-lg overflow-hidden border border-slate-300 bg-white group max-h-48 flex items-center justify-center p-1">
              <img
                src={getImageUrl(formCarImage)}
                alt="Vehicle Preview"
                className="max-h-40 object-contain rounded"
              />
              <button
                type="button"
                onClick={() => setFormCarImage("")}
                className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md transition-colors"
                title="ลบรูปรถ"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-rose-300 hover:border-rose-400 bg-rose-50/50 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors p-4 text-center">
              <Camera className="w-8 h-8 text-rose-500 mb-1 animate-pulse" />
              <span className="text-xs font-bold text-rose-700">คลิกที่นี่เพื่ออัปโหลดรูปรถ *</span>
              <span className="text-[10px] text-slate-500 font-normal">
                รองรับไฟล์ PNG, JPG, JPEG (ขนาดไม่เกิน 5MB)
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                required
              />
            </label>
          )}
        </div>

        {renderField("ID รถ (car_id) *", true,
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={formCarId}
              onChange={(e) => setFormCarId(e.target.value)}
              placeholder="เช่น 8B50A0D7-782D-49A3-8F64-EC12DB83E086"
              className={`${inputCls} font-mono font-bold text-blue-700`}
              required
              readOnly={!!editingVehicle}
            />
            {!editingVehicle && (
              <button
                type="button"
                onClick={() => setFormCarId(generateUUID())}
                className="px-2.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold shrink-0"
                title="สุ่ม UUID ใหม่"
              >
                สุ่ม ID
              </button>
            )}
          </div>
        )}
        {renderField("รหัสอ้างอิงรถ / Text ID (car_code)", false,
          <input
            type="text"
            value={formCarCode}
            onChange={(e) => setFormCarCode(e.target.value)}
            placeholder="เช่น CAR-001 หรือ รหัสภายใน"
            className={`${inputCls} font-mono`}
          />
        )}
        {renderField("ทะเบียนรถ *", true,
          <input type="text" value={formLicensePlate} onChange={(e) => setFormLicensePlate(e.target.value)} placeholder="เช่น 1กข-9999" className={inputCls} required />
        )}
        {renderField("ความจุสินค้า / บรรจุได้สูงสุด (ลัง) (quantity) *", true,
          <input
            type="number"
            value={formQuantity}
            onChange={(e) => setFormQuantity(parseInt(e.target.value, 10) || 1)}
            placeholder="เช่น 100"
            className={`${inputCls} font-bold text-amber-800`}
            min="1"
            required
          />
        )}
        {renderField("ยี่ห้อ (Brand)", false,
          <input type="text" value={formBrand} onChange={(e) => setFormBrand(e.target.value)} placeholder="เช่น Isuzu, Toyota" className={inputCls} />
        )}
        {renderField("รุ่น (Model)", false,
          <input type="text" value={formModel} onChange={(e) => setFormModel(e.target.value)} placeholder="เช่น D-Max, Hilux Revo" className={inputCls} />
        )}
        {renderField("รุ่นย่อย / คำอธิบายเพิ่มเติม", false,
          <input type="text" value={formSubModel} onChange={(e) => setFormSubModel(e.target.value)} placeholder="เช่น ตู้เย็น 4 ล้อ" className={inputCls} />
        )}
        {renderField("ปีรถ (Year)", false,
          <input type="number" value={formYear} onChange={(e) => setFormYear(e.target.value)} placeholder="เช่น 2024" className={inputCls} min="1990" max="2100" />
        )}
      </AnimatedDrawer>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!vehicleToDelete}
        title="ยืนยันการลบข้อมูลรถ"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลรถทะเบียน "${vehicleToDelete?.license_plate}"?`}
        confirmText="ลบข้อมูล"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDeleteVehicle}
        onCancel={() => setVehicleToDelete(null)}
      />
    </div>
  );
};

export default VehiclesPage;
