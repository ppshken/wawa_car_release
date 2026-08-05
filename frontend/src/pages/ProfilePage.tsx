import React, { useState, useRef, useEffect } from 'react';
import api, { getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  User,
  Camera,
  Save,
  Phone,
  Mail,
  Shield,
  Calendar,
  MapPin,
  Key,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Settings,
  Clock,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState('');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [phone3, setPhone3] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [newAvatarBase64, setNewAvatarBase64] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone1((user as any).phone_number_1 || '');
      setPhone2((user as any).phone_number_2 || '');
      setPhone3((user as any).phone_number_3 || '');
      setAvatarPreview(user.user_image ? getImageUrl(user.user_image) : null);
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showError('ขนาดไฟล์รูปภาพต้องไม่เกิน 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      setNewAvatarBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('กรุณากรอกชื่อ-นามสกุล');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        name: name.trim(),
        phone_number_1: phone1.trim(),
        phone_number_2: phone2.trim(),
        phone_number_3: phone3.trim(),
      };
      if (newAvatarBase64) {
        payload.user_image = newAvatarBase64;
      }
      const res = await api.put('/auth/profile', payload);
      if (res.data.success) {
        showSuccess(res.data.message || 'บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว');
        setNewAvatarBase64(null);
        if (refreshUser) refreshUser();
      }
    } catch (err: any) {
      showError(err?.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showError('กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่');
      return;
    }
    if (newPassword.length < 4) {
      showError('รหัสผ่านใหม่ต้องมีอย่างน้อย 4 ตัวอักษร');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }
    setChangingPw(true);
    try {
      const res = await api.put('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      if (res.data.success) {
        showSuccess(res.data.message || 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      showError(err?.response?.data?.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
    } finally {
      setChangingPw(false);
    }
  };

  const inputCls =
    'w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all';

  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
    : '-';

  const permissionCount = (() => {
    if (!user?.menu_permissions) return 0;
    try {
      const perms = typeof user.menu_permissions === 'string' ? JSON.parse(user.menu_permissions) : user.menu_permissions;
      return Object.keys(perms).filter(k => perms[k]).length;
    } catch { return 0; }
  })();

  return (
    <div className="w-full mx-auto space-y-4 font-sans text-xs pb-12">
      {/* Header */}
      <div className="pt-1">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          โปรไฟล์ของฉัน
        </h1>
        <p className="text-[11px] text-slate-500">
          ดูและแก้ไขข้อมูลส่วนตัว รูปโปรไฟล์ เบอร์โทรศัพท์ และเปลี่ยนรหัสผ่าน
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: User Info Card */}
        <div className="lg:col-span-1 space-y-4">
          {/* Profile Card */}
          <div className="tms-card p-5 flex flex-col items-center text-center space-y-3">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-300" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-slate-900 hover:bg-slate-700 text-white p-1.5 rounded-full shadow-md transition-colors"
                title="เปลี่ยนรูปโปรไฟล์"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* Name & Role */}
            <div>
              <p className="text-sm font-bold text-slate-900">{user?.name || '-'}</p>
              <p className="text-[11px] text-slate-500">@{user?.username || '-'}</p>
            </div>

            {/* Role Badge */}
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[11px] font-semibold px-3 py-1 rounded-full border border-blue-200">
              <Shield className="w-3 h-3" />
              {(user as any)?.level_user_name || 'ไม่ระบุ'}
            </div>

            {/* Status Badge */}
            <div className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full border ${
              user?.user_status === 'active'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              <CheckCircle2 className="w-3 h-3" />
              {user?.user_status === 'active' ? 'ใช้งานอยู่' : 'ปิดการใช้งาน'}
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="tms-card p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-600" />
              ข้อมูลบัญชี
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-[11px]">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">Username</p>
                  <p className="font-semibold text-slate-800">{user?.username || '-'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-[11px]">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Shield className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">ระดับสิทธิ์</p>
                  <p className="font-semibold text-slate-800">{(user as any)?.level_user_name || '-'} ({(user as any)?.access_name || '-'})</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-[11px]">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">จำนวนสิทธิ์เมนู</p>
                  <p className="font-semibold text-slate-800">{permissionCount} สิทธิ์</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-[11px]">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">สร้างบัญชีเมื่อ</p>
                  <p className="font-semibold text-slate-800">{createdAt}</p>
                </div>
              </div>

              {user?.location_now && (
                <div className="flex items-center gap-2.5 text-[11px]">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">ตำแหน่งล่าสุด</p>
                    <p className="font-semibold text-slate-800 break-all">{user.location_now}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Edit Forms */}
        <div className="lg:col-span-2 space-y-4">
          {/* Profile Edit Form */}
          <form onSubmit={handleSaveProfile} className="tms-card">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-600" />
                แก้ไขข้อมูลส่วนตัว
              </h3>
              <button
                type="submit"
                disabled={saving}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  saving
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                }`}
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                บันทึก
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                  placeholder="กรอกชื่อ-นามสกุล"
                />
              </div>

              {/* Phone Numbers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" /> เบอร์โทร 1
                  </label>
                  <input
                    type="text"
                    value={phone1}
                    onChange={(e) => setPhone1(e.target.value)}
                    className={inputCls}
                    placeholder="0xx-xxx-xxxx"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" /> เบอร์โทร 2
                  </label>
                  <input
                    type="text"
                    value={phone2}
                    onChange={(e) => setPhone2(e.target.value)}
                    className={inputCls}
                    placeholder="0xx-xxx-xxxx"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" /> เบอร์โทร 3
                  </label>
                  <input
                    type="text"
                    value={phone3}
                    onChange={(e) => setPhone3(e.target.value)}
                    className={inputCls}
                    placeholder="0xx-xxx-xxxx"
                  />
                </div>
              </div>

              {/* Avatar Upload Instruction */}
              {newAvatarBase64 && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-[11px] text-blue-700">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>รูปโปรไฟล์ใหม่พร้อมบันทึก กดปุ่ม "บันทึก" เพื่ออัปเดต</span>
                </div>
              )}
            </div>
          </form>

          {/* Change Password Form */}
          <form onSubmit={handleChangePassword} className="tms-card">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-500" />
                เปลี่ยนรหัสผ่าน
              </h3>
              <button
                type="submit"
                disabled={changingPw || !currentPassword || !newPassword}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  changingPw || !currentPassword || !newPassword
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-2xs'
                }`}
              >
                {changingPw ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                เปลี่ยนรหัสผ่าน
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Current Password */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">รหัสผ่านปัจจุบัน</label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={inputCls + ' pr-9'}
                    placeholder="กรอกรหัสผ่านปัจจุบัน"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* New Password */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">รหัสผ่านใหม่</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={inputCls + ' pr-9'}
                      placeholder="อย่างน้อย 4 ตัวอักษร"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">ยืนยันรหัสผ่านใหม่</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputCls}
                    placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-[10px] text-rose-500 mt-1">รหัสผ่านไม่ตรงกัน</p>
                  )}
                </div>
              </div>
            </div>
          </form>

          {/* Login Activity Info */}
          <div className="tms-card p-4">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-3">
              <Clock className="w-3.5 h-3.5 text-slate-600" />
              ข้อมูลเซสชัน
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                <p className="text-[10px] text-slate-400 font-medium">User ID</p>
                <p className="text-xs font-bold text-slate-800 font-mono">{user?.user_id || '-'}</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                <p className="text-[10px] text-slate-400 font-medium">Level User ID</p>
                <p className="text-xs font-bold text-slate-800 font-mono">{user?.level_user_id || '-'}</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                <p className="text-[10px] text-slate-400 font-medium">สิทธิ์การปล่อยรถ</p>
                <p className="text-xs font-bold text-slate-800">
                  {(user as any)?.setting_car_release ? 'อนุญาต' : 'ไม่อนุญาต'}
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                <p className="text-[10px] text-slate-400 font-medium">สถานะบัญชี</p>
                <p className={`text-xs font-bold ${user?.user_status === 'active' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {user?.user_status === 'active' ? 'ใช้งานอยู่' : 'ปิดการใช้งาน'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
