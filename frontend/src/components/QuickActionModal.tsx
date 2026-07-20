import React from 'react';
import { X, Key, Camera, ShieldCheck, Plus } from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  actionType: string | null;
  releaseNo: string;
  onClose: () => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  actionType,
  releaseNo,
  onClose
}) => {
  if (!isOpen || !actionType) return null;

  const renderContent = () => {
    switch (actionType) {
      case 'reset_key':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <Key className="w-5 h-5 text-slate-800 shrink-0" />
              <div>
                <h4 className="font-semibold text-xs text-slate-900">รีเซ็ตสถานะกุญแจรถ</h4>
                <p className="text-[11px] text-slate-500">คืนการถือครองกุญแจสำหรับใบปล่อยรถ {releaseNo}</p>
              </div>
            </div>
            <button
              onClick={() => {
                alert(`รีเซ็ตกุญแจสำหรับ ${releaseNo} เรียบร้อยแล้ว`);
                onClose();
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-xl text-xs shadow-sm"
            >
              ยืนยันการรีเซ็ตกุญแจ
            </button>
          </div>
        );

      case 'cargo_photo':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <Camera className="w-5 h-5 text-slate-800 shrink-0" />
              <div>
                <h4 className="font-semibold text-xs text-slate-900">รูปสินค้ารอบรถ</h4>
                <p className="text-[11px] text-slate-500">ใบปล่อยรถ {releaseNo}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 p-2 text-center text-xs text-slate-500">
                <img src="https://picsum.photos/300/200?random=1" alt="cargo1" className="w-full h-24 object-cover rounded mb-1" />
                รูปสินค้า #1
              </div>
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 p-2 text-center text-xs text-slate-500">
                <img src="https://picsum.photos/300/200?random=2" alt="cargo2" className="w-full h-24 object-cover rounded mb-1" />
                รูปสินค้า #2
              </div>
            </div>
          </div>
        );

      case 'accounting':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <ShieldCheck className="w-5 h-5 text-slate-800 shrink-0" />
              <div>
                <h4 className="font-semibold text-xs text-slate-900">ตรวจสอบสถานะทางบัญชี</h4>
                <p className="text-[11px] text-slate-500">ใบปล่อยรถ {releaseNo}</p>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <label className="block text-slate-700 font-medium">เปลี่ยนสถานะบัญชี</label>
              <select className="w-full border border-slate-200 rounded-xl p-2 text-slate-800 focus:outline-none focus:border-slate-400">
                <option>รอตรวจ</option>
                <option>อนุมัติแล้ว</option>
                <option>ปฏิเสธ / มีข้อโต้แย้ง</option>
              </select>
            </div>
            <button
              onClick={() => {
                alert(`อัปเดตสถานะบัญชีเรียบร้อยแล้ว`);
                onClose();
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-xl text-xs shadow-sm"
            >
              บันทึกสถานะ
            </button>
          </div>
        );

      default:
        return (
          <div className="space-y-4 text-center py-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 mx-auto flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-xs text-slate-900">ดำเนินการสำหรับใบปล่อยรถ</h4>
            <p className="text-[11px] text-slate-500">{releaseNo}</p>
            <button
              onClick={onClose}
              className="bg-slate-900 text-white px-4 py-1.5 rounded-xl text-xs"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100">
          <span className="font-semibold text-xs text-slate-800">การดำเนินการ</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">{renderContent()}</div>
      </div>
    </div>
  );
};

