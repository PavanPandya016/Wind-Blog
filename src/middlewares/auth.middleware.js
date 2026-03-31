/**
 * @module auth.middleware
 * @description Authentication middlewares for verifying user identity and protecting routes.
 * Utilizes JSON Web Tokens (JWT) for stateless authentication.
 */
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";


/**
 * Middleware to verify JSON Web Token (JWT) and authenticate user requests.
 * 
 * This middleware extracts the JWT from either the request cookies (`accessToken`) 
 * or the `Authorization` header (`Bearer <token>`). If a valid token is found, 
 * it decodes the token, fetches the associated user from the database, and 
 * attaches the user object to the request as `req.user`. If token validation fails 
 * or the user is not found, it passes an unauthorized `ApiError` to the error handler.
 *
 * @function verifyJWT
 * @async
 * @param {import('express').Request & { user?: import('../models/user.model.js').IUser }} req - Express request object (augmented with user data).
 * @param {import('express').Response} _ - Express response object (unused).
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {Promise<void>} Resolves when the token is verified and control is passed to the next middleware.
 * @throws {ApiError} 401 - If the token is missing, invalid, or the user does not exist.
 */
export const verifyJWT = asyncHandler(async (req, _, next) => {
    // 1. Extract token from cookies or the Authorization header
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    // 2. If no token is provided, deny access
    if (!token) {
        return next(ApiError.unauthorized("Unauthorized request"));
    }

    try {
        // 3. Verify and decode the JWT using the secret
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (!decodedToken?._id) {
            return next(ApiError.unauthorized("Invalid token"))
        }

        // 4. Fetch the user associated with the decoded user ID, excluding sensitive fields
        req.user = await User.findById(decodedToken._id).select("-password -refreshToken");

        // 5. If the user does not exist in the database, deny access
        if (!req.user) {
            return next(ApiError.unauthorized("Invalid token"));
        }

        // 6. Token is valid and user exists, proceed to the next middleware
        next();
    } catch (error) {
        // Catch JWT verification errors (e.g., TokenExpiredError, JsonWebTokenError)
        return next(ApiError.unauthorized(error?.message || "Invalid access token"));
    }
});
