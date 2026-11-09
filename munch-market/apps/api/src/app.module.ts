import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { databaseOptions } from './database';
import { FakePspModule } from './fake-psp/fake-psp.module';
import { FulfilmentModule } from './fulfilment/fulfilment.module';
import { HealthController } from './health.controller';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseOptions),
    AuthModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
    FulfilmentModule,
    AdminModule,
    FakePspModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
