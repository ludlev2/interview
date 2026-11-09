import { DataSourceOptions } from 'typeorm';
import { config } from './config';
import { FulfilmentTask } from './fulfilment/fulfilment-task.entity';
import { OrderLine } from './orders/order-line.entity';
import { Order } from './orders/order.entity';
import { Category } from './products/category.entity';
import { Product } from './products/product.entity';
import { StockBatch } from './products/stock-batch.entity';
import { User } from './users/user.entity';

export const entities = [
  User,
  Category,
  Product,
  StockBatch,
  Order,
  OrderLine,
  FulfilmentTask,
];

export const databaseOptions: DataSourceOptions = {
  type: 'postgres',
  url: config.databaseUrl,
  entities,
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
};
