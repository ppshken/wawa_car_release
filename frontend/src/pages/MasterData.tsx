import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { ConfirmModal } from "../components/ConfirmModal";
import { PaginationControl } from "../components/PaginationControl";
import {
  Store as StoreIcon,
  Key,
  Smartphone,
  CreditCard,
  Truck,
  MapPin,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  Upload,
  Phone,
  Building,
  X,
  FileSpreadsheet,
  ShieldCheck,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// ──────────── INTERFACES ────────────

interface AccountingStatusData {
  status_id: number;
  status_code: string;
  status_name: string;
  description?: string;
  status?: string;
}

interface StoreData {
  store_id: string;
  store_no?: string;
  store_name: string;
  store_address?: string;
  telephone_number?: string;
  fax_number?: string;
  email?: string;
  url?: string;
  customer_delivery_time?: string;
  store_location?: string;
}

interface KeyHolderData {
  key_holder_id: number;
  key_holder_name: string;
}

interface PdaDeviceData {
  pda_id: number;
  device_code: string;
  device_name: string;
  serial_number?: string;
  assigned_user?: string;
  status?: string;
}

interface PaymentData {
  payment_id: number;
  payment_name: string;
}

interface CarData {
  car_id: number;
  license_plate: string;
  brand?: string;
  model?: string;
  sub_model?: string;
  year?: number;
}

interface ParkingData {
  parking_id: number;
  parking_name: string;
}

interface UserSimple {
  user_id: number;
  name: string;
  username: string;
}


// ──────────── ANIMATED DRAWER COMPONENT ────────────

const AnimatedDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  formId: string;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  isDirty?: boolean;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, formId, onSubmit, submitLabel, isDirty = false, children }) => {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setClosing(false);
      setShowDiscardConfirm(false);
    } else if (visible) {
      setClosing(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setClosing(false);
        setShowDiscardConfirm(false);
      }, 230);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleRequestClose = () => {
    if (closing) return;
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardConfirm(false);
    onClose();
  };

  if (!visible) return null;

  return createPortal(
    <>
      <div
        className={`fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[99999] flex justify-end overflow-hidden ${
          closing ? "animate-backdrop-out" : "animate-backdrop-in"
        }`}
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)",
        }}
      >
        <div
          className={`w-full max-w-md sm:max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 ${
            closing ? "animate-drawer-out" : "animate-drawer-in"
          }`}
        >
          {/* Header */}
          <div className="p-3.5 px-4 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleRequestClose}
                className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="ปิด"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-bold text-slate-900 text-sm tracking-tight">{title}</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRequestClose}
                className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                form={formId}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-1.5 rounded-lg text-xs transition-colors shadow-2xs"
              >
                {submitLabel}
              </button>
            </div>
          </div>
          {/* Form Content */}
          <form
            id={formId}
            onSubmit={onSubmit}
            className="flex-1 overflow-y-auto p-5 space-y-4 text-xs custom-scrollbar"
          >
            <div className="space-y-3">{children}</div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal when discarding unsaved changes */}
      <ConfirmModal
        isOpen={showDiscardConfirm}
        title="มีข้อมูลที่ยังไม่ได้บันทึก"
        message="คุณมีข้อมูลที่กรอกค้างไว้ในฟอร์ม ต้องการปิดฟอร์มโดยละทิ้งข้อมูลนี้หรือไม่?"
        confirmText="ละทิ้งข้อมูลและปิด"
        cancelText="กรอกข้อมูลต่อ"
        onConfirm={handleConfirmDiscard}
        onCancel={() => setShowDiscardConfirm(false)}
      />
    </>,
    document.body
  );
};


// ──────────── MAIN MASTER DATA PAGE ────────────

