"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format as formatDateFn } from "date-fns";

type DateFieldProps = {
  label?: string;
  value: string | null;
  onChange: (next: string | null) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  error?: string;
  className?: string;
};

const cx = (...classes: Array<string | false | undefined | null>) =>
  classes.filter(Boolean).join(" ");

const toDisplay = (iso?: string | null) => {
  if (!iso) return "";
  const date = parseISO(iso);
  if (!date) return "";
  return formatDateFn(date, "dd.MM.yyyy");
};

const parseISO = (iso?: string | null) => {
  if (!iso) return null;
  const date = new Date(`${iso}T00:00:00.000Z`);
  return isNaN(date.getTime()) ? null : date;
};

const clampToMidnight = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

const formatISO = (d: Date) => clampToMidnight(d).toISOString().slice(0, 10);

const isValidDateParts = (value: string, minDate?: Date, maxDate?: Date) => {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
  if (!match) return { ok: false, date: null };
  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    isNaN(date.getTime()) ||
    date.getUTCDate() !== day ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCFullYear() !== year
  ) {
    return { ok: false, date: null };
  }
  const minOk = minDate ? clampToMidnight(date) >= clampToMidnight(minDate) : true;
  const maxOk = maxDate ? clampToMidnight(date) <= clampToMidnight(maxDate) : true;
  if (!minOk || !maxOk) return { ok: false, date: null };
  return { ok: true, date };
};

const buildCalendar = (month: Date) => {
  const firstOfMonth = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1));
  const startDay = firstOfMonth.getUTCDay(); // 0-6
  const daysInMonth = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0)).getUTCDate();
  const weeks: Array<(number | null)[]> = [];
  let dayCounter = 1 - startDay;
  for (let w = 0; w < 6; w++) {
    const week: (number | null)[] = [];
    for (let d = 0; d < 7; d++, dayCounter++) {
      if (dayCounter < 1 || dayCounter > daysInMonth) {
        week.push(null);
      } else {
        week.push(dayCounter);
      }
    }
    weeks.push(week);
  }
  return weeks;
};

