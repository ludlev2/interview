import clsx from 'clsx';
import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '@/auth/useAuth';
import { useCart } from '@/cart/useCart';
import { Button } from './ui';

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        clsx(
          'rounded-md px-3 py-2 text-sm font-medium',
          isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900',
        )
      }
    >
      {children}
    </NavLink>
  );
}

export function Layout() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
          <Link to="/" className="mr-4 flex items-center gap-2 text-lg font-bold text-brand-700">
            <img src="/favicon.svg" alt="" className="h-7 w-7" />
            Munch Market
          </Link>
          <nav className="flex flex-1 items-center gap-1">
            <NavItem to="/">Shop</NavItem>
            {user?.role === 'customer' && <NavItem to="/orders">My orders</NavItem>}
            {(user?.role === 'staff' || user?.role === 'admin') && (
              <NavItem to="/warehouse/picking">Picking list</NavItem>
            )}
            {user?.role === 'admin' && (
              <>
                <NavItem to="/admin/products">Products</NavItem>
                <NavItem to="/admin/stock-import">Stock import</NavItem>
              </>
            )}
          </nav>
          <NavItem to="/cart">
            Cart{count > 0 && <span className="ml-1 rounded-full bg-brand-600 px-2 text-xs text-white">{count}</span>}
          </NavItem>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-slate-500 sm:inline">{user.name}</span>
              <Button
                variant="secondary"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Log out
              </Button>
            </div>
          ) : (
            <Link to="/login" className="text-sm font-medium text-brand-700 hover:underline">
              Log in
            </Link>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
