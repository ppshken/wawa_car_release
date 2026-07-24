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
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { AnimatedDrawer } from "../components/AnimatedDrawer";
import { SearchableSelect } from "../components/SearchableSelect";
import { ConfirmModal } from "../components/ConfirmModal";
import * as XLSX from "xlsx";
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
} from "lucide-react";

// ─── Types ───
interface StopData {
  stopId: number;
  rowOrder?: number;
  row_order?: number;
  orderNo: string;
  data_store_no?: string;
  locationNo?: string;
  storeName: string;
  address: string;
  quantity?: number;
  sum_quantity?: number;
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
  groupStoreName?: string;
  group_color?: string;
  groupColor?: string;
  driverName: string;
  vehiclePlate: string;
  car_id?: string | number;
  load1?: number;
  vehicleCapacity?: number;
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

// ─── Marker with status-based icons & teardrop shape ───
function createStopMarker(
  number: number,
  color: string,
  isDepot: boolean,
  status?: string,
) {
  const size = isDepot ? 30 : 26;
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

  const svg = isDepot
    ? `<svg width="${size}" height="${size + 8}" viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 37 C15 37 28 22 28 14 C28 6.82 22.18 1 15 1 C7.82 1 2 6.82 2 14 C2 22 15 37 15 37Z" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="15" cy="14" r="8" fill="white"/>
        <text x="15" y="18" text-anchor="middle" font-size="11" font-weight="900" fill="${color}" font-family="system-ui">★</text>
      </svg>`
    : `<svg width="${size}" height="${size + 6}" viewBox="0 0 26 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 31 C13 31 24 19 24 12 C24 5.92 19.08 1 13 1 C6.92 1 2 5.92 2 12 C2 19 13 31 13 31Z" fill="${pinColor}" stroke="white" stroke-width="1.5"/>
        <circle cx="13" cy="12" r="7" fill="${circleFill}"/>
        <text x="13" y="${isCompleted ? 15.5 : 16}" text-anchor="middle" font-size="${isCompleted || isProblem ? 11 : number >= 100 ? 8 : number >= 10 ? 9 : 11}" font-weight="900" fill="${textColor}" font-family="system-ui">${symbolText}</text>
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

const DEPOT_COORD = { lat: 17.1266642, lng: 102.9635667 };

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

export const OptimoRoutePage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [routeGeometries, setRouteGeometries] = useState<
    Record<string, [number, number][]>
  >({});
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [checkedRoutes, setCheckedRoutes] = useState<Set<string>>(new Set());

  const isRouteVisibleOnMap = useCallback(
    (routeId: string) => {
      if (checkedRoutes.size === 0) return true;
      return checkedRoutes.has(routeId);
    },
    [checkedRoutes],
  );

  const toggleRouteVisibility = (routeId: string) => {
    setCheckedRoutes((prev) => {
      const next = new Set(prev);
      if (next.has(routeId)) {
        next.delete(routeId);
      } else {
        next.add(routeId);
      }
      return next;
    });
  };
  const [source, setSource] = useState<string>("mock");
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [searchRouteText, setSearchRouteText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [bottomPanelOpen, setBottomPanelOpen] = useState(true);
  const [bottomTab, setBottomTab] = useState<
    "all" | "pending" | "completed" | "problem"
  >("all");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Assigned vs Unassigned Tab state
  const [assignedTab, setAssignedTab] = useState<"assigned" | "unassigned">(
    "assigned",
  );
  const [unassignedStops, setUnassignedStops] = useState<any[]>([]);
  const [loadingUnassigned, setLoadingUnassigned] = useState(false);

  // Create Unassigned Stop Modal State
  const [isCreateUnassignedModalOpen, setIsCreateUnassignedModalOpen] =
    useState(false);
  const [unassignedStoreId, setUnassignedStoreId] = useState("");
  const [unassignedStoreName, setUnassignedStoreName] = useState("");
  const [unassignedAddress, setUnassignedAddress] = useState("");
  const [unassignedQuantity, setUnassignedQuantity] = useState(1);
  const [unassignedLatLong, setUnassignedLatLong] = useState("");
  const [unassignedOrderNo, setUnassignedOrderNo] = useState("");
  const [creatingUnassigned, setCreatingUnassigned] = useState(false);

  // Excel Import Preview Left Drawer State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExcelPreviewDrawerOpen, setIsExcelPreviewDrawerOpen] =
    useState(false);
  const [excelPreviewStops, setExcelPreviewStops] = useState<any[]>([]);
  const [importingExcelStops, setImportingExcelStops] = useState(false);

  // Auto-Routing Calculation Drawer State
  const [isAutoRouteDrawerOpen, setIsAutoRouteDrawerOpen] = useState(false);
  const [autoRouteStrategy, setAutoRouteStrategy] = useState<
    "shortest_distance" | "lowest_fuel" | "avoid_tolls"
  >("shortest_distance");
  const [autoRouteMaxLoad, setAutoRouteMaxLoad] = useState<number>(100);
  const [autoRouteMaxStops, setAutoRouteMaxStops] = useState<number>(15);
  const [autoRouteSelectedVehicles, setAutoRouteSelectedVehicles] = useState<
    string[]
  >([]);
  const [calculatingAutoRoute, setCalculatingAutoRoute] = useState(false);

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

  const selectedMasterStoreObj = useMemo(() => {
    if (!selectedMasterStoreId) return null;
    return (
      storesList.find(
        (s) => String(s.store_id) === String(selectedMasterStoreId),
      ) || null
    );
  }, [storesList, selectedMasterStoreId]);

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

  useEffect(() => {
    fetchVehiclesList();
    fetchStoresList();
  }, [fetchVehiclesList, fetchStoresList]);

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

  useEffect(() => {
    fetchUnassignedStops(selectedDate);
  }, [fetchUnassignedStops, selectedDate]);

  const handleDownloadSampleExcel = () => {
    try {
      const sampleData = [
        {
          "รหัสร้านค้า": "ST-001",
          "จำนวนสินค้า": 50,
          "รหัสออเดอร์": "ORD-2026-001",
        },
        {
          "รหัสร้านค้า": "ST-002",
          "จำนวนสินค้า": 35,
          "รหัสออเดอร์": "ORD-2026-002",
        },
        {
          "รหัสร้านค้า": "ST-003",
          "จำนวนสินค้า": 60,
          "รหัสออเดอร์": "ORD-2026-003",
        },
        {
          "รหัสร้านค้า": "ST-004",
          "จำนวนสินค้า": 40,
          "รหัสออเดอร์": "ORD-2026-004",
        },
        {
          "รหัสร้านค้า": "ST-005",
          "จำนวนสินค้า": 80,
          "รหัสออเดอร์": "ORD-2026-005",
        },
      ];

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

  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

          const quantity =
            parseInt(
              row["จำนวนสินค้า"] ||
                row["จำนวน"] ||
                row["sum_quantity"] ||
                row["quantity"] ||
                row["Qty"] ||
                "1",
              10,
            ) || 1;

          // Map ข้อมูลกับ Master Store Database จาก store_id
          const foundMaster = storesList.find(
            (s) => String(s.store_id).trim().toLowerCase() === storeId.toLowerCase(),
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

          return {
            id: `preview-${idx}-${Date.now()}`,
            store_id: storeId,
            store_name: storeName,
            address: address,
            data_store_no: orderNo,
            sum_quantity: quantity,
            lat_long: latLong,
            is_mapped_master: !!foundMaster,
          };
        });

        setExcelPreviewStops(parsedStops);
        setIsExcelPreviewDrawerOpen(true);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (err) {
        console.error("Excel parse error:", err);
        showError("ไม่สามารถอ่านไฟล์ Excel ได้ กรุณาตรวจสอบรูปแบบไฟล์");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmExcelImport = async () => {
    if (excelPreviewStops.length === 0) {
      showError("ไม่พบรายการที่ต้องนำเข้า");
      return;
    }

    setImportingExcelStops(true);
    try {
      const res = await api.post("/optimoroute/unassigned/import", {
        date: selectedDate,
        stops: excelPreviewStops,
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

  const handleRunAutoRoute = async () => {
    if (unassignedStops.length === 0) {
      showError("ไม่พบรายการรอจัดสายเพื่อคำนวณเส้นทาง");
      return;
    }

    setCalculatingAutoRoute(true);
    try {
      const res = await api.post("/optimoroute/auto-route", {
        date: selectedDate,
        strategy: autoRouteStrategy,
        maxLoadPerVehicle: autoRouteMaxLoad,
        maxStopsPerVehicle: autoRouteMaxStops,
        selectedVehicleIds: autoRouteSelectedVehicles,
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

  // GPS Live Tracking State
  const [gpsDevices, setGpsDevices] = useState<GpsDevice[]>([]);
  const [showGpsVehicles, setShowGpsVehicles] = useState(true);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [lastGpsUpdate, setLastGpsUpdate] = useState<string>("");

  // Left Sidebar Collapsible Sections State
  const [isRoutesSectionOpen, setIsRoutesSectionOpen] = useState(true);
  const [isGpsSectionOpen, setIsGpsSectionOpen] = useState(true);
  const [activeGpsTarget, setActiveGpsTarget] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

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

  useEffect(() => {
    fetchGpsDevices();
    const interval = setInterval(() => {
      fetchGpsDevices();
    }, 10000); // 10 seconds auto-refresh

    return () => clearInterval(interval);
  }, [fetchGpsDevices]);

  // Load Real Road Geometries for Routes (OSRM Road Routing)
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
  const [formStopStoreName, setFormStopStoreName] = useState("");
  const [formStopAddress, setFormStopAddress] = useState("");
  const [formStopRowOrder, setFormStopRowOrder] = useState<number>(1);
  const [formStopQuantity, setFormStopQuantity] = useState<number>(1);
  const [formStopLatLong, setFormStopLatLong] = useState("");
  const [creatingStop, setCreatingStop] = useState(false);

  const selectedGroupRouteObj = useMemo(() => {
    if (!formStopGroupId) return null;
    return (
      routes.find(
        (r) =>
          String(r.groupStoreId || r.routeId.replace("ROUTE-", "")) ===
          String(formStopGroupId),
      ) || null
    );
  }, [routes, formStopGroupId]);

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
  const [updatingStop, setUpdatingStop] = useState(false);

  // Delete Stop Confirm Modal State
  const [stopToDelete, setStopToDelete] = useState<any | null>(null);
  const [deletingStop, setDeletingStop] = useState(false);

  const handleOpenEditStopDrawer = (stop: any) => {
    setEditingStop(stop);
    setEditFormGroupId(
      stop.groupStoreId ||
        stop.group_store_id ||
        stop.routeId?.replace("ROUTE-", "") ||
        "",
    );
    setEditFormStoreId(stop.locationNo || stop.store_id || "");
    setEditFormOrderNo(stop.data_store_no || stop.orderNo || "");
    setEditFormStoreName(stop.storeName || "");
    setEditFormAddress(stop.address || "");
    setEditFormRowOrder(stop.rowOrder ?? stop.row_order ?? stop.stopId ?? 1);
    setEditFormQuantity(stop.quantity ?? 1);
    setEditFormLatLong(
      stop.lat_long || (stop.lat && stop.lng ? `${stop.lat},${stop.lng}` : ""),
    );
    setEditFormStatus(stop.status || "pending");
    setIsEditStopDrawerOpen(true);
  };

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

  const handleSaveEditStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStop) return;
    const targetListId = editingStop.stopId || editingStop.list_id;
    if (!targetListId) {
      showError("ไม่พบรหัสรายการจุดจัดส่ง (list_id)");
      return;
    }

    setUpdatingStop(true);
    try {
      const res = await api.put(`/optimoroute/stops/${targetListId}`, {
        group_store_id: editFormGroupId,
        store_id: editFormStoreId || undefined,
        data_store_no: editFormOrderNo || undefined,
        store_name: editFormStoreName.trim(),
        address: editFormAddress.trim(),
        row_order: editFormRowOrder,
        sum_quantity: editFormQuantity,
        lat_long: editFormLatLong.trim(),
        status: editFormStatus,
      });

      if (res.data.success) {
        showSuccess(res.data.message || "อัปเดตข้อมูลจุดจัดส่งสำเร็จ!");
        setIsEditStopDrawerOpen(false);
        setEditingStop(null);
        fetchRoutes(selectedDate);
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
        fetchRoutes(selectedDate);
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

  // Edit Group Modal State
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupColor, setEditGroupColor] = useState("#3b82f6");
  const [editGroupCarId, setEditGroupCarId] = useState("");
  const [editGroupDate, setEditGroupDate] = useState(selectedDate);
  const [updatingGroup, setUpdatingGroup] = useState(false);

  // Delete Group Modal State
  const [groupToDelete, setGroupToDelete] = useState<any | null>(null);
  const [deletingGroup, setDeletingGroup] = useState(false);

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
      setCheckedRoutes((prev) => {
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

  const fetchRoutes = useCallback(
    async (date: string) => {
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
          setSource(res.data.source || "mock");
          setCheckedRoutes(new Set());
          setSelectedRouteId(null);
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

  useEffect(() => {
    fetchRoutes(selectedDate);
  }, [selectedDate, fetchRoutes]);

  // Stats
  const totalStops = routes.reduce(
    (sum, r) => sum + r.stops.filter((s) => s.type !== "depot").length,
    0,
  );
  const completedStops = routes.reduce(
    (sum, r) =>
      sum +
      r.stops.filter((s) => s.status === "completed" && s.type !== "depot")
        .length,
    0,
  );
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
  const pendingStops = totalStops - completedStops - problemStops;

  // Filter routes for left sidebar
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

  // Map bounds (Only compute when routes are loaded, starting from Depot)
  const mapBounds = useMemo(() => {
    const coords: [number, number][] = [[17.1266642, 102.9635667]];
    routes.forEach((r) => {
      r.stops.forEach((s) => {
        if (s.lat && s.lng) coords.push([s.lat, s.lng]);
      });
    });
    return coords.length > 1 ? L.latLngBounds(coords) : null;
  }, [routes]);

  // Scoped stops for active group/selection
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

  const scopeTotalCount = scopeStops.length;
  const scopeCompletedCount = useMemo(
    () => scopeStops.filter((s) => s.status === "completed").length,
    [scopeStops],
  );
  const scopeProblemCount = useMemo(
    () =>
      scopeStops.filter((s) => s.status === "problem" || s.status === "failed")
        .length,
    [scopeStops],
  );
  const scopePendingCount =
    scopeTotalCount - scopeCompletedCount - scopeProblemCount;

  // Bottom table stops (filtered by tab and search)
  const tableStops = useMemo(() => {
    let filtered = scopeStops;
    if (bottomTab === "completed")
      filtered = scopeStops.filter((s) => s.status === "completed");
    if (bottomTab === "pending")
      filtered = scopeStops.filter(
        (s) =>
          s.status !== "completed" &&
          s.status !== "problem" &&
          s.status !== "failed",
      );
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

  return (
    <div
      className="flex flex-col w-full font-sans text-xs"
      style={{ height: "calc(100vh - 52px)" }}
    >
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
              <span>📡 GPS สด ({gpsDevices.length})</span>
              {lastGpsUpdate && (
                <span className="text-[9px] opacity-75 font-mono">
                  ({lastGpsUpdate})
                </span>
              )}
            </button>
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
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">โหลดข้อมูล</span>
          </button>
          <button
            onClick={() => {
              setNewGroupName(
                `Optimo Routes-${String(routes.length + 1).padStart(3, "0")}`,
              );
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
        {/* ─── LEFT SIDEBAR (Route List + GPS Monitor) ─── */}
        <div
          className={`bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-hidden transition-all duration-200 ${
            isMobileSidebarOpen
              ? "w-full sm:w-64 h-64 sm:h-auto border-b sm:border-b-0"
              : "hidden sm:flex sm:w-64"
          }`}
        >
          {/* Search Routes & GPS Devices */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1.5" />
              <input
                type="text"
                value={searchRouteText}
                onChange={(e) => setSearchRouteText(e.target.value)}
                placeholder="ค้นหาสายรถ / ทะเบียน / GPS..."
                className="w-full bg-white border border-slate-200 rounded-md pl-7 pr-2 py-1 text-[11px] focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

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
                        {/* Route Header Row */}
                        <div
                          className="flex items-start gap-2 px-2.5 py-2.5"
                          onClick={() => {
                            setSelectedRouteId(
                              isSelected ? null : route.routeId,
                            );
                          }}
                        >
                          {/* Checkbox + Color */}
                          <div className="flex flex-col items-center gap-1.5 pt-0.5 shrink-0">
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRouteVisibility(route.routeId);
                                setSelectedRouteId(route.routeId);
                              }}
                              className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all ${
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
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                            <div
                              className="w-3 h-3 rounded-full border border-white shadow-2xs shrink-0"
                              style={{ background: route.color }}
                            />
                          </div>

                          {/* Route Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                <span className="font-bold text-slate-900 text-xs truncate">
                                  {route.driverName}
                                </span>
                                {route.vehiclePlate &&
                                  route.vehiclePlate !== "-" && (
                                    <span className="text-[9px] bg-slate-100 text-slate-700 font-mono font-bold px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                                      {route.vehiclePlate}
                                    </span>
                                  )}
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
                                        v.license_plate ===
                                          route.vehiclePlate),
                                  );
                                  const cap =
                                    route.vehicleCapacity ||
                                    matchedVehicle?.quantity ||
                                    100;

                                  if (totalBoxes <= 0 && (!route.load1 || route.load1 <= 0)) return null;

                                  return (
                                    <span
                                      className="text-[9px] bg-amber-50 text-amber-800 font-mono font-bold px-1.5 py-0.5 rounded border border-amber-200/80 shrink-0"
                                      title={`จัดใส่รถแล้ว ${totalBoxes} ลัง / รถรับได้สูงสุด ${cap} ลัง`}
                                    >
                                      {totalBoxes}/{cap} ลัง
                                    </span>
                                  );
                                })()}
                              </div>

                              {/* Action buttons (Edit & Delete) */}
                              <div className="flex items-center gap-0.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditGroupModal(route);
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-slate-900 hover:bg-slate-200/70 transition-colors"
                                  title="แก้ไขข้อมูลสายจัดส่ง"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setGroupToDelete(route);
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-100/70 transition-colors"
                                  title="ลบสายจัดส่ง"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500 font-medium">
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {estimatedTime}
                              </span>
                              <span className="text-slate-300">·</span>
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {deliveryStops} จุด
                              </span>
                              <span className="text-slate-300">·</span>
                              <span>{estimatedDist}</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-1.5 flex items-center gap-2">
                              <div className="flex-1 bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="h-1.5 rounded-full transition-all"
                                  style={{
                                    width: `${deliveryStops > 0 ? (processedCount / deliveryStops) * 100 : 0}%`,
                                    background: route.color,
                                  }}
                                />
                              </div>
                              <span className="text-[9px] text-slate-500 font-mono font-bold shrink-0">
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
                      {gpsLoading ? "กำลังโหลดข้อมูล..." : "ไม่พบข้อมูลรถ GPS"}
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
                            className="p-2 hover:bg-emerald-50/60 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
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
                              <div className="text-[10px] text-slate-500 line-clamp-1 truncate pl-3.5">
                                📍 {device.address}
                              </div>
                            )}
                          </div>
                        );
                      })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── MAP + BOTTOM PANEL ─── */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* MAP */}
          <div className="flex-1 relative">
            <MapContainer
              center={[17.1266642, 102.9635667]}
              zoom={12}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitBounds bounds={mapBounds} />
              <FlyToTarget
                target={
                  activeStop
                    ? { lat: activeStop.lat, lng: activeStop.lng }
                    : activeGpsTarget
                }
              />

              {/* Starting Depot Marker (17.1266642, 102.9635667) */}
              <Marker
                position={[17.1266642, 102.9635667]}
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
                      พิกัด: 17.1266642, 102.9635667
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
                  [17.1266642, 102.9635667],
                  ...route.stops
                    .filter((s) => s.lat && s.lng)
                    .map((s) => [s.lat, s.lng] as [number, number]),
                  [17.1266642, 102.9635667],
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
                      return (
                        <Marker
                          key={`${route.routeId}-${stop.stopId}-${sIdx}`}
                          position={[stop.lat, stop.lng]}
                          icon={createStopMarker(
                            pinNumber,
                            route.color,
                            stop.type === "depot",
                            stop.status,
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
                          <Popup maxWidth={300} autoPan={false}>
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
                                  🕐 {stop.arrivalTime}
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
                                    background: getStatusColor(stop.status).bg,
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
              )}

              {/* GPS Live Vehicle Markers */}
              {showGpsVehicles &&
                gpsDevices.map((device) => {
                  if (!device.latitude || !device.longitude) return null;
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

              {/* Tabs + Filter */}
              <div className="flex items-center justify-between px-3 py-1 border-b border-slate-100 bg-slate-50/50 gap-2 shrink-0 flex-wrap">
                <div className="flex items-center gap-1 flex-wrap">
                  {/* Segmented Tab Switcher */}
                  <div className="bg-slate-200/80 p-0.5 rounded-lg flex items-center gap-0.5 mr-2">
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

                  {assignedTab === "assigned" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          if (routes.length > 0) {
                            setFormStopGroupId(
                              routes[0].groupStoreId ||
                                routes[0].routeId.replace("ROUTE-", ""),
                            );
                          }
                          setFormStopRowOrder(tableStops.length + 1);
                          setIsCreateStopDrawerOpen(true);
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold text-xs px-2.5 py-1 rounded-md flex items-center gap-1 shadow-2xs transition-colors shrink-0 mr-1"
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
                          setIsCreateUnassignedModalOpen(true);
                        }}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-2.5 py-1 rounded-md flex items-center gap-1 shadow-2xs transition-colors shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>เพิ่มรายการรอจัดสาย</span>
                      </button>

                      <label className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-2.5 py-1 rounded-md flex items-center gap-1 shadow-2xs transition-colors cursor-pointer shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Import Excel</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".xlsx, .xls, .csv"
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
                        onClick={() => {
                          if (unassignedStops.length === 0) {
                            showError("ไม่พบรายการรอจัดสายเพื่อคำนวณเส้นทาง");
                            return;
                          }
                          setIsAutoRouteDrawerOpen(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1 rounded-md flex items-center gap-1.5 shadow-2xs transition-all hover:scale-105 shrink-0"
                      >
                        <Cpu className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                        <span>⚡ คำนวณเส้นทาง</span>
                      </button>
                    </>
                  )}

                  {/* Search Store in Table */}
                  <div className="relative ml-2 w-44 sm:w-56">
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

                {/* Counter + Controls */}
                <div className="text-[10px] text-slate-500 flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1">
                    <LocateFixed className="w-3 h-3" />
                    แสดง{" "}
                    {assignedTab === "assigned"
                      ? tableStops.length
                      : unassignedStops.length}{" "}
                    รายการ
                  </span>
                  <div className="w-px h-3.5 bg-slate-200" />
                  <button
                    type="button"
                    onClick={toggleMaximize}
                    title={isMaximized ? "ย่อขนาดตาราง" : "ขยายตารางเต็มหน้าจอ"}
                    className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                  >
                    {isMaximized ? (
                      <Minimize2 className="w-3.5 h-3.5" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBottomPanelOpen(false)}
                    title="ซ่อนตารางข้อมูล"
                    className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-auto custom-scrollbar">
                {assignedTab === "unassigned" ? (
                  <table className="w-full text-[11px] text-slate-700 border-collapse">
                    <thead className="sticky top-0 bg-slate-100/90 backdrop-blur-xs font-bold text-slate-700 border-b border-slate-200 shadow-2xs z-10">
                      <tr>
                        <th className="px-2.5 py-1.5 text-center w-12">#</th>
                        <th className="px-2.5 py-1.5 w-28">รหัสร้านค้า</th>
                        <th className="px-2.5 py-1.5">ชื่อลูกค้า / ร้านค้า</th>
                        <th className="px-2.5 py-1.5">ที่อยู่จัดส่ง</th>
                        <th className="px-2.5 py-1.5 text-right w-24">
                          จำนวน (ลัง)
                        </th>
                        <th className="px-2.5 py-1.5 w-32">รหัสออเดอร์</th>
                        <th className="px-2.5 py-1.5 w-32">พิกัด GPS</th>
                        <th className="px-2.5 py-1.5 text-right w-20">
                          จัดการ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {unassignedStops.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="text-center py-8 text-slate-400"
                          >
                            <Package className="w-8 h-8 mx-auto mb-1 text-slate-300" />
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
                              className="hover:bg-amber-50/50 transition-colors"
                            >
                              <td className="px-2.5 py-1.5 text-center font-bold text-slate-500">
                                {idx + 1}
                              </td>
                              <td className="px-2.5 py-1.5 font-mono font-bold text-slate-900">
                                {stop.store_id}
                              </td>
                              <td className="px-2.5 py-1.5 font-semibold text-slate-800">
                                {stop.storeName}
                              </td>
                              <td className="px-2.5 py-1.5 text-slate-600 line-clamp-1">
                                {stop.address}
                              </td>
                              <td className="px-2.5 py-1.5 text-right font-bold text-amber-700">
                                {stop.sum_quantity}
                              </td>
                              <td className="px-2.5 py-1.5 font-mono text-slate-600">
                                {stop.orderNo}
                              </td>
                              <td className="px-2.5 py-1.5 font-mono text-[10px] text-slate-500">
                                {stop.lat_long || "-"}
                              </td>
                              <td className="px-2.5 py-1.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => setStopToDelete(stop)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                  title="ลบรายการ"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-[11px] min-w-[750px]">
                    <thead className="sticky top-0 bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                      <tr className="text-left text-[11px] text-slate-700 font-semibold uppercase tracking-wider">
                        <th className="px-2 py-1.5 w-6"></th>
                        <th className="px-2 py-1.5 w-8">#</th>
                        <th className="px-2 py-1.5 w-40">รหัสออเดอร์</th>
                        <th className="px-2 py-1.5 w-24">รหัสร้านค้า</th>
                        <th className="px-2 py-1.5">ชื่อลูกค้า/ร้านค้า</th>
                        <th className="px-2 py-1.5">ที่อยู่จัดส่ง</th>
                        <th className="px-2 py-1.5 w-30">สถานะ</th>
                        <th className="px-2 py-1.5">สายรถ</th>
                        <th className="px-2 py-1.5 w-20">ทะเบียน</th>
                        <th className="px-2 py-1.5 w-16 text-center">ลำดับ</th>
                        <th className="px-2 py-1.5 text-right w-20">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableStops.map((stop, idx) => {
                        const sc = getStatusColor(stop.status);
                        const isDepot = stop.type === "depot";
                        return (
                          <tr
                            key={`tablestop-${stop.stopId}-${idx}`}
                            onClick={() => handleSelectStopRow(stop)}
                            className="border-b border-slate-100 hover:bg-blue-50/50 cursor-pointer transition-colors"
                          >
                            <td className="px-2 py-1.5">
                              <div
                                className="w-3.5 h-3.5 rounded-full text-white text-[8px] font-bold flex items-center justify-center shrink-0"
                                style={{ background: stop.routeColor }}
                              >
                                {isDepot
                                  ? "★"
                                  : (stop.rowOrder ??
                                    stop.row_order ??
                                    stop.stopId)}
                              </div>
                            </td>
                            <td className="px-2 py-1.5 font-mono text-slate-400">
                              {idx + 1}
                            </td>
                            <td className="px-2 py-1.5 font-mono font-medium text-slate-800">
                              {stop.orderNo}
                            </td>
                            <td className="px-2 py-1.5 font-mono text-slate-500">
                              {stop.locationNo}
                            </td>
                            <td className="px-2 py-1.5 font-medium text-slate-900">
                              {stop.storeName}
                            </td>
                            <td className="px-2 py-1.5 text-slate-500 truncate max-w-[200px]">
                              {stop.address}
                            </td>
                            <td className="px-2 py-1.5">
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ background: sc.bg, color: sc.text }}
                              >
                                {getStatusLabel(stop.status)}
                              </span>
                            </td>
                            <td className="px-2 py-1.5 text-slate-600 font-medium">
                              {stop.routeDriverName}
                            </td>
                            <td className="px-2 py-1.5 font-mono text-slate-500">
                              {stop.routeVehicle}
                            </td>
                            <td className="px-2 py-1.5 text-center font-bold text-slate-700">
                              {isDepot
                                ? "ศูนย์"
                                : (stop.rowOrder ?? stop.row_order ?? "-")}
                            </td>
                            <td className="px-2 py-1.5 text-right">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditStopDrawer(stop);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors mr-0.5"
                                title="แก้ไขจุดจัดส่ง"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setStopToDelete(stop);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-100 transition-colors"
                                title="ลบจุดจัดส่ง"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {tableStops.length === 0 && (
                        <tr>
                          <td
                            colSpan={11}
                            className="text-center py-8 text-slate-400"
                          >
                            <Package className="w-5 h-5 mx-auto mb-1 text-slate-300" />
                            ไม่พบรายการ
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                ลำดับจัดส่ง
              </label>
              <input
                type="number"
                min={1}
                value={formStopRowOrder}
                onChange={(e) =>
                  setFormStopRowOrder(parseInt(e.target.value, 10) || 1)
                }
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
                onChange={(e) =>
                  setFormStopQuantity(parseInt(e.target.value, 10) || 1)
                }
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-semibold"
              />
            </div>
          </div>

          <SearchableSelect
            label="เลือกร้านค้าจากมาสเตอร์ (store)"
            value={selectedMasterStoreId}
            onChange={(val) => handleSelectMasterStore(String(val))}
            placeholder="-- เลือกร้านค้าจากมาสเตอร์ --"
            searchPlaceholder="พิมพ์ค้นหาร้านค้า (ชื่อ / รหัส)..."
            options={storesList.map((s) => ({
              value: String(s.store_id),
              label: s.store_name,
              badge: String(s.store_id),
            }))}
          />

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

      {/* ─── EDIT STOP DRAWER ─── */}
      <AnimatedDrawer
        isOpen={isEditStopDrawerOpen}
        onClose={() => setIsEditStopDrawerOpen(false)}
        title="แก้ไขรายการจุดจัดส่ง"
        formId="edit-stop-form"
        onSubmit={handleSaveEditStop}
        submitLabel={updatingStop ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
      >
        <div className="space-y-4 text-xs">
          <SearchableSelect
            label="เลือกสายจัดส่ง"
            required
            value={editFormGroupId}
            onChange={(val) => setEditFormGroupId(val)}
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                ลำดับจัดส่ง
              </label>
              <input
                type="number"
                min={1}
                value={editFormRowOrder}
                onChange={(e) =>
                  setEditFormRowOrder(parseInt(e.target.value, 10) || 1)
                }
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                จำนวนสินค้า (ลัง)
              </label>
              <input
                type="number"
                min={1}
                value={editFormQuantity}
                onChange={(e) =>
                  setEditFormQuantity(parseInt(e.target.value, 10) || 1)
                }
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              รหัสออเดอร์
            </label>
            <input
              type="text"
              value={editFormOrderNo}
              onChange={(e) => setEditFormOrderNo(e.target.value)}
              placeholder="เช่น ORD-2026-001"
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-mono font-bold"
            />
          </div>

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
              พิกัด GPS (ละติจูด, ลองจิจูด)
            </label>
            <input
              type="text"
              value={editFormLatLong}
              onChange={(e) => setEditFormLatLong(e.target.value)}
              placeholder="เช่น 13.7563, 100.5018"
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-mono"
            />
          </div>

          <SearchableSelect
            label="สถานะจุดจัดส่ง"
            value={editFormStatus}
            onChange={(val) => setEditFormStatus(String(val))}
            placeholder="-- เลือกสถานะจุดจัดส่ง --"
            options={[
              { value: "pending", label: "รอดำเนินการ", colorDot: "#94a3b8" },
              { value: "in_progress", label: "กำลังส่ง", colorDot: "#eab308" },
              {
                value: "completed",
                label: "สำเร็จ (ส่งสำเร็จ)",
                colorDot: "#22c55e",
              },
              { value: "problem", label: "ติดปัญหา", colorDot: "#f43f5e" },
            ]}
          />
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
      />

      {/* ─── EDIT GROUP STORE DRAWER ─── */}
      <AnimatedDrawer
        isOpen={isEditGroupModalOpen}
        onClose={() => setIsEditGroupModalOpen(false)}
        title={`แก้ไขกลุ่มสายจัดส่ง (${editingGroup?.driverName || ""})`}
        formId="edit-group-store-form"
        onSubmit={handleSaveEditGroup}
        submitLabel={updatingGroup ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
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
            <input
              type="date"
              value={editGroupDate}
              onChange={(e) => setEditGroupDate(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-semibold"
              required
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
            const res = await api.post("/optimoroute/unassigned", {
              date: selectedDate,
              store_id: unassignedStoreId,
              store_name: unassignedStoreName,
              address: unassignedAddress,
              sum_quantity: unassignedQuantity,
              lat_long: unassignedLatLong,
              data_store_no: unassignedOrderNo,
            });
            if (res.data.success) {
              showSuccess(res.data.message || "สร้างรายการรอจัดสายสำเร็จ!");
              setIsCreateUnassignedModalOpen(false);
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
      >
        <div className="space-y-4 text-xs">
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                จำนวนสินค้า (ลัง) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={unassignedQuantity}
                onChange={(e) =>
                  setUnassignedQuantity(parseInt(e.target.value, 10) || 1)
                }
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                รหัสออเดอร์
              </label>
              <input
                type="text"
                value={unassignedOrderNo}
                onChange={(e) => setUnassignedOrderNo(e.target.value)}
                placeholder="เช่น ORD-2026-001"
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              ชื่อร้านค้า
            </label>
            <input
              type="text"
              value={unassignedStoreName}
              onChange={(e) => setUnassignedStoreName(e.target.value)}
              placeholder="ระบุชื่อร้านค้า"
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-semibold"
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
              พิกัด GPS (ละติจูด, ลองจิจูด)
            </label>
            <input
              type="text"
              value={unassignedLatLong}
              onChange={(e) => setUnassignedLatLong(e.target.value)}
              placeholder="เช่น 13.7563, 100.5018"
              className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-mono"
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
        maxWidthClass="max-w-4xl sm:max-w-6xl"
      >
        <div className="space-y-3 text-xs">
          <div className="text-[11px] text-slate-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 leading-relaxed">
            💡 <strong>ไฟล์นำเข้าใช้ 3 ฟิลด์หลัก</strong> (<code>รหัสร้านค้า</code>, <code>จำนวนสินค้า</code>, <code>รหัสออเดอร์</code>) โดยระบบดึง <strong>ชื่อร้านค้า</strong>, <strong>ที่อยู่จัดส่ง</strong> และ <strong>พิกัด GPS</strong> จากฐานข้อมูลมาสเตอร์ร้านค้าให้อัตโนมัติ! (สามารถตรวจสอบและแก้ไขข้อมูลก่อนกดบันทึกได้ครับ)
          </div>

          <div className="max-h-[60vh] overflow-auto border border-slate-200 rounded-lg">
            <table className="w-full text-[11px] text-slate-700 border-collapse">
              <thead className="sticky top-0 bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-2 text-center w-8">#</th>
                  <th className="p-2 w-24">รหัสร้านค้า</th>
                  <th className="p-2 w-36">ชื่อร้านค้า</th>
                  <th className="p-2 min-w-[150px]">ที่อยู่</th>
                  <th className="p-2 w-20 text-center">จำนวน (ลัง)</th>
                  <th className="p-2 w-28">รหัสออเดอร์</th>
                  <th className="p-2 w-28">พิกัด GPS</th>
                  <th className="p-2 text-center w-10">ลบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {excelPreviewStops.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-1.5 text-center font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.store_id}
                        onChange={(e) => {
                          const val = e.target.value;
                          const found = storesList.find(
                            (s) => String(s.store_id).trim().toLowerCase() === val.trim().toLowerCase(),
                          );
                          setExcelPreviewStops((prev) =>
                            prev.map((row) =>
                              row.id === item.id
                                ? {
                                    ...row,
                                    store_id: val,
                                    store_name: found ? found.store_name : row.store_name,
                                    address: found ? found.store_address || "" : row.address,
                                    lat_long: found ? found.store_location || "" : row.lat_long,
                                    is_mapped_master: !!found,
                                  }
                                : row,
                            ),
                          );
                        }}
                        className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs font-mono font-bold text-slate-900"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.store_name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setExcelPreviewStops((prev) =>
                            prev.map((row) =>
                              row.id === item.id
                                ? { ...row, store_name: val }
                                : row,
                            ),
                          );
                        }}
                        className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs font-semibold"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.address}
                        onChange={(e) => {
                          const val = e.target.value;
                          setExcelPreviewStops((prev) =>
                            prev.map((row) =>
                              row.id === item.id
                                ? { ...row, address: val }
                                : row,
                            ),
                          );
                        }}
                        className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        min={1}
                        value={item.sum_quantity}
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
                        className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs text-center font-bold text-amber-700"
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
                        className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs font-mono"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.lat_long}
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
                        className="w-full border border-slate-200 rounded px-1.5 py-1 text-[10px] font-mono"
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
              </tbody>
            </table>
          </div>
        </div>
      </AnimatedDrawer>

      {/* ─── AUTO ROUTING CALCULATION DRAWER ─── */}
      <AnimatedDrawer
        isOpen={isAutoRouteDrawerOpen}
        onClose={() => setIsAutoRouteDrawerOpen(false)}
        title="⚡ ตัวเลือกคำนวณและจัดสายรถอัตโนมัติ"
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
        maxWidthClass="max-w-xl sm:max-w-3xl"
      >
        <div className="space-y-4 text-xs">
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-slate-700 leading-relaxed">
            ระบบจะนำรายการรอจัดสายจำนวน{" "}
            <strong>{unassignedStops.length} รายการ</strong>{" "}
            มาประมวลผลจัดกลุ่มพื้นที่ (Spatial Clustering)
            และสร้างสายรถประจำกลุ่มให้อัตโนมัติ
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-2">
              กลยุทธ์การคำนวณจัดสาย
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                {
                  id: "shortest_distance",
                  label: "ระยะทางใกล้สุด",
                  icon: "📐",
                },
                {
                  id: "lowest_fuel",
                  label: "ใช้น้ำมัน/เวลาน้อยสุด",
                  icon: "⛽",
                },
                {
                  id: "avoid_tolls",
                  label: "เลี่ยงทางด่วน/ทางหลวง",
                  icon: "🛣️",
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAutoRouteStrategy(opt.id as any)}
                  className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                    autoRouteStrategy === opt.id
                      ? "border-blue-600 bg-blue-50/80 text-blue-900 font-bold shadow-2xs"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-base">{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                จำนวนสินค้าสูงสุดต่อคัน (ลัง)
              </label>
              <input
                type="number"
                min={10}
                value={autoRouteMaxLoad}
                onChange={(e) =>
                  setAutoRouteMaxLoad(parseInt(e.target.value, 10) || 100)
                }
                className="w-full border border-slate-200 rounded-lg p-2.5 font-bold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                จำนวนจุดส่งสูงสุดต่อคัน (จุด)
              </label>
              <input
                type="number"
                min={1}
                value={autoRouteMaxStops}
                onChange={(e) =>
                  setAutoRouteMaxStops(parseInt(e.target.value, 10) || 15)
                }
                className="w-full border border-slate-200 rounded-lg p-2.5 font-bold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-2">
              เลือกรถที่ต้องการนำมาจัดสาย ({autoRouteSelectedVehicles.length}{" "}
              คันที่เลือก)
            </label>
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
                        className={`font-bold ${isAssigned ? "text-slate-400 line-through" : "text-slate-800"}`}
                      >
                        {v.license_plate}
                      </span>
                      {v.brand && (
                        <span className="text-slate-500">
                          ({v.brand} {v.model})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        บรรจุได้ {capacity} ลัง
                      </span>
                      {isAssigned && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
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
      />
    </div>
  );
};

export default OptimoRoutePage;
