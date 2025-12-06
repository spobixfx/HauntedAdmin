import React, { useState } from 'react';
import { AdminLayout } from './components/layout/AdminLayout';
import { Dashboard } from './components/pages/Dashboard';
import { Members } from './components/pages/Members';
import { MemberDetails } from './components/pages/MemberDetails';
import { Admins } from './components/pages/Admins';
import { Settings } from './components/pages/Settings';
import { Plans } from './components/pages/Plans';
import { Login } from './components/pages/Login';
import { SessionExpired } from './components/pages/SessionExpired';
import { AccessDenied } from './components/pages/AccessDenied';
import { NotFound } from './components/pages/NotFound';
import { LogoutModal } from './components/modals/LogoutModal';
import { ChangePasswordModal } from './components/modals/ChangePasswordModal';
import { ProfileModal } from './components/modals/ProfileModal';
import { Toaster, toast } from 'sonner@2.0.3';
import { AuthTestMenu } from './components/admin/AuthTestMenu';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Mock user data
  const [currentUser] = useState({
    name: 'Sarah Chen',
    email: 'sarah@haunted.com',
    role: 'Owner',
    createdAt: 'January 15, 2024',
    lastLogin: 'Today at 10:30 AM',
  });
  
  const pageConfig = {
    dashboard: { title: 'Dashboard', component: Dashboard, requiresOwner: false },
    members: { title: 'Members', component: Members, requiresOwner: false },
    'member-details': { title: 'Member Details', component: MemberDetails, requiresOwner: false },
    admins: { title: 'Admins', component: Admins, requiresOwner: true },
    plans: { title: 'Plans', component: Plans, requiresOwner: true },
    settings: { title: 'Settings', component: Settings, requiresOwner: true },
    'session-expired': { title: 'Session Expired', component: SessionExpired, requiresOwner: false },
    'access-denied': { title: 'Access Denied', component: AccessDenied, requiresOwner: false },
    '404': { title: 'Not Found', component: NotFound, requiresOwner: false },
  };
  
  const handleLogin = (email: string, password: string) => {
    // Mock successful login
    setIsAuthenticated(true);
    toast.success('Welcome back!');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsLogoutModalOpen(false);
    setCurrentPage('dashboard');
    toast.success('Logged out successfully');
  };

  const handleNavigate = (page: string) => {
    const config = pageConfig[page as keyof typeof pageConfig];
    
    // Check if page exists
    if (!config) {
      setCurrentPage('404');
      return;
    }
    
    // Check if user has permission (Owner-only pages)
    if (config.requiresOwner && currentUser.role !== 'Owner') {
      setCurrentPage('access-denied');
      return;
    }
    
    setCurrentPage(page);
  };

  const handleProfile = () => {
    setIsProfileModalOpen(true);
  };

  const handleChangePassword = () => {
    setIsChangePasswordModalOpen(true);
  };

  const handleChangePasswordSuccess = () => {
    toast.success('Password updated successfully');
  };

  // Show Login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="dark min-h-screen">
        <Login onLogin={handleLogin} />
        <Toaster position="top-right" theme="dark" richColors />
      </div>
    );
  }

  // Special pages without layout
  if (currentPage === 'session-expired') {
    return (
      <div className="dark min-h-screen">
        <SessionExpired onLogin={() => setIsAuthenticated(false)} />
        <Toaster position="top-right" theme="dark" richColors />
      </div>
    );
  }

  if (currentPage === 'access-denied') {
    return (
      <div className="dark min-h-screen">
        <AccessDenied onBackToDashboard={() => handleNavigate('dashboard')} />
        <Toaster position="top-right" theme="dark" richColors />
      </div>
    );
  }

  if (currentPage === '404') {
    return (
      <div className="dark min-h-screen">
        <NotFound onBackToDashboard={() => handleNavigate('dashboard')} />
        <Toaster position="top-right" theme="dark" richColors />
      </div>
    );
  }
  
  const config = pageConfig[currentPage as keyof typeof pageConfig] || pageConfig.dashboard;
  const PageComponent = config.component;
  
  return (
    <div className="dark min-h-screen">
      <AdminLayout
        pageTitle={config.title}
        activePage={currentPage}
        onNavigate={handleNavigate}
        adminName={currentUser.name}
        adminRole={currentUser.role}
        onProfile={handleProfile}
        onChangePassword={handleChangePassword}
        onLogout={() => setIsLogoutModalOpen(true)}
      >
        <PageComponent />
      </AdminLayout>

      {/* Modals */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onSuccess={handleChangePasswordSuccess}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        adminName={currentUser.name}
        adminEmail={currentUser.email}
        adminRole={currentUser.role}
        createdAt={currentUser.createdAt}
        lastLogin={currentUser.lastLogin}
      />

      <Toaster position="top-right" theme="dark" richColors />

      {/* Auth Test Menu - For testing different auth states */}
      <AuthTestMenu
        onTriggerSessionExpired={() => handleNavigate('session-expired')}
        onTriggerAccessDenied={() => handleNavigate('access-denied')}
        onTrigger404={() => handleNavigate('404')}
      />
    </div>
  );
}
