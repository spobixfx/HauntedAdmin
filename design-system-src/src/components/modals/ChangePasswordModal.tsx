import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react';
import { Modal } from '../admin/Modal';
import { Button } from '../admin/Button';
import { FormInput } from '../admin/FormInput';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ChangePasswordModal({ isOpen, onClose, onSuccess }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const validateForm = () => {
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({ currentPassword: '', newPassword: '', confirmPassword: '' });

    // Simulate API call
    setTimeout(() => {
      // Mock validation - replace with actual API logic
      if (currentPassword !== 'password') {
        setErrors({
          currentPassword: 'Current password is incorrect',
          newPassword: '',
          confirmPassword: '',
        });
        setIsLoading(false);
      } else {
        setIsSuccess(true);
        setIsLoading(false);
        
        // Auto-close after success
        setTimeout(() => {
          handleClose();
          onSuccess?.();
        }, 2000);
      }
    }, 1000);
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setErrors({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsSuccess(false);
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Change password"
      subtitle="Update your admin account password"
      size="sm"
    >
      {isSuccess ? (
        // Success State
        <div className="py-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--status-success)]/10">
            <CheckCircle2 className="w-8 h-8 text-[var(--status-success)]" />
          </div>
          <div>
            <h3 className="text-[var(--text-primary)] mb-2">Password updated successfully</h3>
            <p className="text-sm text-[var(--text-muted)]">
              Your password has been changed. You can now use your new password to log in.
            </p>
          </div>
        </div>
      ) : (
        // Form State
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <div className="relative">
            <FormInput
              type={showCurrentPassword ? 'text' : 'password'}
              label="Current password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              error={errors.currentPassword}
              disabled={isLoading}
              className="pl-10 pr-10"
            />
            <Lock className="absolute left-3 top-[38px] w-5 h-5 text-[var(--text-muted)]" />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-[38px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              disabled={isLoading}
            >
              {showCurrentPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* New Password */}
          <div className="relative">
            <FormInput
              type={showNewPassword ? 'text' : 'password'}
              label="New password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={errors.newPassword}
              disabled={isLoading}
              helperText="Must be at least 8 characters"
              className="pl-10 pr-10"
            />
            <Lock className="absolute left-3 top-[38px] w-5 h-5 text-[var(--text-muted)]" />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-[38px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              disabled={isLoading}
            >
              {showNewPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <FormInput
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm new password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              disabled={isLoading}
              className="pl-10 pr-10"
            />
            <Lock className="absolute left-3 top-[38px] w-5 h-5 text-[var(--text-muted)]" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[38px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update password'
              )}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
