import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FulfilmentTask } from '../fulfilment/fulfilment-task.entity';
import { Order } from '../orders/order.entity';
import { PspWebhookEvent } from './psp-event';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(FulfilmentTask)
    private readonly tasks: Repository<FulfilmentTask>,
  ) {}

  async handleEvent(event: PspWebhookEvent) {
    switch (event.type) {
      case 'payment.succeeded': {
        const order = await this.findOrder(event);
        order.status = 'paid';
        await this.orders.save(order);
        await this.tasks.save(
          this.tasks.create({ orderId: order.id, status: 'open' }),
        );
        this.logger.log(`Order ${order.id} paid`);
        break;
      }
      case 'refund.succeeded': {
        const order = await this.findOrder(event);
        order.status = 'cancelled';
        await this.orders.save(order);
        this.logger.log(`Order ${order.id} refunded`);
        break;
      }
      default:
        this.logger.log(`Ignoring ${event.type} for ${event.data.paymentIntentId}`);
    }
  }

  private async findOrder(event: PspWebhookEvent) {
    const order = await this.orders.findOneBy({
      paymentIntentId: event.data.paymentIntentId,
    });
    if (!order) {
      throw new NotFoundException(
        `No order for payment intent ${event.data.paymentIntentId}`,
      );
    }
    return order;
  }
}
