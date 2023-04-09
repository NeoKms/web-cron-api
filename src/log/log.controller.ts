import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  HttpCode,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Rights } from '../auth/passport/rights.decorator';
import ResponseSshDto from '../ssh/dto/response-ssh.dto';
import ResponseLogDto from './dto/response-log.dto';
import { JobsService } from '../jobs/jobs.service';
import { LogService } from './log.service';
import { plainToInstance } from 'class-transformer';
import { MESSAGE_OK } from '../helpers/constants';
import { MWRDto } from '../helpers/interfaces/common';
import FilterLogDto from './dto/filter.log.dto';

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
  constructor(private readonly logService: LogService) {
    //none
  }

  @Rights({
    entity: 'logs',
    level: 'read',
  })
  @HttpCode(200)
  @ApiResponse({ type: ResponseLogDto, isArray: true })
  @Post('')
  public async list(
    @Body() params: FilterLogDto,
  ): Promise<MWRDto<ResponseLogDto[]>> {
    const result = plainToInstance(
      ResponseLogDto,
      await this.logService.list(params),
    );
    return { ...MESSAGE_OK, result };
  }
}
