import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui';

export function AdminUnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-8">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldX className="h-8 w-8" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-destructive">403 Forbidden</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">Unauthorized</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You do not have permission to access the admin area. This section is restricted to administrators.
        </p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Back to Store</Button>
        </Link>
      </div>
    </div>
  );
}
