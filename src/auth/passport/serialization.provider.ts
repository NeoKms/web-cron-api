import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { ResponseUserDto } from '../../user/dto/response-user.dto';

@Injectable()
export class AuthSerializer extends PassportSerializer {
  constructor() {
    super();
  }

  serializeUser(
    user: ResponseUserDto,
    done: (err: Error, user: ResponseUserDto) => void,
  ) {
    done(null, user);
  }

  deserializeUser(
    user: ResponseUserDto,
    done: (err: Error, user: ResponseUserDto) => void,
  ) {
    done(null, user);
  }
}
