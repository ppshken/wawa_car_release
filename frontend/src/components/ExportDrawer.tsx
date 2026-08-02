import React, { useState, useEffect } from "react";
import { AnimatedDrawer } from "./AnimatedDrawer";
import { Download, FileSpreadsheet, FileText, CheckSquare, Square, RefreshCw } from "lucide-react";
import * as XLSX from "xlsx";

export interface ExportColumnDef {
  id: string;
  label: string;
  defaultSelected?: boolean;
}

export interface ExportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  columns: ExportColumnDef[];
  data: any[];
  getValue: (item: any, columnId: string) => string | number;
  fileNamePrefix?: string;
}

export const ExportDrawer: React.FC<ExportDrawerProps> = ({
  isOpen,
  onClose,
  title = "ส่งออกข้อมูล (Export Data)",
  columns,
  data,
  getValue,
  fileNamePrefix = "Export",
}) => {
  const [exportType, setExportType] = useState<"excel" | "pdf">("excel");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [exporting, setExporting] = useState<boolean>(false);

  // Initialize selected columns whenever columns change or modal opens
  useEffect(() => {
    if (isOpen && columns.length > 0) {
      const initial = columns
        .filter((col) => col.defaultSelected !== false)
        .map((col) => col.id);
      setSelectedColumns(initial.length > 0 ? initial : columns.map((c) => c.id));
    }
  }, [isOpen, columns]);

  const handleToggleColumn = (colId: string) => {
    setSelectedColumns((prev) =>
      prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId]
    );
  };

  const handleSelectAll = () => {
    setSelectedColumns(columns.map((c) => c.id));
  };

  const handleDeselectAll = () => {
    setSelectedColumns([]);
  };

  const handleExport = async () => {
    if (selectedColumns.length === 0) {
      alert("กรุณาเลือกอย่างน้อย 1 คอลัมน์ที่ต้องการส่งออกข้อมูล");
      return;
    }

    setExporting(true);
    try {
      const activeColumns = columns.filter((c) => selectedColumns.includes(c.id));
      const todayStr = new Date().toISOString().slice(0, 10);

      if (exportType === "excel") {
        // Prepare rows for Excel
        const exportRows = data.map((item, index) => {
          const rowObj: Record<string, any> = { "ลำดับ": index + 1 };
          activeColumns.forEach((col) => {
            rowObj[col.label] = getValue(item, col.id) ?? "-";
          });
          return rowObj;
        });

        const worksheet = XLSX.utils.json_to_sheet(exportRows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data_Report");
        XLSX.writeFile(workbook, `${fileNamePrefix}_${todayStr}.xlsx`);
      } else {
        // Generate PDF using Print Window layout
        const printWin = window.open("", "_blank");
        if (printWin) {
          const tableHeadersHtml = activeColumns
            .map(
              (col) =>
                `<th style="padding: 6px 8px; border: 1px solid #cbd5e1; background-color: #f1f5f9; text-align: left; font-size: 11px;">${col.label}</th>`
            )
            .join("");

          const tableRowsHtml = data
            .map((item, idx) => {
              const cells = activeColumns
                .map(
                  (col) =>
                    `<td style="padding: 6px 8px; border: 1px solid #e2e8f0; font-size: 10px;">${getValue(
                      item,
                      col.id
                    ) ?? "-"}</td>`
                )
                .join("");
              return `<tr style="background-color: ${
                idx % 2 === 0 ? "#ffffff" : "#f8fafc"
              };"><td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px; font-weight: bold;">${
                idx + 1
              }</td>${cells}</tr>`;
            })
            .join("");

          const htmlContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8" />
                <title>${title}</title>
                <style>
                  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
                  body { font-family: 'Sarabun', sans-serif; margin: 15px; color: #0f172a; }
                  .header { text-align: center; margin-bottom: 15px; border-bottom: 2px solid #0f172a; padding-bottom: 8px; }
                  .title { font-size: 16px; font-weight: bold; margin: 0; color: #0f172a; }
                  .subtitle { font-size: 10px; color: #64748b; margin-top: 4px; }
                  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                  th, td { word-break: break-word; }
                  @media print {
                    @page { size: A4 landscape; margin: 8mm; }
                  }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1 class="title">${title}</h1>
                  <p class="subtitle">วันที่ออกเอกสาร: ${new Date().toLocaleString(
                    "th-TH"
                  )} | จำนวนข้อมูลทั้งหมด ${data.length} รายการ</p>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th style="padding: 6px 8px; border: 1px solid #cbd5e1; background-color: #f1f5f9; text-align: center; font-size: 11px; width: 35px;">#</th>
                      ${tableHeadersHtml}
                    </tr>
                  </thead>
                  <tbody>
                    ${tableRowsHtml}
                  </tbody>
                </table>
                <script>
                  window.onload = function() { window.print(); };
                </script>
              </body>
            </html>
          `;

          printWin.document.write(htmlContent);
          printWin.document.close();
        }
      }

      onClose();
    } catch (err: any) {
      console.error("Export error:", err);
      alert("เกิดข้อผิดพลาดในการส่งออกข้อมูล: " + (err.message || err));
    } finally {
      setExporting(false);
    }
  };

  return (
    <AnimatedDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidthClass="max-w-md"
      formId="export-form"
      onSubmit={(e) => {
        e.preventDefault();
        handleExport();
      }}
      submitLabel={exporting ? "กำลังสร้างไฟล์..." : "ส่งออกข้อมูล (Export)"}
    >
      <form id="export-form" onSubmit={(e) => { e.preventDefault(); handleExport(); }} className="space-y-4 text-xs">
        {/* Data count badge */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
          <span className="text-slate-600 font-medium text-[11px]">จำนวนรายการที่จะส่งออก:</span>
          <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs">
            {data.length} รายการ
          </span>
        </div>

        {/* Export Type Option Cards */}
        <div>
          <label className="block font-bold text-slate-800 mb-1.5">
            รูปแบบไฟล์ที่ต้องการส่งออก (Export Format) <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setExportType("excel")}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                exportType === "excel"
                  ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm ring-1 ring-emerald-500"
                  : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
              }`}
            >
              <FileSpreadsheet className={`w-6 h-6 ${exportType === "excel" ? "text-emerald-600" : "text-slate-400"}`} />
              <div className="font-bold text-xs">Excel (.xlsx)</div>
              <div className="text-[10px] opacity-75">ตารางคำนวณสเปรดชีต</div>
            </button>

            <button
              type="button"
              onClick={() => setExportType("pdf")}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                exportType === "pdf"
                  ? "bg-rose-50 border-rose-500 text-rose-800 shadow-sm ring-1 ring-rose-500"
                  : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
              }`}
            >
              <FileText className={`w-6 h-6 ${exportType === "pdf" ? "text-rose-600" : "text-slate-400"}`} />
              <div className="font-bold text-xs">PDF (.pdf)</div>
              <div className="text-[10px] opacity-75">เอกสารพิมพ์พร้อมพิมพ์</div>
            </button>
          </div>
        </div>

        {/* Select Columns Section */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-bold text-slate-800 text-xs">
              คอลัมน์ที่ต้องการส่งออก ({selectedColumns.length}/{columns.length})
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                เลือกทั้งหมด
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="text-[10px] font-semibold text-slate-500 hover:text-slate-700 hover:underline"
              >
                ล้างทั้งหมด
              </button>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 max-h-60 overflow-y-auto custom-scrollbar space-y-1">
            {columns.map((col) => {
              const isChecked = selectedColumns.includes(col.id);
              return (
                <label
                  key={col.id}
                  onClick={() => handleToggleColumn(col.id)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border cursor-pointer select-none transition-all ${
                    isChecked
                      ? "bg-white border-blue-200 text-blue-900 font-semibold shadow-2xs"
                      : "bg-transparent border-transparent text-slate-600 hover:bg-white/60"
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="text-xs">{col.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </form>
    </AnimatedDrawer>
  );
};
