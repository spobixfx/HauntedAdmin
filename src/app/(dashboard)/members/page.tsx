'use client';

import { useEffect, useMemo, useState } from 'react';

import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { getPlanBadgeClass } from '@/components/PlanBadge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { ExtendMembershipModal } from './components/ExtendMembershipModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';

type Plan = {
  id: string;
  name: string;
  priceCents: number;
  durationDays: number | null;
  active: boolean;
};
type ApiPlan = {
  id: string;
  name: string;
  price_cents: number | null;
  duration_days: number | null;
  active: boolean | null;
};
type MemberStatus = 'Active' | 'Expiring Soon' | 'Expired';

interface MemberInput {
  discordUsername: string;
  discordId: string;
  plan: string;
  price: number;
  startDate: string;
  endDate: string | 'lifetime';
}

interface Member extends MemberInput {
  id: string;
  status: MemberStatus;
  statusVariant: BadgeVariant;
  daysLeft: number;
}

type ApiMember = {
  id: string;
  discord_username: string | null;
  discord_id: string | null;
  plan: string | null;
  price_cents: number | null;
  start_date: string | null;
  end_date: string | null;
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const findDefaultLifetimePlan = (planList: Plan[]) => {
  const hauntedLifetime = planList.find(
    (p) => p.durationDays === null && p.name.toLowerCase() === 'haunted'
  );
  if (hauntedLifetime) return hauntedLifetime;
  return planList.find((p) => p.durationDays === null) ?? null;
};

const mapApiPlan = (api: ApiPlan): Plan => {
  const priceCents =
    typeof api.price_cents === 'number' ? api.price_cents : 0;
  const durationDays =
    typeof api.duration_days === 'number' ? api.duration_days : null;

  return {
    id: api.id,
    name: api.name,
    priceCents,
    durationDays,
    active: api.active ?? false,
  };
};

const generateId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `member-${Date.now()}-${Math.random()}`;

function computeMember(member: MemberInput, id?: string): Member {
  if (member.endDate === 'lifetime') {
    return {
      ...member,
      id: id ?? generateId(),
      status: 'Active',
      statusVariant: 'success',
      daysLeft: Number.POSITIVE_INFINITY,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(member.endDate);
  const diffMs = endDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let status: MemberStatus = 'Active';
  let statusVariant: BadgeVariant = 'success';

  if (daysLeft < 0) {
    status = 'Expired';
    statusVariant = 'error';
  } else if (daysLeft <= 7) {
    status = 'Expiring Soon';
    statusVariant = 'warning';
  }

  return {
    ...member,
    id: id ?? generateId(),
    status,
    statusVariant,
    daysLeft,
  };
}

const mapApiMember = (member: ApiMember): Member => {
  const priceUsd =
    typeof member.price_cents === 'number' ? member.price_cents / 100 : 0;

  const endDate =
    member.end_date === null ? 'lifetime' : member.end_date ?? 'lifetime';

  return computeMember(
    {
      discordUsername: member.discord_username ?? '',
      discordId: member.discord_id ?? '',
      plan: member.plan ?? 'Unknown',
      price: priceUsd,
      startDate: member.start_date ?? '',
      endDate,
    },
    member.id
  );
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

const formatInputDate = (date?: Date | null) => {
  if (!date || isNaN(date.getTime())) return '';

  return date.toISOString().slice(0, 10);
};

const addDays = (dateInput: string, days: number) => {
  if (!dateInput || Number.isNaN(days)) return '';

  const date = new Date(`${dateInput}T00:00:00.000Z`);
  if (isNaN(date.getTime())) {
    return '';
  }

  date.setUTCDate(date.getUTCDate() + days);
  return formatInputDate(date);
};

const deriveEndDate = (
  durationDays: number | null | undefined,
  startDate: string
) => {
  if (!durationDays || durationDays <= 0) {
    return { endDate: '', isLifetime: true };
  }

  if (!startDate) {
    return { endDate: '', isLifetime: false };
  }

  return { endDate: addDays(startDate, durationDays) || '', isLifetime: false };
};

interface FormState {
  discordUsername: string;
  discordId: string;
  planId: string;
  planName: string;
  price: number;
  startDate: string;
  endDate: string;
  isLifetime: boolean;
}

const defaultFormState = (plan?: Plan): FormState => {
  const today = new Date();
  const todayInputValue = formatInputDate(today);
  const derived = deriveEndDate(plan?.durationDays ?? null, todayInputValue);
  return {
    discordUsername: '',
    discordId: '',
    planId: plan?.id ?? '',
    planName: plan?.name ?? '',
    price: plan ? plan.priceCents / 100 : 0,
    startDate: todayInputValue,
    endDate: derived.endDate,
    isLifetime: derived.isLifetime,
  };
};

const formStateFromMember = (member: Member, plan?: Plan): FormState => {
  const startInput = formatInputDate(new Date(member.startDate));
  const endInput =
    member.endDate === 'lifetime'
      ? ''
      : formatInputDate(new Date(member.endDate));

  return {
    discordUsername: member.discordUsername,
    discordId: member.discordId ?? '',
    planId: plan?.id ?? '',
    planName: member.plan,
    price: member.price,
    startDate: startInput,
    endDate: endInput,
    isLifetime: member.endDate === 'lifetime',
  };
};

export default function MembersPage() {
  const todayInput = formatInputDate(new Date());
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormState>(() => defaultFormState());
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [planFilter, setPlanFilter] = useState<'all' | string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | MemberStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [discordIdError, setDiscordIdError] = useState<string | null>(null);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [extendMember, setExtendMember] = useState<Member | null>(null);
  const [extendLoading, setExtendLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    discordUsername?: string;
    plan?: string;
  }>({});
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const stats = useMemo(() => {
    const total = members.length;

    const active = members.filter((m) => m.status === 'Active').length;
    const expiringSoon = members.filter((m) => m.status === 'Expiring Soon').length;
    const expired = members.filter((m) => m.status === 'Expired').length;

    const trialConversions = total > 0 ? Math.round((active / total) * 100) : 0;

    return {
      total,
      active,
      expiringSoon,
      expired,
      trialConversions,
    };
  }, [members]);

  useEffect(() => {
    let isMounted = true;

    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/members', { cache: 'no-store' });
        if (!res.ok) {
          const message = await res.text();
          if (!isMounted) return;
          setFetchError(
            message || `Failed to load members (${res.status})`
          );
          setIsLoading(false);
          return;
        }
        const data = (await res.json()) as ApiMember[];
        if (!isMounted) return;
        setMembers(data.map(mapApiMember));
        setFetchError(null);
      } catch (error) {
        console.error('[MEMBERS_PAGE_FETCH]', error);
        if (isMounted) {
          setFetchError('Unable to load members right now. Try again shortly.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMembers();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchPlans = async () => {
      try {
        const res = await fetch('/api/plans', { cache: 'no-store' });
        if (!res.ok) {
          const message = await res.text();
          if (!isMounted) return;
          setPlansError(
            message || `Failed to load plans (${res.status})`
          );
          setPlans([]);
          return;
        }
        const data = (await res.json()) as ApiPlan[];
        if (!isMounted) return;
        const mapped = data.map(mapApiPlan);
        setPlans(mapped.filter((plan) => plan.active));
        setPlansError(null);
      } catch (error) {
        console.error('[MEMBERS_PLANS_FETCH]', error);
        if (isMounted) {
          setPlans([]);
        }
      }
    };

    fetchPlans();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenModal = () => {
    setEditingMemberId(null);
    const initialPlan =
      findDefaultLifetimePlan(plans) ?? plans[0];
    setFormData(defaultFormState(initialPlan));
    setFormErrors({});
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMemberId(null);
    const initialPlan =
      findDefaultLifetimePlan(plans) ?? plans[0];
    setFormData(defaultFormState(initialPlan));
    setFormErrors({});
  };

  const handleEditMember = (member: Member) => {
    setEditingMemberId(member.id);
    const matchingPlan = plans.find((plan) => plan.name === member.plan);
    setFormData(formStateFromMember(member, matchingPlan));
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (member: Member) => {
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
    setIsDeleting(false);
  };

  const handleOpenExtendModal = (member: Member) => {
    setExtendMember(member);
    setIsExtendModalOpen(true);
  };

  const handleCloseExtendModal = () => {
    setIsExtendModalOpen(false);
    setExtendMember(null);
    setExtendLoading(false);
  };

  const handleConfirmExtend = async (days: number) => {
    if (!extendMember) return;
    setExtendLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/members/${encodeURIComponent(extendMember.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extendDays: days }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body?.member) {
        const message =
          body?.error || body?.message || 'Failed to extend membership';
        setFetchError(message);
        return;
      }

      const updated = mapApiMember(body.member);
      setMembers((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );
      handleCloseExtendModal();
    } catch (error) {
      console.error('[MEMBERS_EXTEND]', error);
      setFetchError('Unable to extend membership. Try again.');
    } finally {
      setExtendLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;

    setIsDeleting(true);
    setFetchError(null);

    try {
      const res = await fetch(
        `/api/members/${encodeURIComponent(memberToDelete.id)}`,
        {
          method: 'DELETE',
        }
      );

      const body = await res.json().catch(() => ({} as any));

      if (!res.ok || !body?.success) {
        const message =
          body?.error || body?.message || 'Failed to delete member';
        setFetchError(message);
        return;
      }
      setMembers((prev) =>
        prev.filter((member) => member.id !== memberToDelete.id)
      );
    } catch (error) {
      console.error('[MEMBERS_DELETE]', error);
      setFetchError(
        (error as any)?.message || 'Unable to delete member. Please try again.'
      );
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setMemberToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
    setMemberToDelete(null);
  };

  const handlePlanChange = (planId: string) => {
    if (!planId) {
      setFormData((prev) => ({
        ...prev,
        planId: '',
        planName: '',
        price: 0,
        endDate: '',
        isLifetime: false,
      }));
      return;
    }

    const selectedPlan = plans.find((plan) => plan.id === planId);
    if (!selectedPlan) {
      setFormData((prev) => ({
        ...prev,
        planId,
      }));
      return;
    }

    const priceUsd =
      typeof selectedPlan.priceCents === 'number'
        ? selectedPlan.priceCents / 100
        : 0;

    const existingStartDate = formData.startDate?.trim();
    const todayIso = formatInputDate(new Date());
    const startDate = existingStartDate || todayIso;

    let endDate = '';
    let isLifetime = false;

    if (selectedPlan.durationDays && selectedPlan.durationDays > 0) {
      const derived = deriveEndDate(
        selectedPlan.durationDays,
        startDate
      );
      endDate = derived.endDate || '';
      isLifetime = derived.isLifetime;
    } else {
      endDate = '';
      isLifetime = true;
    }

    setFormData((prev) => ({
      ...prev,
      planId,
      planName: selectedPlan.name,
      price: priceUsd,
      startDate,
      endDate,
      isLifetime,
    }));
    setFormErrors((prev) => ({ ...prev, plan: undefined }));
  };

  const handleStartDateChange = (value: string) => {
    const nextStart = value ?? '';
    const selectedPlan = plans.find((plan) => plan.id === formData.planId);
    if (!selectedPlan) {
      setFormData((prev) => ({
        ...prev,
        startDate: nextStart,
      }));
      return;
    }
    const derived = deriveEndDate(selectedPlan.durationDays, nextStart);
    setFormData((prev) => ({
      ...prev,
      startDate: nextStart,
      endDate: derived.endDate || prev.endDate,
      isLifetime: derived.isLifetime,
    }));
  };

  const handleEndDateChange = (value: string) => {
    const nextEnd = value ?? '';
    setFormData((prev) => ({
      ...prev,
      endDate: nextEnd,
      isLifetime: false,
    }));
  };

  const handleDiscordIdChange = (value: string) => {
    const numeric = value.replace(/\D/g, '').slice(0, 19);
    setDiscordIdError(null);
    setFormData((prev) => ({
      ...prev,
      discordId: numeric,
    }));
  };

  const handleLifetimeToggle = (nextLifetime: boolean) => {
    if (nextLifetime) {
      const lifetimePlan = findDefaultLifetimePlan(plans);
      if (lifetimePlan) {
        const priceUsd =
          typeof lifetimePlan.priceCents === 'number'
            ? lifetimePlan.priceCents / 100
            : 0;
        const startDate =
          formData.startDate?.trim() || formatInputDate(new Date());

        setFormData((prev) => ({
          ...prev,
          planId: lifetimePlan.id,
          planName: lifetimePlan.name,
          price: priceUsd,
          startDate,
          endDate: '',
          isLifetime: true,
        }));
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      isLifetime: nextLifetime,
      endDate: nextLifetime ? '' : prev.endDate,
    }));
  };

  const getStatusBadgeClass = (variant: BadgeVariant) => {
    switch (variant) {
      case 'success':
        return 'inline-flex items-center rounded-full bg-emerald-900/40 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300 border border-emerald-700/60';
      case 'warning':
        return 'inline-flex items-center rounded-full bg-amber-900/40 px-2.5 py-0.5 text-[11px] font-medium text-amber-200 border border-amber-700/60';
      case 'error':
        return 'inline-flex items-center rounded-full bg-red-900/40 px-2.5 py-0.5 text-[11px] font-medium text-red-300 border border-red-700/60';
      case 'info':
        return 'inline-flex items-center rounded-full bg-sky-900/40 px-2.5 py-0.5 text-[11px] font-medium text-sky-200 border border-sky-700/60';
      default:
        return 'inline-flex items-center rounded-full bg-slate-900/60 px-2.5 py-0.5 text-[11px] font-medium text-slate-200 border border-slate-700/60';
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesPlan =
        planFilter === 'all' ? true : member.plan === planFilter;
      const matchesStatus =
        statusFilter === 'all' ? true : member.status === statusFilter;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        member.discordUsername.toLowerCase().includes(query) ||
        (member.discordId || '').includes(query);

      return matchesPlan && matchesStatus && matchesSearch;
    });
  }, [members, planFilter, statusFilter, searchQuery]);

  const planFilterOptions = useMemo(() => {
    const names = new Set<string>();
    plans.forEach((plan) => names.add(plan.name));
    members.forEach((member) => names.add(member.plan));
    return Array.from(names);
  }, [plans, members]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: typeof formErrors = {};
    if (!formData.discordUsername.trim()) {
      errors.discordUsername = 'Discord username is required.';
    }
    const discordIdValue = formData.discordId.trim();
    if (discordIdValue.length > 0 && !/^\d{17,19}$/.test(discordIdValue)) {
      setDiscordIdError('Discord ID must be 17–19 digits.');
      return;
    }
    setDiscordIdError(null);
    const selectedPlan = plans.find((plan) => plan.id === formData.planId);
    const planName = selectedPlan?.name ?? formData.planName;
    if (!formData.planId && !planName) {
      errors.plan = 'Select a plan.';
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const price = selectedPlan ? selectedPlan.priceCents / 100 : formData.price;

    const payload = {
      id: editingMemberId ?? undefined,
      discordUsername: formData.discordUsername.trim(),
      discordId: formData.discordId.trim() || null,
      planName: planName ?? '',
      plan: planName ?? '',
      priceUsd: price,
      price,
      startDate: formData.startDate,
      endDate: formData.isLifetime ? '' : formData.endDate,
    };

    setSubmitLoading(true);
    try {
      const endpoint = '/api/members';
      const method = editingMemberId ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        alert(errorBody?.error ?? 'Unable to save member. Please try again.');
        return;
      }

      const json = await res.json().catch(() => null);
      const saved = (json && 'member' in json ? (json as any).member : json) as
        | ApiMember
        | null;
      if (!saved) {
        alert('Unable to save member. Please try again.');
        return;
      }
      const normalized = mapApiMember(saved);

      setMembers((prev) => {
        if (editingMemberId) {
          return prev.map((member) =>
            member.id === editingMemberId ? normalized : member
          );
        }
        return [normalized, ...prev];
      });

      handleCloseModal();
    } catch (error) {
      console.error('[MEMBERS_SAVE]', error);
      alert('Unable to save member. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl w-full mx-auto">
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card padding="lg">
          <CardHeader title="Active Members" />
          <CardContent>
            <p className="text-4xl font-semibold text-[var(--text-primary)]">
              {stats.active}
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              Out of {stats.total} total members
            </p>
          </CardContent>
        </Card>

        <Card padding="lg">
          <CardHeader title="Expiring Soon" />
          <CardContent>
            <p className="text-4xl font-semibold text-[var(--status-warning)]">
              {stats.expiringSoon}
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              With less than 7 days left
            </p>
          </CardContent>
        </Card>

        <Card padding="lg">
          <CardHeader title="Overdue" />
          <CardContent>
            <p className="text-4xl font-semibold text-[var(--status-error)]">
              {stats.expired}
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              Subscriptions already expired
            </p>
          </CardContent>
        </Card>

        <Card padding="lg">
          <CardHeader title="Trial Conversions" />
          <CardContent>
            <p className="text-4xl font-semibold text-[var(--text-primary)]">
              {stats.trialConversions}%
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              Active vs total members
            </p>
          </CardContent>
        </Card>
      </section>

      <div className="mt-8 w-full rounded-3xl border border-slate-800/70 bg-[#090d16] px-6 py-6 shadow-[0_18px_45px_rgba(0,0,0,0.55)] md:overflow-visible overflow-x-auto">
        <div className="px-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-50">Members</h2>
              <p className="mt-1 text-xs text-slate-400">
                Subscription health across all haunted tiers.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenModal}
              className="rounded-full bg-[#2563eb] px-4 py-2 text-xs font-semibold text-slate-50 shadow-[0_0_25px_rgba(37,99,235,0.45)] hover:bg-[#1d4ed8] transition"
            >
              Add Member
            </button>
          </div>

          {fetchError && (
            <p className="px-1 pt-3 text-sm text-red-400">{fetchError}</p>
          )}
          {plansError && (
            <p className="px-1 pt-2 text-sm text-red-400">{plansError}</p>
          )}

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-4">
              <label className="flex flex-col">
                <div className="text-[11px] font-medium text-slate-400">Plan</div>
                <div className="mt-1 inline-flex items-center rounded-full border border-white/10 bg-[#0b1020] px-3 py-1.5">
                  <select
                    value={planFilter}
                    onChange={(e) =>
                      setPlanFilter(
                        e.target.value === 'all'
                          ? 'all'
                          : e.target.value
                      )
                    }
                    className="bg-transparent text-xs text-slate-100 outline-none pr-5"
                  >
                    <option value="all">All</option>
                    {planFilterOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              <label className="flex flex-col">
                <div className="text-[11px] font-medium text-slate-400">
                  Status
                </div>
                <div className="mt-1 inline-flex items-center rounded-full border border-white/10 bg-[#0b1020] px-3 py-1.5">
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value === 'all'
                          ? 'all'
                          : (e.target.value as MemberStatus)
                      )
                    }
                    className="bg-transparent text-xs text-slate-100 outline-none pr-5"
                  >
                    <option value="all">All</option>
                    <option value="Active">Active</option>
                    <option value="Expiring Soon">Expiring Soon</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </label>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0b1020] px-3 py-1.5 md:w-80">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-4.35-4.35m0-5.4a7.35 7.35 0 1 1-14.7 0 7.35 7.35 0 0 1 14.7 0Z"
                />
              </svg>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Discord username or ID"
                className="flex-1 bg-transparent text-xs text-slate-100 placeholder:text-slate-500 outline-none"
              />
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020]/70 md:overflow-visible overflow-x-auto">
            <table className="min-w-full table-auto text-sm text-slate-200">
              <thead className="bg-white/5">
                <tr>
                  <th className="w-[15%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 whitespace-nowrap">
                    Discord Username
                  </th>
                  <th className="w-[17%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 whitespace-nowrap">
                    Discord ID
                  </th>
                  <th className="w-[12%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 whitespace-nowrap">
                    Plan
                  </th>
                  <th className="w-[9%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 whitespace-nowrap">
                    Price
                  </th>
                  <th className="w-[11%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 whitespace-nowrap">
                    Start Date
                  </th>
                  <th className="w-[13%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 whitespace-nowrap">
                    End Date / Lifetime
                  </th>
                  <th className="w-[7%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 whitespace-nowrap">
                    Days Left
                  </th>
                  <th className="w-[8%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 whitespace-nowrap">
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-400 w-[260px]"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {isLoading ? (
                  <tr className="hover:bg-transparent">
                    <td
                      colSpan={9}
                      className="px-4 py-8 text-center text-sm text-slate-400"
                    >
                      Loading members...
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr className="hover:bg-transparent">
                    <td
                      colSpan={9}
                      className="px-4 py-10 text-center text-sm text-slate-400"
                    >
                      No members match your filters yet.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr
                      key={member.id}
                      className="transition-colors hover:bg-white/5"
                    >
                      <td className="px-4 py-4 text-[13px] text-slate-100/90">
                        <span className="font-medium text-slate-50">
                          {member.discordUsername}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[13px] text-slate-100/90 whitespace-nowrap">
                        {member.discordId ? (
                          <span
                            title={member.discordId}
                            className="inline-flex items-center max-w-[160px] rounded-full border border-white/10 bg-[#0b1020] px-2.5 py-0.5 text-[11px] font-mono text-slate-300 overflow-hidden truncate"
                          >
                            {member.discordId}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-slate-100/90 whitespace-nowrap">
                        <span
                          className={`${getPlanBadgeClass(
                            member.plan
                          )} inline-flex items-center rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap`}
                        >
                          {member.plan}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[13px] text-slate-100/90 whitespace-nowrap">
                        {currencyFormatter.format(member.price)}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-slate-200 whitespace-nowrap">
                        {formatDate(member.startDate)}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-slate-200 whitespace-nowrap">
                        {member.endDate === 'lifetime'
                          ? 'Lifetime'
                          : formatDate(member.endDate)}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-slate-200 whitespace-nowrap">
                        {member.daysLeft === Number.POSITIVE_INFINITY
                          ? '∞'
                          : `${member.daysLeft}d`}
                      </td>
                      <td className="px-4 py-4 text-xs whitespace-nowrap">
                        <span className={getStatusBadgeClass(member.statusVariant)}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap align-middle w-[260px]">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditMember(member)}
                            className="rounded-full border border-slate-600 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-slate-800 transition"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenExtendModal(member)}
                            className="rounded-full border border-slate-600 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-slate-800 transition"
                          >
                            Extend
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(member)}
                            className="rounded-full border border-red-500/70 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300 hover:bg-red-500/20 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={editingMemberId ? 'Edit Member' : 'Add Haunted Member'}
        description={
          editingMemberId
            ? 'Update Discord access and subscription dates.'
            : 'Provision a new Haunted subscription plan.'
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="text-[var(--text-muted)]">Discord Username</span>
              <input
                value={formData.discordUsername}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    discordUsername: e.target.value,
                  }));
                  if (formErrors.discordUsername) {
                    setFormErrors((prev) => ({
                      ...prev,
                      discordUsername: undefined,
                    }));
                  }
                }}
                className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--input-background)] px-3 py-2 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                placeholder="gravewitch"
              />
              {formErrors.discordUsername && (
                <p className="text-xs text-red-400">{formErrors.discordUsername}</p>
              )}
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-[var(--text-muted)]">Discord ID</span>
              <input
                value={formData.discordId}
                maxLength={19}
                onChange={(e) => handleDiscordIdChange(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--input-background)] px-3 py-2 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                placeholder="000000000000000000"
              />
              {discordIdError && (
                <p className="text-xs text-red-400">{discordIdError}</p>
              )}
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="text-[var(--text-muted)]">Plan</span>
              <select
                value={formData.planId}
                onChange={(e) => handlePlanChange(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--input-background)] px-3 py-2 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                <option value="">Select a plan</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
              {formErrors.plan && (
                <p className="text-xs text-red-400">{formErrors.plan}</p>
              )}
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-[var(--text-muted)]">Start Date</span>
              <input
                type="date"
                value={formData.startDate}
                max={todayInput}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--input-background)] px-3 py-2 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              />
            </label>
          </div>

          <div className="space-y-2 text-sm">
            <span className="text-[var(--text-muted)]">End Date</span>
            <input
              type="date"
              value={formData.endDate}
              min={formData.startDate || undefined}
              onChange={(e) => handleEndDateChange(e.target.value)}
              disabled={formData.isLifetime}
              className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--input-background)] px-3 py-2 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-40"
            />
            <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <input
                type="checkbox"
                checked={formData.isLifetime}
                onChange={(e) => handleLifetimeToggle(e.target.checked)}
              />
              Lifetime membership
            </label>
          </div>

          {Object.keys(formErrors).length > 0 && (
            <p className="text-sm text-red-400">
              Please complete the highlighted fields before saving.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCloseModal}
              disabled={submitLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitLoading}>
              {submitLoading
                ? 'Saving...'
                : editingMemberId
                  ? 'Update Member'
                  : 'Save Member'}
            </Button>
          </div>
        </form>
      </Modal>
      <ExtendMembershipModal
        open={isExtendModalOpen}
        onClose={handleCloseExtendModal}
        onConfirm={handleConfirmExtend}
        loading={extendLoading}
        member={
          extendMember
            ? {
                id: extendMember.id,
                discordUsername: extendMember.discordUsername,
                endDate: extendMember.endDate,
              }
            : null
        }
      />
      {isDeleteModalOpen && memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141726] p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-white mb-2">
              Remove member
            </h2>
            <p className="text-sm text-white/70 mb-4">
              Are you sure you want to remove this member from Haunted access?
              This action cannot be undone.
            </p>

            <div className="mb-4 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
              <div className="text-xs uppercase tracking-wide text-white/40">
                Member
              </div>
              <div className="text-sm text-white">
                {memberToDelete.discordUsername ||
                  memberToDelete.discordId ||
                  'Unknown member'}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-lg border border-red-500/60 bg-red-500/80 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-60"
              >
                {isDeleting ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

