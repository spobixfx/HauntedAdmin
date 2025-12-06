import React, { useState } from 'react';
import { Modal } from '../admin/Modal';
import { Select } from '../admin/Select';
import { Button } from '../admin/Button';
import { Calendar, DollarSign } from 'lucide-react';

interface ExtendSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  memberName?: string;
  currentEndDate?: string;
}

const extensionOptions = [
  { value: '1', label: '1 Month', price: '25' },
  { value: '3', label: '3 Months', price: '70' },
  { value: '6', label: '6 Months', price: '130' }
];

export function ExtendSubscriptionModal({ isOpen, onClose, onSubmit, memberName, currentEndDate }: ExtendSubscriptionModalProps) {
  const [duration, setDuration] = useState('1');
  
  const selectedOption = extensionOptions.find(opt => opt.value === duration) || extensionOptions[0];
  
  const calculateNewEndDate = () => {
    if (!currentEndDate || currentEndDate === 'Lifetime') return 'N/A';
    const date = new Date(currentEndDate);
    if (isNaN(date.getTime())) return 'N/A';
    date.setMonth(date.getMonth() + parseInt(duration));
    return date.toISOString().split('T')[0];
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ duration, price: selectedOption.price });
    onClose();
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Extend Subscription"
      subtitle={memberName ? `Extend subscription for ${memberName}` : 'Extend member subscription'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Select
          label="Extension Duration"
          options={extensionOptions.map(opt => ({
            value: opt.value,
            label: `${opt.label} - ${opt.price} USDT`
          }))}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)]">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-2">
              <Calendar className="w-4 h-4" />
              <span>Current End Date</span>
            </div>
            <div className="text-sm text-[var(--text-primary)]">
              {currentEndDate || 'N/A'}
            </div>
          </div>
          
          <div className="p-4 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)]">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-2">
              <Calendar className="w-4 h-4" />
              <span>New End Date</span>
            </div>
            <div className="text-sm text-[var(--text-primary)]">
              {calculateNewEndDate()}
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-[var(--status-success)]/10 rounded-lg border border-[var(--status-success)]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[var(--status-success)]">
              <DollarSign className="w-4 h-4" />
              <span>Expected Payment</span>
            </div>
            <div className="text-[var(--status-success)]">
              {selectedOption.price} USDT
            </div>
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-2">
            Remember to record the payment after confirming extension
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Extend Subscription
          </Button>
        </div>
      </form>
    </Modal>
  );
}
