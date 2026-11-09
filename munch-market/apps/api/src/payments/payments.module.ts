import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FulfilmentTask } from '../fulfilment/fulfilment-task.entity';
import { Order } from '../orders/order.entity';
import { PaymentsService } from './payments.service';
import { PspClient } from './psp.client';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, FulfilmentTask])],
  controllers: [WebhooksController],
  providers: [PaymentsService, PspClient],
  exports: [PspClient],
})
export class PaymentsModule {}
