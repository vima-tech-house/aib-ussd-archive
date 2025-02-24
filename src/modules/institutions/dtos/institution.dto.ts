import { AccountType } from '@/common/enums';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  IsOptional,
  IsEmail,
  IsEnum,
} from 'class-validator';

export class InstitutionDto {
  @ApiProperty({
    example: 'MTN Rwanda',
    description: 'Name of an institution',
  })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({
    example: 'A nice description of MTN',
    description: 'Short description of the company',
  })
  @IsString()
  @MinLength(2)
  description!: string;

  @ApiProperty({
    example: '+250700000000',
    description: "User's phone number",
  })
  @IsString()
  phone_number!: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: "Institution's email address",
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '129033909',
    description: "Institution's TIN number",
  })
  @IsString()
  tin!: string;

  @ApiProperty({ description: 'Physical address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    enum: AccountType,
    description: 'Type of institution account',
    example: AccountType.PRIVATE,
  })
  @IsEnum(AccountType)
  account_type!: AccountType;
}
