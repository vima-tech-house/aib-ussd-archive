import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsString,
  IsInt,
  Min,
  Max,
  IsOptional,
  Matches,
  Length,
  IsEnum,
  IsBoolean,
  ValidateNested,
  IsArray,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import { IVehicleCreationAttributes } from 'interfaces/vehicle.interface';
import { VehicleEngineType, VehicleStatus } from 'common/enums/vehicle.enum';

export class CreateVehicleDto implements Partial<IVehicleCreationAttributes> {
  @ApiProperty({
    description: 'Vehicle make ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  makeId!: string;

  @ApiProperty({
    description: 'Vehicle type ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  vehicleTypeId!: string;

  @ApiPropertyOptional({
    description: 'Vehicle ID card URLs',
    example: ['https://example.com/image.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  vehicleIdentificationCardUrls!: string[]; 

  @ApiPropertyOptional({
    description: 'Account ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  accountId!: string;

  @ApiProperty({
    description: 'Vehicle plate number',
    example: 'RAA123A',
  })
  @IsNotEmpty()
  @IsString()
  plateNumber!: string;

  @ApiProperty({
    description: 'Vehicle model',
    example: 'Camry',
  })
  @IsNotEmpty()
  @IsString()
  model!: string;

  @ApiProperty({
    description: 'Vehicle year',
    example: 2023,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year!: number;

  @ApiProperty({
    description: 'Vehicle chassis number',
    example: 'JT2AE09W3P0030832',
  })
  @IsNotEmpty()
  @MinLength(11)
  @MaxLength(17)
  chassisNumber!: string;

  @ApiPropertyOptional({
    description: 'Vehicle engine number',
    example: '2AZ4000032',
  })
  @IsOptional()
  @IsString()
  engineNumber?: string;

  @ApiProperty({
    description: 'Vehicle engine type',
    enum: VehicleEngineType,
    example: VehicleEngineType.PETROL,
  })
  @IsEnum(VehicleEngineType)
  engineType!: string;

  @ApiPropertyOptional({
    description: 'Vehicle status',
    enum: VehicleStatus,
    default: VehicleStatus.PENDING,
    example: VehicleStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus = VehicleStatus.PENDING;

  @ApiProperty({
    description: 'Vehicle seating capacity',
    example: 5,
    minimum: 1,
    maximum: 100,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(100)
  seats!: number;

  @ApiPropertyOptional({
    description: 'Vehicle value in RWF',
    example: 500000000,
  })
  @IsOptional()
  @IsInt()
  value!: number;
}

export class UpdateVehicleDto extends CreateVehicleDto {}

export class VehicleQueryParamsDto {
  @ApiPropertyOptional({
    description: 'Page number',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  perPage?: number = 20;

  @ApiPropertyOptional({
    description: 'Search term for plate number, model, or chassis number',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by make ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  makeId?: string;

  @ApiPropertyOptional({
    description: 'Vehicle engine type',
    enum: VehicleEngineType,
    example: VehicleEngineType.PETROL,
  })
  @IsOptional()
  @IsEnum(VehicleEngineType)
  engineType!: VehicleEngineType;

  @ApiPropertyOptional({
    description: 'Filter by vehicle type ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  vehicleTypeId?: string;

  @ApiPropertyOptional({
    description: 'Filter by manufacturing year',
    minimum: 1900,
    maximum: new Date().getFullYear() + 1,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year?: number;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['createdAt', 'year', 'model'],
  })
  @IsOptional()
  @IsString()
  sort?: 'createdAt' | 'year' | 'model' = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: VehicleStatus,
  })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @ApiPropertyOptional({
    description: 'Include inactive vehicles',
    default: false,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value === 'true')
  @IsBoolean()
  showInactive?: boolean = false;

  @ApiPropertyOptional({
    description: 'Filter by seating capacity',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  seats?: number;
}

export class ValidateVehicleDto {
  @ApiProperty({
    description: 'Vehicle plate number',
    example: 'RAA123A',
    minLength: 3,
    maxLength: 10,
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Za-z0-9]{3,10}$/i, {
    message: 'Plate number must be 3-10 alphanumeric characters',
  })
  @Length(3, 10)
  plateNumber!: string;

  @ApiProperty({
    description: 'Vehicle chassis number to validate',
    example: 'JT2AE09W3P0030832',
  })
  @IsNotEmpty()
  @IsString()
  chassisNumber!: string;

  @ApiPropertyOptional({
    description: 'Vehicle engine number to validate',
    example: '2AZ4000032',
  })
  @IsOptional()
  @IsString()
  engineNumber!: string;

  @ApiProperty({
    description: 'Vehicle engine type',
    enum: VehicleEngineType,
    example: VehicleEngineType.PETROL,
  })
  @IsEnum(VehicleEngineType)
  engineType!: VehicleEngineType;
}

export class UpdateVehicleStatusDto {
  @ApiProperty({
    description: 'Vehicle status',
    enum: VehicleStatus,
    example: VehicleStatus.INACTIVE,
  })
  @IsNotEmpty()
  @IsEnum(VehicleStatus)
  status!: VehicleStatus;
}

export class CreateVehicleBulkDto {
  @ApiProperty({
    description: 'Array of vehicles to create',
    type: [CreateVehicleDto],
    isArray: true,
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVehicleDto)
  vehicles!: CreateVehicleDto[];
}