export const DateField: React.FC<DateFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = "DD.MM.YYYY",
  minDate,
  maxDate,
  disabled,
  error,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(toDisplay(value));
  const initialMonth = parseISO(value) ?? new Date();
  const [currentMonth, setCurrentMonth] = useState<Date>(initialMonth);

  useEffect(() => {
    setInputValue(toDisplay(value));
    setCurrentMonth(parseISO(value) ?? new Date());
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, "").slice(0, 8);
    let next = raw;
    if (raw.length > 4) next = `${raw.slice(0, 2)}.${raw.slice(2, 4)}.${raw.slice(4)}`;
    else if (raw.length > 2) next = `${raw.slice(0, 2)}.${raw.slice(2)}`;
    setInputValue(next);
  };

  const commitInput = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      onChange(null);
      return;
    }
    const { ok, date } = isValidDateParts(trimmed, minDate, maxDate);
    if (ok && date) {
      onChange(formatISO(date));
      setInputValue(formatDateFn(date, "dd.MM.yyyy"));
      setCurrentMonth(date);
      setOpen(false);
    }
  };

  const weeks = useMemo(() => buildCalendar(currentMonth), [currentMonth]);
  const selectedDate = parseISO(value);

  const selectDay = (day: number | null) => {
    if (!day) return;
    const date = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), day));
    const { ok } = isValidDateParts(formatDateFn(date, "dd.MM.yyyy"), minDate, maxDate);
    if (!ok) return;
    onChange(formatISO(date));
    setInputValue(formatDateFn(date, "dd.MM.yyyy"));
    setOpen(false);
  };

  const goMonth = (delta: number) => {
    const next = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + delta, 1));
    setCurrentMonth(next);
  };

  return (
    <div className={cx("space-y-1", className)} ref={containerRef}>
      {label && (
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      )}
      <div className="relative">
        <input
          value={inputValue}
          onChange={handleInputChange}
          onBlur={commitInput}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitInput();
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={cx(
            "h-11 w-full rounded-xl border border-slate-800/80 bg-[#050814] px-3 pr-10 text-sm text-slate-100",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-0",
            disabled && "cursor-not-allowed opacity-60",
            error && "border-rose-500/70 focus-visible:ring-rose-500/60"
          )}
        />
        <button
          type="button"
          onClick={() => !disabled && setOpen((o) => !o)}
          className="absolute inset-y-0 right-2 flex items-center text-slate-500 transition hover:text-slate-300"
          tabIndex={-1}
          aria-label="Open calendar"
        >
          <CalendarIcon className="h-4 w-4" />
        </button>

        {open && (
          <div className="absolute z-[70] mt-2 w-[320px] max-w-[360px]">
            <div className="rounded-2xl border border-slate-800/70 bg-[#090d16] px-3 py-3 shadow-[0_18px_45px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between px-1 pb-2 text-sm text-slate-200">
                <button
                  type="button"
                  onClick={() => goMonth(-1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/70 bg-slate-900 text-slate-200 transition hover:bg-slate-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="text-sm font-medium text-slate-100">
                  {formatDateFn(currentMonth, "LLLL yyyy")}
                </div>
                <button
                  type="button"
                  onClick={() => goMonth(1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/70 bg-slate-900 text-slate-200 transition hover:bg-slate-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 px-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div key={d} className="text-center">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 px-1 pb-1">
                {weeks.map((week, wi) =>
                  week.map((day, di) => {
                    const isSelected = !!(
                      day &&
                      selectedDate &&
                      selectedDate.getUTCFullYear() === currentMonth.getUTCFullYear() &&
                      selectedDate.getUTCMonth() === currentMonth.getUTCMonth() &&
                      selectedDate.getUTCDate() === day
                    );
                    const today = (() => {
                      const now = new Date();
                      return !!(
                        day &&
                        now.getUTCFullYear() === currentMonth.getUTCFullYear() &&
                        now.getUTCMonth() === currentMonth.getUTCMonth() &&
                        now.getUTCDate() === day
                      );
                    })();
                    const disabledDay = (() => {
                      if (!day) return true;
                      const date = new Date(
                        Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), day)
                      );
                      const { ok } = isValidDateParts(formatDateFn(date, "dd.MM.yyyy"), minDate, maxDate);
                      return !ok;
                    })();
                    return (
                      <button
                        key={`${wi}-${di}`}
                        type="button"
                        onClick={() => selectDay(day)}
                        disabled={!day || disabledDay}
                        className={cx(
                          "flex h-9 w-9 items-center justify-center rounded-full text-sm transition",
                          "text-slate-200",
                          !disabledDay && !!day && "hover:bg-slate-800/80 hover:text-slate-50",
                          (!day || disabledDay) && "text-slate-500 cursor-default opacity-60",
                          today && !isSelected && "ring-1 ring-slate-500/80",
                          isSelected &&
                            "bg-[#2563eb] text-white shadow-[0_0_0_1px_rgba(37,99,235,0.7)]",
                          "focus:outline-none"
                        )}
                      >
                        {day ?? ""}
                      </button>
                    );
                  })
                )}
              </div>

              <div className="mt-2 flex items-center justify-end gap-2 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const iso = formatISO(today);
                    onChange(iso);
                    setInputValue(formatDateFn(today, "dd.MM.yyyy"));
                    setCurrentMonth(today);
                    setOpen(false);
                  }}
                  className="rounded-full px-3 py-1 transition hover:bg-slate-800/70 hover:text-slate-100"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange(null);
                    setInputValue("");
                    setOpen(false);
                  }}
                  className="rounded-full px-3 py-1 transition hover:bg-slate-800/70 hover:text-slate-100"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-rose-300">{error}</p>}
    </div>
  );
};

