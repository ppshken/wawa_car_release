import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Truck,
  CheckCircle2,
  AlertTriangle,
  MapPinOff,
  Plus,
  ChevronRight,
  TrendingUp,
  Store,
  Users,
  Search,
  Calendar,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'running' | 'returned' | 'issues'>('all');
  const [dateRange, setDateRange] = useState<string>('today');

  // Minimal mock data for dashboard operations table
  const recentOperations = [
    {
      id: 'TMS-202673-0005',
      carPlate: 'ผม152[27]',
      driver: 'ช่างเล็ก',
      phone: '0632982269',
      storesDone: 5,
      storesTotal: 25,
      status: 'กำลังวิ่งงาน',
      accounting: 'รอตรวจ',
      amount: '฿42,500',
      isReturned: false,
      hasIssue: false
    },
    {
      id: 'TMS-202673-0004',
      carPlate: '84-6565[41]',
      driver: 'สมชาย',
      phone: '0812345678',
      storesDone: 7,
      storesTotal: 33,
      status: 'กำลังวิ่งงาน',
      accounting: 'รอตรวจ',
      amount: '฿68,100',
      isReturned: false,
      hasIssue: false
    },
    {
      id: 'TMS-202672-0003',
      carPlate: 'ผม153[26]',
      driver: 'วิชัย',
      phone: '0898765432',
      storesDone: 33,
      storesTotal: 33,
      status: 'คืนรถแล้ว',
      accounting: 'อนุมัติแล้ว',
      amount: '฿112,800',
      isReturned: true,
      hasIssue: false
    },
    {
      id: 'TMS-202672-0002',
      carPlate: 'ผม152[27]',
      driver: 'ช่างเล็ก',
      phone: '0632982269',
      storesDone: 38,
      storesTotal: 38,
      status: 'คืนรถแล้ว',
      accounting: 'อนุมัติแล้ว',
      amount: '฿145,200',
      isReturned: true,
      hasIssue: false
    },
    {
      id: 'TMS-202671-0004',
      carPlate: '84-6565[41]',
      driver: 'สมชาย',
      phone: '0812345678',
      storesDone: 21,
      storesTotal: 21,
      status: 'คืนรถแล้ว',
      accounting: 'อนุมัติแล้ว',
      amount: '฿89,400',
      isReturned: true,
      hasIssue: true
    }
  ];

  const driversLeaderboard = [
    { name: 'ช่างเล็ก', completed: 38, total: 38, revenue: '฿187,700', active: true },
    { name: 'สมชาย', completed: 28, total: 54, revenue: '฿157,500', active: true },
    { name: 'วิชัย', completed: 33, total: 33, revenue: '฿112,800', active: false },
    { name: 'พัท', completed: 25, total: 25, revenue: '฿94,300', active: false }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            ภาพรวมการทำงาน & ปล่อยรถ
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ระบบติดตามรถปล่อยขาย สถานะส่งสินค้า และสรุปยอดขายประจำวัน
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="bg-white border border-slate-200/80 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs text-slate-600 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent focus:outline-none font-medium cursor-pointer"
            >
              <option value="today">วันนี้ (20 ก.ค. 2026)</option>
              <option value="this_week">สัปดาห์นี้</option>
              <option value="this_month">เดือนนี้</option>
            </select>
          </div>

          <Link
            to="/releases/create"
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-4 py-2 rounded-lg transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            ออกใบปล่อยรถใหม่
          </Link>
        </div>
      </div>

      {/* 4 Minimalist White KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Releases */}
        <div className="tms-card p-5 hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-500">ใบปล่อยรถวันนี้</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-slate-900 tracking-tight">128</span>
            <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              วิ่งงาน 2 คัน
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
            <span>คืนรถแล้ว: <strong className="text-slate-700 font-medium">126 คัน</strong></span>
            <span>ตรงแผน 100%</span>
          </div>
        </div>

        {/* Card 2: Store Visits */}
        <div className="tms-card p-5 hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-500">ร้านค้าเป้าหมาย</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-slate-900 tracking-tight">2,961</span>
            <span className="text-[11px] text-slate-500">ร้าน</span>
          </div>
          {/* Minimalist Progress Bar */}
          <div className="mt-3 space-y-1">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-slate-900 h-1.5 rounded-full" style={{ width: '96.5%' }}></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>สำเร็จ 2,858 ร้าน</span>
              <span className="font-semibold text-slate-700">96.5%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Revenue */}
        <div className="tms-card p-5 hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-500">ยอดขายรวมวันนี้</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-slate-900 tracking-tight">฿568,000</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>สด: <strong className="text-slate-700">฿320,000</strong></span>
            <span>โอน: <strong className="text-slate-700">฿248,000</strong></span>
          </div>
        </div>

        {/* Card 4: Alerts */}
        <div className="tms-card p-5 hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-500">รายการต้องติดตาม</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-slate-900 tracking-tight">103</span>
            <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
              ต้องตรวจสอบ
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>ค้างโอน: <strong className="text-slate-700">2 รายการ</strong></span>
            <span>Off-site: <strong className="text-slate-700">101 ร้าน</strong></span>
          </div>
        </div>
      </div>

      {/* Main Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Live Releases Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="tms-card p-6 space-y-4">
            {/* Table Header & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900 tracking-tight">
                  รายการปฏิบัติงานล่าสุด
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  รายการใบปล่อยรถ พนักงานขับรถ และสถานะส่งตรวจฝั่งบัญชี
                </p>
              </div>

              {/* Minimal Filter Tabs */}
              <div className="flex bg-slate-100/70 p-1 rounded-lg gap-1 text-xs">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeTab === 'all'
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ทั้งหมด
                </button>
                <button
                  onClick={() => setActiveTab('running')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeTab === 'running'
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  กำลังวิ่งงาน
                </button>
                <button
                  onClick={() => setActiveTab('returned')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeTab === 'returned'
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  คืนรถแล้ว
                </button>
              </div>
            </div>

            {/* Minimalist White Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium uppercase text-[10px] tracking-wider">
                    <th className="pb-3">รหัสใบปล่อยรถ</th>
                    <th className="pb-3">ทะเบียนรถ</th>
                    <th className="pb-3">พนักงานขับรถ</th>
                    <th className="pb-3">ความคืบหน้า</th>
                    <th className="pb-3">ยอดรวม</th>
                    <th className="pb-3">สถานะบัญชี</th>
                    <th className="pb-3 text-right">รายละเอียด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {recentOperations
                    .filter((item) => {
                      if (activeTab === 'running') return !item.isReturned;
                      if (activeTab === 'returned') return item.isReturned;
                      return true;
                    })
                    .map((op) => (
                      <tr key={op.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 font-semibold text-slate-900">{op.id}</td>
                        <td className="py-3.5">
                          <span className="bg-slate-100 text-slate-800 font-medium px-2 py-0.5 rounded-lg border border-slate-200/60 text-[11px]">
                            {op.carPlate}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <div className="font-medium text-slate-800">{op.driver}</div>
                          <div className="text-[10px] text-slate-400">{op.phone}</div>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-slate-900 h-1.5 rounded-full"
                                style={{ width: `${(op.storesDone / op.storesTotal) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-[11px] font-medium text-slate-600">
                              {op.storesDone}/{op.storesTotal}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 font-semibold text-slate-900">{op.amount}</td>
                        <td className="py-3.5">
                          <span
                            className={`inline-block text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                              op.accounting === 'อนุมัติแล้ว'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                            }`}
                          >
                            {op.accounting}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <Link
                            to="/releases"
                            className="text-slate-400 hover:text-slate-900 inline-flex items-center p-1"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 text-right">
              <Link
                to="/releases"
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1 hover:underline"
              >
                ดูรายการใบปล่อยรถทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Driver Leaderboard & Vehicle Fleet */}
        <div className="space-y-4">
          {/* Driver Progress Card */}
          <div className="tms-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" />
                ประสิทธิภาพรายคนขับ
              </h3>
              <span className="text-[11px] text-slate-400">วันนี้</span>
            </div>

            <div className="space-y-3">
              {driversLeaderboard.map((d, index) => (
                <div key={index} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-semibold flex items-center justify-center text-xs">
                      {d.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        {d.name}
                        {d.active && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="กำลังวิ่งงาน"></span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ส่งเสร็จ {d.completed}/{d.total} ร้าน
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-slate-900">{d.revenue}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="tms-card p-5 bg-slate-900 text-white space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>สรุปสถานะฝั่งบัญชี</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              ไม่มีใบปล่อยรถตกค้างฝั่งบัญชีที่ต้องอนุมัติด่วน ระบบพร้อมสำหรับการบันทึกปิดรอบประจำวัน
            </p>
            <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
              <span>สถานะ: <strong className="text-emerald-400 font-normal">ปกติ</strong></span>
              <Link to="/reports" className="text-white underline hover:text-slate-300">
                ดูรายงานบัญชี
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
