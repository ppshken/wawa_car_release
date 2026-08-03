import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, X, ChevronDown } from "lucide-react";

export interface SearchableSelectOption {
  value: string | number;
  label: string;
  badge?: string;
  colorDot?: string;
  subLabel?: string;
  disabled?: boolean;
}

export interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string | number;
  onChange: (value: string | number, option?: SearchableSelectOption) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  emptyText?: string;
  hasError?: boolean;
  renderSelected?: (option: SearchableSelectOption) => React.ReactNode;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "-- เลือกรายการ --",
  searchPlaceholder = "พิมพ์ค้นหา...",
  label,
  required = false,
  disabled = false,
  className = "",
  buttonClassName = "",
  dropdownClassName = "",
  emptyText = "ไม่พบรายการที่ตรงกัน",
  hasError = false,
  renderSelected,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Currently selected option object
  const selectedOption = useMemo(() => {
    if (value === undefined || value === null || value === "") return null;
    return options.find((o) => String(o.value) === String(value)) || null;
  }, [options, value]);

  // Filtered options based on search text
  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.trim().toLowerCase();
    return options.filter((o) => {
      const valStr = String(o.value || "").toLowerCase();
      const labelStr = (o.label || "").toLowerCase();
      const badgeStr = (o.badge || "").toLowerCase();
      const subLabelStr = (o.subLabel || "").toLowerCase();
      return (
        labelStr.includes(q) ||
        badgeStr.includes(q) ||
        subLabelStr.includes(q) ||
        valStr.includes(q)
      );
    });
  }, [options, search]);

  const handleSelect = (option: SearchableSelectOption) => {
    if (option.disabled) return;
    onChange(option.value, option);
    setIsOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearch("");
  };

  return (
    <div className={`relative ${isOpen ? "z-[9999]" : ""} ${label ? "space-y-1" : ""} ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
          <span>
            {label} {required && <span className="text-rose-500">*</span>}
          </span>
          <span className="text-[10px] text-slate-400 font-normal">
            {selectedOption ? "เลือกแล้ว" : `ทั้งหมด ${options.length} รายการ`}
          </span>
        </label>
      )}

      {/* Select Trigger Button */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full border text-xs flex items-center justify-between transition-all ${
          buttonClassName ? buttonClassName : "px-3 py-2 rounded-lg"
        } ${
          disabled
            ? "opacity-60 cursor-not-allowed border-slate-200 bg-slate-50"
            : isOpen
            ? "border-blue-500 ring-2 ring-blue-200 shadow-sm bg-white cursor-pointer"
            : hasError
            ? "border-2 border-rose-500 bg-rose-50/70 text-rose-900 shadow-xs cursor-pointer"
            : "border-slate-200 hover:border-slate-300 bg-slate-50 cursor-pointer"
        }`}
      >
        {selectedOption ? (
          <div className="flex items-center justify-between w-full min-w-0 pr-1">
            {renderSelected ? (
              renderSelected(selectedOption)
            ) : (
              <div className="truncate font-semibold text-slate-800 flex items-center gap-1.5">
                {selectedOption.colorDot && (
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: selectedOption.colorDot }}
                  />
                )}
                <span className="font-bold truncate">{selectedOption.label}</span>
                {selectedOption.badge && (
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                    {selectedOption.badge}
                  </span>
                )}
                {selectedOption.subLabel && (
                  <span className="text-[10px] text-slate-400 font-normal truncate">
                    ({selectedOption.subLabel})
                  </span>
                )}
              </div>
            )}
            {!disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-400 hover:text-rose-600 p-0.5 ml-1 shrink-0"
                title="ยกเลิกการเลือก"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <span className="text-slate-400 font-medium">{placeholder}</span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Custom Floating Dropdown Menu */}
      {isOpen && !disabled && (
        <div
          className={`absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-[9999] overflow-hidden flex flex-col max-h-72 animate-in fade-in duration-100 ${
            dropdownClassName ? dropdownClassName : "min-w-full min-w-[300px] max-w-md"
          }`}
        >
          {/* Sticky Search Header */}
          <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-medium shadow-2xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 px-1 flex justify-between">
              <span>
                ค้นพบ {filteredOptions.length} จาก {options.length} รายการ
              </span>
              {search && <span>คำค้น: "{search}"</span>}
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto flex-1 custom-scrollbar divide-y divide-slate-50">
            {filteredOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <div
                  key={String(opt.value)}
                  onClick={(e) => {
                    if (opt.disabled) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    handleSelect(opt);
                  }}
                  className={`p-2.5 transition-colors text-xs select-none ${
                    opt.disabled
                      ? "opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 pointer-events-none"
                      : isSelected
                      ? "bg-blue-50 text-blue-900 font-bold cursor-pointer"
                      : "hover:bg-slate-50 text-slate-700 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      {opt.colorDot && (
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: opt.colorDot }}
                        />
                      )}
                      <span className="font-semibold text-slate-900 truncate">
                        {opt.label}
                      </span>
                      {opt.badge && (
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {opt.subLabel && (
                        <span className="text-[10px] text-slate-400">
                          {opt.subLabel}
                        </span>
                      )}
                      {isSelected && (
                        <span className="text-[10px] text-blue-600 font-bold">
                          ✓ เลือกแล้ว
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredOptions.length === 0 && (
              <div className="p-6 text-center text-slate-400 text-xs">
                {emptyText} {search && `"${search}"`}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
