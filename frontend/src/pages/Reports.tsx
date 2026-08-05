import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { BarChart3, AlertTriangle, MapPinOff, CreditCard, RefreshCw } from 'lucide-react';
import { PaginationControl } from '../components/PaginationControl';

export const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'offsite'>('pending');
  const [pendingTransfers, setPendingTransfers] = useState<any[]>([]);
  const [offSiteChecks, setOffSiteChecks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const formatMoney = (val: number = 0) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(val);
  };

  return (
    <div className="w-full space-y-4 font-sans text-xs pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            รายงานสรุปบัญชี & การตรวจสอบระบบ
          </h1>
          <p className="text-[11px] text-slate-500">
            รายงานยอดโอนตามค้างชำระ (Transfer According) และการเช็คเอาท์นอกสถานที่ (Off-site checks)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchReports(); }}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-1.5 rounded-lg font-medium flex items-center gap-1 shadow-2xs"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className="w-4 h-4 text-slate-700" />
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
      </div>

      {loading ? (
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
      ) : (
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
      )}
    </div>
  );
};

export default Reports;
