import { Controller, Get, Query } from '@nestjs/common';
import { BaseQueryParamsDto } from '../dto/query.dto';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { VehicleTypesService } from './vehicle-type.service';
import { ApiResponse } from 'interfaces/vehicle-response.interface';
import { VehicleType } from '@database/models/vehicle-types.model';

@ApiTags('Vehicle types')
@Controller('vehicle-types')
export class VehicleTypesController {
  constructor(private readonly vehicleTypesService: VehicleTypesService) {}

  @Get('')
  @ApiOperation({ summary: 'Get all vehicle types' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'isActive', required: false, type: 'boolean' })
  async findAll(
    @Query() queryParams: BaseQueryParamsDto,
  ): Promise<ApiResponse<VehicleType[]>> {
    const { data, count, page, perPage } =
      await this.vehicleTypesService.findAll(queryParams);

    const totalPages = Math.ceil(count / perPage);

    return {
      status: 'success',
      message: 'Vehicle types retrieved successfully',
      pagination: {
        pages: totalPages,
        page: page,
        next: page < totalPages ? page + 1 : null,
        prev: page > 1 ? page - 1 : null,
        count: count,
      },
      response: data,
      errors: null,
    };
  }
}
