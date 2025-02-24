import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateInsurerStatusDto {
  @ApiProperty({ description: 'Active status of the insurer' })
  @IsBoolean()
  is_active!: boolean;
}
