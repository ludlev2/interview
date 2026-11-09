import { Carrier } from './order.entity';

export interface CarrierOption {
  carrier: Carrier;
  label: string;
  fee: number;
  minDays: number;
  maxDays: number;
}

export const CARRIER_OPTIONS: Record<Carrier, CarrierOption> = {
  gls: {
    carrier: 'gls',
    label: 'GLS home delivery',
    fee: 1990,
    minDays: 1,
    maxDays: 2,
  },
  posta: {
    carrier: 'posta',
    label: 'Magyar Posta pickup point',
    fee: 990,
    minDays: 2,
    maxDays: 5,
  },
};

/** Latest expected delivery date (YYYY-MM-DD) for an order placed at `from`. */
export function estimateDelivery(carrier: Carrier, from = new Date()): string {
  const date = new Date(from);
  date.setDate(date.getDate() + CARRIER_OPTIONS[carrier].maxDays);
  return date.toISOString().slice(0, 10);
}
