import React, { useEffect, useState, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { AnimatedDrawer } from "../components/AnimatedDrawer";
import {
  Map as MapIcon,
  RefreshCw,
  Calendar,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Navigation,
  Store,
  Search,
  Package,
  Route,
  Timer,
  Hash,
  LocateFixed,
  Plus,
  X,
  FolderPlus,
  Loader2,
  Layers,
} from "lucide-react";

// ─── Types ───
interface StopData {
  stopId: number;
  rowOrder?: number;
  row_order?: number;
  orderNo: string;
  storeName: string;
  address: string;
  lat: number;
  lng: number;
  arrivalTime: string;
  departureTime?: string;
  status: string;
  type: string;
}

interface RouteData {
  routeId: string;
  groupStoreId?: number | string;
  driverName: string;
  vehiclePlate: string;
  color: string;
  totalStops: number;
  stops: StopData[];
}

// ─── Route Colors (similar to OptimoRoute) ───
const ROUTE_COLORS = [
  "#e53e3e", // red
  "#38a169", // green
  "#d69e2e", // yellow
  "#3182ce", // blue
  "#805ad5", // purple
  "#dd6b20", // orange
  "#e53e9f", // pink
  "#319795", // teal
  "#2b6cb0", // dark blue
  "#c05621", // dark orange
];

// ─── Marker with teardrop shape like OptimoRoute ───
function createStopMarker(number: number, color: string, isDepot: boolean) {
  const size = isDepot ? 30 : 26;
  const svg = isDepot
    ? `<svg width="${size}" height="${size + 8}" viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 37 C15 37 28 22 28 14 C28 6.82 22.18 1 15 1 C7.82 1 2 6.82 2 14 C2 22 15 37 15 37Z" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="15" cy="14" r="8" fill="white"/>
        <text x="15" y="18" text-anchor="middle" font-size="11" font-weight="900" fill="${color}" font-family="system-ui">★</text>
      </svg>`
    : `<svg width="${size}" height="${size + 6}" viewBox="0 0 26 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 31 C13 31 24 19 24 12 C24 5.92 19.08 1 13 1 C6.92 1 2 5.92 2 12 C2 19 13 31 13 31Z" fill="${color}" stroke="white" stroke-width="1.5"/>
        <circle cx="13" cy="12" r="7" fill="white"/>
        <text x="13" y="16" text-anchor="middle" font-size="${number >= 100 ? 8 : (number >= 10 ? 9 : 11)}" font-weight="800" fill="${color}" font-family="system-ui">${number}</text>
      </svg>`;

  return L.divIcon({
    className: "custom-pin-marker",
    html: svg,
    iconSize: [size, size + (isDepot ? 8 : 6)],
    iconAnchor: [size / 2, size + (isDepot ? 8 : 6)],
    popupAnchor: [0, -(size + (isDepot ? 8 : 6)) + 4],
  });
}

// ─── Map Auto-fit ───
function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [bounds, map]);
  return null;
}

// ─── Map PanTo (No Zoom change) ───
function FlyToTarget({ target }: { target: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target && target.lat && target.lng) {
      map.panTo([target.lat, target.lng], { animate: true, duration: 0.8 });
    }
  }, [target, map]);
  return null;
}

// ─── Status helpers ───
function getStatusLabel(status: string) {
  if (status === "completed") return "เสร็จสิ้น";
  if (status === "in_progress") return "กำลังส่ง";
  return "รอ";
}

