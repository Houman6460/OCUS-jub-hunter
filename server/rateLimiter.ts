import rateLimit from 'express-rate-limit';

// OpenAI Chat rate limiter - more restrictive to prevent abuse
export const chatRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 chat requests per windowMs
  message: {
    error: 'Too many chat requests. Please wait before sending another message.',
    retryAfter: 15 * 60 // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests. Please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for sensitive operations
export const strictRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many requests for this operation. Please wait before trying again.',
    retryAfter: 5 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});