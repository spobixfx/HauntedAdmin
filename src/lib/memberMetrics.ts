import { type BadgeVariant } from '@/components/ui/Badge';

export type MemberStatus =
  | 'Active'
  | 'Expiring Soon'
  | 'Expired'
  | 'Pending payment';

export type DbStatus = 'active' | 'pending' | 'expired' | 'deleted';

export type RawMemberRecord = {
  id: string;
  discord_username?: string | null;
  plan?: string | null;
  price_cents?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  discount_percent?: number | null;
  deleted_at?: string | null;
  note?: string | null;
  status?: string | null;
};

export type ClassifiedMember = {
  id: string;
  discordUsername: string;
  plan: string;
  startDate: string | null;
  endDate: string | 'lifetime';
  lifetime: boolean;
  status: MemberStatus;
  statusVariant: BadgeVariant;
  daysLeft: number | null;
  discountPercent?: number;
  priceCents?: number | null;
  note?: string | null;
};

export const parseISODateOnly = (value?: string | null): Date | null => {
  if (!value) return null;
  const str = value.includes('T') ? value : `${value}T00:00:00.000Z`;
  const d = new Date(str);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const utcTodayStart = () => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

export const statusDbToUi = (value?: string | null): MemberStatus => {
  const normalized = (value || '').trim().toLowerCase();
  if (normalized === 'pending' || normalized === 'pending payment') {
    return 'Pending payment';
  }
  if (normalized === 'expired') return 'Expired';
  if (normalized === 'expiring soon') return 'Expiring Soon';
  return 'Active';
};

export const statusUiToDb = (value: MemberStatus): DbStatus => {
  if (value === 'Pending payment') return 'pending';
  if (value === 'Expired') return 'expired';
  return 'active';
};

export const classifyMemberRecord = (
  raw: RawMemberRecord,
  options?: { today?: Date; warnOnInvalidDate?: boolean }
): ClassifiedMember => {
  const today = options?.today ?? utcTodayStart();
  const uiStatus = statusDbToUi(raw.status);

  const lifetime = raw.end_date === null || raw.end_date === undefined;
  const endDateParsed = lifetime ? null : parseISODateOnly(raw.end_date);

  if (!lifetime && !endDateParsed && raw.end_date && options?.warnOnInvalidDate !== false) {
    console.warn('[memberMetrics] Invalid end_date', { id: raw.id, end_date: raw.end_date });
  }

  let daysLeft: number | null = null;
  let status: MemberStatus = uiStatus;
  let statusVariant: BadgeVariant = 'success';

  if (uiStatus === 'Pending payment') {
    daysLeft = null;
    statusVariant = 'warning';
  } else if (lifetime) {
    daysLeft = Number.POSITIVE_INFINITY;
    status = 'Active';
    statusVariant = 'success';
  } else if (endDateParsed) {
    const diffMs = endDateParsed.getTime() - today.getTime();
    daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (Number.isNaN(daysLeft)) {
      status = 'Expired';
      statusVariant = 'error';
    } else if (daysLeft < 0) {
      status = 'Expired';
      statusVariant = 'error';
    } else if (daysLeft <= 7) {
      status = 'Expiring Soon';
      statusVariant = 'warning';
    } else {
      status = 'Active';
      statusVariant = 'success';
    }
  } else {
    status = 'Expired';
    statusVariant = 'error';
  }

  return {
    id: raw.id,
    discordUsername: raw.discord_username ?? '',
    plan: raw.plan ?? 'Unknown',
    startDate: raw.start_date ?? null,
    endDate: lifetime ? 'lifetime' : raw.end_date ?? 'lifetime',
    lifetime,
    status,
    statusVariant,
    daysLeft,
    discountPercent: raw.discount_percent ?? undefined,
    priceCents: raw.price_cents ?? null,
    note: raw.note ?? null,
  };
};

export const computeMemberStats = (members: ClassifiedMember[]) => {
  const total = members.length;
  const active = members.filter((m) => m.status === 'Active').length;
  const expiringSoon = members.filter((m) => m.status === 'Expiring Soon').length;
  const expired = members.filter((m) => m.status === 'Expired').length;
  const trialConversions = total ? Math.round((active / total) * 100) : 0;
  return { total, active, expiringSoon, expired, trialConversions };
};


