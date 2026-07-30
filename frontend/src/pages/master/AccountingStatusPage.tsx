import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { ConfirmModal } from "../../components/ConfirmModal";
import { PaginationControl } from "../../components/PaginationControl";
import { AnimatedDrawer } from "../../components/AnimatedDrawer";
import { MasterSubNav } from "../../components/MasterSubNav";
import {
  ShieldCheck,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
} from "lucide-react";

interface AccountingStatusData {
  status_id: number;
  status_code: string;
  status_name: string;
  description?: string;
  status?: string;
}

export const AccountingStatusPage: React.FC = () => {
  const { showSuccess, showError } = useToast();

  const [accStatuses, setAccStatuses] = useState<AccountingStatusData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Pagination
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Drawer & Form
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingAccStatus, setEditingAccStatus] = useState<AccountingStatusData | null>(null);
  const [formAccStatusCode, setFormAccStatusCode] = useState("");
  const [formAccStatusName, setFormAccStatusName] = useState("");
  const [formAccStatusDesc, setFormAccStatusDesc] = useState("");

  // Delete Modal
  const [accStatusToDelete, setAccStatusToDelete] = useState<AccountingStatusData | null>(null);

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

  const isAccStatusDirty = useMemo(() => {
    if (!editingAccStatus) return !!(formAccStatusCode || formAccStatusName || formAccStatusDesc);
    return (
      formAccStatusCode !== editingAccStatus.status_code ||
      formAccStatusName !== editingAccStatus.status_name ||
      formAccStatusDesc !== (editingAccStatus.description || "")
    );
  }, [editingAccStatus, formAccStatusCode, formAccStatusName, formAccStatusDesc]);

  const fetchAccStatuses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/master/accounting-status");
      if (res.data.success) setAccStatuses(res.data.statuses || res.data.accounting_statuses || []);
    } catch (err) {
      console.error("Error fetching accounting statuses:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    fetchAccStatuses();
  }, [fetchAccStatuses]);

  const filteredAccStatuses = useMemo(() => {
    const s = search.toLowerCase();
    return accStatuses.filter(
      (acc) =>
        acc.status_name.toLowerCase().includes(s) ||
        acc.status_code.toLowerCase().includes(s)
    );
  }, [accStatuses, search]);

  const paginatedAccStatuses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAccStatuses.slice(start, start + itemsPerPage);
  }, [filteredAccStatuses, currentPage, itemsPerPage]);

  const handleOpenAddAccStatus = () => {
    setEditingAccStatus(null);
    setFormAccStatusCode(`ACC-${Date.now().toString().slice(-4)}`);
    setFormAccStatusName("");
    setFormAccStatusDesc("");
    setIsDrawerOpen(true);
  };

  const handleOpenEditAccStatus = (acc: AccountingStatusData) => {
    setEditingAccStatus(acc);
    setFormAccStatusCode(acc.status_code);
    setFormAccStatusName(acc.status_name);
    setFormAccStatusDesc(acc.description || "");
    setIsDrawerOpen(true);
  };

  const handleSaveAccStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAccStatusCode || !formAccStatusName) {
      showError("กรุณากรอกรหัสสถานะและชื่อสถานะทางบัญชี");
      return;
    }

    try {
      const payload = {
        status_code: formAccStatusCode,
        status_name: formAccStatusName,
        description: formAccStatusDesc,
      };

      if (editingAccStatus) {
        await api.put(`/master/accounting-status/${editingAccStatus.status_id}`, payload);
        showSuccess("อัปเดตสถานะทางบัญชีเรียบร้อยแล้ว!");
      } else {
        await api.post("/master/accounting-status", payload);
        showSuccess("เพิ่มสถานะทางบัญชีใหม่สำเร็จ!");
      }
      setIsDrawerOpen(false);
      fetchAccStatuses();
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกสถานะทางบัญชี");
    }
  };

  const handleConfirmDeleteAccStatus = async () => {
    if (!accStatusToDelete) return;
    try {
      await api.delete(`/master/accounting-status/${accStatusToDelete.status_id}`);
      showSuccess(`ลบสถานะทางบัญชี "${accStatusToDelete.status_name}" เรียบร้อยแล้ว`);
      fetchAccStatuses();
    } catch (err: any) {
      showError(err?.response?.data?.message || "ไม่สามารถลบสถานะทางบัญชีนี้ได้");
    } finally {
      setAccStatusToDelete(null);
    }
  };

  return (
    <div className="w-full space-y-4 font-sans text-xs pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-slate-800" />
            จัดการสถานะทางบัญชี (Accounting Status Management)
          </h1>
          <p className="text-[11px] text-slate-500">
            บริหารจัดการสถานะทางบัญชีสำหรับติดตามบิล ใบแจ้งหนี้ และการตรวจสอบการชำระเงิน
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAccStatuses}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-1.5 rounded-lg font-medium flex items-center gap-1 shadow-2xs"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 text-slate-700 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleOpenAddAccStatus}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> <span>เพิ่มสถานะทางบัญชี</span>
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
            placeholder="ค้นหารหัสสถานะ, ชื่อสถานะทางบัญชี..."
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
                <th className="py-2.5 px-4">รหัสสถานะ</th>
                <th className="py-2.5 px-4">ชื่อสถานะทางบัญชี</th>
                <th className="py-2.5 px-4">คำอธิบาย</th>
                <th className="py-2.5 px-4 text-center">สถานะ</th>
                <th className="py-2.5 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
              {paginatedAccStatuses.map((acc) => (
                <tr key={acc.status_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-4 text-center text-slate-400 font-mono font-bold">{acc.status_id}</td>
                  <td className="py-2 px-4">
                    <code className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono font-bold">{acc.status_code}</code>
                  </td>
                  <td className="py-2 px-4 font-bold text-slate-900">{acc.status_name}</td>
                  <td className="py-2 px-4 text-slate-600 max-w-[280px] truncate">{acc.description || "-"}</td>
                  <td className="py-2 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> ใช้งานอยู่
                    </span>
                  </td>
                  <td className="py-2 px-4 text-right space-x-1">
                    <button onClick={() => handleOpenEditAccStatus(acc)} className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100" title="แก้ไข">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setAccStatusToDelete(acc)} className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50" title="ลบ">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredAccStatuses.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400">ยังไม่มีข้อมูลสถานะทางบัญชี</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <PaginationControl
          currentPage={currentPage}
          totalItems={filteredAccStatuses.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Accounting Status Drawer */}
      <AnimatedDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingAccStatus ? "แก้ไขสถานะทางบัญชี" : "เพิ่มสถานะทางบัญชีใหม่"}
        formId="acc-status-form"
        onSubmit={handleSaveAccStatus}
        submitLabel={editingAccStatus ? "บันทึกการแก้ไข" : "บันทึกสร้างสถานะ"}
        isDirty={isAccStatusDirty}
      >
        {renderField("รหัสสถานะ (Status Code) *", true,
          <input type="text" value={formAccStatusCode} onChange={(e) => setFormAccStatusCode(e.target.value)} placeholder="เช่น ACC-001" className={`${inputCls} font-mono`} required />
        )}
        {renderField("ชื่อสถานะทางบัญชี *", true,
          <input type="text" value={formAccStatusName} onChange={(e) => setFormAccStatusName(e.target.value)} placeholder="เช่น ตั้งบิลแล้ว, รอตรวจสอบ" className={inputCls} required />
        )}
        {renderField("คำอธิบายเพิ่มเติม", false,
          <textarea value={formAccStatusDesc} onChange={(e) => setFormAccStatusDesc(e.target.value)} placeholder="รายละเอียดเกี่ยวกับสถานะนี้..." rows={3} className={`${inputCls} resize-none`} />
        )}
      </AnimatedDrawer>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!accStatusToDelete}
        title="ยืนยันการลบสถานะทางบัญชี"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบสถานะทางบัญชี "${accStatusToDelete?.status_name}" (${accStatusToDelete?.status_code})?`}
        confirmText="ลบข้อมูล"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDeleteAccStatus}
        onCancel={() => setAccStatusToDelete(null)}
      />
    </div>
  );
};

export default AccountingStatusPage;
