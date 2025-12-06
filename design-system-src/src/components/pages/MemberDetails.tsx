import React, { useState } from 'react';
import { Card, CardHeader } from '../admin/Card';
import { FormInput } from '../admin/FormInput';
import { Select } from '../admin/Select';
import { Button } from '../admin/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../admin/Table';
import { History, Save, Clock, UserPlus, Edit, CheckCircle, DollarSign, ArrowUpCircle, Snowflake, Calendar } from 'lucide-react';
import { PaymentAlert } from '../admin/PaymentAlert';
import { AddPaymentModal } from '../modals/AddPaymentModal';
import { ExtendSubscriptionModal } from '../modals/ExtendSubscriptionModal';
import { UpgradePlanModal } from '../modals/UpgradePlanModal';
import { FreezeModal } from '../modals/FreezeModal';

const mockHistory = [
  {
    id: '1',
    type: 'edit',
    icon: Edit,
    color: 'text-[var(--grey-blue)]',
    bgColor: 'bg-[var(--grey-blue)]/10',
    action: 'Plan changed',
    details: 'Changed from Killore to Broke Haunted',
    admin: 'Admin Vlad',
    isSystem: false,
    timestamp: '2024-11-15 14:32'
  },
  {
    id: '2',
    type: 'extend',
    icon: Clock,
    color: 'text-[var(--blue-electric)]',
    bgColor: 'bg-[var(--blue-electric)]/10',
    action: 'Subscription extended',
    details: 'Extended by 6 months',
    admin: 'Admin Ghost',
    isSystem: false,
    timestamp: '2024-11-10 09:15'
  },
  {
    id: '3',
    type: 'payment',
    icon: DollarSign,
    color: 'text-[var(--status-success)]',
    bgColor: 'bg-[var(--status-success)]/10',
    action: 'Payment recorded',
    details: '130 USDT received via TRC20',
    admin: 'Admin Vlad',
    isSystem: false,
    timestamp: '2024-11-10 09:10'
  },
  {
    id: '4',
    type: 'edit',
    icon: Edit,
    color: 'text-[var(--grey-blue)]',
    bgColor: 'bg-[var(--grey-blue)]/10',
    action: 'Discord ID updated',
    details: 'Updated Discord ID',
    admin: 'Admin Vlad',
    isSystem: false,
    timestamp: '2024-10-28 16:45'
  },
  {
    id: '5',
    type: 'renew',
    icon: CheckCircle,
    color: 'text-[var(--status-success)]',
    bgColor: 'bg-[var(--status-success)]/10',
    action: 'Subscription renewed',
    details: 'Renewed Killore plan for 1 month',
    admin: 'System',
    isSystem: true,
    timestamp: '2024-10-01 11:20'
  }
];

const mockPayments = [
  { id: '1', date: '2024-11-10', amount: '130.00', plan: 'Broke Haunted', method: 'TRC20', admin: 'Admin Vlad', notes: 'TxID: Tda82...9fe2' },
  { id: '2', date: '2024-05-15', amount: '25.00', plan: 'Killore', method: 'TRC20', admin: 'Admin Ghost', notes: 'Initial payment' },
  { id: '3', date: '2024-04-10', amount: '25.00', plan: 'Killore', method: 'TRC20', admin: 'Admin Ghost', notes: '' }
];

