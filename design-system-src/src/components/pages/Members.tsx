import React, { useState } from 'react';
import { Plus, Clock, DollarSign, Snowflake, Edit } from 'lucide-react';
import { Card } from '../admin/Card';
import { SearchInput } from '../admin/SearchInput';
import { Select } from '../admin/Select';
import { Button } from '../admin/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../admin/Table';
import { Pagination } from '../admin/Pagination';
import { SubscriptionBadge } from '../admin/SubscriptionBadge';
import { StatusBadge } from '../admin/StatusBadge';
import { AddMemberModal } from '../modals/AddMemberModal';
import { AddPaymentModal } from '../modals/AddPaymentModal';
import { ExtendSubscriptionModal } from '../modals/ExtendSubscriptionModal';
import { FreezeModal } from '../modals/FreezeModal';

const planPrices = {
  killore: '25',
  'broke-haunted': '130',
  haunted: '500'
};

const mockMembers = [
  { id: '1', username: 'ShadowStrike', discordId: '842919204992', plan: 'haunted' as const, price: '500', startDate: '2024-01-15', endDate: 'Lifetime', status: 'active' as const, lastPayment: '2024-01-15', daysLeft: '∞' },
  { id: '2', username: 'GhostHunter', discordId: '731829384756', plan: 'killore' as const, price: '25', startDate: '2024-11-01', endDate: '2024-12-01', status: 'active' as const, lastPayment: '2024-11-01', daysLeft: '4' },
  { id: '3', username: 'DarkPhantom', discordId: '923847562019', plan: 'broke-haunted' as const, price: '130', startDate: '2024-08-10', endDate: '2025-02-10', status: 'active' as const, lastPayment: '2024-08-10', daysLeft: '75' },
  { id: '4', username: 'VoidWalker', discordId: '456782910384', plan: 'killore' as const, price: '25', startDate: '2024-10-15', endDate: '2024-11-15', status: 'expired' as const, lastPayment: '2024-10-15', daysLeft: '-12' },
  { id: '5', username: 'NightReaper', discordId: '847392018475', plan: 'haunted' as const, price: '500', startDate: '2023-12-01', endDate: 'Lifetime', status: 'active' as const, lastPayment: '2023-12-01', daysLeft: '∞' },
  { id: '6', username: 'CrypticWolf', discordId: '192837465019', plan: 'broke-haunted' as const, price: '130', startDate: '2024-06-20', endDate: '2024-12-20', status: 'expiring-soon' as const, lastPayment: '2024-06-20', daysLeft: '5' },
  { id: '7', username: 'PhantomRage', discordId: '738291047562', plan: 'killore' as const, price: '25', startDate: '2024-11-10', endDate: '2024-12-10', status: 'active' as const, lastPayment: '2024-11-10', daysLeft: '13' },
  { id: '8', username: 'SilentBlade', discordId: '564738291047', plan: 'killore' as const, price: '25', startDate: '2024-11-05', endDate: '2024-12-05', status: 'expiring-soon' as const, lastPayment: '2024-11-05', daysLeft: '8' },
  { id: '9', username: 'EchoGhost', discordId: '291847563829', plan: 'broke-haunted' as const, price: '130', startDate: '2024-07-15', endDate: '2025-01-15', status: 'active' as const, lastPayment: '2024-07-15', daysLeft: '49' },
  { id: '10', username: 'DemonSlayer', discordId: '847562910384', plan: 'haunted' as const, price: '500', startDate: '2024-02-28', endDate: 'Lifetime', status: 'active' as const, lastPayment: '2024-02-28', daysLeft: '∞' },
  { id: '11', username: 'NightShade', discordId: '938475620192', plan: 'killore' as const, price: '25', startDate: '2024-11-20', endDate: '2024-12-20', status: 'active' as const, lastPayment: '2024-11-20', daysLeft: '23' },
  { id: '12', username: 'ShadowBlade', discordId: '473829105647', plan: 'broke-haunted' as const, price: '130', startDate: '2024-09-01', endDate: '2025-03-01', status: 'active' as const, lastPayment: '2024-09-01', daysLeft: '94' },
  { id: '13', username: 'VoidStalker', discordId: '829104756382', plan: 'killore' as const, price: '25', startDate: '2024-09-25', endDate: '2024-10-25', status: 'expired' as const, lastPayment: '2024-09-25', daysLeft: '-33' },
  { id: '14', username: 'GhostRider', discordId: '192847563910', plan: 'haunted' as const, price: '500', startDate: '2023-11-10', endDate: 'Lifetime', status: 'active' as const, lastPayment: '2023-11-10', daysLeft: '∞' },
  { id: '15', username: 'DarkWarden', discordId: '564738920147', plan: 'killore' as const, price: '25', startDate: '2024-11-12', endDate: '2024-12-12', status: 'active' as const, lastPayment: '2024-11-12', daysLeft: '15' },
  { id: '16', username: 'PhantomStrike', discordId: '738291056473', plan: 'broke-haunted' as const, price: '130', startDate: '2024-08-25', endDate: '2025-02-25', status: 'active' as const, lastPayment: '2024-08-25', daysLeft: '90' },
  { id: '17', username: 'SilentReaper', discordId: '910384756291', plan: 'killore' as const, price: '25', startDate: '2024-11-08', endDate: '2024-12-08', status: 'expiring-soon' as const, lastPayment: '2024-11-08', daysLeft: '11' },
  { id: '18', username: 'VoidReaper', discordId: '456291038475', plan: 'haunted' as const, price: '500', startDate: '2024-03-15', endDate: 'Lifetime', status: 'active' as const, lastPayment: '2024-03-15', daysLeft: '∞' },
  { id: '19', username: 'DarkRaven', discordId: '829105647382', plan: 'broke-haunted' as const, price: '130', startDate: '2024-10-01', endDate: '2025-04-01', status: 'active' as const, lastPayment: '2024-10-01', daysLeft: '125' },
  { id: '20', username: 'NightHunter', discordId: '384756291047', plan: 'killore' as const, price: '25', startDate: '2024-10-20', endDate: '2024-11-20', status: 'expired' as const, lastPayment: '2024-10-20', daysLeft: '-7' }
];

