import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto';
import { ClientRegisterDto } from './dto/client-register.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-guard';
import { AuthenticatedRequest } from '@/interfaces/user.interface';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      example: {
        user_id: 'uuid',
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'client',
        client_type: 'individual',
        created_at: '2025-01-03T10:00:00.000Z',
        updated_at: '2025-01-03T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation errors',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Email already exists',
  })
  async register(@Body() clientregisterDto: ClientRegisterDto) {
    return this.authService.register(clientregisterDto);
  }

  @Post('verify-account/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verifying the registered user' })
  @ApiParam({
    name: 'token',
    description: 'The verification token for a user',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Account verified successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired verification token',
  })
  async verify_account(@Param('token') token: string) {
    return this.authService.verifyAccount(token);
  }

  @Post('resend-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend verification token' })
  @ApiBody({
    schema: {
      example: {
        email: 'john.doe@example.com',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Account verified successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired verification token',
  })
  async resend_token(@Body('email') email: string) {
    return this.authService.resendVerification(email);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 'uuid',
          email: 'john.doe@example.com',
          role: 'client',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiResponse({
    status: 200,
    description: 'Password successfully reset',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid or expired token',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Patch('change-password')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password for authenticated users' })
  @ApiResponse({
    status: 200,
    description: 'Password successfully changed',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid old password',
  })
  async changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = req.user.userId;
    return this.authService.changePassword(
      userId,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }
}
