import { SetMetadata } from '@nestjs/common';
import { Permission } from '../../common/enums';

export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata('permissions', permissions);
