import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BaseQueryParamsDto } from '../dto/query.dto';
import { VehicleMakesService } from './vehicle-makes.service';
import { ApiResponse } from 'interfaces/vehicle-response.interface';
import { VehicleMake } from '@database/models/vehicle-make.model';

@ApiTags('Vehicle makes')
@Controller('vehicle-makes')
export class VehicleMakesController {
  constructor(private readonly vehicleMakesServices: VehicleMakesService) {}

  @Get('')
  @ApiOperation({ summary: 'Get all vehicle makes' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'isActive', required: false, type: 'boolean' })
  async findAll(
    @Query() queryParams: BaseQueryParamsDto,
  ): Promise<ApiResponse<VehicleMake[]>> {
    const { data, count, page, perPage } =
      await this.vehicleMakesServices.findAll(queryParams);

    const totalPages = Math.ceil(count / perPage);

    return {
      status: 'success',
      message: 'Vehicle makes retrieved successfully',
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
