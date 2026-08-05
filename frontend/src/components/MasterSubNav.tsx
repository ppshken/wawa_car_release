import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Building,
  Key,
  Smartphone,
  CreditCard,
  Truck,
  MapPin,
  ShieldCheck,
  Layers,
  FileText,
  PackageCheck,
  Navigation,
  ListChecks,
  AlertTriangle,
} from "lucide-react";

export const MasterSubNav: React.FC = () => {
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
    { to: "/master/stores", label: "ร้านค้า", icon: Building, key: "stores" },
    { to: "/master/keys", label: "ที่ฝากกุญแจ", icon: Key, key: "keys" },
    { to: "/master/pda", label: "เครื่อง PDA", icon: Smartphone, key: "pda" },
    { to: "/master/payments", label: "การชำระเงิน", icon: CreditCard, key: "payments" },
    { to: "/master/vehicles", label: "รถ", icon: Truck, key: "vehicles" },
    { to: "/master/parking", label: "ที่จอด", icon: MapPin, key: "parking" },
    { to: "/master/accounting-status", label: "สถานะทางบัญชี", icon: ShieldCheck, key: "accounting_status" },
    { to: "/master/position-product", label: "ตำแหน่งวางสินค้า", icon: Layers, key: "position_product" },
    { to: "/master/release-types", label: "ประเภทการปล่อยรถ", icon: FileText, key: "release_types" },
    { to: "/master/loading-types", label: "ประเภทการโหลด", icon: PackageCheck, key: "loading_types" },
    { to: "/master/gps-distance", label: "ระยะห่าง GPS", icon: Navigation, key: "gps_distance" },
    { to: "/master/operation-menus", label: "เมนูการดำเนินงาน", icon: ListChecks, key: "operation_menus" },
    { to: "/master/problem-types", label: "ประเภทปัญหา", icon: AlertTriangle, key: "problem_types" },
  ].filter((t) => isAllowed(t.key));

  return (
    <div className="flex border-b border-slate-200 bg-slate-100/70 p-1 rounded-lg gap-1 overflow-x-auto custom-scrollbar mb-4 flex-wrap">
      {tabs.map((t) => {
        const Icon = t.icon;
        return (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `px-3.5 py-1.5 rounded-md font-semibold transition-all flex items-center gap-2 text-xs shrink-0 ${
                isActive
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
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

export default MasterSubNav;
