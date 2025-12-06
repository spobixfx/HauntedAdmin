import React, { useState } from 'react';
import { Shield, Plus, UserPlus, Crown } from 'lucide-react';
import { Card } from '../admin/Card';
import { SearchInput } from '../admin/SearchInput';
import { Button } from '../admin/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../admin/Table';
import { Pagination } from '../admin/Pagination';
import { StatusBadge } from '../admin/StatusBadge';
import { ActionMenu } from '../admin/ActionMenu';
import { AddAdminModal } from '../modals/AddAdminModal';

const mockAdmins = [
  {
    id: '1',
    name: 'Vlad Dracula',
    email: 'vlad@hauntedfamily.com',
    role: 'owner',
    status: 'active' as const,
    createdAt: '2023-01-15',
    lastActive: '2 minutes ago'
  },
  {
    id: '2',
    name: 'Ghost Shadow',
    email: 'ghost@hauntedfamily.com',
    role: 'admin',
    status: 'active' as const,
    createdAt: '2023-03-20',
    lastActive: '5 minutes ago'
  },
  {
    id: '3',
    name: 'Dark Knight',
    email: 'knight@hauntedfamily.com',
    role: 'admin',
    status: 'active' as const,
    createdAt: '2023-06-10',
    lastActive: '1 hour ago'
  },
  {
    id: '4',
    name: 'Phantom Ops',
    email: 'phantom@hauntedfamily.com',
    role: 'admin',
    status: 'active' as const,
    createdAt: '2023-08-05',
    lastActive: '3 hours ago'
  },
  {
    id: '5',
    name: 'Night Watcher',
    email: 'watcher@hauntedfamily.com',
    role: 'admin',
    status: 'active' as const,
    createdAt: '2024-01-12',
    lastActive: '1 day ago'
  },
  {
    id: '6',
    name: 'Void Master',
    email: 'void@hauntedfamily.com',
    role: 'admin',
    status: 'expired' as const,
    createdAt: '2023-11-20',
    lastActive: '30 days ago'
  }
];

export function Admins() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredAdmins = mockAdmins.filter(admin =>
    admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchInput 
              placeholder="Search admins by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
            <UserPlus className="w-4 h-4" />
            Add Admin
          </Button>
        </div>
      </Card>
      
      {/* Admins Table */}
      <Card padding="sm">
        <Table>
          <TableHeader>
            <TableRow hoverable={false}>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Status</TableHead>
              <TableHead align="right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdmins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {admin.role === 'owner' && (
                      <Crown className="w-4 h-4 text-[var(--premium-gold)]" />
                    )}
                    <span>{admin.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-[var(--text-muted)]">
                    {admin.email}
                  </span>
                </TableCell>
                <TableCell>
                  <span 
                    className={`
                      inline-flex items-center gap-1.5 px-3 py-1 
                      rounded-full text-xs
                      ${admin.role === 'owner' 
                        ? 'bg-[var(--premium-gold)]/20 text-[var(--premium-gold)] border border-[var(--premium-gold)]/30' 
                        : 'bg-[var(--blue-electric)]/20 text-[var(--blue-electric)] border border-[var(--blue-electric)]/30'
                      }
                    `}
                  >
                    {admin.role === 'owner' ? (
                      <>
                        <Crown className="w-3 h-3" />
                        Owner
                      </>
                    ) : (
                      <>
                        <Shield className="w-3 h-3" />
                        Admin
                      </>
                    )}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{admin.createdAt}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-[var(--text-muted)]">
                    {admin.lastActive}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={admin.status} />
                </TableCell>
                <TableCell align="right">
                  {admin.role !== 'owner' && (
                    <ActionMenu
                      onEdit={() => console.log('Edit admin', admin.id)}
                      onDelete={() => console.log('Delete admin', admin.id)}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="mt-6 px-4">
          <Pagination
            currentPage={currentPage}
            totalPages={1}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>
      
      <AddAdminModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => console.log('New admin:', data)}
      />
    </div>
  );
}
