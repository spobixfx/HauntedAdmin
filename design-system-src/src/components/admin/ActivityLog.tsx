import React from 'react';
import { UserPlus, Clock, UserX, Edit, CheckCircle } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'add' | 'extend' | 'expire' | 'edit' | 'renew';
  admin: string;
  member: string;
  timestamp: string;
  description: string;
}

interface ActivityLogProps {
  activities: ActivityItem[];
}

const activityConfig = {
  add: {
    icon: UserPlus,
    color: 'text-[var(--status-success)]',
    bgColor: 'bg-[var(--status-success)]/10'
  },
  extend: {
    icon: Clock,
    color: 'text-[var(--blue-electric)]',
    bgColor: 'bg-[var(--blue-electric)]/10'
  },
  expire: {
    icon: UserX,
    color: 'text-[var(--status-error)]',
    bgColor: 'bg-[var(--status-error)]/10'
  },
  edit: {
    icon: Edit,
    color: 'text-[var(--grey-blue)]',
    bgColor: 'bg-[var(--grey-blue)]/10'
  },
  renew: {
    icon: CheckCircle,
    color: 'text-[var(--status-success)]',
    bgColor: 'bg-[var(--status-success)]/10'
  }
};

export function ActivityLog({ activities }: ActivityLogProps) {
  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const config = activityConfig[activity.type];
        const Icon = config.icon;
        
        return (
          <div 
            key={activity.id}
            className="flex items-start gap-4 p-4 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <div className={`p-2 rounded-lg ${config.bgColor} flex-shrink-0`}>
              <Icon className={`w-4 h-4 ${config.color}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--text-primary)]">
                {activity.description}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-[var(--text-muted)]">
                  {activity.admin}
                </span>
                <span className="text-xs text-[var(--text-muted)]">•</span>
                <span className="text-xs text-[var(--text-muted)]">
                  {activity.timestamp}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
