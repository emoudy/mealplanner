import { EmailService } from '../../shared/services/notifications/email.js';
import { UploadService } from '../../shared/services/upload/upload.js';
import { Logger } from '../../shared/services/logger.js';
import { AppError } from '../../shared/errors/app-error.js';

export class UserService {
  constructor(
    private storage: any, // Will be properly typed when storage is moved
    private emailService: EmailService,
    private uploadService: UploadService,
    private logger: Logger
  ) {}

  async getUser(userId: string) {
    try {
      this.logger.info('Getting user', { 
        userId, 
        domain: 'users', 
        action: 'get_user' 
      });
      
      return await this.storage.getUser(userId);
    } catch (error) {
      this.logger.error('Failed to get user', error as Error, { userId, domain: 'users' });
      throw new AppError('Failed to get user', 500);
    }
  }

  async updateProfile(userId: string, updates: any) {
    try {
      this.logger.info('Updating user profile', { 
        userId, 
        domain: 'users', 
        action: 'update_profile',
        metadata: { fieldsUpdated: Object.keys(updates) }
      });
      
      const user = await this.storage.updateUser(userId, updates);
      return user;
    } catch (error) {
      this.logger.error('Failed to update profile', error as Error, { userId, domain: 'users' });
      throw new AppError('Failed to update profile', 500);
    }
  }

  async uploadPhoto(userId: string, photoUrl: string) {
    try {
      this.logger.info('Uploading user photo', { 
        userId, 
        domain: 'users', 
        action: 'upload_photo',
        metadata: { photoUrl }
      });
      
      const user = await this.storage.updateUser(userId, {
        profileImageUrl: photoUrl
      });
      
      return user;
    } catch (error) {
      this.logger.error('Failed to upload photo', error as Error, { userId, domain: 'users' });
      throw new AppError('Failed to upload photo', 500);
    }
  }

  async sendVerificationEmail(userId: string, userEmail?: string) {
    try {
      const context = { 
        userId, 
        domain: 'users', 
        action: 'send_verification_email' 
      };

      this.logger.info('Sending verification email', context);

      let email = userEmail;
      if (!email) {
        const user = await this.storage.getUser(userId);
        email = user?.email;
      }

      if (!email) {
        throw new AppError('No email address found', 400, 'NO_EMAIL_FOUND');
      }

      const user = await this.storage.getUser(userId);
      if (user?.emailVerified) {
        throw new AppError('Email already verified', 400, 'EMAIL_ALREADY_VERIFIED');
      }

      const token = await this.storage.generateEmailVerificationToken(userId, email);
      await this.emailService.sendVerificationEmail(email, token, userId);
      
      this.logger.info('Verification email sent successfully', context);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error('Failed to send verification email', error as Error, { userId, domain: 'users' });
      throw new AppError('Failed to send verification email', 500);
    }
  }

  async verifyEmail(userId: string, token: string) {
    try {
      this.logger.info('Verifying email', { 
        userId, 
        domain: 'users', 
        action: 'verify_email' 
      });
      
      const success = await this.storage.verifyEmail(userId, token);
      
      if (success) {
        this.logger.info('Email verified successfully', { userId, domain: 'users' });
      }
      
      return success;
    } catch (error) {
      this.logger.error('Failed to verify email', error as Error, { userId, domain: 'users' });
      throw new AppError('Failed to verify email', 500);
    }
  }

  async deleteAccount(userId: string) {
    try {
      this.logger.info('Deleting user account', { 
        userId, 
        domain: 'users', 
        action: 'delete_account' 
      });
      
      // In a real app, you'd implement account deletion logic
      // For now, just log the request
      this.logger.warn('Account deletion requested', { userId, domain: 'users' });
      
      return { message: "Account deletion requested" };
    } catch (error) {
      this.logger.error('Failed to delete account', error as Error, { userId, domain: 'users' });
      throw new AppError('Failed to delete account', 500);
    }
  }
}
