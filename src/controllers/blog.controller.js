import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Blog } from "../models/blog.model.js";

const getAllBlogs = asyncHandler(async (req, res) => {
    const blogs = await Blog.find({ status: "published" })
        .select("title slug excerpt featuredImage tags readTime views publishedAt")
        .lean()
        .sort({ createdAt: -1 }); // uses your compound index: { status, isDeleted, createdAt }

    if (!blogs.length) {
        throw ApiError.notFound("No blogs found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, blogs, "Blogs fetched successfully")
        );
});

export { getAllBlogs };