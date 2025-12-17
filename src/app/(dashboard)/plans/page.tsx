'use client';

import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { getPlanBadgeClass } from '@/components/PlanBadge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
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
  durationDays: number | null; // null = lifetime
  active: boolean;
};

type ApiPlan = {
  id: string;
  name: string;
  price_cents: number | null;
  duration_days: number | null;
  active: boolean | null;
};

type PlanFormState = {
  name: string;
  price: string;        // from input, in USD
  durationDays: string; // empty string = lifetime
  active: boolean;
};

type PlanFormErrors = {
  name?: string;
  price?: string;
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function mapApiPlan(api: ApiPlan): Plan {
  const priceCents =
    typeof api.price_cents === 'number' ? api.price_cents : 0;
  const durationDays =
    typeof api.duration_days === 'number' ? api.duration_days : null;
  const active = api.active ?? false;

  return {
    id: api.id,
    name: api.name,
    priceCents,
    durationDays,
    active,
  };
}

const defaultFormState: PlanFormState = {
  name: '',
  price: '',
  durationDays: '',
  active: true,
};

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState<PlanFormState>(defaultFormState);
  const [formErrors, setFormErrors] = useState<PlanFormErrors>({});
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  // Initial load from /api/plans
  useEffect(() => {
    let isMounted = true;

    const fetchPlans = async () => {
      try {
        const res = await fetch('/api/plans', { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Failed to load plans');
        }

        const data = (await res.json()) as ApiPlan[];
        if (!isMounted) return;

        setPlans(data.map(mapApiPlan));
        setError(null);
      } catch (err) {
        console.error('[PLANS_PAGE_FETCH]', err);
        if (isMounted) {
          setError('Unable to load plans right now. Try again shortly.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPlans();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenModal = () => {
    setFormData(defaultFormState);
    setFormErrors({});
    setEditingPlanId(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSubmitLoading(false);
    setFormErrors({});
    setEditingPlanId(null);
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setFormData({
      name: plan.name,
      price: (plan.priceCents / 100).toString(),
      durationDays: plan.durationDays === null ? '' : plan.durationDays.toString(),
      active: plan.active,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDeletePlan = async (id: string) => {
    const confirmed = window.confirm('Delete this plan? This cannot be undone.');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/plans/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        alert('Unable to delete plan. Please try again.');
        return;
      }

      setPlans((prev) => prev.filter((plan) => plan.id !== id));
    } catch (err) {
      console.error('[PLANS_DELETE_EXCEPTION]', err);
      alert('Unable to delete plan. Please try again.');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors: PlanFormErrors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required.';
    }

    const parsedPrice = parseFloat(formData.price);
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      errors.price = 'Enter a valid price.';
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitLoading(true);

    const payload = {
      name: formData.name.trim(),
      priceCents: Math.round(parsedPrice * 100),
      durationDays:
        formData.durationDays.trim() === ''
          ? null
          : Number.parseInt(formData.durationDays, 10),
      active: formData.active,
    };

    try {
      const endpoint = editingPlanId
        ? `/api/plans/${editingPlanId}`
        : '/api/plans';
      const method = editingPlanId ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error('[PLANS_SAVE_ERROR]', await res.text());
        alert(
          editingPlanId
            ? 'Unable to update plan. Please try again.'
            : 'Unable to create plan. Please try again.'
        );
        setSubmitLoading(false);
        return;
      }

      const savedPlan = (await res.json()) as Plan;

      setPlans((prev) => {
        if (editingPlanId) {
          return prev.map((plan) =>
            plan.id === editingPlanId ? savedPlan : plan
          );
        }
        return [savedPlan, ...prev];
      });

      handleCloseModal();
    } catch (err) {
      console.error('[PLANS_SAVE_EXCEPTION]', err);
      alert(
        editingPlanId
          ? 'Unable to update plan. Please try again.'
          : 'Unable to create plan. Please try again.'
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl w-full mx-auto px-6 pb-16">
      <div className="mt-8 w-full rounded-3xl border border-slate-800/70 bg-[#090d16] px-6 py-6 shadow-[0_18px_45px_rgba(0,0,0,0.55)]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-50">Plans</h2>
            <p className="mt-1 text-xs text-slate-400">
              Manage Haunted subscription plans.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenModal}
            className="rounded-full bg-[#2563eb] px-4 py-2 text-xs font-semibold text-slate-50 shadow-[0_0_25px_rgba(37,99,235,0.45)] hover:bg-[#1d4ed8] transition"
          >
              New Plan
          </button>
        </div>

          {error && (
          <p className="px-1 pt-2 text-sm text-red-400">{error}</p>
          )}

          {isLoading && !error ? (
          <p className="px-1 py-4 text-sm text-slate-400">Loading plans…</p>
          ) : null}

          {!isLoading && !error && plans.length === 0 ? (
          <p className="px-1 py-4 text-sm text-slate-400">No plans defined yet.</p>
          ) : null}

          {!isLoading && !error && plans.length > 0 ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020]/70 md:overflow-visible overflow-x-auto">
            <table className="min-w-full table-fixed text-sm text-slate-200">
              <thead className="bg-white/5">
                <tr>
                  <th className="w-[30%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 whitespace-nowrap">
                    Name
                  </th>
                  <th className="w-[15%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 whitespace-nowrap">
                    Price
                  </th>
                  <th className="w-[20%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 whitespace-nowrap">
                    Duration
                  </th>
                  <th className="w-[15%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 whitespace-nowrap">
                    Status
                  </th>
                  <th className="w-[20%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {plans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="transition-colors hover:bg-white/5"
                  >
                    <td className="px-3 py-4 text-[13px] text-slate-100/90 align-middle whitespace-nowrap">
                      <span
                        className={`${getPlanBadgeClass(
                          plan.name
                        )} inline-flex items-center rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap`}
                      >
                      {plan.name}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-[13px] text-slate-100/90 align-middle whitespace-nowrap">
                      {currencyFormatter.format(plan.priceCents / 100)}
                    </td>
                    <td className="px-3 py-4 text-[13px] text-slate-100/90 align-middle whitespace-nowrap">
                      {plan.durationDays === null
                        ? 'Lifetime'
                        : `${plan.durationDays} days`}
                    </td>
                    <td className="px-3 py-4 text-[13px] text-slate-100/90 align-middle whitespace-nowrap">
                      <span
                        className={
                          plan.active
                            ? 'inline-flex items-center rounded-full border border-emerald-500/60 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 whitespace-nowrap'
                            : 'inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 whitespace-nowrap'
                        }
                      >
                        {plan.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-[13px] text-slate-100/90 align-middle whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditPlan(plan)}
                          className="rounded-full border border-slate-600/60 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700/40 transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePlan(plan.id)}
                          className="rounded-full border border-red-500/70 px-3 py-1 text-xs font-medium text-red-300 hover:bg-red-600/20 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          ) : null}
      </div>

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={editingPlanId ? 'Edit Plan' : 'Add Plan'}
        description={
          editingPlanId
            ? 'Update the selected Haunted subscription plan.'
            : 'Define a new Haunted subscription plan.'
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="space-y-2 text-sm">
            <span className="text-[var(--text-muted)]">Name</span>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--input-background)] px-3 py-2 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            />
            {formErrors.name && (
              <p className="text-xs text-red-400">{formErrors.name}</p>
            )}
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-[var(--text-muted)]">Price (USD)</span>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, price: e.target.value }))
              }
              className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--input-background)] px-3 py-2 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            />
            {formErrors.price && (
              <p className="text-xs text-red-400">{formErrors.price}</p>
            )}
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-[var(--text-muted)]">
              Duration (days)
            </span>
            <input
              type="number"
              placeholder="Leave empty for lifetime"
              value={formData.durationDays}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  durationDays: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--input-background)] px-3 py-2 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  active: e.target.checked,
                }))
              }
            />
            Active plan
          </label>

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
              {submitLoading ? 'Saving...' : 'Save Plan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