function getStatusColor(status: string) {
  if (status === "completed") return { bg: "#dcfce7", text: "#166534", dot: "#22c55e" };
  if (status === "in_progress") return { bg: "#fef9c3", text: "#854d0e", dot: "#eab308" };
  return { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" };
}

interface VehicleOption {
  car_id: string | number;
  car_code?: string;
  license_plate: string;
  brand?: string;
  model?: string;
}

interface StoreOption {
  store_id: string;
  store_name: string;
  store_address?: string;
  store_location?: string;
  telephone_number?: string;
}

export const OptimoRoutePage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [visibleRoutes, setVisibleRoutes] = useState<Set<string>>(new Set());
  const [source, setSource] = useState<string>("mock");
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [bottomPanelOpen, setBottomPanelOpen] = useState(true);
  const [bottomTab, setBottomTab] = useState<"all" | "completed" | "pending">("all");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Stores list for master store selection
  const [storesList, setStoresList] = useState<StoreOption[]>([]);
  const [selectedMasterStoreId, setSelectedMasterStoreId] = useState<string>("");

  // Vehicles list for select dropdown
  const [vehiclesList, setVehiclesList] = useState<VehicleOption[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<string>("");

  // Create Group Modal State
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupColor, setNewGroupColor] = useState("#3b82f6");
  const [newGroupDate, setNewGroupDate] = useState(selectedDate);
  const [creatingGroup, setCreatingGroup] = useState(false);

  useEffect(() => {
    if (isCreateGroupModalOpen) {
      setNewGroupDate(selectedDate);
    }
  }, [isCreateGroupModalOpen, selectedDate]);

  const fetchVehiclesList = useCallback(async () => {
    try {
      const res = await api.get("/master/vehicles");
      if (res.data.success) {
        setVehiclesList(res.data.vehicles || []);
      }
    } catch (err) {
      console.warn("Fetch vehicles for group modal warning:", err);
    }
  }, []);

  const fetchStoresList = useCallback(async () => {
    try {
      const res = await api.get("/master/stores");
      if (res.data.success) {
        setStoresList(res.data.stores || []);
      }
    } catch (err) {
      console.warn("Fetch stores for stop drawer warning:", err);
    }
  }, []);

  useEffect(() => {
    fetchVehiclesList();
    fetchStoresList();
  }, [fetchVehiclesList, fetchStoresList]);

  const handleSelectMasterStore = (storeId: string) => {
    setSelectedMasterStoreId(storeId);
    if (!storeId) return;

    const found = storesList.find((s) => String(s.store_id) === String(storeId));
    if (found) {
      setFormStopStoreId(found.store_id);
      setFormStopStoreName(found.store_name);
      setFormStopAddress(found.store_address || "");
      setFormStopLatLong(found.store_location || "");
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      showError("กรุณากรอกชื่อกลุ่มสายจัดส่ง");
      return;
    }

    setCreatingGroup(true);
    try {
      const res = await api.post("/master/groups", {
        group_store_name: newGroupName.trim(),
        group_color: newGroupColor,
        car_id: selectedCarId || null,
        car: selectedCarId || null,
        date: newGroupDate || selectedDate,
      });
      if (res.data.success) {
        showSuccess(res.data.message || "สร้างกลุ่มสายจัดส่งสำเร็จ!");
        setIsCreateGroupModalOpen(false);
        setNewGroupName("");
        setSelectedCarId("");
        fetchRoutes(selectedDate);
      } else {
        showError(res.data.message || "สร้างกลุ่มสายจัดส่งไม่สำเร็จ");
      }
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการสร้างกลุ่มสายจัดส่ง");
    } finally {
      setCreatingGroup(false);
    }
  };

  // Create Stop (Delivery Item) Drawer State
  const [isCreateStopDrawerOpen, setIsCreateStopDrawerOpen] = useState(false);
  const [formStopGroupId, setFormStopGroupId] = useState<string | number>("");
  const [formStopStoreId, setFormStopStoreId] = useState("");
  const [formStopStoreName, setFormStopStoreName] = useState("");
  const [formStopAddress, setFormStopAddress] = useState("");
  const [formStopRowOrder, setFormStopRowOrder] = useState<number>(1);
  const [formStopQuantity, setFormStopQuantity] = useState<number>(1);
  const [formStopLatLong, setFormStopLatLong] = useState("");
  const [creatingStop, setCreatingStop] = useState(false);

  const handleCreateStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStopGroupId) {
      showError("กรุณาเลือกสายจัดส่ง");
      return;
    }
    if (!formStopStoreName.trim()) {
      showError("กรุณากรอกชื่อลูกค้า/ร้านค้า");
      return;
    }

    setCreatingStop(true);
    try {
      const res = await api.post("/optimoroute/stops", {
        group_store_id: formStopGroupId,
        store_id: formStopStoreId || undefined,
        store_name: formStopStoreName.trim(),
        address: formStopAddress.trim(),
        row_order: formStopRowOrder,
        sum_quantity: formStopQuantity,
        lat_long: formStopLatLong.trim(),
        date: selectedDate,
      });

      if (res.data.success) {
        showSuccess(res.data.message || "เพิ่มรายการจุดจัดส่งสำเร็จ!");
        setIsCreateStopDrawerOpen(false);
        setSelectedMasterStoreId("");
        setFormStopStoreId("");
        setFormStopStoreName("");
        setFormStopAddress("");
        setFormStopLatLong("");
        fetchRoutes(selectedDate);
      } else {
        showError(res.data.message || "เพิ่มรายการจัดส่งไม่สำเร็จ");
      }
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการเพิ่มรายการจัดส่ง");
    } finally {
      setCreatingStop(false);
    }
  };

  // Active selected stop for Map FlyTo & Detail Card
  const [activeStop, setActiveStop] = useState<{
    routeId: string;
    stopId: number | string;
    storeName: string;
    orderNo: string;
    address: string;
    quantity: number;
    lat: number;
    lng: number;
    status: string;
    rowOrder: number;
    routeColor: string;
    driverName: string;
    vehiclePlate: string;
    arrivalTime?: string;
  } | null>(null);

  const handleSelectStopRow = (stop: any) => {
    const latNum = parseFloat(stop.lat);
    const lngNum = parseFloat(stop.lng);
    if (!latNum || !lngNum || isNaN(latNum) || isNaN(lngNum)) {
      showError("ไม่พบพิกัด GPS สำหรับสถานที่นี้");
      return;
    }

    if (stop.routeId) {
      setSelectedRouteId(stop.routeId);
      setVisibleRoutes((prev) => {
        const next = new Set(prev);
        next.add(stop.routeId);
        return next;
      });
    }

    setActiveStop({
      routeId: stop.routeId,
      stopId: stop.stopId,
      storeName: stop.storeName,
      orderNo: stop.orderNo || stop.locationNo || `#${stop.stopId}`,
      address: stop.address || "ไม่ระบุที่อยู่",
      quantity: stop.quantity || 0,
      lat: latNum,
      lng: lngNum,
      status: stop.status || "planned",
      rowOrder: stop.rowOrder ?? stop.row_order ?? stop.stopId,
      routeColor: stop.routeColor || stop.color || "#3b82f6",
      driverName: stop.routeDriverName || stop.driverName || "-",
      vehiclePlate: stop.routeVehicle || stop.vehiclePlate || "-",
      arrivalTime: stop.arrivalTime || "",
    });
  };

  const fetchRoutes = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const res = await api.get("/optimoroute/routes", { params: { date } });
      if (res.data.success) {
        const fetchedRoutes: RouteData[] = (res.data.routes || []).map((r: RouteData, idx: number) => ({
          ...r,
          color: ROUTE_COLORS[idx % ROUTE_COLORS.length],
        }));
        setRoutes(fetchedRoutes);
        setSource(res.data.source || "mock");
        setVisibleRoutes(new Set<string>(fetchedRoutes.map((r) => r.routeId)));
        if (fetchedRoutes.length > 0) setSelectedRouteId(fetchedRoutes[0].routeId);
      }
    } catch (err: any) {
      showError(err?.response?.data?.message || "ไม่สามารถดึงข้อมูลเส้นทางได้");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchRoutes(selectedDate);
  }, [selectedDate, fetchRoutes]);

  // Stats
  const totalStops = routes.reduce((sum, r) => sum + r.stops.filter((s) => s.type !== "depot").length, 0);
  const completedStops = routes.reduce((sum, r) => sum + r.stops.filter((s) => s.status === "completed" && s.type !== "depot").length, 0);
  const pendingStops = totalStops - completedStops;

  // Map bounds
  const mapBounds = useMemo(() => {
    const coords: [number, number][] = [];
    routes.forEach((r) => {
      if (!visibleRoutes.has(r.routeId)) return;
      r.stops.forEach((s) => {
        if (s.lat && s.lng) coords.push([s.lat, s.lng]);
      });
    });
    return coords.length > 0 ? L.latLngBounds(coords) : null;
  }, [routes, visibleRoutes]);

  // Bottom table stops
  const tableStops = useMemo(() => {
    const stops: (StopData & { routeColor: string; routeDriverName: string; routeId: string; routeVehicle: string })[] = [];
    const routesToShow = selectedRouteId ? routes.filter((r) => r.routeId === selectedRouteId) : routes;
    routesToShow.forEach((r) => {
      r.stops.forEach((s) => {
        if (s.type === "depot") return;
        stops.push({ ...s, routeColor: r.color, routeDriverName: r.driverName, routeId: r.routeId, routeVehicle: r.vehiclePlate });
      });
    });

    let filtered = stops;
    if (bottomTab === "completed") filtered = stops.filter((s) => s.status === "completed");
    if (bottomTab === "pending") filtered = stops.filter((s) => s.status !== "completed");
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.storeName.toLowerCase().includes(q) ||
          s.orderNo.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.routeDriverName.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [routes, selectedRouteId, bottomTab, searchText]);

  const toggleRouteVisibility = (routeId: string) => {
    setVisibleRoutes((prev) => {
      const next = new Set(prev);
      next.has(routeId) ? next.delete(routeId) : next.add(routeId);
      return next;
    });
  };

  return (
    <div className="flex flex-col w-full font-sans text-xs" style={{ height: "calc(100vh - 52px)" }}>
      {/* ═══ TOP BAR ═══ */}
      <div className="bg-white border-b border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
        {/* Left — Stats + Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="sm:hidden bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2 py-1 rounded text-[11px] flex items-center gap-1 shrink-0"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>{isMobileSidebarOpen ? "ซ่อนสายรถ" : "สายรถ"}</span>
          </button>

          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className="text-center">
              <div className="text-base sm:text-lg font-extrabold text-slate-900 leading-none">{totalStops}</div>
              <div className="text-[9px] text-slate-500 font-medium mt-0.5">คำสั่งซื้อ</div>
            </div>
            <div className="w-px h-6 sm:h-8 bg-slate-200" />
            <div className="text-center">
              <div className="text-base sm:text-lg font-extrabold text-emerald-600 leading-none">{completedStops}</div>
              <div className="text-[9px] text-slate-500 font-medium mt-0.5">จัดส่งแล้ว</div>
            </div>
            <div className="w-px h-6 sm:h-8 bg-slate-200" />
            <div className="text-center">
              <div className="text-base sm:text-lg font-extrabold text-amber-600 leading-none">{pendingStops}</div>
              <div className="text-[9px] text-slate-500 font-medium mt-0.5">ยังไม่จัดส่ง</div>
            </div>
            <div className="w-px h-6 sm:h-8 bg-slate-200" />
            <div className="text-center">
              <div className="text-base sm:text-lg font-extrabold text-blue-600 leading-none">{routes.length}</div>
              <div className="text-[9px] text-slate-500 font-medium mt-0.5">เส้นทาง</div>
            </div>
          </div>
        </div>

        {/* Right — Date + Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {source === "mock" && (
            <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-amber-200">
              MOCK
            </span>
          )}
          {source === "api" && (
            <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-blue-200">
              API
            </span>
          )}
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white border border-slate-300 rounded-md pl-7 pr-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-400"
            />
          </div>
          <button
            onClick={() => fetchRoutes(selectedDate)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">โหลดข้อมูล</span>
          </button>
          <button
            onClick={() => {
              setNewGroupName(`Optimo Routes-${String(routes.length + 1).padStart(3, "0")}`);
              setIsCreateGroupModalOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>สร้างกลุ่มสายจัดส่ง</span>
          </button>
        </div>
      </div>

      {/* ═══ MAIN AREA: Sidebar + Map ═══ */}
      <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
        {/* ─── LEFT SIDEBAR (Route List) ─── */}
        <div
          className={`bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-hidden transition-all duration-200 ${
            isMobileSidebarOpen
              ? "w-full sm:w-56 h-48 sm:h-auto border-b sm:border-b-0"
              : "hidden sm:flex sm:w-56"
          }`}
        >
          {/* Search */}
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1.5" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="ค้นหาร้านค้า..."
                className="w-full bg-slate-50 border border-slate-200 rounded-md pl-7 pr-2 py-1 text-[11px] focus:outline-none focus:border-blue-300"
              />
            </div>
          </div>

          {/* Route List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {routes.map((route) => {
              const isSelected = selectedRouteId === route.routeId;
              const isVisible = visibleRoutes.has(route.routeId);
              const completedCount = route.stops.filter((s) => s.status === "completed").length;
              const deliveryStops = route.stops.filter((s) => s.type !== "depot").length;
              const estimatedTime = `${Math.floor(deliveryStops * 25 / 60)}ชม. ${(deliveryStops * 25) % 60}น.`;
              const estimatedDist = `${(deliveryStops * 12.5).toFixed(0)}km`;

              return (
                <div
                  key={route.routeId}
                  className={`border-b border-slate-100 cursor-pointer transition-colors ${isSelected ? "bg-blue-50/70" : "hover:bg-slate-50"}`}
                >
                  {/* Route Header Row */}
                  <div
                    className="flex items-start gap-2 px-2.5 py-2"
                    onClick={() => setSelectedRouteId(isSelected ? null : route.routeId)}
                  >
                    {/* Checkbox + Color */}
                    <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleRouteVisibility(route.routeId);
                        }}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-0 accent-blue-600"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: route.color }} />
                    </div>

                    {/* Route Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-[11px]">
                          {route.driverName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-[9px] text-slate-500">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{estimatedTime}</span>
                        <span className="mx-0.5">·</span>
                        <MapPin className="w-2.5 h-2.5" />
                        <span>จุดส่ง: {deliveryStops}</span>
                        <span className="mx-0.5">·</span>
                        <span>{estimatedDist}</span>
                      </div>
                      {/* Mini progress */}
                      <div className="mt-1 flex items-center gap-1.5">
                        <div className="flex-1 bg-slate-200 rounded-full h-1">
                          <div
                            className="h-1 rounded-full transition-all"
                            style={{
                              width: `${deliveryStops > 0 ? (completedCount / route.stops.length) * 100 : 0}%`,
                              background: route.color,
                            }}
                          />
                        </div>
                        <span className="text-[8px] text-slate-400 font-mono">
                          {completedCount}/{route.stops.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded stops */}
                  {isSelected && (
                    <div className="bg-slate-50/50 border-t border-slate-100">
                      {route.stops.map((stop) => {
                        const sc = getStatusColor(stop.status);
                        return (
                          <div
                            key={stop.stopId}
                            onClick={() => handleSelectStopRow({ ...stop, routeId: route.routeId, routeColor: route.color, routeDriverName: route.driverName, routeVehicle: route.vehiclePlate })}
                            className="flex items-center gap-1.5 px-3 py-1 border-b border-slate-50 last:border-0 hover:bg-blue-100/50 cursor-pointer transition-colors"
                          >
                            <div
                              className="w-4 h-4 rounded-full text-white text-[8px] font-bold flex items-center justify-center shrink-0"
                              style={{ background: stop.type === "depot" ? route.color : sc.dot }}
                            >
                              {stop.type === "depot" ? "★" : stop.stopId}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] font-medium text-slate-700 truncate">{stop.storeName}</div>
                            </div>
                            <span className="text-[9px] text-slate-400">{stop.arrivalTime}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {routes.length === 0 && !loading && (
              <div className="p-6 text-center text-slate-400">
                <Route className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                <div className="text-[10px]">ไม่พบเส้นทาง</div>
              </div>
            )}
          </div>
        </div>

        {/* ─── MAP + BOTTOM PANEL ─── */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* MAP */}
          <div className="flex-1 relative">
            <MapContainer
              center={[13.7563, 100.5018]}
              zoom={10}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitBounds bounds={mapBounds} />
              <FlyToTarget target={activeStop ? { lat: activeStop.lat, lng: activeStop.lng } : null} />

              {routes.map((route) => {
                if (!visibleRoutes.has(route.routeId)) return null;
                const coords: [number, number][] = route.stops
                  .filter((s) => s.lat && s.lng)
                  .map((s) => [s.lat, s.lng]);

                return (
                  <React.Fragment key={route.routeId}>
                    <Polyline
                      positions={coords}
                      pathOptions={{
                        color: route.color,
                        weight: 3.5,
                        opacity: 0.8,
                      }}
                    />
                    {route.stops.map((stop, sIdx) => {
                      if (!stop.lat || !stop.lng) return null;
                      const pinNumber = stop.rowOrder ?? stop.row_order ?? stop.stopId;
                      return (
                        <Marker
                          key={`${route.routeId}-${stop.stopId}-${sIdx}`}
                          position={[stop.lat, stop.lng]}
                          icon={createStopMarker(pinNumber, route.color, stop.type === "depot")}
                          eventHandlers={{
                            click: () => handleSelectStopRow({ ...stop, routeId: route.routeId, routeColor: route.color, routeDriverName: route.driverName, routeVehicle: route.vehiclePlate }),
                          }}
                        >
                          <Popup maxWidth={300}>
                            <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 12, lineHeight: 1.5 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                <div style={{ width: 12, height: 12, borderRadius: "50%", background: route.color, flexShrink: 0 }} />
                                <strong style={{ fontSize: 13 }}>{stop.storeName}</strong>
                              </div>
                              <div style={{ color: "#64748b", marginBottom: 4 }}>{stop.address}</div>
                              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 4 }}>
                                <span>🕐 {stop.arrivalTime}{stop.departureTime ? ` – ${stop.departureTime}` : ""}</span>
                                <span style={{
                                  fontSize: 10, fontWeight: 700,
                                  padding: "2px 8px", borderRadius: 20,
                                  background: getStatusColor(stop.status).bg,
                                  color: getStatusColor(stop.status).text,
                                }}>
                                  {getStatusLabel(stop.status)}
                                </span>
                              </div>
                              <div style={{ color: "#94a3b8", fontSize: 10 }}>
                                เลขที่: {stop.orderNo} · คนขับ: {route.driverName} · ทะเบียน: {route.vehiclePlate}
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </React.Fragment>
                );
              })}

              {/* Standalone Active Leaflet Popup on Pin Marker */}
              {activeStop && (
                <Popup
                  position={[activeStop.lat, activeStop.lng]}
                  eventHandlers={{
                    remove: () => setActiveStop(null),
                  }}
                  maxWidth={300}
                >
                  <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 12, lineHeight: 1.5, minWidth: 210 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: activeStop.routeColor,
                          color: "#ffffff",
                          fontSize: 10,
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {activeStop.rowOrder}
                      </div>
                      <div>
                        <strong style={{ fontSize: 13, color: "#0f172a" }}>{activeStop.storeName}</strong>
                        <div style={{ fontSize: 10, color: "#64748b" }}>เลขที่: {activeStop.orderNo}</div>
                      </div>
                    </div>

                    <div style={{ color: "#475569", marginBottom: 6, fontSize: 11 }}>
                      📍 {activeStop.address}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, color: "#1e40af" }}>📦 {activeStop.quantity} กล่อง/ชิ้น</span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 20,
                          background: getStatusColor(activeStop.status).bg,
                          color: getStatusColor(activeStop.status).text,
                        }}
                      >
                        {getStatusLabel(activeStop.status)}
                      </span>
                    </div>

                    <div style={{ color: "#64748b", fontSize: 10, borderTop: "1px solid #f1f5f9", paddingTop: 6, marginBottom: 8 }}>
                      คนขับ: {activeStop.driverName} · ทะเบียน: <strong style={{ color: "#1e3a8a" }}>{activeStop.vehiclePlate}</strong>
                    </div>

                    <div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${activeStop.lat},${activeStop.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 4,
                          background: "#2563eb",
                          color: "#ffffff",
                          padding: "5px 10px",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          textDecoration: "none",
                        }}
                      >
                        🧭 นำทางด้วย Google Maps
                      </a>
                    </div>
                  </div>
                </Popup>
              )}
            </MapContainer>
          </div>

          {/* ─── BOTTOM TABLE PANEL ─── */}
          {bottomPanelOpen && (
            <div className="h-64 bg-white border-t border-slate-200 flex flex-col shrink-0 overflow-hidden">
              {/* Tabs + Filter */}
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 bg-slate-50/50 gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      if (routes.length > 0) {
                        setFormStopGroupId(routes[0].groupStoreId || routes[0].routeId.replace("ROUTE-", ""));
                      }
                      setFormStopRowOrder(tableStops.length + 1);
                      setIsCreateStopDrawerOpen(true);
                    }}
                    className="bg-yellow-700 hover:bg-yellow-800 text-white font-semibold text-xs px-2.5 py-1.5 rounded-md flex items-center gap-1 shadow-2xs transition-colors shrink-0 mr-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>รายการจัดส่ง</span>
                  </button>
                  <button
                    onClick={() => setBottomTab("all")}
                    className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      bottomTab === "all"
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    ทั้งหมด ({totalStops})
                  </button>
                  <button
                    onClick={() => setBottomTab("completed")}
                    className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      bottomTab === "completed"
                        ? "bg-emerald-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    จัดส่งแล้ว ({completedStops})
                  </button>
                  <button
                    onClick={() => setBottomTab("pending")}
                    className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      bottomTab === "pending"
                        ? "bg-amber-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    ยังไม่จัดส่ง ({pendingStops})
                  </button>
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                  <LocateFixed className="w-3 h-3" />
                  แสดง {tableStops.length} รายการ
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-[11px] min-w-[650px]">
                  <thead className="bg-slate-50 sticky top-0 z-10">
                    <tr className="text-left text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      <th className="px-2 py-1.5 w-6"></th>
                      <th className="px-2 py-1.5 w-8">#</th>
                      <th className="px-2 py-1.5">เลขที่คำสั่ง</th>
                      <th className="px-2 py-1.5">ชื่อลูกค้า/ร้านค้า</th>
                      <th className="px-2 py-1.5">ที่อยู่จัดส่ง</th>
                      <th className="px-2 py-1.5 w-20">สถานะ</th>
                      <th className="px-2 py-1.5">สาย</th>
                      <th className="px-2 py-1.5 w-16">ทะเบียน</th>
                      <th className="px-2 py-1.5 w-16 text-center">row_order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableStops.map((stop, idx) => {
                      const sc = getStatusColor(stop.status);
                      return (
                        <tr
                          key={`${stop.routeId}-${stop.stopId}-${idx}`}
                          onClick={() => handleSelectStopRow(stop)}
                          className={`border-b border-slate-100 cursor-pointer transition-colors ${
                            activeStop?.routeId === stop.routeId && String(activeStop?.stopId) === String(stop.stopId)
                              ? "bg-blue-100/80 font-semibold"
                              : "hover:bg-blue-50/60"
                          }`}
                        >
                          <td className="px-2 py-1.5">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: stop.routeColor }} />
                          </td>
                          <td className="px-2 py-1.5 text-slate-400 font-mono text-[10px]">{idx + 1}</td>
                          <td className="px-2 py-1.5 font-semibold text-slate-800">{stop.orderNo}</td>
                          <td className="px-2 py-1.5 font-medium text-slate-700 max-w-[200px] truncate">{stop.storeName}</td>
                          <td className="px-2 py-1.5 text-slate-500 max-w-[250px] truncate">{stop.address}</td>
                          <td className="px-2 py-1.5">
                            <span
                              className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{ background: sc.bg, color: sc.text }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />
                              {getStatusLabel(stop.status)}
                            </span>
                          </td>
                          <td className="px-2 py-1.5 text-slate-700">{stop.routeDriverName}</td>
                          <td className="px-2 py-1.5 text-slate-500 font-mono text-[10px]">{stop.routeVehicle}</td>
                          <td className="px-2 py-1.5 text-center font-bold font-mono text-slate-800">
                            {stop.rowOrder ?? stop.row_order ?? stop.stopId}
                          </td>
                        </tr>
                      );
                    })}
                    {tableStops.length === 0 && (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-slate-400">
                          <Package className="w-5 h-5 mx-auto mb-1 text-slate-300" />
                          ไม่พบรายการ
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* ─── CREATE GROUP STORE DRAWER ─── */}
      <AnimatedDrawer
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        title="สร้างกลุ่มสายจัดส่งใหม่"
        formId="create-group-store-form"
        onSubmit={handleCreateGroup}
        submitLabel={creatingGroup ? "กำลังบันทึก..." : "บันทึกสร้างกลุ่มสายรถ"}
        isDirty={!!(newGroupName || selectedCarId)}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              ชื่อกลุ่มสายจัดส่ง (group_store_name) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="เช่น Optimo Routes-005 หรือ สายจัดส่งโซนกทม."
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              วันที่จัดส่ง (date) <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={newGroupDate}
              onChange={(e) => setNewGroupDate(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
              <span>เลือกรถที่ใช้จัดส่ง (car_id)</span>
              <span className="text-[10px] text-slate-400 font-normal">ดึงจากข้อมูลมาสเตอร์รถ</span>
            </label>
            <select
              value={selectedCarId}
              onChange={(e) => setSelectedCarId(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-semibold"
            >
              <option value="">-- ไม่ระบุรถขนส่ง (เลือกทีหลังได้) --</option>
              {vehiclesList.map((v) => (
                <option key={v.car_id} value={String(v.car_id)}>
                  🚗 {v.license_plate} {v.brand ? `(${v.brand}${v.model ? ` ${v.model}` : ""})` : ""} - ID: {v.car_code || String(v.car_id).slice(0, 8)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-2">
              เลือกสีสายจัดส่ง (group_color)
            </label>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewGroupColor(c)}
                  className={`w-7 h-7 rounded-full transition-all border-2 ${
                    newGroupColor === c ? "border-slate-900 scale-110 shadow-sm" : "border-white hover:scale-105"
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">รหัสสี Hex:</span>
              <input
                type="text"
                value={newGroupColor}
                onChange={(e) => setNewGroupColor(e.target.value)}
                className="w-28 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </AnimatedDrawer>

      {/* ─── CREATE STOP (DELIVERY ITEM) DRAWER ─── */}
      <AnimatedDrawer
        isOpen={isCreateStopDrawerOpen}
        onClose={() => setIsCreateStopDrawerOpen(false)}
        title="เพิ่มรายการจุดจัดส่งสินค้าใหม่ (list_store)"
        formId="create-stop-form"
        onSubmit={handleCreateStop}
        submitLabel={creatingStop ? "กำลังบันทึก..." : "บันทึกสร้างรายการจัดส่ง"}
        isDirty={!!(formStopStoreName || formStopAddress || formStopLatLong)}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              เลือกสายจัดส่ง (group_store) <span className="text-rose-500">*</span>
            </label>
            <select
              value={formStopGroupId}
              onChange={(e) => setFormStopGroupId(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-semibold"
              required
            >
              <option value="">-- เลือกสายจัดส่ง --</option>
              {routes.map((r) => (
                <option key={r.routeId} value={r.groupStoreId || r.routeId.replace("ROUTE-", "")}>
                  📍 {r.driverName} ({r.vehiclePlate}) - {r.totalStops} จุด
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                ลำดับจัดส่ง (row_order)
              </label>
              <input
                type="number"
                min={1}
                value={formStopRowOrder}
                onChange={(e) => setFormStopRowOrder(parseInt(e.target.value, 10) || 1)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                จำนวนสินค้า (กล่อง/ชิ้น)
              </label>
              <input
                type="number"
                min={1}
                value={formStopQuantity}
                onChange={(e) => setFormStopQuantity(parseInt(e.target.value, 10) || 1)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-semibold"
              />
            </div>
          </div>

          <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 space-y-1.5">
            <label className="block text-blue-900 font-semibold flex items-center justify-between">
              <span>🏪 เลือกร้านค้าจากมาสเตอร์ (store)</span>
              <span className="text-[10px] text-blue-600 font-normal">ดึงข้อมูลอัตโนมัติ</span>
            </label>
            <select
              value={selectedMasterStoreId}
              onChange={(e) => handleSelectMasterStore(e.target.value)}
              className="w-full border border-blue-300 rounded-lg p-2 text-slate-900 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">-- เลือกเพื่อเติมรหัส ร้านค้า ที่อยู่ และพิกัดอัตโนมัติ --</option>
              {storesList.map((s) => (
                <option key={s.store_id} value={String(s.store_id)}>
                  [{s.store_id}] {s.store_name} {s.store_address ? `(${s.store_address.slice(0, 30)}...)` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              รหัสลูกค้า / ร้านค้า (store_id)
            </label>
            <input
              type="text"
              value={formStopStoreId}
              onChange={(e) => setFormStopStoreId(e.target.value)}
              placeholder="เช่น ST-0001 (เว้นว่างไว้ถ้าระบบสร้างให้อัตโนมัติ)"
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              ชื่อลูกค้า / ชื่อร้านค้า <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formStopStoreName}
              onChange={(e) => setFormStopStoreName(e.target.value)}
              placeholder="เช่น บริษัท สยามพัฒนา จำกัด สาขา 1"
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              ที่อยู่จัดส่ง
            </label>
            <textarea
              rows={2}
              value={formStopAddress}
              onChange={(e) => setFormStopAddress(e.target.value)}
              placeholder="เช่น 99/9 ถ.พระราม 2 แขวงบางมด เขตจอมทอง กทม."
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              พิกัด GPS (ละติจูด, ลองจิจูด)
            </label>
            <input
              type="text"
              value={formStopLatLong}
              onChange={(e) => setFormStopLatLong(e.target.value)}
              placeholder="เช่น 13.7563, 100.5018"
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-mono"
            />
          </div>
        </div>
      </AnimatedDrawer>
    </div>
  );
};

export default OptimoRoutePage;
