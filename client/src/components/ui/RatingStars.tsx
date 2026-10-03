import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}

// NOTE: sizeMap is intentionally unused; the star size is driven by the
// `size` prop below. Kept for future theme expansion.
const sizeMap = {
  xs: 'h-2.5 w-2.5',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

const textSizes = {
  xs: 'text-[11px]',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function RatingStars({
  rating,
  max = 5,
  size = 'sm',
  showValue = true,
  reviewCount,
  className,
}: RatingStarsProps) {
  const clampedRating = Math.min(Math.max(0, rating), max);

  return (
    <div className={cn('flex items-center gap-1', className)} aria-label={`Rating: ${clampedRating} out of ${max}`}>
      {showValue && (
        <span className={cn('flex-shrink-0 font-semibold text-foreground', textSizes[size])}>
          {clampedRating.toFixed(1)}
        </span>
      )}

      {reviewCount !== undefined && (
        <span className={cn('flex-shrink-0 text-muted-foreground', textSizes[size])}>
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}
