import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from './Badge';
import { RatingStars } from './RatingStars';
import { PriceDisplay } from './PriceDisplay';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  discount: number;
  stock: number;
  rating: number;
  reviewCount: number;
  image: string | null;
  category?: string;
  isNew?: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (id: string) => void;
  onAddToWishlist?: (id: string) => void;
  wishlisted?: boolean;
  loading?: boolean;
  variant?: 'default' | 'compact' | 'horizontal';
}

export function ProductCard({
  product,
  onAddToCart,
  onAddToWishlist, // Optional override
  wishlisted,      // Optional override
  loading = false,
  variant = 'default',
}: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const contextWishlist = { isInWishlist, toggleWishlist };
  const contextCart = { addToCart };

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isWishlisted = wishlisted !== undefined ? wishlisted : contextWishlist.isInWishlist(product.id);
  
  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onAddToWishlist) {
      onAddToWishlist(product.id);
    } else {
      contextWishlist.toggleWishlist(product);
    }
  };

  if (variant === 'horizontal') {
    return (
      <Link
        to={`/products/${product.slug}`}
        className="group flex gap-4 rounded-xl border border-border bg-card p-3 hover:shadow-card-hover transition-all duration-200"
      >
        {/* Thumbnail */}
        <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
          {!imgError && product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              <ShoppingCart className="h-6 w-6 opacity-30" />
            </div>
          )}
        </div>
        <div className="flex flex-col justify-between min-w-0">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">{product.brand}</p>
            <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">{product.name}</p>
          </div>
          <PriceDisplay price={product.price} discount={product.discount} size="sm" />
        </div>
      </Link>
    );
  }

  return (
    <div className={cn(
      'group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden',
      'hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200',
      isOutOfStock && 'opacity-75',
    )}>
      {/* Image section */}
      <div className="relative overflow-hidden bg-muted aspect-square">
        <Link to={`/products/${product.slug}`} aria-label={product.name} tabIndex={-1}>
          {!imgError && product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground/40">
              <ShoppingCart className="h-12 w-12" />
              <span className="text-xs">No image</span>
            </div>
          )}
        </Link>

        {/* Overlaid action buttons */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200">
          {/* Wishlist */}
          <button
            onClick={handleWishlistClick}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-all duration-150',
              isWishlisted
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-foreground hover:bg-red-50 hover:text-red-500'
            )}
          >
            <Heart className={cn('h-3.5 w-3.5', isWishlisted && 'fill-current')} />
          </button>
          {/* Quick View */}
          <Link
            to={`/products/${product.slug}`}
            aria-label="Quick view"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm text-foreground hover:bg-primary hover:text-white transition-all duration-150"
          >
            <Eye className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {product.discount > 0 && (
            <Badge variant="destructive" size="sm">{product.discount}% OFF</Badge>
          )}
          {product.isNew && (
            <Badge variant="primary" size="sm">NEW</Badge>
          )}
          {isLowStock && (
            <Badge variant="warning" size="sm">Only {product.stock} left</Badge>
          )}
          {isOutOfStock && (
            <Badge variant="secondary" size="sm">Out of Stock</Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">
        {/* Brand */}
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {product.brand}
        </span>

        {/* Name */}
        <Link to={`/products/${product.slug}`} className="block">
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <RatingStars
          rating={product.rating}
          reviewCount={product.reviewCount}
          size="xs"
        />

        {/* Price */}
        <PriceDisplay
          price={product.price}
          discount={product.discount}
          size="sm"
          className="mt-1.5"
        />

        {/* Add to cart */}
        <button
          onClick={() => {
            if (onAddToCart) onAddToCart(product.id);
            else contextCart.addToCart(product.id, 1);
          }}
          disabled={isOutOfStock || loading}
          aria-label={isOutOfStock ? 'Out of stock' : `Add ${product.name} to cart`}
          className={cn(
            'mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all duration-150',
            isOutOfStock
              ? 'cursor-not-allowed bg-muted text-muted-foreground'
              : 'bg-primary text-primary-foreground hover:bg-brand-600 active:scale-[0.98] shadow-sm'
          )}
        >
          <ShoppingCart className="h-4 w-4" />
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
