import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  X,
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  Plus,
  Trash2,
  Sliders,
  Package,
  HelpCircle,
  FileText,
  Upload,
  Layers,
  ArrowRight,
  RefreshCw,
  Phone,
  Building,
  Navigation,
  CheckSquare,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Edit2,
  RotateCcw,
  PenTool,
} from "lucide-react";
import api, { getImageUrl } from "../services/api";
import { useToast } from "../context/ToastContext";
import { AnimatedDrawer } from "./AnimatedDrawer";
import { SearchableSelect } from "./SearchableSelect";
import ImageLightboxModal, { LightboxImage } from "./ImageLightboxModal";

interface DeliveryCheckInOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeItem: any | null;
  car_release_no: string;
  onStatusUpdated?: () => void;
}

// Haversine distance formula in meters
function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371e3; // meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Helper to format time as HH:mm
function formatTimeString(dtStr?: string): string {
  if (!dtStr) return "-";
  if (dtStr.includes(" ") || dtStr.includes("T")) {
    const d = new Date(dtStr.replace(" ", "T"));
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }
  if (dtStr.length >= 5) {
    return dtStr.slice(0, 5);
  }
  return dtStr;
}

// Helper to calculate actual duration between start and end service
function calculateActualDuration(startStr?: string, endStr?: string): string {
  if (!startStr || !endStr) return "-";
  const start = new Date(startStr.replace(" ", "T")).getTime();
  const end = new Date(endStr.replace(" ", "T")).getTime();
  if (isNaN(start) || isNaN(end) || end < start) return "-";

  const totalMinutes = Math.round((end - start) / 60000);
  if (totalMinutes < 60) {
    return `${totalMinutes} นาที`;
  }
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins > 0 ? `${hrs} ชม. ${mins} นาที` : `${hrs} ชม.`;
}

// Interactive Digital Signature Canvas Pad Component
const SignaturePad: React.FC<{
  onChange: (base64: string) => void;
  onClear: () => void;
}> = ({ onChange, onClear }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current && hasSigned) {
      onChange(canvasRef.current.toDataURL("image/png"));
    }
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
    onClear();
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
          <PenTool className="w-3.5 h-3.5 text-emerald-600" />
          <span>เซ็นลายเซ็นผู้เช็คอิน <span className="text-rose-500">*</span></span>
        </label>
        {hasSigned && (
          <button
            type="button"
            onClick={handleClearCanvas}
            className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>ล้างลายเซ็น</span>
          </button>
        )}
      </div>

      <div className="relative rounded-xl border border-slate-300 bg-white overflow-hidden shadow-2xs">
        <canvas
          ref={canvasRef}
          width={450}
          height={130}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-32 touch-none cursor-crosshair bg-white"
        />
        {!hasSigned && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 text-xs font-semibold">
            เซ็นชื่อ / วาดลายเซ็นบริเวณนี้
          </div>
        )}
      </div>
    </div>
  );
};

