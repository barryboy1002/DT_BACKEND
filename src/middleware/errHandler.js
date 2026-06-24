import { AppError } from "../errors/AppError.js";
export function errorHandler(err, req, res, next){
    console.error(err);

    res.status(err.statusCode || 500).json({
        success:false,
        error: err.message || "Internal Server Error"
    });
}
