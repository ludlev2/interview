import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { createHmac, randomBytes } from 'node:crypto';
import { config } from '../config';
import { CreateIntentDto, CreateRefundDto } from './fake-psp.dto';

type IntentStatus = 'requires_payment' | 'succeeded' | 'failed';

interface Intent {
  id: string;
  amount: number;
  currency: string;
  status: IntentStatus;
  metadata: Record<string, string>;
  returnUrl: string;
  refunded: number;
  createdAt: string;
  lastEvent?: PspEvent;
}

export interface PspEvent {
  id: string;
  type: 'payment.succeeded' | 'payment.failed' | 'refund.succeeded';
  created: string;
  data: {
    paymentIntentId: string;
    amount: number;
    currency: string;
    metadata: Record<string, string>;
    refundId?: string;
  };
}

const WEBHOOK_DELAY_MS = 300;

/**
 * Stand-in for a hosted payment provider (think Stripe). Keeps its state in
 * memory and delivers signed webhooks to our own /webhooks/psp endpoint.
 */
@Injectable()
export class FakePspService {
  private readonly logger = new Logger('FakePsp');
  private readonly intents = new Map<string, Intent>();

  createIntent(dto: CreateIntentDto) {
    const intent: Intent = {
      id: `pi_${randomBytes(12).toString('hex')}`,
      amount: dto.amount,
      currency: dto.currency,
      status: 'requires_payment',
      metadata: dto.metadata,
      returnUrl: dto.returnUrl,
      refunded: 0,
      createdAt: new Date().toISOString(),
    };
    this.intents.set(intent.id, intent);
    return {
      id: intent.id,
      status: intent.status,
      checkoutUrl: `${config.webUrl}/fake-checkout/${intent.id}`,
    };
  }

  getIntent(id: string) {
    const { lastEvent: _lastEvent, ...intent } = this.find(id);
    return intent;
  }

  confirm(id: string) {
    const intent = this.find(id);
    if (intent.status !== 'requires_payment') {
      throw new ConflictException(`Payment intent is ${intent.status}`);
    }
    intent.status = 'succeeded';
    this.emit(intent, 'payment.succeeded', intent.amount);
    return { status: intent.status, redirectUrl: intent.returnUrl };
  }

  decline(id: string) {
    const intent = this.find(id);
    if (intent.status !== 'requires_payment') {
      throw new ConflictException(`Payment intent is ${intent.status}`);
    }
    intent.status = 'failed';
    this.emit(intent, 'payment.failed', intent.amount);
    return { status: intent.status, redirectUrl: intent.returnUrl };
  }

  refund(dto: CreateRefundDto) {
    const intent = this.find(dto.paymentIntentId);
    if (intent.status !== 'succeeded') {
      throw new BadRequestException('Only succeeded payments can be refunded');
    }
    const amount = dto.amount ?? intent.amount - intent.refunded;
    if (amount > intent.amount - intent.refunded) {
      throw new BadRequestException('Refund exceeds captured amount');
    }
    intent.refunded += amount;
    const refundId = `re_${randomBytes(12).toString('hex')}`;
    this.emit(intent, 'refund.succeeded', amount, refundId);
    return { id: refundId, amount, status: 'succeeded' };
  }

  resendWebhook(id: string) {
    const intent = this.find(id);
    if (!intent.lastEvent) {
      throw new NotFoundException('No webhook has been sent for this intent');
    }
    this.deliver(intent.lastEvent);
    return { resent: intent.lastEvent.id };
  }

  private find(id: string) {
    const intent = this.intents.get(id);
    if (!intent) {
      throw new NotFoundException('Payment intent not found');
    }
    return intent;
  }

  private emit(
    intent: Intent,
    type: PspEvent['type'],
    amount: number,
    refundId?: string,
  ) {
    const event: PspEvent = {
      id: `evt_${randomBytes(12).toString('hex')}`,
      type,
      created: new Date().toISOString(),
      data: {
        paymentIntentId: intent.id,
        amount,
        currency: intent.currency,
        metadata: intent.metadata,
        ...(refundId ? { refundId } : {}),
      },
    };
    intent.lastEvent = event;
    this.deliver(event);
  }

  private deliver(event: PspEvent) {
    const body = JSON.stringify(event);
    const signature = createHmac('sha256', config.pspWebhookSecret)
      .update(body)
      .digest('hex');
    setTimeout(() => {
      fetch(`${config.apiUrl}/webhooks/psp`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-psp-signature': signature,
        },
        body,
      })
        .then((res) =>
          this.logger.log(`Delivered ${event.type} ${event.id}: ${res.status}`),
        )
        .catch((err: Error) =>
          this.logger.warn(`Webhook ${event.id} failed: ${err.message}`),
        );
    }, WEBHOOK_DELAY_MS);
  }
}
