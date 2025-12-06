"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Topbar } from "./Topbar";
import { supabase } from "@/lib/supabaseClient";

interface AppShellProps {
  children: ReactNode;
}

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Members", href: "/members" },
  { label: "Plans", href: "/plans" },
  { label: "Admins", href: "/admins" },
  { label: "Settings", href: "/settings" },
];

export default function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setEmail(data.session?.user?.email ?? null);
    });
    return () => {
      active = false;
    };
  }, []);

  const initials = useMemo(() => {
    if (!email) return "HA";
    const namePart = email.split("@")[0];
    return namePart.slice(0, 2).toUpperCase();
  }, [email]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#040712] text-[#f8fafc]">
      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-white/5 bg-[#050815] px-4 py-5 lg:flex">
        <div className="space-y-4">
          <div className="mb-6 rounded-2xl border border-white/5 bg-[#0b1020] px-3 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                {initials}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-100">
                  {email ?? "admin@haunted.dev"}
                </span>
                <span className="text-xs text-slate-400">Haunted Admin</span>
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    isActive
                      ? "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold bg-white/10 text-white transition-colors"
                      : "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto pt-4 border-t border-white/5">
          <button
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-red-500/10 hover:text-red-200 transition-colors"
            onClick={handleLogout}
          >
            <span className="mr-1 inline-block">↩</span>
            Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-[#040712]">
          <div className="max-w-7xl mx-auto w-full px-6 pb-16">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}








