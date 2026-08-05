import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import {
  LayoutDashboard,
  Truck,
  FileText,
  MapPin,
  User,
  Package,
  MapPinOff,
  Navigation,
  Upload,
  Smartphone,
  Receipt,
  RotateCcw,
  Send,
  Building,
  ShieldCheck,
  CreditCard,
  Grid,
  Coins,
  Key,
  Users,
  Layers,
  KeyRound,
  Shield,
  ChevronsLeft,
  ChevronsRight,
  X,
  Map,
  DownloadCloud,
  BarChart3,
  ListChecks,
  AlertTriangle,
  History,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { collapsed, mobileOpen, toggleCollapsed, closeMobile } = useSidebar();
  const location = useLocation();

  // Close mobile drawer on navigation
  React.useEffect(() => {
    closeMobile();
  }, [location.pathname, closeMobile]);

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
    if (!key) return true; // Items without key (e.g. profile) always shown
    if (Object.keys(permissions).length > 0) {
      if (permissions[key] !== undefined) {
        return Boolean(permissions[key]);
      }
      return false; // If permissions configuration exists, unlisted menu is NOT allowed
    }
    if (user?.level_user_id === 1) return true; // Default fallback for Level 1 Admin
    return true;
  };

  const mainNavItems = [
    { to: "/", label: "แดชบอร์ด", icon: LayoutDashboard, key: "dashboard" },
    { to: "/releases", label: "ใบปล่อยรถ", icon: Truck, key: "releases" },
    { to: "/route", label: "จัดรถ & เส้นทาง", icon: Map, key: "route" },
    {
      to: "/import-optimo",
      label: "นำเข้า OptimoRoute",
      icon: DownloadCloud,
      key: "import_optimo",
    },
    { to: "/profile", label: "โปรไฟล์", icon: User },
  ].filter((item) => isMenuAllowed(item.key));

  const userNavItems = [
    { to: "/users", label: "ผู้ใช้งาน", icon: Users, key: "users" },
    {
      to: "/user-levels",
      label: "ระดับผู้ใช้งาน",
      icon: Layers,
      key: "user_levels",
    },
    {
      to: "/permissions",
      label: "สิทธิ์ระบบ",
      icon: KeyRound,
      key: "permissions",
    },
    {
      to: "/user-access",
      label: "กลุ่มการเข้าถึง",
      icon: Shield,
      key: "user_access",
    },
  ].filter((item) => isMenuAllowed(item.key));

  const masterNavItems = [
    { to: "/master/stores", label: "ร้านค้า", icon: Building, key: "stores" },
    { to: "/master/keys", label: "ที่ฝากกุญแจ", icon: Key, key: "keys" },
    { to: "/master/pda", label: "เครื่อง PDA", icon: Smartphone, key: "pda" },
    {
      to: "/master/payments",
      label: "การชำระเงิน",
      icon: CreditCard,
      key: "payments",
    },
    { to: "/master/vehicles", label: "รถ", icon: Truck, key: "vehicles" },
    { to: "/master/parking", label: "ที่จอด", icon: MapPin, key: "parking" },
    {
      to: "/master/accounting-status",
      label: "สถานะทางบัญชี",
      icon: ShieldCheck,
      key: "accounting_status",
    },
    {
      to: "/master/position-product",
      label: "ตำแหน่งวางสินค้า",
      icon: Grid,
      key: "position_product",
    },
    {
      to: "/master/release-types",
      label: "ประเภทการปล่อยรถ",
      icon: FileText,
      key: "release_types",
    },
    {
      to: "/master/loading-types",
      label: "ประเภทการโหลด",
      icon: Package,
      key: "loading_types",
    },
    {
      to: "/master/gps-distance",
      label: "ระยะห่าง GPS",
      icon: Navigation,
      key: "gps_distance",
    },
    {
      to: "/master/operation-menus",
      label: "เมนูการดำเนินงาน",
      icon: ListChecks,
      key: "operation_menus",
    },
    {
      to: "/master/problem-types",
      label: "ประเภทปัญหา",
      icon: AlertTriangle,
      key: "problem_types",
    },
  ].filter((item) => isMenuAllowed(item.key));

  const settingNavItems = [
    { to: "/reports", label: "รายงานระบบ", icon: BarChart3, key: "reports" },
    { to: "/audit-log", label: "Audit Log", icon: History, key: "reports" },
    { to: "/api-keys", label: "จัดการ API Key", icon: Key, key: "api-key" },
  ].filter((item) => isMenuAllowed(item.key));

  const otherNavItems = [
    { to: "/routes", label: "จัดรถ & เส้นทาง", icon: Package, key: "routes" },
    {
      to: "/offsite",
      label: "เช็คสินค้านอกพิกัด",
      icon: MapPinOff,
      key: "offsite",
    },
    {
      to: "/import-photos",
      label: "นำเข้ารูปรถ",
      icon: Upload,
      key: "import_photos",
    },
    {
      to: "/sales-orders",
      label: "ใบสั่งขาย",
      icon: Receipt,
      key: "sales_orders",
    },
    {
      to: "/return-orders",
      label: "ใบคืนสินค้า",
      icon: RotateCcw,
      key: "return_orders",
    },
    {
      to: "/return-delivery",
      label: "ส่งคืนสินค้า",
      icon: Send,
      key: "return_delivery",
    },
    { to: "/creditors", label: "เจ้าหนี้", icon: Building, key: "creditors" },
    { to: "/debtors", label: "ลูกหนี้", icon: CreditCard, key: "debtors" },
    { to: "/storage", label: "ตำแหน่งวางสินค้า", icon: Grid, key: "storage" },
    { to: "/allowances", label: "เบี้ยเลี้ยง", icon: Coins, key: "allowances" },
  ].filter((item) => isMenuAllowed(item.key));

  const renderNavLink = (
    item: { to: string; label: string; icon: any },
    isMobile: boolean,
  ) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.to === "/"}
        title={collapsed && !isMobile ? item.label : undefined}
        className={({ isActive }) =>
          `flex items-center ${collapsed && !isMobile ? "justify-center" : ""} gap-3 ${collapsed && !isMobile ? "px-0 py-2" : "px-3 py-1.5"} rounded-md font-medium transition-all group relative ${
            isActive
              ? "bg-slate-900 text-white shadow-sm font-semibold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`
        }
      >
        <Icon className="w-4 h-4 shrink-0" />
        {(!collapsed || isMobile) && <span>{item.label}</span>}

        {/* Tooltip for collapsed mode */}
        {collapsed && !isMobile && (
          <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-slate-900 text-white text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-lg pointer-events-none">
            {item.label}
            <span className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
          </span>
        )}
      </NavLink>
    );
  };

  const sidebarContent = (isMobile: boolean) => (
    <>
      <div className="overflow-y-auto px-2 space-y-3 custom-scrollbar flex-1 py-1">
        {/* Section 1: Main Menu */}
        <div>
          {(!collapsed || isMobile) && (
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1 mt-1">
              เมนูหลัก
            </div>
          )}
          <div>
            {mainNavItems.map((item) => renderNavLink(item, isMobile))}
          </div>
        </div>

        {/* Section 2: User Management Header & Items */}
        {userNavItems.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            {(!collapsed || isMobile) && (
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1 flex items-center justify-between">
                <span>จัดการผู้ใช้งาน</span>
                <span className="bg-slate-200/70 text-slate-700 text-[9px] px-1.5 py-0.2 rounded font-mono font-normal">
                  {userNavItems.length}
                </span>
              </div>
            )}
            <div>
              {userNavItems.map((item) => renderNavLink(item, isMobile))}
            </div>
          </div>
        )}

        {/* Section 3: Master Data Header & Items */}
        {masterNavItems.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            {(!collapsed || isMobile) && (
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1 flex items-center justify-between">
                <span>ข้อมูลมาสเตอร์</span>
                <span className="bg-slate-200/70 text-slate-700 text-[9px] px-1.5 py-0.2 rounded font-mono font-normal">
                  {masterNavItems.length}
                </span>
              </div>
            )}
            <div>
              {masterNavItems.map((item) => renderNavLink(item, isMobile))}
            </div>
          </div>
        )}

        {/* Section 4: Setting Header & Items */}
        {settingNavItems.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            {(!collapsed || isMobile) && (
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1 flex items-center justify-between">
                <span>การตั้งค่า</span>
                <span className="bg-slate-200/70 text-slate-700 text-[9px] px-1.5 py-0.2 rounded font-mono font-normal">
                  {settingNavItems.length}
                </span>
              </div>
            )}
            <div>
              {settingNavItems.map((item) => renderNavLink(item, isMobile))}
            </div>
          </div>
        )}

        {/* Section 5: Other Operations */}
        {otherNavItems.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            {(!collapsed || isMobile) && (
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1">
                การจัดการอื่นๆ
              </div>
            )}
            <div>
              {otherNavItems.map((item) => renderNavLink(item, isMobile))}
            </div>
          </div>
        )}
      </div>

      {/* Footer + Collapse Toggle */}
      <div className="border-t border-slate-100">
        {/* Collapse toggle for desktop sidebar */}
        {!isMobile && (
          <button
            onClick={toggleCollapsed}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all text-xs"
            title={collapsed ? "ขยายแถบเมนู" : "ย่อแถบเมนู"}
          >
            {collapsed ? (
              <ChevronsRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronsLeft className="w-4 h-4" />
                <span className="font-medium">ย่อเมนู</span>
              </>
            )}
          </button>
        )}
        {(!collapsed || isMobile) && (
          <div className="px-4 py-2 text-[10px] text-slate-300">
            Car Release Management v2
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside
        className={`hidden lg:flex flex-col justify-between bg-white border-r border-slate-200/70 shrink-0 py-3 h-full text-xs transition-all duration-300 ease-in-out ${
          collapsed ? "w-14" : "w-56"
        }`}
      >
        {sidebarContent(false)}
      </aside>

      {/* ─── MOBILE OVERLAY ─── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={closeMobile}
          />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200/70 flex flex-col py-3 text-xs shadow-xl animate-slide-in">
            {/* Mobile header */}
            <div className="flex items-center justify-between px-4 pb-3 mb-1 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-700">เมนู</span>
              <button
                onClick={closeMobile}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {sidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
