import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { OrderStatus } from '@/lib/types';

const ORDER_POLL_MS = 2000;
const PENDING: OrderStatus[] = ['pending_payment'];

export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: api.categories, staleTime: Infinity });

export const useProducts = (search: string, category: string) =>
  useQuery({
    queryKey: ['products', { search, category }],
    queryFn: () => api.products({ search, category }),
    placeholderData: (previous) => previous,
  });

export const useProduct = (id: string) =>
  useQuery({ queryKey: ['products', id], queryFn: () => api.product(id) });

export const useDeliveryOptions = () =>
  useQuery({ queryKey: ['delivery-options'], queryFn: api.deliveryOptions });

export const useOrders = () =>
  useQuery({ queryKey: ['orders'], queryFn: api.orders });

export const useOrder = (id: string) =>
  useQuery({
    queryKey: ['orders', id],
    queryFn: () => api.order(id),
    refetchInterval: (query) =>
      query.state.data && PENDING.includes(query.state.data.status)
        ? ORDER_POLL_MS
        : false,
  });

export const useCreateOrder = () => useMutation({ mutationFn: api.createOrder });

export const useFulfilmentTasks = () =>
  useQuery({
    queryKey: ['fulfilment-tasks'],
    queryFn: api.fulfilmentTasks,
    refetchInterval: 10_000,
  });

export const useMarkTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'picked' | 'shipped' }) =>
      api.markTask(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fulfilment-tasks'] }),
  });
};

export const useAdminProducts = () =>
  useQuery({ queryKey: ['admin-products'], queryFn: api.adminProducts });

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; listPrice?: number; active?: boolean }) =>
      api.updateProduct(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useImportStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.importStock,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const usePaymentIntent = (id: string) =>
  useQuery({ queryKey: ['payment-intent', id], queryFn: () => api.paymentIntent(id) });
