import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ProductCardSkeleton } from './Skeleton';

interface ProductGridProps {
  children?: ReactNode;
  loading?: boolean;
  skeletonCount?: number;
  className?: string;
}

export function ProductGrid({
  children,
  loading = false,
  skeletonCount = 8,
  className,
}: ProductGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-6',
        className
      )}
    >
      {loading ? (
        Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))
      ) : (
        children
      )}
    </div>
  );
}
