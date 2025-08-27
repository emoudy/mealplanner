import { z } from 'zod';

const configSchema = z.object({
  // Database
  DATABASE_URL: z.string().optional(),
  
  // Email (from your routes.ts lines 14-22)
  EMAIL_SERVICE: z.string().default('gmail'),
  EMAIL_USER: z.string(),
  EMAIL_PASSWORD: z.string(),
  
  // SMS (from your routes.ts lines 24-28)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  
  // Upload (from your routes.ts lines 32-40)
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.string().default('5MB'),
  
  // AI
  ANTHROPIC_API_KEY: z.string().optional(),
  
  // App
  BASE_URL: z.string().default('http://localhost:3001'),
  SESSION_SECRET: z.string().default('your-session-secret'),
  NODE_ENV: z.string().default('development'),
});

export type Config = z.infer<typeof configSchema>;

export const config: Config = configSchema.parse(process.env);
