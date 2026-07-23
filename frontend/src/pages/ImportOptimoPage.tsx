import React, { useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import {
  DownloadCloud,
  Calendar,
  CheckCircle2,
  Database,
  ArrowRight,
  Loader2,
  MapPin,
  Store,
  Layers,
  Eye,
  Save,
  Truck,
  Package,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PreviewStop {
  rowOrder: number;
  locationNo: string;
  storeName: string;
  address: string;
  quantity: number;
  lat: number;
  lng: number;
  lat_long: string | null;
}

interface PreviewGroup {
  groupStoreName: string;
  groupColor: string;
  driverName: string;
  vehiclePlate: string;
  totalStops: number;
  stops: PreviewStop[];
}

export const ImportOptimoPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [fetchingPreview, setFetchingPreview] = useState(false);
  const [importing, setImporting] = useState(false);

  // Preview state
  const [previewData, setPreviewData] = useState<{
    date: string;
    source: string;
    totalGroups: number;
    totalStops: number;
    routes: PreviewGroup[];
  } | null>(null);

  // Success result stats
  const [resultStats, setResultStats] = useState<{
    importedGroups: number;
    importedStores: number;
    importedListStores: number;
  } | null>(null);

  // 1. Fetch Preview Data (No DB insertion)
  const handleFetchPreview = async () => {
    setFetchingPreview(true);
    setPreviewData(null);
    setResultStats(null);

    try {
      const res = await api.post("/optimoroute/preview", { date: selectedDate });
      if (res.data.success) {
        setPreviewData(res.data);
        showSuccess(`ดึงข้อมูลพรีวิว ${res.data.totalGroups} สาย ${res.data.totalStops} จุดส่ง สำเร็จ`);
      } else {
        showError(res.data.message || "ไม่สามารถดึงข้อมูลพรีวิวได้");
      }
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลพรีวิว");
    } finally {
      setFetchingPreview(false);
    }
  };

  // 2. Confirm & Save to Database
  const handleConfirmImport = async () => {
    if (!previewData) return;
    setImporting(true);

    try {
      const res = await api.post("/optimoroute/import", { date: selectedDate });
      if (res.data.success) {
        showSuccess(res.data.message || "บันทึกข้อมูลเข้าฐานข้อมูลสำเร็จ");
        setResultStats(res.data.stats);
      } else {
        showError(res.data.message || "นำเข้าข้อมูลไม่สำเร็จ");
      }
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการนำเข้าข้อมูล");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="w-full max-w-full mx-auto space-y-6 font-sans text-xs pt-2 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <DownloadCloud className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">นำเข้าข้อมูล OptimoRoute (Preview & Save)</h1>
            <p className="text-slate-500 text-[11px]">
              พรีวิวตรวจสอบข้อมูลเส้นทางจาก OptimoRoute API ก่อนยืนยันนำเข้าลงฐานข้อมูล (<span className="font-mono text-blue-600">group_store</span>, <span className="font-mono text-blue-600">store</span>, <span className="font-mono text-blue-600">list_store</span>)
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            ขั้นตอนที่ 1: เลือกวันที่ และ ดึงข้อมูลมาพรีวิวตรวจสอบ
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setPreviewData(null);
                  setResultStats(null);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />
            </div>

            <button
              onClick={handleFetchPreview}
              disabled={fetchingPreview}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
            >
              {fetchingPreview ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังดึงข้อมูลพรีวิว...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  ดึงข้อมูลพรีวิว (Preview Data)
                </>
              )}
            </button>
          </div>
        </div>

        {/* ═══ STEP 2: PREVIEW DATA SECTION ═══ */}
        {previewData && (
          <div className="border border-blue-100 rounded-xl p-5 bg-blue-50/30 space-y-4 animate-fadeIn">
            {/* Header info bar */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-blue-200/60">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                <Layers className="w-4 h-4 text-blue-600" />
                ตรวจสอบพรีวิวข้อมูลวันที่ {previewData.date}
                {previewData.source === "api" ? (
                  <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    ข้อมูลจาก OptimoRoute API
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    ข้อมูลจำลอง (Mock Data)
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-600">
                พบรวม <strong className="text-blue-700">{previewData.totalGroups}</strong> สายรถ /{" "}
                <strong className="text-emerald-700">{previewData.totalStops}</strong> จุดแวะส่งสินค้า
              </div>
            </div>

            {/* Preview Groups Accordion / List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
              {previewData.routes.map((group, gIdx) => (
                <div key={gIdx} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                  {/* Group Header */}
                  <div className="bg-slate-800 text-white px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: group.groupColor }} />
                      <span>{group.groupStoreName}</span>
                    </div>
                    <div className="text-[10px] text-slate-300 font-mono">
                      {group.totalStops} จุดส่ง · คนขับ: {group.driverName} ({group.vehiclePlate})
                    </div>
                  </div>

                  {/* Stops Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-50 text-[10px] text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="px-3 py-1.5 w-10 text-center">ลำดับ</th>
                          <th className="px-3 py-1.5 w-24">Store ID / LocationNo</th>
                          <th className="px-3 py-1.5">ชื่อร้านค้า / จุดแวะ</th>
                          <th className="px-3 py-1.5">ที่อยู่</th>
                          <th className="px-3 py-1.5 w-20 text-center">จำนวน (Sum)</th>
                          <th className="px-3 py-1.5 w-32 text-center">พิกัด (lat,long)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {group.stops.map((stop) => (
                          <tr key={stop.rowOrder} className="hover:bg-slate-50">
                            <td className="px-3 py-1.5 text-center font-mono font-bold text-slate-500">
                              {stop.rowOrder}
                            </td>
                            <td className="px-3 py-1.5 font-mono text-blue-700 font-bold">
                              {stop.locationNo}
                            </td>
                            <td className="px-3 py-1.5 font-medium text-slate-900">
                              {stop.storeName}
                            </td>
                            <td className="px-3 py-1.5 text-slate-500 max-w-[200px] truncate">
                              {stop.address || "–"}
                            </td>
                            <td className="px-3 py-1.5 text-center font-bold text-slate-800">
                              {stop.quantity}
                            </td>
                            <td className="px-3 py-1.5 text-center font-mono text-[10px]">
                              {stop.lat_long ? (
                                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                                  {stop.lat_long}
                                </span>
                              ) : (
                                <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                                  ไม่มีพิกัด
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            {/* Confirm Save Button Bar */}
            <div className="pt-2 flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200">
              <div className="text-[11px] text-slate-600 font-medium">
                ขั้นตอนที่ 2: เมื่อตรวจสอบข้อมูลถูกต้องแล้ว กดปุ่มยืนยันเพื่อนำเข้าลงฐานข้อมูล
              </div>

              <button
                onClick={handleConfirmImport}
                disabled={importing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-lg text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    กำลังบันทึกลงฐานข้อมูล...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    ยืนยันบันทึกข้อมูลเข้าฐานข้อมูล (Confirm & Save)
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ═══ SUCCESS RESULTS BANNER ═══ */}
        {resultStats && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              บันทึกข้อมูลเข้าฐานข้อมูลเรียบร้อยแล้ว!
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-lg border border-emerald-100 text-center">
                <div className="text-base font-bold text-slate-800">{resultStats.importedGroups}</div>
                <div className="text-[10px] text-slate-500 font-medium">กลุ่มสายจัดส่ง (group_store)</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-emerald-100 text-center">
                <div className="text-base font-bold text-slate-800">{resultStats.importedStores}</div>
                <div className="text-[10px] text-slate-500 font-medium">ร้านค้าใหม่ (store)</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-emerald-100 text-center">
                <div className="text-base font-bold text-emerald-600">{resultStats.importedListStores}</div>
                <div className="text-[10px] text-slate-500 font-medium">รายการจุดหยุด (list_store)</div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => navigate("/optimoroute")}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                ดูเส้นทางบนแผนที่ (OptimoRoute Map)
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportOptimoPage;
