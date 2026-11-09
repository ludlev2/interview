import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ name: 'min_days_on_arrival', type: 'int' })
  minDaysOnArrival: number;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
