import React, { useState } from 'react';
import { Modal } from '../admin/Modal';
import { FormInput } from '../admin/FormInput';
import { Select } from '../admin/Select';
import { Button } from '../admin/Button';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const planOptions = [
  { value: 'killore', label: 'Killore' },
  { value: 'broke-haunted', label: 'Broke Haunted' },
  { value: 'haunted', label: 'Haunted' }
];

const planInfo = {
  killore: { duration: '1 month', description: 'Monthly subscription' },
  'broke-haunted': { duration: '6 months', description: 'Semi-annual subscription' },
  haunted: { duration: 'Lifetime', description: 'One-time payment, lifetime access' }
};

export function AddMemberModal({ isOpen, onClose, onSubmit }: AddMemberModalProps) {
  const [formData, setFormData] = useState({
    username: 'GhostHunter',
    discordId: '842919204992',
    plan: 'killore',
    startDate: new Date().toISOString().split('T')[0],
    notes: 'New member from Discord recruitment campaign'
  });
  
  const selectedPlan = planInfo[formData.plan as keyof typeof planInfo];
  
  const calculateEndDate = () => {
    if (formData.plan === 'haunted') return 'Lifetime';
    
    const start = new Date(formData.startDate);
    if (formData.plan === 'killore') {
      start.setMonth(start.getMonth() + 1);
    } else if (formData.plan === 'broke-haunted') {
      start.setMonth(start.getMonth() + 6);
    }
    return start.toISOString().split('T')[0];
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Member"
      subtitle="Create a new membership account"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          label="Discord Username"
          placeholder="Enter Discord username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
        />
        
        <FormInput
          label="Discord ID"
          placeholder="Enter Discord ID"
          value={formData.discordId}
          onChange={(e) => setFormData({ ...formData, discordId: e.target.value })}
          required
        />
        
        <div>
          <Select
            label="Subscription Plan"
            options={planOptions}
            value={formData.plan}
            onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
          />
          <div className="mt-2 p-3 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-muted)]">Duration:</span>
              <span className="text-[var(--text-primary)]">{selectedPlan.duration}</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">{selectedPlan.description}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-[var(--text-secondary)]">
              End Date
            </label>
            <div className="px-4 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] flex items-center">
              {calculateEndDate()}
            </div>
          </div>
        </div>
        
        <div>
          <label className="text-sm text-[var(--text-secondary)] mb-1.5 block">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="
              w-full px-4 py-2.5 
              bg-[var(--bg-secondary)] 
              border border-[var(--border-default)]
              rounded-lg 
              text-[var(--text-primary)]
              placeholder:text-[var(--text-muted)]
              focus:outline-none 
              focus:ring-2 
              focus:ring-[var(--blue-electric)] 
              focus:border-transparent
              transition-all duration-200
              resize-none
            "
            placeholder="Add any additional notes about this member..."
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Create Member
          </Button>
        </div>
      </form>
    </Modal>
  );
}
