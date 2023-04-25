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
  Query,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { LoggedInGuard } from './passport/logged-in.guard';
import { ResponseUserDto } from '../user/dto/response-user.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { DefaultMessageDto, MWRDto } from '../helpers/interfaces/common';
import { ReqWithUser } from '../helpers/interfaces/req';
import { MESSAGE_OK } from '../helpers/constants';
import { UserProfile } from '../helpers/decorators/user.decorator';
import SendCodeDto from './dto/send-code.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Response } from 'express';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Rights } from './passport/rights.decorator';

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

  @ApiResponse({ type: MWRDto<string> })
  @HttpCode(200)
  @Post('/sendCode')
  async sendCode(@Body() dto: SendCodeDto): Promise<MWRDto<string>> {
    const result = await this.authService.sendCode(dto.email);
    return { ...MESSAGE_OK, result };
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @ApiResponse({ type: ResponseUserDto, status: 200 })
  @Post('/login')
  async login(
    @UserProfile() user: ResponseUserDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() loginDto: LoginDto,
  ): Promise<MWRDto<ResponseUserDto>> {
    return { ...MESSAGE_OK, result: user };
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
  ): Promise<MWRDto<ResponseUserDto>> {
    const result = await this.authService.checkLogin(user);
    return { ...MESSAGE_OK, result };
  }

  @ApiResponse({ type: DefaultMessageDto, status: 200 })
  @HttpCode(200)
  @Post('/signup')
  async signUp(@Body() dto: SignUpDto): Promise<DefaultMessageDto> {
    await this.authService.signUp(dto);
    return MESSAGE_OK;
  }

  @ApiResponse({ type: DefaultMessageDto, status: 200 })
  @Get('/password/reset')
  async resetPass(
    @Query() dto: ResetPasswordDto,
    @Res() res: Response,
  ): Promise<DefaultMessageDto | void> {
    const redirectTo = await this.authService.resetPass(dto);
    if (redirectTo) {
      return res.redirect(303, redirectTo);
    }
    res.send(MESSAGE_OK);
  }

  @Rights()
  @ApiResponse({ type: DefaultMessageDto, status: 200 })
  @HttpCode(200)
  @Post('/password/change')
  async changePass(
    @Body() dto: ChangePasswordDto,
    @UserProfile() user: ResponseUserDto,
  ): Promise<DefaultMessageDto> {
    await this.authService.changePass(dto, user);
    return MESSAGE_OK;
  }
}
