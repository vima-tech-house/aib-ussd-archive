import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserFeatureService } from './user-feature.service';
import { BaseQueryParamsDto } from 'modules/vehicles/dto/query.dto';
import { UserActionsDto } from '../dto/user-action-dto';
import { PermissionsGuard } from '@/common/guards/permission.guard';
import { JwtAuthGuard } from '@/common/guards/jwt-guard';

@ApiTags('Feature access management')
@Controller('features')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserFeatureController {
  constructor(private readonly userfeatureTypeModel: UserFeatureService) {}

  @Get('user')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Get all users with features they access' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'The page number to retrieve. Defaults to 1 if not provided.',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    description:
      'The number of users to retrieve per page. Defaults to 20 if not provided.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term for filtering users by name',
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
    description: 'Users with features and actions retrieved successfully.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async getUsersWithFeaturesAndActions(
    @Query() queryParams: BaseQueryParamsDto,
  ) {
    return this.userfeatureTypeModel.getAllUsersWithFeaturesAndActions(
      queryParams,
    );
  }

  @Get('user/:id')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Get features and actions associated with a user' })
  @ApiParam({
    name: 'id',
    description: 'The id for a user',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Features and actions for the user retrieved successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid user ID.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error.',
  })
  async getFeaturesAndActionsForUser(@Param('id') id: string) {
    return this.userfeatureTypeModel.findAllFeaturesAndActionsOfUser(id);
  }

  @Post('user/:id/actions')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Add or remove actions for a user' })
  @ApiParam({
    name: 'id',
    description: 'The id for a user',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Actions for the user updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid user ID or action IDs.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error.',
  })
  async removeAddActionsForUser(
    @Param('id') id: string,
    @Body() userActionsDto: UserActionsDto,
  ) {
    const { featuredActions } = userActionsDto;
    return this.userfeatureTypeModel.removeAddActionsForUser(
      id,
      featuredActions,
    );
  }
}
