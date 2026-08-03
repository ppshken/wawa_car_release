import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Truck,
  AlertTriangle,
  Plus,
  ChevronRight,
  TrendingUp,
  Store,
  Users,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import api, { getImageUrl } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import {
  ColumnToggleDropdown,
  ColumnItem,
} from "../components/ColumnToggleDropdown";
import { SearchableSelect } from "../components/SearchableSelect";

const DASHBOARD_TABLE_COLUMNS: ColumnItem[] = [
  { id: "car_release_no", label: "เลขที่ปล่อยรถ" },
  { id: "license_plate", label: "ทะเบียนรถ" },
  { id: "progress", label: "ความคืบหน้า" },
  { id: "group_store", label: "กรุ๊ปรถ" },
  { id: "release_status", label: "สถานะปล่อยรถ" },
  { id: "return_status", label: "คืนรถ" },
  { id: "accounting_status", label: "สถานะทางบัญชี" },
  { id: "mileage", label: "เลขไมล์" },
  { id: "driver_name", label: "คนขับ" },
  { id: "actions", label: "จัดการ" },
];

interface SummaryData {
  total_releases: number;
  running_releases: number;
  returned_releases: number;
  stores_target: number;
  stores_completed: number;
  stores_completion_percent: number;
  total_cash: number;
  total_transfer_received: number;
  pending_transfer_amount: number;
  pending_transfer_count: number;
  grand_total_amount: number;
  off_site_count: number;
  problem_count: number;
}

interface DailyStat {
  date: string;
  cash: number;
  transfer: number;
  pending_transfer: number;
  total: number;
}

interface OperationItem {
  id: string;
  carReleaseId: number;
  carReleaseNo: string;
  licensePlate: string;
  carImg: string;
  brandModel: string;
  groupStoreName: string;
  groupColor: string;
  driver: string;
  phone: string;
  followerName: string;
  storesDone: number;
  storesTotal: number;
  status: string;
  accounting: string;
  mileage: number;
  amount: number;
  isReturned: boolean;
  hasIssue: boolean;
}

interface DriverItem {
  userId: number;
  name: string;
  completedStores: number;
  revenue: number;
  active: boolean;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "running" | "returned">(
    "all",
  );
  const [dateRange, setDateRange] = useState<string>("today");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const isDriverUser = React.useMemo(() => {
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

  const [summary, setSummary] = useState<SummaryData>({
    total_releases: 0,
    running_releases: 0,
    returned_releases: 0,
    stores_target: 0,
    stores_completed: 0,
    stores_completion_percent: 0,
    total_cash: 0,
    total_transfer_received: 0,
    pending_transfer_amount: 0,
    pending_transfer_count: 0,
    grand_total_amount: 0,
    off_site_count: 0,
    problem_count: 0,
  });

  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [operations, setOperations] = useState<OperationItem[]>([]);
  const [drivers, setDrivers] = useState<DriverItem[]>([]);

  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    () => {
      const saved = localStorage.getItem("wawa_dashboard_visible_cols");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
      return {
        car_release_no: true,
        license_plate: true,
        progress: true,
        group_store: true,
        release_status: true,
        return_status: true,
        accounting_status: true,
        mileage: true,
        driver_name: true,
        actions: true,
      };
    },
  );

  const handleColumnChange = (updated: Record<string, boolean>) => {
    setVisibleColumns(updated);
    localStorage.setItem(
      "wawa_dashboard_visible_cols",
      JSON.stringify(updated),
    );
  };

  const { showToast } = useToast();

  const fetchDashboardData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const res = await api.get("/reports/dashboard", {
          params: { range: dateRange },
        });

        if (res.data && res.data.success) {
          setSummary(res.data.summary || {});
          setDailyStats(res.data.dailyStats || []);
          setOperations(res.data.recentReleases || []);
          setDrivers(res.data.driverLeaderboard || []);
        }
      } catch (err: any) {
        console.error("Failed to load dashboard stats:", err);
        showToast("ไม่สามารถโหลดข้อมูล Dashboard ได้", "error");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dateRange, showToast],
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const filteredOperations = operations.filter((op) => {
    const isCompleted =
      (op.storesDone === op.storesTotal && op.storesTotal > 0) || op.isReturned;
    if (activeTab === "running") return !isCompleted;
    if (activeTab === "returned") return op.isReturned;
    return true;
  });

