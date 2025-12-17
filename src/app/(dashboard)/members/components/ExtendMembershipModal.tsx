"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

type MemberForExtend = {
  id: string;
  discordUsername: string;
  endDate: string | "lifetime";
  planName?: string;
  basePriceCents?: number;
  discountPercent?: number;
};

type ExtendMembershipModalProps = {
  open: boolean;
  member: MemberForExtend | null;
  onClose: () => void;
  onConfirm: (extendDays: number) => void;
  loading?: boolean;
};

const formatDisplayDate = (value: string | "lifetime") => {
  if (!value || value === "lifetime") return "Lifetime";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
};

export function ExtendMembershipModal({
  open,
  member,
  onClose,
  onConfirm,
  loading,
}: ExtendMembershipModalProps) {
  const [selected, setSelected] = useState<string>("30");
  const [customDays, setCustomDays] = useState<string>("");

  const extendDays = useMemo(() => {
    if (selected === "custom") {
      const val = Number(customDays);
      return Number.isFinite(val) && val > 0 ? val : null;
    }
    const val = Number(selected);
    return Number.isFinite(val) && val > 0 ? val : null;
  }, [selected, customDays]);

  const today = useMemo(() => {
    const t = new Date();
    t.setUTCHours(0, 0, 0, 0);
    return t;
  }, []);

  const startDate = useMemo(() => {
    if (!member) return today;
    if (member.endDate === "lifetime") return today;
    const end = new Date(member.endDate);
    if (isNaN(end.getTime())) return today;
    return end.getTime() > today.getTime() ? end : today;
  }, [member, today]);

  const projectedEnd = useMemo(() => {
    if (!extendDays) return null;
    const next = new Date(startDate);
    next.setUTCDate(next.getUTCDate() + extendDays);
    return next;
  }, [extendDays, startDate]);

  const discountPercent =
    member && typeof member.discountPercent === "number"
      ? Math.min(100, Math.max(0, Math.round(member.discountPercent * 100) / 100))
      : 0;

  const basePriceUsd =
    member && typeof member.basePriceCents === "number"
      ? member.basePriceCents / 100
      : 0;

  const finalPriceUsd =
    basePriceUsd > 0
      ? Math.round(basePriceUsd * 100 * (1 - discountPercent / 100)) / 100
      : 0;

  const handleConfirm = () => {
    if (!extendDays) return;
    onConfirm(extendDays);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Extend Membership"
      description="Extend the member's access by adding days to their end date."
    >
      <div className="space-y-4">
        <div className="text-sm text-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Member</span>
            <span className="text-slate-100 font-medium">
              {member?.discordUsername || "—"}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-slate-400">Current end date</span>
            <span className="text-slate-100 font-medium">
              {member ? formatDisplayDate(member.endDate) : "—"}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-slate-400">New end date</span>
            <span className="text-slate-100 font-medium">
              {projectedEnd
                ? formatDisplayDate(projectedEnd.toISOString())
                : "—"}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800/70 bg-[#0b1020] px-3 py-3 text-sm text-slate-200">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.14em] text-slate-400">
            <span>Pricing</span>
            <span className="text-[10px] font-medium text-slate-500">
              {member?.planName || "Plan"}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-slate-400">Base price</span>
            <span className="font-medium text-slate-100">
              {basePriceUsd > 0 ? currencyFormatter.format(basePriceUsd) : "—"}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-slate-400">Discount</span>
            <span className="font-medium text-emerald-300">
              {discountPercent > 0 ? `-${discountPercent}%` : "0%"}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-slate-400">Final price</span>
            <span className="font-semibold text-slate-50">
              {finalPriceUsd > 0 ? currencyFormatter.format(finalPriceUsd) : "—"}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            Extension
          </label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full rounded-xl border border-slate-800/80 bg-[#0b1020] px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <option value="30">+1 month (30 days)</option>
            <option value="90">+3 months (90 days)</option>
            <option value="180">+6 months (180 days)</option>
            <option value="365">+12 months (365 days)</option>
            <option value="custom">Custom…</option>
          </select>
          {selected === "custom" && (
            <input
              type="number"
              min={1}
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
              placeholder="Enter number of days"
              className="w-full rounded-xl border border-slate-800/80 bg-[#0b1020] px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            />
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-700/70 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/70 transition"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!extendDays || loading}
            className="rounded-full border border-indigo-500/70 bg-indigo-600/80 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_12px_rgba(79,70,229,0.5)] transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "Extending..." : "Confirm"}
          </button>
        </div>
      </div>
    </Modal>
  );
}




