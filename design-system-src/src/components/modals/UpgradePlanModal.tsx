import React, { useState } from 'react';
import { Modal } from '../admin/Modal';
import { Select } from '../admin/Select';
import { Button } from '../admin/Button';
import { ArrowUpCircle, DollarSign } from 'lucide-react';

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  memberName?: string;
  currentPlan?: string;
  currentPrice?: string;
}

const planPrices = {
  killore: { label: 'Killore (1 month)', price: 25 },
  'broke-haunted': { label: 'Broke Haunted (6 months)', price: 130 },
  haunted: { label: 'Haunted (Lifetime)', price: 500 }
};

export function UpgradePlanModal({ isOpen, onClose, onSubmit, memberName, currentPlan = 'killore', currentPrice = '25' }: UpgradePlanModalProps) {
  const [newPlan, setNewPlan] = useState('broke-haunted');
  
  const currentPlanData = planPrices[currentPlan as keyof typeof planPrices];
  const newPlanData = planPrices[newPlan as keyof typeof planPrices];
  const priceDifference = newPlanData.price - currentPlanData.price;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ newPlan, priceDifference });
    onClose();
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upgrade Plan"
      subtitle={memberName ? `Upgrade subscription plan for ${memberName}` : 'Upgrade member plan'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)]">
          <div className="text-xs text-[var(--text-muted)] mb-2">Current Plan</div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-primary)]">{currentPlanData.label}</span>
            <span className="text-sm text-[var(--text-secondary)]">{currentPlanData.price} USDT</span>
          </div>
        </div>
        
        <Select
          label="New Plan"
          options={Object.entries(planPrices)
            .filter(([key]) => key !== currentPlan)
            .map(([value, data]) => ({
              value,
              label: `${data.label} - ${data.price} USDT`
            }))}
          value={newPlan}
          onChange={(e) => setNewPlan(e.target.value)}
        />
        
        <div className={`
          p-4 rounded-lg border
          ${priceDifference > 0 
            ? 'bg-[var(--status-warning)]/10 border-[var(--status-warning)]/30' 
            : 'bg-[var(--status-success)]/10 border-[var(--status-success)]/30'
          }
        `}>
          <div className="flex items-center justify-between mb-2">
            <div className={`flex items-center gap-2 text-sm ${priceDifference > 0 ? 'text-[var(--status-warning)]' : 'text-[var(--status-success)]'}`}>
              <ArrowUpCircle className="w-4 h-4" />
              <span>Price Difference</span>
            </div>
            <div className={`text-sm ${priceDifference > 0 ? 'text-[var(--status-warning)]' : 'text-[var(--status-success)]'}`}>
              {priceDifference > 0 ? '+' : ''}{priceDifference} USDT
            </div>
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            {priceDifference > 0 
              ? 'Member should pay the difference to upgrade' 
              : 'This is a downgrade - no additional payment required'}
          </div>
        </div>
        
        <div className="p-4 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
              <DollarSign className="w-4 h-4" />
              <span>New Plan Price</span>
            </div>
            <div className="text-sm text-[var(--text-primary)]">
              {newPlanData.price} USDT
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Confirm Upgrade
          </Button>
        </div>
      </form>
    </Modal>
  );
}
