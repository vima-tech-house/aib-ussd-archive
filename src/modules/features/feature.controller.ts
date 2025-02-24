import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { FeatureService } from './feature.service';
import { BaseQueryParamsDto } from 'modules/vehicles/dto/query.dto';
import { UpdateActionsDto } from './dto/update-action-dto';

@ApiTags('Feature access management')
@Controller('features')
export class FeatureController {
  constructor(private readonly featureTypeModel: FeatureService) {}

  @Get('')
  @ApiOperation({ summary: 'Get a list of all features' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'The page number to retrieve. Defaults to 1 if not provided.',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    description:
      'The number of features to retrieve per page. Defaults to 20 if not provided.',
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
    description: 'List of features retrieved successfully.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async findAll(@Query() queryParams: BaseQueryParamsDto) {
    return this.featureTypeModel.findAll(queryParams);
  }

  @Get('/:id/actions')
  @ApiOperation({ summary: 'Get all actions on a feature' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the feature to retrieve actions for',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of actions on feature retrieved successfully.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async findAllActionOnFeature(@Param('id') id: string) {
    return this.featureTypeModel.findAllActionsOnFeature(id);
  }

  @Get('/actions')
  @ApiOperation({ summary: 'Get a list of all Actions' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'The page number to retrieve. Defaults to 1 if not provided.',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    description:
      'The number of actions to retrieve per page. Defaults to 20 if not provided.',
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
    description: 'List of actions retrieved successfully.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async findAllActions(@Query() queryParams: BaseQueryParamsDto) {
    return this.featureTypeModel.findAllActions(queryParams);
  }

  @Post(':id/actions')
  @ApiOperation({ summary: 'Add or remove actions on a feature' })
  @ApiParam({
    name: 'id',
    description:
      'The ID of the feature to which actions will be added or removed',
    type: String,
  })
  async updateActions(
    @Param('id') featureId: string,
    @Body() updateActionsDto: UpdateActionsDto,
  ) {
    const { addActionIds, removeActionIds } = updateActionsDto;
    return this.featureTypeModel.removeAddActions(
      featureId,
      addActionIds,
      removeActionIds,
    );
  }
}
