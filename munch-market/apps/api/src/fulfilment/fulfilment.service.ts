import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/order.entity';
import {
  FulfilmentTask,
  FulfilmentTaskStatus,
} from './fulfilment-task.entity';

const TRANSITIONS: Record<
  'picked' | 'shipped',
  { from: FulfilmentTaskStatus; orderStatus: OrderStatus }
> = {
  picked: { from: 'open', orderStatus: 'picking' },
  shipped: { from: 'picked', orderStatus: 'shipped' },
};

@Injectable()
export class FulfilmentService {
  constructor(
    @InjectRepository(FulfilmentTask)
    private readonly tasks: Repository<FulfilmentTask>,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
  ) {}

  listOpen() {
    return this.tasks.find({
      where: { status: In(['open', 'picked']) },
      relations: { order: { lines: { product: true } } },
      order: { createdAt: 'ASC' },
    });
  }

  async advance(id: string, to: 'picked' | 'shipped') {
    const task = await this.tasks.findOneBy({ id });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    const transition = TRANSITIONS[to];
    if (task.status !== transition.from) {
      throw new ConflictException(`Task is already ${task.status}`);
    }
    task.status = to;
    await this.tasks.save(task);
    await this.orders.update(task.orderId, { status: transition.orderStatus });
    return task;
  }
}
