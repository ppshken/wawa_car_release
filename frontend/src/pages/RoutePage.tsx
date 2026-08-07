import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Polygon,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import api, { fetchGpsDeviceLogs } from "../services/api";
import { useToast } from "../context/ToastContext";
import { AnimatedDrawer } from "../components/AnimatedDrawer";
import { SearchableSelect } from "../components/SearchableSelect";
import { ConfirmModal } from "../components/ConfirmModal";
import { CustomDatePicker } from "../components/CustomDatePicker";
import {
  ColumnToggleDropdown,
  ColumnItem,
} from "../components/ColumnToggleDropdown";
import { ExportDrawer } from "../components/ExportDrawer";
import { AvoidZoneDrawer, AvoidZone } from "../components/AvoidZoneDrawer";
import * as XLSX from "xlsx";
import {
  Map as MapIcon,
  RefreshCw,
  Download,
  Calendar,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  AlertTriangle,
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
  Maximize2,
  Minimize2,
  Table,
  Edit2,
  Trash2,
  Upload,
  Cpu,
  FileSpreadsheet,
  Play,
  Check,
  CheckSquare,
  Sparkles,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Calculator,
  ListPlus,
  ShieldAlert,
  Pentagon,
  Undo2,
} from "lucide-react";

interface DeliverySettings {
  serviceTimePerStop: number;
  priorityStrategy:
    | "fastest_time"
    | "distance_first"
    | "max_load_first"
    | "order_fifo";
  depotStartTime: string;
  bufferTimePerRoute: number;
}

const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  serviceTimePerStop: 10,
  priorityStrategy: "fastest_time",
  depotStartTime: "08:00",
  bufferTimePerRoute: 15,
};

