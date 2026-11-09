import {
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateIntentDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsIn(['HUF'])
  currency: 'HUF';

  @IsObject()
  metadata: Record<string, string>;

  @IsUrl({ require_tld: false })
  returnUrl: string;
}

export class CreateRefundDto {
  @IsString()
  paymentIntentId: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;
}
