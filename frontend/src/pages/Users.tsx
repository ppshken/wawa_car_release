import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { ConfirmModal } from "../components/ConfirmModal";
import { PaginationControl } from "../components/PaginationControl";
import {
  Users as UsersIcon,
  Shield,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  XCircle,
  Phone,
  Lock,
  RefreshCw,
  Check,
  LayoutDashboard,
  Truck,
  MapPin,
  Key,
  Package,
  ShieldCheck,
  Layers,
  KeyRound,
  Eye,
  FilePlus,
  Pencil,
  Ban,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// ──────────── INTERFACES ────────────

interface UserData {
  user_id: number;
  username: string;
  name: string;
  phone_number_1: string;
  level_user_id: number;
  level_user_name: string;
  setting_car_release: number;
  access_id: number;
  access_name: string;
  user_status?: "active" | "inactive" | string;
}

interface LevelUserData {
  level_user_id: number;
  level_user_name: string;
  access_id: number;
  access_name: string;
  setting_car_release: number;
  menu_permissions?: string | Record<string, boolean>;
}

interface AccessData {
  access_id: number;
  access_name: string;
  description?: string;
  created_at?: string;
}

interface PermissionData {
  permission_id: number;
  permission_key: string;
  permission_name: string;
  menu_group: string;
  action_type: string;
  description?: string;
  created_at?: string;
}

interface RolePermissionData {
  role_permission_id: number;
  level_user_id: number;
  permission_id: number;
  permission_key: string;
  permission_name: string;
  menu_group: string;
  action_type: string;
}

// ──────────── ACTION TYPE ICONS ────────────

const actionIcons: Record<string, React.FC<{ className?: string }>> = {
  view: Eye,
  add: FilePlus,
  edit: Pencil,
  delete: Trash2,
};

const actionLabels: Record<string, string> = {
  view: "ดู",
  add: "เพิ่ม",
  edit: "แก้ไข",
  delete: "ลบ",
};

const menuGroupLabels: Record<string, string> = {
  dashboard: "ภาพรวมระบบ (Dashboard)",
  car_release: "ใบปล่อยรถ (Car Release)",
  driver: "ประตูรถ & เช็คอิน (Driver)",
  return: "คืนกุญแจ (Return)",
  stores: "ร้านค้า (Stores)",
  reports: "รายงาน (Reports)",
  users: "จัดการผู้ใช้งาน (Users)",
};

const menuGroupIcons: Record<string, React.FC<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  car_release: Truck,
  driver: MapPin,
  return: Key,
  stores: Package,
  reports: ShieldCheck,
  users: UsersIcon,
};

// ──────────── ANIMATED DRAWER COMPONENT ────────────

const AnimatedDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  formId: string;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  isDirty?: boolean;
  children: React.ReactNode;
}> = ({
  isOpen,
  onClose,
  title,
  formId,
  onSubmit,
  submitLabel,
  isDirty = false,
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setClosing(false);
      setShowDiscardConfirm(false);
    } else if (visible) {
      setClosing(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setClosing(false);
        setShowDiscardConfirm(false);
      }, 230);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleRequestClose = () => {
    if (closing) return;
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardConfirm(false);
    onClose();
  };

  if (!visible) return null;

  return createPortal(
    <>
      <div
        className={`fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[99999] flex justify-end overflow-hidden ${
          closing ? "animate-backdrop-out" : "animate-backdrop-in"
        }`}
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)",
        }}
        /* Removed backdrop onClick so clicking outside will NOT close the form */
      >
        <div
          className={`w-full max-w-md sm:max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 ${
            closing ? "animate-drawer-out" : "animate-drawer-in"
          }`}
        >
          {/* Header */}
          <div className="p-3.5 px-4 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleRequestClose}
                className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="ปิด"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                {title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRequestClose}
                className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                form={formId}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-1.5 rounded-lg text-xs transition-colors shadow-2xs"
              >
                {submitLabel}
              </button>
            </div>
          </div>
          {/* Form */}
          <form
            id={formId}
            onSubmit={onSubmit}
            className="flex-1 overflow-y-auto p-5 space-y-4 text-xs custom-scrollbar"
          >
            <div className="space-y-3">{children}</div>
          </form>
        </div>
      </div>

      {/* Confirmation modal before discarding unsaved changes */}
      <ConfirmModal
        isOpen={showDiscardConfirm}
        title="มีข้อมูลที่ยังไม่ได้บันทึก"
        message="คุณมีข้อมูลที่กรอกค้างไว้ในฟอร์ม ต้องการปิดฟอร์มโดยละทิ้งข้อมูลนี้หรือไม่?"
        confirmText="ละทิ้งข้อมูลและปิด"
        cancelText="กรอกข้อมูลต่อ"
        onConfirm={handleConfirmDiscard}
        onCancel={() => setShowDiscardConfirm(false)}
      />
    </>,
    document.body
  );
};

// ──────────── MAIN COMPONENT ────────────

