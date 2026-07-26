import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { getImageUrl } from '../services/api';
import { CarRelease } from '../types';
import {
  FileText,
  Truck,
  User,
  Users,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowLeft,
  DollarSign,
  ShieldCheck,
  Building2,
  Clock
} from 'lucide-react';

export const CarReleaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [release, setRelease] = useState<CarRelease | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [accountingMaster, setAccountingMaster] = useState<any[]>([]);
  const [accStatus, setAccStatus] = useState<string>('');
  const [accNote, setAccNote] = useState<string>('');

  useEffect(() => {
    if (id) fetchReleaseDetail(id);
    fetchAccountingStatuses();
  }, [id]);

  const fetchAccountingStatuses = async () => {
    try {
      const res = await api.get('/master/accounting-status');
      if (res.data.success && (res.data.statuses || res.data.accounting_statuses)) {
        setAccountingMaster(res.data.statuses || res.data.accounting_statuses);
      }
    } catch (err) {
      console.error('Fetch accounting status master error:', err);
    }
  };

  const fetchReleaseDetail = async (releaseId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/car-release/${releaseId}`);
      if (res.data.success) {
        setRelease(res.data.release);
        if (res.data.release.accounting_status_id) setAccStatus(String(res.data.release.accounting_status_id));
        else if (res.data.release.accounting_status) setAccStatus(res.data.release.accounting_status);
        if (res.data.release.accounting_note) setAccNote(res.data.release.accounting_note);
      }
    } catch (err) {
      console.error('Error fetching release detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAccounting = async () => {
    if (!id) return;
    try {
      const res = await api.patch(`/car-release/${id}/accounting`, {
        accounting_status: accStatus,
        accounting_note: accNote
      });
      if (res.data.success) {
        alert('อัปเดตสถานะบัญชีเรียบร้อยแล้ว');
        fetchReleaseDetail(id);
      }
    } catch (err: any) {
      alert('อัปเดตสถานะบัญชีล้มเหลว: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatMoney = (val: number = 0) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(val);
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-500">กำลังโหลดรายละเอียดใบปล่อยรถ...</div>;
  }

  if (!release) {
    return (
      <div className="text-center py-12 text-slate-500">
        ไม่พบข้อมูลใบปล่อยรถ
        <br />
        <Link to="/releases" className="text-blue-400 underline mt-2 inline-block">
          กลับไปหน้ารายการ
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/releases')}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
        </button>

        <span
          className={`text-xs font-bold px-3 py-1 rounded-full border ${
            release.accounting_status === 'อนุมัติแล้ว'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}
        >
          สถานะบัญชี: {release.accounting_status || 'รอตรวจสอบ'}
        </span>
      </div>

      {/* Main Info Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-2">
          <div>
            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-lg">
              {release.car_release_no}
            </span>
            <h1 className="text-xl font-bold text-white mt-2 flex items-center gap-2">
              <Truck className="w-6 h-6 text-blue-400" />
              {release.license_plate} ({release.brand} {release.model})
            </h1>
          </div>

          <div className="text-right text-xs text-slate-400">
            <div>วันที่ปล่อยรถ: {new Date(release.created_at || '').toLocaleString('th-TH')}</div>
            <div className="text-slate-200 font-medium mt-0.5">ประเภท: {release.car_release_type_name || '-'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block">พนักงานขับรถ:</span>
            <span className="text-white font-semibold flex items-center gap-1 mt-0.5">
              <User className="w-3.5 h-3.5 text-blue-400" /> {release.driver_name}
            </span>
            <span className="text-[11px] text-slate-500">{release.driver_phone}</span>
          </div>

          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block">สายวิ่ง / กรุ๊ป:</span>
            <span className="text-white font-semibold flex items-center gap-1 mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400" /> {release.group_store_name || '-'}
            </span>
          </div>

          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block">เลขไมล์ออก / เครื่อง PDA:</span>
            <span className="text-white font-semibold block mt-0.5">
              {release.mileage ? `${release.mileage.toLocaleString()} กม.` : '-'}
            </span>
            <span className="text-[11px] text-slate-500">PDA: {release.pda_device || '-'}</span>
          </div>
        </div>

        {/* Dynamic Followers (Business Rule 5) */}
        {release.followers && release.followers.length > 0 && (
          <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/40 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1 mb-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" /> รายชื่อผู้ติดตาม ({release.followers.length} คน):
            </span>
            <div className="flex flex-wrap gap-2">
              {release.followers.map((f) => (
                <span key={f.follower_id} className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-slate-200">
                  {f.follower_name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stores List Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Building2 className="w-5 h-5 text-blue-400" />
          รายการร้านค้าตามเส้นทาง ({release.stores?.length || 0} ร้าน)
        </h2>

        <div className="space-y-3">
          {release.stores?.map((st) => (
            <div key={st.list_id} className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 text-xs space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">
                      {st.row_order}
                    </span>
                    <span>{st.store_name_result || st.store_name}</span>
                    {(st.position_product_name || st.position_product_id) && (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded-md font-mono font-bold">
                        จุดวาง {st.position_product_name || st.position_product_id}/{st.position_production_order || 1}
                      </span>
                    )}
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">{st.store_address}</p>
                </div>

                <div className="flex gap-1">
                  {st.bypass === 1 && (
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full">
                      Bypass
                    </span>
                  )}
                  {st.check_out_off_site === 1 && (
                    <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] px-2 py-0.5 rounded-full">
                      Off-site (&gt;300m)
                    </span>
                  )}
                </div>
              </div>

              {/* Status details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-700/40 text-[11px]">
                <div className="text-slate-300">
                  <span className="text-slate-500 block">เช็คอิน:</span>
                  {st.check_in_id ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {st.date_time_check_in ? new Date(st.date_time_check_in).toLocaleTimeString('th-TH') : 'เรียบร้อย'}
                    </span>
                  ) : (
                    <span className="text-slate-500">ยังไม่เช็คอิน</span>
                  )}
                </div>

                <div className="text-slate-300">
                  <span className="text-slate-500 block">เช็คเอาท์ / ประเภท:</span>
                  {st.check_out_id ? (
                    <div>
                      <span className="text-emerald-400 font-semibold block">{st.visit_type_name || 'ส่งของ'}</span>
                      <span className="text-slate-400">
                        สด: {formatMoney(st.cash)} | โอน: {formatMoney(st.transfer)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-500">ยังไม่เช็คเอาท์</span>
                  )}
                </div>

                <div className="text-slate-300">
                  <span className="text-slate-500 block">ปัญหา / หมายเหตุ:</span>
                  {st.problem_id ? (
                    <span className="text-amber-400 font-medium">{st.problem_name || 'มีการแจ้งปัญหา'}</span>
                  ) : (
                    <span className="text-slate-500">-</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Car Return Information if exists */}
      {release.car_return && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <RotateCcw className="w-5 h-5 text-emerald-400" />
            ข้อมูลการคืนรถ (Car Return Record)
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
              <span className="text-slate-400 block">เลขไมล์กลับ:</span>
              <span className="text-white font-semibold">{release.car_return.mileage?.toLocaleString()} กม.</span>
            </div>
            <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
              <span className="text-slate-400 block">ผู้ถือกุญแจ:</span>
              <span className="text-white font-semibold">{release.car_return.key_holder_name || '-'}</span>
            </div>
            <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
              <span className="text-slate-400 block">จุดจอดรถ:</span>
              <span className="text-white font-semibold">{release.car_return.parking_name || '-'}</span>
            </div>
            <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
              <span className="text-slate-400 block">ค่าน้ำมัน:</span>
              <span className="text-emerald-400 font-semibold">{formatMoney(release.car_return.gas_bill)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Accounting Approval Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <ShieldCheck className="w-5 h-5 text-blue-400" />
          การอนุมัติและตรวจสอบฝั่งบัญชี (Accounting Approval)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-medium">สถานะการตรวจสอบบัญชี</label>
            <select
              value={accStatus}
              onChange={(e) => setAccStatus(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {accountingMaster.length > 0 ? (
                accountingMaster.map((st) => (
                  <option key={st.status_id} value={st.status_id}>
                    {st.status_name} {st.description ? `(${st.description})` : ''}
                  </option>
                ))
              ) : (
                <>
                  <option value="1">รอการตรวจสอบ</option>
                  <option value="2">อนุมัติแล้ว</option>
                  <option value="3">ปฏิเสธ / มีข้อโต้แย้ง</option>
                </>
              )}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-medium">หมายเหตุบัญชี</label>
            <input
              type="text"
              value={accNote}
              onChange={(e) => setAccNote(e.target.value)}
              placeholder="ระบุหมายเหตุทางบัญชี"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <button
          onClick={handleUpdateAccounting}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-blue-500/20 transition-colors"
        >
          อัปเดตสถานะบัญชี
        </button>
      </div>
    </div>
  );
};
