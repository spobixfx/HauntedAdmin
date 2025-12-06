import React, { useState } from 'react';
import { Modal } from '../admin/Modal';
import { FormInput } from '../admin/FormInput';
import { Button } from '../admin/Button';
import { Snowflake } from 'lucide-react';

interface FreezeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  memberName?: string;
}

export function FreezeModal({ isOpen, onClose, onSubmit, memberName }: FreezeModalProps) {
  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    reason: ''
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
      title="Freeze Subscription"
      subtitle={memberName ? `Temporarily pause subscription for ${memberName}` : 'Pause member subscription'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 bg-[var(--blue-electric)]/10 rounded-lg border border-[var(--blue-electric)]/30">
          <div className="flex items-center gap-2 text-sm text-[var(--blue-electric)] mb-2">
            <Snowflake className="w-4 h-4" />
            <span>Freeze Period</span>
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            Member access will be suspended during the freeze period. The subscription end date will be extended by the freeze duration.
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
          
          <FormInput
            label="End Date"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
        </div>
        
        <div>
          <label className="text-sm text-[var(--text-secondary)] mb-1.5 block">
            Reason
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
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
            placeholder="Reason for freezing subscription..."
            required
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Apply Freeze
          </Button>
        </div>
      </form>
    </Modal>
  );
}
