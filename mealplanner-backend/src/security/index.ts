// Security middleware and monitoring
export function securityMonitoring(req: any, res: any, next: any) {
  // Basic security logging
  if (process.env.NODE_ENV === 'production') {
    console.log(`Security log: ${req.method} ${req.url} from ${req.ip}`);
  }
  next();
}

export function httpsRedirect(req: any, res: any, next: any) {
  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
}
