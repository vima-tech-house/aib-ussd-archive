import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseService } from '../services/base.service';
import { BaseQueryParamsDto } from '../dto/query.dto';
import { QueryResult } from 'interfaces/vehicle-response.interface';
import { VehicleMake } from '@database/models/vehicle-make.model';

@Injectable()
export class VehicleMakesService extends BaseService<VehicleMake> {
  constructor(
    @InjectModel(VehicleMake)
    private vehicleMakeModel: typeof VehicleMake,
  ) {
    super(vehicleMakeModel);
  }

  async findAll(
    queryParams: BaseQueryParamsDto,
  ): Promise<QueryResult<VehicleMake>> {
    return this.findAllPaginated(queryParams, ['name']);
  }
}
