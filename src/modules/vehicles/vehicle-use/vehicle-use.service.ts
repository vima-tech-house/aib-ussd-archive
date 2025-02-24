import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseQueryParamsDto } from '../dto/query.dto';
import { BaseService } from '../services/base.service';
import { VehicleUse } from '@database/models/vehicle-use.model';
import { handleErrors } from '@/utils/error.handler';
import { createPagination } from '@/utils/pagination.handler';
import { Response } from '@/interfaces/response.interface';
import { Op } from 'sequelize';

@Injectable()
export class VehicleUseService extends BaseService<VehicleUse> {
  constructor(
    @InjectModel(VehicleUse)
    private readonly vehicleUseModel: typeof VehicleUse,
  ) {
    super(vehicleUseModel);
  }

  async findAll(
    queryParams: BaseQueryParamsDto,
  ): Promise<Response<VehicleUse[]>> {
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
      const { count, rows } = await this.vehicleUseModel.findAndCountAll({
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
