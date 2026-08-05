import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { ConfirmModal } from "../../components/ConfirmModal";
import { AnimatedDrawer } from "../../components/AnimatedDrawer";
import { SearchableSelect } from "../../components/SearchableSelect";
import { UsersSubNav } from "../../components/UsersSubNav";
import {
  Layers,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Shield,
} from "lucide-react";

interface LevelUserData {
  level_user_id: number;
  level_user_name: string;
  access_id?: number;
  access_name?: string;
  setting_car_release?: number;
}

interface AccessData {
  access_id: number;
  access_name: string;
  description?: string;
}

export const UserLevelsPage: React.FC = () => {
  const { showSuccess, showError } = useToast();

  const [levels, setLevels] = useState<LevelUserData[]>([]);
  const [accesses, setAccesses] = useState<AccessData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Drawer & Form State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<LevelUserData | null>(null);
  const [formLevelName, setFormLevelName] = useState("");
  const [formLevelAccessId, setFormLevelAccessId] = useState<number | "">(1);
  const [formLevelCarRelease, setFormLevelCarRelease] = useState(false);

  // Delete Modal State
  const [levelToDelete, setLevelToDelete] = useState<LevelUserData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const inputCls =
    "w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400";

  const isLevelDirty = useMemo(() => {
    if (!editingLevel) {
      return !!formLevelName || formLevelCarRelease;
    }
    return (
      formLevelName !== editingLevel.level_user_name ||
      formLevelAccessId !== (editingLevel.access_id || "") ||
      formLevelCarRelease !== (editingLevel.setting_car_release === 1)
    );
  }, [editingLevel, formLevelName, formLevelAccessId, formLevelCarRelease]);

  const fetchLevels = useCallback(async () => {
    try {
      const res = await api.get("/level-users");
      if (res.data.success && res.data.levelUsers) setLevels(res.data.levelUsers);
    } catch (err) {
      console.error("Error fetching levels:", err);
    }
  }, []);

  const fetchAccesses = useCallback(async () => {
    try {
      const res = await api.get("/manage/access");
      if (res.data.success && res.data.accesses) setAccesses(res.data.accesses);
    } catch (err) {
      console.error("Error fetching accesses:", err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchLevels(), fetchAccesses()]);
    setLoading(false);
  }, [fetchLevels, fetchAccesses]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const handleOpenAddLevel = () => {
    setEditingLevel(null);
    setFormLevelName("");
    setFormLevelAccessId(accesses.length > 0 ? accesses[0].access_id : 1);
    setFormLevelCarRelease(false);
    setIsDrawerOpen(true);
  };

  const handleOpenEditLevel = (lvl: LevelUserData) => {
    setEditingLevel(lvl);
    setFormLevelName(lvl.level_user_name);
    setFormLevelAccessId(lvl.access_id || (accesses.length > 0 ? accesses[0].access_id : 1));
    setFormLevelCarRelease(lvl.setting_car_release === 1);
    setIsDrawerOpen(true);
  };

  const handleSaveLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLevelName) {
      showError("กรุณากรอกชื่อระดับผู้ใช้งาน");
      return;
    }
    try {
      if (editingLevel) {
        await api.put(`/level-users/${editingLevel.level_user_id}`, {
          level_user_name: formLevelName,
          access_id: formLevelAccessId || null,
          setting_car_release: formLevelCarRelease ? 1 : 0,
        });
        showSuccess("อัปเดตระดับผู้ใช้งานสำเร็จ!");
      } else {
        await api.post("/level-users", {
          level_user_name: formLevelName,
          access_id: formLevelAccessId || null,
          setting_car_release: formLevelCarRelease ? 1 : 0,
        });
        showSuccess("สร้างระดับผู้ใช้งานใหม่สำเร็จ!");
      }
      setIsDrawerOpen(false);
      fetchLevels();
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกระดับผู้ใช้");
    }
  };

  const handleConfirmDeleteLevel = async () => {
    if (!levelToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/level-users/${levelToDelete.level_user_id}`);
      showSuccess(`ลบระดับผู้ใช้งาน "${levelToDelete.level_user_name}" เรียบร้อย`);
      fetchLevels();
    } catch (err: any) {
      showError(err?.response?.data?.message || "ไม่สามารถลบระดับผู้ใช้งานนี้ได้");
    } finally {
      setIsDeleting(false);
      setLevelToDelete(null);
    }
  };

  return (
    <div className="w-full space-y-4 font-sans text-xs pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            จัดการระดับผู้ใช้งาน
          </h1>
          <p className="text-[11px] text-slate-500">
            กำหนดระดับบทบาทผู้ใช้งานในระบบ เชื่อมโยงกลุ่มสิทธิ์และสิทธิ์การออกใบปล่อยรถ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshAll}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-1.5 rounded-lg font-medium flex items-center gap-1 shadow-2xs"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 text-slate-700 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleOpenAddLevel}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> <span>เพิ่มระดับใหม่</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation */}
      <UsersSubNav />

      {/* Table Card */}
      <div className="tms-card overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                <th className="py-2.5 px-4 text-center w-16">ID</th>
                <th className="py-2.5 px-4">ชื่อระดับผู้ใช้งาน</th>
                <th className="py-2.5 px-4">กลุ่มสิทธิ์ระบบ (Access Role)</th>
                <th className="py-2.5 px-4 text-center">สิทธิ์ออกใบปล่อยรถ</th>
                <th className="py-2.5 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
              {levels.map((lvl) => (
                <tr key={lvl.level_user_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 text-center text-slate-400 font-mono font-bold">
                    {lvl.level_user_id}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">{lvl.level_user_name}</td>
                  <td className="py-2.5 px-4">
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                      <Shield className="w-3.5 h-3.5 text-blue-600" />
                      {lvl.access_name || "Custom Permissions"}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {lvl.setting_car_release === 1 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> อนุญาต
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                        <XCircle className="w-3 h-3 text-slate-400" /> ไม่อนุญาต
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right space-x-1">
                    <button
                      onClick={() => handleOpenEditLevel(lvl)}
                      className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      title="แก้ไข"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {lvl.level_user_id === 1 ? (
                      <button disabled className="p-1 rounded-md text-slate-300 cursor-not-allowed opacity-50">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setLevelToDelete(lvl)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="ลบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {levels.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    ยังไม่มีข้อมูลระดับผู้ใช้งาน
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Level Drawer */}
      <AnimatedDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingLevel ? "แก้ไขระดับผู้ใช้งาน" : "เพิ่มระดับผู้ใช้งานใหม่"}
        formId="level-form"
        onSubmit={handleSaveLevel}
        submitLabel={editingLevel ? "บันทึกการแก้ไข" : "บันทึกสร้างระดับ"}
        isDirty={isLevelDirty}
      >
        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            ชื่อระดับผู้ใช้งาน <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formLevelName}
            onChange={(e) => setFormLevelName(e.target.value)}
            placeholder="เช่น เจ้าหน้าที่ตรวจสอบคลังสินค้า"
            className={inputCls}
            required
          />
        </div>
        <SearchableSelect
          label="กลุ่มสิทธิ์ระบบ (Access Role)"
          value={formLevelAccessId}
          onChange={(val) => setFormLevelAccessId(val !== "" ? Number(val) : "")}
          placeholder="-- เลือกกลุ่มสิทธิ์ระบบ --"
          searchPlaceholder="พิมพ์ค้นหากลุ่มสิทธิ์..."
          options={accesses.map((acc) => ({
            value: acc.access_id,
            label: acc.access_name,
            subLabel: acc.description || "สิทธิ์ทั่วไป",
          }))}
        />
        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formLevelCarRelease}
              onChange={(e) => setFormLevelCarRelease(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
            />
            <span className="font-semibold text-slate-800 text-xs">
              อนุญาตให้ออกใบปล่อยรถ (Setting Car Release)
            </span>
          </label>
        </div>
      </AnimatedDrawer>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!levelToDelete}
        title="ยืนยันการลบระดับผู้ใช้งาน"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบระดับผู้ใช้งาน "${levelToDelete?.level_user_name}"?`}
        confirmText={isDeleting ? "กำลังลบ..." : "ลบระดับ"}
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDeleteLevel}
        onCancel={() => setLevelToDelete(null)}
      />
    </div>
  );
};

export default UserLevelsPage;
