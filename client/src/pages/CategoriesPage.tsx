import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Laptop, Smartphone, Headphones, Watch, ArrowRight } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: { products: number };
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

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi<Category[]>('/categories');
      if (res.error) throw new Error(res.error);
      setCategories(res.data || []);
    } catch (err: any) {
      setError(err?.message || 'We could not load the categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Shop by category</h1>
        <p className="mt-1 text-muted-foreground">Find exactly what you are looking for.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState title="Failed to load categories" message={error} onRetry={loadCategories} />
      ) : categories.length === 0 ? (
        <EmptyState
          variant="default"
          title="No categories yet"
          description="We have not published any categories yet. Check back soon."
          actionLabel="Browse all products"
          actionHref="/products"
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${encodeURIComponent(category.slug)}`}
              className="group flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center transition-all duration-200 hover:border-primary/50 hover:shadow-card-hover"
            >
              <CategoryIcon slug={category.slug} />
              <span className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                {category.name}
              </span>
              {category.description && (
                <span className="mt-2 text-sm text-muted-foreground">{category.description}</span>
              )}
              {typeof category._count?.products === 'number' && (
                <span className="mt-3 text-xs font-medium text-muted-foreground">
                  {category._count.products} product{category._count.products === 1 ? '' : 's'}
                </span>
              )}
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Browse <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}