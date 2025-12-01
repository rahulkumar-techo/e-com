import rateLimit from 'express-rate-limit';

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,    // 15 minutes
  max: 10,                     // Only 10 attempts
  message: 'Too many attempts, please try again in 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    // automatically blcock the request and send custom response
    res.status(429).json({
      success: false,
      message: 'Too many attempts, please try again in 15 minutes.'
    });
  },
  keyGenerator: (req):any => {
    // Use IP address as the key
    return req.ip;
  }
});
