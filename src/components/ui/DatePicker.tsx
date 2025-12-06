"use client";

import React, { forwardRef, useMemo, useState } from "react";
import ReactDatePicker from "react-datepicker";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, isSameDay, isToday, startOfDay } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

type DatePickerProps = {
  label?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
};

type TriggerProps = {
  value?: string;
  onClick?: () => void;
  placeholder?: string;
  disabled?: boolean;
};

const cx = (...classes: Array<string | false | undefined | null>) =>
  classes.filter(Boolean).join(" ");

const DateTrigger = forwardRef<HTMLButtonElement, TriggerProps>(
  ({ value, onClick, placeholder, disabled }, ref) => (
    <button
      type="button"
      onClick={onClick}
      ref={ref}
      disabled={disabled}
      className={cx(
        "flex h-11 w-full items-center justify-between rounded-xl border border-slate-800/80",
        "bg-[#050814] px-3 text-left text-sm text-slate-100",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition",
        "hover:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-0",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      <span className={cx("truncate", !value && "text-slate-500")}>
        {value || placeholder || "Select date"}
      </span>
      <CalendarIcon className="h-4 w-4 text-slate-500 transition group-focus-within:text-slate-300" />
    </button>
  )
);
DateTrigger.displayName = "DateTrigger";

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder,
  minDate,
  maxDate,
  disabled,
  className,
}) => {
  const displayValue = value ? format(value, "dd.MM.yyyy") : "";
  const [currentMonth, setCurrentMonth] = useState<Date>(value ?? new Date());
  const monthNames = useMemo(
    () => [
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
    ],
    []
  );
  const years = useMemo(() => {
    const nowYear = new Date().getFullYear();
    const start = nowYear - 5;
    const end = nowYear + 10;
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, []);

  const dayClassName = (date: Date) => {
    const isSelected = value ? isSameDay(date, value) : false;
    const today = isToday(date);
    const isBeforeMin = minDate ? startOfDay(date) < startOfDay(minDate) : false;
    const isAfterMax = maxDate ? startOfDay(date) > startOfDay(maxDate) : false;
    const isDisabled = isBeforeMin || isAfterMax;
    const isOutside = date.getMonth() !== currentMonth.getMonth();

    return cx(
      "mx-[5px] my-[6px] flex h-8 w-8 items-center justify-center rounded-full text-xs transition",
      "text-slate-200",
      !isDisabled && !isOutside && "hover:bg-slate-800 hover:text-slate-100 cursor-pointer",
      (isDisabled || isOutside) && "text-slate-600 pointer-events-none",
      today && !isSelected && "ring-1 ring-slate-500/60",
      isSelected &&
        "bg-[#2563eb] text-white shadow-[0_0_14px_rgba(37,99,235,0.35)] hover:bg-[#1d4ed8]",
      "react-datepicker__day"
    );
  };

  const CalendarContainer = ({
    className: containerClassName,
    children,
  }: {
    className?: string;
    children: React.ReactNode;
  }) => (
    <div
      className={cx(
        containerClassName,
        "w-[340px] rounded-3xl border border-slate-800/70",
        "bg-gradient-to-b from-slate-900/95 to-slate-950 px-4 py-4",
        "shadow-[0_18px_45px_rgba(0,0,0,0.55)] z-[60]"
      )}
    >
      <div className="rounded-2xl bg-slate-900/80 px-2 pt-3 pb-2">{children}</div>
      <div className="mt-3 flex items-center justify-end gap-2 text-xs font-medium text-slate-400">
        <button
          type="button"
          onClick={() => onChange(new Date())}
          className="rounded-full px-3 py-1 transition hover:bg-slate-800/70 hover:text-slate-100"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="rounded-full px-3 py-1 transition hover:bg-slate-800/70 hover:text-slate-100"
        >
          Clear
        </button>
      </div>
    </div>
  );

  const popperModifiers = useMemo(
    () => [
      { name: "offset", options: { offset: [0, 8] } },
      { name: "preventOverflow", options: { padding: 8 } },
      { name: "flip", options: { padding: 8 } },
    ],
    []
  );

  return (
    <div className={className}>
      {label && (
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>
      )}
      <ReactDatePicker
        selected={value}
        onChange={(date) => onChange(date)}
        onMonthChange={(date) => setCurrentMonth(date)}
        onCalendarOpen={() => setCurrentMonth(value ?? new Date())}
        customInput={
          <DateTrigger
            placeholder={placeholder}
            disabled={disabled}
            value={displayValue}
          />
        }
        placeholderText={placeholder}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        dateFormat="dd.MM.yyyy"
        showPopperArrow={false}
        popperClassName="z-[120]"
        popperPlacement="bottom-start"
        popperModifiers={popperModifiers as any}
        calendarClassName="!bg-transparent !border-none"
        dayClassName={dayClassName}
        renderCustomHeader={({
          date,
          changeMonth,
          changeYear,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div className="flex items-center justify-between px-1 pb-2 text-sm text-slate-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                className={cx(
                  "flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/70",
                  "bg-slate-900 text-slate-200 transition hover:bg-slate-800",
                  prevMonthButtonDisabled && "opacity-50"
                )}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                className={cx(
                  "flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/70",
                  "bg-slate-900 text-slate-200 transition hover:bg-slate-800",
                  nextMonthButtonDisabled && "opacity-50"
                )}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={date.getMonth()}
                onChange={(e) => {
                  const month = Number(e.target.value);
                  const updated = new Date(date);
                  updated.setMonth(month);
                  setCurrentMonth(updated);
                  changeMonth(month);
                }}
                className="rounded-full border border-slate-700/70 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-100 outline-none ring-0 focus:border-slate-500"
              >
                {monthNames.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                value={date.getFullYear()}
                onChange={(e) => {
                  const year = Number(e.target.value);
                  const updated = new Date(date);
                  updated.setFullYear(year);
                  setCurrentMonth(updated);
                  changeYear(year);
                }}
                className="rounded-full border border-slate-700/70 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-100 outline-none ring-0 focus:border-slate-500"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        weekDayClassName={() =>
          "text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500"
        }
        renderDayContents={(day) => <span>{day}</span>}
        calendarContainer={CalendarContainer}
        shouldCloseOnSelect
      />
    </div>
  );
};

