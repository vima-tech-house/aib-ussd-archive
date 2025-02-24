import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { EmailService } from '@/utils/email-template.handler';
import { SmsService } from '@/utils/send-sms';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dtos/create-notification.dto';

@Controller('notify')
export class NotificationController {
  constructor(
    private readonly smsService: SmsService,
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationService
  ) {}

  @Post('sms')
  async sendSms(@Body() body: { to: string; text: string }) {
    const { to, text } = body;
    return this.smsService.sendSMS(to, text);
  }

  @Post('email')
  async sendEmail(@Body() body: { email: string; subject: string; message: string }) {
    await this.emailService.sendEmail(body.email, body.subject, body.message);
    return { success: true, message: 'Email sent successfully' };
  }

  @Post('bulk-email')
  async sendBulkEmails(
    @Body() body: { recipients: { email: string; name?: string }[]; subject: string; message: string },
  ) {
    await this.emailService.sendBulkEmails(body.recipients, body.subject, body.message);
    return { success: true, message: 'Bulk emails sent successfully' };
  }

  @Post('send')
  @UsePipes(new ValidationPipe({ whitelist: true })) 
  async sendNotification(@Body() body: CreateNotificationDto) {
    return this.notificationService.createNotification(body.feature, body.message, body.recipients);
  }

}
