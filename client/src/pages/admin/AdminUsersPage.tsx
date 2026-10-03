import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { Search, Loader2, ShieldCheck, ShoppingBag, Users } from 'lucide-react';
import { Badge, EmptyState, ErrorState, Input, Pagination, Select, Skeleton } from '@/components/ui';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
  createdAt: string;
  orderCount: number;
}

interface UsersPayload {
  users: AdminUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const PAGE_SIZE_OPTIONS = [10, 25, 50].map((size) => ({
  value: String(size),
  label: `${size} / page`,
}));

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<UsersPayload['pagination']>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const requestRef = useRef(0);

  // Debounce the search box so we don't call the API on every keystroke
  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const loadUsers = useCallback(async () => {
    const requestId = ++requestRef.current;
    setFetching(true);

    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set('search', search);

      const res = await fetchApi<UsersPayload>(`/admin/users?${params.toString()}`);
      if (requestId !== requestRef.current) return; // A newer request superseded this one

      if (res.error) throw new Error(res.error);
      if (!res.data) throw new Error('No data returned from the server');

      setUsers(res.data.users);
      setPagination(res.data.pagination);
      setError('');

      // The requested page may no longer exist (e.g. after a search or page size change)
      const { totalPages } = res.data.pagination;
      if (res.data.users.length === 0 && page > 1 && totalPages > 0 && page > totalPages) {
        setPage(totalPages);
      }
    } catch (err: any) {
      if (requestId !== requestRef.current) return;
      setError(err.message || 'Failed to load users');
      setUsers([]);
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
        setFetching(false);
      }
    }
  }, [page, limit, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const start = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const end = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-1">Registered accounts, roles, and order activity.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>
            <span className="font-semibold text-foreground">{pagination.total.toLocaleString()}</span>{' '}
            {pagination.total === 1 ? 'user' : 'users'}
          </span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-4 border-b border-border bg-muted/30 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-9"
              aria-label="Search users"
            />
            {fetching && !loading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Rows per page</span>
            <div className="w-32">
              <Select
                selectSize="sm"
                options={PAGE_SIZE_OPTIONS}
                value={String(limit)}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                aria-label="Rows per page"
              />
            </div>
          </div>
        </div>

        <div className={`flex-1 overflow-x-auto ${fetching && !loading ? 'opacity-60 transition-opacity' : ''}`} aria-busy={fetching}>
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8">
              <ErrorState title="Failed to load users" message={error} onRetry={loadUsers} />
            </div>
          ) : users.length > 0 ? (
            <>
            {/* Phones: stacked cards. The table needs a 560px floor, so on a
                phone it would only be readable by scrolling sideways. */}
            <ul className="divide-y divide-border md:hidden">
              {users.map((user) => (
                <li key={user.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant={user.role === 'ADMIN' ? 'primary' : 'secondary'} size="sm">
                      {user.role === 'ADMIN' && <ShieldCheck className="mr-1 h-3 w-3" />}
                      {user.role}
                    </Badge>
                  </div>
                  <dl className="mt-3 flex items-center justify-between text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">Joined</dt>
                      <dd>{formatDate(user.createdAt)}</dd>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      <dd className="font-semibold">{user.orderCount}</dd>
                      <dt className="sr-only">orders</dt>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>

            <table className="hidden w-full min-w-[560px] text-sm text-left md:table">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4 hidden md:table-cell">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 whitespace-nowrap">Registration Date</th>
                  <th className="px-6 py-4 whitespace-nowrap">Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground truncate max-w-[160px] sm:max-w-[220px]">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[160px] sm:max-w-[220px] md:hidden">
                        {user.email}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">{user.email}</td>
                    <td className="px-6 py-4">
                      <Badge variant={user.role === 'ADMIN' ? 'primary' : 'secondary'} size="sm">
                        {user.role === 'ADMIN' && <ShieldCheck className="w-3 h-3" />}
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap" title={new Date(user.createdAt).toLocaleString()}>
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                        <span className="font-semibold text-foreground">{user.orderCount}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </>
          ) : (
            <EmptyState
              variant={search ? 'search' : 'default'}
              title={search ? 'No matching users' : 'No users found'}
              description={
                search
                  ? `No users match "${search}". Try a different name or email.`
                  : 'There are no registered users yet.'
              }
              actionHref=""
              className="py-16"
            />
          )}
        </div>

        {!loading && !error && pagination.total > 0 && (
          <div className="p-4 border-t border-border bg-muted/30 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{start}</span>–
              <span className="font-medium text-foreground">{end}</span> of{' '}
              <span className="font-medium text-foreground">{pagination.total.toLocaleString()}</span> users
            </p>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(nextPage) => {
                if (fetching) return;
                setPage(nextPage);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
