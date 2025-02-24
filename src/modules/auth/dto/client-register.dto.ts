import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
} from 'class-validator';

export class ClientRegisterDto {
  @ApiProperty({
    example: 'John',
    description: "User's first name",
  })
  @IsString()
  @MinLength(2)
  first_name!: string;

  @ApiProperty({
    example: 'Doe',
    description: "User's last name",
  })
  @IsString()
  @MinLength(2)
  last_name!: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: "User's email address",
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '+250700000000',
    description: "User's phone number",
  })
  @IsString()
  phone_number!: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description: 'Password (min 8 characters)',
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
