import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { Account } from '@database/models/account.model';
import { CommonModule } from '@/common/common.module';
import { User } from '@database/models/user.model';
import { Institution } from '@database/models/institution.model';

@Module({
  imports: [
    CommonModule,
    SequelizeModule.forFeature([Account, User, Institution]),
  ],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
