import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ShoppingCart, 
  Users, 
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { Button } from '../ui';
import { AdminUnauthorizedPage } from '@/pages/admin/AdminUnauthorizedPage';
import { useAuth } from '@/contexts/AuthContext';

export function AdminLayout() {
  const location = useLocation();
  const { token, isAdmin, logout } = useAuth();

  // Unauthenticated visitors go to login; signed-in non-admins see a 403 page.
  if (!token) {
    return <Navigate to="/login" replace state={{ from: { pathname: location.pathname } }} />;
  }

  if (!isAdmin) {
    return <AdminUnauthorizedPage />;
  }

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Products', icon: Package, path: '/admin/products' },
    { label: 'Categories', icon: Tags, path: '/admin/categories' },
    { label: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
    { label: 'Users', icon: Users, path: '/admin/users' },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border hidden lg:flex flex-col">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <Link to="/" className="text-xl font-black text-primary tracking-tight">
            TECHNOVA <span className="text-foreground text-xs font-semibold ml-1 px-2 py-0.5 bg-muted rounded-full">ADMIN</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Button 
            variant="ghost" 
            fullWidth 
            className="justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
          <div className="mt-4 pt-4 border-t border-border">
            <Link to="/" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Store
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden min-w-0">
        {/* Mobile/tablet header. The sidebar is hidden below lg, so the nav
            has to live here or admins get stranded on whatever page they
            opened. It scrolls horizontally rather than wrapping. */}
        <header className="lg:hidden bg-card border-b border-border">
          <div className="flex h-14 items-center justify-between gap-2 px-4">
            <Link to="/" className="text-lg font-black text-primary tracking-tight">
              TECHNOVA <span className="text-foreground text-xs font-semibold ml-1">ADMIN</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sign out"
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
          <nav
            className="flex gap-1 overflow-x-auto px-2 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Admin sections"
          >
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
