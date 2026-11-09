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
import { User } from '../users/user.entity';
import { OrderLine } from './order-line.entity';

export const ORDER_STATUSES = [
  'pending_payment',
  'paid',
  'picking',
  'shipped',
  'cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const CARRIERS = ['gls', 'posta'] as const;
export type Carrier = (typeof CARRIERS)[number];

export interface ShippingAddress {
  name: string;
  phone: string;
  zip: string;
  city: string;
  street: string;
}

@Entity('order')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column({
    type: 'enum',
    enum: ORDER_STATUSES,
    enumName: 'order_status',
    default: 'pending_payment',
  })
  status: OrderStatus;

  @Column({ type: 'enum', enum: CARRIERS, enumName: 'carrier' })
  carrier: Carrier;

  @Column({ name: 'shipping_address', type: 'jsonb' })
  shippingAddress: ShippingAddress;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: numericTransformer,
  })
  subtotal: number;

  @Column({
    name: 'shipping_fee',
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: numericTransformer,
  })
  shippingFee: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: numericTransformer,
  })
  total: number;

  @Column({ name: 'estimated_delivery', type: 'date' })
  estimatedDelivery: string;

  @Column({ name: 'payment_intent_id', type: 'varchar', nullable: true })
  paymentIntentId: string | null;

  @OneToMany(() => OrderLine, (line) => line.order)
  lines: OrderLine[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
