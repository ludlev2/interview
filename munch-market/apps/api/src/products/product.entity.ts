import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { numericTransformer } from '../common/numeric.transformer';
import { Category } from './category.entity';
import { StockBatch } from './stock-batch.entity';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  sku: string;

  @Column()
  name: string;

  @Column()
  brand: string;

  @Column({ name: 'category_id' })
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'image_url' })
  imageUrl: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({
    name: 'list_price',
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: numericTransformer,
  })
  listPrice: number;

  @Column({ name: 'unit_label' })
  unitLabel: string;

  @Column({ name: 'minimum_orderable_unit', type: 'int', default: 1 })
  minimumOrderableUnit: number;

  @Column({ name: 'order_increment', type: 'int', default: 1 })
  orderIncrement: number;

  @Column({ name: 'is_age_restricted', default: false })
  isAgeRestricted: boolean;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => StockBatch, (batch) => batch.product)
  batches: StockBatch[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
