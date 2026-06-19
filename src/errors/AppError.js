class AppError extends  Error {
    constructor(message, statusCode){
        super(message);

        this.statusCode = statusCode;
        this.name = this.constructor.name;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);

    }
}

export {AppError};