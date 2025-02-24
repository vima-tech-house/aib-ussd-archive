import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/sequelize';
import { createPagination } from 'utils/pagination.handler';
import { handleErrors } from 'utils/error.handler';
import { BaseQueryParamsDto } from './dtos/query.dto';
import { User } from '@database/models/user.model';
import { Feature } from '@database/models/feature.model';
import { Action } from '@database/models/action.model';
import { ResponseHelper } from '@/common/helpers/response.helper';
import { ClientRegisterDto } from '@modules/auth/dto/client-register.dto';
import { Op } from 'sequelize';
import { ApiResponse } from '@/interfaces/response.interface';
import { UpdateUserDto } from './dtos/update-user.dto';
import { RegisterDto } from '@modules/auth/dto';
import { EmailService } from '@/utils/email-template.handler';
import { JwtService } from '@nestjs/jwt';
import { Account } from '@database/models/account.model';
import { AccountStatus, AccountType } from '@/common/enums';
import { UserFeatureAction } from '@database/models/user-feature-action.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(Account)
    private readonly accountModel: typeof Account,
    @InjectModel(UserFeatureAction)
    private readonly userFeatureActionModel: typeof UserFeatureAction,
    private readonly responseHelper: ResponseHelper,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
  ) {}

  async findById(userId: any) {
    try {
      const response = await this.userModel.findOne({
        where: { user_id: userId },
        include: [
          {
            model: Feature,
            attributes: { exclude: ['created_at', 'updated_at'] },
            include: [
              {
                model: Action,
                through: { attributes: [] },
                attributes: { exclude: ['created_at', 'updated_at'] },
              },
            ],
            through: { attributes: [] },
          },
        ],
        attributes: { exclude: ['password'] },
      });

      if (!response) {
        return this.responseHelper.error({
          message: 'Failed to retrieve user',
          errors: null,
        });
      } else {
        return this.responseHelper.success({
          message: 'User retrieved successfully',
          response,
        });
      }
    } catch (error) {
      return handleErrors(error, 'findById');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ where: { email } });
  }

  async findByEmailOrPhone(identifier: string): Promise<User | null> {
    return this.userModel.findOne({
      where: {
        [Op.or]: [{ email: identifier }, { phone_number: identifier }],
      },
    });
  }

  async createUser(payload: RegisterDto): Promise<ApiResponse<User>> {
    try {
      const existingUser =
        (await this.findByEmailOrPhone(payload.email)) ||
        (await this.findByEmailOrPhone(payload.phone_number));
      if (existingUser) {
        throw new ConflictException({
          status: 'error',
          message:
            'User with the provided email or phone number already exists.',
          pagination: null,
          response: null,
          errors: null,
        });
      }

      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      const isClient = payload.role === 'client';
      const userData: Partial<User> = {
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        phone_number: payload.phone_number,
        password: hashedPassword,
        role: payload.role,
        is_active: true,
        is_verified: !isClient,
        institution_id: payload.institution_id,
      };


      const result = await this.userModel.sequelize!.transaction(async (t) => {
        const newUser = await this.userModel.create(userData as User, {
          transaction: t,
        });

        isClient &&
          (await this.accountModel.create(
            {
              userId: newUser.user_id,
              account_type: AccountType.INDIVIDUAL,
              institutionId: null,
              status: AccountStatus.ACTIVE,
            } as unknown as Account,
            {
              transaction: t,
            },
          ));

        return newUser;
      });

      const token = this.generateVerificationToken(result.email);
      const frontendLink = isClient
        ? process.env.FRONTEND_LINK
        : process.env.BACKOFFICE_LINK;

      const passwordSetupLink = `${frontendLink}/reset-password/${token}`;
      const html = `<p>Welcome! Click <a href="${passwordSetupLink}">here</a> to set up your password.</p>`;

      await this.emailService.sendEmail(
        result.email,
        'Set up your password',
        html,
      );

      return this.responseHelper.success({
        message: 'User created successfully',
        response: result,
      });
    } catch (error) {
      return handleErrors(error, 'createUser');
    }
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

  async createClient(payload: ClientRegisterDto): Promise<User> {
    const checkEmailExistence = await this.findByEmailOrPhone(payload.email);
    const checkPhoneExistence = await this.findByEmailOrPhone(
      payload.phone_number,
    );
    if (checkEmailExistence || checkPhoneExistence) {
      throw new ConflictException({
        status: 'error',
        message: 'User with the provided email or phone number already exists.',
        pagination: null,
        response: null,
        errors: null,
      });
    }

    const userData: Partial<User> = {
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
      phone_number: payload.phone_number,
      password: await bcrypt.hash(payload.password, 10),
      role: 'client',
      is_active: true,
      is_verified: false,
    };

    const newUser = await this.userModel.create(userData as User);

    return newUser;
  }

  async updateProfile(
    user_id: string,
    payload: UpdateUserDto,
  ): Promise<ApiResponse<User>> {
    try {
      const user = await this.userModel.findOne({
        where: { user_id },
      });

      if (!user) {
        throw new NotFoundException(
          this.responseHelper.error({
            message: 'User not found.',
            errors: null,
          }),
        );
      }

      if (payload.email && payload.email !== user.email) {
        const existingUser = await this.findByEmailOrPhone(payload.email);
        if (existingUser) {
          throw new ConflictException({
            status: 'error',
            message: 'Email already exists.',
            response: null,
            errors: null,
          });
        }
      }

      await user.update(payload);

      return this.responseHelper.success({
        message: 'User profile updated successfully.',
        response: user,
      });
    } catch (error) {
      return handleErrors(error, 'updateProfile');
    }
  }

  async findAll(queryParams: BaseQueryParamsDto) {
    try {
      const { page = 1, perPage = 20 } = queryParams;

      const where: any = {};

      const offset = (page - 1) * perPage;

      const { count, rows } = await this.userModel.findAndCountAll({
        where,
        limit: perPage,
        offset,
        attributes: { exclude: ['password'] },
        order: [['created_at', 'DESC']],
        include: [
          {
            model: Feature,
            through: { attributes: [] },
            attributes: { exclude: ['created_at', 'updated_at'] },
          },
        ],
        distinct: true,
      });
      const pagination = createPagination(count, perPage, offset);

      return this.responseHelper.success({
        message: 'Users retrieved successfully',
        pagination,
        response: rows,
      });
    } catch (error) {
      return handleErrors(error, 'findAndCountAll');
    }
  }

  async changeUserStatus(
    user_id: string,
    is_active: boolean,
  ): Promise<ApiResponse<User>> {
    try {
      const user = await this.userModel.findOne({
        where: { user_id },
      });

      if (!user) {
        throw new NotFoundException(
          this.responseHelper.error({
            message: 'User not found.',
            errors: null,
          }),
        );
      }

      await user.update({ is_active });

      const action = is_active ? 'activated' : 'deactivated';

      return this.responseHelper.success({
        message: `User successfully ${action}.`,
        response: user,
      });
    } catch (error) {
      return handleErrors(error, 'toggleUserStatus');
    }
  }

  async findProfileById(userId: string): Promise<ApiResponse<any>> {
    try {
      const user = await this.userModel.findByPk(userId, {
        include: [
          {
            model: Feature,
            include: [
              {
                model: Action,
                through: { attributes: [] },
              },
            ],
            through: { attributes: [] },
          },
          {
            model: Account,
          },
        ],
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        return this.responseHelper.error({
          message: 'Failed to retrieve user profile',
          errors: null,
        });
      }

      const userFeatureActions = await this.userFeatureActionModel.findAll({
        where: { user_id: userId },
      });

      const userFeatureActionSet = new Set(
        userFeatureActions.map((ufa) => `${ufa.feature_id}-${ufa.action_id}`),
      );

      const featuresWithActions = user.features.map((feature) => {
        const actionsWithStatus = feature.actions.map((action) => ({
          ...action.toJSON(),
          isSet: userFeatureActionSet.has(`${feature.id}-${action.id}`),
        }));

        return {
          ...feature.toJSON(),
          actions: actionsWithStatus,
        };
      });

      const userJson = {
        ...user.toJSON(),
        features: featuresWithActions,
      };

      return {
        status: 'success',
        message: 'User profile retrieved successfully',
        pagination: null,
        response: userJson,
        errors: null,
      };
    } catch (error) {
      return handleErrors(error, 'findProfileById');
    }
  }
}
