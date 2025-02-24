import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseQueryParamsDto } from '../dto/query.dto';
import { QueryResult } from 'interfaces/vehicle-response.interface';
import { BaseService } from '../services/base.service';
import { VehicleType } from '@database/models/vehicle-types.model';

@Injectable()
export class VehicleTypesService extends BaseService<VehicleType> {
  constructor(
    @InjectModel(VehicleType)
    private readonly vehicleTypeModel: typeof VehicleType,
  ) {
    super(vehicleTypeModel);
  }

  async findAll(
    queryParams: BaseQueryParamsDto,
  ): Promise<QueryResult<VehicleType>> {
    return this.findAllPaginated(queryParams, ['name', 'code', 'description']);
  }
}
