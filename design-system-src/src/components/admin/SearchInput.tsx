import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export function SearchInput({ 
  onSearch,
  className = '',
  placeholder = 'Search...',
  ...props 
}: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
      <input
        type="search"
        placeholder={placeholder}
        className={`
          w-full pl-10 pr-4 py-2.5 
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
          ${className}
        `}
        {...props}
      />
    </div>
  );
}
