import { ApiTags } from '@nestjs/swagger';
import {
  ClassSerializerInterceptor,
  Controller,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

@ApiTags('ssh')
@Controller('ssh')
@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(
  new ValidationPipe({
    forbidUnknownValues: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class SshController {}
