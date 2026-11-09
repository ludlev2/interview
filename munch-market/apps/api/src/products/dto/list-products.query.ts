import { IsOptional, IsString } from 'class-validator';

export class ListProductsQuery {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
