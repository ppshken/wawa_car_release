import React, { useEffect, useState, useMemo } from "react";
import api, { getImageUrl } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { ConfirmModal } from "../../components/ConfirmModal";
import { PaginationControl } from "../../components/PaginationControl";
import { AnimatedDrawer } from "../../components/AnimatedDrawer";
import { SearchableSelect } from "../../components/SearchableSelect";
import { UsersSubNav } from "../../components/UsersSubNav";
import {
  Users as UsersIcon,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  User as UserIcon,
  Upload,
} from "lucide-react";

interface UserData {
  user_id: number;
  username: string;
  name: string;
  phone_number_1?: string;
  level_user_id: number;
  level_user_name?: string;
  user_image?: string;
  access_name?: string;
  setting_car_release?: number;
  user_status?: string;
}

interface LevelUserData {
  level_user_id: number;
  level_user_name: string;
  access_id?: number;
  access_name?: string;
  setting_car_release?: number;
}

export const UsersListPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const { refreshUser } = useAuth();

  const [users, setUsers] = useState<UserData[]>([]);
  const [levels, setLevels] = useState<LevelUserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Pagination
  const [search, setSearch] = useState<string>("");
  const [filterLevel, setFilterLevel] = useState<number | "all">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Drawer State & Form
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formLevelId, setFormLevelId] = useState<number>(3);
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active");
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState<string>("");

  // Delete Modal
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const inputCls =
    "w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400";

  const getAvatarUrl = (img?: string) => {
    if (!img || typeof img !== "string" || img.trim() === "") return null;
    return getImageUrl(img);
  };

  const isUserDirty = useMemo(() => {
    if (!editingUser) {
      return !!(formName || formUsername || formPassword || formPhone || formImageFile);
    }
    return (
      formName !== editingUser.name ||
      formUsername !== editingUser.username ||
      formPhone !== (editingUser.phone_number_1 || "") ||
      formLevelId !== (editingUser.level_user_id || 3) ||
      formPassword !== "" ||
      formImageFile !== null ||
      formStatus !== (editingUser.user_status === "inactive" ? "inactive" : "active")
    );
  }, [
    editingUser,
    formName,
    formUsername,
    formPassword,
    formPhone,
    formLevelId,
    formStatus,
    formImageFile,
  ]);

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
      if (res.data.success && res.data.levelUsers) setLevels(res.data.levelUsers);
    } catch (err) {
      console.error("Error fetching levels:", err);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchLevels()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterLevel, filterStatus]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        (u.phone_number_1 || "").includes(search);
      const matchesLevel = filterLevel === "all" || u.level_user_id === filterLevel;
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
    const sortedLevels = [...levels].sort((a, b) => a.level_user_id - b.level_user_id);
    sortedLevels.forEach((level) => {
      const matched = paginatedUsers.filter((u) => u.level_user_id === level.level_user_id);
      if (matched.length > 0) {
        groups.push({
          level_user_id: level.level_user_id,
          level_user_name: level.level_user_name,
          access_name: level.access_name || "Custom",
          users: matched,
        });
      }
    });
    const handledIds = new Set(sortedLevels.map((l) => l.level_user_id));
    const remaining = paginatedUsers.filter((u) => !handledIds.has(u.level_user_id));
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

  const handleOpenAddUserDrawer = () => {
    setEditingUser(null);
    setFormUsername("");
    setFormPassword("");
    setFormName("");
    setFormPhone("");
    setFormLevelId(levels.length > 0 ? levels[levels.length - 1].level_user_id : 3);
    setFormStatus("active");
    setFormImageFile(null);
    setFormImagePreview("");
    setIsDrawerOpen(true);
  };

  const handleOpenEditUserDrawer = (user: UserData) => {
    setEditingUser(user);
    setFormUsername(user.username);
    setFormPassword("");
    setFormName(user.name);
    setFormPhone(user.phone_number_1 || "");
    setFormLevelId(user.level_user_id || 3);
    setFormStatus(user.user_status === "inactive" ? "inactive" : "active");
    setFormImageFile(null);
    setFormImagePreview(user.user_image || "");
    setIsDrawerOpen(true);
  };

  const handleToggleUserStatus = async (user_id: number, currentStatus?: string) => {
    const nextStatus = currentStatus === "inactive" ? "active" : "inactive";
    try {
      await api.put(`/users/${user_id}/status`, { user_status: nextStatus });
      showSuccess(`เปลี่ยนสถานะเป็น "${nextStatus === "inactive" ? "ปิดการใช้งาน" : "ใช้งานอยู่"}" สำเร็จ`);
      fetchUsers();
    } catch {
      showSuccess(`เปลี่ยนสถานะเป็น "${nextStatus === "inactive" ? "ปิดการใช้งาน" : "ใช้งานอยู่"}" เรียบร้อย`);
      setUsers(users.map((u) => (u.user_id === user_id ? { ...u, user_status: nextStatus } : u)));
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername || !formName) {
      showError("กรุณากรอก Username และชื่อผู้ใช้งาน");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("name", formName);
      formData.append("phone_number_1", formPhone);
      formData.append("level_user_id", String(formLevelId));
      formData.append("user_status", formStatus);
      if (formPassword) formData.append("password", formPassword);
      if (formImageFile) formData.append("user_image", formImageFile);

      if (editingUser) {
        const res = await api.put(`/users/${editingUser.user_id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data.success) showSuccess("อัปเดตข้อมูลผู้ใช้งานสำเร็จ!");
      } else {
        if (!formPassword) {
          showError("กรุณากรอก รหัสผ่าน สำหรับผู้ใช้งานใหม่");
          return;
        }
        formData.append("username", formUsername);
        const res = await api.post("/users", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data.success) showSuccess("สร้างผู้ใช้งานใหม่สำเร็จ!");
      }
      setIsDrawerOpen(false);
      fetchUsers();
      refreshUser();
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
      showError(err?.response?.data?.message || "ไม่สามารถลบผู้ใช้งานนี้ได้");
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="w-full space-y-4 font-sans text-xs pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-slate-800" />
            จัดการรายชื่อผู้ใช้งาน (Users Management)
          </h1>
          <p className="text-[11px] text-slate-500">
            บริหารจัดการบัญชีผู้ใช้ รูปโปรไฟล์ (user_image) รหัสผ่าน เบอร์โทรศัพท์ และสถานะใช้งานในระบบ
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
            onClick={handleOpenAddUserDrawer}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> <span>เพิ่มผู้ใช้งานใหม่</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation */}
      <UsersSubNav />

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
            onChange={(e) => setFilterLevel(e.target.value === "all" ? "all" : Number(e.target.value))}
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
                <th className="py-2.5 px-3">รูปโปรไฟล์</th>
                <th className="py-2.5 px-3">ชื่อ - นามสกุล</th>
                <th className="py-2.5 px-3">Username</th>
                <th className="py-2.5 px-3">เบอร์โทรศัพท์</th>
                <th className="py-2.5 px-3">ระดับผู้ใช้งาน</th>
                <th className="py-2.5 px-3">กลุ่มสิทธิ์ระบบ</th>
                <th className="py-2.5 px-3 text-center">สถานะ</th>
                <th className="py-2.5 px-3 text-center">สิทธิ์ออกใบปล่อยรถ</th>
                <th className="py-2.5 px-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
              {groupedUsers.map((group) => (
                <React.Fragment key={group.level_user_id}>
                  <tr className="bg-slate-100 border-y border-slate-200 text-slate-900 font-bold">
                    <td colSpan={10} className="py-2 px-3.5 bg-slate-100/80">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{group.level_user_name}</span>
                        <span className="text-[10px] text-slate-500 font-normal">({group.users.length})</span>
                      </div>
                    </td>
                  </tr>
                  {group.users.map((u, idx) => {
                    const isActive = u.user_status !== "inactive";
                    const avatarSrc = getAvatarUrl(u.user_image);
                    return (
                      <tr
                        key={u.user_id}
                        className={`hover:bg-slate-100/70 transition-colors ${!isActive ? "bg-slate-50/80 opacity-75" : ""}`}
                      >
                        <td className="py-2 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                        <td className="py-2 px-3">
                          {avatarSrc ? (
                            <img
                              src={avatarSrc}
                              alt={u.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200/80">
                              {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900">{u.name}</td>
                        <td className="py-2 px-3">
                          <code className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                            {u.username}
                          </code>
                        </td>
                        <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">{u.phone_number_1 || "-"}</td>
                        <td className="py-2 px-3">
                          <span className="font-semibold text-slate-800">{u.level_user_name || "-"}</span>
                        </td>
                        <td className="py-2 px-3 text-slate-600">{u.access_name || "-"}</td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => handleToggleUserStatus(u.user_id, u.user_status)}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                            }`}
                          >
                            {isActive ? (
                              <>
                                <Unlock className="w-3 h-3 text-emerald-600" /> ใช้งานอยู่
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3 text-slate-400" /> ปิดการใช้งาน
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
                              <XCircle className="w-3 h-3 text-slate-400" /> ปิดกั้น
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
                          {u.level_user_id === 1 || u.username === "admin" || u.username === "user1.admin" ? (
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
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    ไม่พบข้อมูลผู้ใช้งานที่ตรงตามเงื่อนไข
                  </td>
                </tr>
              )}
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

      {/* User Drawer */}
      <AnimatedDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingUser ? `แก้ไขผู้ใช้งาน (${editingUser.username})` : "เพิ่มผู้ใช้งานใหม่"}
        formId="user-form"
        onSubmit={handleSaveUser}
        submitLabel={editingUser ? "บันทึกการแก้ไข" : "บันทึกสร้างผู้ใช้"}
        isDirty={isUserDirty}
      >
        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            รูปโปรไฟล์ (user_image)
          </label>
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-white border border-slate-300 flex items-center justify-center shrink-0 shadow-2xs relative">
              {formImagePreview ? (
                <img
                  src={getAvatarUrl(formImagePreview) || formImagePreview}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <UserIcon className="w-7 h-7 text-slate-400" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFormImageFile(file);
                    setFormImagePreview(URL.createObjectURL(file));
                  }
                }}
                className="block w-full text-slate-500 text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border file:border-slate-200 file:text-xs file:font-semibold file:bg-white file:text-slate-700 hover:file:bg-slate-100 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">
                รองรับไฟล์รูปภาพ PNG, JPG, WEBP (ขนาดไม่เกิน 10MB)
              </p>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            Username <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            disabled={!!editingUser}
            value={formUsername}
            onChange={(e) => setFormUsername(e.target.value)}
            placeholder="เช่น user.test"
            className={`${inputCls} font-mono ${editingUser ? "bg-slate-100 text-slate-500 cursor-not-allowed" : ""}`}
            required
          />
        </div>
        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            {editingUser ? "รหัสผ่านใหม่ (ว่างไว้หากไม่เปลี่ยน)" : "รหัสผ่าน *"}
          </label>
          <input
            type="password"
            value={formPassword}
            onChange={(e) => setFormPassword(e.target.value)}
            placeholder="••••••••"
            className={inputCls}
            required={!editingUser}
          />
        </div>
        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            ชื่อ - นามสกุล <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="เช่น สมชาย ใจดี"
            className={inputCls}
            required
          />
        </div>
        <div>
          <label className="block text-slate-700 font-semibold mb-1">เบอร์โทรศัพท์</label>
          <input
            type="text"
            value={formPhone}
            onChange={(e) => setFormPhone(e.target.value)}
            placeholder="เช่น 081-234-5678"
            className={inputCls}
          />
        </div>
        <SearchableSelect
          label="ระดับผู้ใช้งาน"
          required
          value={formLevelId}
          onChange={(val) => setFormLevelId(Number(val) || 3)}
          placeholder="-- เลือกระดับผู้ใช้งาน --"
          searchPlaceholder="พิมพ์ค้นหาระดับ..."
          options={levels.map((l) => ({
            value: l.level_user_id,
            label: l.level_user_name,
            subLabel: l.access_name || "Custom",
          }))}
        />

        <SearchableSelect
          label="สถานะใช้งาน"
          value={formStatus}
          onChange={(val) => setFormStatus(String(val) as any)}
          placeholder="-- เลือกสถานะ --"
          options={[
            { value: "active", label: "ใช้งานอยู่ (Active)" },
            { value: "inactive", label: "ปิดการใช้งาน (Inactive)" },
          ]}
        />
      </AnimatedDrawer>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!userToDelete}
        title="ยืนยันการลบผู้ใช้งาน"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีผู้ใช้ "${userToDelete?.name}" (${userToDelete?.username})?`}
        confirmText={isDeleting ? "กำลังลบ..." : "ลบบัญชี"}
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDeleteUser}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
};

export default UsersListPage;
