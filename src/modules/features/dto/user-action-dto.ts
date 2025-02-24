import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class UserActionsDto {
  @ApiProperty({
    description: 'Array of actions to add or remove for specific features.',
    example: [
      {
        featuredId: '550e8400-e29b-41d4-a716-446655440000',
        addActionIds: [
          '550e8400-e29b-41d4-a716-446655440001',
          '550e8400-e29b-41d4-a716-446655440002',
        ],
        removeActionIds: [
          '550e8400-e29b-41d4-a716-446655440003',
        ],
      },
      {
        featuredId: '550e8400-e29b-41d4-a716-446655440004',
        addActionIds: [
          '550e8400-e29b-41d4-a716-446655440005',
        ],
        removeActionIds: [
          '550e8400-e29b-41d4-a716-446655440006',
        ],
      },
    ],
    type: () => [UserAction],
  })
  @IsArray()
  featuredActions: UserAction[] = [];
}

class UserAction {
  @ApiProperty({
    description: 'The feature ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  featuredId!: string;

  @ApiProperty({
    description: 'Array of action IDs to add to the feature',
    example: [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
    ],
  })
  @IsArray()
  @IsString({ each: true })
  addActionIds!: string[];

  @ApiProperty({
    description: 'Array of action IDs to remove from the feature',
    example: [
      '550e8400-e29b-41d4-a716-446655440003',
    ],
  })
  @IsArray()
  @IsString({ each: true })
  removeActionIds!: string[];
}
