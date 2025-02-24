import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ApiResponse } from 'interfaces/response.interface';
import { handleErrors } from 'utils/error.handler';
import { Account } from '@database/models/account.model';
import { Policy } from '@database/models/policy.model';
import { ResponseHelper } from '@/common/helpers/response.helper';
import { Insurer } from '@database/models/insurer.model';
import { QuotationItem } from '@database/models/quotation-item.model';
import { Transactions } from '@database/models/transaction.model';
import { BaseQueryParamsDto } from '@modules/vehicles/dto/query.dto';
import { Vehicle } from '@database/models/vehicle.model';
import { VehicleMake } from '@database/models/vehicle-make.model';
import { VehicleType } from '@database/models/vehicle-types.model';
import { createPagination } from '@/utils/pagination.handler';
import { Op } from 'sequelize';

@Injectable()
export class PolicyService {
  constructor(
    @InjectModel(Policy)
    private readonly policyModel: typeof Policy,
    @InjectModel(Account)
    private readonly accountModel: typeof Account,
    @InjectModel(Insurer)
    private readonly insurerModel: typeof Insurer,
    @InjectModel(QuotationItem)
    private readonly quotationItemModel: typeof QuotationItem,
    @InjectModel(Transactions)
    private readonly transactionModel: typeof Transactions,
    private readonly responseHelper: ResponseHelper,
  ) {}

  async findAllPoliciesOfAccount(
    queryParams: BaseQueryParamsDto,
    id: string,
  ): Promise<ApiResponse<Policy[]>> {
    try {
      const { page = 1, perPage = 20, sort, order = 'asc' } = queryParams;

      const offset = (page - 1) * perPage;
      const { count, rows } = await this.policyModel.findAndCountAll({
        where: { account_id: id },
        limit: perPage,
        offset,
        order: sort && order ? [[sort, order]] : [],
        include: [
          {
            model: QuotationItem,
            attributes: [
              'id',
              'vehicle_id',
              'policyQuoteNumber',
              'totalPremium',
              'startDate',
              'endDate',
            ],
            include: [
              {
                model: Vehicle,
                attributes: ['id', 'plateNumber', 'chassisNumber', 'model'],
                include: [
                  {
                    model: VehicleMake,
                    attributes: ['id', 'name'],
                  },
                  {
                    model: VehicleType,
                    attributes: ['id', 'name', 'code'],
                  },
                ],
              },
            ],
          },
          {
            model: Insurer,
            attributes: ['id', 'name'],
          },
        ],
      });

      const pagination = createPagination(count, perPage, offset);

      return this.responseHelper.success({
        message: 'Policies retrieved successfully',
        pagination,
        response: rows,
      });
    } catch (error) {
      return handleErrors(error, 'findAllPoliciesOfAccount');
    }
  }

  async findAll(
    queryParams: BaseQueryParamsDto,
  ): Promise<ApiResponse<Policy[]>> {
    try {
      const {
        page = 1,
        perPage = 20,
        search,
        sort,
        order = 'asc',
      } = queryParams;
      const offset = (page - 1) * perPage;

      const whereCondition: any = {};

      if (search) {
        whereCondition[Op.or] = [
          { contract: { [Op.iLike]: `%${search}%` } },
          { certificate: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { count, rows } = await this.policyModel.findAndCountAll({
        where: whereCondition,
        limit: perPage,
        offset,
        order: sort ? [[sort, order]] : [],
        include: [
          {
            model: QuotationItem,
            attributes: [
              'id',
              'policyQuoteNumber',
              'totalPremium',
              'startDate',
              'endDate',
            ],
            include: [
              {
                model: Vehicle,
                attributes: ['id', 'plateNumber', 'chassisNumber', 'model'],
                include: [
                  { model: VehicleMake, attributes: ['id', 'name'] },
                  { model: VehicleType, attributes: ['id', 'name', 'code'] },
                ],
              },
            ],
          },
          {
            model: Insurer,
            attributes: ['id', 'name'],
          },
        ],
      });

      const pagination = createPagination(count, perPage, offset);

      return this.responseHelper.success({
        message: 'Policies retrieved successfully',
        pagination,
        response: rows,
      });
    } catch (error) {
      return handleErrors(error, 'findAll-policies');
    }
  }

  async findOne(id: string): Promise<ApiResponse<Policy>> {
    try {
      const policy = await this.policyModel.findOne({
        where: { id },
        include: [
          {
            model: QuotationItem,
            attributes: [
              'id',
              'policyQuoteNumber',
              'totalPremium',
              'startDate',
              'endDate',
            ],
            include: [
              {
                model: Vehicle,
                attributes: ['id', 'plateNumber', 'chassisNumber', 'model'],
                include: [
                  { model: VehicleMake, attributes: ['id', 'name'] },
                  { model: VehicleType, attributes: ['id', 'name', 'code'] },
                ],
              },
            ],
          },
          { model: Insurer, attributes: ['id', 'name'] },
        ],
      });

      if (!policy) {
        throw new NotFoundException(
          this.responseHelper.error({
            message: 'Policy not found',
            errors: null,
          }),
        );
      }

      return this.responseHelper.success({
        message: 'Policy retrieved successfully',
        response: policy,
      });
    } catch (error) {
      return handleErrors(error, 'findOne-policy');
    }
  }

  async addCertificate(
    id: string,
    certificate: string,
  ): Promise<ApiResponse<Policy>> {
    try {
      const policy = await this.policyModel.findByPk(id);

      if (!policy) {
        throw new NotFoundException(
          this.responseHelper.error({
            message: 'Policy not found',
            errors: null,
          }),
        );
      }

      policy.certificate = certificate;
      await policy.save();

      return this.responseHelper.success({
        message: 'Added certificate successfully',
        response: policy,
      });
    } catch (error) {
      return handleErrors(error, 'add-certificate');
    }
  }
}
