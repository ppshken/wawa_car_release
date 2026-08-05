import React, { useState, useEffect, useMemo, useCallback } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { ConfirmModal } from "../../components/ConfirmModal";
import { PaginationControl } from "../../components/PaginationControl";
import { AnimatedDrawer } from "../../components/AnimatedDrawer";
import { MasterSubNav } from "../../components/MasterSubNav";
import {
  ListChecks,
  Search,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
  Key,
  Camera,
  ShieldCheck,
  Truck,
  Wallet,
  FileText,
  PackageCheck,
  RotateCcw,
  Coins,
  Settings,
  HelpCircle,
  Wrench,
  AlertTriangle,
  Layers,
  List,
  Tag,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface OperationMenuItem {
  id: number;
  menu_name: string;
  action_key: string;
  icon: string;
  access: Record<string, boolean>;
  status: "active" | "inactive";
  updated_at?: string;
  created_at?: string;
}

const ICON_OPTIONS = [
  { value: "Key", label: "Key (รีเซ็ตกุญแจ)" },
  { value: "Camera", label: "Camera (รูปให้ของ)" },
  { value: "ShieldCheck", label: "ShieldCheck (สถานะบัญชี)" },
  { value: "Plus", label: "Plus (เพิ่มร้านค้า)" },
  { value: "Truck", label: "Truck (ติดตาม)" },
  { value: "Wallet", label: "Wallet (ฝากเงิน)" },
  { value: "FileText", label: "FileText (เอกสารคืนของ)" },
  { value: "PackageCheck", label: "PackageCheck (สินค้าควบคุม)" },
  { value: "RotateCcw", label: "RotateCcw (คืนรถ)" },
  { value: "Coins", label: "Coins (เบี้ยเลี้ยง)" },
  { value: "Settings", label: "Settings (ตั้งค่า)" },
  { value: "Wrench", label: "Wrench (เครื่องมือ)" },
  { value: "AlertTriangle", label: "AlertTriangle (แจ้งปัญหา)" },
  { value: "Layers", label: "Layers (หมวดหมู่)" },
  { value: "List", label: "List (รายการ)" },
];

const ICON_MAP: Record<string, any> = {
  Key,
  Camera,
  ShieldCheck,
  Plus,
  Truck,
  Wallet,
  FileText,
  PackageCheck,
  RotateCcw,
  Coins,
  Settings,
  HelpCircle,
  Wrench,
  AlertTriangle,
  Layers,
  List,
};

const renderIcon = (iconName: string, className = "w-3.5 h-3.5 text-slate-700") => {
  const IconComponent = ICON_MAP[iconName] || FileText;
  return <IconComponent className={className} />;
};

const USER_LEVELS = [
  { id: "1", name: "ผู้ดูแลระบบ (Admin)" },
  { id: "2", name: "ผู้จัดการ (Manager)" },
  { id: "3", name: "พนักงานขับรถ (Driver)" },
  { id: "4", name: "ผู้ใช้งานทั่วไป (User)" },
];

export const OperationMenuPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [menus, setMenus] = useState<OperationMenuItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Search & Pagination State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Drawer / Form state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OperationMenuItem | null>(null);
  const [formName, setFormName] = useState("");
  const [formActionKey, setFormActionKey] = useState("");
  const [formIcon, setFormIcon] = useState("FileText");
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active");
  const [formAccess, setFormAccess] = useState<Record<string, boolean>>({
    "1": true,
    "2": true,
    "3": true,
    "4": true,
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete Modal
  const [menuToDelete, setMenuToDelete] = useState<OperationMenuItem | null>(null);

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/master/operation-menus");
      if (res.data.success && Array.isArray(res.data.menus)) {
        setMenus(res.data.menus);
      } else {
        showError("ไม่สามารถดึงข้อมูลเมนูการดำเนินงานได้");
      }
    } catch (err: any) {
      console.error("Fetch operation menus error:", err);
      showError(err.response?.data?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลเมนูการดำเนินงาน");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const filteredMenus = useMemo(() => {
    return menus.filter((m) => {
      const matchSearch =
        m.menu_name.toLowerCase().includes(search.toLowerCase()) ||
        m.action_key.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && (m.status === "active" || m.status === ("1" as any))) ||
        (statusFilter === "inactive" && (m.status === "inactive" || m.status === ("0" as any)));
      return matchSearch && matchStatus;
    });
  }, [menus, search, statusFilter]);

  const paginatedMenus = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMenus.slice(start, start + itemsPerPage);
  }, [filteredMenus, currentPage, itemsPerPage]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormName("");
    setFormActionKey(`action_${Date.now().toString().slice(-4)}`);
    setFormIcon("FileText");
    setFormStatus("active");
    setFormAccess({ "1": true, "2": true, "3": true, "4": true });
    setIsDrawerOpen(true);
  };

  const handleOpenEditModal = (item: OperationMenuItem) => {
    setEditingItem(item);
    setFormName(item.menu_name || "");
    setFormActionKey(item.action_key || "");
    setFormIcon(item.icon || "FileText");
    setFormStatus(item.status === "inactive" ? "inactive" : "active");
    setFormAccess(
      item.access && typeof item.access === "object"
        ? item.access
        : { "1": true, "2": true, "3": true, "4": true }
    );
    setIsDrawerOpen(true);
  };

  const handleToggleActive = async (item: OperationMenuItem) => {
    const nextStatus = item.status === "active" || item.status === ("1" as any) ? "inactive" : "active";
    try {
      const res = await api.put(`/master/operation-menus/${item.id}`, {
        ...item,
        status: nextStatus,
      });
      if (res.data.success) {
        showSuccess(`ปรับสถานะเมนู "${item.menu_name}" เรียบร้อยแล้ว`);
        fetchMenus();
      }
    } catch (err: any) {
      showError(err.response?.data?.message || "เกิดข้อผิดพลาดในการเปลี่ยนสถานะ");
    }
  };

  const handleConfirmDelete = async () => {
    if (!menuToDelete) return;
    try {
      const res = await api.delete(`/master/operation-menus/${menuToDelete.id}`);
      if (res.data.success) {
        showSuccess("ลบเมนูการดำเนินงานเรียบร้อยแล้ว");
        setMenuToDelete(null);
        fetchMenus();
      } else {
        showError(res.data.message || "ไม่สามารถลบข้อมูลได้");
      }
    } catch (err: any) {
      showError(err.response?.data?.message || "เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showError("กรุณากรอกชื่อเมนูการดำเนินงาน");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        menu_name: formName.trim(),
        action_key: formActionKey.trim(),
        icon: formIcon,
        access: formAccess,
        status: formStatus,
      };

      if (editingItem) {
        const res = await api.put(`/master/operation-menus/${editingItem.id}`, payload);
        if (res.data.success) {
          showSuccess("อัปเดตข้อมูลเมนูการดำเนินงานสำเร็จ!");
          setIsDrawerOpen(false);
          fetchMenus();
        } else {
          showError(res.data.message || "ไม่สามารถบันทึกข้อมูลได้");
        }
      } else {
        const res = await api.post("/master/operation-menus", payload);
        if (res.data.success) {
          showSuccess("เพิ่มเมนูการดำเนินงานใหม่สำเร็จ!");
          setIsDrawerOpen(false);
          fetchMenus();
        } else {
          showError(res.data.message || "ไม่สามารถบันทึกข้อมูลได้");
        }
      }
    } catch (err: any) {
      showError(err.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccessToggle = (levelId: string) => {
    setFormAccess((prev) => ({
      ...prev,
      [levelId]: !prev[levelId],
    }));
  };

  const isFormDirty = useMemo(() => {
    if (!editingItem) return !!(formName || formActionKey);
    return (
      formName !== editingItem.menu_name ||
      formActionKey !== editingItem.action_key ||
      formIcon !== editingItem.icon ||
      formStatus !== editingItem.status ||
      JSON.stringify(formAccess) !== JSON.stringify(editingItem.access)
    );
  }, [editingItem, formName, formActionKey, formIcon, formStatus, formAccess]);

  return (
    <div className="w-full space-y-4 font-sans text-xs pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            เมนูการดำเนินงาน
          </h1>
          <p className="text-[11px] text-slate-500">
            บริหารจัดการรายการปุ่มแอคชั่นในส่วนการดำเนินการด่วนของใบปล่อยรถ สิทธิ์การเข้าถึง และไอคอน
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchMenus}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-1.5 rounded-lg font-medium flex items-center gap-1 shadow-2xs transition-colors"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 text-slate-700 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มเมนูการดำเนินงาน</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation Bar for Master Data */}
      <MasterSubNav />

      {/* Filter / Search Bar */}
      <div className="tms-card p-3 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อเมนู, รหัสแอคชั่น..."
            className="w-full bg-slate-50 border border-slate-200/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>สถานะ:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white"
          >
            <option value="all">ทั้งหมด</option>
            <option value="active">เปิดใช้งาน (Active)</option>
            <option value="inactive">ปิดใช้งาน (Inactive)</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="tms-card overflow-hidden w-full">
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-1.5 px-3 text-center w-12">ID</th>
                <th className="py-1.5 px-3 text-center w-14">ไอคอน</th>
                <th className="py-1.5 px-3">ชื่อเมนู</th>
                <th className="py-1.5 px-3">รหัสแอคชั่น (Action Key)</th>
                <th className="py-1.5 px-3">สิทธิ์ระดับผู้ใช้ (Access)</th>
                <th className="py-1.5 px-3 text-center w-24">สถานะ</th>
                <th className="py-1.5 px-3 w-36">แก้ไขล่าสุด</th>
                <th className="py-1.5 px-3 text-right w-20">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-slate-500" />
                    กำลังโหลดข้อมูลเมนูการดำเนินงาน...
                  </td>
                </tr>
              ) : paginatedMenus.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    ไม่พบข้อมูลเมนูการดำเนินงานในระบบ
                  </td>
                </tr>
              ) : (
                paginatedMenus.map((item, idx) => {
                  const isActive = item.status === "active" || item.status === ("1" as any);
                  const rowNum = (currentPage - 1) * itemsPerPage + idx + 1;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-1 px-3 text-center text-slate-400 font-mono font-bold text-[11px]">
                        {rowNum}
                      </td>

                      <td className="py-1 px-3 text-center">
                        <div className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200/80 flex items-center justify-center mx-auto">
                          {renderIcon(item.icon, "w-3.5 h-3.5 text-slate-700")}
                        </div>
                      </td>

                      <td className="py-1 px-3 font-bold text-slate-900 text-[11px]">
                        {item.menu_name}
                      </td>

                      <td className="py-1 px-3">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 text-[10px]">
                          <Tag className="w-3 h-3 text-blue-500" />
                          {item.action_key}
                        </span>
                      </td>

                      <td className="py-1 px-3">
                        <div className="flex flex-wrap gap-1">
                          {USER_LEVELS.map((lvl) => {
                            const hasAccess =
                              item.access &&
                              (item.access[lvl.id] === true || item.access[lvl.id] === ("1" as any));
                            if (!hasAccess) return null;
                            return (
                              <span
                                key={lvl.id}
                                className="bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded text-[10px] font-semibold"
                              >
                                L{lvl.id}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      <td className="py-1 px-3 text-center">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>เปิดใช้งาน</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-slate-400" />
                              <span>ปิดใช้งาน</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-1 px-3 font-mono text-[11px] text-slate-500">
                        {item.updated_at ? item.updated_at.slice(0, 19).replace("T", " ") : "-"}
                      </td>

                      <td className="py-1 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="แก้ไข"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setMenuToDelete(item)}
                            className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="ลบ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Control */}
        {!loading && filteredMenus.length > 0 && (
          <div className="p-3 border-t border-slate-200/80 bg-slate-50/50">
            <PaginationControl
              currentPage={currentPage}
              totalItems={filteredMenus.length}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => setCurrentPage(page)}
              onItemsPerPageChange={(perPage) => {
                setItemsPerPage(perPage);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Add / Edit Drawer */}
      <AnimatedDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingItem ? "แก้ไขเมนูการดำเนินงาน" : "เพิ่มเมนูการดำเนินงาน"}
        maxWidthClass="max-w-md sm:max-w-lg"
        formId="menu-car-release-form"
        onSubmit={handleSubmit}
        submitLabel={submitting ? "กำลังบันทึก..." : editingItem ? "บันทึกการแก้ไข" : "เพิ่มเมนู"}
        isDirty={isFormDirty}
      >
        <form id="menu-car-release-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ชื่อเมนูการดำเนินงาน <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="เช่น รีเซ็ตกุญแจ, รูปให้ของ, คืนรถ"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              รหัสแอคชั่น (Action Key) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formActionKey}
              onChange={(e) => setFormActionKey(e.target.value)}
              placeholder="เช่น reset_key, cargo_photo, car_return"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-blue-700 focus:outline-none focus:bg-white focus:border-slate-400"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              ใช้สำหรับอ้างอิงฟังก์ชันการทำงานในระบบ เช่น reset_key, car_return, cargo_photo
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">ไอคอน (Lucide Icon)</label>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                {renderIcon(formIcon, "w-5 h-5 text-slate-800")}
              </div>
              <select
                value={formIcon}
                onChange={(e) => setFormIcon(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              สิทธิ์การเข้าถึงแยกตามระดับผู้ใช้งาน (Level User Access)
            </label>
            <div className="space-y-1.5 bg-slate-50 border border-slate-200 rounded-lg p-3">
              {USER_LEVELS.map((lvl) => (
                <label key={lvl.id} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!formAccess[lvl.id]}
                    onChange={() => handleAccessToggle(lvl.id)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span className="font-semibold text-slate-700 text-xs">{lvl.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">สถานะเปิดใช้งาน</label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white"
            >
              <option value="active">เปิดใช้งาน (Active)</option>
              <option value="inactive">ปิดใช้งาน (Inactive)</option>
            </select>
          </div>
        </form>
      </AnimatedDrawer>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!menuToDelete}
        onCancel={() => setMenuToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="ยืนยันการลบเมนูการดำเนินงาน"
        message={`คุณต้องการลบเมนูการดำเนินงาน "${menuToDelete?.menu_name}" ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`}
        confirmText="ลบข้อมูล"
        cancelText="ยกเลิก"
      />
    </div>
  );
};
