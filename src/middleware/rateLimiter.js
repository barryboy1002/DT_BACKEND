import { AppError } from "../errors/AppError.js";

// Simple in-memory rate limiter
// For production, use Redis-based solution like express-rate-limit with Redis store
const requestCounts = new Map();

function rateLimiter(options = {}) {
    const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
    const maxRequests = options.max || 100;
    const message = options.message || "Too many requests, please try again later.";

    return (req, res, next) => {
        const key = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        if (!requestCounts.has(key)) {
            requestCounts.set(key, { count: 1, resetTime: now + windowMs });
            return next();
        }

        const record = requestCounts.get(key);
        
        if (now > record.resetTime) {
            record.count = 1;
            record.resetTime = now + windowMs;
            return next();
        }

        if (record.count >= maxRequests) {
            throw new AppError(message, 429);
        }

        record.count++;
        next();
    };
}

// Cleanup old entries every hour
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of requestCounts.entries()) {
        if (now > record.resetTime) {
            requestCounts.delete(key);
        }
    }
}, 60 * 60 * 1000);

export { rateLimiter };
