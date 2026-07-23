import React from "react";
import { NavLink } from "react-router-dom";
import { Users as UsersIcon, Layers, KeyRound, Shield } from "lucide-react";

export const UsersSubNav: React.FC = () => {
  const tabs = [
    { to: "/users", label: "ผู้ใช้งาน", icon: UsersIcon },
    { to: "/user-levels", label: "ระดับผู้ใช้งาน", icon: Layers },
    { to: "/permissions", label: "สิทธิ์ระบบ", icon: KeyRound },
    { to: "/user-access", label: "กลุ่มการเข้าถึง", icon: Shield },
  ];

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
