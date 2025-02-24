import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { InstitutionController } from './insurance-type.controller';
import { InsuranceTypeService } from './insurance-type.service';
import { InsuranceType } from '@database/models/insurance-type.model';

@Module({
  imports: [SequelizeModule.forFeature([InsuranceType])],
  controllers: [InstitutionController],
  providers: [InsuranceTypeService],
  exports: [],
})
export class InsuranceTypeModule {}
