import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ResponseHelper } from '../helpers/response.helper';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly responseHelper: ResponseHelper) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) {
      throw new UnauthorizedException(
        this.responseHelper.error({
          message: 'Unauthorized Access: No token provided',
          errors: null,
        }),
      );
    }

    return super.canActivate(context) as Promise<boolean>;
  }

  handleRequest(err: any, user: any, info: any) {
    if (err) {
      throw new UnauthorizedException(
        this.responseHelper.error({
          message: 'Unauthorized Access: Invalid token',
          errors: null,
        }),
      );
    }

    if (!user) {
      throw new UnauthorizedException(
        this.responseHelper.error({
          message: 'Unauthorized Access: Invalid token',
          errors: null,
        }),
      );
    }
    return user;
  }
}
