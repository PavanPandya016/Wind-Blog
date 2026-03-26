import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

/**
 * @typedef {Object} IUser
 * @property {string} email - The user's unique email address.
 * @property {string} password - The hashed password for authentication.
 * @property {string} [refreshToken] - The JWT refresh token for maintaining sessions.
 * @property {string} role - The user's role ("admin" or "user").
 * @property {number} attempts - Number of consecutive failed login attempts.
 * @property {Date} [lastAttempt] - Timestamp of the last failed login attempt.
 * @property {boolean} isBlocked - Indicates if the account is temporarily locked due to failed attempts.
 * @property {Date} [blockedUntil] - Timestamp until which the account remains locked.
 */

/**
 * User Schema Definition
 * Represents a user within the system, managing authentication, roles, and security features like account locking.
 * 
 * @type {Schema<IUser>}
 */
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    refreshToken: {
        type: String,
        select: false,
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
    },
    attempts: {
        type: Number,
        default: 0,
    },
    lastAttempt: {
        type: Date,
        default: null,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    blockedUntil: {
        type: Date,
        default: null,
    },
},
    { timestamps: true }
);

const SALT_ROUND = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

/**
 * Pre-save middleware to securely hash the user's password before persisting to the database.
 * Skips hashing if the password field has not been modified.
 * 
 * @param {import("mongoose").CallbackWithoutResultAndOptionalError} next - Callback to proceed to the next middleware or save operation.
 * @returns {Promise<void>}
 */
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, SALT_ROUND);
    next();
})

/**
 * Compares a plain-text password against the user's stored hashed password.
 * 
 * @param {string} password - The plain-text password to verify.
 * @returns {Promise<boolean>} Resolves to true if passwords match, false otherwise.
 */
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

/**
 * Generates a short-lived JSON Web Token (JWT) for API authentication.
 * The token payload includes the user's ID, email, and role.
 * 
 * @returns {string} The signed JWT access token.
 */
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            role: this.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )
}

/**
 * Generates a long-lived JSON Web Token (JWT) for session persistence.
 * Used to securely acquire a new access token without requiring re-authentication.
 * 
 * @returns {string} The signed JWT refresh token.
 */
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            role: this.role,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    )
}

/**
 * Checks whether the user's account is currently locked due to too many failed login attempts.
 * Automatically lifts the block if the lockout duration has expired.
 * 
 * @returns {Promise<boolean>} Resolves to true if the account is locked, false if active.
 */
userSchema.methods.isAccountLocked = async function () {
    if (this.isBlocked) {
        const now = Date.now();
        if (this.blockedUntil && now < this.blockedUntil.getTime()) {
            return true;
        }
        await this.constructor.updateOne({ _id: this._id }, {
            isBlocked: false, attempts: 0, lastAttempt: null, blockedUntil: null
        });
        return false;
    }
    return false;
}

/**
 * Increments the user's failed login attempts and locks the account if the maximum threshold is reached.
 * 
 * @param {number} [maxAttempts=5] - The maximum number of failed attempts allowed before locking.
 * @param {number} [lockDuration=900000] - Lockout duration in milliseconds (default: 15 minutes).
 * @returns {Promise<void>}
 */
userSchema.methods.handleFailedAttempt = async function (maxAttempts = 5, lockDuration = 15 * 60 * 1000) {
    const newAttempts = this.attempts + 1;
    const update = {
        $inc: { attempts: 1 },
        lastAttempt: new Date(),
    };

    if (newAttempts >= maxAttempts) {
        update.isBlocked = true;
        update.blockedUntil = new Date(Date.now() + lockDuration);
    }

    await this.constructor.updateOne({ _id: this._id }, update);
};

/**
 * Resets the failed login attempts and clears any active account locks.
 * Typically invoked after a successful login to restore account standing.
 * 
 * @returns {Promise<void>}
 */
userSchema.methods.resetFailedAttempts = async function () {
    if (this.attempts > 0) {
        await this.constructor.updateOne({ _id: this._id }, {
            attempts: 0, lastAttempt: null, isBlocked: false, blockedUntil: null
        });
    }
};

/**
 * User Model
 * Provides the interface for querying and manipulating User documents in the database.
 * 
 * @type {mongoose.Model<IUser>}
 */
export const User = mongoose.model("User", userSchema);
