import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Cpu, ShoppingCart, Heart, User, Search, Menu, X, Zap
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { label: 'Products', href: '/products' },
  { label: 'Categories', href: '/categories' },
  { label: 'Deals', href: '/deals' },
  { label: 'AI Advisor', href: '/ai-advisor' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  // Use cart context, fallback gracefully if outside provider
  let cartCount = 0;
  try {
    const context = useCart();
    cartCount = context.cartCount;
  } catch (e) {
    // Ignore error if outside context
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <header
        className={[
          'sticky top-0 z-50 w-full transition-all duration-300',
          scrolled
            ? 'border-b border-border bg-background/95 backdrop-blur-xl shadow-sm'
            : 'border-b border-transparent bg-background/80 backdrop-blur-md',
        ].join(' ')}
      >
        {/* Announcement bar */}
        <div className="bg-primary text-primary-foreground text-xs font-medium py-1.5 text-center tracking-wide">
          <Zap className="inline h-3 w-3 mr-1 -mt-0.5" />
          Free shipping on orders over ₹999 · Use code <span className="font-bold">TECHNOVA10</span> for 10% off
        </div>

        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 flex-shrink-0 group"
            aria-label="TECHNOVA Home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm group-hover:shadow-md group-hover:bg-brand-600 transition-all duration-200">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              TECH<span className="text-primary">NOVA</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-0.5 ml-2" aria-label="Main navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  [
                    'px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-150',
                    isActive
                      ? 'text-primary bg-primary/8'
                      : 'text-foreground/70 hover:text-foreground hover:bg-accent',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Search — desktop (expands) */}
          <div className="hidden xl:flex flex-1 max-w-sm ml-auto items-center relative">
            <div className={[
              'flex w-full items-center gap-2 rounded-xl border transition-all duration-200',
              searchOpen
                ? 'border-primary shadow-sm bg-background ring-2 ring-primary/20'
                : 'border-border bg-muted/50 hover:border-primary/50',
            ].join(' ')}>
              <Search className="ml-3 h-4 w-4 text-muted-foreground flex-shrink-0" />
              <input
                ref={searchRef}
                id="desktop-search"
                type="search"
                placeholder="Search products, brands..."
                className="flex-1 bg-transparent py-2.5 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setSearchOpen(false)}
              />
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden xl:flex items-center gap-1">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative flex h-11 w-11 xl:h-9 xl:w-9 items-center justify-center rounded-lg hover:bg-accent transition-colors duration-150"
            >
              <Heart className="h-5 w-5 text-foreground/70" />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative flex h-11 w-11 xl:h-9 xl:w-9 items-center justify-center rounded-lg hover:bg-accent transition-colors duration-150"
            >
              <ShoppingCart className="h-5 w-5 text-foreground/70" />
              {/* Cart badge */}
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account / Orders */}
            <Link
              to="/orders"
              aria-label="Account Orders"
              className="flex h-11 w-11 xl:h-9 xl:w-9 items-center justify-center rounded-lg hover:bg-accent transition-colors duration-150"
            >
              <User className="h-5 w-5 text-foreground/70" />
            </Link>

            <div className="w-px h-6 bg-border mx-1" />

            {isAuthenticated ? (
              <>
                <Link
                  to="/account"
                  className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors px-3"
                >
                  {user?.name || 'My Account'}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="inline-flex h-9 items-center px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors px-3"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex h-9 items-center px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-brand-600 active:bg-brand-700 transition-colors shadow-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile actions */}
          <div className="flex xl:hidden items-center gap-1 ml-auto">
            <Link to="/cart" aria-label="Cart" className="relative flex h-11 w-11 xl:h-9 xl:w-9 items-center justify-center rounded-lg hover:bg-accent">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              className="flex h-11 w-11 xl:h-9 xl:w-9 items-center justify-center rounded-lg hover:bg-accent transition-colors"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="border-t border-border bg-background px-4 pb-4 pt-2 xl:hidden animate-in">
            {/* Mobile Search */}
            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2.5 mb-3">
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <input
                type="search"
                placeholder="Search products..."
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex flex-col gap-0.5" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    [
                      'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive ? 'bg-primary/8 text-primary' : 'text-foreground hover:bg-accent',
                    ].join(' ')
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <NavLink
                to="/wishlist"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  ['flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive ? 'bg-primary/8 text-primary' : 'text-foreground hover:bg-accent'].join(' ')
                }
              >
                <Heart className="h-4 w-4" /> Wishlist
              </NavLink>
            </nav>

            {/* Mobile Auth */}
            <div className="mt-3 flex gap-2 border-t border-border pt-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/account"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 flex items-center justify-center py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
                  >
                    My Account
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                      navigate('/');
                    }}
                    className="flex-1 flex items-center justify-center py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-brand-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 flex items-center justify-center py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 flex items-center justify-center py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-brand-600 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
