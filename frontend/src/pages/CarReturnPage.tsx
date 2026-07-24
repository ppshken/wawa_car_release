import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { CarRelease, KeyHolder, Parking } from '../types';
import { MultiImageUpload } from '../components/MultiImageUpload';
import { SearchableSelect } from '../components/SearchableSelect';
import { RotateCcw, Key, MapPin, Fuel, Camera, Check } from 'lucide-react';

export const CarReturnPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeReleases, setActiveReleases] = useState<CarRelease[]>([]);
  const [keyHolders, setKeyHolders] = useState<KeyHolder[]>([]);
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form states
  const [selectedReleaseId, setSelectedReleaseId] = useState<number | ''>('');
  const [selectedKeyHolderId, setSelectedKeyHolderId] = useState<number | ''>('');
  const [selectedParkingId, setSelectedParkingId] = useState<number | ''>('');
  const [returnMileage, setReturnMileage] = useState<number>(0);
  const [gasBill, setGasBill] = useState<number>(0);
  const [note, setNote] = useState<string>('');
  const [images, setImages] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [relRes, keyRes, parkRes] = await Promise.all([
        api.get('/car-release'),
        api.get('/key-holders'),
        api.get('/parkings')
      ]);

      if (relRes.data.success) {
        const unreturned = relRes.data.releases.filter((r: CarRelease) => !r.is_returned);
        setActiveReleases(unreturned);
        if (unreturned.length > 0) setSelectedReleaseId(unreturned[0].car_release_id);
      }
      if (keyRes.data.success) {
        setKeyHolders(keyRes.data.keyHolders);
        if (keyRes.data.keyHolders.length > 0) setSelectedKeyHolderId(keyRes.data.keyHolders[0].key_holder_id);
      }
      if (parkRes.data.success) {
        setParkings(parkRes.data.parkings);
        if (parkRes.data.parkings.length > 0) setSelectedParkingId(parkRes.data.parkings[0].parking_id);
      }
    } catch (err) {
      console.error('Error fetching return page data:', err);
    } fontally: {
      setLoading(false);
    }
  };

  const handleImageChange = (key: string, base64: string) => {
    setImages((prev) => ({ ...prev, [key]: base64 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReleaseId) {
      alert('กรุณาเลือกใบปล่อยรถที่ต้องการบันทึกคืน');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        key_holder_id: selectedKeyHolderId,
        parking_id: selectedParkingId,
        mileage: returnMileage,
        gas_bill: gasBill,
        note,
        image_mileage: images.image_mileage || '',
        image_front: images.image_front || '',
        image_around_1: images.image_around_1 || '',
        image_around_2: images.image_around_2 || '',
        image_around_3: images.image_around_3 || '',
        image_around_4: images.image_around_4 || '',
        image_return: images.image_return || '',
        image_pda: images.image_pda || ''
      };

      const res = await api.post(`/car-release/${selectedReleaseId}/return`, payload);
      setSubmitting(false);

      if (res.data.success) {
        alert('บันทึกใบคืนรถเรียบร้อยแล้ว!');
        navigate('/releases');
      } else {
        alert(res.data.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (err: any) {
      setSubmitting(false);
      alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-500">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto pb-12">
      <div className="flex justify-between items-center bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-blue-400" />
            บันทึกการคืนรถ (Car Return Form)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            บันทึกเลขไมล์กลับ, ผู้ถือกุญแจ, จุดจอดรถ, ค่าน้ำมัน และถ่ายรูปสภาพรถ 4 มุม
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
        <SearchableSelect
          label="เลือกใบปล่อยรถที่ต้องการคืน"
          required
          value={selectedReleaseId}
          onChange={(val) => setSelectedReleaseId(Number(val) || "")}
          placeholder="-- เลือกใบปล่อยรถที่ต้องการคืน --"
          searchPlaceholder="พิมพ์ค้นหา (เลขใบปล่อย / ทะเบียน / คนขับ)..."
          options={activeReleases.map((r) => ({
            value: r.car_release_id,
            label: `${r.car_release_no} - ${r.license_plate} (${r.driver_name})`,
            badge: r.license_plate,
          }))}
          emptyText="ไม่มีใบปล่อยรถที่รอคืน"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SearchableSelect
            label="ผู้ถือกุญแจรถ"
            value={selectedKeyHolderId}
            onChange={(val) => setSelectedKeyHolderId(Number(val) || "")}
            placeholder="-- เลือกผู้ถือกุญแจ --"
            searchPlaceholder="พิมพ์ค้นหาผู้ถือกุญแจ..."
            options={keyHolders.map((k) => ({
              value: k.key_holder_id,
              label: k.key_holder_name,
            }))}
          />

          <SearchableSelect
            label="จุดจอดรถ"
            value={selectedParkingId}
            onChange={(val) => setSelectedParkingId(Number(val) || "")}
            placeholder="-- เลือกจุดจอดรถ --"
            searchPlaceholder="พิมพ์ค้นหาจุดจอด..."
            options={parkings.map((p) => ({
              value: p.parking_id,
              label: p.parking_name,
            }))}
          />

          <div className="space-y-1">
            <label className="text-slate-300 font-medium">เลขไมล์ตอนกลับ (กิโลเมตร)</label>
            <input
              type="number"
              value={returnMileage}
              onChange={(e) => setReturnMileage(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-medium flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5 text-emerald-400" /> ค่าน้ำมัน (บาท)
            </label>
            <input
              type="number"
              value={gasBill}
              onChange={(e) => setGasBill(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-slate-300 font-medium">หมายเหตุใบคืนรถ</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="ระบุสภาพรถหรือสิ่งที่ต้องแจ้งหัวหน้าคลัง"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white h-20"
          />
        </div>
      </div>

      {/* Car Photos 4-Around */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Camera className="w-5 h-5 text-blue-400" />
          ถ่ายรูปสภาพรถตอนคืน (4 มุม + รูปคืนโดยรวม)
        </h2>

        <MultiImageUpload
          labels={['ด้านหน้ารถ (1)', 'ข้างขวา (2)', 'ข้างซ้าย (3)', 'ด้านหลังรถ (4)']}
          images={images}
          onChange={handleImageChange}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3.5 rounded-xl shadow-xl shadow-blue-500/25 transition-all text-sm disabled:opacity-50"
      >
        {submitting ? 'กำลังบันทึกข้อมูล...' : 'บันทึกการคืนรถ'}
      </button>
    </form>
  );
};
