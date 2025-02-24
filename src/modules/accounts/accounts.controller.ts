import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { AccountQueryParamsDto } from './dtos/query-params.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-guard';

@ApiTags('Accounts Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({
    summary: 'List all accounts',
    description: 'Get paginated list of all accounts (users and institutions)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'perPage', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive'] })
  @ApiResponse({
    status: 200,
    description: 'List of accounts retrieved successfully',
  })
  async findAll(@Query() queryParams: AccountQueryParamsDto) {
    return this.accountsService.findAll(queryParams);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get account by ID',
    description: 'Get details of a single account by its ID',
  })
  @ApiParam({ name: 'id', required: true, description: 'Account ID' })
  @ApiResponse({
    status: 200,
    description: 'Account retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Account not found',
  })
  async findOne(@Param('id') id: string) {
    return this.accountsService.findById(id);
  }

  @Get(':id/vehicles')
  @ApiOperation({
    summary: 'Get vehicles linked to an account',
    description: 'Get all vehicles linked to a specific account by its ID',
  })
  @ApiParam({ name: 'id', required: true, description: 'Account ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'The page number to retrieve. Defaults to 1 if not provided.',
    type: Number,
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    description:
      'The number of vehicles to retrieve per page. Defaults to 20 if not provided.',
    type: Number,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term for filtering results by make, model or plate number',
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
    enum: ['asc', 'desc'],
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicles retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Account not found',
  })
  async getVehiclesByAccountId(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('perPage') perPage: number = 20,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('order') order: 'asc' | 'desc' = 'asc',
  ) {
    return this.accountsService.getVehiclesByAccountId(
      id,
      page,
      perPage,
      search,
      sort,
      order,
    );
  }
}
