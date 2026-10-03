import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchApi, friendlyError } from '@/lib/api';
import { 
  Package, 
  ChevronRight, 
  CreditCard,
  MapPin,
  CheckCircle,
  Truck,
  Box,
  Clock
} from 'lucide-react';
import { Button, Badge, Skeleton, ErrorState } from '@/components/ui';

interface Product {
  id: string;
  name: string;
  slug: string;
  image: string | null;
}

interface OrderItem {
  id: string;
  productName: string;
  price: string | number;
  quantity: number;
  product: Product | null;
}

interface Order {
  id: string;
  totalAmount: string | number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: string;
  createdAt: string;
  items: OrderItem[];
}

const ORDER_STAGES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

const STAGE_ICONS: Record<string, typeof Box> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  PROCESSING: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
};

export function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | undefined>(undefined);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetchApi<Order>(`/orders/${id}`);
        // fetchApi already resolves failures, so carry its status through
        // instead of re-throwing and losing it.
        if (res.error) {
          setError(res.error);
          setStatus(res.status);
          return;
        }
        if (res.data) setOrder(res.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load order details.');
        setStatus(err?.status);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrderDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ErrorState 
          title="Order Not Found"
          message={friendlyError({ error, status }, "We couldn't find that order. It may belong to another account, or the link may be wrong.")} 
          onRetry={() => navigate('/orders')}
          actionLabel="Back to Orders"
        />
      </div>
    );
  }

  const currentStageIndex = ORDER_STAGES.indexOf(order.orderStatus);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Breadcrumbs & Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to="/orders" className="hover:text-foreground transition-colors">Orders</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium truncate">Order {order.id}</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-foreground">Order Details</h1>
            <Button variant="outline" onClick={() => window.print()}>Print Invoice</Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Timeline Status — a horizontal rail on desktop, and a vertical
            timeline on phones so no stage is pushed off-screen. */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 mb-8">
          {/* Mobile: vertical timeline */}
          <ol className="flex flex-col gap-0 lg:hidden">
            {ORDER_STAGES.map((stage, index) => {
              const isCompleted = index <= currentStageIndex;
              const isCurrent = index === currentStageIndex;
              const isLast = index === ORDER_STAGES.length - 1;
              const Icon = STAGE_ICONS[stage];

              return (
                <li key={stage} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-4 border-card transition-colors duration-300 ${
                        isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    {!isLast && (
                      <span
                        className={`w-1 flex-1 my-1 rounded-full ${index < currentStageIndex ? 'bg-primary' : 'bg-muted'}`}
                      />
                    )}
                  </div>
                  <div className={`pb-6 pt-2 ${isLast ? 'pb-0' : ''}`}>
                    <span
                      className={`text-sm font-bold tracking-wider ${isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}
                    >
                      {stage}
                    </span>
                    {isCurrent && <span className="ml-2 text-xs text-muted-foreground">Current stage</span>}
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Desktop: horizontal rail */}
          <div className="relative hidden lg:block">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 rounded-full z-0"></div>

            <div className="relative z-10 flex justify-between">
              {ORDER_STAGES.map((stage, index) => {
                const isCompleted = index <= currentStageIndex;
                const isCurrent = index === currentStageIndex;
                const Icon = STAGE_ICONS[stage];

                return (
                  <div key={stage} className="flex flex-col items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-card transition-colors duration-300 ${isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs font-bold tracking-wider ${isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Active Progress Line */}
            <div
              className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full z-0 transition-all duration-700 ease-in-out"
              style={{ width: `${(Math.max(currentStageIndex, 0) / (ORDER_STAGES.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content (Items) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-muted/30">
                <h3 className="font-semibold text-lg">Items in Order</h3>
              </div>
              <div className="divide-y divide-border">
                {order.items.map((item) => (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-xl flex-shrink-0 border border-border overflow-hidden flex items-center justify-center">
                      {item.product?.image ? (
                        <img src={item.product.image} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-8 h-8 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start gap-4">
                        {item.product?.slug ? (
                          <Link to={`/products/${item.product.slug}`} className="font-semibold text-foreground hover:text-primary transition-colors text-base">
                            {item.productName}
                          </Link>
                        ) : (
                          <h4 className="font-semibold text-foreground text-base">{item.productName}</h4>
                        )}
                        <p className="font-bold text-foreground">
                          ₹{Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                      
                      <div className="mt-auto pt-4 flex gap-3">
                        {item.product?.slug && (
                          <Button variant="outline" size="sm" onClick={() => navigate(`/products/${item.product?.slug}`)}>
                            Buy Again
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => alert('Review functionality to be implemented')}>
                          Write a Review
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar (Order Info) */}
          <div className="space-y-6">
            
            {/* Payment & Summary */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-6">Order Summary</h3>
              
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Order Date</span>
                  <span className="text-foreground font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Payment Method</span>
                  <span className="text-foreground font-medium flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" /> {order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground items-center">
                  <span>Payment Status</span>
                  <Badge variant={order.paymentStatus === 'PENDING' ? 'warning' : 'success'} size="sm">
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>

              <hr className="border-border mb-6" />
              
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{Number(order.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-success">Free</span>
                </div>
              </div>

              <hr className="border-border mb-6" />
              
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground">Total</span>
                <span className="text-xl font-black text-foreground">
                  ₹{Number(order.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Shipping Address</h3>
              </div>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed bg-muted/30 p-4 rounded-xl border border-border">
                {order.shippingAddress}
              </div>
            </div>

          </div>
          
        </div>
      </div>
    </div>
  );
}
