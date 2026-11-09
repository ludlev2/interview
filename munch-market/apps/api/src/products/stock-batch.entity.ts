import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('stock_batch')
export class StockBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.batches)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'batch_code' })
  batchCode: string;

  @Column({ name: 'best_before', type: 'date' })
  bestBefore: string;

  @Column({ type: 'int' })
  quantity: number;

  @CreateDateColumn({ name: 'received_at', type: 'timestamptz' })
  receivedAt: Date;
}
