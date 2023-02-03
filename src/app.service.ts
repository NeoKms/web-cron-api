import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getBaseGetter(): string {
    return `api is working ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
  }
}
