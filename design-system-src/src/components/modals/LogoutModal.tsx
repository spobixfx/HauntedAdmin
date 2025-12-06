import React from 'react';
import { LogOut } from 'lucide-react';
import { Modal } from '../admin/Modal';
import { Button } from '../admin/Button';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log out"
      size="sm"
    >
      <div className="space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-[var(--status-error)]/10 flex items-center justify-center">
            <LogOut className="w-8 h-8 text-[var(--status-error)]" />
          </div>
        </div>

        {/* Message */}
        <div className="text-center">
          <p className="text-[var(--text-secondary)]">
            Are you sure you want to log out?
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1 bg-[var(--status-error)] hover:bg-[var(--status-error-light)]"
            onClick={onConfirm}
          >
            Log out
          </Button>
        </div>
      </div>
    </Modal>
  );
}
