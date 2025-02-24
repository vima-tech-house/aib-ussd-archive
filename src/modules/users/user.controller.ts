import { JwtAuthGuard } from '@/common/guards/jwt-guard';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './user.service';
import { BaseQueryParamsDto } from './dtos/query.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { PermissionsGuard } from '@/common/guards/permission.guard';
import { AuthenticatedRequest, RequestWithUser } from '@/interfaces/user.interface';
import { RegisterDto } from '@modules/auth/dto';
import { UserResponseDto } from './dtos/user.dto';

@ApiTags('User management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userModel: UsersService) {}

  @Get('')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Get all users' })
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
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async findAll(@Query() queryParams: BaseQueryParamsDto) {
    return this.userModel.findAll(queryParams);
  }

  @Get('/profile')
  @ApiOperation({
    summary: 'Get the profile of the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully.',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User is not authenticated.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error.',
  })
  async getProfile(@Request() req: AuthenticatedRequest) {
    return this.userModel.findProfileById(req.user.userId);
  }

  @Get('/:id')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Get specific user by id' })
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
  async findById(@Param('id') id: string) {
    return this.userModel.findById(id);
  }

  @Patch('/profile')
  @ApiOperation({ summary: 'Update profile by user' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid user data.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error.',
  })
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() updateDto: UpdateUserDto,
  ) {
    const id = req.user.userId;
    return this.userModel.updateProfile(id, updateDto);
  }

  @Patch('status/:id')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Activate or deactivate user by admin' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the user',
    type: String,
  })
  @ApiBody({
    description: 'Status update payload',
    schema: {
      type: 'object',
      properties: {
        is_active: {
          type: 'boolean',
          example: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully activated or deactivated.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error.',
  })
  async changeStatusUser(
    @Param('id') id: string,
    @Body() { is_active }: { is_active: boolean },
  ) {
    return this.userModel.changeUserStatus(id, is_active);
  }

  @Post('')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Create a new user by Back-office user' })
  @ApiBody({
    description: 'User registration data',
    type: RegisterDto,
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid user data.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error.',
  })
  async createUser(@Body() payload: RegisterDto) {
    return this.userModel.createUser(payload);
  }
}
