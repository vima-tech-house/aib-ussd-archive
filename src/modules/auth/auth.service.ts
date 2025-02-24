import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/user.service';
import { LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto';
import { JwtPayload, LoginResponse } from '../../interfaces';
import * as bcrypt from 'bcrypt';
import { ResponseHelper } from '@/common/helpers/response.helper';
import { User } from '@database/models/user.model';
import { ApiResponse } from '@/interfaces/response.interface';
import { handleErrors } from '@/utils/error.handler';
import { ClientRegisterDto } from './dto/client-register.dto';
import { EmailService } from '@/utils/email-template.handler';
import { ConfigService } from '@/config/config.service';
import { Account } from '@database/models/account.model';
import { AccountStatus, RoleType, AccountType } from '@/common/enums';
import { ActionType } from '@/common/enums/action.enum';
import { Feature } from '@database/models/feature.model';
import { FeatureAction } from '@database/models/feature-action.model';
import { UserFeatureAction } from '@database/models/user-feature-action.model';
import { Action } from '@database/models/action.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly responseHelper: ResponseHelper,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: ClientRegisterDto): Promise<ApiResponse<User>> {
    const user = await this.usersService.createClient(registerDto);

    const verificationToken = this.generateVerificationToken(user.email);
    const isClient = user.role === RoleType.CLIENT;

    await this.sendVerificationEmail(user.email, verificationToken, isClient);

    return this.responseHelper.success<User>({
      message: 'User registered successfully. Please verify your email.',
    });
  }

  public generateVerificationToken(email: string): string {
    return this.jwtService.sign(
      { email },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.VERIFY_EXPIRATION_TIME || '6h',
      },
    );
  }

  public async sendVerificationEmail(
    email: string,
    token: string,
    isClient: boolean,
  ): Promise<void> {
    const frontendLink = isClient
      ? process.env.FRONTEND_LINK
      : process.env.BACKOFFICE_LINK;
    const verificationLink = `${frontendLink}/verify-account/${token}`;
    const html = `<div>
    <p>Thank you for signing up. <br />Please verify your account by clicking the link below:</p>
    <div><a href="${verificationLink}"
    >Verify Account</a></div>
    <p>This link will expire in 6 hours.</p>
    </div>`;
    await this.emailService.sendEmail(email, 'Verify your account', html);
  }

  async verifyAccount(token: string): Promise<ApiResponse> {
    try {
      const decodedToken = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.usersService.findByEmailOrPhone(
        decodedToken.email,
      );

      if (!user || user.is_verified) {
        throw new BadRequestException(
          this.responseHelper.error({
            message: 'Invalid or expired verification token',
            errors: null,
          }),
        );
      }

      const sequelize = user.sequelize;
      const result = await sequelize.transaction(async (t) => {
        await user.update(
          {
            is_verified: true,
          },
          { transaction: t },
        );

        const existingAccount = await Account.findOne({
          where: { userId: user.user_id },
          transaction: t,
        });

        if (!existingAccount) {
          const accountData: Partial<Account> = {
            userId: user.user_id,
            status: AccountStatus.ACTIVE,
            account_type: AccountType.INDIVIDUAL,
          };

          if (user.institution_id) {
            accountData.institutionId = user.institution_id;
          }

          await Account.create(accountData as Account, { transaction: t });
        }

        const actionsMap = new Map();
        const actions = await Action.findAll({
          attributes: ['name', 'id'],
          transaction: t,
        });
        actions.forEach((action) => actionsMap.set(action.name, action.id));

        const featureActions = [
          {
            name: 'Subscriptions',
            actions: [
              ActionType.READ,
              ActionType.UPDATE,
              ActionType.CREATE,
              ActionType.DELETE,
            ],
          },
          { name: 'Insurers', actions: [ActionType.READ] },
          {
            name: 'Vehicles',
            actions: [
              ActionType.READ,
              ActionType.UPDATE,
              ActionType.CREATE,
              ActionType.DELETE,
            ],
          },
          {
            name: 'Quotations',
            actions: [
              ActionType.READ,
              ActionType.UPDATE,
              ActionType.CREATE,
              ActionType.DELETE,
            ],
          },
          { name: 'Insights', actions: [ActionType.READ] },
        ];

        for (const { name, actions } of featureActions) {
          const feature = await Feature.findOne({ where: { name }, transaction: t });
          if (!feature) continue;
        
          for (const actionName of actions) {
            const action_id = actionsMap.get(actionName);
            if (!action_id) continue;
        
            const featureAction = await FeatureAction.findOne({
              where: { feature_id: feature.id, action_id },
              transaction: t,
            });
        
            if (featureAction) {
              await UserFeatureAction.create(
                {
                  user_id: user.user_id,
                  feature_id: feature.id,
                  action_id,
                } as UserFeatureAction,
                { transaction: t }
              );
            }
          }
        }

        return user;
      });

      return this.responseHelper.success<ApiResponse>({
        message:
          'Account verified and activated successfully. You can now log in.',
      });
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException(
          this.responseHelper.error({
            message: 'Invalid or expired verification token',
            errors: null,
          }),
        );
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new BadRequestException(
          this.responseHelper.error({
            message: 'Account already exists for this user',
            errors: null,
          }),
        );
      }
      handleErrors(error, 'verifyAccount');
    }
  }

  async resendVerification(email: string): Promise<ApiResponse<void>> {
    const user = await this.usersService.findByEmailOrPhone(email);

    if (!user) {
      throw new NotFoundException(
        this.responseHelper.error({
          message: 'Account is not found',
          errors: null,
        }),
      );
    }

    if (user.is_verified) {
      throw new BadRequestException(
        this.responseHelper.error({
          message: 'Account is already verified',
          errors: null,
        }),
      );
    }

    const isClient = user.role === RoleType.CLIENT;

    const verificationToken = this.generateVerificationToken(user.email);

    await this.sendVerificationEmail(user.email, verificationToken, isClient);

    return this.responseHelper.success<void>({
      message: 'Verification email sent successfully.',
    });
  }

  private async checkAccountStatus(
    userId: string,
  ): Promise<{ exists: boolean; accountId?: string }> {
    const account = await Account.findOne({
      where: {
        userId,
        status: AccountStatus.ACTIVE,
      },
      attributes: ['id', 'status'],
    });

    return {
      exists: !!account,
      accountId: account?.id,
    };
  }

  private isBackOfficeUser(role: string): boolean {
    const backOfficeRoles = [
      RoleType.SUPER_ADMIN,
      RoleType.SUPPORT_OFFICER,
      RoleType.UNDERWRITING_OFFICER,
      RoleType.HEAD_MARKETING,
      RoleType.HEAD_TECHNICAL,
      RoleType.HEAD_STRATEGY,
      RoleType.BOARD_MEMBER,
    ];
    return backOfficeRoles.includes(role as RoleType);
  }

  async login(loginDto: LoginDto): Promise<ApiResponse<LoginResponse>> {
    try {
      const user = await this.usersService.findByEmail(loginDto.email);
      if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
        throw new UnauthorizedException({
          status: 'error',
          message: 'Invalid credentials',
          pagination: null,
          response: null,
          errors: null,
        });
      }

      const userWithAccount = await User.findOne({
        where: { user_id: user.user_id },
        include: [
          {
            model: Account,
            where: { status: 'active' },
            required: false,
          },
        ],
      });

      if (user.role === RoleType.CLIENT) {
        const userWithAccount = await User.findOne({
          where: { user_id: user.user_id },
          include: [
            {
              model: Account,
              where: { status: AccountStatus.ACTIVE },
              required: false,
            },
          ],
        });

        if (!userWithAccount?.account) {
          throw new UnauthorizedException({
            status: 'error',
            message:
              'Your account is not properly set up. Please contact support.',
            pagination: null,
            response: null,
            errors: null,
          });
        }
      }

      // user.accountId = accountId;

      if (!user.is_verified) {
        throw new UnauthorizedException({
          status: 'error',
          message: 'Please verify your account before logging in.',
          pagination: null,
          response: null,
          errors: null,
        });
      }

      if (!user.is_active) {
        throw new UnauthorizedException({
          status: 'error',
          message:
            'Your account is deactivated, please contact system administrator for activation.',
          pagination: null,
          response: null,
          errors: null,
        });
      }

      const response = await this.generateLoginResponse(user);
      return this.responseHelper.success<LoginResponse>({
        message: 'Login successful.',
        response,
      });
    } catch (error) {
      handleErrors(error, 'login');
    }
  }

  private async generateLoginResponse(user: any): Promise<LoginResponse> {
    const accessToken = await this.generateAccessToken(user);
    return {
      access_token: accessToken,
      user: {
        id: user.user_id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    };
  }

  private async generateAccessToken(user: any) {
    let accountId: string | null = null;

    if (user.role === RoleType.CLIENT) {
      const userAccount = await Account.findOne({
        where: {
          userId: user.user_id,
          status: AccountStatus.ACTIVE,
        },
      });
      accountId = userAccount?.id || null;
    }

    const payload: JwtPayload = {
      userId: user.user_id,
      sub: user.user_id,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      accountId: accountId,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.jwtSecret,
      expiresIn: '24h',
    });
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmailOrPhone(dto.email);

    if (!user) {
      return this.responseHelper.success<User>({
        message:
          'If your email exists in our system, you will receive password reset instructions.',
      });
    }
    const isClient = user.role === RoleType.CLIENT;

    const resetToken = this.jwtService.sign(
      { email: user.email },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: '6h',
      },
    );

    await this.sendResetPasswordEmail(user.email, resetToken, isClient);

    return this.responseHelper.success<User>({
      message:
        'If your email exists in our system, you will receive password reset instructions.',
    });
  }

  private async sendResetPasswordEmail(
    email: string,
    token: string,
    isClient: boolean,
  ) {
    const frontendLink = isClient
      ? process.env.FRONTEND_LINK
      : process.env.BACKOFFICE_LINK;
    const resetLink = `${frontendLink}/reset-password/${token}`;
    const emailBody = `
      <p>We received a request to reset your password. Click the link below to set a new password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
      <p>This link will expire in 6 hours.</p>
    `;

    await this.emailService.sendEmail(email, 'Reset Your Password', emailBody);
  }

  async resetPassword(dto: ResetPasswordDto) {
    try {
      const decodedToken = this.jwtService.verify(dto.token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.usersService.findByEmailOrPhone(
        decodedToken.email,
      );

      if (!user) {
        throw new NotFoundException(
          this.responseHelper.error({
            message: 'Invalid or expired password reset token.',
            errors: null,
          }),
        );
      }

      const hashedPassword = await bcrypt.hash(dto.new_password, 10);
      await user.update({ password: hashedPassword });

      return this.responseHelper.success<User>({
        message: 'Password successfully reset. You can now log in.',
      });
    } catch (error) {
      throw new BadRequestException(
        this.responseHelper.error({
          message: 'Invalid or expired password reset token.',
          errors: null,
        }),
      );
    }
  }

  async changePassword(
    id: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<ApiResponse<void>> {
    const user = await User.findOne({ where: { user_id: id } });

    if (!user) {
      throw new NotFoundException(
        this.responseHelper.error({
          message: 'User not found',
          errors: null,
        }),
      );
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        this.responseHelper.error({
          message: 'Incorrect password',
          errors: null,
        }),
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedNewPassword });

    return this.responseHelper.success<void>({
      message: 'Password successfully changed.',
    });
  }
}
