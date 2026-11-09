import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FulfilmentTask } from '../fulfilment/fulfilment-task.entity';
import { Order } from '../orders/order.entity';
import { PaymentsService } from './payments.service';
import { PspWebhookEvent } from './psp-event';

const event = (type: string): PspWebhookEvent => ({
  id: 'evt_1',
  type,
  created: '2026-11-01T10:00:00.000Z',
  data: {
    paymentIntentId: 'pi_1',
    amount: 2889,
    currency: 'HUF',
    metadata: { orderId: 'order-1' },
  },
});

describe('PaymentsService', () => {
  let service: PaymentsService;
  const orders = { findOneBy: jest.fn(), save: jest.fn() };
  const tasks = {
    create: jest.fn((data: Partial<FulfilmentTask>) => data),
    save: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(Order), useValue: orders },
        { provide: getRepositoryToken(FulfilmentTask), useValue: tasks },
      ],
    }).compile();
    service = moduleRef.get(PaymentsService);
  });

  it('marks the order paid and opens a fulfilment task', async () => {
    orders.findOneBy.mockResolvedValue({ id: 'order-1', status: 'pending_payment' });

    await service.handleEvent(event('payment.succeeded'));

    expect(orders.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'paid' }));
    expect(tasks.save).toHaveBeenCalledWith({ orderId: 'order-1', status: 'open' });
  });

  it('cancels the order when a refund succeeds', async () => {
    orders.findOneBy.mockResolvedValue({ id: 'order-1', status: 'paid' });

    await service.handleEvent(event('refund.succeeded'));

    expect(orders.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'cancelled' }));
  });

  it('ignores events it does not handle', async () => {
    await service.handleEvent(event('payment.failed'));

    expect(orders.findOneBy).not.toHaveBeenCalled();
  });
});
