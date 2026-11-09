import { Link } from 'react-router';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { Card, ErrorMessage, PageTitle } from '@/components/ui';
import { useOrders } from '@/hooks/queries';
import { CARRIER_LABELS, formatDate, formatPrice, shortId } from '@/lib/format';

export function OrdersPage() {
  const orders = useOrders();

  return (
    <div>
      <PageTitle>My orders</PageTitle>
      <ErrorMessage error={orders.error} />
      {orders.isPending ? (
        <p className="text-slate-500">Loading…</p>
      ) : orders.data?.length === 0 ? (
        <p className="text-slate-500">You have not placed any orders yet.</p>
      ) : (
        <Card className="divide-y divide-slate-100">
          {orders.data?.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="flex items-center gap-4 p-4 hover:bg-slate-50"
            >
              <div className="flex-1">
                <p className="font-medium">Order #{shortId(order.id)}</p>
                <p className="text-sm text-slate-500">
                  {formatDate(order.createdAt)} · {CARRIER_LABELS[order.carrier]}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
              <span className="w-28 text-right font-medium">{formatPrice(order.total)}</span>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
