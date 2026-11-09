import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { config } from '../config';
import { PspClient } from '../payments/psp.client';
import { Product } from '../products/product.entity';
import { CARRIER_OPTIONS, estimateDelivery } from './delivery';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderLine } from './order-line.entity';
import { Order } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(OrderLine)
    private readonly orderLines: Repository<OrderLine>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
    private readonly psp: PspClient,
  ) {}

  deliveryOptions() {
    return Object.values(CARRIER_OPTIONS).map((option) => ({
      ...option,
      estimatedDelivery: estimateDelivery(option.carrier),
    }));
  }

  async create(customerId: string, dto: CreateOrderDto) {
    const lines: Partial<OrderLine>[] = [];
    let subtotal = 0;

    for (const item of dto.lines) {
      const product = await this.products.findOneBy({ id: item.productId });
      if (!product || !product.active) {
        throw new BadRequestException('Product is no longer available');
      }
      if (product.stock < item.quantity) {
        throw new ConflictException(`Not enough stock for ${product.name}`);
      }
      product.stock -= item.quantity;
      await this.products.save(product);

      subtotal += item.unitPrice * item.quantity;
      lines.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      });
    }

    const shippingFee = CARRIER_OPTIONS[dto.carrier].fee;
    const order = await this.orders.save(
      this.orders.create({
        customerId,
        status: 'pending_payment',
        carrier: dto.carrier,
        shippingAddress: dto.shippingAddress,
        subtotal,
        shippingFee,
        total: subtotal + shippingFee,
        estimatedDelivery: estimateDelivery(dto.carrier),
      }),
    );
    await this.orderLines.save(
      lines.map((line) => this.orderLines.create({ ...line, orderId: order.id })),
    );

    const intent = await this.psp.createIntent({
      amount: order.total,
      currency: 'HUF',
      metadata: { orderId: order.id },
      returnUrl: `${config.webUrl}/orders/${order.id}`,
    });
    order.paymentIntentId = intent.id;
    await this.orders.save(order);

    return { order, checkoutUrl: intent.checkoutUrl };
  }

  listForCustomer(customerId: string) {
    return this.orders.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  async get(id: string) {
    const order = await this.orders.findOne({
      where: { id },
      relations: { lines: { product: true } },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }
}
