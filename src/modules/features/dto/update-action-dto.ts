import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class UpdateActionsDto {
  @ApiProperty({
    description: 'Array of action IDs to add to the feature',
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
    ],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  addActionIds!: string[];

  @ApiProperty({
    description: 'Array of action IDs to remove from the feature',
    example: [
      '550e8400-e29b-41d4-a716-446655440002',
      '550e8400-e29b-41d4-a716-446655440003',
    ],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  removeActionIds!: string[];
}
