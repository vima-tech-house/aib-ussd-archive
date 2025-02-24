import { ApiProperty } from '@nestjs/swagger';
import { UserAttributes } from 'interfaces/user.interface';

export class UserResponseDto implements Partial<UserAttributes> {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  first_name!: string;

  @ApiProperty()
  last_name!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  role!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  phone_number!: string;

  @ApiProperty()
  institution_id!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
