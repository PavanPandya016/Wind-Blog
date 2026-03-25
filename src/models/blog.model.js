import mongoose, { Schema, Types } from "mongoose";

const blogSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 100,
    },
    content: {
        type: Schema.Types.Mixed,
        required: true,
    },
    author: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
    slug: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    excerpt: {
        type: String,
        required: true,
        maxlength: 200,
    },
    featuredImage: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
        required: true,
        validate: {
            validator: function (v) { return v.length >= 1 && v.length <= 10 },
            message: "Tags must be between 1 and 10",
        }
    },
    status: {
        type: String,
        enum: ["draft", "published"],
        default: "draft",
    },
    publishedAt: {
        type: Date,
        default: null,
    },
    views: {
        type: Number,
        default: 0,
    },
    readTime: {
        type: Number,
        default: 0,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    // no category because it personal blog website and just casual blogging

}, { timestamps: true })

blogSchema.index({ status: 1, isDeleted: 1, createdAt: -1 });
// no author because there is only one user (admin)

blogSchema.pre("save", async function (next) {
    if (this.status === "published" && !this.publishedAt) {
        this.publishedAt = new Date();
    }

    if (this.isModified("title")) {
        const baseSlug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        let slug = baseSlug;
        let exists = await this.constructor.findOne({
            slug,
            _id: { $ne: this._id }
        });

        if (exists) {
            slug = `${baseSlug}-${Date.now()}`;
        }

        this.slug = slug;
    }
    if (this.isModified("content") && !this.excerpt) {
        const text = JSON.stringify(this.content);
        this.excerpt = text.slice(0, 150);
    }
    next();
})

blogSchema.pre(/^find/, function (next) {
    this.where({ isDeleted: false });
    next();
});

export const Blog = mongoose.model("Blog", blogSchema);
