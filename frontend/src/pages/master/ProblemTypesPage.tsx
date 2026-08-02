import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { ConfirmModal } from "../../components/ConfirmModal";
import { PaginationControl } from "../../components/PaginationControl";
import { AnimatedDrawer } from "../../components/AnimatedDrawer";
import { MasterSubNav } from "../../components/MasterSubNav";
import {
  AlertTriangle,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface ProblemTypeData {
  problem_type_id: number;
  problem_type_name: string;
  description?: string;
  status: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
}

export const ProblemTypesPage: React.FC = () => {
  const { showSuccess, showError } = useToast();

  const [problemTypes, setProblemTypes] = useState<ProblemTypeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Pagination
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Drawer & Form
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingType, setEditingType] = useState<ProblemTypeData | null>(null);
  const [formTypeName, setFormTypeName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active");

  // Delete Modal
  const [typeToDelete, setTypeToDelete] = useState<ProblemTypeData | null>(null);

  const inputCls =
    "w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400";

  const renderField = (
    label: string,
    required: boolean,
    inputEl: React.ReactNode
  ) => (
    <div>
      <label className="block text-slate-700 font-semibold mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {inputEl}
    </div>
  );

  const isDirty = useMemo(() => {
    if (!editingType) return !!(formTypeName || formDescription);
    return (
      formTypeName !== editingType.problem_type_name ||
      formDescription !== (editingType.description || "") ||
      formStatus !== editingType.status
    );
  }, [editingType, formTypeName, formDescription, formStatus]);

  const fetchProblemTypes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/master/problem-types");
      if (res.data.success) setProblemTypes(res.data.problemTypes || []);
    } catch (err) {
      console.error("Error fetching problem types:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    fetchProblemTypes();
  }, [fetchProblemTypes]);

  const filteredTypes = useMemo(() => {
    const s = search.toLowerCase();
    return problemTypes.filter(
      (t) =>
        t.problem_type_name.toLowerCase().includes(s) ||
        (t.description && t.description.toLowerCase().includes(s)) ||
        String(t.problem_type_id).includes(s)
    );
  }, [problemTypes, search]);

  const paginatedTypes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTypes.slice(start, start + itemsPerPage);
  }, [filteredTypes, currentPage, itemsPerPage]);

  const handleOpenAdd = () => {
    setEditingType(null);
    setFormTypeName("");
    setFormDescription("");
    setFormStatus("active");
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (item: ProblemTypeData) => {
    setEditingType(item);
    setFormTypeName(item.problem_type_name);
    setFormDescription(item.description || "");
    setFormStatus(item.status);
    setIsDrawerOpen(true);
  };

  const handleToggleStatus = async (item: ProblemTypeData) => {
    const nextStatus = item.status === "active" ? "inactive" : "active";
    try {
      const res = await api.put(`/master/problem-types/${item.problem_type_id}`, {
        problem_type_name: item.problem_type_name,
        description: item.description,
        status: nextStatus,
      });
      if (res.data.success) {
        showSuccess(`ปรับสถานะ "${item.problem_type_name}" เป็น ${nextStatus === "active" ? "เปิดใช้งาน" : "ปิดใช้งาน"} เรียบร้อยแล้ว`);
        fetchProblemTypes();
      }
    } catch (err: any) {
      showError(err?.response?.data?.message || "ไม่สามารถเปลี่ยนสถานะได้");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTypeName.trim()) {
      showError("กรุณากรอกชื่อประเภทปัญหา");
      return;
    }

    try {
      const payload = {
        problem_type_name: formTypeName.trim(),
        description: formDescription.trim(),
        status: formStatus,
      };

      if (editingType) {
        await api.put(`/master/problem-types/${editingType.problem_type_id}`, payload);
        showSuccess("อัปเดตประเภทปัญหาสำเร็จ!");
      } else {
        await api.post("/master/problem-types", payload);
        showSuccess("สร้างประเภทปัญหาใหม่สำเร็จ!");
      }
      setIsDrawerOpen(false);
      fetchProblemTypes();
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  const handleConfirmDelete = async () => {
    if (!typeToDelete) return;
    try {
      await api.delete(`/master/problem-types/${typeToDelete.problem_type_id}`);
      showSuccess(`ลบ "${typeToDelete.problem_type_name}" เรียบร้อยแล้ว`);
      fetchProblemTypes();
    } catch (err: any) {
      showError(err?.response?.data?.message || "ไม่สามารถลบรายการนี้ได้");
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
            <AlertTriangle className="w-5 h-5 text-slate-800" />
            จัดการประเภทปัญหา (Problem Types Management)
          </h1>
          <p className="text-[11px] text-slate-500">
            บริหารจัดการหมวดหมู่และประเภทปัญหาในการส่งสินค้า สำหรับใช้งานในระบบบันทึกติดปัญหา
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchProblemTypes}
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
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มประเภทปัญหา</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <MasterSubNav />

      {/* Control Bar: Search */}
      <div className="tms-card p-3 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหารหัส ID, ชื่อประเภทปัญหา, คำอธิบาย..."
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
                <th className="py-1.5 px-3">ชื่อประเภทปัญหา</th>
                <th className="py-1.5 px-3">คำอธิบาย</th>
                <th className="py-1.5 px-3 text-center">สถานะการใช้งาน</th>
                <th className="py-1.5 px-3 text-center">วันที่สร้าง</th>
                <th className="py-1.5 px-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-500" />
                    <span>กำลังโหลดข้อมูล...</span>
                  </td>
                </tr>
              ) : paginatedTypes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    ไม่พบข้อมูลประเภทปัญหา
                  </td>
                </tr>
              ) : (
                paginatedTypes.map((item) => (
                  <tr
                    key={item.problem_type_id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-1 px-3 text-center font-mono font-bold text-slate-500">
                      {item.problem_type_id}
                    </td>
                    <td className="py-1 px-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{item.problem_type_name}</span>
                      </div>
                    </td>
                    <td className="py-1 px-3 text-slate-600">
                      {item.description || "-"}
                    </td>
                    <td className="py-1 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        title="คลิกเพื่อสลับสถานะ"
                        className="focus:outline-none"
                      >
                        {item.status === "active" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 transition-colors cursor-pointer">
                            <CheckCircle2 className="w-3 h-3" /> เปิดใช้งาน
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md border border-slate-200 transition-colors cursor-pointer">
                            <XCircle className="w-3 h-3" /> ปิดใช้งาน
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="py-1 px-3 text-center font-mono text-[11px] text-slate-500">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString("th-TH") : "-"}
                    </td>
                    <td className="py-1 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                          title="แก้ไข"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setTypeToDelete(item)}
                          className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded transition-colors"
                          title="ลบ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Control */}
        <PaginationControl
          currentPage={currentPage}
          totalItems={filteredTypes.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
          onItemsPerPageChange={(limit) => {
            setItemsPerPage(limit);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Drawer Component */}
      <AnimatedDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingType ? "แก้ไขประเภทปัญหา" : "เพิ่มประเภทปัญหาใหม่"}
        formId="problem-type-form"
        onSubmit={handleSave}
        submitLabel={editingType ? "บันทึกการแก้ไข" : "บันทึกข้อมูล"}
        isDirty={isDirty}
      >
        {renderField(
          "ชื่อประเภทปัญหา",
          true,
          <input
            type="text"
            placeholder="เช่น ร้านปิด, บิลผิด, ของไม่ครบ"
            value={formTypeName}
            onChange={(e) => setFormTypeName(e.target.value)}
            className={inputCls}
            required
          />
        )}

          {renderField(
            "คำอธิบาย / รายละเอียดเพิ่มเติม",
            false,
            <textarea
              rows={3}
              placeholder="ระบุคำอธิบายของปัญหานี้..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className={inputCls}
            />
          )}

          {renderField(
            "สถานะการใช้งาน",
            true,
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as any)}
              className={inputCls}
            >
              <option value="active">เปิดใช้งาน (Active)</option>
              <option value="inactive">ปิดใช้งาน (Inactive)</option>
            </select>
          )}
      </AnimatedDrawer>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!typeToDelete}
        title="ยืนยันการลบประเภทปัญหา"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบประเภทปัญหา "${typeToDelete?.problem_type_name}"?`}
        confirmText="ลบรายการ"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDelete}
        onCancel={() => setTypeToDelete(null)}
      />
    </div>
  );
};

export default ProblemTypesPage;
