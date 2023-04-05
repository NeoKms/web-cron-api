import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { LoggedInGuard } from './passport/logged-in.guard';
import { ResponseUserDto } from '../user/dto/response-user.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { DefaultMessageDto } from '../helpers/interfaces/common';
import { ReqWithUser } from '../helpers/interfaces/req';
import { MESSAGE_OK } from '../helpers/constants';
import { UserProfile } from '../helpers/decorators/user.decorator';

@ApiTags('auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(
  new ValidationPipe({
    forbidUnknownValues: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @ApiResponse({ type: ResponseUserDto, status: 200 })
  @Post('/login')
  async login(
    @UserProfile() user: ResponseUserDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() loginDto: LoginDto,
  ): Promise<{ auth: ResponseUserDto }> {
    return { auth: user };
  }

  @UseGuards(LoggedInGuard)
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  @Post('/logout')
  async logout(@Req() req: ReqWithUser): Promise<DefaultMessageDto> {
    await this.authService.logout(req);
    return MESSAGE_OK;
  }

  @UseGuards(LoggedInGuard)
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  @Get('/logout')
  async logout2(@Req() req: ReqWithUser): Promise<DefaultMessageDto> {
    await this.authService.logout(req);
    return MESSAGE_OK;
  }

  @UseGuards(LoggedInGuard)
  @ApiResponse({ type: ResponseUserDto, status: 200 })
  @HttpCode(200)
  @Get('/checkLogin')
  async checkLogin(
    @UserProfile() user: ResponseUserDto,
  ): Promise<{ auth: ResponseUserDto }> {
    const userObj = await this.authService.checkLogin(user);
    return { auth: userObj };
  }
}
