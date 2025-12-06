import React, { useState } from 'react';
import { Modal } from '../admin/Modal';
import { FormInput } from '../admin/FormInput';
import { Select } from '../admin/Select';
import { Toggle } from '../admin/Toggle';
import { Button } from '../admin/Button';

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  plan?: any;
}

export function EditPlanModal({ isOpen, onClose, onSubmit, plan }: EditPlanModalProps) {
  const [formData, setFormData] = useState({
    name: plan?.name || 'New Plan',
    price: plan?.price || '25',
    billingPeriod: plan?.billingPeriod || 'monthly',
    isLifetime: plan?.isLifetime || false,
    description: plan?.description || ''
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
      title={plan ? 'Edit Plan' : 'Create New Plan'}
      subtitle="Configure subscription plan details"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          label="Plan Name"
          placeholder="e.g., Killore, Broke Haunted"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        
        <FormInput
          label="Price (USDT)"
          type="number"
          step="0.01"
          placeholder="25.00"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
        />
        
        <Select
          label="Billing Period"
          options={[
            { value: 'monthly', label: '1 Month' },
            { value: '3months', label: '3 Months' },
            { value: '6months', label: '6 Months' },
            { value: 'yearly', label: '12 Months' }
          ]}
          value={formData.billingPeriod}
          onChange={(e) => setFormData({ ...formData, billingPeriod: e.target.value })}
          disabled={formData.isLifetime}
        />
        
        <div className="border-t border-[var(--border-default)] pt-4">
          <Toggle
            label="Lifetime Plan"
            description="One-time payment with no expiration"
            checked={formData.isLifetime}
            onChange={(checked) => setFormData({ ...formData, isLifetime: checked })}
          />
        </div>
        
        <div>
          <label className="text-sm text-[var(--text-secondary)] mb-1.5 block">
            Description (Optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
            placeholder="Plan features, benefits, etc..."
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {plan ? 'Save Changes' : 'Create Plan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
