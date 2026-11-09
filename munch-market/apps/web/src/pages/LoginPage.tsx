import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '@/auth/useAuth';
import { Button, Card, ErrorMessage, Input, Label } from '@/components/ui';
import type { UserRole } from '@/lib/types';

const HOME_BY_ROLE: Record<UserRole, string> = {
  customer: '/',
  staff: '/warehouse/picking',
  admin: '/admin/products',
};

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const user = await login(email, password);
      navigate(params.get('next') ?? HOME_BY_ROLE[user.role], { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <Card className="p-6">
        <h1 className="mb-1 text-xl font-semibold">Log in</h1>
        <p className="mb-6 text-sm text-slate-500">Welcome back to Munch Market.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <ErrorMessage error={error} />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Log in'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
