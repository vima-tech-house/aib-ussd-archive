import { IsEnum, IsNotEmpty, IsArray, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { Feature } from '@/common/enums/feature.enum';

export class CreateNotificationDto {
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }
    return value;
  })
  @IsEnum(Feature, { message: 'Invalid feature type' })
  @IsNotEmpty({ message: 'Feature is required' })
  feature!: Feature;

  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  message!: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ message: 'Recipients must be a non-empty array' })
  recipients!: string[];

}
