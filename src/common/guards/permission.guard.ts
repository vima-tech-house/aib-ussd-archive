import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { FeatureService } from '@modules/features/feature.service';
import { ResponseHelper } from '../helpers/response.helper';
import { UserFeatureService } from '@modules/features/user-features/user-feature.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly featuresService: FeatureService,
    private readonly userFeatureService: UserFeatureService,
    private readonly responseHelper: ResponseHelper,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    let path = request.route.path.replace(/^\/api/, '');
    const pathSegments = path.split('/');
    const featurePath = `/${pathSegments[1]}`;

    const feature = await this.featuresService.findByPath(featurePath);

    if (!feature) {
      throw new ForbiddenException(
        this.responseHelper.error({
          message: 'Feature not found.',
          errors: null,
        }),
      );
    }

    const actions = await this.userFeatureService.findUserActionsForFeature(
      user.userId,
      feature.id,
    );

    const actionRequired = this.getRequiredAction(request.method);

    if (!actions.includes(actionRequired)) {
      throw new ForbiddenException(
        this.responseHelper.error({
          message: 'User does not have the required permissions.',
          errors: null,
        }),
      );
    }

    return true;
  }

  getRequiredAction(method: string): string {
    switch (method) {
      case 'POST':
        return 'create';
      case 'GET':
        return 'read';
      case 'PUT':
      case 'PATCH':
        return 'update';
      case 'DELETE':
        return 'delete';
      default:
        throw new ForbiddenException(
          this.responseHelper.error({
            message: 'Unsupported request method.',
            errors: null,
          }),
        );
    }
  }
}
