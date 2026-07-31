import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface CustomDatePickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (dateStr: string) => void;
  label?: string; // e.g. "เลือกวันที่:"
  activeDates?: string[]; // Array of "YYYY-MM-DD" dates that have orders/routes
  onMonthChange?: (yearMonth: string) => void; // e.g. "2026-07"
  showActiveOrdersToggle?: boolean;
  className?: string;
  placeholder?: string;
}

const MONTH_NAMES_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_NAMES_EN = ["M", "T", "W", "T", "F", "S", "S"]; // Mon-Sun

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  label = "เลือกวันที่:",
  activeDates = [],
  onMonthChange,
  showActiveOrdersToggle = true,
  className = "",
  placeholder = "DD/MM/YYYY",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightActiveOrders, setHighlightActiveOrders] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parsed selected date (default to today if invalid)
  const parsedDate = useMemo(() => {
    if (!value) return new Date();
    const [y, m, d] = value.split("-").map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d);
  }, [value]);

  // Current view month & year in popover
  const [viewYear, setViewYear] = useState<number>(() => parsedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => parsedDate.getMonth()); // 0-11

  // Update view when value changes externally (if popover is closed)
  useEffect(() => {
    if (!isOpen && value) {
      const [y, m] = value.split("-").map(Number);
      if (y && m) {
        setViewYear(y);
        setViewMonth(m - 1);
      }
    }
  }, [value, isOpen]);

  // Notify parent on month change if listener provided
  useEffect(() => {
    if (onMonthChange) {
      const monthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
      onMonthChange(monthStr);
    }
  }, [viewYear, viewMonth, onMonthChange]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Format date to DD/MM/YYYY
  const formattedDisplayValue = useMemo(() => {
    if (!value) return "";
    const [y, m, d] = value.split("-");
    if (!y || !m || !d) return "";
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }, [value]);

  // Helper for prev/next month navigation
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;
    setViewYear(yyyy);
    setViewMonth(today.getMonth());
    onChange(todayStr);
    setIsOpen(false);
  };

  const handleSelectDay = (day: number, isCurrentMonth: boolean, offsetMonth = 0) => {
    let targetYear = viewYear;
    let targetMonth = viewMonth + offsetMonth;

    if (targetMonth < 0) {
      targetMonth = 11;
      targetYear -= 1;
    } else if (targetMonth > 11) {
      targetMonth = 0;
      targetYear += 1;
    }

    const yyyy = targetYear;
    const mm = String(targetMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  // Build calendar days matrix (Monday-first)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    // 0 = Sunday, 1 = Monday ... 6 = Saturday
    // We want Monday = 0, Tuesday = 1, ... Sunday = 6
    let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startingDayOfWeek < 0) startingDayOfWeek = 6; // Sunday becomes 6

    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{
      day: number;
      dateStr: string;
      isCurrentMonth: boolean;
      offsetMonth: number;
    }> = [];

    // Previous month padding
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      let pm = viewMonth - 1;
      let py = viewYear;
      if (pm < 0) {
        pm = 11;
        py -= 1;
      }
      const ds = `${py}-${String(pm + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, dateStr: ds, isCurrentMonth: false, offsetMonth: -1 });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, dateStr: ds, isCurrentMonth: true, offsetMonth: 0 });
    }

    // Next month padding to complete grid
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remainingCells; d++) {
      let nm = viewMonth + 1;
      let ny = viewYear;
      if (nm > 11) {
        nm = 0;
        ny += 1;
      }
      const ds = `${ny}-${String(nm + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, dateStr: ds, isCurrentMonth: false, offsetMonth: 1 });
    }

    return days;
  }, [viewYear, viewMonth]);

  const activeDatesSet = useMemo(() => new Set(activeDates), [activeDates]);

  // Today string for comparison
  const todayStr = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  }, []);

  return (
    <div className={`relative inline-flex items-center gap-2 ${isOpen ? "z-[99999]" : "z-10"} ${className}`} ref={containerRef}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 whitespace-nowrap cursor-pointer select-none" onClick={() => setIsOpen(!isOpen)}>
          {label}
        </label>
      )}

      {/* Input Display Box */}
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between gap-2 bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs text-slate-800 cursor-pointer shadow-2xs hover:border-slate-400 transition-colors select-none ${
            isOpen ? "ring-2 ring-blue-500/20 border-blue-500" : ""
          }`}
        >
          <span className="font-mono font-bold tracking-wide text-slate-900">
            {formattedDisplayValue || placeholder}
          </span>
          <div className="pl-1 text-slate-500">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-700" />
          </div>
        </div>

        {/* Popover Calendar Dropdown */}
        {isOpen && (
          <div className="absolute left-0 top-full mt-1 z-[99999] bg-white border border-slate-200 rounded-lg shadow-xl p-2.5 w-[265px]">
            {/* Header: Month & Year Selector */}
            <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-100">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="เดือนก่อนหน้า"
              >
                <ChevronLeft className="w-4 h-4 text-blue-600" />
              </button>

              <div className="flex items-center gap-1 font-bold text-xs text-slate-800">
                <select
                  value={viewMonth}
                  onChange={(e) => setViewMonth(Number(e.target.value))}
                  className="bg-transparent border-none font-bold text-slate-800 focus:outline-none cursor-pointer py-0.5 hover:bg-slate-100 rounded"
                >
                  {MONTH_NAMES_EN.map((mName, idx) => (
                    <option key={mName} value={idx}>
                      {mName}
                    </option>
                  ))}
                </select>
                <select
                  value={viewYear}
                  onChange={(e) => setViewYear(Number(e.target.value))}
                  className="bg-transparent border-none font-bold text-slate-800 focus:outline-none cursor-pointer py-0.5 hover:bg-slate-100 rounded"
                >
                  {Array.from({ length: 11 }, (_, i) => viewYear - 5 + i).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="เดือนถัดไป"
              >
                <ChevronRight className="w-4 h-4 text-blue-600" />
              </button>
            </div>

            {/* Weekdays Header Row */}
            <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-600 py-1.5 border-b border-slate-100">
              {WEEKDAY_NAMES_EN.map((wd, i) => (
                <span key={i}>{wd}</span>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 py-1.5 text-xs">
              {calendarDays.map(({ day, dateStr, isCurrentMonth, offsetMonth }) => {
                const isSelected = dateStr === value;
                const isToday = dateStr === todayStr;
                const hasOrders = activeDatesSet.has(dateStr);
                const isHighlightedOrder = highlightActiveOrders && hasOrders;

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => handleSelectDay(day, isCurrentMonth, offsetMonth)}
                    className={`h-7 w-full rounded flex flex-col items-center justify-center relative font-mono text-[11px] transition-all ${
                      !isCurrentMonth
                        ? "text-slate-300 hover:bg-slate-50"
                        : isSelected
                        ? "bg-white text-slate-900 font-extrabold border-2 border-slate-900 shadow-2xs z-10"
                        : isHighlightedOrder
                        ? "bg-blue-100/90 text-blue-900 font-bold hover:bg-blue-200 border border-blue-300/80"
                        : "text-slate-800 hover:bg-slate-100 font-medium"
                    } ${isToday && !isSelected ? "ring-1 ring-blue-500 text-blue-700 font-bold" : ""}`}
                  >
                    <span>{day}</span>
                    {/* Blue dot indicator for dates with orders */}
                    {hasOrders && !isHighlightedOrder && (
                      <span className="w-1 h-1 rounded-full bg-blue-600 absolute bottom-0.5"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer Options */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              {showActiveOrdersToggle && (
                <label className="flex items-center gap-1.5 text-[10px] text-slate-700 font-medium cursor-pointer select-none px-1">
                  <input
                    type="checkbox"
                    checked={highlightActiveOrders}
                    onChange={(e) => setHighlightActiveOrders(e.target.checked)}
                    className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>แสดงวันที่ที่มีออเดอร์</span>
                </label>
              )}

              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <button
                  type="button"
                  onClick={handleSelectToday}
                  className="text-blue-600 hover:text-blue-800 hover:underline font-semibold mx-auto transition-colors"
                >
                  Today
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
