import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { ConfirmModal } from "../../components/ConfirmModal";
import { PaginationControl } from "../../components/PaginationControl";
import { AnimatedDrawer } from "../../components/AnimatedDrawer";
import { MasterSubNav } from "../../components/MasterSubNav";
import {
  CreditCard,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
} from "lucide-react";

interface PaymentData {
  payment_id: number;
  payment_name: string;
}

export const PaymentsPage: React.FC = () => {
  const { showSuccess, showError } = useToast();

  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Pagination
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Drawer & Form
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentData | null>(null);
  const [formPaymentName, setFormPaymentName] = useState("");

  // Delete Modal
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentData | null>(null);

  const inputCls =
    "w-full border border-slate-200 rounded-lg p-2 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400";

  const renderField = (label: string, required: boolean, inputEl: React.ReactNode) => (
    <div>
      <label className="block text-slate-700 font-semibold mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {inputEl}
    </div>
  );

  const isPaymentDirty = useMemo(() => {
    if (!editingPayment) return !!formPaymentName;
    return formPaymentName !== editingPayment.payment_name;
  }, [editingPayment, formPaymentName]);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/master/payments");
      if (res.data.success) setPayments(res.data.payments || []);
    } catch (err) {
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const filteredPayments = useMemo(() => {
    const s = search.toLowerCase();
    return payments.filter((pm) => pm.payment_name.toLowerCase().includes(s));
  }, [payments, search]);

  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  }, [filteredPayments, currentPage, itemsPerPage]);

  const handleOpenAddPayment = () => {
    setEditingPayment(null);
    setFormPaymentName("");
    setIsDrawerOpen(true);
  };

  const handleOpenEditPayment = (pm: PaymentData) => {
    setEditingPayment(pm);
    setFormPaymentName(pm.payment_name);
    setIsDrawerOpen(true);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPaymentName) {
      showError("กรุณากรอกชื่อประเภทการชำระเงิน");
      return;
    }

    try {
      if (editingPayment) {
        await api.put(`/master/payments/${editingPayment.payment_id}`, {
          payment_name: formPaymentName,
        });
        showSuccess("อัปเดตประเภทการชำระเงินเรียบร้อยแล้ว!");
      } else {
        await api.post("/master/payments", { payment_name: formPaymentName });
        showSuccess("เพิ่มประเภทการชำระเงินใหม่สำเร็จ!");
      }
      setIsDrawerOpen(false);
      fetchPayments();
    } catch (err: any) {
      showError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกประเภทการชำระเงิน");
    }
  };

  const handleConfirmDeletePayment = async () => {
    if (!paymentToDelete) return;
    try {
      await api.delete(`/master/payments/${paymentToDelete.payment_id}`);
      showSuccess(`ลบประเภทการชำระเงิน "${paymentToDelete.payment_name}" เรียบร้อย`);
      fetchPayments();
    } catch (err: any) {
      showError(err?.response?.data?.message || "ไม่สามารถลบประเภทการชำระเงินนี้ได้");
    } finally {
      setPaymentToDelete(null);
    }
  };

  return (
    <div className="w-full space-y-4 font-sans text-xs pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-slate-800" />
            จัดการการชำระเงิน (Payment Methods Management)
          </h1>
          <p className="text-[11px] text-slate-500">
            บริหารจัดการประเภทช่องทางการชำระเงิน (เช่น เงินสด, โอนเงิน, เครดิต)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPayments}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-1.5 rounded-lg font-medium flex items-center gap-1 shadow-2xs"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 text-slate-700 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleOpenAddPayment}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> <span>เพิ่มประเภทชำระเงิน</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation */}
      <MasterSubNav />

      {/* Search Bar */}
      <div className="tms-card p-3 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อประเภทการชำระเงิน..."
            className="w-full bg-slate-50 border border-slate-200/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="tms-card overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
                <th className="py-1.5 px-3 text-center w-16">ID</th>
                <th className="py-1.5 px-3">ชื่อประเภทการชำระเงิน</th>
                <th className="py-1.5 px-3 text-center">วันที่สร้าง</th>
                <th className="py-1.5 px-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-slate-800 whitespace-nowrap">
              {paginatedPayments.map((pm) => (
                <tr key={pm.payment_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-1 px-3 text-center text-slate-400 font-mono font-bold text-[11px]">{pm.payment_id}</td>
                  <td className="py-1 px-3 font-bold text-slate-900 text-[11px]">{pm.payment_name}</td>
                  <td className="py-1 px-3 text-center text-slate-500 font-mono text-[11px]">
                    {(pm as any).created_at ? new Date((pm as any).created_at).toLocaleDateString("th-TH") : "-"}
                  </td>
                  <td className="py-1 px-3 text-right space-x-1">
                    <button onClick={() => handleOpenEditPayment(pm)} className="p-0.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100" title="แก้ไข">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setPaymentToDelete(pm)} className="p-0.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50" title="ลบ">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr><td colSpan={4} className="py-6 text-center text-slate-400">ยังไม่มีข้อมูลประเภทการชำระเงิน</td></tr>
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

      {/* Payment Drawer */}
      <AnimatedDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingPayment ? "แก้ไขประเภทการชำระเงิน" : "เพิ่มประเภทการชำระเงินใหม่"}
        formId="payment-form"
        onSubmit={handleSavePayment}
        submitLabel={editingPayment ? "บันทึกการแก้ไข" : "บันทึกสร้างประเภทชำระเงิน"}
        isDirty={isPaymentDirty}
      >
        {renderField("ชื่อประเภทการชำระเงิน *", true,
          <input type="text" value={formPaymentName} onChange={(e) => setFormPaymentName(e.target.value)} placeholder="เช่น เงินสด (Cash), เงินโอน (Transfer)" className={inputCls} required />
        )}
      </AnimatedDrawer>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!paymentToDelete}
        title="ยืนยันการลบประเภทการชำระเงิน"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบประเภทการชำระเงิน "${paymentToDelete?.payment_name}"?`}
        confirmText="ลบข้อมูล"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDeletePayment}
        onCancel={() => setPaymentToDelete(null)}
      />
    </div>
  );
};

export default PaymentsPage;
