import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Password reset token' })
  @IsString()
  token!: string;

  @ApiProperty({
    description: 'New password (min 8 characters)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  new_password!: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    example: 'Old_Password123!',
    description: "User's old password",
  })
  @IsString()
  @MinLength(8, { message: 'Old password must be at least 8 characters long' })
  @MaxLength(32, { message: 'Old password cannot exceed 32 characters' })
  oldPassword!: string;

  @ApiProperty({
    example: 'New_Password123!',
    description: "User's new password",
  })
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @MaxLength(32, { message: 'New password cannot exceed 32 characters' })
  // @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
  //   message: 'New password must contain at least one uppercase letter and one number',
  // })
  newPassword!: string;
}

