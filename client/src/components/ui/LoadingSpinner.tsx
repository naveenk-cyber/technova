import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
  centered?: boolean;
}

const sizes = {
  xs: 'h-3 w-3 border-[1.5px]',
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[2.5px]',
  xl: 'h-12 w-12 border-[3px]',
};

export function LoadingSpinner({ size = 'md', className, label, centered }: LoadingSpinnerProps) {
  const spinner = (
    <div
      role="status"
      aria-label={label || 'Loading...'}
      className={cn(
        'rounded-full border-border border-t-primary animate-spin',
        sizes[size],
        className
      )}
      style={{ animation: 'spin 0.7s linear infinite' }}
    />
  );

  if (centered) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        {spinner}
        {label && <p className="text-sm text-muted-foreground animate-pulse">{label}</p>}
      </div>
    );
  }

  return spinner;
}

// Full page loader
export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-border border-t-primary animate-spin" style={{ animation: 'spin 0.7s linear infinite' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
        <p className="text-sm font-medium text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
