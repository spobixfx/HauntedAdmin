'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

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

type ImportOptionMode = 'add' | 'set';

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
  discountPercent: number;
  deletedAt?: string | null;
  deletedReason?: string | null;
  deletedBy?: string | null;
}

interface Member extends MemberInput {
  id: string;
  status: MemberStatus;
  statusVariant: BadgeVariant;
  daysLeft: number;
  effectivePrice: number;
}

type ApiMember = {
  id: string;
  discord_username: string | null;
  discord_id: string | null;
  plan: string | null;
  price_cents: number | null;
  start_date: string | null;
  end_date: string | null;
   discount_percent: number | null;
   deleted_at: string | null;
   deleted_reason: string | null;
   deleted_by: string | null;
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const parseDiscountInput = (value: string) => {
  if (value === '') return 0;
  if (!/^\d+(\.\d+)?$/.test(value)) return 0;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(100, Math.max(0, parsed));
};

const clampDiscount = (value: number) =>
  Math.min(100, Math.max(0, Math.round(value * 100) / 100));

const computeEffectivePriceCents = (basePriceCents: number, discount: number) => {
  const safeBase = Number.isFinite(basePriceCents) ? basePriceCents : 0;
  const pct = clampDiscount(Number.isFinite(discount) ? discount : 0);
  return Math.round(safeBase * (1 - pct / 100));
};

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
  const safeDiscount = clampDiscount(member.discountPercent || 0);
  const effectivePrice =
    Math.round(
      (member.price || 0) * 100 * (1 - safeDiscount / 100)
    ) / 100;

  if (member.endDate === 'lifetime') {
    return {
      ...member,
      effectivePrice,
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
    effectivePrice,
    id: id ?? generateId(),
    status,
    statusVariant,
    daysLeft,
  };
}

const mapApiMember = (member: ApiMember): Member => {
  const priceUsd =
    typeof member.price_cents === 'number' ? member.price_cents / 100 : 0;
  const discountPercent =
    typeof member.discount_percent === 'number'
      ? clampDiscount(member.discount_percent)
      : 0;

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
      discountPercent,
      deletedAt: member.deleted_at,
      deletedReason: member.deleted_reason,
      deletedBy: member.deleted_by,
    },
    member.id
  );
};

const actionButtonBase =
  'inline-flex h-8 items-center gap-1 rounded-full border px-3 text-[11px] font-medium transition whitespace-nowrap';
const actionButtonNeutral =
  `${actionButtonBase} border-white/15 bg-white/5 text-slate-100 hover:bg-white/10`;
const actionButtonDestructive =
  `${actionButtonBase} border-red-500/60 bg-red-500/10 text-red-200 hover:bg-red-500/20`;
