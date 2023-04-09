import { ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SshService } from './ssh.service';
import { Rights } from '../auth/passport/rights.decorator';
import { DefaultMessageDto, MWRDto } from '../helpers/interfaces/common';
import { MESSAGE_OK } from '../helpers/constants';
import ResponseSshDto from './dto/response-ssh.dto';
import CreateSshDto from './dto/create-ssh.dto';
import { UserProfile } from '../helpers/decorators/user.decorator';
import { ResponseUserDto } from '../user/dto/response-user.dto';
import { FormDataRequest } from 'nestjs-form-data';
import UpdateSshDto from './dto/update-ssh.dto';
import { plainToInstance } from 'class-transformer';

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
export class SshController {
  constructor(private readonly sshService: SshService) {}

  @Rights({
    entity: 'ssh',
    level: 'read',
  })
  @ApiResponse({ type: ResponseSshDto, isArray: true })
  @Get()
  async getAll(): Promise<MWRDto<ResponseSshDto[]>> {
    const result = plainToInstance(
      ResponseSshDto,
      await this.sshService.getMany(),
    );
    return { ...MESSAGE_OK, result };
  }

  @Rights({
    entity: 'ssh',
    level: 'read',
  })
  @ApiResponse({ type: ResponseSshDto })
  @Get('/:id')
  async getById(@Param('id') id: string): Promise<MWRDto<ResponseSshDto>> {
    const result = plainToInstance(
      ResponseSshDto,
      await this.sshService.getById(+id),
    );
    return { ...MESSAGE_OK, result };
  }

  @Rights({
    entity: 'ssh',
    level: 'write',
  })
  @FormDataRequest()
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ type: ResponseSshDto })
  @Post()
  async create(
    @Body() createSshDto: CreateSshDto,
    @UploadedFiles() file,
    @UserProfile() user: ResponseUserDto,
  ): Promise<MWRDto<ResponseSshDto>> {
    const result = plainToInstance(
      ResponseSshDto,
      await this.sshService.create(createSshDto, user),
    );
    return { ...MESSAGE_OK, result };
  }

  @Rights({
    entity: 'ssh',
    level: 'write',
  })
  @ApiResponse({ type: ResponseSshDto })
  @Patch('/:id')
  async update(
    @Body() updateSshDto: UpdateSshDto,
    @Param('id') id: string,
  ): Promise<MWRDto<ResponseSshDto>> {
    const result = plainToInstance(
      ResponseSshDto,
      await this.sshService.update(+id, updateSshDto),
    );
    return { ...MESSAGE_OK, result };
  }

  @Rights({
    entity: 'ssh',
    level: 'write',
  })
  @ApiResponse({ type: ResponseSshDto })
  @Delete('/:id')
  async delete(@Param('id') id: string): Promise<DefaultMessageDto> {
    await this.sshService.delete(+id);
    return MESSAGE_OK;
  }
}
