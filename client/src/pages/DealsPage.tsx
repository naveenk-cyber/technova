import { useCallback, useEffect, useState } from 'react';
import { Tag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchApi } from '@/lib/api';
import { toCardProduct, type RawProduct } from '@/lib/product';
import { Button, EmptyState, ErrorState, ProductCard, ProductGrid } from '@/components/ui';
import type { Product } from '@/components/ui/ProductCard';

interface ProductsPayload {
  products: RawProduct[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export function DealsPage() {
  const [deals, setDeals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDeals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi<ProductsPayload>('/products?limit=100&sort=price_asc');
      if (res.error) throw new Error(res.error);
      // Only genuine markdowns belong on a deals page.
      const discounted = (res.data?.products || [])
        .map(toCardProduct)
        .filter((product) => product.discount > 0)
        .sort((a, b) => b.discount - a.discount);
      setDeals(discounted);
    } catch (err: any) {
      setError(err?.message || 'We could not load today\'s deals.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeals();
  }, [loadDeals]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Tag className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Deals & Offers</h1>
              <p className="text-muted-foreground mt-1">Limited-time price drops you don't want to miss.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {loading ? (
          <ProductGrid loading skeletonCount={8} />
        ) : error ? (
          <ErrorState title="Failed to load deals" message={error} onRetry={loadDeals} />
        ) : deals.length === 0 ? (
          <EmptyState
            variant="default"
            title="No active deals right now"
            description="Everything is already at its best price. Check back soon for new markdowns."
            actionLabel="Browse all products"
            actionHref="/products"
          />
        ) : (
          <>
            <ProductGrid skeletonCount={8}>{deals.map((product) => <ProductCard key={product.id} product={product} />)}</ProductGrid>
            <div className="mt-12 flex justify-center">
              <Link to="/products">
                <Button variant="outline" size="lg" rightIcon={<ArrowRight className="h-4 w-4 ml-2" />}>
                  Browse the full catalog
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}