const actionButtonSuccess =
  `${actionButtonBase} border-emerald-500/60 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20`;

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
  discountPercent: number;
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
    discountPercent: 0,
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
    discountPercent: member.discountPercent ?? 0,
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
  const [sortByStartDate, setSortByStartDate] = useState<'asc' | 'desc'>('desc');
  const [viewTab, setViewTab] = useState<'active' | 'trash'>('active');
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [discordIdError, setDiscordIdError] = useState<string | null>(null);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [extendMember, setExtendMember] = useState<Member | null>(null);
  const [extendLoading, setExtendLoading] = useState(false);
  const [discountInput, setDiscountInput] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{
    discordUsername?: string;
    plan?: string;
  }>({});
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'soft' | 'force'>('soft');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFileName, setImportFileName] = useState<string>('');
  const [importRows, setImportRows] = useState<
    {
      index: number;
      raw: Record<string, string>;
      errors: string[];
      action: 'create' | 'update' | 'skip';
      targetId?: string;
      normalized?: {
        discordUsername: string;
        discordId: string | null;
        planId?: string;
        planName: string;
        startDate: string;
        endDate: string | 'lifetime';
        discountPercent: number;
      };
    }[]
  >([]);
  const [importSummary, setImportSummary] = useState<{
    total: number;
    valid: number;
    skipped: number;
    errors: number;
  }>({ total: 0, valid: 0, skipped: 0, errors: 0 });
  const [importOptions, setImportOptions] = useState<{
    createOnly: boolean;
    upsertByDiscordId: boolean;
  }>({ createOnly: false, upsertByDiscordId: true });
  const [importLoading, setImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState<{ done: number; total: number }>({
    done: 0,
    total: 0,
  });
  const [importError, setImportError] = useState<string | null>(null);
  const [allMembersForImport, setAllMembersForImport] = useState<Member[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

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

  const planPriceMap = useMemo(() => {
    const map = new Map<string, number>();
    plans.forEach((plan) => {
      if (typeof plan.priceCents === 'number') {
        map.set(plan.name, plan.priceCents);
      }
    });
    return map;
  }, [plans]);

  const getBasePriceCentsForMember = (member: Member) => {
    const planPrice = planPriceMap.get(member.plan);
    if (typeof planPrice === 'number') return planPrice;
    return Math.round((member.price || 0) * 100);
  };

  const getEffectivePriceForMember = (member: Member) => {
    const baseCents = getBasePriceCentsForMember(member);
    const effectiveCents = computeEffectivePriceCents(
      baseCents,
      member.discountPercent
    );
    return {
      base: baseCents / 100,
      effective: effectiveCents / 100,
    };
  };

  useEffect(() => {
    let isMounted = true;

    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        const endpoint =
          viewTab === 'trash' ? '/api/members?trashed=true' : '/api/members';
        const res = await fetch(endpoint, { cache: 'no-store' });
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
  }, [viewTab]);

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
    setDiscountInput('');
    setFormErrors({});
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMemberId(null);
    const initialPlan =
      findDefaultLifetimePlan(plans) ?? plans[0];
    setFormData(defaultFormState(initialPlan));
    setDiscountInput('');
    setFormErrors({});
  };

  const handleEditMember = (member: Member) => {
    setEditingMemberId(member.id);
    const matchingPlan = plans.find((plan) => plan.name === member.plan);
    setFormData(formStateFromMember(member, matchingPlan));
    setDiscountInput(
      member.discountPercent && member.discountPercent > 0
        ? String(member.discountPercent)
        : ''
    );
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (member: Member) => {
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
    setDeleteMode(viewTab === 'trash' ? 'force' : 'soft');
    setIsDeleting(false);
  };

  const handleOpenExtendModal = (member: Member) => {
    setExtendMember(member);
    setIsExtendModalOpen(true);
  };

  const handleOpenImportModal = async () => {
    setIsImportModalOpen(true);
    setImportError(null);
    setImportRows([]);
    setImportSummary({ total: 0, valid: 0, skipped: 0, errors: 0 });
    setImportProgress({ done: 0, total: 0 });
    try {
      const [activeRes, trashRes] = await Promise.all([
        fetch('/api/members', { cache: 'no-store' }),
        fetch('/api/members?trashed=true', { cache: 'no-store' }),
      ]);
      const active = activeRes.ok ? ((await activeRes.json()) as ApiMember[]) : [];
      const trash = trashRes.ok ? ((await trashRes.json()) as ApiMember[]) : [];
      const mapped = [...active, ...trash].map(mapApiMember);
      setAllMembersForImport(mapped);
    } catch (error) {
      console.error('[IMPORT_FETCH_MEMBERS]', error);
    }
  };

  const handleCloseImportModal = () => {
    if (importLoading) return;
    setIsImportModalOpen(false);
    setImportRows([]);
    setImportFileName('');
    setImportError(null);
    setImportProgress({ done: 0, total: 0 });
    setIsDragOver(false);
  };
  const clearImportSelection = () => {
    setImportRows([]);
    setImportFileName('');
    setImportSummary({ total: 0, valid: 0, skipped: 0, errors: 0 });
    setImportError(null);
    setImportProgress({ done: 0, total: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCloseExtendModal = () => {
    setIsExtendModalOpen(false);
    setExtendMember(null);
    setExtendLoading(false);
  };

  const handleConfirmExtend = async (
    payload: { mode: 'add'; days: number } | { mode: 'set'; endDate: string }
  ) => {
    if (!extendMember) return;
    setExtendLoading(true);
    setFetchError(null);
    try {
      const bodyPayload =
        payload.mode === 'add'
          ? { extendDays: payload.days }
          : { setEndDate: payload.endDate };

      const res = await fetch(
        `/api/members/${encodeURIComponent(extendMember.id)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
        }
      );

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
      const endpoint =
        deleteMode === 'force'
          ? `/api/members/${encodeURIComponent(memberToDelete.id)}?force=true`
          : `/api/members/${encodeURIComponent(memberToDelete.id)}`;

      const res = await fetch(endpoint, {
        method: 'DELETE',
      });

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

  const handleRestore = async (member: Member) => {
    setFetchError(null);
    try {
      const res = await fetch(
        `/api/members/${encodeURIComponent(member.id)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ restore: true }),
        }
      );

      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.member) {
        const message =
          body?.error || body?.message || 'Failed to restore member';
        setFetchError(message);
        return;
      }

      setMembers((prev) => prev.filter((m) => m.id !== member.id));
    } catch (error) {
      console.error('[MEMBERS_RESTORE]', error);
      setFetchError(
        (error as any)?.message || 'Unable to restore member. Please try again.'
      );
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

  const handleDiscountChange = (value: string) => {
    if (value === '') {
      setDiscountInput('');
      setFormData((prev) => ({ ...prev, discountPercent: 0 }));
      return;
    }
    if (!/^\d+$/.test(value)) return;
    setDiscountInput(value);
    const parsed = parseDiscountInput(value);
    setFormData((prev) => ({ ...prev, discountPercent: parsed }));
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
    const filtered = members.filter((member) => {
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

    const getStartTime = (value: string | null | undefined) => {
      if (!value) return null;
      const time = new Date(value).getTime();
      return Number.isFinite(time) ? time : null;
    };

    return filtered
      .slice()
      .sort((a, b) => {
        const aTime = getStartTime(a.startDate);
        const bTime = getStartTime(b.startDate);

        if (aTime === null && bTime === null) return 0;
        if (aTime === null) return 1;
        if (bTime === null) return -1;

        if (sortByStartDate === 'desc') {
          return bTime - aTime;
        }
        return aTime - bTime;
      });
  }, [members, planFilter, statusFilter, searchQuery, sortByStartDate]);

  const summary = useMemo(() => {
    let totalRevenue = 0;
    let totalDiscount = 0;

    filteredMembers.forEach((member) => {
      const { base, effective } = getEffectivePriceForMember(member);
      totalRevenue += effective;
      totalDiscount += Math.max(0, base - effective);
    });

    return {
      count: filteredMembers.length,
      revenue: totalRevenue,
      discount: totalDiscount,
    };
  }, [filteredMembers, planPriceMap]);

  const exportCsv = () => {
    const headers = [
      'discord_username',
      'discord_id',
      'plan_name',
      'plan_id',
      'start_date',
      'end_date',
      'lifetime',
      'discount_percent',
      'discount_note',
      'status',
    ];

    const findPlanId = (planName: string) => {
      const found = plans.find((p) => p.name === planName);
      return found?.id ?? '';
    };

    const rows = filteredMembers.map((m) => {
      const lifetime = m.endDate === 'lifetime' || !m.endDate;
      const endDate = lifetime ? '' : formatInputDate(new Date(m.endDate));
      const startDate = m.startDate ? formatInputDate(new Date(m.startDate)) : '';
      return [
        m.discordUsername,
        m.discordId ?? '',
        m.plan,
        findPlanId(m.plan),
        startDate,
        endDate,
        lifetime ? 'true' : 'false',
        m.discountPercent ? String(m.discountPercent) : '',
        '',
        m.status,
      ];
    });

    const csvContent = [headers, ...rows]
      .map((cols) =>
        cols
          .map((c) => {
            const value = c ?? '';
            if (/[",\n]/.test(value)) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);
    link.href = url;
    link.download = `members_export_${dateStr}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

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

    const discountPercentValue = parseDiscountInput(discountInput);

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
      discountPercent: discountPercentValue,
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

      setDiscountInput(
        discountPercentValue > 0 ? String(discountPercentValue) : ''
      );
      handleCloseModal();
    } catch (error) {
      console.error('[MEMBERS_SAVE]', error);
      alert('Unable to save member. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const formBasePriceCents = Math.round((formData.price || 0) * 100);
  const discountPercentForPreview = parseDiscountInput(discountInput);
  const formEffectivePrice =
    computeEffectivePriceCents(formBasePriceCents, discountPercentForPreview) /
    100;

  const csvTemplate = useMemo(() => {
    const headers = [
      'discord_username',
      'discord_id',
      'plan_name',
      'plan_id',
      'start_date',
      'end_date',
      'lifetime',
      'discount_percent',
      'discount_note',
      'status',
    ].join(',');
    const example = [
      'ghostlyuser',
      '123456789012345678',
      'Haunted',
      plans[0]?.id ?? '',
      '2025-01-01',
      '',
      'true',
      '0',
      '',
      'Active',
    ].join(',');
    return `${headers}\n${example}`;
  }, [plans]);

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'members_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const parseCsvText = (text: string) => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (!lines.length) return [];

    const parseLine = (line: string) => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"' && line[i + 1] === '"' && inQuotes) {
          current += '"';
          i++;
          continue;
        }
        if (ch === '"') {
          inQuotes = !inQuotes;
          continue;
        }
        if (ch === ',' && !inQuotes) {
          result.push(current);
          current = '';
          continue;
        }
        current += ch;
      }
      result.push(current);
      return result;
    };

    const headers = parseLine(lines[0]).map((h) => h.trim().toLowerCase());
    const rows: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseLine(lines[i]);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = cols[idx] ?? '';
      });
      const hasContent = Object.values(row).some((v) => v && v.trim().length > 0);
      if (hasContent) rows.push(row);
    }
    return rows;
  };

  const normalizeDateIso = (value: string) => {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  };

  const handleCsvFile = async (file: File) => {
    setImportError(null);
    setImportFileName(file.name);
    const text = await file.text();
    const rows = parseCsvText(text);
    const planNameMap = new Map<string, Plan>();
    plans.forEach((p) => planNameMap.set(p.name.toLowerCase(), p));

    const membersByDiscordId = new Map<string, Member>();
    allMembersForImport.forEach((m) => {
      if (m.discordId) membersByDiscordId.set(m.discordId, m);
    });

    const parsed = rows.map((row, idx) => {
      const errors: string[] = [];
      const discordUsername = (row['discord_username'] || '').trim();
      const discordId = (row['discord_id'] || '').trim() || null;
      if (!discordUsername) errors.push('discord_username required');

      const planIdRaw = (row['plan_id'] || '').trim();
      const planNameRaw = (row['plan_name'] || '').trim();
      let plan: Plan | undefined;
      if (planIdRaw) {
        plan = plans.find((p) => p.id === planIdRaw);
      }
      if (!plan && planNameRaw) {
        plan = planNameMap.get(planNameRaw.toLowerCase());
      }
      if (!plan) errors.push('plan not found');

      const startDateRaw = (row['start_date'] || '').trim();
      const startDate = normalizeDateIso(startDateRaw);
      if (!startDate) errors.push('start_date invalid');

      const lifetimeRaw = (row['lifetime'] || '').trim().toLowerCase();
      const isLifetime = lifetimeRaw === 'true' || lifetimeRaw === '1';
      const endDateRaw = (row['end_date'] || '').trim();
      const endDate = isLifetime ? 'lifetime' : normalizeDateIso(endDateRaw) || '';
      if (!isLifetime && !endDate) {
        errors.push('end_date required or set lifetime=true');
      }
      const discountPercentRaw = (row['discount_percent'] || '').trim();
      let discountPercent = 0;
      if (discountPercentRaw) {
        const num = Number(discountPercentRaw);
        if (!Number.isFinite(num) || num < 0 || num > 100) {
          errors.push('discount_percent must be 0-100');
        } else {
          discountPercent = Math.round(num * 100) / 100;
        }
      }

      const existing = discordId ? membersByDiscordId.get(discordId) : undefined;
      let action: 'create' | 'update' | 'skip' = 'create';
      let targetId: string | undefined;
      if (existing) {
        if (importOptions.createOnly) {
          action = 'skip';
        } else if (importOptions.upsertByDiscordId) {
          action = 'update';
          targetId = existing.id;
        }
      }

      if (errors.length > 0) {
        action = 'skip';
      }

      return {
        index: idx + 1,
        raw: row,
        errors,
        action,
        targetId,
        normalized:
          errors.length === 0 && plan && startDate
            ? {
                discordUsername,
                discordId,
                planId: plan.id,
                planName: plan.name,
                startDate,
                endDate,
                discountPercent,
              }
            : undefined,
      };
    });

    const summary = parsed.reduce(
      (acc, row) => {
        acc.total += 1;
        if (row.errors.length > 0) acc.errors += 1;
        else if (row.action === 'skip') acc.skipped += 1;
        else acc.valid += 1;
        return acc;
      },
      { total: 0, valid: 0, skipped: 0, errors: 0 }
    );

    setImportRows(parsed);
    setImportSummary(summary);
  };

  const handleFileSelected = (file: File) => {
    const isCsv =
      file.type === 'text/csv' ||
      file.type === 'application/vnd.ms-excel' ||
      file.name.toLowerCase().endsWith('.csv');
    if (!isCsv) {
      setImportError('Please select a CSV file.');
      return;
    }
    handleCsvFile(file).catch((err) => {
      console.error(err);
      setImportError('Failed to read CSV file.');
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const runImport = async () => {
    if (!importRows.length) {
      setImportError('Parse a CSV file first.');
      return;
    }
    const actionable = importRows.filter(
      (r) => r.action !== 'skip' && r.normalized
    );
    if (!actionable.length) {
      setImportError('No valid rows to import.');
      return;
    }
    setImportError(null);
    setImportLoading(true);
    setImportProgress({ done: 0, total: actionable.length });

    const payloads = actionable.map((row) => {
      const n = row.normalized!;
      const priceUsd =
        plans.find((p) => p.id === n.planId)?.priceCents
          ? (plans.find((p) => p.id === n.planId)!.priceCents ?? 0) / 100
          : 0;
      return {
        row,
        body: {
          id: row.action === 'update' ? row.targetId : undefined,
          discordUsername: n.discordUsername,
          discordId: n.discordId,
          planName: n.planName,
          plan: n.planName,
          priceUsd,
          price: priceUsd,
          startDate: n.startDate,
          endDate: n.endDate === 'lifetime' ? '' : n.endDate,
          discountPercent: n.discountPercent,
        },
      };
    });

    const chunk = 3;
    const results = { created: 0, updated: 0, failed: 0, skipped: 0 };

    for (let i = 0; i < payloads.length; i += chunk) {
      const slice = payloads.slice(i, i + chunk);
      await Promise.all(
        slice.map(async (item) => {
          try {
            const method =
              item.row.action === 'update' && item.body.id ? 'PATCH' : 'POST';
            const res = await fetch('/api/members', {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item.body),
            });
            const data = await res.json().catch(() => null);
            if (!res.ok || !data?.member) {
              results.failed += 1;
              return;
            }
            const mapped = mapApiMember(data.member as ApiMember);
            setMembers((prev) => {
              const exists = prev.find((m) => m.id === mapped.id);
              if (exists) {
                return prev.map((m) => (m.id === mapped.id ? mapped : m));
              }
              return [mapped, ...prev];
            });
            if (item.row.action === 'update') results.updated += 1;
            else results.created += 1;
          } catch (error) {
            console.error('[IMPORT_ROW]', error);
            results.failed += 1;
          } finally {
            setImportProgress((prev) => ({
              done: prev.done + 1,
              total: prev.total,
            }));
          }
        })
      );
    }

    setImportLoading(false);
    setImportSummary((prev) => ({
      ...prev,
      valid: results.created + results.updated,
      errors: prev.errors + results.failed,
      skipped: prev.skipped,
    }));
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

          <div className="mt-8 w-full rounded-3xl border border-slate-800/70 bg-[#090d16] px-6 py-6 shadow-[0_18px_45px_rgba(0,0,0,0.55)] overflow-hidden">
        <div className="px-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-50">Members</h2>
              <p className="mt-1 text-xs text-slate-400">
                Subscription health across all haunted tiers.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center rounded-full border border-white/10 bg-[#0b1020] p-1 text-xs text-slate-200">
                <button
                  type="button"
                  onClick={() => setViewTab('active')}
                  className={`rounded-full px-3 py-1 font-semibold transition ${
                    viewTab === 'active'
                      ? 'bg-white/10 text-slate-50 shadow-[0_0_15px_rgba(255,255,255,0.12)]'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setViewTab('trash')}
                  className={`rounded-full px-3 py-1 font-semibold transition ${
                    viewTab === 'trash'
                      ? 'bg-white/10 text-slate-50 shadow-[0_0_15px_rgba(255,255,255,0.12)]'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  Trash
                </button>
              </div>
              <button
                type="button"
                onClick={exportCsv}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-50 hover:bg-white/10 transition"
              >
                Export CSV
              </button>
              <button
                type="button"
                onClick={handleOpenImportModal}
                className="rounded-full border border-indigo-500/60 bg-indigo-500/15 px-4 py-2 text-xs font-semibold text-indigo-100 hover:bg-indigo-500/25 transition"
              >
                Import CSV
              </button>
              <button
                type="button"
                onClick={handleOpenModal}
                className="rounded-full bg-[#2563eb] px-4 py-2 text-xs font-semibold text-slate-50 shadow-[0_0_25px_rgba(37,99,235,0.45)] hover:bg-[#1d4ed8] transition"
              >
              Add Member
              </button>
            </div>
          </div>

          {fetchError && (
            <p className="px-1 pt-3 text-sm text-red-400">{fetchError}</p>
          )}
          {plansError && (
            <p className="px-1 pt-2 text-sm text-red-400">{plansError}</p>
          )}

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-4">
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

              <label className="flex flex-col">
                <div className="text-[11px] font-medium text-slate-400">
                  Start date
            </div>
                <div className="mt-1 inline-flex items-center rounded-full border border-white/10 bg-[#0b1020] px-3 py-1.5">
                  <select
                    value={sortByStartDate}
                    onChange={(e) =>
                      setSortByStartDate(
                        e.target.value === 'asc' ? 'asc' : 'desc'
                      )
                    }
                    className="bg-transparent text-xs text-slate-100 outline-none pr-5"
                  >
                    <option value="desc">Start date: Newest</option>
                    <option value="asc">Start date: Oldest</option>
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

          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020]/70">
            <div className="overflow-x-auto">
              <table className="min-w-full table-fixed text-sm text-slate-200">
              <thead className="bg-white/5">
                <tr>
                  <th className="w-[14%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 whitespace-nowrap">
                    Discord Username
                  </th>
                  <th className="w-[14%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 whitespace-nowrap">
                    Discord ID
                  </th>
                  <th className="w-[11%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 whitespace-nowrap">
                    Plan
                  </th>
                  <th className="w-[9%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 whitespace-nowrap">
                    Price
                  </th>
                  <th className="w-[8%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 whitespace-nowrap">
                    Discount
                  </th>
                  <th className="w-[11%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 whitespace-nowrap">
                    Start Date
                  </th>
                  <th className="w-[12%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 whitespace-nowrap">
                    {viewTab === 'trash' ? 'Deleted At' : 'End Date / Lifetime'}
                  </th>
                  <th className="w-[6%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 whitespace-nowrap">
                    Days Left
                  </th>
                  <th className="w-[7%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 whitespace-nowrap">
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 w-[260px] whitespace-nowrap"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
              {isLoading ? (
                  <tr className="hover:bg-transparent">
                    <td
                    colSpan={viewTab === 'trash' ? 10 : 10}
                      className="px-4 py-8 text-center text-sm text-slate-400"
                  >
                    Loading members...
                    </td>
                  </tr>
              ) : filteredMembers.length === 0 ? (
                  <tr className="hover:bg-transparent">
                    <td
                    colSpan={viewTab === 'trash' ? 10 : 10}
                      className="px-4 py-10 text-center text-sm text-slate-400"
                  >
                    No members match your filters yet.
                    </td>
                  </tr>
              ) : (
                <>
                  {filteredMembers.map((member) => (
                    <tr
                      key={member.id}
                      className="transition-colors hover:bg-white/5"
                    >
                      <td className="px-4 py-4 text-[13px] text-slate-100/90">
                        <span className="font-medium text-slate-50 inline-block max-w-[220px] truncate">
                      {member.discordUsername}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[13px] text-slate-100/90 whitespace-nowrap">
                        {member.discordId ? (
                          <span
                            title={member.discordId}
                            className="inline-flex items-center max-w-[180px] rounded-full border border-white/10 bg-[#0b1020] px-2.5 py-0.5 text-[11px] font-mono text-slate-300 overflow-hidden truncate"
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
                        {(() => {
                          const pricing = getEffectivePriceForMember(member);
                          const hasDiscount = member.discountPercent > 0;
                          return (
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-50">
                                {currencyFormatter.format(pricing.effective)}
                              </span>
                              {hasDiscount && (
                                <span className="text-[11px] text-slate-400 line-through">
                                  {currencyFormatter.format(pricing.base)}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-slate-100/90 whitespace-nowrap">
                        {member.discountPercent > 0 ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-900/40 px-2.5 py-0.5 text-[11px] font-medium text-emerald-200 border border-emerald-700/60">
                            -{member.discountPercent}%
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-slate-200 whitespace-nowrap">
                      {formatDate(member.startDate)}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-slate-200 whitespace-nowrap">
                        {viewTab === 'trash'
                          ? formatDate(member.deletedAt ?? undefined)
                          : member.endDate === 'lifetime'
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
                      <td className="px-3 py-3 text-right whitespace-nowrap align-middle w-[260px]">
                        {viewTab === 'trash' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleRestore(member)}
                              className={actionButtonSuccess}
                            >
                              Restore
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteModal(member)}
                              className={actionButtonDestructive}
                            >
                              Delete permanently
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                          onClick={() => handleEditMember(member)}
                              className={actionButtonNeutral}
                        >
                          Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenExtendModal(member)}
                              className={actionButtonNeutral}
                            >
                              Extend
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteModal(member)}
                              className={actionButtonDestructive}
                        >
                          Delete
                            </button>
                      </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-white/5 text-[13px] text-slate-100/90">
                    <td className="px-4 py-4 font-semibold text-slate-50">
                      Totals
                    </td>
                    <td className="px-4 py-4 text-slate-400">—</td>
                    <td className="px-4 py-4 text-slate-400">—</td>
                    <td className="px-4 py-4 text-slate-100/90 whitespace-nowrap">
                      <span className="font-semibold">
                        Total: {summary.count} member
                        {summary.count === 1 ? '' : 's'} ·{' '}
                        {currencyFormatter.format(summary.revenue)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-300 whitespace-nowrap">
                      {summary.discount > 0
                        ? `Discounts: ${currencyFormatter.format(summary.discount)}`
                        : '—'}
                    </td>
                    <td className="px-4 py-4 text-slate-400">—</td>
                    <td className="px-4 py-4 text-slate-400">—</td>
                    <td className="px-4 py-4 text-slate-400">—</td>
                    <td className="px-4 py-4 text-slate-400">—</td>
                    <td className="px-3 py-3 text-right whitespace-nowrap align-middle w-[260px]" />
                  </tr>
                </>
              )}
              </tbody>
              </table>
            </div>
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

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="text-[var(--text-muted)]">Discount (%)</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={discountInput}
                onChange={(e) => handleDiscountChange(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--input-background)] px-3 py-2 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                placeholder="0"
              />
              <p className="text-xs text-[var(--text-muted)]">
                Apply a member-specific percent discount (0–100).
              </p>
            </label>
          </div>

          <div className="rounded-xl border border-[var(--border-muted)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-primary)]">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Base price</span>
              <span className="font-semibold">
                {formBasePriceCents > 0
                  ? currencyFormatter.format(formBasePriceCents / 100)
                  : '—'}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Discount</span>
              <span className="font-semibold text-emerald-300">
                {formData.discountPercent > 0
                  ? `-${formData.discountPercent}%`
                  : '0%'}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Effective price</span>
              <span className="font-semibold text-slate-50">
                {formBasePriceCents > 0
                  ? currencyFormatter.format(formEffectivePrice)
                  : '—'}
              </span>
            </div>
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
                startDate: extendMember.startDate,
                endDate: extendMember.endDate,
                planName: extendMember.plan,
                basePriceCents: getBasePriceCentsForMember(extendMember),
                discountPercent: extendMember.discountPercent,
              }
            : null
        }
      />
      {isImportModalOpen && (
        <Modal
          open={isImportModalOpen}
          onClose={handleCloseImportModal}
          title="Import Members from CSV"
          description="Upload a CSV to create or update members. Filters do not affect import."
        >
          <div className="space-y-4 text-sm text-slate-200">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs text-slate-400">
                  Supported columns: discord_username, discord_id, plan_name/plan_id, start_date (YYYY-MM-DD), end_date, lifetime, discount_percent, discount_note, status.
                </p>
                <p className="text-xs text-slate-400">
                  Lifetime=true requires end_date empty. Upsert uses discord_id when enabled.
                </p>
              </div>
              <button
                type="button"
                onClick={downloadTemplate}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-slate-100 hover:bg-white/10 transition"
              >
                Download template CSV
              </button>
            </div>

            <div
              className={`rounded-2xl border border-dashed px-4 py-4 bg-[#0b1020] transition ${
                isDragOver
                  ? 'border-indigo-500/70 shadow-[0_0_20px_rgba(79,70,229,0.4)]'
                  : 'border-white/15'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                const file = e.dataTransfer?.files?.[0];
                if (file) handleFileSelected(file);
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={handleFileInputChange}
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-4 py-2 text-xs font-semibold text-slate-50 shadow-[0_0_18px_rgba(37,99,235,0.45)] hover:bg-[#1d4ed8] transition"
                  >
                    <Upload size={14} />
                    Choose CSV file
                  </button>
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={
                        importFileName
                          ? 'text-slate-100'
                          : 'text-slate-500'
                      }
                    >
                      {importFileName || 'No file selected'}
                    </span>
                    {importFileName && (
                      <>
                        <button
                          type="button"
                          className="text-indigo-200 hover:text-indigo-100 transition"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-rose-200 hover:text-rose-100 transition"
                          onClick={clearImportSelection}
                        >
                          <X size={12} />
                          Clear
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-[11px] text-slate-400">
                  Drag & drop CSV here or use the button
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center gap-2 text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={importOptions.createOnly}
                  onChange={(e) =>
                    setImportOptions((prev) => ({
                      ...prev,
                      createOnly: e.target.checked,
                    }))
                  }
                />
                Create new members only (skip existing)
              </label>
              <label className="inline-flex items-center gap-2 text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={importOptions.upsertByDiscordId}
                  onChange={(e) =>
                    setImportOptions((prev) => ({
                      ...prev,
                      upsertByDiscordId: e.target.checked,
                    }))
                  }
                  disabled={importOptions.createOnly}
                />
                Upsert by Discord ID
              </label>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0b1020] px-3 py-3 text-xs text-slate-200">
              <div className="flex items-center justify-between">
                <span>Total rows: {importSummary.total}</span>
                <span>Valid: {importSummary.valid}</span>
                <span>Skipped: {importSummary.skipped}</span>
                <span>Errors: {importSummary.errors}</span>
              </div>
              {importProgress.total > 0 && (
                <div className="mt-2 text-[11px] text-slate-400">
                  Importing {importProgress.done}/{importProgress.total}...
                </div>
              )}
            </div>

            {importRows.length > 0 && (
              <div className="max-h-64 overflow-auto rounded-xl border border-white/10 bg-[#0b1020]">
                <table className="min-w-full text-[11px] text-slate-200">
                  <thead className="bg-white/5 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">#</th>
                      <th className="px-3 py-2 text-left">Discord</th>
                      <th className="px-3 py-2 text-left">Plan</th>
                      <th className="px-3 py-2 text-left">Start</th>
                      <th className="px-3 py-2 text-left">End</th>
                      <th className="px-3 py-2 text-left">Action</th>
                      <th className="px-3 py-2 text-left">Errors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {importRows.slice(0, 10).map((row) => (
                      <tr key={row.index}>
                        <td className="px-3 py-2">{row.index}</td>
                        <td className="px-3 py-2">
                          {row.normalized?.discordUsername || row.raw['discord_username'] || '—'}
                        </td>
                        <td className="px-3 py-2">
                          {row.normalized?.planName || row.raw['plan_name'] || row.raw['plan_id'] || '—'}
                        </td>
                        <td className="px-3 py-2">{row.normalized?.startDate || row.raw['start_date'] || '—'}</td>
                        <td className="px-3 py-2">
                          {row.normalized?.endDate === 'lifetime'
                            ? 'lifetime'
                            : row.normalized?.endDate ||
                              row.raw['end_date'] ||
                              (row.raw['lifetime'] === 'true' ? 'lifetime' : '—')}
                        </td>
                        <td className="px-3 py-2 capitalize">{row.action}</td>
                        <td className="px-3 py-2 text-red-300">
                          {row.errors.length ? row.errors.join('; ') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {importError && <p className="text-xs text-red-400">{importError}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCloseImportModal}
                className="rounded-full border border-slate-700/70 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/70 transition"
                disabled={importLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={runImport}
                disabled={importLoading || importRows.length === 0}
                className="rounded-full border border-indigo-500/70 bg-indigo-600/80 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_12px_rgba(79,70,229,0.5)] transition hover:bg-indigo-500 disabled:opacity-50"
              >
                {importLoading ? 'Importing...' : 'Run Import'}
              </button>
            </div>
          </div>
        </Modal>
      )}
      {isDeleteModalOpen && memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141726] p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-white mb-2">
              {deleteMode === 'force' ? 'Delete permanently' : 'Remove member'}
            </h2>
            <p className="text-sm text-white/70 mb-4">
              {deleteMode === 'force'
                ? 'This will permanently delete the member record. This action cannot be undone.'
                : 'Are you sure you want to move this member to Trash? You can restore them later from Trash.'}
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
                {isDeleting
                  ? deleteMode === 'force'
                    ? 'Deleting...'
                    : 'Removing...'
                  : deleteMode === 'force'
                    ? 'Delete permanently'
                    : 'Move to Trash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

