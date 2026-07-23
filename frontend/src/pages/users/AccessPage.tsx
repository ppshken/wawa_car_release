import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { ConfirmModal } from "../../components/ConfirmModal";
import { AnimatedDrawer } from "../../components/AnimatedDrawer";
import { UsersSubNav } from "../../components/UsersSubNav";
import {
  Shield,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
} from "lucide-react";

interface AccessData {
  access_id: number;
  access_name: string;
  description?: string;
}

export const AccessPage: React.FC = () => {
  const { showSuccess, showError } = useToast();

  const [accesses, setAccesses] = useState<AccessData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Drawer & Form State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingAccess, setEditingAccess] = useState<AccessData | null>(null);
  const [formAccessName, setFormAccessName] = useState("");
  const [formAccessDesc, setFormAccessDesc] = useState("");

  // Delete Modal State
  const [accessToDelete, setAccessToDelete] = useState<AccessData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const inputCls =
    "w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400";

  const isAccessDirty = useMemo(() => {
    if (!editingAccess) {
      return !!(formAccessName || formAccessDesc);
    }
    return (
      formAccessName !== editingAccess.access_name ||
      formAccessDesc !== (editingAccess.description || "")
    );
  }, [editingAccess, formAccessName, formAccessDesc]);

  const fetchAccesses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/manage/access");
      if (res.data.success && res.data.accesses) setAccesses(res.data.accesses);
    } catch (err) {
      console.error("Error fetching accesses:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccesses();
  }, [fetchAccesses]);

  const handleOpenAddAccess = () => {
    setEditingAccess(null);
    setFormAccessName("");
    setFormAccessDesc("");
    setIsDrawerOpen(true);
  };

  const handleOpenEditAccess = (acc: AccessData) => {
    setEditingAccess(acc);
    setFormAccessName(acc.access_name);
    setFormAccessDesc(acc.description || "");
    setIsDrawerOpen(true);
  };

  const handleSaveAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAccessName) {
      showError("กรุณากรอกชื่อกลุ่มสิทธิ์");
      return;
    }
    try {
      if (editingAccess) {
        await api.put(`/manage/access/${editingAccess.access_id}`, {
          access_name: formAccessName,
          description: formAccessDesc,
        });
        showSuccess("อัปเดตกลุ่มสิทธิ์สำเร็จ!");
      } else {
        await api.post("/manage/access", {
          access_name: formAccessName,
          description: formAccessDesc,
        });
        showSuccess("สร้างกลุ่มสิทธิ์ใหม่สำเร็จ!");
      }
      setIsDrawerOpen(false);
      fetchAccesses();
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกกลุ่มสิทธิ์");
    }
  };

  const handleConfirmDeleteAccess = async () => {
    if (!accessToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/manage/access/${accessToDelete.access_id}`);
      showSuccess(`ลบกลุ่มสิทธิ์ "${accessToDelete.access_name}" เรียบร้อย`);
      fetchAccesses();
    } catch (err: any) {
      showError(err?.response?.data?.message || "ไม่สามารถลบกลุ่มสิทธิ์นี้ได้");
    } finally {
      setIsDeleting(false);
      setAccessToDelete(null);
    }
  };

  return (
    <div className="w-full space-y-4 font-sans text-xs pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-800" />
            จัดการกลุ่มสิทธิ์การเข้าถึง (Access Control Groups)
          </h1>
          <p className="text-[11px] text-slate-500">
            บริหารจัดการกลุ่มขอบเขตสิทธิ์การเข้าถึงเมนูและฟังก์ชันการทำงานในระบบ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAccesses}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-1.5 rounded-lg font-medium flex items-center gap-1 shadow-2xs"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 text-slate-700 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleOpenAddAccess}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> <span>เพิ่มกลุ่มสิทธิ์ใหม่</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation */}
      <UsersSubNav />

      {/* Access Table Card */}
      <div className="tms-card overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                <th className="py-2.5 px-4 text-center w-16">ID</th>
                <th className="py-2.5 px-4">ชื่อกลุ่มสิทธิ์ระบบ (Access Name)</th>
                <th className="py-2.5 px-4">คำอธิบายขอบเขตการใช้งาน</th>
                <th className="py-2.5 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
              {accesses.map((acc) => (
                <tr key={acc.access_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 text-center text-slate-400 font-mono font-bold">
                    {acc.access_id}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">{acc.access_name}</td>
                  <td className="py-2.5 px-4 text-slate-600 max-w-[300px] truncate">
                    {acc.description || "-"}
                  </td>
                  <td className="py-2.5 px-4 text-right space-x-1">
                    <button
                      onClick={() => handleOpenEditAccess(acc)}
                      className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      title="แก้ไข"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {acc.access_id === 1 ? (
                      <button disabled className="p-1 rounded-md text-slate-300 cursor-not-allowed opacity-50">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setAccessToDelete(acc)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="ลบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {accesses.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    ยังไม่มีข้อมูลกลุ่มสิทธิ์
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Access Drawer */}
      <AnimatedDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingAccess ? "แก้ไขกลุ่มสิทธิ์" : "เพิ่มกลุ่มสิทธิ์ใหม่"}
        formId="access-form"
        onSubmit={handleSaveAccess}
        submitLabel={editingAccess ? "บันทึกการแก้ไข" : "บันทึกสร้างกลุ่มสิทธิ์"}
        isDirty={isAccessDirty}
      >
        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            ชื่อกลุ่มสิทธิ์ <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formAccessName}
            onChange={(e) => setFormAccessName(e.target.value)}
            placeholder="เช่น Admin, Warehouse, User General"
            className={inputCls}
            required
          />
        </div>
        <div>
          <label className="block text-slate-700 font-semibold mb-1">คำอธิบาย</label>
          <textarea
            value={formAccessDesc}
            onChange={(e) => setFormAccessDesc(e.target.value)}
            placeholder="รายละเอียดเกี่ยวกับกลุ่มสิทธิ์นี้..."
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </div>
      </AnimatedDrawer>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!accessToDelete}
        title="ยืนยันการลบกลุ่มสิทธิ์"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบกลุ่มสิทธิ์ "${accessToDelete?.access_name}"?`}
        confirmText={isDeleting ? "กำลังลบ..." : "ลบกลุ่มสิทธิ์"}
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDeleteAccess}
        onCancel={() => setAccessToDelete(null)}
      />
    </div>
  );
};

export default AccessPage;
