import { Router } from "express";
import { getAllBlogs } from "../controllers/blog.controller.js";
import { rateLimit } from "express-rate-limit";

const router = Router();


const blogLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again after 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
});

router.route("/").get(blogLimiter, getAllBlogs);

export default router;