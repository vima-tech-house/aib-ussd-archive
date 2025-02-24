import { IsEmailOrPhone } from '@/common/decorators/user.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: "User's email address",
  })
  @IsEmailOrPhone()
  email!: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description: "User's password",
  })
  @IsString()
  password!: string;
}
