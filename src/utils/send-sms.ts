import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SmsService {
  private readonly PINDO_API_URL = 'https://api.pindo.io/v1/sms/';
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly httpService: HttpService) {}

  async sendSMS(to: string, text: string): Promise<any> {
    try {
      const requestBody = {
        sender: process.env.PINDO_SENDER_ID, 
        to,
        text,
      };

      this.logger.log(`Sending SMS: ${JSON.stringify(requestBody)}`);

      const response = await firstValueFrom(
        this.httpService.post(this.PINDO_API_URL, requestBody, {
          headers: {
            Authorization: `Bearer ${process.env.PINDO_API_KEY}`,
            'Content-Type': 'application/json',
          },
        })
      );

      this.logger.log(`Pindo Response: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error: any) {
      this.logger.error('Pindo API Error Response:', error.response?.data || 'No response data');
      throw new Error(
        `Pindo API request failed: ${
          error.response?.data?.message || error.response?.data?.error || error.message
        }`
      );
    }
  }
}
