import {
  Controller,
  Body,
  Get,
  Param,
  Query,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BaseQueryParamsDto } from '@modules/users/dtos/query.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-guard';
import { PolicyService } from './policy.service';

@ApiTags('Policy Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('policies')
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Get('/list')
  @ApiOperation({ summary: 'Get a list of all policies' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'The page number to retrieve. Defaults to 1 if not provided.',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    description:
      'The number of policies to retrieve per page. Defaults to 20 if not provided.',
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
    description: 'Policies retrieved successfully',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async findAll(@Query() queryParams: BaseQueryParamsDto) {
    return this.policyService.findAll(queryParams);
  }

  @Get('/account')
  @ApiOperation({ summary: 'Get a list of all policies of an account' })
  @ApiQuery({
    name: 'account_id',
    required: true,
    description: 'Account ID for the policies',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'The page number to retrieve. Defaults to 1 if not provided.',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    description:
      'The number of policies to retrieve per page. Defaults to 20 if not provided.',
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
    description: 'Policy retrieved successfully',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async findAllQuotationByAccount(
    @Query() queryParams: BaseQueryParamsDto,
    @Query('account_id') account_id: string,
  ) {
    return this.policyService.findAllPoliciesOfAccount(queryParams, account_id);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get details of one policy by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the policy',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Policy retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  async findOne(@Param('id') id: string) {
    return this.policyService.findOne(id);
  }

  @Patch('/:id/add-certificate')
  @ApiOperation({ summary: 'Add policy certificate' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        certificate: {
          type: 'string',
          description: 'Certificate for the policy',
          example: 'https://example.com/certificate.pdf',
        },
      },
      required: ['certificate'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Added certificate successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Policy not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async markAsPaid(
    @Param('id') id: string,
    @Body('certificate') certificate: string,
  ) {
    return this.policyService.addCertificate(id, certificate);
  }
}
