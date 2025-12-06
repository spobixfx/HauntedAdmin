import React from 'react';
import { ProfileDropdown } from './ProfileDropdown';

interface HeaderProps {
  pageTitle: string;
  adminName?: string;
  adminRole?: string;
  onProfile?: () => void;
  onChangePassword?: () => void;
  onLogout?: () => void;
}

export function Header({ 
  pageTitle, 
  adminName = 'Admin User',
  adminRole = 'Super Admin',
  onProfile,
  onChangePassword,
  onLogout,
}: HeaderProps) {
  return (
    <header className="h-16 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] flex items-center justify-between px-8">
      <div>
        <h1 className="text-[var(--text-primary)]">{pageTitle}</h1>
      </div>
      
      <ProfileDropdown
        adminName={adminName}
        adminRole={adminRole}
        onProfile={onProfile}
        onChangePassword={onChangePassword}
        onLogout={onLogout}
      />
    </header>
  );
}
