'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/' },
  { label: 'Members', href: '/members' },
  { label: 'Plans', href: '/plans' },
  { label: 'Admins', href: '/admins' },
  { label: 'Settings', href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[#D7DBE0] bg-[#F0F2F5] px-6 py-8 lg:flex">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-2xl bg-[#DDE1E6] p-3 text-[#2D6CE8]">
          <span className="text-lg font-semibold">HA</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#111216]">Haunted Admin</p>
          <p className="text-xs text-[#4A4D52]">Control Center</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#DDE1E6] text-[#111216]'
                  : 'text-[#3A3D41] hover:bg-[#E4E7EB] hover:text-[#111216]',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-[#D7DBE0] bg-white p-4 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-[#4A4D52]">Haunted Tier</p>
        <p className="mt-2 text-sm font-semibold text-[#111216]">128 Active Members</p>
        <p className="text-xs text-[#4A4D52]">All systems stable</p>
      </div>
    </aside>
  );
}






