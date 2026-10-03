import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search, Check } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { toCardProduct, type RawProduct } from '@/lib/product';
import { 
  Button, 
  Input, 
  Select, 
  ProductCard, 
  ProductGrid, 
  EmptyState, 
  ErrorState, 
  Pagination, 
  Badge
} from '@/components/ui';
import type { Product } from '@/components/ui/ProductCard';

interface ProductsPayload {
  products: RawProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ProductsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  // Footer links land on /categories/:slug; treat the slug as the category filter.
  const { slug: categorySlug } = useParams<{ slug: string }>();
  
  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [meta, setMeta] = useState<ProductsMeta>({ total: 0, page: 1, limit: 12, totalPages: 1 });
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  // Derive current filters from URL
  const currentFilters = useMemo(() => ({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || categorySlug || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page') || '1', 10),
  }), [searchParams, categorySlug]);

  // Fetch reference data (categories and unique brands from backend)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const catRes = await fetchApi<Category[]>('/categories');
        if (catRes.data) setCategories(catRes.data);
        
        // For brands, ideally we have a /brands endpoint. If not, we might extract from products if possible
        // Let's assume there is a way to get brands or we just hardcode some for the UI if missing
        // For this implementation we'll mock a few top brands if the API doesn't provide them, 
        // but in a real app this would come from the backend.
        setBrands(['Apple', 'Samsung', 'Sony', 'Lenovo', 'Dell', 'HP', 'Bose']);
      } catch (e) {
        console.error('Failed to load metadata', e);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch products whenever filters change
  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Construct query string safely
      const query = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) query.set(key, value.toString());
      });
      query.set('limit', '12');

      const res = await fetchApi<ProductsPayload>(`/products?${query.toString()}`);
      
      if (res.error) throw new Error(res.error);
      
      if (res.data) {
        setProducts(res.data.products.map(toCardProduct));
        setMeta(res.data.pagination);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentFilters]);

  // Handlers
  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== 'page') newParams.set('page', '1'); // Reset page on filter change
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const activeFilterCount = Array.from(searchParams.keys()).filter(k => k !== 'page' && k !== 'sort').length;

  // Stop the page behind the drawer from scrolling while it is open, and
  // close it on Escape the way a dialog is expected to behave.
  useEffect(() => {
    if (!isMobileFiltersOpen) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileFiltersOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [isMobileFiltersOpen]);

  // Filter Form Component (used in both desktop sidebar and mobile drawer)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <h4 className="text-sm font-medium mb-3">Search</h4>
        <Input 
          placeholder="Search products..."
          value={currentFilters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          inputSize="sm"
        />
      </div>

      <hr className="border-border" />

      {/* Categories */}
      <div>
        <h4 className="text-sm font-medium mb-3">Category</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
          <button
            onClick={() => updateFilter('category', '')}
            className={`flex w-full items-center justify-between text-sm py-1 ${!currentFilters.category ? 'font-medium text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            All Categories
            {!currentFilters.category && <Check className="h-4 w-4" />}
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => updateFilter('category', c.slug)}
              className={`flex w-full items-center justify-between text-sm py-1 ${currentFilters.category === c.slug ? 'font-medium text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {c.name}
              {currentFilters.category === c.slug && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-border" />

      {/* Brands */}
      <div>
        <h4 className="text-sm font-medium mb-3">Brand</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
          <button
            onClick={() => updateFilter('brand', '')}
            className={`flex w-full items-center justify-between text-sm py-1 ${!currentFilters.brand ? 'font-medium text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            All Brands
            {!currentFilters.brand && <Check className="h-4 w-4" />}
          </button>
          {brands.map(b => (
            <button
              key={b}
              onClick={() => updateFilter('brand', b)}
              className={`flex w-full items-center justify-between text-sm py-1 ${currentFilters.brand === b ? 'font-medium text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {b}
              {currentFilters.brand === b && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-border" />

      {/* Price Range */}
      <div>
        <h4 className="text-sm font-medium mb-3">Price Range (₹)</h4>
        <div className="flex items-center gap-2">
          <Input 
            type="number" 
            placeholder="Min" 
            value={currentFilters.minPrice}
            onChange={(e) => updateFilter('minPrice', e.target.value)}
            inputSize="sm"
          />
          <span className="text-muted-foreground">-</span>
          <Input 
            type="number" 
            placeholder="Max" 
            value={currentFilters.maxPrice}
            onChange={(e) => updateFilter('maxPrice', e.target.value)}
            inputSize="sm"
          />
        </div>
      </div>

      <hr className="border-border" />

      {/* Rating */}
      <div>
        <h4 className="text-sm font-medium mb-3">Minimum Rating</h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map(rating => (
            <button
              key={rating}
              onClick={() => updateFilter('minRating', rating.toString())}
              className={`flex w-full items-center justify-between text-sm py-1 ${currentFilters.minRating === rating.toString() ? 'font-medium text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <div className="flex items-center gap-1">
                {Array.from({length: 5}).map((_, i) => (
                  <svg key={i} className={`h-4 w-4 ${i < rating ? 'text-warning fill-current' : 'text-muted-foreground/30'}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-1">& Up</span>
              </div>
              {currentFilters.minRating === rating.toString() && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header Area */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {currentFilters.category 
                  ? categories.find(c => c.slug === currentFilters.category)?.name || 'Products' 
                  : currentFilters.search 
                    ? `Search: ${currentFilters.search}`
                    : 'All Products'}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Showing {products.length > 0 ? ((meta.page - 1) * meta.limit) + 1 : 0} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} results
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="md:hidden"
                onClick={() => setIsMobileFiltersOpen(true)}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:inline-block">Sort by:</span>
                <Select 
                  options={SORT_OPTIONS}
                  value={currentFilters.sort}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="w-[180px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-primary" /> Filters
                </h3>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-primary hover:underline font-medium">
                    Reset All
                  </button>
                )}
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Mobile Filter Drawer — slides in from the left so filters stay
              usable on narrow screens instead of hiding behind a modal. */}
          {isMobileFiltersOpen && (
            <div
              className="fixed inset-0 z-50 md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
            >
              <div
                className="absolute inset-0 bg-black/50 animate-in"
                onClick={() => setIsMobileFiltersOpen(false)}
                aria-hidden="true"
              />
              <div className="relative flex h-full w-[85vw] max-w-xs flex-col bg-card shadow-xl animate-in">
                <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 flex-shrink-0">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-primary" /> Filters
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsMobileFiltersOpen(false)}
                    aria-label="Close filters"
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg hover:bg-accent transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Scrollable body so long filter lists never push the
                    action bar off-screen. */}
                <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
                  <FilterContent />
                </div>

                <div className="flex-shrink-0 border-t border-border bg-card p-4 flex gap-3">
                  <Button variant="outline" fullWidth onClick={clearFilters}>Reset</Button>
                  <Button fullWidth onClick={() => setIsMobileFiltersOpen(false)}>
                    Show results
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {/* Active filters badges */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-sm text-muted-foreground mr-1">Active:</span>
                {Object.entries(currentFilters).map(([key, value]) => {
                  if (!value || key === 'page' || key === 'sort') return null;
                  let label = value.toString();
                  if (key === 'category') label = categories.find(c => c.slug === value)?.name || label;
                  return (
                    <Badge key={key} variant="secondary" className="pl-2 pr-1 py-1 gap-1 flex items-center">
                      <span className="text-muted-foreground capitalize">{key}:</span> 
                      <span className="font-semibold">{label}</span>
                      <button 
                        onClick={() => updateFilter(key, '')}
                        className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}

            {error ? (
              <ErrorState message={error} onRetry={fetchProducts} />
            ) : loading ? (
              <ProductGrid loading={true} skeletonCount={12} />
            ) : products.length === 0 ? (
              <EmptyState 
                variant="search" 
                title="No products found" 
                description="We couldn't find any products matching your current filters. Try adjusting them."
                actionLabel="Clear all filters"
                actionHref="#"
              />
            ) : (
              <>
                <ProductGrid>
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </ProductGrid>
                
                <div className="mt-12 flex justify-center border-t border-border pt-8">
                  <Pagination 
                    currentPage={meta.page}
                    totalPages={meta.totalPages}
                    onPageChange={(page) => updateFilter('page', page.toString())}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
