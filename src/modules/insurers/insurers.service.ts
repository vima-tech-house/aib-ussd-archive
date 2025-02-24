import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Insurer } from '@/database/models/insurer.model';
import { InsuranceType } from '@/database/models/insurance-type.model';
import { InsurerQueryParamsDto, UpdateInsurerStatusDto } from './dtos';
import { ResponseHelper } from '@/common/helpers/response.helper';
import { FindOptions, Op } from 'sequelize';

@Injectable()
export class InsurersService {
  constructor(
    @InjectModel(Insurer)
    private readonly insurerModel: typeof Insurer,
    @InjectModel(InsuranceType)
    private readonly insuranceTypeModel: typeof InsuranceType,
    private readonly responseHelper: ResponseHelper,
  ) {}

  async findAll(queryParams: InsurerQueryParamsDto) {
    const { search } = queryParams;

    const whereClause: any = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { contact_person: { [Op.iLike]: `%${search}%` } },
      ];
    }

    try {
      const options: FindOptions = {
        where: whereClause,
        order: [
          ['favorite', 'DESC'],
          ['display', 'DESC'],
        ],
        include: [
          {
            model: InsuranceType,
            through: { attributes: [] },
          },
        ],
      };

      const insurers = await this.insurerModel.findAll(options);

      return this.responseHelper.success({
        message: 'Insurers retrieved successfully',
        response: insurers,
      });
    } catch (error) {
      return this.responseHelper.error({
        message: 'Failed to retrieve insurers',
        errors: error,
      });
    }
  }

  async findOne(id: string) {
    try {
      const insurer = await this.insurerModel.findByPk(id, {
        include: [
          {
            model: InsuranceType,
            through: { attributes: [] },
          },
        ],
      });

      if (!insurer) {
        return this.responseHelper.error({
          message: 'Insurer not found',
        });
      }

      return this.responseHelper.success({
        message: 'Insurer retrieved successfully',
        response: insurer,
      });
    } catch (error) {
      return this.responseHelper.error({
        message: 'Failed to retrieve insurer',
        errors: error,
      });
    }
  }

  async updateStatus(id: string, updateStatusDto: UpdateInsurerStatusDto) {
    try {
      const insurer = await this.insurerModel.findByPk(id);

      if (!insurer) {
        return this.responseHelper.error({
          message: 'Insurer not found',
        });
      }

      insurer.is_active = updateStatusDto.is_active;
      await insurer.save();

      return this.responseHelper.success({
        message: 'Insurer status updated successfully',
        response: insurer,
      });
    } catch (error) {
      return this.responseHelper.error({
        message: 'Failed to update insurer status',
        errors: error,
      });
    }
  }
}
