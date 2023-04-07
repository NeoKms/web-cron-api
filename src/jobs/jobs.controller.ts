import {
  Controller,
  ClassSerializerInterceptor,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  Body,
  Post,
  Param,
  Get,
  Delete,
  Patch,
  HttpCode,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Rights } from '../auth/passport/rights.decorator';
import { MESSAGE_OK } from '../helpers/constants';
import FilterJobsDto from './dto/filter-jobs.dto';
import { DefaultMessageDto, MWRDto } from '../helpers/interfaces/common';
import ResponseJobDto from './dto/response-job.dto';
import { plainToInstance } from 'class-transformer';
import CreateJobDto from './dto/create-job.dto';

@ApiTags('jobs')
@Controller('jobs')
@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(
  new ValidationPipe({
    forbidUnknownValues: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Rights({
    entity: 'jobs',
    level: 'read',
  })
  @HttpCode(200)
  @ApiResponse({ type: ResponseJobDto, isArray: true })
  @Post('/list')
  async list(@Body() params: FilterJobsDto): Promise<MWRDto<ResponseJobDto[]>> {
    const result = plainToInstance(
      ResponseJobDto,
      await this.jobsService.list(params),
    );
    return { ...MESSAGE_OK, result };
  }

  @Rights({
    entity: 'jobs',
    level: 'write',
  })
  @ApiResponse({ type: ResponseJobDto })
  @Post('')
  async create(@Body() params: CreateJobDto): Promise<MWRDto<ResponseJobDto>> {
    const result = plainToInstance(
      ResponseJobDto,
      await this.jobsService.create(params),
    );
    return { ...MESSAGE_OK, result };
  }

  @Rights({
    entity: 'jobs',
    level: 'write',
  })
  @ApiResponse({ type: ResponseJobDto })
  @Patch('/:id')
  async update(
    @Body() params: Partial<CreateJobDto>,
    @Param('id') id: string,
  ): Promise<MWRDto<ResponseJobDto>> {
    const result = plainToInstance(
      ResponseJobDto,
      await this.jobsService.update(+id, params),
    );
    return { ...MESSAGE_OK, result };
  }

  @Rights({
    entity: 'jobs',
    level: 'write',
  })
  @Get('/:id/activate')
  async activate(@Param('id') id: string): Promise<DefaultMessageDto> {
    await this.jobsService.updateStatus(+id, 1);
    return MESSAGE_OK;
  }

  @Rights({
    entity: 'jobs',
    level: 'write',
  })
  @Get('/:id/deactivate')
  async deactivate(@Param('id') id: string): Promise<DefaultMessageDto> {
    await this.jobsService.updateStatus(+id, 0);
    return MESSAGE_OK;
  }

  @Rights({
    entity: 'jobs',
    level: 'write',
  })
  @Delete('/:id')
  async delete(@Param('id') id: string): Promise<DefaultMessageDto> {
    await this.jobsService.delete(+id);
    return MESSAGE_OK;
  }
}
