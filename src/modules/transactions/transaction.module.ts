import { Module } from '@nestjs/common';
import { ResponseHelper } from '@/common/helpers/response.helper';
import { SequelizeModule } from '@nestjs/sequelize';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { Transactions } from '@database/models/transaction.model';

@Module({
  imports: [SequelizeModule.forFeature([Transactions])],
  controllers: [TransactionController],
  providers: [TransactionService, ResponseHelper],
  exports: [TransactionService, SequelizeModule],
})
export class TransactionModule {}
