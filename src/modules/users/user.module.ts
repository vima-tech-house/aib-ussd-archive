import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersService } from './user.service';
import { User } from '@database/models/user.model';
import { UserController } from './user.controller';
import { ResponseHelper } from '@/common/helpers/response.helper';
import { FeatureModule } from '@modules/features/feature.module';
import { EmailService } from '@/utils/email-template.handler';
import { JwtService } from '@nestjs/jwt';
import { Account } from '@database/models/account.model';

@Module({
  imports: [SequelizeModule.forFeature([User, Account]), FeatureModule],
  controllers: [UserController],
  providers: [UsersService, ResponseHelper, EmailService, JwtService],
  exports: [UsersService],
})
export class UserModule {}
