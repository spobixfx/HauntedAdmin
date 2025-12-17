"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function SettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  const [signOutLoading, setSignOutLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (!active) return;

      if (error || !data.user) {
        router.replace("/login");
        return;
      }

      setUserEmail(data.user.email ?? null);
      const roleFromMeta =
        (data.user.user_metadata as any)?.role ??
        (data.user.app_metadata as any)?.role ??
        "Admin";
      setUserRole(roleFromMeta);
      setLoading(false);
    };

    loadUser();

    return () => {
      active = false;
    };
  }, [router]);

  const handleChangePassword = async () => {
    if (loading) return;

    setPwError(null);
    setPwSuccess(null);

    if (!password || password.length < 8) {
      setPwError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setPwError(error.message || "Failed to update password.");
      setLoading(false);
      return;
    }

    setLoading(false);
    setPwSuccess("Password updated successfully.");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSignOut = async () => {
    setSignOutLoading(true);
    await supabase.auth.signOut();
    setSignOutLoading(false);
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
        <div className="text-sm text-white/60">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl w-full mx-auto px-6 pb-16 space-y-8">
      <div className="pt-8">
        <h1 className="text-2xl font-semibold text-slate-50">Settings</h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your Haunted Admin profile, security, and session.
        </p>
      </div>

      <div className="mt-8 w-full rounded-3xl border border-slate-800/70 bg-[#090d16] px-6 py-6 shadow-[0_18px_45px_rgba(0,0,0,0.55)] space-y-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* Profile card */}
          <section className="rounded-2xl bg-[#0b101b] border border-slate-800/70 px-5 py-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
              Profile
            </h2>
          <div className="space-y-4">
            <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-[0.14em]">
                  EMAIL
                </p>
                <div className="mt-1 w-full rounded-xl bg-[#060913] border border-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60">
                {userEmail}
              </div>
            </div>
            <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-[0.14em]">
                  ROLE
                </p>
                <div className="mt-1 inline-flex items-center rounded-full border border-slate-700 bg-[#080c16] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-200">
                  {userRole}
              </div>
              </div>
            </div>
          </section>

        {/* Security / password card */}
          <section className="rounded-2xl bg-[#0b101b] border border-slate-800/70 px-5 py-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
              Security
            </h2>

          {pwError && (
              <div className="mb-1 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {pwError}
            </div>
          )}
          {pwSuccess && (
              <div className="mb-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
              {pwSuccess}
            </div>
          )}

          <div className="space-y-3">
            <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-[0.14em] mb-1">
                  NEW PASSWORD
                </p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-[#060913] border border-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60"
                placeholder="Enter a new password"
              />
            </div>
            <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-[0.14em] mb-1">
                  CONFIRM PASSWORD
                </p>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl bg-[#060913] border border-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60"
                placeholder="Repeat your password"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleChangePassword}
            disabled={loading}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-indigo-500 px-5 py-2 text-sm font-medium text-white shadow-[0_0_18px_rgba(79,70,229,0.7)] hover:bg-indigo-400 transition-colors disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? "Saving..." : "Save password"}
          </button>
          </section>
      </div>

      {/* Sign out section */}
        <section className="rounded-2xl bg-[#0b101b] border border-slate-800/70 px-5 py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Sign out</h2>
            <p className="text-sm text-slate-400">
          You can sign out of your Haunted Admin session on this device.
        </p>
          </div>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signOutLoading}
            className="inline-flex items-center justify-center rounded-full border border-rose-500/80 bg-rose-500/15 px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-rose-200 hover:bg-rose-500/25 transition-colors disabled:opacity-60"
        >
          {signOutLoading ? "Signing out..." : "Sign out"}
        </button>
        </section>
      </div>
    </div>
  );
}

