import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import {
  BarChart3,
  AlertTriangle,
  MapPinOff,
  CreditCard,
  History,
  Search,
  RefreshCw,
  User,
  ShieldAlert,
  FileText,
  Truck,
  RotateCcw
} from 'lucide-react';
import { PaginationControl } from '../components/PaginationControl';

export const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'offsite' | 'audit'>('pending');
  const [pendingTransfers, setPendingTransfers] = useState<any[]>([]);
  const [offSiteChecks, setOffSiteChecks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Audit Log state
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditTotal, setAuditTotal] = useState<number>(0);
  const [auditPage, setAuditPage] = useState<number>(1);
  const [auditLimit, setAuditLimit] = useState<number>(10);
  const [auditSearch, setAuditSearch] = useState<string>('');
  const [auditActionFilter, setAuditActionFilter] = useState<string>('');
  const [auditLoading, setAuditLoading] = useState<boolean>(false);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const [pRes, oRes] = await Promise.all([
        api.get('/reports/pending-transfer'),
        api.get('/reports/off-site-checks')
      ]);

      if (pRes.data.success) setPendingTransfers(pRes.data.pendingTransfers || []);
      if (oRes.data.success) setOffSiteChecks(oRes.data.offSiteChecks || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    try {
      setAuditLoading(true);
      const res = await api.get('/reports/audit-logs', {
        params: {
          page: auditPage,
          limit: auditLimit,
          search: auditSearch,
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
  }, [auditPage, auditLimit, auditSearch, auditActionFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab, fetchAuditLogs]);

  const formatMoney = (val: number = 0) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(val);
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE_CAR_RELEASE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Truck className="w-3 h-3" /> สร้างใบปล่อยรถ
          </span>
        );
      case 'UPDATE_CAR_RELEASE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <FileText className="w-3 h-3" /> แก้ไขใบปล่อยรถ
          </span>
        );
      case 'DELETE_CAR_RELEASE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldAlert className="w-3 h-3" /> ลบใบปล่อยรถ
          </span>
        );
      case 'RETURN_CAR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <RotateCcw className="w-3 h-3" /> คืนรถ
          </span>
        );
      case 'UPDATE_ACCOUNTING_STATUS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <CreditCard className="w-3 h-3" /> อัปเดตบัญชี
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-4 font-sans text-xs pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-slate-800" />
            รายงานสรุปบัญชี & การตรวจสอบระบบ (Audit Reports)
          </h1>
          <p className="text-[11px] text-slate-500">
            รายงานยอดโอนตามค้างชำระ (Transfer According), การเช็คเอาท์นอกสถานที่ (Off-site checks) และประวัติกิจกรรมในระบบ (Audit Log)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchReports();
              if (activeTab === 'audit') fetchAuditLogs();
            }}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-1.5 rounded-lg font-medium flex items-center gap-1 shadow-2xs"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 text-slate-700 ${loading || auditLoading ? 'animate-spin' : ''}`} />
            <span>รีเฟรช</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-100/70 p-1 rounded-lg gap-1 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3.5 py-1.5 rounded-md font-semibold transition-all flex items-center gap-2 text-xs shrink-0 ${
            activeTab === 'pending'
              ? 'bg-white text-slate-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-amber-600" />
          <span>ยอดโอนตามค้างชำระ ({pendingTransfers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('offsite')}
          className={`px-3.5 py-1.5 rounded-md font-semibold transition-all flex items-center gap-2 text-xs shrink-0 ${
            activeTab === 'offsite'
              ? 'bg-white text-slate-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <MapPinOff className="w-3.5 h-3.5 text-rose-600" />
          <span>เช็คเอาท์นอกสถานที่ ({offSiteChecks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-1.5 rounded-md font-semibold transition-all flex items-center gap-2 text-xs shrink-0 ${
            activeTab === 'audit'
              ? 'bg-white text-slate-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <History className="w-3.5 h-3.5 text-blue-600" />
          <span>ประวัติกิจกรรมในระบบ (Audit Log)</span>
        </button>
      </div>

      {loading && activeTab !== 'audit' ? (
        <div className="text-center py-12 text-slate-500">กำลังโหลดรายงาน...</div>
      ) : activeTab === 'pending' ? (
        /* Pending Transfers Table */
        <div className="tms-card overflow-hidden w-full p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h2 className="text-xs font-bold text-slate-900">
              รายการที่ค้างชำระ/โอนตามทีหลัง (transfer_according = 1)
            </h2>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                  <th className="py-2.5 px-4">ร้านค้า</th>
                  <th className="py-2.5 px-4">เลขที่ใบปล่อยรถ</th>
                  <th className="py-2.5 px-4">พนักงาน</th>
                  <th className="py-2.5 px-4">ยอดโอนค้างชำระ</th>
                  <th className="py-2.5 px-4">หมายเหตุ</th>
                  <th className="py-2.5 px-4">วันที่เช็คเอาท์</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
                {pendingTransfers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      ไม่มีรายการค้างโอนในระบบ
                    </td>
                  </tr>
                ) : (
                  pendingTransfers.map((item) => (
                    <tr key={item.check_out_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-slate-900">{item.store_name_result || item.store_name}</td>
                      <td className="py-2.5 px-4 text-blue-600 font-mono font-bold">{item.car_release_no}</td>
                      <td className="py-2.5 px-4 text-slate-700">{item.driver_name}</td>
                      <td className="py-2.5 px-4 font-bold text-amber-600 font-mono">{formatMoney(item.transfer)}</td>
                      <td className="py-2.5 px-4 text-slate-500">{item.visit_note || '-'}</td>
                      <td className="py-2.5 px-4 text-slate-500">
                        {item.date_time_check_out ? new Date(item.date_time_check_out).toLocaleString('th-TH') : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'offsite' ? (
        /* Off-site Checks Table */
        <div className="tms-card overflow-hidden w-full p-4 space-y-3">
          <div className="flex items-center gap-2">
            <MapPinOff className="w-4 h-4 text-rose-600" />
            <h2 className="text-xs font-bold text-slate-900">
              รายการเช็คเอาท์พิกัดไม่ตรงร้าน (&gt;300 เมตร)
            </h2>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                  <th className="py-2.5 px-4">ร้านค้า</th>
                  <th className="py-2.5 px-4">เลขที่ใบปล่อยรถ</th>
                  <th className="py-2.5 px-4">พนักงาน</th>
                  <th className="py-2.5 px-4">พิกัดร้านค้า</th>
                  <th className="py-2.5 px-4">เวลาเช็คเอาท์</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
                {offSiteChecks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      ไม่มีรายการ Off-site
                    </td>
                  </tr>
                ) : (
                  offSiteChecks.map((item) => (
                    <tr key={item.check_out_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-slate-900">{item.store_name_result || item.store_name}</td>
                      <td className="py-2.5 px-4 text-blue-600 font-mono font-bold">{item.car_release_no}</td>
                      <td className="py-2.5 px-4 text-slate-700">{item.driver_name}</td>
                      <td className="py-2.5 px-4 text-slate-500 font-mono">{item.store_location || '-'}</td>
                      <td className="py-2.5 px-4 text-slate-500">
                        {item.date_time_check_out ? new Date(item.date_time_check_out).toLocaleString('th-TH') : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Audit Logs Table */
        <div className="tms-card overflow-hidden w-full p-4 space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-bold text-slate-900">
                ประวัติกิจกรรมและการเปลี่ยนแปลงในระบบ (Audit Log)
              </h2>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => {
                    setAuditSearch(e.target.value);
                    setAuditPage(1);
                  }}
                  placeholder="ค้นหาชื่อผู้ทำรายการ, กิจกรรม..."
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
                <option value="CREATE_CAR_RELEASE">สร้างใบปล่อยรถ</option>
                <option value="UPDATE_CAR_RELEASE">แก้ไขใบปล่อยรถ</option>
                <option value="DELETE_CAR_RELEASE">ลบใบปล่อยรถ</option>
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
                  <th className="py-2.5 px-4">กิจกรรม (Action)</th>
                  <th className="py-2.5 px-4">ผู้ทำรายการ</th>
                  <th className="py-2.5 px-4">เป้าหมาย</th>
                  <th className="py-2.5 px-4">รายละเอียด</th>
                  <th className="py-2.5 px-4">IP Address</th>
                  <th className="py-2.5 px-4">วัน-เวลา</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
                {auditLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      กำลังโหลดประวัติกิจกรรม...
                    </td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      ไม่พบประวัติกิจกรรมในระบบ
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.log_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 text-center text-slate-400 font-mono font-bold">{log.log_id}</td>
                      <td className="py-2.5 px-4">{getActionBadge(log.action)}</td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold text-slate-900">{log.user_name || log.username || 'System'}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-bold">
                          {log.target_type}:{log.target_id || '-'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 max-w-xs truncate text-slate-500 font-mono text-[11px]" title={log.details}>
                        {log.details || '-'}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">{log.ip_address || '-'}</td>
                      <td className="py-2.5 px-4 text-slate-500">
                        {log.created_at ? new Date(log.created_at).toLocaleString('th-TH') : '-'}
                      </td>
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
      )}
    </div>
  );
};

export default Reports;
