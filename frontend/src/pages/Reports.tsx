import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { BarChart3, AlertTriangle, MapPinOff, CreditCard, CheckCircle2 } from 'lucide-react';

export const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'offsite'>('pending');
  const [pendingTransfers, setPendingTransfers] = useState<any[]>([]);
  const [offSiteChecks, setOffSiteChecks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
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
  };

  const formatMoney = (val: number = 0) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            รายงานสรุปบัญชี & การตรวจสอบระบบ (Audit Reports)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            รายงานยอดโอนตามค้างชำระ (Transfer According) และการเช็คเอาท์นอกสถานที่ (Off-site checks)
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'pending'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:bg-slate-800/60'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          ยอดโอนตามค้างชำระ ({pendingTransfers.length})
        </button>

        <button
          onClick={() => setActiveTab('offsite')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'offsite'
              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              : 'text-slate-400 hover:bg-slate-800/60'
          }`}
        >
          <MapPinOff className="w-4 h-4" />
          เช็คเอาท์นอกสถานที่ ({offSiteChecks.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">กำลังโหลดรายงาน...</div>
      ) : activeTab === 'pending' ? (
        /* Pending Transfers Table */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            รายการที่ค้างชำระ/โอนตามทีหลัง (transfer_according = 1)
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3 rounded-l-xl">ร้านค้า</th>
                  <th className="p-3">เลขที่ใบปล่อยรถ</th>
                  <th className="p-3">พนักงาน</th>
                  <th className="p-3">ยอดโอนค้างชำระ</th>
                  <th className="p-3">หมายเหตุ</th>
                  <th className="p-3 rounded-r-xl">วันที่เช็คเอาท์</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {pendingTransfers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-500">
                      ไม่มีรายการค้างโอนในระบบ
                    </td>
                  </tr>
                ) : (
                  pendingTransfers.map((item) => (
                    <tr key={item.check_out_id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-white">{item.store_name_result || item.store_name}</td>
                      <td className="p-3 text-blue-400">{item.car_release_no}</td>
                      <td className="p-3">{item.driver_name}</td>
                      <td className="p-3 font-bold text-amber-400">{formatMoney(item.transfer)}</td>
                      <td className="p-3 text-slate-400">{item.visit_note || '-'}</td>
                      <td className="p-3 text-slate-400">
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <MapPinOff className="w-4 h-4 text-rose-400" />
            รายการเช็คเอาท์พิกัดไม่ตรงร้าน (&gt;300 เมตร)
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3 rounded-l-xl">ร้านค้า</th>
                  <th className="p-3">เลขที่ใบปล่อยรถ</th>
                  <th className="p-3">พนักงาน</th>
                  <th className="p-3">พิกัดร้านค้า</th>
                  <th className="p-3 rounded-r-xl">เวลาเช็คเอาท์</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {offSiteChecks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-slate-500">
                      ไม่มีรายการ Off-site
                    </td>
                  </tr>
                ) : (
                  offSiteChecks.map((item) => (
                    <tr key={item.check_out_id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-white">{item.store_name_result || item.store_name}</td>
                      <td className="p-3 text-blue-400">{item.car_release_no}</td>
                      <td className="p-3">{item.driver_name}</td>
                      <td className="p-3 text-slate-400">{item.store_location || '-'}</td>
                      <td className="p-3 text-slate-400">
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
