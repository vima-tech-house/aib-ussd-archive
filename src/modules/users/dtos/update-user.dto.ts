import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEmail,
  MinLength,
  IsEnum,
} from 'class-validator';
import { ClientType } from 'common/enums';

export class UpdateUserDto {
  @ApiProperty({
    example: 'John',
    description: "User's first name",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  first_name?: string;

  @ApiProperty({
    example: 'Doe',
    description: "User's last name",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  last_name?: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: "User's email address",
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: '+250700000000',
    description: "User's phone number",
    required: false,
  })
  @IsOptional()
  @IsString()
  phone_number?: string;

  @ApiProperty({
    enum: ClientType,
    example: ClientType.INDIVIDUAL,
    description: 'Type of client',
    required: false,
  })
  @IsOptional()
  @IsEnum(ClientType)
  client_type?: ClientType;
}
