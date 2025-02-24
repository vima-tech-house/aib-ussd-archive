import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { InstitutionController } from './institution.controller';
import { InstitutionService } from './institution.service';
import { Institution } from '@database/models/institution.model';
import { Account } from '@database/models/account.model';
import { FeatureModule } from '@modules/features/feature.module';
import { PermissionsGuard } from '@/common/guards/permission.guard';
import { UserFeatureService } from '@modules/features/user-features/user-feature.service';
import { ResponseHelper } from '@/common/helpers/response.helper';

@Module({
  imports: [SequelizeModule.forFeature([Institution, Account]), FeatureModule],
  controllers: [InstitutionController],
  providers: [
    InstitutionService,
    PermissionsGuard,
    UserFeatureService,
    ResponseHelper,
  ],
  exports: [InstitutionService],
})
export class InstitutionModule {}
