import clsx from 'clsx';
import { useDeferredValue, useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { ErrorMessage, Input } from '@/components/ui';
import { useCategories, useProducts } from '@/hooks/queries';

export function CataloguePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const deferredSearch = useDeferredValue(search);
  const categories = useCategories();
  const products = useProducts(deferredSearch, category);

  return (
    <div>
      <section className="mb-8 rounded-xl bg-brand-600 px-6 py-8 text-white">
        <h1 className="text-3xl font-bold">Good food, better prices.</h1>
        <p className="mt-2 max-w-xl text-brand-100">
          Shelf-stable and short-dated groceries at a discount, shipped from our warehouse
          anywhere in Hungary.
        </p>
      </section>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          type="search"
          placeholder="Search products or brands"
          aria-label="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {[{ slug: '', name: 'All' }, ...(categories.data ?? [])].map((c) => (
            <button
              key={c.slug || 'all'}
              type="button"
              onClick={() => setCategory(c.slug)}
              className={clsx(
                'rounded-full border px-3 py-1 text-sm',
                category === c.slug
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400',
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <ErrorMessage error={products.error} />
      {products.isPending ? (
        <p className="text-slate-500">Loading products…</p>
      ) : products.data?.length === 0 ? (
        <p className="text-slate-500">No products match your search.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.data?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
