import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { CarRelease, ListStore, VisitType, Payment } from '../types';
import { SignaturePad } from '../components/SignaturePad';
import {
  Navigation,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Camera,
  FileCheck,
  CreditCard,
  Building2,
  AlertCircle
} from 'lucide-react';

export const DriverCheckInOut: React.FC = () => {
  const [activeRelease, setActiveRelease] = useState<CarRelease | null>(null);
  const [selectedListStore, setSelectedListStore] = useState<ListStore | null>(null);
  const [visitTypes, setVisitTypes] = useState<VisitType[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Check-in state
  const [checkInImage, setCheckInImage] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<string>('');

  // Check-out state
  const [selectedVisitTypeId, setSelectedVisitTypeId] = useState<number | ''>(4); // Default 4 = ส่งของ
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | ''>(1);
  const [cash, setCash] = useState<number>(0);
  const [transfer, setTransfer] = useState<number>(0);
  const [transferAccording, setTransferAccording] = useState<boolean>(false);
  const [visitNote, setVisitNote] = useState<string>('');
  const [billImage, setBillImage] = useState<string>('');

  // Modal active mode
  const [modalMode, setModalMode] = useState<'checkin' | 'checkout' | 'problem' | null>(null);

  // Problem form state
  const [problemName, setProblemName] = useState<string>('บันทึกปัญหา');
  const [normalBill, setNormalBill] = useState<boolean>(false);
  const [editBill, setEditBill] = useState<boolean>(false);
  const [productSwap, setProductSwap] = useState<boolean>(false);
  const [outOfStock, setOutOfStock] = useState<boolean>(false);
  const [overstock, setOverstock] = useState<boolean>(false);
  const [problemNote, setProblemNote] = useState<string>('');

  useEffect(() => {
    fetchActiveRelease();
    fetchMasters();
    getUserGPSLocation();
  }, []);

  const getUserGPSLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLocation(`${pos.coords.latitude},${pos.coords.longitude}`);
        },
        (err) => {
          console.warn('GPS position error fallback to default Bangkok:', err);
          setCurrentLocation('13.7563,100.5018');
        }
      );
    }
  };

  const fetchActiveRelease = async () => {
    try {
      setLoading(true);
      const res = await api.get('/car-release');
      if (res.data.success && res.data.releases?.length > 0) {
        // Fetch full detail of latest release
        const detailRes = await api.get(`/car-release/${res.data.releases[0].car_release_id}`);
        if (detailRes.data.success) {
          setActiveRelease(detailRes.data.release);
        }
      }
    } catch (err) {
      console.error('Error fetching driver active release:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasters = async () => {
    try {
      const [vtRes, pRes] = await Promise.all([api.get('/visit-types'), api.get('/payments')]);
      if (vtRes.data.success) setVisitTypes(vtRes.data.visitTypes);
      if (pRes.data.success) setPayments(pRes.data.payments);
    } catch (err) {
      console.error('Error fetching visit types:', err);
    }
  };

  const handleCheckInSubmit = async () => {
    if (!selectedListStore) return;
    try {
      const res = await api.post(`/list-store/${selectedListStore.list_id}/check-in`, {
        image_check_in: checkInImage,
        signature,
        location: currentLocation
      });
      if (res.data.success) {
        alert('เช็คอินเรียบร้อยแล้ว!');
        setModalMode(null);
        fetchActiveRelease();
      }
    } catch (err: any) {
      alert('เช็คอินล้มเหลว: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCheckOutSubmit = async () => {
    if (!selectedListStore) return;
    if (!selectedVisitTypeId) {
      alert('กรุณาเลือกประเภทการแวะ (visit_type)');
      return;
    }

    try {
      const res = await api.post(`/list-store/${selectedListStore.list_id}/check-out`, {
        payment_id: selectedPaymentId,
        image_bill: billImage,
        cash,
        transfer,
        transfer_according: transferAccording ? 1 : 0,
        visit_type_id: selectedVisitTypeId,
        visit_note: visitNote,
        current_location: currentLocation
      });

      if (res.data.success) {
        if (res.data.off_site) {
          alert('เช็คเอาท์สำเร็จ! (ระบบตรวจพบตำแหน่ง off_site: นอกพื้นที่ > 300 เมตร)');
        } else {
          alert('เช็คเอาท์สำเร็จเรียบร้อย!');
        }
        setModalMode(null);
        fetchActiveRelease();
      }
    } catch (err: any) {
      alert('เช็คเอาท์ล้มเหลว: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleProblemSubmit = async () => {
    if (!selectedListStore) return;
    try {
      const res = await api.post(`/list-store/${selectedListStore.list_id}/problem`, {
        problem_name: problemName,
        normal_bill: normalBill ? 1 : 0,
        edit_bill: editBill ? 1 : 0,
        edit_bill_note: problemNote,
        product_swap: productSwap ? 1 : 0,
        out_of_stock: outOfStock ? 1 : 0,
        overstock: overstock ? 1 : 0
      });
      if (res.data.success) {
        alert('บันทึกปัญหาเรียบร้อยแล้ว');
        setModalMode(null);
        fetchActiveRelease();
      }
    } catch (err: any) {
      alert('บันทึกปัญหาล้มเหลว: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-500">กำลังโหลดรายการงาน...</div>;
  }

  if (!activeRelease) {
    return (
      <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-400">
        <Navigation className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">ไม่มีงานปล่อยรถในขณะนี้</h2>
        <p className="text-xs text-slate-500 mt-1">โปรดติดต่อหัวหน้างานเพื่อออกใบปล่อยรถขาย</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-lg">
              {activeRelease.car_release_no}
            </span>
            <h1 className="text-lg font-bold text-white mt-1">
              {activeRelease.license_plate} ({activeRelease.brand} {activeRelease.model})
            </h1>
          </div>
          <div className="text-right text-xs">
            <span className="text-slate-400 block">พนักงาน: {activeRelease.driver_name}</span>
            <span className="text-blue-400 font-semibold">{activeRelease.group_store_name}</span>
          </div>
        </div>

        {activeRelease.followers && activeRelease.followers.length > 0 && (
          <div className="text-xs text-slate-400 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50 flex items-center gap-2">
            <span className="font-semibold text-slate-300">ผู้ติดตาม:</span>
            <span>{activeRelease.followers.map((f) => f.follower_name).join(', ')}</span>
          </div>
        )}
      </div>

      {/* Stores checklist */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-400" />
          รายการร้านค้าตามเส้นทางวิ่งงาน ({activeRelease.stores?.length || 0} ร้าน)
        </h2>

        {activeRelease.stores?.map((item) => {
          const isCheckedIn = !!item.check_in_id;
          const isCheckedOut = !!item.check_out_id;
          const isBypassed = item.bypass === 1;

          return (
            <div
              key={item.list_id}
              className={`p-4 rounded-2xl border transition-all ${
                isBypassed
                  ? 'bg-slate-900/40 border-slate-800 opacity-60'
                  : isCheckedOut
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : isCheckedIn
                  ? 'bg-blue-950/20 border-blue-500/30'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                      isCheckedOut
                        ? 'bg-emerald-500 text-white'
                        : isCheckedIn
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.row_order}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {item.store_name_result || item.store_name}
                      {isBypassed && (
                        <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-medium">
                          Bypass (ข้ามร้านซ้ำ)
                        </span>
                      )}
                      {item.check_out_off_site === 1 && (
                        <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Off-site
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{item.store_address}</p>
                  </div>
                </div>
              </div>

              {/* Action buttons if not bypassed */}
              {!isBypassed && (
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
                  {!isCheckedIn && (
                    <button
                      onClick={() => {
                        setSelectedListStore(item);
                        setModalMode('checkin');
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl font-medium flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                    >
                      <MapPin className="w-3.5 h-3.5" /> เช็คอิน (Check In)
                    </button>
                  )}

                  {isCheckedIn && !isCheckedOut && (
                    <button
                      onClick={() => {
                        setSelectedListStore(item);
                        setModalMode('checkout');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl font-medium flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                    >
                      <FileCheck className="w-3.5 h-3.5" /> เช็คเอาท์ (Check Out)
                    </button>
                  )}

                  {isCheckedOut && (
                    <span className="text-emerald-400 font-medium flex items-center gap-1 py-1">
                      <CheckCircle2 className="w-4 h-4" /> เสร็จสิ้นเรียบร้อย
                    </span>
                  )}

                  <button
                    onClick={() => {
                      setSelectedListStore(item);
                      setModalMode('problem');
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 px-3 py-2 rounded-xl font-medium flex items-center gap-1.5 ml-auto"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> แจ้งปัญหา
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Check-in Modal */}
      {modalMode === 'checkin' && selectedListStore && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              เช็คอินร้าน {selectedListStore.store_name}
            </h3>

            <div className="space-y-3">
              <label className="text-xs font-medium text-slate-300 block">1. ลายเซ็นผู้รับสินค้า</label>
              <SignaturePad onSave={setSignature} />

              <label className="text-xs font-medium text-slate-300 block pt-2">2. รูปภาพเช็คอิน</label>
              <label className="border-2 border-dashed border-slate-700 bg-slate-800/60 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer text-xs text-slate-400 hover:border-blue-500">
                <Camera className="w-6 h-6 text-blue-400 mb-1" />
                <span>แตะเพื่อถ่ายรูปเช็คอินหน้าร้าน</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const r = new FileReader();
                      r.onloadend = () => setCheckInImage(r.result as string);
                      r.readAsDataURL(file);
                    }
                  }}
                />
              </label>
              {checkInImage && (
                <img src={checkInImage} alt="Checkin" className="h-24 rounded-xl object-cover mx-auto" />
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setModalMode(null)}
                className="flex-1 bg-slate-800 text-slate-300 py-2.5 rounded-xl text-xs font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleCheckInSubmit}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-xs font-medium"
              >
                ยืนยันเช็คอิน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check-out Modal */}
      {modalMode === 'checkout' && selectedListStore && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 my-8">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-400" />
              เช็คเอาท์ร้าน {selectedListStore.store_name}
            </h3>

            <div className="space-y-3 text-xs">
              {/* Mandatory Visit Type (Business Rule 4) */}
              <div className="space-y-1">
                <label className="text-slate-200 font-bold flex items-center gap-1">
                  ประเภทการแวะ (Visit Type) <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedVisitTypeId}
                  onChange={(e) => setSelectedVisitTypeId(Number(e.target.value))}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  {visitTypes.map((vt) => (
                    <option key={vt.visit_type_id} value={vt.visit_type_id}>
                      {vt.visit_type_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment selector */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">ประเภทการชำระเงิน</label>
                <select
                  value={selectedPaymentId}
                  onChange={(e) => setSelectedPaymentId(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  {payments.map((p) => (
                    <option key={p.payment_id} value={p.payment_id}>
                      {p.payment_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-medium">จำนวนเงินสด (บาท)</label>
                  <input
                    type="number"
                    value={cash}
                    onChange={(e) => setCash(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium">จำนวนเงินโอน (บาท)</label>
                  <input
                    type="number"
                    value={transfer}
                    onChange={(e) => setTransfer(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white"
                  />
                </div>
              </div>

              {/* Transfer According Checkbox (Business Rule 2) */}
              <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-xl">
                <label className="flex items-center gap-2 font-medium text-amber-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={transferAccording}
                    onChange={(e) => setTransferAccording(e.target.checked)}
                    className="rounded bg-slate-800 border-amber-500 text-amber-500"
                  />
                  <span>ชำระแบบโอนตามทีหลัง (ค้างชำระ / เครดิต)</span>
                </label>
              </div>

              <div>
                <label className="text-slate-300 font-medium">หมายเหตุเพิ่มเติม</label>
                <textarea
                  value={visitNote}
                  onChange={(e) => setVisitNote(e.target.value)}
                  placeholder="เช่น ฝากสินค้าไว้ข้างร้าน, ลูกค้าขอนัดจ่ายพรุ่งนี้"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white h-16"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block">รูปบิล / สลิปการโอน</label>
                <label className="border border-dashed border-slate-700 bg-slate-800/60 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer text-slate-400 hover:border-emerald-500">
                  <Camera className="w-5 h-5 text-emerald-400" />
                  <span>ถ่ายรูปบิล/สลิป</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const r = new FileReader();
                        r.onloadend = () => setBillImage(r.result as string);
                        r.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
                {billImage && <img src={billImage} alt="Bill" className="h-20 rounded-xl object-cover mt-2 mx-auto" />}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setModalMode(null)}
                className="flex-1 bg-slate-800 text-slate-300 py-2.5 rounded-xl text-xs font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleCheckOutSubmit}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-medium"
              >
                บันทึกเช็คเอาท์
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Problem Modal */}
      {modalMode === 'problem' && selectedListStore && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              บันทึกปัญหา/ปรับบิล ร้าน {selectedListStore.store_name}
            </h3>

            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 text-slate-200">
                <input
                  type="checkbox"
                  checked={normalBill}
                  onChange={(e) => setNormalBill(e.target.checked)}
                />
                บิลปกติ
              </label>

              <label className="flex items-center gap-2 text-slate-200">
                <input
                  type="checkbox"
                  checked={editBill}
                  onChange={(e) => setEditBill(e.target.checked)}
                />
                มีการแก้ไขบิล
              </label>

              <label className="flex items-center gap-2 text-slate-200">
                <input
                  type="checkbox"
                  checked={productSwap}
                  onChange={(e) => setProductSwap(e.target.checked)}
                />
                มีการเปลี่ยนสินค้า
              </label>

              <label className="flex items-center gap-2 text-slate-200">
                <input
                  type="checkbox"
                  checked={outOfStock}
                  onChange={(e) => setOutOfStock(e.target.checked)}
                />
                สินค้าขาดสต็อก
              </label>

              <label className="flex items-center gap-2 text-slate-200">
                <input
                  type="checkbox"
                  checked={overstock}
                  onChange={(e) => setOverstock(e.target.checked)}
                />
                สินค้าเกิน
              </label>

              <div className="pt-2">
                <label className="text-slate-300 font-medium">รายละเอียดปัญหา</label>
                <textarea
                  value={problemNote}
                  onChange={(e) => setProblemNote(e.target.value)}
                  placeholder="ระบุสาเหตุ และรายละเอียดการปรับบิล"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white h-20"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setModalMode(null)}
                className="flex-1 bg-slate-800 text-slate-300 py-2.5 rounded-xl text-xs font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleProblemSubmit}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-2.5 rounded-xl text-xs font-medium"
              >
                บันทึกปัญหา
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
