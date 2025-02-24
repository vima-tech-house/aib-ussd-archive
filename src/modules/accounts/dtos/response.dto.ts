import { ApiProperty } from '@nestjs/swagger';

export class AccountResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ required: false })
  userId!: string | null;

  @ApiProperty({ required: false })
  institutionId!: string | null;

  @ApiProperty({ enum: ['private', 'government'] })
  accountType!: string;

  @ApiProperty({ enum: ['active', 'inactive'] })
  status!: string;

  @ApiProperty()
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: string;
  };

  @ApiProperty()
  institution?: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    tin: string;
  };
}
