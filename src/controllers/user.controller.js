import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId).select("+refreshToken");
        if (!user) throw ApiError.notFound("User not found");
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw ApiError.fromError(error, 500);
    }
}

const loginUser = asyncHandler(async (req, res, next) => {
    if (!req.body) {
        return next(ApiError.badRequest("Request body is missing"));
    }
    const { email, password } = req.body;

    if (!email || !password) {
        throw ApiError.badRequest("Email and password are required");
    }

    const user = await User.findOne({ email }).select("+password");


    if (!user) {
        throw ApiError.notFound("User not found");
    }

    if (await user.isAccountLocked()) {
        throw ApiError.tooMany("Too many failed attempts.");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        await user.handleFailedAttempt();
        throw ApiError.unauthorized("Invalid password");
    }

    await user.resetFailedAttempts();

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = user.toObject();
    delete loggedInUser.password;
    delete loggedInUser.refreshToken;

    const accessTokenOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000
    };

    const refreshTokenOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, accessTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .json(
            ApiResponse.ok({ user: loggedInUser }, "User logged in successfully")
        )
})

const logoutUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: "" } },
        { new: false }
    );
    if (!user) {
        throw ApiError.notFound("User not found");
    }

    const COOKIE_OPTIONS = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    };

    return res
        .status(200)
        .clearCookie("accessToken", COOKIE_OPTIONS)
        .clearCookie("refreshToken", COOKIE_OPTIONS)
        .json(
            ApiResponse.ok({}, "User logged out successfully")
        )
})

const refreshAccessToken = asyncHandler(async (req, res, next) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw ApiError.unauthorized("Unauthorized request")
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
        throw ApiError.unauthorized("Invalid or expired refresh token");
    }

    const user = await User.findById(decodedToken._id).select("+refreshToken");

    if (!user) {
        throw ApiError.unauthorized("Invalid refresh token");
    }
    if (user.refreshToken !== incomingRefreshToken) {
        throw ApiError.unauthorized("Unauthorized request");
    }

    const ACCESS_TOKEN_COOKIE_OPTIONS = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
    };

    const REFRESH_TOKEN_COOKIE_OPTIONS = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

    return res
        .status(200)
        .cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS)
        .cookie("refreshToken", newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS)
        .json(
            ApiResponse.ok({}, "Access token refreshed successfully")
        )
})

export { loginUser, logoutUser, refreshAccessToken }