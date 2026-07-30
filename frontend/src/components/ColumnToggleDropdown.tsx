import React, { useState, useRef, useEffect } from 'react';
import { Columns, RotateCcw } from 'lucide-react';

export interface ColumnItem {
  id: string;
  label: string;
}

interface ColumnToggleDropdownProps {
  columns: ColumnItem[];
  visibleColumns: Record<string, boolean>;
  onChange: (updated: Record<string, boolean>) => void;
}

export const ColumnToggleDropdown: React.FC<ColumnToggleDropdownProps> = ({
  columns,
  visibleColumns,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleColumn = (id: string) => {
    const updated = { ...visibleColumns, [id]: !visibleColumns[id] };
    onChange(updated);
  };

  const showAll = () => {
    const updated: Record<string, boolean> = {};
    columns.forEach((col) => (updated[col.id] = true));
    onChange(updated);
  };

  const resetDefault = () => {
    const updated: Record<string, boolean> = {};
    columns.forEach((col) => (updated[col.id] = true));
    onChange(updated);
  };

  const hiddenCount = columns.filter((col) => visibleColumns[col.id] === false).length;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium text-xs shadow-2xs flex items-center gap-1.5 transition-colors"
        title="ปรับแต่งแสดง/ซ่อนคอลัมน์ตาราง"
      >
        <Columns className="w-3.5 h-3.5 text-slate-500" />
        <span>คอลัมน์</span>
        {hiddenCount > 0 && (
          <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
            -{hiddenCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-1.5 w-56 rounded-xl shadow-lg bg-white border border-slate-200 ring-1 ring-black/5 z-50 p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Columns className="w-3.5 h-3.5 text-slate-600" />
              การแสดงผลคอลัมน์
            </span>
            <button
              onClick={showAll}
              className="text-[10px] text-blue-600 hover:underline font-medium"
            >
              แสดงทั้งหมด
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 py-1">
            {columns.map((col) => {
              const isChecked = visibleColumns[col.id] !== false;
              return (
                <label
                  key={col.id}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleColumn(col.id)}
                    className="w-3.5 h-3.5 rounded text-slate-900 focus:ring-slate-900 border-slate-300 cursor-pointer"
                  />
                  <span className={isChecked ? 'font-medium text-slate-900' : 'text-slate-400 line-through'}>
                    {col.label}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
            <span>แสดง {columns.length - hiddenCount} จาก {columns.length} คอลัมน์</span>
            <button
              onClick={resetDefault}
              className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              รีเซ็ต
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
