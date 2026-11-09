import type {
  Category,
  CreateOrderRequest,
  DeliveryOption,
  FulfilmentTask,
  Order,
  PaymentIntent,
  Product,
  StockImportSummary,
  User,
} from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3101';
const TOKEN_KEY = 'munch-market.token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set('content-type', 'application/json');
  const token = tokenStore.get();
  if (token) headers.set('authorization', `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  const body = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const message = Array.isArray(body?.message)
      ? body.message.join(', ')
      : (body?.message ?? res.statusText);
    throw new ApiError(message, res.status);
  }
  return body as T;
}

const post = <T>(path: string, body?: unknown) =>
  request<T>(path, {
    method: 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
  });

export const api = {
  login: (email: string, password: string) =>
    post<{ accessToken: string; user: User }>('/auth/login', { email, password }),
  me: () => request<User>('/auth/me'),

  categories: () => request<Category[]>('/categories'),
  products: (params: { search?: string; category?: string }) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.category) query.set('category', params.category);
    const qs = query.toString();
    return request<Product[]>(`/products${qs ? `?${qs}` : ''}`);
  },
  product: (id: string) => request<Product>(`/products/${id}`),

  deliveryOptions: () => request<DeliveryOption[]>('/orders/delivery-options'),
  createOrder: (body: CreateOrderRequest) =>
    post<{ order: Order; checkoutUrl: string }>('/orders', body),
  orders: () => request<Order[]>('/orders'),
  order: (id: string) => request<Order>(`/orders/${id}`),

  fulfilmentTasks: () => request<FulfilmentTask[]>('/fulfilment/tasks'),
  markTask: (id: string, status: 'picked' | 'shipped') =>
    post<FulfilmentTask>(`/fulfilment/tasks/${id}/${status}`),

  adminProducts: () => request<Product[]>('/admin/products'),
  updateProduct: (id: string, body: { listPrice?: number; active?: boolean }) =>
    request<Product>(`/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  importStock: (csv: string) =>
    post<StockImportSummary>('/admin/stock-imports', { csv }),

  paymentIntent: (id: string) => request<PaymentIntent>(`/fake-psp/intents/${id}`),
  confirmPayment: (id: string) =>
    post<{ redirectUrl: string }>(`/fake-psp/intents/${id}/confirm`),
  declinePayment: (id: string) =>
    post<{ redirectUrl: string }>(`/fake-psp/intents/${id}/decline`),
};
