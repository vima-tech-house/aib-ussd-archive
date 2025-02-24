import { Module } from '@nestjs/common';
import { MotorQuotationController } from './motor/motor.quotation.controller';
import { MotorQuotationService } from './motor/motor.quotation.service';
import { ResponseHelper } from '@/common/helpers/response.helper';
import { CommonModule } from '@/common/common.module';
import { MotorQuotationsModule } from './motor/motor.quotation.module';

@Module({
  imports: [CommonModule, MotorQuotationsModule],
  controllers: [MotorQuotationController],
  providers: [MotorQuotationService, ResponseHelper],
})
export class QuotationsModule {}
