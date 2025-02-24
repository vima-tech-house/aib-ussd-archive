import { Injectable } from '@nestjs/common';
import Mailjet from 'node-mailjet';

@Injectable()
export class EmailService {
  private readonly mailjet = Mailjet.apiConnect(
    process.env.MAILJET_APIKEY || 'api-key',
    process.env.MAILJET_API_SECRET || 'api-secret',
  );

  private readonly senderEmail = process.env.SENDER_EMAIL || 'sender-email';
  private readonly appName =
    process.env.APP_NAME || 'Alliance Insurance Brokers';
  private readonly logoUrl =
    process.env.LOGO_URL ||
    'https://res.cloudinary.com/drdkbc9gs/image/upload/v1738184911/4a39a3e29b9aa1dc8a32156b7dced63b_mnv9ek.png';

  private getEmailHeader(): string {
    return `
          <div style="text-align: center; margin-bottom: 6px;">
            <img src="${this.logoUrl}" alt="${this.appName} Logo" style="max-width: 220px; height: auto;" />
          </div>
          <header style="text-align: center; padding: 20px; background-color: #1986C3; color: #ffffff;">
            <h1 style="font-size: 16px; margin: 0;">${this.appName}</h1>
          </header>
        `;
  }

  private getEmailFooter(): string {
    return `
          <footer style="text-align: center; padding: 20px; font-size: 12px; color: #666;">
            <p>&copy; ${new Date().getFullYear()} ${this.appName}. All rights reserved.</p>
            <p>
              <a href="#" style="color: #004a99; text-decoration: none;">Terms & Conditions</a> | 
              <a href="#" style="color: #004a99; text-decoration: none;">Privacy Policy</a>
            </p>
          </footer>
        `;
  }

  private generateEmailBody(body: string): string {
    return `
  <div style="font-family: Arial, sans-serif; color: #333; background-color: #F6F9FC;margin: 0;padding-bottom:24px">
    <div style="max-width: 800px; margin: 0 auto;">
      ${this.getEmailHeader()}
      <div style="padding: 20px; background-color: #ffffff; border: 1px solid #e0e0e0;">
          ${body}
      </div>
      ${this.getEmailFooter()}
    </div>
    </div>
`;
  }

  public async sendEmail(
    email: string,
    subject: string,
    body: string,
  ): Promise<void> {
    const fullBody = this.generateEmailBody(body);

    const request = this.mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: this.senderEmail,
            Name: this.appName,
          },
          To: [
            {
              Email: email,
            },
          ],
          Subject: subject,
          HTMLPart: fullBody,
        },
      ],
    });

    await request;
  }


  public async sendBulkEmails(
    recipients: { email: string; name?: string }[],
    subject: string,
    body: string,
  ): Promise<void> {
    if (recipients.length === 0) {
      throw new Error('Recipients list is empty');
    }

    const messages = recipients.map((recipient) => ({
      From: {
        Email: this.senderEmail,
        Name: this.appName,
      },
      To: [
        {
          Email: recipient.email,
          Name: recipient.name || 'Recipient',
        },
      ],
      Subject: subject,
      HTMLPart: this.generateEmailBody(body),
    }));

    try {
      const request = this.mailjet.post('send', { version: 'v3.1' }).request({
        Messages: messages,
      });

      await request;
      console.log(`Bulk email sent to ${recipients.length} recipients`);
    } catch (error: any) {
      console.error('Failed to send bulk emails:', error.message);
      throw new Error('Bulk email sending failed');
    }
  }

}





