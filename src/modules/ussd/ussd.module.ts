import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UssdController } from './ussd.controller';
import { UssdService } from './ussd.service';
import { UssdSession } from '@database/models/ussd-session.model';
import { User } from '@database/models/user.model';

@Module({
  imports: [SequelizeModule.forFeature([UssdSession, User])],
  controllers: [UssdController],
  providers: [UssdService],
})
export class UssdModule {}
