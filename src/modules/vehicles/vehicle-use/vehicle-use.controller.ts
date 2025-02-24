import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { VehicleUseService } from './vehicle-use.service';
import { BaseQueryParamsDto } from 'modules/vehicles/dto/query.dto';

@ApiTags('Vehicle Uses ')
@Controller('vehicle-uses')
export class VehicleUseController {
  constructor(private readonly vehicleUseModel: VehicleUseService) {}

  @Get('')
  @ApiOperation({ summary: 'Get a list of all insurance types' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'The page number to retrieve. Defaults to 1 if not provided.',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    description:
      'The number of insurance types to retrieve per page. Defaults to 20 if not provided.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term for filtering results',
    type: String,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Field to sort by',
    type: String,
  })
  @ApiQuery({
    name: 'order',
    required: false,
    description: 'Sort order: asc or desc',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of insurance types retrieved successfully.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async findAll(@Query() queryParams: BaseQueryParamsDto) {
    return this.vehicleUseModel.findAll(queryParams);
  }
}