  return (
    <div className="space-y-4 mx-auto pb-12 font-sans">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            {isDriverUser
              ? `ภาพรวมการทำงานและยอดจัดเก็บ (คนขับ: ${user?.name || "ส่วนตัว"})`
              : "ภาพรวมการทำงาน & ปล่อยรถ (ผู้ดูแลระบบ)"}
            {refreshing && (
              <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isDriverUser
              ? "สรุปยอดขายจัดเก็บ สถานะร้านค้า และการปฏิบัติงานส่วนตัวของคุณ"
              : "ระบบติดตามสถานะปล่อยขาย ส่งสินค้า รายรับเงินสด/โอน และประสิทธิภาพคนขับทั้งหมด"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchDashboardData(true)}
            className="bg-white border border-slate-200/80 hover:bg-slate-50 rounded-lg p-2 text-slate-600 shadow-sm transition-all"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>

          <SearchableSelect
            required
            value={dateRange}
            onChange={(value) => setDateRange(value as string)}
            placeholder="-- เลือกช่วงวันที่ --"
            options={[
              { value: "today", label: "วันนี้" },
              { value: "this_week", label: "7 วันล่าสุด" },
              { value: "this_month", label: "30 วันล่าสุด" },
            ]}
            className="w-36"
          />
        </div>
      </div>

      {/* 4 Dynamic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Releases */}
        <div className="tms-card p-5 hover:border-slate-300 transition-all bg-white rounded-xl border border-slate-200/70 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-500">
              ใบปล่อยรถ
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-slate-900 tracking-tight">
              {loading ? "-" : summary.total_releases}
            </span>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              วิ่งงาน {summary.running_releases} คัน
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
            <span>
              คืนรถแล้ว:{" "}
              <strong className="text-slate-700 font-medium">
                {summary.returned_releases} คัน
              </strong>
            </span>
            <span>สถานะเรียบร้อย</span>
          </div>
        </div>

        {/* Card 2: Store Visits */}
        <div className="tms-card p-5 hover:border-slate-300 transition-all bg-white rounded-xl border border-slate-200/70 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-500">
              ร้านค้าเป้าหมาย
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-slate-900 tracking-tight">
              {loading ? "-" : summary.stores_target.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500">ร้าน</span>
          </div>
          {/* Progress Bar */}
          <div className="mt-3 space-y-1">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-slate-900 h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, summary.stores_completion_percent || 0)}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>
                สำเร็จ {summary.stores_completed.toLocaleString()} ร้าน
              </span>
              <span className="font-semibold text-slate-700">
                {summary.stores_completion_percent}%
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Revenue */}
        <div className="tms-card p-5 hover:border-slate-300 transition-all bg-white rounded-xl border border-slate-200/70 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-500">
              ยอดขายรวมจัดเก็บ
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-slate-900 tracking-tight">
              {loading ? "-" : formatCurrency(summary.grand_total_amount)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>
              สด:{" "}
              <strong className="text-slate-700">
                {formatCurrency(summary.total_cash)}
              </strong>
            </span>
            <span>
              โอน:{" "}
              <strong className="text-slate-700">
                {formatCurrency(summary.total_transfer_received)}
              </strong>
            </span>
          </div>
        </div>

        {/* Card 4: Alerts */}
        <div className="tms-card p-5 hover:border-slate-300 transition-all bg-white rounded-xl border border-slate-200/70 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-500">
              รายการต้องติดตาม
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-slate-900 tracking-tight">
              {loading
                ? "-"
                : summary.pending_transfer_count + summary.off_site_count}
            </span>
            <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium border border-amber-200/60">
              ต้องตรวจสอบ
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>
              ค้างโอน:{" "}
              <strong className="text-slate-700">
                {summary.pending_transfer_count} รายการ
              </strong>
            </span>
            <span>
              Off-site:{" "}
              <strong className="text-slate-700">
                {summary.off_site_count} จุด
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Daily Sales Trend Chart (Recharts) */}
      <div className="bg-white rounded-xl border border-slate-200/70 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-600" />
              แนวโน้มยอดขายจัดเก็บ (7 วันล่าสุด)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              เปรียบเทียบยอดขายรวม เงินสด และเงินโอนเข้าบัญชีรายวัน
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
              <span>เงินสด</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>เงินโอน</span>
            </div>
          </div>
        </div>

