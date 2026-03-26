/**
 * @callback ExpressMiddleware
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {Promise<any> | any}
 */

/**
 * Higher-order utility function to catch errors in async route handlers and seamlessly pass them to Express error-handling middleware.
 * Prevents unhandled promise rejections by wrapping async route logic.
 * 
 * @param {ExpressMiddleware} fn - The asynchronous handler function (controller) to be wrapped.
 * @returns {ExpressMiddleware} A standard Express middleware function wrapped with promise resolution and error catching.
 */
const asyncHandler = (fn) =>
    (req, res, next) =>
        Promise.resolve(fn(req, res, next)).catch(next);

export { asyncHandler };