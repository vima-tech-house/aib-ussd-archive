import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Response } from 'interfaces/response.interface';
import { handleErrors } from 'utils/error.handler';
import { createPagination } from 'utils/pagination.handler';
import { InsuranceType } from '@database/models/insurance-type.model';
import { Op } from 'sequelize';
import { BaseQueryParamsDto } from 'modules/vehicles/dto/query.dto';

@Injectable()
export class InsuranceTypeService {
  constructor(
    @InjectModel(InsuranceType)
    private readonly insuTypeModel: typeof InsuranceType,
  ) {}

  async findAll(
    queryParams: BaseQueryParamsDto,
  ): Promise<Response<InsuranceType[]>> {
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
      const { count, rows } = await this.insuTypeModel.findAndCountAll({
        where,
        limit: perPage,
        offset,
        order: sort && order ? [[sort, order]] : [],
      });

      const pagination = createPagination(count, perPage, offset);

      return {
        status: 'success',
        message: 'Insurance Types retrieved successfully',
        pagination,
        response: rows,
        errors: null,
      };
    } catch (error) {
      return handleErrors(error, 'findAll');
    }
  }
}
