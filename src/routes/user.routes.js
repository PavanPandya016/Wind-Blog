import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import { rateLimit } from "express-rate-limit";

const router = Router();


const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many attempts. Try again after 15 minutes.",
        });
    },
});


router.route("/login").post(authLimiter, loginUser);
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

export default router;