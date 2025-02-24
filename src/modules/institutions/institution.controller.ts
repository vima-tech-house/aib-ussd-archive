import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InstitutionService } from './institution.service';
import { InstitutionDto } from './dtos/institution.dto';
import { BaseQueryParamsDto } from 'modules/vehicles/dto/query.dto';
import { PermissionsGuard } from '@/common/guards/permission.guard';
import { JwtAuthGuard } from '@/common/guards/jwt-guard';

@ApiTags('Institutions')
@Controller('institutions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InstitutionController {
  constructor(private readonly instService: InstitutionService) {}

  @Post('')
  @ApiOperation({ summary: 'Add a new institution' })
  @ApiResponse({
    status: 201,
    description: 'Institution successfully registered',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Institution name already exists',
  })
  async addUserInstitution(@Body() addInstiDto: InstitutionDto) {
    return this.instService.create(addInstiDto);
  }

  @Get('/:id/users')
  @ApiOperation({ summary: 'Get all users in an institution' })
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
    description: 'Users retrieved successfully',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async getUsersByInstitution(
    @Param('id') id: string,
    @Query() queryParams: BaseQueryParamsDto,
  ) {
    return this.instService.getUsersByInstitution(id, queryParams);
  }

  @Get('')
  @ApiOperation({ summary: 'Get a list of all institutions' })
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
    description: 'List of institutions retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'No institutions found.',
  })
  async findAll(@Query() queryParams: BaseQueryParamsDto) {
    return this.instService.findAll(queryParams);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get an institution by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Institution ID' })
  @ApiResponse({
    status: 200,
    description: 'Institution found',
  })
  @ApiResponse({
    status: 404,
    description: 'Institution not found',
  })
  async findById(@Param('id') id: string) {
    return this.instService.findById(id);
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update an institution by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Institution ID' })
  @ApiResponse({
    status: 200,
    description: 'Institution successfully updated',
  })
  @ApiResponse({
    status: 404,
    description: 'Institution not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Institution name already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateInstiDto: InstitutionDto,
  ) {
    return this.instService.update(id, updateInstiDto);
  }
}
