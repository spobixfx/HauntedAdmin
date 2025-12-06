import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2, Clock, Eye } from 'lucide-react';

interface ActionMenuProps {
  onView?: () => void;
  onEdit?: () => void;
  onExtend?: () => void;
  onDelete?: () => void;
}

export function ActionMenu({ onView, onEdit, onExtend, onDelete }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-[var(--bg-elevated)] rounded-lg transition-colors"
      >
        <MoreVertical className="w-4 h-4 text-[var(--text-muted)]" />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="
              absolute right-0 top-full mt-1 z-20
              w-48 py-2
              bg-[var(--bg-tertiary)]
              border border-[var(--border-default)]
              rounded-lg
              shadow-xl
            "
          >
            {onView && (
              <button
                onClick={() => { onView(); setIsOpen(false); }}
                className="w-full px-4 py-2 text-left hover:bg-[var(--bg-elevated)] flex items-center gap-3"
                style={{ fontSize: 'var(--text-body)', fontWeight: 'var(--font-weight-normal)', lineHeight: 'var(--line-height-body)', color: 'var(--text-body)' }}
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => { onEdit(); setIsOpen(false); }}
                className="w-full px-4 py-2 text-left hover:bg-[var(--bg-elevated)] flex items-center gap-3"
                style={{ fontSize: 'var(--text-body)', fontWeight: 'var(--font-weight-normal)', lineHeight: 'var(--line-height-body)', color: 'var(--text-body)' }}
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
            {onExtend && (
              <button
                onClick={() => { onExtend(); setIsOpen(false); }}
                className="w-full px-4 py-2 text-left hover:bg-[var(--bg-elevated)] flex items-center gap-3"
                style={{ fontSize: 'var(--text-body)', fontWeight: 'var(--font-weight-normal)', lineHeight: 'var(--line-height-body)', color: 'var(--text-body)' }}
              >
                <Clock className="w-4 h-4" />
                Extend
              </button>
            )}
            {onDelete && (
              <>
                <div className="my-2 border-t border-[var(--border-default)]" />
                <button
                  onClick={() => { onDelete(); setIsOpen(false); }}
                  className="w-full px-4 py-2 text-left hover:bg-[var(--status-error)]/10 flex items-center gap-3"
                  style={{ fontSize: 'var(--text-body)', fontWeight: 'var(--font-weight-normal)', lineHeight: 'var(--line-height-body)', color: 'var(--status-error)' }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
