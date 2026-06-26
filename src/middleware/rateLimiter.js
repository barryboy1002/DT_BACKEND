import { AppError } from "../errors/AppError.js";
import logger from "../utils/logger.js";

const requestCounts = new Map();

function rateLimiter(options = {}) {

    const windowMs = options.windowMs ?? 15 * 60 * 1000;
    const max = options.max ?? 100;
    const message =
        options.message ??
        "Too many requests. Please try again later.";

    return (req, res, next) => {

        const key = req.ip;
        const now = Date.now();

        let record = requestCounts.get(key);

        if (!record) {

            record = {
                count: 0,
                resetTime: now + windowMs
            };

            requestCounts.set(key, record);
        }

        if (now > record.resetTime) {

            record.count = 0;
            record.resetTime = now + windowMs;
        }

        record.count++;

        res.setHeader("X-RateLimit-Limit", max);
        res.setHeader(
            "X-RateLimit-Remaining",
            Math.max(max - record.count, 0)
        );
        res.setHeader(
            "Retry-After",
            Math.ceil(
                (record.resetTime - now) / 1000
            )
        );

        if (record.count > max) {

            logger.warn("Rate limit exceeded", {
                ip: req.ip,
                url: req.originalUrl,
                method: req.method
            });

            return next(
                new AppError(message, 429)
            );
        }

        next();
    };
}

setInterval(() => {

    const now = Date.now();

    for (const [key, record] of requestCounts) {

        if (record.resetTime <= now) {
            requestCounts.delete(key);
        }
    }

}, 60 * 60 * 1000);

export { rateLimiter };