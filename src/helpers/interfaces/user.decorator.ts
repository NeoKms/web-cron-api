import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserProfile = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      return request.user;
    } else {
      return {};
    }
  },
);
