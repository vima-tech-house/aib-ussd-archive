import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsArray, IsUUID, IsOptional } from 'class-validator';

export class CreateInsurerDto {
  @ApiProperty({ description: 'Name of the insurance company' })
  @IsString()
  name!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ description: 'URL of the company logo/avatar' })
  @IsOptional()
  @IsString()
  avatar_url?: string;

  @ApiProperty()
  @IsString()
  phone_number!: string;

  @ApiProperty()
  @IsString()
  contact_person!: string;

  @ApiProperty()
  @IsArray()
  @IsUUID('4', { each: true })
  insuranceTypeIds!: string[];
}
