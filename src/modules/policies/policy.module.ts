import { Module } from '@nestjs/common';
import { ResponseHelper } from '@/common/helpers/response.helper';
import { SequelizeModule } from '@nestjs/sequelize';
import { Policy } from '@database/models/policy.model';
import { PolicyService } from './policy.service';
import { PolicyController } from './policy.controller';
import { Account } from '@database/models/account.model';
import { Insurer } from '@database/models/insurer.model';
import { QuotationItem } from '@database/models/quotation-item.model';
import { Transactions } from '@database/models/transaction.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Policy, Account, Insurer, QuotationItem, Transactions]),
  ],
  controllers: [PolicyController],
  providers: [PolicyService, ResponseHelper],
  exports: [PolicyService, SequelizeModule],
})
export class PolicyModule {}
