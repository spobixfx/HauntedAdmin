import React, { useState } from 'react';
import { Modal } from '../admin/Modal';
import { FormInput } from '../admin/FormInput';
import { Select } from '../admin/Select';
import { Button } from '../admin/Button';

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function AddAdminModal({ isOpen, onClose, onSubmit }: AddAdminModalProps) {
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john.doe@hauntedfamily.com',
    role: 'admin',
    password: 'TempPass123!'
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Admin"
      subtitle="Create a new administrator account"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          label="Full Name"
          placeholder="Enter full name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        
        <FormInput
          label="Email Address"
          type="email"
          placeholder="admin@hauntedfamily.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        
        <Select
          label="Role"
          options={[
            { value: 'admin', label: 'Admin - Can manage members' },
            { value: 'owner', label: 'Owner - Full system access' }
          ]}
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        />
        
        <FormInput
          label="Temporary Password"
          type="text"
          placeholder="Generate secure password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          helperText="Admin will be required to change password on first login"
          required
        />
        
        <div className="p-4 bg-[var(--status-warning)]/10 border border-[var(--status-warning)]/30 rounded-lg">
          <p className="text-sm text-[var(--status-warning)]">
            <strong>Note:</strong> Admin accounts have access to sensitive member data. Only grant admin access to trusted individuals.
          </p>
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Create Admin
          </Button>
        </div>
      </form>
    </Modal>
  );
}
