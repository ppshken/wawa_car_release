import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Truck, KeyRound, User as UserIcon, LogIn, ShieldAlert, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(username, password);
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.message || 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleQuickLogin = (user: string) => {
    setUsername(user);
    setPassword('123456');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-slate-100 rounded-full opacity-80" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-slate-100/60 rounded-full" />
        {/* Grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center gap-2 text-center mb-8">
          <img src="assets/car_release_logo.jpg" alt="logo" className='w-20 h-20' />
          <p className="text-[18px] text-slate-800 font-medium">
            ระบบบริหารจัดการรถปล่อยขาย & สายวิ่งส่งสินค้า
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200/70 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] rounded-xl p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-lg flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                ชื่อผู้ใช้งาน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="กรอกชื่อผู้ใช้งาน"
                  className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                รหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="กรอกรหัสผ่าน"
                  className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-semibold py-2.5 rounded-lg text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  เข้าสู่ระบบ
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick Login Section */}
        {/* <div className="mt-4 bg-white border border-slate-200/70 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] rounded-xl p-4">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider text-center mb-3">
            เลือกบัญชีทดสอบด่วน
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => handleQuickLogin('admin')}
              className="group px-2 py-2 rounded-lg bg-slate-50 hover:bg-slate-900 border border-slate-100 hover:border-slate-900 text-slate-600 hover:text-white font-medium transition-all text-center"
            >
              <span className="block text-sm mb-0.5">👑</span>
              Admin
            </button>
            <button
              onClick={() => handleQuickLogin('supervisor')}
              className="group px-2 py-2 rounded-lg bg-slate-50 hover:bg-slate-900 border border-slate-100 hover:border-slate-900 text-slate-600 hover:text-white font-medium transition-all text-center"
            >
              <span className="block text-sm mb-0.5">👔</span>
              หัวหน้างาน
            </button>
            <button
              onClick={() => handleQuickLogin('driver1')}
              className="group px-2 py-2 rounded-lg bg-slate-50 hover:bg-slate-900 border border-slate-100 hover:border-slate-900 text-slate-600 hover:text-white font-medium transition-all text-center"
            >
              <span className="block text-sm mb-0.5">🚚</span>
              คนขับรถ
            </button>
          </div>
        </div> */}

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-300 mt-6 font-medium">
          Car Release Management v2
        </p>
      </div>
    </div>
  );
};
