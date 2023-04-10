import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  Param,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Rights } from '../auth/passport/rights.decorator';
import ResponseLogDto from './dto/response-log.dto';
import { LogService } from './log.service';
import { plainToInstance } from 'class-transformer';
import { MESSAGE_OK } from '../helpers/constants';
import { MWRDto } from '../helpers/interfaces/common';
import FilterLogDto from './dto/filter.log.dto';
import { ResponseLogPaginateDto } from './dto/response-log-paginate.dto';

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

  @Rights({
    entity: 'logs',
    level: 'read',
  })
  @HttpCode(200)
  @ApiResponse({ type: ResponseLogPaginateDto })
  @Post('')
  public async list(
    @Body() params: FilterLogDto,
  ): Promise<MWRDto<ResponseLogPaginateDto>> {
    const result = plainToInstance(
      ResponseLogPaginateDto,
      await this.logService.list(params),
    );
    return { ...MESSAGE_OK, result };
  }

  @Rights({
    entity: 'logs',
    level: 'read',
  })
  @HttpCode(200)
  @ApiResponse({ type: ResponseLogPaginateDto })
  @Post('/:srv')
  public async listBySrv(
    @Body() params: FilterLogDto,
    @Param('srv') srv: string,
  ): Promise<MWRDto<ResponseLogPaginateDto>> {
    params.whereRaw = { jobEntity: { sshEntityId: +srv } };
    const result = plainToInstance(
      ResponseLogPaginateDto,
      await this.logService.list(params),
    );
    return { ...MESSAGE_OK, result };
  }

  @Rights({
    entity: 'logs',
    level: 'read',
  })
  @HttpCode(200)
  @ApiResponse({ type: ResponseLogPaginateDto })
  @Post('/:srv/:job')
  public async listBySrvAndJob(
    @Body() params: FilterLogDto,
    @Param('job') job: string,
  ): Promise<MWRDto<ResponseLogPaginateDto>> {
    params.whereRaw = { jobEntityId: +job };
    const result = plainToInstance(
      ResponseLogPaginateDto,
      await this.logService.list(params),
    );
    return { ...MESSAGE_OK, result };
  }
}
