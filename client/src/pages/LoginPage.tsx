import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Cpu, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input } from '@/components/ui';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // A ref updates synchronously, so a second submit in the same tick is
  // rejected. `submitting` state alone would still read false here.
  const submittingRef = useRef(false);

  // Signed-in visitors should land on their original destination, not a dead form.
  if (isAuthenticated) {
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
    return <Navigate to={from || '/'} replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submittingRef.current) return; // Guard against double submits

    submittingRef.current = true;
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(from || '/', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'We could not sign you in. Please check your details and try again.');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            TECH<span className="text-primary">NOVA</span>
          </span>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            Sign in to manage your cart, wishlist, and orders.
          </p>

          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4"
            >
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
              disabled={submitting}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              disabled={submitting}
              required
            />

            <Button type="submit" size="lg" fullWidth loading={submitting}>
              {submitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to TECHNOVA?{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>

          <div className="mt-6 rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Demo accounts</p>
            <p>admin@technova.com · john@example.com</p>
            <p>Password for both: password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}