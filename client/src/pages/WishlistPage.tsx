import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Heart } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { Button, ProductGrid, PriceDisplay, EmptyState, RatingStars } from '@/components/ui';

export function WishlistPage() {
  const { wishlist, loading, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (loading && wishlist.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
        <ProductGrid loading={true} skeletonCount={4} />
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState 
          variant="wishlist"
          actionLabel="Explore Products"
          actionHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Heart className="h-6 w-6 fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">My Wishlist</h1>
            <p className="text-muted-foreground mt-1">You have {wishlist.length} items saved</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlist.map((product) => {
            const isOutOfStock = product.stock === 0;

            return (
              <div key={product.id} className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:shadow-card-hover transition-all duration-200">
                {/* Image Section */}
                <Link to={`/products/${product.slug}`} className="relative aspect-square w-full overflow-hidden bg-muted flex items-center justify-center">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
                  )}
                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleWishlist(product);
                    }}
                    className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </Link>

                {/* Content */}
                <div className="flex flex-col flex-1 p-5 gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{product.brand}</span>
                  <Link to={`/products/${product.slug}`} className="block mb-1">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">{product.name}</h3>
                  </Link>
                  <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="xs" />
                  
                  <div className="mt-auto pt-3">
                    <PriceDisplay price={product.price} discount={product.discount} size="md" />
                  </div>

                  <Button 
                    fullWidth 
                    className="mt-4" 
                    disabled={isOutOfStock}
                    leftIcon={<ShoppingCart className="h-4 w-4 mr-2" />}
                    onClick={async () => {
                      await addToCart(product.id, 1);
                      toggleWishlist(product); // Remove from wishlist on move
                    }}
                  >
                    {isOutOfStock ? 'Out of Stock' : 'Move to Cart'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
