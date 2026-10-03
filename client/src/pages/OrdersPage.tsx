import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchApi } from '@/lib/api';
import { Package, ChevronRight, Calendar, AlertCircle } from 'lucide-react';
import { Button, Badge, Skeleton, EmptyState } from '@/components/ui';

interface OrderItem {
  id: string;
  productName: string;
  price: string | number;
  quantity: number;
}

interface Order {
  id: string;
  totalAmount: string | number;
  orderStatus: string;
  createdAt: string;
  items: OrderItem[];
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { state: { from: location } });
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetchApi<Order[]>('/orders');
        if (res.error) throw new Error(res.error);
        if (res.data) setOrders(res.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load your orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate, location]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'CONFIRMED': return 'primary';
      case 'PROCESSING': return 'secondary';
      case 'SHIPPED': return 'default';
      case 'DELIVERED': return 'success';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Order History</h1>
              <p className="text-muted-foreground mt-1">Track and manage your recent purchases</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error ? (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState 
            variant="default"
            title="No orders found"
            description="You haven't placed any orders yet."
            actionLabel="Start Shopping"
            actionHref="/products"
          />
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-card-hover transition-all duration-200">
                <div className="bg-muted/30 px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 w-full">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Order Placed</p>
                      <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total</p>
                      <p className="text-sm font-bold text-foreground">
                        ₹{Number(order.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Order ID</p>
                      <p className="text-sm font-mono text-muted-foreground truncate">{order.id}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1 sm:text-right">
                      <Badge variant={getStatusBadgeVariant(order.orderStatus) as any} className="mt-2 sm:mt-0">
                        {order.orderStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''} in this order
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-1 max-w-xl">
                        {order.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                      </p>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/orders/${order.id}`)}
                      rightIcon={<ChevronRight className="w-4 h-4 ml-1" />}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
