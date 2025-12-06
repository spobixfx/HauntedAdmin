import React from 'react';

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ label, description, checked, onChange, disabled }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex-1">
        <div className="text-sm text-[var(--text-primary)]">{label}</div>
        {description && (
          <div className="text-xs text-[var(--text-muted)] mt-1">{description}</div>
        )}
      </div>
      
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-[var(--blue-electric)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${checked ? 'bg-[var(--blue-electric)]' : 'bg-[var(--bg-elevated)]'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white
            transition-transform duration-200
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );
}
