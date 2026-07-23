import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { ConfirmModal } from "../../components/ConfirmModal";
import { PaginationControl } from "../../components/PaginationControl";
import { AnimatedDrawer } from "../../components/AnimatedDrawer";
import { MasterSubNav } from "../../components/MasterSubNav";
import {
  Smartphone,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
} from "lucide-react";

interface PdaDeviceData {
  pda_id: number;
  device_code: string;
  device_name: string;
  serial_number?: string;
  assigned_user?: string;
  status?: string;
}

interface UserSimple {
  user_id: number;
  name: string;
  username: string;
}

export const PdaDevicesPage: React.FC = () => {
  const { showSuccess, showError } = useToast();

  const [pdas, setPdas] = useState<PdaDeviceData[]>([]);
  const [usersList, setUsersList] = useState<UserSimple[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Pagination
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Drawer & Form
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPda, setEditingPda] = useState<PdaDeviceData | null>(null);
  const [formPdaCode, setFormPdaCode] = useState("");
  const [formPdaName, setFormPdaName] = useState("");
  const [formPdaSerial, setFormPdaSerial] = useState("");
  const [formPdaUser, setFormPdaUser] = useState("");

  // Delete Modal
  const [pdaToDelete, setPdaToDelete] = useState<PdaDeviceData | null>(null);

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

  const isPdaDirty = useMemo(() => {
    if (!editingPda) return !!(formPdaCode || formPdaName || formPdaSerial || formPdaUser);
    return (
      formPdaCode !== editingPda.device_code ||
      formPdaName !== editingPda.device_name ||
      formPdaSerial !== (editingPda.serial_number || "") ||
      formPdaUser !== (editingPda.assigned_user || "")
    );
  }, [editingPda, formPdaCode, formPdaName, formPdaSerial, formPdaUser]);

  const fetchPdas = useCallback(async () => {
    try {
      const res = await api.get("/master/pda");
      if (res.data.success) setPdas(res.data.pdas || []);
    } catch (err) {
      console.error("Error fetching pdas:", err);
    }
  }, []);

  const fetchUsersList = useCallback(async () => {
    try {
      const res = await api.get("/users");
      if (res.data.success) setUsersList(res.data.users || []);
    } catch (err) {
      console.error("Error fetching users list:", err);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchPdas(), fetchUsersList()]);
    setLoading(false);
  }, [fetchPdas, fetchUsersList]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filteredPdas = useMemo(() => {
    const s = search.toLowerCase();
    return pdas.filter(
      (p) =>
        p.device_name.toLowerCase().includes(s) ||
        p.device_code.toLowerCase().includes(s) ||
        (p.assigned_user || "").toLowerCase().includes(s)
    );
  }, [pdas, search]);

  const paginatedPdas = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPdas.slice(start, start + itemsPerPage);
  }, [filteredPdas, currentPage, itemsPerPage]);

  const handleOpenAddPda = () => {
    setEditingPda(null);
    setFormPdaCode(`PDA-${Date.now().toString().slice(-4)}`);
    setFormPdaName("");
    setFormPdaSerial("");
    setFormPdaUser("");
    setIsDrawerOpen(true);
  };

  const handleOpenEditPda = (pda: PdaDeviceData) => {
    setEditingPda(pda);
    setFormPdaCode(pda.device_code);
    setFormPdaName(pda.device_name);
    setFormPdaSerial(pda.serial_number || "");
    setFormPdaUser(pda.assigned_user || "");
    setIsDrawerOpen(true);
  };

  const handleSavePda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPdaCode || !formPdaName) {
      showError("กรุณากรอกรหัสเครื่องและชื่ออุปกรณ์");
      return;
    }

    try {
      const payload = {
        device_code: formPdaCode,
        device_name: formPdaName,
        serial_number: formPdaSerial,
        assigned_user: formPdaUser,
      };

      if (editingPda) {
        await api.put(`/master/pda/${editingPda.pda_id}`, payload);
        showSuccess("อัปเดตข้อมูลเครื่อง PDA เรียบร้อยแล้ว!");
      } else {
        await api.post("/master/pda", payload);
        showSuccess("เพิ่มเครื่อง PDA ใหม่สำเร็จ!");
      }
      setIsDrawerOpen(false);
      fetchPdas();
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึก PDA");
    }
  };

  const handleConfirmDeletePda = async () => {
    if (!pdaToDelete) return;
    try {
      await api.delete(`/master/pda/${pdaToDelete.pda_id}`);
      showSuccess(`ลบเครื่อง PDA "${pdaToDelete.device_name}" เรียบร้อยแล้ว`);
      fetchPdas();
    } catch (err: any) {
      showError(err?.response?.data?.message || "ไม่สามารถลบเครื่อง PDA นี้ได้");
    } finally {
      setPdaToDelete(null);
    }
  };

  return (
    <div className="w-full space-y-4 font-sans text-xs pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-slate-800" />
            จัดการเครื่อง PDA (PDA Device Management)
          </h1>
          <p className="text-[11px] text-slate-500">
            บริหารจัดการรหัสเครื่อง PDA, Serial Number และกำหนดผู้ดูแลอุปกรณ์
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-1.5 rounded-lg font-medium flex items-center gap-1 shadow-2xs"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 text-slate-700 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleOpenAddPda}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> <span>เพิ่มเครื่อง PDA</span>
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
            placeholder="ค้นหารหัสเครื่อง, ชื่ออุปกรณ์, ผู้ดูแล..."
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
                <th className="py-2.5 px-4 text-center w-10">#</th>
                <th className="py-2.5 px-4">รหัสเครื่อง PDA</th>
                <th className="py-2.5 px-4">ชื่ออุปกรณ์</th>
                <th className="py-2.5 px-4">Serial Number</th>
                <th className="py-2.5 px-4">ผู้ดูแล</th>
                <th className="py-2.5 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
              {paginatedPdas.map((p, idx) => (
                <tr key={p.pda_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 text-center text-slate-400 font-medium">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td className="py-2.5 px-4">
                    <code className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono font-bold">{p.device_code}</code>
                  </td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">{p.device_name}</td>
                  <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px]">{p.serial_number || "-"}</td>
                  <td className="py-2.5 px-4 text-slate-700 font-medium">{p.assigned_user || "ยังไม่ระบุผู้ดูแล"}</td>
                  <td className="py-2.5 px-4 text-right space-x-1">
                    <button onClick={() => handleOpenEditPda(p)} className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100" title="แก้ไข">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setPdaToDelete(p)} className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50" title="ลบ">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPdas.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400">ยังไม่มีข้อมูลเครื่อง PDA</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <PaginationControl
          currentPage={currentPage}
          totalItems={filteredPdas.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* PDA Drawer */}
      <AnimatedDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingPda ? "แก้ไขข้อมูลเครื่อง PDA" : "เพิ่มเครื่อง PDA ใหม่"}
        formId="pda-form"
        onSubmit={handleSavePda}
        submitLabel={editingPda ? "บันทึกการแก้ไข" : "บันทึกสร้าง PDA"}
        isDirty={isPdaDirty}
      >
        {renderField("รหัสเครื่อง (Device Code) *", true,
          <input type="text" value={formPdaCode} onChange={(e) => setFormPdaCode(e.target.value)} placeholder="เช่น PDA-001" className={`${inputCls} font-mono`} required />
        )}
        {renderField("ชื่ออุปกรณ์ *", true,
          <input type="text" value={formPdaName} onChange={(e) => setFormPdaName(e.target.value)} placeholder="เช่น Honeywell EDA51" className={inputCls} required />
        )}
        {renderField("Serial Number", false,
          <input type="text" value={formPdaSerial} onChange={(e) => setFormPdaSerial(e.target.value)} placeholder="เช่น SN-987654321" className={`${inputCls} font-mono`} />
        )}
        {renderField("ผู้ดูแล (เลือกจากผู้ใช้ในระบบ)", false,
          <select value={formPdaUser} onChange={(e) => setFormPdaUser(e.target.value)} className={inputCls}>
            <option value="">-- ยังไม่ระบุผู้ดูแล --</option>
            {usersList.map((u) => (
              <option key={u.user_id} value={u.name}>
                {u.name} ({u.username})
              </option>
            ))}
          </select>
        )}
      </AnimatedDrawer>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!pdaToDelete}
        title="ยืนยันการลบเครื่อง PDA"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบเครื่อง PDA "${pdaToDelete?.device_name}" (${pdaToDelete?.device_code})?`}
        confirmText="ลบข้อมูล"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDeletePda}
        onCancel={() => setPdaToDelete(null)}
      />
    </div>
  );
};

export default PdaDevicesPage;
