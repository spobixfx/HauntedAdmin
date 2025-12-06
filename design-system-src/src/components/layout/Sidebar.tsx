import React from 'react';
import { LayoutDashboard, Users, Shield, Settings, Ghost, DollarSign, Lock } from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  userRole?: string;
}

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, ownerOnly: false },
  { id: 'members', label: 'Members', icon: Users, ownerOnly: false },
  { id: 'admins', label: 'Admins', icon: Shield, ownerOnly: true },
  { id: 'plans', label: 'Plans', icon: DollarSign, ownerOnly: true },
  { id: 'settings', label: 'Settings', icon: Settings, ownerOnly: true }
];

export function Sidebar({ activePage, onNavigate, userRole = 'Owner' }: SidebarProps) {
  return (
    <aside className="w-64 h-screen bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--sidebar-border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--blue-electric)] flex items-center justify-center">
            <Ghost className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-[var(--text-primary)]">Haunted Family</div>
            <div className="text-xs text-[var(--text-muted)]">Admin Panel</div>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            const isLocked = item.ownerOnly && userRole !== 'Owner';
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  disabled={isLocked}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-[var(--blue-electric)] text-white shadow-lg shadow-blue-500/20' 
                      : isLocked
                        ? 'text-[var(--text-disabled)] cursor-not-allowed opacity-50'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--text-primary)]'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isLocked && <Lock className="w-4 h-4" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-[var(--sidebar-border)]">
        <div className="text-xs text-[var(--text-muted)] text-center">
          Haunted Admin v1.0
        </div>
      </div>
    </aside>
  );
}
