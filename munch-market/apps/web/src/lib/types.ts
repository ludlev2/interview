export type UserRole = 'customer' | 'staff' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  minDaysOnArrival: number;
}

export interface StockBatch {
  id: string;
  batchCode: string;
  bestBefore: string;
  quantity: number;
  receivedAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  categoryId: number;
  category: Category;
  imageUrl: string;
  description: string;
  listPrice: number;
  unitLabel: string;
  minimumOrderableUnit: number;
  orderIncrement: number;
  isAgeRestricted: boolean;
  stock: number;
  active: boolean;
  batches: StockBatch[];
}

export type Carrier = 'gls' | 'posta';
export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'picking'
  | 'shipped'
  | 'cancelled';

export interface ShippingAddress {
  name: string;
  phone: string;
  zip: string;
  city: string;
  street: string;
}

export interface OrderLine {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  status: OrderStatus;
  carrier: Carrier;
  shippingAddress: ShippingAddress;
  subtotal: number;
  shippingFee: number;
  total: number;
  estimatedDelivery: string;
  paymentIntentId: string | null;
  createdAt: string;
  lines?: OrderLine[];
}

export interface DeliveryOption {
  carrier: Carrier;
  label: string;
  fee: number;
  minDays: number;
  maxDays: number;
  estimatedDelivery: string;
}

export interface CreateOrderRequest {
  lines: { productId: string; quantity: number; unitPrice: number }[];
  carrier: Carrier;
  shippingAddress: ShippingAddress;
}

export interface FulfilmentTask {
  id: string;
  orderId: string;
  status: 'open' | 'picked' | 'shipped';
  createdAt: string;
  order: Omit<Order, 'lines'> & { lines: (OrderLine & { product: Product })[] };
}

export interface StockImportSummary {
  rows: number;
  unitsAdded: number;
  products: string[];
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment' | 'succeeded' | 'failed';
  metadata: Record<string, string>;
  returnUrl: string;
}
