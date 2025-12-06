'use client';

import { useEffect, useMemo, useState } from 'react';

import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';

type MemberStatus = 'Active' | 'Expiring Soon' | 'Expired';

type ApiMember = {
  id: string;
  discord_username: string | null;
  discord_id: string | null;
  plan: string | null;
  price_cents: number | null;
  start_date: string | null;
  end_date: string | null;
};

type Plan = {
  id: string;
  name: string;
  priceCents: number;
  durationDays: number | null;
  active: boolean;
};

type DashboardMember = {
  id: string;
  discordUsername: string;
  plan: string;
  startDate: string | null;
  endDate: string | 'lifetime';
  status: MemberStatus;
  statusVariant: BadgeVariant;
  daysLeft: number;
};

function formatDate(dateString?: string | null) {
  if (!dateString) return '—';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
}

function classifyMember(member: ApiMember): DashboardMember {
  const endDateRaw =
    member.end_date === null ? 'lifetime' : member.end_date ?? 'lifetime';
  const startDate = member.start_date ?? null;

  if (endDateRaw === 'lifetime') {
    return {
      id: member.id,
      discordUsername: member.discord_username ?? '',
      plan: member.plan ?? 'Unknown',
      startDate,
      endDate: endDateRaw,
      status: 'Active',
      statusVariant: 'success',
      daysLeft: Number.POSITIVE_INFINITY,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDateObj = new Date(endDateRaw);
  const diffMs = endDateObj.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let status: MemberStatus = 'Active';
  let statusVariant: BadgeVariant = 'success';

  if (Number.isNaN(daysLeft)) {
    status = 'Expired';
    statusVariant = 'error';
  } else if (daysLeft < 0) {
    status = 'Expired';
    statusVariant = 'error';
  } else if (daysLeft <= 7) {
    status = 'Expiring Soon';
    statusVariant = 'warning';
  }

  return {
    id: member.id,
    discordUsername: member.discord_username ?? '',
    plan: member.plan ?? 'Unknown',
    startDate,
    endDate: endDateRaw,
    status,
    statusVariant,
    daysLeft: Number.isNaN(daysLeft) ? 0 : daysLeft,
  };
}

export default function DashboardPage() {
  const [members, setMembers] = useState<DashboardMember[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadMembers = async () => {
      try {
        setIsLoadingMembers(true);
        const res = await fetch('/api/members', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load members');
        const json = (await res.json()) as ApiMember[];
        if (!mounted) return;
        setMembers(json.map(classifyMember));
        setFetchError(null);
      } catch (error) {
        console.error('[DASHBOARD_MEMBERS_FETCH]', error);
        if (mounted) setFetchError('Unable to load dashboard data.');
      } finally {
        if (mounted) setIsLoadingMembers(false);
      }
    };

    loadMembers();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadPlans = async () => {
      try {
        setIsLoadingPlans(true);
        const res = await fetch('/api/plans', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load plans');
        const json = (await res.json()) as Plan[];
        if (!mounted) return;
        setPlans(json);
      } catch (error) {
        console.error('[DASHBOARD_PLANS_FETCH]', error);
        if (mounted) setPlans([]);
      } finally {
        if (mounted) setIsLoadingPlans(false);
      }
    };

    loadPlans();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter((m) => m.status === 'Active').length;
    const expiringSoon = members.filter((m) => m.status === 'Expiring Soon').length;
    const expired = members.filter((m) => m.status === 'Expired').length;
    const trialConversions = total ? Math.round((active / total) * 100) : 0;

    return { total, active, expiringSoon, expired, trialConversions };
  }, [members]);

  const recentMembers = useMemo(
    () =>
      [...members]
        .sort(
          (a, b) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        )
        .slice(0, 5),
    [members]
  );

  const planCounts = useMemo(() => {
    const map: Record<string, number> = {};
    members.forEach((m) => {
      map[m.plan] = (map[m.plan] ?? 0) + 1;
    });
    return map;
  }, [members]);

  const knownPlans = new Set(plans.map((p) => p.name));
  const legacyCount = Object.entries(planCounts).reduce(
    (acc, [name, count]) => (knownPlans.has(name) ? acc : acc + count),
    0
  );

  const loading = isLoadingMembers || isLoadingPlans;

  return (
    <main className="space-y-8">
      <header className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">Control Dashboard</h1>
          <p className="mt-1 text-xs text-slate-400">
            Monitor Haunted members, plans and trials in one glance.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0b1020] px-3 py-1.5 text-sm text-slate-200 shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-4 w-4 opacity-70"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 5.64 5.64a7.5 7.5 0 0 0 11 11Z"
            />
          </svg>
          <input
            type="search"
            placeholder="Search members, plans…"
            className="bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
        </div>
      </header>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b from-[#0b1020] via-[#050b19] to-[#030712] px-6 py-5 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Active Members
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-50">
            {loading ? '—' : stats.active}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {loading ? 'Loading…' : `Out of ${stats.total} total members`}
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b from-[#0b1020] via-[#050b19] to-[#030712] px-6 py-5 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Expiring Soon
          </p>
          <p className="mt-3 text-3xl font-semibold text-amber-300">
            {loading ? '—' : stats.expiringSoon}
          </p>
          <p className="mt-1 text-xs text-slate-500">With less than 7 days left</p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b from-[#0b1020] via-[#050b19] to-[#030712] px-6 py-5 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Overdue
          </p>
          <p className="mt-3 text-3xl font-semibold text-rose-300">
            {loading ? '—' : stats.expired}
          </p>
          <p className="mt-1 text-xs text-slate-500">Subscriptions already expired</p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b from-[#0b1020] via-[#050b19] to-[#030712] px-6 py-5 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Trial Conversions
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-50">
            {loading ? '—' : `${stats.trialConversions}%`}
          </p>
          <p className="mt-1 text-xs text-slate-500">Active vs total members</p>
        </div>
      </section>

      <section className="rounded-3xl border border-white/5 bg-gradient-to-b from-[#0b1020] via-[#050b19] to-[#030712] px-5 py-5 shadow-[0_24px_60px_rgba(0,0,0,0.45)] space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Recent Members</h2>
          <p className="text-xs text-slate-500">
            The latest souls drifting into Haunted.
          </p>
        </div>

        {fetchError && (
          <p className="px-1 pt-3 text-sm text-red-400">{fetchError}</p>
        )}

        <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#050b19]/50">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Discord Username
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Plan
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Start Date
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  End
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-sm text-slate-400"
                  >
                    Loading recent members...
                  </td>
                </tr>
              ) : recentMembers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm text-slate-400"
                  >
                    No members yet.
                  </td>
                </tr>
              ) : (
                recentMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="transition-colors hover:bg-white/5"
                  >
                    <td className="px-5 py-3 text-[13px] text-slate-100">
                      <span className="font-medium text-slate-100">
                        {member.discordUsername}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[13px] text-slate-100">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-medium ${
                          member.plan.toLowerCase() === 'haunted'
                            ? 'bg-purple-500/15 text-purple-200 border border-purple-500/40'
                            : member.plan.toLowerCase() === 'broke haunted'
                              ? 'bg-sky-500/15 text-sky-200 border border-sky-500/40'
                              : member.plan.toLowerCase() === 'killore'
                                ? 'bg-pink-500/15 text-pink-200 border border-pink-500/40'
                                : 'border border-white/10 text-slate-200'
                        }`}
                      >
                        {member.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-300">
                      {formatDate(member.startDate)}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-300">
                      {member.endDate === 'lifetime'
                        ? 'Lifetime'
                        : formatDate(member.endDate)}
                    </td>
                    <td className="px-5 py-3 text-xs">
                      <span
                        className={
                          member.status === 'Active'
                            ? 'inline-flex items-center rounded-full border border-emerald-500/60 bg-emerald-500/10 px-3 py-0.5 text-[11px] font-medium text-emerald-300'
                            : 'inline-flex items-center rounded-full border border-rose-500/60 bg-rose-500/10 px-3 py-0.5 text-[11px] font-medium text-rose-300'
                        }
                      >
                        {member.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-white/5 bg-gradient-to-b from-[#0b1020] via-[#050b19] to-[#030712] px-5 py-5 shadow-[0_24px_60px_rgba(0,0,0,0.45)] space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Plans Overview</h2>
          <p className="text-xs text-slate-500">
            How members are distributed across Haunted plans.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#050b19]/50">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Plan
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Total Members
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoadingPlans ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-8 text-center text-sm text-slate-400"
                  >
                    Loading plans...
                  </td>
                </tr>
              ) : (
                <>
                  {plans.map((plan) => (
                    <tr
                      key={plan.id}
                      className="transition-colors hover:bg-white/5"
                    >
                      <td className="px-5 py-3 text-[13px] text-slate-100">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-medium ${
                            plan.name.toLowerCase() === 'haunted'
                              ? 'bg-purple-500/15 text-purple-200 border border-purple-500/40'
                              : plan.name.toLowerCase() === 'broke haunted'
                                ? 'bg-sky-500/15 text-sky-200 border border-sky-500/40'
                                : plan.name.toLowerCase() === 'killore'
                                  ? 'bg-pink-500/15 text-pink-200 border border-pink-500/40'
                                  : 'border border-white/10 text-slate-200'
                          }`}
                        >
                          {plan.name}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[13px] text-slate-100">
                        <span
                          className={
                            plan.active
                              ? 'inline-flex items-center rounded-full border border-emerald-500/60 bg-emerald-500/10 px-3 py-0.5 text-[11px] font-medium text-emerald-300'
                              : 'inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-0.5 text-[11px] font-medium text-slate-200'
                          }
                        >
                          {plan.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-[13px] text-slate-100">
                        {planCounts[plan.name] ?? 0}
                      </td>
                    </tr>
                  ))}

                  {legacyCount > 0 && (
                    <tr className="transition-colors hover:bg-white/5">
                      <td className="px-5 py-3 text-[13px] text-slate-100">
                        Unknown / Legacy
                      </td>
                      <td className="px-5 py-3 text-[13px] text-slate-100">
                        <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-0.5 text-[11px] font-medium text-slate-200">
                          Legacy
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-[13px] text-slate-100">
                        {legacyCount}
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
