import { EmailService } from './services/notifications/email.js';
import { SMSService } from './services/notifications/sms.js';
import { UploadService } from './services/upload/upload.js';
import { Logger } from './services/logger.js';

export class ServiceContainer {
  private services = new Map();

  constructor() {
    this.registerServices();
  }

  private registerServices() {
    // Logger
    const logger = new Logger();
    this.services.set('logger', logger);

    // Notifications
    const emailService = new EmailService();
    this.services.set('emailService', emailService);

    const smsService = new SMSService();
    this.services.set('smsService', smsService);

    // Upload
    const uploadService = new UploadService();
    this.services.set('uploadService', uploadService);
  }

  get<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }
    return service;
  }
}
