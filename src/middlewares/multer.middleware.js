/**
 * @module multer.middleware
 * @description Middleware for handling `multipart/form-data`, primarily used for uploading files.
 * Configured to store uploaded files locally on the disk before they might be uploaded to a cloud provider like Cloudinary.
 */
import multer from "multer";

/**
 * Configure disk storage for Multer.
 * Determines the destination directory and the filename of the uploaded file on the local server.
 */
const storage = multer.diskStorage({
    /**
     * Determines the folder where the uploaded files will be temporarily stored.
     * @param {import('express').Request} _ - The Express request object (unused).
     * @param {Express.Multer.File} file - The file object containing file metadata.
     * @param {function(Error|null, string): void} cb - The callback function to resolve the destination path.
     */
    destination: function (_, file, cb) {
        cb(null, "./public/uploads");
    },
    /**
     * Determines the file name under which the uploaded file will be saved.
     * @param {import('express').Request} _ - The Express request object (unused).
     * @param {Express.Multer.File} file - The file object containing file metadata.
     * @param {function(Error|null, string): void} cb - The callback function to resolve the filename.
     */
    filename: function (_, file, cb) {
        cb(null, file.originalname);
    },
});

/**
 * Multer upload middleware instance.
 * Exported to be utilized in routes that require file uploads.
 * 
 * @type {multer.Multer}
 */
export const upload = multer({ storage });