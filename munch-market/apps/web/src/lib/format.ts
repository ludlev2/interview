import type { Carrier, OrderStatus } from './types';

const huf = new Intl.NumberFormat('hu-HU', {
  style: 'currency',
  currency: 'HUF',
  maximumFractionDigits: 0,
});

export const formatPrice = (amount: number) => huf.format(amount);

export const formatAmount = (amount: number) => `${amount.toFixed(2)} Ft`;

export const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Awaiting payment',
  paid: 'Paid',
  picking: 'Being packed',
  shipped: 'Shipped',
  cancelled: 'Cancelled',
};

export const CARRIER_LABELS: Record<Carrier, string> = {
  gls: 'GLS home delivery',
  posta: 'Magyar Posta pickup point',
};

export const shortId = (id: string) => id.slice(0, 8).toUpperCase();
