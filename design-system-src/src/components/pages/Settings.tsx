import React, { useState } from 'react';
import { Bell, Lock, Palette, Database, Globe, Zap } from 'lucide-react';
import { Card, CardHeader } from '../admin/Card';
import { Toggle } from '../admin/Toggle';
import { Button } from '../admin/Button';
import { FormInput } from '../admin/FormInput';

export function Settings() {
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    expirationWarnings: true,
    newMemberAlerts: false,
    systemUpdates: true
  });
  
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: true,
    ipWhitelist: false
  });
  
  const [general, setGeneral] = useState({
    organizationName: 'Haunted Family',
    supportEmail: 'support@hauntedfamily.com',
    walletAddress: 'TXYZkwKY8rjVX9hMpM8kGy5X9YWqJuTRC20'
  });
  
  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader 
          title="General Settings" 
          subtitle="Basic system configuration"
        />
        
        <div className="space-y-6">
          <FormInput
            label="Organization Name"
            value={general.organizationName}
            onChange={(e) => setGeneral({ ...general, organizationName: e.target.value })}
            placeholder="Enter organization name"
          />
          
          <FormInput
            label="Support Email"
            type="email"
            value={general.supportEmail}
            onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })}
            placeholder="support@example.com"
          />
          
          <div className="flex justify-end pt-4 border-t border-[var(--border-default)]">
            <Button variant="primary">
              Save Changes
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Notifications */}
      <Card>
        <CardHeader 
          title="Notifications" 
          subtitle="Manage email alerts and system notifications"
        />
        
        <div className="divide-y divide-[var(--border-default)]">
          <Toggle
            label="Email Alerts"
            description="Receive email notifications for important events"
            checked={notifications.emailAlerts}
            onChange={(checked) => setNotifications({ ...notifications, emailAlerts: checked })}
          />
          
          <Toggle
            label="Expiration Warnings"
            description="Get notified 7 days before memberships expire"
            checked={notifications.expirationWarnings}
            onChange={(checked) => setNotifications({ ...notifications, expirationWarnings: checked })}
          />
          
          <Toggle
            label="New Member Alerts"
            description="Receive alerts when new members are added"
            checked={notifications.newMemberAlerts}
            onChange={(checked) => setNotifications({ ...notifications, newMemberAlerts: checked })}
          />
          
          <Toggle
            label="System Updates"
            description="Notifications about system maintenance and updates"
            checked={notifications.systemUpdates}
            onChange={(checked) => setNotifications({ ...notifications, systemUpdates: checked })}
          />
        </div>
      </Card>
      
      {/* Security */}
      <Card>
        <CardHeader 
          title="Security" 
          subtitle="Password, 2FA, and access control settings"
        />
        
        <div className="divide-y divide-[var(--border-default)]">
          <Toggle
            label="Two-Factor Authentication"
            description="Require 2FA for all admin accounts"
            checked={security.twoFactorAuth}
            onChange={(checked) => setSecurity({ ...security, twoFactorAuth: checked })}
          />
          
          <Toggle
            label="Session Timeout"
            description="Automatically log out after 30 minutes of inactivity"
            checked={security.sessionTimeout}
            onChange={(checked) => setSecurity({ ...security, sessionTimeout: checked })}
          />
          
          <Toggle
            label="IP Whitelist"
            description="Restrict admin access to specific IP addresses"
            checked={security.ipWhitelist}
            onChange={(checked) => setSecurity({ ...security, ipWhitelist: checked })}
          />
        </div>
        
        <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
          <Button variant="secondary">
            <Lock className="w-4 h-4" />
            Change Password
          </Button>
        </div>
      </Card>
      
      {/* Appearance */}
      <Card>
        <CardHeader 
          title="Appearance" 
          subtitle="Customize colors, themes, and branding"
        />
        
        <div className="space-y-4">
          <div className="p-4 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm text-[var(--text-primary)]">Theme</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">
                  Dark mode is active
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-[var(--bg-primary)] border-2 border-[var(--blue-electric)]" />
                <div className="w-8 h-8 rounded bg-white opacity-30 cursor-not-allowed" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)] text-center">
              <div className="w-full h-8 rounded mb-2 bg-[var(--blue-electric)]" />
              <div className="text-xs text-[var(--text-muted)]">Primary</div>
            </div>
            <div className="p-3 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)] text-center">
              <div className="w-full h-8 rounded mb-2 bg-[var(--status-success)]" />
              <div className="text-xs text-[var(--text-muted)]">Success</div>
            </div>
            <div className="p-3 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)] text-center">
              <div className="w-full h-8 rounded mb-2 bg-[var(--premium-gold)]" />
              <div className="text-xs text-[var(--text-muted)]">Premium</div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Crypto Payments */}
      <Card>
        <CardHeader 
          title="Crypto Payments (TRC20 USDT)" 
          subtitle="Configure TRON network wallet for accepting payments"
        />
        
        <div className="space-y-6">
          <FormInput
            label="TRC20 Wallet Address"
            placeholder="Enter your TRON (TRC20) wallet address"
            value={general.walletAddress || 'TXYZkwKY8rjVX9hMpM8kGy5X9YWqJuTRC20'}
            onChange={(e) => setGeneral({ ...general, walletAddress: e.target.value })}
          />
          
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="text-sm text-[var(--text-secondary)] mb-3">
                QR Code Preview
              </div>
              <div className="p-8 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)] flex items-center justify-center">
                <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-xs text-gray-500">QR Code</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="text-sm text-[var(--text-secondary)] mb-3">
                Payment Instructions
              </div>
              <div className="p-4 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)] space-y-3">
                <div className="text-xs text-[var(--text-muted)]">
                  1. Send USDT to the wallet address above
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  2. Use TRON network (TRC20) only
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  3. After payment, provide transaction ID to admin
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  4. Admin will manually confirm and activate membership
                </div>
              </div>
              
              <Button variant="secondary" size="sm" className="mt-4 w-full">
                Copy Wallet Address
              </Button>
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t border-[var(--border-default)]">
            <Button variant="primary">
              Save Wallet Settings
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Discord Integration */}
      <Card>
        <CardHeader 
          title="Discord Integration" 
          subtitle="Connect with Discord API for automated role management"
        />
        
        <div className="p-8 text-center bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
            <Zap className="w-8 h-8 text-[var(--text-muted)]" />
          </div>
          <h3 className="text-[var(--text-primary)] mb-2">Coming Soon</h3>
          <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto mb-4">
            Discord integration will enable automatic role assignment and synchronization with your Discord server.
          </p>
          <Button variant="ghost" disabled>
            Configure Discord Bot
          </Button>
        </div>
      </Card>
      
      {/* Data & Backup */}
      <Card>
        <CardHeader 
          title="Data & Backup" 
          subtitle="Export data and manage backups"
        />
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)]">
            <div>
              <div className="text-sm text-[var(--text-primary)]">Export Members Data</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">
                Download all member data as CSV
              </div>
            </div>
            <Button variant="secondary" size="sm">
              <Database className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)]">
            <div>
              <div className="text-sm text-[var(--text-primary)]">Backup Database</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">
                Last backup: 2 hours ago
              </div>
            </div>
            <Button variant="secondary" size="sm">
              <Database className="w-4 h-4" />
              Create Backup
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
