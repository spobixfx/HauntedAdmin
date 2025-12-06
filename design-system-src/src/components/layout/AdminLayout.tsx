import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
  activePage: string;
  onNavigate: (page: string) => void;
  adminName?: string;
  adminRole?: string;
  onProfile?: () => void;
  onChangePassword?: () => void;
  onLogout?: () => void;
}

export function AdminLayout({ 
  children, 
  pageTitle, 
  activePage, 
  onNavigate,
  adminName,
  adminRole,
  onProfile,
  onChangePassword,
  onLogout,
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Sidebar activePage={activePage} onNavigate={onNavigate} userRole={adminRole} />
      
      <div className="ml-64">
        <Header 
          pageTitle={pageTitle}
          adminName={adminName}
          adminRole={adminRole}
          onProfile={onProfile}
          onChangePassword={onChangePassword}
          onLogout={onLogout}
        />
        
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
