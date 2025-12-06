import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardHeader } from '../admin/Card';
import { Button } from '../admin/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../admin/Table';
import { StatusBadge } from '../admin/StatusBadge';
import { ActionMenu } from '../admin/ActionMenu';
import { EditPlanModal } from '../modals/EditPlanModal';

const mockPlans = [
  {
    id: '1',
    name: 'Killore',
    price: '25.00',
    billingPeriod: '1 Month',
    isLifetime: false,
    status: 'active' as const,
    description: 'Monthly subscription plan'
  },
  {
    id: '2',
    name: 'Broke Haunted',
    price: '130.00',
    billingPeriod: '6 Months',
    isLifetime: false,
    status: 'active' as const,
    description: 'Semi-annual subscription plan'
  },
  {
    id: '3',
    name: 'Haunted',
    price: '500.00',
    billingPeriod: 'Lifetime',
    isLifetime: true,
    status: 'active' as const,
    description: 'One-time payment, lifetime access'
  }
];

export function Plans() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  
  const handleEdit = (plan: any) => {
    setSelectedPlan(plan);
    setIsEditModalOpen(true);
  };
  
  const handleCreate = () => {
    setSelectedPlan(null);
    setIsEditModalOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader 
          title="Subscription Plans" 
          subtitle="Manage pricing and billing periods for membership tiers"
        />
        
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--border-default)]">
          <div className="text-sm text-[var(--text-muted)]">
            All payments are processed in USDT via TRC20 network
          </div>
          <Button variant="primary" onClick={handleCreate}>
            <Plus className="w-4 h-4" />
            Create Plan
          </Button>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow hoverable={false}>
              <TableHead>Plan Name</TableHead>
              <TableHead>Price (USDT)</TableHead>
              <TableHead>Billing Period</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead align="right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPlans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>
                  <div>
                    <div className="text-sm text-[var(--text-primary)]">
                      {plan.name}
                    </div>
                    {plan.description && (
                      <div className="text-xs text-[var(--text-muted)] mt-1">
                        {plan.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-mono text-[var(--text-primary)]">
                    ${plan.price}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{plan.billingPeriod}</span>
                </TableCell>
                <TableCell>
                  <span 
                    className={`
                      inline-flex items-center px-2.5 py-1 
                      rounded-full text-xs
                      ${plan.isLifetime 
                        ? 'bg-[var(--premium-gold)]/20 text-[var(--premium-gold)] border border-[var(--premium-gold)]/30' 
                        : 'bg-[var(--blue-electric)]/20 text-[var(--blue-electric)] border border-[var(--blue-electric)]/30'
                      }
                    `}
                  >
                    {plan.isLifetime ? 'Lifetime' : 'Recurring'}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={plan.status} />
                </TableCell>
                <TableCell align="right">
                  <ActionMenu
                    onEdit={() => handleEdit(plan)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      
      <EditPlanModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={(data) => console.log('Plan data:', data)}
        plan={selectedPlan}
      />
    </div>
  );
}
