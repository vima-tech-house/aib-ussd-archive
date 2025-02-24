import { Module } from '@nestjs/common';
import { MotorQuotationController } from './motor.quotation.controller';
import { MotorQuotationService } from './motor.quotation.service';
import { ResponseHelper } from '@/common/helpers/response.helper';
import { SequelizeModule } from '@nestjs/sequelize';
import { QuotationItem } from '@database/models/quotation-item.model';
import { Quotation } from '@database/models/quotation.model';
import { Vehicle } from '@database/models/vehicle.model';
import { Account } from '@database/models/account.model';
import { Insurer } from '@database/models/insurer.model';
import { Transactions } from '@database/models/transaction.model';
import { Policy } from '@database/models/policy.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      QuotationItem,
      Quotation,
      Vehicle,
      Account,
      Insurer,
      Transactions,
      Policy,
    ]),
  ],
  controllers: [MotorQuotationController],
  providers: [MotorQuotationService, ResponseHelper],
  exports: [MotorQuotationService, SequelizeModule],
})
export class MotorQuotationsModule {}
