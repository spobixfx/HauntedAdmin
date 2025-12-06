import React from 'react';
import { User, Mail, Shield, Calendar, Clock } from 'lucide-react';
import { Modal } from '../admin/Modal';
import { Button } from '../admin/Button';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminName?: string;
  adminEmail?: string;
  adminRole?: string;
  createdAt?: string;
  lastLogin?: string;
}

export function ProfileModal({
  isOpen,
  onClose,
  adminName = 'Admin User',
  adminEmail = 'admin@haunted.com',
  adminRole = 'Super Admin',
  createdAt = 'January 15, 2024',
  lastLogin = 'Today at 10:30 AM',
}: ProfileModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Profile"
      subtitle="Your account information"
      size="sm"
    >
      <div className="space-y-6">
        {/* Profile Avatar */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center border-2 border-[var(--border-default)]">
            <User className="w-10 h-10 text-[var(--text-muted)]" />
          </div>
        </div>

        {/* Profile Information */}
        <div className="space-y-4">
          {/* Name */}
          <div className="flex items-start gap-3 p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-default)]">
            <User className="w-5 h-5 text-[var(--blue-electric)] mt-0.5" />
            <div className="flex-1">
              <div className="text-xs text-[var(--text-muted)] mb-1">Name</div>
              <div className="text-[var(--text-primary)]">{adminName}</div>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3 p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-default)]">
            <Mail className="w-5 h-5 text-[var(--blue-electric)] mt-0.5" />
            <div className="flex-1">
              <div className="text-xs text-[var(--text-muted)] mb-1">Email</div>
              <div className="text-[var(--text-primary)]">{adminEmail}</div>
            </div>
          </div>

          {/* Role */}
          <div className="flex items-start gap-3 p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-default)]">
            <Shield className="w-5 h-5 text-[var(--blue-electric)] mt-0.5" />
            <div className="flex-1">
              <div className="text-xs text-[var(--text-muted)] mb-1">Role</div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-primary)]">{adminRole}</span>
                {adminRole === 'Owner' && (
                  <span className="px-2 py-0.5 bg-[var(--premium-gold)]/20 text-[var(--premium-gold)] text-xs rounded">
                    Full Access
                  </span>
                )}
                {adminRole === 'Admin' && (
                  <span className="px-2 py-0.5 bg-[var(--blue-electric)]/20 text-[var(--blue-electric)] text-xs rounded">
                    Limited Access
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Created At */}
          <div className="flex items-start gap-3 p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-default)]">
            <Calendar className="w-5 h-5 text-[var(--text-muted)] mt-0.5" />
            <div className="flex-1">
              <div className="text-xs text-[var(--text-muted)] mb-1">Created</div>
              <div className="text-[var(--text-secondary)]">{createdAt}</div>
            </div>
          </div>

          {/* Last Login */}
          <div className="flex items-start gap-3 p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-default)]">
            <Clock className="w-5 h-5 text-[var(--text-muted)] mt-0.5" />
            <div className="flex-1">
              <div className="text-xs text-[var(--text-muted)] mb-1">Last Login</div>
              <div className="text-[var(--text-secondary)]">{lastLogin}</div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-4">
          <Button
            variant="ghost"
            className="w-full"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