        <div className="h-56 w-full pt-2">
          {dailyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dailyStats}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorTransfer"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                  formatter={(value: any) => [
                    formatCurrency(Number(value)),
                    "",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="cash"
                  name="เงินสด"
                  stroke="#0f172a"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCash)"
                />
                <Area
                  type="monotone"
                  dataKey="transfer"
                  name="เงินโอน"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTransfer)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
              ยังไม่มีข้อมูลยอดขายรายวันในช่วงเวลานี้
            </div>
          )}
        </div>
      </div>

      {/* Main Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Live Releases Table (Matches CarReleaseList table style 100%) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/70 p-5 space-y-4 shadow-sm overflow-hidden">
            {/* Table Header & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                  <Truck className="w-4 h-4 text-slate-700" />
                  รายการปฏิบัติงานล่าสุด
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  รายการใบปล่อยรถ ทะเบียน ความคืบหน้าการส่งสินค้า
                  และสถานะทางบัญชี
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Column Toggle Dropdown */}
                <ColumnToggleDropdown
                  columns={DASHBOARD_TABLE_COLUMNS}
                  visibleColumns={visibleColumns}
                  onChange={handleColumnChange}
                />

                {/* Minimal Filter Tabs */}
                <div className="flex bg-slate-100/70 p-1 rounded-lg gap-1 text-xs">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                      activeTab === "all"
                        ? "bg-white text-slate-900 shadow-sm font-semibold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    ทั้งหมด
                  </button>
                  <button
                    onClick={() => setActiveTab("running")}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                      activeTab === "running"
                        ? "bg-white text-slate-900 shadow-sm font-semibold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    ดำเนินการอยู่
                  </button>
                  <button
                    onClick={() => setActiveTab("returned")}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                      activeTab === "returned"
                        ? "bg-white text-slate-900 shadow-sm font-semibold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    คืนรถแล้ว
                  </button>
                </div>
              </div>
            </div>

            {/* Standard Car Release Reference Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                    {visibleColumns.car_release_no !== false && (
                      <th className="py-2.5 px-3">เลขที่ปล่อยรถ</th>
                    )}
                    {visibleColumns.license_plate !== false && (
                      <th className="py-2.5 px-3">ทะเบียนรถ</th>
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
                    {visibleColumns.accounting_status !== false && (
                      <th className="py-2.5 px-3">สถานะทางบัญชี</th>
                    )}
                    {visibleColumns.mileage !== false && (
                      <th className="py-2.5 px-3 text-right">เลขไมล์</th>
                    )}
                    {visibleColumns.driver_name !== false && (
                      <th className="py-2.5 px-3">คนขับ</th>
                    )}
                    {visibleColumns.actions !== false && (
                      <th className="py-2.5 px-3 text-right">จัดการ</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={
                          Object.values(visibleColumns).filter(
                            (v) => v !== false,
                          ).length || 1
                        }
                        className="py-8 text-center text-slate-400"
                      >
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-300" />
                        กำลังโหลดข้อมูลใบปล่อยรถ...
                      </td>
                    </tr>
                  ) : filteredOperations.length === 0 ? (
                    <tr>
                      <td
                        colSpan={
                          Object.values(visibleColumns).filter(
                            (v) => v !== false,
                          ).length || 1
                        }
                        className="py-8 text-center text-slate-400"
                      >
                        ไม่พบข้อมูลรายการปล่อยรถในหมวดหมู่นี้
                      </td>
                    </tr>
                  ) : (
                    filteredOperations.map((rel) => {
                      const isCompleted =
                        (rel.storesDone === rel.storesTotal &&
                          rel.storesTotal > 0) ||
                        rel.isReturned;
                      return (
                        <tr
                          key={rel.carReleaseId}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          {/* 1. เลขที่ปล่อยรถ */}
                          {visibleColumns.car_release_no !== false && (
                            <td className="py-2.5 px-3 font-bold text-slate-900 font-mono">
                              {rel.carReleaseNo || rel.id}
                            </td>
                          )}

                          {/* 2. ทะเบียนรถ */}
                          {visibleColumns.license_plate !== false && (
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-2">
                                <img
                                  src={getImageUrl(rel.carImg)}
                                  alt="car"
                                  className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                                />
                                <span className="font-semibold text-slate-800 text-[11px]">
                                  {rel.licensePlate}
                                </span>
                              </div>
                            </td>
                          )}

                          {/* 3. ความคืบหน้า */}
                          {visibleColumns.progress !== false && (
                            <td className="py-2 px-3">
                              <span className="font-medium text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                                {rel.storesDone + "/" + rel.storesTotal}
                              </span>
                            </td>
                          )}

                          {/* 4. กรุ๊ปรถ */}
                          {visibleColumns.group_store !== false && (
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-1.5 font-medium text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                                <div
                                  className="w-2.5 h-2.5 rounded-full border border-white shadow-2xs shrink-0"
                                  style={{
                                    background: rel.groupColor || "#94a3b8",
                                  }}
                                />
                                <span>{rel.groupStoreName}</span>
                              </div>
                            </td>
                          )}

                          {/* 5. สถานะปล่อยรถ */}
                          {visibleColumns.release_status !== false && (
                            <td className="py-2 px-3 text-center">
                              {isCompleted ? (
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

                          {/* 6. คืนรถ */}
                          {visibleColumns.return_status !== false && (
                            <td className="py-2 px-3 text-center">
                              {rel.isReturned ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                                  <CheckCircle2 className="w-3 h-3" /> คืนรถแล้ว
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
                                  <XCircle className="w-3 h-3 text-rose-600" />{" "}
                                  ยังไม่คืนรถ
                                </span>
                              )}
                            </td>
                          )}

                          {/* 7. สถานะทางบัญชี */}
                          {visibleColumns.accounting_status !== false && (
                            <td className="py-2 px-3 text-slate-600 font-medium">
                              {rel.accounting || "-"}
                            </td>
                          )}

                          {/* 8. เลขไมล์ */}
                          {visibleColumns.mileage !== false && (
                            <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">
                              {rel.mileage?.toLocaleString() || "0"}
                            </td>
                          )}

                          {/* 9. คนขับ */}
                          {visibleColumns.driver_name !== false && (
                            <td className="py-2 px-3 font-semibold text-slate-900">
                              {rel.driver}
                            </td>
                          )}

                          {/* 10. จัดการ */}
                          {visibleColumns.actions !== false && (
                            <td className="py-2 px-3 text-right">
                              <Link
                                to="/releases"
                                className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 inline-flex items-center"
                                title="ดูรายละเอียดใบปล่อยรถ"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-2 text-right">
              <Link
                to="/releases"
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1 hover:underline"
              >
                ดูรายการใบปล่อยรถทั้งหมด{" "}
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Driver Leaderboard & Quick Accounting Summary Card */}
        <div className="space-y-4">
          {/* Driver Progress Card */}
          <div className="bg-white rounded-xl border border-slate-200/70 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" />
                {isDriverUser
                  ? "ประสิทธิภาพการจัดส่งของคุณ"
                  : "ประสิทธิภาพรายคนขับ"}
              </h3>
              <span className="text-[11px] text-slate-400">
                {isDriverUser ? "สถิติส่วนตัว" : "ยอดจัดเก็บสูงสุด"}
              </span>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  กำลังดึงข้อมูล...
                </div>
              ) : drivers.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  ยังไม่มีข้อมูลคนขับในการจัดส่ง
                </div>
              ) : (
                drivers.map((d) => (
                  <div
                    key={d.userId}
                    className="flex items-center justify-between text-xs py-1"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-semibold flex items-center justify-center text-xs border border-slate-200/60">
                        {d.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          {d.name}
                          {d.active && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                              title="กำลังวิ่งงานอยู่"
                            ></span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ส่งเสร็จ {d.completedStores} ร้าน
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-slate-900">
                        {formatCurrency(d.revenue)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Accounting Summary Card (White Theme Matching System) */}
          <div className="bg-white rounded-xl border border-slate-200/70 p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>สรุปสถานะฝั่งบัญชี</span>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full font-medium">
                Real-time
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {summary.pending_transfer_count > 0
                ? `มีรายการโอนค้างชำระ ${summary.pending_transfer_count} รายการ ยอดรวม ${formatCurrency(summary.pending_transfer_amount)} ที่รอการตรวจสอบ`
                : "ไม่มีรายการโอนค้างชำระที่ต้องติดตามด่วน ระบบพร้อมสำหรับการบันทึกปิดรอบประจำวัน"}
            </p>
            <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
              <span>
                โอนค้าง:{" "}
                <strong className="text-amber-600 font-semibold">
                  {summary.pending_transfer_count} รายการ
                </strong>
              </span>
              <Link
                to="/reports"
                className="text-slate-900 font-semibold hover:underline"
              >
                ดูรายงานบัญชี
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
