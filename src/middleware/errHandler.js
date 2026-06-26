import { AppError } from "../errors/AppError.js";
import logger from "../utils/logger.js";

function errorHandler(err, req, res, next) {
    let error = err;

    // Log the original error
    logger.error(error.message, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        user: req.user?.userId,
        stack: error.stack
    });

    // PostgreSQL unique violation
    if (error.code === "23505") {
        error = new AppError("Duplicate value already exists.", 409);
    }

    // Foreign key violation
    else if (error.code === "23503") {
        error = new AppError("Referenced resource does not exist.", 400);
    }

    // Invalid input syntax
    else if (error.code === "22P02") {
        error = new AppError("Invalid request data.", 400);
    }

    // JWT
    else if (error.name === "JsonWebTokenError") {
        error = new AppError("Invalid authentication token.", 401);
    }

    else if (error.name === "TokenExpiredError") {
        error = new AppError("Authentication token expired.", 401);
    }

    // Unknown errors
    else if (!(error instanceof AppError)) {
        error = new AppError("Internal Server Error", 500);
    }

    const response = {
        success: false,
        error: error.message
    };

    if (error.details) {
        response.details = error.details;
    }

    if (process.env.NODE_ENV === "development") {
        response.stack = err.stack;
    }

    res.status(error.statusCode || 500).json(response);
}

export { errorHandler };