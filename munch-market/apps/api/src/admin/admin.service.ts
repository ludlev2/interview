import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { StockBatch } from '../products/stock-batch.entity';
import { UpdateProductDto } from './dto/admin.dto';
import { parseStockCsv } from './stock-csv';

export interface StockImportSummary {
  rows: number;
  unitsAdded: number;
  products: string[];
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(StockBatch)
    private readonly batches: Repository<StockBatch>,
  ) {}

  listProducts() {
    return this.products.find({
      relations: { category: true, batches: true },
      order: { name: 'ASC' },
    });
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const product = await this.products.findOneBy({ id });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    Object.assign(product, dto);
    return this.products.save(product);
  }

  async importStock(csv: string): Promise<StockImportSummary> {
    const rows = parseStockCsv(csv);
    const touched = new Set<string>();
    let unitsAdded = 0;

    for (const row of rows) {
      const product = await this.products.findOneBy({ sku: row.sku });
      if (!product) {
        throw new BadRequestException(`Line ${row.line}: unknown SKU ${row.sku}`);
      }
      await this.batches.save(
        this.batches.create({
          productId: product.id,
          batchCode: row.batchCode,
          bestBefore: row.bestBefore,
          quantity: row.quantity,
        }),
      );
      product.stock += row.quantity;
      await this.products.save(product);
      unitsAdded += row.quantity;
      touched.add(product.sku);
    }

    return { rows: rows.length, unitsAdded, products: [...touched] };
  }
}
