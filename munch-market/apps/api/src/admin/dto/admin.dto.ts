import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class StockImportDto {
  @IsString()
  @IsNotEmpty()
  csv: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  listPrice?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
