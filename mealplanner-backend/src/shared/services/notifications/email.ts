import nodemailer from 'nodemailer';
import { config } from '../../config/index.js';
import { AppError } from '../../errors/app-error.js';

export class EmailService {
  private transporter = nodemailer.createTransport({
    service: config.EMAIL_SERVICE,
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASSWORD,
    },
  });

  constructor() {
    if (!config.EMAIL_USER || !config.EMAIL_PASSWORD) {
      throw new AppError(
        'Email service not configured',
        500,
        'EMAIL_NOT_CONFIGURED'
      );
    }
  }

  async sendVerificationEmail(email: string, token: string, userId: string) {
    try {
      const verificationUrl = `${config.BASE_URL}/api/auth/verify-email?token=${token}&userId=${userId}`;
      
      const emailContent = `
        <h2>Welcome to MealPlanner!</h2>
        <p>Please verify your email address to start using all MealPlanner features:</p>
        <p><a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Verify Email Address</a></p>
        <p>Or copy and paste this link: ${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
      `;

      await this.transporter.sendMail({
        from: config.EMAIL_USER,
        to: email,
        subject: "Verify your MealPlanner email address",
        html: emailContent,
      });
    } catch (error) {
      throw new AppError(
        'Failed to send verification email',
        500,
        'EMAIL_SEND_FAILED',
        true
      );
    }
  }

  async sendRecipeEmail(email: string, recipe: any, personalMessage?: string) {
    try {
      const emailContent = `
        <h2>${recipe.title}</h2>
        <p>${recipe.description}</p>
        
        <h3>Ingredients:</h3>
        <ul>
          ${(recipe.ingredients as string[]).map(ingredient => `<li>${ingredient}</li>`).join('')}
        </ul>
        
        <h3>Instructions:</h3>
        <ol>
          ${(recipe.instructions as string[]).map(instruction => `<li>${instruction}</li>`).join('')}
        </ol>
        
        <p><strong>Cook Time:</strong> ${recipe.cookTime} minutes</p>
        <p><strong>Servings:</strong> ${recipe.servings}</p>
        
        ${personalMessage ? `<p><em>Personal message: ${personalMessage}</em></p>` : ''}
      `;

      await this.transporter.sendMail({
        from: config.EMAIL_USER,
        to: email,
        subject: `Recipe: ${recipe.title}`,
        html: emailContent,
      });
    } catch (error) {
      throw new AppError(
        'Failed to send recipe email',
        500,
        'EMAIL_SEND_FAILED',
        true
      );
    }
  }
}
