import React, { useEffect, useState, useMemo, useCallback } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { PaginationControl } from '../components/PaginationControl';
import { AnimatedDrawer } from '../components/AnimatedDrawer';
import {
  Key,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  ShieldCheck,
  Sliders,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface ApiKeyData {
  id: number;
  key_name: string;
  key_service: string;
  key_value: string;
  description?: string;
  is_active: number | boolean;
  created_at?: string;
  updated_at?: string;
}

export const ApiKeyManagement: React.FC = () => {
  const { showSuccess, showError } = useToast();

  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Pagination
  const [search, setSearch] = useState('');
  const [filterService, setFilterService] = useState('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // State to toggle mask/unmask per key id
  const [visibleKeys, setVisibleKeys] = useState<Record<number, boolean>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Drawer & Form State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKeyData | null>(null);
  const [formName, setFormName] = useState('');
  const [formService, setFormService] = useState('OptimoRoute');
  const [formValue, setFormValue] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Delete Modal
  const [keyToDelete, setKeyToDelete] = useState<ApiKeyData | null>(null);

  const inputCls =
    'w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 transition-colors';

  const renderField = (label: string, required: boolean, inputEl: React.ReactNode) => (
    <div className="space-y-1">
      <label className="block text-slate-700 font-semibold text-xs">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {inputEl}
    </div>
  );

  const isFormDirty = useMemo(() => {
    if (!editingKey) return !!(formName || formValue || formDescription);
    return (
      formName !== editingKey.key_name ||
      formService !== editingKey.key_service ||
      formValue !== editingKey.key_value ||
      formDescription !== (editingKey.description || '') ||
      formIsActive !== (editingKey.is_active === 1 || editingKey.is_active === true)
    );
  }, [editingKey, formName, formService, formValue, formDescription, formIsActive]);

  const fetchApiKeys = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api-keys');
      if (res.data.success) {
        setApiKeys(res.data.keys || []);
      }
    } catch (err: any) {
      console.error('Error fetching API keys:', err);
      showError(err?.response?.data?.message || 'ไม่สามารถโหลดข้อมูล API Keys ได้');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterService]);

  // Unique services for filter
  const serviceOptions = useMemo(() => {
    const services = Array.from(new Set(apiKeys.map((k) => k.key_service).filter(Boolean)));
    return ['ALL', ...services];
  }, [apiKeys]);

  const filteredKeys = useMemo(() => {
    const s = search.toLowerCase().trim();
    return apiKeys.filter((k) => {
      const matchSearch =
        k.key_name.toLowerCase().includes(s) ||
        k.key_service.toLowerCase().includes(s) ||
        (k.description || '').toLowerCase().includes(s);
      const matchService = filterService === 'ALL' || k.key_service === filterService;
      return matchSearch && matchService;
    });
  }, [apiKeys, search, filterService]);

  const paginatedKeys = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredKeys.slice(start, start + itemsPerPage);
  }, [filteredKeys, currentPage, itemsPerPage]);

  const toggleVisibility = (id: number) => {
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyKey = (id: number, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedId(id);
    showSuccess('คัดลอก API Key ลงคลิปบอร์ดแล้ว!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAddKey = () => {
    setEditingKey(null);
    setFormName('');
    setFormService('OptimoRoute');
    setFormValue('');
    setFormDescription('');
    setFormIsActive(true);
    setIsDrawerOpen(true);
  };

  const handleOpenEditKey = (keyItem: ApiKeyData) => {
    setEditingKey(keyItem);
    setFormName(keyItem.key_name);
    setFormService(keyItem.key_service);
    setFormValue(keyItem.key_value);
    setFormDescription(keyItem.description || '');
    setFormIsActive(keyItem.is_active === 1 || keyItem.is_active === true);
    setIsDrawerOpen(true);
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formService.trim() || !formValue.trim()) {
      showError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ชื่อ KEY, บริการ, ค่า Key)');
      return;
    }

    try {
      const payload = {
        key_name: formName.trim(),
        key_service: formService.trim(),
        key_value: formValue.trim(),
        description: formDescription.trim(),
        is_active: formIsActive ? 1 : 0,
      };

      if (editingKey) {
        await api.put(`/api-keys/${editingKey.id}`, payload);
        showSuccess('อัปเดตข้อมูล API Key เรียบร้อยแล้ว!');
      } else {
        await api.post('/api-keys', payload);
        showSuccess('เพิ่ม API Key ใหม่สำเร็จ!');
      }
      setIsDrawerOpen(false);
      fetchApiKeys();
    } catch (err: any) {
      showError(err?.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก API Key');
    }
  };

  const handleToggleActive = async (keyItem: ApiKeyData) => {
    try {
      const newStatus = !(keyItem.is_active === 1 || keyItem.is_active === true);
      await api.put(`/api-keys/${keyItem.id}`, {
        ...keyItem,
        is_active: newStatus ? 1 : 0,
      });
      showSuccess(`สลับสถานะ "${keyItem.key_name}" เป็น ${newStatus ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} เรียบร้อย`);
      fetchApiKeys();
    } catch (err: any) {
      showError('ไม่สามารถเปลี่ยนสถานะ API Key ได้');
    }
  };

  const handleConfirmDeleteKey = async () => {
    if (!keyToDelete) return;
    try {
      await api.delete(`/api-keys/${keyToDelete.id}`);
      showSuccess(`ลบ API Key "${keyToDelete.key_name}" เรียบร้อยแล้ว`);
      fetchApiKeys();
    } catch (err: any) {
      showError(err?.response?.data?.message || 'ไม่สามารถลบ API Key นี้ได้');
    } finally {
      setKeyToDelete(null);
    }
  };

  return (
    <div className="w-full space-y-4 font-sans text-xs pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Key className="w-5 h-5 text-slate-800" />
            จัดการ API Key & System Config
          </h1>
          <p className="text-[11px] text-slate-500">
            จัดเก็บและบริหารจัดการ API Key สำหรับ OptimoRoute, GPS IAM และระบบภายนอก เพื่อใช้แทนไฟล์ .env
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchApiKeys}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-1.5 rounded-lg font-medium flex items-center gap-1 shadow-2xs transition-colors"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 text-slate-700 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAddKey}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> <span>เพิ่ม API Key</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="tms-card p-3 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาตามชื่อ Key, ชื่อบริการ หรือคำอธิบาย..."
            className="w-full bg-slate-50 border border-slate-200/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
          />
        </div>

        {serviceOptions.length > 2 && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Sliders className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-slate-400 w-full sm:w-auto"
            >
              <option value="ALL">ทุกบริการทั้งหมด ({apiKeys.length})</option>
              {serviceOptions
                .filter((s) => s !== 'ALL')
                .map((s) => (
                  <option key={s} value={s}>
                    {s} ({apiKeys.filter((k) => k.key_service === s).length})
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* Table Card */}
      <div className="tms-card overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                <th className="py-1.5 px-3 text-center w-10">#</th>
                <th className="py-1.5 px-3">ชื่อ Key (Key Name)</th>
                <th className="py-1.5 px-3">บริการ (Service)</th>
                <th className="py-1.5 px-3">ค่า API Key / Secret Token</th>
                <th className="py-1.5 px-3">คำอธิบาย</th>
                <th className="py-1.5 px-3 text-center">สถานะ</th>
                <th className="py-1.5 px-3 text-center">วันที่สร้าง</th>
                <th className="py-1.5 px-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
              {paginatedKeys.map((k, idx) => {
                const isActive = k.is_active === 1 || k.is_active === true;
                const isVisible = !!visibleKeys[k.id];
                const displayVal = isVisible
                  ? k.key_value
                  : k.key_value.length > 10
                  ? `${k.key_value.slice(0, 4)}••••••••••••${k.key_value.slice(-4)}`
                  : '••••••••••••';

                return (
                  <tr key={k.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-1 px-3 text-center text-slate-400 font-medium text-[11px]">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="py-1 px-3">
                      <code className="bg-slate-100 border border-slate-200 text-slate-900 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold">
                        {k.key_name}
                      </code>
                    </td>
                    <td className="py-1 px-3 font-semibold text-slate-700 text-[11px]">
                      <span className="inline-flex items-center gap-1 bg-slate-100/80 px-1.5 py-0.2 rounded text-[10px] border border-slate-200/60">
                        <ShieldCheck className="w-3 h-3 text-slate-500" />
                        {k.key_service}
                      </span>
                    </td>
                    <td className="py-1 px-3 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-slate-50 border border-slate-200/80 text-slate-800 px-1.5 py-0.5 rounded text-mono max-w-[260px] truncate select-all">
                          {displayVal}
                        </span>
                        <button
                          onClick={() => toggleVisibility(k.id)}
                          className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title={isVisible ? 'ซ่อน Key' : 'แสดง Key'}
                        >
                          {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleCopyKey(k.id, k.key_value)}
                          className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="คัดลอก Key"
                        >
                          {copiedId === k.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-1 px-3 text-slate-600 text-[11px] max-w-[220px] truncate" title={k.description || ''}>
                      {k.description || '-'}
                    </td>
                    <td className="py-1 px-3 text-center">
                      <button
                        onClick={() => handleToggleActive(k)}
                        className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold border transition-colors ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                        }`}
                        title="คลิกเพื่อสลับสถานะ"
                      >
                        {isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-slate-400" /> Disabled
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-1 px-3 text-center text-slate-500 font-mono text-[11px]">
                      {k.created_at ? new Date(k.created_at).toLocaleDateString('th-TH') : '-'}
                    </td>
                    <td className="py-1 px-3 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEditKey(k)}
                        className="p-0.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        title="แก้ไข"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setKeyToDelete(k)}
                        className="p-0.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="ลบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredKeys.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    {loading ? 'กำลังโหลดข้อมูล API Keys...' : 'ไม่พบข้อมูล API Key ที่ตรงกับเงื่อนไขการค้นหา'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <PaginationControl
          currentPage={currentPage}
          totalItems={filteredKeys.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* API Key Drawer */}
      <AnimatedDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingKey ? 'แก้ไขข้อมูล API Key' : 'เพิ่ม API Key / System Config ใหม่'}
        formId="apikey-form"
        onSubmit={handleSaveKey}
        submitLabel={editingKey ? 'บันทึกการแก้ไข' : 'สร้าง API Key ใหม่'}
        isDirty={isFormDirty}
      >
        {renderField(
          'ชื่อ Key Name (ตัวพิมพ์ใหญ่ เช่น OPTIMOROUTE_API_KEY)',
          true,
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value.toUpperCase())}
            placeholder="เช่น OPTIMOROUTE_API_KEY, GPS_API_TOKEN"
            className={`${inputCls} font-mono uppercase`}
            required
          />
        )}

        {renderField(
          'บริการที่เกี่ยวข้อง (Service Name)',
          true,
          <select
            value={formService}
            onChange={(e) => setFormService(e.target.value)}
            className={inputCls}
            required
          >
            <option value="OptimoRoute">OptimoRoute API</option>
            <option value="GPS IAM">GPS IAM Device Tracker</option>
            <option value="Google Maps">Google Maps Platform</option>
            <option value="LINE Notify">LINE Messaging / Notify</option>
            <option value="General">ทั่วไป / System General Config</option>
          </select>
        )}

        {renderField(
          'ค่า API Key / Token / URL (Key Value)',
          true,
          <textarea
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            placeholder="ใส่ค่า API Key, Auth Token หรือ URL ที่ต้องการใช้งาน..."
            rows={3}
            className={`${inputCls} font-mono`}
            required
          />
        )}

        {renderField(
          'คำอธิบายวัตถุประสงค์การใช้งาน',
          false,
          <input
            type="text"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="เช่น Key สำหรับเรียก API จัดสายเดินรถอัตโนมัติ"
            className={inputCls}
          />
        )}

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700">เปิดใช้งาน Key นี้ทันที (Is Active)</label>
          <input
            type="checkbox"
            checked={formIsActive}
            onChange={(e) => setFormIsActive(e.target.checked)}
            className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-400"
          />
        </div>
      </AnimatedDrawer>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!keyToDelete}
        title="ยืนยันการลบ API Key"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบ API Key "${keyToDelete?.key_name}" (${keyToDelete?.key_service})? การลบนี้อาจส่งผลให้การเชื่อมต่อ API ที่ใช้ Key นี้หยุดทำงาน`}
        confirmText="ลบข้อมูล"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDeleteKey}
        onCancel={() => setKeyToDelete(null)}
      />
    </div>
  );
};

export default ApiKeyManagement;
