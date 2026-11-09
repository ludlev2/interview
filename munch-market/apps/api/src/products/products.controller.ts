import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ListProductsQuery } from './dto/list-products.query';
import { ProductsService } from './products.service';

@Controller()
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get('categories')
  categories() {
    return this.products.listCategories();
  }

  @Get('products')
  list(@Query() query: ListProductsQuery) {
    return this.products.list(query);
  }

  @Get('products/:id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.products.get(id);
  }
}
