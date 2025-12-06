"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let active = true;

    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (!data.session) {
        router.replace("/login");
        return;
      }
      setHasSession(true);
      setChecking(false);
    };

    check();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (!session) {
        setHasSession(false);
        router.replace("/login");
      } else {
        setHasSession(true);
        setChecking(false);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [router, pathname]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm opacity-70">
        Loading…
      </div>
    );
  }

  if (!hasSession) return null;

  return <AppShell>{children}</AppShell>;
}

