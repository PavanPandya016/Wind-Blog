class ApiError extends Error {
    static DEFAULT_MESSAGE = "Something went wrong";

    constructor(statusCode, message = ApiError.DEFAULT_MESSAGE, errors = [], stack = "") {
        super(message);

        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.errors = errors;
        this.success = false;
        this.data = null;

        stack ? (this.stack = stack) : Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message, errors) { return new ApiError(400, message, errors); }
    static unauthorized(message, errors) { return new ApiError(401, message, errors); }
    static forbidden(message, errors) { return new ApiError(403, message, errors); }
    static notFound(message, errors) { return new ApiError(404, message, errors); }
    static internal(message, errors) { return new ApiError(500, message, errors); }

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

export default ApiError;