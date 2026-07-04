import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";
import fs from "fs";

export const uploadToCloudinary = async (localFilePath, folderName = "medishop") => {
  if (!localFilePath) return null;

  try {
    if (isCloudinaryConfigured) {
      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: folderName,
        resource_type: "auto",
      });
      // Delete temporary local file
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
      return result.secure_url;
    } else {
      // Return relative url path.
      const normalizedPath = localFilePath.replace(/\\/g, "/");
      // Prepend / to make it a root-relative path
      const relativeUrl = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
      console.log(`Disk Storage Fallback: Saved to ${relativeUrl}`);
      return relativeUrl;
    }
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message);
    // Cleanup local file on failure
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw error;
  }
};

export const deleteFromCloudinary = async (fileUrl) => {
  if (!fileUrl) return;

  try {
    if (fileUrl.startsWith("http") && fileUrl.includes("res.cloudinary.com")) {
      if (isCloudinaryConfigured) {
        // Extract public ID
        // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.ext
        const parts = fileUrl.split("/upload/");
        if (parts.length > 1) {
          const pathWithVersion = parts[1];
          const pathParts = pathWithVersion.split("/");
          // Remove version if it starts with 'v' and is numeric
          if (pathParts[0].startsWith("v") && !isNaN(pathParts[0].substring(1))) {
            pathParts.shift();
          }
          // Remove extension
          const publicIdWithExt = pathParts.join("/");
          const dotIdx = publicIdWithExt.lastIndexOf(".");
          const publicId = dotIdx !== -1 ? publicIdWithExt.substring(0, dotIdx) : publicIdWithExt;

          await cloudinary.uploader.destroy(publicId);
          console.log(`Cloudinary Image Deleted: ${publicId}`);
        }
      }
    } else if (fileUrl.startsWith("/uploads/")) {
      // Local file fallback deletion
      // Strip leading slash if present, map to relative local path
      const localPath = fileUrl.startsWith("/") ? fileUrl.substring(1) : fileUrl;
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
        console.log(`Local Image Deleted: ${localPath}`);
      }
    }
  } catch (error) {
    console.error("Failed to delete image:", error.message);
  }
};
