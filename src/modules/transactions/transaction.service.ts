import { Injectable } from '@nestjs/common';
import { ResponseHelper } from '@/common/helpers/response.helper';
import { ApiResponse, Response } from '@/interfaces/response.interface';
import { InjectModel } from '@nestjs/sequelize';
import { handleErrors } from '@/utils/error.handler';
import { Transactions } from '@database/models/transaction.model';
import { BaseQueryParamsDto } from '@modules/vehicles/dto/query.dto';
import { Insurer } from '@database/models/insurer.model';
import { QuotationItem } from '@database/models/quotation-item.model';
import { createPagination } from '@/utils/pagination.handler';
import { Quotation } from '@database/models/quotation.model';
import { Op } from 'sequelize';
import { Account } from '@database/models/account.model';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transactions)
    private readonly transactionModel: typeof Transactions,
    private readonly responseHelper: ResponseHelper,
  ) {}

  async findAll(
    queryParams: BaseQueryParamsDto,
  ): Promise<Response<Transactions[]>> {
    try {
      const { page = 1, perPage = 20, sort, order = 'asc' } = queryParams;

      const offset = (page - 1) * perPage;
      const { count, rows } = await this.transactionModel.findAndCountAll({
        limit: perPage,
        offset,
        order: sort && order ? [[sort, order]] : [],
        include: [
          {
            model: Insurer,
            attributes: ['id', 'name'],
          },
          {
            model: Quotation,
            attributes: [
              'id',
              'quoteNumber',
              'totalPremium',
              'status',
              'effectiveStartDate',
              'effectiveEndDate',
            ],
            include: [
              {
                model: QuotationItem,
                attributes: [
                  'id',
                  'policyQuoteNumber',
                  'startDate',
                  'endDate',
                  'totalPremium',
                ],
              },
            ],
          },
        ],
      });

      const pagination = createPagination(count, perPage, offset);

      return {
        status: 'success',
        message: 'Transactions retrieved successfully',
        pagination,
        response: rows,
        errors: null,
      };
    } catch (error) {
      return handleErrors(error, 'findAll');
    }
  }

  async findAllTransactionsOfAccount(
    queryParams: BaseQueryParamsDto,
    account_id: string,
  ): Promise<ApiResponse<Transactions[]>> {
    try {
      const {
        page = 1,
        perPage = 20,
        sort,
        order = 'asc',
        search,
      } = queryParams;
      const offset = (page - 1) * perPage;

      const whereClause: any = { source_account_id: account_id };

      if (search) {
        whereClause[Op.or] = [
          { transactionType: { [Op.iLike]: `%${search}%` } },
          { status: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { count, rows } = await this.transactionModel.findAndCountAll({
        where: whereClause,
        limit: perPage,
        offset,
        order: sort ? [[sort, order]] : [],
        include: [
          {
            model: Quotation,
            attributes: [
              'id',
              'quoteNumber',
              'totalPremium',
              'status',
              'effectiveStartDate',
              'effectiveEndDate',
            ],
            include: [
              {
                model: QuotationItem,
                attributes: [
                  'id',
                  'policyQuoteNumber',
                  'startDate',
                  'endDate',
                  'totalPremium',
                ],
              },
            ],
          },
        ],
      });

      const pagination = createPagination(count, perPage, offset);

      return this.responseHelper.success({
        message: 'Transactions retrieved successfully',
        pagination,
        response: rows,
      });
    } catch (error) {
      return handleErrors(error, 'findAllTransactionsOfAccount');
    }
  }

  async findOne(id: string): Promise<ApiResponse<Transactions>> {
    try {
      const transaction = await this.transactionModel.findOne({
        where: { id },
        include: [
          {
            model: Quotation,
            attributes: [
              'id',
              'quoteNumber',
              'totalPremium',
              'status',
              'effectiveStartDate',
              'effectiveEndDate',
            ],
            include: [
              {
                model: QuotationItem,
                attributes: [
                  'id',
                  'policyQuoteNumber',
                  'startDate',
                  'endDate',
                  'totalPremium',
                ],
              },
            ],
          },
        ],
      });

      if (!transaction) {
        return this.responseHelper.error({
          message: 'Transaction not found',
        });
      }

      return this.responseHelper.success({
        message: 'Transaction retrieved successfully',
        response: transaction,
      });
    } catch (error) {
      return handleErrors(error, 'findOneTransaction');
    }
  }
}
