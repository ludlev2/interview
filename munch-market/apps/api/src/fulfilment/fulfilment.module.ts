import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/order.entity';
import { FulfilmentTask } from './fulfilment-task.entity';
import { FulfilmentController } from './fulfilment.controller';
import { FulfilmentService } from './fulfilment.service';

@Module({
  imports: [TypeOrmModule.forFeature([FulfilmentTask, Order])],
  controllers: [FulfilmentController],
  providers: [FulfilmentService],
})
export class FulfilmentModule {}
