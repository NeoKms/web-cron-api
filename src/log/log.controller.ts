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
import { LogService } from './log.service';
import { plainToInstance } from 'class-transformer';
import { MESSAGE_OK } from '../helpers/constants';
import { MWRDto } from '../helpers/interfaces/common';
import FilterLogDto from './dto/filter.log.dto';
import { ResponseLogPaginateDto } from './dto/response-log-paginate.dto';
import { UserProfile } from '../helpers/decorators/user.decorator';
import { ResponseUserDto } from '../user/dto/response-user.dto';

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
    @UserProfile() user: ResponseUserDto,
  ): Promise<MWRDto<ResponseLogPaginateDto>> {
    const result = plainToInstance(
      ResponseLogPaginateDto,
      await this.logService.list(params, user),
    );
    return { ...MESSAGE_OK, result };
  }

  @Rights({
    entity: 'logs',
    level: 'read',
  })
  @HttpCode(200)
  @ApiResponse({ type: ResponseLogPaginateDto })
  @Post('/:sshId')
  public async listBySrv(
    @Body() params: FilterLogDto,
    @Param('sshId') sshId: string,
    @UserProfile() user: ResponseUserDto,
  ): Promise<MWRDto<ResponseLogPaginateDto>> {
    if (!params.filter) params.filter = {};
    params.filter.sshId = +sshId;
    const result = plainToInstance(
      ResponseLogPaginateDto,
      await this.logService.list(params, user),
    );
    return { ...MESSAGE_OK, result };
  }

  @Rights({
    entity: 'logs',
    level: 'read',
  })
  @HttpCode(200)
  @ApiResponse({ type: ResponseLogPaginateDto })
  @Post('/:sshId/:jobId')
  public async listBySrvAndJob(
    @Body() params: FilterLogDto,
    @Param('jobId') jobId: string,
    @Param('sshId') sshId: string,
    @UserProfile() user: ResponseUserDto,
  ): Promise<MWRDto<ResponseLogPaginateDto>> {
    if (!params.filter) params.filter = {};
    params.filter.jobId = +jobId;
    params.filter.sshId = +sshId;
    const result = plainToInstance(
      ResponseLogPaginateDto,
      await this.logService.list(params, user),
    );
    return { ...MESSAGE_OK, result };
  }
}
