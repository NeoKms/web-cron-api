import {
  Controller,
  ClassSerializerInterceptor,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  Get,
  Patch,
  Body,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { MWRDto } from '../helpers/interfaces/common';
import ResponseOrgDto from './dto/response-org.dto';
import { MESSAGE_OK } from '../helpers/constants';
import { UserProfile } from '../helpers/decorators/user.decorator';
import { ResponseUserDto } from '../user/dto/response-user.dto';
import { Rights } from '../auth/passport/rights.decorator';
import { plainToInstance } from 'class-transformer';
import UpdateOrgDto from './dto/update-org.dto';

@ApiTags('organization')
@Controller('organization')
@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(
  new ValidationPipe({
    forbidUnknownValues: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Rights({
    entity: 'organization',
    level: 'read',
  })
  @ApiResponse({ type: ResponseOrgDto })
  @Get('')
  async getOrgInfo(
    @UserProfile() user: ResponseUserDto,
  ): Promise<MWRDto<ResponseOrgDto>> {
    const result = plainToInstance(
      ResponseOrgDto,
      await this.organizationService.getById(+user.orgSelectedId),
    );
    return { ...MESSAGE_OK, result };
  }

  @Rights({
    entity: 'organization',
    level: 'write',
  })
  @ApiResponse({ type: ResponseOrgDto })
  @Patch('')
  async updateOrgName(
    @UserProfile() user: ResponseUserDto,
    @Body() dto: UpdateOrgDto,
  ): Promise<MWRDto<ResponseOrgDto>> {
    const result = plainToInstance(
      ResponseOrgDto,
      await this.organizationService.update(+user.orgSelectedId, dto),
    );
    return { ...MESSAGE_OK, result };
  }
}
