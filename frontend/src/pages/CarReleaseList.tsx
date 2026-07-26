import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import api, { getImageUrl } from "../services/api";
import { useToast } from "../context/ToastContext";
import { QuickActionModal } from "../components/QuickActionModal";
import { ConfirmModal } from "../components/ConfirmModal";
import { PaginationControl } from "../components/PaginationControl";
import { AnimatedDrawer } from "../components/AnimatedDrawer";
import { SearchableSelect } from "../components/SearchableSelect";
import {
  Plus,
  Filter,
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
  Truck,
  Search,
  Eye,
  ChevronRight,
  RefreshCw,
  Box,
  Calendar,
  User,
  CheckSquare,
  Users,
  Check,
} from "lucide-react";

export const CarReleaseList: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [releases, setReleases] = useState<any[]>([]);
  const [selectedRelease, setSelectedRelease] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState<string>("");
  const [modalAction, setModalAction] = useState<string | null>(null);

  // Date Filter & Pagination State
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Delete Modal
  const [releaseToDelete, setReleaseToDelete] = useState<any | null>(null);

  // Database Master Options
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [groupStores, setGroupStores] = useState<any[]>([]);
  const [pdaDevices, setPdaDevices] = useState<any[]>([]);
  const [accountingStatuses, setAccountingStatuses] = useState<any[]>([]);

  // Group Delivery List Preview State
  const [groupStoresPreview, setGroupStoresPreview] = useState<any[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);

  // Form State
  const [formCarId, setFormCarId] = useState<string | number>("");
  const [formUserId, setFormUserId] = useState<string | number>("");
  const [formGroupStoreId, setFormGroupStoreId] = useState<string | number>("");
  const [formReleaseTypeId, setFormReleaseTypeId] = useState<string | number>("1");
  const [formPlateText, setFormPlateText] = useState<string>("");
  const [formCarBrandModel, setFormCarBrandModel] = useState<string>("");
  const [formDriverName, setFormDriverName] = useState<string>("");
  const [formFollowers, setFormFollowers] = useState<string[]>([]);
  const [followerSearch, setFollowerSearch] = useState<string>("");
  const [formMileage, setFormMileage] = useState<number>(0);
  const [formAllowance, setFormAllowance] = useState<string>("");
  const [formPda, setFormPda] = useState<string>("");
  const [formAccountingStatus, setFormAccountingStatus] = useState<string | number>("");
  const [formControlledType, setFormControlledType] = useState<string>("กระบะ");
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
    setter: (val: string) => void
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
    setFormGroupStoreId(gid);
    const group = groupStores.find((g) => String(g.group_store_id) === String(gid));
    if (group && group.car_id) {
      const matchedVeh = vehicles.find((v) => String(v.car_id) === String(group.car_id));
      if (matchedVeh) {
        setFormCarId(matchedVeh.car_id);
        setFormPlateText(matchedVeh.license_plate);
        setFormCarBrandModel(`${matchedVeh.brand || ""} ${matchedVeh.model || ""}`.trim());
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
          if (res.data.success && Array.isArray(res.data.items || res.data.stores)) {
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
      const [vRes, uRes, gRes, pRes, aRes] = await Promise.allSettled([
        api.get("/master/vehicles"),
        api.get("/users"),
        api.get("/master/group-stores"),
        api.get("/master/pda"),
        api.get("/master/accounting-status"),
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
          aRes.value.data.statuses || aRes.value.data.accounting_statuses
        );
      }
    } catch (err) {
      console.error("Fetch master options error:", err);
    }
  }, []);

  // Option lists for SearchableSelect
  const groupOptions = useMemo(() => {
    const toLocalDateStr = (d: any) => {
      if (!d) return "";
      const dateObj = new Date(d);
      if (isNaN(dateObj.getTime())) return String(d).slice(0, 10);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const todayStr = toLocalDateStr(new Date());
    const targetDate = selectedDate || todayStr;

    // Get group_store_ids already used in car releases
    const usedGroupIds = new Set(
      releases
        .filter((r) => !editingId || String(r.car_release_id) !== String(editingId))
        .map((r) => String(r.group_store_id))
        .filter(Boolean)
    );

    // 1. Filter groupStores matching today / selected date if date is specified
    let dateMatchedGroups = groupStores.filter((g) => {
      if (!g.date && !g.group_date) return true;
      const gDate = toLocalDateStr(g.date || g.group_date);
      return gDate === targetDate;
    });

    // Fallback: If no groups match targetDate strictly, show all groupStores
    if (dateMatchedGroups.length === 0) {
      dateMatchedGroups = groupStores;
    }

    // 2. Filter out groups that have ALREADY been selected/released
    const availableGroups = dateMatchedGroups.filter((g) => {
      if (formGroupStoreId && String(g.group_store_id) === String(formGroupStoreId)) {
        return true;
      }
      return !usedGroupIds.has(String(g.group_store_id));
    });

    const finalGroups = availableGroups.length > 0 ? availableGroups : dateMatchedGroups;

    return finalGroups.map((g) => {
      const veh = vehicles.find((v) => String(v.car_id) === String(g.car_id));
      const plate = veh ? veh.license_plate : g.license_plate || "";
      const isReleased = g.status === 1 || g.status === true || !!g.is_released || usedGroupIds.has(String(g.group_store_id));
      return {
        value: g.group_store_id,
        label: g.group_store_name,
        subLabel: plate,
      };
    });
  }, [groupStores, vehicles, releases, selectedDate, formGroupStoreId, editingId]);

  const selectedGroupObj = useMemo(() => {
    if (!formGroupStoreId) return null;
    return groupStores.find((g) => String(g.group_store_id) === String(formGroupStoreId)) || null;
  }, [groupStores, formGroupStoreId]);

  const driverOptions = useMemo(() => {
    return drivers.map((d) => ({
      value: d.user_id,
      label: d.name,
    }));
  }, [drivers]);

  const releaseTypeOptions = useMemo(
    () => [
      { value: "1", label: "ปล่อยรถปกติ (ประจำวัน)", badge: "ปกติ" },
      { value: "2", label: "ปล่อยรถพิเศษ (งานด่วน)", badge: "พิเศษ" },
      { value: "3", label: "รับ-ส่งสินค้า / ตะเวนรับ", badge: "รับ-ส่ง" },
    ],
    [],
  );

  const pdaOptions = useMemo(() => {
    return pdaDevices.map((p) => ({
      value: p.device_name || p.device_code,
      label: p.device_name || p.device_code,
      subLabel: p.serial_number ? `SN: ${p.serial_number}` : undefined,
    }));
  }, [pdaDevices]);

  const accountingOptions = useMemo(() => {
    return accountingStatuses.map((acc) => ({
      value: acc.status_id,
      label: acc.status_name,
    }));
  }, [accountingStatuses]);

  const fetchReleases = useCallback(async () => {
    try {
      const res = await api.get("/car-release", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: search,
          date: selectedDate,
        },
      });
      if (res.data.success && Array.isArray(res.data.releases)) {
        const formatted = res.data.releases.map((r: any) => ({
          car_release_id: r.car_release_id,
          car_release_no: r.car_release_no,
          car_id: r.car_id,
          user_id: r.user_id,
          group_store_id: r.group_store_id,
          group_store_name: r.group_store_name || "-",
          car_release_type_id: r.car_release_type_id || 1,
          car_img:
            r.car_image || r.car_img || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=100&q=80",
          license_plate: r.license_plate || "-",
          brand_model: `${r.brand || ""} ${r.model || ""}`.trim() || "-",
          is_returned: !!r.is_returned,
          completedStores: r.completed_stores || 0,
          totalStores: r.total_stores || 0,
          allowance: r.allowance || "-",
          allowance_paid: r.allowance_paid || "-",
          accounting_status: r.accounting_status_name || r.accounting_status || "-",
          accounting_status_id: r.accounting_status_id || r.accounting_status,
          mileage: r.mileage || 0,
          driver_avatar:
            r.user_image || r.driver_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
          driver_name: r.driver_name || "ไม่ระบุ",
          driver_phone: r.driver_phone || "-",
          follower_name: r.follower_name || "-",
          followers: r.followers || [],
          controlled_type: "กระบะ",
          cart_count: 0,
          pallet_count: 0,
          dateGroup: new Date(r.created_at || Date.now()).toLocaleDateString("th-TH"),
          dateCount: 5,
          issuer: "ระบบ",
          pda_device: r.pda_device || "-",
          description: r.description || "",
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
        setTotalItems(res.data.total ?? res.data.pagination?.total ?? formatted.length);
      }
    } catch (err) {
      console.error("Fetch car release error:", err);
    }
  }, [currentPage, itemsPerPage, search, selectedDate]);

  useEffect(() => {
    fetchReleases();
    fetchMasterData();
  }, [fetchReleases, fetchMasterData]);

  const handleOpenAdd = () => {
    setEditingId(null);
    const firstOpt = groupOptions[0];
    const initialGid = firstOpt ? String(firstOpt.value) : "";
    setFormGroupStoreId(initialGid);
    setFormUserId(drivers[0]?.user_id || "");
    setFormReleaseTypeId("1");
    setFormDriverName(drivers[0]?.name || "");
    setFormFollowers([]);
    setFollowerSearch("");
    setFormMileage(0);
    setFormAllowance("");
    setFormPda(pdaDevices[0]?.device_name || pdaDevices[0]?.device_code || "");
    setFormAccountingStatus(accountingStatuses[0]?.status_id || "");
    setFormControlledType("กระบะ");
    setFormDescription("");

    // Auto-select car from group
    if (initialGid) {
      handleGroupChange(initialGid);
    } else if (vehicles.length > 0) {
      setFormCarId(vehicles[0].car_id);
      setFormPlateText(vehicles[0].license_plate);
      setFormCarBrandModel(`${vehicles[0].brand || ""} ${vehicles[0].model || ""}`.trim());
    }

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
    setFormReleaseTypeId(rel.car_release_type_id || "1");
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
    setFormAccountingStatus(rel.accounting_status || "");
    setFormControlledType(rel.controlled_type || "กระบะ");
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
          followers: d.followers || [],
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
        description: formDescription || `ปล่อยรถ ทะเบียน ${formPlateText} คนขับ ${formDriverName}`,
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
          showSuccess(`สร้างใบปล่อยรถใหม่สำเร็จ! (${res.data.car_release_no || ""})`);
          setIsDrawerOpen(false);
          fetchReleases();
        } else {
          showError(res.data.message || "ไม่สามารถสร้างใบปล่อยรถได้");
        }
      }
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsDrawerOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!releaseToDelete) return;
    try {
      const res = await api.delete(`/car-release/${releaseToDelete.car_release_id}`);
      if (res.data.success) {
        showSuccess(`ลบใบปล่อยรถ (${releaseToDelete.car_release_no}) เรียบร้อยแล้ว!`);
        fetchReleases();
      } else {
        showError(res.data.message || "ไม่สามารถลบใบปล่อยรถได้");
      }
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการลบใบปล่อยรถ");
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
          <img src={getImageUrl(value)} alt={label} className="w-full h-full object-cover" />
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

  const filteredReleases = releases.filter(
    (r) =>
      r.car_release_no.toLowerCase().includes(search.toLowerCase()) ||
      r.license_plate.toLowerCase().includes(search.toLowerCase()) ||
      r.driver_name.toLowerCase().includes(search.toLowerCase()) ||
      r.follower_name.toLowerCase().includes(search.toLowerCase()),
  );

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

        <div className="flex items-center gap-2">
          {/* + Button opens Right Create Form Drawer */}
          <button
            onClick={handleOpenAdd}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-1.5 rounded-lg font-medium flex items-center justify-center shadow-2xs"
            title="สร้างใบปล่อยรถใหม่"
          >
            <Plus className="w-4 h-4 text-slate-800" />
          </button>

          <button
            onClick={handleOpenAdd}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>สร้างใบปล่อยรถใหม่</span>
          </button>

          <button className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar with Date Picker */}
      <div className="tms-card p-3 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-2xl">
          {/* Date Picker Filter */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <span className="font-semibold text-slate-700 text-xs shrink-0 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              วันที่ปล่อยรถ:
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-slate-400 font-mono"
            />
            {selectedDate && (
              <button
                onClick={() => {
                  setSelectedDate("");
                  setCurrentPage(1);
                }}
                className="text-[10px] text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md font-medium transition-colors"
                title="ล้างการกรองวันที่"
              >
                แสดงทั้งหมด
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="ค้นหาเลขใบปล่อยรถ, ทะเบียน, ชื่อคนขับ, ผู้ติดตาม..."
              className="w-full bg-slate-50 border border-slate-200/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-500 text-xs shrink-0">
          <span>
            รวมทั้งหมด{" "}
            <strong className="text-slate-900 font-semibold">
              {totalItems || releases.length}
            </strong>{" "}
            รายการ
          </span>
        </div>
      </div>

      {/* 100% FULL-WIDTH COMPACT REFERENCE TABLE */}
      <div className="tms-card overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                <th className="py-2.5 px-3">เลขที่ปล่อยรถ</th>
                <th className="py-2.5 px-3">ทะเบียนรถ</th>
                <th className="py-2.5 px-3">กรุ๊ปรถ</th>
                <th className="py-2.5 px-3 text-center">สถานะปล่อยรถ</th>
                <th className="py-2.5 px-3 text-center">คืนรถ</th>
                <th className="py-2.5 px-3 text-center">เบี้ยเลี้ยง</th>
                <th className="py-2.5 px-3">สถานะทางบัญชี</th>
                <th className="py-2.5 px-3 text-right">เลขไมล์</th>
                <th className="py-2.5 px-3">คนขับ</th>
                <th className="py-2.5 px-3">ผู้ติดตาม</th>
                <th className="py-2.5 px-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
              {Object.entries(groupedReleases).map(([dateStr, itemsList]) => {
                const items = itemsList as any[];
                return (
                  <React.Fragment key={dateStr}>
                    {/* Date Header Row */}
                    <tr className="bg-slate-50 border-y border-slate-200/80">
                      <td
                        colSpan={11}
                        className="py-1.5 px-3 font-bold text-[11px] text-slate-700"
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
                          className={`hover:bg-slate-100/80 cursor-pointer transition-colors ${isSelected ? "bg-slate-100 font-semibold" : ""
                            }`}
                        >
                          {/* 1. เลขที่ปล่อยรถ */}
                          <td className="py-2 px-3 font-bold text-slate-900 font-mono">
                            {rel.car_release_no}
                          </td>

                          {/* 2. ทะเบียนรถ */}
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <img
                                src={getImageUrl(rel.car_img || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=100&q=80")}
                                alt="car"
                                className="w-7 h-7 rounded-md object-cover border border-slate-200 shrink-0"
                              />
                              <span className="font-semibold text-slate-800 text-[11px]">
                                {rel.license_plate}
                              </span>
                            </div>
                          </td>

                          {/* 3. กรุ๊ปรถ */}
                          <td className="py-2 px-3">
                            <span className="font-medium text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                              {rel.group_store_name !== "-" ? rel.group_store_name : (rel.brand_model || "-")}
                            </span>
                          </td>

                          {/* 4. สถานะปล่อยรถ */}
                          <td className="py-2 px-3 text-center">
                            {(rel.completedStores === rel.totalStores && rel.totalStores > 0) || rel.is_returned ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> เสร็จสิ้น
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                                <Truck className="w-3 h-3" /> ดำเนินการอยู่
                              </span>
                            )}
                          </td>

                          {/* 5. คืนรถ */}
                          <td className="py-2 px-3 text-center">
                            {rel.is_returned ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                                <CheckCircle2 className="w-3 h-3" /> คืนรถแล้ว
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                                <XCircle className="w-3 h-3 text-rose-600" /> ยังไม่คืนรถ
                              </span>
                            )}
                          </td>

                          {/* 6. เบี้ยเลี้ยง */}
                          <td className="py-2 px-3 text-center text-slate-600 font-mono">
                            {rel.allowance || "-"}
                          </td>

                          {/* 7. สถานะทางบัญชี */}
                          <td className="py-2 px-3 text-slate-600 font-medium">
                            {rel.accounting_status || "รอการตรวจสอบ"}
                          </td>

                          {/* 8. เลขไมล์ */}
                          <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">
                            {rel.mileage?.toLocaleString() || "0"}
                          </td>

                          {/* 9. คนขับ */}
                          <td className="py-2 px-3 font-semibold text-slate-900">
                            {rel.driver_name}
                          </td>

                          {/* 10. ผู้ติดตาม */}
                          <td className="py-2 px-3 text-slate-700">
                            {rel.follower_name || "-"}
                          </td>

                          {/* จัดการ */}
                          <td className="py-2 px-3 text-right space-x-1">
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
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
              {releases.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
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
        title={editingId ? `แก้ไขรายการปล่อยรถ (#${editingId})` : "สร้างรายการปล่อยรถใหม่"}
        formId="release-form"
        onSubmit={handleFormSubmit}
        submitLabel={editingId ? "บันทึกการแก้ไข" : "บันทึกสร้างใบปล่อยรถ"}
        maxWidthClass="max-w-xl"
      >
        <form
          id="release-form"
          onSubmit={handleFormSubmit}
          className="space-y-4 text-xs"
        >
          {/* Section 1: ข้อมูลกรุ๊ปรถและคนขับ */}
          <div className="space-y-3 bg-white p-4 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>1. เลือกกรุ๊ปรถและพนักงานขับรถ</span>
              <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-semibold">
                ⚡ เลือกรถอัตโนมัติตามกรุ๊ป
              </span>
            </h4>

            <div className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* เลือกกรุ๊ปรถ / สายจัดส่ง (SearchableSelect - ขยายความกว้าง sm:col-span-7) */}
                <div className="sm:col-span-7">
                  <SearchableSelect
                    label="กรุ๊ปรถ / สายจัดส่ง *"
                    options={groupOptions}
                    value={formGroupStoreId}
                    onChange={(val) => handleGroupChange(String(val))}
                    placeholder="-- ค้นหาและเลือกรถตามกรุ๊ป --"
                    searchPlaceholder="พิมพ์ค้นหากรุ๊ปรถ..."
                  />
                </div>

                {/* เลือกพนักงานขับรถ (SearchableSelect - sm:col-span-5) */}
                <div className="sm:col-span-5">
                  <SearchableSelect
                    label="พนักงานขับรถ *"
                    options={driverOptions}
                    value={formUserId}
                    onChange={(val) => {
                      setFormUserId(val);
                      const d = drivers.find((item) => String(item.user_id) === String(val));
                      if (d) setFormDriverName(d.name);
                    }}
                    placeholder="-- ค้นหาคนขับ --"
                    searchPlaceholder="พิมพ์ค้นหาชื่อคนขับ..."
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
                      รถยนต์ประจำกรุ๊ป (Auto-Matched)
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
                    <span className="text-[10px] font-semibold text-slate-500">สถานะกรุ๊ป:</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shadow-2xs ${(selectedGroupObj.status === 1 || selectedGroupObj.status === true || selectedGroupObj.is_released)
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : "bg-red-50 text-red-800 border-red-300"
                      }`}>
                      {(selectedGroupObj.status === 1 || selectedGroupObj.status === true || selectedGroupObj.is_released)
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
                        รายการจัดส่งในกรุ๊ปนี้ ({groupStoresPreview.length} จุดจัดส่ง)
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
                      <table className="w-full text-left border-collapse text-[10px]">
                        <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 z-10 border-b border-slate-200">
                          <tr>
                            <th className="py-1 px-1.5 text-center w-7">ลำดับ</th>
                            <th className="py-1 px-1.5">รหัสออเดอร์</th>
                            <th className="py-1 px-1.5">รหัสร้านค้า</th>
                            <th className="py-1 px-1.5">ชื่อร้านค้า / จุดจัดส่ง</th>
                            <th className="py-1 px-1.5 text-center w-12">ลัง</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {groupStoresPreview.map((item: any, idx: number) => (
                            <tr key={item.list_id || idx} className="hover:bg-slate-50 transition-colors">
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
                                {item.store_name_result || item.store_name || "ไม่ระบุชื่อร้านค้า"}
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
                <SearchableSelect
                  label="ประเภทการปล่อยรถ"
                  options={releaseTypeOptions}
                  value={String(formReleaseTypeId)}
                  onChange={(val) => setFormReleaseTypeId(val)}
                  placeholder="-- เลือกประเภทการปล่อยรถ --"
                />

                <div className="sm:col-span-2">
                  <label className="text-slate-700 font-semibold block mb-1 flex items-center justify-between">
                    <span>ผู้ติดตาม (เลือกพนักงานเป็นผู้ติดตามได้หลายคนจากฐานข้อมูล)</span>
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
                          (u.username && u.username.toLowerCase().includes(q)) ||
                          (u.level_user_name && u.level_user_name.toLowerCase().includes(q))
                        );
                      })
                      .map((u) => {
                        const isChecked = formFollowers.includes(u.name);
                        return (
                          <label
                            key={u.user_id}
                            className={`flex items-center justify-between p-1.5 rounded-md cursor-pointer transition-colors text-xs ${isChecked
                              ? "bg-blue-50/90 text-blue-900 border border-blue-200 font-semibold"
                              : "hover:bg-slate-100 text-slate-700"
                              }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormFollowers((prev) => [...prev, u.name]);
                                  } else {
                                    setFormFollowers((prev) =>
                                      prev.filter((name) => name !== u.name)
                                    );
                                  }
                                }}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0 cursor-pointer"
                              />
                              <img
                                src={getImageUrl(u.user_image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80")}
                                alt={u.name}
                                className="w-5 h-5 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                              <span className="truncate">{u.name}</span>
                            </div>
                            {u.level_user_name && (
                              <span className="text-[10px] text-slate-400 font-normal shrink-0 ml-1">
                                ({u.level_user_name})
                              </span>
                            )}
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
          <div className="space-y-3 bg-white p-4 rounded-lg border border-slate-200">
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
                  onChange={(val) => setFormPda(String(val))}
                  placeholder="-- ค้นหาและเลือกอุปกรณ์ PDA --"
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
                  onChange={(val) => setFormAccountingStatus(String(val))}
                  placeholder="-- ค้นหาและเลือกสถานะบัญชี --"
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
          <div className="space-y-3 bg-white p-4 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>3. รูปภาพการปล่อยรถ (ครบทุกมุม)</span>
              <span className="text-[10px] text-slate-400 font-normal">อัปโหลดรูปภาพ</span>
            </h4>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* 1. รูปถ่ายเลขไมล์ */}
              {renderImagePicker("1. รูปถ่ายเลขไมล์", imgMileage, setImgMileage, "img_mileage_input")}

              {/* 2. รูปถ่ายหน้ารถ */}
              {renderImagePicker("2. รูปถ่ายหน้ารถ", imgFront, setImgFront, "img_front_input")}

              {/* 3. รูปถ่ายรอบคัน 1 */}
              {renderImagePicker("3. รอบคัน (ซ้าย)", imgAround1, setImgAround1, "img_around1_input")}

              {/* 4. รูปถ่ายรอบคัน 2 */}
              {renderImagePicker("4. รอบคัน (ขวา)", imgAround2, setImgAround2, "img_around2_input")}

              {/* 5. รูปถ่ายรอบคัน 3 */}
              {renderImagePicker("5. รอบคัน (หลัง)", imgAround3, setImgAround3, "img_around3_input")}

              {/* 6. รูปถ่ายรอบคัน 4 */}
              {renderImagePicker("6. รอบคัน (กระบะ/ตู้)", imgAround4, setImgAround4, "img_around4_input")}

              {/* 7. รูปถ่ายรอบคัน 5 */}
              {renderImagePicker("7. รอบคัน (ภายใน)", imgAround5, setImgAround5, "img_around5_input")}

              {/* 8. รูปถ่ายอุปกรณ์ PDA */}
              {renderImagePicker("8. รูปถ่ายอุปกรณ์ PDA", imgPda, setImgPda, "img_pda_input")}
            </div>
          </div>
        </form>
      </AnimatedDrawer>

      {/* RIGHT SLIDE-OVER DETAIL INSPECTOR DRAWER */}
      <AnimatedDrawer
        isOpen={!!selectedRelease}
        onClose={() => setSelectedRelease(null)}
        title={
          selectedRelease ? (
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base font-mono">
                {selectedRelease.car_release_no}
              </span>
            </div>
          ) : (
            "รายละเอียดใบปล่อยรถ"
          )
        }
        maxWidthClass="max-w-xl"
      >
        {selectedRelease && (
          <div className="space-y-4">
            {/* 10 QUICK ACTION BUTTONS */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                การดำเนินการด่วน
              </div>
              <div className="grid grid-cols-5 gap-2">
                <button
                  onClick={() => setModalAction("reset_key")}
                  className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors"
                >
                  <Key className="w-4 h-4 text-slate-700 mb-1" />
                  <span className="text-[10px] font-medium text-slate-700">
                    รีเซ็ตกุญแจ
                  </span>
                </button>

                <button
                  onClick={() => setModalAction("cargo_photo")}
                  className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors"
                >
                  <Camera className="w-4 h-4 text-slate-700 mb-1" />
                  <span className="text-[10px] font-medium text-slate-700">
                    รูปให้ของ
                  </span>
                </button>

                <button
                  onClick={() => setModalAction("accounting")}
                  className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-700 mb-1" />
                  <span className="text-[10px] font-medium text-slate-700">
                    สถานะบัญชี
                  </span>
                </button>

                <button
                  onClick={() => setModalAction("add_store")}
                  className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors"
                >
                  <Plus className="w-4 h-4 text-slate-700 mb-1" />
                  <span className="text-[10px] font-medium text-slate-700">
                    เพิ่มร้านค้า
                  </span>
                </button>

                <button
                  onClick={() => setModalAction("followup")}
                  className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors"
                >
                  <Truck className="w-4 h-4 text-slate-700 mb-1" />
                  <span className="text-[10px] font-medium text-slate-700">
                    ติดตาม
                  </span>
                </button>

                <button
                  onClick={() => setModalAction("deposit")}
                  className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors"
                >
                  <Wallet className="w-4 h-4 text-slate-700 mb-1" />
                  <span className="text-[10px] font-medium text-slate-700">
                    ฝากเงิน
                  </span>
                </button>

                <button
                  onClick={() => setModalAction("return_docs")}
                  className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors"
                >
                  <FileText className="w-4 h-4 text-slate-700 mb-1" />
                  <span className="text-[10px] font-medium text-slate-700">
                    เอกสารคืนของ
                  </span>
                </button>

                <button
                  onClick={() => setModalAction("controlled_items")}
                  className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors"
                >
                  <PackageCheck className="w-4 h-4 text-slate-700 mb-1" />
                  <span className="text-[10px] font-medium text-slate-700">
                    สินค้าควบคุม
                  </span>
                </button>

                <button
                  onClick={() => setModalAction("return_car")}
                  className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-slate-700 mb-1" />
                  <span className="text-[10px] font-medium text-slate-700">
                    คืนรถ
                  </span>
                </button>

                <button
                  onClick={() => setModalAction("allowance")}
                  className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors"
                >
                  <Coins className="w-4 h-4 text-slate-700 mb-1" />
                  <span className="text-[10px] font-medium text-slate-700">
                    เบี้ยเลี้ยง
                  </span>
                </button>
              </div>
            </div>

            {/* Metadata Details */}
            <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3 shadow-2xs">
              <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">
                รายละเอียดใบปล่อยรถ
              </h4>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">รหัสปล่อยรถ</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedRelease.car_release_no}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">ทะเบียนรถ</span>
                  <span className="font-bold text-slate-900">{selectedRelease.license_plate}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">สายจัดส่ง / กรุ๊ป</span>
                  <span className="font-semibold text-slate-900">{selectedRelease.group_store_name || "-"}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">ประเภทการปล่อย</span>
                  <span className="font-semibold text-slate-900">{selectedRelease.car_release_type_name || "ปล่อยรถปกติ"}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">พนักงานขับรถ</span>
                  <div className="flex items-center gap-2">                  
                    <img
                      src={getImageUrl(
                        selectedRelease.driver_avatar || selectedRelease.user_image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80"
                      )}
                      alt={selectedRelease.driver_name}
                      className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                    />
                    <span className="font-semibold text-slate-900">{selectedRelease.driver_name || "ไม่ระบุ"}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">เบอร์โทรศัพท์</span>
                  <span className="font-medium text-slate-800 font-mono">{selectedRelease.driver_phone || "-"}</span>
                </div>

                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px] mb-0.5">ผู้ติดตาม</span>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(selectedRelease.followers) && selectedRelease.followers.length > 0 ? (
                      selectedRelease.followers.map((f: any, idx: number) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-medium">
                          {typeof f === "string" ? f : f.follower_name}
                        </span>
                      ))
                    ) : (
                      <span className="font-medium text-slate-800">{selectedRelease.follower_name || "-"}</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">เลขไมล์ออก</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {Number(selectedRelease.mileage || 0).toLocaleString()} กม.
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">อุปกรณ์ PDA</span>
                  <span className="font-medium text-slate-800">{selectedRelease.pda_device || "-"}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">สถานะทางบัญชี</span>
                  <span className="font-semibold text-amber-700">
                    {selectedRelease.accounting_status_name || selectedRelease.accounting_status || "-"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">วันที่ออกรถ</span>
                  <span className="font-medium text-slate-800">
                    {selectedRelease.created_at ? new Date(selectedRelease.created_at).toLocaleString("th-TH") : selectedRelease.dateGroup || "-"}
                  </span>
                </div>

                {selectedRelease.description && (
                  <div className="col-span-2 bg-slate-50 p-2 rounded border border-slate-100 mt-1">
                    <span className="text-slate-400 block text-[10px]">หมายเหตุ</span>
                    <span className="text-slate-700 text-xs">{selectedRelease.description}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Real Uploaded Car Release Photos */}
            <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-2 shadow-2xs">
              <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2 flex items-center justify-between">
                <span>รูปภาพการปล่อยรถ</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {[
                    selectedRelease.image_mileage,
                    selectedRelease.image_front,
                    selectedRelease.image_around_1,
                    selectedRelease.image_around_2,
                    selectedRelease.image_around_3,
                    selectedRelease.image_around_4,
                    selectedRelease.image_around_5,
                    selectedRelease.image_pda,
                  ].filter(Boolean).length} รูป
                </span>
              </h4>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { label: "เลขไมล์", val: selectedRelease.image_mileage },
                  { label: "หน้ารถ", val: selectedRelease.image_front },
                  { label: "รอบคัน 1", val: selectedRelease.image_around_1 },
                  { label: "รอบคัน 2", val: selectedRelease.image_around_2 },
                  { label: "รอบคัน 3", val: selectedRelease.image_around_3 },
                  { label: "รอบคัน 4", val: selectedRelease.image_around_4 },
                  { label: "รอบคัน 5", val: selectedRelease.image_around_5 },
                  { label: "อุปกรณ์ PDA", val: selectedRelease.image_pda },
                ]
                  .filter((item) => !!item.val)
                  .map((item, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-lg overflow-hidden bg-slate-100 aspect-video relative group shadow-2xs"
                    >
                      <img
                        src={getImageUrl(item.val)}
                        alt={item.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">
                        {item.label}
                      </div>
                    </div>
                  ))}

                {[
                  selectedRelease.image_mileage,
                  selectedRelease.image_front,
                  selectedRelease.image_around_1,
                  selectedRelease.image_around_2,
                  selectedRelease.image_around_3,
                  selectedRelease.image_around_4,
                  selectedRelease.image_around_5,
                  selectedRelease.image_pda,
                ].filter(Boolean).length === 0 && (
                    <div className="col-span-3 text-center py-4 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-[11px]">
                      ไม่มีการแนบรูปภาพสำหรับการปล่อยรถนี้
                    </div>
                  )}
              </div>
            </div>

            {/* Stores Timeline List */}
            {Array.isArray(selectedRelease.stores) && selectedRelease.stores.length > 0 && (
              <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-2 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2 flex items-center justify-between">
                  <span>รายการจุดจัดส่งในกรุ๊ป ({selectedRelease.stores.length} ร้าน)</span>
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {selectedRelease.stores.map((st: any, idx: number) => (
                    <div key={st.list_id || idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                          {st.row_order || idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate flex items-center gap-1.5">
                            <span>{st.store_name_result || st.store_name || "ร้านค้าจุดจัดส่ง"}</span>
                            {(st.position_product_name || st.position_product_id) && (
                              <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono shrink-0">
                                จุดวาง {st.position_product_name || st.position_product_id}/{st.position_production_order || 1}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {st.store_address || st.telephone_number || "-"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-slate-800 block">{st.sum_quantity || 1} ลัง</span>
                        <span className={`text-[10px] font-semibold ${st.check_out_id ? "text-emerald-600" : st.check_in_id ? "text-blue-600" : "text-amber-600"}`}>
                          {st.check_out_id ? "เช็คเอาท์แล้ว" : st.check_in_id ? "กำลังส่ง" : "รอส่ง"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Car Return Record */}
            {selectedRelease.car_return && (
              <div className="border border-emerald-200 bg-emerald-50/50 rounded-lg p-4 space-y-2 shadow-2xs">
                <h4 className="font-bold text-emerald-900 text-xs border-b border-emerald-200 pb-2 flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-emerald-600" />
                  <span>ข้อมูลการคืนรถ (บันทึกเรียบร้อย)</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-emerald-900">
                  <div>
                    <span className="text-emerald-600 block text-[10px]">เลขไมล์คืน</span>
                    <span className="font-bold font-mono">{Number(selectedRelease.car_return.mileage || 0).toLocaleString()} กม.</span>
                  </div>
                  <div>
                    <span className="text-emerald-600 block text-[10px]">ผู้ถือกุญแจ</span>
                    <span className="font-semibold">{selectedRelease.car_return.key_holder_name || "-"}</span>
                  </div>
                  <div>
                    <span className="text-emerald-600 block text-[10px]">จุดจอดรถ</span>
                    <span className="font-semibold">{selectedRelease.car_return.parking_name || "-"}</span>
                  </div>
                  <div>
                    <span className="text-emerald-600 block text-[10px]">ค่าน้ำมัน</span>
                    <span className="font-semibold">{selectedRelease.car_return.gas_bill ? `${Number(selectedRelease.car_return.gas_bill).toLocaleString()} ฿` : "-"}</span>
                  </div>
                </div>
              </div>
            )}
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

      <QuickActionModal
        isOpen={!!modalAction}
        actionType={modalAction}
        releaseNo={selectedRelease?.car_release_no || "TMS-2026720-0005"}
        onClose={() => setModalAction(null)}
      />
    </div>
  );
};
