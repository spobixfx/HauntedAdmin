import React, { useState } from 'react';
import { Modal } from '../admin/Modal';
import { FormInput } from '../admin/FormInput';
import { Select } from '../admin/Select';
import { Button } from '../admin/Button';
import { DollarSign } from 'lucide-react';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  defaultAmount?: string;
  memberName?: string;
}

export function AddPaymentModal({ isOpen, onClose, onSubmit, defaultAmount = '25', memberName }: AddPaymentModalProps) {
  const [formData, setFormData] = useState({
    amount: defaultAmount,
    date: new Date().toISOString().split('T')[0],
    plan: 'killore',
    notes: ''
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
      title="Add Payment"
      subtitle={memberName ? `Record payment for ${memberName}` : 'Record a new payment'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)]">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-2">
            <DollarSign className="w-4 h-4" />
            <span>Payment Method: TRC20 (USDT)</span>
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            All payments are recorded in USDT on the TRON network (TRC20)
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Amount (USDT)"
            type="number"
            step="0.01"
            placeholder="25.00"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
          
          <FormInput
            label="Payment Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        
        <Select
          label="Plan"
          options={[
            { value: 'killore', label: 'Killore (1 month)' },
            { value: 'broke-haunted', label: 'Broke Haunted (6 months)' },
            { value: 'haunted', label: 'Haunted (Lifetime)' }
          ]}
          value={formData.plan}
          onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
        />
        
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
            placeholder="Transaction ID, payment notes, etc..."
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Confirm Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
