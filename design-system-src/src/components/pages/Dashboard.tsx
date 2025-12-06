import React from 'react';
import { Users, DollarSign, UserCheck, Clock, TrendingUp, Calendar } from 'lucide-react';
import { KPICard } from '../admin/KPICard';
import { Card, CardHeader } from '../admin/Card';
import { ActivityLog } from '../admin/ActivityLog';
import { RevenueChart } from '../admin/RevenueChart';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../admin/Table';
import { SubscriptionBadge } from '../admin/SubscriptionBadge';

const recentActivities = [
  {
    id: '1',
    type: 'extend' as const,
    admin: 'Admin Vlad',
    member: 'UserShadow',
    timestamp: '2 minutes ago',
    description: '📅 Extended subscription for UserShadow by 1 month (Killore plan)'
  },
  {
    id: '2',
    type: 'expire' as const,
    admin: 'System',
    member: 'CrypticWolf',
    timestamp: '15 minutes ago',
    description: '⚙️ Auto-expired membership for CrypticWolf - Broke Haunted plan ended'
  },
  {
    id: '3',
    type: 'add' as const,
    admin: 'Admin Ghost',
    member: 'PhantomStrike',
    timestamp: '1 hour ago',
    description: '👤 Added new member PhantomStrike with Haunted (Lifetime) plan'
  },
  {
    id: '4',
    type: 'renew' as const,
    admin: 'System',
    member: 'DarkRaven',
    timestamp: '2 hours ago',
    description: '💰 Payment recorded: 130 USDT from DarkRaven for Broke Haunted plan'
  },
  {
    id: '5',
    type: 'renew' as const,
    admin: 'Admin Ghost',
    member: 'NightShade',
    timestamp: '3 hours ago',
    description: '📅 Renewed subscription for NightShade - Killore plan for 1 month'
  },
  {
    id: '6',
    type: 'add' as const,
    admin: 'Admin Vlad',
    member: 'SilentReaper',
    timestamp: '4 hours ago',
    description: '👤 Added new member SilentReaper with Killore plan'
  },
  {
    id: '7',
    type: 'extend' as const,
    admin: 'Admin Ghost',
    member: 'VoidWalker',
    timestamp: '5 hours ago',
    description: '🔒 Applied freeze to VoidWalker subscription until Jan 15, 2025'
  },
  {
    id: '8',
    type: 'expire' as const,
    admin: 'System',
    member: 'GhostRider',
    timestamp: '6 hours ago',
    description: '⚙️ Auto-expired membership for GhostRider - Killore plan ended'
  }
];

const upcomingRenewals = [
  { id: '1', member: 'ShadowBlade', plan: 'broke-haunted' as const, endDate: '2024-12-05', expectedPayment: '130' },
  { id: '2', member: 'VoidStalker', plan: 'killore' as const, endDate: '2024-12-07', expectedPayment: '25' },
  { id: '3', member: 'NightReaper', plan: 'killore' as const, endDate: '2024-12-08', expectedPayment: '25' },
  { id: '4', member: 'DarkPhantom', plan: 'broke-haunted' as const, endDate: '2024-12-10', expectedPayment: '130' },
  { id: '5', member: 'GhostHunter', plan: 'killore' as const, endDate: '2024-12-12', expectedPayment: '25' }
];

export function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Monthly Revenue"
          value="$2,847"
          icon={DollarSign}
          trend={{ value: '+15%', direction: 'up' }}
          subtitle="Last 30 days"
        />
        <KPICard
          title="Total Revenue"
          value="$38,450"
          icon={TrendingUp}
          trend={{ value: '+22%', direction: 'up' }}
          subtitle="All-time"
        />
        <KPICard
          title="MRR"
          value="$2,950"
          icon={DollarSign}
          trend={{ value: '+8%', direction: 'up' }}
          subtitle="Monthly recurring"
        />
        <KPICard
          title="Total Active Members"
          value="243"
          icon={Users}
          trend={{ value: '+12', direction: 'up' }}
          subtitle="Active subscriptions"
        />
      </div>
      
      {/* Secondary KPI Row - Active Members by Plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Killore (Monthly)"
          value="118"
          icon={UserCheck}
          trend={{ value: '+8', direction: 'up' }}
        />
        <KPICard
          title="Broke Haunted (6M)"
          value="74"
          icon={DollarSign}
          trend={{ value: '+5', direction: 'up' }}
        />
        <KPICard
          title="Haunted (Lifetime)"
          value="51"
          icon={Users}
          trend={{ value: '+3', direction: 'up' }}
        />
        <KPICard
          title="Expiring Soon (7 days)"
          value="12"
          icon={Clock}
        />
      </div>
      
      {/* New Members KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KPICard
          title="New Members (7 days)"
          value="18"
          icon={Users}
          trend={{ value: '+25%', direction: 'up' }}
        />
        <KPICard
          title="New Members (30 days)"
          value="34"
          icon={Users}
          trend={{ value: '+18%', direction: 'up' }}
        />
      </div>
      
      {/* Revenue Chart */}
      <Card>
        <CardHeader 
          title="Revenue Last 12 Months" 
          subtitle="Monthly revenue trends in USDT"
        />
        
        <RevenueChart />
      </Card>
      
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Renewals */}
        <Card>
          <CardHeader 
            title="Upcoming Renewals" 
            subtitle="Members expiring in the next 7 days"
          />
          
          <Table>
            <TableHeader>
              <TableRow hoverable={false}>
                <TableHead>Member</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead align="right">Expected</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingRenewals.map((renewal) => (
                <TableRow key={renewal.id}>
                  <TableCell>
                    <span className="text-sm">{renewal.member}</span>
                  </TableCell>
                  <TableCell>
                    <SubscriptionBadge plan={renewal.plan} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      <span className="text-sm">{renewal.endDate}</span>
                    </div>
                  </TableCell>
                  <TableCell align="right">
                    <span className="text-sm font-mono text-[var(--status-success)]">
                      {renewal.expectedPayment} USDT
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        
        {/* Activity Log */}
        <Card>
          <CardHeader 
            title="Recent Activity" 
            subtitle="Latest system events"
          />
          
          <ActivityLog activities={recentActivities} />
        </Card>
      </div>
    </div>
  );
}
