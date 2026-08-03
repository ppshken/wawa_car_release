import React, { useEffect, useState, useCallback, useMemo } from "react";
import api, { getImageUrl } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { QuickActionModal } from "../components/QuickActionModal";
import { ConfirmModal } from "../components/ConfirmModal";
import { PaginationControl } from "../components/PaginationControl";
import { AnimatedDrawer } from "../components/AnimatedDrawer";
import { SearchableSelect } from "../components/SearchableSelect";
import { ReleaseGpsMapTab } from "../components/ReleaseGpsMapTab";
import { ReleaseChatTab } from "../components/ReleaseChatTab";
import { DeliveryCheckInOutModal } from "../components/DeliveryCheckInOutModal";
import { ExportDrawer } from "../components/ExportDrawer";
import ImageLightboxModal, {
  LightboxImage,
} from "../components/ImageLightboxModal";
import {
  Plus,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit2,
  X,
  Key,
  Camera,
  ShieldCheck,
  Wallet,
  FileText,
  PackageCheck,
  RotateCcw,
  Coins,
  MessageSquare,
  Truck,
  Search,
  Eye,
  Calendar,
  Clock,
  Plane,
  GraduationCap,
  Building2,
  Users,
  Briefcase,
  PackagePlus,
  Handshake,
  UserPlus,
  CheckIcon,
  ChevronRight,
} from "lucide-react";
import {
  ColumnToggleDropdown,
  ColumnItem,
} from "../components/ColumnToggleDropdown";
import { CustomDatePicker } from "../components/CustomDatePicker";

const CAR_RELEASE_TABLE_COLUMNS: ColumnItem[] = [
  { id: "car_release_no", label: "เลขที่ปล่อยรถ" },
  { id: "car_release_type_name", label: "ประเภทปล่อยรถ" },
  { id: "license_plate", label: "ทะเบียนรถ" },
  { id: "brand_model", label: "ยี่ห้อ/รุ่นรถ" },
  { id: "progress", label: "ความคืบหน้า" },
  { id: "group_store", label: "กรุ๊ปรถ" },
  { id: "release_status", label: "สถานะปล่อยรถ" },
  { id: "return_status", label: "คืนรถ" },
  { id: "allowance", label: "เบี้ยเลี้ยง" },
  { id: "accounting_status", label: "สถานะทางบัญชี" },
  { id: "total_number_of_bills", label: "จำนวนบิล" },
  { id: "total_amount", label: "ยอดเงินรวม (บาท)" },
  { id: "mileage", label: "เลขไมล์" },
  { id: "pda_device", label: "อุปกรณ์ PDA" },
  { id: "driver_name", label: "คนขับ" },
  { id: "driver_phone", label: "เบอร์โทรคนขับ" },
  { id: "follower_name", label: "ผู้ติดตาม" },
  { id: "created_at", label: "เวลาสร้าง/ปล่อยรถ" },
  { id: "description", label: "หมายเหตุ" },
  { id: "actions", label: "จัดการ" },
];

interface CarReleaseData {
  car_release_id: number;
  car_release_no: string;
  car_id: number;
  group_store_id: number;
  group_store_name: string;
  group_color: string;
  user_id: number;
  driver_name: string;
  driver_phone: string;
  follower_name: string;
  followers: any[];
  controlled_type: string;
  car_image: string;
  license_plate: string;
  brand: string;
  model: string;
  sub_model: string;
  brand_model: string;
  is_returned: boolean | number;
  completed_stores: number;
  total_stores: number;
  allowance: string;
  allowance_paid: string;
  accounting_status_name: string;
  accounting_status_id: number;
  mileage: number;
  user_image: string;
  pda_device: number;
  pda_device_name: string;
  total_number_of_bills: number;
  total_amount: string | number;
  description: string;
  image_mileage: string;
  image_front: string;
  image_around_1: string;
  image_around_2: string;
  image_around_3: string;
  image_around_4: string;
  image_around_5: string;
  image_pda: string;
  car_release_type_id: number;
  car_release_type_name: string;
  created_at: string;
}

const formatMoney = (number: number | string) => {
  return Number(number).toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const getRouteStopStatus = (store: any) => {
  if (store.problem_id || store.status === "problem") return "problem";
  if (store.check_out_id || store.status === "completed") return "completed";
  if (store.check_in_id || store.status === "in_progress") return "in_progress";
  return store.status || "unassigned";
};

const getRouteStatusStyle = (status: string) => {
  if (status === "completed") return { bg: "#dcfce7", text: "#166534" };
  if (status === "problem" || status === "failed")
    return { bg: "#fee2e2", text: "#991b1b" };
  if (status === "in_progress") return { bg: "#fef9c3", text: "#854d0e" };
  return { bg: "#f1f5f9", text: "#475569" };
};

const getRouteStatusLabel = (status: string) => {
  if (status === "completed") return "สำเร็จ";
  if (status === "problem" || status === "failed") return "ติดปัญหา";
  if (status === "in_progress") return "รอดำเนินการ";
  return "ยังไม่จัดสาย";
};

const formatRouteServiceTime = (value?: string) => {
  if (!value) return "-";
  if (!value.includes("T") && !value.includes("-")) return value.slice(0, 5);
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
};

const formatDateNumeric = (val?: any) => {
  if (!val || val === "-") return "-";
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed || trimmed === "Invalid Date") return "-";
    if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(trimmed)) {
      return trimmed;
    }
  }
  let dateObj = new Date(val);
  if (
    Number.isNaN(dateObj.getTime()) &&
    typeof val === "string" &&
    val.includes(" ")
  ) {
    dateObj = new Date(val.replace(" ", "T"));
  }
  if (Number.isNaN(dateObj.getTime())) {
    return typeof val === "string" && val !== "Invalid Date" ? val : "-";
  }
  const dd = dateObj.getDate();
  const mmm = dateObj.getMonth() + 1;
  const yyyy = dateObj.getFullYear();

  const hh = dateObj.getHours();
  const mm = dateObj.getMinutes();
  const ss = dateObj.getSeconds();

  return `${dd}/${mmm}/${yyyy} ${hh}:${mm}:${ss}`;
};

const formatDateTimeString = (val?: any) => {
  if (!val || val === "-") return "-";
  return formatDateNumeric(val);
};

const getRouteDuration = (start?: string, end?: string) => {
  if (!start || !end) return "-";
  const duration = new Date(end).getTime() - new Date(start).getTime();
  if (Number.isNaN(duration) || duration < 0) return "-";
  const seconds = Math.round(duration / 1000);
  return seconds < 60
    ? `${seconds}s`
    : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
};

const getEarlyDelayBadge = (
  scheduledTime?: string,
  startServiceTime?: string,
) => {
  if (!scheduledTime) return null;
  const formattedScheduled = scheduledTime.slice(0, 5);

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

  const schedParts = scheduledTime.split(":");
  const schedMins =
    (parseInt(schedParts[0], 10) || 0) * 60 +
    (parseInt(schedParts[1], 10) || 0);
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
    const txt = h > 0 ? `${h}h ${m}m ก่อนเวลา` : `${m}m ก่อนเวลา`;
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
    const txt = h > 0 ? `${h}h ${m}m เลท` : `${m}m เลท`;
    return {
      scheduledText: formattedScheduled,
      startText: startTimeFormatted,
      earlyDelayText: txt,
      isEarly: false,
      isDelay: true,
    };
  }
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

