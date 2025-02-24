import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { MotorQuotationResponseDto } from './dtos/motor.quotation-response.dto';
import { ResponseHelper } from '@/common/helpers/response.helper';
import { ApiResponse, Response } from '@/interfaces/response.interface';
import { InjectModel } from '@nestjs/sequelize';
import { QuotationItem } from '@database/models/quotation-item.model';
import { handleErrors } from '@/utils/error.handler';
import { BaseQueryParamsDto } from '@modules/vehicles/dto/query.dto';
import { createPagination } from '@/utils/pagination.handler';
import {
  CreateQuotationDetailDto,
  CreateQuotationItemDto,
} from './dtos/motor-quotation.dto';
import { Quotation } from '@database/models/quotation.model';
import { Vehicle } from '@database/models/vehicle.model';
import { Account } from '@database/models/account.model';
import { Insurer } from '@database/models/insurer.model';
import { VehicleMake } from '@database/models/vehicle-make.model';
import { VehicleType } from '@database/models/vehicle-types.model';
import { VehicleUse } from '@database/models/vehicle-use.model';
import { Transactions } from '@database/models/transaction.model';
import { v4 as uuidv4 } from 'uuid';
import { Policy } from '@database/models/policy.model';

@Injectable()
export class MotorQuotationService {
  constructor(
    @InjectModel(QuotationItem)
    private readonly quotationItemModel: typeof QuotationItem,
    @InjectModel(Quotation)
    private readonly quotationModel: typeof Quotation,
    @InjectModel(Vehicle)
    private readonly vehicleModel: typeof Vehicle,
    @InjectModel(Account)
    private readonly accountModel: typeof Account,
    @InjectModel(Insurer)
    private readonly insurerModel: typeof Insurer,
    @InjectModel(Transactions)
    private readonly transactionModel: typeof Transactions,
    @InjectModel(Policy)
    private readonly policyModel: typeof Policy,
    private readonly responseHelper: ResponseHelper,
  ) {}

