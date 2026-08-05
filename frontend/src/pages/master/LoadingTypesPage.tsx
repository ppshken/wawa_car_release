import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { ConfirmModal } from "../../components/ConfirmModal";
import { PaginationControl } from "../../components/PaginationControl";
import { AnimatedDrawer } from "../../components/AnimatedDrawer";
import { MasterSubNav } from "../../components/MasterSubNav";
import {
  PackageCheck,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Tag,
} from "lucide-react";

interface LoadingTypeData {
  loading_type_id: number;
  type_code: string;
  type_name: string;
  unit_name: string;
  description?: string;
  is_active: number | boolean;
  created_at?: string;
  updated_at?: string;
}

export const LoadingTypesPage: React.FC = () => {
  const { showSuccess, showError } = useToast();

  const [loadingTypes, setLoadingTypes] = useState<LoadingTypeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Pagination
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Drawer & Form
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingType, setEditingType] = useState<LoadingTypeData | null>(null);
  const [formTypeCode, setFormTypeCode] = useState("");
  const [formTypeName, setFormTypeName] = useState("");
  const [formUnitName, setFormUnitName] = useState("ชิ้น");
  const [formDescription, setFormDescription] = useState("");
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Delete Modal
  const [typeToDelete, setTypeToDelete] = useState<LoadingTypeData | null>(null);

  const inputCls =
    "w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400";

  const renderField = (label: string, required: boolean, inputEl: React.ReactNode) => (
    <div>
      <label className="block text-slate-700 font-semibold mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {inputEl}
    </div>
  );

  const isTypeDirty = useMemo(() => {
    if (!editingType) return !!(formTypeCode || formTypeName || formDescription);
    return (
      formTypeCode !== editingType.type_code ||
      formTypeName !== editingType.type_name ||
      formUnitName !== (editingType.unit_name || "ชิ้น") ||
      formDescription !== (editingType.description || "") ||
      formIsActive !== (editingType.is_active === 1 || editingType.is_active === true)
    );
  }, [editingType, formTypeCode, formTypeName, formUnitName, formDescription, formIsActive]);

  const fetchLoadingTypes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/master/loading-types");
      if (res.data.success) setLoadingTypes(res.data.loadingTypes || []);
    } catch (err: any) {
      console.error("Error fetching loading types:", err);
      showError(err?.response?.data?.message || "ไม่สามารถดึงข้อมูลประเภทการโหลดสินค้าได้");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    fetchLoadingTypes();
  }, [fetchLoadingTypes]);

  const filteredTypes = useMemo(() => {
    const s = search.toLowerCase().trim();
    return loadingTypes.filter(
      (t) =>
        t.type_name.toLowerCase().includes(s) ||
        t.type_code.toLowerCase().includes(s) ||
        (t.unit_name || "").toLowerCase().includes(s) ||
        (t.description || "").toLowerCase().includes(s)
    );
  }, [loadingTypes, search]);

  const paginatedTypes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTypes.slice(start, start + itemsPerPage);
  }, [filteredTypes, currentPage, itemsPerPage]);

  const handleOpenAddType = () => {
    setEditingType(null);
    setFormTypeCode(`LOAD-${Date.now().toString().slice(-4)}`);
    setFormTypeName("");
    setFormUnitName("ลัง");
    setFormDescription("");
    setFormIsActive(true);
    setIsDrawerOpen(true);
  };

  const handleOpenEditType = (typeItem: LoadingTypeData) => {
    setEditingType(typeItem);
    setFormTypeCode(typeItem.type_code);
    setFormTypeName(typeItem.type_name);
    setFormUnitName(typeItem.unit_name || "ชิ้น");
    setFormDescription(typeItem.description || "");
    setFormIsActive(typeItem.is_active === 1 || typeItem.is_active === true);
    setIsDrawerOpen(true);
  };

  const handleSaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTypeName.trim()) {
      showError("กรุณากรอกชื่อประเภทการโหลด");
      return;
    }

    try {
      const payload = {
        type_code: formTypeCode.trim().toUpperCase(),
        type_name: formTypeName.trim(),
        unit_name: formUnitName.trim() || "ชิ้น",
        description: formDescription.trim(),
        is_active: formIsActive ? 1 : 0,
      };

      if (editingType) {
        await api.put(`/master/loading-types/${editingType.loading_type_id}`, payload);
        showSuccess("อัปเดตข้อมูลประเภทการโหลดสินค้าเรียบร้อยแล้ว!");
      } else {
        await api.post("/master/loading-types", payload);
        showSuccess("เพิ่มประเภทการโหลดสินค้าใหม่สำเร็จ!");
      }
      setIsDrawerOpen(false);
      fetchLoadingTypes();
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกประเภทการโหลด");
    }
  };

  const handleToggleActive = async (typeItem: LoadingTypeData) => {
    try {
      const newStatus = !(typeItem.is_active === 1 || typeItem.is_active === true);
      await api.put(`/master/loading-types/${typeItem.loading_type_id}`, {
        ...typeItem,
        is_active: newStatus ? 1 : 0,
      });
      showSuccess(`สลับสถานะ "${typeItem.type_name}" เป็น ${newStatus ? "เปิดใช้งาน" : "ปิดใช้งาน"} เรียบร้อย`);
      fetchLoadingTypes();
    } catch (err: any) {
      showError("ไม่สามารถสลับสถานะได้");
    }
  };

  const handleConfirmDeleteType = async () => {
    if (!typeToDelete) return;
    try {
      await api.delete(`/master/loading-types/${typeToDelete.loading_type_id}`);
      showSuccess(`ลบประเภทการโหลด "${typeToDelete.type_name}" เรียบร้อยแล้ว`);
      fetchLoadingTypes();
    } catch (err: any) {
      showError(err?.response?.data?.message || "ไม่สามารถลบประเภทการโหลดนี้ได้");
    } finally {
      setTypeToDelete(null);
    }
  };

  return (
    <div className="w-full space-y-4 font-sans text-xs pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            ประเภทการโหลดสินค้า
          </h1>
          <p className="text-[11px] text-slate-500">
            บริหารจัดการประเภทการโหลดสินค้า (ลัง, กระบะ, พาเลท ฯลฯ) พร้อมระบบเปิด-ปิดสถานะการใช้งาน
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLoadingTypes}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-1.5 rounded-lg font-medium flex items-center gap-1 shadow-2xs"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 text-slate-700 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleOpenAddType}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> <span>เพิ่มประเภทการโหลด</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation */}
      <MasterSubNav />

      {/* Search Bar */}
      <div className="tms-card p-3 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหารหัสประเภท, ชื่อประเภทการโหลด, หน่วยนับ..."
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
                <th className="py-1.5 px-3 text-center w-10">#</th>
                <th className="py-1.5 px-3">รหัสประเภท</th>
                <th className="py-1.5 px-3">ชื่อประเภทการโหลด</th>
                <th className="py-1.5 px-3">หน่วยนับ</th>
                <th className="py-1.5 px-3">คำอธิบาย</th>
                <th className="py-1.5 px-3 text-center">สถานะ</th>
                <th className="py-1.5 px-3 text-center">วันที่สร้าง</th>
                <th className="py-1.5 px-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
              {paginatedTypes.map((t, idx) => {
                const isActive = t.is_active === 1 || t.is_active === true;
                return (
                  <tr key={t.loading_type_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-1 px-3 text-center text-slate-400 font-medium text-[11px]">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="py-1 px-3">
                      <code className="bg-slate-100 border border-slate-200 text-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                        {t.type_code}
                      </code>
                    </td>
                    <td className="py-1 px-3 font-bold text-slate-900 flex items-center gap-1.5 text-[11px]">
                      <Tag className="w-3.5 h-3.5 text-slate-500" />
                      {t.type_name}
                    </td>
                    <td className="py-1 px-3 text-slate-700 font-medium text-[11px]">
                      <span className="bg-slate-100 border border-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                        {t.unit_name || "ชิ้น"}
                      </span>
                    </td>
                    <td className="py-1 px-3 text-slate-600 max-w-[250px] truncate text-[11px]" title={t.description || ""}>
                      {t.description || "-"}
                    </td>
                    <td className="py-1 px-3 text-center">
                      <button
                        onClick={() => handleToggleActive(t)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                        }`}
                        title="คลิกเพื่อสลับสถานะ"
                      >
                        {isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ใช้งานอยู่
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-slate-400" /> ปิดใช้งาน
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-1 px-3 text-center text-slate-500 font-mono text-[11px]">
                      {(t as any).created_at ? new Date((t as any).created_at).toLocaleDateString("th-TH") : "-"}
                    </td>
                    <td className="py-1 px-3 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEditType(t)}
                        className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        title="แก้ไข"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setTypeToDelete(t)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="ลบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredTypes.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    {loading ? "กำลังโหลดข้อมูล..." : "ยังไม่มีข้อมูลประเภทการโหลดสินค้า"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <PaginationControl
          currentPage={currentPage}
          totalItems={filteredTypes.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Drawer */}
      <AnimatedDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingType ? "แก้ไขข้อมูลประเภทการโหลด" : "เพิ่มประเภทการโหลดสินค้าใหม่"}
        formId="loading-type-form"
        onSubmit={handleSaveType}
        submitLabel={editingType ? "บันทึกการแก้ไข" : "บันทึกสร้างใหม่"}
        isDirty={isTypeDirty}
      >
        {renderField(
          "รหัสประเภท (Type Code) *",
          true,
          <input
            type="text"
            value={formTypeCode}
            onChange={(e) => setFormTypeCode(e.target.value.toUpperCase())}
            placeholder="เช่น CRATE, BASKET, PALLET"
            className={`${inputCls} font-mono uppercase`}
            required
          />
        )}
        {renderField(
          "ชื่อประเภทการโหลด *",
          true,
          <input
            type="text"
            value={formTypeName}
            onChange={(e) => setFormTypeName(e.target.value)}
            placeholder="เช่น ลัง, กระบะ, พาเลท"
            className={inputCls}
            required
          />
        )}
        {renderField(
          "หน่วยนับ",
          false,
          <input
            type="text"
            value={formUnitName}
            onChange={(e) => setFormUnitName(e.target.value)}
            placeholder="เช่น ลัง, ใบ, พาเลท, กล่อง"
            className={inputCls}
          />
        )}
        {renderField(
          "คำอธิบาย",
          false,
          <textarea
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="คำอธิบายเพิ่มเติมเกี่ยวกับลักษณะการโหลด..."
            rows={3}
            className={inputCls}
          />
        )}

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700">เปิดใช้งาน (Is Active)</label>
          <input
            type="checkbox"
            checked={formIsActive}
            onChange={(e) => setFormIsActive(e.target.checked)}
            className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-400"
          />
        </div>
      </AnimatedDrawer>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!typeToDelete}
        title="ยืนยันการลบประเภทการโหลด"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบประเภทการโหลด "${typeToDelete?.type_name}" (${typeToDelete?.type_code})?`}
        confirmText="ลบข้อมูล"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDeleteType}
        onCancel={() => setTypeToDelete(null)}
      />
    </div>
  );
};

export default LoadingTypesPage;
