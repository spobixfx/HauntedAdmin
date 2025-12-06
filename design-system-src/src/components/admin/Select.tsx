import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ 
  label, 
  error, 
  options,
  className = '',
  id,
  ...props 
}: SelectProps) {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label 
          htmlFor={selectId}
          className="text-sm text-[var(--text-secondary)]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`
            w-full px-4 py-2.5 
            bg-[var(--bg-secondary)] 
            border ${error ? 'border-[var(--status-error)]' : 'border-[var(--border-default)]'}
            rounded-lg 
            text-[var(--text-primary)]
            focus:outline-none 
            focus:ring-2 
            focus:ring-[var(--blue-electric)] 
            focus:border-transparent
            transition-all duration-200
            appearance-none
            disabled:opacity-50 
            disabled:cursor-not-allowed
            pr-10
            ${className}
          `}
          {...props}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none" />
      </div>
      {error && (
        <span className="text-sm text-[var(--status-error)]">
          {error}
        </span>
      )}
    </div>
  );
}
