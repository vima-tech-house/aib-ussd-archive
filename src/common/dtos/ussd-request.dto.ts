import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UssdRequestDto {
  @ApiProperty({
    description: 'The unique session ID for this USSD session',
    example: 'ATxxx123456789',
  })
  @IsNotEmpty()
  @IsString()
  sessionId!: string;

  @ApiProperty({
    description: 'Phone number of the user',
    example: '+254712345678',
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber!: string;

  @ApiProperty({
    description: 'The input text from the user',
    example: '1*John*Doe*12345*1234*1234',
  })
  @IsString()
  text!: string;

  @ApiProperty({
    description: 'The USSD service code',
    example: '*123#',
  })
  @IsNotEmpty()
  @IsString()
  serviceCode!: string;
}
