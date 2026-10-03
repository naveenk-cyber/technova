import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  selectSize?: 'sm' | 'md' | 'lg';
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, selectSize = 'md', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const sizeClasses = {
      sm: 'h-8 text-xs pl-3 pr-9',
      md: 'h-10 text-sm pl-3.5 pr-10',
      lg: 'h-12 text-base pl-4 pr-11',
    }[selectSize];

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-foreground">
            {label}
            {props.required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}

        <div className="relative">            <select
            id={inputId}
            ref={ref}
            className={cn(
              'w-full appearance-none rounded-xl border bg-background text-foreground transition-all duration-150 placeholder:text-muted-foreground/60',
              'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error
                ? 'border-destructive focus:ring-destructive/30 focus:border-destructive'
                : 'border-border bg-white/50 hover:border-primary/50',
              sizeClasses,
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        {error && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive" role="alert">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" /> {error}
          </p>
        )}
        {!error && hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
