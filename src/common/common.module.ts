import { Module } from '@nestjs/common';
import { ResponseHelper } from './helpers/response.helper';

@Module({
  providers: [ResponseHelper],
  exports: [ResponseHelper],
})
export class CommonModule {}
