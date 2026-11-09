import clsx from 'clsx';
import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '@/auth/useAuth';
import { useCart } from '@/cart/useCart';
import { Button, Card, ErrorMessage, Input, Label, PageTitle } from '@/components/ui';
import { useCreateOrder, useDeliveryOptions } from '@/hooks/queries';
import { formatDate, formatPrice } from '@/lib/format';
import type { Carrier, ShippingAddress } from '@/lib/types';

const ADDRESS_FIELDS: { key: keyof ShippingAddress; label: string; autoComplete: string }[] = [
  { key: 'name', label: 'Full name', autoComplete: 'name' },
  { key: 'phone', label: 'Phone', autoComplete: 'tel' },
  { key: 'zip', label: 'Postcode', autoComplete: 'postal-code' },
  { key: 'city', label: 'City', autoComplete: 'address-level2' },
  { key: 'street', label: 'Street and number', autoComplete: 'street-address' },
];

export function CheckoutPage() {
  const { user } = useAuth();
  const cart = useCart();
  const deliveryOptions = useDeliveryOptions();
  const createOrder = useCreateOrder();
  const [carrier, setCarrier] = useState<Carrier>('gls');
  const [address, setAddress] = useState<ShippingAddress>({
    name: user?.name ?? '',
    phone: '',
    zip: '',
    city: '',
    street: '',
  });

  if (cart.items.length === 0 && !createOrder.isPending && !createOrder.isSuccess) {
    return <Navigate to="/cart" replace />;
  }

  const selected = deliveryOptions.data?.find((option) => option.carrier === carrier);
  const shippingFee = selected?.fee ?? 0;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const result = await createOrder.mutateAsync({
      carrier,
      shippingAddress: address,
      lines: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    });
    cart.clear();
    window.location.assign(result.checkoutUrl);
  }

  return (
    <div>
      <PageTitle>Checkout</PageTitle>
      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card className="space-y-4 p-4">
            <h2 className="font-semibold">Shipping address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {ADDRESS_FIELDS.map((field) => (
                <div key={field.key} className={clsx(field.key === 'street' && 'sm:col-span-2')}>
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <Input
                    id={field.key}
                    required
                    autoComplete={field.autoComplete}
                    value={address[field.key]}
                    onChange={(e) => setAddress({ ...address, [field.key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-3 p-4">
            <h2 className="font-semibold">Delivery</h2>
            <ErrorMessage error={deliveryOptions.error} />
            {deliveryOptions.data?.map((option) => (
              <label
                key={option.carrier}
                className={clsx(
                  'flex cursor-pointer items-center gap-3 rounded-md border p-3',
                  carrier === option.carrier ? 'border-brand-600 bg-brand-50' : 'border-slate-200',
                )}
              >
                <input
                  type="radio"
                  name="carrier"
                  value={option.carrier}
                  checked={carrier === option.carrier}
                  onChange={() => setCarrier(option.carrier)}
                />
                <div className="flex-1">
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-slate-500">
                    {option.minDays}–{option.maxDays} working days · arrives by{' '}
                    {formatDate(option.estimatedDelivery)}
                  </p>
                </div>
                <span className="font-medium">{formatPrice(option.fee)}</span>
              </label>
            ))}
          </Card>
        </div>

        <Card className="h-fit space-y-3 p-4">
          <h2 className="font-semibold">Order summary</h2>
          <ul className="space-y-1 text-sm">
            {cart.items.map((item) => (
              <li key={item.productId} className="flex justify-between gap-2">
                <span>
                  {item.quantity} × {item.name}
                </span>
                <span>{formatPrice(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-1 border-t border-slate-100 pt-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{formatPrice(shippingFee)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatPrice(cart.subtotal + shippingFee)}</span>
            </div>
          </div>
          <ErrorMessage error={createOrder.error} />
          <Button type="submit" className="w-full" disabled={createOrder.isPending || !selected}>
            {createOrder.isPending ? 'Placing order…' : `Pay ${formatPrice(cart.subtotal + shippingFee)}`}
          </Button>
        </Card>
      </form>
    </div>
  );
}
