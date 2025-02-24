import { ApiProperty } from '@nestjs/swagger';

export class InsurerResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ required: false })
  avatar_url?: string;

  @ApiProperty()
  phone_number!: string;

  @ApiProperty({ required: false })
  address?: string;

  @ApiProperty()
  contact_person!: string;

  @ApiProperty()
  is_active!: boolean;

  @ApiProperty()
  created_at!: Date;

  @ApiProperty()
  updated_at!: Date;
}
