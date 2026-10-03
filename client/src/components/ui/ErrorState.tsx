import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  /** Label for the action button. Defaults to "Try Again"; pass something
   *  like "Sign In" when the action is not a plain retry. */
  actionLabel?: string;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error while loading this content. Please try again.',
  onRetry,
  actionLabel = 'Try Again',
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-destructive/20 bg-destructive/5', className)}>
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="mb-1.5 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mb-5 max-w-md text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="border-destructive/30 hover:bg-destructive/10 hover:text-destructive">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
