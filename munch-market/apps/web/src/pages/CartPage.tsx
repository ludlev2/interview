import { Link, useNavigate } from 'react-router';
import { useCart } from '@/cart/useCart';
import { QuantityStepper } from '@/components/QuantityStepper';
import { Button, Card, PageTitle } from '@/components/ui';
import { formatPrice } from '@/lib/format';

export function CartPage() {
  const { items, subtotal, setQuantity, remove } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div>
        <PageTitle>Your cart</PageTitle>
        <p className="text-slate-500">
          Your cart is empty.{' '}
          <Link to="/" className="text-brand-700 underline">
            Start shopping
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageTitle>Your cart</PageTitle>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="divide-y divide-slate-100">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center gap-4 p-4">
              <img src={item.imageUrl} alt="" className="h-16 w-20 rounded object-cover" />
              <div className="flex-1">
                <Link to={`/products/${item.productId}`} className="font-medium hover:underline">
                  {item.name}
                </Link>
                <p className="text-sm text-slate-500">
                  {item.unitLabel} · {formatPrice(item.unitPrice)} each
                </p>
              </div>
              <QuantityStepper
                value={item.quantity}
                min={item.minimumOrderableUnit}
                step={item.orderIncrement}
                onChange={(quantity) => setQuantity(item.productId, quantity)}
              />
              <span className="w-24 text-right font-medium">
                {formatPrice(item.unitPrice * item.quantity)}
              </span>
              <Button variant="ghost" onClick={() => remove(item.productId)}>
                Remove
              </Button>
            </div>
          ))}
        </Card>
        <Card className="h-fit space-y-4 p-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold">{formatPrice(subtotal)}</span>
          </div>
          <p className="text-sm text-slate-500">Shipping is calculated at checkout.</p>
          <Button className="w-full" onClick={() => navigate('/checkout')}>
            Go to checkout
          </Button>
        </Card>
      </div>
    </div>
  );
}
