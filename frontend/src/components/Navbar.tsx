import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { Truck, LogOut, Bell, Menu, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { collapsed, toggleCollapsed, toggleMobile } = useSidebar();
  const navigate = useNavigate();

  return (
    <header className="h-14 bg-white border-b border-slate-200/70 sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
      {/* Left side */}
      <div className="flex items-center gap-2">
        {/* Mobile hamburger */}
        <button
          onClick={toggleMobile}
          className="lg:hidden p-1.5 -ml-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="เปิดเมนู"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop collapse toggle */}
        <button
          onClick={toggleCollapsed}
          className="hidden lg:flex p-1.5 -ml-1 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title={collapsed ? 'ขยายแถบเมนู' : 'ย่อแถบเมนู'}
        >
          {collapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
            <Truck className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-slate-900 tracking-tight leading-tight">
              Car Release
            </span>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:block">Fleet Management</span>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">

        <button className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 relative transition-colors" title="แจ้งเตือน">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-slate-900 rounded-full"></span>
        </button>

        {user && (
          <div className="flex items-center gap-2.5 pl-1">
            <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200/70 flex items-center justify-center text-xs">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-left hidden lg:block">
              <div className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</div>
              <div className="text-[10px] text-slate-400">{user.level_user_name || 'ผู้ใช้งาน'}</div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="ออกจากระบบ"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
