import { SearchX, PackageX, ShoppingCart, Heart } from 'lucide-react';
import { Button } from './Button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

type EmptyStateVariant = 'default' | 'search' | 'cart' | 'wishlist' | 'orders';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  variant = 'default',
  title,
  description,
  actionLabel,
  actionHref = '/products',
  className,
}: EmptyStateProps) {
  const configs: Record<EmptyStateVariant, { icon: React.ReactNode; title: string; desc: string; action: string }> = {
    default: {
      icon: <PackageX className="h-12 w-12 text-muted-foreground/50" />,
      title: 'No items found',
      desc: 'We could not find what you were looking for.',
      action: 'Browse Products',
    },
    search: {
      icon: <SearchX className="h-12 w-12 text-muted-foreground/50" />,
      title: 'No results found',
      desc: 'Try adjusting your search or filters to find what you are looking for.',
      action: 'Clear Filters',
    },
    cart: {
      icon: <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />,
      title: 'Your cart is empty',
      desc: 'Looks like you have not added anything to your cart yet.',
      action: 'Start Shopping',
    },
    wishlist: {
      icon: <Heart className="h-12 w-12 text-muted-foreground/50" />,
      title: 'Your wishlist is empty',
      desc: 'Save items you like in your wishlist to review them later.',
      action: 'Explore Products',
    },
    orders: {
      icon: <PackageX className="h-12 w-12 text-muted-foreground/50" />,
      title: 'No orders yet',
      desc: 'You have not placed any orders with us yet.',
      action: 'Start Shopping',
    },
  };

  const config = configs[variant];
  const finalTitle = title || config.title;
  const finalDesc = description || config.desc;
  const finalAction = actionLabel || config.action;

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        {config.icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold text-foreground">{finalTitle}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{finalDesc}</p>
      {actionHref && (
        <Link to={actionHref}>
          <Button>{finalAction}</Button>
        </Link>
      )}
    </div>
  );
}
