class ApiError extends Error {
    static DEFAULT_MESSAGE = "Something went wrong";

    constructor(statusCode, message = ApiError.DEFAULT_MESSAGE, errors = [], stack = "") {
        super(message);

        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.errors = Array.isArray(errors) ? errors : errors ? [errors] : [];
        this.success = false;
        this.data = null;
        this.isOperational = true;

        stack ? (this.stack = stack) : Error.captureStackTrace(this, this.constructor);
    }

    // 4xx - Client errors
    static badRequest(message, errors) { return new ApiError(400, message, errors); }
    static unauthorized(message, errors) { return new ApiError(401, message, errors); }
    static forbidden(message, errors) { return new ApiError(403, message, errors); }
    static notFound(message, errors) { return new ApiError(404, message, errors); }
    static conflict(message, errors) { return new ApiError(409, message, errors); }
    static unprocessable(message, errors) { return new ApiError(422, message, errors); }
    static tooMany(message, errors) { return new ApiError(429, message, errors); }

    // 5xx - Server errors
    static internal(message, errors) { return new ApiError(500, message, errors); }
    static serviceUnavailable(message, errors) { return new ApiError(503, message, errors); }

    // Wrap any native/third-party error into ApiError
    static fromError(error, statusCode = 500) {
        return new ApiError(statusCode, error.message, [], error.stack);
    }

    toJSON() {
        return {
            success: this.success,
            statusCode: this.statusCode,
            message: this.message,
            errors: this.errors,
            data: this.data,
            ...(process.env.NODE_ENV === "development" && { stack: this.stack }),
        };
    }
}

export { ApiError };