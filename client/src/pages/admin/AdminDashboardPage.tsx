import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle 
} from 'lucide-react';
import { Skeleton, ErrorState, Badge } from '@/components/ui';

interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockProducts: any[];
  recentOrders: any[];
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const res = await fetchApi<DashboardStats>('/admin/dashboard');
        if (res.error) throw new Error(res.error);
        if (res.data) setStats(res.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-96 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8">
        <ErrorState title="Dashboard Error" message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Revenue', value: `₹${Number(stats.totalRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
    { title: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: ShoppingCart, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Total Products', value: stats.totalProducts.toLocaleString(), icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Total Customers', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome to the Technova admin panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6 flex items-start justify-between shadow-sm">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border bg-muted/30 flex justify-between items-center">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Recent Orders
            </h3>
          </div>
          <div className="flex-1 overflow-auto">
            {stats.recentOrders.length > 0 ? (
              <>
              {/* Phones: stacked rows, so the ID, total, and status stay
                  readable without sideways scrolling. */}
              <ul className="divide-y divide-border md:hidden">
                {stats.recentOrders.map((order) => (
                  <li key={order.id} className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{order.user?.name || 'Guest'}</p>
                      <p className="truncate font-mono text-[11px] text-muted-foreground">{order.id.slice(0, 13)}…</p>
                    </div>
                    <div className="flex flex-shrink-0 flex-col items-end gap-1">
                      <span className="text-sm font-semibold">
                        ₹{Number(order.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <Badge
                        variant={
                          order.orderStatus === 'DELIVERED' ? 'success' :
                          order.orderStatus === 'PENDING' ? 'warning' : 'primary'
                        }
                        size="sm"
                      >
                        {order.orderStatus}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>

              <table className="hidden w-full text-sm text-left md:table">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-lg">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4 rounded-tr-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs max-w-[120px] truncate">{order.id}</td>
                      <td className="px-6 py-4 font-medium">{order.user?.name || 'Guest'}</td>
                      <td className="px-6 py-4 font-semibold">₹{Number(order.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          order.orderStatus === 'DELIVERED' ? 'success' : 
                          order.orderStatus === 'PENDING' ? 'warning' : 'primary'
                        } size="sm">
                          {order.orderStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </>
            ) : (
              <div className="p-8 text-center text-muted-foreground">No recent orders found.</div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border bg-muted/30 flex justify-between items-center">
            <h3 className="font-bold text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Low Stock Alerts
            </h3>
          </div>
          <div className="flex-1 overflow-auto">
            {stats.lowStockProducts.length > 0 ? (
              <>
              <ul className="divide-y divide-border md:hidden">
                {stats.lowStockProducts.map((product) => (
                  <li key={product.id} className="flex items-center justify-between gap-3 p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="m-2.5 h-5 w-5 text-muted-foreground/30" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{product.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{product.brand}</p>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 flex-col items-end gap-1">
                      <span className="text-sm font-semibold">₹{Number(product.price).toLocaleString()}</span>
                      <Badge variant="destructive" size="sm" className="font-mono">{product.stock} left</Badge>
                    </div>
                  </li>
                ))}
              </ul>

              <table className="hidden w-full text-sm text-left md:table">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-lg">Product</th>
                    <th className="px-6 py-4">Brand</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4 rounded-tr-lg">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats.lowStockProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted border border-border overflow-hidden">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 m-2.5 text-muted-foreground/30" />
                          )}
                        </div>
                        <span className="font-medium truncate max-w-[150px]">{product.name}</span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{product.brand}</td>
                      <td className="px-6 py-4 font-semibold">₹{Number(product.price).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <Badge variant="destructive" size="sm" className="font-mono">
                          {product.stock} left
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </>
            ) : (
              <div className="p-8 text-center text-muted-foreground">All products are well-stocked.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
