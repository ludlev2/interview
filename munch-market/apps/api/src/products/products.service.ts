import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { ListProductsQuery } from './dto/list-products.query';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  listCategories() {
    return this.categories.find({ order: { name: 'ASC' } });
  }

  list(query: ListProductsQuery) {
    const qb = this.products
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.batches', 'batch')
      .where('product.active = true')
      .orderBy('product.name', 'ASC');

    if (query.search) {
      qb.andWhere('(product.name ILIKE :term OR product.brand ILIKE :term)', {
        term: `%${query.search}%`,
      });
    }
    if (query.category) {
      qb.andWhere('category.slug = :slug', { slug: query.category });
    }
    return qb.getMany();
  }

  async get(id: string) {
    const product = await this.products.findOne({
      where: { id, active: true },
      relations: { category: true, batches: true },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }
}
