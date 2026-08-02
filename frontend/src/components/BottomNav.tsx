import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import {
  LayoutDashboard,
  Truck,
  Map,
  Layers,
  Menu,
  X,
  User,
} from "lucide-react";

export const BottomNav: React.FC = () => {
  const { user } = useAuth();
  const { mobileOpen, toggleMobile } = useSidebar();
  const location = useLocation();

  // Parse permissions
  let permissions: Record<string, boolean> = {};
  if (user?.menu_permissions) {
    if (typeof user.menu_permissions === "string") {
      try {
        permissions = JSON.parse(user.menu_permissions);
      } catch (e) {}
    } else if (typeof user.menu_permissions === "object") {
      permissions = user.menu_permissions as Record<string, boolean>;
    }
  }

  const isMenuAllowed = (key?: string) => {
    if (!key) return true;
    if (Object.keys(permissions).length > 0) {
      if (permissions[key] !== undefined) {
        return Boolean(permissions[key]);
      }
      return false;
    }
    return true;
  };

  const navItems = [
    {
      to: "/",
      label: "แดชบอร์ด",
      icon: LayoutDashboard,
      key: "dashboard",
    },
    {
      to: "/releases",
      label: "ใบปล่อยรถ",
      icon: Truck,
      key: "releases",
    },
    {
      to: "/route",
      label: "จัดสายส่ง",
      icon: Map,
      key: "route",
    },
    {
      to: "/master/operation-menu",
      label: "มาสเตอร์",
      icon: Layers,
      key: "master_operation",
    },
  ].filter((item) => isMenuAllowed(item.key));

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] px-2 py-1.5 flex items-center justify-around select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.to === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(item.to);

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive: isLinkActive }) => {
              const active = isActive || isLinkActive;
              return `flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 ${
                active
                  ? "text-slate-900 font-bold scale-105"
                  : "text-slate-500 hover:text-slate-800 font-medium"
              }`;
            }}
          >
            {({ isActive: isLinkActive }) => {
              const active = isActive || isLinkActive;
              return (
                <>
                  <div
                    className={`relative p-1 rounded-lg transition-colors ${
                      active ? "bg-slate-100 text-slate-900" : ""
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[64px]">
                    {item.label}
                  </span>
                </>
              );
            }}
          </NavLink>
        );
      })}

      {/* Menu Drawer Toggle Button */}
      <button
        type="button"
        onClick={toggleMobile}
        className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 ${
          mobileOpen
            ? "text-slate-900 font-bold scale-105"
            : "text-slate-500 hover:text-slate-800 font-medium"
        }`}
      >
        <div
          className={`p-1 rounded-lg transition-colors ${
            mobileOpen ? "bg-slate-100 text-slate-900" : ""
          }`}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </div>
        <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[64px]">
          เมนูทั้งหมด
        </span>
      </button>
    </nav>
  );
};

export default BottomNav;
