import { VehicleEngineType } from '@/common/enums/vehicle.enum';
import { ApiProperty } from '@nestjs/swagger';

export class VehicleMakeResponse {
  @ApiProperty({ example: 'uuid-here' })
  id!: string;

  @ApiProperty({ example: 'Toyota' })
  name!: string;
}

export class VehicleTypeResponse {
  @ApiProperty({ example: 'uuid-here' })
  id!: string;

  @ApiProperty({ example: 'SUV' })
  name!: string;

  @ApiProperty({ example: 'SUV_PRIVATE' })
  code!: string;
}

export class VehicleResponse {
  @ApiProperty({ example: 'uuid-here' })
  id!: string;

  @ApiProperty({ example: 'uuid-here' })
  userId!: string;

  @ApiProperty({ type: VehicleMakeResponse })
  make!: VehicleMakeResponse;

  @ApiProperty({ type: VehicleTypeResponse })
  vehicleType!: VehicleTypeResponse;

  @ApiProperty({ example: 'RAA123A' })
  plateNumber!: string;

  @ApiProperty({ example: 'Camry' })
  model!: string;

  @ApiProperty({ example: 2023 })
  year!: number;

  @ApiProperty({ example: 'CHASSIS123456' })
  chassisNumber!: string;

  @ApiProperty({ example: 'ENG123456' })
  engineNumber!: string;

  @ApiProperty({ example: VehicleEngineType.PETROL })
  engineType!: string;

  // @ApiProperty({ example: 5 })
  // seats!: number;

  @ApiProperty({ example: '2024-01-15T12:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-15T12:00:00Z' })
  updatedAt!: Date;
}
