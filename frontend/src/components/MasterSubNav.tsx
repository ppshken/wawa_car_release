import React from "react";
import { NavLink } from "react-router-dom";
import {
  Building,
  Key,
  Smartphone,
  CreditCard,
  Truck,
  MapPin,
  ShieldCheck,
  Layers,
} from "lucide-react";

export const MasterSubNav: React.FC = () => {
  const tabs = [
    { to: "/master/stores", label: "ร้านค้า", icon: Building },
    { to: "/master/keys", label: "ที่ฝากกุญแจ", icon: Key },
    { to: "/master/pda", label: "เครื่อง PDA", icon: Smartphone },
    { to: "/master/payments", label: "การชำระเงิน", icon: CreditCard },
    { to: "/master/vehicles", label: "รถ", icon: Truck },
    { to: "/master/parking", label: "ที่จอด", icon: MapPin },
    { to: "/master/accounting-status", label: "สถานะทางบัญชี", icon: ShieldCheck },
    { to: "/master/position-product", label: "ตำแหน่งวางสินค้า", icon: Layers },
  ];

  return (
    <div className="flex border-b border-slate-200 bg-slate-100/70 p-1 rounded-lg gap-1 overflow-x-auto custom-scrollbar mb-4">
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
