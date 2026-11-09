import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac } from 'node:crypto';
import { config } from '../config';
import { PaymentsService } from './payments.service';
import type { PspWebhookEvent } from './psp-event';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('psp')
  @HttpCode(200)
  async psp(
    @Headers('x-psp-signature') signature: string | undefined,
    @Body() event: PspWebhookEvent,
  ) {
    if (signature) {
      const expected = createHmac('sha256', config.pspWebhookSecret)
        .update(JSON.stringify(event))
        .digest('hex');
      if (signature !== expected) {
        throw new UnauthorizedException('Invalid signature');
      }
    }
    await this.payments.handleEvent(event);
    return { received: true };
  }
}
