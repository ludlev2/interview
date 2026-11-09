import { ORDER_STATUS_LABELS } from '@/lib/format';
import type { OrderStatus } from '@/lib/types';
import { Badge } from './ui';

const TONES = {
  pending_payment: 'amber',
  paid: 'blue',
  picking: 'blue',
  shipped: 'green',
  cancelled: 'red',
} as const satisfies Record<OrderStatus, string>;

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={TONES[status]}>{ORDER_STATUS_LABELS[status]}</Badge>;
}
