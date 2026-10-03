import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Heart, LogOut, User, Mail, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchApi } from '@/lib/api';
import { Button, Input, Skeleton, ErrorState } from '@/components/ui';

interface ProfileResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
}

export function AccountPage() {
  const { user, isAuthenticated, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileResponse['user'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  // Synchronous guard: `saving` state is still false within the same tick.
  const savingRef = useRef(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi<ProfileResponse>('/auth/me');
      if (res.error) throw new Error(res.error);
      if (res.data?.user) {
        setProfile(res.data.user);
        setName(res.data.user.name);
        setEmail(res.data.user.email);
      }
    } catch (err: any) {
      setError(err?.message || 'We could not load your profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadProfile();
  }, [isAuthenticated, loadProfile]);

  // Signed-out visitors get sent to sign-in rather than an empty account page.
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <ErrorState
          title="Please sign in"
          message="You need to be signed in to view your account."
          onRetry={() => navigate('/login', { state: { from: { pathname: '/account' } } })}
          actionLabel="Sign In"
        />
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (savingRef.current) return; // Guard against double submits

    savingRef.current = true;
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const payload: Record<string, string> = {};
      if (name !== profile?.name) payload.name = name;
      if (email !== profile?.email) payload.email = email;
      if (password) payload.password = password;

      if (Object.keys(payload).length === 0) {
        setSaveError('Nothing to save — make a change first.');
        return;
      }

      const res = await fetchApi<ProfileResponse>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (res.error) throw new Error(res.error);
      if (res.data?.user) {
        setProfile(res.data.user);
        setName(res.data.user.name);
        setEmail(res.data.user.email);
      }
      setPassword('');
      setSaved(true);
      await refreshUser();
    } catch (err: any) {
      setSaveError(err?.message || 'We could not save your changes. Please try again.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Account</h1>
          <p className="text-sm text-muted-foreground">Manage your details and preferences.</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6" aria-busy="true">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      ) : error ? (
        <ErrorState title="Failed to load your profile" message={error} onRetry={loadProfile} />
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-6">Profile details</h2>

              {saveError && (
                <div
                  role="alert"
                  className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4"
                >
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{saveError}</p>
                </div>
              )}

              {saved && (
                <div
                  role="status"
                  className="mb-6 flex items-center gap-3 rounded-xl border border-success/20 bg-success/10 p-4"
                >
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <p className="text-sm text-success">Your changes have been saved.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <Input
                  label="Full name"
                  name="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSaved(false);
                  }}
                  leftIcon={<User className="h-4 w-4" />}
                  disabled={saving}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSaved(false);
                  }}
                  leftIcon={<Mail className="h-4 w-4" />}
                  disabled={saving}
                  required
                />
                <Input
                  label="New password"
                  name="password"
                  type="password"
                  hint="Leave blank to keep your current password."
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={saving}
                />

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" loading={saving}>
                    {saving ? 'Saving…' : 'Save changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={saving}
                    onClick={() => {
                      if (profile) {
                        setName(profile.name);
                        setEmail(profile.email);
                      }
                      setPassword('');
                      setSaveError(null);
                      setSaved(false);
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-foreground mb-4">Membership</h2>
                {profile?.role === 'ADMIN' ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    <ShieldCheck className="w-4 h-4" /> Administrator
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                    <User className="w-4 h-4" /> Customer
                  </span>
                )}
                {profile?.createdAt && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Member since {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-2">
                <Link
                  to="/orders"
                  className="flex items-center gap-3 rounded-xl p-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <Package className="w-5 h-5 text-primary" /> Order history
                </Link>
                <Link
                  to="/wishlist"
                  className="flex items-center gap-3 rounded-xl p-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <Heart className="w-5 h-5 text-primary" /> Saved items
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center gap-3 rounded-xl p-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <ShieldCheck className="w-5 h-5 text-primary" /> Admin dashboard
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl p-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="w-5 h-5" /> Sign out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}