// Custom Draggable Slide-to-Check-In Action Button (White Theme)
const SlideToCheckInButton: React.FC<{
  onSlideComplete: () => void;
  disabled?: boolean;
}> = ({ onSlideComplete, disabled = false }) => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging || !trackRef.current || disabled) return;
      const rect = trackRef.current.getBoundingClientRect();
      const handleWidth = 44;
      const maxDrag = rect.width - handleWidth - 6;
      let newX = clientX - rect.left - handleWidth / 2;
      if (newX < 0) newX = 0;
      if (newX > maxDrag) newX = maxDrag;
      setDragX(newX);

      if (newX >= maxDrag * 0.88) {
        setIsDragging(false);
        setDragX(maxDrag);
        setTimeout(() => {
          onSlideComplete();
          setDragX(0);
        }, 150);
      }
    },
    [isDragging, disabled, onSlideComplete],
  );

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    setDragX(0);
  }, [isDragging]);

  useEffect(() => {
    const onWindowMove = (e: MouseEvent) => handleMove(e.clientX);
    const onWindowUp = () => handleEnd();
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX);
    };
    const onTouchEnd = () => handleEnd();

    if (isDragging) {
      window.addEventListener("mousemove", onWindowMove);
      window.addEventListener("mouseup", onWindowUp);
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("touchend", onTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", onWindowMove);
      window.removeEventListener("mouseup", onWindowUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  return (
    <div
      ref={trackRef}
      className={`relative w-full h-12 rounded-xl select-none overflow-hidden flex items-center p-1 border transition-colors shadow-2xs ${disabled
        ? "bg-slate-100 border-slate-200 cursor-not-allowed opacity-60"
        : "bg-slate-100 border-slate-300 hover:border-slate-400"
        }`}
    >
      {/* Progress fill background */}
      <div
        className="absolute left-0 top-0 bottom-0 bg-emerald-600 transition-all duration-75 rounded-lg"
        style={{ width: `${dragX + 47.5}px` }}
      />

      {/* Centered text label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-10 text-center">
        <span className="text-xs font-bold text-slate-700 tracking-wide flex items-center gap-1">
          <span>สไลด์จากซ้ายไปขวาเพื่อเช็คอิน</span>
          <ChevronRight className="w-4 h-4 text-emerald-600 animate-pulse" />
          <ChevronRight className="w-4 h-4 text-emerald-500 animate-pulse -ml-2.5" />
        </span>
      </div>

      {/* Draggable handle button */}
      <div
        onMouseDown={() => {
          if (!disabled) setIsDragging(true);
        }}
        onTouchStart={() => {
          if (!disabled) setIsDragging(true);
        }}
        style={{ transform: `translateX(${dragX}px)` }}
        className={`relative z-10 w-10 h-10 rounded-lg flex items-center justify-center border shadow-xs transition-transform cursor-grab active:cursor-grabbing ${disabled
          ? "bg-slate-200 text-slate-400 border-slate-300"
          : "bg-white border-slate-300 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400 hover:scale-105 active:scale-95"
          }`}
      >
        <MapPin className="w-5 h-5 text-emerald-600 animate-bounce" />
      </div>
    </div>
  );
};

export const DeliveryCheckInOutDrawer: React.FC<DeliveryCheckInOutModalProps> = ({
  isOpen,
  onClose,
  storeItem: propStoreItem,
  car_release_no,
  onStatusUpdated,
}) => {
  const { showSuccess, showError } = useToast();

  const [localStoreItem, setLocalStoreItem] = useState<any>(propStoreItem);

  useEffect(() => {
    if (propStoreItem) {
      setLocalStoreItem(propStoreItem);
    }
  }, [propStoreItem]);

  const storeItem = localStoreItem || propStoreItem || {};

  // Settings & Distance state
  const [maxDistanceMeters, setMaxDistanceMeters] = useState<number>(() => {
    const saved = localStorage.getItem("checkin_max_distance");
    return saved ? parseInt(saved, 10) : 100;
  });
  const [showSettings, setShowSettings] = useState(false);

  // GPS State
  const [userGps, setUserGps] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Workflow state: "details" | "checkin" | "choose" | "checkout" | "problem"
  const [activeStep, setActiveStep] = useState<
    "details" | "checkin" | "choose" | "checkout" | "problem"
  >("details");

  // Check-in state
  const [checkInImg, setCheckInImg] = useState<string>("");
  const [signatureImg, setSignatureImg] = useState<string>("");
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false);

  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const paymentSelectOptions = useMemo(() => {
    return paymentMethods.map((p) => ({
      value: String(p.payment_id),
      label: p.payment_name,
    }));
  }, [paymentMethods]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | number>("");
  const [selectedPaymentName, setSelectedPaymentName] = useState<string>("");
  const [cashAmount, setCashAmount] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [singleAmount, setSingleAmount] = useState<string>("");
  const [checkoutNote, setCheckoutNote] = useState<string>("");
  const [checkOutImgs, setCheckOutImgs] = useState<string[]>([]);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);

  // Problem state
  const [predefinedProblems, setPredefinedProblems] = useState<string[]>([
    "ร้านปิด",
    "บิลผิด",
    "ของไม่ครบ / สินค้าเสียหาย",
    "ลูกค้าปฏิเสธการรับสินค้า",
    "ติดต่อลูกค้าไม่ได้",
    "+ ระบุปัญหาอื่นๆ (พิมพ์เอง)",
  ]);
  const problemOptions = useMemo(() => {
    return predefinedProblems.map((prob) => ({
      value: prob,
      label: prob,
    }));
  }, [predefinedProblems]);
  const [selectedProblem, setSelectedProblem] = useState<string>("ร้านปิด");
  const [customProblemText, setCustomProblemText] = useState<string>("");
  const [problemNote, setProblemNote] = useState<string>("");
  const [problemImgs, setProblemImgs] = useState<string[]>([]);
  const [isSubmittingProblem, setIsSubmittingProblem] = useState(false);

  // Fetch dynamic problem types from master API when modal opens
  useEffect(() => {
    if (isOpen) {
      api.get("/master/problem-types")
        .then((res) => {
          if (res.data.success && Array.isArray(res.data.problemTypes) && res.data.problemTypes.length > 0) {
            const activeList = res.data.problemTypes
              .filter((pt: any) => pt.status === "active")
              .map((pt: any) => pt.problem_type_name);
            
            const filtered = activeList.filter((n: string) => n !== "+ ระบุปัญหาอื่นๆ (พิมพ์เอง)");
            const finalList = [...filtered, "+ ระบุปัญหาอื่นๆ (พิมพ์เอง)"];
            
            setPredefinedProblems(finalList);
            if (finalList.length > 0 && !finalList.includes(selectedProblem)) {
              setSelectedProblem(finalList[0]);
            }
          }
        })
        .catch((err) => {
          console.error("Error fetching master problem types:", err);
        });
    }
  }, [isOpen]);

  // Lightbox Image Preview State
  const [lightboxImages, setLightboxImages] = useState<LightboxImage[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  const openLightbox = useCallback((images: LightboxImage[], index = 0) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  }, []);

  // Save distance setting to localStorage
  const handleSaveDistanceSetting = (val: number) => {
    setMaxDistanceMeters(val);
    localStorage.setItem("checkin_max_distance", String(val));
    showSuccess(`ตั้งค่าระยะห่างสูงสุดเรียบร้อย (${val} เมตร)`);
    setShowSettings(false);
  };

  // Fetch payment & GPS distance master options
  useEffect(() => {
    if (!isOpen) return;
    const fetchMasterOptions = async () => {
      try {
        const [payRes, gpsRes] = await Promise.allSettled([
          api.get("/master/payments"),
          api.get("/master/gps-distance"),
        ]);

        if (payRes.status === "fulfilled" && payRes.value.data.success && Array.isArray(payRes.value.data.payments)) {
          setPaymentMethods(payRes.value.data.payments);
        } else {
          const fallbacks = [
            { payment_id: 1, payment_name: "เงินสด" },
            { payment_id: 2, payment_name: "โอน / QR Code" },
            { payment_id: 3, payment_name: "เครดิต" },
            { payment_id: 4, payment_name: "แบ่งจ่าย (เงินสด + เงินโอน)" },
          ];
          setPaymentMethods(fallbacks);
        }

        // Fetch check-in distance radius from Master GPS Distance table (CHECKIN_RADIUS)
        if (gpsRes.status === "fulfilled" && gpsRes.value.data.success && Array.isArray(gpsRes.value.data.distances)) {
          const checkinRule = gpsRes.value.data.distances.find(
            (d: any) => d.distance_code === "CHECKIN_RADIUS" && (d.is_active === 1 || d.is_active === true || d.is_active === undefined)
          );
          if (checkinRule && checkinRule.distance_meters !== undefined && checkinRule.distance_meters !== null) {
            const mVal = Number(checkinRule.distance_meters);
            if (mVal > 0) {
              setMaxDistanceMeters(mVal);
            }
          }
        }
      } catch (err) {
        console.warn("Fetch modal master options error:", err);
      }
      setSelectedPaymentId("");
      setSelectedPaymentName("");
    };
    fetchMasterOptions();
  }, [isOpen]);

  // Acquire Geolocation
  const requestGpsLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("เบราว์เซอร์ไม่รองรับ GPS Geolocation");
      return;
    }
    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setUserGps({ lat: userLat, lng: userLng });
        setIsLocating(false);

        let storeLat: number | null = null;
        let storeLng: number | null = null;

        if (storeItem?.lat && storeItem?.lng) {
          storeLat = parseFloat(storeItem.lat);
          storeLng = parseFloat(storeItem.lng);
        } else if (storeItem?.store_location) {
          const parts = String(storeItem.store_location).split(",");
          if (parts.length === 2) {
            storeLat = parseFloat(parts[0]);
            storeLng = parseFloat(parts[1]);
          }
        }

        if (storeLat && storeLng && !isNaN(storeLat) && !isNaN(storeLng)) {
          const dist = calculateDistanceMeters(
            userLat,
            userLng,
            storeLat,
            storeLng,
          );
          setDistanceMeters(dist);
        } else {
          setDistanceMeters(0);
        }
      },
      (err) => {
        setIsLocating(false);
        setLocationError(
          err.message || "ไม่สามารถดึงตำแหน่ง GPS ได้ กรุณาเปิด Location Service",
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  // Reset or initialize state when modal/drawer opens
  useEffect(() => {
    if (!isOpen || !storeItem) return;

    setActiveStep("details");

    setCheckInImg("");
    setSignatureImg("");
    setCheckOutImgs([]);
    setProblemImgs([]);
    setCashAmount("");
    setTransferAmount("");
    setSingleAmount("");
    setCheckoutNote("");
    setProblemNote("");
    setCustomProblemText("");
    setSelectedProblem("ร้านปิด");
    setSelectedPaymentId("");
    setSelectedPaymentName("");

    requestGpsLocation();
  }, [isOpen, storeItem]);

  if (!isOpen || !storeItem) return null;

  const hasCheckedIn =
    Boolean(storeItem.check_in_id) ||
    Boolean(storeItem.image_check_in) ||
    Boolean(storeItem.date_time_check_in);
  const isCompleted = storeItem.status === "completed" || Boolean(storeItem.check_out_id);
  const isProblem = storeItem.status === "problem" || Boolean(storeItem.problem_id);

  const handleSingleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (b64: string) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleMultipleImagesUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setter((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Submit Handlers
  const handleSubmitCheckIn = async () => {
    if (!checkInImg) {
      showError("กรุณาถ่ายรูปหรือแนบรูปภาพสำหรับเช็คอิน");
      return;
    }

    if (!signatureImg) {
      showError("กรุณาเซ็นลายเซ็นสำหรับเช็คอิน");
      return;
    }

    if (
      distanceMeters !== null &&
      distanceMeters > maxDistanceMeters &&
      distanceMeters > 0
    ) {
      showError(
        `ไม่สามารถเช็คอินได้: ตำแหน่งของคุณห่างจากจุดส่ง ${distanceMeters} เมตร (ต้องไม่เกิน ${maxDistanceMeters} เมตร)`,
      );
      return;
    }

    setIsSubmittingCheckIn(true);
    try {
      const listId = storeItem.list_id || storeItem.id;
      const locStr = userGps ? `${userGps.lat},${userGps.lng}` : "";
      const res = await api.post(`/list-store/${listId}/check-in`, {
        car_release_no: car_release_no,
        image_check_in: checkInImg,
        signature: signatureImg,
        location: locStr,
        store_id: storeItem.store_id,
        group_store_id: storeItem.group_store_id,
      });

      if (res.data.success) {
        showSuccess("เช็คอินเข้าจุดจัดส่งเรียบร้อยแล้ว");

        const nowFormatted = new Date().toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
        });

        setLocalStoreItem((prev: any) => ({
          ...(prev || propStoreItem),
          status: "in_progress",
          date_time_check_in: nowFormatted,
          check_in_time: nowFormatted,
          start_service_time: nowFormatted,
          image_check_in: checkInImg,
          signature: signatureImg,
          check_in_id: res.data.check_in_id || 1,
        }));

        if (onStatusUpdated) onStatusUpdated();
        setActiveStep("details");
      } else {
        showError(res.data.message || "เช็คอินไม่สำเร็จ");
      }
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการเช็คอิน");
    } finally {
      setIsSubmittingCheckIn(false);
    }
  };

  const handleSubmitCheckOut = async () => {
    if (checkOutImgs.length === 0) {
      showError("กรุณาถ่ายรูปหรือแนบรูปภาพหลักฐานการเช็คเอาท์อย่างน้อย 1 รูป");
      return;
    }

    const isSplit =
      selectedPaymentName.includes("แบ่งจ่าย") ||
      selectedPaymentName.includes("split");

    let cashVal = 0;
    let transferVal = 0;

    if (isSplit) {
      cashVal = parseFloat(cashAmount) || 0;
      transferVal = parseFloat(transferAmount) || 0;
      if (cashVal <= 0 && transferVal <= 0) {
        showError("กรุณาระบุจำนวนเงินสด หรือ เงินโอน ให้ถูกต้อง");
        return;
      }
    } else {
      const singleVal = parseFloat(singleAmount) || 0;
      if (singleVal <= 0) {
        showError("กรุณาระบุจำนวนเงินชำระให้ถูกต้อง");
        return;
      }
      if (
        selectedPaymentName.includes("โอน") ||
        selectedPaymentName.includes("QR")
      ) {
        transferVal = singleVal;
      } else {
        cashVal = singleVal;
      }
    }

    setIsSubmittingCheckout(true);
    try {
      const listId = storeItem.list_id || storeItem.id;
      const locStr = userGps ? `${userGps.lat},${userGps.lng}` : "";

      const res = await api.post(`/list-store/${listId}/check-out`, {
        car_release_no: car_release_no,
        payment_id: selectedPaymentId,
        image_bill: checkOutImgs[0],
        additional_images: checkOutImgs.slice(1),
        cash: cashVal,
        transfer: transferVal,
        current_location: locStr,
        visit_type_id: 4,
        visit_note: checkoutNote,
        store_id: storeItem.store_id,
        group_store_id: storeItem.group_store_id,
      });

      if (res.data.success) {
        showSuccess("บันทึกการเช็คเอาท์ (เสร็จสิ้น) เรียบร้อยแล้ว");
        if (onStatusUpdated) onStatusUpdated();
        onClose();
      } else {
        showError(res.data.message || "เช็คเอาท์ไม่สำเร็จ");
      }
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการเช็คเอาท์");
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

  const handleSubmitProblem = async () => {
    const finalProblemName =
      selectedProblem === "+ ระบุปัญหาอื่นๆ (พิมพ์เอง)"
        ? customProblemText.trim()
        : selectedProblem;

    if (!finalProblemName) {
      showError("กรุณาระบุประเภทปัญหา");
      return;
    }

    if (!problemNote.trim()) {
      showError("กรุณาระบุหมายเหตุรายละเอียดปัญหา (บังคับ)");
      return;
    }

    setIsSubmittingProblem(true);
    try {
      const listId = storeItem.list_id || storeItem.id;
      const res = await api.post(`/list-store/${listId}/problem`, {
        car_release_no: car_release_no,
        problem_name: finalProblemName,
        normal_bill_note: problemNote,
        problem_images: problemImgs,
      });

      if (res.data.success) {
        showSuccess("บันทึกการแจ้งปัญหาเรียบร้อยแล้ว");
        if (onStatusUpdated) onStatusUpdated();
        onClose();
      } else {
        showError(res.data.message || "บันทึกปัญหาไม่สำเร็จ");
      }
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกปัญหา");
    } finally {
      setIsSubmittingProblem(false);
    }
  };

  const isSplitPayment =
    selectedPaymentName.includes("แบ่งจ่าย") ||
    selectedPaymentName.includes("split");
  const computedTotalAmount =
    (parseFloat(cashAmount) || 0) + (parseFloat(transferAmount) || 0);

  const drawerTitle = (
    <div className="flex items-center justify-between w-full pr-2">
      <div className="flex items-center gap-2 min-w-0">
        <div className="min-w-0">
          <div className="font-bold text-slate-900 text-xs leading-tight truncate">
            {"รายละเอียดจุดจัดส่ง"}
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {storeItem.data_store_no || storeItem.order_no || "ออเดอร์ #"}
          </div>
        </div>
      </div>
    </div>
  );

  const startTimeVal = storeItem.start_service_time || storeItem.date_time_check_in || storeItem.check_in_time;
  const endTimeVal = storeItem.end_service_time || storeItem.date_time_check_out || storeItem.check_out_time;

  return (
    <>
    <AnimatedDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={drawerTitle}
      maxWidthClass="max-w-lg sm:max-w-xl"
    >
      {/* Distance Settings Sub-panel (White Theme) */}
      {showSettings && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 mb-2 flex items-center justify-between text-xs animate-slide-down shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-800 font-medium text-xs">
            <Sliders className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>ระยะห่างสูงสุดในการเช็คอิน (เมตร):</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={maxDistanceMeters}
              onChange={(e) => setMaxDistanceMeters(Number(e.target.value))}
              className="w-16 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-center font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500 text-xs"
              min={10}
              max={5000}
            />
            <button
              onClick={() => handleSaveDistanceSetting(maxDistanceMeters)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 rounded text-xs font-semibold"
            >
              บันทึก
            </button>
          </div>
        </div>
      )}

      {/* Location & GPS Info Bar (Ultra-Compact Height) */}
      <div className="bg-white mb-2 mt-2 flex flex-wrap items-center justify-between gap-1.5 text-xs shadow-2xs">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span className="text-slate-600 font-medium text-xs">
            ระยะห่างจากจุดส่ง:
          </span>
          {isLocating ? (
            <span className="text-emerald-600 animate-pulse font-medium text-xs">
              กำลังระบุ GPS...
            </span>
          ) : distanceMeters !== null ? (
            <span
              className={`font-mono font-bold px-2 py-0.2 rounded text-xs ${distanceMeters <= maxDistanceMeters
                ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                : "bg-rose-50 text-rose-700 border border-rose-300 animate-bounce"
                }`}
            >
              {distanceMeters} เมตร{" "}
              {distanceMeters <= maxDistanceMeters
                ? `(ปกติ ≤ ${maxDistanceMeters}ม.)`
                : `(เกิน ${maxDistanceMeters}ม.)`}
            </span>
          ) : (
            <span className="text-slate-400 text-xs">-</span>
          )}
        </div>
        <button
          onClick={requestGpsLocation}
          className="flex items-center gap-1 text-xs text-emerald-700 hover:underline font-semibold"
        >
          <RefreshCw className="w-3 h-3" />
          <span>รีเฟรช GPS</span>
        </button>
      </div>

      {/* STEP 0: DELIVERY ITEM DETAILS VIEW (คอลัมน์เดียว + ปรับความสูงแถบ/แถวให้กระชับที่สุด) */}
      {activeStep === "details" && (
        <div className="space-y-2">
          {/* MAP VIEW CARD (วางไว้ด้านบน สถานะปัจจุบัน) */}
          {(() => {
            let storeLat: number | null = null;
            let storeLng: number | null = null;
            if (storeItem?.lat && storeItem?.lng) {
              storeLat = parseFloat(storeItem.lat);
              storeLng = parseFloat(storeItem.lng);
            } else if (storeItem?.store_location) {
              const parts = String(storeItem.store_location).split(",");
              if (parts.length === 2) {
                storeLat = parseFloat(parts[0]);
                storeLng = parseFloat(parts[1]);
              }
            } else if (storeItem?.lat_long) {
              const parts = String(storeItem.lat_long).split(",");
              if (parts.length === 2) {
                storeLat = parseFloat(parts[0]);
                storeLng = parseFloat(parts[1]);
              }
            }

            if (!storeLat || !storeLng || isNaN(storeLat) || isNaN(storeLng)) return null;

            return (
              <div className="bg-white rounded-xl text-slate-800 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5 text-xs">
                    <span className="font-bold text-slate-900">แผนที่พิกัดสถานที่ส่ง (GPS)</span>
                  </span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${storeLat},${storeLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 text-xs"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>นำทาง Google Maps</span>
                  </a>
                </div>

                <div className="relative rounded-lg overflow-hidden border border-slate-200 h-44 w-full shadow-2xs bg-slate-100">
                  <iframe
                    title="Store GPS Map"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    src={`https://maps.google.com/maps?q=${storeLat},${storeLng}&z=16&output=embed`}
                    className="w-full h-full"
                  />
                </div>
              </div>
            );
          })()}

          {/* TOP ACTION CARD (ปรับขนาดกระชับ) */}
          <div className="bg-white rounded-xl text-slate-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  สถานะปัจจุบัน
                </span>
              </div>
              <span
                className={`text-xs font-extrabold px-2 py-1 rounded border ${isCompleted
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : isProblem
                    ? "bg-rose-50 text-rose-700 border-rose-300"
                    : hasCheckedIn
                      ? "bg-amber-50 text-amber-700 border-amber-300"
                      : "bg-slate-100 text-slate-700 border-slate-300"
                  }`}
              >
                {isCompleted
                  ? "เสร็จสิ้น (เช็คเอาท์แล้ว)"
                  : isProblem
                    ? "ติดปัญหา"
                    : hasCheckedIn
                      ? "รอเช็คเอาท์"
                      : "รอดำเนินการ"}
              </span>
            </div>

            {/* SLIDE-TO-CHECK-IN BUTTON AT THE TOP */}
            {!hasCheckedIn && !isCompleted && !isProblem ? (
              <div className="space-y-1.5">
                <SlideToCheckInButton
                  disabled={
                    distanceMeters !== null &&
                    maxDistanceMeters > 0 &&
                    distanceMeters > maxDistanceMeters
                  }
                  onSlideComplete={() => {
                    if (
                      distanceMeters !== null &&
                      maxDistanceMeters > 0 &&
                      distanceMeters > maxDistanceMeters
                    ) {
                      showError(
                        `ไม่สามารถเช็คอินได้: ตำแหน่งของคุณ (${distanceMeters} ม.) เกินกว่าระยะทางที่กำหนด (≤ ${maxDistanceMeters} ม.)`,
                      );
                      return;
                    }
                    setActiveStep("checkin");
                  }}
                />
                {distanceMeters !== null &&
                  maxDistanceMeters > 0 &&
                  distanceMeters > maxDistanceMeters && (
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-2 text-xs text-rose-700 flex items-center gap-1.5 font-semibold">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 animate-bounce" />
                      <span>
                        ไม่สามารถเช็คอินได้เนื่องจากระยะห่าง GPS ({distanceMeters} ม.) เกินกว่าที่กำหนด (≤ {maxDistanceMeters} ม.)
                      </span>
                    </div>
                  )}
              </div>
            ) : hasCheckedIn && !isCompleted && !isProblem ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveStep("checkout")}
                  className="py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>1. เช็คเอาท์</span>
                </button>
                <button
                  onClick={() => setActiveStep("problem")}
                  className="py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>2. ระบุ ติดปัญหา</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-slate-50 rounded-lg p-2 border border-slate-200 text-xs">
                <span className="text-slate-600 text-xs">
                  {isCompleted
                    ? "ทำรายการเช็คเอาท์ส่งของเรียบร้อยแล้ว"
                    : "ทำรายการบันทึกปัญหาเรียบร้อยแล้ว"}
                </span>
                <button
                  onClick={() => setActiveStep("checkout")}
                  className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <span>ทำรายการเพิ่มเติม</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* SINGLE COLUMN STORE DETAILS */}
          <div className="bg-white overflow-hidden">
            <div className="bg-slate-50 py-1.5 flex items-center justify-between">
              <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-emerald-600" />
                <span>ข้อมูลร้านค้า และ รายการจัดส่ง</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {/* Row 1: Store ID */}
              <div className="py-1.5 flex items-center justify-between gap-2 bg-white">
                <span className="font-semibold text-slate-500 shrink-0 w-36 text-xs">
                  รหัสร้านค้า
                </span>
                <span className="font-mono font-bold text-slate-900 text-right text-xs">
                  {storeItem.store_id || storeItem.locationNo || "-"}
                </span>
              </div>

              {/* Row 2: Store Name */}
              <div className="py-1.5  flex items-start justify-between gap-2 bg-white">
                <span className="font-semibold text-slate-500 shrink-0 w-36 text-xs">
                  ชื่อร้านค้า / จุดส่ง
                </span>
                <span className="font-bold text-slate-900 text-right text-xs">
                  {storeItem.store_name_result ||
                    storeItem.store_name ||
                    storeItem.storeName ||
                    "ไม่ระบุชื่อร้านค้า"}
                </span>
              </div>

              {/* Row 3: Order No */}
              <div className="py-1.5  flex items-center justify-between gap-2 bg-white">
                <span className="font-semibold text-slate-500 shrink-0 w-36 text-xs">
                  รหัสออเดอร์ / เลขบิล
                </span>
                <span className="font-mono font-bold text-slate-800 text-right text-xs">
                  {storeItem.data_store_no || storeItem.order_no || storeItem.orderNo || "-"}
                </span>
              </div>

              {/* Row 4: Phone */}
              <div className="py-1.5  flex items-center justify-between gap-2 bg-white">
                <span className="font-semibold text-slate-500 shrink-0 w-36 text-xs">
                  เบอร์โทรติดต่อ
                </span>
                {storeItem.telephone_number || storeItem.tel ? (
                  <a
                    href={`tel:${storeItem.telephone_number || storeItem.tel}`}
                    className="font-mono font-bold text-emerald-700 hover:underline flex items-center gap-1 text-xs"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{storeItem.telephone_number || storeItem.tel}</span>
                  </a>
                ) : (
                  <span className="text-slate-400 text-xs">-</span>
                )}
              </div>

              {/* Row 5: Address */}
              <div className="py-1.5  flex items-start justify-between gap-2 bg-white">
                <span className="font-semibold text-slate-500 shrink-0 w-36 text-xs">
                  ที่อยู่สถานที่ส่ง:
                </span>
                <span className="font-mono font-bold text-slate-800 text-right text-xs leading-tight">
                  {storeItem.store_address ||
                    storeItem.address ||
                    storeItem.location_detail ||
                    "ไม่ระบุรายละเอียดที่อยู่"}
                </span>
              </div>

              {/* Row 6: Driver / License Plate */}
              <div className="py-1.5  flex items-center justify-between gap-2 bg-white">
                <span className="font-semibold text-slate-500 shrink-0 w-36 text-xs">
                  สายรถ
                </span>
                <span className="font-mono font-bold text-slate-800 text-right text-xs leading-tight">
                  {storeItem.group_store_name || "-"}
                </span>
              </div>

              {/* Row 7: Priority */}
              <div className="py-1.5  flex items-center justify-between gap-2 bg-white">
                <span className="font-semibold text-slate-500 shrink-0 w-36 text-xs">
                  ความสำคัญ
                </span>
                <span className="font-bold text-slate-800 text-right text-xs">
                  {String(storeItem.priority || "").toLowerCase() === "high" ||
                    storeItem.priority === "สูง"
                    ? "สูง"
                    : String(storeItem.priority || "").toLowerCase() === "low" ||
                      storeItem.priority === "ต่ำ"
                      ? "ต่ำ"
                      : "กลาง"}
                </span>
              </div>

              {/* Row 8: Scheduled Time (ย้ายกำหนดเวลา ลงมา) */}
              <div className="py-1.5  flex items-center justify-between gap-2 bg-white">
                <span className="font-semibold text-slate-500 shrink-0 w-36 text-xs">
                  กำหนดเวลา
                </span>
                <span className="font-mono font-bold text-slate-900 text-right text-xs">
                  {formatTimeString(storeItem.scheduled_time || storeItem.scheduledTime)}
                </span>
              </div>

              {/* Row 9: Start Service Time (เริ่มบริการ) */}
              <div className="py-1.5  flex items-center justify-between gap-2 bg-white">
                <span className="font-semibold text-slate-500 shrink-0 w-36 text-xs">
                  เริ่มบริการ:
                </span>
                <span className="font-mono font-bold text-slate-900 text-right text-xs">
                  {formatTimeString(startTimeVal)}
                </span>
              </div>

              {/* Row 10: End Service Time (สิ้นสุดบริการ) */}
              <div className="py-1.5  flex items-center justify-between gap-2 bg-white">
                <span className="font-semibold text-slate-500 shrink-0 w-36 text-xs">
                  สิ้นสุดบริการ
                </span>
                <span className="font-mono font-bold text-slate-900 text-right text-xs">
                  {formatTimeString(endTimeVal)}
                </span>
              </div>

              {/* Row 11: Actual Duration (ระยะเวลาจริง) */}
              <div className="py-1.5  flex items-center justify-between gap-2 bg-white">
                <span className="font-semibold text-slate-500 shrink-0 w-36 text-xs">
                  ระยะเวลาจริง
                </span>
                <span className="font-mono font-bold text-emerald-700 text-right text-xs">
                  {calculateActualDuration(startTimeVal, endTimeVal)}
                </span>
              </div>

              {/* Row 12: Drop Point Position */}
              <div className="py-1.5  flex items-center justify-between gap-2 bg-white">
                <span className="font-semibold text-slate-500 shrink-0 w-36 text-xs">
                  จุดวางสินค้า
                </span>
                <span className="font-mono font-bold text-slate-900 text-right text-xs">
                  {storeItem.position_product_name ||
                    storeItem.position_product_id
                    ? `${storeItem.position_product_name || storeItem.position_product_id}/${storeItem.position_production_order || 1}`
                    : "-"}
                </span>
              </div>

              {/* Row 13: Cargo Loads Rows (รูปแบบเดียวกับข้อมูลร้านค้า) */}
              {Array.isArray(storeItem.loads) && storeItem.loads.length > 0 ? (
                storeItem.loads.map((l: any, idx: number) => {
                  const typeName =
                    l.loading_type_name ||
                    l.type_name ||
                    l.name ||
                    l.loading_name ||
                    "สินค้า";
                  const qty = l.quantity || l.qty || 0;
                  return (
                    <div
                      key={idx}
                      className="py-1.5  flex items-center justify-between gap-2 bg-white"
                    >
                      <span className="font-semibold text-slate-500 shrink-0 w-36 text-xs">
                        {typeName}:
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-right text-xs">
                        {qty}
                      </span>
                    </div>
                  );
                })
              ) : storeItem.loading_type_name ? (
                <div className="py-1.5  flex items-center justify-between gap-2 bg-white">
                  <span className="font-semibold text-slate-500 shrink-0 w-36 text-xs">
                    {storeItem.loading_type_name}:
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-right text-xs">
                    {storeItem.sum_quantity || storeItem.quantity || 1}
                  </span>
                </div>
              ) : (
                <div className="py-1.5  flex items-center justify-between gap-2 bg-white">
                  <span className="font-semibold text-slate-500 shrink-0 w-36 text-xs">
                    การโหลดสินค้า
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-right text-xs">
                    -
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* EXISTING RECORD HISTORY DETAILS (IF CHECKED IN / CHECKED OUT / PROBLEM) */}
          {(hasCheckedIn || isCompleted || isProblem) && (
            <div className="border-t border-slate-200 bg-white shadow-2xs overflow-hidden">
              <div className="bg-slate-50 py-1.5 flex items-center justify-between">
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>ประวัติบันทึกการทำรายการ</span>
                </div>
              </div>

              <div className="mt-3 space-y-3 text-xs">
                {/* Check-in History Item */}
                {hasCheckedIn && (
                  <div className="flex">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-emerald-100 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      {(isCompleted || isProblem) && <div className="w-0.5 h-full bg-slate-200 my-1"></div>}
                    </div>
                    <div className="flex-1 space-y-1.5 rounded-lg p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">1. เช็คอินเข้าจุดส่ง</span>
                        <span className="font-mono text-[11px] text-slate-500">
                          {storeItem.date_time_check_in || "-"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        {storeItem.image_check_in && (
                          <div
                            onClick={() =>
                              openLightbox([
                                {
                                  url: getImageUrl(storeItem.image_check_in),
                                  title: `รูปถ่ายเช็คอิน: ${storeItem.store_name || storeItem.store_id}`,
                                  description: `เวลาเช็คอิน: ${storeItem.date_time_check_in || "-"}`,
                                },
                              ])
                            }
                            className="shrink-0 group flex flex-col items-center gap-0.5 cursor-pointer"
                            title="คลิกเพื่อขยายรูปภาพ"
                          >
                            <img
                              src={getImageUrl(storeItem.image_check_in)}
                              alt="Check-in Photo"
                              className="w-14 h-14 object-cover rounded-lg border border-slate-200 group-hover:border-emerald-400 group-hover:scale-105 transition-all bg-white shadow-2xs"
                            />
                            <span className="text-[10px] text-slate-500 font-medium">รูปถ่ายเช็คอิน</span>
                          </div>
                        )}
                        {storeItem.signature && (
                          <div
                            onClick={() =>
                              openLightbox([
                                {
                                  url: getImageUrl(storeItem.signature),
                                  title: `ลายเซ็นผู้เช็คอิน: ${storeItem.store_name || storeItem.store_id}`,
                                  description: `เวลาเช็คอิน: ${storeItem.date_time_check_in || "-"}`,
                                },
                              ])
                            }
                            className="shrink-0 group flex flex-col items-center gap-0.5 cursor-pointer"
                            title="คลิกเพื่อขยายรูปภาพ"
                          >
                            <img
                              src={getImageUrl(storeItem.signature)}
                              alt="Check-in Signature"
                              className="w-20 h-14 object-contain rounded-lg border border-slate-200 group-hover:border-emerald-400 group-hover:scale-105 transition-all bg-white p-1 shadow-2xs"
                            />
                            <span className="text-[10px] text-slate-500 font-medium">ลายเซ็นผู้เช็คอิน</span>
                          </div>
                        )}
                      </div>

                      {storeItem.check_in_location && (
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>พิกัด: {storeItem.check_in_location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Check-out History Item */}
                {isCompleted && (
                  <div className="flex gap-2.5">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-2 border-t border-slate-200 pt-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>2. เช็คเอาท์ (ส่งสินค้าสำเร็จ)</span>
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">
                          {storeItem.date_time_check_out || "-"}
                        </span>
                      </div>

                      {/* Check-out Photos */}
                      {(storeItem.image_bill || (Array.isArray(storeItem.checkout_images) && storeItem.checkout_images.length > 0)) && (
                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          {(() => {
                            const checkoutPhotoList: LightboxImage[] = [];
                            if (storeItem.image_bill) {
                              checkoutPhotoList.push({
                                url: getImageUrl(storeItem.image_bill),
                                title: `รูปภาพเช็คเอาท์: ${storeItem.store_name || storeItem.store_id}`,
                                description: `เวลาเช็คเอาท์: ${storeItem.date_time_check_out || "-"}`,
                              });
                            }
                            if (Array.isArray(storeItem.checkout_images)) {
                              storeItem.checkout_images.forEach((imgUrl: string, idx: number) => {
                                checkoutPhotoList.push({
                                  url: getImageUrl(imgUrl),
                                  title: `รูปถ่ายเช็คเอาท์ ${idx + 1}: ${storeItem.store_name || storeItem.store_id}`,
                                  description: `เวลาเช็คเอาท์: ${storeItem.date_time_check_out || "-"}`,
                                });
                              });
                            }

                            return checkoutPhotoList.map((photo, idx) => (
                              <div
                                key={idx}
                                onClick={() => openLightbox(checkoutPhotoList, idx)}
                                className="shrink-0 group flex flex-col items-center gap-0.5 cursor-pointer"
                                title="คลิกเพื่อขยายรูปภาพ"
                              >
                                <img
                                  src={photo.url}
                                  alt={photo.title}
                                  className="w-14 h-14 object-cover rounded-lg border border-slate-200 group-hover:border-emerald-500 group-hover:scale-105 transition-all bg-white shadow-2xs"
                                />
                                <span className="text-[10px] text-slate-500 font-medium">
                                  {idx === 0 && storeItem.image_bill ? "รูปภาพเช็คเอาท์" : `รูปเช็คเอาท์ ${idx + 1}`}
                                </span>
                              </div>
                            ));
                          })()}
                        </div>
                      )}

                      {/* Payment Details Vertical Table (ตารางแนวตั้ง) */}
                      {(storeItem.cash > 0 || storeItem.transfer > 0 || storeItem.amount > 0 || storeItem.payment_name) && (
                        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                          <table className="w-full text-left text-xs divide-y divide-slate-100">
                            <tbody className="divide-y divide-slate-100 text-xs">
                              <tr>
                                <td className="py-1.5 px-3 font-semibold text-slate-500 bg-slate-50 w-28 shrink-0 text-xs">
                                  ช่องทาง:
                                </td>
                                <td className="py-1.5 px-3 font-bold text-slate-900 text-xs">
                                  {storeItem.payment_name || "ชำระแล้ว"}
                                </td>
                              </tr>
                              {storeItem.cash > 0 && (
                                <tr>
                                  <td className="py-1.5 px-3 font-semibold text-slate-500 bg-slate-50 w-28 shrink-0 text-xs">
                                    เงินสด:
                                  </td>
                                  <td className="py-1.5 px-3 font-mono font-bold text-slate-900 text-xs">
                                    {Number(storeItem.cash).toLocaleString()} ฿
                                  </td>
                                </tr>
                              )}
                              {storeItem.transfer > 0 && (
                                <tr>
                                  <td className="py-1.5 px-3 font-semibold text-slate-500 bg-slate-50 w-28 shrink-0 text-xs">
                                    เงินโอน:
                                  </td>
                                  <td className="py-1.5 px-3 font-mono font-bold text-slate-900 text-xs">
                                    {Number(storeItem.transfer).toLocaleString()} ฿
                                  </td>
                                </tr>
                              )}
                              <tr>
                                <td className="py-1.5 px-3 font-semibold text-slate-500 bg-slate-50 w-28 shrink-0 text-xs">
                                  รวม:
                                </td>
                                <td className="py-1.5 px-3 font-mono font-extrabold text-emerald-700 text-xs">
                                  {(storeItem.amount || (Number(storeItem.cash || 0) + Number(storeItem.transfer || 0))).toLocaleString()} ฿
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Problem History Item */}
                {isProblem && (
                  <div className="flex gap-2.5">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-1.5 bg-rose-50/50 border border-rose-200 rounded-lg p-2.5 text-rose-950">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-rose-950 flex items-center gap-1.5">
                          <span>ติดปัญหา: {storeItem.problem_name || "ติดปัญหาจัดส่ง"}</span>
                        </span>
                      </div>

                      {/* Problem Photos */}
                      {Array.isArray(storeItem.problem_images) && storeItem.problem_images.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          {storeItem.problem_images.map((imgUrl: string, idx: number) => (
                            <a
                              key={idx}
                              href={getImageUrl(imgUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="shrink-0 group flex flex-col items-center gap-0.5"
                            >
                              <img
                                src={getImageUrl(imgUrl)}
                                alt={`Problem Photo ${idx + 1}`}
                                className="w-14 h-14 object-cover rounded-lg border border-rose-200 group-hover:border-rose-500 group-hover:scale-105 transition-all bg-white shadow-2xs"
                              />
                              <span className="text-[10px] text-rose-600 font-medium">รูปปัญหา {idx + 1}</span>
                            </a>
                          ))}
                        </div>
                      )}

                      {storeItem.normal_bill_note && (
                        <div className="text-xs text-rose-900 bg-white rounded p-2 border border-rose-100">
                          หมายเหตุ: {storeItem.normal_bill_note}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 1: CHECK IN FORM (มีถ่ายรูป + วาดลายเซ็น) */}
      {activeStep === "checkin" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>ขั้นตอนที่ 1: เช็คอินเข้าจุดจัดส่ง</span>
            </div>
            <button
              onClick={() => setActiveStep("details")}
              className="text-xs text-slate-500 hover:text-slate-800 underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ย้อนกลับไปหน้ารายละเอียด</span>
            </button>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-900 space-y-1">
            <p className="text-xs text-emerald-800">
              โปรดถ่ายรูปสถานที่ส่งของ เซ็นลายเซ็น และตรวจสอบพิกัด GPS
              ให้ห่างจากจุดส่งไม่เกิน {maxDistanceMeters} เมตร
            </p>
          </div>

          {locationError && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{locationError}</span>
            </div>
          )}

          {/* Photo Capture Check-in */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>
                ถ่ายรูปเช็คอิน <span className="text-rose-500">*</span>
              </span>
              {checkInImg && (
                <span className="text-xs text-emerald-600 font-semibold">
                  แนบรูปแล้ว
                </span>
              )}
            </label>

            {checkInImg ? (
              <div className="relative rounded-xl border border-slate-200 overflow-hidden group max-h-52 bg-slate-100 flex justify-center">
                <img
                  src={checkInImg}
                  alt="Check-in Preview"
                  className="max-h-52 object-contain"
                />
                <button
                  type="button"
                  onClick={() => setCheckInImg("")}
                  className="absolute top-2 right-2 bg-slate-900/80 hover:bg-rose-600 text-white p-1.5 rounded-full transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all">
                <Camera className="w-6 h-6 text-emerald-600 mb-1 animate-pulse" />
                <span className="text-xs font-bold text-slate-700">
                  ถ่ายรูป / อัปโหลดรูปเช็คอิน
                </span>
                <span className="text-xs text-slate-400 mt-0.5">
                  คลิกเพื่อถ่ายภาพจากกล้องหรือเลือกไฟล์รูป
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handleSingleImageUpload(e, setCheckInImg)}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Signature Canvas Pad */}
          <SignaturePad
            onChange={(b64) => setSignatureImg(b64)}
            onClear={() => setSignatureImg("")}
          />

          {/* Save Check-in Button */}
          <button
            onClick={handleSubmitCheckIn}
            disabled={
              isSubmittingCheckIn ||
              !checkInImg ||
              !signatureImg ||
              (distanceMeters !== null &&
                distanceMeters > maxDistanceMeters &&
                distanceMeters > 0)
            }
            className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${isSubmittingCheckIn ||
              !checkInImg ||
              !signatureImg ||
              (distanceMeters !== null &&
                distanceMeters > maxDistanceMeters &&
                distanceMeters > 0)
              ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              : "bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-lg"
              }`}
          >
            {isSubmittingCheckIn ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>กำลังบันทึกเช็คอิน...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>ยืนยันบันทึกเช็คอิน</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* STEP 3A: CHECK OUT FORM */}
      {activeStep === "checkout" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>บันทึกการเช็คเอาท์ (ส่งสินค้าเรียบร้อย)</span>
            </h4>
            <button
              onClick={() => setActiveStep("details")}
              className="text-xs text-slate-500 hover:text-slate-800 underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ย้อนกลับ</span>
            </button>
          </div>

          {/* Photos (Multiple Photos) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>
                รูปภาพเช็คเอาท์ / หลักฐานการส่ง{" "}
                <span className="text-rose-500">*</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">
                แนบแล้ว {checkOutImgs.length} รูป (สามารถแนบได้หลายรูป)
              </span>
            </label>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {checkOutImgs.map((img, idx) => (
                <div
                  key={idx}
                  className="relative rounded-lg overflow-hidden border border-slate-200 aspect-square group bg-slate-100"
                >
                  <img
                    src={img}
                    alt={`Checkout ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setCheckOutImgs((prev) =>
                        prev.filter((_, i) => i !== idx),
                      )
                    }
                    className="absolute top-1 right-1 bg-slate-900/80 text-white p-1 rounded-full hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer transition-colors p-2 text-center">
                <Upload className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="text-xs font-bold text-slate-700 leading-tight">
                  + เพิ่มรูป
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    handleMultipleImagesUpload(e, setCheckOutImgs)
                  }
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Payment Method Selector (SearchableSelect) */}
          <div>
            <SearchableSelect
              label="วิธีการชำระเงิน"
              options={paymentSelectOptions}
              value={selectedPaymentId}
              onChange={(val) => {
                const id = String(val);
                setSelectedPaymentId(id);
                const matched = paymentMethods.find(
                  (p) => String(p.payment_id) === String(id),
                );
                if (matched) setSelectedPaymentName(matched.payment_name);
                else setSelectedPaymentName("");
              }}
              placeholder="-- เลือกประเภทการชำระเงิน --"
              searchPlaceholder="พิมพ์ค้นหาประเภทการชำระเงิน..."
              required
            />
          </div>

          {/* Payment Amounts */}
          {isSplitPayment ? (
            <div className="border border-slate-200 rounded-xl p-2.5 space-y-2">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>ระบุรายละเอียดการแบ่งจ่าย</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    เงินสด (บาท) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    เงินโอน / QR (บาท) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-xs">
                <span className="font-bold text-slate-700">
                  จำนวนเงินรวมทั้งหมด:
                </span>
                <span className="font-mono font-extrabold text-emerald-700 text-xs">
                  {computedTotalAmount.toLocaleString()} บาท
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                จำนวนเงินชำระ (บาท) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={singleAmount}
                onChange={(e) => setSingleAmount(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 transition-colors"
              />
            </div>
          )}

          {/* Checkout Note */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              หมายเหตุเพิ่มเติม (ถ้ามี)
            </label>
            <textarea
              rows={2}
              value={checkoutNote}
              onChange={(e) => setCheckoutNote(e.target.value)}
              placeholder="ระบุรายละเอียดหรือข้อสังเกตเพิ่มเติมในการส่งของ..."
              className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 transition-colors"
            />
          </div>

          {/* Submit Check-out Button */}
          <button
            onClick={handleSubmitCheckOut}
            disabled={isSubmittingCheckout || checkOutImgs.length === 0}
            className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all ${isSubmittingCheckout || checkOutImgs.length === 0
                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
          >
            {isSubmittingCheckout ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>กำลังบันทึกเช็คเอาท์...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>ยืนยันบันทึกเช็คเอาท์ (เสร็จสิ้น)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* STEP 3B: PROBLEM FORM */}
      {activeStep === "problem" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>บันทึกการแจ้งปัญหาจัดส่ง</span>
            </h4>
            <button
              onClick={() => setActiveStep("details")}
              className="text-xs text-slate-500 hover:text-slate-800 underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ย้อนกลับ</span>
            </button>
          </div>

          {/* Problem Type Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              ประเภทปัญหา <span className="text-rose-500">*</span>
            </label>
            <SearchableSelect
              options={problemOptions}
              value={selectedProblem}
              onChange={(val) => setSelectedProblem(String(val))}
              placeholder="-- เลือกประเภทปัญหา --"
              searchPlaceholder="ค้นหาประเภทปัญหา..."
              required
            />
          </div>

          {/* Custom Problem Input */}
          {selectedProblem === "+ ระบุปัญหาอื่นๆ (พิมพ์เอง)" && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                ระบุชื่อปัญหาเพิ่มเติม <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="พิมพ์ชื่อปัญหา..."
                value={customProblemText}
                onChange={(e) => setCustomProblemText(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 transition-colors"
              />
            </div>
          )}

          {/* Mandatory Note */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center justify-between">
              <span>
                ระบุรายละเอียดหมายเหตุ <span className="text-rose-500">* (บังคับ)</span>
              </span>
            </label>
            <textarea
              rows={3}
              value={problemNote}
              onChange={(e) => setProblemNote(e.target.value)}
              placeholder="อธิบายเหตุผลและรายละเอียดปัญหาอย่างชัดเจน..."
              className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 transition-colors"
            />
          </div>

          {/* Problem Photos (Multiple Photos) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>รูปภาพประกอบปัญหา (ถ่ายได้หลายรูป)</span>
              <span className="text-xs text-slate-500 font-medium">
                แนบแล้ว {problemImgs.length} รูป
              </span>
            </label>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {problemImgs.map((img, idx) => (
                <div
                  key={idx}
                  className="relative rounded-lg overflow-hidden border border-slate-200 aspect-square group bg-slate-100"
                >
                  <img
                    src={img}
                    alt={`Problem ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setProblemImgs((prev) =>
                        prev.filter((_, i) => i !== idx),
                      )
                    }
                    className="absolute top-1 right-1 bg-slate-900/80 text-white p-1 rounded-full hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              <label className="border-2 border-dashed border-slate-300 hover:border-rose-500 bg-slate-50 hover:bg-rose-50/30 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer transition-colors p-2 text-center">
                <Upload className="w-5 h-5 text-rose-600 mb-1" />
                <span className="text-xs font-bold text-slate-700 leading-tight">
                  + เพิ่มรูป
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    handleMultipleImagesUpload(e, setProblemImgs)
                  }
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Submit Problem Button */}
          <button
            onClick={handleSubmitProblem}
            disabled={
              isSubmittingProblem ||
              !problemNote.trim() ||
              (selectedProblem === "+ ระบุปัญหาอื่นๆ (พิมพ์เอง)" &&
                !customProblemText.trim())
            }
            className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${isSubmittingProblem ||
              !problemNote.trim() ||
              (selectedProblem === "+ ระบุปัญหาอื่นๆ (พิมพ์เอง)" &&
                !customProblemText.trim())
              ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              : "bg-rose-600 hover:bg-rose-700 text-white hover:shadow-lg"
              }`}
          >
            {isSubmittingProblem ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>กำลังบันทึกปัญหา...</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>บันทึกแจ้งปัญหา</span>
              </>
            )}
          </button>
        </div>
      )}
    </AnimatedDrawer>

    {/* Interactive Expandable Image Lightbox Modal */}
    <ImageLightboxModal
      isOpen={isLightboxOpen}
      onClose={() => setIsLightboxOpen(false)}
      images={lightboxImages}
      currentIndex={lightboxIndex}
      onIndexChange={(idx) => setLightboxIndex(idx)}
    />
    </>
  );
};

export const DeliveryCheckInOutModal = DeliveryCheckInOutDrawer;
