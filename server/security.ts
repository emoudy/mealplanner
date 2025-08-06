import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

// Account lockout tracking (in production, use Redis)
const loginAttempts = new Map<string, { attempts: number; lockoutUntil?: number }>();

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(loginAttempts.entries());
  for (const [key, value] of entries) {
    if (value.lockoutUntil && value.lockoutUntil < now) {
      loginAttempts.delete(key);
    }
  }
}, 60 * 60 * 1000);

export function checkAccountLockout(identifier: string): boolean {
  const attempts = loginAttempts.get(identifier);
  if (!attempts) return false;
  
  if (attempts.lockoutUntil && attempts.lockoutUntil > Date.now()) {
    return true; // Account is locked
  }
  
  return false;
}

export function recordFailedLogin(identifier: string): boolean {
  const attempts = loginAttempts.get(identifier) || { attempts: 0 };
  attempts.attempts += 1;
  
  // Lock account after 5 failed attempts for 15 minutes
  if (attempts.attempts >= 5) {
    attempts.lockoutUntil = Date.now() + (15 * 60 * 1000);
    loginAttempts.set(identifier, attempts);
    return true; // Account is now locked
  }
  
  loginAttempts.set(identifier, attempts);
  return false; // Not locked yet
}

export function clearFailedLogins(identifier: string): void {
  loginAttempts.delete(identifier);
}

// Input sanitization middleware
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  function sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return validator.escape(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    } else if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  }

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  next();
}

// AI prompt safety filter
export function validatePrompt(prompt: string): { isValid: boolean; reason?: string } {
  // Block attempts to extract system prompts
  const dangerousPatterns = [
    /ignore\s+previous\s+instructions/i,
    /system\s+prompt/i,
    /you\s+are\s+now/i,
    /forget\s+everything/i,
    /new\s+instructions/i,
    /admin\s+mode/i,
    /developer\s+mode/i,
    /jailbreak/i,
    /prompt\s+injection/i,
    /</,
    />/, 
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(prompt)) {
      return { 
        isValid: false, 
        reason: 'Prompt contains potentially harmful content' 
      };
    }
  }

  // Check for excessively long prompts (potential DoS)
  if (prompt.length > 5000) {
    return { 
      isValid: false, 
      reason: 'Prompt exceeds maximum length' 
    };
  }

  return { isValid: true };
}

// Enhanced file upload validation
export function validateFileUpload(file: any): { isValid: boolean; reason?: string } {
  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return { isValid: false, reason: 'File size exceeds 5MB limit' };
  }

  // Validate MIME type
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return { isValid: false, reason: 'Invalid file type' };
  }

  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileExtension = file.originalname.toLowerCase().split('.').pop();
  
  if (!fileExtension || !allowedExtensions.includes(`.${fileExtension}`)) {
    return { isValid: false, reason: 'Invalid file extension' };
  }

  // Basic file header validation
  const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF]);
  const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47]);
  const gifHeader = Buffer.from([0x47, 0x49, 0x46]);

  if (file.mimetype === 'image/jpeg' && !file.buffer.subarray(0, 3).equals(jpegHeader)) {
    return { isValid: false, reason: 'File header does not match JPEG format' };
  }
  
  if (file.mimetype === 'image/png' && !file.buffer.subarray(0, 4).equals(pngHeader)) {
    return { isValid: false, reason: 'File header does not match PNG format' };
  }

  return { isValid: true };
}

// Security logging
export function logSecurityEvent(event: string, details: any, req?: Request) {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    details,
    ip: req?.ip,
    userAgent: req?.get('User-Agent'),
    userId: (req as any)?.user?.id,
  };
  
  console.warn('[SECURITY EVENT]', JSON.stringify(logData));
  
  // In production, send to security monitoring service
  // Example: await sendToSecurityService(logData);
}

// Request monitoring middleware
export function securityMonitoring(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  
  // Log suspicious patterns
  const suspiciousPatterns = [
    /admin/i,
    /config/i,
    /debug/i,
    /test/i,
    /\.env/i,
    /password/i,
    /secret/i,
  ];

  const url = req.url ? req.url.toLowerCase() : '';
  const body = req.body ? JSON.stringify(req.body).toLowerCase() : '';
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(body)) {
      logSecurityEvent('suspicious_request', {
        url: req.url,
        method: req.method,
        body: req.body,
        reason: 'Suspicious pattern detected'
      }, req);
      break;
    }
  }

  // Monitor request duration for potential DoS
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    if (duration > 30000) { // 30 seconds
      logSecurityEvent('slow_request', {
        url: req.url,
        method: req.method,
        duration,
      }, req);
    }
  });

  next();
}

// HTTPS redirect middleware for production
export function httpsRedirect(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === 'production' && !req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect(`https://${req.get('host')}${req.url}`);
  }
  next();
}