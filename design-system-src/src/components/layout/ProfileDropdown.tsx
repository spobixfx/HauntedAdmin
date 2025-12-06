import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Lock, UserCircle, ChevronDown } from 'lucide-react';

interface ProfileDropdownProps {
  adminName?: string;
  adminRole?: string;
  onProfile?: () => void;
  onChangePassword?: () => void;
  onLogout?: () => void;
}

export function ProfileDropdown({
  adminName = 'Admin User',
  adminRole = 'Super Admin',
  onProfile,
  onChangePassword,
  onLogout,
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMenuClick = (action?: () => void) => {
    setIsOpen(false);
    action?.();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:bg-[var(--bg-elevated)]/50 rounded-lg px-3 py-2 transition-colors"
      >
        <div className="text-right">
          <div className="text-sm text-[var(--text-primary)]">{adminName}</div>
          <div className="text-xs text-[var(--text-muted)]">{adminRole}</div>
        </div>
        
        <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center border border-[var(--border-default)]">
          <User className="w-5 h-5 text-[var(--text-muted)]" />
        </div>

        <ChevronDown 
          className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg shadow-2xl shadow-black/50 overflow-hidden z-50">
          {/* Profile Option */}
          <button
            onClick={() => handleMenuClick(onProfile)}
            className="w-full flex items-center gap-3 px-4 py-3 text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors text-left"
          >
            <UserCircle className="w-5 h-5 text-[var(--text-muted)]" />
            <span>Profile</span>
          </button>

          {/* Change Password Option */}
          <button
            onClick={() => handleMenuClick(onChangePassword)}
            className="w-full flex items-center gap-3 px-4 py-3 text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors text-left"
          >
            <Lock className="w-5 h-5 text-[var(--text-muted)]" />
            <span>Change password</span>
          </button>

          {/* Divider */}
          <div className="h-px bg-[var(--border-default)] my-1" />

          {/* Logout Option */}
          <button
            onClick={() => handleMenuClick(onLogout)}
            className="w-full flex items-center gap-3 px-4 py-3 text-[var(--status-error)] hover:bg-[var(--status-error)]/10 transition-colors text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>Log out</span>
          </button>
        </div>
      )}
    </div>
  );
}
