import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { useCart } from '@/cart/useCart';
import { QuantityStepper } from '@/components/QuantityStepper';
import { Badge, Button, ErrorMessage } from '@/components/ui';
import { useProduct } from '@/hooks/queries';
import { formatPrice } from '@/lib/format';
import { packLabel } from '@/lib/quantity';
import type { Product } from '@/lib/types';

export function ProductPage() {
  const { id = '' } = useParams();
  const product = useProduct(id);

  if (product.isPending) return <p className="text-slate-500">Loading…</p>;
  if (product.error) return <ErrorMessage error={product.error} />;
  return <ProductDetails key={product.data.id} product={product.data} />;
}

function ProductDetails({ product }: { product: Product }) {
  const { add } = useCart();
  const [quantity, setQuantity] = useState(product.minimumOrderableUnit);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [added, setAdded] = useState(false);
  const inStock = product.stock >= product.minimumOrderableUnit;
  const pack = packLabel(product);

  return (
    <div>
      <Link to="/" className="text-sm text-slate-500 hover:underline">
        ← Back to shop
      </Link>
      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <img
          src={product.imageUrl}
          alt=""
          className="w-full rounded-lg border border-slate-200 bg-white"
        />
        <div className="space-y-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">
              {product.brand} · {product.category.name}
            </p>
            <h1 className="text-2xl font-semibold">{product.name}</h1>
            <p className="text-slate-500">{product.unitLabel}</p>
          </div>
          <p className="text-3xl font-bold">{formatPrice(product.listPrice)}</p>
          <div className="flex flex-wrap gap-2">
            <Badge tone={inStock ? 'green' : 'red'}>{inStock ? 'In stock' : 'Out of stock'}</Badge>
            {pack && <Badge tone="blue">{pack}</Badge>}
            {product.isAgeRestricted && <Badge tone="amber">18+</Badge>}
          </div>
          <p className="text-slate-700">{product.description}</p>

          {inStock && (
            <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
              {product.isAgeRestricted && (
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={ageConfirmed}
                    onChange={(e) => setAgeConfirmed(e.target.checked)}
                  />
                  I confirm I am 18 or older. ID is checked on delivery.
                </label>
              )}
              <div className="flex items-center gap-4">
                <QuantityStepper
                  value={quantity}
                  min={product.minimumOrderableUnit}
                  step={product.orderIncrement}
                  max={product.stock}
                  onChange={setQuantity}
                />
                <Button
                  disabled={product.isAgeRestricted && !ageConfirmed}
                  onClick={() => {
                    add(product, quantity);
                    setAdded(true);
                  }}
                >
                  Add to cart
                </Button>
              </div>
              {added && (
                <p className="text-sm text-brand-700">
                  Added to your cart.{' '}
                  <Link to="/cart" className="font-medium underline">
                    View cart
                  </Link>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
