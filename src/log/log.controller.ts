import { ApiTags } from '@nestjs/swagger';
import {
  ClassSerializerInterceptor,
  Controller,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LogService } from './log.service';

@ApiTags('log')
@Controller('log')
@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(
  new ValidationPipe({
    forbidUnknownValues: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class LogController {
  constructor(private readonly logService: LogService) {}
}