export const CarReleaseList: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [releases, setReleases] = useState<any[]>([]);
  const [selectedRelease, setSelectedRelease] = useState<any | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<
    "info" | "gps" | "chat"
  >("info");
  const [selectedStoreItem, setSelectedStoreItem] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState<string>("");
  const [modalAction, setModalAction] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Helper for today's date (YYYY-MM-DD)
  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Date Filter & Pagination State
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const savedMode = localStorage.getItem("car_release_date_filter_mode");
    const savedDate = localStorage.getItem("car_release_date_filter_value");
    if (savedMode === "all") {
      return "";
    }
    const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;
    if (savedMode === "today") {
      return today;
    }
    if (savedMode === "custom" && savedDate !== null) {
      return savedDate;
    }
    return today;
  });

  const updateDateFilter = useCallback(
    (dateVal: string, mode?: "today" | "all" | "custom") => {
      setSelectedDate(dateVal);
      setCurrentPage(1);
      const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;
      if (mode === "today" || dateVal === today) {
        localStorage.setItem("car_release_date_filter_mode", "today");
        localStorage.setItem("car_release_date_filter_value", today);
      } else if (mode === "all" || !dateVal) {
        localStorage.setItem("car_release_date_filter_mode", "all");
        localStorage.setItem("car_release_date_filter_value", "");
      } else {
        localStorage.setItem("car_release_date_filter_mode", "custom");
        localStorage.setItem("car_release_date_filter_value", dateVal);
      }
    },
    [],
  );
  const [activeReleaseDates, setActiveReleaseDates] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [operationMenus, setOperationMenus] = useState<any[]>([]);

  // 5 Dropdown Filter States & Panel Toggle
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(false);
  const [filterReleaseStatus, setFilterReleaseStatus] = useState<string>("all");
  const [filterReturnStatus, setFilterReturnStatus] = useState<string>("all");
  const [filterAccountingStatus, setFilterAccountingStatus] =
    useState<string>("all");
  const [filterDriverId, setFilterDriverId] = useState<string>("all");
  const [filterLicensePlate, setFilterLicensePlate] = useState<string>("all");

  // Accounting Status Drawer State
  const [isAccountingDrawerOpen, setIsAccountingDrawerOpen] =
    useState<boolean>(false);
  const [accFormStatusId, setAccFormStatusId] = useState<string | number>("");
  const [accFormNote, setAccFormNote] = useState<string>("");
  const [isSubmittingAcc, setIsSubmittingAcc] = useState<boolean>(false);

  // Export Drawer State & Helpers
  const [isExportDrawerOpen, setIsExportDrawerOpen] = useState<boolean>(false);

  const exportColumns = useMemo(
    () =>
      CAR_RELEASE_TABLE_COLUMNS.filter((c) => c.id !== "actions").map((c) => ({
        id: c.id,
        label: c.label,
      })),
    [],
  );

  const getExportValue = useCallback(
    (item: any, columnId: string): string | number => {
      switch (columnId) {
        case "car_release_no":
          return item.car_release_no || "-";
        case "car_release_type_name":
          return item.car_release_type_name || item.car_release_type || "-";
        case "license_plate":
          return item.license_plate || "-";
        case "brand_model":
          return item.brand_model || item.car_model || "-";
        case "progress":
          return `${item.completedStores ?? item.stores_completed_count ?? 0}/${item.totalStores ?? item.total_stores_count ?? 0}`;
        case "group_store":
          return item.group_store_name && item.group_store_name !== "-"
            ? item.group_store_name
            : item.brand_model || item.group_store_id || "-";
        case "release_status": {
          const isDone =
            (item.completedStores === item.totalStores &&
              item.totalStores > 0) ||
            item.is_returned;
          return isDone ? "เสร็จสิ้น" : "ดำเนินการอยู่";
        }
        case "return_status":
          return item.is_returned || item.car_return
            ? "คืนรถแล้ว"
            : "ยังไม่คืนรถ";
        case "allowance":
          return item.allowance !== undefined &&
            item.allowance !== null &&
            item.allowance !== ""
            ? item.allowance
            : item.allowance_amount
              ? `${Number(item.allowance_amount).toLocaleString()} บาท`
              : "-";
        case "accounting_status":
          return item.accounting_status_name || item.accounting_status || "-";
        case "total_number_of_bills":
          return item.total_number_of_bills !== undefined &&
            item.total_number_of_bills !== null &&
            item.total_number_of_bills !== ""
            ? item.total_number_of_bills
            : "-";
        case "total_amount":
          return item.total_amount !== undefined &&
            item.total_amount !== null &&
            item.total_amount !== ""
            ? item.total_amount !== "-"
              ? `฿${item.total_amount}`
              : "-"
            : "-";
        case "mileage":
          return item.mileage !== undefined &&
            item.mileage !== null &&
            item.mileage !== ""
            ? `${Number(item.mileage).toLocaleString()} กม.`
            : "-";
        case "pda_device":
          return item.pda_device_name || item.pda_device || "-";
        case "driver_name":
          return item.driver_name || "-";
        case "driver_phone":
          return item.driver_phone || "-";
        case "follower_name":
          return Array.isArray(item.followers) && item.followers.length > 0
            ? item.followers
                .map((f: any) =>
                  typeof f === "string" ? f : f.follower_name || f.name,
                )
                .join(", ")
            : item.follower_name || "-";
        case "created_at":
          return item.created_at || item.release_date || "-";
        case "description":
          return item.description || item.accounting_note || "-";
        default:
          return item[columnId] ?? "-";
      }
    },
    [],
  );

  // Filter Options for SearchableSelect
  const releaseStatusOptions = useMemo(
    () => [
      { value: "all", label: "-- ทั้งหมด --" },
      { value: "released", label: "ดำเนินการอยู่" },
      { value: "completed", label: "เสร็จสิ้น" },
    ],
    [],
  );

  const returnStatusOptions = useMemo(
    () => [
      { value: "all", label: "-- ทั้งหมด --" },
      { value: "returned", label: "คืนรถแล้ว" },
      { value: "unreturned", label: "ยังไม่คืนรถ" },
    ],
    [],
  );

  const fetchActiveReleaseDates = useCallback(async () => {
    try {
      const res = await api.get("/car-release/active-dates");
      if (res.data.success && Array.isArray(res.data.activeDates)) {
        setActiveReleaseDates(res.data.activeDates);
      }
    } catch (err) {
      console.error("Fetch active car release dates error:", err);
    }
  }, []);

  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    () => {
      const saved = localStorage.getItem("wawa_car_release_visible_cols");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
      return {
        car_release_no: true,
        car_release_type_name: true,
        license_plate: true,
        brand_model: false,
        progress: true,
        group_store: true,
        release_status: true,
        return_status: true,
        allowance: true,
        accounting_status: true,
        total_number_of_bills: true,
        total_amount: true,
        mileage: true,
        pda_device: true,
        driver_name: true,
        driver_phone: false,
        follower_name: true,
        created_at: true,
        description: false,
        actions: true,
      };
    },
  );

  const handleColumnChange = (updated: Record<string, boolean>) => {
    setVisibleColumns(updated);
    localStorage.setItem(
      "wawa_car_release_visible_cols",
      JSON.stringify(updated),
    );
  };

  // Delete Modal
  const [releaseToDelete, setReleaseToDelete] = useState<any | null>(null);

  // Database Master Options
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [groupStores, setGroupStores] = useState<any[]>([]);
  const [pdaDevices, setPdaDevices] = useState<any[]>([]);
  const [accountingStatuses, setAccountingStatuses] = useState<any[]>([]);
  const [releaseTypes, setReleaseTypes] = useState<any[]>([]);
  const [keyHolders, setKeyHolders] = useState<any[]>([]);
  const [parkings, setParkings] = useState<any[]>([]);
  const [loadingTypesList, setLoadingTypesList] = useState<any[]>([]);

  // Car Return Drawer & Form State
  const [isReturnDrawerOpen, setIsReturnDrawerOpen] = useState(false);
  const [returnTargetRelease, setReturnTargetRelease] = useState<any | null>(
    null,
  );
  const [returnMileage, setReturnMileage] = useState<number>(0);
  const [returnKeyHolderId, setReturnKeyHolderId] = useState<string | number>(
    "",
  );
  const [returnParkingId, setReturnParkingId] = useState<string | number>("");
  const [returnGasBill, setReturnGasBill] = useState<string | number>("");
  const [returnNote, setReturnNote] = useState<string>("");

  // Car Return Photos (8 fields)
  const [returnImgMileage, setReturnImgMileage] = useState<string>("");
  const [returnImgFront, setReturnImgFront] = useState<string>("");
  const [returnImgAround1, setReturnImgAround1] = useState<string>("");
  const [returnImgAround2, setReturnImgAround2] = useState<string>("");
  const [returnImgAround3, setReturnImgAround3] = useState<string>("");
  const [returnImgAround4, setReturnImgAround4] = useState<string>("");
  const [returnImgReturn, setReturnImgReturn] = useState<string>("");
  const [returnImgPda, setReturnImgPda] = useState<string>("");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  // Lightbox Image Preview Modal
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    title: string;
  } | null>(null);

  const [lightboxImages, setLightboxImages] = useState<LightboxImage[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  const openLightbox = useCallback((images: LightboxImage[], index = 0) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  }, []);

  // Group Delivery List Preview State
  const [groupStoresPreview, setGroupStoresPreview] = useState<any[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);

  // Form State
  const [formCarId, setFormCarId] = useState<string | number>("");
  const [formUserId, setFormUserId] = useState<string | number>("");
  const [formGroupStoreId, setFormGroupStoreId] = useState<string | number>("");
  const [formReleaseTypeId, setFormReleaseTypeId] = useState<string | number>(
    "1",
  );
  const [formPlateText, setFormPlateText] = useState<string>("");
  const [formCarBrandModel, setFormCarBrandModel] = useState<string>("");
  const [formDriverName, setFormDriverName] = useState<string>("");
  const [formFollowers, setFormFollowers] = useState<string[]>([]);
  const [followerSearch, setFollowerSearch] = useState<string>("");
  const [formMileage, setFormMileage] = useState<number>(0);
  const [formAllowance, setFormAllowance] = useState<string>("");
  const [formPda, setFormPda] = useState<number>(0);
  const [formAccountingStatus, setFormAccountingStatus] = useState<
    string | number
  >("");
  const [formDescription, setFormDescription] = useState<string>("");

  // Photo States (Base64 / Image URLs)
  const [imgMileage, setImgMileage] = useState<string>("");
  const [imgFront, setImgFront] = useState<string>("");
  const [imgAround1, setImgAround1] = useState<string>("");
  const [imgAround2, setImgAround2] = useState<string>("");
  const [imgAround3, setImgAround3] = useState<string>("");
  const [imgAround4, setImgAround4] = useState<string>("");
  const [imgAround5, setImgAround5] = useState<string>("");
  const [imgPda, setImgPda] = useState<string>("");

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGroupChange = (gid: string) => {
    const group = groupStores.find(
      (g) => String(g.group_store_id) === String(gid),
    );
    const isUsed =
      group &&
      (usedGroupIds.has(String(group.group_store_id)) ||
        Boolean(group.is_released) ||
        Number(group.status) === 1 ||
        String(group.status) === "1");
    const isSelectedInForm = String(gid) === String(formGroupStoreId);
    if (isUsed && !isSelectedInForm && !editingId) {
      showError(
        "กรุ๊ปรถนี้ได้ถูกสร้างใบปล่อยรถไปแล้วในวันนี้ ไม่สามารถเลือกซ้ำวันเดียวกันได้",
      );
      return;
    }

    setFormGroupStoreId(gid);
    if (group && group.car_id) {
      const matchedVeh = vehicles.find(
        (v) => String(v.car_id) === String(group.car_id),
      );
      if (matchedVeh) {
        setFormCarId(matchedVeh.car_id);
        setFormPlateText(matchedVeh.license_plate);
        setFormCarBrandModel(
          `${matchedVeh.brand || ""} ${matchedVeh.model || ""}`.trim(),
        );
      } else {
        setFormCarId(group.car_id);
        setFormPlateText(group.car_id);
        setFormCarBrandModel("รถประจำกรุ๊ป");
      }
    } else if (vehicles.length > 0) {
      const idx = (Number(gid) || 0) % vehicles.length;
      const v = vehicles[idx] || vehicles[0];
      setFormCarId(v.car_id);
      setFormPlateText(v.license_plate);
      setFormCarBrandModel(`${v.brand || ""} ${v.model || ""}`.trim());
    }
  };

  // Fetch stores in selected group for preview table
  useEffect(() => {
    if (!formGroupStoreId) {
      setGroupStoresPreview([]);
      return;
    }
    let isMounted = true;
    setIsLoadingPreview(true);
    api
      .get(`/master/group-stores/${formGroupStoreId}/stores`)
      .then((res) => {
        if (isMounted) {
          if (
            res.data.success &&
            Array.isArray(res.data.items || res.data.stores)
          ) {
            setGroupStoresPreview(res.data.items || res.data.stores);
          } else {
            setGroupStoresPreview([]);
          }
        }
      })
      .catch((err) => {
        console.error("Fetch group stores preview error:", err);
        if (isMounted) setGroupStoresPreview([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingPreview(false);
      });

    return () => {
      isMounted = false;
    };
  }, [formGroupStoreId]);

  const fetchMasterData = useCallback(async () => {
    try {
      const [
        vRes,
        uRes,
        gRes,
        pRes,
        aRes,
        rtRes,
        khRes,
        pkRes,
        ltRes,
        opMenuRes,
      ] = await Promise.allSettled([
        api.get("/master/vehicles"),
        api.get("/users/driver"),
        api.get("/master/group-stores"),
        api.get("/master/pda"),
        api.get("/master/accounting-status"),
        api.get("/master/car-release-types"),
        api.get("/master/keys"),
        api.get("/master/parking"),
        api.get("/master/loading-types"),
        api.get("/master/operation-menus"),
      ]);

      if (vRes.status === "fulfilled" && vRes.value.data.vehicles) {
        setVehicles(vRes.value.data.vehicles);
      }
      if (uRes.status === "fulfilled" && uRes.value.data.users) {
        setDrivers(uRes.value.data.users);
      }
      if (gRes.status === "fulfilled" && gRes.value.data.groups) {
        setGroupStores(gRes.value.data.groups);
      }
      if (pRes.status === "fulfilled" && pRes.value.data.pdas) {
        setPdaDevices(pRes.value.data.pdas);
      }
      if (
        aRes.status === "fulfilled" &&
        (aRes.value.data.statuses || aRes.value.data.accounting_statuses)
      ) {
        setAccountingStatuses(
          aRes.value.data.statuses || aRes.value.data.accounting_statuses,
        );
      }
      if (rtRes.status === "fulfilled" && rtRes.value.data.releaseTypes) {
        setReleaseTypes(rtRes.value.data.releaseTypes);
      }
      if (
        khRes.status === "fulfilled" &&
        (khRes.value.data.keys || khRes.value.data.keyHolders)
      ) {
        setKeyHolders(
          khRes.value.data.keys || khRes.value.data.keyHolders || [],
        );
      }
      if (
        pkRes.status === "fulfilled" &&
        (pkRes.value.data.parking || pkRes.value.data.parkings)
      ) {
        setParkings(
          pkRes.value.data.parking || pkRes.value.data.parkings || [],
        );
      }
      if (ltRes.status === "fulfilled" && ltRes.value.data) {
        const lTypes =
          ltRes.value.data.loadingTypes ||
          ltRes.value.data.loading_types ||
          ltRes.value.data.items ||
          ltRes.value.data.types ||
          [];
        setLoadingTypesList(lTypes);
      }
      if (
        opMenuRes.status === "fulfilled" &&
        (opMenuRes.value.data.menus || opMenuRes.value.data.operationMenus)
      ) {
        setOperationMenus(
          opMenuRes.value.data.menus ||
            opMenuRes.value.data.operationMenus ||
            [],
        );
      }
    } catch (err) {
      console.error("Fetch master options error:", err);
    }
  }, []);

  const keyHolderOptions = useMemo(() => {
    return keyHolders.map((kh) => ({
      value: String(kh.key_holder_id),
      label: kh.key_holder_name || kh.name || `จุดฝากที่ ${kh.key_holder_id}`,
    }));
  }, [keyHolders]);

  const parkingOptions = useMemo(() => {
    return parkings.map((pk) => ({
      value: String(pk.parking_id),
      label: pk.parking_name || pk.name || `ลานจอดที่ ${pk.parking_id}`,
    }));
  }, [parkings]);

  const visibleOperationMenus = useMemo(() => {
    const userLevelId = String(
      user?.level_user_id || (user as any)?.level_id || 1,
    );
    if (!operationMenus || operationMenus.length === 0) {
      return [
        {
          id: 1,
          menu_name: "รีเซ็ตกุญแจ",
          action_key: "reset_key",
          icon: "Key",
        },
        {
          id: 2,
          menu_name: "รูปให้ของ",
          action_key: "cargo_photo",
          icon: "Camera",
        },
        {
          id: 3,
          menu_name: "สถานะบัญชี",
          action_key: "accounting",
          icon: "ShieldCheck",
        },
        {
          id: 4,
          menu_name: "เพิ่มร้านค้า",
          action_key: "add_store",
          icon: "Plus",
        },
        { id: 5, menu_name: "ติดตาม", action_key: "followup", icon: "Truck" },
        { id: 6, menu_name: "ฝากเงิน", action_key: "deposit", icon: "Wallet" },
        {
          id: 7,
          menu_name: "เอกสารคืนของ",
          action_key: "return_docs",
          icon: "FileText",
        },
        {
          id: 8,
          menu_name: "สินค้าควบคุม",
          action_key: "controlled_items",
          icon: "PackageCheck",
        },
        {
          id: 9,
          menu_name: "คืนรถ",
          action_key: "car_return",
          icon: "RotateCcw",
        },
        {
          id: 10,
          menu_name: "เบี้ยเลี้ยง",
          action_key: "allowance",
          icon: "Coins",
        },
      ];
    }

    return operationMenus.filter((m: any) => {
      const isActive =
        m.status === "active" || m.status === 1 || m.status === "1";
      if (!isActive) return false;
      if (user?.level_user_id === 1) return true;
      if (
        !m.access ||
        typeof m.access !== "object" ||
        Object.keys(m.access).length === 0
      )
        return true;
      return Boolean(m.access[userLevelId]);
    });
  }, [operationMenus, user]);

  const renderQuickActionIcon = (iconName: string) => {
    const ICON_MAP: Record<string, any> = {
      Key,
      Camera,
      ShieldCheck,
      Plus,
      Truck,
      Wallet,
      FileText,
      PackageCheck,
      RotateCcw,
      Coins,
    };
    const IconComponent = ICON_MAP[iconName] || FileText;
    return <IconComponent className="w-4 h-4 mb-1 shrink-0" />;
  };

  // Default Loading Types fallback if master API returns empty
  const DEFAULT_LOADING_TYPES = useMemo(
    () => [
      {
        loading_type_id: 1,
        type_code: "CRATE",
        type_name: "ลัง",
        unit_name: "ลัง",
        is_active: 1,
      },
      {
        loading_type_id: 2,
        type_code: "BASKET",
        type_name: "กระบะ",
        unit_name: "ใบ",
        is_active: 1,
      },
      {
        loading_type_id: 3,
        type_code: "PALLET",
        type_name: "พาเลท",
        unit_name: "พาเลท",
        is_active: 1,
      },
      {
        loading_type_id: 4,
        type_code: "BOX",
        type_name: "กล่อง",
        unit_name: "กล่อง",
        is_active: 1,
      },
      {
        loading_type_id: 5,
        type_code: "STEEL_CAGE",
        type_name: "กรงเหล็ก",
        unit_name: "กรง",
        is_active: 1,
      },
    ],
    [],
  );

  // Active Loading Types
  const activeLoadingTypes = useMemo(() => {
    const list =
      Array.isArray(loadingTypesList) && loadingTypesList.length > 0
        ? loadingTypesList
        : DEFAULT_LOADING_TYPES;
    return list.filter(
      (lt: any) =>
        lt.is_active === 1 ||
        lt.is_active === true ||
        lt.is_active === undefined,
    );
  }, [loadingTypesList, DEFAULT_LOADING_TYPES]);

  // Helper to extract load quantity for a store and a loading type
  const getStoreLoadQty = useCallback((st: any, lt: any) => {
    if (!st || !lt) return 0;
    let qty = 0;

    // 1. Match from st.loads array
    if (Array.isArray(st.loads) && st.loads.length > 0) {
      const loadObj = st.loads.find((l: any) => {
        if (
          l.loading_type_id !== undefined &&
          Number(l.loading_type_id) === Number(lt.loading_type_id)
        )
          return true;
        if (
          l.type_code &&
          lt.type_code &&
          String(l.type_code).trim().toUpperCase() ===
            String(lt.type_code).trim().toUpperCase()
        )
          return true;
        const lName = String(l.type_name || l.loading_type_name || "")
          .trim()
          .toLowerCase();
        const ltName = String(lt.type_name || lt.loading_type_name || "")
          .trim()
          .toLowerCase();
        if (
          lName &&
          ltName &&
          (lName.includes(ltName) || ltName.includes(lName))
        )
          return true;
        return false;
      });
      if (loadObj) qty = Number(loadObj.quantity || loadObj.qty || 0);
    }

    // 2. Match from property key st[`loading_type_${lt.loading_type_id}`]
    if (
      !qty &&
      lt.loading_type_id !== undefined &&
      st[`loading_type_${lt.loading_type_id}`] !== undefined
    ) {
      qty = Number(st[`loading_type_${lt.loading_type_id}`] || 0);
    }

    // 3. Match from property key st[`load_${lt.type_code}`] or st[`load_${lt.loading_type_id}`]
    if (
      !qty &&
      lt.type_code &&
      st[`load_${String(lt.type_code).toLowerCase()}`] !== undefined
    ) {
      qty = Number(st[`load_${String(lt.type_code).toLowerCase()}`] || 0);
    }

    // 4. Match fallback from st.loading_type_name
    if (!qty && st.loading_type_name) {
      const name = String(st.loading_type_name).trim().toLowerCase();
      const ltName = String(lt.type_name || lt.loading_type_name || "")
        .trim()
        .toLowerCase();
      if (name && ltName && (name.includes(ltName) || ltName.includes(name))) {
        qty = Number(st.sum_quantity || st.quantity || 1);
      }
    }

    // 5. Fallback for legacy columns load1 (CRATE/ลัง) if type_code is CRATE or type_name contains ลัง
    if (
      !qty &&
      (lt.type_code === "CRATE" || String(lt.type_name).includes("ลัง"))
    ) {
      if (st.load1 !== undefined && st.load1 !== null && Number(st.load1) > 0) {
        qty = Number(st.load1 || 0);
      }
    }

    // 6. Generic fallback: if store has sum_quantity and no loads array specified, assign sum_quantity to CRATE / first default
    if (
      !qty &&
      Number(st.sum_quantity || st.quantity) > 0 &&
      (!st.loads || st.loads.length === 0)
    ) {
      if (
        lt.type_code === "CRATE" ||
        String(lt.type_name).includes("ลัง") ||
        Number(lt.loading_type_id) === 1
      ) {
        qty = Number(st.sum_quantity || st.quantity || 0);
      }
    }

    return qty;
  }, []);

  // Delivery Stores Summary (Status, Payment Types, & Cargo Loading Types)
  const deliverySummary = useMemo(() => {
    if (!selectedRelease?.stores || !Array.isArray(selectedRelease.stores)) {
      return {
        pendingCount: 0,
        completedCount: 0,
        problemCount: 0,
        totalStores: 0,
        cashCount: 0,
        cashAmount: 0,
        transferCount: 0,
        transferAmount: 0,
        creditCount: 0,
        creditAmount: 0,
        otherPaymentCount: 0,
        otherPaymentAmount: 0,
        totalAmount: 0,
        loadingSummary: [],
        totalCargoQty: 0,
      };
    }

    const stores = selectedRelease.stores;
    let pendingCount = 0;
    let completedCount = 0;
    let problemCount = 0;

    let cashCount = 0;
    let cashAmount = 0;
    let transferCount = 0;
    let transferAmount = 0;
    let creditCount = 0;
    let creditAmount = 0;
    let otherPaymentCount = 0;
    let otherPaymentAmount = 0;
    let totalAmount = 0;

    stores.forEach((st: any) => {
      const status = getRouteStopStatus(st);
      if (status === "completed") {
        completedCount++;
      } else if (status === "problem" || status === "failed") {
        problemCount++;
      } else {
        pendingCount++;
      }

      const pName = String(
        st.payment_name || st.payment_type_name || st.payment_type || "",
      ).toLowerCase();
      const amt = Number(st.amount || st.sum_amount || 0);
      totalAmount += amt;

      if (pName.includes("เงินสด") || pName.includes("cash")) {
        cashCount++;
        cashAmount += amt;
      } else if (
        pName.includes("โอน") ||
        pName.includes("transfer") ||
        pName.includes("qr")
      ) {
        transferCount++;
        transferAmount += amt;
      } else if (pName.includes("เครดิต") || pName.includes("credit")) {
        creditCount++;
        creditAmount += amt;
      } else {
        otherPaymentCount++;
        otherPaymentAmount += amt;
      }
    });

    // Compute summary for active cargo loading types
    const loadingSummary: {
      loading_type_id: number;
      type_name: string;
      unit_name: string;
      totalQty: number;
    }[] = [];
    let totalCargoQty = 0;

    activeLoadingTypes.forEach((lt: any) => {
      let sumQty = 0;
      stores.forEach((st: any) => {
        sumQty += getStoreLoadQty(st, lt);
      });

      if (sumQty > 0) {
        loadingSummary.push({
          loading_type_id: lt.loading_type_id,
          type_name: lt.type_name || lt.loading_type_name || "รายการ",
          unit_name: lt.unit_name || "ชิ้น",
          totalQty: sumQty,
        });
        totalCargoQty += sumQty;
      }
    });

    return {
      pendingCount,
      completedCount,
      problemCount,
      totalStores: stores.length,
      cashCount,
      cashAmount,
      transferCount,
      transferAmount,
      creditCount,
      creditAmount,
      otherPaymentCount,
      otherPaymentAmount,
      totalAmount,
      loadingSummary,
      totalCargoQty,
    };
  }, [selectedRelease?.stores, activeLoadingTypes, getStoreLoadQty]);

  // Option lists for SearchableSelect
  const todayDateStr = useMemo(
    () => new Date().toLocaleDateString("th-TH"),
    [],
  );

  // Today's releases (excluding currently edited release)
  const todayReleases = useMemo(() => {
    return releases.filter((r) => {
      if (editingId && String(r.car_release_id) === String(editingId))
        return false;
      return r.dateGroup === todayDateStr || !selectedDate;
    });
  }, [releases, editingId, todayDateStr, selectedDate]);

  // Set of group_store_ids used today
  const usedGroupIds = useMemo(() => {
    const set = new Set<string>();
    todayReleases.forEach((r) => {
      if (r.group_store_id) set.add(String(r.group_store_id));
    });
    return set;
  }, [todayReleases]);

  // Set of driver user_ids used today
  const usedDriverIds = useMemo(() => {
    const set = new Set<string>();
    todayReleases.forEach((r) => {
      if (r.user_id) set.add(String(r.user_id));
    });
    return set;
  }, [todayReleases]);

  // Set of follower names used today or driver names used today
  const usedFollowerNames = useMemo(() => {
    const set = new Set<string>();
    todayReleases.forEach((r) => {
      if (r.driver_name && r.driver_name !== "ไม่ระบุ") {
        set.add(r.driver_name.trim().toLowerCase());
      }
      if (Array.isArray(r.followers)) {
        r.followers.forEach((f: any) => {
          const name = typeof f === "string" ? f : f.follower_name;
          if (name) set.add(name.trim().toLowerCase());
        });
      } else if (r.follower_name && r.follower_name !== "-") {
        r.follower_name.split(",").forEach((s: string) => {
          if (s.trim()) set.add(s.trim().toLowerCase());
        });
      }
    });
    return set;
  }, [todayReleases]);

  const todayYmd = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const groupOptions = useMemo(() => {
    const toLocalDateStr = (val: any) => {
      if (!val) return "";
      const dateObj = new Date(val);
      if (isNaN(dateObj.getTime())) return String(val).slice(0, 10);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // Filter groupStores to include ONLY those created / scheduled for TODAY
    const todayGroups = groupStores.filter((g) => {
      // If editing, always allow the currently selected group store
      if (
        formGroupStoreId &&
        String(g.group_store_id) === String(formGroupStoreId)
      ) {
        return true;
      }
      const gDateRaw = g.date || g.group_date || g.created_at;
      if (!gDateRaw) return true;
      return toLocalDateStr(gDateRaw) === todayYmd;
    });

    return todayGroups.map((g) => {
      const veh = vehicles.find((v) => String(v.car_id) === String(g.car_id));
      const plate = veh ? veh.license_plate : g.license_plate || "";
      const isUsed =
        usedGroupIds.has(String(g.group_store_id)) ||
        Boolean(g.is_released) ||
        Number(g.status) === 1 ||
        String(g.status) === "1";
      const isSelectedInForm =
        String(g.group_store_id) === String(formGroupStoreId);

      return {
        value: g.group_store_id,
        label: g.group_store_name,
        colorDot: g.group_color,
        subLabel: plate ? `ทะเบียน: ${plate}` : undefined,
        disabled: isUsed && !isSelectedInForm,
        badge: isUsed ? "ปล่อยรถวันนี้แล้ว" : undefined,
      };
    });
  }, [groupStores, vehicles, usedGroupIds, formGroupStoreId, todayYmd]);

  const selectedGroupObj = useMemo(() => {
    if (!formGroupStoreId) return null;
    return (
      groupStores.find(
        (g) => String(g.group_store_id) === String(formGroupStoreId),
      ) || null
    );
  }, [groupStores, formGroupStoreId]);

  const driverOptions = useMemo(() => {
    return drivers.map((d) => {
      const driverNameLower = (d.name || "").trim().toLowerCase();
      const isUsedAsDriver = usedDriverIds.has(String(d.user_id));
      const isUsedAsFollower = usedFollowerNames.has(driverNameLower);
      const isSelectedAsFollower = formFollowers.some(
        (f) => f.trim().toLowerCase() === driverNameLower,
      );
      const isSelectedInForm = String(d.user_id) === String(formUserId);

      const isForbidden =
        (isUsedAsDriver || isUsedAsFollower || isSelectedAsFollower) &&
        !isSelectedInForm;

      let badge: string | undefined;
      if (isSelectedAsFollower) {
        badge = "เลือกแล้ว";
      } else if (isUsedAsDriver) {
        badge = "เลือกแล้ว";
      } else if (isUsedAsFollower) {
        badge = "เลือกแล้ว";
      }

      return {
        value: d.user_id,
        label: d.name,
        subLabel:
          d.phone_number_1 || d.phone_number || d.tel_number || undefined,
        disabled: isForbidden,
        badge: badge,
      };
    });
  }, [drivers, usedDriverIds, usedFollowerNames, formFollowers, formUserId]);

  const releaseTypeOptions = useMemo(() => {
    if (releaseTypes.length > 0) {
      return releaseTypes.map((rt) => ({
        value: String(rt.car_release_type_id),
        label: rt.type,
      }));
    }
    return [
      { value: "1", label: "รับสินค้า" },
      { value: "2", label: "ฝากส่ง" },
      { value: "3", label: "เยี่ยมลูกค้า" },
      { value: "4", label: "ส่งของ" },
      { value: "5", label: "เปิดลูกค้าใหม่" },
    ];
  }, [releaseTypes]);

  const pdaOptions = useMemo(() => {
    return pdaDevices.map((p) => ({
      value: p.pda_id,
      label: p.device_name,
      subLabel: p.serial_number ? `SN: ${p.serial_number}` : undefined,
    }));
  }, [pdaDevices]);

  const accountingOptions = useMemo(() => {
    return [
      { value: "", label: "-- ไม่ระบุ (ว่าง) --" },
      ...accountingStatuses.map((acc) => ({
        value: acc.status_id,
        label: acc.status_name,
      })),
    ];
  }, [accountingStatuses]);

  // SearchableSelect options for filters
  const accountingStatusFilterOptions = useMemo(() => {
    return [
      { value: "all", label: "-- ทั้งหมด --" },
      ...accountingStatuses.map((acc) => ({
        value: String(acc.status_id || acc.status_name),
        label: acc.status_name,
      })),
    ];
  }, [accountingStatuses]);

  const isDriverUser = useMemo(() => {
    if (!user) return false;
    const levelId = Number(user.level_user_id || (user as any).level_id);
    const accessId = Number((user as any).access_id);
    const levelName = String(
      user.level_user_name || (user as any).level_name || "",
    ).toLowerCase();
    const accessName = String((user as any).access_name || "").toLowerCase();

    const isAdmin =
      levelId === 1 ||
      levelId === 2 ||
      accessId === 1 ||
      accessId === 2 ||
      /admin|administrator|แอดมิน|supervisor|manager|หัวหน้า/i.test(
        levelName,
      ) ||
      /admin|administrator|แอดมิน|supervisor|manager|หัวหน้า/i.test(accessName);

    return (
      !isAdmin &&
      (levelId === 3 ||
        accessId === 3 ||
        /driver|พนักงานขับรถ|คนขับ|staff|เซลส์/i.test(levelName) ||
        /driver|พนักงานขับรถ|คนขับ|staff|เซลส์/i.test(accessName))
    );
  }, [user]);

  const driverFilterOptions = useMemo(() => {
    if (isDriverUser && user?.user_id) {
      return [
        {
          value: String(user.user_id),
          label: `${user.name || "ตัวเอง"} (ตัวเอง)`,
        },
      ];
    }
    return [
      { value: "all", label: "-- ทั้งหมด --" },
      ...drivers.map((d) => ({
        value: String(d.user_id || d.name),
        label: d.name,
      })),
    ];
  }, [drivers, isDriverUser, user]);

  const licensePlateFilterOptions = useMemo(() => {
    return [
      { value: "all", label: "-- ทั้งหมด --" },
      ...vehicles.map((v) => ({
        value: String(v.car_id || v.license_plate),
        label: `${v.license_plate}${v.brand ? ` (${v.brand})` : ""}`,
      })),
    ];
  }, [vehicles]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterReleaseStatus !== "all") count++;
    if (filterReturnStatus !== "all") count++;
    if (filterAccountingStatus !== "all") count++;
    if (filterDriverId !== "all") count++;
    if (filterLicensePlate !== "all") count++;
    return count;
  }, [
    filterReleaseStatus,
    filterReturnStatus,
    filterAccountingStatus,
    filterDriverId,
    filterLicensePlate,
  ]);

  const fetchReleases = useCallback(async () => {
    try {
      const res = await api.get("/car-release", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: search,
          date: selectedDate,
          driver_id:
            isDriverUser && user?.user_id
              ? String(user.user_id)
              : filterDriverId !== "all"
                ? filterDriverId
                : undefined,
        },
      });
      if (res.data.success && Array.isArray(res.data.releases)) {
        const formatted = res.data.releases.map((r: CarReleaseData) => ({
          car_release_id: r.car_release_id,
          car_release_no: r.car_release_no,
          car_id: r.car_id,
          user_id: r.user_id,
          group_store_id: r.group_store_id,
          group_store_name: r.group_store_name || "-",
          group_color: r.group_color || "-",
          car_release_type_id: r.car_release_type_id || "-",
          car_release_type_name: r.car_release_type_name || "-",
          car_image: r.car_image,
          license_plate: r.license_plate || "-",
          brand: r.brand || "",
          model: r.model || "",
          sub_model: r.sub_model || "",
          brand_model:
            [r.brand, r.model, r.sub_model].filter(Boolean).join(" ") ||
            r.brand_model ||
            "-",
          is_returned: !!r.is_returned,
          completedStores: r.completed_stores || 0,
          totalStores: r.total_stores || 0,
          allowance: r.allowance || "-",
          allowance_paid: r.allowance_paid || "-",
          total_number_of_bills: r.total_number_of_bills ?? 0,
          total_amount: r.total_amount
            ? Number(r.total_amount).toLocaleString("th-TH", {
                minimumFractionDigits: 2,
              })
            : "0.00",
          accounting_status_name: r.accounting_status_name || "-",
          accounting_status_id: r.accounting_status_id || "-",
          mileage: r.mileage || 0,
          driver_avatar: r.user_image,
          driver_name: r.driver_name || "ไม่ระบุ",
          driver_phone: r.driver_phone || "-",
          follower_name: r.follower_name || "-",
          followers: r.followers || [],
          controlled_type: "กระบะ",
          dateGroup: formatDateNumeric(r.created_at || Date.now()),
          dateCount: 5,
          pda_device: r.pda_device || "-",
          pda_device_name:
            r.pda_device_name || (r.pda_device ? `PDA-${r.pda_device}` : "-"),
          created_at: formatDateNumeric(r.created_at),
          description: r.description || "-",
          image_mileage: r.image_mileage || "",
          image_front: r.image_front || "",
          image_around_1: r.image_around_1 || "",
          image_around_2: r.image_around_2 || "",
          image_around_3: r.image_around_3 || "",
          image_around_4: r.image_around_4 || "",
          image_around_5: r.image_around_5 || "",
          image_pda: r.image_pda || "",
        }));
        setReleases(formatted);
        setTotalItems(
          res.data.total ?? res.data.pagination?.total ?? formatted.length,
        );
      }
    } catch (err) {
      console.error("Fetch car release error:", err);
    }
  }, [
    currentPage,
    itemsPerPage,
    search,
    selectedDate,
    filterDriverId,
    isDriverUser,
    user,
  ]);

  useEffect(() => {
    fetchReleases();
    fetchMasterData();
    fetchActiveReleaseDates();
  }, [fetchReleases, fetchMasterData, fetchActiveReleaseDates]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormGroupStoreId("");
    setFormCarId("");
    setFormPlateText("");
    setFormCarBrandModel("");
    if (isDriverUser && user?.user_id) {
      setFormUserId(user.user_id);
      setFormDriverName(user.name || "");
    } else {
      setFormUserId("");
      setFormDriverName("");
    }
    setFormReleaseTypeId("1");
    setFormFollowers([]);
    setFollowerSearch("");
    setFormMileage(0);
    setFormAllowance("");
    setFormPda(pdaDevices[0]?.device_name || pdaDevices[0]?.device_code || "");
    setFormAccountingStatus("");
    setFormDescription("");
    setGroupStoresPreview([]);

    // Clear Images
    setImgMileage("");
    setImgFront("");
    setImgAround1("");
    setImgAround2("");
    setImgAround3("");
    setImgAround4("");
    setImgAround5("");
    setImgPda("");
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = async (rel: any) => {
    setEditingId(rel.car_release_id);
    setFormCarId(rel.car_id || "");
    setFormUserId(rel.user_id || "");
    setFormGroupStoreId(rel.group_store_id || "");
    setFormReleaseTypeId(rel.car_release_type_id || 1);
    setFormPlateText(rel.license_plate || "");
    setFormCarBrandModel(rel.brand_model || "");
    setFormDriverName(rel.driver_name || "");

    // Parse Followers
    let initialFollowers: string[] = [];
    if (Array.isArray(rel.followers) && rel.followers.length > 0) {
      initialFollowers = rel.followers
        .map((f: any) => (typeof f === "string" ? f : f.follower_name))
        .filter(Boolean);
    } else if (rel.follower_name && rel.follower_name !== "-") {
      initialFollowers = rel.follower_name
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
    setFormFollowers(initialFollowers);
    setFollowerSearch("");
    setFormMileage(rel.mileage || 0);
    setFormAllowance(rel.allowance !== "-" ? rel.allowance : "");
    setFormPda(rel.pda_device || "");
    setFormAccountingStatus(rel.accounting_status_id || 0);
    setFormDescription(rel.description || "");

    // Pre-fill images
    setImgMileage(rel.image_mileage || "");
    setImgFront(rel.image_front || "");
    setImgAround1(rel.image_around_1 || "");
    setImgAround2(rel.image_around_2 || "");
    setImgAround3(rel.image_around_3 || "");
    setImgAround4(rel.image_around_4 || "");
    setImgAround5(rel.image_around_5 || "");
    setImgPda(rel.image_pda || "");

    setIsDrawerOpen(true);
  };

  const handleViewDetail = async (rel: any) => {
    try {
      const res = await api.get(`/car-release/${rel.car_release_id}`);
      if (res.data.success && res.data.release) {
        const d = res.data.release;
        setSelectedRelease({
          ...rel,
          ...d,
          followers: d.followers || [],
          follower_phone: d.follower_phone || rel.follower_phone,
          stores: d.stores || [],
          car_return: d.car_return || null,
          driver_phone: d.driver_phone || rel.driver_phone,
        });
      } else {
        setSelectedRelease(rel);
      }
    } catch (err) {
      setSelectedRelease(rel);
    }
  };

  const handleOpenAccountingDrawer = (rel: any) => {
    if (!rel) return;
    const currentStatusId =
      rel.accounting_status_id ||
      rel.accounting_status ||
      accountingStatuses[0]?.status_id ||
      accountingStatuses[0]?.id ||
      "";
    const currentNote = rel.accounting_note || rel.description || "";
    setAccFormStatusId(currentStatusId);
    setAccFormNote(currentNote);
    setIsAccountingDrawerOpen(true);
  };

  const handleUpdateAccountingStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRelease?.car_release_id) return;
    setIsSubmittingAcc(true);
    try {
      const res = await api.patch(
        `/car-release/${selectedRelease.car_release_id}/accounting`,
        {
          accounting_status: accFormStatusId,
          accounting_status_id: accFormStatusId,
          accounting_note: accFormNote,
          description: accFormNote,
        },
      );

      if (res.data.success) {
        showSuccess("อัปเดตสถานะทางบัญชีและหมายเหตุเรียบร้อยแล้ว");
        setIsAccountingDrawerOpen(false);
        handleViewDetail(selectedRelease);
        fetchReleases();
      } else {
        showError(res.data.message || "ไม่สามารถอัปเดตสถานะทางบัญชีได้");
      }
    } catch (err: any) {
      console.error("Update accounting status error:", err);
      showError(
        err.response?.data?.message || "เกิดข้อผิดพลาดในการอัปเดตสถานะทางบัญชี",
      );
    } finally {
      setIsSubmittingAcc(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        car_id: formCarId || (vehicles[0]?.car_id ?? 1),
        car_release_type_id: Number(formReleaseTypeId) || 1,
        user_id: formUserId || (drivers[0]?.user_id ?? 1),
        group_store_id: formGroupStoreId || null,
        mileage: Number(formMileage) || 0,
        allowance: formAllowance || null,
        pda_device: formPda,
        accounting_status: formAccountingStatus,
        description:
          formDescription ||
          `ปล่อยรถ ทะเบียน ${formPlateText} คนขับ ${formDriverName}`,
        followers: formFollowers,
        image_mileage: imgMileage,
        image_front: imgFront,
        image_around_1: imgAround1,
        image_around_2: imgAround2,
        image_around_3: imgAround3,
        image_around_4: imgAround4,
        image_around_5: imgAround5,
        image_pda: imgPda,
      };

      if (editingId) {
        const res = await api.put(`/car-release/${editingId}`, payload);
        if (res.data.success) {
          showSuccess("อัปเดตใบปล่อยรถเรียบร้อยแล้ว!");
          setIsDrawerOpen(false);
          fetchReleases();
        } else {
          showError(res.data.message || "ไม่สามารถอัปเดตใบปล่อยรถได้");
        }
      } else {
        const res = await api.post("/car-release", payload);
        if (res.data.success) {
          showSuccess(
            `สร้างใบปล่อยรถใหม่สำเร็จ! (${res.data.car_release_no || ""})`,
          );
          setIsDrawerOpen(false);
          fetchReleases();
        } else {
          showError(res.data.message || "ไม่สามารถสร้างใบปล่อยรถได้");
        }
      }
    } catch (err: any) {
      showError(
        err?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
      );
    }
  };

  const handleOpenReturnDrawer = (rel: any) => {
    setReturnTargetRelease(rel);
    const existingReturn = rel.car_return || null;

    setReturnMileage(existingReturn?.mileage || rel.mileage || 0);
    setReturnKeyHolderId(
      existingReturn?.key_holder_id ? String(existingReturn.key_holder_id) : "",
    );
    setReturnParkingId(
      existingReturn?.parking_id ? String(existingReturn.parking_id) : "",
    );
    setReturnGasBill(existingReturn?.gas_bill || "");
    setReturnNote(existingReturn?.note || "");

    setReturnImgMileage(existingReturn?.image_mileage || "");
    setReturnImgFront(existingReturn?.image_front || "");
    setReturnImgAround1(existingReturn?.image_around_1 || "");
    setReturnImgAround2(existingReturn?.image_around_2 || "");
    setReturnImgAround3(existingReturn?.image_around_3 || "");
    setReturnImgAround4(existingReturn?.image_around_4 || "");
    setReturnImgReturn(existingReturn?.image_return || "");
    setReturnImgPda(existingReturn?.image_pda || "");

    setIsReturnDrawerOpen(true);
  };

  const handleReturnFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveCarReturn();
  };

  const handleSaveCarReturn = async () => {
    if (!returnTargetRelease) return;

    if (Number(returnMileage) < Number(returnTargetRelease.mileage || 0)) {
      showError(
        `เลขไมล์ตอนคืน (${returnMileage}) ต้องไม่น้อยกว่าเลขไมล์ตอนออก (${returnTargetRelease.mileage})`,
      );
      return;
    }

    try {
      setIsSubmittingReturn(true);
      const res = await api.post(
        `/car-release/${returnTargetRelease.car_release_id}/return`,
        {
          key_holder_id: returnKeyHolderId ? Number(returnKeyHolderId) : null,
          parking_id: returnParkingId ? Number(returnParkingId) : null,
          mileage: Number(returnMileage) || 0,
          gas_bill: Number(returnGasBill) || 0,
          note: returnNote,
          image_mileage: returnImgMileage,
          image_front: returnImgFront,
          image_around_1: returnImgAround1,
          image_around_2: returnImgAround2,
          image_around_3: returnImgAround3,
          image_around_4: returnImgAround4,
          image_return: returnImgReturn,
          image_pda: returnImgPda,
        },
      );

      if (res.data.success) {
        showSuccess(res.data.message || "บันทึกใบคืนรถสำเร็จ!");
        setIsReturnDrawerOpen(false);
        fetchReleases();
        if (
          selectedRelease &&
          selectedRelease.car_release_id === returnTargetRelease.car_release_id
        ) {
          handleViewDetail(returnTargetRelease);
        }
      } else {
        showError(res.data.message || "ไม่สามารถบันทึกการคืนรถได้");
      }
    } catch (err: any) {
      showError(
        err?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกการคืนรถ",
      );
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!releaseToDelete) return;
    try {
      const res = await api.delete(
        `/car-release/${releaseToDelete.car_release_id}`,
      );
      if (res.data.success) {
        showSuccess(
          `ลบใบปล่อยรถ (${releaseToDelete.car_release_no}) เรียบร้อยแล้ว!`,
        );
        fetchReleases();
      } else {
        showError(res.data.message || "ไม่สามารถลบใบปล่อยรถได้");
      }
    } catch (err: any) {
      showError(
        err?.response?.data?.message || "เกิดข้อผิดพลาดในการลบใบปล่อยรถ",
      );
    } finally {
      setReleaseToDelete(null);
    }
  };

  const renderImagePicker = (
    label: string,
    value: string,
    setter: (val: string) => void,
    idStr: string,
  ) => (
    <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 relative group">
      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
        {label}
      </label>
      {value ? (
        <div className="relative aspect-video rounded-md overflow-hidden bg-slate-900 border border-slate-200">
          <img
            src={getImageUrl(value)}
            alt={label}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => setter("")}
            className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full shadow-md transition-colors"
            title="ลบรูปภาพ"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={idStr}
          className="border-2 border-dashed border-slate-200 rounded-md p-2.5 text-center bg-white cursor-pointer hover:bg-slate-100/80 hover:border-slate-300 block transition-colors"
        >
          <Camera className="w-4 h-4 text-slate-400 mx-auto mb-1" />
          <span className="text-[10px] font-medium text-slate-600 block leading-tight">
            อัปโหลด {label}
          </span>
          <input
            id={idStr}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageChange(e, setter)}
          />
        </label>
      )}
    </div>
  );

  const filteredReleases = useMemo(() => {
    return releases.filter((r) => {
      // 1. Search Query
      const query = search.trim().toLowerCase();
      if (query) {
        const matchSearch =
          r.car_release_no?.toLowerCase().includes(query) ||
          r.license_plate?.toLowerCase().includes(query) ||
          r.driver_name?.toLowerCase().includes(query) ||
          r.follower_name?.toLowerCase().includes(query) ||
          r.group_store_name?.toLowerCase().includes(query);
        if (!matchSearch) return false;
      }

      // 2. Release Status Filter (ตรงตามเงื่อนไขในตาราง 100%)
      if (filterReleaseStatus !== "all") {
        const isCompleted =
          (r.completedStores === r.totalStores && r.totalStores > 0) ||
          Boolean(r.is_returned);
        const isInProgress = !isCompleted;

        if (filterReleaseStatus === "released" && !isInProgress) return false;
        if (filterReleaseStatus === "completed" && !isCompleted) return false;
      }

      // 3. Return Status Filter
      if (filterReturnStatus !== "all") {
        if (filterReturnStatus === "returned" && !r.is_returned) return false;
        if (filterReturnStatus === "unreturned" && r.is_returned) return false;
      }

      // 4. Accounting Status Filter
      if (filterAccountingStatus !== "all") {
        if (
          String(r.accounting_status_id) !== String(filterAccountingStatus) &&
          r.accounting_status_name !== filterAccountingStatus
        ) {
          return false;
        }
      }

      // 5. Driver Filter
      if (filterDriverId !== "all") {
        if (
          String(r.user_id) !== String(filterDriverId) &&
          r.driver_name !== filterDriverId
        ) {
          return false;
        }
      }

      // 6. License Plate Filter
      if (filterLicensePlate !== "all") {
        if (
          String(r.car_id) !== String(filterLicensePlate) &&
          r.license_plate !== filterLicensePlate
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    releases,
    search,
    filterReleaseStatus,
    filterReturnStatus,
    filterAccountingStatus,
    filterDriverId,
    filterLicensePlate,
  ]);

  const groupedReleases = filteredReleases.reduce(
    (acc, rel) => {
      const key = rel.dateGroup || "20/7/2026";
      if (!acc[key]) acc[key] = [];
      acc[key].push(rel);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  return (
    <div className="w-full space-y-4 font-sans text-xs pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            ปล่อยรถ
          </h1>
          <p className="text-[11px] text-slate-500">
            ตารางรายการปล่อยรถประจำวันแบบกระชับ (Compact Table View)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Export PDF / Excel Button */}
          <button
            onClick={() => setIsExportDrawerOpen(true)}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
            title="ส่งออกข้อมูล PDF / Excel"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>ส่งออก (Export)</span>
          </button>

          {/* Column Visibility Customizer */}
          <ColumnToggleDropdown
            columns={CAR_RELEASE_TABLE_COLUMNS}
            visibleColumns={visibleColumns}
            onChange={handleColumnChange}
          />

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilterPanel((prev) => !prev)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 shrink-0 ${
              showFilterPanel || activeFilterCount > 0
                ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>ตัวกรองข้อมูล</span>
            {activeFilterCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* + Button opens Right Create Form Drawer */}
          <button
            onClick={handleOpenAdd}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>สร้างใบปล่อยรถใหม่</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar with SearchableSelect Filters & Date Picker */}
      <div className="tms-card p-3 space-y-3">
        {/* Top Row: Date Picker, Quick Today/All Buttons & Search */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-3">
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <CustomDatePicker
              value={selectedDate}
              onChange={(d) => updateDateFilter(d, "custom")}
              activeDates={activeReleaseDates}
              label="วันที่ปล่อยรถ:"
            />
            <button
              onClick={() => updateDateFilter(getTodayDateString(), "today")}
              className={`text-[11px] px-2.5 py-1 rounded-md font-bold transition-colors shadow-2xs ${
                selectedDate === getTodayDateString()
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              title="ตั้งเป็นวันที่วันนี้"
            >
              วันนี้
            </button>
            {selectedDate && (
              <button
                onClick={() => updateDateFilter("", "all")}
                className="text-[10px] text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md font-medium transition-colors"
                title="ล้างการกรองวันที่"
              >
                แสดงทั้งหมด
              </button>
            )}
          </div>

          {/* Text Search Input */}
          <div className="relative flex-1 w-full lg:max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="ค้นหา"
              className="w-full bg-slate-50 border border-slate-200/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
            />
          </div>

          {/* Item Counters & Reset Filters Button */}
          <div className="flex items-center gap-3 text-slate-500 text-xs shrink-0 self-end lg:self-auto">
            <span>
              พบข้อมูล{" "}
              <strong className="text-slate-900 font-bold">
                {filteredReleases.length}
              </strong>{" "}
              / {totalItems || releases.length} รายการ
            </span>

            {(filterReleaseStatus !== "all" ||
              filterReturnStatus !== "all" ||
              filterAccountingStatus !== "all" ||
              filterDriverId !== "all" ||
              filterLicensePlate !== "all" ||
              search) && (
              <button
                onClick={() => {
                  setFilterReleaseStatus("all");
                  setFilterReturnStatus("all");
                  setFilterAccountingStatus("all");
                  setFilterDriverId("all");
                  setFilterLicensePlate("all");
                  setSearch("");
                  updateDateFilter(getTodayDateString(), "today");
                }}
                className="text-[10px] text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-1 rounded-md font-semibold transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>ล้างฟิลเตอร์</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible SearchableSelect Filter Panel (แสดงเมื่อกดปุ่มตัวกรอง) */}
        {showFilterPanel && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100 text-xs animate-slide-down">
            {/* 1. สถานะปล่อยรถ */}
            <div>
              <SearchableSelect
                label="สถานะปล่อยรถ"
                options={releaseStatusOptions}
                value={filterReleaseStatus}
                onChange={(val) => {
                  setFilterReleaseStatus(String(val));
                  setCurrentPage(1);
                }}
                placeholder="-- ทั้งหมด --"
                searchPlaceholder="พิมพ์ค้นหาสถานะปล่อยรถ..."
              />
            </div>

            {/* 2. คืนรถ */}
            <div>
              <SearchableSelect
                label="สถานะคืนรถ"
                options={returnStatusOptions}
                value={filterReturnStatus}
                onChange={(val) => {
                  setFilterReturnStatus(String(val));
                  setCurrentPage(1);
                }}
                placeholder="-- ทั้งหมด --"
                searchPlaceholder="พิมพ์ค้นหาสถานะคืนรถ..."
              />
            </div>

            {/* 3. สถานะบัญชี */}
            <div>
              <SearchableSelect
                label="สถานะทางบัญชี"
                options={accountingStatusFilterOptions}
                value={filterAccountingStatus}
                onChange={(val) => {
                  setFilterAccountingStatus(String(val));
                  setCurrentPage(1);
                }}
                placeholder="-- ทั้งหมด --"
                searchPlaceholder="พิมพ์ค้นหาสถานะบัญชี..."
              />
            </div>

            {/* 4. คนขับ */}
            <div>
              <SearchableSelect
                label="คนขับรถ"
                options={driverFilterOptions}
                value={filterDriverId}
                onChange={(val) => {
                  setFilterDriverId(String(val));
                  setCurrentPage(1);
                }}
                placeholder="-- ทั้งหมด --"
                searchPlaceholder="พิมพ์ค้นหาคนขับ..."
              />
            </div>

            {/* 5. ทะเบียนรถ */}
            <div>
              <SearchableSelect
                label="ทะเบียนรถ"
                options={licensePlateFilterOptions}
                value={filterLicensePlate}
                onChange={(val) => {
                  setFilterLicensePlate(String(val));
                  setCurrentPage(1);
                }}
                placeholder="-- ทั้งหมด --"
                searchPlaceholder="พิมพ์ค้นหาทะเบียน..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Modal Quick Action */}
      <QuickActionModal
        isOpen={!!modalAction}
        actionType={modalAction}
        releaseNo={selectedRelease?.car_release_no || "TMS-2026720-0005"}
        onClose={() => setModalAction(null)}
      />

      {/* 100% FULL-WIDTH COMPACT REFERENCE TABLE */}
      <div className="tms-card overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                {visibleColumns.car_release_no !== false && (
                  <th className="py-2.5 px-3">เลขที่ปล่อยรถ</th>
                )}
                {visibleColumns.car_release_type_name !== false && (
                  <th className="py-2.5 px-3">ประเภทปล่อยรถ</th>
                )}
                {visibleColumns.license_plate !== false && (
                  <th className="py-2.5 px-3">ทะเบียนรถ</th>
                )}
                {visibleColumns.brand_model !== false && (
                  <th className="py-2.5 px-3">ยี่ห้อ/รุ่นรถ</th>
                )}
                {visibleColumns.progress !== false && (
                  <th className="py-2.5 px-3">ความคืบหน้า</th>
                )}
                {visibleColumns.group_store !== false && (
                  <th className="py-2.5 px-3">กรุ๊ปรถ</th>
                )}
                {visibleColumns.release_status !== false && (
                  <th className="py-2.5 px-3 text-center">สถานะปล่อยรถ</th>
                )}
                {visibleColumns.return_status !== false && (
                  <th className="py-2.5 px-3 text-center">คืนรถ</th>
                )}
                {visibleColumns.allowance !== false && (
                  <th className="py-2.5 px-3 text-center">เบี้ยเลี้ยง</th>
                )}
                {visibleColumns.accounting_status !== false && (
                  <th className="py-2.5 px-3">สถานะทางบัญชี</th>
                )}
                {visibleColumns.total_number_of_bills !== false && (
                  <th className="py-2.5 px-3 text-center">จำนวนบิล</th>
                )}
                {visibleColumns.total_amount !== false && (
                  <th className="py-2.5 px-3 text-right">ยอดเงินรวม (บาท)</th>
                )}
                {visibleColumns.mileage !== false && (
                  <th className="py-2.5 px-3 text-right">เลขไมล์</th>
                )}
                {visibleColumns.pda_device !== false && (
                  <th className="py-2.5 px-3">อุปกรณ์ PDA</th>
                )}
                {visibleColumns.driver_name !== false && (
                  <th className="py-2.5 px-3">คนขับ</th>
                )}
                {visibleColumns.driver_phone !== false && (
                  <th className="py-2.5 px-3">เบอร์โทรคนขับ</th>
                )}
                {visibleColumns.follower_name !== false && (
                  <th className="py-2.5 px-3">ผู้ติดตาม</th>
                )}
                {visibleColumns.created_at !== false && (
                  <th className="py-2.5 px-3">เวลาสร้าง/ปล่อยรถ</th>
                )}
                {visibleColumns.description !== false && (
                  <th className="py-2.5 px-3">หมายเหตุ</th>
                )}
                {visibleColumns.actions !== false && (
                  <th className="py-2.5 px-3 text-right">จัดการ</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
              {Object.entries(groupedReleases).map(([dateStr, itemsList]) => {
                const items = itemsList as any[];
                const activeColCount =
                  Object.values(visibleColumns).filter((v) => v !== false)
                    .length || 1;
                return (
                  <React.Fragment key={dateStr}>
                    {/* Date Header Row */}
                    <tr className="bg-slate-50 border-y border-slate-200/80">
                      <td
                        colSpan={activeColCount}
                        className="py-1 px-3 font-bold text-[11px] text-slate-700"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{dateStr}</span>
                          <span className="bg-slate-200 text-slate-800 text-[10px] px-1.5 py-0.2 rounded-md font-semibold">
                            {items.length}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Release Rows */}
                    {items.map((rel: any) => {
                      const isSelected =
                        selectedRelease?.car_release_id === rel.car_release_id;
                      return (
                        <tr
                          key={rel.car_release_id}
                          onClick={() => handleViewDetail(rel)}
                          className={`hover:bg-slate-100/80 cursor-pointer transition-colors ${
                            isSelected ? "bg-slate-100 font-semibold" : ""
                          }`}
                        >
                          {/* 1. เลขที่ปล่อยรถ */}
                          {visibleColumns.car_release_no !== false && (
                            <td className="py-2 px-3 font-bold text-slate-900 font-mono">
                              {rel.car_release_no}
                            </td>
                          )}

                          {/* 2. ประเภทปล่อยรถ */}
                          {visibleColumns.car_release_type_name !== false && (
                            <td className="py-1 px-3">
                              <span className="text-slate-900 font-semibold px-2 py-0.5 rounded text-[11px]">
                                {rel.car_release_type_name || "-"}
                              </span>
                            </td>
                          )}

                          {/* 3. ทะเบียนรถ */}
                          {visibleColumns.license_plate !== false && (
                            <td className="py-1 px-3">
                              <div className="flex items-center gap-2">
                                <img
                                  src={getImageUrl(
                                    rel.car_image ||
                                      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=100&q=80",
                                  )}
                                  alt="car"
                                  className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                                />
                                <span className="font-semibold text-slate-800 text-[11px]">
                                  {rel.license_plate}
                                </span>
                              </div>
                            </td>
                          )}

                          {/* 4. ยี่ห้อ/รุ่นรถ */}
                          {visibleColumns.brand_model !== false && (
                            <td className="py-1 px-3 text-slate-600 font-medium text-[11px]">
                              {rel.brand_model || "-"}
                            </td>
                          )}

                          {/* 5. ความคืบหน้า */}
                          {visibleColumns.progress !== false && (
                            <td className="py-1 px-3">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 text-[11px] font-mono shrink-0">
                                  {rel.completedStores + "/" + rel.totalStores}
                                </span>
                                <div className="w-16 sm:w-20 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/80 shrink-0">
                                  <div
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{
                                      width: `${rel.totalStores > 0 ? Math.min(100, Math.round((rel.completedStores / rel.totalStores) * 100)) : 0}%`,
                                      backgroundColor:
                                        rel.group_color || "#3b82f6",
                                    }}
                                  />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 font-mono shrink-0">
                                  {rel.totalStores > 0
                                    ? Math.min(
                                        100,
                                        Math.round(
                                          (rel.completedStores /
                                            rel.totalStores) *
                                            100,
                                        ),
                                      )
                                    : 0}
                                  %
                                </span>
                              </div>
                            </td>
                          )}

                          {/* 6. กรุ๊ปรถ */}
                          {visibleColumns.group_store !== false && (
                            <td className="py-1 px-3">
                              <div className="flex items-center gap-2 font-bold text-slate-700 px-2 py-0.5 rounded text-[11px]">
                                <div
                                  className="w-2.5 h-2.5 rounded-full border border-white shadow-2xs shrink-0"
                                  style={{ background: rel.group_color }}
                                />
                                <span>
                                  {rel.group_store_name !== "-"
                                    ? rel.group_store_name
                                    : rel.brand_model || "-"}
                                </span>
                              </div>
                            </td>
                          )}

                          {/* 7. สถานะปล่อยรถ */}
                          {visibleColumns.release_status !== false && (
                            <td className="py-1 px-3 text-center">
                              {(rel.completedStores === rel.totalStores &&
                                rel.totalStores > 0) ||
                              rel.is_returned ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3" /> เสร็จสิ้น
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                  <Truck className="w-3 h-3" /> ดำเนินการอยู่
                                </span>
                              )}
                            </td>
                          )}

                          {/* 8. คืนรถ */}
                          {visibleColumns.return_status !== false && (
                            <td className="py-1 px-3 text-center">
                              {rel.is_returned ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200/60 transition-colors cursor-pointer">
                                  <CheckCircle2 className="w-3 h-3" /> คืนรถแล้ว
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200/60 transition-colors cursor-pointer">
                                  <XCircle className="w-3 h-3 text-rose-600" />{" "}
                                  ยังไม่คืนรถ
                                </span>
                              )}
                            </td>
                          )}

                          {/* 9. เบี้ยเลี้ยง */}
                          {visibleColumns.allowance !== false && (
                            <td className="py-1 px-3 text-center text-slate-600 font-mono">
                              {rel.allowance || "-"}
                            </td>
                          )}

                          {/* 10. สถานะทางบัญชี */}
                          {visibleColumns.accounting_status !== false && (
                            <td className="py-1 px-3 text-slate-600 font-medium">
                              {rel.accounting_status_name || "-"}
                            </td>
                          )}

                          {/* 11. จำนวนบิล */}
                          {visibleColumns.total_number_of_bills !== false && (
                            <td className="py-1 px-3 text-center font-bold text-slate-800 font-mono">
                              {rel.total_number_of_bills ?? "-"}
                            </td>
                          )}

                          {/* 12. ยอดเงินรวม */}
                          {visibleColumns.total_amount !== false && (
                            <td className="py-1 px-3 text-right font-mono font-bold text-emerald-700">
                              {rel.total_amount !== "-"
                                ? `฿${rel.total_amount}`
                                : "-"}
                            </td>
                          )}

                          {/* 13. เลขไมล์ */}
                          {visibleColumns.mileage !== false && (
                            <td className="py-1 px-3 text-right font-bold text-slate-900 font-mono">
                              {rel.mileage?.toLocaleString() || "0"}
                            </td>
                          )}

                          {/* 14. อุปกรณ์ PDA */}
                          {visibleColumns.pda_device !== false && (
                            <td className="py-1 px-3 text-slate-700 font-medium">
                              {rel.pda_device_name || "-"}
                            </td>
                          )}

                          {/* 15. คนขับ */}
                          {visibleColumns.driver_name !== false && (
                            <td className="py-1 px-3 font-semibold text-slate-900">
                              <div className="flex items-center gap-1.5">
                                <img
                                  src={getImageUrl(
                                    rel.driver_avatar ||
                                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
                                  )}
                                  alt={rel.driver_name}
                                  className="w-5 h-5 rounded-full object-cover border border-slate-200 shrink-0"
                                />
                                <span>{rel.driver_name}</span>
                              </div>
                            </td>
                          )}

                          {/* 16. เบอร์โทรคนขับ */}
                          {visibleColumns.driver_phone !== false && (
                            <td className="py-1 px-3 font-mono text-slate-600">
                              {rel.driver_phone || "-"}
                            </td>
                          )}

                          {/* 17. ผู้ติดตาม */}
                          {visibleColumns.follower_name !== false && (
                            <td className="py-1 px-3 text-slate-700">
                              {rel.follower_name || "-"}
                            </td>
                          )}

                          {/* 18. เวลาสร้าง/ปล่อยรถ */}
                          {visibleColumns.created_at !== false && (
                            <td className="py-1 px-3 text-slate-600 font-mono text-[11px]">
                              {rel.created_at || "-"}
                            </td>
                          )}

                          {/* 19. หมายเหตุ */}
                          {visibleColumns.description !== false && (
                            <td
                              className="py-1 px-3 text-slate-500 max-w-xs truncate"
                              title={rel.description}
                            >
                              {rel.description || "-"}
                            </td>
                          )}

                          {/* 20. จัดการ */}
                          {visibleColumns.actions !== false && (
                            <td className="py-1 px-3 text-right space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetail(rel);
                                }}
                                className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                title="ดูรายละเอียด"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEdit(rel);
                                }}
                                className="p-1 rounded-md text-slate-600 hover:text-amber-600 hover:bg-amber-50"
                                title="แก้ไขใบปล่อยรถ"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReleaseToDelete(rel);
                                }}
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                title="ลบใบปล่อยรถ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
              {releases.length === 0 && (
                <tr>
                  <td
                    colSpan={
                      Object.values(visibleColumns).filter((v) => v !== false)
                        .length || 1
                    }
                    className="py-8 text-center text-slate-400"
                  >
                    ไม่พบข้อมูลรายการปล่อยรถ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Control */}
        <PaginationControl
          currentPage={currentPage}
          totalItems={totalItems || releases.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* RIGHT SLIDE-OVER CREATE/EDIT RELEASE FORM DRAWER */}
      <AnimatedDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={
          editingId
            ? `แก้ไขรายการปล่อยรถ (#${editingId})`
            : "สร้างรายการปล่อยรถใหม่"
        }
        formId="release-form"
        onSubmit={handleFormSubmit}
        submitLabel={editingId ? "บันทึกการแก้ไข" : "บันทึกสร้างใบปล่อยรถ"}
        maxWidthClass="max-w-6xl"
      >
        <form
          id="release-form"
          onSubmit={handleFormSubmit}
          className="space-y text-xs"
        >
          {/* Section 1: ข้อมูลกรุ๊ปรถและคนขับ */}
          <div className="space-y-3 mb-4 bg-white rounded-lg">
            <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>1. เลือกกรุ๊ปรถและพนักงานขับรถ</span>
            </h4>

            <div className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* เลือกกรุ๊ปรถ / สายจัดส่ง (SearchableSelect - ขยายความกว้าง sm:col-span-7) */}
                <div className="sm:col-span-7">
                  <SearchableSelect
                    label="กรุ๊ปรถ / สายจัดส่ง"
                    options={groupOptions}
                    value={formGroupStoreId}
                    onChange={(val) => handleGroupChange(String(val))}
                    placeholder="-- ค้นหาและเลือกรถตามกรุ๊ป --"
                    searchPlaceholder="พิมพ์ค้นหากรุ๊ปรถ..."
                    required
                  />
                </div>

                {/* เลือกพนักงานขับรถ (SearchableSelect - sm:col-span-5) */}
                <div className="sm:col-span-5">
                  <SearchableSelect
                    label="พนักงานขับรถ"
                    options={driverOptions}
                    value={formUserId}
                    onChange={(val) => {
                      setFormUserId(val);
                      const d = drivers.find(
                        (item) => String(item.user_id) === String(val),
                      );
                      if (d) setFormDriverName(d.name);
                    }}
                    placeholder="-- ค้นหาคนขับ --"
                    searchPlaceholder="พิมพ์ค้นหาชื่อคนขับ..."
                    required
                  />
                </div>
              </div>

              {/* Auto-Assigned Vehicle & Group Status Display */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 text-blue-700 rounded-md shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold">
                      รถยนต์ประจำกรุ๊ป
                    </div>
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <span>{formPlateText || "ยังไม่ระบุรถ"}</span>
                      {formCarBrandModel && (
                        <span className="text-[10px] text-slate-500 font-normal">
                          ({formCarBrandModel})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Group Status Badge */}
                {selectedGroupObj && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-semibold text-slate-500">
                      สถานะกรุ๊ป:
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shadow-2xs ${
                        selectedGroupObj.status === 1 ||
                        selectedGroupObj.status === true ||
                        selectedGroupObj.is_released
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : "bg-red-50 text-red-800 border-red-300"
                      }`}
                    >
                      {selectedGroupObj.status === 1 ||
                      selectedGroupObj.status === true ||
                      selectedGroupObj.is_released
                        ? "ปล่อยรถแล้ว"
                        : "ยังไม่ปล่อยรถ"}
                    </span>
                  </div>
                )}
              </div>

              {/* Delivery List Preview Table (ตารางพรีวิวรายการจัดส่งของกรุ๊ปที่เลือก) */}
              {formGroupStoreId && (
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-2.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <PackageCheck className="w-4 h-4 text-blue-600" />
                      <span>
                        รายการจัดส่งในกรุ๊ปนี้ ({groupStoresPreview.length}{" "}
                        จุดจัดส่ง)
                      </span>
                    </div>
                    {isLoadingPreview && (
                      <span className="text-[10px] text-blue-600 animate-pulse font-medium">
                        กำลังโหลดข้อมูล...
                      </span>
                    )}
                  </div>

                  {groupStoresPreview.length > 0 ? (
                    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white max-h-60 custom-scrollbar">
                      <table className="w-full text-left border-collapse whitespace-nowrap text-[10px]">
                        <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 z-10 border-b border-slate-200">
                          <tr>
                            <th className="py-1 px-1.5 text-center w-7">
                              ลำดับ
                            </th>
                            <th className="py-1 px-1.5">รหัสออเดอร์</th>
                            <th className="py-1 px-1.5">รหัสร้านค้า</th>
                            <th className="py-1 px-1.5">
                              ชื่อร้านค้า / จุดจัดส่ง
                            </th>
                            <th className="py-1 px-1.5 text-center w-12">
                              จำนวนทั้งหมด
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {groupStoresPreview.map((item: any, idx: number) => (
                            <tr
                              key={item.list_id || idx}
                              className="hover:bg-slate-50 transition-colors"
                            >
                              <td className="py-1 px-1.5 text-center font-mono text-slate-500 font-medium">
                                {item.row_order || idx + 1}
                              </td>
                              <td className="py-1 px-1.5 font-mono text-slate-900 font-bold">
                                {item.data_store_no || item.order_no || "-"}
                              </td>
                              <td className="py-1 px-1.5 font-mono text-blue-700 font-semibold">
                                {item.store_id || "-"}
                              </td>
                              <td className="py-1 px-1.5 font-medium text-slate-900 truncate max-w-[200px]">
                                {item.store_name_result ||
                                  item.store_name ||
                                  "ไม่ระบุชื่อร้านค้า"}
                              </td>
                              <td className="py-1 px-1.5 text-center font-mono font-bold text-slate-800">
                                {item.sum_quantity || 1}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    !isLoadingPreview && (
                      <div className="bg-white rounded border border-dashed border-slate-200 p-2.5 text-center text-slate-400 text-[11px]">
                        ไม่พบรายการจุดจัดส่งในกรุ๊ปนี้
                      </div>
                    )
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Job Type Card Selector (เลือกประเภทงาน) */}
                <div className="sm:col-span-2 space-y-2">
                  <div className="border-b border-slate-200/80 pb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      เลือกประเภทงาน <span className="text-rose-500">*</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-0.5">
                    {releaseTypeOptions.map((opt) => {
                      const isSelected =
                        String(formReleaseTypeId) === String(opt.value);
                      const labelLower = (opt.label || "").toLowerCase();

                      let IconComponent = Truck;
                      if (
                        labelLower.includes("รับสินค้า") ||
                        labelLower.includes("รับของ") ||
                        labelLower.includes("รับ")
                      ) {
                        IconComponent = PackageCheck;
                      } else if (
                        labelLower.includes("ฝากส่ง") ||
                        labelLower.includes("ฝาก")
                      ) {
                        IconComponent = PackagePlus;
                      } else if (
                        labelLower.includes("เยี่ยมลูกค้า") ||
                        labelLower.includes("เยี่ยม")
                      ) {
                        IconComponent = Handshake;
                      } else if (
                        labelLower.includes("เปิดลูกค้าใหม่") ||
                        labelLower.includes("ลูกค้าใหม่")
                      ) {
                        IconComponent = UserPlus;
                      } else if (
                        labelLower.includes("ส่งของ") ||
                        labelLower.includes("ส่ง") ||
                        labelLower.includes("จัดส่ง")
                      ) {
                        IconComponent = Truck;
                      } else if (
                        labelLower.includes("ทัวร์") ||
                        labelLower.includes("เที่ยว") ||
                        labelLower.includes("tour")
                      ) {
                        IconComponent = Plane;
                      } else if (
                        labelLower.includes("เรียน") ||
                        labelLower.includes("นักเรียน") ||
                        labelLower.includes("school")
                      ) {
                        IconComponent = GraduationCap;
                      } else if (
                        labelLower.includes("โรงงาน") ||
                        labelLower.includes("factory")
                      ) {
                        IconComponent = Building2;
                      } else if (
                        labelLower.includes("พนักงาน") ||
                        labelLower.includes("คน") ||
                        labelLower.includes("staff")
                      ) {
                        IconComponent = Users;
                      } else if (labelLower.includes("งาน")) {
                        IconComponent = Briefcase;
                      }

                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormReleaseTypeId(opt.value)}
                          className={`flex flex-col items-center justify-center py-3 px-3 rounded-xl border text-center transition-all cursor-pointer select-none ${
                            isSelected
                              ? "bg-blue-50/90 border-2 border-blue-500 text-blue-600 shadow-2xs font-bold ring-2 ring-blue-500/10"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/80 font-medium"
                          }`}
                        >
                          <IconComponent
                            className={`w-6 h-6 mb-1.5 ${
                              isSelected
                                ? "text-blue-500 scale-105"
                                : "text-slate-400"
                            } transition-transform`}
                          />
                          <span
                            className={`text-xs tracking-tight ${isSelected ? "text-blue-600 font-bold" : "text-slate-700 font-medium"}`}
                          >
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-700 font-semibold block mb-1 flex items-center justify-between">
                    <span>
                      ผู้ติดตาม (เลือกพนักงานเป็นผู้ติดตามได้หลายคน) *
                    </span>
                    <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-semibold">
                      เลือกแล้ว {formFollowers.length} คน
                    </span>
                  </label>

                  {/* Search bar for Followers */}
                  <div className="relative mb-1.5">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={followerSearch}
                      onChange={(e) => setFollowerSearch(e.target.value)}
                      placeholder="พิมพ์ค้นหาชื่อพนักงานผู้ติดตาม..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                    />
                  </div>

                  {/* Checkbox list of Users from Database */}
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50/60 space-y-1 custom-scrollbar">
                    {drivers
                      .filter((u) => {
                        if (!followerSearch.trim()) return true;
                        const q = followerSearch.trim().toLowerCase();
                        return (
                          (u.name && u.name.toLowerCase().includes(q)) ||
                          (u.username &&
                            u.username.toLowerCase().includes(q)) ||
                          (u.level_user_name &&
                            u.level_user_name.toLowerCase().includes(q))
                        );
                      })
                      .map((u) => {
                        const uNameLower = (u.name || "").trim().toLowerCase();
                        const isUsedAsDriver = usedDriverIds.has(
                          String(u.user_id),
                        );
                        const isUsedAsFollower =
                          usedFollowerNames.has(uNameLower);
                        const isSelectedAsMainDriver =
                          String(u.user_id) === String(formUserId) ||
                          Boolean(
                            formDriverName &&
                            formDriverName.trim().toLowerCase() === uNameLower,
                          );
                        const isChecked = formFollowers.includes(u.name);

                        const isForbidden = Boolean(
                          (isUsedAsDriver ||
                            isUsedAsFollower ||
                            isSelectedAsMainDriver) &&
                          !isChecked,
                        );

                        let badgeText: string | undefined;
                        if (isSelectedAsMainDriver) {
                          badgeText = "เลือกแล้ว";
                        } else if (isUsedAsDriver) {
                          badgeText = "เลือกแล้ว";
                        } else if (isUsedAsFollower) {
                          badgeText = "เลือกแล้ว";
                        }

                        return (
                          <label
                            key={u.user_id}
                            className={`flex items-center justify-between p-1.5 rounded-md transition-colors text-xs ${
                              isForbidden
                                ? "opacity-50 cursor-not-allowed bg-slate-100/80"
                                : isChecked
                                  ? "bg-blue-50/90 text-blue-900 border border-blue-200 font-semibold cursor-pointer"
                                  : "hover:bg-slate-100 text-slate-700 cursor-pointer"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={isForbidden}
                                onChange={(e) => {
                                  if (isForbidden) return;
                                  if (e.target.checked) {
                                    setFormFollowers((prev) => [
                                      ...prev,
                                      u.name,
                                    ]);
                                  } else {
                                    setFormFollowers((prev) =>
                                      prev.filter((name) => name !== u.name),
                                    );
                                  }
                                }}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0 cursor-pointer disabled:cursor-not-allowed"
                              />
                              <img
                                src={getImageUrl(
                                  u.user_image ||
                                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
                                )}
                                alt={u.name}
                                className="w-5 h-5 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                              <span className="truncate">{u.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 ml-1">
                              {badgeText && (
                                <span className="flex items-center text-[9px] font-semibold text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded font-mono">
                                  <CheckIcon className="w-3 h-3 text-slate-600 text-green-500 mr-1" />
                                  {badgeText}
                                </span>
                              )}
                              {u.level_user_name && !badgeText && (
                                <span className="text-[10px] text-slate-400 font-normal">
                                  ({u.level_user_name})
                                </span>
                              )}
                            </div>
                          </label>
                        );
                      })}

                    {drivers.length === 0 && (
                      <div className="text-slate-400 text-center py-2 text-[11px]">
                        ไม่พบข้อมูลพนักงานในฐานข้อมูล
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: ข้อมูลการปฏิบัติงาน */}
          <div className="space-y-3 mb-4 bg-white rounded-lg">
            <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">
              2. ข้อมูลการออกรถ & เบี้ยเลี้ยง
            </h4>

            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    เลขไมล์ออก (กม.) *
                  </label>
                  <input
                    type="number"
                    value={formMileage}
                    onChange={(e) => setFormMileage(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-mono"
                  />
                </div>

                <SearchableSelect
                  label="อุปกรณ์ PDA"
                  options={pdaOptions}
                  value={formPda}
                  onChange={(val) => setFormPda(Number(val))}
                  placeholder="-- เลือกอุปกรณ์ PDA --"
                  searchPlaceholder="พิมพ์ค้นหา PDA..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    เบี้ยเลี้ยง (บาท)
                  </label>
                  <input
                    type="text"
                    value={formAllowance}
                    onChange={(e) => setFormAllowance(e.target.value)}
                    placeholder="ระบุเบี้ยเลี้ยง (เช่น 300)"
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 font-mono"
                  />
                </div>

                <SearchableSelect
                  label="สถานะทางบัญชี"
                  options={accountingOptions}
                  value={formAccountingStatus}
                  onChange={(val) => setFormAccountingStatus(Number(val) || 0)}
                  placeholder="-- เลือกสถานะบัญชี --"
                  searchPlaceholder="พิมพ์ค้นหาสถานะ..."
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  รายละเอียดเพิ่มเติม / หมายเหตุ
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="หมายเหตุเพิ่มเติมสำหรับการปล่อยรถ..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: รูปภาพการปล่อยรถ (ครบทุกมุม) */}
          <div className="space-y-3 bg-white rounded-lg">
            <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>3. รูปภาพการปล่อยรถ (ครบทุกมุม)</span>
              <span className="text-[10px] text-slate-400 font-normal">
                อัปโหลดรูปภาพ
              </span>
            </h4>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* 1. รูปถ่ายเลขไมล์ */}
              {renderImagePicker(
                "1. รูปถ่ายเลขไมล์",
                imgMileage,
                setImgMileage,
                "img_mileage_input",
              )}

              {/* 2. รูปถ่ายหน้ารถ */}
              {renderImagePicker(
                "2. รูปถ่ายหน้ารถ",
                imgFront,
                setImgFront,
                "img_front_input",
              )}

              {/* 3. รูปถ่ายรอบคัน 1 */}
              {renderImagePicker(
                "3. รอบคัน (ซ้าย)",
                imgAround1,
                setImgAround1,
                "img_around1_input",
              )}

              {/* 4. รูปถ่ายรอบคัน 2 */}
              {renderImagePicker(
                "4. รอบคัน (ขวา)",
                imgAround2,
                setImgAround2,
                "img_around2_input",
              )}

              {/* 5. รูปถ่ายรอบคัน 3 */}
              {renderImagePicker(
                "5. รอบคัน (หลัง)",
                imgAround3,
                setImgAround3,
                "img_around3_input",
              )}

              {/* 6. รูปถ่ายรอบคัน 4 */}
              {renderImagePicker(
                "6. รอบคัน (กระบะ/ตู้)",
                imgAround4,
                setImgAround4,
                "img_around4_input",
              )}

              {/* 7. รูปถ่ายรอบคัน 5 */}
              {renderImagePicker(
                "7. รอบคัน (ภายใน)",
                imgAround5,
                setImgAround5,
                "img_around5_input",
              )}

              {/* 8. รูปถ่ายอุปกรณ์ PDA */}
              {renderImagePicker(
                "8. รูปถ่ายอุปกรณ์ PDA",
                imgPda,
                setImgPda,
                "img_pda_input",
              )}
            </div>
          </div>
        </form>
      </AnimatedDrawer>

      {/* RIGHT SLIDE-OVER DETAIL INSPECTOR DRAWER (WIDER MAX-W-6XL) */}
      <AnimatedDrawer
        isOpen={!!selectedRelease}
        onClose={() => setSelectedRelease(null)}
        title={
          selectedRelease ? (
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-900 text-base font-mono">
                {selectedRelease.car_release_no}
              </span>
              <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded text-xs font-semibold">
                {selectedRelease.license_plate} ({selectedRelease.driver_name})
              </span>
            </div>
          ) : (
            "รายละเอียดใบปล่อยรถ"
          )
        }
        maxWidthClass="max-w-6xl"
      >
        {selectedRelease && (
          <div className="space-y-4">
            {/* DUAL TAB SWITCHER (INFO vs LIVE GPS MAP) */}
            <div className="flex border-b border-slate-200 bg-slate-50/80 -mt-2 -mx-5 px-5 pt-1 shrink-0">
              <button
                onClick={() => setActiveDetailTab("info")}
                className={`py-2.5 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-colors ${
                  activeDetailTab === "info"
                    ? "border-slate-900 text-slate-900 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>รายละเอียด</span>
              </button>

              <button
                onClick={() => setActiveDetailTab("gps")}
                className={`py-2.5 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-colors ${
                  activeDetailTab === "gps"
                    ? "border-slate-900 text-slate-900 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Truck className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>ติดตาม GPS (Live)</span>
              </button>

              <button
                onClick={() => setActiveDetailTab("chat")}
                className={`py-2.5 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-colors ${
                  activeDetailTab === "chat"
                    ? "border-slate-900 text-slate-900 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>แชทสื่อสาร (Chat)</span>
              </button>
            </div>

            {/* TAB 1: RELEASE DETAILS & SINGLE-ROW STORES TABLE */}
            {activeDetailTab === "info" && (
              <div className="space-y-4">
                {/* DYNAMIC QUICK ACTION BUTTONS FROM menu_car_release */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    การดำเนินการด่วน
                  </div>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {visibleOperationMenus.map((menu: any) => {
                      const isCarReturnAction =
                        menu.action_key === "car_return" ||
                        menu.action_key === "return_car" ||
                        (menu.menu_name && menu.menu_name.includes("คืนรถ"));
                      const isAccountingAction =
                        menu.action_key === "accounting" ||
                        menu.action_key === "accounting_status" ||
                        (menu.menu_name &&
                          menu.menu_name.includes("สถานะบัญชี"));
                      const isAlreadyReturned = Boolean(
                        selectedRelease?.is_returned ||
                        selectedRelease?.car_return ||
                        selectedRelease?.return_date,
                      );

                      const isDisabled = isCarReturnAction && isAlreadyReturned;

                      const handleActionClick = () => {
                        if (isDisabled) return;
                        if (isCarReturnAction) {
                          handleOpenReturnDrawer(selectedRelease);
                        } else if (isAccountingAction) {
                          handleOpenAccountingDrawer(selectedRelease);
                        } else {
                          setModalAction(menu.action_key);
                        }
                      };

                      return (
                        <button
                          key={menu.id || menu.action_key}
                          onClick={handleActionClick}
                          disabled={isDisabled}
                          title={
                            isDisabled ? "คืนรถเรียบร้อยแล้ว" : menu.menu_name
                          }
                          className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                            isDisabled
                              ? "opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400"
                              : "bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          {renderQuickActionIcon(menu.icon)}
                          <span className="text-[10px] font-medium text-center line-clamp-1">
                            {menu.menu_name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Metadata Details */}
                <div className="rounded-lg bg-white space-y-3 shadow-2xs">
                  <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">
                    รายละเอียดใบปล่อยรถ
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2.5 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">
                        รหัสปล่อยรถ
                      </span>
                      <span className="font-bold text-slate-900 font-mono">
                        {selectedRelease.car_release_no}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">
                        ทะเบียนรถ
                      </span>
                      <span className="font-bold text-slate-900">
                        {selectedRelease.license_plate}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">
                        สายจัดส่ง / กรุ๊ป
                      </span>
                      <span className="font-semibold text-slate-900">
                        {selectedRelease.group_store_name || "-"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">
                        ประเภทการปล่อย
                      </span>
                      <span className="font-semibold text-slate-900">
                        {selectedRelease.car_release_type_name || "ปล่อยรถปกติ"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">
                        พนักงานขับรถ
                      </span>
                      <div className="flex items-center gap-2">
                        <img
                          loading="lazy"
                          src={getImageUrl(
                            selectedRelease.driver_avatar ||
                              selectedRelease.user_image ||
                              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
                          )}
                          alt={selectedRelease.driver_name}
                          className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <span className="font-semibold text-slate-900">
                          {selectedRelease.driver_name || "ไม่ระบุ"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">
                        เบอร์โทรศัพท์
                      </span>
                      <span className="font-medium text-slate-800 font-mono">
                        {selectedRelease.driver_phone || "-"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">
                        เลขไมล์ออก
                      </span>
                      <span className="font-bold text-slate-900 font-mono">
                        {Number(selectedRelease.mileage || 0).toLocaleString()}{" "}
                        กม.
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">
                        อุปกรณ์ PDA
                      </span>
                      <span className="font-medium text-slate-800">
                        {selectedRelease.pda_device_name || "-"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px] mb-0.5">
                        ผู้ติดตาม
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(selectedRelease.followers) &&
                        selectedRelease.followers.length > 0 ? (
                          selectedRelease.followers.map(
                            (f: any, idx: number) => (
                              <span
                                key={idx}
                                className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-medium inline-flex items-center gap-1"
                              >
                                <span>
                                  {typeof f === "string" ? f : f.follower_name}
                                </span>
                                {typeof f === "object" &&
                                  (f.follower_phone || f.phone) && (
                                    <span className="font-mono text-[10px] text-blue-600">
                                      ({f.follower_phone || f.phone})
                                    </span>
                                  )}
                              </span>
                            ),
                          )
                        ) : (
                          <span className="font-medium text-slate-800">
                            {selectedRelease.follower_name || "-"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">
                        เบอร์โทรผู้ติดตาม
                      </span>
                      <span className="font-medium text-slate-800 font-mono">
                        {selectedRelease.follower_phone ||
                          (Array.isArray(selectedRelease.followers) &&
                          selectedRelease.followers.length > 0
                            ? selectedRelease.followers
                                .map((f: any) =>
                                  typeof f === "object"
                                    ? f.follower_phone || f.phone
                                    : null,
                                )
                                .filter(Boolean)
                                .join(", ") || "-"
                            : "-")}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">
                        สถานะทางบัญชี
                      </span>
                      <span className="font-semibold text-amber-700">
                        {selectedRelease.accounting_status_name || "-"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">
                        วันที่ออกรถ
                      </span>
                      <span className="font-medium text-slate-800 font-mono">
                        {formatDateTimeString(
                          selectedRelease.created_at ||
                            selectedRelease.release_date ||
                            selectedRelease.dateGroup,
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lazy-Loaded Car Release Photos (Smooth rendering) */}
                <div className="bg-white space-y-2 shadow-2xs">
                  <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2 flex items-center justify-between">
                    <span>รูปภาพการปล่อยรถ</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {
                        [
                          selectedRelease.image_mileage,
                          selectedRelease.image_front,
                          selectedRelease.image_around_1,
                          selectedRelease.image_around_2,
                          selectedRelease.image_around_3,
                          selectedRelease.image_around_4,
                          selectedRelease.image_around_5,
                          selectedRelease.image_pda,
                        ].filter(Boolean).length
                      }{" "}
                      รูป
                    </span>
                  </h4>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1">
                    {(() => {
                      const photoItems = [
                        {
                          label: "เลขไมล์",
                          val: selectedRelease.image_mileage,
                        },
                        { label: "หน้ารถ", val: selectedRelease.image_front },
                        {
                          label: "รอบคัน 1",
                          val: selectedRelease.image_around_1,
                        },
                        {
                          label: "รอบคัน 2",
                          val: selectedRelease.image_around_2,
                        },
                        {
                          label: "รอบคัน 3",
                          val: selectedRelease.image_around_3,
                        },
                        {
                          label: "รอบคัน 4",
                          val: selectedRelease.image_around_4,
                        },
                        {
                          label: "รอบคัน 5",
                          val: selectedRelease.image_around_5,
                        },
                        {
                          label: "อุปกรณ์ PDA",
                          val: selectedRelease.image_pda,
                        },
                      ].filter((item) => !!item.val);

                      const lightboxList: LightboxImage[] = photoItems.map(
                        (item) => ({
                          url: getImageUrl(item.val),
                          title: `รูปถ่ายปล่อยรถ (${selectedRelease.car_release_no}): ${item.label}`,
                          description: `ทะเบียน: ${selectedRelease.license_plate} | พนักงาน: ${selectedRelease.driver_name || "ไม่ระบุ"}`,
                        }),
                      );

                      if (photoItems.length === 0) {
                        return (
                          <div className="col-span-8 text-center py-3 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-[11px]">
                            ไม่มีการแนบรูปภาพสำหรับการปล่อยรถนี้
                          </div>
                        );
                      }

                      return photoItems.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => openLightbox(lightboxList, idx)}
                          className="border border-slate-200 rounded-lg overflow-hidden bg-slate-100 aspect-video relative group shadow-2xs cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
                          title={`คลิกเพื่อดูและขยายรูป ${item.label}`}
                        >
                          <img
                            loading="lazy"
                            src={getImageUrl(item.val)}
                            alt={item.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute bottom-0.5 right-0.5 bg-slate-900/80 text-white text-[8px] px-1 py-0.2 rounded font-medium">
                            {item.label}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* SINGLE-ROW STORES TABLE (คล้ายหน้า Route) */}
                {Array.isArray(selectedRelease.stores) &&
                  selectedRelease.stores.length > 0 && (
                    <div className="bg-white space-y-3.5 shadow-2xs">
                      {/* Compact Borderless Delivery Summary Section */}
                      <div className="space-y-2.5 pb-2 border-b border-slate-100">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                            <PackageCheck className="w-4 h-4 text-blue-600" />
                            <span>
                              ตารางรายการจุดจัดส่งในกรุ๊ป (
                              {selectedRelease.stores.length} ร้าน)
                            </span>
                          </h4>
                        </div>

                        {/* Summary Grid with 3 columns */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* 1. สรุปสถานะการจัดส่ง */}
                          <div className="space-y-1.5 border border-slate-200 rounded-lg p-2">
                            <div className="text-[10px] font-semibold text-slate-500 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>สถานะการจัดส่ง</span>
                              </span>
                              <span>
                                รวม {deliverySummary.totalStores} ร้าน
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              {/* รอดำเนินการ */}
                              <div className="bg-slate-50/80 rounded-lg p-2 text-center border border-slate-100">
                                <div className="flex items-center justify-center gap-1 mb-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                  <span className="text-[10px] font-semibold text-slate-600">
                                    รอดำเนินการ
                                  </span>
                                </div>
                                <div className="text-sm font-bold text-slate-900 font-mono">
                                  {deliverySummary.pendingCount}
                                </div>
                              </div>

                              {/* เสร็จสิ้น */}
                              <div className="bg-slate-50/80 rounded-lg p-2 text-center border border-slate-100">
                                <div className="flex items-center justify-center gap-1 mb-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  <span className="text-[10px] font-semibold text-slate-600">
                                    เสร็จสิ้น
                                  </span>
                                </div>
                                <div className="text-sm font-bold text-slate-900 font-mono">
                                  {deliverySummary.completedCount}
                                </div>
                              </div>

                              {/* ติดปัญหา */}
                              <div className="bg-slate-50/80 rounded-lg p-2 text-center border border-slate-100">
                                <div className="flex items-center justify-center gap-1 mb-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                  <span className="text-[10px] font-semibold text-slate-600">
                                    ติดปัญหา
                                  </span>
                                </div>
                                <div className="text-sm font-bold text-slate-900 font-mono">
                                  {deliverySummary.problemCount}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 2. สรุปประเภทการชำระเงิน */}
                          <div className="space-y-1.5 border border-slate-200 rounded-lg p-2">
                            <div className="text-[10px] font-semibold text-slate-500 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <Wallet className="w-3 h-3 text-slate-400" />
                                <span>ประเภทการชำระเงิน</span>
                              </span>
                              <span>
                                {deliverySummary.cashCount +
                                  deliverySummary.transferCount +
                                  deliverySummary.creditCount}{" "}
                                ออเดอร์
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              {/* เงินสด */}
                              <div className="bg-slate-50/80 rounded-lg p-2 text-center border border-slate-100">
                                <div className="text-[10px] font-semibold text-slate-600 mb-0.5">
                                  เงินสด
                                </div>
                                <div className="text-xs font-bold text-slate-900 font-mono truncate">
                                  {deliverySummary.cashAmount.toLocaleString()}{" "}
                                  ฿
                                </div>
                              </div>

                              {/* โอน */}
                              <div className="bg-slate-50/80 rounded-lg p-2 text-center border border-slate-100">
                                <div className="text-[10px] font-semibold text-slate-600 mb-0.5">
                                  โอน
                                </div>
                                <div className="text-xs font-bold text-slate-900 font-mono truncate">
                                  {deliverySummary.transferAmount.toLocaleString()}{" "}
                                  ฿
                                </div>
                              </div>

                              {/* ยอดชำระเงินรวม (ย้ายมาจากด้านบน) */}
                              <div className="bg-blue-50/70 rounded-lg p-2 text-center border border-blue-100/80">
                                <div className="text-[10px] font-semibold text-blue-900 mb-0.5 truncate">
                                  ยอดชำระรวม
                                </div>
                                <div className="text-xs font-extrabold text-blue-700 font-mono truncate">
                                  {deliverySummary.totalAmount.toLocaleString()}{" "}
                                  ฿
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 3. สรุปการโหลดสินค้า (แสดงเฉพาะรายการที่มี > 0) */}
                          <div className="space-y-1.5 border border-slate-200 rounded-lg p-2">
                            <div className="text-[10px] font-semibold text-slate-500 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <PackageCheck className="w-3 h-3 text-slate-400" />
                                <span>การโหลดสินค้า</span>
                              </span>
                              <span>
                                รวม{" "}
                                {deliverySummary.totalCargoQty.toLocaleString()}{" "}
                                รายการ
                              </span>
                            </div>

                            {deliverySummary.loadingSummary &&
                            deliverySummary.loadingSummary.length > 0 ? (
                              <div
                                className={`grid gap-2 ${deliverySummary.loadingSummary.length === 1 ? "grid-cols-1" : deliverySummary.loadingSummary.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}
                              >
                                {deliverySummary.loadingSummary.map((ls) => (
                                  <div
                                    key={ls.loading_type_id}
                                    className="bg-slate-50/80 rounded-lg p-2 text-center border border-slate-100"
                                  >
                                    <div
                                      className="text-[10px] font-semibold text-slate-600 mb-0.5 truncate"
                                      title={ls.type_name}
                                    >
                                      {ls.type_name}
                                    </div>
                                    <div className="text-xs font-bold text-slate-900 font-mono truncate">
                                      {ls.totalQty.toLocaleString()}{" "}
                                      <span className="text-[10px] font-normal text-slate-500">
                                        {ls.unit_name}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="bg-slate-50/80 rounded-lg p-2 text-center text-slate-400 text-[11px] border border-slate-100">
                                ไม่มีรายการโหลดสินค้า
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto overflow-y-auto max-h-[380px] rounded-lg border border-slate-200 bg-white custom-scrollbar">
                        <table className="w-full text-[11px] min-w-[1300px] border-collapse whitespace-nowrap text-slate-700">
                          <thead className="sticky top-0 bg-slate-100/95 font-bold text-slate-700 border-b border-slate-200 shadow-2xs z-20">
                            <tr className="text-left text-[11px] text-slate-700 font-semibold uppercase tracking-wider">
                              <th className="px-2.5 py-1 w-28">สถานะ</th>
                              <th className="px-2.5 py-1 w-28">รหัสออเดอร์</th>
                              <th className="px-2.5 py-1 min-w-[200px]">
                                ที่ตั้ง / ร้านค้า
                              </th>
                              <th className="px-2.5 py-1 w-32">
                                สายรถ / ทะเบียน
                              </th>
                              <th className="px-2.5 py-1 w-20">
                                ลำดับความสำคัญ
                              </th>
                              <th className="px-2.5 py-1 text-center w-24">
                                จุดวาง
                              </th>
                              <th className="px-2.5 py-1 w-24">
                                กำหนดเวลาไว้ที่
                              </th>
                              <th className="px-2.5 py-1 w-36">เริ่มบริการ</th>
                              <th className="px-2.5 py-1 w-36">
                                สิ้นสุดบริการ
                              </th>
                              <th className="px-2.5 py-1 w-24">ระยะเวลาจริง</th>
                              <th className="px-2.5 py-1 w-24 text-center">
                                หลักฐานการส่ง
                              </th>
                              {/* 12. Active Cargo Loading Types Headers */}
                              {activeLoadingTypes.map((lt) => (
                                <th
                                  key={lt.loading_type_id}
                                  className="px-2.5 py-1 text-center w-20"
                                >
                                  {lt.type_name || lt.loading_type_name}
                                </th>
                              ))}
                              <th className="px-2.5 py-1 text-center w-24">
                                จำนวนโหลดทั้งหมด
                              </th>
                              <th className="px-2.5 py-1 text-center w-24">
                                การชำระเงิน
                              </th>
                              <th className="px-2.5 py-1 text-center w-24">
                                จำนวนเงินสด
                              </th>
                              <th className="px-2.5 py-1 text-center w-24">
                                จำนวนเงินโอน
                              </th>                              
                              <th className="px-2.5 py-1 text-right w-16">
                                จัดการ
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {selectedRelease.stores.map(
                              (st: any, idx: number) => {
                                const status = getRouteStopStatus(st);
                                const statusStyle = getRouteStatusStyle(status);
                                const startTime =
                                  st.start_service_time ||
                                  st.date_time_check_in;
                                const endTime =
                                  st.end_service_time || st.date_time_check_out;
                                const ed = getEarlyDelayBadge(
                                  st.scheduled_time,
                                  startTime,
                                );
                                const edEnd = getEarlyDelayBadge(
                                  st.scheduled_time,
                                  endTime,
                                );
                                const actualDur = getRouteDuration(
                                  startTime,
                                  endTime,
                                );
                                const bypass = st.bypass ? "text-rose-800" : "text-slate-800"

                                return (
                                  <tr
                                    key={`route-style-${st.list_id || idx}`}
                                    onClick={() => setSelectedStoreItem(st)}
                                    className="hover:bg-blue-50/50 cursor-pointer transition-colors whitespace-nowrap"
                                  >
                                    {/* 1. สถานะ */}
                                    <td className="px-2.5 py-1">
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <div
                                          className="w-3.5 h-3.5 rounded-full text-white text-[8px] font-bold flex items-center justify-center shrink-0 shadow-2xs"
                                          style={{
                                            background:
                                              selectedRelease.group_color ||
                                              "#3b82f6",
                                          }}
                                        >
                                          {st.row_order || idx + 1}
                                        </div>
                                        <span
                                          className="text-[10px] font-bold px-2 py-0.2 rounded-full inline-block"
                                          style={{
                                            background: statusStyle.bg,
                                            color: statusStyle.text,
                                          }}
                                        >
                                          {getRouteStatusLabel(status)}
                                        </span>
                                      </div>
                                    </td>

                                    {/* 2. รหัสออเดอร์ */}
                                    <td className={`px-2.5 py-1 font-mono font-bold flex items-center gap-1 ${bypass}`}>
                                      {st.bypass && (
                                        <ChevronRight className="w-4 h-4"/>
                                      )}
                                      {st.data_store_no ||
                                        st.order_no ||
                                        st.orderNo ||
                                        "-"}
                                    </td>

                                    {/* 3. ที่ตั้ง / ร้านค้า */}
                                    <td className="px-2.5 py-1">
                                      <span className="font-semibold text-slate-900">
                                        {st.store_name_result ||
                                          st.store_name ||
                                          st.storeName ||
                                          "ร้านค้า"}
                                      </span>
                                      {(st.store_address ||
                                        st.address ||
                                        st.telephone_number) && (
                                        <span className="text-[10px] text-slate-500 font-normal ml-1">
                                          (
                                          {st.store_address ||
                                            st.address ||
                                            st.telephone_number}
                                          )
                                        </span>
                                      )}
                                    </td>

                                    {/* 4. สายรถ / ทะเบียน */}
                                    <td className="px-2.5 py-1">
                                      <span className="font-medium text-slate-800 text-[11px]">
                                        {selectedRelease.group_store_name ||
                                          "-"}
                                      </span>
                                      {(selectedRelease.license_plate ||
                                        st.license_plate) && (
                                        <span className="text-[10px] font-mono text-slate-500 ml-1">
                                          [
                                          {selectedRelease.license_plate ||
                                            st.license_plate}
                                          ]
                                        </span>
                                      )}
                                    </td>

                                    {/* 5. ลำดับความสำคัญ */}
                                    <td className="px-2.5 py-1">
                                      {getPriorityBadge(st.priority)}
                                    </td>

                                    {/* 6. จุดวาง */}
                                    <td className="px-2.5 py-1 text-center font-mono font-bold">
                                      {st.position_product_name ||
                                      st.position_product_id ? (
                                        <span className="inline-flex items-center text-amber-900 font-mono font-extrabold text-[10px] px-1.5 py-0.2 rounded shadow-2xs shrink-0">
                                          {st.position_product_name ||
                                            st.position_product_id}
                                          /{st.position_production_order || 1}
                                        </span>
                                      ) : (
                                        <span className="text-slate-400 font-normal">
                                          -
                                        </span>
                                      )}
                                    </td>

                                    {/* 7. กำหนดเวลาไว้ที่ */}
                                    <td className="px-2.5 py-1 font-mono font-bold text-slate-700">
                                      {ed?.scheduledText ||
                                        st.scheduled_time?.slice(0, 5) ||
                                        "-"}
                                    </td>

                                    {/* 8. เริ่มบริการ */}
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
                                        <span className="font-bold text-slate-800">
                                          {formatRouteServiceTime(startTime)}
                                        </span>
                                      )}
                                    </td>

                                    {/* 9. สิ้นสุดบริการ */}
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
                                        <span className="font-bold text-slate-800">
                                          {formatRouteServiceTime(endTime)}
                                        </span>
                                      )}
                                    </td>

                                    {/* 10. ระยะเวลาจริง */}
                                    <td className="px-2.5 py-1 font-mono text-slate-700 font-bold">
                                      {actualDur}
                                    </td>

                                    {/* 11. หลักฐานการส่ง */}
                                    <td className="px-2.5 py-1 text-center">
                                      {st.pod_image ? (
                                        <a
                                          href={getImageUrl(st.pod_image)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="inline-block"
                                        >
                                          <img
                                            src={getImageUrl(st.pod_image)}
                                            alt="POD"
                                            className="w-5 h-5 object-cover rounded border border-slate-300 hover:scale-110 transition-transform"
                                          />
                                        </a>
                                      ) : (
                                        <span className="text-slate-400 font-mono">
                                          -
                                        </span>
                                      )}
                                    </td>

                                    {/* 12. Dynamic Active Cargo Loading Type Cells */}
                                    {activeLoadingTypes.map((lt) => {
                                      const qty = getStoreLoadQty(st, lt);
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
                                    <td className="px-2.5 py-1 text-center font-mono font-bold text-amber-800">
                                      {st.sum_quantity ?? st.quantity ?? 1}
                                    </td>

                                    {/* 14. การชำระเงิน */}
                                    <td className="px-2.5 py-1 text-center font-bold text-slate-900">
                                      {st.payment_name ?? "-"}
                                    </td>

                                    {/* 15. จำนวนเงินสด */}
                                    <td className="px-2.5 py-1 text-center font-bold text-slate-900">
                                      {formatMoney(st.cash ?? 0)}
                                    </td>

                                    {/* 16. จำนวนเงินโอน */}
                                    <td className="px-2.5 py-1 text-center font-bold text-slate-900">
                                      {formatMoney(st.transfer ?? 0)}
                                    </td>

                                    {/* 17. จัดการ */}
                                    <td className="px-2.5 py-1 text-right">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedStoreItem(st);
                                        }}
                                        className="p-0.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                        title="ตรวจเช็ครายการ"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              },
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                {/* Car Return Record & Photos */}
                {selectedRelease.car_return && (
                  <div className="bg-white space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <RotateCcw className="w-4 h-4 text-emerald-600" />
                        <span>ข้อมูลการคืนรถ (บันทึกเรียบร้อย)</span>
                      </h4>
                      <button
                        onClick={() => handleOpenReturnDrawer(selectedRelease)}
                        className="text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>แก้ไขการคืนรถ</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs text-slate-800">
                      <div>
                        <span className="text-slate-500 block text-[10px]">
                          เลขไมล์คืน
                        </span>
                        <span className="font-bold font-mono text-slate-900">
                          {Number(
                            selectedRelease.car_return.mileage || 0,
                          ).toLocaleString()}{" "}
                          กม.
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">
                          ผู้ถือกุญแจ
                        </span>
                        <span className="font-semibold text-slate-900">
                          {selectedRelease.car_return.key_holder_name || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">
                          จุดจอดรถ
                        </span>
                        <span className="font-semibold text-slate-900">
                          {selectedRelease.car_return.parking_name || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">
                          ค่าน้ำมัน
                        </span>
                        <span className="font-semibold text-slate-900">
                          {selectedRelease.car_return.gas_bill
                            ? `${Number(selectedRelease.car_return.gas_bill).toLocaleString()} ฿`
                            : "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">
                          หมายเหตุ
                        </span>
                        <span className="font-semibold truncate block text-slate-900">
                          {selectedRelease.car_return.note || "-"}
                        </span>
                      </div>
                    </div>

                    {/* Return Photos Gallery Grid */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="text-[11px] font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-slate-600" />
                        <span>รูปถ่ายตอนคืนรถ</span>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1">
                        {(() => {
                          const returnPhotoItems = [
                            {
                              label: "เลขไมล์คืน",
                              val: selectedRelease.car_return.image_mileage,
                            },
                            {
                              label: "หน้ารถคืน",
                              val: selectedRelease.car_return.image_front,
                            },
                            {
                              label: "รอบคัน 1",
                              val: selectedRelease.car_return.image_around_1,
                            },
                            {
                              label: "รอบคัน 2",
                              val: selectedRelease.car_return.image_around_2,
                            },
                            {
                              label: "รอบคัน 3",
                              val: selectedRelease.car_return.image_around_3,
                            },
                            {
                              label: "รอบคัน 4",
                              val: selectedRelease.car_return.image_around_4,
                            },
                            {
                              label: "คืนรถโดยรวม",
                              val: selectedRelease.car_return.image_return,
                            },
                            {
                              label: "PDA คืน",
                              val: selectedRelease.car_return.image_pda,
                            },
                          ].filter((item) => !!item.val);

                          const returnLightboxList: LightboxImage[] =
                            returnPhotoItems.map((item) => ({
                              url: getImageUrl(item.val),
                              title: `รูปถ่ายคืนรถ (${selectedRelease.car_release_no}): ${item.label}`,
                              description: `ทะเบียน: ${selectedRelease.license_plate} | เวลาคืนรถ: ${selectedRelease.car_return.created_at || "-"}`,
                            }));

                          return returnPhotoItems.map((item, idx) => (
                            <div
                              key={idx}
                              onClick={() =>
                                openLightbox(returnLightboxList, idx)
                              }
                              className="border border-slate-200 rounded-lg overflow-hidden bg-slate-100 aspect-video relative group shadow-2xs cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all"
                              title={`คลิกเพื่อดูและขยายรูป ${item.label}`}
                            >
                              <img
                                loading="lazy"
                                src={getImageUrl(item.val)}
                                alt={item.label}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute bottom-0.5 right-0.5 bg-slate-900/80 text-white text-[8px] px-1 py-0.2 rounded font-medium">
                                {item.label}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: LIVE VEHICLE GPS TRACKING & ROUTE MAP */}
            {activeDetailTab === "gps" && (
              <ReleaseGpsMapTab
                release={selectedRelease}
                stores={selectedRelease.stores || []}
              />
            )}

            {/* TAB 3: CAR RELEASE CHAT */}
            {activeDetailTab === "chat" && (
              <ReleaseChatTab
                carReleaseId={selectedRelease.car_release_id}
                driverName={selectedRelease.driver_name}
                carReleaseNo={selectedRelease.car_release_no}
              />
            )}
          </div>
        )}
      </AnimatedDrawer>

      {/* AnimatedDrawer - CAR RETURN FORM */}
      <AnimatedDrawer
        isOpen={isReturnDrawerOpen}
        onClose={() => setIsReturnDrawerOpen(false)}
        title={
          returnTargetRelease ? (
            <div className="flex items-center gap-2">
              <span>
                บันทึกการคืนรถ: {returnTargetRelease.car_release_no} (
                {returnTargetRelease.license_plate})
              </span>
            </div>
          ) : (
            "บันทึกการคืนรถ"
          )
        }
        formId="car-return-form"
        onSubmit={handleReturnFormSubmit}
        submitLabel={isSubmittingReturn ? "กำลังบันทึก..." : "บันทึกการคืนรถ"}
        maxWidthClass="max-w-6xl"
      >
        {returnTargetRelease && (
          <div className="space-y-5 pb-8 text-xs text-slate-800">
            {/* Target Summary Header */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-500 block font-semibold">
                  เลขที่ปล่อยรถ
                </span>
                <span className="font-bold text-sm text-slate-900 font-mono">
                  {returnTargetRelease.car_release_no}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block font-semibold">
                  ทะเบียนรถ
                </span>
                <span className="font-bold text-xs text-slate-900">
                  {returnTargetRelease.license_plate}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block font-semibold">
                  พนักงานขับรถ
                </span>
                <span className="font-bold text-xs text-slate-900">
                  {returnTargetRelease.driver_name || "-"}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block font-semibold">
                  เลขไมล์ปล่อยรถ (ตอนออก)
                </span>
                <span className="font-bold text-xs text-slate-900 font-mono">
                  {Number(returnTargetRelease.mileage || 0).toLocaleString()}{" "}
                  กม.
                </span>
              </div>
            </div>

            {/* Form Section 1: Information */}
            <div className="border border-slate-200/80 bg-white rounded-xl p-4 space-y-3.5 shadow-2xs">
              <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>1. ข้อมูลการคืนรถ</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Mileage */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    เลขไมล์ตอนกลับ (กม.){" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={returnMileage}
                    onChange={(e) => setReturnMileage(Number(e.target.value))}
                    min={returnTargetRelease.mileage || 0}
                    className="w-full border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                    placeholder="ระบุเลขไมล์คืน..."
                  />
                  {Number(returnMileage) <
                    Number(returnTargetRelease.mileage || 0) && (
                    <span className="text-[10px] text-rose-500 mt-0.5 block">
                      * ต้องไม่น้อยกว่าเลขไมล์ออก ({returnTargetRelease.mileage}{" "}
                      กม.)
                    </span>
                  )}
                </div>

                {/* Key Holder */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    ผู้ถือกุญแจ / จุดฝากกุญแจ
                  </label>
                  <SearchableSelect
                    options={keyHolderOptions}
                    value={String(returnKeyHolderId)}
                    onChange={(val) => setReturnKeyHolderId(val)}
                    placeholder="-- เลือกผู้ถือกุญแจ --"
                  />
                </div>

                {/* Parking Location */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    จุดจอดรถ / ลานจอด
                  </label>
                  <SearchableSelect
                    options={parkingOptions}
                    value={String(returnParkingId)}
                    onChange={(val) => setReturnParkingId(val)}
                    placeholder="-- เลือกลานจอด --"
                  />
                </div>

                {/* Gas Bill */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    ค่าน้ำมัน (บาท)
                  </label>
                  <input
                    type="number"
                    value={returnGasBill}
                    onChange={(e) => setReturnGasBill(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                    placeholder="0.00"
                  />
                </div>

                {/* Note */}
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    หมายเหตุเพิ่มเติม
                  </label>
                  <textarea
                    rows={2}
                    value={returnNote}
                    onChange={(e) => setReturnNote(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-500 text-xs resize-none"
                    placeholder="ระบุหมายเหตุ เช่น รถมีรอยขีดข่วนเพิ่ม, สภาพกุญแจ..."
                  />
                </div>
              </div>
            </div>

            {/* Form Section 2: 8 Vehicle Return Photos */}
            <div className="border border-slate-200/80 bg-white rounded-xl p-4 space-y-3.5 shadow-2xs">
              <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-slate-600" />
                  <span>2. รูปถ่ายการคืนรถ (8 ตำแหน่ง)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ถ่ายรูปหรือเลือกไฟล์ภาพสภาพรถตอนคืน
                </span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {renderImagePicker(
                  "1. รูปเลขไมล์คืน",
                  returnImgMileage,
                  setReturnImgMileage,
                  "return_img_mileage",
                )}
                {renderImagePicker(
                  "2. รูปหน้ารถคืน",
                  returnImgFront,
                  setReturnImgFront,
                  "return_img_front",
                )}
                {renderImagePicker(
                  "3. รอบคัน 1 (ซ้าย)",
                  returnImgAround1,
                  setReturnImgAround1,
                  "return_img_around1",
                )}
                {renderImagePicker(
                  "4. รอบคัน 2 (ขวา)",
                  returnImgAround2,
                  setReturnImgAround2,
                  "return_img_around2",
                )}
                {renderImagePicker(
                  "5. รอบคัน 3 (หลัง)",
                  returnImgAround3,
                  setReturnImgAround3,
                  "return_img_around3",
                )}
                {renderImagePicker(
                  "6. รอบคัน 4 (ในรถ)",
                  returnImgAround4,
                  setReturnImgAround4,
                  "return_img_around4",
                )}
                {renderImagePicker(
                  "7. รูปคืนรถโดยรวม",
                  returnImgReturn,
                  setReturnImgReturn,
                  "return_img_return",
                )}
                {renderImagePicker(
                  "8. รูปถ่าย PDA ตอนคืน",
                  returnImgPda,
                  setReturnImgPda,
                  "return_img_pda",
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatedDrawer>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!releaseToDelete}
        title="ยืนยันการลบใบปล่อยรถ"
        message={`คุณต้องการลบข้อมูลใบปล่อยรถ "${releaseToDelete?.car_release_no}" (ทะเบียน: ${releaseToDelete?.license_plate}, คนขับ: ${releaseToDelete?.driver_name}) จากฐานข้อมูลใช่หรือไม่?`}
        confirmText="ลบข้อมูล"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDelete}
        onCancel={() => setReleaseToDelete(null)}
      />

      {/* AnimatedDrawer for Accounting Status & Remarks Update */}
      <AnimatedDrawer
        isOpen={isAccountingDrawerOpen}
        onClose={() => setIsAccountingDrawerOpen(false)}
        title="อัปเดตสถานะทางบัญชี"
        maxWidthClass="max-w-md"
        formId="accounting-status-form"
        onSubmit={handleUpdateAccountingStatus}
        submitLabel={isSubmittingAcc ? "กำลังบันทึก..." : "บันทึกสถานะทางบัญชี"}
      >
        <form
          id="accounting-status-form"
          onSubmit={handleUpdateAccountingStatus}
          className="space-y-4 text-xs"
        >
          {/* Select Accounting Status with SearchableSelect */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              สถานะทางบัญชี <span className="text-rose-500">*</span>
            </label>
            <SearchableSelect
              options={accountingOptions}
              value={accFormStatusId}
              onChange={(val) => setAccFormStatusId(val)}
              placeholder="-- เลือกสถานะทางบัญชี --"
              searchPlaceholder="ค้นหาสถานะทางบัญชี..."
              required
            />
          </div>

          {/* Remarks / Description Textarea */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              หมายเหตุ / รายละเอียดเพิ่มเติม
            </label>
            <textarea
              rows={4}
              value={accFormNote}
              onChange={(e) => setAccFormNote(e.target.value)}
              placeholder="กรอกหมายเหตุ ข้อความบันทึกเพิ่มเติม หรือเหตุผลการปรับปรุงสถานะทางบัญชี..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400"
            />
          </div>
        </form>
      </AnimatedDrawer>

      {/* Export PDF / Excel Drawer */}
      <ExportDrawer
        isOpen={isExportDrawerOpen}
        onClose={() => setIsExportDrawerOpen(false)}
        title="ส่งออกข้อมูลใบปล่อยรถ (Export Report)"
        columns={exportColumns}
        data={filteredReleases}
        getValue={getExportValue}
        fileNamePrefix="Car_Release_Report"
      />

      {/* Check In / Check Out / Problem Modal */}
      <DeliveryCheckInOutModal
        isOpen={!!selectedStoreItem}
        onClose={() => setSelectedStoreItem(null)}
        car_release_no={selectedRelease?.car_release_no}
        storeItem={selectedStoreItem}
        onStatusUpdated={async () => {
          await fetchReleases();
          if (selectedRelease) {
            try {
              const relRes = await api.get(
                `/car-release/${selectedRelease.car_release_id}`,
              );
              if (relRes.data.success && relRes.data.release) {
                const freshRel = relRes.data.release;
                setSelectedRelease(freshRel);
                if (selectedStoreItem) {
                  const currentId =
                    selectedStoreItem.list_id || selectedStoreItem.id;
                  const freshStore = (freshRel.stores || []).find(
                    (s: any) => (s.list_id || s.id) === currentId,
                  );
                  if (freshStore) {
                    setSelectedStoreItem(freshStore);
                  }
                }
              }
            } catch (err) {
              console.error("Failed to refresh release detail", err);
            }
          }
        }}
      />

      {/* Lightbox / Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 text-white">
              <span className="font-semibold text-xs text-slate-200 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-blue-400" />
                <span>{previewImage.title}</span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="ปิด"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 flex items-center justify-center bg-slate-950 max-h-[80vh] overflow-auto">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      )}

      {/* Interactive Expandable Image Lightbox Modal */}
      <ImageLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={lightboxImages}
        currentIndex={lightboxIndex}
        onIndexChange={(idx) => setLightboxIndex(idx)}
      />
    </div>
  );
};
