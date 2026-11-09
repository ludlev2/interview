import { useMemo, useState } from 'react';
import { Button, Card, ErrorMessage, Input, PageTitle } from '@/components/ui';
import { useAdminProducts, useUpdateProduct } from '@/hooks/queries';
import type { Product } from '@/lib/types';

export function AdminProductsPage() {
  const products = useAdminProducts();
  const [filter, setFilter] = useState('');

  const visible = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return products.data ?? [];
    return (products.data ?? []).filter(
      (p) => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term),
    );
  }, [products.data, filter]);

  return (
    <div>
      <PageTitle>Products</PageTitle>
      <Input
        type="search"
        placeholder="Filter by name or SKU"
        aria-label="Filter products"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-4 max-w-xs"
      />
      <ErrorMessage error={products.error} />
      {products.isPending ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-slate-500">
              <tr>
                <th className="p-3 font-medium">SKU</th>
                <th className="p-3 font-medium">Product</th>
                <th className="p-3 font-medium">Category</th>
                <th className="p-3 text-right font-medium">Stock</th>
                <th className="p-3 font-medium">Batches</th>
                <th className="p-3 font-medium">Price (HUF)</th>
                <th className="p-3 font-medium">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((product) => (
                <ProductRow key={`${product.id}:${product.listPrice}`} product={product} />
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function ProductRow({ product }: { product: Product }) {
  const update = useUpdateProduct();
  const [price, setPrice] = useState(String(product.listPrice));
  const parsed = Number(price);
  const dirty = parsed !== product.listPrice;
  const nextBestBefore = product.batches
    .map((batch) => batch.bestBefore)
    .sort()[0];

  return (
    <tr data-testid={`product-row-${product.sku}`}>
      <td className="p-3 font-mono text-xs">{product.sku}</td>
      <td className="p-3">
        {product.name} <span className="text-slate-500">{product.unitLabel}</span>
      </td>
      <td className="p-3">{product.category.name}</td>
      <td className="p-3 text-right tabular-nums">{product.stock}</td>
      <td className="p-3 text-slate-600">
        {product.batches.length}
        {nextBestBefore && <span className="text-slate-400"> · next BB {nextBestBefore}</span>}
      </td>
      <td className="p-3">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            update.mutate({ id: product.id, listPrice: parsed });
          }}
        >
          <Input
            aria-label={`Price for ${product.sku}`}
            type="number"
            min={1}
            step="any"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-28"
          />
          <Button type="submit" variant="secondary" disabled={!dirty || update.isPending}>
            Save
          </Button>
        </form>
        {update.error && <ErrorMessage error={update.error} />}
      </td>
      <td className="p-3">
        <input
          type="checkbox"
          aria-label={`Active ${product.sku}`}
          checked={product.active}
          disabled={update.isPending}
          onChange={(e) => update.mutate({ id: product.id, active: e.target.checked })}
        />
      </td>
    </tr>
  );
}
