import { forwardRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, inputSize = 'md', type, id, ...props }, ref) => {
    const [showPw, setShowPw] = useState(false);
    const isPassword = type === 'password';
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const sizeClasses = {
      sm: 'h-8 text-xs px-3',
      md: 'h-10 text-sm px-3.5',
      lg: 'h-12 text-base px-4',
    }[inputSize];

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {label}
            {props.required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            type={isPassword && showPw ? 'text' : type}
            className={cn(
              'w-full rounded-xl border bg-background text-foreground transition-all duration-150 placeholder:text-muted-foreground/60',
              'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error
                ? 'border-destructive focus:ring-destructive/30 focus:border-destructive'
                : 'border-border bg-white/50 hover:border-primary/50',
              leftIcon && 'pl-10',
              (rightIcon || isPassword) && 'pr-10',
              sizeClasses,
              className
            )}
            {...props}
          />

          {(rightIcon || isPassword) && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {isPassword ? (
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              ) : (
                <div className="text-muted-foreground">{rightIcon}</div>
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive" role="alert">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {error}
          </p>
        )}
        {!error && hint && (
          <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
