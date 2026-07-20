import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Store } from '../types';
import { Store as StoreIcon, Upload, Plus, Search, MapPin, Phone } from 'lucide-react';

export const Stores: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // New store form
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreAddr, setNewStoreAddr] = useState('');
  const [newStorePhone, setNewStorePhone] = useState('');
  const [newStoreLoc, setNewStoreLoc] = useState('');

  // Import file
  const [importFile, setImportFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await api.get('/stores');
      if (res.data.success) {
        setStores(res.data.stores || []);
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/stores', {
        store_name: newStoreName,
        store_address: newStoreAddr,
        telephone_number: newStorePhone,
        store_location: newStoreLoc
      });
      if (res.data.success) {
        alert('เพิ่มข้อมูลร้านค้าสำเร็จ');
        setShowAddModal(false);
        setNewStoreName('');
        setNewStoreAddr('');
        setNewStorePhone('');
        setNewStoreLoc('');
        fetchStores();
      }
    } catch (err: any) {
      alert('เพิ่มร้านค้าล้มเหลว: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleImportExcel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) {
      alert('กรุณาเลือกไฟล์ Excel หรือ CSV');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', importFile);

      const res = await api.post('/stores/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploading(false);

      if (res.data.success) {
        alert(res.data.message || 'Import ข้อมูลร้านค้าสำเร็จ!');
        setImportFile(null);
        fetchStores();
      }
    } catch (err: any) {
      setUploading(false);
      alert('Import ล้มเหลว: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredStores = stores.filter(
    (s) =>
      s.store_name.toLowerCase().includes(search.toLowerCase()) ||
      (s.store_address && s.store_address.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <StoreIcon className="w-6 h-6 text-blue-400" />
            จัดการข้อมูลร้านค้า & Import เส้นทาง
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            ค้นหา, เพิ่มข้อมูลร้านค้าใหม่ หรือ นำเข้าไฟล์ Excel/CSV ข้อมูลเส้นทาง
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> เพิ่มร้านค้าใหม่
        </button>
      </div>

      {/* Import Excel Box */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Upload className="w-4 h-4 text-emerald-400" />
          นำเข้าข้อมูลร้านค้าผ่านไฟล์ Excel / CSV
        </h2>
        <form onSubmit={handleImportExcel} className="flex flex-col sm:flex-row items-center gap-3 text-xs">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            className="block w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-blue-400 hover:file:bg-slate-700 cursor-pointer"
          />
          <button
            type="submit"
            disabled={uploading || !importFile}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-xl shrink-0 transition-colors disabled:opacity-50"
          >
            {uploading ? 'กำลังนำเข้า...' : 'อัปโหลด Import'}
          </button>
        </form>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อร้านค้า หรือที่อยู่..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Store Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">กำลังโหลดข้อมูลร้านค้า...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStores.map((store) => (
            <div key={store.store_id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
              <h3 className="font-bold text-white text-sm">{store.store_name}</h3>
              <p className="text-slate-400 line-clamp-2">{store.store_address || 'ไม่มีข้อมูลที่อยู่'}</p>
              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-blue-400" /> {store.telephone_number || '-'}
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <MapPin className="w-3 h-3 text-amber-400" /> {store.store_location || 'ยังไม่ระบุพิกัด'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Store Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddStore} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">เพิ่มร้านค้าใหม่</h3>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">ชื่อร้านค้า *</label>
              <input
                type="text"
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">ที่อยู่ร้านค้า</label>
              <textarea
                value={newStoreAddr}
                onChange={(e) => setNewStoreAddr(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white h-16"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">เบอร์โทรศัพท์</label>
              <input
                type="text"
                value={newStorePhone}
                onChange={(e) => setNewStorePhone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">พิกัด GPS (lat,long)</label>
              <input
                type="text"
                value={newStoreLoc}
                onChange={(e) => setNewStoreLoc(e.target.value)}
                placeholder="เช่น 13.6682,100.6140"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-slate-800 text-slate-300 py-2.5 rounded-xl font-medium"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-medium"
              >
                บันทึกร้านค้า
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
