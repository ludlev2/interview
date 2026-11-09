import { createBrowserRouter, Link, RouterProvider } from 'react-router';
import { RequireRole } from './auth/RequireRole';
import { Layout } from './components/Layout';
import { AdminProductsPage } from './pages/AdminProductsPage';
import { AdminStockImportPage } from './pages/AdminStockImportPage';
import { CartPage } from './pages/CartPage';
import { CataloguePage } from './pages/CataloguePage';
import { CheckoutPage } from './pages/CheckoutPage';
import { FakeCheckoutPage } from './pages/FakeCheckoutPage';
import { LoginPage } from './pages/LoginPage';
import { OrderPage } from './pages/OrderPage';
import { OrdersPage } from './pages/OrdersPage';
import { PickingPage } from './pages/PickingPage';
import { ProductPage } from './pages/ProductPage';

function NotFound() {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <Link to="/" className="text-brand-700 underline">
        Back to the shop
      </Link>
    </div>
  );
}

const router = createBrowserRouter([
  { path: '/fake-checkout/:intentId', element: <FakeCheckoutPage /> },
  {
    element: <Layout />,
    children: [
      { path: '/', element: <CataloguePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/products/:id', element: <ProductPage /> },
      { path: '/cart', element: <CartPage /> },
      {
        path: '/checkout',
        element: (
          <RequireRole>
            <CheckoutPage />
          </RequireRole>
        ),
      },
      {
        path: '/orders',
        element: (
          <RequireRole>
            <OrdersPage />
          </RequireRole>
        ),
      },
      {
        path: '/orders/:id',
        element: (
          <RequireRole>
            <OrderPage />
          </RequireRole>
        ),
      },
      {
        path: '/warehouse/picking',
        element: (
          <RequireRole roles={['staff', 'admin']}>
            <PickingPage />
          </RequireRole>
        ),
      },
      {
        path: '/admin/products',
        element: (
          <RequireRole roles={['admin']}>
            <AdminProductsPage />
          </RequireRole>
        ),
      },
      {
        path: '/admin/stock-import',
        element: (
          <RequireRole roles={['admin']}>
            <AdminStockImportPage />
          </RequireRole>
        ),
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
