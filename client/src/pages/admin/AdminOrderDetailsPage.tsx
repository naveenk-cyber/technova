import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchApi } from '@/lib/api';
import { ChevronLeft, Package, User, MapPin, CreditCard, Clock, CheckCircle } from 'lucide-react';
import { Badge, Skeleton, ErrorState, Button } from '@/components/ui';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  productName: string;
  product?: { image: string };
}

interface Order {
  id: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  shippingAddress: any;
  items: OrderItem[];
  user?: { name: string; email: string };
}

export function AdminOrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadOrder = async () => {
    try {
      const res = await fetchApi<Order>(`/orders/admin/${id}`);
      if (res.error) throw new Error(res.error);
      if (res.data) setOrder(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
    setUpdating(true);
    try {
      const res = await fetchApi(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.error) throw new Error(res.error);
      alert('Order status updated successfully');
      loadOrder();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'success';
      case 'PENDING': return 'warning';
      case 'CONFIRMED': return 'primary';
      case 'SHIPPED': return 'primary';
      default: return 'default';
    }
  };

  if (loading) return <div className="p-8 space-y-4"><Skeleton className="h-8 w-64 mb-8" /><Skeleton className="h-[400px] w-full" /></div>;
  if (error || !order) return <div className="p-8"><ErrorState title="Failed to load order" message={error} /></div>;

  const validTransitions: Record<string, string[]> = {
    'PENDING': ['CONFIRMED', 'PROCESSING'],
    'CONFIRMED': ['PROCESSING', 'SHIPPED'],
    'PROCESSING': ['SHIPPED', 'DELIVERED'],
    'SHIPPED': ['DELIVERED'],
    'DELIVERED': []
  };

  const nextStatuses = validTransitions[order.orderStatus] || [];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-24">
      <div className="flex items-center gap-4">
        <Link to="/admin/orders" className="p-2 rounded-full hover:bg-muted transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Order Details</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">{order.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content: Items & Timeline */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Status Update Panel */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Order Status</h3>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">Current:</span>
                <Badge variant={getStatusBadge(order.orderStatus)} className="text-sm px-3 py-1">
                  {order.orderStatus}
                </Badge>
              </div>
              <div className="flex-1" />
              {nextStatuses.length > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground mr-2">Update to:</span>
                  {nextStatuses.map(status => (
                    <Button 
                      key={status} 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleStatusChange(status)}
                      loading={updating}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-success font-medium">
                  <CheckCircle className="w-5 h-5" /> Completed
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" /> Products
            </h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 rounded-xl border border-border/50 bg-muted/10 items-center">
                  <div className="w-16 h-16 rounded-lg bg-muted border border-border overflow-hidden shrink-0">
                    {item.product?.image ? (
                      <img src={item.product.image} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-8 h-8 m-4 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm sm:text-base line-clamp-2">{item.productName}</h4>
                    <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity} × ₹{Number(item.price).toLocaleString()}</p>
                  </div>
                  <div className="text-right font-semibold">
                    ₹{(Number(item.price) * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-border flex justify-between items-center text-lg font-bold">
              <span>Total Amount</span>
              <span className="text-primary">₹{Number(order.totalAmount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Sidebar: Customer, Shipping, Payment */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-semibold flex items-center gap-2 border-b border-border pb-3">
              <User className="w-4 h-4 text-muted-foreground" /> Customer Info
            </h3>
            <div className="space-y-1 text-sm">
              <p><span className="text-muted-foreground">Name:</span> <span className="font-medium">{order.user?.name || order.shippingAddress?.fullName}</span></p>
              <p><span className="text-muted-foreground">Email:</span> {order.user?.email || 'N/A'}</p>
              <p><span className="text-muted-foreground">Phone:</span> {order.shippingAddress?.phone}</p>
              <p className="pt-2 flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" /> {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-semibold flex items-center gap-2 border-b border-border pb-3">
              <MapPin className="w-4 h-4 text-muted-foreground" /> Shipping Address
            </h3>
            <div className="text-sm text-muted-foreground leading-relaxed">
              <p className="font-medium text-foreground">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress?.addressLine2}</p>}
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pinCode}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-semibold flex items-center gap-2 border-b border-border pb-3">
              <CreditCard className="w-4 h-4 text-muted-foreground" /> Payment Info
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={order.paymentStatus === 'SIMULATED' ? 'warning' : 'success'} size="sm">
                  {order.paymentStatus}
                </Badge>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
