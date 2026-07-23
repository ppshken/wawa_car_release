import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { ConfirmModal } from "../../components/ConfirmModal";
import { PaginationControl } from "../../components/PaginationControl";
import { AnimatedDrawer } from "../../components/AnimatedDrawer";
import { MasterSubNav } from "../../components/MasterSubNav";
import {
  Key,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
} from "lucide-react";

interface KeyHolderData {
  key_holder_id: number;
  key_holder_name: string;
}

export const KeyHoldersPage: React.FC = () => {
  const { showSuccess, showError } = useToast();

  const [keys, setKeys] = useState<KeyHolderData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Pagination
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Drawer & Form
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<KeyHolderData | null>(null);
  const [formKeyHolderName, setFormKeyHolderName] = useState("");

  // Delete Modal
  const [keyToDelete, setKeyToDelete] = useState<KeyHolderData | null>(null);

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

  const isKeyDirty = useMemo(() => {
    if (!editingKey) return !!formKeyHolderName;
    return formKeyHolderName !== editingKey.key_holder_name;
  }, [editingKey, formKeyHolderName]);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/master/keys");
      if (res.data.success) setKeys(res.data.keys || []);
    } catch (err) {
      console.error("Error fetching keys:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const filteredKeys = useMemo(() => {
    const s = search.toLowerCase();
    return keys.filter((k) => k.key_holder_name.toLowerCase().includes(s));
  }, [keys, search]);

  const paginatedKeys = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredKeys.slice(start, start + itemsPerPage);
  }, [filteredKeys, currentPage, itemsPerPage]);

  const handleOpenAddKey = () => {
    setEditingKey(null);
    setFormKeyHolderName("");
    setIsDrawerOpen(true);
  };

  const handleOpenEditKey = (keyHolder: KeyHolderData) => {
    setEditingKey(keyHolder);
    setFormKeyHolderName(keyHolder.key_holder_name);
    setIsDrawerOpen(true);
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKeyHolderName) {
      showError("กรุณากรอกชื่อผู้รับฝากกุญแจ");
      return;
    }

    try {
      if (editingKey) {
        await api.put(`/master/keys/${editingKey.key_holder_id}`, {
          key_holder_name: formKeyHolderName,
        });
        showSuccess("อัปเดตจุดฝากกุญแจเรียบร้อยแล้ว!");
      } else {
        await api.post("/master/keys", { key_holder_name: formKeyHolderName });
        showSuccess("เพิ่มจุดฝากกุญแจใหม่สำเร็จ!");
      }
      setIsDrawerOpen(false);
      fetchKeys();
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกกุญแจ");
    }
  };

  const handleConfirmDeleteKey = async () => {
    if (!keyToDelete) return;
    try {
      await api.delete(`/master/keys/${keyToDelete.key_holder_id}`);
      showSuccess(`ลบจุดฝากกุญแจ "${keyToDelete.key_holder_name}" เรียบร้อย`);
      fetchKeys();
    } catch (err: any) {
      showError(err?.response?.data?.message || "ไม่สามารถลบจุดฝากกุญแจนี้ได้");
    } finally {
      setKeyToDelete(null);
    }
  };

  return (
    <div className="w-full space-y-4 font-sans text-xs pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Key className="w-5 h-5 text-slate-800" />
            จัดการข้อมูลที่ฝากกุญแจ (Key Holder Management)
          </h1>
          <p className="text-[11px] text-slate-500">
            บริหารจัดการจุดฝากกุญแจและผู้รับรับฝากกุญแจสำหรับรถขนส่ง
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchKeys}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-1.5 rounded-lg font-medium flex items-center gap-1 shadow-2xs"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 text-slate-700 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleOpenAddKey}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> <span>เพิ่มจุดฝากกุญแจ</span>
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
            placeholder="ค้นหาชื่อจุด / ผู้รับฝากกุญแจ..."
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
                <th className="py-2.5 px-4">ชื่อจุด / ผู้รับฝากกุญแจ</th>
                <th className="py-2.5 px-4 text-center">สถานะ</th>
                <th className="py-2.5 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
              {paginatedKeys.map((k) => (
                <tr key={k.key_holder_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 text-center text-slate-400 font-mono font-bold">{k.key_holder_id}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">{k.key_holder_name}</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> ใช้งานอยู่
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right space-x-1">
                    <button onClick={() => handleOpenEditKey(k)} className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100" title="แก้ไข">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setKeyToDelete(k)} className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50" title="ลบ">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredKeys.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-slate-400">ยังไม่มีข้อมูลจุดฝากกุญแจ</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <PaginationControl
          currentPage={currentPage}
          totalItems={filteredKeys.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Key Drawer */}
      <AnimatedDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingKey ? "แก้ไขข้อมูลจุดฝากกุญแจ" : "เพิ่มจุดฝากกุญแจใหม่"}
        formId="key-form"
        onSubmit={handleSaveKey}
        submitLabel={editingKey ? "บันทึกการแก้ไข" : "บันทึกสร้างจุดฝาก"}
        isDirty={isKeyDirty}
      >
        {renderField("ชื่อจุด / ผู้รับฝากกุญแจ *", true,
          <input type="text" value={formKeyHolderName} onChange={(e) => setFormKeyHolderName(e.target.value)} placeholder="เช่น ป้อม รปภ. ประตู 1 (คุณสมชาย)" className={inputCls} required />
        )}
      </AnimatedDrawer>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!keyToDelete}
        title="ยืนยันการลบจุดฝากกุญแจ"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบจุดฝากกุญแจ "${keyToDelete?.key_holder_name}"?`}
        confirmText="ลบข้อมูล"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDeleteKey}
        onCancel={() => setKeyToDelete(null)}
      />
    </div>
  );
};

export default KeyHoldersPage;
