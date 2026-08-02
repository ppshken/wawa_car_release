import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Users as UsersIcon, Layers, KeyRound, Shield } from "lucide-react";

export const UsersSubNav: React.FC = () => {
  const { user } = useAuth();

  let permissions: Record<string, boolean> = {};
  if (user?.menu_permissions) {
    if (typeof user.menu_permissions === 'string') {
      try { permissions = JSON.parse(user.menu_permissions); } catch (e) {}
    } else if (typeof user.menu_permissions === 'object') {
      permissions = user.menu_permissions as Record<string, boolean>;
    }
  }

  const isAllowed = (key: string) => {
    if (Object.keys(permissions).length > 0) {
      if (permissions[key] !== undefined) return Boolean(permissions[key]);
      return false;
    }
    if (user?.level_user_id === 1) return true;
    return true;
  };

  const tabs = [
    { to: "/users", label: "ผู้ใช้งาน", icon: UsersIcon, key: "users" },
    { to: "/user-levels", label: "ระดับผู้ใช้งาน", icon: Layers, key: "user_levels" },
    { to: "/permissions", label: "สิทธิ์ระบบ", icon: KeyRound, key: "permissions" },
    { to: "/user-access", label: "กลุ่มการเข้าถึง", icon: Shield, key: "user_access" },
  ].filter((t) => isAllowed(t.key));

  return (
    <div className="flex bg-slate-100/80 p-1 rounded-lg gap-1 text-xs w-fit border border-slate-200/60 flex-wrap mb-4">
      {tabs.map((t) => {
        const Icon = t.icon;
        return (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === "/users"}
            className={({ isActive }) =>
              `px-4 py-1.5 rounded-md font-semibold transition-all flex items-center gap-2 ${
                isActive
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`
            }
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{t.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
};

export default UsersSubNav;
