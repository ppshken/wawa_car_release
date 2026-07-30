import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { ConfirmModal } from "../../components/ConfirmModal";
import { AnimatedDrawer } from "../../components/AnimatedDrawer";
import { UsersSubNav } from "../../components/UsersSubNav";
import {
  KeyRound,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Grid,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface LevelUserData {
  level_user_id: number;
  level_user_name: string;
  access_name?: string;
}

interface PermissionData {
  permission_id: number;
  permission_key: string;
  permission_name: string;
  menu_group?: string;
  action_type?: string;
  description?: string;
}

interface RolePermissionData {
  level_user_id: number;
  permission_id: number;
}

export const PermissionsPage: React.FC = () => {
  const { showSuccess, showError } = useToast();

  const [permissions, setPermissions] = useState<PermissionData[]>([]);
  const [levels, setLevels] = useState<LevelUserData[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermissionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Drawer & Form State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPerm, setEditingPerm] = useState<PermissionData | null>(null);
  const [formPermKey, setFormPermKey] = useState("");
  const [formPermName, setFormPermName] = useState("");
  const [formPermMenuGroup, setFormPermMenuGroup] = useState("");
  const [formPermActionType, setFormPermActionType] = useState("");
  const [formPermDesc, setFormPermDesc] = useState("");

  // Delete Modal State
  const [permToDelete, setPermToDelete] = useState<PermissionData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Expand Matrix Groups
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const inputCls =
    "w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400";

  const isPermDirty = useMemo(() => {
    if (!editingPerm) {
      return !!(formPermKey || formPermName || formPermMenuGroup);
    }
    return (
      formPermKey !== editingPerm.permission_key ||
      formPermName !== editingPerm.permission_name ||
      formPermMenuGroup !== (editingPerm.menu_group || "") ||
      formPermActionType !== (editingPerm.action_type || "") ||
      formPermDesc !== (editingPerm.description || "")
    );
  }, [
    editingPerm,
    formPermKey,
    formPermName,
    formPermMenuGroup,
    formPermActionType,
    formPermDesc,
  ]);

  const fetchPermissions = useCallback(async () => {
    try {
      const res = await api.get("/manage/permissions");
      if (res.data.success && res.data.permissions) setPermissions(res.data.permissions);
    } catch (err) {
      console.error("Error fetching permissions:", err);
    }
  }, []);

  const fetchLevels = useCallback(async () => {
    try {
      const res = await api.get("/level-users");
      if (res.data.success && res.data.levelUsers) setLevels(res.data.levelUsers);
    } catch (err) {
      console.error("Error fetching levels:", err);
    }
  }, []);

  const fetchRolePermissions = useCallback(async () => {
    try {
      const res = await api.get("/manage/role-permissions");
      if (res.data.success && res.data.rolePermissions) setRolePermissions(res.data.rolePermissions);
    } catch (err) {
      console.error("Error fetching role permissions:", err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchPermissions(), fetchLevels(), fetchRolePermissions()]);
    setLoading(false);
  }, [fetchPermissions, fetchLevels, fetchRolePermissions]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Group permissions by menu_group
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionData[]> = {};
    permissions.forEach((p) => {
      const g = p.menu_group || "other";
      if (!groups[g]) groups[g] = [];
      groups[g].push(p);
    });
    return groups;
  }, [permissions]);

  const handleOpenAddPerm = () => {
    setEditingPerm(null);
    setFormPermKey("");
    setFormPermName("");
    setFormPermMenuGroup("main");
    setFormPermActionType("read");
    setFormPermDesc("");
    setIsDrawerOpen(true);
  };

  const handleOpenEditPerm = (perm: PermissionData) => {
    setEditingPerm(perm);
    setFormPermKey(perm.permission_key);
    setFormPermName(perm.permission_name);
    setFormPermMenuGroup(perm.menu_group || "main");
    setFormPermActionType(perm.action_type || "read");
    setFormPermDesc(perm.description || "");
    setIsDrawerOpen(true);
  };

  const handleSavePerm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPermKey || !formPermName) {
      showError("กรุณากรอก รหัสสิทธิ์ (Key) และ ชื่อสิทธิ์");
      return;
    }

    try {
      const payload = {
        permission_key: formPermKey,
        permission_name: formPermName,
        menu_group: formPermMenuGroup,
        action_type: formPermActionType,
        description: formPermDesc,
      };

      if (editingPerm) {
        await api.put(`/manage/permissions/${editingPerm.permission_id}`, payload);
        showSuccess("อัปเดตสิทธิ์ระบบสำเร็จ!");
      } else {
        await api.post("/manage/permissions", payload);
        showSuccess("สร้างสิทธิ์ระบบใหม่สำเร็จ!");
      }
      setIsDrawerOpen(false);
      fetchPermissions();
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกสิทธิ์");
    }
  };

  const handleConfirmDeletePerm = async () => {
    if (!permToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/manage/permissions/${permToDelete.permission_id}`);
      showSuccess(`ลบสิทธิ์ "${permToDelete.permission_name}" เรียบร้อย`);
      fetchPermissions();
    } catch (err: any) {
      showError(err?.response?.data?.message || "ไม่สามารถลบสิทธิ์นี้ได้");
    } finally {
      setIsDeleting(false);
      setPermToDelete(null);
    }
  };

  const isRolePermissionActive = (level_user_id: number, permission_id: number): boolean => {
    return rolePermissions.some(
      (rp) => rp.level_user_id === level_user_id && rp.permission_id === permission_id
    );
  };

  const { refreshUser } = useAuth();

  const handleToggleRolePermission = async (level_user_id: number, permission_id: number) => {
    try {
      const res = await api.post("/manage/role-permissions/toggle", {
        level_user_id,
        permission_id,
      });
      if (res.data.success) {
        showSuccess(res.data.message || "อัปเดตสิทธิ์เรียบร้อยแล้ว");
        fetchRolePermissions();
        if (refreshUser) refreshUser();
      }
    } catch (err: any) {
      showError(err?.response?.data?.message || "ไม่สามารถเปลี่ยนสิทธิ์ใช้งานได้");
    }
  };

  const toggleGroupExpand = (g: string) => {
    setExpandedGroups((prev) => ({ ...prev, [g]: !prev[g] }));
  };

  return (
    <div className="w-full space-y-4 font-sans text-xs pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-slate-800" />
            จัดการสิทธิ์ระบบ & Permission Matrix
          </h1>
          <p className="text-[11px] text-slate-500">
            กำหนดตารางสิทธิ์การเข้าถึง (Matrix) รายเมนูและฟังก์ชันสำหรับแต่ละระดับผู้ใช้งาน (คลิกเปิด/ปิดสิทธิ์ได้ทันที)
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
            onClick={handleOpenAddPerm}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> <span>เพิ่มสิทธิ์ใหม่</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation */}
      <UsersSubNav />

      {/* Permission Matrix Table */}
      <div className="tms-card overflow-hidden w-full">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <Grid className="w-4 h-4 text-slate-600" /> ตารางเมทริกซ์สิทธิ์ระบบ (Permission Matrix)
          </span>
          <span className="text-[10px] text-slate-500">คลิกที่ปุ่มเพื่อสลับสถานะ "อนุญาต" / "ไม่อนุญาต"</span>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                <th className="py-3 px-4 min-w-[250px]">รายการสิทธิ์ / เมนู</th>
                {levels.map((lvl) => (
                  <th key={lvl.level_user_id} className="py-3 px-4 text-center min-w-[120px]">
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-slate-900">{lvl.level_user_name}</span>
                      {lvl.access_name && (
                        <span className="text-[9px] font-normal text-slate-500 lowercase">
                          ({lvl.access_name})
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="py-3 px-4 text-right w-20">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
              {Object.keys(groupedPermissions).map((groupKey) => {
                const isExpanded = expandedGroups[groupKey] !== false;
                const groupItems = groupedPermissions[groupKey];
                return (
                  <React.Fragment key={groupKey}>
                    {/* Menu Group Header */}
                    <tr className="bg-slate-100/90 font-bold text-slate-900 select-none border-y border-slate-200">
                      <td colSpan={2 + levels.length} className="py-2.5 px-4">
                        <button
                          type="button"
                          onClick={() => toggleGroupExpand(groupKey)}
                          className="flex items-center gap-2 text-xs text-slate-900 hover:text-blue-600 focus:outline-none"
                        >
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                          <span className="capitalize font-bold">{groupKey}</span>
                          <span className="text-[10px] text-slate-500 font-normal">({groupItems.length} สิทธิ์)</span>
                        </button>
                      </td>
                    </tr>
                    {isExpanded &&
                      groupItems.map((p) => (
                        <tr key={p.permission_id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-800">{p.permission_name}</span>
                              <code className="bg-slate-100 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded text-[10px] font-mono">
                                {p.permission_key}
                              </code>
                            </div>
                          </td>
                          {levels.map((lvl) => {
                            const isActive = isRolePermissionActive(lvl.level_user_id, p.permission_id);
                            return (
                              <td key={lvl.level_user_id} className="py-2.5 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleRolePermission(lvl.level_user_id, p.permission_id)}
                                  className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                                    isActive
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                      : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                                  }`}
                                  title={`คลิกเพื่อ${isActive ? "ปิด" : "เปิด"}สิทธิ์ (${lvl.level_user_name})`}
                                >
                                  {isActive ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>อนุญาต</span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                                      <span>ไม่อนุญาต</span>
                                    </>
                                  )}
                                </button>
                              </td>
                            );
                          })}
                          <td className="py-2.5 px-4 text-right space-x-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditPerm(p)}
                              className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                              title="แก้ไข"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPermToDelete(p)}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              title="ลบ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                );
              })}
              {permissions.length === 0 && (
                <tr>
                  <td colSpan={2 + levels.length} className="py-8 text-center text-slate-400">
                    ยังไม่มีข้อมูลสิทธิ์ระบบ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permission Drawer */}
      <AnimatedDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingPerm ? "แก้ไขสิทธิ์ระบบ" : "เพิ่มสิทธิ์ระบบใหม่"}
        formId="perm-form"
        onSubmit={handleSavePerm}
        submitLabel={editingPerm ? "บันทึกการแก้ไข" : "บันทึกสร้างสิทธิ์"}
        isDirty={isPermDirty}
      >
        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            Permission Key <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formPermKey}
            onChange={(e) => setFormPermKey(e.target.value)}
            placeholder="เช่น stores.create, releases.export"
            className={`${inputCls} font-mono`}
            required
          />
        </div>
        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            ชื่อสิทธิ์ระบบ <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formPermName}
            onChange={(e) => setFormPermName(e.target.value)}
            placeholder="เช่น สร้างข้อมูลร้านค้า, ส่งออกรายงาน"
            className={inputCls}
            required
          />
        </div>
        <div>
          <label className="block text-slate-700 font-semibold mb-1">หมวดหมู่เมนู (Menu Group)</label>
          <input
            type="text"
            value={formPermMenuGroup}
            onChange={(e) => setFormPermMenuGroup(e.target.value)}
            placeholder="เช่น stores, releases, master"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-slate-700 font-semibold mb-1">คำอธิบายเพิ่มเติม</label>
          <textarea
            value={formPermDesc}
            onChange={(e) => setFormPermDesc(e.target.value)}
            placeholder="รายละเอียดการใช้งานสิทธิ์นี้..."
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </div>
      </AnimatedDrawer>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!permToDelete}
        title="ยืนยันการลบสิทธิ์ระบบ"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบสิทธิ์ "${permToDelete?.permission_name}" (${permToDelete?.permission_key})?`}
        confirmText={isDeleting ? "กำลังลบ..." : "ลบสิทธิ์"}
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDeletePerm}
        onCancel={() => setPermToDelete(null)}
      />
    </div>
  );
};

export default PermissionsPage;
