'use client';

import { useEffect, useMemo, useState } from "react";

import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

type Admin = {
  id: string;
  email: string;
  role: string;
  status: 'active' | 'invited' | 'disabled';
  created_at: string | null;
  last_seen_at: string | null;
};

const formatDate = (value: string | null) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
};

const statusVariant = (status: Admin['status']): BadgeVariant => {
  if (status === 'active') return 'success';
  if (status === 'invited') return 'warning';
  return 'error';
};

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Admin['status']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Admin');

  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editStatus, setEditStatus] = useState<Admin['status']>('active');

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadAdmins() {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch('/api/admins', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || 'Failed to load admins');
        }

        const data = await res.json();
        setAdmins(data.admins ?? []);
      } catch (err: any) {
        setError(err?.message || 'Failed to load admins');
      } finally {
        setIsLoading(false);
      }
    }

    void loadAdmins();
  }, []);

  const roles = useMemo(
    () => Array.from(new Set(admins.map((a) => a.role))).filter(Boolean),
    [admins]
  );

  const filteredAdmins = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return admins.filter((admin) => {
      const matchesRole = roleFilter === 'all' ? true : admin.role === roleFilter;
      const matchesStatus = statusFilter === 'all' ? true : admin.status === statusFilter;
      const matchesSearch =
        query.length === 0 || admin.email.toLowerCase().includes(query);
      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [admins, roleFilter, statusFilter, searchQuery]);

  const handleInvite = () => {
    setError(null);
    setInviteEmail('');
    setInviteRole('Admin');
    setIsInviteOpen(true);
  };

  const handleInviteSubmit = async () => {
    if (!inviteEmail.trim()) return;

    try {
      setIsSaving(true);
      setError(null);

      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole.trim() || 'Admin',
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || 'Failed to invite admin');
      }

      const data = await res.json();
      const created = data.admin as Admin | undefined;

      if (created) {
        setAdmins((prev) => [...prev, created]);
      }

      setIsInviteOpen(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to invite admin');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (id: string) => {
    const admin = admins.find((a) => a.id === id);
    if (!admin) return;

    setEditingAdmin(admin);
    setEditEmail(admin.email);
    setEditRole(admin.role);
    setEditStatus(admin.status);
    setError(null);
  };

  const handleEditSubmit = async () => {
    if (!editingAdmin) return;

    try {
      setIsSaving(true);
      setError(null);

      const res = await fetch('/api/admins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingAdmin.id,
          email: editEmail.trim(),
          role: editRole.trim(),
          status: editStatus,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || 'Failed to update admin');
      }

      const data = await res.json();
      const updated = data.admin as Admin | undefined;

      if (updated) {
        setAdmins((prev) =>
          prev.map((admin) => (admin.id === updated.id ? updated : admin))
        );
      }

      setEditingAdmin(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to update admin');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!id) return;
    const confirmDelete = window.confirm('Remove this admin?');
    if (!confirmDelete) return;

    try {
      setError(null);
      const url = `/api/admins?id=${encodeURIComponent(id)}`;
      const res = await fetch(url, { method: 'DELETE' });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || 'Failed to remove admin');
      }

      setAdmins((prev) => prev.filter((admin) => admin.id !== id));
    } catch (err: any) {
      setError(err?.message || 'Failed to remove admin');
    }
  };

  const handleResend = async (id: string) => {
    if (!id) return;
    try {
      setError(null);
      const res = await fetch('/api/admins', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || 'Failed to resend invite');
      }

      const data = await res.json();
      const updated = data.admin as Admin | undefined;
      if (updated) {
        setAdmins((prev) =>
          prev.map((admin) => (admin.id === updated.id ? updated : admin))
        );
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to resend invite');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl w-full mx-auto px-6 pb-16">
      <div className="mt-8 w-full rounded-3xl border border-slate-800/70 bg-[#090d16] px-6 py-6 shadow-[0_18px_45px_rgba(0,0,0,0.55)]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-50">Admins</h2>
            <p className="mt-1 text-xs text-slate-400">
              Manage who can access the Haunted control dashboard and member data.
            </p>
          </div>
          <button
            type="button"
            onClick={handleInvite}
            className="rounded-full bg-[#2563eb] px-4 py-2 text-xs font-semibold text-slate-50 shadow-[0_0_25px_rgba(37,99,235,0.45)] hover:bg-[#1d4ed8] transition"
          >
            Invite admin
          </button>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex flex-col">
              <div className="text-[11px] font-medium text-slate-400">Role</div>
              <div className="mt-1 inline-flex items-center rounded-full border border-white/10 bg-[#0b1020] px-3 py-1.5">
                <select
                  value={roleFilter}
                  onChange={(e) =>
                    setRoleFilter(
                      e.target.value === 'all' ? 'all' : e.target.value
                    )
                  }
                  className="bg-transparent text-xs text-slate-100 outline-none pr-5"
                >
                  <option value="all">All</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
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
                        : (e.target.value as Admin['status'])
                    )
                  }
                  className="bg-transparent text-xs text-slate-100 outline-none pr-5"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="invited">Invited</option>
                  <option value="disabled">Disabled</option>
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
              placeholder="Search admins…"
              className="flex-1 bg-transparent text-xs text-slate-100 placeholder:text-slate-500 outline-none"
            />
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020]/70 md:overflow-visible overflow-x-auto">
          <table className="min-w-full table-fixed text-sm text-slate-200">
            <thead className="bg-white/5">
              <tr>
                <th className="w-[30%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 whitespace-nowrap">
                  Admin
                </th>
                <th className="w-[15%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 whitespace-nowrap">
                  Role
                </th>
                <th className="w-[15%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 whitespace-nowrap">
                  Status
                </th>
                <th className="w-[15%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 whitespace-nowrap">
                  Created
                </th>
                <th className="w-[15%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 whitespace-nowrap">
                  Last seen
                </th>
                <th className="w-[10%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400/80 whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {error ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-10 text-center text-red-400"
                  >
                    {error}
                  </td>
                </tr>
              ) : isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-10 text-center text-slate-400"
                  >
                    Loading admins...
                  </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-10 text-center text-slate-400"
                  >
                    No admins match your filters yet.
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="transition-colors hover:bg-white/5"
                  >
                    <td className="px-3 py-4 text-[13px] text-slate-100/90 align-middle whitespace-nowrap">
                      <span className="max-w-[260px] truncate inline-block align-middle">
                        {admin.email}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-[13px] text-slate-100/90 align-middle whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 whitespace-nowrap">
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-[13px] text-slate-100/90 align-middle whitespace-nowrap">
                      {admin.status === 'active' ? (
                        <span className="inline-flex items-center rounded-full border border-emerald-500/60 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 whitespace-nowrap">
                          Active
                        </span>
                      ) : admin.status === 'invited' ? (
                        <span className="inline-flex items-center rounded-full border border-amber-500/60 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300 whitespace-nowrap">
                          Invited
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-rose-500/60 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-300 whitespace-nowrap">
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-4 text-[13px] text-slate-200 align-middle whitespace-nowrap">
                      {formatDate(admin.created_at)}
                    </td>
                    <td className="px-3 py-4 text-[13px] text-slate-200 align-middle whitespace-nowrap">
                      {admin.last_seen_at ? formatDate(admin.last_seen_at) : '—'}
                    </td>
                    <td className="px-3 py-4 text-[13px] text-slate-100/90 align-middle whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {admin.status === 'invited' && (
                          <button
                            type="button"
                            onClick={() => handleResend(admin.id)}
                            className="rounded-full border border-amber-500/60 px-3 py-1 text-xs font-medium text-amber-300 hover:bg-amber-500/15 transition"
                          >
                            Resend
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleEdit(admin.id)}
                          className="rounded-full border border-slate-600/60 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700/40 transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(admin.id)}
                          className="rounded-full border border-red-500/70 px-3 py-1 text-xs font-medium text-red-300 hover:bg-red-600/20 transition"
                        >
                          Remove
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
      {isInviteOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-2xl bg-[#1a1a1f] p-6 shadow-xl border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Invite admin</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="admin@haunted.app"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Role</label>
                <input
                  type="text"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Admin, Owner, Support..."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInviteSubmit}
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-60"
                disabled={isSaving}
              >
                {isSaving ? "Sending..." : "Send invite"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingAdmin && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-2xl bg-[#1a1a1f] p-6 shadow-xl border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">
              Edit admin
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Role</label>
                <input
                  type="text"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as Admin["status"])}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="invited">Invited</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingAdmin(null)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEditSubmit}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

