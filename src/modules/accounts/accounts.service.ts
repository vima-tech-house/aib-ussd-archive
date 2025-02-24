import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FindOptions, Op } from 'sequelize';
import { AccountQueryParamsDto } from './dtos/query-params.dto';
import { ResponseHelper } from '@/common/helpers/response.helper';
import { ApiResponse } from '@/interfaces/response.interface';
import { Institution } from '@database/models/institution.model';
import { User } from '@database/models/user.model';
import { Account } from '@database/models/account.model';
import { AccountStatus, AccountType } from '@/common/enums';
import { Vehicle } from '@database/models/vehicle.model';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account)
    private readonly accountModel: typeof Account,
    private readonly responseHelper: ResponseHelper,
  ) {}

  async findAll(
    queryParams: AccountQueryParamsDto,
  ): Promise<ApiResponse<Account[]>> {
    const { page = 1, perPage = 20, status, accountType, search } = queryParams;

    try {
      const whereClause: any = {};
      if (status) whereClause.status = status;
      if (accountType) whereClause.account_type = accountType;

      const options: FindOptions = {
        where: whereClause,
        include: [
          {
            model: User,
            attributes: [
              ['user_id', 'id'],
              'first_name',
              'last_name',
              'email',
              'phone_number',
              'role',
            ],
          },
          {
            model: Institution,
            required: false,
            attributes: ['id', 'name', 'email', 'phone_number', 'tin'],
          },
        ],
        order: [['created_at', 'DESC']],
        limit: perPage,
        offset: (page - 1) * perPage,
      };

      if (search) {
        options.where = {
          ...whereClause,
          [Op.or]: [
            { '$user.first_name$': { [Op.iLike]: `%${search}%` } },
            { '$user.last_name$': { [Op.iLike]: `%${search}%` } },
            { '$user.email$': { [Op.iLike]: `%${search}%` } },
            { '$institution.name$': { [Op.iLike]: `%${search}%` } },
            { '$institution.email$': { [Op.iLike]: `%${search}%` } },
          ],
        };
      }

      const { count, rows } = await this.accountModel.findAndCountAll(options);

      return this.responseHelper.success({
        message: 'Accounts retrieved successfully',
        response: rows,
        pagination: { pages: Math.ceil(count / perPage), page, count, perPage },
      });
    } catch (error) {
      return this.responseHelper.error({
        message: 'Failed to retrieve accounts',
        errors: error,
      });
    }
  }

  async updateStatus(
    id: string,
    status: AccountStatus,
  ): Promise<ApiResponse<Account>> {
    try {
      const account = await this.accountModel.findByPk(id);
      if (!account) throw new NotFoundException('Account not found');

      await account.update({ status });
      return this.responseHelper.success({
        message: 'Account status updated successfully',
        response: account,
      });
    } catch (error) {
      return this.responseHelper.error({
        message:
          error instanceof NotFoundException
            ? error.message
            : 'Failed to update account status',
        errors: error,
      });
    }
  }

  async createUserAccount(userId: string): Promise<ApiResponse<Account>> {
    try {
      const account = await this.accountModel.create({
        user_id: userId,
        account_type: AccountType.PRIVATE,
        status: AccountStatus.ACTIVE,
      } as any);

      return this.responseHelper.success({
        message: 'User account created successfully',
        response: account,
      });
    } catch (error) {
      return this.responseHelper.error({
        message: 'Failed to create user account',
        errors: error,
      });
    }
  }

  async createInstitutionAccount(
    institutionId: string,
    accountType: AccountType,
  ): Promise<ApiResponse<Account>> {
    try {
      if (
        ![AccountType.PRIVATE, AccountType.GOVERNMENT].includes(accountType)
      ) {
        throw new BadRequestException('Invalid account type for institution');
      }

      const account = await this.accountModel.create({
        institution_id: institutionId,
        accountType: accountType,
        status: AccountStatus.ACTIVE,
      } as any);

      return this.responseHelper.success({
        message: 'Institution account created successfully',
        response: account,
      });
    } catch (error) {
      return this.responseHelper.error({
        message:
          error instanceof BadRequestException
            ? error.message
            : 'Failed to create institution account',
        errors: error,
      });
    }
  }

  async updateAccountType(
    id: string,
    accountType: AccountType,
  ): Promise<ApiResponse<Account>> {
    try {
      const account = await this.accountModel.findByPk(id, {
        include: [Institution],
      });

      if (!account) throw new NotFoundException('Account not found');

      if (!account.institution && accountType === AccountType.GOVERNMENT) {
        throw new BadRequestException(
          'Only institution accounts can be GOVERNMENT type',
        );
      }

      await account.update(
        { account_type: accountType },
        { fields: ['account_type'] },
      );
      return this.responseHelper.success({
        message: 'Account type updated successfully',
        response: account,
      });
    } catch (error) {
      return this.responseHelper.error({
        message:
          error instanceof NotFoundException ||
          error instanceof BadRequestException
            ? error.message
            : 'Failed to update account type',
        errors: error,
      });
    }
  }

  async findById(id: string): Promise<ApiResponse<Account>> {
    try {
      const account = await this.accountModel.findByPk(id, {
        include: [User, Institution, Vehicle],
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      return this.responseHelper.success({
        message: 'Account found',
        response: account,
      });
    } catch (error) {
      return this.responseHelper.error({
        message: 'Failed to retrieve account',
        errors: error,
      });
    }
  }
  async getVehiclesByAccountId(
    accountId: string,
    page: number = 1,
    perPage: number = 20,
    search?: string,
    sort?: string,
    order: 'asc' | 'desc' = 'asc',
  ): Promise<ApiResponse<Vehicle[]>> {
    try {
      const offset = (page - 1) * perPage;
      const where: any = { accountId };

      if (search) {
        where[Op.or] = [
          { make: { [Op.like]: `%${search}%` } },
          { model: { [Op.like]: `%${search}%` } },
          { plateNumber: { [Op.like]: `%${search}%` } },
        ];
      }

      const { count, rows } = await Vehicle.findAndCountAll({
        where,
        limit: perPage,
        offset,
        order: sort ? [[sort, order]] : [],
      });

      const totalPages = Math.ceil(count / perPage);

      return this.responseHelper.success({
        message: 'Account vehicles retrieved successfully',
        response: rows,
        pagination: {
          pages: totalPages,
          page,
          count,
          perPage,
        },
      });
    } catch (error) {
      return this.responseHelper.error({
        message: 'Failed to retrieve account vehicles',
        errors: error,
      });
    }
  }
}
