import { JwtAuthGuard } from '@/common/guards/jwt-guard';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InsurersService } from './insurers.service';
import {
  InsurerQueryParamsDto,
  InsurerResponseDto,
  UpdateInsurerStatusDto,
} from './dtos';
import { PermissionsGuard } from '@/common/guards/permission.guard';

@ApiTags('Insurance company management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('insurers')
export class InsurersController {
  constructor(private readonly insurersService: InsurersService) {}

  @Get('')
  @ApiOperation({
    summary: 'List all insurers',
    description: 'Get paginated list of insurers with optional filters',
  })
  @ApiResponse({
    status: 200,
    type: InsurerResponseDto,
    isArray: true,
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'perPage', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  async findAll(@Query() queryParams: InsurerQueryParamsDto) {
    return this.insurersService.findAll(queryParams);
  }

  @Get('/:id')
  @ApiOperation({
    summary: 'Get insurer details',
    description: 'Get detailed information about specific insurer',
  })
  @ApiResponse({
    status: 200,
    type: InsurerResponseDto,
  })
  async findOne(@Param('id') id: string) {
    return this.insurersService.findOne(id);
  }

  @Patch('/:id/status')
  @ApiOperation({
    summary: 'Update insurer status',
    description: 'Update active status of insurer',
  })
  @ApiResponse({
    status: 200,
    type: InsurerResponseDto,
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateInsurerStatusDto,
  ) {
    return this.insurersService.updateStatus(id, updateStatusDto);
  }
}
