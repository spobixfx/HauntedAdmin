"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function SetPasswordPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;

    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;

      if (error || !data.user) {
        router.replace("/login");
        return;
      }

      const needsPassword = data.user.user_metadata?.needs_password === true;
      if (!needsPassword) {
        router.replace("/admins");
        return;
      }

      setLoading(false);
    };

    checkUser();

    return () => {
      active = false;
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError(null);
    setSuccess(false);
    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message || "Failed to update password");
      setLoading(false);
      return;
    }

    const { error: metaError } = await supabase.auth.updateUser({
      data: { needs_password: false },
    });

    if (metaError) {
      setError(metaError.message || "Failed to update profile");
      setLoading(false);
      return;
    }

    setSuccess(true);
    router.push("/admins");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-sm text-white/70">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050509]">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/60 p-6 shadow-xl">
        <h1 className="text-xl font-semibold text-white mb-4">
          Set your password
        </h1>
        <p className="text-sm text-white/60 mb-6">
          Create a password to access your HauntedAdmin account.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            Password updated successfully. Redirecting...
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-white/70 mb-1">
              New password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a strong password"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">
              Confirm password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Repeat your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save password"}
          </button>
        </form>
      </div>
    </div>
  );
}


