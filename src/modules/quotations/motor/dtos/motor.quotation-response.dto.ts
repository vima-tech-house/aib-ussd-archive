import { ApiProperty } from '@nestjs/swagger';

export class MotorQuotationResponseDto {
  @ApiProperty({ description: 'Subtotal amount', example: 100000 })
  subtotal!: number;

  @ApiProperty({ description: 'VAT amount', example: 18000 })
  vat!: number;

  @ApiProperty({ description: 'Total amount', example: 118000 })
  total!: number;
}
