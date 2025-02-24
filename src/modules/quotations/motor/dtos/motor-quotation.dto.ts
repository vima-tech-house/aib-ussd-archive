import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsInt, Min, IsDateString, IsNotEmpty } from 'class-validator';
import { IsIn } from 'class-validator';

export class CreateQuotationDetailDto {
  @ApiProperty({
    description: 'Vehicle ID associated with the quotation item',
    example: '93c9f293-8c47-4b8e-8833-98b2ea4a96c1',
  })
  @IsUUID()
  vehicle_id!: string;

  @ApiProperty({
    description: 'Unique policy quote number',
    example: 'Q123456',
  })
  @IsString()
  policyQuoteNumber!: string;

  @ApiProperty({
    description: 'Start date of the insurance policy',
    example: '2024-01-01',
  })
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    description: 'End date of the insurance policy',
    example: '2025-01-01',
  })
  @IsDateString()
  endDate!: string;

  @ApiProperty({
    description: 'Insurance class type',
    example: 'comprehensive',
  })
  @IsString()
  insuranceClass!: string;

  @ApiProperty({
    description: 'Number of occupants covered under the insurance',
    example: 5,
  })
  @IsInt()
  @Min(1)
  nbrOfOccupantsCovered!: number;

  @ApiProperty({
    description: 'Sum insured per occupant in RWF',
    example: 1000000,
  })
  @IsInt()
  @Min(0)
  sumInsuredPerOccupant!: number;

  @ApiProperty({
    description: 'Territorial limit of the insurance',
    example: 'RWANDA',
  })
  territorialLimit!: string;

  @ApiProperty({
    description: 'Period pattern for the insurance',
    example: '1',
  })
  periodOfInsurance!: string;

  @ApiProperty({
    description: 'Period pattern for the insurance',
    example: '12',
  })
  @IsIn(['1-15', '1', '2', '3', '6', '9', '12'])
  periodPattern!: string;
}

export class CreateQuotationItemDto {
  @ApiProperty({
    description: 'Quotation Number',
    example: 'Q1234A6',
  })
  @IsString()
  quoteNumber!: string;

  @ApiProperty({
    description: 'Account ID associated with the quotation',
    example: '93c9f293-8c47-4b8e-8833-98b2ea4a96c1',
  })
  @IsUUID()
  account_id!: string;

  @ApiProperty({
    description: 'Insure ID associated with the quotation item',
    example: '2bf10e7d-7315-4f7a-8fc5-a7a75d837d0e',
  })
  @IsUUID()
  insurer_id!: string;

  @ApiProperty({
    description: 'Vehicle use ID',
    example: '550e8400-e29b-41d4-a316-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  vehicle_use_id!: string;

  created_by!: string;

  @ApiProperty({
    description: 'List of items associated with the quotation',
    type: [CreateQuotationDetailDto], // Create a DTO for the item details
  })
  items!: CreateQuotationDetailDto[];
}
