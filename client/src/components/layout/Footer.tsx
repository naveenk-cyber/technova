import { Link } from 'react-router-dom';
import { Cpu, Mail, Phone, MapPin, ArrowRight, ExternalLink } from 'lucide-react';

const footerLinks = {
  shop: [
    { label: 'All Products', href: '/products' },
    { label: 'Laptops', href: '/categories/laptops' },
    { label: 'Smartphones', href: '/categories/smartphones' },
    { label: 'Accessories', href: '/categories/accessories' },
    { label: 'Deals & Offers', href: '/deals' },
  ],
  support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Track Order', href: '/orders' },
    { label: 'Returns & Refunds', href: '/returns' },
    { label: 'Shipping Policy', href: '/shipping' },
    { label: 'Warranty', href: '/warranty' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

const socials = [
  { label: 'Twitter (X)', href: '#' },
  { label: 'Instagram', href: '#' },
  { label: 'YouTube', href: '#' },
  { label: 'GitHub', href: '#' },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      {/* Newsletter strip */}
      <div className="bg-primary/6 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-bold text-lg text-foreground">Stay in the loop</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Get the latest deals and product drops in your inbox.</p>
            </div>
            <form
              className="flex w-full sm:w-auto gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="min-w-0 flex-1 sm:w-64 sm:flex-none flex items-center gap-2 rounded-xl border border-border bg-background px-3">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="your@email.com"
                  className="min-w-0 flex-1 py-2.5 text-sm bg-transparent focus:outline-none"
                  aria-label="Email for newsletter"
                />
              </div>
              <button
                type="submit"
                className="inline-flex flex-shrink-0 items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-brand-600 transition-colors"
              >
                Subscribe <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main links */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <Cpu className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                TECH<span className="text-primary">NOVA</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              India's most trusted AI-powered technology marketplace. Premium products, expert advice, fast delivery.
            </p>

            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <span>1800-TECHNOVA (Toll Free)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <span>support@technova.in</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Bengaluru, Karnataka, India 560001</span>
              </div>
            </div>

            {/* Socials */}
            <div className="mt-5 flex items-center gap-2">
              {socials.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-8 px-2 items-center justify-center rounded-lg border border-border hover:bg-accent hover:border-primary/30 transition-all duration-150 text-[10px] font-bold text-muted-foreground"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                {section}
              </h4>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      to={href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} TECHNOVA Technology Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {/* Payment icons placeholder */}
            {['VISA', 'MC', 'UPI', 'COD'].map((pay) => (
              <span
                key={pay}
                className="inline-flex items-center px-2 py-0.5 rounded border border-border text-[11px] font-bold text-muted-foreground"
              >
                {pay}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
