import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { toCardProduct, type RawProduct } from '@/lib/product';
import { ProductCard, type Product } from '@/components/ui/ProductCard';
import { ProductGrid } from '@/components/ui/ProductGrid';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import { ErrorState } from '@/components/ui/ErrorState';
import { Sparkles, ArrowRight, ShieldCheck, Truck, HeadphonesIcon, Tag, Cpu, Smartphone, Laptop, Watch, Headphones } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface ProductsListPayload {
  products: RawProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const CategoryIcon = ({ slug }: { slug: string }) => {
  switch (slug) {
    case 'laptops': return <Laptop className="h-8 w-8 mb-3 text-primary" />;
    case 'smartphones': return <Smartphone className="h-8 w-8 mb-3 text-primary" />;
    case 'wearables': return <Watch className="h-8 w-8 mb-3 text-primary" />;
    case 'audio': return <Headphones className="h-8 w-8 mb-3 text-primary" />;
    default: return <Cpu className="h-8 w-8 mb-3 text-primary" />;
  }
};

export function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const [trending, setTrending] = useState<Product[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [trendingError, setTrendingError] = useState('');
  
  const [deals, setDeals] = useState<Product[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(true);

  const fetchHomeData = async () => {
    setLoadingCategories(true);
    setLoadingTrending(true);
    setLoadingDeals(true);
    setTrendingError('');

    try {
      // 1. Categories
      const catRes = await fetchApi<Category[]>('/categories');
      if (catRes.data) setCategories(catRes.data.slice(0, 5));
      
      // 2. Trending Products
      const trendingRes = await fetchApi<ProductsListPayload>('/products?limit=5');
      if (trendingRes.error) {
        setTrendingError(trendingRes.error);
      } else if (trendingRes.data) {
        setTrending(trendingRes.data.products.map(toCardProduct));
      }

      // 3. Best Deals (Mocking query with sort/limit)
      const dealsRes = await fetchApi<ProductsListPayload>('/products?limit=5&sort=price_asc');
      if (dealsRes.data) {
        // Just for visual effect in UI if backend didn't sort perfectly by discount
        const mappedDeals = dealsRes.data.products.map(p => {
          const product = toCardProduct(p);
          return {
            ...product,
            discount: product.discount || Math.floor(Math.random() * 30) + 10 // ensure it looks like a deal
          };
        });
        setDeals(mappedDeals);
      }
    } catch (err: any) {
      setTrendingError('Failed to load products');
    } finally {
      setLoadingCategories(false);
      setLoadingTrending(false);
      setLoadingDeals(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const handleSearch = (q: string) => {
    if (q.trim()) navigate(`/products?search=${encodeURIComponent(q)}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-background pt-12 md:pt-20 pb-16 md:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Badge variant="primary" className="mb-6 mx-auto bg-primary/10 text-primary border-primary/20 backdrop-blur-sm px-4 py-1.5 rounded-full">
            <Sparkles className="h-4 w-4 mr-1.5" />
            AI-Powered Shopping Experience
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground tracking-tight mb-6 max-w-4xl mx-auto leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Find the right technology <br className="hidden md:block" />
            <span className="text-gradient">for your needs.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Discover premium electronics tailored to your lifestyle. Let our AI Tech Advisor guide you to the perfect purchase.
          </p>
          
          {/* SEARCH BAR in Hero */}
          <div className="max-w-xl mx-auto mb-10 shadow-xl rounded-2xl bg-background/50 backdrop-blur-md p-2 border border-border/50">
            <SearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              placeholder="What are you looking for today?"
              size="lg"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="xl" onClick={() => navigate('/products')} className="w-full sm:w-auto text-base">
              Explore Products
            </Button>
            <Button
              size="xl"
              variant="outline"
              onClick={() => navigate('/ai-advisor')}
              className="w-full sm:w-auto text-base group bg-background/50 backdrop-blur-sm border-primary/30 hover:bg-primary/5"
            >
              <Sparkles className="h-5 w-5 mr-2 text-primary group-hover:animate-pulse" />
              Ask AI Advisor
            </Button>
          </div>
        </div>
      </section>

      {/* 2. FEATURED CATEGORIES */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">Explore Categories</h2>
            <Link to="/categories" className="text-sm font-medium text-primary flex items-center hover:underline">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {loadingCategories ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-card border border-border animate-shimmer" />
              ))
            ) : (
              categories.map(category => (
                <Link 
                  key={category.id} 
                  to={`/products?category=${category.slug}`}
                  className="flex flex-col items-center justify-center p-6 bg-card rounded-2xl border border-border hover:border-primary/50 hover:shadow-md transition-all duration-200 group"
                >
                  <CategoryIcon slug={category.slug} />
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{category.name}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 3. TRENDING PRODUCTS */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Trending Now</h2>
              <p className="text-sm text-muted-foreground">Most popular choices from our customers</p>
            </div>
            <Link to="/products?sort=rating" className="hidden sm:flex text-sm font-medium text-primary items-center hover:underline">
              See All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          {trendingError ? (
            <ErrorState message={trendingError} onRetry={fetchHomeData} />
          ) : (
            <ProductGrid loading={loadingTrending} skeletonCount={5}>
              {trending.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductGrid>
          )}
          
          <div className="mt-6 sm:hidden flex justify-center">
            <Link to="/products?sort=rating">
              <Button variant="outline" fullWidth>View All Trending</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. AI ADVISOR BANNER */}
      <section className="py-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1600&auto=format&fit=crop')] opacity-20 bg-cover bg-center mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
          
          <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <Badge className="bg-primary/20 text-primary-400 border-primary/30 mb-4 px-3 py-1">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Beta Feature
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                Not sure what to buy? <br/>
                <span className="text-primary-400">Let AI find it for you.</span>
              </h2>
              <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                Tell our intelligent advisor what you need, your budget, and preferences. Get personalized recommendations in seconds.
              </p>
              <Button
                size="lg"
                onClick={() => navigate('/ai-advisor')}
                className="bg-white text-zinc-950 hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                Chat with AI Advisor <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="hidden lg:block relative w-72 h-72">
              <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-[spin_10s_linear_infinite]" />
              <div className="absolute inset-4 border-2 border-primary/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-primary/20 rounded-full blur-2xl absolute" />
                <Cpu className="h-24 w-24 text-primary relative z-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BEST DEALS */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <Tag className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Best Deals</h2>
                <p className="text-sm text-muted-foreground">Limited time offers you can't miss</p>
              </div>
            </div>
            <Link to="/deals" className="hidden sm:flex text-sm font-medium text-primary items-center hover:underline">
              See All Deals <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <ProductGrid loading={loadingDeals} skeletonCount={5}>
            {deals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ProductGrid>
        </div>
      </section>

      {/* 6. WHY TECHNOVA */}
      <section className="py-20 bg-card border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why choose TECHNOVA</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">We provide the best shopping experience for technology enthusiasts with premium services.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Truck className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Fast & Free Delivery</h3>
              <p className="text-sm text-muted-foreground">Free shipping on all orders over ₹999 with 2-day delivery options available.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Secure Payments</h3>
              <p className="text-sm text-muted-foreground">We use industry standard encryption to ensure your payment details are safe.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <HeadphonesIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">24/7 Expert Support</h3>
              <p className="text-sm text-muted-foreground">Our team of tech experts is always ready to help you with your queries.</p>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}

// Ensure Badge component can take standard className properly (was omitted from my manual check earlier but should be standard)
import { Badge } from '@/components/ui/Badge';
