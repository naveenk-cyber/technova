import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { fetchApi } from '@/lib/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { Product } from '@/components/ui/ProductCard';

export interface CartItem {
  id: string; // The cart item ID
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const refreshCart = async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }

    setLoading(true);
    try {
      // The API probably returns the cart directly
      const res = await fetchApi<Cart>('/cart');
      if (res.data) {
        setCart(res.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch cart', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [isAuthenticated]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    try {
      const res = await fetchApi<Cart>('/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      });
      if (res.error) throw new Error(res.error);
      if (res.data) setCart(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to add item to cart');
      alert(err.message || 'Failed to add item to cart'); // Basic fallback for UI feedback
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!isAuthenticated) return;
    
    // Optimistic update
    const previousCart = cart;
    if (cart) {
      setCart({
        ...cart,
        items: cart.items.map(item => item.id === itemId ? { ...item, quantity } : item)
      });
    }

    try {
      const res = await fetchApi<Cart>(`/cart/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });
      if (res.error) throw new Error(res.error);
      if (res.data) setCart(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to update quantity');
      setCart(previousCart); // Revert
      alert(err.message || 'Failed to update quantity');
    }
  };

  const removeItem = async (itemId: string) => {
    if (!isAuthenticated) return;
    
    // Optimistic update
    const previousCart = cart;
    if (cart) {
      setCart({
        ...cart,
        items: cart.items.filter(item => item.id !== itemId)
      });
    }

    try {
      const res = await fetchApi<Cart>(`/cart/${itemId}`, {
        method: 'DELETE',
      });
      if (res.error) throw new Error(res.error);
      if (res.data) setCart(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to remove item');
      setCart(previousCart); // Revert
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;

    try {
      const res = await fetchApi<Cart>('/cart/clear', {
        method: 'DELETE',
      });
      if (res.error) throw new Error(res.error);
      if (res.data) setCart(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to clear cart');
    }
  };

  const cartCount = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;
  
  const cartTotal = cart?.items.reduce((acc, item) => {
    const finalPrice = item.product.price * (1 - item.product.discount / 100);
    return acc + (finalPrice * item.quantity);
  }, 0) || 0;

  return (
    <CartContext.Provider value={{ 
      cart, loading, error, addToCart, updateQuantity, removeItem, clearCart, refreshCart, cartCount, cartTotal 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
