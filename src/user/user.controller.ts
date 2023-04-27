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
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseUserDto } from './dto/response-user.dto';
import { plainToInstance } from 'class-transformer';
import { Rights } from '../auth/passport/rights.decorator';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { DefaultMessageDto } from '../helpers/interfaces/common';
import { MWRDto } from '../helpers/interfaces/common';
import { MESSAGE_OK } from '../helpers/constants';
import { UserProfile } from '../helpers/decorators/user.decorator';

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
    @UserProfile() user: ResponseUserDto,
  ): Promise<MWRDto<ResponseUserDto>> {
    const result = plainToInstance(
      ResponseUserDto,
      await this.userService.create(createUserDto, user),
    );
    return { ...MESSAGE_OK, result };
  }

  @Rights({
    entity: 'users',
    level: 'read',
  })
  @HttpCode(200)
  @ApiResponse({ type: ResponseUserDto, isArray: true })
  @Post('/list')
  async findAll(
    @UserProfile() user: ResponseUserDto,
  ): Promise<MWRDto<ResponseUserDto[]>> {
    const userArr = await this.userService.findAll(user);
    const result = plainToInstance(ResponseUserDto, userArr);
    return { ...MESSAGE_OK, result };
  }

  @Rights({
    entity: 'users',
    level: 'read',
  })
  @ApiResponse({ type: ResponseUserDto })
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @UserProfile() user: ResponseUserDto,
  ): Promise<MWRDto<ResponseUserDto>> {
    const result = plainToInstance(
      ResponseUserDto,
      await this.userService.findOne({
        id: +id,
        onlyActive: null,
        orgId: user.orgSelectedId,
      }),
    );
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
    @UserProfile() user: ResponseUserDto,
  ): Promise<MWRDto<ResponseUserDto>> {
    const result = plainToInstance(
      ResponseUserDto,
      await this.userService.update(+id, updateUserDto, user),
    );
    return { ...MESSAGE_OK, result };
  }

  @Rights({
    entity: 'users',
    level: 'write',
  })
  @Delete(':id')
  async deactivate(
    @Param('id') id: string,
    @UserProfile() user: ResponseUserDto,
  ): Promise<DefaultMessageDto> {
    await this.userService.deactivate(+id, user);
    return MESSAGE_OK;
  }

  @Rights({
    entity: 'users',
    level: 'write',
  })
  @Get(':id/activate')
  async activate(
    @Param('id') id: string,
    @UserProfile() user: ResponseUserDto,
  ): Promise<DefaultMessageDto> {
    await this.userService.activate(+id, user);
    return MESSAGE_OK;
  }

  @Rights({
    entity: 'users',
    level: 'write',
  })
  @Get(':id/unban')
  async unban(
    @Param('id') id: string,
    @UserProfile() user: ResponseUserDto,
  ): Promise<DefaultMessageDto> {
    await this.userService.unban(+id, user);
    return MESSAGE_OK;
  }

  @Get('organization/:id')
  async changeOrg(
    @Param('id') id: string,
    @UserProfile() user: ResponseUserDto,
  ): Promise<DefaultMessageDto> {
    await this.userService.changeOrg(+id, user);
    return MESSAGE_OK;
  }
}
