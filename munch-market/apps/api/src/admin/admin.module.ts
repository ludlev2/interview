import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/product.entity';
import { StockBatch } from '../products/stock-batch.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, StockBatch])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