  async calculateQuotation(payload: CreateQuotationDetailDto) {
    const baseRate = 0.02;
    const vatRate = 0.18;

    const vehicle = (await this.vehicleModel.findByPk(
      payload.vehicle_id,
    )) as Vehicle;
    const subtotal = vehicle.value || 0 * baseRate;

    const vat = subtotal * vatRate;

    const total = subtotal + vat;

    const response: MotorQuotationResponseDto = {
      subtotal: parseFloat(subtotal.toFixed(2)),
      vat: parseFloat(vat.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };

    return response;
  }

  async findOne(id: string): Promise<ApiResponse> {
    try {
      const response = await this.quotationModel.findOne({
        where: { id },
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
            model: Account,
            attributes: ['id', 'account_type'],
          },
          {
            model: Insurer,
            attributes: ['id', 'name'],
          },
          {
            model: VehicleUse,
            attributes: ['id', 'usage_type'],
          },
        ],
      });
      return this.responseHelper.success({
        message: 'Quotation retrieved successfully',
        response,
      });
    } catch (error) {
      return handleErrors(error, 'findOne');
    }
  }

  async findAll(
    queryParams: BaseQueryParamsDto,
  ): Promise<Response<Quotation[]>> {
    try {
      const { page = 1, perPage = 20, sort, order = 'asc' } = queryParams;

      const offset = (page - 1) * perPage;
      const { count, rows } = await this.quotationModel.findAndCountAll({
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
            model: VehicleUse,
            attributes: ['id', 'usage_type'],
          },
        ],
      });

      const pagination = createPagination(count, perPage, offset);

      return {
        status: 'success',
        message: 'Quotation retrieved successfully',
        pagination,
        response: rows,
        errors: null,
      };
    } catch (error) {
      return handleErrors(error, 'findAll');
    }
  }

  async create(payload: CreateQuotationItemDto): Promise<ApiResponse> {
    if (!this.quotationItemModel.sequelize) {
      throw new Error('Sequelize instance is not available');
    }
    const transaction = await this.quotationItemModel.sequelize.transaction();

    try {
      const account = await this.accountModel.findByPk(payload.account_id);
      if (!account) {
        throw new NotFoundException(
          this.responseHelper.error({
            message: 'Account not found',
            errors: null,
          }),
        );
      }

      const insurer = await this.insurerModel.findByPk(payload.insurer_id);
      if (!insurer) {
        throw new NotFoundException(
          this.responseHelper.error({
            message: 'Insurer not found',
            errors: null,
          }),
        );
      }

      const existingQuotation = await this.quotationModel.findOne({
        where: {
          quoteNumber: payload.quoteNumber,
          account_id: payload.account_id,
          status: 'pending',
        },
      });

      if (existingQuotation) {
        throw new NotFoundException(
          this.responseHelper.error({
            message:
              'There is still a pending quotation for the selected account and quote number',
            errors: null,
          }),
        );
      }
      const quotation = await this.quotationModel.create(
        {
          quoteNumber: payload.quoteNumber,
          account_id: payload.account_id,
          created_by: payload.created_by,
          insurer_id: payload.insurer_id,
          vehicle_use_id: payload.vehicle_use_id,
        } as Quotation,
        { transaction },
      );
      const quotationItems = [];
      for (const item of payload.items) {
        const { total } = await this.calculateQuotation(item);
        const quotationItem = await this.quotationItemModel.create(
          {
            ...item,
            quotation_id: quotation.id,
            totalPremium: total,
          } as unknown as QuotationItem,
          { transaction },
        );
        quotationItems.push(quotationItem);
      }

      await transaction.commit();

      const updatedQuotation = await this.quotationModel.findByPk(
        quotation.id,
        {
          include: [this.quotationItemModel],
        },
      );
      if (updatedQuotation) {
        updatedQuotation.updateTotalPremium();
      }

      return this.responseHelper.success({
        message: 'Quotation and quotation items created successfully',
        response: {
          quotation: updatedQuotation,
        },
      });
    } catch (error) {
      await transaction.rollback();
      return handleErrors(error, 'create-quotation-item');
    }
  }

  async approveQuotation(id: string): Promise<ApiResponse<Quotation>> {
    try {
      const quotation = await this.quotationModel.findByPk(id);

      if (!quotation) {
        throw new NotFoundException(
          this.responseHelper.error({
            message: 'Quotation not found',
            errors: null,
          }),
        );
      }

      const result = await quotation.update({ status: 'approved' });

      return this.responseHelper.success({
        message: 'Quotation approved successfully',
        response: result,
      });
    } catch (error) {
      return handleErrors(error, 'approve-quotation-item');
    }
  }

  async markAsPaid(id: string, proof_of_payment: string): Promise<ApiResponse<Quotation>> {
    if (!this.quotationModel.sequelize) {
      throw new Error('Sequelize instance is not available');
    }
    const transaction = await this.quotationModel.sequelize.transaction();

    try {
      const quotation = await this.quotationModel.findOne({
        where: { id },
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
              'periodOfInsurance',
            ],
          },
        ],
        transaction,
      });

      if (!quotation) {
        throw new NotFoundException(
          this.responseHelper.error({
            message: 'Quotation not found',
            errors: null,
          }),
        );
      }

      if (quotation.status === 'paid') {
        throw new ConflictException(
          this.responseHelper.error({
            message: 'Quotation is already paid',
            errors: null,
          }),
        );
      }

      // Create transaction record for the quotation
      const newTransaction = await this.transactionModel.create(
        {
          quotation_id: quotation.id,
          amount: quotation.quotationItems.reduce(
            (sum, item) => sum + parseFloat(item.totalPremium),
            0,
          ),
          status: 'successful',
          source_account_id: quotation.account_id,
          date_of_payment: new Date(),
          type: 'income',
          payment_method: 'e-payment',
          payment_provider: 'Flutterwave',
          reference_number: uuidv4(),
          insurer_id: quotation.insurer_id,
          proof_of_payment,
        } as unknown as Transactions,
        { transaction },
      );

      // Create policies for each quotation item
      for (const item of quotation.quotationItems) {
        const end_date = new Date(
          new Date(item.startDate).getTime() +
            Number(item.periodOfInsurance) * 24 * 60 * 60 * 1000,
        );

        await this.policyModel.create(
          {
            amount: parseFloat(item.totalPremium),
            start_date: item.startDate,
            end_date,
            quotation_item_id: item.id,
            account_id: quotation.account_id,
            insurer_id: quotation.insurer_id,
            created_by: quotation.created_by,
            transaction_id: newTransaction.id,
          } as unknown as Policy,
          { transaction },
        );
      }

      // Update quotation status
      await quotation.update({ status: 'paid' }, { transaction });

      await transaction.commit();

      return this.responseHelper.success({
        message:
          'Quotation marked as paid, transactions and policies created successfully',
        response: quotation,
      });
    } catch (error) {
      await transaction.rollback();
      return handleErrors(error, 'mark-as-paid');
    }
  }

  async markAsCancelled(id: string): Promise<ApiResponse<Quotation>> {
    try {
      const quotation = await this.quotationModel.findByPk(id);

      if (!quotation) {
        throw new NotFoundException(
          this.responseHelper.error({
            message: 'Quotation not found',
            errors: null,
          }),
        );
      }

      if (quotation.status === 'paid') {
        throw new ConflictException(
          this.responseHelper.error({
            message: 'Quotation cannot be cancelled because it is already paid',
            errors: null,
          }),
        );
      }

      const result = await quotation.update({ status: 'cancelled' });

      return this.responseHelper.success({
        message: 'Quotation cancelled successfully',
        response: result,
      });
    } catch (error) {
      return handleErrors(error, 'mark-as-cancelled');
    }
  }

  async findAllQuotationOfAccount(
    queryParams: BaseQueryParamsDto,
    id: string,
  ): Promise<Response<Quotation[]>> {
    try {
      const { page = 1, perPage = 20, sort, order = 'asc' } = queryParams;

      const offset = (page - 1) * perPage;
      const { count, rows } = await this.quotationModel.findAndCountAll({
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
            model: VehicleUse,
            attributes: ['id', 'usage_type'],
          },
        ],
      });

      const pagination = createPagination(count, perPage, offset);

      return {
        status: 'success',
        message: 'Quotations retrieved successfully',
        pagination,
        response: rows,
        errors: null,
      };
    } catch (error) {
      return handleErrors(error, 'findAll');
    }
  }
}
