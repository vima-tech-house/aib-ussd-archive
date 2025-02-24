import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NotificationController } from './notification.controller';
import { EmailService } from '@/utils/email-template.handler';
import { SmsService } from '@/utils/send-sms';
import { NotificationService } from './notification.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Notification } from '@database/models/notification.model';
import { SocketModule } from '@modules/socket/socket.module'; 

@Module({
  imports: [
    HttpModule,
    SequelizeModule.forFeature([Notification]),
    forwardRef(() => SocketModule), 
  ],
  providers: [SmsService, EmailService, NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
