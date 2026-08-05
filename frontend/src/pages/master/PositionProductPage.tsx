import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { ConfirmModal } from "../../components/ConfirmModal";
import { PaginationControl } from "../../components/PaginationControl";
import { AnimatedDrawer } from "../../components/AnimatedDrawer";
import { MasterSubNav } from "../../components/MasterSubNav";
import {
  Layers,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
} from "lucide-react";

interface PositionProductData {
  position_product_id: number;
  position_product_name: string;
  created_at?: string;
}

export const PositionProductPage: React.FC = () => {
  const { showSuccess, showError } = useToast();

  const [positions, setPositions] = useState<PositionProductData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Pagination
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Drawer & Form
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PositionProductData | null>(null);
  const [formName, setFormName] = useState("");

  // Delete Modal
  const [itemToDelete, setItemToDelete] = useState<PositionProductData | null>(null);

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

  const isDirty = useMemo(() => {
    if (!editingItem) return !!formName;
    return formName !== editingItem.position_product_name;
  }, [editingItem, formName]);

  const fetchPositions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/master/position-product");
      if (res.data.success) {
        setPositions(res.data.positions || res.data.items || []);
      }
    } catch (err: any) {
      console.error("Error fetching position products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const filteredPositions = useMemo(() => {
    const s = search.toLowerCase();
    return positions.filter((item) =>
      item.position_product_name.toLowerCase().includes(s)
    );
  }, [positions, search]);

  const paginatedPositions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPositions.slice(start, start + itemsPerPage);
  }, [filteredPositions, currentPage, itemsPerPage]);

  const handleOpenAddDrawer = () => {
    setEditingItem(null);
    setFormName("");
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (item: PositionProductData) => {
    setEditingItem(item);
    setFormName(item.position_product_name);
    setIsDrawerOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showError("กรุณากรอกชื่อตำแหน่งวางสินค้า");
      return;
    }

    try {
      const payload = {
        position_product_name: formName.trim(),
      };

      if (editingItem) {
        await api.put(`/master/position-product/${editingItem.position_product_id}`, payload);
        showSuccess("อัปเดตตำแหน่งวางสินค้าเรียบร้อยแล้ว");
      } else {
        await api.post("/master/position-product", payload);
        showSuccess("เพิ่มตำแหน่งวางสินค้าสำเร็จ");
      }

      setIsDrawerOpen(false);
      fetchPositions();
    } catch (err: any) {
      showError(err.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/master/position-product/${itemToDelete.position_product_id}`);
      showSuccess("ลบตำแหน่งวางสินค้าเรียบร้อยแล้ว");
      setItemToDelete(null);
      fetchPositions();
    } catch (err: any) {
      showError(err.response?.data?.message || "เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  return (
    <div className="space-y-4 max-w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>ตำแหน่งวางสินค้า</span>
          </h1>
          <p className="text-[11px] text-slate-500">
            จัดการมาสเตอร์ข้อมูลตำแหน่งจัดวางสินค้าสำหรับสายจัดส่งและร้านค้าจุดจัดส่ง
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPositions}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-1.5 rounded-lg font-medium flex items-center gap-1 shadow-2xs"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw
              className={`w-4 h-4 text-slate-700 ${loading ? "animate-spin" : ""}`}
            />
          </button>
          <button
            onClick={handleOpenAddDrawer}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />{" "}
            <span>เพิ่มตำแหน่งวางสินค้า</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation */}
      <MasterSubNav />

      {/* Filter & Search Bar */}
      <div className="tms-card p-3 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ค้นหาตำแหน่งวางสินค้า..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 w-full sm:w-auto justify-end">
          <span>พบ {filteredPositions.length} รายการ</span>
          <button
            onClick={fetchPositions}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Data */}
      <div className="tms-card overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-1.5 px-3 w-16 text-center">ID</th>
                <th className="py-1.5 px-3">ชื่อตำแหน่งวางสินค้า</th>
                <th className="py-1.5 px-3">วันที่สร้าง</th>
                <th className="py-1.5 px-3 w-28 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 whitespace-nowrap">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : paginatedPositions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    ไม่พบข้อมูลตำแหน่งวางสินค้า
                  </td>
                </tr>
              ) : (
                paginatedPositions.map((item) => (
                  <tr key={item.position_product_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-1 px-3 text-center font-mono font-bold text-slate-500 text-[11px]">
                      {item.position_product_id}
                    </td>
                    <td className="py-1 px-3 font-bold text-slate-900 text-[11px]">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[11px]">
                        {item.position_product_name}
                      </span>
                    </td>
                    <td className="py-1 px-3 text-slate-500 text-[11px]">
                      {item.created_at ? new Date(item.created_at).toLocaleString("th-TH") : "-"}
                    </td>
                    <td className="py-1 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditDrawer(item)}
                          className="p-0.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="แก้ไข"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setItemToDelete(item)}
                          className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="ลบ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <PaginationControl
          currentPage={currentPage}
          totalItems={filteredPositions.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Drawer Add / Edit */}
      <AnimatedDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingItem ? "แก้ไขตำแหน่งวางสินค้า" : "เพิ่มตำแหน่งวางสินค้าใหม่"}
        formId="position-product-form"
        onSubmit={handleSave}
        submitLabel={editingItem ? "บันทึกการแก้ไข" : "บันทึกข้อมูล"}
        isDirty={isDirty}
      >
        {renderField(
          "ชื่อตำแหน่งวางสินค้า",
          true,
          <input
            type="text"
            required
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="ระบุชื่อตำแหน่ง (เช่น E, A, R, B, C)"
            className={inputCls}
          />
        )}
      </AnimatedDrawer>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="ยืนยันการลบตำแหน่งวางสินค้า"
        message={`คุณต้องการลบตำแหน่งวางสินค้า "${itemToDelete?.position_product_name}" ใช่หรือไม่?`}
        confirmText="ลบข้อมูล"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
