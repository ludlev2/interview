import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PspClient } from '../payments/psp.client';
import { Product } from '../products/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderLine } from './order-line.entity';
import { Order } from './order.entity';
import { OrdersService } from './orders.service';

const address = {
  name: 'Anna Kovács',
  phone: '+36 30 123 4567',
  zip: '1052',
  city: 'Budapest',
  street: 'Váci utca 12.',
};

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: '7b0f3c9e-3f1c-4d7e-9a43-1b2f0b7a4c11',
    sku: 'SNK-001',
    name: 'Chio Chips Paprikás',
    listPrice: 899,
    stock: 10,
    active: true,
    ...overrides,
  } as Product;
}

describe('OrdersService', () => {
  let service: OrdersService;
  const products = { findOneBy: jest.fn(), save: jest.fn() };
  const orders = {
    create: jest.fn((data: Partial<Order>) => data),
    save: jest.fn(async (order: Partial<Order>) => ({ id: 'order-1', ...order })),
    find: jest.fn(),
    findOne: jest.fn(),
  };
  const orderLines = {
    create: jest.fn((data: Partial<OrderLine>) => data),
    save: jest.fn(async (lines: Partial<OrderLine>[]) => lines),
  };
  const psp = {
    createIntent: jest.fn(async () => ({
      id: 'pi_test',
      status: 'requires_payment',
      checkoutUrl: 'http://localhost:5181/fake-checkout/pi_test',
    })),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Product), useValue: products },
        { provide: getRepositoryToken(Order), useValue: orders },
        { provide: getRepositoryToken(OrderLine), useValue: orderLines },
        { provide: PspClient, useValue: psp },
      ],
    }).compile();
    service = moduleRef.get(OrdersService);
  });

  const dto = (quantity: number): CreateOrderDto => ({
    lines: [{ productId: product().id, quantity, unitPrice: 899 }],
    carrier: 'gls',
    shippingAddress: address,
  });

  it('decrements stock for each ordered line', async () => {
    const p = product({ stock: 10 });
    products.findOneBy.mockResolvedValue(p);

    await service.create('customer-1', dto(3));

    expect(products.save).toHaveBeenCalledWith(expect.objectContaining({ stock: 7 }));
  });

  it('rejects an order when there is not enough stock', async () => {
    products.findOneBy.mockResolvedValue(product({ stock: 2 }));

    await expect(service.create('customer-1', dto(3))).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(products.save).not.toHaveBeenCalled();
  });

  it('calculates totals including the carrier fee', async () => {
    products.findOneBy.mockResolvedValue(product());

    const { order } = await service.create('customer-1', dto(2));

    expect(order.subtotal).toBe(1798);
    expect(order.shippingFee).toBe(1990);
    expect(order.total).toBe(3788);
  });

  it('creates a payment intent and returns the checkout url', async () => {
    products.findOneBy.mockResolvedValue(product());

    const result = await service.create('customer-1', dto(1));

    expect(psp.createIntent).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 2889, currency: 'HUF' }),
    );
    expect(result.order.paymentIntentId).toBe('pi_test');
    expect(result.checkoutUrl).toContain('/fake-checkout/pi_test');
  });
});
