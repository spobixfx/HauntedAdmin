import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function FormInput({ 
  label, 
  error, 
  helperText,
  className = '',
  id,
  ...props 
}: FormInputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label 
          htmlFor={inputId}
          style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-muted)' }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-4 py-2.5 
          bg-[var(--bg-secondary)] 
          border ${error ? 'border-[var(--status-error)]' : 'border-[var(--border-default)]'}
          rounded-lg 
          text-[var(--text-primary)]
          placeholder:text-[var(--text-muted)]
          focus:outline-none 
          focus:ring-2 
          focus:ring-[var(--blue-electric)] 
          focus:border-transparent
          transition-all duration-200
          disabled:opacity-50 
          disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
      {error && (
        <span style={{ fontSize: 'var(--text-secondary)', fontWeight: 'var(--font-weight-normal)', lineHeight: 'var(--line-height-secondary)', color: 'var(--status-error)' }}>
          {error}
        </span>
      )}
      {helperText && !error && (
        <span style={{ fontSize: 'var(--text-secondary)', fontWeight: 'var(--font-weight-normal)', lineHeight: 'var(--line-height-secondary)', color: 'var(--text-muted)' }}>
          {helperText}
        </span>
      )}
    </div>
  );
}
