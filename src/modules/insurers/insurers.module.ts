import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { InsurersController } from './insurers.controller';
import { InsurersService } from './insurers.service';
import { Insurer } from '@/database/models/insurer.model';
import { InsuranceType } from '@/database/models/insurance-type.model';
import { CommonModule } from '@/common/common.module';
import { FeatureModule } from '@modules/features/feature.module';

@Module({
  imports: [
    CommonModule,
    SequelizeModule.forFeature([Insurer, InsuranceType]),
    FeatureModule,
  ],
  controllers: [InsurersController],
  providers: [InsurersService],
})
export class InsurersModule {}
