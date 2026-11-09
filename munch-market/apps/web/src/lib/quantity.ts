import type { Product } from './types';

export function packLabel(product: Product): string | null {
  if (product.orderIncrement > 1) {
    return `Sold in packs of ${product.orderIncrement}`;
  }
  if (product.minimumOrderableUnit > 1) {
    return `Minimum order ${product.minimumOrderableUnit}`;
  }
  return null;
}
