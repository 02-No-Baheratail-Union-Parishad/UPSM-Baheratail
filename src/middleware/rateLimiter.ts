import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const windowMs = 15 * 60 * 1000; // 15 minutes window
const maxRequests = 100; // Max 100 requests per window per IP
const ipStore = new Map<string, RateLimitRecord>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipStore.entries()) {
    if (now > record.resetTime) {
      ipStore.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref();

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
  const now = Date.now();

  const record = ipStore.get(ip);

  if (!record || now > record.resetTime) {
    ipStore.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return next();
  }

  if (record.count >= maxRequests) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'আপনি অতিরিক্ত অনুরোধ পাঠিয়েছেন। অনুগ্রহ করে পরে চেষ্টা করুন।',
      retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000)
    });
  }

  record.count += 1;
  next();
};
