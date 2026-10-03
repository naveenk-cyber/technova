import { useRef, useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Cpu, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input } from '@/components/ui';

const MIN_PASSWORD_LENGTH = 6;

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // A ref updates synchronously, so a second submit in the same tick is
  // rejected. `submitting` state alone would still read false here.
  const submittingRef = useRef(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submittingRef.current) return; // Guard against double submits

    // Match the server rules so the user gets immediate, specific feedback.
    if (name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Your password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setError('Those passwords do not match.');
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setError(null);
    try {
      await register(name.trim(), email, password);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'We could not create your account. Please try again.');
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
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            Save your cart, wishlist, and track every order.
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
              label="Full name"
              name="name"
              autoComplete="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="h-4 w-4" />}
              disabled={submitting}
              required
            />
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
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              disabled={submitting}
              required
            />
            <Input
              label="Confirm password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              disabled={submitting}
              required
            />

            <Button type="submit" size="lg" fullWidth loading={submitting}>
              {submitting ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}