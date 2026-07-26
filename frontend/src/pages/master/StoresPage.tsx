import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { ConfirmModal } from "../../components/ConfirmModal";
import { PaginationControl } from "../../components/PaginationControl";
import { AnimatedDrawer } from "../../components/AnimatedDrawer";
import { MasterSubNav } from "../../components/MasterSubNav";
import {
  Building,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Upload,
  Download,
  ExternalLink,
  MapPin,
  Clock,
} from "lucide-react";

interface StoreData {
  store_id: string;
  store_name: string;
  store_address?: string;
  telephone_number?: string;
  fax_number?: string;
  email?: string;
  url?: string;
  customer_delivery_time?: string;
  store_location?: string;
  open_time?: string;
  close_time?: string;
}

export const StoresPage: React.FC = () => {
  const { showSuccess, showError } = useToast();

  const [stores, setStores] = useState<StoreData[]>([]);
  const [storesTotal, setStoresTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Pagination
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Drawer & Form
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreData | null>(null);
  const [formStoreId, setFormStoreId] = useState("");
  const [formStoreName, setFormStoreName] = useState("");
  const [formStoreAddress, setFormStoreAddress] = useState("");
  const [formStorePhone, setFormStorePhone] = useState("");
  const [formFaxNumber, setFormFaxNumber] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formStoreLocation, setFormStoreLocation] = useState("");
  const [formOpenTime, setFormOpenTime] = useState("08:00");
  const [formCloseTime, setFormCloseTime] = useState("17:00");

  // Excel Import & Export
  const [importFile, setImportFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Delete Modal
  const [storeToDelete, setStoreToDelete] = useState<StoreData | null>(null);

  const inputCls =
    "w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400";

  const renderField = (label: string, required: boolean, inputEl: React.ReactNode) => (
    <div>
      <label className="block text-slate-700 font-semibold mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {inputEl}
    </div>
  );

  const isStoreDirty = useMemo(() => {
    if (!editingStore) {
      return !!(
        formStoreId ||
        formStoreName ||
        formStoreAddress ||
        formStorePhone ||
        formFaxNumber ||
        formEmail ||
        formUrl ||
        formStoreLocation
      );
    }
    return (
      formStoreId !== (editingStore.store_id || "") ||
      formStoreName !== editingStore.store_name ||
      formStoreAddress !== (editingStore.store_address || "") ||
      formStorePhone !== (editingStore.telephone_number || "") ||
      formFaxNumber !== (editingStore.fax_number || "") ||
      formEmail !== (editingStore.email || "") ||
      formUrl !== (editingStore.url || "") ||
      formStoreLocation !== (editingStore.store_location || "") ||
      formOpenTime !== (editingStore.open_time || "08:00") ||
      formCloseTime !== (editingStore.close_time || "17:00")
    );
  }, [
    editingStore,
    formStoreId,
    formStoreName,
    formStoreAddress,
    formStorePhone,
    formFaxNumber,
    formEmail,
    formUrl,
    formStoreLocation,
    formOpenTime,
    formCloseTime,
  ]);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/master/stores", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: search,
        },
      });
      if (res.data.success) {
        setStores(res.data.stores || []);
        setStoresTotal(res.data.total ?? res.data.pagination?.total ?? (res.data.stores || []).length);
      }
    } catch (err) {
      console.error("Error fetching stores:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleOpenAddStore = () => {
    setEditingStore(null);
    setFormStoreId("");
    setFormStoreName("");
    setFormStoreAddress("");
    setFormStorePhone("");
    setFormFaxNumber("");
    setFormEmail("");
    setFormUrl("");
    setFormStoreLocation("");
    setFormOpenTime("08:00");
    setFormCloseTime("17:00");
    setIsDrawerOpen(true);
  };

  const handleOpenEditStore = (store: StoreData) => {
    setEditingStore(store);
    setFormStoreId(store.store_id || "");
    setFormStoreName(store.store_name);
    setFormStoreAddress(store.store_address || "");
    setFormStorePhone(store.telephone_number || "");
    setFormFaxNumber(store.fax_number || "");
    setFormEmail(store.email || "");
    setFormUrl(store.url || "");
    setFormStoreLocation(store.store_location || "");
    setFormOpenTime(store.open_time || "08:00");
    setFormCloseTime(store.close_time || "17:00");
    setIsDrawerOpen(true);
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStoreId || !formStoreName || !formStoreAddress || !formStorePhone) {
      showError("กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน");
      return;
    }

    try {
      const payload = {
        store_id: formStoreId,
        store_name: formStoreName,
        store_address: formStoreAddress,
        telephone_number: formStorePhone,
        fax_number: formFaxNumber,
        email: formEmail,
        url: formUrl,
        store_location: formStoreLocation,
        open_time: formOpenTime || "08:00",
        close_time: formCloseTime || "17:00",
      };

      if (editingStore) {
        await api.put(`/master/stores/${editingStore.store_id}`, payload);
        showSuccess("อัปเดตข้อมูลร้านค้าเรียบร้อยแล้ว!");
      } else {
        await api.post("/master/stores", payload);
        showSuccess("เพิ่มข้อมูลร้านค้าใหม่สำเร็จ!");
      }
      setIsDrawerOpen(false);
      fetchStores();
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกร้านค้า");
    }
  };

  const handleConfirmDeleteStore = async () => {
    if (!storeToDelete) return;
    try {
      await api.delete(`/master/stores/${storeToDelete.store_id}`);
      showSuccess(`ลบร้านค้า "${storeToDelete.store_name}" เรียบร้อยแล้ว`);
      fetchStores();
    } catch (err: any) {
      showError(err?.response?.data?.message || "ไม่สามารถลบข้อมูลร้านค้านี้ได้");
    } finally {
      setStoreToDelete(null);
    }
  };

  const handleImportExcel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) {
      showError("กรุณาเลือกไฟล์ Excel หรือ CSV ก่อนอัปโหลด");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", importFile);

    try {
      const res = await api.post("/master/stores/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        showSuccess(res.data.message || `นำเข้าข้อมูลร้านค้าสำเร็จ!`);
        setImportFile(null);
        fetchStores();
      }
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการนำเข้าไฟล์ Excel");
    } finally {
      setUploading(false);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const response = await api.get("/master/stores/export", {
        params: { search },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `stores_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showSuccess("ส่งออกข้อมูลร้านค้าเป็นไฟล์ Excel เรียบร้อยแล้ว!");
    } catch (err: any) {
      showError("เกิดข้อผิดพลาดในการส่งออกไฟล์ Excel");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="w-full space-y-4 font-sans text-xs pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building className="w-5 h-5 text-slate-800" />
            จัดการข้อมูลร้านค้า (Store Management)
          </h1>
          <p className="text-[11px] text-slate-500">
            บริหารจัดการรายชื่อร้านค้า ที่อยู่ เบอร์โทรศัพท์ พิกัด GPS และนำเข้าผ่านไฟล์ Excel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStores}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-1.5 rounded-lg font-medium flex items-center gap-1 shadow-2xs"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 text-slate-700 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            title="ส่งออกข้อมูลร้านค้าทั้งหมดเป็น Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exporting ? "กำลังส่งออก..." : "ส่งออก Excel"}</span>
          </button>
          <button
            onClick={handleOpenAddStore}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> <span>เพิ่มร้านค้าใหม่</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation */}
      <MasterSubNav />

      {/* Excel Import Box */}
      <div className="tms-card p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            นำเข้าและส่งออกข้อมูลร้านค้า (Excel / CSV)
          </h3>
        </div>
        <form onSubmit={handleImportExcel} className="flex flex-col sm:flex-row items-center gap-2 text-xs">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            className="block w-full text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-slate-200 file:text-xs file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 cursor-pointer"
          />
          <button
            type="submit"
            disabled={uploading || !importFile}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-1.5 rounded-lg shrink-0 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? "กำลังนำเข้า..." : "อัปโหลด Excel"}</span>
          </button>
        </form>
      </div>

      {/* Search Bar */}
      <div className="tms-card p-3 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหารหัสร้านค้า (store_id), ชื่อร้านค้า, ที่อยู่, เบอร์โทรศัพท์..."
            className="w-full bg-slate-50 border border-slate-200/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
          />
        </div>
      </div>

      {/* Stores Table Card */}
      <div className="tms-card overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                <th className="py-2.5 px-4 text-center w-28">รหัสร้านค้า (store_id)</th>
                <th className="py-2.5 px-4">ชื่อร้านค้า</th>
                <th className="py-2.5 px-4">เวลาเปิด-ปิดทำการ</th>
                <th className="py-2.5 px-4">ที่อยู่ร้านค้า</th>
                <th className="py-2.5 px-4">เบอร์โทรศัพท์ / แฟกซ์</th>
                <th className="py-2.5 px-4">อีเมล</th>
                <th className="py-2.5 px-4">พิกัด GPS</th>
                <th className="py-2.5 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
              {stores.map((s) => (
                <tr key={s.store_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-4 text-center">
                    <span className="font-mono font-bold bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                      {s.store_id}
                    </span>
                  </td>
                  <td className="py-2 px-4 font-bold text-slate-900">{s.store_name}</td>
                  <td className="py-2 px-4 text-slate-700">
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                      <Clock className="w-3 h-3 text-blue-600 shrink-0" />
                      {s.open_time || "08:00"} - {s.close_time || "17:00"}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-slate-600 max-w-[200px] truncate">{s.store_address || "-"}</td>
                  <td className="py-2 px-4 text-slate-600">
                    <div>{s.telephone_number || "-"}</div>
                  </td>
                  <td className="py-2 px-4 text-slate-600">
                    <div>{s.email || "-"}</div>
                  </td>
                  <td className="py-2 px-4 text-slate-600">
                    {s.store_location ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.store_location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-700 hover:text-amber-600 hover:underline font-medium transition-colors group"
                        title={`เปิดแผนที่ Google Maps (${s.store_location})`}
                      >
                        <MapPin className="w-3.5 h-3.5 text-amber-500 group-hover:text-amber-600 shrink-0" />
                        <span>{s.store_location}</span>
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-2 px-4 text-right space-x-1">
                    <button onClick={() => handleOpenEditStore(s)} className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100" title="แก้ไข">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setStoreToDelete(s)} className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50" title="ลบ">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {stores.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-slate-400">ยังไม่มีข้อมูลร้านค้า</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <PaginationControl
          currentPage={currentPage}
          totalItems={storesTotal}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Store Form Drawer */}
      <AnimatedDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingStore ? `แก้ไขข้อมูลร้านค้า (${editingStore.store_id})` : "เพิ่มร้านค้าใหม่"}
        formId="store-form"
        onSubmit={handleSaveStore}
        submitLabel={editingStore ? "บันทึกการแก้ไข" : "บันทึกสร้างร้านค้า"}
        isDirty={isStoreDirty}
      >
        {renderField("รหัสร้านค้า (store_id)", true,
          <input
            type="text"
            disabled={!!editingStore}
            value={formStoreId}
            onChange={(e) => setFormStoreId(e.target.value)}
            placeholder="เช่น ST-001"
            className={`${inputCls} font-mono ${
              editingStore ? "bg-slate-100 text-slate-500 cursor-not-allowed" : ""
            }`}
            required
          />
        )}
        {renderField("ชื่อร้านค้า", true,
          <input type="text" value={formStoreName} onChange={(e) => setFormStoreName(e.target.value)} placeholder="เช่น ร้านวาวาการค้า สาขา 1" className={inputCls} required />
        )}
        <div className="grid grid-cols-2 gap-3">
          {renderField("เวลาเปิดทำการ", false,
            <input
              type="time"
              value={formOpenTime}
              onChange={(e) => setFormOpenTime(e.target.value)}
              className={inputCls}
            />
          )}
          {renderField("เวลาปิดทำการ", false,
            <input
              type="time"
              value={formCloseTime}
              onChange={(e) => setFormCloseTime(e.target.value)}
              className={inputCls}
            />
          )}
        </div>
        {renderField("ที่อยู่ร้านค้า", true,
          <textarea value={formStoreAddress} onChange={(e) => setFormStoreAddress(e.target.value)} placeholder="ที่อยู่..." rows={3} className={`${inputCls} resize-none`} required />
        )}
        {renderField("เบอร์โทรศัพท์", true,
          <input type="text" value={formStorePhone} onChange={(e) => setFormStorePhone(e.target.value)} placeholder="เช่น 02-111-2222" className={inputCls} required />
        )}
        {renderField("เบอร์โทรสาร / แฟกซ์ (Fax)", false,
          <input type="text" value={formFaxNumber} onChange={(e) => setFormFaxNumber(e.target.value)} placeholder="เช่น 02-111-2223" className={inputCls} />
        )}
        {renderField("อีเมล (Email)", false,
          <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="เช่น store@example.com" className={inputCls} />
        )}
        {renderField("เว็บไซต์ / URL", false,
          <input type="text" value={formUrl} onChange={(e) => setFormUrl(e.target.value)} placeholder="เช่น https://www.store.com" className={inputCls} />
        )}
        {renderField("พิกัด GPS (lat,long)", false,
          <input type="text" value={formStoreLocation} onChange={(e) => setFormStoreLocation(e.target.value)} placeholder="เช่น 13.6682,100.6140" className={inputCls} />
        )}
      </AnimatedDrawer>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!storeToDelete}
        title="ยืนยันการลบร้านค้า"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบร้านค้า "${storeToDelete?.store_name}" (${storeToDelete?.store_id})?`}
        confirmText="ลบร้านค้า"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDeleteStore}
        onCancel={() => setStoreToDelete(null)}
      />
    </div>
  );
};

export default StoresPage;
