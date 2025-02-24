import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BullModule } from '@nestjs/bull';
import { VehicleMakesController } from './vehicle-makes/vehicle-makes.controller';
import { VehicleTypesController } from './vehicle-types/vehicle-types.controller';
import { VehicleMakesService } from './vehicle-makes/vehicle-makes.service';
import { VehicleTypesService } from './vehicle-types/vehicle-type.service';
import { VehiclesService } from './vehicle.service';
import { VehiclesController } from './vehicle.controller';
import { VehicleUploadProcessor } from './processors/vehicle-upload.processor';
import { SocketModule } from '@modules/socket/socket.module';
import { SocketLogger } from '@modules/socket/socker.logger';
import { CommonModule } from '@/common/common.module';
import { FeatureModule } from '@modules/features/feature.module';
import { Account } from '@database/models/account.model';
import { VehicleMake } from '@database/models/vehicle-make.model';
import { VehicleType } from '@database/models/vehicle-types.model';
import { Vehicle } from '@database/models/vehicle.model';
import { VehicleUse } from '@database/models/vehicle-use.model';
import { VehicleUseController } from './vehicle-use/vehicle-use.controller';
import { VehicleUseService } from './vehicle-use/vehicle-use.service';

@Module({
  imports: [
    CommonModule,
    SocketModule,
    SequelizeModule.forFeature([
      VehicleMake,
      VehicleType,
      Vehicle,
      Account,
      VehicleUse,
    ]),
    BullModule.registerQueue({
      name: 'vehicle-upload',
    }),
    FeatureModule,
  ],
  controllers: [
    VehicleMakesController,
    VehicleTypesController,
    VehicleUseController,
    VehiclesController,
  ],
  providers: [
    VehicleMakesService,
    VehicleTypesService,
    VehicleUseService,
    VehiclesService,
    VehicleUploadProcessor,
    SocketLogger,
  ],
})
export class VehiclesModule {}
