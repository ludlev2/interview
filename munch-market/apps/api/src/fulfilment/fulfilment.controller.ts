import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { FulfilmentService } from './fulfilment.service';

@Controller('fulfilment/tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('staff', 'admin')
export class FulfilmentController {
  constructor(private readonly fulfilment: FulfilmentService) {}

  @Get()
  list() {
    return this.fulfilment.listOpen();
  }

  @Post(':id/picked')
  @HttpCode(200)
  picked(@Param('id', ParseUUIDPipe) id: string) {
    return this.fulfilment.advance(id, 'picked');
  }

  @Post(':id/shipped')
  @HttpCode(200)
  shipped(@Param('id', ParseUUIDPipe) id: string) {
    return this.fulfilment.advance(id, 'shipped');
  }
}
