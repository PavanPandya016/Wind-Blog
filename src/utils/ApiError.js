/**
 * @class ApiError
 * @extends Error
 * @description Custom error class to format API error responses consistently.
 * Extends the built-in Error class to include HTTP status codes, custom message, error details, and stack traces.
 */
class ApiError extends Error {
    static DEFAULT_MESSAGE = "Something went wrong";

    /**
     * Creates an instance of ApiError.
     * 
     * @param {number} statusCode - The HTTP status code associated with the error (e.g., 400, 404, 500).
     * @param {string} [message=ApiError.DEFAULT_MESSAGE] - The user-friendly error message to be displayed.
     * @param {Array<any>} [errors=[]] - An array of detailed errors or validation issues.
     * @param {string} [stack=""] - The error stack trace. If not provided, it will be auto-generated.
     */
    constructor(statusCode, message = ApiError.DEFAULT_MESSAGE, errors = [], stack = "") {
        super(message);

        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.errors = errors;
        this.success = false;
        this.data = null;

        stack ? (this.stack = stack) : Error.captureStackTrace(this, this.constructor);
    }

    /**
     * Creates a 400 Bad Request error.
     * @param {string} [message] - Custom error message.
     * @param {Array<any>} [errors] - Specific error details.
     * @returns {ApiError} An initialized ApiError instance with a 400 status.
     */
    static badRequest(message, errors) { return new ApiError(400, message, errors); }

    /**
     * Creates a 401 Unauthorized error.
     * @param {string} [message] - Custom error message.
     * @param {Array<any>} [errors] - Specific error details.
     * @returns {ApiError} An initialized ApiError instance with a 401 status.
     */
    static unauthorized(message, errors) { return new ApiError(401, message, errors); }

    /**
     * Creates a 403 Forbidden error.
     * @param {string} [message] - Custom error message.
     * @param {Array<any>} [errors] - Specific error details.
     * @returns {ApiError} An initialized ApiError instance with a 403 status.
     */
    static forbidden(message, errors) { return new ApiError(403, message, errors); }

    /**
     * Creates a 404 Not Found error.
     * @param {string} [message] - Custom error message.
     * @param {Array<any>} [errors] - Specific error details.
     * @returns {ApiError} An initialized ApiError instance with a 404 status.
     */
    static notFound(message, errors) { return new ApiError(404, message, errors); }

    /**
     * Creates a 500 Internal Server error.
     * @param {string} [message] - Custom error message.
     * @param {Array<any>} [errors] - Specific error details.
     * @returns {ApiError} An initialized ApiError instance with a 500 status.
     */
    static internal(message, errors) { return new ApiError(500, message, errors); }

    /**
     * Serializes the ApiError instance into a JSON object.
     * Ensures consistent error response structure and omits stack trace in non-development environments.
     * 
     * @returns {Object} JSON representation format of the error.
     */
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