import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '@/lib/api';
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react';
import { Button, Input, Badge, ErrorState, Skeleton } from '@/components/ui';

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  stock: number;
  category: { name: string };
  images: { url: string }[];
}

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const loadProducts = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ limit: '100' });
      if (searchTerm) query.set('search', searchTerm);
      const res = await fetchApi<any>(`/products?${query.toString()}`);
      if (res.error) throw new Error(res.error);
      if (res.data) setProducts(res.data.products);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [searchTerm]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await fetchApi(`/products/${id}`, { method: 'DELETE' });
      if (res.error) throw new Error(res.error);
      loadProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products Management</h1>
          <p className="text-muted-foreground mt-1">Manage your catalog, inventory, and pricing.</p>
        </div>
        <Button onClick={() => navigate('/admin/products/new')} leftIcon={<Plus className="w-5 h-5 mr-2" />}>
          Add Product
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : error ? (
            <ErrorState title="Failed to load" message={error} onRetry={loadProducts} />
          ) : products.length > 0 ? (
            <>
            {/* Phones: one stacked card per product. The table below is far
                wider than a phone viewport, so it would need sideways
                scrolling to read. */}
            <ul className="divide-y divide-border md:hidden">
              {products.map((product) => (
                <li key={product.id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                      {product.images?.[0]?.url ? (
                        <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-5 w-5 m-3.5 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{product.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{product.brand}</p>
                    </div>
                    <Badge variant={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'destructive'} size="sm" className="font-mono">
                      {product.stock}
                    </Badge>
                  </div>
                  <dl className="flex items-center justify-between text-sm">
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Category</dt>
                      <dd className="truncate">{product.category?.name || 'Uncategorized'}</dd>
                    </div>
                    <div className="text-right">
                      <dt className="text-xs text-muted-foreground">Price</dt>
                      <dd className="font-semibold">₹{Number(product.price).toLocaleString()}</dd>
                    </div>
                  </dl>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" fullWidth onClick={() => navigate(`/admin/products/${product.id}/edit`)}>
                      <Edit className="mr-1.5 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" fullWidth onClick={() => handleDelete(product.id, product.name)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Tablet and up: the full table. */}
            <table className="hidden w-full text-sm text-left md:table">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted border border-border overflow-hidden">
                        {product.images?.[0]?.url ? (
                          <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 m-2.5 text-muted-foreground/30" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium max-w-[200px] truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{product.brand}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{product.category?.name || 'Uncategorized'}</td>
                    <td className="px-6 py-4 font-semibold">₹{Number(product.price).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <Badge variant={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'destructive'} size="sm" className="font-mono">
                        {product.stock}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/products/${product.id}/edit`)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(product.id, product.name)} className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              No products found. {searchTerm && "Try a different search term."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
