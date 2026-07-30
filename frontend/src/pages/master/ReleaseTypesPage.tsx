import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { ConfirmModal } from "../../components/ConfirmModal";
import { PaginationControl } from "../../components/PaginationControl";
import { AnimatedDrawer } from "../../components/AnimatedDrawer";
import { MasterSubNav } from "../../components/MasterSubNav";
import {
  FileText,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  Package,
} from "lucide-react";

interface ReleaseTypeData {
  car_release_type_id: number;
  type: string;
  created_at?: string;
}

export const ReleaseTypesPage: React.FC = () => {
  const { showSuccess, showError } = useToast();

  const [releaseTypes, setReleaseTypes] = useState<ReleaseTypeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Pagination
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Drawer & Form
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingType, setEditingType] = useState<ReleaseTypeData | null>(null);
  const [formTypeName, setFormTypeName] = useState("");
  const [formQuantity, setFormQuantity] = useState<number>(0);

  // Delete Modal
  const [typeToDelete, setTypeToDelete] = useState<ReleaseTypeData | null>(
    null,
  );

  const inputCls =
    "w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400";

  const renderField = (
    label: string,
    required: boolean,
    inputEl: React.ReactNode,
  ) => (
    <div>
      <label className="block text-slate-700 font-semibold mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {inputEl}
    </div>
  );

  const isDirty = useMemo(() => {
    if (!editingType)
      return !!formTypeName;
    return (
      formTypeName !== editingType.type
    );
  }, [editingType, formTypeName]);

  const fetchReleaseTypes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/master/car-release-types");
      if (res.data.success) setReleaseTypes(res.data.releaseTypes || []);
    } catch (err) {
      console.error("Error fetching release types:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    fetchReleaseTypes();
  }, [fetchReleaseTypes]);

  const filteredTypes = useMemo(() => {
    const s = search.toLowerCase();
    return releaseTypes.filter((t) => t.type.toLowerCase().includes(s));
  }, [releaseTypes, search]);

  const paginatedTypes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTypes.slice(start, start + itemsPerPage);
  }, [filteredTypes, currentPage, itemsPerPage]);

  const handleOpenAdd = () => {
    setEditingType(null);
    setFormTypeName("");
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (t: ReleaseTypeData) => {
    setEditingType(t);
    setFormTypeName(t.type);
    setIsDrawerOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTypeName.trim()) {
      showError("กรุณากรอกชื่อประเภทการปล่อยรถ");
      return;
    }

    try {
      if (editingType) {
        await api.put(
          `/master/car-release-types/${editingType.car_release_type_id}`,
          { type: formTypeName },
        );
        showSuccess("อัปเดตประเภทการปล่อยรถเรียบร้อยแล้ว!");
      } else {
        await api.post("/master/car-release-types", {
          type: formTypeName,
        });
        showSuccess("เพิ่มประเภทการปล่อยรถใหม่สำเร็จ!");
      }
      setIsDrawerOpen(false);
      fetchReleaseTypes();
    } catch (err: any) {
      showError(
        err?.response?.data?.message ||
          "เกิดข้อผิดพลาดในการบันทึกประเภทการปล่อยรถ",
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!typeToDelete) return;
    try {
      await api.delete(
        `/master/car-release-types/${typeToDelete.car_release_type_id}`,
      );
      showSuccess(`ลบประเภทการปล่อยรถ "${typeToDelete.type}" เรียบร้อย`);
      fetchReleaseTypes();
    } catch (err: any) {
      showError(
        err?.response?.data?.message ||
          "ไม่สามารถลบประเภทการปล่อยรถนี้ได้",
      );
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
            <FileText className="w-5 h-5 text-slate-800" />
            จัดการประเภทการปล่อยรถ (Car Release Types)
          </h1>
          <p className="text-[11px] text-slate-500">
            บริหารจัดการประเภทการปล่อยรถ เช่น ปล่อยรถปกติ, ปล่อยรถพิเศษ,
            รับ-ส่งสินค้า
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchReleaseTypes}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-1.5 rounded-lg font-medium flex items-center gap-1 shadow-2xs"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw
              className={`w-4 h-4 text-slate-700 ${loading ? "animate-spin" : ""}`}
            />
          </button>
          <button
            onClick={handleOpenAdd}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />{" "}
            <span>เพิ่มประเภทปล่อยรถ</span>
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
            placeholder="ค้นหาประเภทการปล่อยรถ..."
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
                <th className="py-2.5 px-4 text-center w-16">ID</th>
                <th className="py-2.5 px-4">ชื่อประเภทการปล่อยรถ</th>
                <th className="py-2.5 px-4 text-center">สถานะ</th>
                <th className="py-2.5 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
              {paginatedTypes.map((t) => (
                <tr
                  key={t.car_release_type_id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-2 px-4 text-center text-slate-400 font-mono font-bold">
                    {t.car_release_type_id}
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="font-bold text-slate-900">
                        {t.type}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> ใช้งานอยู่
                    </span>
                  </td>
                  <td className="py-2 px-4 text-right space-x-1">
                    <button
                      onClick={() => handleOpenEdit(t)}
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
              ))}
              {filteredTypes.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-slate-400"
                  >
                    ยังไม่มีข้อมูลประเภทการปล่อยรถ
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

      {/* Release Type Drawer */}
      <AnimatedDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={
          editingType
            ? "แก้ไขประเภทการปล่อยรถ"
            : "เพิ่มประเภทการปล่อยรถใหม่"
        }
        formId="release-type-form"
        onSubmit={handleSave}
        submitLabel={
          editingType
            ? "บันทึกการแก้ไข"
            : "บันทึกสร้างประเภทปล่อยรถ"
        }
        isDirty={isDirty}
      >
        <div className="space-y-3">
          {renderField(
            "ชื่อประเภทการปล่อยรถ",
            true,
            <input
              type="text"
              value={formTypeName}
              onChange={(e) => setFormTypeName(e.target.value)}
              placeholder="เช่น ปล่อยรถปกติ (ประจำวัน), ปล่อยรถพิเศษ (งานด่วน)"
              className={inputCls}
              required
            />,
          )}
        </div>
      </AnimatedDrawer>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!typeToDelete}
        title="ยืนยันการลบประเภทการปล่อยรถ"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบประเภทการปล่อยรถ "${typeToDelete?.type}"? หากมีใบปล่อยรถที่ใช้ประเภทนี้อยู่จะไม่สามารถลบได้`}
        confirmText="ลบข้อมูล"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDelete}
        onCancel={() => setTypeToDelete(null)}
      />
    </div>
  );
};

export default ReleaseTypesPage;
