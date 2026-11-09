import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { CreateIntentDto, CreateRefundDto } from './fake-psp.dto';
import { FakePspService } from './fake-psp.service';

@Controller('fake-psp')
export class FakePspController {
  constructor(private readonly psp: FakePspService) {}

  @Post('intents')
  createIntent(@Body() dto: CreateIntentDto) {
    return this.psp.createIntent(dto);
  }

  @Get('intents/:id')
  getIntent(@Param('id') id: string) {
    return this.psp.getIntent(id);
  }

  @Post('intents/:id/confirm')
  @HttpCode(200)
  confirm(@Param('id') id: string) {
    return this.psp.confirm(id);
  }

  @Post('intents/:id/decline')
  @HttpCode(200)
  decline(@Param('id') id: string) {
    return this.psp.decline(id);
  }

  /** Dev only: real providers retry deliveries, this simulates one. */
  @Post('intents/:id/resend-webhook')
  @HttpCode(200)
  resendWebhook(@Param('id') id: string) {
    return this.psp.resendWebhook(id);
  }

  @Post('refunds')
  refund(@Body() dto: CreateRefundDto) {
    return this.psp.refund(dto);
  }
}
