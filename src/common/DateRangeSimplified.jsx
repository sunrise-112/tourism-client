import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslation } from "react-i18next";

const DateRangePickerSimplified = ({
  setRangeSelect,
  dateRange,
  locale = "fr-MA",
  dateColumn = "created_at",
  onDateColumnChange,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selection, setSelection] = useState({
    startDate: dateRange?.startDate ? new Date(dateRange.startDate) : undefined,
    endDate: dateRange?.endDate ? new Date(dateRange.endDate) : undefined,
    key: "selection",
  });
  const [activePreset, setActivePreset] = useState(null);
  const [activeColumn, setActiveColumn] = useState(dateColumn);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ─── Presets ───────────────────────────────────────────────────────────────
  const buildPresets = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 6);
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 29);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    thisMonth.setHours(0, 0, 0, 0);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    lastMonth.setHours(0, 0, 0, 0);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    lastMonthEnd.setHours(0, 0, 0, 0);

    return [
      {
        label: t("dateRangePicker.presets.allTime"),
        range: { startDate: null, endDate: null },
      },
      {
        label: t("dateRangePicker.presets.today"),
        range: { startDate: today, endDate: today },
      },
      {
        label: t("dateRangePicker.presets.yesterday"),
        range: { startDate: yesterday, endDate: yesterday },
      },
      {
        label: t("dateRangePicker.presets.last7Days"),
        range: { startDate: last7Days, endDate: today },
      },
      {
        label: t("dateRangePicker.presets.last30Days"),
        range: { startDate: last30Days, endDate: today },
      },
      {
        label: t("dateRangePicker.presets.thisMonth"),
        range: { startDate: thisMonth, endDate: today },
      },
      {
        label: t("dateRangePicker.presets.lastMonth"),
        range: { startDate: lastMonth, endDate: lastMonthEnd },
      },
      { label: t("dateRangePicker.presets.customRange"), isCustom: true },
    ];
  };

  // ─── Formatters ────────────────────────────────────────────────────────────
  const formatDate = (date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const formatLocalDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const formatDisplayRange = () => {
    const { startDate, endDate } = selection;
    if (!startDate && !endDate) return t("dateRangePicker.placeholder");
    if (startDate && !endDate) return formatDate(startDate);
    if (startDate && endDate) {
      if (startDate.getTime() === endDate.getTime())
        return formatDate(startDate);
      return `${formatDate(startDate)} – ${formatDate(endDate)}`;
    }
    return t("dateRangePicker.placeholder");
  };

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handlePresetClick = (preset) => {
    if (preset.isCustom) {
      setActivePreset(t("dateRangePicker.presets.customRange"));
      return;
    }
    setSelection({
      startDate: preset.range.startDate,
      endDate: preset.range.endDate,
      key: "selection",
    });
    setActivePreset(preset.label);
  };

  const handleColumnToggle = (col) => {
    setActiveColumn(col);
    onDateColumnChange?.(col);
  };

  const handleApply = () => {
    const result = {
      startDate: selection.startDate
        ? formatLocalDate(selection.startDate)
        : undefined,
      endDate: selection.endDate
        ? formatLocalDate(selection.endDate)
        : undefined,
      dateColumn: activeColumn,
    };
    setRangeSelect(result);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setSelection({ startDate: null, endDate: null, key: "selection" });
    setActivePreset(null);
    setIsOpen(false);
  };

  const hasSelection = !!(selection.startDate || selection.endDate);

  // ─── Calendar ─────────────────────────────────────────────────────────────
  const CustomDateRange = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [hoverDate, setHoverDate] = useState(null);

    const generateCalendar = (monthDate) => {
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();
      const firstDayOfWeek = new Date(year, month, 1).getDay();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return Array.from({ length: 42 }, (_, i) => {
        const date = new Date(year, month, i - firstDayOfWeek + 1);
        date.setHours(0, 0, 0, 0);
        const ts = date.getTime();

        const isInRange =
          selection.startDate &&
          selection.endDate &&
          ts > selection.startDate.getTime() &&
          ts < selection.endDate.getTime();

        const isHoverRange =
          selection.startDate &&
          !selection.endDate &&
          hoverDate &&
          ts > Math.min(selection.startDate.getTime(), hoverDate.getTime()) &&
          ts < Math.max(selection.startDate.getTime(), hoverDate.getTime());

        return {
          date,
          day: date.getDate(),
          isCurrentMonth:
            date.getMonth() === month && date.getFullYear() === year,
          isToday: ts === today.getTime(),
          isInRange: !!(isInRange || isHoverRange),
          isFuture: date > today,
          isStartDate: !!(
            selection.startDate && ts === selection.startDate.getTime()
          ),
          isEndDate: !!(
            selection.endDate && ts === selection.endDate.getTime()
          ),
        };
      });
    };

    const handleDateClick = (date) => {
      setActivePreset(t("dateRangePicker.presets.customRange"));
      if (!selection.startDate || (selection.startDate && selection.endDate)) {
        setSelection({ startDate: date, endDate: null, key: "selection" });
      } else if (selection.startDate && !selection.endDate) {
        date >= selection.startDate
          ? setSelection({ ...selection, endDate: date })
          : setSelection({ startDate: date, endDate: null, key: "selection" });
      }
    };

    const nextMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
    );

    const monthLabel = (d) =>
      new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
      }).format(d);

    const dayNames = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - d.getDay() + i);
      return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(d);
    });

    const renderMonth = (monthDate, showPrev, showNext) => {
      const days = generateCalendar(monthDate);
      return (
        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between mb-3'>
            {showPrev ? (
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1,
                    ),
                  )
                }
                className='w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors focus:outline-none'
              >
                <ChevronLeft className='w-4 h-4' />
              </button>
            ) : (
              <div className='w-7' />
            )}
            <span className='text-sm font-bold text-stone-700 capitalize'>
              {monthLabel(monthDate)}
            </span>
            {showNext ? (
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1,
                    ),
                  )
                }
                className='w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors focus:outline-none'
              >
                <ChevronRight className='w-4 h-4' />
              </button>
            ) : (
              <div className='w-7' />
            )}
          </div>

          <div className='grid grid-cols-7 mb-1'>
            {dayNames.map((name, i) => (
              <div
                key={i}
                className='text-center text-[10px] font-bold text-stone-400 uppercase tracking-wider py-1'
              >
                {name.slice(0, 2)}
              </div>
            ))}
          </div>

          <div className='grid grid-cols-7'>
            {days.map((day, i) => {
              const isSingle = day.isStartDate && day.isEndDate;
              return (
                <button
                  key={i}
                  onClick={() => !day.isFuture && handleDateClick(day.date)}
                  onMouseEnter={() => setHoverDate(day.date)}
                  onMouseLeave={() => setHoverDate(null)}
                  disabled={day.isFuture}
                  className={[
                    "relative h-8 w-full text-xs flex items-center justify-center transition-all duration-100 focus:outline-none select-none",
                    !day.isCurrentMonth ? "text-stone-300" : "text-stone-700",
                    day.isFuture
                      ? "opacity-30 cursor-not-allowed"
                      : "cursor-pointer",
                    day.isStartDate
                      ? `bg-amber-400 text-amber-900 font-bold shadow-sm ${isSingle ? "rounded-xl" : "rounded-l-full"}`
                      : "",
                    day.isEndDate && !isSingle
                      ? "bg-amber-400 text-amber-900 font-bold shadow-sm rounded-r-full"
                      : "",
                    day.isInRange && !day.isStartDate && !day.isEndDate
                      ? "bg-amber-50"
                      : "",
                    !day.isStartDate &&
                    !day.isEndDate &&
                    !day.isInRange &&
                    !day.isFuture &&
                    day.isCurrentMonth
                      ? "hover:bg-stone-100 rounded-lg"
                      : "",
                    day.isToday && !day.isStartDate && !day.isEndDate
                      ? "font-black ring-1 ring-amber-300 ring-offset-1 rounded-lg"
                      : day.isToday
                        ? "font-black"
                        : "font-medium",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {day.day}
                </button>
              );
            })}
          </div>
        </div>
      );
    };

    return (
      <div className='p-4 border-t border-stone-100'>
        <div className='flex flex-col sm:flex-row gap-5'>
          {renderMonth(currentMonth, true, false)}
          <div className='hidden sm:block w-px bg-stone-100 self-stretch' />
          {renderMonth(nextMonth, false, true)}
        </div>
      </div>
    );
  };

  const presets = buildPresets();

  return (
    <div
      className='relative w-full'
      ref={dropdownRef}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Trigger ─────────────────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={[
          "w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-sm transition-all duration-200 focus:outline-none",
          isOpen
            ? "border-amber-400 ring-2 ring-amber-100 bg-white"
            : "border-stone-200 bg-white hover:border-amber-300 hover:shadow-sm",
        ].join(" ")}
      >
        <div className='flex items-center gap-2.5 min-w-0'>
          <Calendar
            className={`w-4 h-4 shrink-0 transition-colors ${
              hasSelection ? "text-amber-500" : "text-stone-400"
            }`}
          />
          <span
            className={`truncate ${
              hasSelection ? "font-semibold text-stone-800" : "text-stone-400"
            }`}
          >
            {formatDisplayRange()}
          </span>
          {hasSelection && (
            <span className='shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200 uppercase tracking-wide'>
              {activeColumn === "created_at" ? "Created at" : "Booking Date"}
            </span>
          )}
        </div>
        {hasSelection && (
          <span
            role='button'
            onClick={(e) => {
              e.stopPropagation();
              handleCancel();
            }}
            className='shrink-0 w-5 h-5 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer'
          >
            <X className='w-3 h-3' />
          </span>
        )}
      </button>

      {/* ── Dropdown ────────────────────────────────────────────────────────── */}
      {isOpen && (
        <div className='absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl border border-stone-200 shadow-2xl shadow-stone-300/20 overflow-hidden w-full min-w-[300px] sm:min-w-[460px] lg:min-w-[740px] max-w-[95vw]'>
          <div className='flex flex-col lg:flex-row'>
            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <div className='lg:w-44 bg-stone-50 border-b lg:border-b-0 lg:border-r border-stone-100 shrink-0'>
              {/* Mobile: horizontal chips */}
              <div className='lg:hidden p-3 flex flex-wrap gap-1.5'>
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetClick(preset)}
                    className={[
                      "px-2.5 py-1 text-xs rounded-lg border font-medium transition-colors focus:outline-none whitespace-nowrap",
                      activePreset === preset.label
                        ? "bg-amber-400 text-amber-900 border-amber-400 shadow-sm shadow-amber-200"
                        : "border-stone-200 text-stone-500 hover:bg-white hover:border-stone-300 hover:text-stone-700",
                    ].join(" ")}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Desktop: vertical list */}
              <div className='hidden lg:block p-3'>
                <p className='text-[10px] font-black uppercase tracking-widest text-stone-400 px-2 mb-3'>
                  {t("dateRangePicker.sidebar.quickRanges")}
                </p>
                <div className='space-y-0.5'>
                  {presets.map((preset) => (
                    <React.Fragment key={preset.label}>
                      {preset.isCustom && (
                        <div className='my-2 border-t border-stone-200' />
                      )}
                      <button
                        onClick={() => handlePresetClick(preset)}
                        className={[
                          "w-full text-left px-3 py-2 text-xs rounded-xl font-medium transition-colors focus:outline-none",
                          activePreset === preset.label
                            ? "bg-amber-400 text-amber-900 shadow-sm shadow-amber-200"
                            : "text-stone-500 hover:bg-white hover:text-stone-800 hover:shadow-sm",
                        ].join(" ")}
                      >
                        {preset.label}
                      </button>
                    </React.Fragment>
                  ))}
                </div>

                {/* ── Column toggle (desktop sidebar) ── */}
                <div className='mt-4 pt-4 border-t border-stone-200'>
                  <p className='text-[10px] font-black uppercase tracking-widest text-stone-400 px-2 mb-2'>
                    Filter by
                  </p>
                  <div className='flex flex-col gap-1'>
                    {["created_at", "booking_date"].map((col) => (
                      <button
                        key={col}
                        onClick={() => handleColumnToggle(col)}
                        className={[
                          "w-full text-left px-3 py-2 text-xs rounded-xl font-medium transition-colors focus:outline-none flex items-center gap-2",
                          activeColumn === col
                            ? "bg-amber-400 text-amber-900 shadow-sm shadow-amber-200"
                            : "text-stone-500 hover:bg-white hover:text-stone-800 hover:shadow-sm",
                        ].join(" ")}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            activeColumn === col
                              ? "bg-amber-900"
                              : "bg-stone-300"
                          }`}
                        />
                        {col === "created_at"
                          ? "Creation date"
                          : "Booking date"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Calendar + footer ────────────────────────────────────────── */}
            <div className='flex-1 min-w-0'>
              {/* Section label + mobile column toggle */}
              <div className='flex items-center justify-between px-4 pt-4 pb-0'>
                <p className='text-[10px] font-black uppercase tracking-widest text-stone-400'>
                  {t("dateRangePicker.sections.primaryRange")}
                </p>
                {/* Mobile column toggle pill */}
                <div className='flex lg:hidden items-center gap-1 bg-stone-100 rounded-lg p-0.5'>
                  {["created_at", "booking_date"].map((col) => (
                    <button
                      key={col}
                      onClick={() => handleColumnToggle(col)}
                      className={[
                        "px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors focus:outline-none whitespace-nowrap",
                        activeColumn === col
                          ? "bg-amber-400 text-amber-900 shadow-sm"
                          : "text-stone-500 hover:text-stone-700",
                      ].join(" ")}
                    >
                      {col === "created_at" ? "Created" : "Booking"}
                    </button>
                  ))}
                </div>
              </div>

              <CustomDateRange />

              {/* ── Footer ──────────────────────────────────────────────────── */}
              <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 border-t border-stone-100 bg-stone-50'>
                {/* Summary */}
                <div className='text-xs text-stone-500 order-2 sm:order-1 space-y-1'>
                  {selection.startDate && selection.endDate ? (
                    <div className='flex items-center gap-1.5'>
                      <span className='w-2 h-2 rounded-full bg-amber-400 shrink-0' />
                      <span>
                        <span className='font-bold text-stone-700'>
                          {activeColumn === "created_at"
                            ? "Creation date"
                            : "Booking date"}{" "}
                        </span>
                        {formatDate(selection.startDate)} –{" "}
                        {formatDate(selection.endDate)}
                      </span>
                    </div>
                  ) : (
                    <span className='italic text-stone-400'>
                      {t("dateRangePicker.placeholder")}
                    </span>
                  )}
                </div>

                {/* Buttons */}
                <div className='flex gap-2 w-full sm:w-auto order-1 sm:order-2 shrink-0'>
                  <button
                    onClick={handleCancel}
                    className='flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 hover:border-stone-300 transition-colors focus:outline-none'
                  >
                    {t("dateRangePicker.footer.cancel")}
                  </button>
                  <button
                    onClick={handleApply}
                    className='flex-1 sm:flex-none px-5 py-2 text-xs font-bold rounded-xl bg-amber-400 text-amber-900 hover:bg-amber-300 transition-colors shadow-sm shadow-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-200'
                  >
                    {t("dateRangePicker.footer.apply")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePickerSimplified;
