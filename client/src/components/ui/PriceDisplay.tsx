import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  discount?: number; // percentage 0-100
  size?: 'sm' | 'md' | 'lg' | 'xl';
  currency?: string;
  className?: string;
  showSavings?: boolean;
}

const sizeMap = {
  sm:  { current: 'text-base font-bold',   original: 'text-xs',  savings: 'text-xs' },
  md:  { current: 'text-xl font-bold',     original: 'text-sm',  savings: 'text-xs' },
  lg:  { current: 'text-2xl font-bold',    original: 'text-base', savings: 'text-sm' },
  xl:  { current: 'text-3xl font-black',   original: 'text-lg',  savings: 'text-sm' },
};

export function PriceDisplay({
  price,
  discount = 0,
  size = 'md',
  currency = '₹',
  className,
  showSavings = false,
}: PriceDisplayProps) {
  const hasDiscount = discount > 0;
  const discountedPrice = hasDiscount ? price * (1 - discount / 100) : price;
  const savings = price - discountedPrice;
  const styles = sizeMap[size];

  const format = (val: number) =>
    new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

  return (
    <div className={cn('flex flex-wrap items-baseline gap-2', className)}>
      <span className={cn(styles.current, 'text-foreground')}>
        {currency}{format(discountedPrice)}
      </span>

      {hasDiscount && (
        <>
          <span className={cn(styles.original, 'text-muted-foreground line-through')}>
            {currency}{format(price)}
          </span>
          <span className={cn('font-semibold text-success', styles.savings)}>
            {discount}% off
          </span>
        </>
      )}

      {hasDiscount && showSavings && (
        <span className={cn('w-full text-muted-foreground', styles.savings)}>
          You save {currency}{format(savings)}
        </span>
      )}
    </div>
  );
}
