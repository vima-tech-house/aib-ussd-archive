import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsIn, IsNumber, Min, Max } from 'class-validator';

export class CreateMotorQuotationDto {
  @ApiProperty({ description: 'Vehicle manufacture year', example: 2020 })
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  vehicleManufactureYear!: number;

  @ApiProperty({
    description: 'Insurance company ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  insuranceCompanyId!: string;

  @ApiProperty({
    description: 'Vehicle type ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  vehicleTypeId!: string;

  @ApiProperty({
    description: 'Vehicle insurance class',
    example: 'comprehensive',
  })
  @IsString()
  vehicleInsuranceClass!: string;

  @ApiProperty({ description: 'Value of the vehicle in RWF', example: 5000000 })
  @IsNumber()
  vehicleValue!: number;

  @ApiProperty({ description: 'Number of occupants', example: 5 })
  @IsInt()
  @Min(1)
  occupants!: number;

  @ApiProperty({ description: 'Number of seats', example: 5 })
  @IsInt()
  @Min(1)
  seats!: number;

  @ApiProperty({
    description: 'Insurance period (days or months)',
    example: '1-15',
  })
  @IsString()
  @IsIn(['1', '2', '3', '6', '9', '12', '1-15'])
  insurancePeriod!: string;
}
