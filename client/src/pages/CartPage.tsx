import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight, Minus, Plus, AlertCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button, PriceDisplay, EmptyState, Skeleton } from '@/components/ui';

export function CartPage() {
  const { cart, loading, updateQuantity, removeItem, clearCart, cartTotal } = useCart();
  const navigate = useNavigate();

  if (loading && !cart) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 space-y-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
          </div>
          <div className="w-full lg:w-1/3">
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState 
          variant="cart"
          actionLabel="Start Shopping"
          actionHref="/products"
        />
      </div>
    );
  }

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShoppingCart className="h-6 w-6 fill-current" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Your Cart</h1>
          </div>
          <button 
            onClick={clearCart}
            className="text-sm font-medium text-destructive hover:underline flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" /> Clear Cart
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items List */}
          <div className="flex-1 space-y-6">
            {cart.items.map((item) => {
              const { product } = item;
              const isOutOfStock = product.stock === 0;
              const hasInsufficientStock = item.quantity > product.stock;

              return (
                <div key={item.id} className={`flex flex-col sm:flex-row gap-6 p-4 sm:p-6 rounded-2xl border border-border bg-card transition-colors ${isOutOfStock ? 'opacity-70' : ''}`}>
                  
                  {/* Image */}
                  <Link to={`/products/${product.slug}`} className="relative h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 rounded-xl overflow-hidden bg-muted flex items-center justify-center border border-border">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingCart className="h-8 w-8 text-muted-foreground/30" />
                    )}
                  </Link>
                  
                  {/* Item Details */}
                  <div className="flex flex-col flex-1">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{product.brand}</span>
                        <Link to={`/products/${product.slug}`} className="block mt-1">
                          <h3 className="text-base sm:text-lg font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="p-2 -mr-2 text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="mt-auto pt-4 flex flex-wrap items-end justify-between gap-4">
                      {/* Price */}
                      <PriceDisplay price={product.price} discount={product.discount} size="sm" />
                      
                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end gap-2">
                        {isOutOfStock ? (
                          <span className="text-sm font-semibold text-destructive">Out of Stock</span>
                        ) : (
                          <div className="flex items-center rounded-lg border border-border bg-muted/50 overflow-hidden h-9">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-9 h-full flex items-center justify-center hover:bg-muted disabled:opacity-50 transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <div className="w-10 h-full flex items-center justify-center text-sm font-semibold border-x border-border">
                              {item.quantity}
                            </div>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= product.stock || item.quantity >= 50}
                              className="w-9 h-full flex items-center justify-center hover:bg-muted disabled:opacity-50 transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                        
                        {hasInsufficientStock && !isOutOfStock && (
                          <span className="flex items-center text-xs text-warning">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Only {product.stock} available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-1/3 lg:max-w-md">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({cart.items.length} items)</span>
                  <span className="font-medium text-foreground">₹{cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="font-medium text-success">Free</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <hr className="border-border mb-6" />
              
              <div className="flex justify-between items-center mb-8">
                <span className="text-base font-semibold text-foreground">Total</span>
                <span className="text-2xl font-bold text-foreground">
                  ₹{cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="space-y-4">
                <Button 
                  size="xl" 
                  fullWidth 
                  onClick={handleCheckout}
                  disabled={cart.items.some(i => i.product.stock === 0 || i.quantity > i.product.stock)}
                  rightIcon={<ArrowRight className="h-5 w-5 ml-2" />}
                >
                  Proceed to Checkout
                </Button>
                
                {cart.items.some(i => i.product.stock === 0 || i.quantity > i.product.stock) && (
                  <p className="text-sm text-destructive text-center flex items-center justify-center gap-1">
                    <AlertCircle className="h-4 w-4" /> Please resolve stock issues to checkout.
                  </p>
                )}

                <Link to="/products" className="block text-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
