import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ClassSerializerInterceptor,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseUserDto } from './dto/response-user.dto';
import { plainToInstance } from 'class-transformer';
import { Rights } from '../auth/passport/rights.decorator';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { DefaultMessageDto } from '../helpers/interfaces/common/defaultMessage.dto';
import { MWRDto } from '../helpers/interfaces/common/MWR.dto';
import { MESSAGE_OK } from '../helpers/constants';

@ApiTags('user')
@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(
  new ValidationPipe({
    forbidUnknownValues: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Rights({
    entity: 'users',
    level: 'write',
  })
  @ApiResponse({ type: ResponseUserDto })
  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<MWRDto<ResponseUserDto>> {
    const result = plainToInstance(
      ResponseUserDto,
      await this.userService.create(createUserDto),
    );
    return { ...MESSAGE_OK, result };
  }

  @Rights({
    entity: 'users',
    level: 'read',
  })
  @ApiResponse({ type: ResponseUserDto, isArray: true })
  @Get()
  async findAll(): Promise<MWRDto<ResponseUserDto[]>> {
    const userArr = await this.userService.findAll();
    const result = plainToInstance(ResponseUserDto, userArr);
    return { ...MESSAGE_OK, result };
  }

  @Rights({
    entity: 'users',
    level: 'read',
  })
  @ApiResponse({ type: ResponseUserDto })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<MWRDto<ResponseUserDto>> {
    const user = await this.userService.findOne({ id: +id, onlyActive: null });
    const result = plainToInstance(ResponseUserDto, user);
    return { ...MESSAGE_OK, result };
  }

  @Rights({
    entity: 'users',
    level: 'write',
  })
  @ApiResponse({ type: ResponseUserDto })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<MWRDto<ResponseUserDto>> {
    const user = await this.userService.update(+id, updateUserDto);
    const result = plainToInstance(ResponseUserDto, user);
    return { ...MESSAGE_OK, result };
  }

  @Rights({
    entity: 'users',
    level: 'write',
  })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<DefaultMessageDto> {
    await this.userService.remove(+id);
    return MESSAGE_OK;
  }

  @Rights({
    entity: 'users',
    level: 'write',
  })
  @Get(':id/activate')
  async activate(@Param('id') id: string): Promise<DefaultMessageDto> {
    await this.userService.activate(+id);
    return MESSAGE_OK;
  }

  @Rights({
    entity: 'org_struct',
    level: 'write',
  })
  @Get(':id/unban')
  async unban(@Param('id') id: string): Promise<DefaultMessageDto> {
    await this.userService.unban(+id);
    return MESSAGE_OK;
  }
}
