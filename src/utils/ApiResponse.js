class ApiResponse {
    static DEFAULT_MESSAGE = "Success";

    constructor(statusCode, data = null, message = ApiResponse.DEFAULT_MESSAGE) {
        this.statusCode = statusCode;
        this.success = statusCode < 400;
        this.message = message;
        this.data = data;
    }

    static ok(data, message) { return new ApiResponse(200, data, message); }
    static created(data, message) { return new ApiResponse(201, data, message); }
    static noContent() { return new ApiResponse(204); }

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