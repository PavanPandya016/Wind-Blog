/**
 * @class ApiResponse
 * @description Standardized API response class to ensure consistent response structures across the application.
 */
class ApiResponse {
    static DEFAULT_MESSAGE = "Success";

    /**
     * Creates an instance of ApiResponse.
     * 
     * @param {number} statusCode - The HTTP status code (e.g., 200, 201). Values < 400 are considered successful.
     * @param {any} [data=null] - The payload data to be sent in the response.
     * @param {string} [message=ApiResponse.DEFAULT_MESSAGE] - The success message associated with the response.
     */
    constructor(statusCode, data = null, message = ApiResponse.DEFAULT_MESSAGE) {
        this.statusCode = statusCode;
        this.success = statusCode < 400;
        this.message = message;
        this.data = data;
    }

    /**
     * Helper to create a 200 OK success response.
     * @param {any} data - The payload to be returned.
     * @param {string} [message] - Custom success message.
     * @returns {ApiResponse} An initialized ApiResponse instance with a 200 status.
     */
    static ok(data, message) { return new ApiResponse(200, data, message); }

    /**
     * Helper to create a 201 Created success response.
     * @param {any} data - The created payload to be returned.
     * @param {string} [message] - Custom success message.
     * @returns {ApiResponse} An initialized ApiResponse instance with a 201 status.
     */
    static created(data, message) { return new ApiResponse(201, data, message); }

    /**
     * Helper to create a 204 No Content success response.
     * Used typically when an action has succeeded but there's nothing to return (e.g., a DELETE request).
     * @returns {ApiResponse} An initialized ApiResponse instance with a 204 status.
     */
    static noContent() { return new ApiResponse(204); }

    /**
     * Serializes the ApiResponse instance into a JSON object.
     * 
     * @returns {Object} JSON representation format of the success response.
     */
    toJSON() {
        return {
            success: this.success,
            statusCode: this.statusCode,
            message: this.message,
            data: this.data,
        };
    }
}

export { ApiResponse };