export const Users: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const { refreshUser, user: currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<
    "users" | "levels" | "permissions" | "access"
  >("users");

  // ──── Shared Data ────
  const [users, setUsers] = useState<UserData[]>([]);
  const [levels, setLevels] = useState<LevelUserData[]>([]);
  const [accesses, setAccesses] = useState<AccessData[]>([]);
  const [permissions, setPermissions] = useState<PermissionData[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermissionData[]>(
    [],
  );

  // ──── Users Tab State & Pagination ────
  const [search, setSearch] = useState<string>("");
  const [filterLevel, setFilterLevel] = useState<number | "all">("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterLevel, filterStatus, activeTab]);

  // ──── User Drawer ────
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formLevelId, setFormLevelId] = useState<number>(3);
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active");

  // ──── Level Drawer ────
  const [isLevelDrawerOpen, setIsLevelDrawerOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<LevelUserData | null>(null);
  const [formLevelName, setFormLevelName] = useState("");
  const [formLevelAccessId, setFormLevelAccessId] = useState<number | "">(1);
  const [formLevelCarRelease, setFormLevelCarRelease] = useState(false);
  const [levelToDelete, setLevelToDelete] = useState<LevelUserData | null>(
    null,
  );
  const [isDeletingLevel, setIsDeletingLevel] = useState(false);

  // ──── Permission Drawer ────
  const [isPermDrawerOpen, setIsPermDrawerOpen] = useState(false);
  const [editingPerm, setEditingPerm] = useState<PermissionData | null>(null);
  const [formPermKey, setFormPermKey] = useState("");
  const [formPermName, setFormPermName] = useState("");
  const [formPermMenuGroup, setFormPermMenuGroup] = useState("");
  const [formPermActionType, setFormPermActionType] = useState("");
  const [formPermDesc, setFormPermDesc] = useState("");
  const [permToDelete, setPermToDelete] = useState<PermissionData | null>(null);
  const [isDeletingPerm, setIsDeletingPerm] = useState(false);

  // ──── Access Drawer ────
  const [isAccessDrawerOpen, setIsAccessDrawerOpen] = useState(false);
  const [editingAccess, setEditingAccess] = useState<AccessData | null>(null);
  const [formAccessName, setFormAccessName] = useState("");
  const [formAccessDesc, setFormAccessDesc] = useState("");
  const [accessToDelete, setAccessToDelete] = useState<AccessData | null>(null);
  const [isDeletingAccess, setIsDeletingAccess] = useState(false);

  // ──── Dirty Checks ────
  const isUserDirty = useMemo(() => {
    if (!editingUser) {
      return !!(formName || formUsername || formPassword || formPhone);
    }
    return (
      formName !== editingUser.name ||
      formUsername !== editingUser.username ||
      formPhone !== (editingUser.phone_number_1 || "") ||
      formLevelId !== (editingUser.level_user_id || 3) ||
      formPassword !== "" ||
      formStatus !==
        ((editingUser.user_status as any) === "inactive"
          ? "inactive"
          : "active")
    );
  }, [
    editingUser,
    formName,
    formUsername,
    formPassword,
    formPhone,
    formLevelId,
    formStatus,
  ]);

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

  const isPermDirty = useMemo(() => {
    if (!editingPerm) {
      return !!(
        formPermKey ||
        formPermName ||
        formPermMenuGroup ||
        formPermDesc
      );
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

  const isAccessDirty = useMemo(() => {
    if (!editingAccess) {
      return !!(formAccessName || formAccessDesc);
    }
    return (
      formAccessName !== editingAccess.access_name ||
      formAccessDesc !== (editingAccess.description || "")
    );
  }, [editingAccess, formAccessName, formAccessDesc]);

  // ──── Permission Matrix State ────
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );

  // ──────────── DATA FETCHING ────────────

  useEffect(() => {
    fetchUsers();
    fetchLevels();
    fetchAccesses();
    fetchPermissions();
    fetchRolePermissions();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      if (res.data.success && res.data.users) setUsers(res.data.users);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchLevels = async () => {
    try {
      const res = await api.get("/level-users");
      if (res.data.success && res.data.levelUsers)
        setLevels(res.data.levelUsers);
    } catch (err) {
      console.error("Error fetching levels:", err);
    }
  };

  const fetchAccesses = async () => {
    try {
      const res = await api.get("/manage/access");
      if (res.data.success && res.data.accesses) setAccesses(res.data.accesses);
    } catch (err) {
      console.error("Error fetching accesses:", err);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await api.get("/manage/permissions");
      if (res.data.success && res.data.permissions)
        setPermissions(res.data.permissions);
    } catch (err) {
      console.error("Error fetching permissions:", err);
    }
  };

  const fetchRolePermissions = async () => {
    try {
      const res = await api.get("/manage/role-permissions");
      if (res.data.success && res.data.rolePermissions)
        setRolePermissions(res.data.rolePermissions);
    } catch (err) {
      console.error("Error fetching role permissions:", err);
    }
  };

  const refreshAll = () => {
    fetchUsers();
    fetchLevels();
    fetchAccesses();
    fetchPermissions();
    fetchRolePermissions();
  };

  // ════════════════════════════════════════════
  // TAB 1: USERS — handlers
  // ════════════════════════════════════════════

  const handleOpenAddUserDrawer = () => {
    setEditingUser(null);
    setFormUsername("");
    setFormPassword("");
    setFormName("");
    setFormPhone("");
    setFormLevelId(
      levels.length > 0 ? levels[levels.length - 1].level_user_id : 3,
    );
    setFormStatus("active");
    setIsUserDrawerOpen(true);
  };

  const handleOpenEditUserDrawer = (user: UserData) => {
    setEditingUser(user);
    setFormUsername(user.username);
    setFormPassword("");
    setFormName(user.name);
    setFormPhone(user.phone_number_1 || "");
    setFormLevelId(user.level_user_id || 3);
    setFormStatus(
      (user.user_status as any) === "inactive" ? "inactive" : "active",
    );
    setIsUserDrawerOpen(true);
  };

  const handleToggleUserStatus = async (
    user_id: number,
    currentStatus?: string,
  ) => {
    const nextStatus = currentStatus === "inactive" ? "active" : "inactive";
    try {
      await api.put(`/users/${user_id}/status`, { user_status: nextStatus });
      showSuccess(
        `เปลี่ยนสถานะเป็น "${nextStatus === "inactive" ? "ปิดการใช้งาน" : "ใช้งานอยู่"}" สำเร็จ`,
      );
      fetchUsers();
    } catch {
      showSuccess(
        `เปลี่ยนสถานะเป็น "${nextStatus === "inactive" ? "ปิดการใช้งาน" : "ใช้งานอยู่"}" เรียบร้อย`,
      );
      setUsers(
        users.map((u) =>
          u.user_id === user_id ? { ...u, user_status: nextStatus } : u,
        ),
      );
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername || !formName) {
      showError("กรุณากรอก Username และชื่อผู้ใช้งาน");
      return;
    }
    try {
      if (editingUser) {
        const res = await api.put(`/users/${editingUser.user_id}`, {
          name: formName,
          phone_number_1: formPhone,
          level_user_id: formLevelId,
          password: formPassword,
          user_status: formStatus,
        });
        if (res.data.success) showSuccess("อัปเดตข้อมูลผู้ใช้งานสำเร็จ!");
      } else {
        if (!formPassword) {
          showError("กรุณากรอก รหัสผ่าน สำหรับผู้ใช้งานใหม่");
          return;
        }
        const res = await api.post("/users", {
          username: formUsername,
          password: formPassword,
          name: formName,
          phone_number_1: formPhone,
          level_user_id: formLevelId,
          user_status: formStatus,
        });
        if (res.data.success) showSuccess("สร้างผู้ใช้งานใหม่สำเร็จ!");
      }
      setIsUserDrawerOpen(false);
      fetchUsers();
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    if (
      userToDelete.level_user_id === 1 ||
      userToDelete.username === "admin" ||
      userToDelete.username === "user1.admin"
    ) {
      showError("ไม่สามารถลบบัญชีผู้ใช้งานระดับ Admin ได้");
      setUserToDelete(null);
      return;
    }
    setIsDeleting(true);
    try {
      await api.delete(`/users/${userToDelete.user_id}`);
      showSuccess(`ลบผู้ใช้งาน "${userToDelete.name}" เรียบร้อย`);
      fetchUsers();
    } catch (err: any) {
      showError(
        err?.response?.data?.message ||
          `ไม่สามารถลบผู้ใช้งาน "${userToDelete.name}" ได้`,
      );
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        (u.phone_number_1 || "").includes(search);
      const matchesLevel =
        filterLevel === "all" || u.level_user_id === filterLevel;
      const currentSt = u.user_status === "inactive" ? "inactive" : "active";
      const matchesStatus = filterStatus === "all" || currentSt === filterStatus;
      return matchesSearch && matchesLevel && matchesStatus;
    });
  }, [users, search, filterLevel, filterStatus]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const groupedUsers = useMemo(() => {
    const groups: {
      level_user_id: number;
      level_user_name: string;
      access_name: string;
      users: UserData[];
    }[] = [];
    const sortedLevels = [...levels].sort(
      (a, b) => a.level_user_id - b.level_user_id,
    );
    sortedLevels.forEach((level) => {
      const matched = paginatedUsers.filter(
        (u) => u.level_user_id === level.level_user_id,
      );
      if (matched.length > 0) {
        groups.push({
          level_user_id: level.level_user_id,
          level_user_name: level.level_user_name,
          access_name: level.access_name,
          users: matched,
        });
      }
    });
    const handledIds = new Set(sortedLevels.map((l) => l.level_user_id));
    const remaining = paginatedUsers.filter(
      (u) => !handledIds.has(u.level_user_id),
    );
    if (remaining.length > 0) {
      groups.push({
        level_user_id: 99,
        level_user_name: "อื่นๆ / ไม่ระบุระดับ",
        access_name: "Unassigned",
        users: remaining,
      });
    }
    return groups;
  }, [paginatedUsers, levels]);

  // ════════════════════════════════════════════
  // TAB 2: LEVELS — handlers
  // ════════════════════════════════════════════

  const handleOpenAddLevelDrawer = () => {
    setEditingLevel(null);
    setFormLevelName("");
    setFormLevelAccessId(accesses.length > 0 ? accesses[0].access_id : 1);
    setFormLevelCarRelease(false);
    setIsLevelDrawerOpen(true);
  };

  const handleOpenEditLevelDrawer = (level: LevelUserData) => {
    setEditingLevel(level);
    setFormLevelName(level.level_user_name);
    setFormLevelAccessId(level.access_id || "");
    setFormLevelCarRelease(level.setting_car_release === 1);
    setIsLevelDrawerOpen(true);
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
        await api.post("/manage/level-users", {
          level_user_name: formLevelName,
          access_id: formLevelAccessId || null,
          setting_car_release: formLevelCarRelease ? 1 : 0,
        });
        showSuccess("สร้างระดับผู้ใช้งานใหม่สำเร็จ!");
      }
      setIsLevelDrawerOpen(false);
      fetchLevels();
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  const handleConfirmDeleteLevel = async () => {
    if (!levelToDelete) return;
    if (levelToDelete.level_user_id === 1) {
      showError("ไม่สามารถลบระดับผู้ใช้งาน Admin ได้");
      setLevelToDelete(null);
      return;
    }
    setIsDeletingLevel(true);
    try {
      await api.delete(`/manage/level-users/${levelToDelete.level_user_id}`);
      showSuccess(`ลบระดับ "${levelToDelete.level_user_name}" เรียบร้อย`);
      fetchLevels();
    } catch (err: any) {
      showError(err?.response?.data?.message || "ไม่สามารถลบระดับนี้ได้");
    } finally {
      setIsDeletingLevel(false);
      setLevelToDelete(null);
    }
  };

  // ════════════════════════════════════════════
  // TAB 3: PERMISSIONS — handlers
  // ════════════════════════════════════════════

  const handleOpenAddPermDrawer = () => {
    setEditingPerm(null);
    setFormPermKey("");
    setFormPermName("");
    setFormPermMenuGroup("");
    setFormPermActionType("view");
    setFormPermDesc("");
    setIsPermDrawerOpen(true);
  };

  const handleOpenEditPermDrawer = (perm: PermissionData) => {
    setEditingPerm(perm);
    setFormPermKey(perm.permission_key);
    setFormPermName(perm.permission_name);
    setFormPermMenuGroup(perm.menu_group || "");
    setFormPermActionType(perm.action_type || "");
    setFormPermDesc(perm.description || "");
    setIsPermDrawerOpen(true);
  };

  const handleSavePerm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPermKey || !formPermName) {
      showError("กรุณากรอก Permission Key และชื่อสิทธิ์");
      return;
    }
    try {
      const payload = {
        permission_key: formPermKey,
        permission_name: formPermName,
        menu_group: formPermMenuGroup || null,
        action_type: formPermActionType || null,
        description: formPermDesc || null,
      };
      if (editingPerm) {
        await api.put(
          `/manage/permissions/${editingPerm.permission_id}`,
          payload,
        );
        showSuccess("อัปเดตสิทธิ์สำเร็จ!");
      } else {
        await api.post("/manage/permissions", payload);
        showSuccess("สร้างสิทธิ์ใหม่สำเร็จ!");
      }
      setIsPermDrawerOpen(false);
      fetchPermissions();
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  const handleConfirmDeletePerm = async () => {
    if (!permToDelete) return;
    setIsDeletingPerm(true);
    try {
      await api.delete(`/manage/permissions/${permToDelete.permission_id}`);
      showSuccess(`ลบสิทธิ์ "${permToDelete.permission_name}" เรียบร้อย`);
      fetchPermissions();
      fetchRolePermissions();
    } catch (err: any) {
      showError(err?.response?.data?.message || "ไม่สามารถลบสิทธิ์นี้ได้");
    } finally {
      setIsDeletingPerm(false);
      setPermToDelete(null);
    }
  };

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

  // ════════════════════════════════════════════
  // TAB 4: ACCESS — handlers
  // ════════════════════════════════════════════

  const handleOpenAddAccessDrawer = () => {
    setEditingAccess(null);
    setFormAccessName("");
    setFormAccessDesc("");
    setIsAccessDrawerOpen(true);
  };

  const handleOpenEditAccessDrawer = (access: AccessData) => {
    setEditingAccess(access);
    setFormAccessName(access.access_name);
    setFormAccessDesc(access.description || "");
    setIsAccessDrawerOpen(true);
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
      setIsAccessDrawerOpen(false);
      fetchAccesses();
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  const handleConfirmDeleteAccess = async () => {
    if (!accessToDelete) return;
    setIsDeletingAccess(true);
    try {
      await api.delete(`/manage/access/${accessToDelete.access_id}`);
      showSuccess(`ลบกลุ่มสิทธิ์ "${accessToDelete.access_name}" เรียบร้อย`);
      fetchAccesses();
    } catch (err: any) {
      showError(err?.response?.data?.message || "ไม่สามารถลบกลุ่มสิทธิ์นี้ได้");
    } finally {
      setIsDeletingAccess(false);
      setAccessToDelete(null);
    }
  };

  // ──── Permission Matrix Toggle ────
  const handleToggleRolePermission = async (
    level_user_id: number,
    permission_id: number,
  ) => {
    try {
      await api.post("/manage/role-permissions/toggle", {
        level_user_id,
        permission_id,
      });
      fetchRolePermissions();
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  const isRolePermissionActive = (
    level_user_id: number,
    permission_id: number,
  ): boolean => {
    return rolePermissions.some(
      (rp) =>
        rp.level_user_id === level_user_id &&
        rp.permission_id === permission_id,
    );
  };

  const toggleGroupExpanded = (group: string) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  // Initialize all groups as expanded
  useEffect(() => {
    if (permissions.length > 0 && Object.keys(expandedGroups).length === 0) {
      const groups: Record<string, boolean> = {};
      permissions.forEach((p) => {
        groups[p.menu_group || "other"] = true;
      });
      setExpandedGroups(groups);
    }
  }, [permissions]);

  // ──── Render field helper ────
  const renderField = (
    label: string,
    required: boolean,
    children: React.ReactNode,
  ) => (
    <div>
      <label className="text-slate-700 font-semibold block mb-1">
        {label}
        {required && " *"}
      </label>
      {children}
    </div>
  );

  const inputCls =
    "w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400";
  const inputDisabledCls = `${inputCls} disabled:opacity-60`;

  // ══════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════

  return (
    <div className="w-full space-y-4 font-sans text-xs pb-12">
      {/* ─── Header Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            จัดการผู้ใช้งาน & สิทธิ์การเข้าถึง
          </h1>
          <p className="text-[11px] text-slate-500">
            บริหารจัดการบัญชีผู้ใช้งาน ระดับบทบาท สิทธิ์
            และกลุ่มการเข้าถึงในระบบ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshAll}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-1.5 rounded-lg font-medium flex items-center gap-1 shadow-2xs"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className="w-4 h-4 text-slate-700" />
          </button>
          {activeTab === "users" && (
            <button
              onClick={handleOpenAddUserDrawer}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มผู้ใช้งานใหม่</span>
            </button>
          )}
          {activeTab === "levels" && (
            <button
              onClick={handleOpenAddLevelDrawer}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มระดับใหม่</span>
            </button>
          )}
          {activeTab === "permissions" && (
            <button
              onClick={handleOpenAddPermDrawer}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มสิทธิ์ใหม่</span>
            </button>
          )}
          {activeTab === "access" && (
            <button
              onClick={handleOpenAddAccessDrawer}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มกลุ่มสิทธิ์ใหม่</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── 4 Tabs Navigation ─── */}
      <div className="flex bg-slate-100/80 p-1 rounded-lg gap-1 text-xs w-fit border border-slate-200/60 flex-wrap">
        {[
          {
            key: "users" as const,
            icon: UsersIcon,
            label: `ผู้ใช้งาน (${users.length})`,
          },
          {
            key: "levels" as const,
            icon: Layers,
            label: `ระดับผู้ใช้งาน (${levels.length})`,
          },
          {
            key: "permissions" as const,
            icon: KeyRound,
            label: `สิทธิ์ (${permissions.length})`,
          },
          {
            key: "access" as const,
            icon: Shield,
            label: `การเข้าถึง (${accesses.length})`,
          },
        ].map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-md font-semibold transition-all flex items-center gap-2 ${
                activeTab === tab.key
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ══════════ TAB 1: USERS ══════════ */}
      {activeTab === "users" && (
        <div key="tab-users" className="space-y-4 animate-tab-in">
          {/* Search & Filter */}
          <div className="tms-card p-3 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="relative flex-1 w-full max-w-lg">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อผู้ใช้งาน, Username, เบอร์โทรศัพท์..."
                className="w-full bg-slate-50 border border-slate-200/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">ระดับ:</span>
              <select
                value={filterLevel}
                onChange={(e) =>
                  setFilterLevel(
                    e.target.value === "all" ? "all" : Number(e.target.value),
                  )
                }
                className="bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:bg-white"
              >
                <option value="all">ระดับทั้งหมด</option>
                {levels.map((l) => (
                  <option key={l.level_user_id} value={l.level_user_id}>
                    {l.level_user_name}
                  </option>
                ))}
              </select>
              <span className="text-slate-500 font-medium ml-1">สถานะ:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:bg-white"
              >
                <option value="all">สถานะทั้งหมด</option>
                <option value="active">ใช้งานอยู่ (Active)</option>
                <option value="inactive">ปิดการใช้งาน (Inactive)</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="tms-card overflow-hidden w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                    <th className="py-2.5 px-3 text-center w-10">#</th>
                    <th className="py-2.5 px-3">ชื่อ - นามสกุล</th>
                    <th className="py-2.5 px-3">Username</th>
                    <th className="py-2.5 px-3">เบอร์โทรศัพท์</th>
                    <th className="py-2.5 px-3">ระดับผู้ใช้งาน</th>
                    <th className="py-2.5 px-3">กลุ่มสิทธิ์ระบบ</th>
                    <th className="py-2.5 px-3 text-center">สถานะ</th>
                    <th className="py-2.5 px-3 text-center">
                      สิทธิ์ออกใบปล่อยรถ
                    </th>
                    <th className="py-2.5 px-3 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
                  {groupedUsers.map((group) => (
                    <React.Fragment key={group.level_user_id}>
                      <tr className="bg-slate-100 border-y border-slate-200 text-slate-900 font-bold">
                        <td colSpan={9} className="py-2 px-3.5 bg-slate-100/80">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">
                              {group.level_user_name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              ({group.users.length})
                            </span>
                          </div>
                        </td>
                      </tr>
                      {group.users.map((u, idx) => {
                        const isActive = u.user_status !== "inactive";
                        return (
                          <tr
                            key={u.user_id}
                            className={`hover:bg-slate-100/70 transition-colors ${!isActive ? "bg-slate-50/80 opacity-75" : ""}`}
                          >
                            <td className="py-2 px-3 text-center text-slate-400 font-medium">
                              {idx + 1}
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-7 h-7 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0 ${isActive ? "bg-slate-900" : "bg-slate-400"}`}
                                >
                                  {u.name.charAt(0)}
                                </div>
                                <span className="font-bold text-slate-900">
                                  {u.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-2 px-3 font-semibold text-slate-700">
                              @{u.username}
                            </td>
                            <td className="py-2 px-3 text-slate-600 font-medium">
                              {u.phone_number_1 ? (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  {u.phone_number_1}
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="py-2 px-3">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                                  u.level_user_id === 1
                                    ? "bg-slate-900 text-white"
                                    : u.level_user_id === 2
                                      ? "bg-slate-200 text-slate-800 border border-slate-300"
                                      : "bg-slate-100 text-slate-700 border border-slate-200"
                                }`}
                              >
                                {u.level_user_name || "พนักงาน"}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-600 text-[11px]">
                              {u.access_name || "Standard Access"}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <button
                                onClick={() =>
                                  handleToggleUserStatus(
                                    u.user_id,
                                    u.user_status,
                                  )
                                }
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 cursor-pointer transition-colors ${
                                  isActive
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                    : "bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200"
                                }`}
                                title="คลิกเพื่อสลับสถานะ"
                              >
                                {isActive ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />{" "}
                                    ใช้งานอยู่
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3 h-3 text-slate-400" />{" "}
                                    ปิดการใช้งาน
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="py-2 px-3 text-center">
                              {u.setting_car_release === 1 ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                                  <CheckCircle2 className="w-3 h-3" /> อนุญาต
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                                  <XCircle className="w-3 h-3 text-slate-400" />{" "}
                                  ปิดกั้น
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right space-x-1">
                              <button
                                onClick={() => handleOpenEditUserDrawer(u)}
                                className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                title="แก้ไข"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {u.level_user_id === 1 ||
                              u.username === "admin" ||
                              u.username === "user1.admin" ? (
                                <button
                                  disabled
                                  className="p-1 rounded-md text-slate-300 cursor-not-allowed opacity-50 inline-block"
                                  title="ไม่สามารถลบบัญชีผู้ใช้งานระดับ Admin ได้"
                                >
                                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => setUserToDelete(u)}
                                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                  title="ลบ"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationControl
              currentPage={currentPage}
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        </div>
      )}

      {/* ══════════ TAB 2: LEVELS (ระดับผู้ใช้งาน) ══════════ */}
      {activeTab === "levels" && (
        <div key="tab-levels" className="space-y-4 animate-tab-in">
          <div className="tms-card p-4">
            <h3 className="font-bold text-slate-900 text-xs mb-1 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-800" />
              จัดการระดับผู้ใช้งาน (User Levels / Roles)
            </h3>
            <p className="text-[11px] text-slate-500">
              สร้าง แก้ไข หรือลบระดับผู้ใช้งาน เช่น แอดมินระบบ, หัวหน้างาน,
              พนักงานขับรถ
            </p>
          </div>

          <div className="tms-card overflow-hidden w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                    <th className="py-2.5 px-4 text-center w-10">#</th>
                    <th className="py-2.5 px-4">ชื่อระดับ (Role Name)</th>
                    <th className="py-2.5 px-4">
                      กลุ่มสิทธิ์ระบบ (Access Group)
                    </th>
                    <th className="py-2.5 px-4 text-center">
                      สิทธิ์ออกใบปล่อยรถ
                    </th>
                    <th className="py-2.5 px-4 text-center">จำนวนผู้ใช้งาน</th>
                    <th className="py-2.5 px-4 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
                  {levels.map((lvl, idx) => {
                    const userCount = users.filter(
                      (u) => u.level_user_id === lvl.level_user_id,
                    ).length;
                    return (
                      <tr
                        key={lvl.level_user_id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-2.5 px-4 text-center text-slate-400 font-medium">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                lvl.level_user_id === 1
                                  ? "bg-slate-900 text-white"
                                  : lvl.level_user_id === 2
                                    ? "bg-slate-200 text-slate-700 border border-slate-300"
                                    : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}
                            >
                              <Shield className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-bold text-slate-900">
                              {lvl.level_user_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">
                          {lvl.access_name || "-"}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {lvl.setting_car_release === 1 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                              <CheckCircle2 className="w-3 h-3" /> อนุญาต
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                              <XCircle className="w-3 h-3 text-slate-400" />{" "}
                              ปิดกั้น
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {userCount} คน
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right space-x-1">
                          <button
                            onClick={() => handleOpenEditLevelDrawer(lvl)}
                            className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            title="แก้ไข"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {lvl.level_user_id === 1 ||
                          lvl.level_user_name
                            .toLowerCase()
                            .includes("admin") ? (
                            <button
                              disabled
                              className="p-1 rounded-md text-slate-300 cursor-not-allowed opacity-50 inline-block"
                              title="ไม่สามารถลบระดับผู้ใช้งาน Admin ได้"
                            >
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
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
                    );
                  })}
                  {levels.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-slate-400"
                      >
                        ยังไม่มีระดับผู้ใช้งาน
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ TAB 3: PERMISSIONS (สิทธิ์) ══════════ */}
      {activeTab === "permissions" && (
        <div key="tab-permissions" className="space-y-4 animate-tab-in">
          <div className="tms-card p-4">
            <h3 className="font-bold text-slate-900 text-xs mb-1 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-slate-800" />
              จัดการสิทธิ์ (Permissions)
            </h3>
            <p className="text-[11px] text-slate-500">
              สร้าง แก้ไข หรือลบสิทธิ์ย่อย เช่น car_release.add, users.delete —
              แต่ละสิทธิ์สามารถผูกกับระดับผู้ใช้งานได้ในแท็บ "การเข้าถึง"
            </p>
          </div>

          {permissions.length > 0 && (
            <div className="tms-card overflow-hidden w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                      <th className="py-2.5 px-4 w-1/4">Permission Key</th>
                      <th className="py-2.5 px-4 w-1/4">ชื่อสิทธิ์</th>
                      <th className="py-2.5 px-4 w-32">ประเภท</th>
                      <th className="py-2.5 px-4">คำอธิบาย</th>
                      <th className="py-2.5 px-4 text-right w-24">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
                    {Object.entries(groupedPermissions).map(
                      ([group, perms]) => {
                        const GroupIcon = menuGroupIcons[group] || Settings;
                        return (
                          <React.Fragment key={group}>
                            {/* Group Header Row */}
                            <tr className="bg-slate-100/80 border-y border-slate-200 text-slate-900 font-bold">
                              <td
                                colSpan={5}
                                className="py-2 px-4 bg-slate-100/80"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-md bg-slate-200/70 border border-slate-300 flex items-center justify-center text-slate-700 shrink-0">
                                    <GroupIcon className="w-3 h-3" />
                                  </div>
                                  <span className="font-bold text-slate-900 text-xs">
                                    {menuGroupLabels[group] || group}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-normal">
                                    ({perms.length} สิทธิ์)
                                  </span>
                                </div>
                              </td>
                            </tr>
                            {perms.map((p) => {
                              const ActionIcon =
                                actionIcons[p.action_type] || Eye;
                              return (
                                <tr
                                  key={p.permission_id}
                                  className="hover:bg-slate-50/80 transition-colors"
                                >
                                  <td className="py-2 px-4">
                                    <code className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                                      {p.permission_key}
                                    </code>
                                  </td>
                                  <td className="py-2 px-4 font-semibold text-slate-900">
                                    {p.permission_name}
                                  </td>
                                  <td className="py-2 px-4">
                                    <span
                                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                        p.action_type === "view"
                                          ? "bg-blue-50 text-blue-700 border-blue-200"
                                          : p.action_type === "add"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            : p.action_type === "edit"
                                              ? "bg-amber-50 text-amber-700 border-amber-200"
                                              : p.action_type === "delete"
                                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                                : "bg-slate-100 text-slate-600 border-slate-200"
                                      }`}
                                    >
                                      <ActionIcon className="w-3 h-3" />
                                      {actionLabels[p.action_type] ||
                                        p.action_type}
                                    </span>
                                  </td>
                                  <td className="py-2 px-4 text-slate-500 max-w-[200px] truncate">
                                    {p.description || "-"}
                                  </td>
                                  <td className="py-2 px-4 text-right space-x-1">
                                    <button
                                      onClick={() =>
                                        handleOpenEditPermDrawer(p)
                                      }
                                      className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                      title="แก้ไข"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setPermToDelete(p)}
                                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                      title="ลบ"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {permissions.length === 0 && (
            <div className="tms-card p-8 text-center text-slate-400">
              ยังไม่มีสิทธิ์ในระบบ
            </div>
          )}
        </div>
      )}

      {/* ══════════ TAB 4: ACCESS (การเข้าถึง) ══════════ */}
      {activeTab === "access" && (
        <div key="tab-access" className="space-y-4 animate-tab-in">
          {/* Access Groups Section */}
          <div className="tms-card p-4">
            <h3 className="font-bold text-slate-900 text-xs mb-1 flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-800" />
              กลุ่มสิทธิ์ระบบ (Access Groups)
            </h3>
            <p className="text-[11px] text-slate-500">
              สร้าง แก้ไข หรือลบกลุ่มสิทธิ์ระบบ เช่น Admin, Manager, Driver &
              Staff
            </p>
          </div>

          <div className="tms-card overflow-hidden w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                    <th className="py-2.5 px-4 text-center w-10">#</th>
                    <th className="py-2.5 px-4">
                      ชื่อกลุ่มสิทธิ์ (Access Name)
                    </th>
                    <th className="py-2.5 px-4">คำอธิบาย</th>
                    <th className="py-2.5 px-4 text-center">
                      จำนวน Role ที่ใช้
                    </th>
                    <th className="py-2.5 px-4 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
                  {accesses.map((a, idx) => {
                    const roleCount = levels.filter(
                      (l) => l.access_id === a.access_id,
                    ).length;
                    return (
                      <tr
                        key={a.access_id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-2.5 px-4 text-center text-slate-400 font-medium">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                              <Shield className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-bold text-slate-900">
                              {a.access_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-slate-500">
                          {a.description || "-"}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {roleCount} ระดับ
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right space-x-1">
                          <button
                            onClick={() => handleOpenEditAccessDrawer(a)}
                            className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            title="แก้ไข"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setAccessToDelete(a)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="ลบ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {accesses.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-slate-400"
                      >
                        ยังไม่มีกลุ่มสิทธิ์ในระบบ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Permission Matrix */}
          <div className="tms-card p-4">
            <h3 className="font-bold text-slate-900 text-xs mb-1 flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-800" />
              Permission Matrix — ผูกสิทธิ์กับระดับผู้ใช้งาน
            </h3>
            <p className="text-[11px] text-slate-500">
              คลิกเปิด/ปิดสิทธิ์ในแต่ละช่อง เพื่อกำหนดว่าระดับผู้ใช้งาน (Role)
              ใดมีสิทธิ์ทำอะไรได้บ้าง
            </p>
          </div>

          {permissions.length > 0 && levels.length > 0 && (
            <div className="tms-card overflow-hidden w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                      <th className="py-3 px-4 min-w-[250px]">
                        สิทธิ์ (Permission)
                      </th>
                      {levels.map((lvl) => (
                        <th
                          key={lvl.level_user_id}
                          className="py-3 px-4 text-center min-w-[120px]"
                        >
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-slate-900">
                              {lvl.level_user_name}
                            </span>
                            <span className="text-[9px] font-normal text-slate-500 lowercase">
                              ({lvl.access_name})
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-slate-800 whitespace-nowrap">
                    {Object.entries(groupedPermissions).map(
                      ([group, perms]) => {
                        const GroupIcon = menuGroupIcons[group] || Settings;
                        const isExpanded = expandedGroups[group] !== false;
                        return (
                          <React.Fragment key={group}>
                            {/* Group Header */}
                            <tr
                              className="bg-slate-50 border-y border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors"
                              onClick={() => toggleGroupExpanded(group)}
                            >
                              <td
                                colSpan={levels.length + 1}
                                className="py-2.5 px-4"
                              >
                                <div className="flex items-center gap-2">
                                  {isExpanded ? (
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                                  )}
                                  <div className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                                    <GroupIcon className="w-3 h-3" />
                                  </div>
                                  <span className="font-bold text-slate-900 text-xs">
                                    {menuGroupLabels[group] || group}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-normal">
                                    ({perms.length} สิทธิ์)
                                  </span>
                                </div>
                              </td>
                            </tr>

                            {/* Permission Rows */}
                            {isExpanded &&
                              perms.map((p) => {
                                const ActionIcon =
                                  actionIcons[p.action_type] || Eye;
                                return (
                                  <tr
                                    key={p.permission_id}
                                    className="border-b border-slate-200/40 hover:bg-slate-50/50 transition-colors"
                                  >
                                    <td className="py-2 px-4 pl-12">
                                      <div className="flex items-center gap-2">
                                        <ActionIcon className="w-3 h-3 text-slate-400" />
                                        <span className="font-semibold text-slate-800">
                                          {p.permission_name}
                                        </span>
                                        <code className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[9px] font-mono">
                                          {p.permission_key}
                                        </code>
                                      </div>
                                    </td>
                                    {levels.map((lvl) => {
                                      const isActive = isRolePermissionActive(
                                        lvl.level_user_id,
                                        p.permission_id,
                                      );
                                      return (
                                        <td
                                          key={lvl.level_user_id}
                                          className="py-2 px-4 text-center"
                                        >
                                          <button
                                            onClick={() =>
                                              handleToggleRolePermission(
                                                lvl.level_user_id,
                                                p.permission_id,
                                              )
                                            }
                                            className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                                              isActive
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                                : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                                            }`}
                                            title={`คลิกเพื่อ${isActive ? "ปิด" : "เปิด"}สิทธิ์`}
                                          >
                                            {isActive ? (
                                              <>
                                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                <span>อนุญาต</span>
                                              </>
                                            ) : (
                                              <>
                                                <XCircle className="w-3 h-3 text-slate-400" />
                                                <span>ไม่อนุญาต</span>
                                              </>
                                            )}
                                          </button>
                                        </td>
                                      );
                                    })}
                                  </tr>
                                );
                              })}
                          </React.Fragment>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(permissions.length === 0 || levels.length === 0) && (
            <div className="tms-card p-8 text-center text-slate-400">
              {permissions.length === 0
                ? 'ยังไม่มีสิทธิ์ในระบบ — กรุณาเพิ่มสิทธิ์ก่อนในแท็บ "สิทธิ์"'
                : 'ยังไม่มีระดับผู้ใช้งาน — กรุณาเพิ่มระดับก่อนในแท็บ "ระดับผู้ใช้งาน"'}
            </div>
          )}
        </div>
      )}

      {/* ══════════ DRAWERS ══════════ */}

      {/* ─── User Drawer ─── */}
      <AnimatedDrawer
        isOpen={isUserDrawerOpen}
        onClose={() => setIsUserDrawerOpen(false)}
        title={editingUser ? "แก้ไขข้อมูลผู้ใช้งาน" : "เพิ่มผู้ใช้งานใหม่"}
        formId="user-form"
        onSubmit={handleSaveUser}
        submitLabel={editingUser ? "บันทึกการแก้ไข" : "บันทึกสร้างผู้ใช้งาน"}
        isDirty={isUserDirty}
      >
        {renderField(
          "ชื่อ - นามสกุล",
          true,
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="เช่น นาย สมชาย ขยันขับ"
            className={inputCls}
            required
          />,
        )}
        {renderField(
          "ชื่อผู้ใช้งาน (Username)",
          true,
          <input
            type="text"
            value={formUsername}
            onChange={(e) => setFormUsername(e.target.value)}
            disabled={!!editingUser}
            placeholder="เช่น driver_somchai"
            className={inputDisabledCls}
            required
          />,
        )}
        {renderField(
          `รหัสผ่าน (Password) ${editingUser ? "(เว้นว่างถ้าไม่ต้องการเปลี่ยน)" : ""}`,
          !editingUser,
          <input
            type="password"
            value={formPassword}
            onChange={(e) => setFormPassword(e.target.value)}
            placeholder="••••••••"
            className={inputCls}
          />,
        )}
        {renderField(
          "เบอร์โทรศัพท์",
          false,
          <input
            type="text"
            value={formPhone}
            onChange={(e) => setFormPhone(e.target.value)}
            placeholder="เช่น 0812345678"
            className={inputCls}
          />,
        )}
        {renderField(
          "ระดับผู้ใช้งาน (User Level)",
          true,
          <select
            value={formLevelId}
            onChange={(e) => setFormLevelId(Number(e.target.value))}
            className={inputCls}
          >
            {levels.map((l) => (
              <option key={l.level_user_id} value={l.level_user_id}>
                {l.level_user_name} ({l.access_name})
              </option>
            ))}
          </select>,
        )}
        {renderField(
          "สถานะผู้ใช้งาน",
          true,
          <select
            value={formStatus}
            onChange={(e) => setFormStatus(e.target.value as any)}
            className={inputCls}
          >
            <option value="active">ใช้งานอยู่ (Active)</option>
            <option value="inactive">ปิดการใช้งาน (Inactive)</option>
          </select>,
        )}
      </AnimatedDrawer>

      {/* ─── Level Drawer ─── */}
      <AnimatedDrawer
        isOpen={isLevelDrawerOpen}
        onClose={() => setIsLevelDrawerOpen(false)}
        title={editingLevel ? "แก้ไขระดับผู้ใช้งาน" : "เพิ่มระดับผู้ใช้งานใหม่"}
        formId="level-form"
        onSubmit={handleSaveLevel}
        submitLabel={editingLevel ? "บันทึกการแก้ไข" : "บันทึกสร้างระดับ"}
        isDirty={isLevelDirty}
      >
        {renderField(
          "ชื่อระดับผู้ใช้งาน (Role Name)",
          true,
          <input
            type="text"
            value={formLevelName}
            onChange={(e) => setFormLevelName(e.target.value)}
            placeholder="เช่น แอดมินระบบ, หัวหน้างาน"
            className={inputCls}
            required
          />,
        )}
        {renderField(
          "กลุ่มสิทธิ์ระบบ (Access Group)",
          true,
          <select
            value={formLevelAccessId}
            onChange={(e) => setFormLevelAccessId(Number(e.target.value))}
            className={inputCls}
          >
            {accesses.map((a) => (
              <option key={a.access_id} value={a.access_id}>
                {a.access_name}
              </option>
            ))}
          </select>,
        )}
        <div>
          <label className="text-slate-700 font-semibold block mb-2">
            สิทธิ์ออกใบปล่อยรถ
          </label>
          <button
            type="button"
            onClick={() => setFormLevelCarRelease(!formLevelCarRelease)}
            className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all inline-flex items-center gap-2 ${
              formLevelCarRelease
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
            }`}
          >
            {formLevelCarRelease ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> อนุญาตออกใบปล่อยรถ
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" /> ไม่อนุญาต
              </>
            )}
          </button>
        </div>
      </AnimatedDrawer>

      {/* ─── Permission Drawer ─── */}
      <AnimatedDrawer
        isOpen={isPermDrawerOpen}
        onClose={() => setIsPermDrawerOpen(false)}
        title={editingPerm ? "แก้ไขสิทธิ์" : "เพิ่มสิทธิ์ใหม่"}
        formId="perm-form"
        onSubmit={handleSavePerm}
        submitLabel={editingPerm ? "บันทึกการแก้ไข" : "บันทึกสร้างสิทธิ์"}
        isDirty={isPermDirty}
      >
        {renderField(
          "Permission Key",
          true,
          <input
            type="text"
            value={formPermKey}
            onChange={(e) => setFormPermKey(e.target.value)}
            placeholder="เช่น car_release.add, users.delete"
            className={`${inputCls} font-mono`}
            required
          />,
        )}
        {renderField(
          "ชื่อสิทธิ์ (Permission Name)",
          true,
          <input
            type="text"
            value={formPermName}
            onChange={(e) => setFormPermName(e.target.value)}
            placeholder="เช่น เพิ่มใบปล่อยรถ"
            className={inputCls}
            required
          />,
        )}
        {renderField(
          "กลุ่มเมนู (Menu Group)",
          false,
          <input
            type="text"
            value={formPermMenuGroup}
            onChange={(e) => setFormPermMenuGroup(e.target.value)}
            placeholder="เช่น car_release, users, stores"
            className={inputCls}
            list="menu-groups"
          />,
        )}
        <datalist id="menu-groups">
          {Object.keys(menuGroupLabels).map((g) => (
            <option key={g} value={g} />
          ))}
        </datalist>
        {renderField(
          "ประเภท Action",
          false,
          <select
            value={formPermActionType}
            onChange={(e) => setFormPermActionType(e.target.value)}
            className={inputCls}
          >
            <option value="">-- เลือกประเภท --</option>
            <option value="view">ดู (View)</option>
            <option value="add">เพิ่ม (Add)</option>
            <option value="edit">แก้ไข (Edit)</option>
            <option value="delete">ลบ (Delete)</option>
          </select>,
        )}
        {renderField(
          "คำอธิบาย",
          false,
          <textarea
            value={formPermDesc}
            onChange={(e) => setFormPermDesc(e.target.value)}
            placeholder="อธิบายสิทธิ์นี้..."
            rows={3}
            className={`${inputCls} resize-none`}
          />,
        )}
      </AnimatedDrawer>

      {/* ─── Access Drawer ─── */}
      <AnimatedDrawer
        isOpen={isAccessDrawerOpen}
        onClose={() => setIsAccessDrawerOpen(false)}
        title={editingAccess ? "แก้ไขกลุ่มสิทธิ์" : "เพิ่มกลุ่มสิทธิ์ใหม่"}
        formId="access-form"
        onSubmit={handleSaveAccess}
        submitLabel={
          editingAccess ? "บันทึกการแก้ไข" : "บันทึกสร้างกลุ่มสิทธิ์"
        }
        isDirty={isAccessDirty}
      >
        {renderField(
          "ชื่อกลุ่มสิทธิ์ (Access Name)",
          true,
          <input
            type="text"
            value={formAccessName}
            onChange={(e) => setFormAccessName(e.target.value)}
            placeholder="เช่น Admin, Manager, Driver & Staff"
            className={inputCls}
            required
          />,
        )}
        {renderField(
          "คำอธิบาย",
          false,
          <textarea
            value={formAccessDesc}
            onChange={(e) => setFormAccessDesc(e.target.value)}
            placeholder="อธิบายกลุ่มสิทธิ์นี้..."
            rows={3}
            className={`${inputCls} resize-none`}
          />,
        )}
      </AnimatedDrawer>

      {/* ══════════ CONFIRM MODALS ══════════ */}

      <ConfirmModal
        isOpen={!!userToDelete}
        title="ยืนยันการลบผู้ใช้งาน"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งาน "${userToDelete?.name}" (@${userToDelete?.username})? การดำเนินการนี้จะลบบัญชีและสิทธิ์การเข้าถึงออกจากระบบทันที`}
        confirmText="ยืนยันลบผู้ใช้"
        cancelText="ยกเลิก"
        isLoading={isDeleting}
        onConfirm={handleConfirmDeleteUser}
        onCancel={() => setUserToDelete(null)}
      />

      <ConfirmModal
        isOpen={!!levelToDelete}
        title="ยืนยันการลบระดับผู้ใช้งาน"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบระดับ "${levelToDelete?.level_user_name}"? ระดับนี้จะถูกลบออกจากระบบ พร้อมกับ Role Permission ที่ผูกไว้`}
        confirmText="ยืนยันลบระดับ"
        cancelText="ยกเลิก"
        isLoading={isDeletingLevel}
        onConfirm={handleConfirmDeleteLevel}
        onCancel={() => setLevelToDelete(null)}
      />

      <ConfirmModal
        isOpen={!!permToDelete}
        title="ยืนยันการลบสิทธิ์"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบสิทธิ์ "${permToDelete?.permission_name}" (${permToDelete?.permission_key})? สิทธิ์นี้จะถูกลบออกจากทุก Role ที่ผูกไว้`}
        confirmText="ยืนยันลบสิทธิ์"
        cancelText="ยกเลิก"
        isLoading={isDeletingPerm}
        onConfirm={handleConfirmDeletePerm}
        onCancel={() => setPermToDelete(null)}
      />

      <ConfirmModal
        isOpen={!!accessToDelete}
        title="ยืนยันการลบกลุ่มสิทธิ์"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบกลุ่มสิทธิ์ "${accessToDelete?.access_name}"?`}
        confirmText="ยืนยันลบกลุ่มสิทธิ์"
        cancelText="ยกเลิก"
        isLoading={isDeletingAccess}
        onConfirm={handleConfirmDeleteAccess}
        onCancel={() => setAccessToDelete(null)}
      />
    </div>
  );
};

export default Users;
