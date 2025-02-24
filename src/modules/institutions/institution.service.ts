import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Institution } from '@database/models/institution.model';
import { InstitutionDto } from './dtos/institution.dto';
import { Response } from 'interfaces/response.interface';
import { handleErrors } from 'utils/error.handler';
import { createPagination } from 'utils/pagination.handler';
import { User } from '@database/models/user.model';
import { Op } from 'sequelize';
import { BaseQueryParamsDto } from 'modules/vehicles/dto/query.dto';
import { Account } from '@database/models/account.model';
import { AccountStatus, AccountType } from '@/common/enums';

@Injectable()
export class InstitutionService {
  constructor(
    @InjectModel(Institution)
    private readonly institutionModel: typeof Institution,
    @InjectModel(Account)
    private readonly accountModel: typeof Account,
  ) {}

  async findById(id: string): Promise<Response<Institution>> {
    try {
      const institution = await this.institutionModel.findOne({
        where: { id },
      });
      if (!institution) {
        throw new NotFoundException({
          status: 'error',
          message: 'Institution not found',
          pagination: null,
          response: null,
          errors: null,
        });
      }
      return {
        status: 'success',
        message: 'Institution retrieved successfully',
        pagination: null,
        response: institution,
        errors: null,
      };
    } catch (error) {
      return handleErrors(error, 'findById');
    }
  }

  async findAll(
    queryParams: BaseQueryParamsDto,
  ): Promise<Response<Institution[]>> {
    try {
      const {
        page = 1,
        perPage = 20,
        search,
        sort,
        order = 'asc',
        isActive,
      } = queryParams;
      const where: any = {};
      if (search) {
        where.name = { [Op.like]: `%${search}%` };
      }
      if (typeof isActive !== 'undefined') {
        where.isActive = isActive;
      }
      const offset = (page - 1) * perPage;
      const { count, rows } = await this.institutionModel.findAndCountAll({
        where,
        limit: perPage,
        offset,
        order: sort && order ? [[sort, order]] : [],
      });

      const pagination = createPagination(count, perPage, offset);

      return {
        status: 'success',
        message: 'Insitutions retrieved successfully',
        pagination,
        response: rows,
        errors: null,
      };
    } catch (error) {
      return handleErrors(error, 'findAll');
    }
  }

  async getUsersByInstitution(
    institutionId: string,
    queryParams: BaseQueryParamsDto,
  ): Promise<Response<User[]>> {
    try {
      const {
        page = 1,
        perPage = 20,
        search,
        sort,
        order = 'asc',
        isActive,
      } = queryParams;

      const institution = await this.institutionModel.findByPk(institutionId, {
        include: [User],
      });

      if (!institution) {
        throw new NotFoundException({
          status: 'error',
          message: 'Institution not found',
          pagination: null,
          response: null,
          errors: null,
        });
      }

      const where: any = {};
      if (search) {
        where.name = { [Op.like]: `%${search}%` };
      }
      if (typeof isActive !== 'undefined') {
        where.isActive = isActive;
      }

      const users = await institution.$get('users', {
        where,
        limit: perPage,
        offset: (page - 1) * perPage,
        order: sort && order ? [[sort, order]] : [],
      });

      const totalUsers = await institution.$get('users', { where });
      const count = totalUsers.length;

      const pagination = createPagination(count, perPage, (page - 1) * perPage);

      return {
        status: 'success',
        message: 'Users retrieved successfully',
        pagination,
        response: users,
        errors: null,
      };
    } catch (error) {
      return handleErrors(error, 'getUsersByInstitution');
    }
  }

  async create(payload: InstitutionDto): Promise<Response<Institution>> {
    try {
      const existingInstitution = await this.findByName(payload.name);
      if (existingInstitution) {
        throw new ConflictException({
          status: 'error',
          message: 'Institution with the provided name already exists.',
          pagination: null,
          response: null,
          errors: null,
        });
      }

      const isEmailExisting = await this.findByEmail(payload.email);

      if (isEmailExisting) {
        throw new ConflictException({
          status: 'error',
          message: 'Institution with the provided email already exists.',
          pagination: null,
          response: null,
          errors: null,
        });
      }

      const institutionData: Partial<Institution> = {
        name: payload.name,
        description: payload.description,
        phone_number: payload.phone_number,
        email: payload.email,
        tin: payload.tin,
        address: payload.address,
        account_type: payload.account_type || AccountType.PRIVATE,
      };

      const result = await this.institutionModel.sequelize!.transaction(
        async (t) => {
          const newInstitution = await this.institutionModel.create(
            institutionData as Institution,
            { transaction: t },
          );

          await this.accountModel.create(
            {
              institution_id: newInstitution.id,
              user_id: null,
              account_type: institutionData.account_type,
              status: AccountStatus.ACTIVE,
            } as any,
            { transaction: t },
          );
          return newInstitution;
        },
      );

      return {
        status: 'success',
        message: 'Institution created successfully',
        pagination: null,
        response: result,
        errors: null,
      };
    } catch (error) {
      return handleErrors(error, 'create');
    }
  }

  async update(
    id: string,
    payload: InstitutionDto,
  ): Promise<Response<Institution>> {
    try {
      const institutionResponse = await this.findById(id);
      if (!institutionResponse.response) {
        throw new NotFoundException({
          status: 'error',
          message: 'Institution not found',
          pagination: null,
          response: null,
          errors: null,
        });
      }

      const institution = institutionResponse.response;

      if (payload.name && payload.name !== institution.name) {
        const existingInstitution = await this.findByName(payload.name);
        if (existingInstitution) {
          throw new ConflictException({
            status: 'error',
            message: 'Institution with the provided name already exists.',
            pagination: null,
            response: null,
            errors: null,
          });
        }
      }

      const result = await this.institutionModel.sequelize!.transaction(
        async (t) => {
          await institution.update(payload, { transaction: t });

          if (payload.account_type) {
            await this.accountModel.update(
              { account_type: payload.account_type },
              {
                where: { institutionId: id },
                transaction: t,
              },
            );
          }

          return institution;
        },
      );

      return {
        status: 'success',
        message: 'Institution updated successfully',
        pagination: null,
        response: result,
        errors: null,
      };
    } catch (error) {
      return handleErrors(error, 'update');
    }
  }

  async findByName(name: string): Promise<Institution | null> {
    try {
      return await this.institutionModel.findOne({
        where: { name },
      });
    } catch (error) {
      return handleErrors(error, 'findByName');
    }
  }

  async findByEmail(email: string): Promise<Institution | null> {
    try {
      return await this.institutionModel.findOne({
        where: { email },
      });
    } catch (error) {
      return handleErrors(error, 'findByEmail');
    }
  }
}