export const MasterData: React.FC = () => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const activeTab = (tab || "stores") as "stores" | "keys" | "pda" | "payments" | "vehicles" | "parking" | "accounting-status";

  // Data States
  const [stores, setStores] = useState<StoreData[]>([]);
  const [storesTotal, setStoresTotal] = useState<number>(0);
  const [keys, setKeys] = useState<KeyHolderData[]>([]);
  const [pdas, setPdas] = useState<PdaDeviceData[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [vehicles, setVehicles] = useState<CarData[]>([]);
  const [parking, setParking] = useState<ParkingData[]>([]);
  const [accStatuses, setAccStatuses] = useState<AccountingStatusData[]>([]);
  const [usersList, setUsersList] = useState<UserSimple[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Common Search & Pagination
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Reset pagination on search or tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab]);

  // ──── Drawer & Modal States ────

  // 1. Stores Drawer
  const [isStoreDrawerOpen, setIsStoreDrawerOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreData | null>(null);
  const [formStoreNo, setFormStoreNo] = useState("");
  const [formStoreName, setFormStoreName] = useState("");
  const [formStoreAddress, setFormStoreAddress] = useState("");
  const [formStorePhone, setFormStorePhone] = useState("");
  const [formFaxNumber, setFormFaxNumber] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formStoreLocation, setFormStoreLocation] = useState("");
  const [storeToDelete, setStoreToDelete] = useState<StoreData | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // 2. Key Holder Drawer
  const [isKeyDrawerOpen, setIsKeyDrawerOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<KeyHolderData | null>(null);
  const [formKeyHolderName, setFormKeyHolderName] = useState("");
  const [keyToDelete, setKeyToDelete] = useState<KeyHolderData | null>(null);

  // 3. PDA Drawer
  const [isPdaDrawerOpen, setIsPdaDrawerOpen] = useState(false);
  const [editingPda, setEditingPda] = useState<PdaDeviceData | null>(null);
  const [formPdaCode, setFormPdaCode] = useState("");
  const [formPdaName, setFormPdaName] = useState("");
  const [formPdaSerial, setFormPdaSerial] = useState("");
  const [formPdaUser, setFormPdaUser] = useState("");
  const [pdaToDelete, setPdaToDelete] = useState<PdaDeviceData | null>(null);

  // 4. Payment Drawer
  const [isPaymentDrawerOpen, setIsPaymentDrawerOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentData | null>(null);
  const [formPaymentName, setFormPaymentName] = useState("");
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentData | null>(null);

  // 5. Vehicle / Car Drawer
  const [isVehicleDrawerOpen, setIsVehicleDrawerOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<CarData | null>(null);
  const [formLicensePlate, setFormLicensePlate] = useState("");
  const [formBrand, setFormBrand] = useState("");
  const [formModel, setFormModel] = useState("");
  const [formSubModel, setFormSubModel] = useState("");
  const [formYear, setFormYear] = useState<number>(new Date().getFullYear());
  const [vehicleToDelete, setVehicleToDelete] = useState<CarData | null>(null);

  // 6. Parking Space Drawer
  const [isParkingDrawerOpen, setIsParkingDrawerOpen] = useState(false);
  const [editingParking, setEditingParking] = useState<ParkingData | null>(null);
  const [formParkingName, setFormParkingName] = useState("");
  const [parkingToDelete, setParkingToDelete] = useState<ParkingData | null>(null);

  // 7. Accounting Status Drawer
  const [isAccStatusDrawerOpen, setIsAccStatusDrawerOpen] = useState(false);
  const [editingAccStatus, setEditingAccStatus] = useState<AccountingStatusData | null>(null);
  const [formAccStatusCode, setFormAccStatusCode] = useState("");
  const [formAccStatusName, setFormAccStatusName] = useState("");
  const [formAccStatusDesc, setFormAccStatusDesc] = useState("");
  const [accStatusToDelete, setAccStatusToDelete] = useState<AccountingStatusData | null>(null);

  // ──── Dirty Checks ────
  const isStoreDirty = useMemo(() => {
    if (!editingStore) return !!(formStoreNo || formStoreName || formStoreAddress || formStorePhone || formFaxNumber || formEmail || formUrl || formStoreLocation);
    return (
      formStoreNo !== (editingStore.store_no || "") ||
      formStoreName !== editingStore.store_name ||
      formStoreAddress !== (editingStore.store_address || "") ||
      formStorePhone !== (editingStore.telephone_number || "") ||
      formFaxNumber !== (editingStore.fax_number || "") ||
      formEmail !== (editingStore.email || "") ||
      formUrl !== (editingStore.url || "") ||
      formStoreLocation !== (editingStore.store_location || "")
    );
  }, [editingStore, formStoreNo, formStoreName, formStoreAddress, formStorePhone, formFaxNumber, formEmail, formUrl, formStoreLocation]);

  const isKeyDirty = useMemo(() => {
    if (!editingKey) return !!formKeyHolderName;
    return formKeyHolderName !== editingKey.key_holder_name;
  }, [editingKey, formKeyHolderName]);

  const isPdaDirty = useMemo(() => {
    if (!editingPda) return !!(formPdaCode || formPdaName || formPdaSerial || formPdaUser);
    return (
      formPdaCode !== editingPda.device_code ||
      formPdaName !== editingPda.device_name ||
      formPdaSerial !== (editingPda.serial_number || "") ||
      formPdaUser !== (editingPda.assigned_user || "")
    );
  }, [editingPda, formPdaCode, formPdaName, formPdaSerial, formPdaUser]);

  const isPaymentDirty = useMemo(() => {
    if (!editingPayment) return !!formPaymentName;
    return formPaymentName !== editingPayment.payment_name;
  }, [editingPayment, formPaymentName]);

  const isVehicleDirty = useMemo(() => {
    if (!editingVehicle) return !!(formLicensePlate || formBrand || formModel);
    return (
      formLicensePlate !== editingVehicle.license_plate ||
      formBrand !== (editingVehicle.brand || "") ||
      formModel !== (editingVehicle.model || "") ||
      formSubModel !== (editingVehicle.sub_model || "")
    );
  }, [editingVehicle, formLicensePlate, formBrand, formModel, formSubModel]);

  const isParkingDirty = useMemo(() => {
    if (!editingParking) return !!formParkingName;
    return formParkingName !== editingParking.parking_name;
  }, [editingParking, formParkingName]);

  const isAccStatusDirty = useMemo(() => {
    if (!editingAccStatus) return !!(formAccStatusCode || formAccStatusName || formAccStatusDesc);
    return (
      formAccStatusCode !== editingAccStatus.status_code ||
      formAccStatusName !== editingAccStatus.status_name ||
      formAccStatusDesc !== (editingAccStatus.description || "")
    );
  }, [editingAccStatus, formAccStatusCode, formAccStatusName, formAccStatusDesc]);


  // ──────────── DATA FETCHING ────────────

  const fetchStores = useCallback(async () => {
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
    } catch (err) { console.error("Error fetching stores:", err); }
  }, [currentPage, itemsPerPage, search]);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await api.get("/master/keys");
      if (res.data.success) setKeys(res.data.keys || []);
    } catch (err) { console.error("Error fetching keys:", err); }
  }, []);

  const fetchPdas = useCallback(async () => {
    try {
      const res = await api.get("/master/pda");
      if (res.data.success) setPdas(res.data.pdas || []);
    } catch (err) { console.error("Error fetching pdas:", err); }
  }, []);

  const fetchPayments = useCallback(async () => {
    try {
      const res = await api.get("/master/payments");
      if (res.data.success) setPayments(res.data.payments || []);
    } catch (err) { console.error("Error fetching payments:", err); }
  }, []);

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await api.get("/master/vehicles");
      if (res.data.success) setVehicles(res.data.vehicles || []);
    } catch (err) { console.error("Error fetching vehicles:", err); }
  }, []);

  const fetchParking = useCallback(async () => {
    try {
      const res = await api.get("/master/parking");
      if (res.data.success) setParking(res.data.parking || []);
    } catch (err) { console.error("Error fetching parking:", err); }
  }, []);

  const fetchAccStatuses = useCallback(async () => {
    try {
      const res = await api.get("/master/accounting-status");
      if (res.data.success) setAccStatuses(res.data.statuses || res.data.accounting_statuses || []);
    } catch (err) { console.error("Error fetching accounting statuses:", err); }
  }, []);

  const fetchUsersList = useCallback(async () => {
    try {
      const res = await api.get("/users");
      if (res.data.success) setUsersList(res.data.users || []);
    } catch (err) { console.error("Error fetching users list:", err); }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchStores(), fetchKeys(), fetchPdas(), fetchPayments(), fetchVehicles(), fetchParking(), fetchAccStatuses(), fetchUsersList()]);
    setLoading(false);
  }, [fetchStores, fetchKeys, fetchPdas, fetchPayments, fetchVehicles, fetchParking, fetchAccStatuses, fetchUsersList]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);


  // ──── Filtered & Paginated Selectors ────

  // 1. Stores (Server-side paginated)
  const filteredStores = stores;
  const paginatedStores = stores;

  // 2. Keys
  const filteredKeys = useMemo(() => {
    const s = search.toLowerCase();
    return keys.filter((k) => k.key_holder_name.toLowerCase().includes(s));
  }, [keys, search]);

  const paginatedKeys = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredKeys.slice(start, start + itemsPerPage);
  }, [filteredKeys, currentPage, itemsPerPage]);

  // 3. PDA
  const filteredPdas = useMemo(() => {
    const s = search.toLowerCase();
    return pdas.filter(
      (p) =>
        p.device_name.toLowerCase().includes(s) ||
        p.device_code.toLowerCase().includes(s) ||
        (p.assigned_user || "").toLowerCase().includes(s)
    );
  }, [pdas, search]);

  const paginatedPdas = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPdas.slice(start, start + itemsPerPage);
  }, [filteredPdas, currentPage, itemsPerPage]);

  // 4. Payments
  const filteredPayments = useMemo(() => {
    const s = search.toLowerCase();
    return payments.filter((pm) => pm.payment_name.toLowerCase().includes(s));
  }, [payments, search]);

  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  }, [filteredPayments, currentPage, itemsPerPage]);

  // 5. Vehicles
  const filteredVehicles = useMemo(() => {
    const s = search.toLowerCase();
    return vehicles.filter(
      (v) =>
        v.license_plate.toLowerCase().includes(s) ||
        (v.brand || "").toLowerCase().includes(s) ||
        (v.model || "").toLowerCase().includes(s)
    );
  }, [vehicles, search]);

  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(start, start + itemsPerPage);
  }, [filteredVehicles, currentPage, itemsPerPage]);

  // 6. Parking
  const filteredParking = useMemo(() => {
    const s = search.toLowerCase();
    return parking.filter((pk) => pk.parking_name.toLowerCase().includes(s));
  }, [parking, search]);

  const paginatedParking = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredParking.slice(start, start + itemsPerPage);
  }, [filteredParking, currentPage, itemsPerPage]);

  // 7. Accounting Statuses
  const filteredAccStatuses = useMemo(() => {
    const s = search.toLowerCase();
    return accStatuses.filter(
      (acc) =>
        acc.status_name.toLowerCase().includes(s) ||
        acc.status_code.toLowerCase().includes(s)
    );
  }, [accStatuses, search]);

  const paginatedAccStatuses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAccStatuses.slice(start, start + itemsPerPage);
  }, [filteredAccStatuses, currentPage, itemsPerPage]);


  // ──────────── TAB NAVIGATION ────────────

  const tabs = [
    { key: "stores", label: "ร้านค้า", icon: StoreIcon },
    { key: "keys", label: "ที่ฝากกุญแจ", icon: Key },
    { key: "pda", label: "เครื่อง PDA", icon: Smartphone },
    { key: "payments", label: "การชำระเงิน", icon: CreditCard },
    { key: "vehicles", label: "รถ", icon: Truck },
    { key: "parking", label: "ที่จอด", icon: MapPin },
    { key: "accounting-status", label: "สถานะทางบัญชี", icon: ShieldCheck },
  ];

  const handleTabChange = (tKey: string) => {
    navigate(`/master/${tKey}`);
  };


  // ──────────── STORES HANDLERS ────────────

  const handleOpenAddStore = () => {
    setEditingStore(null);
    setFormStoreNo("");
    setFormStoreName("");
    setFormStoreAddress("");
    setFormStorePhone("");
    setFormFaxNumber("");
    setFormEmail("");
    setFormUrl("");
    setFormStoreLocation("");
    setIsStoreDrawerOpen(true);
  };

  const handleOpenEditStore = (store: StoreData) => {
    setEditingStore(store);
    setFormStoreNo(store.store_id || "");
    setFormStoreName(store.store_name);
    setFormStoreAddress(store.store_address || "");
    setFormStorePhone(store.telephone_number || "");
    setFormFaxNumber(store.fax_number || "");
    setFormEmail(store.email || "");
    setFormUrl(store.url || "");
    setFormStoreLocation(store.store_location || "");
    setIsStoreDrawerOpen(true);
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStoreName) return showError("กรุณากรอกชื่อร้านค้า");
    try {
      if (editingStore) {
        await api.put(`/master/stores/${editingStore.store_id}`, {
          store_no: formStoreNo,
          store_name: formStoreName,
          store_address: formStoreAddress,
          telephone_number: formStorePhone,
          fax_number: formFaxNumber,
          email: formEmail,
          url: formUrl,
          store_location: formStoreLocation,
        });
        showSuccess("อัปเดตข้อมูลร้านค้าสำเร็จ!");
      } else {
        await api.post("/master/stores", {
          store_no: formStoreNo,
          store_name: formStoreName,
          store_address: formStoreAddress,
          telephone_number: formStorePhone,
          fax_number: formFaxNumber,
          email: formEmail,
          url: formUrl,
          store_location: formStoreLocation,
        });
        showSuccess("สร้างร้านค้าใหม่สำเร็จ!");
      }
      setIsStoreDrawerOpen(false);
      fetchStores();
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกร้านค้า");
    }
  };

  const handleDeleteStore = async () => {
    if (!storeToDelete) return;
    try {
      await api.delete(`/master/stores/${storeToDelete.store_id}`);
      showSuccess(`ลบร้านค้า "${storeToDelete.store_name}" เรียบร้อย`);
      fetchStores();
    } catch (err: any) {
      showError(err?.response?.data?.message || "ไม่สามารถลบร้านค้าได้");
    } finally {
      setStoreToDelete(null);
    }
  };

  const handleImportExcel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return showError("กรุณาเลือกไฟล์ Excel หรือ CSV ก่อนอัปโหลด");
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", importFile);
      const res = await api.post("/stores/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploading(false);
      if (res.data.success) {
        showSuccess(res.data.message || "นำเข้าข้อมูลร้านค้าสำเร็จ!");
        setImportFile(null);
        fetchStores();
      }
    } catch (err: any) {
      setUploading(false);
      showError(err?.response?.data?.message || "นำเข้าไฟล์ล้มเหลว");
    }
  };


  // ──────────── KEY HOLDER HANDLERS ────────────

  const handleOpenAddKey = () => {
    setEditingKey(null);
    setFormKeyHolderName("");
    setIsKeyDrawerOpen(true);
  };

  const handleOpenEditKey = (k: KeyHolderData) => {
    setEditingKey(k);
    setFormKeyHolderName(k.key_holder_name);
    setIsKeyDrawerOpen(true);
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKeyHolderName) return showError("กรุณากรอกชื่อจุด/ผู้รับฝากกุญแจ");
    try {
      if (editingKey) {
        await api.put(`/master/keys/${editingKey.key_holder_id}`, {
          key_holder_name: formKeyHolderName,
        });
        showSuccess("อัปเดตจุดฝากกุญแจสำเร็จ!");
      } else {
        await api.post("/master/keys", {
          key_holder_name: formKeyHolderName,
        });
        showSuccess("สร้างจุดฝากกุญแจใหม่สำเร็จ!");
      }
      setIsKeyDrawerOpen(false);
      fetchKeys();
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกจุดฝากกุญแจ");
    }
  };

  const handleDeleteKey = async () => {
    if (!keyToDelete) return;
    try {
      await api.delete(`/master/keys/${keyToDelete.key_holder_id}`);
      showSuccess(`ลบจุดฝากกุญแจ "${keyToDelete.key_holder_name}" เรียบร้อย`);
      fetchKeys();
    } catch (err: any) {
      showError(err?.response?.data?.message || "ไม่สามารถลบจุดฝากกุญแจได้");
    } finally {
      setKeyToDelete(null);
    }
  };


  // ──────────── PDA DEVICE HANDLERS ────────────

  const handleOpenAddPda = () => {
    setEditingPda(null);
    setFormPdaCode(`PDA-${Date.now().toString().slice(-3)}`);
    setFormPdaName("");
    setFormPdaSerial("");
    setFormPdaUser("");
    setIsPdaDrawerOpen(true);
  };

  const handleOpenEditPda = (p: PdaDeviceData) => {
    setEditingPda(p);
    setFormPdaCode(p.device_code);
    setFormPdaName(p.device_name);
    setFormPdaSerial(p.serial_number || "");
    setFormPdaUser(p.assigned_user || "");
    setIsPdaDrawerOpen(true);
  };

  const handleSavePda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPdaName) return showError("กรุณากรอกชื่อเครื่อง PDA");
    try {
      if (editingPda) {
        await api.put(`/master/pda/${editingPda.pda_id}`, {
          device_code: formPdaCode,
          device_name: formPdaName,
          serial_number: formPdaSerial,
          assigned_user: formPdaUser,
        });
        showSuccess("อัปเดตเครื่อง PDA สำเร็จ!");
      } else {
        await api.post("/master/pda", {
          device_code: formPdaCode,
          device_name: formPdaName,
          serial_number: formPdaSerial,
          assigned_user: formPdaUser,
        });
        showSuccess("สร้างเครื่อง PDA ใหม่สำเร็จ!");
      }
      setIsPdaDrawerOpen(false);
      fetchPdas();
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกเครื่อง PDA");
    }
  };

  const handleDeletePda = async () => {
    if (!pdaToDelete) return;
    try {
      await api.delete(`/master/pda/${pdaToDelete.pda_id}`);
      showSuccess(`ลบเครื่อง PDA "${pdaToDelete.device_name}" เรียบร้อย`);
      fetchPdas();
    } catch (err: any) {
      showError(err?.response?.data?.message || "ไม่สามารถลบเครื่อง PDA ได้");
    } finally {
      setPdaToDelete(null);
    }
  };


  // ──────────── PAYMENT METHOD HANDLERS ────────────

  const handleOpenAddPayment = () => {
    setEditingPayment(null);
    setFormPaymentName("");
    setIsPaymentDrawerOpen(true);
  };

  const handleOpenEditPayment = (pm: PaymentData) => {
    setEditingPayment(pm);
    setFormPaymentName(pm.payment_name);
    setIsPaymentDrawerOpen(true);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPaymentName) return showError("กรุณากรอกชื่อประเภทการชำระเงิน");
    try {
      if (editingPayment) {
        await api.put(`/master/payments/${editingPayment.payment_id}`, {
          payment_name: formPaymentName,
        });
        showSuccess("อัปเดตประเภทการชำระเงินสำเร็จ!");
      } else {
        await api.post("/master/payments", {
          payment_name: formPaymentName,
        });
        showSuccess("สร้างประเภทการชำระเงินใหม่สำเร็จ!");
      }
      setIsPaymentDrawerOpen(false);
      fetchPayments();
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกประเภทการชำระเงิน");
    }
  };

  const handleDeletePayment = async () => {
    if (!paymentToDelete) return;
    try {
      await api.delete(`/master/payments/${paymentToDelete.payment_id}`);
      showSuccess(`ลบประเภทการชำระเงิน "${paymentToDelete.payment_name}" เรียบร้อย`);
      fetchPayments();
    } catch (err: any) {
      showError(err?.response?.data?.message || "ไม่สามารถลบประเภทการชำระเงินได้");
    } finally {
      setPaymentToDelete(null);
    }
  };


  // ──────────── VEHICLE / CAR HANDLERS ────────────

  const handleOpenAddVehicle = () => {
    setEditingVehicle(null);
    setFormLicensePlate("");
    setFormBrand("Toyota");
    setFormModel("Hilux Revo");
    setFormSubModel("Smart Cab 2.4");
    setFormYear(new Date().getFullYear());
    setIsVehicleDrawerOpen(true);
  };

  const handleOpenEditVehicle = (v: CarData) => {
    setEditingVehicle(v);
    setFormLicensePlate(v.license_plate);
    setFormBrand(v.brand || "");
    setFormModel(v.model || "");
    setFormSubModel(v.sub_model || "");
    setFormYear(v.year || new Date().getFullYear());
    setIsVehicleDrawerOpen(true);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLicensePlate) return showError("กรุณากรอกทะเบียนรถ");
    try {
      if (editingVehicle) {
        await api.put(`/master/vehicles/${editingVehicle.car_id}`, {
          license_plate: formLicensePlate,
          brand: formBrand,
          model: formModel,
          sub_model: formSubModel,
          year: formYear,
        });
        showSuccess("อัปเดตข้อมูลรถสำเร็จ!");
      } else {
        await api.post("/master/vehicles", {
          license_plate: formLicensePlate,
          brand: formBrand,
          model: formModel,
          sub_model: formSubModel,
          year: formYear,
        });
        showSuccess("สร้างข้อมูลรถใหม่สำเร็จ!");
      }
      setIsVehicleDrawerOpen(false);
      fetchVehicles();
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลรถ");
    }
  };

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    try {
      await api.delete(`/master/vehicles/${vehicleToDelete.car_id}`);
      showSuccess(`ลบข้อมูลรถทะเบียน "${vehicleToDelete.license_plate}" เรียบร้อย`);
      fetchVehicles();
    } catch (err: any) {
      showError(err?.response?.data?.message || "ไม่สามารถลบข้อมูลรถได้");
    } finally {
      setVehicleToDelete(null);
    }
  };


  // ──────────── PARKING HANDLERS ────────────

  const handleOpenAddParking = () => {
    setEditingParking(null);
    setFormParkingName("");
    setIsParkingDrawerOpen(true);
  };

  const handleOpenEditParking = (pk: ParkingData) => {
    setEditingParking(pk);
    setFormParkingName(pk.parking_name);
    setIsParkingDrawerOpen(true);
  };

  const handleSaveParking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formParkingName) return showError("กรุณากรอกชื่อลาน/จุดจอดรถ");
    try {
      if (editingParking) {
        await api.put(`/master/parking/${editingParking.parking_id}`, {
          parking_name: formParkingName,
        });
        showSuccess("อัปเดตข้อมูลลานจอดสำเร็จ!");
      } else {
        await api.post("/master/parking", {
          parking_name: formParkingName,
        });
        showSuccess("สร้างข้อมูลลานจอดใหม่สำเร็จ!");
      }
      setIsParkingDrawerOpen(false);
      fetchParking();
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลลานจอด");
    }
  };

  const handleDeleteParking = async () => {
    if (!parkingToDelete) return;
    try {
      await api.delete(`/master/parking/${parkingToDelete.parking_id}`);
      showSuccess(`ลบข้อมูลลานจอด "${parkingToDelete.parking_name}" เรียบร้อย`);
      fetchParking();
    } catch (err: any) {
      showError(err?.response?.data?.message || "ไม่สามารถลบข้อมูลลานจอดได้");
    } finally {
      setParkingToDelete(null);
    }
  };


  // ──────────── ACCOUNTING STATUS HANDLERS ────────────

  const handleOpenAddAccStatus = () => {
    setEditingAccStatus(null);
    setFormAccStatusCode(`ACC-${Date.now().toString().slice(-4)}`);
    setFormAccStatusName("");
    setFormAccStatusDesc("");
    setIsAccStatusDrawerOpen(true);
  };

  const handleOpenEditAccStatus = (acc: AccountingStatusData) => {
    setEditingAccStatus(acc);
    setFormAccStatusCode(acc.status_code);
    setFormAccStatusName(acc.status_name);
    setFormAccStatusDesc(acc.description || "");
    setIsAccStatusDrawerOpen(true);
  };

  const handleSaveAccStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAccStatusName) return showError("กรุณากรอกชื่อสถานะทางบัญชี");
    try {
      if (editingAccStatus) {
        await api.put(`/master/accounting-status/${editingAccStatus.status_id}`, {
          status_code: formAccStatusCode,
          status_name: formAccStatusName,
          description: formAccStatusDesc,
        });
        showSuccess("อัปเดตสถานะทางบัญชีสำเร็จ!");
      } else {
        await api.post("/master/accounting-status", {
          status_code: formAccStatusCode,
          status_name: formAccStatusName,
          description: formAccStatusDesc,
        });
        showSuccess("สร้างสถานะทางบัญชีใหม่สำเร็จ!");
      }
      setIsAccStatusDrawerOpen(false);
      fetchAccStatuses();
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกสถานะทางบัญชี");
    }
  };

  const handleDeleteAccStatus = async () => {
    if (!accStatusToDelete) return;
    try {
      await api.delete(`/master/accounting-status/${accStatusToDelete.status_id}`);
      showSuccess(`ลบสถานะทางบัญชี "${accStatusToDelete.status_name}" เรียบร้อย`);
      fetchAccStatuses();
    } catch (err: any) {
      showError(err?.response?.data?.message || "ไม่สามารถลบสถานะทางบัญชีได้");
    } finally {
      setAccStatusToDelete(null);
    }
  };


  // ──── Helper Field Render ────
  const renderField = (label: string, required: boolean, children: React.ReactNode) => (
    <div>
      <label className="text-slate-700 font-semibold block mb-1">
        {label}
        {required && " *"}
      </label>
      {children}
    </div>
  );

  const inputCls =
    "w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400";


  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════

  return (
    <div className="w-full space-y-4 font-sans text-xs pb-12">

      {/* ─── Header Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building className="w-5 h-5 text-slate-800" />
            จัดการข้อมูลมาสเตอร์ (Master Data Management)
          </h1>
          <p className="text-[11px] text-slate-500">
            บริหารจัดการข้อมูลพื้นฐานของระบบทั้ง 7 หมวดหมู่ (ร้านค้า, ที่ฝากกุญแจ, PDA, ชำระเงิน, รถ, ที่จอด, สถานะทางบัญชี)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-1.5 rounded-lg font-medium flex items-center gap-1 shadow-2xs"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 text-slate-700 ${loading ? "animate-spin" : ""}`} />
          </button>
          {activeTab === "stores" && (
            <button onClick={handleOpenAddStore} className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0">
              <Plus className="w-3.5 h-3.5" /> <span>เพิ่มร้านค้าใหม่</span>
            </button>
          )}
          {activeTab === "keys" && (
            <button onClick={handleOpenAddKey} className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0">
              <Plus className="w-3.5 h-3.5" /> <span>เพิ่มจุดฝากกุญแจ</span>
            </button>
          )}
          {activeTab === "pda" && (
            <button onClick={handleOpenAddPda} className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0">
              <Plus className="w-3.5 h-3.5" /> <span>เพิ่มเครื่อง PDA</span>
            </button>
          )}
          {activeTab === "payments" && (
            <button onClick={handleOpenAddPayment} className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0">
              <Plus className="w-3.5 h-3.5" /> <span>เพิ่มประเภทชำระเงิน</span>
            </button>
          )}
          {activeTab === "vehicles" && (
            <button onClick={handleOpenAddVehicle} className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0">
              <Plus className="w-3.5 h-3.5" /> <span>เพิ่มข้อมูลรถ</span>
            </button>
          )}
          {activeTab === "parking" && (
            <button onClick={handleOpenAddParking} className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0">
              <Plus className="w-3.5 h-3.5" /> <span>เพิ่มช่องจอดรถ</span>
            </button>
          )}
          {activeTab === "accounting-status" && (
            <button onClick={handleOpenAddAccStatus} className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0">
              <Plus className="w-3.5 h-3.5" /> <span>เพิ่มสถานะทางบัญชี</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Nav Tabs ─── */}
      <div className="flex border-b border-slate-200 bg-slate-100/70 p-1 rounded-lg gap-1 overflow-x-auto custom-scrollbar">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              className={`px-3.5 py-1.5 rounded-md font-semibold transition-all flex items-center gap-2 text-xs shrink-0 ${
                isActive ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="tms-card p-3 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาข้อมูล..."
            className="w-full bg-slate-50 border border-slate-200/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
          />
        </div>
      </div>


      {/* ══════════ TAB 1: STORES (ร้านค้า) ══════════ */}
      {activeTab === "stores" && (
        <div key="tab-stores" className="space-y-4 animate-tab-in">
          {/* Excel Import Box */}
          <div className="tms-card p-4 space-y-2">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              นำเข้าข้อมูลร้านค้าผ่านไฟล์ Excel / CSV
            </h3>
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

          <div className="tms-card overflow-hidden w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                    <th className="py-2.5 px-4 text-center w-10">ID</th>
                    <th className="py-2.5 px-4">ชื่อร้านค้า</th>
                    <th className="py-2.5 px-4">ที่อยู่ร้านค้า</th>
                    <th className="py-2.5 px-4">เบอร์โทรศัพท์ / แฟกซ์</th>
                    <th className="py-2.5 px-4">อีเมล / เว็บไซต์</th>
                    <th className="py-2.5 px-4">พิกัด GPS</th>
                    <th className="py-2.5 px-4 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
                  {paginatedStores.map((s) => (
                    <tr key={s.store_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 text-center text-slate-400 font-medium">{s.store_id}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{s.store_name}</td>
                      <td className="py-2.5 px-4 text-slate-600 max-w-[200px] truncate">{s.store_address || "-"}</td>
                      <td className="py-2.5 px-4 text-slate-600">
                        <div>{s.telephone_number || "-"}</div>
                        {s.fax_number && <div className="text-[10px] text-slate-400">Fax: {s.fax_number}</div>}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        <div>{s.email || "-"}</div>
                        {s.url ? (
                          <a
                            href={s.url.startsWith("http") ? s.url : `https://${s.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 hover:underline max-w-[150px] truncate group font-medium"
                            title={`เปิดเว็บไซต์: ${s.url}`}
                          >
                            <ExternalLink className="w-3 h-3 shrink-0 text-blue-500 group-hover:text-blue-700" />
                            <span className="truncate">{s.url}</span>
                          </a>
                        ) : null}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
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
                      <td className="py-2.5 px-4 text-right space-x-1">
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
        </div>
      )}


      {/* ══════════ TAB 2: KEY HOLDERS (ที่ฝากกุญแจ) ══════════ */}
      {activeTab === "keys" && (
        <div key="tab-keys" className="space-y-4 animate-tab-in">
          <div className="tms-card overflow-hidden w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                    <th className="py-2.5 px-4 text-center w-16">ID</th>
                    <th className="py-2.5 px-4">ชื่อจุด / ผู้รับฝากกุญแจ</th>
                    <th className="py-2.5 px-4 text-center">สถานะ</th>
                    <th className="py-2.5 px-4 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
                  {paginatedKeys.map((k) => (
                    <tr key={k.key_holder_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 text-center text-slate-400 font-mono font-bold">{k.key_holder_id}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{k.key_holder_name}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> ใช้งานอยู่
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right space-x-1">
                        <button onClick={() => handleOpenEditKey(k)} className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100" title="แก้ไข">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setKeyToDelete(k)} className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50" title="ลบ">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredKeys.length === 0 && (
                    <tr><td colSpan={4} className="py-8 text-center text-slate-400">ยังไม่มีข้อมูลจุดฝากกุญแจ</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <PaginationControl
              currentPage={currentPage}
              totalItems={filteredKeys.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        </div>
      )}


      {/* ══════════ TAB 3: PDA DEVICES (เครื่อง PDA) ══════════ */}
      {activeTab === "pda" && (
        <div key="tab-pda" className="space-y-4 animate-tab-in">
          <div className="tms-card overflow-hidden w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                    <th className="py-2.5 px-4 text-center w-10">#</th>
                    <th className="py-2.5 px-4">รหัสเครื่อง PDA</th>
                    <th className="py-2.5 px-4">ชื่ออุปกรณ์</th>
                    <th className="py-2.5 px-4">Serial Number</th>
                    <th className="py-2.5 px-4">ผู้ดูแล</th>
                    <th className="py-2.5 px-4 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
                  {paginatedPdas.map((p, idx) => (
                    <tr key={p.pda_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 text-center text-slate-400 font-medium">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td className="py-2.5 px-4">
                        <code className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono font-bold">{p.device_code}</code>
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{p.device_name}</td>
                      <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px]">{p.serial_number || "-"}</td>
                      <td className="py-2.5 px-4 text-slate-700 font-medium">{p.assigned_user || "ยังไม่ระบุผู้ดูแล"}</td>
                      <td className="py-2.5 px-4 text-right space-x-1">
                        <button onClick={() => handleOpenEditPda(p)} className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100" title="แก้ไข">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setPdaToDelete(p)} className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50" title="ลบ">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredPdas.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-slate-400">ยังไม่มีข้อมูลเครื่อง PDA</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <PaginationControl
              currentPage={currentPage}
              totalItems={filteredPdas.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        </div>
      )}


      {/* ══════════ TAB 4: PAYMENTS (การชำระเงิน) ══════════ */}
      {activeTab === "payments" && (
        <div key="tab-payments" className="space-y-4 animate-tab-in">
          <div className="tms-card overflow-hidden w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                    <th className="py-2.5 px-4 text-center w-16">ID</th>
                    <th className="py-2.5 px-4">ชื่อประเภทการชำระเงิน</th>
                    <th className="py-2.5 px-4 text-center">สถานะ</th>
                    <th className="py-2.5 px-4 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
                  {paginatedPayments.map((pm) => (
                    <tr key={pm.payment_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 text-center text-slate-400 font-mono font-bold">{pm.payment_id}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{pm.payment_name}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> ใช้งานอยู่
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right space-x-1">
                        <button onClick={() => handleOpenEditPayment(pm)} className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100" title="แก้ไข">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setPaymentToDelete(pm)} className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50" title="ลบ">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredPayments.length === 0 && (
                    <tr><td colSpan={4} className="py-8 text-center text-slate-400">ยังไม่มีข้อมูลประเภทการชำระเงิน</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <PaginationControl
              currentPage={currentPage}
              totalItems={filteredPayments.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        </div>
      )}


      {/* ══════════ TAB 5: VEHICLES / CARS (รถ) ══════════ */}
      {activeTab === "vehicles" && (
        <div key="tab-vehicles" className="space-y-4 animate-tab-in">
          <div className="tms-card overflow-hidden w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                    <th className="py-2.5 px-4 text-center w-16">ID</th>
                    <th className="py-2.5 px-4">ทะเบียนรถ</th>
                    <th className="py-2.5 px-4">ยี่ห้อ (Brand)</th>
                    <th className="py-2.5 px-4">รุ่น (Model)</th>
                    <th className="py-2.5 px-4">รุ่นย่อย / ปี</th>
                    <th className="py-2.5 px-4 text-center">สถานะ</th>
                    <th className="py-2.5 px-4 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
                  {paginatedVehicles.map((v) => (
                    <tr key={v.car_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 text-center text-slate-400 font-mono font-bold">{v.car_id}</td>
                      <td className="py-2.5 px-4">
                        <span className="font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">{v.license_plate}</span>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{v.brand || "-"}</td>
                      <td className="py-2.5 px-4 text-slate-600">{v.model || "-"}</td>
                      <td className="py-2.5 px-4 text-slate-600">{v.sub_model ? `${v.sub_model} ${v.year ? `(${v.year})` : ""}` : (v.year || "-")}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> พร้อมใช้งาน
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right space-x-1">
                        <button onClick={() => handleOpenEditVehicle(v)} className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100" title="แก้ไข">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setVehicleToDelete(v)} className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50" title="ลบ">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredVehicles.length === 0 && (
                    <tr><td colSpan={7} className="py-8 text-center text-slate-400">ยังไม่มีข้อมูลรถ</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <PaginationControl
              currentPage={currentPage}
              totalItems={filteredVehicles.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        </div>
      )}


      {/* ══════════ TAB 6: PARKING (ที่จอด) ══════════ */}
      {activeTab === "parking" && (
        <div key="tab-parking" className="space-y-4 animate-tab-in">
          <div className="tms-card overflow-hidden w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                    <th className="py-2.5 px-4 text-center w-16">ID</th>
                    <th className="py-2.5 px-4">ชื่อลาน / จุดจอดรถ</th>
                    <th className="py-2.5 px-4 text-center">สถานะ</th>
                    <th className="py-2.5 px-4 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
                  {paginatedParking.map((pk) => (
                    <tr key={pk.parking_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 text-center text-slate-400 font-mono font-bold">{pk.parking_id}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{pk.parking_name}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> ใช้งานอยู่
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right space-x-1">
                        <button onClick={() => handleOpenEditParking(pk)} className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100" title="แก้ไข">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setParkingToDelete(pk)} className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50" title="ลบ">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredParking.length === 0 && (
                    <tr><td colSpan={4} className="py-8 text-center text-slate-400">ยังไม่มีข้อมูลจุดจอดรถ</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <PaginationControl
              currentPage={currentPage}
              totalItems={filteredParking.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        </div>
      )}

      {/* ══════════ TAB 7: ACCOUNTING STATUS (สถานะทางบัญชี) ══════════ */}
      {activeTab === "accounting-status" && (
        <div key="tab-acc-status" className="space-y-4 animate-tab-in">
          <div className="tms-card overflow-hidden w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                    <th className="py-2.5 px-4 text-center w-16">ID</th>
                    <th className="py-2.5 px-4">รหัสสถานะ</th>
                    <th className="py-2.5 px-4">ชื่อสถานะทางบัญชี</th>
                    <th className="py-2.5 px-4">คำอธิบาย</th>
                    <th className="py-2.5 px-4 text-center">สถานะ</th>
                    <th className="py-2.5 px-4 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
                  {paginatedAccStatuses.map((acc) => (
                    <tr key={acc.status_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 text-center text-slate-400 font-mono font-bold">{acc.status_id}</td>
                      <td className="py-2.5 px-4">
                        <code className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono font-bold">{acc.status_code}</code>
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{acc.status_name}</td>
                      <td className="py-2.5 px-4 text-slate-600 max-w-[280px] truncate">{acc.description || "-"}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> ใช้งานอยู่
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right space-x-1">
                        <button onClick={() => handleOpenEditAccStatus(acc)} className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100" title="แก้ไข">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setAccStatusToDelete(acc)} className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50" title="ลบ">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredAccStatuses.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-slate-400">ยังไม่มีข้อมูลสถานะทางบัญชี</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <PaginationControl
              currentPage={currentPage}
              totalItems={filteredAccStatuses.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        </div>
      )}


      {/* ══════════ DRAWERS ══════════ */}

      {/* 1. Store Drawer */}
      <AnimatedDrawer
        isOpen={isStoreDrawerOpen}
        onClose={() => setIsStoreDrawerOpen(false)}
        title={editingStore ? "แก้ไขข้อมูลร้านค้า" : "เพิ่มร้านค้าใหม่"}
        formId="store-form"
        onSubmit={handleSaveStore}
        submitLabel={editingStore ? "บันทึกการแก้ไข" : "บันทึกสร้างร้านค้า"}
        isDirty={isStoreDirty}
      >
        {renderField("รหัสร้านค้า (Store No.)", false,
          <input type="text" value={formStoreNo} onChange={(e) => setFormStoreNo(e.target.value)} placeholder="เช่น ST-001" className={`${inputCls} font-mono`} />
        )}
        {renderField("ชื่อร้านค้า", true,
          <input type="text" value={formStoreName} onChange={(e) => setFormStoreName(e.target.value)} placeholder="เช่น ร้านวาวาการค้า สาขา 1" className={inputCls} required />
        )}
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

      {/* 2. Key Holder Drawer */}
      <AnimatedDrawer
        isOpen={isKeyDrawerOpen}
        onClose={() => setIsKeyDrawerOpen(false)}
        title={editingKey ? "แก้ไขจุดฝากกุญแจ" : "เพิ่มจุดฝากกุญแจใหม่"}
        formId="key-form"
        onSubmit={handleSaveKey}
        submitLabel={editingKey ? "บันทึกการแก้ไข" : "บันทึกสร้างจุดฝาก"}
        isDirty={isKeyDirty}
      >
        {renderField("ชื่อจุด / ผู้รับฝากกุญแจ *", true,
          <input type="text" value={formKeyHolderName} onChange={(e) => setFormKeyHolderName(e.target.value)} placeholder="เช่น ตู้ฝากกุญแจ A1 (ป้อมรปภ. ประตู 1)" className={inputCls} required />
        )}
      </AnimatedDrawer>

      {/* 3. PDA Drawer */}
      <AnimatedDrawer
        isOpen={isPdaDrawerOpen}
        onClose={() => setIsPdaDrawerOpen(false)}
        title={editingPda ? "แก้ไขเครื่อง PDA" : "เพิ่มเครื่อง PDA ใหม่"}
        formId="pda-form"
        onSubmit={handleSavePda}
        submitLabel={editingPda ? "บันทึกการแก้ไข" : "บันทึกสร้างเครื่อง PDA"}
        isDirty={isPdaDirty}
      >
        {renderField("รหัสเครื่อง PDA *", true,
          <input type="text" value={formPdaCode} onChange={(e) => setFormPdaCode(e.target.value)} placeholder="เช่น PDA-001" className={`${inputCls} font-mono`} required />
        )}
        {renderField("ชื่ออุปกรณ์ *", true,
          <input type="text" value={formPdaName} onChange={(e) => setFormPdaName(e.target.value)} placeholder="เช่น Zebra TC26 #01" className={inputCls} required />
        )}
        {renderField("Serial Number", false,
          <input type="text" value={formPdaSerial} onChange={(e) => setFormPdaSerial(e.target.value)} placeholder="เช่น SN-ZB2026001" className={`${inputCls} font-mono`} />
        )}
        {renderField("ผู้ดูแลเครื่อง PDA", false,
          <select
            value={formPdaUser}
            onChange={(e) => setFormPdaUser(e.target.value)}
            className={inputCls}
          >
            <option value="">-- ยังไม่ระบุผู้ดูแล --</option>
            {usersList.map((u) => (
              <option key={u.user_id} value={u.name}>
                {u.name} ({u.username})
              </option>
            ))}
          </select>
        )}
      </AnimatedDrawer>

      {/* 4. Payment Drawer */}
      <AnimatedDrawer
        isOpen={isPaymentDrawerOpen}
        onClose={() => setIsPaymentDrawerOpen(false)}
        title={editingPayment ? "แก้ไขประเภทการชำระเงิน" : "เพิ่มประเภทการชำระเงินใหม่"}
        formId="payment-form"
        onSubmit={handleSavePayment}
        submitLabel={editingPayment ? "บันทึกการแก้ไข" : "บันทึกสร้างประเภทชำระเงิน"}
        isDirty={isPaymentDirty}
      >
        {renderField("ชื่อประเภทการชำระเงิน *", true,
          <input type="text" value={formPaymentName} onChange={(e) => setFormPaymentName(e.target.value)} placeholder="เช่น เงินสด, โอนเงิน, เครดิต 30 วัน" className={inputCls} required />
        )}
      </AnimatedDrawer>

      {/* 5. Vehicle / Car Drawer */}
      <AnimatedDrawer
        isOpen={isVehicleDrawerOpen}
        onClose={() => setIsVehicleDrawerOpen(false)}
        title={editingVehicle ? "แก้ไขข้อมูลรถ" : "เพิ่มข้อมูลรถใหม่"}
        formId="vehicle-form"
        onSubmit={handleSaveVehicle}
        submitLabel={editingVehicle ? "บันทึกการแก้ไข" : "บันทึกสร้างข้อมูลรถ"}
        isDirty={isVehicleDirty}
      >
        {renderField("ทะเบียนรถ *", true,
          <input type="text" value={formLicensePlate} onChange={(e) => setFormLicensePlate(e.target.value)} placeholder="เช่น ผก-1234 กทม" className={`${inputCls} font-bold`} required />
        )}
        {renderField("ยี่ห้อ (Brand)", false,
          <input type="text" value={formBrand} onChange={(e) => setFormBrand(e.target.value)} placeholder="เช่น Toyota, Isuzu" className={inputCls} />
        )}
        {renderField("รุ่น (Model)", false,
          <input type="text" value={formModel} onChange={(e) => setFormModel(e.target.value)} placeholder="เช่น Hilux Revo, D-Max" className={inputCls} />
        )}
        {renderField("รุ่นย่อย (Sub Model)", false,
          <input type="text" value={formSubModel} onChange={(e) => setFormSubModel(e.target.value)} placeholder="เช่น Smart Cab 2.4" className={inputCls} />
        )}
        {renderField("ปี (Year)", false,
          <input type="number" value={formYear} onChange={(e) => setFormYear(Number(e.target.value))} placeholder="เช่น 2023" className={inputCls} />
        )}
      </AnimatedDrawer>

      {/* 6. Parking Drawer */}
      <AnimatedDrawer
        isOpen={isParkingDrawerOpen}
        onClose={() => setIsParkingDrawerOpen(false)}
        title={editingParking ? "แก้ไขข้อมูลจุดจอดรถ" : "เพิ่มจุดจอดรถใหม่"}
        formId="parking-form"
        onSubmit={handleSaveParking}
        submitLabel={editingParking ? "บันทึกการแก้ไข" : "บันทึกสร้างจุดจอด"}
        isDirty={isParkingDirty}
      >
        {renderField("ชื่อลาน / จุดจอดรถ *", true,
          <input type="text" value={formParkingName} onChange={(e) => setFormParkingName(e.target.value)} placeholder="เช่น ลานจอดรถ A (ฝั่งคลังสินค้า 1)" className={inputCls} required />
        )}
      </AnimatedDrawer>

      {/* 7. Accounting Status Drawer */}
      <AnimatedDrawer
        isOpen={isAccStatusDrawerOpen}
        onClose={() => setIsAccStatusDrawerOpen(false)}
        title={editingAccStatus ? "แก้ไขสถานะทางบัญชี" : "เพิ่มสถานะทางบัญชีใหม่"}
        formId="acc-status-form"
        onSubmit={handleSaveAccStatus}
        submitLabel={editingAccStatus ? "บันทึกการแก้ไข" : "บันทึกสร้างสถานะ"}
        isDirty={isAccStatusDirty}
      >
        {renderField("รหัสสถานะ (Status Code) *", true,
          <input type="text" value={formAccStatusCode} onChange={(e) => setFormAccStatusCode(e.target.value)} placeholder="เช่น ACC-001" className={`${inputCls} font-mono`} required />
        )}
        {renderField("ชื่อสถานะทางบัญชี *", true,
          <input type="text" value={formAccStatusName} onChange={(e) => setFormAccStatusName(e.target.value)} placeholder="เช่น รออนุมัติจ่ายเงิน" className={inputCls} required />
        )}
        {renderField("คำอธิบาย", false,
          <textarea value={formAccStatusDesc} onChange={(e) => setFormAccStatusDesc(e.target.value)} placeholder="รายละเอียดของสถานะ..." rows={3} className={`${inputCls} resize-none`} />
        )}
      </AnimatedDrawer>


      {/* ══════════ CONFIRM MODALS ══════════ */}

      <ConfirmModal
        isOpen={!!storeToDelete}
        title="ยืนยันการลบร้านค้า"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบร้านค้า "${storeToDelete?.store_name}"?`}
        confirmText="ยืนยันลบร้านค้า"
        onConfirm={handleDeleteStore}
        onCancel={() => setStoreToDelete(null)}
      />

      <ConfirmModal
        isOpen={!!keyToDelete}
        title="ยืนยันการลบจุดฝากกุญแจ"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบจุดฝากกุญแจ "${keyToDelete?.key_holder_name}"?`}
        confirmText="ยืนยันลบจุดฝากกุญแจ"
        onConfirm={handleDeleteKey}
        onCancel={() => setKeyToDelete(null)}
      />

      <ConfirmModal
        isOpen={!!pdaToDelete}
        title="ยืนยันการลบเครื่อง PDA"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบเครื่อง PDA "${pdaToDelete?.device_name}" (${pdaToDelete?.device_code})?`}
        confirmText="ยืนยันลบเครื่อง PDA"
        onConfirm={handleDeletePda}
        onCancel={() => setPdaToDelete(null)}
      />

      <ConfirmModal
        isOpen={!!paymentToDelete}
        title="ยืนยันการลบประเภทการชำระเงิน"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบประเภทการชำระเงิน "${paymentToDelete?.payment_name}"?`}
        confirmText="ยืนยันลบประเภทชำระเงิน"
        onConfirm={handleDeletePayment}
        onCancel={() => setPaymentToDelete(null)}
      />

      <ConfirmModal
        isOpen={!!vehicleToDelete}
        title="ยืนยันการลบข้อมูลรถ"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลรถทะเบียน "${vehicleToDelete?.license_plate}"?`}
        confirmText="ยืนยันลบข้อมูลรถ"
        onConfirm={handleDeleteVehicle}
        onCancel={() => setVehicleToDelete(null)}
      />

      <ConfirmModal
        isOpen={!!parkingToDelete}
        title="ยืนยันการลบจุดจอดรถ"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบจุดจอดรถ "${parkingToDelete?.parking_name}"?`}
        confirmText="ยืนยันลบจุดจอดรถ"
        onConfirm={handleDeleteParking}
        onCancel={() => setParkingToDelete(null)}
      />

      <ConfirmModal
        isOpen={!!accStatusToDelete}
        title="ยืนยันการลบสถานะทางบัญชี"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบสถานะทางบัญชี "${accStatusToDelete?.status_name}" (${accStatusToDelete?.status_code})?`}
        confirmText="ยืนยันลบสถานะทางบัญชี"
        onConfirm={handleDeleteAccStatus}
        onCancel={() => setAccStatusToDelete(null)}
      />

    </div>
  );
};

export default MasterData;
