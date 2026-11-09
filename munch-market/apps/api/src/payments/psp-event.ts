export interface PspWebhookEvent {
  id: string;
  type: string;
  created: string;
  data: {
    paymentIntentId: string;
    amount: number;
    currency: string;
    metadata: Record<string, string>;
    refundId?: string;
  };
}
