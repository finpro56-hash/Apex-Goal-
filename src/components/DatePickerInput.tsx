import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerInputProps {
  value: string;
  onChange: (dateStr: string) => void;
  label?: string;
  placeholder?: string;
  showQuickPresets?: boolean;
  minDate?: string;
}

// Normalizes any incoming date string strictly to YYYY-MM-DD (ISO) format
function normalizeToIsoDate(val: string): string {
  if (!val) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    return val;
  }
  try {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
  } catch {
    // ignore
  }
  return '';
}

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DatePickerInput: React.FC<DatePickerInputProps> = ({
  value,
  onChange,
  label = 'Target Date (Optional)',
  placeholder = 'Select target date from calendar...',
  showQuickPresets = true,
  minDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isoValue = normalizeToIsoDate(value);

  // Initialize view month based on existing value or today
  const [viewMonth, setViewMonth] = useState<Date>(() => {
    if (isoValue) {
      const [y, m] = isoValue.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date();
  });

  // When value changes from outside, sync the view month
  useEffect(() => {
    if (isoValue) {
      const [y, m] = isoValue.split('-').map(Number);
      setViewMonth(new Date(y, m - 1, 1));
    }
  }, [isoValue]);

  // Click outside to close calendar popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Calendar calculations
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth(); // 0 to 11

  const monthName = viewMonth.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const effectiveMinDate = minDate || todayStr;

  // Prevent navigating to months prior to current month
  const isPrevMonthDisabled =
    year < today.getFullYear() ||
    (year === today.getFullYear() && month <= today.getMonth());

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPrevMonthDisabled) return;
    setViewMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewMonth(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (formatted < effectiveMinDate) return;
    onChange(formatted);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(todayStr);
    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setIsOpen(false);
  };

  // Quick preset adder (e.g. +1 Month, +3 Months, +6 Months, +1 Year)
  const applyPreset = (monthsToAdd: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthsToAdd);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const target = `${yyyy}-${mm}-${dd}`;
    onChange(target);
    setViewMonth(new Date(yyyy, d.getMonth(), 1));
    setIsOpen(false);
  };

  // Format date for display in the trigger button
  const formatDisplayDate = (val: string) => {
    if (!val) return null;
    try {
      const parts = val.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const dateObj = new Date(y, m, d);
        return dateObj.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch {
      // fallback
    }
    return val;
  };

  return (
    <div ref={containerRef} className="relative space-y-1.5 w-full">
      {label && (
        <label className="block text-xs font-medium text-zinc-300">
          {label}
        </label>
      )}

      {/* Trigger Button that opens in-app visual calendar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group w-full bg-zinc-900/90 hover:bg-zinc-900 border rounded-xl px-3.5 py-2.5 flex items-center justify-between text-left transition-all shadow-sm min-h-[44px] ${
          isOpen
            ? 'border-emerald-500 ring-2 ring-emerald-500/20'
            : 'border-zinc-800 hover:border-zinc-700'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Calendar className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300 transition-colors shrink-0" />
          {isoValue ? (
            <span className="text-xs font-medium text-white truncate">
              {formatDisplayDate(isoValue)}
            </span>
          ) : (
            <span className="text-xs text-zinc-500 truncate">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isoValue && (
            <span
              onClick={handleClear}
              className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Clear target date"
              role="button"
              aria-label="Clear target date"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}

          <span className="text-[11px] font-medium text-emerald-400 group-hover:text-emerald-300">
            {isOpen ? 'Close' : 'Pick'}
          </span>
        </div>
      </button>

      {/* Visual In-App Calendar Dropdown Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Calendar date picker"
          className="absolute left-0 right-0 top-full mt-2 z-50 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Calendar Header with Navigation */}
          <div className="flex items-center justify-between pb-1 border-b border-zinc-900">
            <span className="text-xs font-bold text-white capitalize font-sans">
              {monthName}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                disabled={isPrevMonthDisabled}
                className={`p-1.5 rounded-lg border transition ${
                  isPrevMonthDisabled
                    ? 'opacity-25 cursor-not-allowed bg-zinc-950 text-zinc-600 border-zinc-900 pointer-events-none'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800'
                }`}
                aria-label="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition"
                aria-label="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {DAYS_OF_WEEK.map((d) => (
              <span
                key={d}
                className="text-[11px] font-semibold text-zinc-500 py-1"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Blank padding days for alignment */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="h-8 w-8" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = dateStr === isoValue;
              const isCurrentDay = dateStr === todayStr;
              const isPast = dateStr < effectiveMinDate;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isPast}
                  onClick={() => !isPast && handleSelectDay(day)}
                  className={`h-8 w-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                    isPast
                      ? 'opacity-25 text-zinc-600 cursor-not-allowed pointer-events-none'
                      : isSelected
                      ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/30'
                      : isCurrentDay
                      ? 'border border-emerald-500/60 text-emerald-400 hover:bg-zinc-900'
                      : 'text-zinc-200 hover:bg-zinc-900 hover:text-white'
                  }`}
                  title={isPast ? 'Past dates cannot be selected' : undefined}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-emerald-400 hover:text-emerald-300 font-medium py-1 px-2 rounded-md hover:bg-zinc-900 transition"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="text-zinc-500 hover:text-zinc-300 font-medium py-1 px-2 rounded-md hover:bg-zinc-900 transition"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Rapid Horizon Offset Presets */}
      {showQuickPresets && (
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mr-1">
            Quick:
          </span>
          <button
            type="button"
            onClick={() => applyPreset(1)}
            className="px-2 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white transition-colors"
          >
            +1 Month
          </button>
          <button
            type="button"
            onClick={() => applyPreset(3)}
            className="px-2 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white transition-colors"
          >
            +3 Months
          </button>
          <button
            type="button"
            onClick={() => applyPreset(6)}
            className="px-2 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white transition-colors"
          >
            +6 Months
          </button>
          <button
            type="button"
            onClick={() => applyPreset(12)}
            className="px-2 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white transition-colors"
          >
            +1 Year
          </button>
        </div>
      )}
    </div>
  );
};
