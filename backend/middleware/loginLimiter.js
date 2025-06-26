const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10, // tối đa 10 lần login trong 15 phút
  message: { error: 'Too many login attempts, please try again later.' }
});

module.exports = loginLimiter;