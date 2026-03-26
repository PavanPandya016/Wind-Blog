import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Utility function to delete a file from the local file system.
 * Useful for cleaning up temporary files after an upload attempt.
 *
 * @param {string} filePath - The absolute or relative path to the local file to be deleted.
 */
const deleteLocalFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (err) {
        console.warn(`Failed to delete temp file: ${filePath}`, err.message);
    }
};

/**
 * Uploads a local file to Cloudinary and automatically cleans up the local temporary file afterward.
 *
 * @param {string} localFilePath - The local path to the file to be uploaded. Required.
 * @param {Object} [options={}] - Additional upload options for Cloudinary (e.g., folder, public_id).
 * @returns {Promise<Object|null>} A promise that resolves to the Cloudinary upload result object, or null if no file path was provided.
 * @throws {Error} Throws an error if the upload to Cloudinary fails.
 */
const uploadOnCloudinary = async (localFilePath, options = {}) => {
    if (!localFilePath) return null;

    try {
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            ...options,
        });
        return uploadResult;
    } catch (error) {
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    } finally {
        deleteLocalFile(localFilePath);
    }
};

/**
 * Deletes an existing resource from Cloudinary using its public ID.
 *
 * @param {string} publicId - The Cloudinary public identifier of the resource to delete. Required.
 * @param {string} [resourceType="image"] - The type of resource to delete (e.g., "image", "video", "raw").
 * @returns {Promise<Object|null>} A promise that resolves to the Cloudinary destruction result, or null if no public ID was provided.
 * @throws {Error} Throws an error if the deletion from Cloudinary fails.
 */
const deleteFromCloudinary = async (publicId, resourceType = "image") => {
    if (!publicId) return null;

    try {
        return await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });
    } catch (error) {
        throw new Error(`Cloudinary delete failed: ${error.message}`);
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };