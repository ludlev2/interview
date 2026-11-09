import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from '../orders/order.entity';

export type FulfilmentTaskStatus = 'open' | 'picked' | 'shipped';

@Entity('fulfilment_task')
export class FulfilmentTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({
    type: 'enum',
    enum: ['open', 'picked', 'shipped'],
    enumName: 'fulfilment_task_status',
    default: 'open',
  })
  status: FulfilmentTaskStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
