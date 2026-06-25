import { AppError } from "../errors/AppError.js";

function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    let error = err;

    // Normalize unknown errors - don't leak internal details
    if (!(error instanceof AppError)) {
        // Log the actual error for debugging
        console.error('Unhandled error:', err.stack);
        error = new AppError("Internal Server Error", 500);
    }

    // In production, don't send stack traces
    const response = {
        success: false,
        error: error.message,
        ...(error.details && { details: error.details })
    };

    // Only include stack trace in development
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    res.status(error.statusCode).json(response);
}

export { errorHandler };