function MapDrawingEvents({
  isDrawing,
  onAddPoint,
}: {
  isDrawing: boolean;
  onAddPoint: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (isDrawing) {
        onAddPoint(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

const isTaxActive = (val: any): boolean => {
  if (val === 1 || val === "1" || val === true || val === "true") return true;
  if (typeof val === "string") {
    const s = val.trim().toLowerCase();
    return s === "y" || s === "yes" || s === "มี" || s === "✓" || s === "x";
  }
  return false;
};

const formatDateString = (d: any, fallbackDate: string = ""): string => {
  if (!d) return fallbackDate;
  if (typeof d === "string") {
    if (d.includes("T")) {
      const dateObj = new Date(d);
      if (!isNaN(dateObj.getTime())) {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
    }
    return d.slice(0, 10);
  }
  return fallbackDate;
};

// ─── Types ───
interface StopData {
  stopId: number;
  rowOrder?: number;
  row_order?: number;
  orderNo: string;
  data_store_no?: string;
  locationNo?: string;
  storeName: string;
  store_id?: string;
  address: string;
  quantity?: number;
  sum_quantity?: number;
  lat: number;
  lng: number;
  arrivalTime: string;
  departureTime?: string;
  status: string;
  type: string;
  scheduled_time?: string;
  scheduledTime?: string;
  start_service_time?: string;
  startServiceTime?: string;
  end_service_time?: string;
  endServiceTime?: string;
  arrival_time?: string;
  priority?: "low" | "medium" | "high" | string;
  pod_image?: string;
  position_product_id?: number | string;
  position_production_order?: number;
  position_product_name?: string;
  tax?: number;
  note?: string;
  is_store_closed?: boolean;
  is_closed_today?: boolean;
  store_open_time?: string;
  store_close_time?: string;
  loads?: Array<{
    loading_type_id: number;
    type_name: string;
    unit_name: string;
    quantity: number;
  }>;
}

const getEarlyDelayBadge = (
  scheduledTime?: string,
  startServiceTime?: string,
) => {
  if (!scheduledTime) return null;

  let schedHour = 0;
  let schedMin = 0;
  let formattedScheduled = "";

  if (typeof scheduledTime === "string") {
    if (scheduledTime.includes("T")) {
      const d = new Date(scheduledTime);
      if (!isNaN(d.getTime())) {
        schedHour = d.getHours();
        schedMin = d.getMinutes();
        formattedScheduled = `${String(schedHour).padStart(2, "0")}:${String(schedMin).padStart(2, "0")}`;
      }
    } else if (scheduledTime.includes(":")) {
      const parts = scheduledTime.split(":");
      schedHour = parseInt(parts[0], 10) || 0;
      schedMin = parseInt(parts[1], 10) || 0;
      formattedScheduled = `${String(schedHour).padStart(2, "0")}:${String(schedMin).padStart(2, "0")}`;
    }
  }

  if (!formattedScheduled) {
    formattedScheduled = String(scheduledTime).slice(0, 5);
  }

  if (!startServiceTime) {
    return {
      scheduledText: formattedScheduled,
      startText: null,
      earlyDelayText: null,
      isEarly: false,
      isDelay: false,
    };
  }

  let startHour = 0;
  let startMin = 0;
  let startTimeFormatted = "";

  if (startServiceTime.includes("T") || startServiceTime.includes("-")) {
    const d = new Date(startServiceTime);
    if (!isNaN(d.getTime())) {
      startHour = d.getHours();
      startMin = d.getMinutes();
      startTimeFormatted = `${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`;
    }
  } else if (startServiceTime.includes(":")) {
    const parts = startServiceTime.split(":");
    startHour = parseInt(parts[0], 10) || 0;
    startMin = parseInt(parts[1], 10) || 0;
    startTimeFormatted = `${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`;
  }

  if (!startTimeFormatted) {
    return {
      scheduledText: formattedScheduled,
      startText: null,
      earlyDelayText: null,
      isEarly: false,
      isDelay: false,
    };
  }

  const schedMins = schedHour * 60 + schedMin;
  const actMins = startHour * 60 + startMin;
  const diff = actMins - schedMins;

  if (Math.abs(diff) <= 2) {
    return {
      scheduledText: formattedScheduled,
      startText: startTimeFormatted,
      earlyDelayText: "ตรงเวลา",
      isEarly: true,
      isDelay: false,
    };
  }

  if (diff < 0) {
    const abs = Math.abs(diff);
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    const txt = h > 0 ? `${h}h ${m}m early` : `${m}m early`;
    return {
      scheduledText: formattedScheduled,
      startText: startTimeFormatted,
      earlyDelayText: txt,
      isEarly: true,
      isDelay: false,
    };
  } else {
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    const txt = h > 0 ? `${h}h ${m}m delay` : `${m}m delay`;
    return {
      scheduledText: formattedScheduled,
      startText: startTimeFormatted,
      earlyDelayText: txt,
      isEarly: false,
      isDelay: true,
    };
  }
};

const getActualDurationText = (startStr?: string, endStr?: string) => {
  if (!startStr || !endStr) return "-";
  const start = new Date(startStr).getTime();
  const end = new Date(endStr).getTime();
  if (isNaN(start) || isNaN(end) || end < start) return "-";
  const diffSec = Math.round((end - start) / 1000);
  if (diffSec < 60) return `${diffSec}s`;
  const mins = Math.floor(diffSec / 60);
  const secs = diffSec % 60;
  return `${mins}m ${secs}s`;
};

const getPriorityBadge = (p?: string) => {
  const level = String(p || "medium").toLowerCase();
  if (level === "high" || level === "สูง") {
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
        สูง
      </span>
    );
  }
  if (level === "low" || level === "ต่ำ") {
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
        ต่ำ
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
      กลาง
    </span>
  );
};

const renderPositionBadge = (stop: any, positionProductsList: any[]) => {
  const posId = stop.position_product_id || stop.positionProductId;
  const posOrder =
    stop.position_production_order || stop.positionProductionOrder || 1;
  let posName = stop.position_product_name || stop.positionProductName;

  if (!posName && posId) {
    const found = positionProductsList.find(
      (p) => String(p.position_product_id) === String(posId),
    );
    if (found) posName = found.position_product_name;
  }

  if (!posName && !posId) return null;

  const displayName = posName || posId;
  return (
    <span className="inline-flex items-center text-amber-900 font-mono font-extrabold text-[10px] px-1.5 py-0.2 rounded shadow-2xs shrink-0">
      {displayName}/{posOrder}
    </span>
  );
};

interface RouteData {
  routeId: string;
  groupStoreId?: number | string;
  groupStoreName?: string;
  group_color?: string;
  groupColor?: string;
  driverName: string;
  vehiclePlate: string;
  car_id?: string | number;
  load1?: number;
  vehicleCapacity?: number;
  color: string;
  status?: number;
  is_released?: boolean;
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

// ─── Marker with status-based icons & teardrop shape ───
function createStopMarker(
  number: number | string,
  color: string,
  isDepot: boolean,
  status?: string,
  itemCount: number = 1,
) {
  const isMultiple = itemCount > 1;
  const isCompleted = status === "completed";
  const isProblem = status === "problem" || status === "failed";

  let pinColor = color;
  let symbolText = String(number);
  let textColor = color;
  let circleFill = "white";

  if (isDepot) {
    symbolText = "★";
  } else if (isCompleted) {
    pinColor = "#16a34a"; // Green
    symbolText = "✓";
    textColor = "#ffffff";
    circleFill = "#16a34a";
  } else if (isProblem) {
    pinColor = "#dc2626"; // Red
    symbolText = "!";
    textColor = "#ffffff";
    circleFill = "#dc2626";
  }

  let svg = "";

  if (isDepot) {
    svg = `<svg width="30" height="38" viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 37 C15 37 28 22 28 14 C28 6.82 22.18 1 15 1 C7.82 1 2 6.82 2 14 C2 22 15 37 15 37Z" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="15" cy="14" r="8" fill="white"/>
        <text x="15" y="18" text-anchor="middle" font-size="11" font-weight="900" fill="${color}" font-family="system-ui">★</text>
      </svg>`;
    return L.divIcon({
      className: "custom-pin-marker",
      html: svg,
      iconSize: [30, 38],
      iconAnchor: [15, 38],
      popupAnchor: [0, -34],
    });
  }

  if (isMultiple) {
    // Multi-item pin: double stacked teardrops + vibrant top-right badge showing count
    const badgeText = itemCount > 99 ? "99+" : String(itemCount);
    const badgeWidth =
      badgeText.length > 2 ? 20 : badgeText.length > 1 ? 17 : 14;
    svg = `<svg width="34" height="38" viewBox="0 0 34 38" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="pinShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" flood-opacity="0.35"/>
          </filter>
        </defs>
        <!-- Stacked back pin effect -->
        <path d="M16 35 C16 35 27 23 27 16 C27 9.92 22.08 5 16 5 C9.92 5 5 9.92 5 16 C5 23 16 35 16 35Z" fill="${pinColor}" opacity="0.45" stroke="white" stroke-width="1.5" transform="translate(3, -3)"/>
        
        <!-- Main front pin -->
        <path d="M13 33 C13 33 24 21 24 14 C24 7.92 19.08 3 13 3 C6.92 3 2 7.92 2 14 C2 21 13 33 13 33Z" fill="${pinColor}" stroke="white" stroke-width="1.8" filter="url(#pinShadow)"/>
        <circle cx="13" cy="14" r="7" fill="${circleFill}"/>
        <text x="13" y="${isCompleted ? 17.5 : 18}" text-anchor="middle" font-size="${isCompleted || isProblem ? 11 : symbolText.length >= 3 ? 8 : symbolText.length >= 2 ? 9 : 11}" font-weight="900" fill="${textColor}" font-family="system-ui">${symbolText}</text>
        
        <!-- Top-right Badge showing total delivery items at this pin -->
        <g transform="translate(${24 - badgeWidth / 2}, 0)">
          <rect x="0" y="0" width="${badgeWidth}" height="14" rx="7" fill="#f59e0b" stroke="white" stroke-width="1.5"/>
          <text x="${badgeWidth / 2}" y="10.5" text-anchor="middle" font-size="9" font-weight="900" fill="white" font-family="system-ui">${badgeText}</text>
        </g>
      </svg>`;

    return L.divIcon({
      className: "custom-pin-marker custom-multi-pin",
      html: svg,
      iconSize: [34, 38],
      iconAnchor: [13, 33],
      popupAnchor: [0, -29],
    });
  }

  // Single item pin
  svg = `<svg width="26" height="32" viewBox="0 0 26 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 31 C13 31 24 19 24 12 C24 5.92 19.08 1 13 1 C6.92 1 2 5.92 2 12 C2 19 13 31 13 31Z" fill="${pinColor}" stroke="white" stroke-width="1.5"/>
      <circle cx="13" cy="12" r="7" fill="${circleFill}"/>
      <text x="13" y="${isCompleted ? 15.5 : 16}" text-anchor="middle" font-size="${isCompleted || isProblem ? 11 : symbolText.length >= 3 ? 8 : symbolText.length >= 2 ? 9 : 11}" font-weight="900" fill="${textColor}" font-family="system-ui">${symbolText}</text>
    </svg>`;

  return L.divIcon({
    className: "custom-pin-marker",
    html: svg,
    iconSize: [26, 32],
    iconAnchor: [13, 32],
    popupAnchor: [0, -28],
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
function FlyToTarget({
  target,
}: {
  target: { lat: number; lng: number } | null;
}) {
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
  if (status === "completed") return "สำเร็จ";
  if (status === "problem" || status === "failed") return "ติดปัญหา";
  if (status === "in_progress") return "รอดำเนินการ";
  return "ยังไม่จัดสาย";
}

function getStatusColor(status: string) {
  if (status === "completed")
    return { bg: "#dcfce7", text: "#166534", dot: "#22c55e" };
  if (status === "problem" || status === "failed")
    return { bg: "#ffe4e6", text: "#9f1239", dot: "#f43f5e" };
  if (status === "in_progress")
    return { bg: "#fef9c3", text: "#854d0e", dot: "#eab308" };
  return { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" };
}

interface VehicleOption {
  car_id: string | number;
  car_code?: string;
  license_plate: string;
  brand?: string;
  model?: string;
  quantity?: number;
  is_assigned_today?: boolean;
}

interface StoreOption {
  store_id: string;
  store_name: string;
  store_address?: string;
  store_location?: string;
  telephone_number?: string;
}

export interface GpsDevice {
  id: number;
  name: string;
  detail?: string;
  number?: string;
  time?: string;
  latitude: number;
  longitude: number;
  heading?: number;
  engined?: boolean;
  speed?: number;
  speedLimit?: number;
  address?: string;
  place?: {
    name: string;
    distance?: number;
  } | null;
  ads?: { name: string; value: string }[];
  states?: { name: string; value: string }[];
}

// ─── GPS Vehicle Custom Marker ───
function createGpsVehicleMarker(device: GpsDevice) {
  const isEngined = device.engined ?? false;
  const speed = device.speed || 0;
  const isMoving = isEngined && speed > 0;
  const statusColor = isMoving ? "#10b981" : isEngined ? "#f59e0b" : "#64748b";
  const heading = device.heading || 0;
  const displayName = device.name || device.number || `ID: ${device.id}`;

  const svg = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));">
      <div style="background: #0f172a; color: #ffffff; padding: 2px 7px; border-radius: 6px; font-size: 10px; font-weight: 800; font-family: system-ui, sans-serif; white-space: nowrap; border: 1.5px solid ${statusColor}; margin-bottom: 3px; display: flex; align-items: center; gap: 4px;">
        <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: ${statusColor}; flex-shrink: 0; box-shadow: 0 0 6px ${statusColor};"></span>
        <span>${displayName}</span>
        ${speed > 0 ? `<span style="color: #34d399; font-family: monospace;">${speed}km/h</span>` : ""}
      </div>
      <div style="width: 32px; height: 32px; background: #ffffff; border-radius: 50%; border: 3.5px solid ${statusColor}; display: flex; align-items: center; justify-content: center; transform: rotate(${heading}deg); transition: transform 0.3s ease;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${statusColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
          <path d="M15 18H9"/>
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
          <circle cx="7" cy="18" r="2"/>
          <circle cx="17" cy="18" r="2"/>
        </svg>
      </div>
    </div>
  `;

  return L.divIcon({
    className: "custom-gps-marker",
    html: svg,
    iconSize: [140, 56],
    iconAnchor: [70, 50],
    popupAnchor: [0, -50],
  });
}

const getDepotCoordFromEnv = (): { lat: number; lng: number } => {
  const envVal = import.meta.env.VITE_HOME;
  if (envVal && typeof envVal === "string" && envVal.includes(",")) {
    const parts = envVal.split(",");
    const lat = parseFloat(parts[0].trim());
    const lng = parseFloat(parts[1].trim());
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }
  return { lat: 17.128338, lng: 102.965199 };
};

const DEPOT_COORD = getDepotCoordFromEnv();

// ─── OSRM Road Routing Helper ───
async function fetchRoadGeometry(
  stops: StopData[],
): Promise<[number, number][]> {
  const validStops = stops.filter((s) => s.lat && s.lng);
  if (validStops.length === 0) return [];

  // เพิ่มจุดคลังสินค้าเริ่มต้น (17.1266642, 102.9635667) นำหน้าจุดที่ 1 และต่อท้ายจุดสุดท้าย (เดินทางกลับ Depot)
  const stopsWithDepot = [
    { lat: DEPOT_COORD.lat, lng: DEPOT_COORD.lng },
    ...validStops,
    { lat: DEPOT_COORD.lat, lng: DEPOT_COORD.lng },
  ];

  if (stopsWithDepot.length < 2) {
    return stopsWithDepot.map((s) => [s.lat, s.lng]);
  }

  const chunkSize = 25;
  const allRoadCoords: [number, number][] = [];

  for (let i = 0; i < stopsWithDepot.length - 1; i += chunkSize - 1) {
    const chunk = stopsWithDepot.slice(i, i + chunkSize);
    if (chunk.length < 2) break;

    const coordString = chunk.map((s) => `${s.lng},${s.lat}`).join(";");
    const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;

    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.code === "Ok" && data.routes?.[0]?.geometry?.coordinates) {
          const leafCoords: [number, number][] =
            data.routes[0].geometry.coordinates.map(
              ([lng, lat]: [number, number]) => [lat, lng],
            );
          if (allRoadCoords.length > 0) {
            allRoadCoords.push(...leafCoords.slice(1));
          } else {
            allRoadCoords.push(...leafCoords);
          }
          continue;
        }
      }
    } catch (err) {
      console.warn("OSRM chunk routing fallback:", err);
    }

    chunk.forEach((s) => allRoadCoords.push([s.lat, s.lng]));
  }

  return allRoadCoords.length > 0
    ? allRoadCoords
    : stopsWithDepot.map((s) => [s.lat, s.lng]);
}

export const RoutePage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [routeGeometries, setRouteGeometries] = useState<
    Record<string, [number, number][]>
  >({});
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [activeRouteDates, setActiveRouteDates] = useState<string[]>([]);

  const fetchActiveRouteDates = useCallback(async () => {
    try {
      const res = await api.get("/optimoroute/active-dates");
      if (res.data.success && Array.isArray(res.data.activeDates)) {
        setActiveRouteDates(res.data.activeDates);
      }
    } catch (err) {
      console.error("Fetch active route dates error:", err);
    }
  }, []);
  const [checkedRoutes, setCheckedRoutes] = useState<Set<string>>(new Set());
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const isRouteVisibleOnMap = useCallback(
    (routeId: string | number) => {
      const rIdStr = String(routeId);
      if (checkedRoutes.size > 0) {
        return checkedRoutes.has(rIdStr);
      }
      if (selectedRouteId) {
        return String(selectedRouteId) === rIdStr;
      }
      return true;
    },
    [checkedRoutes, selectedRouteId],
  );

  const [source, setSource] = useState<string>("database");
  const [searchRouteText, setSearchRouteText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [bottomPanelOpen, setBottomPanelOpen] = useState(true);
  const [bottomTab, setBottomTab] = useState<
    "all" | "pending" | "completed" | "problem"
  >("all");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);

  // Assigned vs Unassigned Tab state
  const [assignedTab, setAssignedTab] = useState<"assigned" | "unassigned">(
    "assigned",
  );
  const [unassignedStops, setUnassignedStops] = useState<any[]>([]);
  const [loadingUnassigned, setLoadingUnassigned] = useState(false);

  // Master Cargo Loading Types State
  const [loadingTypesList, setLoadingTypesList] = useState<
    {
      loading_type_id: number;
      type_code: string;
      type_name: string;
      unit_name: string;
    }[]
  >([]);

  // Table Columns Definition & Visibility State
  const routeTableColumns = useMemo<ColumnItem[]>(() => {
    const dynamicCols: ColumnItem[] = loadingTypesList.map((lt) => ({
      id: `loading_type_${lt.loading_type_id}`,
      label: lt.type_name,
    }));
    return [
      { id: "status", label: "สถานะ" },
      { id: "order_no", label: "รหัสออเดอร์" },
      { id: "store_info", label: "ที่ตั้ง / ร้านค้า" },
      { id: "route_vehicle", label: "สายรถ / ทะเบียน" },
      { id: "priority", label: "ลำดับความสำคัญ" },
      { id: "drop_point", label: "จุดวาง" },
      { id: "scheduled_time", label: "กำหนดเวลาไว้ที่" },
      { id: "start_service", label: "เริ่มบริการ" },
      { id: "end_service", label: "สิ้นสุดบริการ" },
      { id: "actual_duration", label: "ระยะเวลาจริง" },
      { id: "tax", label: "ใบกำกับภาษี" },
      { id: "note", label: "หมายเหตุ" },
      ...dynamicCols,
      { id: "total_quantity", label: "จำนวนทั้งหมด" },
      { id: "actions", label: "จัดการ" },
    ];
  }, [loadingTypesList]);

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    () => {
      const saved = localStorage.getItem("wawa_route_table_visible_cols");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
      return {
        status: true,
        order_no: true,
        store_info: true,
        route_vehicle: true,
        priority: true,
        drop_point: true,
        scheduled_time: true,
        start_service: true,
        end_service: true,
        actual_duration: true,
        tax: true,
        note: true,
        total_quantity: true,
        actions: true,
      };
    },
  );

  const handleColumnChange = (updated: Record<string, boolean>) => {
    setVisibleColumns(updated);
    localStorage.setItem(
      "wawa_route_table_visible_cols",
      JSON.stringify(updated),
    );
  };

  const visibleColumnCount = routeTableColumns.filter(
    (col) => visibleColumns[col.id] !== false,
  ).length;

  // Group stops by coordinates (latitude and longitude) & store_id to handle overlapping pins on map
  const locationStopsGroupMap = useMemo(() => {
    const map: Record<
      string,
      Array<{
        stop: any;
        routeId?: string | number;
        routeColor?: string;
        routeName?: string;
        driverName?: string;
        vehiclePlate?: string;
        isUnassigned?: boolean;
      }>
    > = {};

    const addStopToMap = (
      key: string,
      item: {
        stop: any;
        routeId?: string | number;
        routeColor?: string;
        routeName?: string;
        driverName?: string;
        vehiclePlate?: string;
        isUnassigned?: boolean;
      },
    ) => {
      if (!key) return;
      if (!map[key]) {
        map[key] = [];
      }
      const targetId = item.stop.list_id || item.stop.stopId || item.stop.id;
      const targetOrderNo =
        item.stop.orderNo ||
        item.stop.data_store_no ||
        item.stop.order_no ||
        "";

      const exists = map[key].some((existing) => {
        const existingId =
          existing.stop.list_id || existing.stop.stopId || existing.stop.id;
        const existingOrderNo =
          existing.stop.orderNo ||
          existing.stop.data_store_no ||
          existing.stop.order_no ||
          "";

        if (
          existingId &&
          targetId &&
          String(existingId) === String(targetId)
        ) {
          return true;
        }
        if (
          existingOrderNo &&
          targetOrderNo &&
          String(existingOrderNo) === String(targetOrderNo)
        ) {
          return true;
        }
        return false;
      });

      if (!exists) {
        map[key].push(item);
      }
    };

    // 1. Process Assigned Stops from Routes (include all routes so multi-item stores show complete info)
    routes.forEach((route) => {
      route.stops?.forEach((stop: any) => {
        if (stop.type === "depot") return;
        let lat = stop.lat;
        let lng = stop.lng;
        if ((!lat || !lng) && stop.lat_long && typeof stop.lat_long === "string") {
          const parts = stop.lat_long.split(",").map((p: any) => parseFloat(p.trim()));
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            lat = parts[0];
            lng = parts[1];
          }
        }
        if (!lat || !lng) return;

        const stopObj = {
          ...stop,
          lat,
          lng,
          storeName: stop.storeName || stop.store_name || stop.store_name_result || "",
          address: stop.address || stop.store_address || "",
          orderNo: stop.orderNo || stop.data_store_no || stop.order_no || "",
          quantity: stop.quantity || stop.sum_quantity || 1,
        };

        const itemWrapper = {
          stop: stopObj,
          routeId: route.routeId,
          routeColor: route.color || "#3b82f6",
          routeName: route.groupStoreName || (route.driverName ? `สาย ${route.driverName}` : `สาย #${route.routeId}`),
          driverName: route.driverName || "-",
          vehiclePlate: route.vehiclePlate || "-",
          isUnassigned: false,
        };

        const coordKey = `${Number(lat).toFixed(5)}_${Number(lng).toFixed(5)}`;
        addStopToMap(coordKey, itemWrapper);

        const storeId = stop.store_id || stop.locationNo;
        if (storeId) {
          addStopToMap(
            `store_${String(storeId).trim().toLowerCase()}`,
            itemWrapper,
          );
        }
      });
    });

    // 2. Process Unassigned Stops
    unassignedStops.forEach((stop: any) => {
      let lat = stop.lat;
      let lng = stop.lng;
      if ((!lat || !lng) && stop.lat_long && typeof stop.lat_long === "string") {
        const parts = stop.lat_long.split(",").map((p: any) => parseFloat(p.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          lat = parts[0];
          lng = parts[1];
        }
      }
      if (!lat || !lng) return;

      const stopObj = {
        ...stop,
        lat,
        lng,
        stopId: stop.list_id || stop.id,
        storeName: stop.store_name_result || stop.store_name || stop.storeName || "",
        address: stop.store_address || stop.address || "",
        orderNo: stop.data_store_no || stop.order_no || stop.orderNo || "",
        quantity: stop.sum_quantity || stop.quantity || 1,
        rowOrder: stop.row_order || stop.rowOrder || 1,
        status: stop.status || "unassigned",
      };

      const itemWrapper = {
        stop: stopObj,
        routeColor: "#9ca3af",
        routeName: "ยังไม่จัดสาย",
        driverName: "-",
        vehiclePlate: "-",
        isUnassigned: true,
      };

      const coordKey = `${Number(lat).toFixed(5)}_${Number(lng).toFixed(5)}`;
      addStopToMap(coordKey, itemWrapper);

      const storeId = stop.store_id || stop.locationNo;
      if (storeId) {
        addStopToMap(
          `store_${String(storeId).trim().toLowerCase()}`,
          itemWrapper,
        );
      }
    });

    return map;
  }, [routes, unassignedStops]);
  const [unassignedLoads, setUnassignedLoads] = useState<
    Record<number, number>
  >({});
  const [unassignedEditLoads, setUnassignedEditLoads] = useState<
    Record<number, number>
  >({});

  // Master Position Products List State
  const [positionProductsList, setPositionProductsList] = useState<
    { position_product_id: number; position_product_name: string }[]
  >([]);

  // Create Stop Drawer position state
  const [formStopPositionProductId, setFormStopPositionProductId] = useState<
    string | number
  >("");
  const [formStopPositionOrder, setFormStopPositionOrder] = useState<number>(1);

  // Edit Stop Drawer position state
  const [editFormPositionProductId, setEditFormPositionProductId] = useState<
    string | number
  >("");
  const [editFormPositionOrder, setEditFormPositionOrder] = useState<number>(1);

  // Create Unassigned Stop Modal State
  const [isCreateUnassignedModalOpen, setIsCreateUnassignedModalOpen] =
    useState(false);
  const [unassignedCreatedDate, setUnassignedCreatedDate] = useState("");
  const [unassignedStoreId, setUnassignedStoreId] = useState("");
  const [unassignedStoreName, setUnassignedStoreName] = useState("");
  const [unassignedAddress, setUnassignedAddress] = useState("");
  const [unassignedQuantity, setUnassignedQuantity] = useState(1);
  const [unassignedLatLong, setUnassignedLatLong] = useState("");
  const [unassignedOrderNo, setUnassignedOrderNo] = useState("");
  const [unassignedPriority, setUnassignedPriority] =
    useState<string>("medium");
  const [unassignedTax, setUnassignedTax] = useState(false);
  const [unassignedNote, setUnassignedNote] = useState("");
  const [unassignedPositionProductId, setUnassignedPositionProductId] =
    useState<string | number>("");
  const [unassignedPositionOrder, setUnassignedPositionOrder] =
    useState<number>(1);
  const [creatingUnassigned, setCreatingUnassigned] = useState(false);

  // Edit Unassigned Stop Modal State
  const [isEditUnassignedModalOpen, setIsEditUnassignedModalOpen] =
    useState(false);
  const [editingUnassignedStop, setEditingUnassignedStop] = useState<
    any | null
  >(null);
  const [unassignedEditStoreId, setUnassignedEditStoreId] = useState("");
  const [unassignedEditStoreName, setUnassignedEditStoreName] = useState("");
  const [unassignedEditAddress, setUnassignedEditAddress] = useState("");
  const [unassignedEditQuantity, setUnassignedEditQuantity] = useState(1);
  const [unassignedEditLatLong, setUnassignedEditLatLong] = useState("");
  const [unassignedEditOrderNo, setUnassignedEditOrderNo] = useState("");
  const [unassignedEditPriority, setUnassignedEditPriority] =
    useState<string>("medium");
  const [unassignedEditCreatedDate, setUnassignedEditCreatedDate] =
    useState("");
  const [unassignedEditTax, setUnassignedEditTax] = useState(false);
  const [unassignedEditNote, setUnassignedEditNote] = useState("");
  const [unassignedEditPositionProductId, setUnassignedEditPositionProductId] =
    useState<string | number>("");
  const [unassignedEditPositionOrder, setUnassignedEditPositionOrder] =
    useState<number>(1);
  const [updatingUnassigned, setUpdatingUnassigned] = useState(false);

  // Excel Import Preview Left Drawer State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExcelPreviewDrawerOpen, setIsExcelPreviewDrawerOpen] =
    useState(false);
  const [excelPreviewStops, setExcelPreviewStops] = useState<any[]>([]);
  const [importingExcelStops, setImportingExcelStops] = useState(false);
  const [isParsingExcel, setIsParsingExcel] = useState(false);

  // Multi-Add Unassigned Stops Drawer State
  const [isMultiAddDrawerOpen, setIsMultiAddDrawerOpen] = useState(false);
  const [multiAddStops, setMultiAddStops] = useState<any[]>([]);
  const [importingMultiAddStops, setImportingMultiAddStops] = useState(false);

  // Auto-Routing Calculation Drawer State
  const [isAutoRouteDrawerOpen, setIsAutoRouteDrawerOpen] = useState(false);
  const [autoRouteSelectedVehicles, setAutoRouteSelectedVehicles] = useState<
    string[]
  >([]);
  const [calculatingAutoRoute, setCalculatingAutoRoute] = useState(false);

  // Delivery Settings State
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>(
    () => {
      try {
        const saved = localStorage.getItem("wawa_delivery_settings");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return DEFAULT_DELIVERY_SETTINGS;
    },
  );
  const [isDeliverySettingsDrawerOpen, setIsDeliverySettingsDrawerOpen] =
    useState(false);

  const fetchDeliverySettings = useCallback(async () => {
    try {
      const res = await api.get("/optimoroute/delivery-settings");
      if (res.data.success && res.data.settings) {
        setDeliverySettings(res.data.settings);
        localStorage.setItem(
          "wawa_delivery_settings",
          JSON.stringify(res.data.settings),
        );
      }
    } catch (err) {
      console.error("Fetch delivery settings from DB error:", err);
    }
  }, []);

  useEffect(() => {
    fetchDeliverySettings();
  }, [fetchDeliverySettings]);

  // Clear Unassigned Stops State
  const [
    isConfirmClearUnassignedModalOpen,
    setIsConfirmClearUnassignedModalOpen,
  ] = useState(false);
  const [clearingUnassigned, setClearingUnassigned] = useState(false);

  // Avoid Zones (พื้นที่ห้ามผ่าน) State
  const [avoidZones, setAvoidZones] = useState<AvoidZone[]>([]);
  const [isAvoidZoneDrawerOpen, setIsAvoidZoneDrawerOpen] = useState(false);
  const [isDrawingAvoidZone, setIsDrawingAvoidZone] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
  const [isSaveZoneModalOpen, setIsSaveZoneModalOpen] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneType, setNewZoneType] = useState<
    "unpaved" | "height_limit" | "truck_prohibited" | "custom"
  >("unpaved");
  const [newZoneDescription, setNewZoneDescription] = useState("");
  const [savingAvoidZone, setSavingAvoidZone] = useState(false);

  // OpenStreetMap Options & Map Controls State
  const [mapTileStyle, setMapTileStyle] = useState<
    "osm" | "satellite" | "topo" | "dark" | "light"
  >("osm");

  const [myLocation, setMyLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const tileLayerConfig = useMemo(() => {
    switch (mapTileStyle) {
      case "satellite":
        return {
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          attribution: "&copy; Esri World Imagery, Earthstar Geographics",
          maxZoom: 19,
        };
      case "topo":
        return {
          url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
          attribution: "&copy; OpenTopoMap & OpenStreetMap contributors",
          maxZoom: 17,
        };
      case "dark":
        return {
          url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          attribution: "&copy; CARTO & OpenStreetMap contributors",
          maxZoom: 19,
        };
      case "light":
        return {
          url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
          attribution: "&copy; CARTO & OpenStreetMap contributors",
          maxZoom: 19,
        };
      case "osm":
      default:
        return {
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        };
    }
  }, [mapTileStyle]);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      showError("เบราว์เซอร์ของคุณไม่รองรับ Geolocation");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const coords: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setMyLocation(coords);
        setActiveStop(null);
        setActiveGpsTarget({ lat: coords[0], lng: coords[1] });
        showSuccess(
          `พบตำแหน่งปัจจุบันของคุณ (${coords[0].toFixed(4)}, ${coords[1].toFixed(4)})`,
        );
      },
      (err) => {
        setIsLocating(false);
        showError(`ไม่สามารถระบุตำแหน่งได้: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [showSuccess, showError]);

  // Store business hours cache for drawer alerts
  const [storeHoursCache, setStoreHoursCache] = useState<Record<string, any[]>>(
    {},
  );

  const fetchStoreBusinessHours = useCallback(
    async (storeId: string) => {
      if (!storeId || storeHoursCache[storeId]) return;
      try {
        const res = await api.get(`/master/stores/${storeId}/business-hours`);
        if (res.data && res.data.success) {
          setStoreHoursCache((prev) => ({
            ...prev,
            [storeId]: res.data.businessHours || [],
          }));
        }
      } catch (err) {
        console.warn("Fetch store business hours warning:", err);
      }
    },
    [storeHoursCache],
  );

  useEffect(() => {
    if (unassignedStoreId) fetchStoreBusinessHours(unassignedStoreId);
  }, [unassignedStoreId, fetchStoreBusinessHours]);

  useEffect(() => {
    if (unassignedEditStoreId) fetchStoreBusinessHours(unassignedEditStoreId);
  }, [unassignedEditStoreId, fetchStoreBusinessHours]);

  // Resizable Bottom Panel State
  const [panelHeight, setPanelHeight] = useState<number>(260);
  const [isDragging, setIsDragging] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevHeight, setPrevHeight] = useState<number>(260);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      const startY = e.clientY;
      const startHeight = panelHeight;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaY = startY - moveEvent.clientY;
        const newHeight = Math.min(
          Math.max(startHeight + deltaY, 120),
          window.innerHeight - 180,
        );
        setPanelHeight(newHeight);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [panelHeight],
  );

  const toggleMaximize = () => {
    if (isMaximized) {
      setPanelHeight(prevHeight || 260);
      setIsMaximized(false);
    } else {
      setPrevHeight(panelHeight);
      const maxH = Math.min(window.innerHeight - 150, 580);
      setPanelHeight(maxH);
      setIsMaximized(true);
    }
  };

  // Stores list for master store selection
  const [storesList, setStoresList] = useState<StoreOption[]>([]);
  const [selectedMasterStoreId, setSelectedMasterStoreId] =
    useState<string>("");

  const storesMap = useMemo(() => {
    const map = new Map<string, StoreOption>();
    storesList.forEach((s) => {
      if (s.store_id) {
        map.set(String(s.store_id).trim().toLowerCase(), s);
      }
    });
    return map;
  }, [storesList]);

  const storeSelectOptions = useMemo(() => {
    return storesList.map((s) => (
      <option key={s.store_id} value={s.store_id}>
        {s.store_id} - {s.store_name}
      </option>
    ));
  }, [storesList]);

  // มาสเตอร์ เลือก กรุ๊ป Store
  const masterStoreSearchableOptions = useMemo(() => {
    return storesList.map((s) => ({
      value: String(s.store_id),
      label: `${s.store_id} - ${s.store_name}`,
      badge: String(s.store_id),
    }));
  }, [storesList]);

  // มาสเตอร์ เลือก ตำแหน่งวางสินค้า
  const masterPositionProductSearchableOptions = useMemo(() => {
    return positionProductsList.map((s) => {
      return {
        value: String(s.position_product_id),
        label: s.position_product_name,
      };
    });
  }, [positionProductsList]);

  // Group store dropdown state
  const [groupSearchText, setGroupSearchText] = useState("");

  const filteredGroupRoutes = useMemo(() => {
    if (!groupSearchText.trim()) return routes;
    const q = groupSearchText.trim().toLowerCase();
    return routes.filter((r) => {
      const name = r.driverName || r.groupStoreName || "";
      const vehicle = r.vehiclePlate || "";
      const gId = String(r.groupStoreId || r.routeId || "");
      return (
        name.toLowerCase().includes(q) ||
        vehicle.toLowerCase().includes(q) ||
        gId.toLowerCase().includes(q)
      );
    });
  }, [routes, groupSearchText]);

  // Vehicles list for select dropdown
  const [vehiclesList, setVehiclesList] = useState<VehicleOption[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<string>("");

  const totalUnassignedBoxes = useMemo(() => {
    return unassignedStops.reduce(
      (sum, s) => sum + (s.sum_quantity || s.quantity || 0),
      0,
    );
  }, [unassignedStops]);

  const [customVehicleCapacities, setCustomVehicleCapacities] = useState<
    Record<string, number>
  >({});

  const totalSelectedCapacity = useMemo(() => {
    return autoRouteSelectedVehicles.reduce((sum, vId) => {
      const found = vehiclesList.find((v) => String(v.car_id) === String(vId));
      if (!found) return sum;
      const customCap = customVehicleCapacities[String(vId)];
      const cap =
        customCap !== undefined && !isNaN(customCap)
          ? customCap
          : found.quantity || 100;
      return sum + cap;
    }, 0);
  }, [autoRouteSelectedVehicles, vehiclesList, customVehicleCapacities]);

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

  const fetchVehiclesList = useCallback(
    async (dateStr?: string) => {
      try {
        const targetDate = dateStr || selectedDate;
        const res = await api.get("/master/vehicles", {
          params: { date: targetDate },
        });
        if (res.data.success) {
          setVehiclesList(res.data.vehicles || []);
        }
      } catch (err) {
        console.warn("Fetch vehicles for group modal warning:", err);
      }
    },
    [selectedDate],
  );

  useEffect(() => {
    fetchVehiclesList(selectedDate);
  }, [selectedDate, fetchVehiclesList]);

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

  const fetchAvoidZones = useCallback(async () => {
    try {
      const res = await api.get("/master/avoid-zones");
      if (res.data && res.data.success) {
        setAvoidZones(res.data.zones || []);
      }
    } catch (err) {
      console.warn("Fetch avoid zones error:", err);
    }
  }, []);

  useEffect(() => {
    fetchVehiclesList(selectedDate);
    fetchStoresList();
    fetchAvoidZones();
  }, [selectedDate, fetchVehiclesList, fetchStoresList, fetchAvoidZones]);

  // Avoid Zone Handlers
  const handleAddDrawingPoint = (lat: number, lng: number) => {
    setDrawingPoints((prev) => [...prev, [lat, lng]]);
  };

  const handleUndoLastPoint = () => {
    setDrawingPoints((prev) => prev.slice(0, -1));
  };

  const handleCancelDrawing = () => {
    setIsDrawingAvoidZone(false);
    setDrawingPoints([]);
  };

  const handleFinishDrawing = () => {
    if (drawingPoints.length < 3) {
      showError("กรุณาปักจุดบนแผนที่อย่างน้อย 3 จุดเพื่อสร้างพื้นที่ห้ามผ่าน");
      return;
    }
    setNewZoneName("");
    setNewZoneType("unpaved");
    setNewZoneDescription("");
    setIsSaveZoneModalOpen(true);
  };

  const handleSaveAvoidZoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim()) {
      showError("กรุณากรอกชื่อพื้นที่ห้ามผ่าน");
      return;
    }
    if (drawingPoints.length < 3) {
      showError("พิกัด Polygon ไม่สมบูรณ์");
      return;
    }

    setSavingAvoidZone(true);
    try {
      const res = await api.post("/master/avoid-zones", {
        zone_name: newZoneName.trim(),
        zone_type: newZoneType,
        coordinates: drawingPoints,
        description: newZoneDescription.trim() || undefined,
        is_active: true,
      });

      if (res.data.success) {
        showSuccess(res.data.message || "บันทึกพื้นที่ห้ามผ่านสำเร็จ!");
        setIsSaveZoneModalOpen(false);
        setIsDrawingAvoidZone(false);
        setDrawingPoints([]);
        fetchAvoidZones();
      } else {
        showError(res.data.message || "บันทึกไม่สำเร็จ");
      }
    } catch (err: any) {
      showError(
        err?.response?.data?.message ||
          "เกิดข้อผิดพลาดในการบันทึกพื้นที่ห้ามผ่าน",
      );
    } finally {
      setSavingAvoidZone(false);
    }
  };

  const handleToggleAvoidZoneActive = async (zone: AvoidZone) => {
    try {
      const res = await api.put(`/master/avoid-zones/${zone.zone_id}`, {
        is_active: !zone.is_active,
      });
      if (res.data.success) {
        showSuccess(res.data.message);
        fetchAvoidZones();
      }
    } catch (err: any) {
      showError("เกิดข้อผิดพลาดในการสลับสถานะพื้นที่");
    }
  };

  // Avoid Zone Deletion Confirmation State
  const [avoidZoneToDelete, setAvoidZoneToDelete] = useState<AvoidZone | null>(
    null,
  );
  const [
    isConfirmDeleteAvoidZoneModalOpen,
    setIsConfirmDeleteAvoidZoneModalOpen,
  ] = useState(false);
  const [deletingAvoidZone, setDeletingAvoidZone] = useState(false);

  const handleRequestDeleteAvoidZone = (zoneIdOrObj: number | AvoidZone) => {
    let targetZone: AvoidZone | null = null;
    if (typeof zoneIdOrObj === "object" && zoneIdOrObj !== null) {
      targetZone = zoneIdOrObj;
    } else {
      targetZone =
        avoidZones.find((z) => Number(z.zone_id) === Number(zoneIdOrObj)) ||
        null;
    }

    if (targetZone) {
      setAvoidZoneToDelete(targetZone);
    } else {
      setAvoidZoneToDelete({
        zone_id: Number(zoneIdOrObj),
        zone_name: `เขตห้ามผ่าน #${zoneIdOrObj}`,
      } as AvoidZone);
    }
    setIsConfirmDeleteAvoidZoneModalOpen(true);
  };

  const handleConfirmDeleteAvoidZone = async () => {
    if (!avoidZoneToDelete) return;
    setDeletingAvoidZone(true);
    try {
      const res = await api.delete(
        `/master/avoid-zones/${avoidZoneToDelete.zone_id}`,
      );
      if (res.data.success) {
        showSuccess(res.data.message || "ลบพื้นที่ห้ามผ่านเรียบร้อยแล้ว");
        fetchAvoidZones();
        setIsConfirmDeleteAvoidZoneModalOpen(false);
        setAvoidZoneToDelete(null);
      } else {
        showError(res.data.message || "เกิดข้อผิดพลาดในการลบพื้นที่ห้ามผ่าน");
      }
    } catch (err: any) {
      showError(
        err?.response?.data?.message ||
          "เกิดข้อผิดพลาดในการลบพื้นที่ห้ามผ่าน",
      );
    } finally {
      setDeletingAvoidZone(false);
    }
  };

  // ระบบดึงรายการยังไม่จัดสาย
  const fetchUnassignedStops = useCallback(async (date: string) => {
    setLoadingUnassigned(true);
    try {
      const res = await api.get(`/optimoroute/unassigned?date=${date}`);
      if (res.data && res.data.success) {
        setUnassignedStops(res.data.stops || []);
      }
    } catch (err) {
      console.warn("Fetch unassigned stops warning:", err);
    } finally {
      setLoadingUnassigned(false);
    }
  }, []);

  // ระบบดึงรายการสินค้าที่จัดวางแล้ว
  const fetchPositionProducts = useCallback(async () => {
    try {
      const res = await api.get("/master/position-product");
      if (res.data && res.data.success) {
        setPositionProductsList(res.data.positions || res.data.items || []);
      }
    } catch (err) {
      console.warn("Fetch position products warning:", err);
    }
  }, []);

  // ระบบดึงประเภทการขนถ่าย
  const fetchLoadingTypes = useCallback(async () => {
    try {
      const res = await api.get("/master/loading-types", {
        params: { activeOnly: "true" },
      });
      if (res.data && res.data.success) {
        setLoadingTypesList(res.data.loadingTypes || []);
      }
    } catch (err) {
      console.warn("Fetch loading types warning:", err);
    }
  }, []);

  useEffect(() => {
    fetchUnassignedStops(selectedDate);
    fetchPositionProducts();
    fetchLoadingTypes();
    fetchActiveRouteDates();
  }, [
    fetchUnassignedStops,
    fetchPositionProducts,
    fetchLoadingTypes,
    fetchActiveRouteDates,
    selectedDate,
  ]);

  // ระบบดาวน์โหลดไฟล์ Excel
  const handleDownloadSampleExcel = () => {
    try {
      const sampleData = [1, 2].map((idx) => {
        const rowObj: Record<string, any> = {
          วันที่: selectedDate || new Date().toISOString().slice(0, 10),
          รหัสร้านค้า: `ST-00${idx}`,
          รหัสออเดอร์: `ORD-2026-00${idx}`,
        };

        if (loadingTypesList.length > 0) {
          loadingTypesList.forEach((lt, ltIdx) => {
            const keyName = `จำนวน (${lt.type_name})`;
            rowObj[keyName] =
              idx === 1
                ? ltIdx === 0
                  ? 50
                  : (ltIdx + 1) * 2
                : ltIdx === 0
                  ? 30
                  : ltIdx + 1;
          });
        } else {
          rowObj["จำนวน (ลัง)"] = 50;
        }

        rowObj["ตำแหน่งวางสินค้า"] = idx === 1 ? "E" : "A";
        rowObj["แถว"] = idx;
        rowObj["ใบกำกับภาษี"] = idx === 1 ? "มี" : "ไม่มี";
        rowObj["หมายเหตุ"] = idx === 1 ? "ส่งก่อนเที่ยง" : "";

        return rowObj;
      });

      const worksheet = XLSX.utils.json_to_sheet(sampleData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "รายการจัดส่ง");
      XLSX.writeFile(workbook, "ตัวอย่างไฟล์นำเข้า_รายการจัดส่ง.xlsx");
    } catch (err) {
      console.error("Download sample excel error:", err);
      const link = document.createElement("a");
      link.href = "/sample_import_delivery_stops.csv";
      link.download = "sample_import_delivery_stops.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // ระบบนำเข้าไฟล์ Excel
  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingExcel(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

        if (rawData.length === 0) {
          showError("ไฟล์ที่เลือกไม่มีข้อมูลรายการจัดส่ง");
          setIsParsingExcel(false);
          return;
        }

        const parsedStops = rawData.map((row: any, idx: number) => {
          const storeId = String(
            row["รหัสร้านค้า"] ||
              row["store_id"] ||
              row["Code"] ||
              row["Location No"] ||
              `ST-${Date.now().toString().slice(-4)}-${idx + 1}`,
          ).trim();

          const orderNo = String(
            row["รหัสออเดอร์"] ||
              row["order_no"] ||
              row["data_store_no"] ||
              row["Order No"] ||
              `ORD-${Date.now().toString().slice(-4)}-${idx + 1}`,
          ).trim();

          // Dynamic Cargo Loading Type Detection from Excel Columns
          const loadsMap: Record<number, number> = {};
          loadingTypesList.forEach((lt) => {
            const possibleKeys = [
              `จำนวน${lt.type_name}`,
              `จำนวน (${lt.type_name})`,
              lt.type_name,
              lt.type_name === "กระบะ" ? "จำนวนกะบะ" : "",
              lt.type_name === "กะบะ" ? "จำนวนกระบะ" : "",
            ].filter(Boolean);

            let qtyVal = 0;
            for (const key of possibleKeys) {
              if (row[key] !== undefined && row[key] !== "") {
                const parsed = parseInt(String(row[key]), 10);
                if (!isNaN(parsed) && parsed >= 0) {
                  qtyVal = parsed;
                  break;
                }
              }
            }

            if (qtyVal > 0) {
              loadsMap[lt.loading_type_id] = qtyVal;
            }
          });

          const totalLoadsSum = Object.values(loadsMap).reduce<number>(
            (a, b) => a + (Number(b) || 0),
            0,
          );

          const quantity =
            totalLoadsSum > 0
              ? totalLoadsSum
              : parseInt(
                  row["จำนวนสินค้า"] ||
                    row["จำนวน"] ||
                    row["sum_quantity"] ||
                    row["quantity"] ||
                    row["Qty"] ||
                    "1",
                  10,
                ) || 1;

          const positionValue = String(
            row["ตำแหน่งวางสินค้า"] ||
              row["position_product"] ||
              row["position_product_id"] ||
              row["Position Product"] ||
              "",
          ).trim();
          const matchedPosition = positionProductsList.find(
            (position) =>
              String(position.position_product_id) === positionValue ||
              String(position.position_product_name).trim().toLowerCase() ===
                positionValue.toLowerCase(),
          );
          const positionOrder =
            parseInt(
              row["แถว"] ||
                row["position_production_order"] ||
                row["Position Row"] ||
                "1",
              10,
            ) || 1;

          // Map ข้อมูลกับ Master Store Database จาก store_id
          const foundMaster = storesList.find(
            (s) =>
              String(s.store_id).trim().toLowerCase() === storeId.toLowerCase(),
          );

          const storeName = String(
            row["ชื่อร้านค้า"] ||
              row["store_name"] ||
              row["Name"] ||
              row["Store Name"] ||
              (foundMaster ? foundMaster.store_name : `ร้านค้า ${storeId}`),
          ).trim();

          const address = String(
            row["ที่อยู่"] ||
              row["address"] ||
              row["Address"] ||
              row["Store Address"] ||
              (foundMaster ? foundMaster.store_address || "" : ""),
          ).trim();

          const latLong = String(
            row["พิกัด"] ||
              row["lat_long"] ||
              row["location"] ||
              row["GPS"] ||
              row["Coordinates"] ||
              (foundMaster ? foundMaster.store_location || "" : ""),
          ).trim();

          const taxVal =
            row["ใบกำกับภาษี"] ||
            row["ใบกำกับ"] ||
            row["tax"] ||
            row["Tax"] ||
            row["TAX"] ||
            row["Tax Invoice"] ||
            row["TaxInvoice"] ||
            row["มีใบกำกับภาษี"] ||
            row["ขอใบกำกับภาษี"] ||
            "";
          const isTax = isTaxActive(taxVal);

          const noteVal = String(
            row["หมายเหตุ"] ||
              row["note"] ||
              row["Note"] ||
              row["Remark"] ||
              "",
          ).trim();

          const dateVal = String(
            row["วันที่"] ||
              row["วันที่จัดส่ง"] ||
              row["date"] ||
              row["Date"] ||
              selectedDate,
          ).trim();

          return {
            id: `preview-${idx}-${Date.now()}`,
            store_id: storeId,
            store_name: storeName,
            data_store_no: orderNo,
            sum_quantity: quantity,
            loads: loadsMap,
            lat_long: latLong,
            position_product_id: matchedPosition?.position_product_id || "",
            position_product_name:
              matchedPosition?.position_product_name || positionValue,
            position_production_order: positionOrder,
            is_mapped_master: !!foundMaster,
            date: dateVal || selectedDate,
            tax: isTax,
            note: noteVal,
          };
        });

        setExcelPreviewStops(parsedStops);
        setIsExcelPreviewDrawerOpen(true);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (err) {
        console.error("Excel parse error:", err);
        showError("ไม่สามารถอ่านไฟล์ Excel ได้ กรุณาตรวจสอบรูปแบบไฟล์");
      } finally {
        setIsParsingExcel(false);
      }
    };

    reader.onerror = () => {
      showError("ไม่สามารถอ่านไฟล์ Excel ได้");
      setIsParsingExcel(false);
    };

    reader.readAsBinaryString(file);
  };

  // ระบบเพิ่มแถวว่างใน Excel
  const handleAddEmptyExcelRow = () => {
    const newRow = {
      id: `preview-manual-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      store_id: "",
      store_name: "",
      data_store_no: "",
      sum_quantity: 1,
      lat_long: "",
      position_product_id: "",
      position_product_name: "",
      position_production_order: 1,
      date: selectedDate,
      tax: false,
      note: "",
      is_mapped_master: false,
    };
    setExcelPreviewStops((prev) => [...prev, newRow]);
  };

  // ระบบเพิ่มรายการรวดเร็ว
  const handleOpenMultiAddDrawer = () => {
    const initialRows = Array.from({ length: 5 }, (_, i) => ({
      id: `multi-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      store_id: "",
      store_name: "",
      data_store_no: "",
      sum_quantity: 1,
      lat_long: "",
      position_product_id: "",
      position_product_name: "",
      position_production_order: 1,
      date: selectedDate,
      tax: false,
      note: "",
      is_mapped_master: false,
    }));
    setMultiAddStops(initialRows);
    setIsMultiAddDrawerOpen(true);
  };

  // ระบบเพิ่มแถวว่างใน Multi-Add
  const handleAddEmptyMultiAddRow = () => {
    const newRow = {
      id: `multi-manual-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      store_id: "",
      store_name: "",
      data_store_no: "",
      sum_quantity: 1,
      lat_long: "",
      position_product_id: "",
      position_product_name: "",
      position_production_order: 1,
      date: selectedDate,
      tax: false,
      note: "",
      is_mapped_master: false,
    };
    setMultiAddStops((prev) => [...prev, newRow]);
  };

  // ระบบยืนยันการนำเข้าข้อมูลแบบ Multi-Add
  const handleConfirmMultiAddImport = async () => {
    const validStops = multiAddStops.filter(
      (s) => s.store_id && String(s.store_id).trim(),
    );
    if (validStops.length === 0) {
      showError("กรุณาเลือกร้านค้าอย่างน้อย 1 รายการก่อนกดบันทึก");
      return;
    }

    const missingOrderNo = validStops.find(
      (s) => !s.data_store_no || !String(s.data_store_no).trim(),
    );
    if (missingOrderNo) {
      showError("กรุณากรอกรหัสออเดอร์ให้ครบทุกรายการที่มีร้านค้าก่อนกดบันทึก");
      return;
    }

    const stopsWithLoads = validStops.map((item) => {
      let loadsArray: Array<{ loading_type_id: number; quantity: number }> = [];
      if (Array.isArray(item.loads)) {
        loadsArray = item.loads;
      } else if (item.loads && typeof item.loads === "object") {
        loadsArray = Object.entries(item.loads)
          .map(([id, qty]) => ({
            loading_type_id: parseInt(id, 10),
            quantity: parseInt(String(qty), 10),
          }))
          .filter((l) => l.quantity > 0);
      }

      const totalLoadsQty = loadsArray.reduce((sum, l) => sum + l.quantity, 0);

      return {
        ...item,
        sum_quantity:
          totalLoadsQty > 0 ? totalLoadsQty : item.sum_quantity || 1,
        loads: loadsArray,
      };
    });

    setImportingMultiAddStops(true);
    try {
      const res = await api.post("/optimoroute/unassigned/import", {
        date: selectedDate,
        stops: stopsWithLoads,
      });

      if (res.data.success) {
        showSuccess(
          res.data.message || `นำเข้า ${validStops.length} รายการจัดส่งสำเร็จ!`,
        );
        setIsMultiAddDrawerOpen(false);
        setMultiAddStops([]);
        fetchUnassignedStops(selectedDate);
      } else {
        showError(res.data.message || "นำเข้าข้อมูลไม่สำเร็จ");
      }
    } catch (err: any) {
      showError(
        err?.response?.data?.message || "เกิดข้อผิดพลาดในการนำเข้าข้อมูล",
      );
    } finally {
      setImportingMultiAddStops(false);
    }
  };

  // ระบบยืนยันการนำเข้าไฟล์ Excel
  const handleConfirmExcelImport = async () => {
    if (excelPreviewStops.length === 0) {
      showError("ไม่พบรายการที่ต้องนำเข้า");
      return;
    }

    const missingStore = excelPreviewStops.find(
      (s) => !s.store_id || !String(s.store_id).trim(),
    );
    if (missingStore) {
      showError(
        "กรุณาเลือกร้านค้าในแถวที่มีขอบสีแดงให้ครบทุกรายการก่อนกดบันทึก",
      );
      return;
    }

    const missingOrderNo = excelPreviewStops.find(
      (s) => !s.data_store_no || !String(s.data_store_no).trim(),
    );
    if (missingOrderNo) {
      showError(
        "กรุณากรอกรหัสออเดอร์ในแถวที่มีขอบสีแดงให้ครบทุกรายการก่อนกดบันทึก",
      );
      return;
    }

    setImportingExcelStops(true);
    try {
      const stopsWithLoads = excelPreviewStops.map((item) => {
        const loadsArray = Object.entries(item.loads || {})
          .map(([id, qty]) => ({
            loading_type_id: parseInt(id, 10),
            quantity: parseInt(String(qty), 10),
          }))
          .filter((l) => l.quantity > 0);

        const totalLoadsQty = loadsArray.reduce(
          (sum, l) => sum + l.quantity,
          0,
        );

        return {
          ...item,
          sum_quantity: totalLoadsQty > 0 ? totalLoadsQty : item.sum_quantity,
          loads: loadsArray,
        };
      });

      const res = await api.post("/optimoroute/unassigned/import", {
        date: selectedDate,
        stops: stopsWithLoads,
      });

      if (res.data.success) {
        showSuccess(
          res.data.message || "นำเข้ารายการจัดส่งแบบยังไม่จัดสายสำเร็จ!",
        );
        setIsExcelPreviewDrawerOpen(false);
        setExcelPreviewStops([]);
        fetchUnassignedStops(selectedDate);
      } else {
        showError(res.data.message || "นำเข้าข้อมูลไม่สำเร็จ");
      }
    } catch (err: any) {
      showError(
        err?.response?.data?.message || "เกิดข้อผิดพลาดในการนำเข้าข้อมูล",
      );
    } finally {
      setImportingExcelStops(false);
    }
  };

  // ระบบคำนวณเส้นทาง
  const handleRunAutoRoute = async () => {
    if (unassignedStops.length === 0) {
      showError("ไม่พบรายการรอจัดสายเพื่อคำนวณเส้นทาง");
      return;
    }

    if (autoRouteSelectedVehicles.length === 0) {
      showError("กรุณาเลือกรถอย่างน้อย 1 คันสำหรับคำนวณจัดสาย");
      return;
    }

    setCalculatingAutoRoute(true);
    try {
      // Auto-save delivery settings to DB & localStorage
      try {
        localStorage.setItem(
          "wawa_delivery_settings",
          JSON.stringify(deliverySettings),
        );
        await api.post("/optimoroute/delivery-settings", deliverySettings);
      } catch (e) {}

      const res = await api.post("/optimoroute/auto-route", {
        date: selectedDate,
        priorityStrategy: deliverySettings.priorityStrategy,
        serviceTimeMinutes: deliverySettings.serviceTimePerStop,
        depotStartTime: deliverySettings.depotStartTime,
        bufferTimePerRoute: deliverySettings.bufferTimePerRoute,
        selectedVehicleIds: autoRouteSelectedVehicles,
        customCapacities: customVehicleCapacities,
      });

      if (res.data.success) {
        showSuccess(res.data.message || "คำนวณจัดสายรถอัตโนมัติสำเร็จ!");
        setIsAutoRouteDrawerOpen(false);
        await fetchRoutes(selectedDate);
        await fetchUnassignedStops(selectedDate);
        setAssignedTab("assigned");
      } else {
        showError(res.data.message || "คำนวณจัดสายรถไม่สำเร็จ");
      }
    } catch (err: any) {
      showError(
        err?.response?.data?.message ||
          "เกิดข้อผิดพลาดในการคำนวณจัดสายรถอัตโนมัติ",
      );
    } finally {
      setCalculatingAutoRoute(false);
    }
  };

  // ระบบเลือกรถอัตโนมัติ
  const handleAutoSelectVehicles = () => {
    const availableVehicles = vehiclesList
      .filter((v) => !v.is_assigned_today)
      .map((v) => {
        const vId = String(v.car_id);
        const customCap = customVehicleCapacities[vId];
        const cap =
          customCap !== undefined && !isNaN(customCap)
            ? customCap
            : (v.quantity ?? 100);
        return {
          car_id: vId,
          capacity: cap,
        };
      })
      .sort((a, b) => b.capacity - a.capacity);

    if (availableVehicles.length === 0) {
      showError("ไม่พบรถขนส่งที่พร้อมใช้งานในวันนี้");
      return;
    }

    let currentCap = 0;
    const selected: string[] = [];

    for (const car of availableVehicles) {
      selected.push(car.car_id);
      currentCap += car.capacity;
      if (currentCap >= totalUnassignedBoxes) {
        break;
      }
    }

    if (selected.length === 0 && availableVehicles.length > 0) {
      selected.push(availableVehicles[0].car_id);
    }

    setAutoRouteSelectedVehicles(selected);
    showSuccess(
      `เลือกรถให้อัตโนมัติอย่างเหมาะสมแล้วจำนวน ${selected.length} คัน (ความจุรวม ${currentCap} ลัง)`,
    );
  };

  // ระบบเคลียร์รายการยังไม่จัดสาย
  const handleClearUnassignedStops = async () => {
    setClearingUnassigned(true);
    try {
      const res = await api.delete(
        `/optimoroute/unassigned/clear?date=${selectedDate}`,
      );
      if (res.data.success) {
        showSuccess(
          res.data.message ||
            `ล้างรายการยังไม่จัดสายของวันที่ ${selectedDate} สำเร็จ!`,
        );
        await fetchUnassignedStops(selectedDate);
      } else {
        showError(res.data.message || "ไม่สามารถล้างข้อมูลได้");
      }
    } catch (err: any) {
      showError(
        err?.response?.data?.message || "เกิดข้อผิดพลาดในการล้างข้อมูล",
      );
    } finally {
      setClearingUnassigned(false);
      setIsConfirmClearUnassignedModalOpen(false);
    }
  };

  // GPS Live Tracking State
  const [gpsDevices, setGpsDevices] = useState<GpsDevice[]>([]);
  const [showGpsVehicles, setShowGpsVehicles] = useState(true);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [lastGpsUpdate, setLastGpsUpdate] = useState<string>("");

  // GPS Historical Track State
  const [showGpsHistory, setShowGpsHistory] = useState(true);
  const [gpsHistories, setGpsHistories] = useState<
    Record<string, [number, number][]>
  >({});
  const [gpsHistoryLoading, setGpsHistoryLoading] = useState(false);

  // Left Sidebar Collapsible Sections State
  const [isRoutesSectionOpen, setIsRoutesSectionOpen] = useState(true);
  const [isGpsSectionOpen, setIsGpsSectionOpen] = useState(false);
  const [isAvoidZonesSectionOpen, setIsAvoidZonesSectionOpen] = useState(true);
  const [activeGpsTarget, setActiveGpsTarget] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // todo: ดึงข้อมูล GPS Devices
  const fetchGpsDevices = useCallback(async () => {
    setGpsLoading(true);
    try {
      const res = await api.get("/gps/devices");
      if (res.data && res.data.success) {
        setGpsDevices(res.data.devices || []);
        setLastGpsUpdate(new Date().toLocaleTimeString("th-TH"));
      }
    } catch (err) {
      console.warn("Fetch GPS devices warning:", err);
    } finally {
      setGpsLoading(false);
    }
  }, []);

  // todo: ดึงประวัติเส้นทาง GPS ของรถแต่ละคันประจำวันที่เลือก
  const fetchGpsHistories = useCallback(async () => {
    if (!showGpsVehicles || !gpsDevices || gpsDevices.length === 0) return;

    setGpsHistoryLoading(true);
    try {
      const dateStr = selectedDate || new Date().toISOString().slice(0, 10);
      const start = `${dateStr} 00:00:00`;
      const end = `${dateStr} 23:59:59`;

      const historyMap: Record<string, [number, number][]> = {};

      await Promise.all(
        gpsDevices.map(async (device) => {
          if (!device.id) return;
          try {
            const data = await fetchGpsDeviceLogs(device.id, start, end, 0);
            if (data && data.success && Array.isArray(data.logs)) {
              const coords: [number, number][] = data.logs
                .filter((l) => l.latitude && l.longitude)
                .map((l) => [l.latitude, l.longitude] as [number, number]);
              if (coords.length > 0) {
                historyMap[String(device.id)] = coords;
              }
            }
          } catch (errDev) {
            console.warn(
              `Fetch GPS history for device ${device.id} warning:`,
              errDev,
            );
          }
        }),
      );

      setGpsHistories(historyMap);
    } catch (err) {
      console.warn("Fetch GPS histories error:", err);
    } finally {
      setGpsHistoryLoading(false);
    }
  }, [gpsDevices, selectedDate, showGpsVehicles]);

  // todo: ดึงข้อมูล GPS Devices
  useEffect(() => {
    fetchGpsDevices();
    const interval = setInterval(() => {
      fetchGpsDevices();
    }, 10000); // 10 seconds auto-refresh

    return () => clearInterval(interval);
  }, [fetchGpsDevices]);

  // todo: ดึงประวัติเส้นทาง GPS เมื่อเปิดแสดง หรือเปลี่ยนวันที่/อิมพอร์ตสายรถ
  useEffect(() => {
    if (showGpsHistory && showGpsVehicles && gpsDevices.length > 0) {
      fetchGpsHistories();
    }
  }, [
    fetchGpsHistories,
    showGpsHistory,
    showGpsVehicles,
    gpsDevices.length,
    selectedDate,
  ]);

  // todo: Load Real Road Geometries for Routes (OSRM Road Routing)
  useEffect(() => {
    if (!routes || routes.length === 0) {
      setRouteGeometries({});
      return;
    }

    let isMounted = true;
    const loadGeometries = async () => {
      const geometriesMap: Record<string, [number, number][]> = {};
      await Promise.all(
        routes.map(async (r) => {
          const coords = await fetchRoadGeometry(r.stops);
          geometriesMap[r.routeId] = coords;
        }),
      );
      if (isMounted) {
        setRouteGeometries(geometriesMap);
      }
    };

    loadGeometries();

    return () => {
      isMounted = false;
    };
  }, [routes]);

  // todo: เลือก Master Store
  const handleSelectMasterStore = (storeId: string) => {
    setSelectedMasterStoreId(storeId);
    if (!storeId) return;

    const found = storesList.find(
      (s) => String(s.store_id) === String(storeId),
    );
    if (found) {
      setFormStopStoreId(found.store_id);
      setFormStopStoreName(found.store_name);
      setFormStopAddress(found.store_address || "");
      setFormStopLatLong(found.store_location || "");
    }
  };

  // todo: สร้างกลุ่มสายจัดส่ง
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
      showError(
        err?.response?.data?.message ||
          "เกิดข้อผิดพลาดในการสร้างกลุ่มสายจัดส่ง",
      );
    } finally {
      setCreatingGroup(false);
    }
  };

  // Create Stop (Delivery Item) Drawer State
  const [isCreateStopDrawerOpen, setIsCreateStopDrawerOpen] = useState(false);
  const [formStopGroupId, setFormStopGroupId] = useState<string | number>("");
  const [formStopStoreId, setFormStopStoreId] = useState("");
  const [formStopOrderNo, setFormStopOrderNo] = useState("");
  const [formStopScheduledTime, setFormStopScheduledTime] = useState("");
  const [formStopPriority, setFormStopPriority] = useState<string>("medium");
  const [formStopStoreName, setFormStopStoreName] = useState("");
  const [formStopAddress, setFormStopAddress] = useState("");
  const [formStopRowOrder, setFormStopRowOrder] = useState<number>(1);
  const [formStopQuantity, setFormStopQuantity] = useState<number>(1);
  const [formStopLatLong, setFormStopLatLong] = useState("");
  const [formStopLoads, setFormStopLoads] = useState<Record<string, number>>(
    {},
  );
  const [formStopTax, setFormStopTax] = useState(false);
  const [formStopNote, setFormStopNote] = useState("");
  const [creatingStop, setCreatingStop] = useState(false);

  // Export Drawer State & Helpers for RoutePage
  const [isExportDrawerOpen, setIsExportDrawerOpen] = useState(false);

  const normalizeLoadTypeName = useCallback((value: string) => {
    return (value || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }, []);

  const getLoadTypeIdByName = useCallback(
    (name: string) => {
      const target = normalizeLoadTypeName(name);
      const match = loadingTypesList.find((lt) => {
        const typeName = normalizeLoadTypeName(lt.type_name || "");
        return (
          typeName === target ||
          typeName.includes(target) ||
          target.includes(typeName)
        );
      });
      return match?.loading_type_id ?? null;
    },
    [loadingTypesList, normalizeLoadTypeName],
  );

  const getLoadValueByType = useCallback(
    (item: any, targetName: string): string | number => {
      const normalizedTarget = normalizeLoadTypeName(targetName);
      const entries = Array.isArray(item?.loads) ? item.loads : [];
      const loadTypeId = getLoadTypeIdByName(targetName);

      for (const entry of entries) {
        const quantity = entry?.quantity ?? entry?.qty ?? entry?.value ?? null;
        if (quantity == null) continue;

        const candidateNames = [
          entry?.type_name,
          entry?.loading_type_name,
          entry?.name,
          entry?.label,
        ]
          .filter(Boolean)
          .map((name) => normalizeLoadTypeName(String(name)));

        const matchedByName = candidateNames.some(
          (name) =>
            name === normalizedTarget ||
            name.includes(normalizedTarget) ||
            normalizedTarget.includes(name),
        );

        if (matchedByName) {
          return quantity;
        }

        if (
          loadTypeId != null &&
          Number(entry?.loading_type_id) === Number(loadTypeId)
        ) {
          return quantity;
        }
      }

      return 0;
    },
    [getLoadTypeIdByName, normalizeLoadTypeName],
  );

  const routeExportColumns = useMemo(
    () => [
      { id: "date", label: "วันที่จัดส่ง" },
      { id: "driver_name", label: "สายรถ / พนักงานขับรถ" },
      { id: "vehicle_plate", label: "ทะเบียนรถ" },
      { id: "row_order", label: "ลำดับจัดส่ง" },
      { id: "store_id", label: "รหัสร้านค้า" },
      { id: "store_name", label: "ชื่อร้านค้า" },
      { id: "tax", label: "ใบกำกับภาษี" },
      { id: "note", label: "หมายเหตุ" },
      { id: "address", label: "ที่อยู่" },
      { id: "order_no", label: "รหัสออเดอร์" },
      ...loadingTypesList.map((lt) => ({
        id: `loading_type_${lt.loading_type_id}`,
        label: lt.type_name,
      })),
      { id: "sum_quantity", label: "จำนวนสินค้า" },
      { id: "status", label: "สถานะการจัดส่ง" },
      { id: "scheduled_time", label: "เวลาจัดส่งที่กำหนด" },
      { id: "priority", label: "ความสำคัญ" },
      { id: "position_product_name", label: "ตำแหน่งวางสินค้า" },
      { id: "position_production_order", label: "แถว" },
    ],
    [loadingTypesList],
  );

  // todo: ส่งออกข้อมูลเส้นทางการจัดส่ง
  const getRouteExportValue = useCallback(
    (item: any, columnId: string): string | number => {
      switch (columnId) {
        case "date":
          return item.created_at
            ? String(item.created_at).slice(0, 10)
            : item.date || selectedDate;
        case "tax":
          return isTaxActive(item.tax) ? "มี" : "ไม่มี";
        case "note":
          return item.note || "-";
        case "driver_name":
          return item.driver_name || item.driverName || "-";
        case "vehicle_plate":
          return item.vehicle_plate || item.vehiclePlate || "-";
        case "row_order":
          return item.row_order ?? item.rowOrder ?? "-";
        case "store_id":
          return item.store_id || item.storeId || "-";
        case "store_name":
          return (
            item.storeName || item.store_name || item.store_name_result || "-"
          );
        case "address":
          return item.address || item.store_address || item.storeAddress || "-";
        case "order_no":
          return (
            item.data_store_no ||
            item.dataStoreNo ||
            item.order_no ||
            item.orderNo ||
            "-"
          );
        case "sum_quantity":
          return item.sum_quantity ?? item.sumQuantity ?? item.quantity ?? 0;
        case "status":
          return item.status === "completed"
            ? "ส่งสำเร็จ"
            : item.status === "failed"
              ? "ติดปัญหา"
              : "กำลังจัดส่ง";
        case "scheduled_time":
          return item.scheduled_time || item.scheduledTime
            ? String(item.scheduled_time || item.scheduledTime).slice(0, 5)
            : "-";
        case "priority":
          return item.priority === "high"
            ? "สูง"
            : item.priority === "low"
              ? "ต่ำ"
              : "ปกติ";
        default: {
          if (columnId.startsWith("loading_type_")) {
            const ltId = parseInt(columnId.replace("loading_type_", ""), 10);
            if (Array.isArray(item.loads)) {
              const found = item.loads.find(
                (l: any) => Number(l.loading_type_id) === ltId,
              );
              return found ? found.quantity || 0 : 0;
            }
            if (item.loads && typeof item.loads === "object") {
              return item.loads[ltId] || 0;
            }
            const foundLt = loadingTypesList.find(
              (lt) => lt.loading_type_id === ltId,
            );
            if (foundLt) {
              return getLoadValueByType(item, foundLt.type_name);
            }
            return 0;
          }
          return item[columnId] ?? "-";
        }
      }
    },
    [getLoadValueByType, loadingTypesList, selectedDate],
  );

  // Find previous stop in the same group to compare scheduled_time
  const previousStopInGroup = useMemo(() => {
    if (!formStopGroupId) return null;
    const targetRoute = routes.find(
      (r) =>
        String(r.groupStoreId || r.routeId.replace("ROUTE-", "")) ===
        String(formStopGroupId),
    );
    if (!targetRoute || !targetRoute.stops || targetRoute.stops.length === 0)
      return null;

    const validStops = targetRoute.stops
      .filter((s) => s.type !== "depot")
      .sort(
        (a, b) =>
          (a.rowOrder ?? a.row_order ?? 0) - (b.rowOrder ?? b.row_order ?? 0),
      );

    if (validStops.length === 0) return null;

    // Find the stop prior to formStopRowOrder, or take the last stop in validStops
    const prev =
      validStops
        .filter((s) => (s.rowOrder ?? s.row_order ?? 0) < formStopRowOrder)
        .pop() || validStops[validStops.length - 1];

    return prev || null;
  }, [routes, formStopGroupId, formStopRowOrder]);

  // todo: เพิ่มรายการจุดจัดส่งสินค้าใหม่
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

    // Check scheduled_time condition vs previous stop in same group
    if (
      formStopScheduledTime &&
      previousStopInGroup &&
      previousStopInGroup.scheduled_time
    ) {
      const prevTimeStr = String(previousStopInGroup.scheduled_time).slice(
        0,
        5,
      );
      const toMins = (str: string) => {
        const parts = str.split(":");
        if (parts.length < 2) return null;
        const h = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        return isNaN(h) || isNaN(m) ? null : h * 60 + m;
      };

      const curMins = toMins(formStopScheduledTime);
      const prevMins = toMins(prevTimeStr);

      if (curMins !== null && prevMins !== null && curMins <= prevMins) {
        showError(
          `เวลาจัดส่งที่กำหนด (${formStopScheduledTime}) ต้องมากกว่าเวลาจุดจัดส่งก่อนหน้าในกรุ๊ปนี้ (${prevTimeStr} น.)`,
        );
        return;
      }
    }

    setCreatingStop(true);
    try {
      const loadsPayload = Object.entries(formStopLoads)
        .map(([id, qty]) => ({
          loading_type_id: parseInt(id, 10),
          quantity: parseInt(String(qty), 10),
        }))
        .filter((item) => item.quantity > 0);

      const totalLoadsQty = loadsPayload.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      const finalQuantity =
        totalLoadsQty > 0 ? totalLoadsQty : formStopQuantity;

      const res = await api.post("/optimoroute/stops", {
        group_store_id: formStopGroupId,
        store_id: formStopStoreId || undefined,
        data_store_no: formStopOrderNo.trim() || undefined,
        order_no: formStopOrderNo.trim() || undefined,
        store_name: formStopStoreName.trim(),
        address: formStopAddress.trim(),
        row_order: formStopRowOrder,
        sum_quantity: finalQuantity,
        lat_long: formStopLatLong.trim(),
        scheduled_time: formStopScheduledTime || undefined,
        priority: formStopPriority,
        tax: formStopTax ? 1 : 0,
        note: formStopNote.trim() || undefined,
        status: "in_progress",
        date: selectedDate,
        position_product_id: formStopPositionProductId || undefined,
        position_production_order: formStopPositionOrder || 1,
        loads: loadsPayload,
      });

      if (res.data.success) {
        showSuccess(res.data.message || "เพิ่มรายการจุดจัดส่งสำเร็จ!");
        setIsCreateStopDrawerOpen(false);
        setSelectedMasterStoreId("");
        setFormStopStoreId("");
        setFormStopOrderNo("");
        setFormStopScheduledTime("");
        setFormStopPriority("medium");
        setFormStopStoreName("");
        setFormStopAddress("");
        setFormStopLatLong("");
        setFormStopTax(false);
        setFormStopNote("");
        setFormStopLoads({});
        setFormStopPositionProductId("");
        setFormStopPositionOrder(1);
        fetchRoutes(selectedDate);
      } else {
        showError(res.data.message || "เพิ่มรายการจัดส่งไม่สำเร็จ");
      }
    } catch (err: any) {
      showError(
        err?.response?.data?.message || "เกิดข้อผิดพลาดในการเพิ่มรายการจัดส่ง",
      );
    } finally {
      setCreatingStop(false);
    }
  };

  // Edit Stop Drawer State
  const [isEditStopDrawerOpen, setIsEditStopDrawerOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<any | null>(null);
  const [editFormGroupId, setEditFormGroupId] = useState<string | number>("");
  const [editFormStoreId, setEditFormStoreId] = useState("");
  const [editFormOrderNo, setEditFormOrderNo] = useState("");
  const [editFormStoreName, setEditFormStoreName] = useState("");
  const [editFormAddress, setEditFormAddress] = useState("");
  const [editFormRowOrder, setEditFormRowOrder] = useState<number>(1);
  const [editFormQuantity, setEditFormQuantity] = useState<number>(1);
  const [editFormLatLong, setEditFormLatLong] = useState("");
  const [editFormStatus, setEditFormStatus] = useState("pending");
  const [editFormStopLoads, setEditFormStopLoads] = useState<
    Record<string, number>
  >({});
  const [editFormStopScheduledTime, setEditFormStopScheduledTime] =
    useState("00:00");
  const [editFormStopPriority, setEditFormStopPriority] = useState("");
  const [editFormStopTax, setEditFormStopTax] = useState(false);
  const [editFormStopNote, setEditFormStopNote] = useState("");
  const [updatingStop, setUpdatingStop] = useState(false);

  // Delete Stop Confirm Modal State
  const [stopToDelete, setStopToDelete] = useState<any | null>(null);
  const [deletingStop, setDeletingStop] = useState(false);

  // แก้ไขจุดจัดส่ง (Edit Stop)
  const handleOpenEditStopDrawer = (stop: any) => {
    setEditingStop(stop);
    setEditFormGroupId(
      stop.groupStoreId ||
        stop.group_store_id ||
        (stop.routeId ? String(stop.routeId).replace("ROUTE-", "") : "") ||
        "",
    );
    setEditFormStoreId(stop.locationNo || stop.store_id || "");
    setEditFormOrderNo(stop.data_store_no || stop.orderNo || "");
    setEditFormStoreName(
      stop.storeName || stop.store_name || stop.store_name_result || "",
    );
    setEditFormAddress(stop.address || stop.store_address || "");
    setEditFormRowOrder(stop.rowOrder ?? stop.row_order ?? stop.stopId ?? 1);
    setEditFormQuantity(stop.quantity ?? stop.sum_quantity ?? 1);
    setEditFormLatLong(
      stop.lat_long || (stop.lat && stop.lng ? `${stop.lat},${stop.lng}` : ""),
    );
    setEditFormStatus(stop.status || "unassigned");
    setEditFormPositionProductId(
      stop.position_product_id || stop.positionProductId || "",
    );
    setEditFormPositionOrder(
      stop.position_production_order || stop.positionProductionOrder || 1,
    );
    setEditFormStopScheduledTime(
      stop.scheduledTime || stop.scheduled_time || "00:00",
    );
    setEditFormStopPriority(stop.priority || "");
    setEditFormStopTax(isTaxActive(stop.tax));
    setEditFormStopNote(stop.note || "");
    const initLoads: Record<number, number> = {};
    if (Array.isArray(stop.loads)) {
      stop.loads.forEach((l: any) => {
        if (l.loading_type_id) {
          initLoads[l.loading_type_id] = l.quantity || 0;
        }
      });
    }
    setEditFormStopLoads(initLoads);
    setIsEditStopDrawerOpen(true);
  };

  // แก้ไขจุดจัดส่ง (Edit Stop) - เลือกจาก master store
  const handleSelectEditMasterStore = (storeId: string) => {
    setEditFormStoreId(storeId);
    if (!storeId) return;

    const found = storesList.find(
      (s) => String(s.store_id) === String(storeId),
    );
    if (found) {
      setEditFormStoreId(found.store_id);
      setEditFormStoreName(found.store_name);
      setEditFormAddress(found.store_address || "");
      setEditFormLatLong(found.store_location || "");
    }
  };

  // แก้ไขจุดจัดส่ง (Edit Stop) - บันทึก
  const handleSaveEditStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStop) return;
    const targetListId = editingStop.stopId || editingStop.list_id;
    if (!targetListId) {
      showError("ไม่พบรหัสรายการจุดจัดส่ง (list_id)");
      return;
    }
    const loadsPayload = Object.entries(editFormStopLoads)
      .map(([id, qty]) => ({
        loading_type_id: parseInt(id, 10),
        quantity: parseInt(String(qty), 10),
      }))
      .filter((item) => item.quantity > 0);

    const totalLoadsQty = loadsPayload.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const finalQuantity = totalLoadsQty > 0 ? totalLoadsQty : editFormQuantity;

    setUpdatingStop(true);
    try {
      const res = await api.put(`/optimoroute/stops/${targetListId}`, {
        group_store_id: editFormGroupId || null,
        store_id: editFormStoreId || undefined,
        data_store_no: editFormOrderNo || undefined,
        store_name: editFormStoreName.trim(),
        address: editFormAddress.trim(),
        row_order: editFormRowOrder,
        sum_quantity: finalQuantity,
        lat_long: editFormLatLong.trim(),
        status: editFormStatus,
        position_product_id: editFormPositionProductId || null,
        position_production_order: editFormPositionOrder || 1,
        loads: loadsPayload,
        scheduled_time: editFormStopScheduledTime,
        priority: editFormStopPriority,
        tax: editFormStopTax ? 1 : 0,
        note: editFormStopNote.trim(),
      });

      if (res.data.success) {
        showSuccess(res.data.message || "อัปเดตข้อมูลจุดจัดส่งสำเร็จ!");
        setIsEditStopDrawerOpen(false);
        setEditingStop(null);
        fetchRoutes(selectedDate);
        fetchUnassignedStops(selectedDate);
      } else {
        showError(res.data.message || "อัปเดตรายการจัดส่งไม่สำเร็จ");
      }
    } catch (err: any) {
      showError(
        err?.response?.data?.message || "เกิดข้อผิดพลาดในการอัปเดตรายการจัดส่ง",
      );
    } finally {
      setUpdatingStop(false);
    }
  };

  // แก้ไขจุดจัดส่งแบบไม่เลือกกรุ๊ป (Edit Unassigned Stop)
  const handleOpenEditUnassignedStopDrawer = (stop: any) => {
    setEditingUnassignedStop(stop);
    setUnassignedEditStoreId(stop.store_id || stop.locationNo || "");
    setUnassignedEditOrderNo(stop.data_store_no || stop.orderNo || "");
    setUnassignedEditStoreName(
      stop.storeName || stop.store_name || stop.store_name_result || "",
    );
    setUnassignedEditAddress(stop.address || stop.store_address || "");
    setUnassignedEditQuantity(stop.sum_quantity ?? stop.quantity ?? 1);
    setUnassignedEditLatLong(
      stop.lat_long || (stop.lat && stop.lng ? `${stop.lat},${stop.lng}` : ""),
    );
    setUnassignedEditPriority(stop.priority || "medium");
    setUnassignedEditCreatedDate(
      formatDateString(stop.date || stop.created_at, selectedDate),
    );
    setUnassignedEditTax(isTaxActive(stop.tax));
    setUnassignedEditNote(stop.note || "");
    setUnassignedEditPositionProductId(
      stop.position_product_id || stop.positionProductId || "",
    );
    setUnassignedEditPositionOrder(
      stop.position_production_order || stop.positionProductionOrder || 1,
    );

    const initLoads: Record<number, number> = {};
    if (Array.isArray(stop.loads)) {
      stop.loads.forEach((l: any) => {
        if (l.loading_type_id) {
          initLoads[l.loading_type_id] = l.quantity || 0;
        }
      });
    }
    setUnassignedEditLoads(initLoads);
    setIsEditUnassignedModalOpen(true);
  };

  // แก้ไขจุดจัดส่งแบบไม่เลือกกรุ๊ป (Edit Unassigned Stop) - บันทึก
  const handleSaveEditUnassignedStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnassignedStop) return;
    const targetListId =
      editingUnassignedStop.stopId || editingUnassignedStop.list_id;
    if (!targetListId) {
      showError("ไม่พบรหัสรายการจุดจัดส่ง (list_id)");
      return;
    }

    setUpdatingUnassigned(true);
    try {
      const loadsPayload = Object.entries(unassignedEditLoads)
        .map(([id, qty]) => ({
          loading_type_id: parseInt(id, 10),
          quantity: parseInt(String(qty), 10),
        }))
        .filter((item) => item.quantity > 0);

      const totalLoadsQty = loadsPayload.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      const finalQuantity =
        totalLoadsQty > 0 ? totalLoadsQty : unassignedEditQuantity;

      const res = await api.put(`/optimoroute/stops/${targetListId}`, {
        group_store_id: null,
        store_id: unassignedEditStoreId || undefined,
        data_store_no: unassignedEditOrderNo.trim(),
        store_name: unassignedEditStoreName.trim(),
        address: unassignedEditAddress.trim(),
        sum_quantity: finalQuantity,
        lat_long: unassignedEditLatLong.trim(),
        priority: unassignedEditPriority,
        date: unassignedEditCreatedDate || selectedDate,
        tax: unassignedEditTax ? 1 : 0,
        note: unassignedEditNote.trim(),
        status: "unassigned",
        position_product_id: unassignedEditPositionProductId || null,
        position_production_order: unassignedEditPositionOrder || 1,
        loads: loadsPayload,
      });

      if (res.data.success) {
        showSuccess(res.data.message || "อัปเดตข้อมูลรายการรอจัดสายสำเร็จ!");
        setIsEditUnassignedModalOpen(false);
        setEditingUnassignedStop(null);
        fetchUnassignedStops(selectedDate);
      } else {
        showError(res.data.message || "อัปเดตรายการจัดส่งไม่สำเร็จ");
      }
    } catch (err: any) {
      showError(
        err?.response?.data?.message || "เกิดข้อผิดพลาดในการอัปเดตรายการจัดส่ง",
      );
    } finally {
      setUpdatingUnassigned(false);
    }
  };

  // ลบจุดจัดส่ง (Delete Stop)
  const handleConfirmDeleteStop = async () => {
    if (!stopToDelete) return;
    const targetListId = stopToDelete.stopId || stopToDelete.list_id;
    if (!targetListId) {
      showError("ไม่พบรหัสรายการจุดจัดส่ง (list_id)");
      return;
    }

    setDeletingStop(true);
    try {
      const res = await api.delete(`/optimoroute/stops/${targetListId}`);
      if (res.data.success) {
        showSuccess(res.data.message || "ลบรายการจุดจัดส่งเรียบร้อยแล้ว");
        setUnassignedStops((prev) =>
          prev.filter(
            (s) => String(s.list_id || s.stopId) !== String(targetListId),
          ),
        );
        fetchRoutes(selectedDate);
        fetchUnassignedStops(selectedDate);
      } else {
        showError(res.data.message || "ลบรายการจัดส่งไม่สำเร็จ");
      }
    } catch (err: any) {
      showError(
        err?.response?.data?.message || "เกิดข้อผิดพลาดในการลบรายการจัดส่ง",
      );
    } finally {
      setDeletingStop(false);
      setStopToDelete(null);
    }
  };

  // แก้ไขกลุ่ม (Edit Group)
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupColor, setEditGroupColor] = useState("#3b82f6");
  const [editGroupCarId, setEditGroupCarId] = useState("");
  const [editGroupDate, setEditGroupDate] = useState(selectedDate);
  const [updatingGroup, setUpdatingGroup] = useState(false);

  // ลบกลุ่ม (Delete Group)
  const [groupToDelete, setGroupToDelete] = useState<any | null>(null);
  const [deletingGroup, setDeletingGroup] = useState(false);

  // ตัวเลือกยานพาหนะสำหรับแก้ไขกลุ่ม
  const editVehicleOptions = useMemo(() => {
    const opts = vehiclesList.map((v) => ({
      value: String(v.car_id),
      label: `${v.license_plate} ${v.brand ? `(${v.brand}${v.model ? ` ${v.model}` : ""})` : ""}`,
      badge: v.car_code || String(v.car_id).slice(0, 8),
    }));

    if (
      editGroupCarId &&
      !opts.some((o) => String(o.value) === String(editGroupCarId))
    ) {
      opts.unshift({
        value: String(editGroupCarId),
        label: `${editGroupCarId}`,
        badge: "ข้อมูลปัจจุบัน",
      });
    }

    return opts;
  }, [vehiclesList, editGroupCarId]);

  // แก้ไขกลุ่ม (Edit Group) - เปิด modal
  const handleOpenEditGroupModal = (route: any) => {
    setEditingGroup(route);
    setEditGroupName(route.groupStoreName || route.driverName || "");
    setEditGroupColor(route.color || "#3b82f6");

    const targetPlate = String(route.vehiclePlate || "").trim();
    const targetCarId = String(route.car_id || "").trim();

    let matchedCarId = "";

    // 1. Try matching by car_id directly in vehiclesList
    if (targetCarId) {
      const foundById = vehiclesList.find(
        (v) =>
          String(v.car_id).trim().toLowerCase() === targetCarId.toLowerCase(),
      );
      if (foundById) {
        matchedCarId = String(foundById.car_id);
      }
    }

    // 2. Try matching by license_plate or car_code against targetCarId or targetPlate
    if (!matchedCarId && (targetCarId || targetPlate)) {
      const searchTerms = [targetCarId, targetPlate].filter(
        (t) => t && t !== "-",
      );
      const foundByPlate = vehiclesList.find((v) => {
        const p = String(v.license_plate).trim().toLowerCase();
        const c = String(v.car_code || "")
          .trim()
          .toLowerCase();
        const pClean = p.replace(/[\s-]/g, "");

        return searchTerms.some((term) => {
          const tClean = term.toLowerCase().replace(/[\s-]/g, "");
          return (
            p === term.toLowerCase() ||
            c === term.toLowerCase() ||
            (pClean && pClean === tClean)
          );
        });
      });

      if (foundByPlate) {
        matchedCarId = String(foundByPlate.car_id);
      }
    }

    // 3. Fallback to raw car_id or vehiclePlate if present and not '-'
    if (!matchedCarId) {
      if (route.car_id && String(route.car_id) !== "-") {
        matchedCarId = String(route.car_id);
      } else if (route.vehiclePlate && String(route.vehiclePlate) !== "-") {
        matchedCarId = String(route.vehiclePlate);
      }
    }

    setEditGroupCarId(matchedCarId);
    setEditGroupDate(selectedDate);
    setIsEditGroupModalOpen(true);
  };

  // แก้ไขกลุ่ม (Edit Group) - บันทึก
  const handleSaveEditGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;
    const targetGroupId =
      editingGroup.groupStoreId || editingGroup.routeId?.replace("ROUTE-", "");
    if (!targetGroupId) {
      showError("ไม่พบรหัสกลุ่มสายจัดส่ง (group_store_id)");
      return;
    }
    if (!editGroupName.trim()) {
      showError("กรุณากรอกชื่อกลุ่มสายจัดส่ง");
      return;
    }

    setUpdatingGroup(true);
    try {
      const res = await api.put(`/master/groups/${targetGroupId}`, {
        group_store_name: editGroupName.trim(),
        group_color: editGroupColor,
        car_id: editGroupCarId || null,
        car: editGroupCarId || null,
        date: editGroupDate || selectedDate,
      });

      if (res.data.success) {
        showSuccess(res.data.message || "อัปเดตกลุ่มสายจัดส่งสำเร็จ!");
        setIsEditGroupModalOpen(false);
        setEditingGroup(null);
        fetchRoutes(selectedDate);
      } else {
        showError(res.data.message || "อัปเดตกลุ่มสายจัดส่งไม่สำเร็จ");
      }
    } catch (err: any) {
      showError(
        err?.response?.data?.message ||
          "เกิดข้อผิดพลาดในการอัปเดตกลุ่มสายจัดส่ง",
      );
    } finally {
      setUpdatingGroup(false);
    }
  };

  // ลบกลุ่ม (Delete Group) - เปิด modal
  const handleConfirmDeleteGroup = async () => {
    if (!groupToDelete) return;
    const targetGroupId =
      groupToDelete.groupStoreId ||
      groupToDelete.routeId?.replace("ROUTE-", "");
    if (!targetGroupId) {
      showError("ไม่พบรหัสกลุ่มสายจัดส่ง (group_store_id)");
      return;
    }

    setDeletingGroup(true);
    try {
      const res = await api.delete(`/master/groups/${targetGroupId}`);
      if (res.data.success) {
        showSuccess(res.data.message || "ลบกลุ่มสายจัดส่งเรียบร้อยแล้ว");
        fetchRoutes(selectedDate);
        fetchUnassignedStops(selectedDate);
      } else {
        showError(res.data.message || "ลบกลุ่มสายจัดส่งไม่สำเร็จ");
      }
    } catch (err: any) {
      showError(
        err?.response?.data?.message || "เกิดข้อผิดพลาดในการลบกลุ่มสายจัดส่ง",
      );
    } finally {
      setDeletingGroup(false);
      setGroupToDelete(null);
    }
  };

  // เลือกจุดจัดส่ง (Select Stop)
  const [activeStop, setActiveStop] = useState<{
    routeId: string;
    stopId: number | string;
    store_id: number;
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

  const [checkInOutStore, setCheckInOutStore] = useState<any | null>(null);

  // เลือกจุดจัดส่ง (Select Stop) - เปิด Detail Card & FlyTo
  const handleSelectStopRow = (stop: any) => {
    if (stop.routeId) {
      setSelectedRouteId(stop.routeId);
      setCheckedRoutes((prev) => {
        const next = new Set(prev);
        next.add(stop.routeId);
        return next;
      });
    }

    const latNum = parseFloat(stop.lat);
    const lngNum = parseFloat(stop.lng);

    if (latNum && lngNum && !isNaN(latNum) && !isNaN(lngNum)) {
      setActiveStop({
        routeId: stop.routeId,
        stopId: stop.stopId,
        store_id: stop.locationNo,
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
    }

    setCheckInOutStore(stop);
  };

  // ดึงข้อมูลเส้นทาง
  const fetchRoutes = useCallback(
    async (date: string, preserveSelection: boolean = true) => {
      setLoading(true);
      try {
        const res = await api.get("/optimoroute/routes", { params: { date } });
        if (res.data.success) {
          const fetchedRoutes: RouteData[] = (res.data.routes || []).map(
            (r: RouteData, idx: number) => ({
              ...r,
              color:
                r.group_color ||
                r.groupColor ||
                r.color ||
                ROUTE_COLORS[idx % ROUTE_COLORS.length],
            }),
          );
          setRoutes(fetchedRoutes);
          setSource(res.data.source || "database");
          if (!preserveSelection) {
            setCheckedRoutes(new Set());
            setSelectedRouteId(null);
          }
        }
      } catch (err: any) {
        showError(
          err?.response?.data?.message || "ไม่สามารถดึงข้อมูลเส้นทางได้",
        );
      } finally {
        setLoading(false);
      }
    },
    [showError],
  );

  // เรียกใช้ fetchRoutes เมื่อ selectedDate เปลี่ยน
  useEffect(() => {
    fetchRoutes(selectedDate, false);
  }, [selectedDate, fetchRoutes]);

  // สถิติ (Stats)
  // จำนวนจุดจัดส่งทั้งหมด
  const totalStops = routes.reduce(
    (sum, r) => sum + r.stops.filter((s) => s.type !== "depot").length,
    0,
  );

  // จำนวนจุดจัดส่งที่เสร็จสิ้นแล้ว
  const completedStops = routes.reduce(
    (sum, r) =>
      sum +
      r.stops.filter((s) => s.status === "completed" && s.type !== "depot")
        .length,
    0,
  );

  // จำนวนจุดจัดส่งที่มีปัญหา
  const problemStops = routes.reduce(
    (sum, r) =>
      sum +
      r.stops.filter(
        (s) =>
          (s.status === "problem" || s.status === "failed") &&
          s.type !== "depot",
      ).length,
    0,
  );

  // จำนวนจุดจัดส่งที่รอ
  const pendingStops = totalStops - completedStops - problemStops;

  // กรองเส้นทาง (Filter Routes)
  const filteredRoutes = useMemo(() => {
    if (!searchRouteText.trim()) return routes;
    const q = searchRouteText.trim().toLowerCase();
    return routes.filter(
      (r) =>
        r.driverName.toLowerCase().includes(q) ||
        r.vehiclePlate.toLowerCase().includes(q) ||
        (r.groupStoreName && r.groupStoreName.toLowerCase().includes(q)) ||
        (r.load1 && String(r.load1).includes(q)),
    );
  }, [routes, searchRouteText]);

  // ขอบเขตแผนที่ (Map Bounds)
  const mapBounds = useMemo(() => {
    const coords: [number, number][] = [[17.128338, 102.965199]];
    routes.forEach((r) => {
      if (isRouteVisibleOnMap(r.routeId)) {
        r.stops.forEach((s) => {
          if (s.lat && s.lng) coords.push([s.lat, s.lng]);
        });
      }
    });
    return coords.length > 1 ? L.latLngBounds(coords) : null;
  }, [routes, isRouteVisibleOnMap]);

  // กรองข้อมูลยานพาหนะที่ถูกเลือก (Active Vehicle Plates)
  const activeRouteVehicles = useMemo(() => {
    const activeRouteIds = new Set<string>();
    if (checkedRoutes.size > 0) {
      checkedRoutes.forEach((id) => activeRouteIds.add(String(id)));
    } else if (selectedRouteId) {
      activeRouteIds.add(String(selectedRouteId));
    }
    if (activeRouteIds.size === 0) return null;

    const plates = new Set<string>();
    routes.forEach((r) => {
      if (activeRouteIds.has(String(r.routeId))) {
        if (r.vehiclePlate) plates.add(r.vehiclePlate.toLowerCase().trim());
        if (r.car_id) plates.add(String(r.car_id).toLowerCase().trim());
        if (r.groupStoreName) plates.add(r.groupStoreName.toLowerCase().trim());
      }
    });
    return plates;
  }, [checkedRoutes, selectedRouteId, routes]);

  // ขอบเขตที่จำกัดสำหรับกลุ่มที่เลือก (Scoped stops)
  const scopeStops = useMemo(() => {
    const stops: (StopData & {
      routeColor: string;
      routeDriverName: string;
      routeId: string;
      routeVehicle: string;
    })[] = [];
    const routesToShow = selectedRouteId
      ? routes.filter((r) => r.routeId === selectedRouteId)
      : routes;
    routesToShow.forEach((r) => {
      r.stops.forEach((s) => {
        if (s.type === "depot") return;
        stops.push({
          ...s,
          routeColor: r.color,
          routeDriverName: r.driverName,
          routeId: r.routeId,
          routeVehicle: r.vehiclePlate,
        });
      });
    });
    return stops;
  }, [routes, selectedRouteId]);



  // จำนวนจุดจัดส่งทั้งหมดในกลุ่ม
  const scopeTotalCount = scopeStops.length;
  // จำนวนจุดจัดส่งที่เสร็จสิ้นแล้ว
  const scopeCompletedCount = useMemo(
    () => scopeStops.filter((s) => s.status === "completed").length,
    [scopeStops],
  );
  // จำนวนจุดจัดส่งที่มีปัญหา
  const scopeProblemCount = useMemo(
    () =>
      scopeStops.filter((s) => s.status === "problem" || s.status === "failed")
        .length,
    [scopeStops],
  );
  // จำนวนจุดจัดส่งที่รอ
  const scopePendingCount =
    scopeTotalCount - scopeCompletedCount - scopeProblemCount;

  // ตารางด้านล่าง (Bottom Table)
  const tableStops = useMemo(() => {
    let filtered = scopeStops;
    if (bottomTab === "completed")
      filtered = scopeStops.filter((s) => s.status === "completed");
    if (bottomTab === "pending")
      filtered = scopeStops.filter((s) => s.status === "in_progress");
    if (bottomTab === "problem")
      filtered = scopeStops.filter(
        (s) => s.status === "problem" || s.status === "failed",
      );
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.storeName.toLowerCase().includes(q) ||
          s.orderNo.toLowerCase().includes(q) ||
          (s.data_store_no && s.data_store_no.toLowerCase().includes(q)) ||
          s.address.toLowerCase().includes(q) ||
          s.routeDriverName.toLowerCase().includes(q),
      );
    }
    return filtered;
  }, [scopeStops, bottomTab, searchText]);

  // todo: ส่งออกข้อมูลเส้นทางการจัดส่ง
  const routeExportData = useMemo(() => {
    return tableStops.map((s) => ({
      ...s,
      driver_name: s.routeDriverName || "-",
      vehicle_plate: s.routeVehicle || "-",
    }));
  }, [tableStops]);

  return (
    <div
      className="flex flex-col w-full font-sans text-xs"
      style={{ height: "calc(100vh - 52px)" }}
    >
      {/* ═══ TOP BAR ═══ */}
      <div className="bg-white border-b border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0 relative z-30">
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
              <div className="text-base sm:text-lg font-extrabold text-blue-600 leading-none">
                {routes.length}
              </div>
              <div className="text-[9px] text-slate-500 font-medium mt-0.5">
                เส้นทาง
              </div>
            </div>
            <div className="w-px h-6 sm:h-8 bg-slate-200" />
            <div className="text-center">
              <div className="text-base sm:text-lg font-extrabold text-slate-900 leading-none">
                {totalStops}
              </div>
              <div className="text-[9px] text-slate-500 font-medium mt-0.5">
                การจัดส่ง
              </div>
            </div>
            <div className="w-px h-6 sm:h-8 bg-slate-200" />
            <div className="text-center">
              <div className="text-base sm:text-lg font-extrabold text-amber-600 leading-none">
                {pendingStops}
              </div>
              <div className="text-[9px] text-slate-500 font-medium mt-0.5">
                รอดำเนินการ
              </div>
            </div>
            <div className="w-px h-6 sm:h-8 bg-slate-200" />
            <div className="text-center">
              <div className="text-base sm:text-lg font-extrabold text-emerald-600 leading-none">
                {completedStops}
              </div>
              <div className="text-[9px] text-slate-500 font-medium mt-0.5">
                สำเร็จ
              </div>
            </div>
            <div className="w-px h-6 sm:h-8 bg-slate-200" />
            <div className="text-center">
              <div className="text-base sm:text-lg font-extrabold text-rose-600 leading-none">
                {problemStops}
              </div>
              <div className="text-[9px] text-slate-500 font-medium mt-0.5">
                ติดปัญหา
              </div>
            </div>
            <div className="w-px h-6 sm:h-8 bg-slate-200" />
            <button
              onClick={() => setShowGpsVehicles((prev) => !prev)}
              title="คลิกเพื่อ เปิด/ปิด การแสดงตำแหน่งรถ GPS บนแผนที่"
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                showGpsVehicles
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 shadow-2xs"
                  : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${gpsLoading ? "bg-amber-400 animate-ping" : showGpsVehicles ? "bg-emerald-500" : "bg-slate-400"}`}
              />
              <span>GPS สด ({gpsDevices.length})</span>
            </button>

            <button
              onClick={() => setShowGpsHistory((prev) => !prev)}
              title="คลิกเพื่อ เปิด/ปิด การแสดงเส้นประวัติการวิ่งจริงของรถ GPS บนแผนที่"
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                showGpsHistory
                  ? "bg-cyan-50 text-cyan-700 border-cyan-300 hover:bg-cyan-100 shadow-2xs"
                  : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
              }`}
            >
              <Route
                className={`w-3.5 h-3.5 ${gpsHistoryLoading ? "animate-spin text-cyan-600" : "text-cyan-600"}`}
              />
              <span>
                เส้นประวัติ GPS ({Object.keys(gpsHistories).length})
              </span>
            </button>
          </div>
        </div>

        {/* Right — Date + Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {source === "database" && (
            <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border border-emerald-200">
              DATABASE
            </span>
          )}
          {source === "api" && (
            <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-blue-200">
              API
            </span>
          )}
          <CustomDatePicker
            value={selectedDate}
            onChange={(d) => setSelectedDate(d)}
            activeDates={activeRouteDates}
            label="เลือกวันที่:"
          />
          <button
            onClick={() => setIsExportDrawerOpen(true)}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
            title="ส่งออกข้อมูลสายรถ PDF / Excel"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>ส่งออก (Export)</span>
          </button>
          <button
            onClick={() => fetchRoutes(selectedDate)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">โหลดข้อมูล</span>
          </button>
          <button
            onClick={() => {
              setNewGroupName(
                `PDA-${String(routes.length + 1).padStart(3, "0")}`,
              );
              setIsCreateGroupModalOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>สร้างกลุ่มสายจัดส่ง</span>
          </button>
        </div>
      </div>

      {/* ═══ MAIN AREA: Sidebar + Map ═══ */}
      <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
        {/* ─── LEFT SIDEBAR (Route List + GPS Monitor) ─── */}
        <div
          className={`bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-hidden transition-all duration-200 ${
            isMobileSidebarOpen
              ? "w-full sm:w-80 h-64 sm:h-auto border-b sm:border-b-0"
              : isLeftPanelCollapsed
                ? "hidden sm:flex sm:w-9"
                : "hidden sm:flex sm:w-80"
          }`}
        >
          {/* Search Routes & GPS Devices */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-1">
            {!isLeftPanelCollapsed ? (
              <>
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1.5" />
                  <input
                    type="text"
                    value={searchRouteText}
                    onChange={(e) => setSearchRouteText(e.target.value)}
                    placeholder="ค้นหาสายรถ / ทะเบียน / GPS..."
                    className="w-full bg-white border border-slate-200 rounded-md pl-7 pr-2 py-1 text-[11px] focus:outline-none focus:border-blue-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsLeftPanelCollapsed(true)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors shrink-0 ml-1"
                  title="พับเก็บแผงกรุ๊ปสายจัดส่ง"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsLeftPanelCollapsed(false)}
                className="w-full py-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded flex items-center justify-center transition-colors"
                title="ขยายแผงกรุ๊ปสายจัดส่ง"
              >
                <PanelLeftOpen className="w-4 h-4 text-blue-600" />
              </button>
            )}
          </div>

          {(!isLeftPanelCollapsed || isMobileSidebarOpen) && (
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col divide-y divide-slate-100">
              {/* ── SECTION 1: กรุ๊ปสายจัดส่ง (Route Groups) ── */}
              <div className="flex flex-col">
                {/* Header */}
                <button
                  type="button"
                  onClick={() => setIsRoutesSectionOpen(!isRoutesSectionOpen)}
                  className="w-full bg-slate-100/90 hover:bg-slate-200/80 px-2.5 py-2 flex items-center justify-between transition-colors select-none sticky top-0 z-10 border-b border-slate-200/60"
                >
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-extrabold text-slate-800 text-xs">
                      กรุ๊ปสายจัดส่ง
                    </span>
                    <span className="bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                      {filteredRoutes.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {checkedRoutes.size > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCheckedRoutes(new Set());
                        }}
                        className="text-[10px] text-rose-600 hover:text-rose-800 font-bold hover:underline"
                        title="ยกเลิกการกรองสายรถ และแสดงสายรถทั้งหมดบนแผนที่"
                      >
                        ล้างการเลือก ({checkedRoutes.size})
                      </button>
                    )}
                    {isRoutesSectionOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </button>

                {/* Body */}
                {isRoutesSectionOpen && (
                  <div className="divide-y divide-slate-100">
                    {filteredRoutes.map((route) => {
                      const isSelected = selectedRouteId === route.routeId;
                      const isChecked = checkedRoutes.has(route.routeId);
                      const processedCount = route.stops.filter(
                        (s) =>
                          s.type !== "depot" &&
                          (s.status === "completed" ||
                            s.status === "problem" ||
                            s.status === "failed"),
                      ).length;
                      const deliveryStops = route.stops.filter(
                        (s) => s.type !== "depot",
                      ).length;
                      const estimatedTime = `${Math.floor((deliveryStops * 25) / 60)}ชม. ${(deliveryStops * 25) % 60}น.`;
                      const estimatedDist = `${(deliveryStops * 12.5).toFixed(0)}km`;

                      return (
                        <div
                          key={route.routeId}
                          className={`border-b border-slate-100 cursor-pointer transition-colors ${isSelected ? "bg-blue-50/70" : "hover:bg-slate-50"}`}
                        >
                          {/* Compact Route Header Row */}
                          <div
                            className="px-2 py-1.5"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedRouteId(null);
                                setCheckedRoutes(new Set());
                              } else {
                                setSelectedRouteId(route.routeId);
                                setCheckedRoutes(new Set([route.routeId]));
                              }
                            }}
                          >
                            {/* Line 1: Checkbox + Color + Name + Plate + Load + Actions */}
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isChecked) {
                                      setCheckedRoutes(new Set());
                                      setSelectedRouteId(null);
                                    } else {
                                      setCheckedRoutes(
                                        new Set([route.routeId]),
                                      );
                                      setSelectedRouteId(route.routeId);
                                    }
                                  }}
                                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center cursor-pointer transition-all shrink-0 ${
                                    isChecked
                                      ? "bg-blue-600 border-blue-600 text-white shadow-2xs"
                                      : "bg-white border-slate-300 hover:border-blue-400 text-transparent"
                                  }`}
                                  title={
                                    isChecked
                                      ? "แสดงเฉพาะสายนี้บนแผนที่"
                                      : "แสดงบนแผนที่"
                                  }
                                >
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </div>
                                <div
                                  className="w-2.5 h-2.5 rounded-full border border-white shadow-2xs shrink-0"
                                  style={{ background: route.color }}
                                />
                                <span className="font-bold text-slate-900 text-[11px] truncate">
                                  {route.driverName}
                                </span>
                              </div>

                              {/* Action buttons */}
                              <div className="flex items-center gap-0.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditGroupModal(route);
                                  }}
                                  className="p-0.5 rounded text-slate-400 hover:text-slate-900 hover:bg-slate-200/70 transition-colors"
                                  title="แก้ไขข้อมูลสายจัดส่ง"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>

                                {route.status === 0 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setGroupToDelete(route);
                                    }}
                                    className="p-0.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-100/70 transition-colors"
                                    title="ลบสายจัดส่ง"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Line 2: Badges (Plate, Status, Crate Capacity) */}
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {route.vehiclePlate &&
                                route.vehiclePlate !== "-" && (
                                  <span className="text-[9px] bg-slate-100 text-slate-700 font-mono font-bold px-1 py-0.2 rounded border border-slate-200 shrink-0">
                                    {route.vehiclePlate}
                                  </span>
                                )}

                              {/* Group Status Badge */}
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${
                                  route.status === 1 || route.is_released
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                    : "bg-red-50 text-red-800 border-red-300"
                                }`}
                              >
                                {route.status === 1 || route.is_released
                                  ? "ปล่อยแล้ว"
                                  : "ยังไม่ปล่อย"}
                              </span>

                              {(() => {
                                const totalBoxes =
                                  route.stops && route.stops.length > 0
                                    ? route.stops.reduce(
                                        (sum, s) => sum + (s.quantity || 0),
                                        0,
                                      )
                                    : route.load1 || 0;

                                const matchedVehicle = vehiclesList.find(
                                  (v) =>
                                    (route.car_id &&
                                      String(v.car_id) ===
                                        String(route.car_id)) ||
                                    (route.vehiclePlate &&
                                      v.license_plate === route.vehiclePlate),
                                );
                                const cap =
                                  route.vehicleCapacity ||
                                  matchedVehicle?.quantity ||
                                  100;

                                // Compute loading type breakdown summary across all stops in this route
                                const loadBreakdownMap: Record<
                                  string,
                                  {
                                    type_name: string;
                                    unit_name: string;
                                    total: number;
                                  }
                                > = {};
                                (route.stops || []).forEach((s) => {
                                  if (
                                    Array.isArray(s.loads) &&
                                    s.loads.length > 0
                                  ) {
                                    s.loads.forEach((l: any) => {
                                      const key =
                                        l.type_name ||
                                        `type_${l.loading_type_id}`;
                                      if (!loadBreakdownMap[key]) {
                                        loadBreakdownMap[key] = {
                                          type_name: l.type_name,
                                          unit_name: l.unit_name || "ชิ้น",
                                          total: 0,
                                        };
                                      }
                                      loadBreakdownMap[key].total +=
                                        l.quantity || 0;
                                    });
                                  }
                                });
                                const loadBreakdownList = Object.values(
                                  loadBreakdownMap,
                                ).filter((item) => item.total > 0);

                                if (
                                  totalBoxes <= 0 &&
                                  (!route.load1 || route.load1 <= 0) &&
                                  loadBreakdownList.length === 0
                                )
                                  return null;

                                return (
                                  <div className="flex items-center gap-1 flex-wrap shrink-0">
                                    <span
                                      className="text-[9px] bg-amber-50 text-amber-800 font-mono font-bold px-1 py-0.2 rounded border border-amber-200/80 shrink-0"
                                      title={`จัดใส่รถแล้ว ${totalBoxes} / รถรับได้สูงสุด ${cap}`}
                                    >
                                      {totalBoxes}/{cap}
                                    </span>
                                    {loadBreakdownList.map((item, bIdx) => (
                                      <span
                                        key={bIdx}
                                        className="text-[9px] text-slate-800 font-bold px-1 py-0.2 rounded border  shrink-0"
                                        title={`โหลดสินค้าประเภท ${item.type_name} รวมทั้งสิ้น ${item.total} ${item.unit_name}`}
                                      >
                                        {item.type_name}: {item.total}
                                      </span>
                                    ))}
                                  </div>
                                );
                              })()}
                            </div>

                            {/* Line 3: Stats & Progress Bar Inline */}
                            <div className="flex items-center justify-between gap-1.5 mt-0.5 text-[10px] text-slate-500 font-medium">
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="flex items-center gap-0.5">
                                  <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                  {deliveryStops} จุด
                                </span>
                                <span className="text-slate-300">·</span>
                                <span className="flex items-center gap-0.5">
                                  <Clock className="w-2.5 h-2.5 text-slate-400" />
                                  {estimatedTime}
                                </span>
                                <span className="flex items-center gap-0.5">
                                  <Route className="w-2.5 h-2.5 text-slate-400" />
                                  {estimatedDist}
                                </span>
                              </div>

                              {/* Progress Bar & Counter */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <div className="w-20 bg-slate-200 rounded-full h-1 overflow-hidden">
                                  <div
                                    className="h-1 rounded-full transition-all"
                                    style={{
                                      width: `${deliveryStops > 0 ? (processedCount / deliveryStops) * 100 : 0}%`,
                                      background: route.color,
                                    }}
                                  />
                                </div>
                                <span className="text-[9px] text-slate-500 font-mono font-bold">
                                  {processedCount}/{deliveryStops}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {filteredRoutes.length === 0 && !loading && (
                      <div className="p-4 text-center text-slate-400">
                        <Route className="w-5 h-5 mx-auto mb-1 text-slate-300" />
                        <div className="text-[10px]">ไม่พบสายรถ</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── SECTION 2: มอนิเตอร์ (Live Vehicles Monitor) ── */}
              <div className="flex flex-col">
                {/* Header */}
                <button
                  type="button"
                  onClick={() => setIsGpsSectionOpen(!isGpsSectionOpen)}
                  className="w-full bg-slate-100/90 hover:bg-slate-200/80 px-2.5 py-2 flex items-center justify-between transition-colors select-none sticky top-0 z-10 border-b border-slate-200/60"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span
                        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${gpsLoading ? "bg-amber-400" : "bg-emerald-400"}`}
                      ></span>
                      <span
                        className={`relative inline-flex rounded-full h-2 w-2 ${gpsLoading ? "bg-amber-500" : "bg-emerald-500"}`}
                      ></span>
                    </span>
                    <span className="font-extrabold text-slate-800 text-xs">
                      มอนิเตอร์
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                      {gpsDevices.length}
                    </span>
                  </div>
                  {isGpsSectionOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>

                {/* Body */}
                {isGpsSectionOpen && (
                  <div className="divide-y divide-slate-100 bg-slate-50/20">
                    {gpsDevices.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 text-xs">
                        {gpsLoading
                          ? "กำลังโหลดข้อมูล..."
                          : "ไม่พบข้อมูลรถ GPS"}
                      </div>
                    ) : (
                      gpsDevices
                        .filter((dev) => {
                          if (!searchRouteText.trim()) return true;
                          const q = searchRouteText.trim().toLowerCase();
                          return (
                            (dev.name && dev.name.toLowerCase().includes(q)) ||
                            (dev.number &&
                              dev.number.toLowerCase().includes(q)) ||
                            (dev.detail &&
                              dev.detail.toLowerCase().includes(q)) ||
                            (dev.address &&
                              dev.address.toLowerCase().includes(q)) ||
                            String(dev.id).includes(q)
                          );
                        })
                        .map((device) => {
                          const isEngined = device.engined ?? false;
                          const speed = device.speed || 0;
                          const isMoving = isEngined && speed > 0;
                          const badgeColor = isMoving
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : isEngined
                              ? "bg-amber-100 text-amber-800 border-amber-200"
                              : "bg-slate-100 text-slate-600 border-slate-200";
                          const dotColor = isMoving
                            ? "bg-emerald-500"
                            : isEngined
                              ? "bg-amber-500"
                              : "bg-slate-400";
                          const statusText = isMoving
                            ? `วิ่ง ${speed}km/h`
                            : isEngined
                              ? "ติดเครื่อง 0km/h"
                              : "ดับเครื่อง";

                          return (
                            <div
                              key={`gps-sidebar-${device.id}`}
                              onClick={() => {
                                if (device.latitude && device.longitude) {
                                  setActiveStop(null);
                                  setActiveGpsTarget({
                                    lat: device.latitude,
                                    lng: device.longitude,
                                  });
                                }
                              }}
                              className="px-2 py-1 hover:bg-emerald-50/60 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span
                                    className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`}
                                  />
                                  <span className="font-bold text-slate-800 text-xs truncate">
                                    {device.name ||
                                      device.number ||
                                      `ID ${device.id}`}
                                  </span>
                                </div>
                                <span
                                  className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded border shrink-0 ${badgeColor}`}
                                >
                                  {statusText}
                                </span>
                              </div>

                              {device.address && (
                                <div className="flex items-center gap-1 text-[10px] text-slate-500 line-clamp-1 truncate pl-3.5">
                                  <MapPin className="w-3 h-3 text-blue-500" />{" "}
                                  {device.address}
                                </div>
                              )}
                            </div>
                          );
                        })
                    )}
                  </div>
                )}
              </div>

              {/* ── SECTION 3: พื้นที่ห้ามผ่าน (Avoid Zones List) ── */}
              <div className="flex flex-col">
                {/* Header with + button on the right */}
                <div className="w-full bg-slate-100/90 hover:bg-slate-200/80 px-2.5 py-1.5 flex items-center justify-between transition-colors select-none sticky top-0 z-10 border-b border-slate-200/60">
                  <button
                    type="button"
                    onClick={() =>
                      setIsAvoidZonesSectionOpen(!isAvoidZonesSectionOpen)
                    }
                    className="flex items-center gap-1.5 flex-1 text-left cursor-pointer min-w-0"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span className="font-extrabold text-slate-800 text-xs truncate">
                      พื้นที่ห้ามผ่าน
                    </span>
                    <span className="bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded-full text-[10px] shrink-0">
                      {avoidZones.filter((z) => z.is_active).length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDrawingAvoidZone(true)}
                    className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-colors cursor-pointer shrink-0 ml-1.5"
                    title="คลิกเพื่อเริ่มวาดพื้นที่ห้ามผ่านใหม่บนแผนที่ (+ วาดเขต)"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>วาดเขต</span>
                  </button>

                  {isAvoidZonesSectionOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
                    )}
                </div>

                {/* Body */}
                {isAvoidZonesSectionOpen && (
                  <div className="divide-y divide-slate-100 bg-white">
                    {avoidZones.length === 0 ? (
                      <div className="p-3 text-center text-slate-400 text-xs flex flex-col items-center gap-1">
                        <ShieldAlert className="w-5 h-5 text-slate-300" />
                        <span>ยังไม่มีพื้นที่ห้ามผ่าน</span>
                        <button
                          type="button"
                          onClick={() => setIsDrawingAvoidZone(true)}
                          className="text-[11px] font-bold text-rose-600 hover:underline mt-1 cursor-pointer"
                        >
                          + คลิกเพื่อวาดเขตแรก
                        </button>
                      </div>
                    ) : (
                      avoidZones.map((zone) => {
                        const pointCount =
                          zone.polygon_points?.length ||
                          zone.coordinates?.length ||
                          0;
                        const firstPt = zone.polygon_points?.[0]
                          ? zone.polygon_points[0]
                          : zone.coordinates?.[0]
                            ? {
                                lat: zone.coordinates[0][0],
                                lng: zone.coordinates[0][1],
                              }
                            : null;

                        return (
                          <div
                            key={`sidebar-avoidzone-${zone.zone_id}`}
                            className={`p-2 hover:bg-rose-50/50 transition-colors flex items-center justify-between gap-2 ${
                              zone.is_active
                                ? "bg-white"
                                : "bg-slate-50/70 opacity-60"
                            }`}
                          >
                            <div
                              className="flex-1 min-w-0 cursor-pointer"
                              onClick={() => {
                                if (firstPt) {
                                  setActiveGpsTarget({
                                    lat: firstPt.lat,
                                    lng: firstPt.lng,
                                  });
                                }
                              }}
                              title="คลิกเพื่อเลื่อนแผนที่ไปยังเขตนี้"
                            >
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="w-2.5 h-2.5 rounded-full shrink-0 border"
                                  style={{
                                    backgroundColor:
                                      zone.fill_color || "#f43f5e",
                                    borderColor: zone.color || "#e11d48",
                                  }}
                                />
                                <span className="font-bold text-slate-800 text-xs truncate">
                                  {zone.zone_name ||
                                    `เขตห้ามผ่าน #${zone.zone_id}`}
                                </span>
                                {!zone.is_active && (
                                  <span className="text-[9px] font-bold text-slate-400 bg-slate-200 px-1 py-0.2 rounded">
                                    ปิดใช้
                                  </span>
                                )}
                              </div>

                              <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                                <span>{pointCount} จุดพิกัด</span>
                                {zone.zone_type && (
                                  <span className="text-slate-400">
                                    • {zone.zone_type}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons: Toggle Active, Delete */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleAvoidZoneActive(zone)
                                }
                                className={`p-1 rounded transition-colors cursor-pointer ${
                                  zone.is_active
                                    ? "text-emerald-600 hover:bg-emerald-50"
                                    : "text-slate-400 hover:bg-slate-200"
                                }`}
                                title={
                                  zone.is_active
                                    ? "ปิดใช้งานเขตนี้"
                                    : "เปิดใช้งานเขตนี้"
                                }
                              >
                                {zone.is_active ? (
                                  <Eye className="w-3.5 h-3.5" />
                                ) : (
                                  <EyeOff className="w-3.5 h-3.5" />
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleRequestDeleteAvoidZone(zone)
                                }
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="ลบพื้นที่ห้ามผ่านนี้"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Floating Map Controls & Avoid Zone Toolbar Overlay on Map (Mobile Responsive) */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-[1000] flex flex-wrap items-center justify-end gap-1.5 bg-white/95 backdrop-blur-xs p-1 sm:p-1.5 rounded-xl border border-slate-200 shadow-md max-w-[calc(100vw-1rem)] sm:max-w-none pointer-events-auto">
            {/* Map Style Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs shrink-0">
              <Layers className="w-3.5 h-3.5 text-slate-500 ml-1 shrink-0" />
              <select
                value={mapTileStyle}
                onChange={(e: any) => setMapTileStyle(e.target.value)}
                className="bg-transparent text-[11px] sm:text-xs font-semibold text-slate-700 pr-1.5 py-1 focus:outline-none cursor-pointer max-w-[110px] sm:max-w-none truncate"
                title="เลือกรูปแบบแผนที่ OpenStreetMap / Satellite / Topo / Dark / Light"
              >
                <option value="osm">แผนที่ (OSM)</option>
                <option value="satellite">ดาวเทียม (Satellite)</option>
                <option value="topo">ภูมิประเทศ (Topo)</option>
                <option value="dark">มืด (Dark)</option>
                <option value="light">สว่าง (Light)</option>
              </select>
            </div>

            {/* Locate Me / My Location Button */}
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={isLocating}
              className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs shrink-0"
              title="ค้นหาตำแหน่งปัจจุบันของคุณบนแผนที่ (GPS Current Location)"
            >
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
              ) : (
                <LocateFixed className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              )}
              <span className="hidden min-[420px]:inline">ตำแหน่งของฉัน</span>
              <span className="inline min-[420px]:hidden">ตำแหน่ง</span>
            </button>

            {isDrawingAvoidZone && (
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                <span className="text-[11px] sm:text-xs font-bold text-rose-700 px-2 py-0.5 bg-rose-50 rounded-lg border border-rose-200 animate-pulse shrink-0">
                  📍 กำลังวาด ({drawingPoints.length} จุด)
                </span>

                {drawingPoints.length > 0 && (
                  <button
                    type="button"
                    onClick={handleUndoLastPoint}
                    className="px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>ยกเลิกจุด</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleFinishDrawing}
                  disabled={drawingPoints.length < 3}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold text-white flex items-center gap-1 shadow-2xs shrink-0 ${
                    drawingPoints.length >= 3
                      ? "bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                      : "bg-slate-300 cursor-not-allowed"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>บันทึก</span>
                </button>

                <button
                  type="button"
                  onClick={handleCancelDrawing}
                  className="px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>ยกเลิก</span>
                </button>
              </div>
            )}
          </div>

          {/* MAP */}
          <div className="flex-1 relative z-0">
            <MapContainer
              center={[17.1266642, 102.9635667]}
              zoom={12}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
              zoomControl={true}
            >
              <TileLayer
                key={mapTileStyle}
                attribution={tileLayerConfig.attribution}
                url={tileLayerConfig.url}
                maxZoom={tileLayerConfig.maxZoom}
              />
              <FitBounds bounds={mapBounds} />
              <FlyToTarget
                target={
                  activeStop
                    ? { lat: activeStop.lat, lng: activeStop.lng }
                    : activeGpsTarget
                }
              />

              {/* Current My Location Marker (ตำแหน่งของฉัน) */}
              {myLocation && (
                <Marker
                  position={myLocation}
                  icon={L.divIcon({
                    className: "custom-my-location-marker",
                    html: `<div style="position:relative; width:28px; height:28px;">
                            <div style="position:absolute; inset:0; background:#3b82f6; opacity:0.4; border-radius:50%; animation:ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                            <div style="position:absolute; inset:4px; background:#2563eb; border:3px solid #ffffff; border-radius:50%; box-shadow:0 3px 6px rgba(0,0,0,0.3);"></div>
                           </div>`,
                    iconSize: [28, 28],
                    iconAnchor: [14, 14],
                  })}
                >
                  <Popup maxWidth={220}>
                    <div className="text-xs p-1 space-y-1">
                      <div className="font-bold text-blue-700 flex items-center gap-1">
                        <span>🎯 ตำแหน่งปัจจุบันของคุณ</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        พิกัด: {myLocation[0].toFixed(5)},{" "}
                        {myLocation[1].toFixed(5)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Avoid Zone Polygons */}
              {avoidZones.map((zone) => {
                if (!zone.coordinates || zone.coordinates.length < 3)
                  return null;
                const zoneColor =
                  zone.zone_type === "unpaved"
                    ? "#f59e0b"
                    : zone.zone_type === "height_limit"
                      ? "#ef4444"
                      : zone.zone_type === "truck_prohibited"
                        ? "#a855f7"
                        : "#f97316";

                return (
                  <Polygon
                    key={`avoid-zone-${zone.zone_id}`}
                    positions={zone.coordinates}
                    pathOptions={{
                      color: zoneColor,
                      fillColor: zoneColor,
                      fillOpacity: zone.is_active ? 0.35 : 0.08,
                      weight: zone.is_active ? 2.5 : 1,
                      dashArray: zone.is_active ? undefined : "4,4",
                    }}
                  >
                    <Popup maxWidth={260} autoPan={false}>
                      <div className="text-xs space-y-1.5 p-0.5">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 border-b border-slate-100 pb-1">
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                          <span>{zone.zone_name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-semibold">
                          ประเภท:{" "}
                          {zone.zone_type === "unpaved"
                            ? "🚜 ทางดินเลน/ลูกรัง"
                            : zone.zone_type === "height_limit"
                              ? "🌉 สะพานจำกัดความสูง"
                              : zone.zone_type === "truck_prohibited"
                                ? "🚚 ห้ามรถบรรทุก"
                                : "⚠️ พื้นที่เสี่ยงภัย"}
                        </div>
                        {zone.description && (
                          <div className="text-[11px] text-slate-600">
                            {zone.description}
                          </div>
                        )}
                        <div className="pt-1.5 flex items-center justify-between">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              zone.is_active
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {zone.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleAvoidZoneActive(zone)}
                            className="text-[10px] font-bold text-blue-600 hover:underline"
                          >
                            {zone.is_active ? "ปิดชั่วคราว" : "เปิดใช้งาน"}
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Polygon>
                );
              })}

              {/* Drawing Preview Polygon */}
              {isDrawingAvoidZone && drawingPoints.length > 0 && (
                <>
                  {drawingPoints.length >= 2 && (
                    <Polyline
                      positions={drawingPoints}
                      pathOptions={{
                        color: "#ef4444",
                        weight: 3,
                        dashArray: "6,6",
                      }}
                    />
                  )}
                  {drawingPoints.length >= 3 && (
                    <Polygon
                      positions={drawingPoints}
                      pathOptions={{
                        color: "#ef4444",
                        fillColor: "#f87171",
                        fillOpacity: 0.25,
                        weight: 2,
                      }}
                    />
                  )}
                  {drawingPoints.map((pt, pIdx) => (
                    <Marker
                      key={`drawing-pt-${pIdx}`}
                      position={pt}
                      icon={L.divIcon({
                        className: "drawing-vertex-marker",
                        html: `<div style="background:#ef4444;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);cursor:pointer;"></div>`,
                        iconSize: [12, 12],
                        iconAnchor: [6, 6],
                      })}
                    />
                  ))}
                </>
              )}

              {/* Drawing Map Events Component */}
              <MapDrawingEvents
                isDrawing={isDrawingAvoidZone}
                onAddPoint={handleAddDrawingPoint}
              />

              {/* Starting Depot Marker */}
              <Marker
                position={[DEPOT_COORD.lat, DEPOT_COORD.lng]}
                icon={createStopMarker(0, "#d97706", true, "planned")}
              >
                <Popup maxWidth={280} autoPan={false}>
                  <div
                    style={{
                      fontFamily: "system-ui, sans-serif",
                      fontSize: 12,
                      lineHeight: 1.5,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontSize: 16 }}>🏬</span>
                      <strong style={{ fontSize: 13, color: "#b45309" }}>
                        คลังสินค้าเริ่มต้น (Depot)
                      </strong>
                    </div>
                    <div style={{ color: "#475569", fontWeight: 600 }}>
                      พิกัด: {DEPOT_COORD.lat}, {DEPOT_COORD.lng}
                    </div>
                    <div
                      style={{ color: "#64748b", fontSize: 11, marginTop: 4 }}
                    >
                      จุดเริ่มต้นสำหรับคำนวณและออกจัดส่งสินค้าทุกสายรถ
                    </div>
                  </div>
                </Popup>
              </Marker>

              {routes.map((route) => {
                if (!isRouteVisibleOnMap(route.routeId)) return null;
                const coords: [number, number][] = [
                  [DEPOT_COORD.lat, DEPOT_COORD.lng],
                  ...route.stops
                    .filter((s) => s.lat && s.lng)
                    .map((s) => [s.lat, s.lng] as [number, number]),
                  [DEPOT_COORD.lat, DEPOT_COORD.lng],
                ];

                const polylinePositions =
                  routeGeometries[route.routeId] || coords;

                return (
                  <React.Fragment key={route.routeId}>
                    <Polyline
                      positions={polylinePositions}
                      pathOptions={{
                        color: route.color,
                        weight: 4,
                        opacity: 0.85,
                      }}
                    />
                    {route.stops.map((stop, sIdx) => {
                      if (!stop.lat || !stop.lng) return null;
                      const pinNumber =
                        stop.rowOrder ?? stop.row_order ?? stop.stopId;
                      const locKey = `${Number(stop.lat).toFixed(5)}_${Number(stop.lng).toFixed(5)}`;
                      const storeKey =
                        stop.store_id || stop.locationNo
                          ? `store_${String(stop.store_id || stop.locationNo).trim().toLowerCase()}`
                          : "";
                      const groupStops =
                        locationStopsGroupMap[locKey] ||
                        (storeKey ? locationStopsGroupMap[storeKey] : undefined) ||
                        [];
                      const itemCount = groupStops.length;

                      return (
                        <Marker
                          key={`${route.routeId}-${stop.stopId}-${sIdx}`}
                          position={[stop.lat, stop.lng]}
                          icon={createStopMarker(
                            pinNumber,
                            route.color,
                            stop.type === "depot",
                            stop.status,
                            itemCount,
                          )}
                          eventHandlers={{
                            click: () =>
                              handleSelectStopRow({
                                ...stop,
                                routeId: route.routeId,
                                routeColor: route.color,
                                routeDriverName: route.driverName,
                                routeVehicle: route.vehiclePlate,
                              }),
                          }}
                        >
                          <Popup maxWidth={320} autoPan={false}>
                            {itemCount > 1 ? (
                              <div
                                style={{
                                  fontFamily: "system-ui, sans-serif",
                                  fontSize: 12,
                                  lineHeight: 1.5,
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    background: "#fffbeb",
                                    color: "#b45309",
                                    padding: "4px 8px",
                                    borderRadius: 6,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    marginBottom: 8,
                                    border: "1px solid #fde68a",
                                  }}
                                >
                                  <span>
                                    จุดนี้มี {itemCount} รายการจัดส่ง
                                    (พิกัด/ร้านเดียวกัน)
                                  </span>
                                </div>
                                <strong
                                  style={{
                                    fontSize: 13,
                                    color: "#0f172a",
                                    display: "block",
                                    marginBottom: 2,
                                  }}
                                >
                                  {stop.storeName}
                                </strong>
                                {stop.address && (
                                  <div
                                    style={{
                                      color: "#64748b",
                                      fontSize: 11,
                                      marginBottom: 8,
                                    }}
                                  >
                                    {stop.address}
                                  </div>
                                )}
                                <div
                                  style={{
                                    maxHeight: 180,
                                    overflowY: "auto",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 6,
                                  }}
                                >
                                  {groupStops.map((item, gIdx) => {
                                    const s = item.stop;
                                    const sPinNum =
                                      s.rowOrder ??
                                      s.row_order ??
                                      s.stopId ??
                                      gIdx + 1;
                                    return (
                                      <div
                                        key={gIdx}
                                        style={{
                                          padding: "6px 8px",
                                          background: "#f8fafc",
                                          borderRadius: 6,
                                          borderLeft: `4px solid ${item.routeColor || "#9ca3af"}`,
                                          fontSize: 11,
                                        }}
                                      >
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginBottom: 2,
                                          }}
                                        >
                                          <span
                                            style={{
                                              fontWeight: 700,
                                              color: "#1e293b",
                                            }}
                                          >
                                            รายการ #{gIdx + 1} (ลำดับ {sPinNum})
                                          </span>
                                          <span
                                            style={{
                                              fontSize: 10,
                                              fontWeight: 700,
                                              padding: "1px 6px",
                                              borderRadius: 12,
                                              background: item.isUnassigned
                                                ? "#f1f5f9"
                                                : getStatusColor(s.status).bg,
                                              color: item.isUnassigned
                                                ? "#475569"
                                                : getStatusColor(s.status).text,
                                            }}
                                          >
                                            {item.isUnassigned
                                              ? "ยังไม่จัดสาย"
                                              : getStatusLabel(s.status)}
                                          </span>
                                        </div>
                                        <div
                                          style={{
                                            color: "#475569",
                                            fontSize: 10,
                                          }}
                                        >
                                          เลขที่:{" "}
                                          <strong>
                                            {s.orderNo || s.order_no || "-"}
                                          </strong>
                                          {s.arrivalTime &&
                                            ` · 🕐 ${s.arrivalTime}`}
                                          {s.quantity > 0 &&
                                            ` · จำนวน: ${s.quantity}`}
                                        </div>
                                        <div
                                          style={{
                                            color: "#64748b",
                                            fontSize: 10,
                                            marginTop: 2,
                                          }}
                                        >
                                          {item.isUnassigned ? (
                                            <span style={{ color: "#94a3b8" }}>
                                              ยังไม่จัดสาย
                                            </span>
                                          ) : (
                                            <span>
                                              สาย:{" "}
                                              <strong>{item.routeName}</strong>{" "}
                                              {item.driverName &&
                                                `(${item.driverName})`}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div
                                style={{
                                  fontFamily: "system-ui, sans-serif",
                                  fontSize: 12,
                                  lineHeight: 1.5,
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    marginBottom: 6,
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 12,
                                      height: 12,
                                      borderRadius: "50%",
                                      background: route.color,
                                      flexShrink: 0,
                                    }}
                                  />
                                  <strong style={{ fontSize: 13 }}>
                                    {stop.storeName}
                                  </strong>
                                </div>
                                <div
                                  style={{ color: "#64748b", marginBottom: 4 }}
                                >
                                  {stop.address}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 12,
                                    alignItems: "center",
                                    marginBottom: 4,
                                  }}
                                >
                                  <span>
                                     {stop.arrivalTime}
                                    {stop.departureTime
                                      ? ` – ${stop.departureTime}`
                                      : ""}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 10,
                                      fontWeight: 700,
                                      padding: "2px 8px",
                                      borderRadius: 20,
                                      background: getStatusColor(stop.status)
                                        .bg,
                                      color: getStatusColor(stop.status).text,
                                    }}
                                  >
                                    {getStatusLabel(stop.status)}
                                  </span>
                                </div>
                                <div style={{ color: "#94a3b8", fontSize: 10 }}>
                                  เลขที่: {stop.orderNo} · คนขับ:{" "}
                                  {route.driverName} · ทะเบียน:{" "}
                                  {route.vehiclePlate}
                                </div>
                              </div>
                            )}
                          </Popup>
                        </Marker>
                      );
                    })}
                  </React.Fragment>
                );
              })}

              {/* Unassigned Stops (สีเทา) */}
              {unassignedStops
                .filter((stop) => stop.lat && stop.lng)
                .map((stop, idx) => {
                  const locKey = `${Number(stop.lat).toFixed(5)}_${Number(stop.lng).toFixed(5)}`;
                  const storeKey =
                    stop.store_id || stop.locationNo
                      ? `store_${String(stop.store_id || stop.locationNo).trim().toLowerCase()}`
                      : "";
                  const groupStops =
                    locationStopsGroupMap[locKey] ||
                    (storeKey ? locationStopsGroupMap[storeKey] : undefined) ||
                    [];
                  const itemCount = groupStops.length;

                  return (
                    <Marker
                      key={`unassigned-${stop.list_id || idx}`}
                      position={[stop.lat, stop.lng]}
                      icon={createStopMarker(
                        idx + 1,
                        "#9ca3af",
                        false,
                        "unassigned",
                        itemCount,
                      )}
                    >
                      <Popup maxWidth={320} autoPan={false}>
                        {itemCount > 1 ? (
                          <div
                            style={{
                              fontFamily: "system-ui, sans-serif",
                              fontSize: 12,
                              lineHeight: 1.5,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                background: "#fffbeb",
                                color: "#b45309",
                                padding: "4px 8px",
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 700,
                                marginBottom: 8,
                                border: "1px solid #fde68a",
                              }}
                            >
                              <span>
                                จุดนี้มี {itemCount} รายการจัดส่ง
                                (พิกัด/ร้านเดียวกัน)
                              </span>
                            </div>
                            <strong
                              style={{
                                fontSize: 13,
                                color: "#0f172a",
                                display: "block",
                                marginBottom: 2,
                              }}
                            >
                              {stop.storeName}
                            </strong>
                            {stop.address && (
                              <div
                                style={{
                                  color: "#64748b",
                                  fontSize: 11,
                                  marginBottom: 8,
                                }}
                              >
                                {stop.address}
                              </div>
                            )}
                            <div
                              style={{
                                maxHeight: 180,
                                overflowY: "auto",
                                display: "flex",
                                flexDirection: "column",
                                gap: 6,
                              }}
                            >
                              {groupStops.map((item, gIdx) => {
                                const s = item.stop;
                                const sPinNum =
                                  s.rowOrder ??
                                  s.row_order ??
                                  s.stopId ??
                                  gIdx + 1;
                                return (
                                  <div
                                    key={gIdx}
                                    style={{
                                      padding: "6px 8px",
                                      background: "#f8fafc",
                                      borderRadius: 6,
                                      borderLeft: `4px solid ${item.routeColor || "#9ca3af"}`,
                                      fontSize: 11,
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginBottom: 2,
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontWeight: 700,
                                          color: "#1e293b",
                                        }}
                                      >
                                        รายการ #{gIdx + 1} (ลำดับ {sPinNum})
                                      </span>
                                      <span
                                        style={{
                                          fontSize: 10,
                                          fontWeight: 700,
                                          padding: "1px 6px",
                                          borderRadius: 12,
                                          background: item.isUnassigned
                                            ? "#f1f5f9"
                                            : getStatusColor(s.status).bg,
                                          color: item.isUnassigned
                                            ? "#475569"
                                            : getStatusColor(s.status).text,
                                        }}
                                      >
                                        {item.isUnassigned
                                          ? "ยังไม่จัดสาย"
                                          : getStatusLabel(s.status)}
                                      </span>
                                    </div>
                                    <div
                                      style={{
                                        color: "#475569",
                                        fontSize: 10,
                                      }}
                                    >
                                      เลขที่:{" "}
                                      <strong>
                                        {s.orderNo || s.order_no || "-"}
                                      </strong>
                                      {s.arrivalTime &&
                                        ` · ${s.arrivalTime}`}
                                      {s.quantity > 0 &&
                                        ` · จำนวน: ${s.quantity}`}
                                    </div>
                                    <div
                                      style={{
                                        color: "#64748b",
                                        fontSize: 10,
                                        marginTop: 2,
                                      }}
                                    >
                                      {item.isUnassigned ? (
                                        <span style={{ color: "#94a3b8" }}>
                                          ยังไม่จัดสาย
                                        </span>
                                      ) : (
                                        <span>
                                          สาย: <strong>{item.routeName}</strong>{" "}
                                          {item.driverName &&
                                            `(${item.driverName})`}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              fontFamily: "system-ui, sans-serif",
                              fontSize: 12,
                              lineHeight: 1.5,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 6,
                              }}
                            >
                              <div
                                style={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  background: "#9ca3af",
                                  flexShrink: 0,
                                }}
                              />
                              <strong style={{ fontSize: 13 }}>
                                {stop.storeName}
                              </strong>
                            </div>
                            {stop.address && (
                              <div
                                style={{ color: "#64748b", marginBottom: 4 }}
                              >
                                {stop.address}
                              </div>
                            )}
                            <div
                              style={{
                                display: "flex",
                                gap: 12,
                                alignItems: "center",
                                marginBottom: 4,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  padding: "2px 8px",
                                  borderRadius: 20,
                                  background: "#f1f5f9",
                                  color: "#475569",
                                }}
                              >
                                ยังไม่จัดสาย
                              </span>
                              {stop.quantity > 0 && (
                                <span
                                  style={{ color: "#64748b", fontSize: 11 }}
                                >
                                  จำนวน: {stop.quantity}
                                </span>
                              )}
                            </div>
                            <div style={{ color: "#94a3b8", fontSize: 10 }}>
                              เลขที่: {stop.orderNo || "-"}
                            </div>
                          </div>
                        )}
                      </Popup>
                    </Marker>
                  );
                })}

              {/* Standalone Active Leaflet Popup on Pin Marker */}
              {/* {activeStop && (
                <Popup
                  position={[activeStop.lat, activeStop.lng]}
                  eventHandlers={{
                    remove: () => setActiveStop(null),
                  }}
                  maxWidth={300}
                  autoPan={false}
                >
                  <div
                    style={{
                      fontFamily: "system-ui, sans-serif",
                      fontSize: 12,
                      lineHeight: 1.5,
                      minWidth: 210,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
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
                        <strong style={{ fontSize: 13, color: "#0f172a" }}>
                          {activeStop.storeName}
                        </strong>
                        <div style={{ fontSize: 10, color: "#64748b" }}>
                          เลขที่: {activeStop.orderNo}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        color: "#475569",
                        marginBottom: 6,
                        fontSize: 11,
                      }}
                    >
                      {activeStop.address}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
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

                    <div
                      style={{
                        color: "#64748b",
                        fontSize: 10,
                        borderTop: "1px solid #f1f5f9",
                        paddingTop: 6,
                        marginBottom: 8,
                      }}
                    >
                      คนขับ: {activeStop.driverName} · ทะเบียน:{" "}
                      <strong style={{ color: "#1e3a8a" }}>
                        {activeStop.vehiclePlate}
                      </strong>
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
                        นำทางด้วย Google Maps
                      </a>
                    </div>
                  </div>
                </Popup>
              )} */}

              {/* GPS Live Vehicle Markers */}
              {showGpsVehicles &&
                gpsDevices.map((device) => {
                  if (!device.latitude || !device.longitude) return null;

                  // If a route filter is active, only show the GPS device matching the selected vehicle!
                  if (activeRouteVehicles && activeRouteVehicles.size > 0) {
                    const devName = (device.name || "").toLowerCase().trim();
                    const devNum = (device.number || "").toLowerCase().trim();
                    const devDetail = (device.detail || "")
                      .toLowerCase()
                      .trim();
                    const devId = String(device.id || "")
                      .toLowerCase()
                      .trim();

                    const isMatch = Array.from(activeRouteVehicles).some(
                      (target) => {
                        if (!target) return false;
                        return (
                          target === devName ||
                          target === devNum ||
                          target === devId ||
                          devName.includes(target) ||
                          target.includes(devName) ||
                          devDetail.includes(target)
                        );
                      },
                    );

                    if (!isMatch) return null;
                  }
                  const isEngined = device.engined ?? false;
                  const speed = device.speed || 0;
                  const isMoving = isEngined && speed > 0;
                  const statusText = isMoving
                    ? "กำลังเคลื่อนที่"
                    : isEngined
                      ? "ติดเครื่องจอดอยู่"
                      : "ดับเครื่อง";
                  const statusBg = isMoving
                    ? "#dcfce7"
                    : isEngined
                      ? "#fef9c3"
                      : "#f1f5f9";
                  const statusColor = isMoving
                    ? "#166534"
                    : isEngined
                      ? "#854d0e"
                      : "#475569";

                  return (
                    <Marker
                      key={`gps-device-${device.id}`}
                      position={[device.latitude, device.longitude]}
                      icon={createGpsVehicleMarker(device)}
                      zIndexOffset={2000}
                    >
                      <Popup maxWidth={320} autoPan={false}>
                        <div
                          style={{
                            fontFamily: "system-ui, sans-serif",
                            fontSize: 12,
                            lineHeight: 1.5,
                            minWidth: 230,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: 6,
                              borderBottom: "1px solid #f1f5f9",
                              paddingBottom: 4,
                            }}
                          >
                            <div>
                              <strong
                                style={{ fontSize: 14, color: "#0f172a" }}
                              >
                                📡{" "}
                                {device.name ||
                                  device.number ||
                                  `ID ${device.id}`}
                              </strong>
                              {device.detail && (
                                <div style={{ fontSize: 10, color: "#64748b" }}>
                                  {device.detail}
                                </div>
                              )}
                            </div>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: 12,
                                background: statusBg,
                                color: statusColor,
                              }}
                            >
                              {statusText}
                            </span>
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 6,
                              background: "#f8fafc",
                              padding: 6,
                              borderRadius: 6,
                              marginBottom: 6,
                            }}
                          >
                            <div>
                              <span style={{ color: "#64748b", fontSize: 10 }}>
                                ความเร็ว:
                              </span>
                              <strong
                                style={{
                                  color: speed > 0 ? "#059669" : "#475569",
                                  fontSize: 12,
                                  marginLeft: 4,
                                }}
                              >
                                {speed} km/h
                              </strong>
                            </div>
                            <div>
                              <span style={{ color: "#64748b", fontSize: 10 }}>
                                ทิศทาง:
                              </span>
                              <strong
                                style={{
                                  color: "#1e40af",
                                  fontSize: 12,
                                  marginLeft: 4,
                                }}
                              >
                                {device.heading || 0}°
                              </strong>
                            </div>
                          </div>

                          {device.address && (
                            <div
                              style={{
                                color: "#334155",
                                fontSize: 11,
                                marginBottom: 6,
                              }}
                            >
                              📍 <strong>สถานที่:</strong> {device.address}
                            </div>
                          )}

                          {device.place && device.place.name && (
                            <div
                              style={{
                                color: "#475569",
                                fontSize: 10,
                                marginBottom: 6,
                              }}
                            >
                              🏢 <strong>ใกล้กับ:</strong> {device.place.name} (
                              {device.place.distance
                                ? `${device.place.distance.toFixed(1)}m`
                                : ""}
                              )
                            </div>
                          )}

                          {device.ads && device.ads.length > 0 && (
                            <div
                              style={{
                                display: "flex",
                                gap: 6,
                                flexWrap: "wrap",
                                fontSize: 10,
                                marginBottom: 6,
                              }}
                            >
                              {device.ads.map(
                                (
                                  ad: { name: string; value: string },
                                  idx: number,
                                ) => (
                                  <span
                                    key={idx}
                                    style={{
                                      background: "#e0f2fe",
                                      color: "#0369a1",
                                      padding: "1px 6px",
                                      borderRadius: 4,
                                      fontWeight: 600,
                                    }}
                                  >
                                    ⚡ {ad.name}: {ad.value}
                                  </span>
                                ),
                              )}
                            </div>
                          )}

                          <div
                            style={{
                              color: "#94a3b8",
                              fontSize: 9,
                              borderTop: "1px solid #f1f5f9",
                              paddingTop: 4,
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>ID รถ: {device.id}</span>
                            <span>🕒 {device.time || "-"}</span>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

              {/* GPS Historical Route Tracks (เส้นประวัติการเดินทางจริงของรถ) */}
              {showGpsVehicles &&
                showGpsHistory &&
                gpsDevices.map((device) => {
                  if (!device.id) return null;
                  const historyCoords = gpsHistories[String(device.id)];
                  if (!historyCoords || historyCoords.length < 2) return null;

                  // If a route filter is active, only show the GPS history matching the selected vehicle!
                  if (activeRouteVehicles && activeRouteVehicles.size > 0) {
                    const devName = (device.name || "").toLowerCase().trim();
                    const devNum = (device.number || "").toLowerCase().trim();
                    const devDetail = (device.detail || "")
                      .toLowerCase()
                      .trim();
                    const devId = String(device.id || "")
                      .toLowerCase()
                      .trim();

                    const isMatch = Array.from(activeRouteVehicles).some(
                      (target) => {
                        if (!target) return false;
                        return (
                          target === devName ||
                          target === devNum ||
                          target === devId ||
                          devName.includes(target) ||
                          target.includes(devName) ||
                          devDetail.includes(target)
                        );
                      },
                    );

                    if (!isMatch) return null;
                  }

                  const trackColor = "#0000FF";

                  return (
                    <React.Fragment key={`gps-history-${device.id}`}>
                      <Polyline
                        positions={historyCoords}
                        pathOptions={{
                          color: trackColor,
                          weight: 4.5,
                          opacity: 0.95,
                          dashArray: "8, 6",
                        }}
                      >
                        <Popup maxWidth={260} autoPan={false}>
                          <div
                            style={{
                              fontFamily: "system-ui, sans-serif",
                              fontSize: 12,
                              lineHeight: 1.5,
                            }}
                          >
                            <strong
                              style={{
                                color: "#0891b2",
                                fontSize: 13,
                                display: "block",
                                marginBottom: 2,
                              }}
                            >
                              🗺️ เส้นทางประวัติ GPS
                            </strong>
                            <div style={{ fontWeight: 700, color: "#0f172a" }}>
                              {device.name ||
                                device.number ||
                                `ID ${device.id}`}
                            </div>
                            <div
                              style={{
                                color: "#64748b",
                                fontSize: 11,
                                marginTop: 4,
                              }}
                            >
                              พิกัดประวัติการวิ่ง: {historyCoords.length} จุด
                            </div>
                          </div>
                        </Popup>
                      </Polyline>
                    </React.Fragment>
                  );
                })}
              {/* Floating Re-open Table Button when closed */}
              {!bottomPanelOpen && (
                <button
                  onClick={() => setBottomPanelOpen(true)}
                  className="absolute bottom-4 right-4 z-[1000] bg-white border border-slate-300 hover:bg-blue-50 text-blue-700 font-bold px-3 py-2 rounded-xl shadow-lg flex items-center gap-2 text-xs transition-all hover:scale-105"
                >
                  <Table className="w-4 h-4 text-blue-600" />
                  <span>แสดงตารางข้อมูล ({tableStops.length})</span>
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </MapContainer>
          </div>

          {/* ─── BOTTOM TABLE PANEL ─── */}
          {bottomPanelOpen && (
            <div
              style={{ height: panelHeight }}
              className="bg-white border-t border-slate-200 flex flex-col shrink-0 overflow-hidden relative transition-none"
            >
              {/* Resizer Drag Handle */}
              <div
                onMouseDown={handleMouseDown}
                className="h-2 bg-slate-200/80 hover:bg-blue-500 cursor-row-resize flex items-center justify-center transition-colors group select-none shrink-0"
                title="ลากขึ้น-ลงเพื่อปรับขนาดความสูงตารางข้อมูล"
              >
                <div className="w-10 h-1 bg-slate-400 group-hover:bg-white rounded-full transition-colors" />
              </div>

              {/* Tabs + Filter Header */}
              <div className="px-3 py-1.5 border-b border-slate-200 bg-slate-50/80 shrink-0 space-y-1.5">
                {/* Row 1: Segmented Tab Switcher + Table Controls (Top Row) */}
                <div className="flex items-center justify-between gap-2">
                  <div className="bg-slate-200/90 p-0.5 rounded-lg flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => setAssignedTab("assigned")}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                        assignedTab === "assigned"
                          ? "bg-white text-blue-700 shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>จัดสายแล้ว ({totalStops})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignedTab("unassigned")}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                        assignedTab === "unassigned"
                          ? "bg-white text-amber-700 shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>ยังไม่จัดสาย ({unassignedStops.length})</span>
                    </button>
                  </div>

                  {/* Counter + Window Controls (Far Right) */}
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 shrink-0">
                    <span className="flex items-center gap-1 font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                      <LocateFixed className="w-3.5 h-3.5 text-blue-600" />
                      แสดง{" "}
                      <span className="font-bold text-slate-900">
                        {assignedTab === "assigned"
                          ? tableStops.length
                          : unassignedStops.length}
                      </span>{" "}
                      รายการ
                    </span>
                    <div className="w-px h-4 bg-slate-300" />
                    <button
                      type="button"
                      onClick={toggleMaximize}
                      title={
                        isMaximized ? "ย่อขนาดตาราง" : "ขยายตารางเต็มหน้าจอ"
                      }
                      className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                    >
                      {isMaximized ? (
                        <Minimize2 className="w-4 h-4" />
                      ) : (
                        <Maximize2 className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBottomPanelOpen(false)}
                      title="ซ่อนตารางข้อมูล"
                      className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Row 2: Action Buttons & Filter (Bottom Row) */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {assignedTab === "assigned" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            let autoGroupId = "";
                            if (selectedRouteId) {
                              const matched = routes.find(
                                (r) => r.routeId === selectedRouteId,
                              );
                              if (matched)
                                autoGroupId = String(
                                  matched.groupStoreId ||
                                    matched.routeId.replace("ROUTE-", ""),
                                );
                            }
                            if (!autoGroupId && checkedRoutes.size > 0) {
                              const firstChecked = Array.from(checkedRoutes)[0];
                              const matched = routes.find(
                                (r) => r.routeId === firstChecked,
                              );
                              if (matched)
                                autoGroupId = String(
                                  matched.groupStoreId ||
                                    matched.routeId.replace("ROUTE-", ""),
                                );
                            }
                            if (!autoGroupId && routes.length > 0) {
                              autoGroupId = String(
                                routes[0].groupStoreId ||
                                  routes[0].routeId.replace("ROUTE-", ""),
                              );
                            }
                            setFormStopGroupId(autoGroupId);
                            setFormStopOrderNo("");
                            setFormStopScheduledTime("");
                            setFormStopPriority("medium");
                            setFormStopRowOrder(tableStops.length + 1);
                            setIsCreateStopDrawerOpen(true);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs px-2.5 py-1 rounded-md flex items-center gap-1 shadow-2xs transition-colors shrink-0 mr-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>รายการจัดส่ง</span>
                        </button>

                        <div className="w-px h-5 bg-slate-300 mx-1 shrink-0" />

                        <button
                          type="button"
                          onClick={() => setBottomTab("all")}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                            bottomTab === "all"
                              ? "bg-blue-600 text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          ทั้งหมด ({scopeTotalCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => setBottomTab("pending")}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                            bottomTab === "pending"
                              ? "bg-yellow-500 text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          รอดำเนินการ ({scopePendingCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => setBottomTab("completed")}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                            bottomTab === "completed"
                              ? "bg-emerald-600 text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          สำเร็จ ({scopeCompletedCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => setBottomTab("problem")}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                            bottomTab === "problem"
                              ? "bg-rose-600 text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          ติดปัญหา ({scopeProblemCount})
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setUnassignedStoreId("");
                            setUnassignedStoreName("");
                            setUnassignedAddress("");
                            setUnassignedQuantity(1);
                            setUnassignedLatLong("");
                            setUnassignedOrderNo("");
                            setUnassignedTax(false);
                            setUnassignedNote("");
                            setUnassignedCreatedDate(selectedDate);
                            setIsCreateUnassignedModalOpen(true);
                          }}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-2.5 py-1 rounded-md flex items-center gap-1 shadow-2xs transition-colors shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>เพิ่มรายการรอจัดสาย</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleOpenMultiAddDrawer}
                          className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs px-2.5 py-1 rounded-md flex items-center gap-1 shadow-2xs transition-colors shrink-0"
                        >
                          <ListPlus className="w-3.5 h-3.5" />
                          <span>เพิ่มหลายรายการ</span>
                        </button>

                        <label
                          className={`bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-2.5 py-1 rounded-md flex items-center gap-1 shadow-2xs transition-colors shrink-0 ${
                            isParsingExcel || importingExcelStops
                              ? "opacity-70 cursor-not-allowed pointer-events-none"
                              : "cursor-pointer"
                          }`}
                        >
                          {isParsingExcel || importingExcelStops ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                              <span>กำลังนำเข้า...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>Import Excel</span>
                            </>
                          )}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            disabled={isParsingExcel || importingExcelStops}
                            onChange={handleExcelFileUpload}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={handleDownloadSampleExcel}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-2.5 py-1 rounded-md flex items-center gap-1 border border-slate-300 transition-colors shrink-0 cursor-pointer"
                          title="ดาวน์โหลดตัวอย่างไฟล์ Excel (.xlsx)"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                          <span>ดาวน์โหลดตัวอย่างไฟล์</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsDeliverySettingsDrawerOpen(true)}
                          className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-slate-300 shadow-2xs transition-colors shrink-0 cursor-pointer"
                          title="ตั้งค่าระยะเวลาส่งต่อรอบ และลำดับความสำคัญ"
                        >
                          <Settings className="w-3.5 h-3.5 text-slate-600" />
                          <span>ตั้งค่าการคำนวณเส้นทาง</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (unassignedStops.length === 0) {
                              showError("ไม่พบรายการรอจัดสายเพื่อคำนวณเส้นทาง");
                              return;
                            }
                            setIsAutoRouteDrawerOpen(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1 rounded-md flex items-center gap-1.5 shadow-2xs transition-all hover:scale-105 shrink-0"
                        >
                          <Calculator className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                          <span>คำนวณเส้นทาง</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (unassignedStops.length === 0) {
                              showError(
                                "ไม่มีรายการยังไม่จัดสายในวันที่เลือกเพื่อล้างข้อมูล",
                              );
                              return;
                            }
                            setIsConfirmClearUnassignedModalOpen(true);
                          }}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs px-2.5 py-1 rounded-md flex items-center gap-1 border border-rose-200 shadow-2xs transition-colors shrink-0 cursor-pointer ml-1"
                          title={`ล้างรายการสินค้ายังไม่จัดสายของวันที่ ${selectedDate} ทั้งหมด`}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>ล้างข้อมูล ({unassignedStops.length})</span>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Column Visibility Customizer & Search Store in Table */}
                  <div className="flex items-center gap-2">
                    <ColumnToggleDropdown
                      columns={routeTableColumns}
                      visibleColumns={visibleColumns}
                      onChange={handleColumnChange}
                    />

                    <div className="relative w-44 sm:w-56">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1.5" />
                      <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="ค้นหาร้านค้า / ออเดอร์ / ที่อยู่..."
                        className="w-full bg-white border border-slate-200 rounded-md pl-7 pr-2 py-1 text-[11px] focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Single Unified Table for Assigned and Unassigned Stops */}
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-[11px] min-w-[1300px] border-collapse whitespace-nowrap text-slate-700">
                  <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-xs font-bold text-slate-700 border-b border-slate-200 shadow-2xs z-10">
                    <tr className="text-left text-[11px] text-slate-700 font-semibold uppercase tracking-wider">
                      {visibleColumns.status !== false && (
                        <th className="px-2.5 py-1 w-28">สถานะ</th>
                      )}
                      {visibleColumns.order_no !== false && (
                        <th className="px-2.5 py-1 w-28">รหัสออเดอร์</th>
                      )}
                      {visibleColumns.store_info !== false && (
                        <th className="px-2.5 py-1 min-w-[200px]">
                          ที่ตั้ง / ร้านค้า
                        </th>
                      )}
                      {visibleColumns.route_vehicle !== false && (
                        <th className="px-2.5 py-1 w-32">สายรถ / ทะเบียน</th>
                      )}
                      {visibleColumns.priority !== false && (
                        <th className="px-2.5 py-1 w-20">ลำดับความสำคัญ</th>
                      )}
                      {visibleColumns.drop_point !== false && (
                        <th className="px-2.5 py-1 text-center w-24">จุดวาง</th>
                      )}
                      {visibleColumns.scheduled_time !== false && (
                        <th className="px-2.5 py-1 w-24">กำหนดเวลาไว้ที่</th>
                      )}
                      {visibleColumns.start_service !== false && (
                        <th className="px-2.5 py-1 w-36">เริ่มบริการ</th>
                      )}
                      {visibleColumns.end_service !== false && (
                        <th className="px-2.5 py-1 w-36">สิ้นสุดบริการ</th>
                      )}
                      {visibleColumns.actual_duration !== false && (
                        <th className="px-2.5 py-1 w-24">ระยะเวลาจริง</th>
                      )}
                      {visibleColumns.tax !== false && (
                        <th className="px-2.5 py-1 w-24">ใบกำกับภาษี</th>
                      )}
                      {visibleColumns.note !== false && (
                        <th className="px-2.5 py-1 w-24">หมายเหตุ</th>
                      )}
                      {loadingTypesList.map(
                        (lt) =>
                          visibleColumns[
                            `loading_type_${lt.loading_type_id}`
                          ] !== false && (
                            <th
                              key={lt.loading_type_id}
                              className="px-2.5 py-1 text-center w-20"
                            >
                              {lt.type_name}
                            </th>
                          ),
                      )}
                      {visibleColumns.total_quantity !== false && (
                        <th className="px-2.5 py-1 text-center w-24">
                          จำนวนทั้งหมด
                        </th>
                      )}
                      {visibleColumns.actions !== false && (
                        <th className="px-2.5 py-1 text-right w-16 sticky top-0 right-0 bg-white z-10">
                          จัดการ
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assignedTab === "unassigned" ? (
                      unassignedStops.length === 0 ? (
                        <tr>
                          <td
                            colSpan={visibleColumnCount}
                            className="text-center py-6 text-slate-400"
                          >
                            <Package className="w-7 h-7 mx-auto mb-1 text-slate-300" />
                            <div>ไม่มีรายการรอจัดสาย</div>
                          </td>
                        </tr>
                      ) : (
                        unassignedStops
                          .filter((stop) => {
                            if (!searchText.trim()) return true;
                            const q = searchText.trim().toLowerCase();
                            return (
                              (stop.storeName &&
                                stop.storeName.toLowerCase().includes(q)) ||
                              (stop.store_id &&
                                String(stop.store_id)
                                  .toLowerCase()
                                  .includes(q)) ||
                              (stop.address &&
                                stop.address.toLowerCase().includes(q)) ||
                              (stop.orderNo &&
                                stop.orderNo.toLowerCase().includes(q))
                            );
                          })
                          .map((stop, idx) => (
                            <tr
                              key={stop.list_id}
                              className="hover:bg-amber-50/50 transition-colors whitespace-nowrap"
                            >
                              {/* 1. สถานะ */}
                              {visibleColumns.status !== false && (
                                <td className="px-2.5 py-1">
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <div className="w-3.5 h-3.5 rounded-full text-white text-[8px] font-bold flex items-center justify-center shrink-0 shadow-2xs bg-slate-400">
                                      {idx + 1}
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full inline-block bg-slate-100 text-slate-600 border border-slate-200">
                                      รอจัดสาย
                                    </span>
                                  </div>
                                </td>
                              )}

                              {/* 2. รหัสออเดอร์ */}
                              {visibleColumns.order_no !== false && (
                                <td className="px-2.5 py-1 font-mono font-bold text-slate-800">
                                  {stop.orderNo || stop.locationNo || "-"}
                                </td>
                              )}

                              {/* 3. ที่ตั้ง / ร้านค้า */}
                              {visibleColumns.store_info !== false && (
                                <td className="px-2.5 py-1">
                                  {(stop.is_store_closed ||
                                    stop.is_closed_today) && (
                                    <span
                                      className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200 shrink-0 shadow-2xs mr-1.5 animate-pulse"
                                      title={`ร้านค้าปิดทำการในวันเลือกจัดส่ง (${selectedDate})`}
                                    >
                                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                      ร้านปิดวันนี้
                                    </span>
                                  )}
                                  <span className="font-semibold text-slate-900">
                                    {stop.storeName}
                                  </span>
                                  {stop.address && (
                                    <span className="text-[10px] text-slate-500 font-normal ml-1">
                                      ({stop.address})
                                    </span>
                                  )}
                                </td>
                              )}

                              {/* 4. สายรถ / ทะเบียน */}
                              {visibleColumns.route_vehicle !== false && (
                                <td className="px-2.5 py-1 text-slate-400 font-mono">
                                  -
                                </td>
                              )}

                              {/* 5. ลำดับความสำคัญ */}
                              {visibleColumns.priority !== false && (
                                <td className="px-2.5 py-1">
                                  {getPriorityBadge(stop.priority)}
                                </td>
                              )}

                              {/* 6. จุดวาง */}
                              {visibleColumns.drop_point !== false && (
                                <td className="px-2.5 py-1 text-center font-mono font-bold">
                                  {renderPositionBadge(
                                    stop,
                                    positionProductsList,
                                  ) || (
                                    <span className="text-slate-400 font-normal">
                                      -
                                    </span>
                                  )}
                                </td>
                              )}

                              {/* 7. กำหนดเวลาไว้ที่ */}
                              {visibleColumns.scheduled_time !== false && (
                                <td className="px-2.5 py-1 text-slate-400 font-mono">
                                  -
                                </td>
                              )}

                              {/* 8. เริ่มบริการ */}
                              {visibleColumns.start_service !== false && (
                                <td className="px-2.5 py-1 text-slate-400 font-mono">
                                  -
                                </td>
                              )}

                              {/* 9. สิ้นสุดบริการ */}
                              {visibleColumns.end_service !== false && (
                                <td className="px-2.5 py-1 text-slate-400 font-mono">
                                  -
                                </td>
                              )}

                              {/* 10. ระยะเวลาจริง */}
                              {visibleColumns.actual_duration !== false && (
                                <td className="px-2.5 py-1 text-slate-400 font-mono">
                                  -
                                </td>
                              )}

                              {/* 11. ใบกำกับภาษี */}
                              {visibleColumns.tax !== false && (
                                <td className="px-2.5 py-1 text-center font-bold">
                                  {isTaxActive(stop.tax) ? (
                                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-2xs">
                                      มี
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 font-normal">
                                      -
                                    </span>
                                  )}
                                </td>
                              )}

                              {/* 12. หมายเหตุ */}
                              {visibleColumns.note !== false && (
                                <td className="px-2.5 py-1 text-slate-800 font-bold">
                                  {stop.note || "-"}
                                </td>
                              )}

                              {/* 13. Dynamic Cargo Loading Type Cells */}
                              {loadingTypesList.map((lt) => {
                                if (
                                  visibleColumns[
                                    `loading_type_${lt.loading_type_id}`
                                  ] === false
                                )
                                  return null;
                                const loadObj = Array.isArray(stop.loads)
                                  ? stop.loads.find(
                                      (l: any) =>
                                        Number(l.loading_type_id) ===
                                        Number(lt.loading_type_id),
                                    )
                                  : null;
                                const qty = loadObj ? loadObj.quantity : 0;
                                return (
                                  <td
                                    key={lt.loading_type_id}
                                    className="px-2.5 py-1 text-center font-bold text-amber-700 font-mono"
                                  >
                                    {qty > 0 ? qty : "-"}
                                  </td>
                                );
                              })}

                              {/* 14. จำนวนทั้งหมด */}
                              {visibleColumns.total_quantity !== false && (
                                <td className="px-2.5 py-1 text-center font-mono font-bold text-amber-700">
                                  {stop.sum_quantity ?? stop.quantity ?? 0}
                                </td>
                              )}

                              {/* 15. การดำเนินการ */}
                              {visibleColumns.actions !== false && (
                                <td className="px-2.5 py-1 text-right sticky right-0 bg-white z-10">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleOpenEditUnassignedStopDrawer(stop)
                                      }
                                      className="p-0.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                      title="แก้ไขรายการ"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setStopToDelete(stop)}
                                      className="p-0.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                      title="ลบรายการ"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))
                      )
                    ) : tableStops.length === 0 ? (
                      <tr>
                        <td
                          colSpan={visibleColumnCount}
                          className="text-center py-6 text-slate-400"
                        >
                          <Package className="w-5 h-5 mx-auto mb-1 text-slate-300" />
                          ไม่พบรายการจัดส่ง
                        </td>
                      </tr>
                    ) : (
                      tableStops.map((stop, idx) => {
                        const sc = getStatusColor(stop.status);
                        const isDepot = stop.type === "depot";
                        const ed = getEarlyDelayBadge(
                          stop.scheduled_time,
                          stop.start_service_time,
                        );
                        const edEnd = getEarlyDelayBadge(
                          stop.scheduled_time,
                          stop.end_service_time,
                        );
                        const actualDur = getActualDurationText(
                          stop.start_service_time,
                          stop.end_service_time,
                        );

                        return (
                          <tr
                            key={`tablestop-${stop.stopId}-${idx}`}
                            onClick={() => handleSelectStopRow(stop)}
                            className="hover:bg-blue-50/50 cursor-pointer transition-colors whitespace-nowrap"
                          >
                            {/* 1. สถานะ */}
                            {visibleColumns.status !== false && (
                              <td className="px-2.5 py-1">
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <div
                                    className="w-3.5 h-3.5 rounded-full text-white text-[8px] font-bold flex items-center justify-center shrink-0 shadow-2xs"
                                    style={{ background: stop.routeColor }}
                                  >
                                    {isDepot
                                      ? "★"
                                      : (stop.rowOrder ??
                                        stop.row_order ??
                                        idx + 1)}
                                  </div>
                                  <span
                                    className="text-[10px] font-bold px-2 py-0.2 rounded-full inline-block"
                                    style={{
                                      background: sc.bg,
                                      color: sc.text,
                                    }}
                                  >
                                    {getStatusLabel(stop.status)}
                                  </span>
                                </div>
                              </td>
                            )}

                            {/* 2. รหัสออเดอร์ */}
                            {visibleColumns.order_no !== false && (
                              <td className="px-2.5 py-1 font-mono font-bold text-slate-800">
                                {stop.orderNo || stop.locationNo || "-"}
                              </td>
                            )}

                            {/* 3. ที่ตั้ง / ร้านค้า */}
                            {visibleColumns.store_info !== false && (
                              <td className="px-2.5 py-1">
                                {(stop.is_store_closed ||
                                  stop.is_closed_today) && (
                                  <span
                                    className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200 shrink-0 shadow-2xs mr-1.5 animate-pulse"
                                    title={`ร้านค้าปิดทำการในวันเลือกจัดส่ง (${selectedDate})`}
                                  >
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                    ร้านปิดวันนี้
                                  </span>
                                )}
                                <span className="font-semibold text-slate-900">
                                  {stop.storeName}
                                </span>
                                {stop.address && (
                                  <span className="text-[10px] text-slate-500 font-normal ml-1">
                                    ({stop.address})
                                  </span>
                                )}
                              </td>
                            )}

                            {/* 4. สายรถ / ทะเบียน */}
                            {visibleColumns.route_vehicle !== false && (
                              <td className="px-2.5 py-1">
                                <span className="font-medium text-slate-800 text-[11px]">
                                  {stop.routeDriverName}
                                </span>
                                {stop.routeVehicle && (
                                  <span className="text-[10px] font-mono text-slate-500 ml-1">
                                    [{stop.routeVehicle}]
                                  </span>
                                )}
                              </td>
                            )}

                            {/* 5. ลำดับความสำคัญ */}
                            {visibleColumns.priority !== false && (
                              <td className="px-2.5 py-1">
                                {getPriorityBadge(stop.priority)}
                              </td>
                            )}

                            {/* 6. จุดวาง */}
                            {visibleColumns.drop_point !== false && (
                              <td className="px-2.5 py-1 text-center font-mono font-bold">
                                {renderPositionBadge(
                                  stop,
                                  positionProductsList,
                                ) || (
                                  <span className="text-slate-400 font-normal">
                                    -
                                  </span>
                                )}
                              </td>
                            )}

                            {/* 7. กำหนดเวลาไว้ที่ (Scheduled ETA) */}
                            {visibleColumns.scheduled_time !== false && (
                              <td className="px-2.5 py-1 font-mono font-bold text-slate-700">
                                {ed?.scheduledText ||
                                  stop.scheduled_time?.slice(0, 5) ||
                                  "-"}
                              </td>
                            )}

                            {/* 8. เริ่มบริการ (Start Service + Early/Delay) */}
                            {visibleColumns.start_service !== false && (
                              <td className="px-2.5 py-1 font-mono">
                                {ed?.startText ? (
                                  <div className="flex items-center gap-1">
                                    <span className="font-bold text-slate-800">
                                      {ed.startText}
                                    </span>
                                    {ed.earlyDelayText && (
                                      <span
                                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                          ed.isEarly
                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                            : "bg-amber-50 text-amber-700 border border-amber-200"
                                        }`}
                                      >
                                        {ed.earlyDelayText}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                            )}

                            {/* 9. สิ้นสุดบริการ (End Service + Early/Delay) */}
                            {visibleColumns.end_service !== false && (
                              <td className="px-2.5 py-1 font-mono">
                                {edEnd?.startText ? (
                                  <div className="flex items-center gap-1">
                                    <span className="font-bold text-slate-800">
                                      {edEnd.startText}
                                    </span>
                                    {edEnd.earlyDelayText && (
                                      <span
                                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                          edEnd.isEarly
                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                            : "bg-amber-50 text-amber-700 border border-amber-200"
                                        }`}
                                      >
                                        {edEnd.earlyDelayText}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                            )}

                            {/* 10. ระยะเวลาจริง */}
                            {visibleColumns.actual_duration !== false && (
                              <td className="px-2.5 py-1 font-mono text-slate-700 font-bold">
                                {actualDur}
                              </td>
                            )}

                            {/* 11. ใบกำกับภาษี */}
                            {visibleColumns.tax !== false && (
                              <td className="px-2.5 py-1 text-center font-bold">
                                {isTaxActive(stop.tax) ? (
                                  <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-2xs">
                                    มี
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-normal">
                                    -
                                  </span>
                                )}
                              </td>
                            )}

                            {/* 12. หมายเหตุ */}
                            {visibleColumns.note !== false && (
                              <td className="px-2.5 py-1 text-slate-800 font-bold">
                                {stop.note || "-"}
                              </td>
                            )}

                            {/* 13. Dynamic Cargo Loading Type Cells */}
                            {loadingTypesList.map((lt) => {
                              if (
                                visibleColumns[
                                  `loading_type_${lt.loading_type_id}`
                                ] === false
                              )
                                return null;
                              const loadObj = Array.isArray(stop.loads)
                                ? stop.loads.find(
                                    (l: any) =>
                                      Number(l.loading_type_id) ===
                                      Number(lt.loading_type_id),
                                  )
                                : null;
                              const qty = isDepot
                                ? 0
                                : loadObj
                                  ? loadObj.quantity
                                  : 0;
                              return (
                                <td
                                  key={lt.loading_type_id}
                                  className="px-2.5 py-1 text-center font-bold text-amber-800 font-mono"
                                >
                                  {qty > 0 ? qty : "-"}
                                </td>
                              );
                            })}

                            {/* 13. จำนวนทั้งหมด */}
                            {visibleColumns.total_quantity !== false && (
                              <td className="px-2.5 py-1 text-center font-mono font-bold text-amber-800">
                                {isDepot
                                  ? "-"
                                  : (stop.quantity ?? stop.sum_quantity ?? 1)}
                              </td>
                            )}

                            {/* 14. จัดการ */}
                            {visibleColumns.actions !== false && (
                              <td className="px-2.5 py-1 text-right sticky right-0 bg-white z-10">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenEditStopDrawer(stop);
                                    }}
                                    className="p-0.5 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                    title="แก้ไขรายการ"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setStopToDelete(stop);
                                    }}
                                    className="p-0.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                    title="ลบรายการ"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })
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
        isSubmitting={creatingGroup}
        isDirty={!!(newGroupName || selectedCarId)}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              ชื่อกลุ่มสายจัดส่ง <span className="text-rose-500">*</span>
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

          <SearchableSelect
            label="เลือกรถที่ใช้จัดส่ง"
            value={selectedCarId}
            onChange={(val) => setSelectedCarId(String(val))}
            placeholder="-- ไม่ระบุรถขนส่ง (เลือกทีหลังได้) --"
            searchPlaceholder="พิมพ์ค้นหารถ (ทะเบียน / แบรนด์ / รุ่น)..."
            options={vehiclesList.map((v) => ({
              value: String(v.car_id),
              label: `${v.license_plate} ${v.brand ? `(${v.brand}${v.model ? ` ${v.model}` : ""})` : ""}`,
              badge: v.car_code || String(v.car_id).slice(0, 8),
            }))}
          />

          <div>
            <label className="block text-slate-700 font-semibold mb-2">
              เลือกสีสายจัดส่ง
            </label>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {[
                "#3b82f6",
                "#10b981",
                "#f59e0b",
                "#ef4444",
                "#8b5cf6",
                "#ec4899",
                "#06b6d4",
                "#64748b",
              ].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewGroupColor(c)}
                  className={`w-7 h-7 rounded-full transition-all border-2 ${
                    newGroupColor === c
                      ? "border-slate-900 scale-110 shadow-sm"
                      : "border-white hover:scale-105"
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
        title="เพิ่มรายการจุดจัดส่งสินค้าใหม่"
        formId="create-stop-form"
        onSubmit={handleCreateStop}
        submitLabel={creatingStop ? "กำลังบันทึก..." : "บันทึกรายการจัดส่ง"}
        isSubmitting={creatingStop}
        isDirty={!!(formStopStoreName || formStopAddress || formStopLatLong)}
      >
        <div className="space-y-4 text-xs">
          <SearchableSelect
            label="เลือกสายจัดส่ง"
            required
            value={formStopGroupId}
            onChange={(val) => setFormStopGroupId(val)}
            placeholder="-- เลือกสายจัดส่ง --"
            searchPlaceholder="พิมพ์ค้นหาสายรถ (ชื่อ / ทะเบียน / ID)..."
            options={routes.map((r) => ({
              value: r.groupStoreId || r.routeId.replace("ROUTE-", ""),
              label: r.driverName,
              badge:
                r.vehiclePlate && r.vehiclePlate !== "-"
                  ? r.vehiclePlate
                  : undefined,
              colorDot: r.color,
            }))}
          />

          {/* Cargo Loading Types Breakdown Input Section - Table List with White Background */}
          {loadingTypesList.length > 0 && (
            <div className="space-y-1.5 bg-white rounded-xl shadow-2xs">
              <div className="flex items-center justify-between text-slate-800 font-bold mb-1">
                <span className="flex items-center gap-1.5 text-slate-800 text-xs">
                  <Package className="w-4 h-4 text-blue-600" />
                  จำนวนประเภทของการโหลด
                </span>
                <span className="text-[11px] text-blue-700 font-mono bg-blue-50 px-2.5 py-0.5 rounded-full font-bold border border-blue-200">
                  รวม:{" "}
                  {Object.values(formStopLoads).reduce(
                    (a, b) => (Number(a) || 0) + (Number(b) || 0),
                    0,
                  )}{" "}
                  ชิ้น
                </span>
              </div>
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                    <tr>
                      <th className="px-3 py-1.5 w-10 text-center">#</th>
                      <th className="px-3 py-1.5">ประเภทการโหลด</th>
                      <th className="px-3 py-1.5 w-24 text-center">หน่วยนับ</th>
                      <th className="px-3 py-1.5 w-28 text-right">จำนวน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {loadingTypesList.map((lt, idx) => (
                      <tr
                        key={lt.loading_type_id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-3 py-1 text-center font-mono text-slate-400 text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-1 font-bold text-slate-800">
                          {lt.type_name}
                        </td>
                        <td className="px-3 py-1 text-center font-mono text-slate-500 text-[11px]">
                          {lt.unit_name || "ชิ้น"}
                        </td>
                        <td className="px-3 py-1 text-right">
                          <input
                            type="number"
                            min={0}
                            value={formStopLoads[lt.loading_type_id] || 0}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 0;
                              setFormStopLoads((prev) => ({
                                ...prev,
                                [lt.loading_type_id]: val,
                              }));
                            }}
                            className="w-20 border border-slate-300 rounded px-2 py-1 text-right font-bold text-slate-900 bg-white focus:outline-none focus:border-blue-500 font-mono text-xs"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                ลำดับจัดส่ง <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={formStopRowOrder}
                onChange={(e) =>
                  setFormStopRowOrder(parseInt(e.target.value, 10) || 1)
                }
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                จำนวนสินค้า (กล่อง/ชิ้น){" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={
                  Object.values(formStopLoads).reduce(
                    (a, b) => (Number(a) || 0) + (Number(b) || 0),
                    0,
                  ) > 0
                    ? Object.values(formStopLoads).reduce(
                        (a, b) => (Number(a) || 0) + (Number(b) || 0),
                        0,
                      )
                    : formStopQuantity
                }
                onChange={(e) =>
                  setFormStopQuantity(parseInt(e.target.value, 10) || 1)
                }
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-semibold"
                required
              />
            </div>
          </div>

          {/* ตำแหน่งวางสินค้า & แถวที่ 1-10 */}
          <SearchableSelect
            label="เลือกตำแหน่งวางสินค้า"
            required
            value={formStopPositionProductId}
            onChange={(val) => setFormStopPositionProductId(val)}
            placeholder="-- เลือกตำแหน่งวางสินค้า --"
            searchPlaceholder="พิมพ์ค้นหาตำแหน่งวางสินค้า.."
            options={masterPositionProductSearchableOptions}
          />

          {/* ตำแหน่งวางสินค้า & แถวที่ 1-10 */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              แถวที่ (1-10)
            </label>
            <select
              value={formStopPositionOrder}
              onChange={(e) =>
                setFormStopPositionOrder(parseInt(e.target.value, 10) || 1)
              }
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-semibold font-mono"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>
                  แถว {num}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              รหัสออเดอร์ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formStopOrderNo}
              onChange={(e) => setFormStopOrderNo(e.target.value)}
              placeholder="เช่น ORD-2026-001"
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-mono font-bold"
              required
            />
          </div>

          <div>
            <label className="flex text-slate-700 font-semibold mb-1 items-center justify-between">
              <span>เวลาจัดส่งที่กำหนด</span>
              {previousStopInGroup?.scheduled_time && (
                <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  จุดก่อนหน้า:{" "}
                  {String(previousStopInGroup.scheduled_time).slice(0, 5)} น.
                </span>
              )}
            </label>
            <input
              type="time"
              value={formStopScheduledTime}
              onChange={(e) => setFormStopScheduledTime(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-mono font-bold"
              required
            />
            {previousStopInGroup?.scheduled_time ? (
              <p className="text-[11px] text-amber-600 mt-2 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> *เงื่อนไข:*
                เวลาที่กรอกต้องมากกว่าเวลาจุดจัดส่งก่อนหน้าในกรุ๊ปนี้ (
                {String(previousStopInGroup.scheduled_time).slice(0, 5)} น.)
              </p>
            ) : (
              <p className="text-[10px] text-slate-500 mt-1">
                ระบุเวลาจัดส่งที่ต้องการ (เช่น 09:30)
              </p>
            )}
          </div>

          <SearchableSelect
            label="ลำดับความสำคัญ"
            value={formStopPriority}
            onChange={(val) => setFormStopPriority(String(val))}
            placeholder="-- เลือกลำดับความสำคัญ --"
            options={[
              {
                value: "high",
                label: "สูง",
                badge: "ด่วนที่สุด",
              },
              {
                value: "medium",
                label: "กลาง",
                badge: "ปกติ",
              },
              { value: "low", label: "ต่ำ", badge: "ไม่รีบ" },
            ]}
            required
          />

          <SearchableSelect
            label="เลือกร้านค้าจากมาสเตอร์"
            value={selectedMasterStoreId}
            onChange={(val) => handleSelectMasterStore(String(val))}
            placeholder="-- เลือกร้านค้าจากมาสเตอร์ --"
            searchPlaceholder="พิมพ์ค้นหาร้านค้า (ชื่อ / รหัส)..."
            options={storesList.map((s) => ({
              value: String(s.store_id),
              label: s.store_name,
              badge: String(s.store_id),
            }))}
            required
          />

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              รหัสลูกค้า / ร้านค้า <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formStopStoreId}
              onChange={(e) => setFormStopStoreId(e.target.value)}
              placeholder="เช่น ST-0001 (เว้นว่างไว้ถ้าระบบสร้างให้อัตโนมัติ)"
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-mono"
              required
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
              พิกัด GPS (ละติจูด, ลองจิจูด){" "}
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formStopLatLong}
              onChange={(e) => setFormStopLatLong(e.target.value)}
              placeholder="เช่น 13.7563, 100.5018"
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-mono"
              required
            />
          </div>

          <div className="rounded-lg flex items-center gap-2">
            <input
              type="checkbox"
              checked={formStopTax}
              onChange={(e) => setFormStopTax(e.target.checked)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label className="block text-slate-700 font-semibold">
              ใบกำกับภาษี
            </label>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              หมายเหตุ
            </label>
            <textarea
              rows={2}
              value={formStopNote}
              onChange={(e) => setFormStopNote(e.target.value)}
              placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)"
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400"
            />
          </div>
        </div>
      </AnimatedDrawer>

      {/* ─── EDIT STOP DRAWER ─── */}
      <AnimatedDrawer
        isOpen={isEditStopDrawerOpen}
        onClose={() => setIsEditStopDrawerOpen(false)}
        title="แก้ไขรายการจุดจัดส่ง"
        formId="edit-stop-form"
        onSubmit={handleSaveEditStop}
        submitLabel={updatingStop ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
        isSubmitting={updatingStop}
      >
        <div className="space-y-4 text-xs">
          <SearchableSelect
            label="เลือกสายจัดส่ง"
            value={editFormGroupId}
            onChange={(val) => setEditFormGroupId(val)}
            placeholder="-- ยังไม่จัดสาย --"
            searchPlaceholder="พิมพ์ค้นหาสายรถ (ชื่อ / ทะเบียน / ID)..."
            options={[
              { value: "", label: "-- ยังไม่จัดสาย --" },
              ...routes.map((r) => ({
                value: r.groupStoreId || r.routeId.replace("ROUTE-", ""),
                label: r.driverName,
                badge:
                  r.vehiclePlate && r.vehiclePlate !== "-"
                    ? r.vehiclePlate
                    : undefined,
                colorDot: r.color,
              })),
            ]}
          />

          {/* Cargo Loading Types Breakdown Input Section - Table List with White Background */}
          {loadingTypesList.length > 0 && (
            <div className="space-y-1.5 bg-white rounded-xl shadow-2xs">
              <div className="flex items-center justify-between text-slate-800 font-bold mb-1">
                <span className="flex items-center gap-1.5 text-slate-800 text-xs">
                  <Package className="w-4 h-4 text-blue-600" />
                  จำนวนประเภทของการโหลด
                </span>
                <span className="text-[11px] text-blue-700 font-mono bg-blue-50 px-2.5 py-0.5 rounded-full font-bold border border-blue-200">
                  รวม:{" "}
                  {Object.values(editFormStopLoads).reduce(
                    (a, b) => (Number(a) || 0) + (Number(b) || 0),
                    0,
                  )}{" "}
                  ชิ้น
                </span>
              </div>
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                    <tr>
                      <th className="px-3 py-1.5 w-10 text-center">#</th>
                      <th className="px-3 py-1.5">ประเภทการโหลด</th>
                      <th className="px-3 py-1.5 w-24 text-center">หน่วยนับ</th>
                      <th className="px-3 py-1.5 w-28 text-right">จำนวน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {loadingTypesList.map((lt, idx) => (
                      <tr
                        key={lt.loading_type_id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-3 py-1 text-center font-mono text-slate-400 text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-1 font-bold text-slate-800">
                          {lt.type_name}
                        </td>
                        <td className="px-3 py-1 text-center font-mono text-slate-500 text-[11px]">
                          {lt.unit_name || "ชิ้น"}
                        </td>
                        <td className="px-3 py-1 text-right">
                          <input
                            type="number"
                            min={0}
                            value={editFormStopLoads[lt.loading_type_id] || 0}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 0;
                              setEditFormStopLoads((prev) => ({
                                ...prev,
                                [lt.loading_type_id]: val,
                              }));
                            }}
                            className="w-20 border border-slate-300 rounded px-2 py-1 text-right font-bold text-slate-900 bg-white focus:outline-none focus:border-blue-500 font-mono text-xs"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                ลำดับจัดส่ง <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={editFormRowOrder}
                onChange={(e) =>
                  setEditFormRowOrder(parseInt(e.target.value, 10) || 1)
                }
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                จำนวนสินค้ารวม <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={editFormQuantity}
                onChange={(e) =>
                  setEditFormQuantity(parseInt(e.target.value, 10) || 1)
                }
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-semibold"
                required
              />
            </div>
          </div>

          {/* ตำแหน่งวางสินค้า & แถวที่ 1-10 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                ตำแหน่งวางสินค้า
              </label>
              <select
                value={editFormPositionProductId}
                onChange={(e) => setEditFormPositionProductId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-semibold"
              >
                <option value="">-- เลือกตำแหน่งวาง --</option>
                {positionProductsList.map((pos) => (
                  <option
                    key={pos.position_product_id}
                    value={pos.position_product_id}
                  >
                    {pos.position_product_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                แถวที่ (1-10)
              </label>
              <select
                value={editFormPositionOrder}
                onChange={(e) =>
                  setEditFormPositionOrder(parseInt(e.target.value, 10) || 1)
                }
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-semibold font-mono"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>
                    แถว {num}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              รหัสออเดอร์ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={editFormOrderNo}
              onChange={(e) => setEditFormOrderNo(e.target.value)}
              placeholder="เช่น ORD-2026-001"
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-mono font-bold"
              required
            />
          </div>

          <div>
            <label className="flex text-slate-700 font-semibold mb-1 items-center justify-between">
              <span>เวลาจัดส่งที่กำหนด</span>
              {previousStopInGroup?.scheduled_time && (
                <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  จุดก่อนหน้า:{" "}
                  {String(previousStopInGroup.scheduled_time).slice(0, 5)} น.
                </span>
              )}
            </label>
            <input
              type="time"
              value={editFormStopScheduledTime}
              onChange={(e) => setEditFormStopScheduledTime(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-mono font-bold"
              required
            />
            {previousStopInGroup?.scheduled_time ? (
              <p className="text-[10px] text-amber-600 mt-1 font-medium">
                ⚠️ *เงื่อนไข:*
                เวลาที่กรอกต้องมากกว่าเวลาจุดจัดส่งก่อนหน้าในกรุ๊ปนี้ (
                {String(previousStopInGroup.scheduled_time).slice(0, 5)} น.)
              </p>
            ) : (
              <p className="text-[10px] text-slate-500 mt-1">
                ระบุเวลาจัดส่งที่ต้องการ (เช่น 09:30)
              </p>
            )}
          </div>

          <SearchableSelect
            label="ลำดับความสำคัญ"
            value={editFormStopPriority}
            onChange={(val) => setEditFormStopPriority(String(val))}
            placeholder="-- เลือกลำดับความสำคัญ --"
            options={[
              {
                value: "high",
                label: "สูง",
                badge: "ด่วนที่สุด",
              },
              {
                value: "medium",
                label: "กลาง",
                badge: "ปกติ",
              },
              { value: "low", label: "ต่ำ", badge: "ไม่รีบ" },
            ]}
            required
          />

          <SearchableSelect
            label="เลือกร้านค้าจากมาสเตอร์"
            value={editFormStoreId}
            onChange={(val) => handleSelectEditMasterStore(String(val))}
            placeholder="-- เลือกร้านค้าจากมาสเตอร์ --"
            searchPlaceholder="พิมพ์ค้นหาร้านค้า (ชื่อ / รหัส)..."
            options={storesList.map((s) => ({
              value: String(s.store_id),
              label: s.store_name,
              badge: String(s.store_id),
            }))}
            required
          />

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              รหัสลูกค้า / ร้านค้า
            </label>
            <input
              type="text"
              value={editFormStoreId}
              onChange={(e) => setEditFormStoreId(e.target.value)}
              placeholder="เช่น ST-0001 (เว้นว่างไว้ถ้าระบบสร้างให้อัตโนมัติ)"
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              ชื่อลูกค้า / ร้านค้า <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={editFormStoreName}
              onChange={(e) => setEditFormStoreName(e.target.value)}
              placeholder="เช่น บริษัท สยามพัฒนา จำกัด"
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
              value={editFormAddress}
              onChange={(e) => setEditFormAddress(e.target.value)}
              placeholder="ที่อยู่จัดส่ง..."
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              พิกัด GPS (ละติจูด, ลองจิจูด){" "}
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={editFormLatLong}
              onChange={(e) => setEditFormLatLong(e.target.value)}
              placeholder="เช่น 13.7563, 100.5018"
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-mono"
              required
            />
          </div>

          <SearchableSelect
            label="สถานะจุดจัดส่ง"
            value={editFormStatus}
            onChange={(val) => setEditFormStatus(String(val))}
            placeholder="-- เลือกสถานะจุดจัดส่ง --"
            options={[
              {
                value: "unassigned",
                label: "ยังไม่จัดสาย",
                colorDot: "#94a3b8",
              },
              {
                value: "in_progress",
                label: "รอดำเนินการ",
                colorDot: "#eab308",
              },
              {
                value: "completed",
                label: "สำเร็จ",
                colorDot: "#22c55e",
              },
              { value: "problem", label: "ติดปัญหา", colorDot: "#f43f5e" },
            ]}
          />

          <div className="rounded-lg flex items-center gap-2">
            <input
              type="checkbox"
              checked={editFormStopTax}
              onChange={(e) => setEditFormStopTax(e.target.checked)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label className="block text-slate-700 font-semibold">
              ใบกำกับภาษี
            </label>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              หมายเหตุ
            </label>
            <textarea
              rows={2}
              value={editFormStopNote}
              onChange={(e) => setEditFormStopNote(e.target.value)}
              placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)"
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400"
            />
          </div>
        </div>
      </AnimatedDrawer>

      {/* ─── DELETE STOP CONFIRM MODAL ─── */}
      <ConfirmModal
        isOpen={!!stopToDelete}
        title="ยืนยันการลบรายการจุดจัดส่ง"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบรายการจุดจัดส่ง "${stopToDelete?.storeName}" (ออเดอร์: ${stopToDelete?.data_store_no || stopToDelete?.orderNo || "-"})?`}
        confirmText={deletingStop ? "กำลังลบ..." : "ลบรายการ"}
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDeleteStop}
        onCancel={() => setStopToDelete(null)}
        isLoading={deletingStop}
      />

      {/* ─── EDIT GROUP STORE DRAWER ─── */}
      <AnimatedDrawer
        isOpen={isEditGroupModalOpen}
        onClose={() => setIsEditGroupModalOpen(false)}
        title={`แก้ไขกลุ่มสายจัดส่ง (${editingGroup?.driverName || ""})`}
        formId="edit-group-store-form"
        onSubmit={handleSaveEditGroup}
        submitLabel={updatingGroup ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
        isSubmitting={updatingGroup}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              ชื่อกลุ่มสายจัดส่ง <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={editGroupName}
              onChange={(e) => setEditGroupName(e.target.value)}
              placeholder="เช่น Optimo Routes-005 หรือ สายจัดส่งโซนกทม."
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              วันที่จัดส่ง <span className="text-rose-500">*</span>
            </label>
            <CustomDatePicker
              value={editGroupDate}
              onChange={(val) => setEditGroupDate(val)}
              label=""
              showActiveOrdersToggle={false}
              className="w-full"
            />
          </div>

          <SearchableSelect
            label="เลือกรถที่ใช้จัดส่ง"
            value={editGroupCarId}
            onChange={(val) => setEditGroupCarId(String(val))}
            placeholder="-- ไม่ระบุรถขนส่ง (เลือกทีหลังได้) --"
            searchPlaceholder="พิมพ์ค้นหารถ (ทะเบียน / แบรนด์ / รุ่น)..."
            options={editVehicleOptions}
          />

          <div>
            <label className="block text-slate-700 font-semibold mb-2">
              เลือกสีสายจัดส่ง
            </label>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {[
                "#3b82f6",
                "#10b981",
                "#f59e0b",
                "#ef4444",
                "#8b5cf6",
                "#ec4899",
                "#06b6d4",
                "#64748b",
              ].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setEditGroupColor(c)}
                  className={`w-7 h-7 rounded-full transition-all border-2 ${
                    editGroupColor === c
                      ? "border-slate-900 scale-110 shadow-sm"
                      : "border-white hover:scale-105"
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium">
                รหัสสีกำหนดเอง:
              </span>
              <input
                type="text"
                value={editGroupColor}
                onChange={(e) => setEditGroupColor(e.target.value)}
                className="w-28 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </AnimatedDrawer>

      {/* ─── CREATE UNASSIGNED STOP MODAL ─── */}
      <AnimatedDrawer
        isOpen={isCreateUnassignedModalOpen}
        onClose={() => setIsCreateUnassignedModalOpen(false)}
        title="เพิ่มรายการจัดส่งใหม่ (รอจัดสาย)"
        formId="create-unassigned-stop-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setCreatingUnassigned(true);
          try {
            const loadsPayload = Object.entries(unassignedLoads)
              .map(([id, qty]) => ({
                loading_type_id: parseInt(id, 10),
                quantity: parseInt(String(qty), 10),
              }))
              .filter((item) => item.quantity > 0);

            const totalLoadsQty = loadsPayload.reduce(
              (sum, item) => sum + item.quantity,
              0,
            );
            const finalQuantity =
              totalLoadsQty > 0 ? totalLoadsQty : unassignedQuantity;

            const res = await api.post("/optimoroute/unassigned", {
              date: unassignedCreatedDate || selectedDate,
              store_id: unassignedStoreId,
              store_name: unassignedStoreName,
              address: unassignedAddress,
              sum_quantity: finalQuantity,
              lat_long: unassignedLatLong,
              data_store_no: unassignedOrderNo,
              priority: unassignedPriority,
              tax: unassignedTax ? 1 : 0,
              note: unassignedNote.trim() || undefined,
              position_product_id: unassignedPositionProductId || undefined,
              position_production_order: unassignedPositionOrder || 1,
              loads: loadsPayload,
            });
            if (res.data.success) {
              showSuccess(res.data.message || "สร้างรายการรอจัดสายสำเร็จ!");
              setIsCreateUnassignedModalOpen(false);
              setUnassignedStoreId("");
              setUnassignedStoreName("");
              setUnassignedAddress("");
              setUnassignedQuantity(1);
              setUnassignedLatLong("");
              setUnassignedOrderNo("");
              setUnassignedTax(false);
              setUnassignedNote("");
              setUnassignedLoads({});
              setUnassignedPositionProductId("");
              setUnassignedPositionOrder(1);
              fetchUnassignedStops(selectedDate);
            } else {
              showError(res.data.message || "สร้างรายการไม่สำเร็จ");
            }
          } catch (err: any) {
            showError(
              err?.response?.data?.message || "เกิดข้อผิดพลาดในการสร้างรายการ",
            );
          } finally {
            setCreatingUnassigned(false);
          }
        }}
        submitLabel={
          creatingUnassigned ? "กำลังบันทึก..." : "บันทึกรายการรอจัดสาย"
        }
        isSubmitting={creatingUnassigned}
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="block text-slate-700 font-semibold mb-1">
              เลือกวันที่ต้องการจัดส่ง <span className="text-rose-500">*</span>
            </label>
            <CustomDatePicker
              value={unassignedCreatedDate}
              onChange={(val) => setUnassignedCreatedDate(val)}
              label=""
              showActiveOrdersToggle={false}
              className="w-full "
            />
            <p className="text-[11px] text-slate-500 mt-1">
              วันที่กำหนดให้รถขนส่งวิ่ง ไม่เกี่ยวกับวันที่สั่งสินค้า
            </p>
          </div>

          <SearchableSelect
            label="ลำดับความสำคัญ"
            value={unassignedPriority}
            onChange={(val) => setUnassignedPriority(String(val))}
            placeholder="-- เลือกลำดับความสำคัญ --"
            options={[
              {
                value: "high",
                label: "สูง",
                badge: "ด่วนที่สุด",
              },
              {
                value: "medium",
                label: "กลาง",
                badge: "ปกติ",
              },
              { value: "low", label: "ต่ำ", badge: "ไม่รีบ" },
            ]}
            required
          />

          <SearchableSelect
            label="เลือกร้านค้า (มาสเตอร์)"
            value={unassignedStoreId}
            onChange={(val) => {
              const storeId = String(val);
              setUnassignedStoreId(storeId);
              const found = storesList.find(
                (s) => String(s.store_id) === storeId,
              );
              if (found) {
                setUnassignedStoreName(found.store_name);
                setUnassignedAddress(found.store_address || "");
                setUnassignedLatLong(found.store_location || "");
              }
            }}
            placeholder="-- ค้นหาร้านค้าจากมาสเตอร์ --"
            searchPlaceholder="พิมพ์รหัส หรือ ชื่อร้านค้า..."
            options={storesList.map((s) => ({
              value: String(s.store_id),
              label: `${s.store_name} (${s.store_id})`,
              badge: s.store_id,
            }))}
          />

          {/* Cargo Loading Types Breakdown Input Section - Table List with White Background */}
          {loadingTypesList.length > 0 && (
            <div className="space-y-1.5 bg-white shadow-2xs">
              <div className="flex items-center justify-between text-slate-800 font-bold mb-1">
                <span className="flex items-center gap-1.5 text-slate-800 text-xs">
                  <Package className="w-4 h-4 text-blue-600" />
                  จำนวนประเภทของการโหลด
                </span>
                <span className="text-[11px] text-blue-700 font-mono bg-blue-50 px-2.5 py-0.5 rounded-full font-bold border border-blue-200">
                  รวม:{" "}
                  {Object.values(unassignedLoads).reduce(
                    (a, b) => (Number(a) || 0) + (Number(b) || 0),
                    0,
                  )}{" "}
                  ชิ้น
                </span>
              </div>
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                    <tr>
                      <th className="px-3 py-1.5 w-10 text-center">#</th>
                      <th className="px-3 py-1.5">ประเภทการโหลด</th>
                      <th className="px-3 py-1.5 w-24 text-center">หน่วยนับ</th>
                      <th className="px-3 py-1.5 w-28 text-right">จำนวน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {loadingTypesList.map((lt, idx) => (
                      <tr
                        key={lt.loading_type_id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-3 py-1 text-center font-mono text-slate-400 text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-1 font-bold text-slate-800">
                          {lt.type_name}
                        </td>
                        <td className="px-3 py-1 text-center font-mono text-slate-500 text-[11px]">
                          {lt.unit_name || "ชิ้น"}
                        </td>
                        <td className="px-3 py-1 text-right">
                          <input
                            type="number"
                            min={0}
                            value={unassignedLoads[lt.loading_type_id] || 0}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 0;
                              setUnassignedLoads((prev) => ({
                                ...prev,
                                [lt.loading_type_id]: val,
                              }));
                            }}
                            className="w-20 border border-slate-300 rounded px-2 py-1 text-right font-bold text-slate-900 bg-white focus:outline-none focus:border-blue-500 font-mono text-xs"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                จำนวนสินค้ารวม <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={
                  Object.values(unassignedLoads).reduce(
                    (a, b) => (Number(a) || 0) + (Number(b) || 0),
                    0,
                  ) > 0
                    ? Object.values(unassignedLoads).reduce(
                        (a, b) => (Number(a) || 0) + (Number(b) || 0),
                        0,
                      )
                    : unassignedQuantity
                }
                onChange={(e) =>
                  setUnassignedQuantity(parseInt(e.target.value, 10) || 1)
                }
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-bold font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                รหัสออเดอร์ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={unassignedOrderNo}
                onChange={(e) => setUnassignedOrderNo(e.target.value)}
                placeholder="เช่น ORD-2026-001"
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-mono"
                required
              />
            </div>
          </div>

          {/* ตำแหน่งวางสินค้า & แถวที่ 1-10 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                ตำแหน่งวางสินค้า
              </label>
              <select
                value={unassignedPositionProductId}
                onChange={(e) => setUnassignedPositionProductId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-semibold"
              >
                <option value="">-- เลือกตำแหน่งวาง --</option>
                {positionProductsList.map((pos) => (
                  <option
                    key={pos.position_product_id}
                    value={pos.position_product_id}
                  >
                    {pos.position_product_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                แถวที่ (1-10)
              </label>
              <select
                value={unassignedPositionOrder}
                onChange={(e) =>
                  setUnassignedPositionOrder(parseInt(e.target.value, 10) || 1)
                }
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-semibold font-mono"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>
                    แถว {num}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              ชื่อร้านค้า <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={unassignedStoreName}
              onChange={(e) => setUnassignedStoreName(e.target.value)}
              placeholder="ระบุชื่อร้านค้า"
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              ที่อยู่จัดส่ง
            </label>
            <input
              type="text"
              value={unassignedAddress}
              onChange={(e) => setUnassignedAddress(e.target.value)}
              placeholder="ระบุที่อยู่ร้านค้า"
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              พิกัด GPS (ละติจูด, ลองจิจูด){" "}
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={unassignedLatLong}
              onChange={(e) => setUnassignedLatLong(e.target.value)}
              placeholder="เช่น 13.7563, 100.5018"
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-mono"
              required
            />
          </div>

          <div className="rounded-lg flex items-center gap-2">
            <input
              type="checkbox"
              checked={unassignedTax}
              onChange={(e) => setUnassignedTax(e.target.checked)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label className="block text-slate-700 font-semibold">
              ใบกำกับภาษี
            </label>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              หมายเหตุ
            </label>
            <textarea
              rows={2}
              value={unassignedNote}
              onChange={(e) => setUnassignedNote(e.target.value)}
              placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)"
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400"
            />
          </div>
        </div>
      </AnimatedDrawer>

      {/* ─── EDIT UNASSIGNED STOP MODAL ─── */}
      <AnimatedDrawer
        isOpen={isEditUnassignedModalOpen}
        onClose={() => setIsEditUnassignedModalOpen(false)}
        title="แก้ไขรายการจัดส่ง (รอจัดสาย)"
        formId="edit-unassigned-stop-form"
        onSubmit={handleSaveEditUnassignedStop}
        submitLabel={updatingUnassigned ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
        isSubmitting={updatingUnassigned}
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="block text-slate-700 font-semibold mb-1">
              เลือกวันที่ต้องการจัดส่ง <span className="text-rose-500">*</span>
            </label>
            <CustomDatePicker
              value={unassignedEditCreatedDate}
              onChange={(val) => setUnassignedEditCreatedDate(val)}
              label=""
              showActiveOrdersToggle={false}
              className="w-full"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              วันที่กำหนดให้รถขนส่งวิ่ง ไม่เกี่ยวกับวันที่สั่งสินค้า
            </p>
          </div>

          <SearchableSelect
            label="ลำดับความสำคัญ"
            value={unassignedEditPriority}
            onChange={(val) => setUnassignedEditPriority(String(val))}
            placeholder="-- เลือกลำดับความสำคัญ --"
            options={[
              {
                value: "high",
                label: "สูง",
                badge: "ด่วนที่สุด",
              },
              {
                value: "medium",
                label: "กลาง",
                badge: "ปกติ",
              },
              { value: "low", label: "ต่ำ", badge: "ไม่รีบ" },
            ]}
            required
          />

          <SearchableSelect
            label="เลือกร้านค้า (มาสเตอร์)"
            value={unassignedEditStoreId}
            onChange={(val) => {
              const storeId = String(val);
              setUnassignedEditStoreId(storeId);
              const found = storesList.find(
                (s) => String(s.store_id) === storeId,
              );
              if (found) {
                setUnassignedEditStoreName(found.store_name);
                setUnassignedEditAddress(found.store_address || "");
                setUnassignedEditLatLong(found.store_location || "");
              }
            }}
            placeholder="-- ค้นหาร้านค้าจากมาสเตอร์ --"
            searchPlaceholder="พิมพ์รหัส หรือ ชื่อร้านค้า..."
            options={storesList.map((s) => ({
              value: String(s.store_id),
              label: `${s.store_name} (${s.store_id})`,
              badge: s.store_id,
            }))}
          />

          {/* Cargo Loading Types Breakdown Input Section - Table List with White Background */}
          {loadingTypesList.length > 0 && (
            <div className="space-y-1.5 bg-white shadow-2xs">
              <div className="flex items-center justify-between text-slate-800 font-bold mb-1">
                <span className="flex items-center gap-1.5 text-slate-800 text-xs">
                  <Package className="w-4 h-4 text-blue-600" />
                  จำนวนประเภทของการโหลด
                </span>
                <span className="text-[11px] text-blue-700 font-mono bg-blue-50 px-2.5 py-0.5 rounded-full font-bold border border-blue-200">
                  รวม:{" "}
                  {Object.values(unassignedEditLoads).reduce(
                    (a, b) => (Number(a) || 0) + (Number(b) || 0),
                    0,
                  )}{" "}
                  ชิ้น
                </span>
              </div>
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                    <tr>
                      <th className="px-3 py-1.5 w-10 text-center">#</th>
                      <th className="px-3 py-1.5">ประเภทการโหลด</th>
                      <th className="px-3 py-1.5 w-24 text-center">หน่วยนับ</th>
                      <th className="px-3 py-1.5 w-28 text-right">จำนวน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {loadingTypesList.map((lt, idx) => (
                      <tr
                        key={lt.loading_type_id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-3 py-1 text-center font-mono text-slate-400 text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-1 font-bold text-slate-800">
                          {lt.type_name}
                        </td>
                        <td className="px-3 py-1 text-center font-mono text-slate-500 text-[11px]">
                          {lt.unit_name || "ชิ้น"}
                        </td>
                        <td className="px-3 py-1 text-right">
                          <input
                            type="number"
                            min={0}
                            value={unassignedEditLoads[lt.loading_type_id] || 0}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 0;
                              setUnassignedEditLoads((prev) => ({
                                ...prev,
                                [lt.loading_type_id]: val,
                              }));
                            }}
                            className="w-20 border border-slate-300 rounded px-2 py-1 text-right font-bold text-slate-900 bg-white focus:outline-none focus:border-blue-500 font-mono text-xs"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                จำนวนสินค้ารวม <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={
                  Object.values(unassignedEditLoads).reduce(
                    (a, b) => (Number(a) || 0) + (Number(b) || 0),
                    0,
                  ) > 0
                    ? Object.values(unassignedEditLoads).reduce(
                        (a, b) => (Number(a) || 0) + (Number(b) || 0),
                        0,
                      )
                    : unassignedEditQuantity
                }
                onChange={(e) =>
                  setUnassignedEditQuantity(parseInt(e.target.value, 10) || 1)
                }
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-bold font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                รหัสออเดอร์ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={unassignedEditOrderNo}
                onChange={(e) => setUnassignedEditOrderNo(e.target.value)}
                placeholder="เช่น ORD-2026-001"
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-mono"
                required
              />
            </div>
          </div>

          {/* ตำแหน่งวางสินค้า & แถวที่ 1-10 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                ตำแหน่งวางสินค้า
              </label>
              <select
                value={unassignedEditPositionProductId}
                onChange={(e) =>
                  setUnassignedEditPositionProductId(e.target.value)
                }
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-semibold"
              >
                <option value="">-- เลือกตำแหน่งวาง --</option>
                {positionProductsList.map((pos) => (
                  <option
                    key={pos.position_product_id}
                    value={pos.position_product_id}
                  >
                    {pos.position_product_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                แถวที่ (1-10)
              </label>
              <select
                value={unassignedEditPositionOrder}
                onChange={(e) =>
                  setUnassignedEditPositionOrder(
                    parseInt(e.target.value, 10) || 1,
                  )
                }
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-semibold font-mono"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>
                    แถว {num}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              ชื่อร้านค้า <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={unassignedEditStoreName}
              onChange={(e) => setUnassignedEditStoreName(e.target.value)}
              placeholder="ระบุชื่อร้านค้า"
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              ที่อยู่จัดส่ง
            </label>
            <input
              type="text"
              value={unassignedEditAddress}
              onChange={(e) => setUnassignedEditAddress(e.target.value)}
              placeholder="ระบุที่อยู่ร้านค้า"
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              พิกัด GPS (ละติจูด, ลองจิจูด){" "}
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={unassignedEditLatLong}
              onChange={(e) => setUnassignedEditLatLong(e.target.value)}
              placeholder="เช่น 13.7563, 100.5018"
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-mono"
              required
            />
          </div>

          <div className="rounded-lg flex items-center gap-2">
            <input
              type="checkbox"
              checked={unassignedEditTax}
              onChange={(e) => setUnassignedEditTax(e.target.checked)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label className="block text-slate-700 font-semibold">
              ใบกำกับภาษี
            </label>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              หมายเหตุ
            </label>
            <textarea
              rows={2}
              value={unassignedEditNote}
              onChange={(e) => setUnassignedEditNote(e.target.value)}
              placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)"
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400"
            />
          </div>
        </div>
      </AnimatedDrawer>

      {/* ─── EXCEL IMPORT PREVIEW LEFT DRAWER ─── */}
      <AnimatedDrawer
        isOpen={isExcelPreviewDrawerOpen}
        onClose={() => setIsExcelPreviewDrawerOpen(false)}
        title={`พรีวิวรายการจัดส่งนำเข้าจาก Excel (${excelPreviewStops.length} รายการ)`}
        formId="excel-preview-import-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleConfirmExcelImport();
        }}
        submitLabel={
          importingExcelStops
            ? "กำลังนำเข้าข้อมูล..."
            : `ยืนยันนำเข้าข้อมูล (${excelPreviewStops.length} รายการ)`
        }
        isSubmitting={importingExcelStops}
        maxWidthClass="max-w-full sm:max-w-[96vw]"
        isDirty={true}
      >
        <div className="space-y-3 text-xs">
          {importingExcelStops && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5 rounded-xl flex items-center justify-between shadow-lg animate-pulse">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 animate-spin text-white" />
                <div>
                  <div className="font-extrabold text-sm">
                    กำลังบันทึกลำดับจัดส่งจากไฟล์ Excel เข้าสู่ฐานข้อมูล...
                  </div>
                  <div className="text-[11px] text-blue-100 font-medium">
                    กรุณารอสักครู่ ระบบกำลังนำเข้า {excelPreviewStops.length}{" "}
                    รายการลงในส่วนยังไม่จัดสายรถ
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-white/20 px-3 py-1 rounded-lg backdrop-blur-xs">
                Processing...
              </span>
            </div>
          )}

          <div className="text-[11px] text-slate-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 leading-relaxed">
            <strong>นำเข้าไฟล์ Excel</strong> — ระบบรองรับคอลัมน์ประเภทการโหลด (
            <code>จำนวนลัง</code>, <code>จำนวนกะบะ</code>,{" "}
            <code>จำนวนพาเลท</code>, <code>จำนวนกล่อง</code>,{" "}
            <code>จำนวนกรงเหล็ก</code>) พร้อมคำนวณจำนวนรวมให้อัตโนมัติ!
          </div>

          <div className="max-h-[75vh] min-h-[480px] overflow-auto border border-slate-200 rounded-lg shadow-inner bg-white">
            <table className="w-full text-[11px] text-slate-700 border-collapse whitespace-nowrap">
              <thead className="sticky top-0 bg-slate-100 font-bold text-slate-700 border-b border-slate-200 z-10 shadow-2xs">
                <tr>
                  <th className="p-2 text-center w-8">#</th>
                  <th className="p-2 w-20">รหัสร้านค้า</th>
                  <th className="p-2 w-36">ชื่อร้านค้า</th>
                  <th className="p-2 w-20 text-center">ใบกำกับภาษี</th>
                  <th className="p-2 min-w-[140px]">หมายเหตุ</th>
                  <th className="p-2 w-44 text-center">วันที่จัดส่ง</th>
                  {loadingTypesList.map((lt) => (
                    <th
                      key={lt.loading_type_id}
                      className="p-2 w-24 text-center bg-blue-50/90 text-blue-900 border-x border-blue-200/80 font-bold shrink-0"
                      title={`จำนวน ${lt.type_name}`}
                    >
                      {lt.type_name} ({lt.unit_name || "ชิ้น"})
                    </th>
                  ))}
                  <th className="p-2 w-28 text-center bg-amber-100/80 text-amber-900 border-x border-amber-200 font-bold shrink-0">
                    จำนวนรวม (ออโต้)
                  </th>
                  <th className="p-2 w-40">ตำแหน่งวางสินค้า</th>
                  <th className="p-2 w-16 text-center">แถว</th>
                  <th className="p-2 w-32">รหัสออเดอร์</th>
                  <th className="p-2 w-32">พิกัด GPS</th>
                  <th className="p-2 text-center w-10">ลบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {excelPreviewStops.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-1.5 text-center font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="p-1 min-w-[160px]">
                      <SearchableSelect
                        value={item.store_id}
                        onChange={(val) => {
                          const selectedVal = String(val);
                          const found = storesMap.get(
                            selectedVal.trim().toLowerCase(),
                          );
                          setExcelPreviewStops((prev) =>
                            prev.map((row) =>
                              row.id === item.id
                                ? {
                                    ...row,
                                    store_id: selectedVal,
                                    store_name: found
                                      ? found.store_name
                                      : row.store_name,
                                    address: found
                                      ? found.store_address || ""
                                      : row.address,
                                    lat_long: found
                                      ? found.store_location || ""
                                      : row.lat_long,
                                    is_mapped_master: !!found,
                                  }
                                : row,
                            ),
                          );
                        }}
                        placeholder="-- เลือกร้านค้า --"
                        searchPlaceholder="พิมพ์ค้นหาร้านค้า (รหัส / ชื่อ)..."
                        hasError={
                          !item.store_id || !String(item.store_id).trim()
                        }
                        buttonClassName="px-1.5 py-1 text-xs font-mono font-bold bg-white rounded-md"
                        dropdownClassName="w-[360px] sm:w-[420px] max-w-xl shadow-2xl"
                        renderSelected={(opt) => (
                          <span className="font-bold truncate text-slate-800 font-mono">
                            {opt.value}
                          </span>
                        )}
                        options={
                          !item.store_id ||
                          storesMap.has(
                            String(item.store_id).trim().toLowerCase(),
                          )
                            ? masterStoreSearchableOptions
                            : [
                                {
                                  value: String(item.store_id),
                                  label: `${item.store_id} - ${item.store_name || "ไม่อยู่ในมาสเตอร์"}`,
                                  badge: "ไม่อยู่ในมาสเตอร์",
                                },
                                ...masterStoreSearchableOptions,
                              ]
                        }
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.store_name || "-"}
                        readOnly
                        disabled
                        tabIndex={-1}
                        className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs font-semibold text-slate-500 bg-slate-100/90 cursor-not-allowed"
                        title="ดึงข้อมูลอัตโนมัติจากมาสเตอร์ร้านค้า (แก้ไขไม่ได้)"
                      />
                    </td>
                    <td className="p-1 text-center">
                      <input
                        type="checkbox"
                        checked={!!item.tax}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setExcelPreviewStops((prev) =>
                            prev.map((row) =>
                              row.id === item.id
                                ? { ...row, tax: checked }
                                : row,
                            ),
                          );
                        }}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer"
                      />
                    </td>
                    <td className="p-1 min-w-[140px]">
                      <input
                        type="text"
                        value={item.note || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setExcelPreviewStops((prev) =>
                            prev.map((row) =>
                              row.id === item.id ? { ...row, note: val } : row,
                            ),
                          );
                        }}
                        placeholder="หมายเหตุ..."
                        className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs text-slate-800 focus:border-blue-400"
                      />
                    </td>
                    <td className="p-1 w-44">
                      <CustomDatePicker
                        value={item.date || selectedDate}
                        onChange={(val) => {
                          setExcelPreviewStops((prev) =>
                            prev.map((row) =>
                              row.id === item.id ? { ...row, date: val } : row,
                            ),
                          );
                        }}
                        label=""
                        showActiveOrdersToggle={false}
                        className="w-full"
                      />
                    </td>
                    {/* Dynamic Cargo Loading Types Columns */}
                    {loadingTypesList.map((lt) => (
                      <td
                        key={lt.loading_type_id}
                        className="p-1 bg-blue-50/20 border-x border-blue-100/70"
                      >
                        <input
                          type="number"
                          min={0}
                          value={item.loads?.[lt.loading_type_id] || 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 0;
                            setExcelPreviewStops((prev) =>
                              prev.map((row) => {
                                if (row.id !== item.id) return row;
                                const nextLoads: Record<number, number> = {
                                  ...(row.loads || {}),
                                  [lt.loading_type_id]: val,
                                };
                                const sumLoads = Object.values(
                                  nextLoads,
                                ).reduce<number>(
                                  (a, b) => a + (Number(b) || 0),
                                  0,
                                );
                                return {
                                  ...row,
                                  loads: nextLoads,
                                  sum_quantity:
                                    sumLoads > 0 ? sumLoads : row.sum_quantity,
                                };
                              }),
                            );
                          }}
                          className="w-full border border-blue-200 rounded px-1 py-1 text-xs text-center font-bold text-blue-900 bg-white font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </td>
                    ))}
                    {/* Sum Quantity Column Positioned After Loading Types */}
                    <td className="p-1 font-mono font-bold text-center bg-amber-50/40 border-x border-amber-200/60">
                      <input
                        type="number"
                        min={1}
                        value={
                          item.loads &&
                          Object.values(item.loads).reduce<number>(
                            (a, b) => a + (Number(b) || 0),
                            0,
                          ) > 0
                            ? Object.values(item.loads).reduce<number>(
                                (a, b) => a + (Number(b) || 0),
                                0,
                              )
                            : item.sum_quantity
                        }
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 1;
                          setExcelPreviewStops((prev) =>
                            prev.map((row) =>
                              row.id === item.id
                                ? { ...row, sum_quantity: val }
                                : row,
                            ),
                          );
                        }}
                        className="w-full border border-amber-300 rounded px-1.5 py-1 text-xs text-center font-bold text-amber-900 bg-amber-50/90 font-mono"
                        title="คำนวณผลรวมอัตโนมัติจากจำนวนประเภทการโหลดทั้งหมด"
                      />
                    </td>
                    <td className="p-1 min-w-[150px]">
                      <select
                        value={item.position_product_id || ""}
                        onChange={(e) => {
                          const positionId = e.target.value;
                          const foundPosition = positionProductsList.find(
                            (position) =>
                              String(position.position_product_id) ===
                              positionId,
                          );
                          setExcelPreviewStops((prev) =>
                            prev.map((row) =>
                              row.id === item.id
                                ? {
                                    ...row,
                                    position_product_id: positionId,
                                    position_product_name:
                                      foundPosition?.position_product_name ||
                                      "",
                                  }
                                : row,
                            ),
                          );
                        }}
                        className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-blue-400"
                      >
                        <option value="">-- เลือกตำแหน่งวาง --</option>
                        {positionProductsList.map((position) => (
                          <option
                            key={position.position_product_id}
                            value={position.position_product_id}
                          >
                            {position.position_product_name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        min={1}
                        value={item.position_production_order || 1}
                        onChange={(e) => {
                          const positionOrder =
                            parseInt(e.target.value, 10) || 1;
                          setExcelPreviewStops((prev) =>
                            prev.map((row) =>
                              row.id === item.id
                                ? {
                                    ...row,
                                    position_production_order: positionOrder,
                                  }
                                : row,
                            ),
                          );
                        }}
                        className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs text-center font-bold text-slate-800 focus:border-blue-400"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.data_store_no}
                        onChange={(e) => {
                          const val = e.target.value;
                          setExcelPreviewStops((prev) =>
                            prev.map((row) =>
                              row.id === item.id
                                ? { ...row, data_store_no: val }
                                : row,
                            ),
                          );
                        }}
                        placeholder="กรอกรหัสออเดอร์ *"
                        className={`w-full border rounded px-1.5 py-1 text-xs font-mono font-bold transition-all ${
                          !item.data_store_no ||
                          !String(item.data_store_no).trim()
                            ? "border-2 border-rose-500 bg-rose-50/70 text-rose-900 focus:border-rose-600 shadow-2xs"
                            : "border-slate-200 text-slate-800 focus:border-blue-400"
                        }`}
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.lat_long}
                        readOnly
                        disabled
                        onChange={(e) => {
                          const val = e.target.value;
                          setExcelPreviewStops((prev) =>
                            prev.map((row) =>
                              row.id === item.id
                                ? { ...row, lat_long: val }
                                : row,
                            ),
                          );
                        }}
                        className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs text-slate-500 bg-slate-100/90 cursor-not-allowed"
                        placeholder="lat,lng"
                      />
                    </td>
                    <td className="p-1 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setExcelPreviewStops((prev) =>
                            prev.filter((row) => row.id !== item.id),
                          );
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Row for adding a new empty item at the end of the table */}
                <tr className="bg-slate-50/80 hover:bg-blue-50/50 transition-colors border-t-2 border-dashed border-slate-200">
                  <td
                    colSpan={10 + loadingTypesList.length}
                    className="p-2 text-center"
                  >
                    <button
                      type="button"
                      onClick={handleAddEmptyExcelRow}
                      className="w-full py-2 bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs rounded-lg border border-blue-200 hover:border-blue-400 flex items-center justify-center gap-1.5 transition-all shadow-2xs group cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-blue-600 group-hover:scale-125 transition-transform" />
                      <span>เพิ่มแถวจัดส่งใหม่</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </AnimatedDrawer>

      {/* ─── MULTI-ADD UNASSIGNED STOPS PREVIEW DRAWER ─── */}
      <AnimatedDrawer
        isOpen={isMultiAddDrawerOpen}
        onClose={() => setIsMultiAddDrawerOpen(false)}
        title={`เพิ่มรายการจัดส่งแบบหลายรายการ (${multiAddStops.filter((s) => s.store_id && String(s.store_id).trim()).length} รายการ)`}
        formId="multi-add-stops-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleConfirmMultiAddImport();
        }}
        submitLabel={
          importingMultiAddStops
            ? "กำลังบันทึกข้อมูล..."
            : `ยืนยันบันทึก (${multiAddStops.filter((s) => s.store_id && String(s.store_id).trim()).length} รายการ)`
        }
        maxWidthClass="max-w-full sm:max-w-[96vw]"
        isDirty={true}
      >
        <div className="space-y-3 text-xs">
          {importingMultiAddStops && (
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-3.5 rounded-xl flex items-center justify-between shadow-lg animate-pulse">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 animate-spin text-white" />
                <div>
                  <div className="font-extrabold text-sm">
                    กำลังบันทึกรายการจัดส่งเข้าสู่ฐานข้อมูล...
                  </div>
                  <div className="text-[11px] text-violet-100 font-medium">
                    กรุณารอสักครู่ ระบบกำลังนำเข้า{" "}
                    {multiAddStops.filter((s) => s.store_id).length}{" "}
                    รายการลงในส่วนยังไม่จัดสายรถ
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-white/20 px-3 py-1 rounded-lg backdrop-blur-xs">
                Processing...
              </span>
            </div>
          )}

          <div className="text-[11px] text-slate-700 bg-violet-50 p-2.5 rounded-lg border border-violet-200 leading-relaxed">
            <strong>เพิ่มรายการจัดส่งหลายรายการพร้อมกัน</strong> — เลือก{" "}
            <code>ร้านค้า</code> จากมาสเตอร์ ระบุจำนวนตามประเภทการโหลด (ลัง,
            กระบะ, พาเลท, กล่อง ฯลฯ)
            ข้อมูลจำนวนรวมทั้งหมดจะถูกคำนวณให้อัตโนมัติ!
          </div>

          <div className="max-h-[75vh] min-h-[480px] overflow-auto border border-slate-200 rounded-lg shadow-inner bg-white">
            <table className="w-full text-[11px] text-slate-700 border-collapse whitespace-nowrap">
              <thead className="sticky top-0 bg-slate-100 font-bold text-slate-700 border-b border-slate-200 z-10 shadow-2xs">
                <tr>
                  <th className="p-2 text-center w-8">#</th>
                  <th className="p-2 w-20">รหัสร้านค้า</th>
                  <th className="p-2 w-36">ชื่อร้านค้า</th>
                  <th className="p-2 w-20 text-center">ใบกำกับภาษี</th>
                  <th className="p-2 min-w-[140px]">หมายเหตุ</th>
                  <th className="p-2 w-44 text-center">วันที่จัดส่ง</th>
                  {loadingTypesList.map((lt) => (
                    <th
                      key={lt.loading_type_id}
                      className="p-2 w-24 text-center bg-blue-50/90 text-blue-900 border-x border-blue-200/80 font-bold shrink-0"
                      title={`ระบุจำนวน ${lt.type_name}`}
                    >
                      {lt.type_name} ({lt.unit_name || "ชิ้น"})
                    </th>
                  ))}
                  <th className="p-2 w-28 text-center bg-amber-100/80 text-amber-900 border-x border-amber-200 font-bold shrink-0">
                    จำนวนรวม (ออโต้)
                  </th>
                  <th className="p-2 w-30">ตำแหน่งวางสินค้า</th>
                  <th className="p-2 w-16 text-center">แถว</th>
                  <th className="p-2 w-32">รหัสออเดอร์</th>
                  <th className="p-2 w-32">พิกัด GPS</th>
                  <th className="p-2 text-center w-10">ลบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {multiAddStops.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-1.5 text-center font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="p-1 min-w-[160px]">
                      <SearchableSelect
                        value={item.store_id}
                        onChange={(val) => {
                          const selectedVal = String(val);
                          const found = storesMap.get(
                            selectedVal.trim().toLowerCase(),
                          );
                          setMultiAddStops((prev) =>
                            prev.map((row) =>
                              row.id === item.id
                                ? {
                                    ...row,
                                    store_id: selectedVal,
                                    store_name: found
                                      ? found.store_name
                                      : row.store_name,
                                    address: found
                                      ? found.store_address || ""
                                      : row.address,
                                    lat_long: found
                                      ? found.store_location || ""
                                      : row.lat_long,
                                    is_mapped_master: !!found,
                                  }
                                : row,
                            ),
                          );
                        }}
                        placeholder="-- เลือกร้านค้า --"
                        searchPlaceholder="พิมพ์ค้นหาร้านค้า (รหัส / ชื่อ)..."
                        hasError={false}
                        buttonClassName="px-1.5 py-1 text-xs font-mono font-bold bg-white rounded-md"
                        dropdownClassName="w-[360px] sm:w-[420px] max-w-xl shadow-2xl"
                        renderSelected={(opt) => (
                          <span className="font-bold truncate text-slate-800 font-mono">
                            {opt.value}
                          </span>
                        )}
                        options={masterStoreSearchableOptions}
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.store_name || "-"}
                        readOnly
                        disabled
                        tabIndex={-1}
                        className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs font-semibold text-slate-500 bg-slate-100/90 cursor-not-allowed"
                        title="ดึงข้อมูลอัตโนมัติจากมาสเตอร์ร้านค้า (แก้ไขไม่ได้)"
                      />
                    </td>
                    <td className="p-1 text-center">
                      <input
                        type="checkbox"
                        checked={!!item.tax}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setMultiAddStops((prev) =>
                            prev.map((row) =>
                              row.id === item.id
                                ? { ...row, tax: checked }
                                : row,
                            ),
                          );
                        }}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer"
                      />
                    </td>
                    <td className="p-1 min-w-[140px]">
                      <input
                        type="text"
                        value={item.note || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMultiAddStops((prev) =>
                            prev.map((row) =>
                              row.id === item.id ? { ...row, note: val } : row,
                            ),
                          );
                        }}
                        placeholder="หมายเหตุ..."
                        className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs text-slate-800 focus:border-blue-400"
                      />
                    </td>
                    <td className="p-1 w-44">
                      <CustomDatePicker
                        value={item.date || selectedDate}
                        onChange={(val) => {
                          setMultiAddStops((prev) =>
                            prev.map((row) =>
                              row.id === item.id ? { ...row, date: val } : row,
                            ),
                          );
                        }}
                        label=""
                        showActiveOrdersToggle={false}
                        className="w-full"
                      />
                    </td>
                    {/* Dynamic Cargo Loading Types Columns */}
                    {loadingTypesList.map((lt) => (
                      <td
                        key={lt.loading_type_id}
                        className="p-1 bg-blue-50/20 border-x border-blue-100/70"
                      >
                        <input
                          type="number"
                          min={0}
                          value={item.loads?.[lt.loading_type_id] || 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 0;
                            setMultiAddStops((prev) =>
                              prev.map((row) => {
                                if (row.id !== item.id) return row;
                                const nextLoads: Record<number, number> = {
                                  ...(row.loads || {}),
                                  [lt.loading_type_id]: val,
                                };
                                const sumLoads = Object.values(
                                  nextLoads,
                                ).reduce<number>(
                                  (a, b) => a + (Number(b) || 0),
                                  0,
                                );
                                return {
                                  ...row,
                                  loads: nextLoads,
                                  sum_quantity:
                                    sumLoads > 0 ? sumLoads : row.sum_quantity,
                                };
                              }),
                            );
                          }}
                          className="w-full border border-blue-200 rounded px-1 py-1 text-xs text-center font-bold text-blue-900 bg-white font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </td>
                    ))}
                    {/* Sum Quantity Column Positioned After Loading Types */}
                    <td className="p-1 font-mono font-bold text-center bg-amber-50/40 border-x border-amber-200/60">
                      <input
                        type="number"
                        min={1}
                        value={
                          item.loads &&
                          Object.values(item.loads).reduce<number>(
                            (a, b) => a + (Number(b) || 0),
                            0,
                          ) > 0
                            ? Object.values(item.loads).reduce<number>(
                                (a, b) => a + (Number(b) || 0),
                                0,
                              )
                            : item.sum_quantity
                        }
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 1;
                          setMultiAddStops((prev) =>
                            prev.map((row) =>
                              row.id === item.id
                                ? { ...row, sum_quantity: val }
                                : row,
                            ),
                          );
                        }}
                        className="w-full border border-amber-300 rounded px-1.5 py-1 text-xs text-center font-bold text-amber-900 bg-amber-50/90 font-mono"
                        title="คำนวณผลรวมอัตโนมัติจากจำนวนประเภทการโหลดทั้งหมด"
                      />
                    </td>
                    <td className="p-1 min-w-[140px]">
                      <select
                        value={item.position_product_id || ""}
                        onChange={(e) => {
                          const positionId = e.target.value;
                          const foundPosition = positionProductsList.find(
                            (position) =>
                              String(position.position_product_id) ===
                              positionId,
                          );
                          setMultiAddStops((prev) =>
                            prev.map((row) =>
                              row.id === item.id
                                ? {
                                    ...row,
                                    position_product_id: positionId,
                                    position_product_name:
                                      foundPosition?.position_product_name ||
                                      "",
                                  }
                                : row,
                            ),
                          );
                        }}
                        className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-blue-400"
                      >
                        <option value="">-- เลือกตำแหน่งวาง --</option>
                        {positionProductsList.map((position) => (
                          <option
                            key={position.position_product_id}
                            value={position.position_product_id}
                          >
                            {position.position_product_name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        min={1}
                        value={item.position_production_order || 1}
                        onChange={(e) => {
                          const positionOrder =
                            parseInt(e.target.value, 10) || 1;
                          setMultiAddStops((prev) =>
                            prev.map((row) =>
                              row.id === item.id
                                ? {
                                    ...row,
                                    position_production_order: positionOrder,
                                  }
                                : row,
                            ),
                          );
                        }}
                        className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs text-center font-bold text-slate-800 focus:border-blue-400"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.data_store_no}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMultiAddStops((prev) =>
                            prev.map((row) =>
                              row.id === item.id
                                ? { ...row, data_store_no: val }
                                : row,
                            ),
                          );
                        }}
                        placeholder="กรอกรหัสออเดอร์ *"
                        className={`w-full border rounded px-1.5 py-1 text-xs font-mono font-bold transition-all ${
                          item.store_id &&
                          (!item.data_store_no ||
                            !String(item.data_store_no).trim())
                            ? "border-2 border-rose-500 bg-rose-50/70 text-rose-900 focus:border-rose-600 shadow-2xs"
                            : "border-slate-200 text-slate-800 focus:border-blue-400"
                        }`}
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.lat_long}
                        readOnly
                        disabled
                        className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs text-slate-500 bg-slate-100/90 cursor-not-allowed"
                        placeholder="lat,lng"
                      />
                    </td>
                    <td className="p-1 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setMultiAddStops((prev) =>
                            prev.filter((row) => row.id !== item.id),
                          );
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Row for adding a new empty item */}
                <tr className="bg-slate-50/80 hover:bg-violet-50/50 transition-colors border-t-2 border-dashed border-slate-200">
                  <td
                    colSpan={10 + loadingTypesList.length}
                    className="p-2 text-center"
                  >
                    <button
                      type="button"
                      onClick={handleAddEmptyMultiAddRow}
                      className="w-full py-2 bg-white hover:bg-violet-50 text-violet-700 font-bold text-xs rounded-lg border border-violet-200 hover:border-violet-400 flex items-center justify-center gap-1.5 transition-all shadow-2xs group cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-violet-600 group-hover:scale-125 transition-transform" />
                      <span>เพิ่มแถวจัดส่งใหม่</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </AnimatedDrawer>

      {/* ─── AUTO ROUTING CALCULATION DRAWER ─── */}
      <AnimatedDrawer
        isOpen={isAutoRouteDrawerOpen}
        onClose={() => setIsAutoRouteDrawerOpen(false)}
        title="ตัวเลือกคำนวณและจัดสายรถอัตโนมัติ"
        formId="auto-route-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleRunAutoRoute();
        }}
        submitLabel={
          calculatingAutoRoute
            ? "กำลังคำนวณเส้นทาง..."
            : "เริ่มคำนวณจัดสายรถอัตโนมัติ"
        }
        isSubmitting={calculatingAutoRoute}
        maxWidthClass="max-w-xl sm:max-w-3xl"
      >
        <div className="space-y-4 text-xs">
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-slate-700 leading-relaxed">
            ระบบจะนำรายการรอจัดสายจำนวน{" "}
            <strong>{unassignedStops.length} รายการ</strong>{" "}
            มาประมวลผลจัดกลุ่มพื้นที่ (Spatial Clustering)
            และสร้างสายรถประจำกลุ่มให้อัตโนมัติ
          </div>

          {/* Strategy & Service Time Settings (Synced with Delivery Settings) */}
          <div className="space-y-3 bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
            {/* 1. Strategy */}
            <div>
              <label className="flex text-slate-800 font-bold mb-1.5 items-center justify-between">
                <span>กลยุทธ์การคำนวณจัดสาย (ซิงก์กับการตั้งค่าระบบ)</span>
                <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  ซิงก์ฐานข้อมูลแล้ว
                </span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  {
                    id: "fastest_time",
                    label: "เวลาเร็วที่สุด",
                    icon: "⚡",
                    desc: "จัดส่งถึงไวที่สุด (OSRM Road)",
                    detail:
                      "คำนวณและคัดเลือกร้านค้าถัดไปโดยอ้างอิงจากระยะเวลาเดินทางบนถนนจริง (OSRM Travel Minutes) ช่วยให้จัดส่งถึงเป้าหมายได้รวดเร็วที่สุด",
                  },
                  {
                    id: "distance_first",
                    label: "ระยะทางสั้นสุด",
                    icon: "📐",
                    desc: "ประหยัดค่าน้ำมัน",
                    detail:
                      "คัดเลือกจุดส่งถัดไปโดยคำนวณตามระยะทางกิโลเมตรสั้นที่สุดบนพื้นผิวโลก (Haversine KM) ช่วยประหยัดค่าน้ำมันและคุมระยะไมล์สะสมของรถ",
                  },
                  {
                    id: "max_load_first",
                    label: "บรรทุกแน่นสุด",
                    icon: "📦",
                    desc: "อัดรถใหญ่ก่อน",
                    detail:
                      "เรียงลำดับรถโดยนำรถที่มีความจุมากที่สุดขึ้นมาก่อน แล้วใส่ออเดอร์ลงรถคันใหญ่ให้เต็มคันก่อน แล้วค่อยจัดสินค้าส่วนที่เหลือลงรถคันเล็กถัดไป",
                  },
                  {
                    id: "order_fifo",
                    label: "ตามลำดับออเดอร์",
                    icon: "📋",
                    desc: "เรียงคีย์ก่อน-หลัง",
                    detail:
                      "ไม่จัดกลุ่มพื้นที่หรือสลับจุดส่งข้ามไปข้ามมา แต่จะจัดสินค้าลงรถเรียงตามลำดับเวลาที่ออเดอร์เปิดเข้ามาในระบบก่อน-หลัง (FIFO)",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setDeliverySettings((prev) => ({
                        ...prev,
                        priorityStrategy: opt.id as any,
                      }));
                    }}
                    className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      deliverySettings.priorityStrategy === opt.id
                        ? "border-blue-600 bg-blue-50/90 text-blue-950 font-bold shadow-2xs ring-1 ring-blue-500"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      <span>{opt.icon}</span>
                      <span className="font-bold">{opt.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal mt-1">
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>

              {/* Dynamic Strategy Description Banner */}
              <div className="mt-2.5 bg-blue-50/80 border border-blue-200/80 rounded-lg p-2.5 text-[11px] text-blue-950 flex items-start gap-2">
                <span className="text-sm shrink-0">💡</span>
                <div>
                  <span className="text-slate-700">
                    {deliverySettings.priorityStrategy === "fastest_time" &&
                      "คำนวณและคัดเลือกร้านค้าถัดไปโดยอ้างอิงจากระยะเวลาเดินทางบนถนนจริง (OSRM Travel Minutes) ช่วยให้จัดส่งถึงเป้าหมายได้รวดเร็วที่สุด"}
                    {deliverySettings.priorityStrategy === "distance_first" &&
                      "คัดเลือกจุดส่งถัดไปโดยคำนวณตามระยะทางกิโลเมตรสั้นที่สุดบนพื้นผิวโลก (Haversine KM) ช่วยประหยัดค่าน้ำมันและคุมระยะไมล์สะสมของรถ"}
                    {deliverySettings.priorityStrategy === "max_load_first" &&
                      "เรียงลำดับรถโดยนำรถที่มีความจุมากที่สุดขึ้นมาก่อน แล้วใส่ออเดอร์ลงรถคันใหญ่ให้เต็มคันก่อน แล้วค่อยจัดสินค้าส่วนที่เหลือลงรถคันเล็กถัดไป"}
                    {deliverySettings.priorityStrategy === "order_fifo" &&
                      "ไม่จัดกลุ่มพื้นที่หรือสลับจุดส่งข้ามไปข้ามมา แต่จะจัดสินค้าลงรถเรียงตามลำดับเวลาที่ออเดอร์เปิดเข้ามาในระบบก่อน-หลัง (FIFO)"}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Service Time & Unlimited Stops Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200/60">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  ระยะเวลาลงสินค้าต่อสถานที่ (นาที/จุด)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={deliverySettings.serviceTimePerStop || 10}
                    onChange={(e) => {
                      const val = parseInt(e.target.value || "10", 10);
                      setDeliverySettings((prev) => ({
                        ...prev,
                        serviceTimePerStop: val,
                      }));
                    }}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-1.5 text-[11px] text-slate-400 font-medium pointer-events-none">
                    นาที / จุด
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  จำนวนจุดรับสินค้าต่อคัน
                </label>
                <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-slate-700 flex items-center justify-between h-[34px]">
                  <span>ไม่จำกัดจำนวนจุด (อิงความจุลังรถ)</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">
                    ตามความจุรถ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Capacity Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                สรุปความจุการบรรจุสินค้า (รวมรถที่เลือก):
              </span>
              <span className="font-bold font-mono text-sm text-slate-900">
                {totalUnassignedBoxes} / {totalSelectedCapacity}
              </span>
            </div>

            {/* Capacity Progress Bar */}
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  totalSelectedCapacity === 0
                    ? "bg-slate-300 w-0"
                    : totalSelectedCapacity >= totalUnassignedBoxes
                      ? "bg-emerald-500"
                      : "bg-amber-500"
                }`}
                style={{
                  width: `${
                    totalSelectedCapacity === 0
                      ? 0
                      : Math.min(
                          100,
                          (totalUnassignedBoxes / totalSelectedCapacity) * 100,
                        )
                  }%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">
                สินค้ารอจัดสาย:{" "}
                <strong className="text-slate-700">
                  {unassignedStops.length} รายการ
                </strong>{" "}
                ({totalUnassignedBoxes})
              </span>
              <span className="text-slate-500">
                รถที่เลือก:{" "}
                <strong className="text-slate-700">
                  {autoRouteSelectedVehicles.length} คัน
                </strong>{" "}
                (รับได้รวม {totalSelectedCapacity})
              </span>
            </div>

            {autoRouteSelectedVehicles.length > 0 && (
              <div className="pt-1">
                {totalSelectedCapacity >= totalUnassignedBoxes ? (
                  <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg flex items-center gap-1.5">
                    <span>
                      <Check className="w-4 h-4" />
                    </span>{" "}
                    ความจุของรถที่เลือกเพียงพอสำหรับสินค้าทั้งหมด (
                    {totalUnassignedBoxes} / {totalSelectedCapacity})
                  </div>
                ) : (
                  <div className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded-lg flex items-center gap-1.5">
                    <span>
                      <AlertTriangle className="w-4 h-4" />
                    </span>{" "}
                    ความจุรถไม่เพียงพอ! ต้องการอีก{" "}
                    {totalUnassignedBoxes - totalSelectedCapacity}
                    (กรุณาเลือกรถเพิ่ม)
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-slate-700 font-semibold">
                เลือกรถที่ต้องการนำมาจัดสาย ({autoRouteSelectedVehicles.length}{" "}
                คันที่เลือก)
              </label>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={handleAutoSelectVehicles}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2 py-0.5 rounded shadow-2xs transition-all flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95"
                  title="คำนวณและเลือกรถที่เหมาะสมพอดีกับจำนวนลังสินค้ารอจัดสายโดยให้อัตโนมัติ"
                >
                  <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
                  <span>เลือกรถออโต้</span>
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => {
                    const availableIds = vehiclesList
                      .filter((v) => !v.is_assigned_today)
                      .map((v) => String(v.car_id));
                    setAutoRouteSelectedVehicles(availableIds);
                  }}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  เลือกทั้งหมด (ว่าง)
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => setAutoRouteSelectedVehicles([])}
                  className="text-slate-500 hover:underline"
                >
                  ยกเลิกทั้งหมด
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 p-1.5 bg-slate-50/50 custom-scrollbar">
              {vehiclesList.map((v) => {
                const vId = String(v.car_id);
                const isChecked = autoRouteSelectedVehicles.includes(vId);
                const isAssigned = !!v.is_assigned_today;
                const capacity = v.quantity || 100;
                return (
                  <label
                    key={vId}
                    className={`flex items-center justify-between p-2 rounded transition-colors ${
                      isAssigned
                        ? "bg-slate-100/70 text-slate-400 cursor-not-allowed"
                        : "hover:bg-white cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked && !isAssigned}
                        disabled={isAssigned}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAutoRouteSelectedVehicles((prev) => [
                              ...prev,
                              vId,
                            ]);
                          } else {
                            setAutoRouteSelectedVehicles((prev) =>
                              prev.filter((id) => id !== vId),
                            );
                          }
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <span
                        className={`font-bold ${isAssigned ? "text-slate-400 " : "text-slate-800"}`}
                      >
                        {v.license_plate}
                      </span>
                      {v.brand && (
                        <span className="text-slate-500">
                          ({v.brand} {v.model})
                        </span>
                      )}
                    </div>

                    <div
                      className="flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-[11px] font-semibold text-slate-600">
                        บรรจุได้
                      </span>
                      <input
                        type="number"
                        min={1}
                        value={
                          customVehicleCapacities[vId] !== undefined
                            ? customVehicleCapacities[vId]
                            : capacity
                        }
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setCustomVehicleCapacities((prev) => ({
                            ...prev,
                            [vId]: isNaN(val) ? 0 : val,
                          }));
                        }}
                        disabled={isAssigned}
                        className="w-20 px-2 py-0.5 border border-amber-300 rounded text-center text-xs font-bold text-amber-900 bg-amber-50 focus:bg-white focus:outline-none focus:border-blue-500 font-mono disabled:opacity-50"
                      />
                      <span className="text-[11px] font-semibold text-slate-600">
                        ลัง
                      </span>
                      {isAssigned && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200">
                          จัดสายแล้วในวันนี้
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </AnimatedDrawer>

      {/* ─── DELETE GROUP CONFIRM MODAL ─── */}
      <ConfirmModal
        isOpen={!!groupToDelete}
        title="ยืนยันการลบสายจัดส่ง"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบสายจัดส่ง "${groupToDelete?.driverName}"? (จุดจัดส่งภายในสายจัดส่งนี้อาจถูกยกเลิก)`}
        confirmText={deletingGroup ? "กำลังลบ..." : "ลบสายจัดส่ง"}
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDeleteGroup}
        onCancel={() => setGroupToDelete(null)}
        isLoading={deletingGroup}
      />

      {/* ─── DELIVERY SETTINGS DRAWER ─── */}
      <AnimatedDrawer
        isOpen={isDeliverySettingsDrawerOpen}
        onClose={() => setIsDeliverySettingsDrawerOpen(false)}
        title="ตั้งค่าเงื่อนไขและหลักการจัดส่ง (Delivery Settings)"
        formId="delivery-settings-form"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            localStorage.setItem(
              "wawa_delivery_settings",
              JSON.stringify(deliverySettings),
            );
            await api.post("/optimoroute/delivery-settings", deliverySettings);
            showSuccess(
              "บันทึกการตั้งค่าจัดส่งลงฐานข้อมูลเรียบร้อยแล้ว (ทุกเครื่องจะเห็นข้อมูลตรงกัน)",
            );
          } catch (err: any) {
            showError("เกิดข้อผิดพลาดในการบันทึกการตั้งค่าลงฐานข้อมูล");
          }
          setIsDeliverySettingsDrawerOpen(false);
        }}
        submitLabel="บันทึกการตั้งค่า"
        maxWidthClass="max-w-lg sm:max-w-xl"
      >
        <div className="space-y-5 text-xs">
          {/* Banner Info */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-slate-700 leading-relaxed flex items-start gap-2.5">
            <div>
              <strong className="text-blue-950 font-bold block mb-0.5">
                การตั้งค่าระยะเวลา & ลำดับความสำคัญ
              </strong>
              กำหนดระยะเวลาที่ใช้ส่งสินค้าต่อรอบ/จุด และหลักการคำนวณ
              เพื่อให้ระบบประเมินเวลาเดินทาง (ETA)
              และจัดสายรถได้อย่างแม่นยำยิ่งขึ้น
            </div>
          </div>

          {/* Section 1: Service Time Per Stop */}
          <div className="space-y-2">
            <label className="block text-slate-800 font-bold">
              1. ระยะเวลาส่งสินค้าต่อรอบ / ต่อจุดส่ง (Service Duration)
            </label>
            <p className="text-[11px] text-slate-500">
              เวลาเฉลี่ยในการขนถ่ายสินค้าและส่งมอบ ณ แต่ละจุดส่ง
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[5, 10, 15, 20, 30].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() =>
                    setDeliverySettings((prev) => ({
                      ...prev,
                      serviceTimePerStop: mins,
                    }))
                  }
                  className={`py-2 px-3 rounded-lg border text-center font-bold transition-all ${
                    deliverySettings.serviceTimePerStop === mins
                      ? "border-blue-600 bg-blue-50 text-blue-900 shadow-2xs ring-1 ring-blue-500"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {mins} นาที
                </button>
              ))}
            </div>
            <div className="pt-1 flex items-center gap-2 text-slate-600">
              <span>หรือระบุเวลาเอง:</span>
              <input
                type="number"
                min={1}
                max={120}
                value={deliverySettings.serviceTimePerStop}
                onChange={(e) =>
                  setDeliverySettings((prev) => ({
                    ...prev,
                    serviceTimePerStop: parseInt(e.target.value, 10) || 10,
                  }))
                }
                className="w-20 border border-slate-300 rounded px-2 py-1 font-bold text-center text-slate-900 bg-white focus:outline-none focus:border-blue-500"
              />
              <span>นาที / จุด</span>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Priority Strategy */}
          <div className="space-y-2">
            <label className="block text-slate-800 font-bold">
              2. ลำดับความสำคัญในการจัดสายรถ (Optimization Priority)
            </label>
            <div className="space-y-2">
              {[
                {
                  id: "fastest_time",
                  title: "⚡ เวลาเร็วที่สุด (Fastest Time)",
                  desc: "อ้างอิงระยะเวลาเดินทางบนถนนจริง (OSRM Travel Minutes) ช่วยให้จัดส่งถึงเป้าหมายได้รวดเร็วที่สุด และลดเวลาเดินทางรวม",
                  tag: "แนะนำ",
                },
                {
                  id: "distance_first",
                  title: "📐 ระยะทางสั้นที่สุด (Shortest Distance)",
                  desc: "คำนวณตามระยะทางกิโลเมตรสั้นที่สุดบนพื้นผิวโลก (Haversine KM) ช่วยประหยัดค่าน้ำมันและควบคุมระยะไมล์สะสมของรถ",
                },
                {
                  id: "max_load_first",
                  title: "📦 บรรจุสินค้าเต็มคันก่อน (Max Capacity First)",
                  desc: "นำรถที่มีความจุมากที่สุดขึ้นมาก่อน แล้วใส่ออเดอร์ลงรถคันใหญ่ให้เต็มก่อน แล้วค่อยนำสินค้าส่วนที่เหลือใส่รถคันเล็กถัดไป",
                },
                {
                  id: "order_fifo",
                  title: "📋 ตามลำดับคิวออเดอร์ (First-In First-Out: FIFO)",
                  desc: "ไม่สลับจุดส่งข้ามไปข้ามมา แต่จะจัดสินค้าลงรถเรียงตามลำดับเวลาที่ออเดอร์เปิดเข้ามาในระบบก่อน-หลัง (FIFO)",
                },
              ].map((strat) => (
                <label
                  key={strat.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    deliverySettings.priorityStrategy === strat.id
                      ? "border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-500"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="priorityStrategy"
                    checked={deliverySettings.priorityStrategy === strat.id}
                    onChange={() =>
                      setDeliverySettings((prev) => ({
                        ...prev,
                        priorityStrategy: strat.id as any,
                      }))
                    }
                    className="mt-0.5 text-blue-600 accent-blue-600"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs">{strat.title}</span>
                      {strat.tag && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.2 rounded-full">
                          {strat.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {strat.desc}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 3: Additional Parameters */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                เวลาเริ่มออกเดินทางจากคลัง
              </label>
              <input
                type="time"
                value={deliverySettings.depotStartTime}
                onChange={(e) =>
                  setDeliverySettings((prev) => ({
                    ...prev,
                    depotStartTime: e.target.value,
                  }))
                }
                className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                เวลาพัก/สำรองต่อเที่ยว (นาที)
              </label>
              <select
                value={deliverySettings.bufferTimePerRoute}
                onChange={(e) =>
                  setDeliverySettings((prev) => ({
                    ...prev,
                    bufferTimePerRoute: parseInt(e.target.value, 10) || 0,
                  }))
                }
                className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800 bg-white focus:outline-none focus:border-blue-500"
              >
                <option value={0}>0 นาที (ไม่มีพัก)</option>
                <option value={15}>15 นาที</option>
                <option value={30}>30 นาที</option>
                <option value={45}>45 นาที</option>
              </select>
            </div>
          </div>
        </div>
      </AnimatedDrawer>

      {/* ─── CLEAR UNASSIGNED CONFIRM MODAL ─── */}
      <ConfirmModal
        isOpen={isConfirmClearUnassignedModalOpen}
        title="ยืนยันการล้างข้อมูลยังไม่จัดสาย"
        message={`คุณแน่ใจหรือไม่ว่าต้องการล้างรายการสินค้าที่ยังไม่ได้จัดสายของวันที่ ${selectedDate} ทั้งหมด (${unassignedStops.length} รายการ)? ข้อมูลนี้จะถูกลบออกจากระบบ`}
        confirmText={
          clearingUnassigned ? "กำลังล้างข้อมูล..." : "ล้างข้อมูลทั้งหมด"
        }
        cancelText="ยกเลิก"
        onConfirm={handleClearUnassignedStops}
        onCancel={() => setIsConfirmClearUnassignedModalOpen(false)}
        isLoading={clearingUnassigned}
      />

      {/* ─── DELETE AVOID ZONE CONFIRM MODAL ─── */}
      <ConfirmModal
        isOpen={isConfirmDeleteAvoidZoneModalOpen}
        title="ยืนยันการลบพื้นที่ห้ามผ่าน"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบพื้นที่ห้ามผ่าน "${avoidZoneToDelete?.zone_name || ""}" ออกจากระบบ? ข้อมูลพิกัดแนวเขตที่ตั้งไว้จะถูกลบและไม่นำมาคำนวณหลีกเลี่ยงเส้นทาง`}
        confirmText={deletingAvoidZone ? "กำลังลบ..." : "ลบพื้นที่ห้ามผ่าน"}
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDeleteAvoidZone}
        onCancel={() => {
          setIsConfirmDeleteAvoidZoneModalOpen(false);
          setAvoidZoneToDelete(null);
        }}
        isLoading={deletingAvoidZone}
      />

      {/* Avoid Zone Management Drawer */}
      <AvoidZoneDrawer
        isOpen={isAvoidZoneDrawerOpen}
        onClose={() => setIsAvoidZoneDrawerOpen(false)}
        zones={avoidZones}
        onToggleActive={handleToggleAvoidZoneActive}
        onDeleteZone={handleRequestDeleteAvoidZone}
        onFocusZone={(zone) => {
          setIsAvoidZoneDrawerOpen(false);
          if (zone.coordinates && zone.coordinates.length > 0) {
            setActiveGpsTarget({
              lat: zone.coordinates[0][0],
              lng: zone.coordinates[0][1],
            });
          }
        }}
      />

      {/* Modal บันทึกพื้นที่ห้ามผ่าน (Save Avoid Zone Modal) */}
      {isSaveZoneModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[2000] p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-700 font-bold">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>บันทึกพื้นที่ห้ามผ่าน</span>
              </div>
              <button
                type="button"
                onClick={() => setIsSaveZoneModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAvoidZoneSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อพื้นที่ห้ามผ่าน <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="เช่น สะพานจำกัดความสูง 3.2m / ทางลูกรังหมู่บ้านโนนทอง"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none font-semibold text-slate-800"
                  autoFocus
                  required
                />
              </div>

              <div>
                <SearchableSelect
                  label="ประเภทพื้นที่ห้ามผ่าน"
                  value={newZoneType}
                  onChange={(val) => setNewZoneType(val as any)}
                  placeholder="-- ไม่ระบุประเภทพื้นที่ห้ามผ่าน --"
                  searchPlaceholder="พิมพ์ค้นหาประเภทพื้นที่ห้ามผ่าน..."
                  options={[
                    { value: "unpaved", label: "🚜 ทางดินเลน / ถนนลูกรัง" },
                    { value: "height_limit", label: "🌉 สะพานจำกัดความสูง" },
                    {
                      value: "truck_prohibited",
                      label: "🚚 เขตห้ามรถบรรทุกผ่าน",
                    },
                    { value: "custom", label: "⚠️ พื้นที่เสี่ยงภัย / อื่นๆ" },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รายละเอียดเพิ่มเติม / หมายเหตุ
                </label>
                <textarea
                  rows={2}
                  value={newZoneDescription}
                  onChange={(e) => setNewZoneDescription(e.target.value)}
                  placeholder="ระบุข้อจำกัด เช่น รถ 6 ล้อผ่านไม่ได้ หรือดินเลนสไลด์ช่วงฤดูฝน..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 outline-none font-normal text-slate-700"
                />
              </div>

              <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-[11px] text-rose-800 font-medium flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  พิกัดแนวเขต Polygon ถูกเลือกไว้{" "}
                  <strong>{drawingPoints.length} จุด</strong> บนแผนที่
                  ระบบจะนำไปใช้หลีกเลี่ยงการจัดเส้นทางโดยอัตโนมัติ
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSaveZoneModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={savingAvoidZone}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {savingAvoidZone ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>บันทึกพื้นที่ห้ามผ่าน</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export PDF / Excel Drawer for RoutePage */}
      <ExportDrawer
        isOpen={isExportDrawerOpen}
        onClose={() => setIsExportDrawerOpen(false)}
        title="ส่งออกข้อมูล"
        columns={routeExportColumns}
        data={routeExportData}
        getValue={getRouteExportValue}
        fileNamePrefix="Route_Stops_Report"
        storageKey="wawa_route_export_selected_columns"
      />
    </div>
  );
};

export default RoutePage;
