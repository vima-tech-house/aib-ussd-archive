import { Controller, Post, Body, Get, Param, Query, Patch, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { MotorQuotationService } from './motor.quotation.service';
import { CreateQuotationItemDto } from './dtos/motor-quotation.dto';
import { BaseQueryParamsDto } from '@modules/users/dtos/query.dto';
import { AuthenticatedRequest } from '@/interfaces/user.interface';
import { JwtAuthGuard } from '@/common/guards/jwt-guard';

@ApiTags('Quotations Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('quotations')
export class MotorQuotationController {
  constructor(private readonly quotationItemService: MotorQuotationService) {}

  @Post('')
  @ApiOperation({ summary: 'Create quotation' })
  @ApiBody({ type: CreateQuotationItemDto })
  @ApiResponse({
    status: 201,
    description: 'Quotation created successfully',
  })
  @ApiResponse({ status: 409, description: 'Quotation item already exists' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async create(@Body() payload: CreateQuotationItemDto, @Request() req: AuthenticatedRequest) {
    const newPayload = { ...payload, created_by: req.user.userId };
    return this.quotationItemService.create(newPayload);
  }

  @Get('')
  @ApiOperation({ summary: 'Get a list of all quotations' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'The page number to retrieve. Defaults to 1 if not provided.',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    description:
      'The number of quotations to retrieve per page. Defaults to 20 if not provided.',
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
    description: 'List of quotations retrieved successfully.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async findAll(@Query() queryParams: BaseQueryParamsDto) {
    return this.quotationItemService.findAll(queryParams);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get details of one quotation by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the quotation item',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Quotation retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Quotation item not found' })
  async findOne(@Param('id') id: string) {
    return this.quotationItemService.findOne(id);
  }

  @Patch('/:id/approve')
  @ApiResponse({
    status: 200,
    description: 'Quotation item approved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Quotation item not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async approveQuotation(@Param('id') id: string) {
    return this.quotationItemService.approveQuotation(id);
  }

  @Patch('/:id/mark-as-paid')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        proof_of_payment: {
          type: 'string',
          description: 'Proof of payment for the transaction',
          example: 'https://example.com/proof_of_payment.png',
        },
      },
      required: ['proof_of_payment'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Quotation item marked as paid successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Quotation item not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async markAsPaid(@Param('id') id: string, @Body('proof_of_payment') proof_of_payment: string) {
    return this.quotationItemService.markAsPaid(id, proof_of_payment);
  }

  @Patch('/:id/cancel')
  @ApiResponse({
    status: 200,
    description: 'Quotation cancelled successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Quotation item not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async cancelQuotation(@Param('id') id: string) {
    return this.quotationItemService.markAsCancelled(id);
  }

  @Get('/account')
  @ApiOperation({ summary: 'Get a list of all quotations of an account' })
  @ApiQuery({
    name: 'account_id',
    required: true,
    description: 'Account ID for the quotations',
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
      'The number of quotations to retrieve per page. Defaults to 20 if not provided.',
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
    description: 'Quotations retrieved successfully',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async findAllQuotationByAccount(@Query() queryParams: BaseQueryParamsDto, @Query('account_id') account_id: string) {
    return this.quotationItemService.findAllQuotationOfAccount(queryParams, account_id);
  }
}