export function Members() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const itemsPerPage = 10;
  
  const filteredMembers = mockMembers.filter(member => {
    const matchesSearch = member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.discordId.includes(searchQuery);
    const matchesPlan = filterPlan === 'all' || member.plan === filterPlan;
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });
  
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedMembers = filteredMembers.slice(startIndex, startIndex + itemsPerPage);
  
  const handleQuickAction = (action: string, member: any) => {
    setSelectedMember(member);
    if (action === 'payment') setIsPaymentModalOpen(true);
    if (action === 'extend') setIsExtendModalOpen(true);
    if (action === 'freeze') setIsFreezeModalOpen(true);
  };
  
  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchInput 
              placeholder="Search members by username or Discord ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3">
            <Select
              options={[
                { value: 'all', label: 'All Plans' },
                { value: 'killore', label: 'Killore' },
                { value: 'broke-haunted', label: 'Broke Haunted' },
                { value: 'haunted', label: 'Haunted' }
              ]}
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="w-48"
            />
            
            <Select
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'expired', label: 'Expired' },
                { value: 'expiring-soon', label: 'Expiring Soon' },
                { value: 'frozen', label: 'Frozen' },
                { value: 'trial', label: 'Trial' }
              ]}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-48"
            />
            
            <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Member
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Members Table */}
      <Card padding="sm">
        <Table>
          <TableHeader>
            <TableRow hoverable={false}>
              <TableHead>Username</TableHead>
              <TableHead>Discord ID</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Days Left</TableHead>
              <TableHead>Last Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead align="right">Quick Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.username}</TableCell>
                <TableCell>
                  <span className="font-mono text-sm text-[var(--text-muted)]">
                    {member.discordId}
                  </span>
                </TableCell>
                <TableCell>
                  <SubscriptionBadge plan={member.plan} />
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm text-[var(--text-primary)]">
                    ${member.price}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`
                    text-sm font-mono
                    ${member.daysLeft === '∞' ? 'text-[var(--premium-gold)]' : 
                      parseInt(member.daysLeft) < 0 ? 'text-[var(--status-error)]' : 
                      parseInt(member.daysLeft) <= 7 ? 'text-[var(--status-warning)]' : 
                      'text-[var(--text-primary)]'}
                  `}>
                    {member.daysLeft === '∞' ? '∞' : `${member.daysLeft}d`}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-[var(--text-muted)]">{member.lastPayment}</span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={member.status} />
                </TableCell>
                <TableCell align="right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleQuickAction('extend', member)}
                      className="p-2 hover:bg-[var(--bg-elevated)] rounded-lg transition-colors"
                      title="Extend Subscription"
                    >
                      <Clock className="w-4 h-4 text-[var(--blue-electric)]" />
                    </button>
                    <button
                      onClick={() => handleQuickAction('payment', member)}
                      className="p-2 hover:bg-[var(--bg-elevated)] rounded-lg transition-colors"
                      title="Add Payment"
                    >
                      <DollarSign className="w-4 h-4 text-[var(--status-success)]" />
                    </button>
                    <button
                      onClick={() => handleQuickAction('freeze', member)}
                      className="p-2 hover:bg-[var(--bg-elevated)] rounded-lg transition-colors"
                      title="Freeze"
                    >
                      <Snowflake className="w-4 h-4 text-[var(--grey-blue)]" />
                    </button>
                    <button
                      onClick={() => console.log('Edit', member.id)}
                      className="p-2 hover:bg-[var(--bg-elevated)] rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-[var(--text-muted)]" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="mt-6 px-4 flex items-center justify-between">
          <div className="text-sm text-[var(--text-muted)]">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredMembers.length)} of {filteredMembers.length} members
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>
      
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => console.log('New member:', data)}
      />
      
      {selectedMember && (
        <>
          <AddPaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => {
              setIsPaymentModalOpen(false);
              setSelectedMember(null);
            }}
            onSubmit={(data) => console.log('Payment:', data)}
            defaultAmount={selectedMember.price}
            memberName={selectedMember.username}
          />
          
          <ExtendSubscriptionModal
            isOpen={isExtendModalOpen}
            onClose={() => {
              setIsExtendModalOpen(false);
              setSelectedMember(null);
            }}
            onSubmit={(data) => console.log('Extend:', data)}
            memberName={selectedMember.username}
            currentEndDate={selectedMember.endDate}
          />
          
          <FreezeModal
            isOpen={isFreezeModalOpen}
            onClose={() => {
              setIsFreezeModalOpen(false);
              setSelectedMember(null);
            }}
            onSubmit={(data) => console.log('Freeze:', data)}
            memberName={selectedMember.username}
          />
        </>
      )}
    </div>
  );
}
