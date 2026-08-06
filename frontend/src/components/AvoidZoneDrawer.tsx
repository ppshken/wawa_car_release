import React from "react";
import { AnimatedDrawer } from "./AnimatedDrawer";
import { ShieldAlert, Trash2, Power, Eye, MapPin, AlertTriangle } from "lucide-react";

export interface AvoidZone {
  zone_id: number;
  zone_name: string;
  zone_type: "unpaved" | "height_limit" | "truck_prohibited" | "custom" | string;
  coordinates: [number, number][];
  is_active: boolean;
  description?: string;
  created_at?: string;
}

interface AvoidZoneDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  zones: AvoidZone[];
  onToggleActive: (zone: AvoidZone) => void;
  onDeleteZone: (zoneId: number) => void;
  onFocusZone?: (zone: AvoidZone) => void;
}

export const AvoidZoneDrawer: React.FC<AvoidZoneDrawerProps> = ({
  isOpen,
  onClose,
  zones,
  onToggleActive,
  onDeleteZone,
  onFocusZone,
}) => {
  const getZoneTypeBadge = (type: string) => {
    switch (type) {
      case "unpaved":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            🚜 ทางดินเลน / ลูกรัง
          </span>
        );
      case "height_limit":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            🌉 สะพานจำกัดความสูง
          </span>
        );
      case "truck_prohibited":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            🚚 ห้ามรถบรรทุกผ่าน
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            ⚠️ พื้นที่เสี่ยงภัย
          </span>
        );
    }
  };

  return (
    <AnimatedDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-rose-700 font-bold">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          <span>จัดการพื้นที่ห้ามผ่าน (Avoid Zones)</span>
        </div>
      }
      maxWidthClass="max-w-md sm:max-w-lg"
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-500 bg-rose-50 border border-rose-100 p-2.5 rounded-xl font-medium">
          กำหนดพื้นที่บล็อกเส้นทาง เช่น ถนนลูกรัง สะพานจำกัดความสูง หรือเขตห้ามรถบรรทุกเข้า
        </p>
        {zones.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <ShieldAlert className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <div className="font-bold text-slate-600 text-sm">ยังไม่มีพื้นที่ห้ามผ่าน</div>
            <p className="text-xs text-slate-400 mt-1">
              กดปุ่ม <span className="font-bold text-rose-600">"วาดพื้นที่ห้ามผ่าน"</span> บนแถบเครื่องมือแผนที่เพื่อสร้างโซนใหม่
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {zones.map((zone) => (
              <div
                key={zone.zone_id}
                className={`p-3.5 rounded-xl border transition-all ${
                  zone.is_active
                    ? "bg-white border-rose-200 shadow-2xs"
                    : "bg-slate-50 border-slate-200 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {zone.zone_name}
                      </span>
                      {getZoneTypeBadge(zone.zone_type)}
                    </div>
                    {zone.description && (
                      <p className="text-xs text-slate-500 mt-1">
                        {zone.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onToggleActive(zone)}
                      title={zone.is_active ? "ปิดการใช้งาน" : "เปิดการใช้งาน"}
                      className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors ${
                        zone.is_active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{zone.is_active ? "เปิดอยู่" : "ปิดอยู่"}</span>
                    </button>

                    {onFocusZone && (
                      <button
                        onClick={() => onFocusZone(zone)}
                        title="ดูตำแหน่งบนแผนที่"
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteZone(zone.zone_id)}
                      title="ลบพื้นที่ห้ามผ่าน"
                      className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2 mt-2 font-mono">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    พิกัด {zone.coordinates?.length || 0} จุดบนแผนที่
                  </span>
                  {zone.created_at && (
                    <span>
                      สร้างเมื่อ: {String(zone.created_at).slice(0, 10)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AnimatedDrawer>
  );
};
