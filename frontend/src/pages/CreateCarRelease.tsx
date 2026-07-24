import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Car, User, GroupStore, Store, CarReleaseType } from '../types';
import { MultiImageUpload } from '../components/MultiImageUpload';
import { SearchableSelect } from '../components/SearchableSelect';
import { PlusCircle, Trash2, Users, Truck, Camera, Check, Store as StoreIcon } from 'lucide-react';

export const CreateCarRelease: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Master options
  const [cars, setCars] = useState<Car[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [groups, setGroups] = useState<GroupStore[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [releaseTypes, setReleaseTypes] = useState<CarReleaseType[]>([]);

  // Form states
  const [selectedCarId, setSelectedCarId] = useState<number | ''>('');
  const [selectedDriverId, setSelectedDriverId] = useState<number | ''>('');
  const [selectedGroupId, setSelectedGroupId] = useState<number | ''>('');
  const [selectedTypeId, setSelectedTypeId] = useState<number | ''>('');
  const [mileage, setMileage] = useState<number>(0);
  const [pdaDevice, setPdaDevice] = useState<string>('PDA-01');
  const [description, setDescription] = useState<string>('');

  // Dynamic followers (Business Rule 5)
  const [followers, setFollowers] = useState<string[]>(['']);

  // Car photos 5-around (Business Rule 6)
  const [images, setImages] = useState<{ [key: string]: string }>({});

  // Selected stores list
  const [selectedStores, setSelectedStores] = useState<
    { store_id: number; row_order: number; sum_quantity: number; bypass: boolean }[]
  >([]);

  useEffect(() => {
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    try {
      const [carsRes, usersRes, groupsRes, storesRes, typesRes] = await Promise.all([
        api.get('/cars'),
        api.get('/users'),
        api.get('/group-stores'),
        api.get('/stores'),
        api.get('/car-release-types')
      ]);

      if (carsRes.data.success) setCars(carsRes.data.cars);
      if (usersRes.data.success) setDrivers(usersRes.data.users);
      if (groupsRes.data.success) setGroups(groupsRes.data.groups);
      if (storesRes.data.success) setStores(storesRes.data.stores);
      if (typesRes.data.success) setReleaseTypes(typesRes.data.releaseTypes);

      if (carsRes.data.cars?.length) setSelectedCarId(carsRes.data.cars[0].car_id);
      if (usersRes.data.users?.length) setSelectedDriverId(usersRes.data.users[0].user_id);
      if (groupsRes.data.groups?.length) setSelectedGroupId(groupsRes.data.groups[0].group_store_id);
      if (typesRes.data.releaseTypes?.length) setSelectedTypeId(typesRes.data.releaseTypes[0].car_release_type_id);
    } catch (err) {
      console.error('Error fetching master data:', err);
    }
  };

  // Follower helpers
  const addFollower = () => setFollowers([...followers, '']);
  const removeFollower = (idx: number) => setFollowers(followers.filter((_, i) => i !== idx));
  const updateFollower = (idx: number, val: string) => {
    const updated = [...followers];
    updated[idx] = val;
    setFollowers(updated);
  };

  // Store selector helpers
  const toggleStore = (store_id: number) => {
    const exists = selectedStores.find((s) => s.store_id === store_id);
    if (exists) {
      setSelectedStores(selectedStores.filter((s) => s.store_id !== store_id));
    } else {
      setSelectedStores([
        ...selectedStores,
        { store_id, row_order: selectedStores.length + 1, sum_quantity: 1, bypass: false }
      ]);
    }
  };

  const updateStoreQty = (store_id: number, qty: number) => {
    setSelectedStores(
      selectedStores.map((s) => (s.store_id === store_id ? { ...s, sum_quantity: qty } : s))
    );
  };

  const toggleStoreBypass = (store_id: number) => {
    setSelectedStores(
      selectedStores.map((s) => (s.store_id === store_id ? { ...s, bypass: !s.bypass } : s))
    );
  };

  const handleImageChange = (key: string, base64: string) => {
    setImages((prev) => ({ ...prev, [key]: base64 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCarId || !selectedDriverId) {
      alert('กรุณาเลือกรถและพนักงานขับรถ');
      return;
    }

    if (selectedStores.length === 0) {
      alert('กรุณาเลือกรายการร้านค้าอย่างน้อย 1 ร้าน');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        car_id: selectedCarId,
        car_release_type_id: selectedTypeId,
        user_id: selectedDriverId,
        group_store_id: selectedGroupId,
        mileage,
        pda_device: pdaDevice,
        description,
        followers: followers.filter((f) => f.trim() !== ''),
        stores: selectedStores,
        image_mileage: images.image_mileage || '',
        image_front: images.image_front || '',
        image_around_1: images.image_around_1 || '',
        image_around_2: images.image_around_2 || '',
        image_around_3: images.image_around_3 || '',
        image_around_4: images.image_around_4 || '',
        image_around_5: images.image_around_5 || '',
        image_pda: images.image_pda || ''
      };

      const res = await api.post('/car-release', payload);
      setLoading(false);

      if (res.data.success) {
        alert(`ออกใบปล่อยรถสำเร็จ! (เลขที่: ${res.data.car_release_no})`);
        navigate('/releases');
      } else {
        alert(res.data.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (err: any) {
      setLoading(false);
      alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-blue-400" />
            ออกใบปล่อยรถขายใหม่ (Car Release Order)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            กรอกข้อมูลรถ, พนักงานขับรถ, ผู้ติดตาม, ถ่ายรูปสภาพรถ 5 ด้าน และเลือกเส้นทางร้านค้า
          </p>
        </div>
      </div>

      {/* Section 1: Basic Information */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Truck className="w-5 h-5 text-blue-400" />
          1. ข้อมูลรถและคนขับ
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <SearchableSelect
            label="เลือกรถ"
            required
            value={selectedCarId}
            onChange={(val) => setSelectedCarId(Number(val) || "")}
            placeholder="-- เลือกรถ --"
            searchPlaceholder="พิมพ์ค้นหารถ (ทะเบียน / ยี่ห้อ / รุ่น)..."
            options={cars.map((c) => ({
              value: c.car_id,
              label: `${c.license_plate} (${c.brand} ${c.model})`,
              badge: c.license_plate,
            }))}
          />

          <SearchableSelect
            label="พนักงานขับรถ"
            required
            value={selectedDriverId}
            onChange={(val) => setSelectedDriverId(Number(val) || "")}
            placeholder="-- เลือกพนักงานขับรถ --"
            searchPlaceholder="พิมพ์ค้นหาชื่อคนขับ..."
            options={drivers.map((d) => ({
              value: d.user_id,
              label: `${d.name} (${d.level_user_name || "พนักงาน"})`,
            }))}
          />

          <SearchableSelect
            label="กรุ๊ป/โซนเส้นทาง"
            value={selectedGroupId}
            onChange={(val) => setSelectedGroupId(Number(val) || "")}
            placeholder="-- เลือกกรุ๊ป/โซนเส้นทาง --"
            searchPlaceholder="พิมพ์ค้นหากรุ๊ป/โซน..."
            options={groups.map((g) => ({
              value: g.group_store_id,
              label: g.group_store_name,
            }))}
          />

          <SearchableSelect
            label="ประเภทการปล่อยรถ"
            value={selectedTypeId}
            onChange={(val) => setSelectedTypeId(Number(val) || "")}
            placeholder="-- เลือกประเภทการปล่อยรถ --"
            searchPlaceholder="พิมพ์ค้นหาประเภท..."
            options={releaseTypes.map((t) => ({
              value: t.car_release_type_id,
              label: t.type,
            }))}
          />

          <div className="space-y-1">
            <label className="text-slate-300 font-medium">เลขไมล์ออก (กิโลเมตร)</label>
            <input
              type="number"
              value={mileage}
              onChange={(e) => setMileage(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-medium">หมายเลขเครื่อง PDA</label>
            <input
              type="text"
              value={pdaDevice}
              onChange={(e) => setPdaDevice(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Dynamic Followers (Business Rule 5 Requirement) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            2. รายชื่อผู้ติดตาม (Followers List)
          </h2>
          <button
            type="button"
            onClick={addFollower}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium"
          >
            + เพิ่มผู้ติดตาม
          </button>
        </div>

        <div className="space-y-2">
          {followers.map((f, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="text"
                value={f}
                onChange={(e) => updateFollower(idx, e.target.value)}
                placeholder={`ชื่อผู้ติดตามคนที่ ${idx + 1} (เช่น นาย สมชาย)`}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              {followers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFollower(idx)}
                  className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Car Photos 5-Around (Business Rule 6 Requirement) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Camera className="w-5 h-5 text-blue-400" />
          3. ถ่ายรูปสภาพรถรอบคัน (บังคับถ่ายครบ 5 มุม)
        </h2>

        <MultiImageUpload
          labels={['ด้านหน้ารถ (1)', 'ข้างขวา (2)', 'ข้างซ้าย (3)', 'ด้านหลังรถ (4)', 'ภายใน/PDA (5)']}
          images={images}
          onChange={handleImageChange}
        />
      </div>

      {/* Section 4: Route Stores Selection (Business Rule 1: Bypass) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <StoreIcon className="w-5 h-5 text-blue-400" />
          4. เลือกร้านค้าตามเส้นทางวิ่งงาน (List Stores)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
          {stores.map((s) => {
            const isSelected = selectedStores.some((sel) => sel.store_id === s.store_id);
            const selItem = selectedStores.find((sel) => sel.store_id === s.store_id);

            return (
              <div
                key={s.store_id}
                className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                  isSelected
                    ? 'bg-blue-950/20 border-blue-500/50'
                    : 'bg-slate-800/40 border-slate-700/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="cursor-pointer flex-1" onClick={() => toggleStore(s.store_id)}>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                          isSelected ? 'bg-blue-500 text-white' : 'border border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      {s.store_name}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{s.store_address}</p>
                  </div>
                </div>

                {isSelected && selItem && (
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-700/60 mt-1">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">จำนวน:</span>
                      <input
                        type="number"
                        min="1"
                        value={selItem.sum_quantity}
                        onChange={(e) => updateStoreQty(s.store_id, Number(e.target.value))}
                        className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-center text-white"
                      />
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer text-amber-400 font-medium">
                      <input
                        type="checkbox"
                        checked={selItem.bypass}
                        onChange={() => toggleStoreBypass(s.store_id)}
                        className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-500"
                      />
                      Bypass (ร้านซ้ำ)
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3.5 rounded-xl shadow-xl shadow-blue-500/25 transition-all text-sm disabled:opacity-50"
      >
        {loading ? 'กำลังบันทึกข้อมูล...' : 'บันทึกและออกใบปล่อยรถ'}
      </button>
    </form>
  );
};