export function MemberDetails() {
  const [activeTab, setActiveTab] = useState('details');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    username: 'GhostHunter',
    discordId: '842919204992',
    plan: 'broke-haunted',
    status: 'active',
    startDate: '2024-07-01',
    endDate: '2025-01-01',
    notes: 'Active community member. Participated in last 3 tournaments. Preferred payment method: PayPal.'
  });
  
  const calculateDaysRemaining = () => {
    if (formData.endDate === 'Lifetime' || !formData.endDate) return '∞';
    const endDate = new Date(formData.endDate);
    if (isNaN(endDate.getTime())) return 'N/A';
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  return (
    <div className="space-y-6">
      {/* Payment Alert */}
      <PaymentAlert 
        type="overdue" 
        lastPaymentDate="2024-11-10"
        planDuration="6 months"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Member Information Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader 
              title="Member Information" 
              subtitle="Update member details and subscription"
            />
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Discord Username"
                  placeholder="Enter Discord username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
                
                <FormInput
                  label="Discord ID"
                  placeholder="Enter Discord ID"
                  value={formData.discordId}
                  onChange={(e) => setFormData({ ...formData, discordId: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Subscription Plan"
                  options={[
                    { value: 'killore', label: 'Killore (1 month)' },
                    { value: 'broke-haunted', label: 'Broke Haunted (6 months)' },
                    { value: 'haunted', label: 'Haunted (Lifetime)' }
                  ]}
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                />
                
                <Select
                  label="Status"
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'expired', label: 'Expired' },
                    { value: 'expiring-soon', label: 'Expiring Soon' },
                    { value: 'frozen', label: 'Frozen' },
                    { value: 'trial', label: 'Trial' }
                  ]}
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
                
                <FormInput
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  helperText={formData.plan === 'haunted' ? 'Lifetime membership' : ''}
                />
              </div>
              
              <div>
                <label className="text-sm text-[var(--text-secondary)] mb-1.5 block">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
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
                <Button variant="ghost">
                  Cancel
                </Button>
                <Button variant="primary">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Subscription Summary */}
          <Card>
            <CardHeader 
              title="Subscription Summary" 
              subtitle="Current plan details and renewal information"
            />
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)]">
                <div className="text-xs text-[var(--text-muted)] mb-1">Current Plan</div>
                <div className="text-sm text-[var(--text-primary)]">Broke Haunted</div>
              </div>
              
              <div className="p-4 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)]">
                <div className="text-xs text-[var(--text-muted)] mb-1">Price</div>
                <div className="text-sm text-[var(--text-primary)]">130 USDT</div>
              </div>
              
              <div className="p-4 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)]">
                <div className="text-xs text-[var(--text-muted)] mb-1">Period</div>
                <div className="text-sm text-[var(--text-primary)]">6 Months</div>
              </div>
              
              <div className="p-4 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)]">
                <div className="text-xs text-[var(--text-muted)] mb-1">Days Remaining</div>
                <div className="text-sm text-[var(--text-primary)]">
                  {(() => {
                    const days = calculateDaysRemaining();
                    return days === '∞' || days === 'N/A' ? days : `${days} days`;
                  })()}
                </div>
              </div>
              
              <div className="p-4 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)]">
                <div className="text-xs text-[var(--text-muted)] mb-1">Next Renewal</div>
                <div className="text-sm text-[var(--text-primary)]">130 USDT</div>
              </div>
              
              <div className="p-4 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)]">
                <div className="text-xs text-[var(--text-muted)] mb-1">Status</div>
                <div className="text-sm text-[var(--status-success)]">Active</div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-[var(--border-default)]">
              <Button variant="secondary" onClick={() => setIsExtendModalOpen(true)}>
                <Clock className="w-4 h-4" />
                Extend Subscription
              </Button>
              <Button variant="secondary" onClick={() => setIsUpgradeModalOpen(true)}>
                <ArrowUpCircle className="w-4 h-4" />
                Upgrade Plan
              </Button>
              <Button variant="secondary" onClick={() => setIsPaymentModalOpen(true)}>
                <DollarSign className="w-4 h-4" />
                Add Payment
              </Button>
              <Button variant="ghost" onClick={() => setIsFreezeModalOpen(true)}>
                <Snowflake className="w-4 h-4" />
                Freeze
              </Button>
            </div>
          </Card>
          
          {/* Tabs Section */}
          <Card>
            <div className="flex gap-4 border-b border-[var(--border-default)] mb-6">
              <button
                onClick={() => setActiveTab('details')}
                className={`
                  px-4 py-3 text-sm relative
                  transition-colors
                  ${activeTab === 'details' 
                    ? 'text-[var(--blue-electric)]' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }
                `}
              >
                Activity History
                {activeTab === 'details' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--blue-electric)]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`
                  px-4 py-3 text-sm relative
                  transition-colors
                  ${activeTab === 'payments' 
                    ? 'text-[var(--blue-electric)]' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }
                `}
              >
                Payments
                {activeTab === 'payments' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--blue-electric)]" />
                )}
              </button>
            </div>
            
            {activeTab === 'details' && (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {mockHistory.map((item) => {
                  const Icon = item.icon;
                  
                  return (
                    <div 
                      key={item.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${item.bgColor} flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-[var(--text-primary)] mb-0.5">
                          {item.action}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] mb-1">
                          {item.details}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                          <span>{item.isSystem ? '⚙️' : '👤'}</span>
                          <span>{item.admin}</span>
                          <span>•</span>
                          <span>{item.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {activeTab === 'payments' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-[var(--text-muted)]">
                    Total revenue: <span className="text-[var(--text-primary)]">185 USDT</span>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => setIsPaymentModalOpen(true)}>
                    <DollarSign className="w-4 h-4" />
                    Add Payment
                  </Button>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow hoverable={false}>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <span className="text-sm">{payment.date}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-mono text-[var(--status-success)]">
                            {payment.amount} USDT
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{payment.plan}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs px-2 py-1 bg-[var(--blue-electric)]/20 text-[var(--blue-electric)] rounded">
                            {payment.method}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-[var(--text-muted)]">{payment.admin}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-[var(--text-muted)]">{payment.notes || '—'}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>
        
        {/* Right: Quick Stats */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader 
              title="Quick Stats" 
              subtitle="Member overview"
            />
            
            <div className="space-y-4">
              <div className="p-4 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)]">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-xs text-[var(--text-muted)]">Member Since</span>
                </div>
                <div className="text-sm text-[var(--text-primary)]">July 1, 2024</div>
              </div>
              
              <div className="p-4 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)]">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-xs text-[var(--text-muted)]">Total Spent</span>
                </div>
                <div className="text-sm text-[var(--text-primary)]">185 USDT</div>
              </div>
              
              <div className="p-4 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)]">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-xs text-[var(--text-muted)]">Last Payment</span>
                </div>
                <div className="text-sm text-[var(--text-primary)]">Nov 10, 2024</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      <AddPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSubmit={(data) => console.log('Payment:', data)}
        defaultAmount="130"
        memberName={formData.username}
      />
      
      <ExtendSubscriptionModal
        isOpen={isExtendModalOpen}
        onClose={() => setIsExtendModalOpen(false)}
        onSubmit={(data) => console.log('Extend:', data)}
        memberName={formData.username}
        currentEndDate={formData.endDate}
      />
      
      <UpgradePlanModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onSubmit={(data) => console.log('Upgrade:', data)}
        memberName={formData.username}
        currentPlan={formData.plan}
      />
      
      <FreezeModal
        isOpen={isFreezeModalOpen}
        onClose={() => setIsFreezeModalOpen(false)}
        onSubmit={(data) => console.log('Freeze:', data)}
        memberName={formData.username}
      />
    </div>
  );
}
