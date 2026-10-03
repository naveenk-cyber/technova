import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:     'bg-muted text-muted-foreground',
  primary:     'bg-primary/12 text-primary border border-primary/20',
  secondary:   'bg-secondary text-secondary-foreground border border-border',
  success:     'bg-success/12 text-success border border-success/20',
  warning:     'bg-warning/12 text-warning border border-warning/20',
  destructive: 'bg-destructive/12 text-destructive border border-destructive/20',
  outline:     'border border-border text-foreground',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[11px] rounded-md',
  md: 'px-2.5 py-0.5 text-xs rounded-lg',
};

export function Badge({ variant = 'default', size = 'md', children, className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium tracking-wide',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span className={cn(
          'h-1.5 w-1.5 rounded-full flex-shrink-0',
          variant === 'success' && 'bg-success',
          variant === 'warning' && 'bg-warning',
          variant === 'destructive' && 'bg-destructive',
          variant === 'primary' && 'bg-primary',
          (variant === 'default' || variant === 'secondary' || variant === 'outline') && 'bg-muted-foreground',
        )} />
      )}
      {children}
    </span>
  );
}
