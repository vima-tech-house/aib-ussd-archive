import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FeatureController } from './feature.controller';
import { FeatureService } from './feature.service'
import { Feature } from '@database/models/feature.model';
import { Action } from '@database/models/action.model';
import { UserFeatureController } from './user-features/user-feature.controller';
import { UserFeatureService } from './user-features/user-feature.service';
import { User } from '@database/models/user.model';
import { UserFeatureAction } from '@database/models/user-feature-action.model';
import { ResponseHelper } from '@/common/helpers/response.helper';

@Module({
  imports: [
    SequelizeModule.forFeature([Feature, Action, User, UserFeatureAction]),
  ],
  controllers: [FeatureController, UserFeatureController],
  providers: [FeatureService, UserFeatureService, ResponseHelper],
  exports: [FeatureService, UserFeatureService, SequelizeModule],
})
export class FeatureModule {}
