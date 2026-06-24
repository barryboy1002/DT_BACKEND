import { AppError } from "../errors/AppError.js";

function errorHandler(err, req, res, next) {

    let error = err;

    // Normalize unknown errors
    if (!(error instanceof AppError)) {
        error = new AppError("Internal Server Error", 500);
    }

    res.status(error.statusCode).json({
        success: false,
        error: error.message,
        ...(error.details && { details: error.details })
    });
}

export { errorHandler };