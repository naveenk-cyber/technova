import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Heart, 
  ShoppingCart, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Minus,
  Plus
} from 'lucide-react';
import { fetchApi, friendlyError } from '@/lib/api';
import { toDetailsProduct, type RawProductDetails } from '@/lib/product';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { 
  Button, 
  Badge, 
  PriceDisplay, 
  RatingStars, 
  Skeleton, 
  ErrorState
} from '@/components/ui';

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  userName: string;
  createdAt: string;
}

interface ProductDetails {
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
  images?: string[];
  description: string;
  specifications: Record<string, string>;
  category?: { name: string; slug: string };
  reviews?: Review[];
}

export function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<number | undefined>(undefined);
  
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const isWishlisted = product ? isInWishlist(product.id) : false;
  const [addingToCart, setAddingToCart] = useState(false);
  
  // Review State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetchApi<RawProductDetails>(`/products/slug/${slug}`);
        // fetchApi already resolves failures, so carry its status through
        // instead of re-throwing and losing it.
        if (res.error) {
          setError(res.error);
          setStatus(res.status);
          return;
        }
        if (res.data) {
          const details = toDetailsProduct(res.data);
          setProduct(details);
          // Determine initial active image
          setActiveImage(details.images[0] ?? details.image ?? null);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load product details');
        setStatus(err?.status);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const handleQuantityChange = (delta: number) => {
    if (!product) return;
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= product.stock) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = async () => {
    if (!product || product.stock === 0) return;
    setAddingToCart(true);
    await addToCart(product.id, quantity);
    setAddingToCart(false);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout'); // Placeholder
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!product) return;
    
    setSubmittingReview(true);
    setReviewError(null);
    try {
      const res = await fetchApi<Review>('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          comment: reviewComment
        })
      });
      if (res.error) throw new Error(res.error);
      if (res.data) {
        // Prepend new review and update count/average
        setProduct(prev => {
          if (!prev) return prev;
          const newReviews = [res.data!, ...(prev.reviews || [])];
          const newTotalRating = newReviews.reduce((sum, r) => sum + r.rating, 0);
          return {
            ...prev,
            reviews: newReviews,
            rating: newTotalRating / newReviews.length,
            reviewCount: newReviews.length
          };
        });
        setReviewComment('');
        setReviewRating(5);
      }
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-2 text-sm text-muted-foreground mb-8">
          <Skeleton className="h-5 w-16" /> <ChevronRight className="h-4 w-4" />
          <Skeleton className="h-5 w-24" /> <ChevronRight className="h-4 w-4" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="w-full lg:w-1/2 space-y-4">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="flex gap-4">
              <Skeleton className="h-20 w-20 rounded-xl" />
              <Skeleton className="h-20 w-20 rounded-xl" />
              <Skeleton className="h-20 w-20 rounded-xl" />
            </div>
          </div>
          <div className="w-full lg:w-1/2 space-y-6">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <div className="flex gap-4 pt-6">
              <Skeleton className="h-12 flex-1 rounded-xl" />
              <Skeleton className="h-12 flex-1 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ErrorState 
          title="Product Not Found"
          message={friendlyError({ error, status }, "The product you're looking for doesn't exist or has been removed.")} 
          onRetry={() => navigate('/products')}
          actionLabel="Browse Products"
        />
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const allImages = product.images?.length ? product.images : (product.image ? [product.image] : []);

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Breadcrumbs */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/products" className="hover:text-foreground transition-colors">Products</Link>
            {product.category && (
              <>
                <ChevronRight className="h-4 w-4" />
                <Link to={`/products?category=${product.category.slug}`} className="hover:text-foreground transition-colors">
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 mb-16">
          
          {/* Image Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <div className="relative aspect-square w-full rounded-2xl border border-border bg-card overflow-hidden flex items-center justify-center">
              {activeImage ? (
                <img 
                  src={activeImage} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <ShoppingCart className="h-24 w-24 text-muted-foreground/20" />
              )}
              
              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.discount > 0 && (
                  <Badge variant="destructive">{product.discount}% OFF</Badge>
                )}
                {isOutOfStock ? (
                  <Badge variant="secondary" className="px-3 py-1 bg-muted/80 backdrop-blur-md">Out of Stock</Badge>
                ) : isLowStock ? (
                  <Badge variant="warning" className="px-3 py-1">Only {product.stock} left</Badge>
                ) : null}
              </div>
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-border'}`}
                  >
                    <img src={img} alt={`${product.name} - view ${idx + 1}`} className="w-full h-full object-cover bg-card" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <Link to={`/products?brand=${product.brand}`} className="text-sm font-semibold tracking-wider text-primary uppercase mb-2 hover:underline w-fit">
              {product.brand}
            </Link>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="md" />
              <div className="w-px h-5 bg-border" />
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-success" /> 1 Year Warranty
              </span>
            </div>

            <div className="mb-6">
              <PriceDisplay 
                price={product.price} 
                discount={product.discount} 
                size="xl" 
                showSavings
              />
            </div>

            <p className="text-base text-muted-foreground mb-8 leading-relaxed">
              {product.description}
            </p>

            <hr className="border-border mb-8" />

            {/* Purchase Actions */}
            <div className="space-y-6">
              {/* Quantity */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground">Quantity</span>
                <div className="flex items-center rounded-xl border border-border bg-card overflow-hidden">
                  <button 
                    onClick={() => handleQuantityChange(-1)}
                    disabled={isOutOfStock || quantity <= 1}
                    className="h-10 w-10 flex items-center justify-center hover:bg-accent disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="h-10 w-12 flex items-center justify-center text-sm font-semibold border-x border-border">
                    {isOutOfStock ? 0 : quantity}
                  </div>
                  <button 
                    onClick={() => handleQuantityChange(1)}
                    disabled={isOutOfStock || quantity >= product.stock}
                    className="h-10 w-10 flex items-center justify-center hover:bg-accent disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {isOutOfStock ? (
                  <span className="text-sm font-medium text-destructive ml-2">Out of Stock</span>
                ) : (
                  <span className="text-sm text-muted-foreground ml-2">
                    {product.stock} available
                  </span>
                )}
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  size="xl" 
                  fullWidth 
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || addingToCart}
                  loading={addingToCart}
                  leftIcon={<ShoppingCart className="h-5 w-5 mr-2" />}
                >
                  Add to Cart
                </Button>
                <Button 
                  size="xl" 
                  fullWidth 
                  variant="secondary"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                >
                  Buy Now
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-13 w-13 flex-shrink-0"
                  onClick={() => product && toggleWishlist(product)}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`h-5 w-5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-border">
              <div className="flex flex-col gap-1.5">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">Free Delivery</span>
                <span className="text-[10px] text-muted-foreground">Orders over ₹999</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <RotateCcw className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">7 Days Return</span>
                <span className="text-[10px] text-muted-foreground">No questions asked</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">Secure Payment</span>
                <span className="text-[10px] text-muted-foreground">100% encrypted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Sections (Specs & Reviews) */}
        <div className="flex flex-col lg:flex-row gap-12 border-t border-border pt-12">
          
          {/* Specifications */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-2xl font-bold text-foreground mb-6">Specifications</h2>
            {product.specifications && Object.keys(product.specifications).length > 0 ? (
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm text-left">
                  <tbody className="divide-y divide-border">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <tr key={key} className="hover:bg-accent/50 transition-colors">
                        <th className="py-4 px-6 font-medium text-foreground bg-muted/30 w-1/3 align-top">{key}</th>
                        <td className="py-4 px-6 text-muted-foreground">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No specifications available for this product.</p>
            )}
          </div>

          {/* Customer Reviews */}
          <div className="w-full lg:w-1/2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Customer Reviews</h2>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">{Number(product.rating).toFixed(1)}</span>
                <RatingStars rating={product.rating} size="sm" showValue={false} />
                <span className="text-sm text-muted-foreground ml-1">({product.reviewCount})</span>
              </div>
            </div>

            {/* Rating Distribution (Simple representation based on current reviews loaded) */}
            {product.reviews && product.reviews.length > 0 && (
              <div className="mb-8 p-6 rounded-2xl border border-border bg-card">
                <h4 className="text-sm font-semibold mb-4">Rating Distribution</h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(stars => {
                    const count = product.reviews!.filter(r => Math.round(r.rating) === stars).length;
                    const percentage = product.reviews!.length ? (count / product.reviews!.length) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-4 text-sm">
                        <div className="w-12 text-muted-foreground flex items-center justify-end gap-1">
                          {stars} <Heart className="w-3 h-3 fill-current" />
                        </div>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-warning rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                        <div className="w-8 text-right text-muted-foreground">{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Write a Review Form */}
            {isAuthenticated ? (
              <form onSubmit={handleSubmitReview} className="mb-8 p-6 rounded-2xl border border-border bg-card">
                <h4 className="text-base font-semibold mb-4">Write a Review</h4>
                {reviewError && (
                  <p className="text-sm text-destructive mb-4">{reviewError}</p>
                )}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`p-1 transition-colors ${star <= reviewRating ? 'text-warning' : 'text-muted-foreground/30 hover:text-warning/50'}`}
                      >
                        <Heart className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Comment</label>
                  <textarea
                    className="flex min-h-[100px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Share your thoughts about this product..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                    minLength={3}
                  />
                </div>
                <Button type="submit" loading={submittingReview}>Submit Review</Button>
              </form>
            ) : (
              <div className="mb-8 p-6 rounded-2xl border border-border bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground mb-4">Please log in to write a review.</p>
                <Button variant="outline" onClick={() => navigate('/login')}>Log In</Button>
              </div>
            )}

            <div className="space-y-6">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((review) => (
                  <div key={review.id} className="p-6 rounded-2xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-foreground">{review.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <RatingStars rating={review.rating} size="xs" showValue={false} className="mb-2" />
                    {review.title && <h4 className="text-sm font-semibold text-foreground mb-1">{review.title}</h4>}
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-border bg-card">
                  <p className="text-sm text-muted-foreground">No reviews yet for this product.</p>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
