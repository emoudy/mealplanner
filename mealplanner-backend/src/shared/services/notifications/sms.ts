import { config } from '../../config/index.js';
import { AppError } from '../../errors/app-error.js';

export class SMSService {
  private client: any;

  constructor() {
    if (config.TWILIO_ACCOUNT_SID && config.TWILIO_AUTH_TOKEN) {
      this.client = require('twilio')(
        config.TWILIO_ACCOUNT_SID,
        config.TWILIO_AUTH_TOKEN
      );
    }
  }

  async sendRecipeSMS(phoneNumber: string, recipe: any, personalMessage?: string) {
    if (!this.client) {
      throw new AppError('SMS service not configured', 500, 'SMS_NOT_CONFIGURED');
    }

    try {
      const smsContent = `${recipe.title}\n\n${recipe.description}\n\nGet the full recipe at: ${config.BASE_URL}/recipes/${recipe.id}${personalMessage ? `\n\n${personalMessage}` : ''}`;

      await this.client.messages.create({
        body: smsContent,
        from: config.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });
    } catch (error) {
      throw new AppError(
        'Failed to send SMS',
        500,
        'SMS_SEND_FAILED',
        true
      );
    }
  }
}
