import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '@/lib/api';
import { Search, Eye } from 'lucide-react';
import { Button, Input, Badge, ErrorState, Skeleton } from '@/components/ui';

interface Order {
  id: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  user?: { name: string; email: string };
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  const navigate = useNavigate();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', '100');
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (dateFilter) params.append('date', dateFilter);

      const res = await fetchApi<any>(`/orders/all?${params.toString()}`);
      if (res.error) throw new Error(res.error);
      if (res.data) setOrders(res.data.orders);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [searchTerm, statusFilter, dateFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'success';
      case 'PENDING': return 'warning';
      case 'CONFIRMED': return 'primary';
      case 'SHIPPED': return 'primary';
      default: return 'default';
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Orders Management</h1>
        <p className="text-muted-foreground mt-1">View and manage customer orders.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-4 border-b border-border bg-muted/30 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by customer name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <select
              className="flex h-11 rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
            </select>
            <Input 
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : error ? (
            <ErrorState title="Failed to load" message={error} onRetry={loadOrders} />
          ) : orders.length > 0 ? (
            <>
            {/* Phones: stacked cards. Six columns cannot fit a phone, and a
                sideways-scrolling table hides the status at a glance. */}
            <ul className="divide-y divide-border md:hidden">
              {orders.map((order) => (
                <li key={order.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] text-muted-foreground">{order.id.slice(0, 13)}…</p>
                      <p className="truncate font-medium">{order.user?.name || 'Guest'}</p>
                      <p className="truncate text-xs text-muted-foreground">{order.user?.email}</p>
                    </div>
                    <div className="flex flex-shrink-0 flex-col items-end gap-1">
                      <Badge variant={getStatusBadge(order.orderStatus)} size="sm">{order.orderStatus}</Badge>
                      {order.paymentStatus === 'SIMULATED' && (
                        <span className="rounded bg-muted px-1.5 text-[11px] text-muted-foreground">SIMULATED</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span className="font-semibold">₹{Number(order.totalAmount).toLocaleString()}</span>
                  </div>
                  <Button variant="outline" size="sm" fullWidth onClick={() => navigate(`/admin/orders/${order.id}`)}>
                    <Eye className="mr-2 h-4 w-4" /> View order
                  </Button>
                </li>
              ))}
            </ul>

            {/* Tablet and up: the full table. */}
            <table className="hidden w-full text-sm text-left md:table">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs max-w-[120px] truncate">{order.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{order.user?.name || 'Guest'}</p>
                      <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-semibold">₹{Number(order.totalAmount).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <Badge variant={getStatusBadge(order.orderStatus)} size="sm">
                          {order.orderStatus}
                        </Badge>
                        {order.paymentStatus === 'SIMULATED' && (
                          <span className="text-[11px] text-muted-foreground bg-muted px-1.5 rounded">SIMULATED PAY</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                        <Eye className="w-4 h-4 mr-2" /> View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              No orders found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
