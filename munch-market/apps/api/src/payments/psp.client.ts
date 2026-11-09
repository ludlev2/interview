import { BadGatewayException, Injectable } from '@nestjs/common';
import { config } from '../config';

export interface CreatePaymentIntent {
  amount: number;
  currency: 'HUF';
  metadata: Record<string, string>;
  returnUrl: string;
}

export interface PaymentIntent {
  id: string;
  status: string;
  checkoutUrl: string;
}

@Injectable()
export class PspClient {
  private readonly baseUrl = `${config.apiUrl}/fake-psp`;

  async createIntent(input: CreatePaymentIntent): Promise<PaymentIntent> {
    const res = await fetch(`${this.baseUrl}/intents`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      throw new BadGatewayException(
        `Payment provider error (${res.status}): ${await res.text()}`,
      );
    }
    return (await res.json()) as PaymentIntent;
  }
}
