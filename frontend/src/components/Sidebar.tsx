import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
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
  ChevronsLeft,
  ChevronsRight,
  X,
} from 'lucide-react';

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
    if (typeof user.menu_permissions === 'string') {
      try {
        permissions = JSON.parse(user.menu_permissions);
      } catch (e) {}
    } else if (typeof user.menu_permissions === 'object') {
      permissions = user.menu_permissions as Record<string, boolean>;
    }
  }

  const isMenuAllowed = (key?: string) => {
    if (!key) return true;
    if (permissions[key] !== undefined) {
      return !!permissions[key];
    }
    if (user?.level_user_id === 1) return true;
    if (key === 'dashboard' || key === 'releases') return true;
    if (user?.level_user_id === 2 && (key === 'create_release' || key === 'driver' || key === 'return' || key === 'stores' || key === 'reports')) return true;
    if (user?.level_user_id === 3 && (key === 'driver' || key === 'return')) return true;
    return false;
  };

  const navItems = [
    { to: '/', label: 'แดชบอร์ด', icon: LayoutDashboard, key: 'dashboard' },
    { to: '/releases', label: 'ใบปล่อยรถ', icon: Truck, key: 'releases' },
    { to: '/releases/create', label: 'สร้างใบปล่อยรถ', icon: FileText, key: 'create_release' },
    { to: '/driver', label: 'ประตูรถ (เช็คอิน)', icon: MapPin, key: 'driver' },
    { to: '/users', label: 'จัดการผู้ใช้งาน & สิทธิ์', icon: Users, key: 'users' },
    { to: '/return', label: 'บันทึกคืนกุญแจ', icon: Key, key: 'return' },
    { to: '/reports', label: 'สถานะทางบัญชี', icon: ShieldCheck, key: 'reports' },
    { to: '/profile', label: 'โปรไฟล์', icon: User },
    { to: '/routes', label: 'จัดรถ & เส้นทาง', icon: Package },
    { to: '/offsite', label: 'เช็คสินค้านอกพิกัด', icon: MapPinOff },
    { to: '/distance', label: 'ระยะห่าง GPS', icon: Navigation },
    { to: '/import-photos', label: 'นำเข้ารูปรถ', icon: Upload },
    { to: '/pda', label: 'เครื่อง PDA', icon: Smartphone },
    { to: '/sales-orders', label: 'ใบสั่งขาย', icon: Receipt },
    { to: '/return-orders', label: 'ใบคืนสินค้า', icon: RotateCcw },
    { to: '/return-delivery', label: 'ส่งคืนสินค้า', icon: Send },
    { to: '/creditors', label: 'เจ้าหนี้', icon: Building },
    { to: '/debtors', label: 'ลูกหนี้', icon: CreditCard },
    { to: '/storage', label: 'ตำแหน่งวางสินค้า', icon: Grid },
    { to: '/allowances', label: 'เบี้ยเลี้ยง', icon: Coins }
  ].filter((item) => isMenuAllowed(item.key));

  const sidebarContent = (isMobile: boolean) => (
    <>
      <div className="overflow-y-auto px-2 space-y-0.5 custom-scrollbar flex-1">
        {/* Section header */}
        {(!collapsed || isMobile) && (
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2 mt-1">
            เมนูหลัก
          </div>
        )}
        {collapsed && !isMobile && (
          <div className="h-3" />
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              title={collapsed && !isMobile ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center ${collapsed && !isMobile ? 'justify-center' : ''} gap-3 ${collapsed && !isMobile ? 'px-0 py-2.5' : 'px-3 py-2'} rounded-md font-medium transition-all group relative ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
        })}
      </div>

      {/* Footer + Collapse Toggle */}
      <div className="border-t border-slate-100">
        {/* Collapse toggle for desktop sidebar */}
        {!isMobile && (
          <button
            onClick={toggleCollapsed}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all text-xs"
            title={collapsed ? 'ขยายแถบเมนู' : 'ย่อแถบเมนู'}
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
        className={`hidden lg:flex flex-col justify-between bg-white border-r border-slate-200/70 shrink-0 py-3 min-h-[calc(100vh-3.5rem)] text-xs transition-all duration-300 ease-in-out ${
          collapsed ? 'w-14' : 'w-56'
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
