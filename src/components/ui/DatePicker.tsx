"use client";

import React, { forwardRef } from "react";
import ReactDatePicker from "react-datepicker";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, isSameDay, isToday } from "date-fns";
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
        "flex w-full items-center justify-between rounded-xl border",
        "border-slate-800/70 bg-[#060913] px-3 py-2.5 text-left text-sm text-slate-100",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition",
        "hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/60",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      <span className={cx("truncate", !value && "text-slate-500")}>
        {value || placeholder || "Select date"}
      </span>
      <CalendarIcon className="h-4 w-4 text-slate-400 transition hover:text-slate-200" />
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
        "overflow-hidden rounded-2xl border border-slate-800/70 bg-[#0b1020]",
        "shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
      )}
    >
      {children}
      <div className="flex items-center justify-end gap-3 border-t border-white/5 px-4 py-2.5 text-xs text-slate-300">
        <button
          type="button"
          onClick={() => onChange(new Date())}
          className="rounded-full px-3 py-1 transition hover:bg-white/5 hover:text-white"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="rounded-full px-3 py-1 text-rose-200 transition hover:bg-rose-500/10 hover:text-rose-50"
        >
          Clear
        </button>
      </div>
    </div>
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
        popperClassName="z-50"
        calendarClassName="!bg-transparent !border-none"
        dayClassName={(date) => {
          const isSelected = value ? isSameDay(date, value) : false;
          const today = isToday(date);
          return cx(
            "mx-1 my-1 flex h-9 w-9 items-center justify-center rounded-lg text-xs transition",
            "text-slate-300 hover:bg-white/10 hover:text-white",
            today && !isSelected && "border border-slate-700/80",
            isSelected &&
              "bg-indigo-600 text-white shadow-[0_0_14px_rgba(79,70,229,0.5)] hover:bg-indigo-500",
            "react-datepicker__day"
          );
        }}
        renderCustomHeader={({
          date,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-200">
            <button
              type="button"
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              className={cx(
                "flex h-9 w-9 items-center justify-center rounded-full border border-slate-800/70",
                "bg-[#0b1020] text-slate-300 transition hover:border-slate-600 hover:text-white",
                prevMonthButtonDisabled && "opacity-50"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-sm font-semibold tracking-wide text-slate-100">
              {format(date, "LLLL yyyy")}
            </div>
            <button
              type="button"
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              className={cx(
                "flex h-9 w-9 items-center justify-center rounded-full border border-slate-800/70",
                "bg-[#0b1020] text-slate-300 transition hover:border-slate-600 hover:text-white",
                nextMonthButtonDisabled && "opacity-50"
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
        weekDayClassName={() =>
          "text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500"
        }
        renderDayContents={(day) => <span>{day}</span>}
        calendarContainer={CalendarContainer}
      />
    </div>
  );
};

