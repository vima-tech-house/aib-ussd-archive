import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CreateVehicleBulkDto,
  CreateVehicleDto,
  UpdateVehicleDto,
  ValidateVehicleDto,
  VehicleQueryParamsDto,
} from './dto/vehicle.dto';
import { VehicleResponse } from './dto/vehicle-reponse.dto';
import { VehiclesService } from './vehicle.service';
import { RequestWithUser } from 'interfaces/user.interface';
import { JwtAuthGuard } from 'common/guards/jwt-guard';
import { PermissionsGuard } from '@/common/guards/permission.guard';

@ApiTags('Vehicle management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  @ApiOperation({
    summary: 'List all vehicles',
    description: 'Get a paginated list of vehicles with optional filters',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in plate number, model, chassis number',
  })
  @ApiQuery({
    name: 'makeId',
    required: false,
    type: String,
    description: 'Filter by vehicle make',
  })
  @ApiQuery({
    name: 'vehicleTypeId',
    required: false,
    type: String,
    description: 'Filter by vehicle type',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: 'Filter by manufacturing year',
  })
  @ApiQuery({
    name: 'showInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive vehicles in the results',
  })
  @ApiResponse({
    status: 200,
    description: 'List of vehicles retrieved successfully',
    type: VehicleResponse,
    isArray: true,
  })
  async findAll(@Query() queryParams: VehicleQueryParamsDto) {
    return this.vehiclesService.findAll(queryParams);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get vehicle details',
    description: 'Get detailed information about a specific vehicle',
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle details retrieved successfully',
    type: VehicleResponse,
  })
  async findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create vehicle',
    description: 'Create a new vehicle record',
  })
  @ApiResponse({
    status: 201,
    description: 'Vehicle created successfully',
    type: VehicleResponse,
  })
  async create(
    @Req() req: RequestWithUser,
    @Body() createVehicleDto: CreateVehicleDto,
  ) {
    return this.vehiclesService.create(createVehicleDto, req);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update vehicle',
    description: 'Update an existing vehicle record',
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle updated successfully',
    type: VehicleResponse,
  })
  async update(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @Put(':id/deactivate')
  @ApiOperation({
    summary: 'Deactivate vehicle',
    description: 'Deactivate a vehicle instead of deleting it',
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle deactivated successfully',
    type: VehicleResponse,
  })
  async deactivate(@Param('id') id: string) {
    return this.vehiclesService.deactivate(id);
  }

  @Post('validate')
  @ApiOperation({
    summary: 'Validate vehicle information',
    description:
      'Validate vehicle plate number, chassis number, and engine number',
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle information validated successfully',
    schema: {
      properties: {
        status: { type: 'string', example: 'success' },
        response: {
          type: 'object',
          properties: {
            isValid: { type: 'boolean' },
            errors: {
              type: 'object',
              properties: {
                plateNumber: { type: 'array', items: { type: 'string' } },
                chassisNumber: { type: 'array', items: { type: 'string' } },
                engineNumber: { type: 'array', items: { type: 'string' } },
              },
            },
          },
        },
      },
    },
  })
  async validate(@Body() validateVehicleDto: ValidateVehicleDto) {
    return this.vehiclesService.validate(validateVehicleDto);
  }

  @Post('bulk')
  @ApiOperation({
    summary: 'Create multiple vehicles',
    description: 'Queue multiple vehicles for creation',
  })
  @ApiResponse({
    status: 201,
    description: 'Vehicles queued for creation',
  })
  @ApiResponse({
    status: 500,
    description: 'Error processing vehicles',
  })
  @ApiResponse({
    status: 202,
    description: 'Vehicles queued for creation',
    schema: {
      properties: {
        jobId: { type: 'string' },
        status: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  @Post('bulk')
  async createBulk(
    @Req() req: RequestWithUser,
    @Body() createVehicleBulkDto: CreateVehicleBulkDto,
  ) {
    const result = await this.vehiclesService.queueVehicleUpload(
      createVehicleBulkDto.vehicles,
      req.user.id,
    );

    if (result.errors && result.errors.length > 0) {
      throw new HttpException(
        {
          message: 'Duplicated data found in the DB',
          error: 'Bad request',
          statusCode: 400,
          errors: result.errors,
        },
        400,
      );
    }

    return {
      statusCode: 202,
      status: 'accepted',
      message: 'Vehicle upload process started',
      jobId: result.jobId,
      totalVehicles: result.totalVehicles,
      estimatedTime: result.estimatedTime,
    };
  }
}
