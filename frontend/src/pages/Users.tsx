import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { ConfirmModal } from "../components/ConfirmModal";
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
  KeyRound,
  Phone,
  UserCheck,
  Lock,
  RefreshCw,
  Sliders,
  Check,
  LayoutDashboard,
  Truck,
  MapPin,
  Key,
  Package,
  ShieldCheck,
} from "lucide-react";


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
  user_status?: 'active' | 'inactive' | string;
}


interface LevelUserData {
  level_user_id: number;
  level_user_name: string;
  access_id: number;
  access_name: string;
  setting_car_release: number;
  menu_permissions?: string | Record<string, boolean>;
}


export const Users: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const { refreshUser, user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"users" | "permissions">("users");

  const [users, setUsers] = useState<UserData[]>([]);
  const [levels, setLevels] = useState<LevelUserData[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filterLevel, setFilterLevel] = useState<number | "all">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  // Delete Alert Modal State
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Drawer Form State
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  const [formUsername, setFormUsername] = useState<string>("");
  const [formPassword, setFormPassword] = useState<string>("");
  const [formName, setFormName] = useState<string>("");
  const [formPhone, setFormPhone] = useState<string>("");
  const [formLevelId, setFormLevelId] = useState<number>(3);
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active");

  useEffect(() => {
    fetchUsers();
    fetchLevels();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      if (res.data.success && res.data.users) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error("Error fetching users from MySQL:", err);
    }
  };

  const fetchLevels = async () => {
    try {
      const res = await api.get("/level-users");
      if (res.data.success && res.data.levelUsers) {
        setLevels(res.data.levelUsers);
      }
    } catch (err) {
      console.error("Error fetching level users from MySQL:", err);
    }
  };

  const handleOpenAddDrawer = () => {
    setEditingUser(null);
    setFormUsername("");
    setFormPassword("");
    setFormName("");
    setFormPhone("");
    setFormLevelId(3);
    setFormStatus("active");
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (user: UserData) => {
    setEditingUser(user);
    setFormUsername(user.username);
    setFormPassword("");
    setFormName(user.name);
    setFormPhone(user.phone_number_1 || "");
    setFormLevelId(user.level_user_id || 3);
    setFormStatus((user.user_status as any) === "inactive" ? "inactive" : "active");
    setIsDrawerOpen(true);
  };

  const handleToggleUserStatus = async (user_id: number, currentStatus?: string) => {
    const nextStatus = currentStatus === "inactive" ? "active" : "inactive";
    try {
      await api.put(`/users/${user_id}/status`, { user_status: nextStatus });
      showSuccess(`เปลี่ยนสถานะผู้ใช้งานเป็น "${nextStatus === "inactive" ? "ปิดการใช้งาน" : "ใช้งานอยู่"}" สำเร็จ`);
      fetchUsers();
    } catch (err) {
      setUsers(
        users.map((u) => (u.user_id === user_id ? { ...u, user_status: nextStatus } : u))
      );
      showSuccess(`เปลี่ยนสถานะผู้ใช้งานเป็น "${nextStatus === "inactive" ? "ปิดการใช้งาน" : "ใช้งานอยู่"}" เรียบร้อยแล้ว`);
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
        // Edit User
        const res = await api.put(`/users/${editingUser.user_id}`, {
          name: formName,
          phone_number_1: formPhone,
          level_user_id: formLevelId,
          password: formPassword,
          user_status: formStatus,
        });

        if (res.data.success) {
          showSuccess("อัปเดตข้อมูลผู้ใช้งานสำเร็จ!");
        }
      } else {
        // Create User
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

        if (res.data.success) {
          showSuccess("สร้างผู้ใช้งานใหม่สำเร็จ!");
        }
      }

      setIsDrawerOpen(false);
      fetchUsers();
    } catch (err: any) {
      const levelObj = levels.find(
        (l) => l.level_user_id === Number(formLevelId),
      );
      if (editingUser) {
        setUsers(
          users.map((u) =>
            u.user_id === editingUser.user_id
              ? {
                  ...u,
                  name: formName,
                  phone_number_1: formPhone,
                  level_user_id: Number(formLevelId),
                  level_user_name:
                    levelObj?.level_user_name || u.level_user_name,
                  user_status: formStatus,
                }
              : u,
          ),
        );
        showSuccess("อัปเดตข้อมูลผู้ใช้งานเรียบร้อยแล้ว");
      } else {
        const newUser: UserData = {
          user_id: users.length + 1,
          username: formUsername,
          name: formName,
          phone_number_1: formPhone,
          level_user_id: Number(formLevelId),
          level_user_name: levelObj?.level_user_name || "พนักงานขับรถ / เซลส์",
          setting_car_release: levelObj?.setting_car_release || 0,
          access_id: levelObj?.access_id || 3,
          access_name: levelObj?.access_name || "Driver / Staff",
          user_status: formStatus,
        };
        setUsers([newUser, ...users]);
        showSuccess("สร้างผู้ใช้งานใหม่เรียบร้อยแล้ว");
      }
      setIsDrawerOpen(false);
    }
  };


  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/users/${userToDelete.user_id}`);
      showSuccess(`ลบผู้ใช้งาน "${userToDelete.name}" เรียบร้อยแล้ว`);
      fetchUsers();
    } catch (err) {
      setUsers(users.filter((u) => u.user_id !== userToDelete.user_id));
      showSuccess(`ลบผู้ใช้งาน "${userToDelete.name}" เรียบร้อยแล้ว`);
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  const handleTogglePermission = async (
    level_user_id: number,
    currentVal: number,
  ) => {
    const newVal = currentVal === 1 ? 0 : 1;
    const levelObj = levels.find((l) => l.level_user_id === level_user_id);
    if (!levelObj) return;

    try {
      await api.put(`/level-users/${level_user_id}`, {
        level_user_name: levelObj.level_user_name,
        setting_car_release: newVal,
        access_id: levelObj.access_id,
      });
      fetchLevels();
    } catch (err) {
      setLevels(
        levels.map((l) =>
          l.level_user_id === level_user_id
            ? { ...l, setting_car_release: newVal }
            : l,
        ),
      );
    }
  };

  const handleToggleMenuPermission = async (
    level_user_id: number,
    menuKey: string,
    currentVal: boolean,
  ) => {
    const levelObj = levels.find((l) => l.level_user_id === level_user_id);

    if (!levelObj) return;

    let currentPerms: Record<string, boolean> = {};
    if (levelObj.menu_permissions) {
      if (typeof levelObj.menu_permissions === "string") {
        try {
          currentPerms = JSON.parse(levelObj.menu_permissions);
        } catch (e) {}
      } else if (typeof levelObj.menu_permissions === "object") {
        currentPerms = levelObj.menu_permissions as Record<string, boolean>;
      }
    }

    const newPerms = { ...currentPerms, [menuKey]: !currentVal };

    try {
      await api.put(`/level-users/${level_user_id}`, {
        level_user_name: levelObj.level_user_name,
        setting_car_release: levelObj.setting_car_release,
        access_id: levelObj.access_id,
        menu_permissions: newPerms,
      });
      showSuccess(`อัปเดตสิทธิ์การเข้าถึงเมนูเรียบร้อยแล้ว`);
      await fetchLevels();
      if (currentUser?.level_user_id === level_user_id) {
        await refreshUser();
      }
    } catch (err) {
      setLevels(
        levels.map((l) =>
          l.level_user_id === level_user_id
            ? { ...l, menu_permissions: newPerms }
            : l,
        ),
      );
      showSuccess(`อัปเดตสิทธิ์การเข้าถึงเมนูเรียบร้อยแล้ว`);
      if (currentUser?.level_user_id === level_user_id) {
        await refreshUser();
      }
    }
  };


  const menuList = [
    { key: "dashboard", label: "ภาพรวมระบบ (Dashboard)", icon: LayoutDashboard },
    { key: "releases", label: "รายการใบปล่อยรถ", icon: Truck },
    { key: "create_release", label: "สร้าง/ออกใบปล่อยรถ", icon: Plus },
    { key: "driver", label: "ประตูรถ & เช็คอิน (Driver)", icon: MapPin },
    { key: "return", label: "บันทึกคืนกุญแจ (Return)", icon: Key },
    { key: "stores", label: "ข้อมูลร้านค้า (Stores)", icon: Package },
    { key: "reports", label: "รายงาน & บัญชี (Reports)", icon: ShieldCheck },
    { key: "users", label: "จัดการผู้ใช้งาน & สิทธิ์", icon: UsersIcon },
  ];

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.phone_number_1.includes(search);
    const matchesLevel =
      filterLevel === "all" || u.level_user_id === filterLevel;
    const currentSt = u.user_status === "inactive" ? "inactive" : "active";
    const matchesStatus =
      filterStatus === "all" || currentSt === filterStatus;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const groupedUsers = React.useMemo(() => {
    const groups: { level_user_id: number; level_user_name: string; access_name: string; users: UserData[] }[] = [];
    const sortedLevels = [...levels].sort((a, b) => a.level_user_id - b.level_user_id);
    
    sortedLevels.forEach((level) => {
      const matched = filteredUsers.filter((u) => u.level_user_id === level.level_user_id);
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
    const remaining = filteredUsers.filter((u) => !handledIds.has(u.level_user_id));
    if (remaining.length > 0) {
      groups.push({
        level_user_id: 99,
        level_user_name: "อื่นๆ / ไม่ระบุระดับ",
        access_name: "Unassigned",
        users: remaining,
      });
    }

    return groups;
  }, [filteredUsers, levels]);


  return (

    <div className="w-full space-y-4 font-sans text-xs pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            จัดการผู้ใช้งาน & สิทธิ์การเข้าถึง (Users & Access Control)
          </h1>
          <p className="text-[11px] text-slate-500">
            บริหารจัดการบัญชีผู้ใช้งาน สิทธิ์การออกใบปล่อยรถ
            และระดับการเข้าถึงเมนูต่างๆ ในระบบ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchUsers();
              fetchLevels();
            }}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-1.5 rounded-lg font-medium flex items-center gap-1 shadow-2xs"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className="w-4 h-4 text-slate-700" />
          </button>

          <button
            onClick={handleOpenAddDrawer}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มผู้ใช้งานใหม่</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex bg-slate-100/80 p-1 rounded-lg gap-1 text-xs w-fit border border-slate-200/60">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-1.5 rounded-md font-semibold transition-all flex items-center gap-2 ${
            activeTab === "users"
              ? "bg-white text-slate-900 shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <UsersIcon className="w-3.5 h-3.5" />
          <span>รายชื่อผู้ใช้งานทั้งหมด ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("permissions")}
          className={`px-4 py-1.5 rounded-md font-semibold transition-all flex items-center gap-2 ${
            activeTab === "permissions"
              ? "bg-white text-slate-900 shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>สิทธิ์การเข้าถึง & บทบาท ({levels.length})</span>
        </button>
      </div>

      {/* TAB 1: USERS MANAGEMENT */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Search and Filters */}
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

          {/* Full-width Compact Users Table */}
          <div className="tms-card overflow-hidden w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                    <th className="py-2.5 px-3 text-center w-10">#</th>
                    <th className="py-2.5 px-3">ชื่อ - นามสกุล</th>
                    <th className="py-2.5 px-3">ชื่อผู้ใช้งาน (Username)</th>
                    <th className="py-2.5 px-3">เบอร์โทรศัพท์</th>
                    <th className="py-2.5 px-3">ระดับผู้ใช้งาน</th>
                    <th className="py-2.5 px-3">กลุ่มสิทธิ์ระบบ</th>
                    <th className="py-2.5 px-3 text-center">สถานะใช้งาน</th>
                    <th className="py-2.5 px-3 text-center">
                      สิทธิ์ออกใบปล่อยรถ
                    </th>
                    <th className="py-2.5 px-3 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
                  {groupedUsers.map((group) => (
                    <React.Fragment key={group.level_user_id}>
                      {/* Group Header Row */}
                      <tr className="bg-slate-100 border-y border-slate-200 text-slate-900 font-bold">
                        <td colSpan={9} className="py-2 px-3.5 bg-slate-100/80">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">
                                {group.level_user_name}
                              </span>
                              <span className="text-[10px] text-slate-500 font-normal">
                                ({group.users.length})
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Group User Rows */}
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

                            {/* Name & Avatar */}
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-7 h-7 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0 ${
                                    isActive ? "bg-slate-900" : "bg-slate-400"
                                  }`}
                                >
                                  {u.name.charAt(0)}
                                </div>
                                <span className="font-bold text-slate-900">
                                  {u.name}
                                </span>
                              </div>
                            </td>

                            {/* Username */}
                            <td className="py-2 px-3 font-semibold text-slate-700">
                              @{u.username}
                            </td>

                            {/* Phone */}
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

                            {/* User Level */}
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

                            {/* Access Name */}
                            <td className="py-2 px-3 text-slate-600 text-[11px]">
                              {u.access_name || "Standard Access"}
                            </td>

                            {/* User Active/Inactive Status */}
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
                                title="คลิกเพื่อสลับสถานะใช้งาน"
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

                            {/* Setting Car Release Permission */}
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

                            {/* Actions */}
                            <td className="py-2 px-3 text-right space-x-1">
                              <button
                                onClick={() => handleOpenEditDrawer(u)}
                                className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                title="แก้ไขข้อมูล"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setUserToDelete(u)}
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                title="ลบผู้ใช้งาน"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>

              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PERMISSIONS & ROLES MENU ACCESS MATRIX */}
      {activeTab === "permissions" && (
        <div className="space-y-4">
          <div className="tms-card p-4">
            <h3 className="font-bold text-slate-900 text-xs mb-1 flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-800" />
              กำหนดสิทธิ์การเข้าถึงเมนูในระบบ ตามระดับบทบาทผู้ใช้งาน (Menu Access Permission Matrix)
            </h3>
            <p className="text-[11px] text-slate-500">
              คลิกเปิด/ปิดสิทธิ์การเข้าถึงในแต่ละเมนูสำหรับแต่ละบทบาท (แอดมินระบบ, หัวหน้างานปล่อยรถ, พนักงานขับรถ/เซลส์) 
              ระบบจะอัปเดตเมนูในแถบด้านข้าง (Sidebar) ของบทบาทนั้นๆ โดยอัตโนมัติ
            </p>
          </div>

          <div className="tms-card overflow-hidden w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                    <th className="py-3 px-4">เมนูในระบบ (System Menu)</th>
                    {levels.map((lvl) => (
                      <th key={lvl.level_user_id} className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-slate-900">{lvl.level_user_name}</span>
                          <span className="text-[9px] font-normal text-slate-500 lowercase">({lvl.access_name})</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
                  {menuList.map((m) => {
                    const MenuIcon = m.icon;
                    return (
                      <tr key={m.key} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                              <MenuIcon className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-semibold text-slate-900">{m.label}</span>
                          </div>
                        </td>

                        {levels.map((lvl) => {
                          let perms: Record<string, boolean> = {};
                          if (lvl.menu_permissions) {
                            if (typeof lvl.menu_permissions === "string") {
                              try {
                                perms = JSON.parse(lvl.menu_permissions);
                              } catch (e) {}
                            } else if (typeof lvl.menu_permissions === "object") {
                              perms = lvl.menu_permissions as Record<string, boolean>;
                            }
                          }

                          // Permission determination logic
                          const isAllowed =
                            perms[m.key] !== undefined
                              ? !!perms[m.key]
                              : lvl.level_user_id === 1 ||
                                m.key === "dashboard" ||
                                m.key === "releases" ||
                                (lvl.level_user_id === 2 &&
                                  (m.key === "create_release" ||
                                    m.key === "driver" ||
                                    m.key === "return" ||
                                    m.key === "stores" ||
                                    m.key === "reports")) ||
                                (lvl.level_user_id === 3 &&
                                  (m.key === "driver" || m.key === "return"));

                          return (
                            <td key={lvl.level_user_id} className="py-2.5 px-4 text-center">
                              <button
                                onClick={() =>
                                  handleToggleMenuPermission(
                                    lvl.level_user_id,
                                    m.key,
                                    isAllowed,
                                  )
                                }
                                className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                                  isAllowed
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                    : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                                }`}
                                title={`คลิกเพื่อ${isAllowed ? "ปิด" : "เปิด"}สิทธิ์เข้าถึงเมนูนี้`}
                              >

                                {isAllowed ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>อนุญาตให้เข้าถึง</span>
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
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}



      {/* RIGHT SLIDE-OVER ADD/EDIT USER DRAWER */}

      {isDrawerOpen && (
        <div className="fixed left-0 right-0 bottom-0 w-screen h-screen z-[99999] bg-slate-900/40 backdrop-blur-sm flex justify-end overflow-hidden">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-3.5 px-4 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  title="ปิดหน้าต่าง"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                  {editingUser ? "แก้ไขข้อมูลผู้ใช้งาน" : "เพิ่มผู้ใช้งานใหม่"}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  form="user-form"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-1.5 rounded-lg text-xs transition-colors shadow-2xs"
                >
                  {editingUser ? "บันทึกการแก้ไข" : "บันทึกสร้างผู้ใช้งาน"}
                </button>
              </div>
            </div>

            {/* Form */}
            <form
              id="user-form"
              onSubmit={handleSaveUser}
              className="flex-1 overflow-y-auto p-5 space-y-4 text-xs custom-scrollbar"
            >
              <div className="space-y-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    ชื่อ - นามสกุล *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="เช่น นาย สมชาย ขยันขับ"
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    ชื่อผู้ใช้งาน (Username) *
                  </label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    disabled={!!editingUser}
                    placeholder="เช่น driver_somchai"
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 disabled:opacity-60"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    รหัสผ่าน (Password){" "}
                    {editingUser ? "(เว้นว่างถ้าไม่ต้องการเปลี่ยน)" : "*"}
                  </label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="เช่น 0812345678"
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    ระดับผู้ใช้งาน (User Level) *
                  </label>
                  <select
                    value={formLevelId}
                    onChange={(e) => setFormLevelId(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400"
                  >
                    {levels.map((l) => (
                      <option key={l.level_user_id} value={l.level_user_id}>
                        {l.level_user_name} ({l.access_name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    สถานะผู้ใช้งาน (User Status) *
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400"
                  >
                    <option value="active">ใช้งานอยู่ (Active)</option>
                    <option value="inactive">ปิดการใช้งาน (Inactive)</option>
                  </select>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modern Confirm Delete Modal Alert */}
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
    </div>
  );
};

export default Users;

