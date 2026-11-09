import { Link, useParams } from 'react-router';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { Card, ErrorMessage } from '@/components/ui';
import { useOrder } from '@/hooks/queries';
import { CARRIER_LABELS, formatAmount, formatDate, shortId } from '@/lib/format';

export function OrderPage() {
  const { id = '' } = useParams();
  const { data: order, error, isPending } = useOrder(id);

  if (isPending) return <p className="text-slate-500">Loading order…</p>;
  if (error) return <ErrorMessage error={error} />;

  const address = order.shippingAddress;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/orders" className="text-sm text-slate-500 hover:underline">
          ← My orders
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Order #{shortId(order.id)}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-sm text-slate-500">Placed {formatDate(order.createdAt)}</p>
      </div>

      {order.status === 'pending_payment' && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <span className="h-3 w-3 animate-pulse rounded-full bg-amber-500" />
          Waiting for payment confirmation…
        </div>
      )}
      {order.status === 'paid' && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-900">
          Thank you! Your payment was received and your order is being prepared.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <Card>
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 text-left text-slate-500">
              <tr>
                <th className="p-3 font-medium">Item</th>
                <th className="p-3 text-right font-medium">Qty</th>
                <th className="p-3 text-right font-medium">Price</th>
                <th className="p-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.lines?.map((line) => (
                <tr key={line.id}>
                  <td className="p-3">{line.product?.name ?? line.productId}</td>
                  <td className="p-3 text-right">{line.quantity}</td>
                  <td className="p-3 text-right">{formatAmount(line.unitPrice)}</td>
                  <td className="p-3 text-right">{formatAmount(line.unitPrice * line.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-slate-200">
              <tr>
                <td colSpan={3} className="p-3 text-right text-slate-500">Subtotal</td>
                <td className="p-3 text-right">{formatAmount(order.subtotal)}</td>
              </tr>
              <tr>
                <td colSpan={3} className="p-3 text-right text-slate-500">Shipping</td>
                <td className="p-3 text-right">{formatAmount(order.shippingFee)}</td>
              </tr>
              <tr className="font-semibold">
                <td colSpan={3} className="p-3 text-right">Total</td>
                <td className="p-3 text-right">{formatAmount(order.total)}</td>
              </tr>
            </tfoot>
          </table>
        </Card>
        <Card className="h-fit space-y-3 p-4 text-sm">
          <div>
            <p className="text-slate-500">Delivery</p>
            <p className="font-medium">{CARRIER_LABELS[order.carrier]}</p>
            <p>Estimated arrival {formatDate(order.estimatedDelivery)}</p>
          </div>
          <div>
            <p className="text-slate-500">Ship to</p>
            <p className="font-medium">{address.name}</p>
            <p>{address.street}</p>
            <p>
              {address.zip} {address.city}
            </p>
            <p>{address.phone}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
