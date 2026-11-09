import { Link } from 'react-router';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/lib/types';
import { Badge, Card } from './ui';

export function ProductCard({ product }: { product: Product }) {
  const inStock = product.stock > 0;
  return (
    <Link to={`/products/${product.id}`} className="group">
      <Card className="flex h-full flex-col overflow-hidden transition-shadow group-hover:shadow-md">
        <img src={product.imageUrl} alt="" className="aspect-[5/4] w-full object-cover" />
        <div className="flex flex-1 flex-col gap-1 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">{product.brand}</p>
          <h3 className="line-clamp-2 text-sm font-medium">{product.name}</h3>
          <p className="text-xs text-slate-500">{product.unitLabel}</p>
          <div className="mt-auto flex items-center justify-between pt-2">
            <span className="font-semibold">{formatPrice(product.listPrice)}</span>
            <Badge tone={inStock ? 'green' : 'red'}>{inStock ? 'In stock' : 'Out of stock'}</Badge>
          </div>
        </div>
      </Card>
    </Link>
  );
}
