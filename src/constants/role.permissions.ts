import { RoleType, Permission } from '../common/enums';

export const ROLE_PERMISSIONS = new Map<RoleType, Permission[]>([
  [
    RoleType.CLIENT,
    [
      Permission.READ_QUOTATION,
      Permission.CREATE_QUOTATION,
      Permission.MANAGE_VEHICLES,
    ],
  ],

  [
    RoleType.SUPPORT_OFFICER,
    [
      Permission.READ_USER,
      Permission.READ_QUOTATION,
      Permission.CREATE_QUOTATION,
      Permission.UPDATE_QUOTATION,
      Permission.PROCESS_PAYMENTS,
      Permission.VIEW_REPORTS,
    ],
  ],

  [
    RoleType.UNDERWRITING_OFFICER,
    [
      Permission.READ_USER,
      Permission.READ_QUOTATION,
      Permission.APPROVE_QUOTATION,
      Permission.MANAGE_PREMIUM_RATES,
      Permission.VIEW_REPORTS,
    ],
  ],

  [
    RoleType.HEAD_MARKETING,
    [
      Permission.READ_USER,
      Permission.VIEW_REPORTS,
      Permission.MANAGE_NOTIFICATIONS,
      Permission.MANAGE_INSURANCE_SERVICES,
    ],
  ],

  [
    RoleType.HEAD_TECHNICAL,
    [
      Permission.READ_USER,
      Permission.MANAGE_PREMIUM_RATES,
      Permission.MANAGE_INSURANCE_SERVICES,
      Permission.APPROVE_QUOTATION,
      Permission.MANAGE_REFUNDS,
      Permission.VIEW_REPORTS,
    ],
  ],

  [
    RoleType.HEAD_STRATEGY,
    [
      Permission.READ_USER,
      Permission.VIEW_REPORTS,
      Permission.MANAGE_SYSTEM_SETTINGS,
      Permission.MANAGE_INSURANCE_SERVICES,
    ],
  ],

  [RoleType.BOARD_MEMBER, [Permission.READ_USER, Permission.VIEW_REPORTS]],

  [RoleType.SUPER_ADMIN, Object.values(Permission)],
]);
