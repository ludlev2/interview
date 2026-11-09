import { Module } from '@nestjs/common';
import { FakePspController } from './fake-psp.controller';
import { FakePspService } from './fake-psp.service';

@Module({
  controllers: [FakePspController],
  providers: [FakePspService],
})
export class FakePspModule {}
