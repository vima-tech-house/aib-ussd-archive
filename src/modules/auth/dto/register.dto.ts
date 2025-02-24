import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  isUUID,
} from 'class-validator';
import { ClientType, RoleType } from 'common/enums';

export class RegisterDto {
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
    enum: ClientType,
    example: ClientType.INDIVIDUAL,
    description: 'Type of client',
  })
  @IsEnum(ClientType)
  client_type!: ClientType;

  @ApiProperty({
    enum: RoleType,
    example: RoleType.CLIENT,
    description: 'User role type',
    default: RoleType.CLIENT,
  })
  @IsEnum(RoleType)
  @IsOptional() // Making it optional since it will be set to CLIENT by default
  role?: RoleType;

  @ApiProperty({
    example: 'd3c4d4b8-3c4b-4a3f-8b2a-3c4b4a3f8b2a',
    description: 'Institution ID',
  })
  @IsOptional()
  institution_id?: string;
}
