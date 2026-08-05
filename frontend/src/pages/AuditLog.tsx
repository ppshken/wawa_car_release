import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { History, Search, RefreshCw, User, ShieldAlert, FileText, Truck, RotateCcw, CreditCard } from 'lucide-react';
import { PaginationControl } from '../components/PaginationControl';

export const AuditLog: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditTotal, setAuditTotal] = useState<number>(0);
  const [auditPage, setAuditPage] = useState<number>(1);
  const [auditLimit, setAuditLimit] = useState<number>(10);
  const [auditSearch, setAuditSearch] = useState<string>('');
  const [auditUserFilter, setAuditUserFilter] = useState<string>('');
  const [auditActionFilter, setAuditActionFilter] = useState<string>('');
  const [auditLoading, setAuditLoading] = useState<boolean>(false);

  const fetchAuditLogs = useCallback(async () => {
    try {
      setAuditLoading(true);
      const res = await api.get('/reports/audit-logs', {
        params: {
          page: auditPage,
          limit: auditLimit,
          search: auditSearch,
          user: auditUserFilter,
          action: auditActionFilter
        }
      });
      if (res.data.success) {
        setAuditLogs(res.data.logs || []);
        setAuditTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setAuditLoading(false);
    }
  }, [auditPage, auditLimit, auditSearch, auditUserFilter, auditActionFilter]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const getActionBadge = (action: string) => {
    const normalized = (action || '').toUpperCase();
    if (normalized.startsWith('CREATE')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Truck className="w-3 h-3" /> เพิ่มข้อมูล
        </span>
      );
    }
    if (normalized.startsWith('UPDATE')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <FileText className="w-3 h-3" /> แก้ไขข้อมูล
        </span>
      );
    }
    if (normalized.startsWith('DELETE')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <ShieldAlert className="w-3 h-3" /> ลบข้อมูล
        </span>
      );
    }
    if (normalized === 'LOGIN') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <User className="w-3 h-3" /> เข้าสู่ระบบ
        </span>
      );
    }
    if (normalized === 'RETURN_CAR') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <RotateCcw className="w-3 h-3" /> คืนรถ
        </span>
      );
    }
    if (normalized === 'UPDATE_ACCOUNTING_STATUS') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
          <CreditCard className="w-3 h-3" /> อัปเดตบัญชี
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        {action}
      </span>
    );
  };

  return (
    <div className="w-full space-y-4 font-sans text-xs pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            รายการ Audit Log
          </h1>
          <p className="text-[11px] text-slate-500">
            ติดตามกิจกรรมการสร้าง แก้ไข ลบ และการเข้าใช้งานระบบของผู้ใช้งาน
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchAuditLogs}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-1.5 rounded-lg font-medium flex items-center gap-1 shadow-2xs"
            title="รีเฟรชรายการ"
          >
            <RefreshCw className={`w-4 h-4 text-slate-700 ${auditLoading ? 'animate-spin' : ''}`} />
            <span>รีเฟรช</span>
          </button>
        </div>
      </div>

      <div className="tms-card overflow-hidden w-full p-4 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold text-slate-900">ฟิลเตอร์และค้นหา Audit Log</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={auditUserFilter}
                onChange={(e) => {
                  setAuditUserFilter(e.target.value);
                  setAuditPage(1);
                }}
                placeholder="กรองผู้ใช้งาน"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
              />
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => {
                  setAuditSearch(e.target.value);
                  setAuditPage(1);
                }}
                placeholder="ค้นหาเป้าหมายหรือรายละเอียด"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
              />
            </div>
            <select
              value={auditActionFilter}
              onChange={(e) => {
                setAuditActionFilter(e.target.value);
                setAuditPage(1);
              }}
              className="w-full sm:w-auto bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400"
            >
              <option value="">ทุกกิจกรรม</option>
              <option value="CREATE">เพิ่ม</option>
              <option value="UPDATE">แก้ไข</option>
              <option value="DELETE">ลบ</option>
              <option value="LOGIN">เข้าใช้งาน</option>
              <option value="RETURN_CAR">คืนรถ</option>
              <option value="UPDATE_ACCOUNTING_STATUS">อัปเดตบัญชี</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                <th className="py-2.5 px-4 text-center w-16">ID</th>
                <th className="py-2.5 px-4">กิจกรรม</th>
                <th className="py-2.5 px-4">ผู้ทำรายการ</th>
                <th className="py-2.5 px-4">เป้าหมาย</th>
                <th className="py-2.5 px-4">รายละเอียด</th>
                <th className="py-2.5 px-4">IP Address</th>
                <th className="py-2.5 px-4">วันที่</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
              {auditLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    กำลังโหลดประวัติ...
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    ไม่พบข้อมูล Audit Log
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-1 px-4 text-center text-slate-400 font-mono font-bold">{log.log_id}</td>
                    <td className="py-1 px-4">{getActionBadge(log.action)}</td>
                    <td className="py-1px-4">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-slate-900">{log.user_name || log.username || 'System'}</span>
                      </div>
                    </td>
                    <td className="py-1px-4">
                      <span className="font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-bold">
                        {log.target_type}:{log.target_id || '-'}
                      </span>
                    </td>
                    <td className="py-1px-4 max-w-xs truncate text-slate-500 font-mono text-[11px]" title={log.details}>
                      {log.details || '-'}
                    </td>
                    <td className="py-1px-4 text-slate-500 font-mono text-[11px]">{log.ip_address || '-'}</td>
                    <td className="py-1px-4 text-slate-500">{log.created_at ? new Date(log.created_at).toLocaleString('th-TH') : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <PaginationControl
          currentPage={auditPage}
          totalItems={auditTotal}
          itemsPerPage={auditLimit}
          onPageChange={setAuditPage}
          onItemsPerPageChange={setAuditLimit}
        />
      </div>
    </div>
  );
};

export default AuditLog;
