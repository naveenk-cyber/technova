import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground hover:bg-brand-600 active:bg-brand-700 shadow-sm hover:shadow focus-visible:ring-2 focus-visible:ring-primary/50',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border',
  outline:
    'border border-border bg-transparent hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring',
  ghost:
    'hover:bg-accent hover:text-accent-foreground',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
  link:
    'text-primary underline-offset-4 hover:underline p-0 h-auto',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs:   'h-7 px-2.5 text-xs rounded-md gap-1',
  sm:   'h-8 px-3 text-sm rounded-md gap-1.5',
  md:   'h-10 px-4 text-sm rounded-lg gap-2',
  lg:   'h-11 px-6 text-base rounded-lg gap-2.5',
  xl:   'h-13 px-8 text-base rounded-xl gap-3',
  icon: 'h-10 w-10 rounded-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-150',
          'disabled:pointer-events-none disabled:opacity-50',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
