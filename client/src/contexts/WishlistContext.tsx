import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { fetchApi } from '@/lib/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
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
}

interface WishlistContextType {
  wishlist: Product[];
  wishlistIds: Set<string>;
  loading: boolean;
  error: string | null;
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const refreshWishlist = async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      setWishlistIds(new Set());
      return;
    }

    setLoading(true);
    try {
      // The API returns either a bare array of wishlist rows ({ id, product })
      // or a { products } wrapper depending on the endpoint; normalize both.
      const res = await fetchApi<any>('/wishlist');
      if (res.data) {
        const raw = Array.isArray(res.data) ? res.data : (res.data.products || []);
        const products: Product[] = raw
          .map((item: any) => item?.product ?? item)
          .filter(Boolean);
        setWishlist(products);
        setWishlistIds(new Set(products.map(p => p.id)));
      }
    } catch (err: any) {
      console.error('Failed to fetch wishlist', err);
      // If 401, we might clear state, handled in fetchApi potentially
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [isAuthenticated]);

  const isInWishlist = (productId: string) => wishlistIds.has(productId);

  const toggleWishlist = async (product: Product) => {
    if (!isAuthenticated) {
      // Redirect to login, saving where they were
      navigate('/login', { state: { from: location } });
      return;
    }

    const isCurrentlyIn = isInWishlist(product.id);
    
    // Optimistic update
    const nextIds = new Set(wishlistIds);
    let nextWishlist = [...wishlist];

    if (isCurrentlyIn) {
      nextIds.delete(product.id);
      nextWishlist = nextWishlist.filter(p => p.id !== product.id);
    } else {
      nextIds.add(product.id);
      nextWishlist.push(product);
    }

    setWishlistIds(nextIds);
    setWishlist(nextWishlist);

    try {
      if (isCurrentlyIn) {
        const res = await fetchApi(`/wishlist/${product.id}`, { method: 'DELETE' });
        if (res.error) throw new Error(res.error);
      } else {
        const res = await fetchApi('/wishlist', { 
          method: 'POST',
          body: JSON.stringify({ productId: product.id })
        });
        if (res.error) throw new Error(res.error);
      }
    } catch (err: any) {
      // Revert optimistic update
      setError(err.message || 'Failed to update wishlist');
      refreshWishlist(); // Re-sync with server
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, wishlistIds, loading, error, toggleWishlist, isInWishlist, refreshWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
