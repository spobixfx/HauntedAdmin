"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

function LoginInner() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/members");
      }
    });
  }, [router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Please enter email and password");
      return;
    }
    setIsLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        console.error("[LOGIN_ERROR]", signInError);
        setError(signInError.message || "Invalid login credentials");
        return;
      }

      router.push("/members");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* FULLSCREEN background */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050814]">
        <div className="absolute inset-0 -z-10 animate-slowGlow bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.15),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.12),transparent_50%)]" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-40 -top-32 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-500 via-sky-500 to-transparent opacity-30 blur-3xl animate-pulse-slow" />
          <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-transparent opacity-25 blur-3xl animate-pulse-slow delay-150" />
        </div>
      </div>

      {/* Foreground: centered login card */}
      <div className="relative min-h-screen w-full flex items-center justify-center px-4 text-slate-100">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="relative flex justify-center">
              <div className="absolute h-16 w-16 bg-gradient-to-br from-sky-500/40 to-fuchsia-500/30 blur-2xl rounded-full"></div>
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-sky-500 to-purple-500 flex items-center justify-center text-sm font-semibold shadow-lg shadow-indigo-500/40">
                HA
              </div>
              <div className="pointer-events-none absolute -inset-1 rounded-3xl border border-indigo-400/40 opacity-0 animate-glow-soft" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Haunted Admin</h1>
            <p className="text-sm text-slate-400 max-w-xs">
              Sign in to access the Haunted control dashboard.
            </p>
          </div>

          {/* Card */}
          <div className="relative rounded-2xl border border-white/10 bg-[#0A0F1F]/80 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden animate-fadeUp">
            <div className="absolute inset-0 pointer-events-none rounded-2xl border border-transparent hover:border-sky-500/30 transition-all duration-500" />
            <div className="px-6 pt-6 pb-7 space-y-5">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 tracking-wide">Email</label>
                  <div className="relative">
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="you@haunted.app"
                      className="w-full rounded-xl bg-slate-900/70 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-0 transition duration-200"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <div className="pointer-events-none absolute inset-px rounded-[11px] border border-indigo-500/0 focus-within:border-indigo-500/60" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 tracking-wide">Password</label>
                  <div className="relative">
                    <input
                      name="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full rounded-xl bg-slate-900/70 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-0 transition duration-200"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200 animate-fade-in">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:shadow-[0_0_35px_rgba(56,189,248,0.55)] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden inline-flex items-center justify-center gap-2"
                >
                  <span className="relative z-10">
                    {isLoading ? "Signing in..." : "Login"}
                  </span>
                  <span className="pointer-events-none absolute inset-0 bg-white/10 opacity-0 animate-button-shimmer" />
                </button>
              </form>
            </div>
          </div>

          <p className="text-[11px] text-center text-slate-500">
            Protected access for Haunted Admin operators only.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.05); }
        }

        @keyframes glow-soft {
          0%, 100% { opacity: 0; transform: scale(0.95); }
          50% { opacity: 0.9; transform: scale(1.02); }
        }

        @keyframes slowGlow {
          0% { transform: scale(1) translate(0,0); opacity: 0.9; }
          50% { transform: scale(1.05) translate(10px, -10px); opacity: 1; }
          100% { transform: scale(1) translate(0,0); opacity: 0.9; }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes button-shimmer {
          0% { opacity: 0; transform: translateX(-120%); }
          20% { opacity: 0.65; }
          100% { opacity: 0; transform: translateX(120%); }
        }

        .animate-pulse-slow {
          animation: pulse-slow 10s ease-in-out infinite;
        }

        .animate-glow-soft {
          animation: glow-soft 4s ease-in-out infinite;
        }

        .animate-slowGlow {
          animation: slowGlow 14s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 200ms ease-out;
        }

        .animate-fadeUp {
          animation: fadeUp 0.6s ease-out;
        }

        .animate-button-shimmer {
          animation: button-shimmer 2.4s ease-in-out infinite;
          background: linear-gradient(
            120deg,
            rgba(255, 255, 255, 0),
            rgba(255, 255, 255, 0.7),
            rgba(255, 255, 255, 0)
          );
        }
      `}</style>
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginInner />
    </AuthProvider>
  );
}

